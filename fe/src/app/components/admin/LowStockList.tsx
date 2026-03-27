import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productApi } from '@/api/productApi.ts';

type LowStockItem = {
  id: number;
  name: string;
  sku?: string;
  stock: number;
  minStock?: number;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export function LowStockList() {
  const [items, setItems] = useState<LowStockItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productApi.getLowStockList();
        // unwrap similar to other places: try to find data.data or data
        const maybeData = (res as unknown) && isRecord(res) ? (res as Record<string, unknown>) : undefined;
        const payload = maybeData && 'data' in maybeData ? (maybeData.data as unknown) : res;

        if (!mounted) return;

        if (Array.isArray(payload)) {
          setItems(payload.map((rec, idx) => {
            const r = isRecord(rec) ? rec : {};
            return ({
              id: 'productId' in r && typeof r.productId === 'number' ? r.productId : (('id' in r && typeof r.id === 'number') ? r.id : idx),
              name: 'name' in r && typeof r.name === 'string' ? r.name : (('productName' in r && typeof r.productName === 'string') ? r.productName as string : 'Unknown'),
              sku: 'serialNumber' in r && typeof r.serialNumber === 'string' ? r.serialNumber : (('sku' in r && typeof r.sku === 'string') ? r.sku as string : undefined),
              stock: 'stockQuantity' in r && typeof r.stockQuantity === 'number' ? r.stockQuantity : (('quantity' in r && typeof r.quantity === 'number') ? r.quantity as number : (('stock' in r && typeof r.stock === 'number') ? r.stock as number : 0)),
              minStock: 'minStock' in r && typeof r.minStock === 'number' ? r.minStock : (('min_stock' in r && typeof r.min_stock === 'number') ? r.min_stock as number : undefined),
            });
          }));
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to load low stock list', err);
        const msg = isRecord(err) && 'message' in err && typeof err.message === 'string' ? err.message : 'Unknown error';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded">
            <AlertTriangle className="w-6 h-6 text-[#f37021]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Low Stock</h2>
            <p className="text-sm text-gray-500">Products with low inventory (as reported by server)</p>
          </div>
        </div>
        <div>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{loading ? '—' : (items ? items.length : '—')} items</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-sm text-gray-500">Loading...</td>
              </tr>
            )}

            {!loading && items && items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-sm text-gray-500">No low-stock items.</td>
              </tr>
            )}

            {!loading && items && items.map((it) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{it.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{it.sku ?? '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${it.stock <= 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{it.stock}</span>
                </td>
                <td className="px-6 py-4">
                  <button className="px-4 py-2 bg-[#f37021] text-white rounded-lg text-sm hover:bg-[#d96319] transition-colors">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="text-sm text-red-600">Error loading low stock: {error}</div>}
    </div>
  );
}
