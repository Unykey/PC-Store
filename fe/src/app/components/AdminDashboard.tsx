import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  Star,
  BarChart3,
} from 'lucide-react';
import { DashboardHome } from './admin/DashboardHome';
import { ProductManagement } from './admin/ProductManagement';
import { InventoryManagement } from './admin/InventoryManagement';
import { OrdersManagement } from './admin/OrdersManagement';
import { CustomerManagement } from './admin/CustomerManagement';
import { ReviewManagement } from './admin/ReviewManagement';
import { ReportsManagement } from './admin/ReportsManagement';
import { AdminSidebar } from './admin/AdminSidebar';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'products':
        return <ProductManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'reviews':
        return <ReviewManagement />;
      case 'reports':
        return <ReportsManagement />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation (kept minimal) */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#f37021] to-[#d96319] rounded-lg flex items-center justify-center shadow-md">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-xs text-gray-500">TechShop Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-[#f37021] hover:bg-orange-50 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#f37021] rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f37021] to-[#d96319] flex items-center justify-center text-white font-semibold shadow-md">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-700">Administrator</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Removed top navigation tabs - they are now part of the sidebar */}
        </div>
      </header>

      {/* Layout: Sidebar (left) + Content (right) */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <AdminSidebar active={activeTab} onSelect={(id) => setActiveTab(id)} menuItems={menuItems} />

        <div>{renderContent()}</div>
      </main>
    </div>
  );
}