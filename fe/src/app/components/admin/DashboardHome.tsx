import { DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';

type LowStockItem = {
  id: number;
  name: string;
  sku?: string;
  stock: number;
  minStock?: number;
};

type OrderStatusItem = {
  status: string;
  count: number;
  color?: string;
};

type TopProduct = {
  id: number;
  name: string;
  sales?: number;
  revenue?: string | number;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export function DashboardHome() {
  const [totalSales, setTotalSales] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusItem[] | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[] | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [salesRes, productsRes, ordersRes, orderStatusRes, topProductsRes, lowStockRes] = await Promise.all([
          axiosClient.get('/api/admin/dashboard/total-sales'),
          axiosClient.get('/api/admin/dashboard/total-products'),
          axiosClient.get('/api/admin/dashboard/total-orders'),
          axiosClient.get('/api/admin/dashboard/order-status'),
          axiosClient.get('/api/admin/dashboard/top-products'),
          axiosClient.get('/api/admin/dashboard/low-stock'),
        ]);

        if (!mounted) return;

        const unwrap = (res: unknown): unknown => {
          if (!isRecord(res)) return res;
          const r = res as Record<string, unknown>;
          if ('data' in r) {
            const body = r.data;
            if (isRecord(body) && 'data' in (body as Record<string, unknown>)) {
              return (body as Record<string, unknown>).data;
            }
            return body;
          }
          return res;
        };

        const salesVal = unwrap(salesRes);
        const productsVal = unwrap(productsRes);
        const ordersVal = unwrap(ordersRes);
        const orderStatusVal = unwrap(orderStatusRes);
        const topProductsVal = unwrap(topProductsRes);
        const lowStockVal = unwrap(lowStockRes);

        const formatCurrency = (v: unknown): string => {
          if (typeof v === 'number') {
            return v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
          }
          if (typeof v === 'string' && v.trim() !== '') return v;
          if (isRecord(v)) {
            const candidates = ['total', 'amount', 'value', 'revenue', 'sales'];
            for (const key of candidates) {
              if (key in v) {
                const val = (v as Record<string, unknown>)[key];
                if (typeof val === 'number') return val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                if (typeof val === 'string' && val.trim() !== '') return val;
              }
            }
          }
          return '—';
        };

        setTotalSales(formatCurrency(salesVal));

        const toNumber = (v: unknown) => {
          if (typeof v === 'number') return v;
          if (typeof v === 'string') return Number(v) || 0;
          if (isRecord(v)) {
            const candidateKeys = ['total', 'count', 'value', 'products', 'orders'];
            for (const k of candidateKeys) {
              if (k in v) {
                const val = (v as Record<string, unknown>)[k];
                if (typeof val === 'number') return val;
                if (typeof val === 'string') return Number(val) || 0;
              }
            }
          }
          return 0;
        };

        setTotalProducts(toNumber(productsVal));
        setTotalOrders(toNumber(ordersVal));

        // Parse order status
        const statusColorMap: Record<string, string> = {
          pending: 'bg-[#f37021]',
          processing: 'bg-[#ff8c42]',
          shipped: 'bg-[#ffa500]',
          delivered: 'bg-green-500',
          cancelled: 'bg-red-500',
        };

        const parseOrderStatus = (v: unknown): OrderStatusItem[] => {
          if (Array.isArray(v)) {
            return v.map((it) => {
              if (isRecord(it)) {
                const statusRaw = (it.status ?? it.name ?? it.key) as unknown;
                const status = typeof statusRaw === 'string' ? statusRaw : String(statusRaw ?? 'Unknown');
                const countRaw = it.count ?? it.value ?? it.total ?? it.quantity;
                const count = typeof countRaw === 'number' ? countRaw : (typeof countRaw === 'string' ? Number(countRaw) || 0 : 0);
                const color = statusColorMap[status.toLowerCase()] ?? 'bg-gray-300';
                return { status, count, color };
              }
              return { status: String(it), count: 0, color: 'bg-gray-300' };
            });
          }

          if (isRecord(v)) {
            // support object with keys as statuses and values as counts
            const res: OrderStatusItem[] = [];
            for (const [k, val] of Object.entries(v)) {
              const count = typeof val === 'number' ? val : (typeof val === 'string' ? Number(val) || 0 : 0);
              res.push({ status: k, count, color: statusColorMap[k.toLowerCase()] ?? 'bg-gray-300' });
            }
            return res;
          }

          return [];
        };

        setOrderStatusData(parseOrderStatus(orderStatusVal));

        // Parse top products
        const parseTopProducts = (v: unknown): TopProduct[] => {
          if (Array.isArray(v)) {
            return v.slice(0, 10).map((it, idx) => {
              if (isRecord(it)) {
                const id = 'id' in it && typeof it.id === 'number' ? it.id : idx;
                const name = 'name' in it && typeof it.name === 'string' ? it.name : (('productName' in it && typeof it.productName === 'string') ? it.productName as string : 'Unknown');
                const sales = 'sales' in it && typeof it.sales === 'number' ? it.sales : (('quantity' in it && typeof it.quantity === 'number') ? it.quantity as number : undefined);
                const revenue = 'revenue' in it ? (it.revenue as string | number) : (('total' in it) ? it.total as string | number : undefined);
                return { id, name, sales, revenue } as TopProduct;
              }
              return { id: idx, name: String(it), sales: undefined, revenue: undefined } as TopProduct;
            });
          }

          // if it's an object with a products array
          if (isRecord(v)) {
            const candidates = ['data', 'products', 'topProducts', 'items'];
            for (const key of candidates) {
              if (key in v && Array.isArray((v as Record<string, unknown>)[key])) {
                return parseTopProducts((v as Record<string, unknown>)[key]);
              }
            }
          }

          return [];
        };

        setTopProducts(parseTopProducts(topProductsVal));

        // lowStockVal should be an array; try to coerce
        if (Array.isArray(lowStockVal)) {
          setLowStockItems(
            lowStockVal.map((it, idx) => {
              const rec = isRecord(it) ? it as Record<string, unknown> : {};
              const id = 'id' in rec && typeof rec.id === 'number' ? rec.id : idx;
              const name = 'name' in rec && typeof rec.name === 'string' ? rec.name : (('productName' in rec && typeof rec.productName === 'string') ? rec.productName as string : 'Unknown Product');
              const sku = 'sku' in rec && typeof rec.sku === 'string' ? rec.sku : (('productSku' in rec && typeof rec.productSku === 'string') ? rec.productSku as string : undefined);
              const stock = 'stock' in rec && typeof rec.stock === 'number' ? rec.stock : (('quantity' in rec && typeof rec.quantity === 'number') ? rec.quantity as number : 0);
              const minStock = 'minStock' in rec && typeof rec.minStock === 'number' ? rec.minStock : (('min_stock' in rec && typeof rec.min_stock === 'number') ? rec.min_stock as number : undefined);

              return { id, name, sku, stock, minStock } as LowStockItem;
            }),
          );
        } else {
          setLowStockItems([]);
        }
      } catch (err) {
        console.error('Failed to fetch admin dashboard', err);
        let message = 'Failed to load dashboard';
        if (err && typeof err === 'object' && 'message' in err && typeof (err as Record<string, unknown>).message === 'string') {
          message = (err as Record<string, unknown>).message as string;
        }
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`bg-orange-50 p-3 rounded-lg`}>
              <DollarSign className={`w-6 h-6 text-[#f37021]`} />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {/* If you later return change/trend from API you can render it here */}
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Sales</h3>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? 'Loading...' : totalSales ?? '—'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`bg-orange-50 p-3 rounded-lg`}>
              <ShoppingCart className={`w-6 h-6 text-[#f37021]`} />
            </div>
            <div className="flex items-center gap-1 text-sm"></div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{loading ? 'Loading...' : totalOrders ?? '—'}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`bg-orange-50 p-3 rounded-lg`}>
              <Package className={`w-6 h-6 text-[#f37021]`} />
            </div>
            <div className="flex items-center gap-1 text-sm"></div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Products</h3>
          <p className="text-2xl font-bold text-gray-900">{loading ? 'Loading...' : totalProducts ?? '—'}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`bg-orange-50 p-3 rounded-lg`}>
              <AlertTriangle className={`w-6 h-6 text-[#f37021]`} />
            </div>
            <div className="flex items-center gap-1 text-sm"></div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Low Stock</h3>
          <p className="text-2xl font-bold text-gray-900">{loading ? 'Loading...' : (lowStockItems ? lowStockItems.length : '—')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status - now wired to API */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
          </div>
          <div className="p-6 space-y-4">
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {!loading && (!orderStatusData || orderStatusData.length === 0) && (
              <p className="text-sm text-gray-500">No order status summary available.</p>
            )}

            {!loading && orderStatusData && (
              <div className="space-y-2">
                {orderStatusData.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${item.color ?? 'bg-gray-300'} w-3 h-3 rounded-full`} />
                      <span className="text-gray-700 font-medium">{item.status}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products - now wired to API */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
          </div>
          <div className="p-6">
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {!loading && (!topProducts || topProducts.length === 0) && (
              <p className="text-sm text-gray-500">No top products available.</p>
            )}

            {!loading && topProducts && (
              <div className="space-y-3">
                {topProducts.slice(0, 10).map((product, idx) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-semibold text-gray-400 w-6">#{idx + 1}</span>
                      <span className="text-sm text-gray-700 truncate">{product.name}</span>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-gray-900">{typeof product.revenue === 'number' ? product.revenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : (product.revenue ?? '—')}</p>
                      <p className="text-xs text-gray-500">{product.sales ?? 0} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{lowStockItems ? lowStockItems.length : '—'} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-gray-500">Loading low stock items...</td>
                </tr>
              )}

              {!loading && lowStockItems && lowStockItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-gray-500">No low stock items.</td>
                </tr>
              )}

              {!loading && lowStockItems && lowStockItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.sku ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">{item.stock}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.minStock ?? '—'}</td>
                  <td className="px-6 py-4">
                    <button className="px-4 py-2 bg-[#f37021] text-white rounded-lg text-sm hover:bg-[#d96319] transition-colors">Restock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">Error loading dashboard: {error}</div>
      )}
    </div>
  );
}