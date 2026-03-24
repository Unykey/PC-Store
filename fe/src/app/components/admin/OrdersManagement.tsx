import { useEffect, useMemo, useState } from 'react';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { orderApi, type OrderResponse, type OrderStatus } from '@/api/orderApi';

const toOrderCode = (orderId: number) => `ORD-${String(orderId).padStart(3, '0')}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

const getStatusInfo = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
    PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    CONFIRMED: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
    SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
    DELIVERED: { label: 'Đã giao', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Truck },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  };
  return statusMap[status];
};

export function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [stats, setStats] = useState<{ total: number; byStatus: Partial<Record<OrderStatus, number>> } | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [selectedNextStatus, setSelectedNextStatus] = useState<OrderStatus | ''>('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterStatus]);

  const queryParams = useMemo(
    () => ({
      q: searchTerm?.trim() ? searchTerm.trim() : undefined,
      status: filterStatus === 'all' ? undefined : filterStatus,
      page,
      size,
    }),
    [searchTerm, filterStatus, page, size],
  );

  useEffect(() => {
    let cancelled = false;
    orderApi
      .adminStats()
      .then((res) => {
        if (cancelled) return;
        setStats(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to load order stats', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      orderApi
        .adminList(queryParams)
        .then((res) => {
          const data = res.data.data;
          setOrders(data.items || []);
          setTotalItems(data.totalItems || 0);
          setTotalPages(data.totalPages || 0);
        })
        .catch((err) => {
          console.error('Failed to load orders', err);
          setOrders([]);
          setTotalItems(0);
          setTotalPages(0);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [queryParams]);

  useEffect(() => {
    if (selectedOrderId == null) return;
    let cancelled = false;
    setSelectedOrder(null);
    setSelectedNextStatus('');
    orderApi
      .adminGetById(selectedOrderId)
      .then((res) => {
        if (cancelled) return;
        setSelectedOrder(res.data.data);
      })
      .catch((err) => console.error('Failed to load order detail', err));
    return () => {
      cancelled = true;
    };
  }, [selectedOrderId]);

  const statusCounts = useMemo(() => {
    const byStatus = stats?.byStatus || {};
    return {
      all: stats?.total ?? 0,
      PENDING: byStatus.PENDING ?? 0,
      CONFIRMED: byStatus.CONFIRMED ?? 0,
      SHIPPING: byStatus.SHIPPING ?? 0,
      COMPLETED: byStatus.COMPLETED ?? 0,
      CANCELLED: byStatus.CANCELLED ?? 0,
    };
  }, [stats]);

  const rowsCountText = useMemo(() => {
    if (loading) return 'Đang tải...';
    return `Hiển thị ${orders.length} trên ${totalItems} đơn hàng`;
  }, [loading, orders.length, totalItems]);

  const statusOptions: { value: OrderStatus; label: string }[] = useMemo(
    () => [
      { value: 'PENDING', label: 'Chờ xử lý' },
      { value: 'CONFIRMED', label: 'Đang xử lý' },
      { value: 'SHIPPING', label: 'Đang giao' },
      { value: 'DELIVERED', label: 'Đã giao' },
      { value: 'COMPLETED', label: 'Hoàn thành' },
      { value: 'CANCELLED', label: 'Đã hủy' },
    ],
    [],
  );

  const refresh = async () => {
    const [listRes, statsRes] = await Promise.allSettled([orderApi.adminList(queryParams), orderApi.adminStats()]);
    if (listRes.status === 'fulfilled') {
      const data = listRes.value.data.data;
      setOrders(data.items || []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 0);
    }
    if (statsRes.status === 'fulfilled') {
      setStats(statsRes.value.data.data);
    }
  };

  const onUpdateStatus = async () => {
    if (!selectedOrder || !selectedNextStatus) return;
    try {
      setActionLoading(true);
      await orderApi.adminUpdateStatus(selectedOrder.orderId, selectedNextStatus);
      await refresh();
      const detail = await orderApi.adminGetById(selectedOrder.orderId);
      setSelectedOrder(detail.data.data);
      setSelectedNextStatus('');
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setActionLoading(false);
    }
  };

  const onCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      setActionLoading(true);
      await orderApi.adminCancel(selectedOrder.orderId);
      await refresh();
      const detail = await orderApi.adminGetById(selectedOrder.orderId);
      setSelectedOrder(detail.data.data);
    } catch (err) {
      console.error('Failed to cancel order', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'all' ? 'border-[#f37021] ring-2 ring-[#f37021]/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Tất cả</p>
          <p className="text-[#f37021]">{statusCounts.all}</p>
        </button>

        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'PENDING' ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Chờ xử lý</p>
          <p className="text-yellow-600">{statusCounts.PENDING}</p>
        </button>

        <button
          onClick={() => setFilterStatus('CONFIRMED')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'CONFIRMED' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Đang xử lý</p>
          <p className="text-blue-600">{statusCounts.CONFIRMED}</p>
        </button>

        <button
          onClick={() => setFilterStatus('SHIPPING')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'SHIPPING' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Đang giao</p>
          <p className="text-purple-600">{statusCounts.SHIPPING}</p>
        </button>

        <button
          onClick={() => setFilterStatus('COMPLETED')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'COMPLETED' ? 'border-[#0db14b] ring-2 ring-[#0db14b]/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
          <p className="text-[#0db14b]">{statusCounts.COMPLETED}</p>
        </button>

        <button
          onClick={() => setFilterStatus('CANCELLED')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'CANCELLED' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Đã hủy</p>
          <p className="text-red-600">{statusCounts.CANCELLED}</p>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            className="border-[#f37021] text-[#f37021] hover:bg-[#f37021] hover:text-white"
            onClick={() => refresh()}
          >
            Tải lại
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.orderStatus);
                const StatusIcon = statusInfo.icon;
                const firstProduct = order.orderDetails?.[0]?.productName ?? '—';
                const extra = (order.orderDetails?.length ?? 0) > 1 ? ` + ${(order.orderDetails.length - 1)} sản phẩm` : '';
                return (
                  <TableRow key={order.orderId} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-[#f37021]">{toOrderCode(order.orderId)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.accountName}</p>
                        <p className="text-sm text-gray-600">{order.accountPhoneNumber || '—'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{firstProduct}{extra}</TableCell>
                    <TableCell className="font-medium text-[#0db14b]">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${statusInfo.color}`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{formatDate(order.orderDate)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#f37021] hover:text-[#d45f1a] hover:bg-[#f37021]/10"
                            onClick={() => setSelectedOrderId(order.orderId)}
                          >
                            <Eye size={16} className="mr-1" />
                            Xem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                              Chi Tiết Đơn Hàng {toOrderCode(order.orderId)}
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Thông tin chi tiết về đơn hàng
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder ? (
                            <div className="space-y-6">
                              {/* Customer Info Section */}
                              <div className="border-b pb-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Khách hàng:</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.accountName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.accountEmail || '—'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Số điện thoại:</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.accountPhoneNumber || '—'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Địa chỉ giao hàng:</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.shippingAddress || '—'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày đặt:</span>
                                    <span className="font-medium text-gray-900">{formatDate(selectedOrder.orderDate)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Product Section */}
                              <div className="border-b pb-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm</h3>
                                <div className="space-y-2">
                                  {selectedOrder.orderDetails?.map((item) => (
                                    <div
                                      key={item.productId}
                                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 flex justify-between gap-4"
                                    >
                                      <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                                        <p className="text-sm text-gray-600 mt-1">Số lượng: {item.quantity}</p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {formatCurrency(item.price * item.quantity)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Total Section */}
                              <div className="border-b pb-6">
                                <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                  <span className="font-semibold text-gray-900">Tổng cộng:</span>
                                  <span className="text-2xl font-bold text-[#0db14b]">{formatCurrency(selectedOrder.totalAmount)}</span>
                                </div>
                              </div>

                              {/* Order Status Section */}
                              <div className="border-b pb-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h3>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm text-gray-600">
                                      Hiện tại: <span className="font-medium text-gray-900">{getStatusInfo(selectedOrder.orderStatus).label}</span>
                                    </div>
                                    <div className="w-56">
                                      <Select value={selectedNextStatus} onValueChange={(v) => setSelectedNextStatus(v as OrderStatus)}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {statusOptions.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                              {s.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      className="bg-[#f37021] hover:bg-[#d45f1a] text-white flex-1"
                                      disabled={!selectedNextStatus || actionLoading}
                                      onClick={onUpdateStatus}
                                    >
                                      Cập nhật trạng thái
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="border-red-500 text-red-600 hover:bg-red-50 flex-1"
                                      disabled={actionLoading || selectedOrder.orderStatus === 'CANCELLED'}
                                      onClick={onCancelOrder}
                                    >
                                      Hủy đơn
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-10 text-center text-gray-600">Đang tải chi tiết đơn hàng...</div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-600 py-10">
                    Không có đơn hàng
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{rowsCountText}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Trước
          </Button>
          <Button variant="outline" size="sm" className="bg-[#f37021] text-white border-[#f37021]" disabled>
            {page + 1} / {Math.max(1, totalPages)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={totalPages === 0 || page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}