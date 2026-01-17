import { 
  Laptop, 
  Monitor, 
  Cpu, 
  Wrench, 
  Shield, 
  Tag, 
  ChevronRight,
  X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { icon: Laptop, label: 'Laptop', color: '#0066b3', subItems: ['Gaming', 'Văn phòng', 'Đồ họa'] },
    { icon: Monitor, label: 'PC Desktop', color: '#0066b3', subItems: ['PC Gaming', 'PC Văn phòng', 'Workstation'] },
    { icon: Cpu, label: 'Linh Kiện', color: '#0066b3', subItems: ['CPU', 'RAM', 'SSD', 'VGA', 'Mainboard'] },
    { icon: Wrench, label: 'Dịch Vụ Lắp Ráp', color: '#0066b3', subItems: [] },
    { icon: Shield, label: 'Bảo Hành/Bảo Trì', color: '#0db14b', subItems: [] },
    { icon: Tag, label: 'Khuyến Mãi', color: '#0db14b', subItems: [] },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white shadow-lg z-50 lg:z-0
          w-64 transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ top: 'var(--header-height, 0)' }}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-800">Danh Mục</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-2">
          {menuItems.map((item, index) => (
            <div key={index} className="mb-1">
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 transition-colors group"
                style={{ 
                  borderLeft: `3px solid ${item.color}`,
                }}
              >
                <item.icon 
                  size={20} 
                  style={{ color: item.color }}
                  className="flex-shrink-0"
                />
                <span className="flex-1 text-left text-gray-700 group-hover:text-gray-900">
                  {item.label}
                </span>
                {item.subItems.length > 0 && (
                  <ChevronRight 
                    size={16} 
                    className="text-gray-400 group-hover:text-gray-600"
                  />
                )}
              </button>

              {/* Sub Items */}
              {item.subItems.length > 0 && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#0066b3] hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {subItem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Promotion Banner */}
        <div className="m-4 p-4 bg-gradient-to-br from-[#0db14b] to-[#0a8f3d] rounded-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={18} />
            <span className="font-semibold">Ưu Đãi Đặc Biệt</span>
          </div>
          <p className="text-sm opacity-90">Giảm giá lên đến 30% cho tất cả sản phẩm laptop gaming!</p>
          <button className="mt-3 w-full bg-white text-[#0db14b] px-4 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors">
            Xem ngay
          </button>
        </div>
      </aside>
    </>
  );
}
