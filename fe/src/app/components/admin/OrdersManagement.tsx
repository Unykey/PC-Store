import { useState } from 'react';
import { Search, Filter, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
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

type OrderStatus = 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';

interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  products: string;
  total: string;
  status: OrderStatus;
  date: string;
  address: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Trần Văn A',
    email: 'trana@email.com',
    phone: '0901 234 567',
    products: 'Laptop Gaming MSI Katana 15',
    total: '25.990.000đ',
    status: 'completed',
    date: '15/01/2026',
    address: '123 Nguyễn Huệ, Q1, TP.HCM'
  },
  {
    id: 'ORD-002',
    customerName: 'Lê Thị B',
    email: 'lethib@email.com',
    phone: '0902 345 678',
    products: 'PC Gaming RGB - Intel i9',
    total: '52.990.000đ',
    status: 'shipping',
    date: '14/01/2026',
    address: '456 Lê Lợi, Q3, TP.HCM'
  },
  {
    id: 'ORD-003',
    customerName: 'Phạm Văn C',
    email: 'phamvanc@email.com',
    phone: '0903 456 789',
    products: 'Card VGA RTX 4070 Ti SUPER',
    total: '23.990.000đ',
    status: 'processing',
    date: '14/01/2026',
    address: '789 Trần Hưng Đạo, Q5, TP.HCM'
  },
  {
    id: 'ORD-004',
    customerName: 'Nguyễn Thị D',
    email: 'nguyenthid@email.com',
    phone: '0904 567 890',
    products: 'CPU Intel Core i9-13900K',
    total: '14.990.000đ',
    status: 'pending',
    date: '13/01/2026',
    address: '321 Võ Văn Tần, Q3, TP.HCM'
  },
  {
    id: 'ORD-005',
    customerName: 'Hoàng Văn E',
    email: 'hoangvane@email.com',
    phone: '0905 678 901',
    products: 'Laptop Dell XPS 15',
    total: '45.990.000đ',
    status: 'cancelled',
    date: '12/01/2026',
    address: '654 Pasteur, Q1, TP.HCM'
  }
];

const getStatusInfo = (status: OrderStatus) => {
  const statusMap = {
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
    shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
  };
  return statusMap[status];
};

export function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    processing: mockOrders.filter(o => o.status === 'processing').length,
    shipping: mockOrders.filter(o => o.status === 'shipping').length,
    completed: mockOrders.filter(o => o.status === 'completed').length,
    cancelled: mockOrders.filter(o => o.status === 'cancelled').length
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
          onClick={() => setFilterStatus('pending')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'pending' ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Chờ xử lý</p>
          <p className="text-yellow-600">{statusCounts.pending}</p>
        </button>

        <button
          onClick={() => setFilterStatus('processing')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'processing' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Đang xử lý</p>
          <p className="text-blue-600">{statusCounts.processing}</p>
        </button>

        <button
          onClick={() => setFilterStatus('shipping')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'shipping' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Đang giao</p>
          <p className="text-purple-600">{statusCounts.shipping}</p>
        </button>

        <button
          onClick={() => setFilterStatus('completed')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'completed' ? 'border-[#0db14b] ring-2 ring-[#0db14b]/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
          <p className="text-[#0db14b]">{statusCounts.completed}</p>
        </button>

        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
            filterStatus === 'cancelled' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
          }`}
        >
          <p className="text-sm text-gray-600 mb-1">Đã hủy</p>
          <p className="text-red-600">{statusCounts.cancelled}</p>
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
          <Button variant="outline" className="border-[#f37021] text-[#f37021] hover:bg-[#f37021] hover:text-white">
            <Filter size={20} className="mr-2" />
            Bộ lọc
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
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-[#f37021]">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{order.products}</TableCell>
                    <TableCell className="font-medium text-[#0db14b]">{order.total}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${statusInfo.color}`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{order.date}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#f37021] hover:text-[#d45f1a] hover:bg-[#f37021]/10"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={16} className="mr-1" />
                            Xem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-[#f37021]">Chi Tiết Đơn Hàng {order.id}</DialogTitle>
                            <DialogDescription>
                              Thông tin chi tiết về đơn hàng
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Khách hàng</p>
                                  <p className="font-medium">{selectedOrder.customerName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Ngày đặt</p>
                                  <p className="font-medium">{selectedOrder.date}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Email</p>
                                  <p className="font-medium">{selectedOrder.email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                                  <p className="font-medium">{selectedOrder.phone}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-sm text-gray-600 mb-1">Địa chỉ giao hàng</p>
                                  <p className="font-medium">{selectedOrder.address}</p>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <p className="text-sm text-gray-600 mb-2">Sản phẩm</p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="font-medium">{selectedOrder.products}</p>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Tổng cộng:</span>
                                  <span className="text-[#0db14b]">{selectedOrder.total}</span>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <p className="text-sm text-gray-600 mb-2">Trạng thái đơn hàng</p>
                                <div className="flex gap-2">
                                  <Button className="bg-[#f37021] hover:bg-[#d45f1a] text-white flex-1">
                                    Cập nhật trạng thái
                                  </Button>
                                  <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                                    Hủy đơn
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Hiển thị {filteredOrders.length} trên {mockOrders.length} đơn hàng
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Trước
          </Button>
          <Button variant="outline" size="sm" className="bg-[#f37021] text-white border-[#f37021]">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}