import { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Camera, Save } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';

export function AccountDetails() {
  const [isEditing, setIsEditing] = useState(false);
  const [accountData, setAccountData] = useState({
    fullName: 'Nguyễn Văn Admin',
    email: 'admin@techstore.vn',
    phone: '0912 345 678',
    address: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
    role: 'Administrator',
    joinDate: '01/01/2024'
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log('Saving account data:', accountData);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <User size={48} className="text-gray-400" />
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#f37021] hover:bg-[#d45f1a] rounded-full flex items-center justify-center text-white transition-colors">
              <Camera size={20} />
            </button>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[#f37021] mb-1">{accountData.fullName}</h3>
                <p className="text-sm text-gray-600">{accountData.role}</p>
              </div>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#f37021] hover:bg-[#d45f1a] text-white"
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-[#0db14b] hover:bg-[#0a8f3d] text-white"
                  >
                    <Save size={16} className="mr-2" />
                    Lưu
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} className="text-[#f37021]" />
                <span>{accountData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} className="text-[#f37021]" />
                <span>{accountData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                <MapPin size={16} className="text-[#f37021]" />
                <span>{accountData.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-[#f37021] mb-4">Thông Tin Chi Tiết</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              value={accountData.fullName}
              onChange={(e) => setAccountData({ ...accountData, fullName: e.target.value })}
              disabled={!isEditing}
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={accountData.email}
              onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
              disabled={!isEditing}
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={accountData.phone}
              onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
              disabled={!isEditing}
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Input
              id="role"
              value={accountData.role}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={accountData.address}
              onChange={(e) => setAccountData({ ...accountData, address: e.target.value })}
              disabled={!isEditing}
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinDate">Ngày tham gia</Label>
            <Input
              id="joinDate"
              value={accountData.joinDate}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-[#f37021] mb-4">Bảo Mật</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f37021]/10 rounded-full flex items-center justify-center">
                <Lock size={20} className="text-[#f37021]" />
              </div>
              <div>
                <p className="font-medium">Đổi mật khẩu</p>
                <p className="text-sm text-gray-600">Cập nhật mật khẩu của bạn</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#f37021] text-[#f37021] hover:bg-[#f37021] hover:text-white">
              Thay đổi
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0db14b]/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0db14b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Xác thực hai yếu tố</p>
                <p className="text-sm text-gray-600">Tăng cường bảo mật tài khoản</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#0db14b] font-medium">Đã bật</span>
              <div className="w-10 h-6 bg-[#0db14b] rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
              <p className="text-[#f37021]">1,234</p>
            </div>
            <div className="w-12 h-12 bg-[#f37021]/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#f37021]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Doanh thu</p>
              <p className="text-[#0db14b]">2.5 tỷ đ</p>
            </div>
            <div className="w-12 h-12 bg-[#0db14b]/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0db14b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Khách hàng</p>
              <p className="text-[#f37021]">456</p>
            </div>
            <div className="w-12 h-12 bg-[#f37021]/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#f37021]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}