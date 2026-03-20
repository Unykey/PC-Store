import { useState } from 'react';
import { Search, AlertTriangle, TrendingDown, Package } from 'lucide-react';

type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastRestocked: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
};

const mockInventory: InventoryItem[] = [
  {
    id: 1,
    name: 'Intel Core i9-13900K',
    sku: 'CPU-I9-13900K',
    category: 'CPU',
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    location: 'Warehouse A - Shelf 12',
    lastRestocked: '2026-01-10',
    status: 'in-stock',
  },
  {
    id: 2,
    name: 'NVIDIA RTX 4090',
    sku: 'GPU-RTX-4090',
    category: 'GPU',
    currentStock: 3,
    minStock: 5,
    maxStock: 20,
    location: 'Warehouse A - Shelf 15',
    lastRestocked: '2026-01-05',
    status: 'low-stock',
  },
  {
    id: 3,
    name: 'Corsair Vengeance RGB 32GB',
    sku: 'RAM-CORS-32GB',
    category: 'RAM',
    currentStock: 5,
    minStock: 15,
    maxStock: 80,
    location: 'Warehouse B - Shelf 8',
    lastRestocked: '2025-12-28',
    status: 'low-stock',
  },
  {
    id: 4,
    name: 'Samsung 990 Pro 2TB',
    sku: 'SSD-SAM-2TB',
    category: 'SSD',
    currentStock: 0,
    minStock: 12,
    maxStock: 60,
    location: 'Warehouse B - Shelf 10',
    lastRestocked: '2025-12-15',
    status: 'out-of-stock',
  },
  {
    id: 5,
    name: 'ASUS ROG Strix B650E',
    sku: 'MB-ASUS-B650E',
    category: 'Motherboard',
    currentStock: 6,
    minStock: 10,
    maxStock: 40,
    location: 'Warehouse A - Shelf 20',
    lastRestocked: '2026-01-08',
    status: 'low-stock',
  },
  {
    id: 6,
    name: 'Corsair RM850x',
    sku: 'PSU-CORS-850X',
    category: 'PSU',
    currentStock: 42,
    minStock: 15,
    maxStock: 60,
    location: 'Warehouse C - Shelf 5',
    lastRestocked: '2026-01-12',
    status: 'in-stock',
  },
];

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(i => i.status === 'low-stock').length,
    outOfStock: inventory.filter(i => i.status === 'out-of-stock').length,
    inStock: inventory.filter(i => i.status === 'in-stock').length,
  };

  const getStockPercentage = (current: number, max: number) => {
    return (current / max) * 100;
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
                      {new Date(item.lastRestocked).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 bg-[#f37021] text-white rounded-lg text-sm hover:bg-[#d96319] transition-colors">
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}