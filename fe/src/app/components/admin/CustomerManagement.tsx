import { useEffect, useState, useCallback } from 'react';
import { Search, Mail, Phone, MapPin, ShoppingBag, Eye, Trash2 } from 'lucide-react';
import { customerApi, type AdminCustomerOrderResponse } from '../../../api/customerApi';

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  lastOrder: string;
  status: string; // preserve backend status string (could be other values)
};

type OrderHistoryItem = { id: string; date: string; total: number; status: string };

// API shapes
interface ApiCustomer {
  accountId?: number;
  id?: number;
  fullName?: string;
  full_name?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  ordersCount?: number;
  totalOrders?: number;
  totalSpent?: number;
  joinDate?: string;
  joinedAt?: string;
  lastOrder?: string;
  status?: string;
  orderIds?: number[];
}

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerOrderIds, setSelectedCustomerOrderIds] = useState<number[] | null>(null);
  const [orderHistory, setOrderHistory] = useState<Record<number, OrderHistoryItem[]>>({});
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Helper: normalize API customer object to our Customer type.
  const normalizeApiCustomer = (c: ApiCustomer): Customer => ({
    id: c?.accountId ?? c?.id ?? 0,
    // backend might return fullName or full_name or name
    name: c?.fullName ?? c?.full_name ?? c?.name ?? '',
    email: c?.email ?? '',
    // backend might use phoneNumber
    phone: c?.phoneNumber ?? c?.phone ?? '',
    address: c?.address ?? '',
    // ordersCount -> totalOrders
    totalOrders: typeof c?.ordersCount === 'number' ? c.ordersCount! : Number(c?.ordersCount) || (typeof c?.totalOrders === 'number' ? c.totalOrders! : Number(c?.totalOrders) || 0),
    totalSpent: typeof c?.totalSpent === 'number' ? c.totalSpent! : Number(c?.totalSpent) || 0,
    joinDate: c?.joinDate ?? c?.joinedAt ?? '',
    lastOrder: c?.lastOrder ?? '',
    status: c?.status ?? '',
  });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerApi.getAll();
      const data = res?.data?.data ?? res?.data ?? [];

      const sanitized = (Array.isArray(data) ? data : []).map((c: ApiCustomer) => normalizeApiCustomer(c));
      setCustomers(sanitized);
    } catch (err: unknown) {
      console.error('Failed to fetch customers', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) loadCustomers();
    return () => { mounted = false; };
  }, [loadCustomers]);

  const fetchOrdersForCustomer = async (id: number) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await customerApi.getOrders(id);
      const data = res?.data?.data ?? res?.data ?? [];
      const sanitized = (Array.isArray(data) ? data : []).map((o: AdminCustomerOrderResponse) => ({
        id: String(o.orderId ?? ''),
        date: o.orderDate ?? '',
        total: typeof o.totalAmount === 'number' ? o.totalAmount : Number(o.totalAmount) || 0,
        status: o.orderStatus ?? '',
      }));
      setOrderHistory((prev) => ({ ...prev, [id]: sanitized }));
    } catch (err: unknown) {
      console.error('Failed to fetch orders for customer', err);
      const message = err instanceof Error ? err.message : String(err);
      setOrdersError(message || 'Failed to load order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  const viewDetailsById = async (id: number) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      // fetch full customer detail
      const res = await customerApi.getById(id);
      const data: ApiCustomer = res?.data?.data ?? res?.data ?? {};
      const normalized = normalizeApiCustomer(data);
      setSelectedCustomer(normalized);
      setSelectedCustomerOrderIds(Array.isArray(data.orderIds) ? data.orderIds : null);

      // if API provides orderIds, show placeholders while fetching full order info
      if (Array.isArray(data.orderIds) && data.orderIds.length > 0) {
        const placeholders: OrderHistoryItem[] = data.orderIds.map((oid) => ({ id: String(oid), date: '', total: 0, status: '' }));
        setOrderHistory((prev) => ({ ...prev, [id]: placeholders }));
      }

      // attempt to fetch detailed orders (replaces placeholders if successful)
      if (!orderHistory[id]) {
        await fetchOrdersForCustomer(id);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch customer detail', err);
      const message = err instanceof Error ? err.message : String(err);
      setOrdersError(message || 'Failed to load customer details');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerApi.delete(id);
      // refresh list
      await loadCustomers();
      setSelectedCustomer(null);
    } catch (err: unknown) {
      console.error('Failed to delete customer', err);
      alert('Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      (customer.name ?? '').toLowerCase().includes(term) ||
      (customer.email ?? '').toLowerCase().includes(term) ||
      (customer.phone ?? '').includes(searchTerm)
    );
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="bg-white rounded-lg shadow p-4 text-center">Loading customers...</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      )}
      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer, index) => (
                <tr key={`${customer.id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f37021] flex items-center justify-center text-white font-semibold">
                        {(customer.name ?? customer.email ?? 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name ?? customer.email ?? 'Unknown Customer'}</p>
                        <p className="text-xs text-gray-500">ID: #{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{customer.email ?? '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone ?? '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{customer.totalOrders}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatPrice(customer.totalSpent ?? 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => viewDetailsById(customer.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header with close button */}
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Customer Profile</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Header with Avatar */}
              <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-[#f37021] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {(selectedCustomer.name ?? selectedCustomer.email ?? 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCustomer.name ?? selectedCustomer.email ?? 'Unknown'}</h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>{selectedCustomer.email ?? '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>{selectedCustomer.phone ?? '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>{selectedCustomer.address ?? '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-blue-700 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-900">{selectedCustomer.totalOrders ?? 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-700 mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-green-900">{formatPrice(selectedCustomer.totalSpent ?? 0)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm font-medium text-purple-700 mb-1">Member Since</p>
                  <p className="text-lg font-bold text-purple-900">
                    {selectedCustomer.joinDate ? new Date(selectedCustomer.joinDate).toLocaleDateString('vi-VN') : '-'}
                  </p>
                </div>
              </div>

              {/* Order History Section */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Order History</h4>
                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin">
                      <ShoppingBag className="w-8 h-8 text-[#f37021]" />
                    </div>
                    <p className="text-gray-500 mt-2">Loading order history...</p>
                  </div>
                ) : ordersError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    {ordersError}
                  </div>
                ) : orderHistory[selectedCustomer.id] && orderHistory[selectedCustomer.id].length > 0 ? (
                  <div className="space-y-3">
                    {orderHistory[selectedCustomer.id].map((order, index) => (
                      <div key={`${order.id}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-900">ORD-{String(order.id).padStart(4, '0')}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium mt-1 inline-block ${
                            order.status === 'DELIVERED' || order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'PENDING' || order.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'CANCELLED' || order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'DELIVERED' ? 'Delivered' : order.status === 'PENDING' ? 'Pending' : order.status === 'CANCELLED' ? 'Cancelled' : order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedCustomerOrderIds && selectedCustomerOrderIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomerOrderIds.map((oid) => (
                      <div key={`oid-${oid}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Order #{oid}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Pending details</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No order history available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with action buttons */}
            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                title="Delete Customer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Customer
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}