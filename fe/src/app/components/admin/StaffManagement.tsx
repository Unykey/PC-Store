import { useState } from 'react';
import { Plus, Search, Edit, Trash2, UserPlus, Mail, Phone, Shield } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff' | 'technician';
  status: 'active' | 'inactive';
  joinDate: string;
  department: string;
}

const mockStaff: Staff[] = [
  {
    id: 'STF-001',
    name: 'Nguyễn Văn Admin',
    email: 'admin@techstore.vn',
    phone: '0912 345 678',
    role: 'admin',
    status: 'active',
    joinDate: '01/01/2024',
    department: 'Quản lý'
  },
  {
    id: 'STF-002',
    name: 'Trần Thị Manager',
    email: 'manager@techstore.vn',
    phone: '0913 456 789',
    role: 'manager',
    status: 'active',
    joinDate: '15/02/2024',
    department: 'Kinh doanh'
  },
  {
    id: 'STF-003',
    name: 'Lê Văn Tech',
    email: 'tech@techstore.vn',
    phone: '0914 567 890',
    role: 'technician',
    status: 'active',
    joinDate: '20/03/2024',
    department: 'Kỹ thuật'
  },
  {
    id: 'STF-004',
    name: 'Phạm Thị Sale',
    email: 'sale@techstore.vn',
    phone: '0915 678 901',
    role: 'staff',
    status: 'active',
    joinDate: '10/04/2024',
    department: 'Bán hàng'
  },
  {
    id: 'STF-005',
    name: 'Hoàng Văn Support',
    email: 'support@techstore.vn',
    phone: '0916 789 012',
    role: 'staff',
    status: 'inactive',
    joinDate: '05/05/2024',
    department: 'Hỗ trợ'
  }
];

const getRoleInfo = (role: Staff['role']) => {
  const roleMap = {
    admin: { label: 'Quản trị viên', color: 'bg-red-100 text-red-800 border-red-200' },
    manager: { label: 'Quản lý', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    staff: { label: 'Nhân viên', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    technician: { label: 'Kỹ thuật viên', color: 'bg-purple-100 text-purple-800 border-purple-200' }
  };
  return roleMap[role];
};

export function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff' as Staff['role'],
    department: ''
  });

  const filteredStaff = mockStaff.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStaff = () => {
    console.log('Adding staff:', newStaff);
    setIsAddDialogOpen(false);
    setNewStaff({ name: '', email: '', phone: '', role: 'staff', department: '' });
  };

  const handleEditStaff = () => {
    console.log('Editing staff:', selectedStaff);
    setIsEditDialogOpen(false);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      console.log('Deleting staff:', staffId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng nhân viên</p>
              <p className="text-[#f37021]">{mockStaff.length}</p>
            </div>
            <div className="w-12 h-12 bg-[#f37021]/10 rounded-full flex items-center justify-center">
              <UserPlus size={24} className="text-[#f37021]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
              <p className="text-[#0db14b]">{mockStaff.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="w-12 h-12 bg-[#0db14b]/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0db14b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nghỉ phép</p>
              <p className="text-yellow-600">{mockStaff.filter(s => s.status === 'inactive').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Quản lý</p>
              <p className="text-[#f37021]">{mockStaff.filter(s => s.role === 'admin' || s.role === 'manager').length}</p>
            </div>
            <div className="w-12 h-12 bg-[#f37021]/10 rounded-full flex items-center justify-center">
              <Shield size={24} className="text-[#f37021]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Tìm kiếm nhân viên theo tên, email hoặc mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#f37021] hover:bg-[#d45f1a] text-white w-full md:w-auto">
                <Plus size={20} className="mr-2" />
                Thêm nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-[#f37021]">Thêm Nhân Viên Mới</DialogTitle>
                <DialogDescription>
                  Điền thông tin nhân viên mới vào form bên dưới
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn A"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nhanvien@techstore.vn"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    placeholder="0912 345 678"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select value={newStaff.role} onValueChange={(value: Staff['role']) => setNewStaff({ ...newStaff, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Nhân viên</SelectItem>
                      <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                      <SelectItem value="manager">Quản lý</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Phòng ban</Label>
                  <Input
                    id="department"
                    placeholder="Bán hàng"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button className="bg-[#0db14b] hover:bg-[#0a8f3d] text-white" onClick={handleAddStaff}>
                  Thêm nhân viên
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Mã NV</TableHead>
                <TableHead>Thông tin</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => {
                const roleInfo = getRoleInfo(staff.role);
                return (
                  <TableRow key={staff.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-[#f37021]">{staff.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Mail size={12} />
                            {staff.email}
                          </span>
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Phone size={12} />
                            {staff.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{staff.department}</TableCell>
                    <TableCell>
                      {staff.status === 'active' ? (
                        <Badge className="bg-[#0db14b] hover:bg-[#0db14b] text-white">Hoạt động</Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-300 text-gray-600">Nghỉ phép</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">{staff.joinDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={isEditDialogOpen && selectedStaff?.id === staff.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#f37021] hover:text-[#d45f1a] hover:bg-[#f37021]/10"
                              onClick={() => setSelectedStaff(staff)}
                            >
                              <Edit size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-[#f37021]">Chỉnh Sửa Nhân Viên</DialogTitle>
                              <DialogDescription>
                                Cập nhật thông tin nhân viên
                              </DialogDescription>
                            </DialogHeader>
                            {selectedStaff && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Họ và tên</Label>
                                  <Input
                                    id="edit-name"
                                    defaultValue={selectedStaff.name}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-email">Email</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    defaultValue={selectedStaff.email}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-phone">Số điện thoại</Label>
                                  <Input
                                    id="edit-phone"
                                    defaultValue={selectedStaff.phone}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-role">Vai trò</Label>
                                  <Select defaultValue={selectedStaff.role}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="staff">Nhân viên</SelectItem>
                                      <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                                      <SelectItem value="manager">Quản lý</SelectItem>
                                      <SelectItem value="admin">Quản trị viên</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-department">Phòng ban</Label>
                                  <Input
                                    id="edit-department"
                                    defaultValue={selectedStaff.department}
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Hủy
                              </Button>
                              <Button className="bg-[#0db14b] hover:bg-[#0a8f3d] text-white" onClick={handleEditStaff}>
                                Cập nhật
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
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
          Hiển thị {filteredStaff.length} trên {mockStaff.length} nhân viên
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Trước
          </Button>
          <Button variant="outline" size="sm" className="bg-[#f37021] text-white border-[#f37021]">
            1
          </Button>
          <Button variant="outline" size="sm">
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}