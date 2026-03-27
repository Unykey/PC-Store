import { useEffect, useMemo, useState } from 'react';
import { Search, AlertTriangle, TrendingDown, Package } from 'lucide-react';
import { getAll, update } from '@/api/productApi';
import type { ProductRequest, ProductResponse } from '@/api/productApi';

type InventoryItemStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastRestocked?: string;
  status: InventoryItemStatus;
  price: number;
  description?: string;
  categoryId?: number;
};

const defaultMinByCategory: Record<string, number> = {
  CPU: 10,
  GPU: 5,
  RAM: 15,
  SSD: 12,
  Motherboard: 10,
  PSU: 15,
  Case: 8,
  Cooling: 8,
};

const getMinStock = (categoryName?: string) => {
  if (!categoryName) return 10;
  return defaultMinByCategory[categoryName] ?? 10;
};

const getStatus = (stock: number, minStock: number): InventoryItemStatus => {
  if (stock <= 0) return 'out-of-stock';
  if (stock <= minStock) return 'low-stock';
  return 'in-stock';
};

const mapProductToInventory = (
  p: ProductResponse,
  lastRestockedById: Record<number, string>,
): InventoryItem => {
  const minStock = getMinStock(p.categoryName);
  const maxStock = Math.max(minStock * 5, minStock + 20);
  const locationWarehouse = String.fromCharCode(65 + ((p.categoryId ?? p.productId) % 3));
  const shelf = ((p.productId * 7) % 20) + 1;

  return {
    id: p.productId,
    name: p.name,
    sku: p.serialNumber || `SKU-${p.productId}`,
    category: p.categoryName || 'N/A',
    currentStock: Number(p.stockQuantity ?? 0),
    minStock,
    maxStock,
    location: `Warehouse ${locationWarehouse} - Shelf ${shelf}`,
    lastRestocked: lastRestockedById[p.productId],
    status: getStatus(Number(p.stockQuantity ?? 0), minStock),
    price: Number(p.price ?? 0),
    description: p.description,
    categoryId: p.categoryId,
  };
};

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restockingId, setRestockingId] = useState<number | null>(null);
  const [lastRestockedById, setLastRestockedById] = useState<Record<number, string>>({});
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState('10');
  const [restockError, setRestockError] = useState('');

  const loadInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAll();
      const payload = res?.data?.data;
      let list: ProductResponse[] = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown }).items)) {
        list = (payload as { items: ProductResponse[] }).items;
      }

      setInventory(list.map((p) => mapProductToInventory(p, lastRestockedById)));
    } catch (err) {
      console.error('Failed to load inventory', err);
      const maybeErr = err as { response?: { data?: { message?: string } } } | undefined;
      setError(maybeErr?.response?.data?.message || 'Cannot load inventory data');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    setInventory((prev) => prev.map((p) => ({ ...p, lastRestocked: lastRestockedById[p.id] || p.lastRestocked })));
  }, [lastRestockedById]);

  const filteredInventory = useMemo(() => inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  }), [inventory, searchTerm, filterStatus]);

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(i => i.status === 'low-stock').length,
    outOfStock: inventory.filter(i => i.status === 'out-of-stock').length,
    inStock: inventory.filter(i => i.status === 'in-stock').length,
  };

  const getStockPercentage = (current: number, max: number) => {
    if (max <= 0) return 0;
    return (current / max) * 100;
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('vi-VN');
  };

  const handleRestockConfirm = async () => {
    if (!restockModalItem) return;

    const qty = Number(restockQty);
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
      setRestockError('Please enter a valid positive integer quantity.');
      return;
    }

    const payload: ProductRequest = {
      name: restockModalItem.name,
      description: restockModalItem.description || '',
      price: restockModalItem.price,
      stockQuantity: restockModalItem.currentStock + qty,
      serialNumber: restockModalItem.sku,
      categoryId: restockModalItem.categoryId,
    };

    try {
      setRestockingId(restockModalItem.id);
      setRestockError('');
      const res = await update(restockModalItem.id, payload);
      const updated = res.data.data;
      const now = new Date().toISOString();
      setLastRestockedById((prev) => ({ ...prev, [restockModalItem.id]: now }));
      setInventory((prev) =>
        prev.map((p) =>
          p.id === restockModalItem.id
            ? mapProductToInventory(
                {
                  ...updated,
                  stockQuantity: Number(updated.stockQuantity ?? payload.stockQuantity),
                },
                { ...lastRestockedById, [restockModalItem.id]: now },
              )
            : p,
        ),
      );
      setRestockModalItem(null);
    } catch (err) {
      console.error('Failed to restock product', err);
      const maybeErr = err as { response?: { data?: { message?: string } } } | undefined;
      setRestockError(maybeErr?.response?.data?.message || 'Restock failed');
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#f37021]">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-[#f37021]" />
          </div>
          <p className="text-gray-600 text-sm">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#ff8c42]">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-[#ff8c42]" />
          </div>
          <p className="text-gray-600 text-sm">In Stock</p>
          <p className="text-2xl font-bold text-gray-900">{stats.inStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#ffa500]">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-[#ffa500]" />
          </div>
          <p className="text-gray-600 text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 text-sm">Out of Stock</p>
          <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Restocked</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-sm text-gray-600">Loading inventory...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-sm text-red-600">{error}</td>
                </tr>
              )}
              {!loading && !error && filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-sm text-gray-600">No inventory items found.</td>
                </tr>
              )}
              {filteredInventory.map((item) => {
                const stockPercent = getStockPercentage(item.currentStock, item.maxStock);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-900 font-medium">{item.currentStock}</span>
                          <span className="text-gray-500">/ {item.maxStock}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.status === 'out-of-stock' ? 'bg-red-500' :
                              item.status === 'low-stock' ? 'bg-orange-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.max(stockPercent, 5)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'in-stock' ? 'bg-green-100 text-green-800' :
                        item.status === 'low-stock' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'in-stock' ? 'In Stock' :
                         item.status === 'low-stock' ? 'Low Stock' :
                         'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(item.lastRestocked)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setRestockModalItem(item);
                          setRestockQty('10');
                          setRestockError('');
                        }}
                        disabled={restockingId === item.id}
                        className="px-4 py-2 bg-[#f37021] text-white rounded-lg text-sm hover:bg-[#d96319] transition-colors disabled:opacity-60"
                      >
                        {restockingId === item.id ? 'Restocking...' : 'Restock'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Restock</h3>
              <p className="mt-1 text-sm text-gray-600">{restockModalItem.name}</p>
            </div>
            <div className="px-6 py-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Quantity to add</label>
              <input
                type="number"
                min={1}
                step={1}
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#f37021] focus:outline-none focus:ring-2 focus:ring-[#f37021]/20"
              />
              <p className="text-sm text-gray-600">
                Current stock: <span className="font-medium">{restockModalItem.currentStock}</span>
              </p>
              {restockError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {restockError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setRestockModalItem(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestockConfirm}
                disabled={restockingId === restockModalItem.id}
                className="rounded-lg bg-[#f37021] px-4 py-2 text-sm text-white hover:bg-[#d96319] disabled:opacity-60"
              >
                {restockingId === restockModalItem.id ? 'Restocking...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}