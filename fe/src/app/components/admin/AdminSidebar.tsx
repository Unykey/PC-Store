import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  BarChart3,
} from 'lucide-react';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AdminSidebarProps = {
  active: string;
  onSelect: (id: string) => void;
  menuItems?: MenuItem[];
};

const defaultItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function AdminSidebar({ active, onSelect, menuItems }: AdminSidebarProps) {
  const items = menuItems ?? defaultItems;

  return (
    <nav className="hidden lg:block w-64 bg-white rounded-lg shadow p-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                isActive ? 'bg-[#f37021] text-white shadow' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{it.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile fallback: a compact horizontal nav for small screens */}
      <div className="lg:hidden mt-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onSelect(it.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap text-sm ${
                  isActive ? 'bg-[#f37021] text-white' : 'text-gray-700 bg-white border border-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
