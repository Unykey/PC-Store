import { useState } from 'react';
import { 
  Laptop, 
  Monitor, 
  Cpu, 
  HardDrive,
  Smartphone,
  Tablet,
  Watch,
  Gamepad2,
  ChevronRight
} from 'lucide-react';

interface SubItem {
  name: string;
  items: string[];
}

interface Category {
  icon: any;
  label: string;
  subCategories: SubItem[];
}

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const categories: Category[] = [
    {
      icon: Laptop,
      label: 'Laptop',
      subCategories: [
        {
          name: 'Ổ cứng',
          items: ['Ổ cứng SSD', 'Ổ cứng HDD', 'Ổ cứng di động', 'WD', 'Seagate', 'Kingston', 'Transcend', 'Samsung', 'Sandisk', 'Lexar', 'Crucial', 'Kingmax', 'Crucial', 'Lacie', 'Adata', 'MSI', 'GIGABYTE', 'Kioxia']
        },
        {
          name: 'CPU - Bộ vi xử lý',
          items: ['CPU Intel', 'CPU Intel Core-Ultra', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9', 'Intel thế hệ 12', 'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'CPU AMD', 'CPU AMD Ryzen', 'AMD 9000 series', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9']
        },
        {
          name: 'Case - Thùng máy tính',
          items: ['ASUS', 'SAMA', 'XIGMATEK', 'Golden Field', 'Deepcool', 'Cooler Master', 'Aerocool', 'MSI', 'CORSAIR', 'ANTEC', 'Cougar', 'DELUXE', 'EROSI', 'GIGABYTE', 'MIK', 'SEGOTER', 'NZXT']
        },
        {
          name: 'RAM',
          items: ['RAM Laptop', 'RAM PC', 'Ram 8GB', 'Ram 16GB', 'Ram 32GB', 'Kingston', 'Gigabyte', 'KINGMAX', 'G.SKILL', 'CORSAIR', 'Adata', 'Apacer', 'Lexar', 'TEAM']
        },
        {
          name: 'PSU - Nguồn máy tính',
          items: ['ASUS', 'Cooler Master', 'Golden Field', 'CORSAIR', 'Gigabyte', 'AcBel', 'MSI', 'SEGOTER', 'XIGMATEK', 'ANTEC', 'DEEPCOOL', 'MIK SPOWER']
        },
        {
          name: 'VGA - Card màn hình',
          items: ['RTX 5000 series', 'RTX 5090', 'RTX 5080', 'RTX 5070', 'RTX 5070 Ti', 'RTX 5060', 'RTX 5060 Ti', 'RTX 5050', 'RTX 4060', 'RTX 3060']
        },
        {
          name: 'Mainboard - Bo mạch chủ',
          items: ['Mainboard B860', 'Mainboard B760', 'Mainboard Z890', 'Mainboard Z790', 'Mainboard X870', 'Mainboard X670', 'Mainboard B650']
        },
        {
          name: 'Tản nhiệt PC',
          items: ['Tản nhiệt khí', 'Tản nhiệt nước']
        }
      ]
    },
    {
      icon: Smartphone,
      label: 'Sản phẩm Apple',
      subCategories: [
        {
          name: 'iPhone',
          items: ['iPhone 17', 'iPhone 16', 'iPhone 15', 'iPhone 14', 'iPhone 13']
        },
        {
          name: 'MacBook',
          items: ['MacBook Air M4', 'MacBook Pro M4', 'MacBook Air M3', 'MacBook Pro M3']
        },
        {
          name: 'iPad',
          items: ['iPad Pro', 'iPad Air', 'iPad Mini', 'iPad Gen 10']
        },
        {
          name: 'Apple Watch',
          items: ['Apple Watch Ultra', 'Apple Watch Series 10', 'Apple Watch SE']
        },
        {
          name: 'Phụ kiện Apple',
          items: ['AirPods', 'Apple Pencil', 'Magic Keyboard', 'Magic Mouse', 'Sạc Apple']
        }
      ]
    },
    {
      icon: Monitor,
      label: 'Điện máy',
      subCategories: [
        {
          name: 'Tivi & Màn hình',
          items: ['Smart TV', 'Android TV', 'Màn hình gaming', 'Màn hình văn phòng', 'Màn hình cong']
        },
        {
          name: 'Thiết bị âm thanh',
          items: ['Loa bluetooth', 'Tai nghe', 'Soundbar', 'Dàn karaoke']
        },
        {
          name: 'Thiết bị gia dụng',
          items: ['Tủ lạnh', 'Máy giặt', 'Điều hòa', 'Quạt điện', 'Nồi cơm điện']
        }
      ]
    },
    {
      icon: HardDrive,
      label: 'Điện gia dụng',
      subCategories: [
        {
          name: 'Thiết bị nhà bếp',
          items: ['Bếp điện', 'Lò vi sóng', 'Nồi chiên không dầu', 'Máy xay sinh tố', 'Bình đun siêu tốc']
        },
        {
          name: 'Thiết bị vệ sinh',
          items: ['Máy hút bụi', 'Máy lau nhà', 'Máy hút ẩm', 'Máy lọc không khí']
        }
      ]
    },
    {
      icon: Cpu,
      label: 'PC - Máy tính bộ',
      subCategories: [
        {
          name: 'PC Gaming',
          items: ['PC Gaming RTX 5090', 'PC Gaming RTX 4080', 'PC Gaming RTX 4070', 'PC Gaming RTX 4060']
        },
        {
          name: 'PC Văn phòng',
          items: ['PC Intel Core i3', 'PC Intel Core i5', 'PC AMD Ryzen 5']
        },
        {
          name: 'PC Workstation',
          items: ['PC Xeon', 'PC AMD Threadripper', 'PC đồ họa chuyên nghiệp']
        }
      ]
    },
    {
      icon: HardDrive,
      label: 'Màn hình máy tính',
      subCategories: [
        {
          name: 'Theo kích thước',
          items: ['Màn hình 24 inch', 'Màn hình 27 inch', 'Màn hình 32 inch', 'Màn hình 34 inch']
        },
        {
          name: 'Theo công nghệ',
          items: ['Màn hình IPS', 'Màn hình VA', 'Màn hình OLED', 'Màn hình cong']
        },
        {
          name: 'Gaming Monitor',
          items: ['144Hz', '165Hz', '240Hz', '360Hz']
        }
      ]
    },
    {
      icon: Tablet,
      label: 'Linh kiện máy tính',
      subCategories: [
        {
          name: 'RAM',
          items: ['RAM DDR5', 'RAM DDR4', 'RAM Laptop']
        },
        {
          name: 'SSD',
          items: ['SSD NVMe', 'SSD SATA', 'SSD M.2']
        },
        {
          name: 'VGA',
          items: ['NVIDIA GeForce', 'AMD Radeon']
        }
      ]
    },
    {
      icon: Watch,
      label: 'Phụ kiện',
      subCategories: [
        {
          name: 'Phụ kiện laptop',
          items: ['Chuột không dây', 'Bàn phím cơ', 'Balo laptop', 'Tản nhiệt laptop', 'Hub USB']
        },
        {
          name: 'Phụ kiện gaming',
          items: ['Chuột gaming', 'Bàn phím gaming', 'Tai nghe gaming', 'Mousepad', 'Ghế gaming']
        }
      ]
    },
    {
      icon: Gamepad2,
      label: 'Gaming Gear',
      subCategories: [
        {
          name: 'Chuột gaming',
          items: ['Logitech', 'Razer', 'Corsair', 'SteelSeries']
        },
        {
          name: 'Bàn phím gaming',
          items: ['Cơ Blue Switch', 'Cơ Red Switch', 'Cơ Brown Switch']
        },
        {
          name: 'Tai nghe gaming',
          items: ['Tai nghe có dây', 'Tai nghe không dây', 'Tai nghe 7.1']
        }
      ]
    },
    {
      icon: Tablet,
      label: 'Điện thoại, Tablet, Phụ kiện',
      subCategories: [
        {
          name: 'Điện thoại',
          items: ['iPhone', 'Samsung', 'Xiaomi', 'OPPO', 'Realme', 'Vivo']
        },
        {
          name: 'Tablet',
          items: ['iPad', 'Samsung Tab', 'Xiaomi Pad']
        },
        {
          name: 'Phụ kiện điện thoại',
          items: ['Ốp lưng', 'Kính cường lực', 'Sạc nhanh', 'Tai nghe']
        }
      ]
    },
    {
      icon: Tablet,
      label: 'Thiết bị âm thanh',
      subCategories: [
        {
          name: 'Loa',
          items: ['Loa bluetooth', 'Loa vi tính', 'Loa gaming', 'Soundbar']
        },
        {
          name: 'Tai nghe',
          items: ['Tai nghe bluetooth', 'Tai nghe gaming', 'Tai nghe có dây']
        }
      ]
    },
    {
      icon: HardDrive,
      label: 'Thiết bị văn phòng',
      subCategories: [
        {
          name: 'Máy in',
          items: ['Máy in laser', 'Máy in phun', 'Máy in đa chức năng']
        },
        {
          name: 'Thiết bị hội nghị',
          items: ['Webcam', 'Micro', 'Loa hội nghị']
        }
      ]
    },
    {
      icon: Gamepad2,
      label: 'Phụ kiện máy tính',
      subCategories: [
        {
          name: 'Chuột & bàn phím',
          items: ['Chuột văn phòng', 'Chuột gaming', 'Bàn phím văn phòng', 'Bàn phím cơ']
        },
        {
          name: 'USB & Hub',
          items: ['USB 3.0', 'USB Type-C', 'Hub USB', 'Đầu đọc thẻ']
        }
      ]
    },
    {
      icon: Gamepad2,
      label: 'Giải pháp doanh nghiệp',
      subCategories: [
        {
          name: 'Máy chủ',
          items: ['Server Dell', 'Server HP', 'Server Lenovo']
        },
        {
          name: 'Thiết bị mạng',
          items: ['Switch', 'Router', 'Firewall', 'Access Point']
        }
      ]
    },
    {
      icon: HardDrive,
      label: 'Hàng thanh lý',
      subCategories: [
        {
          name: 'Laptop thanh lý',
          items: ['Laptop Dell', 'Laptop HP', 'Laptop Lenovo']
        },
        {
          name: 'PC thanh lý',
          items: ['PC văn phòng', 'Màn hình']
        }
      ]
    }
  ];

  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}> 
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#f37021] transition-colors text-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Danh mục sản phẩm</span>
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div 
            className="absolute left-0 top-full mt-1 z-50 shadow-2xl rounded-lg overflow-hidden"
          >
            <div className="flex bg-white">
              {/* Left Categories */}
              <div className="w-56 bg-gray-50 border-r border-gray-200">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onMouseEnter={() => setActiveCategory(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeCategory === index 
                        ? 'bg-white text-[#0066b3] border-r-2 border-[#0066b3]' 
                        : 'text-gray-700 hover:bg-white hover:text-[#0066b3]'
                    }`}
                  >
                    <category.icon size={18} className="flex-shrink-0" />
                    <span className="flex-1 text-sm">{category.label}</span>
                    <ChevronRight size={16} className="flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* Right Sub-categories */}
              <div className="w-[700px] max-h-[500px] overflow-y-auto p-6 bg-white">
                <div className="grid grid-cols-3 gap-6">
                  {categories[activeCategory].subCategories.map((subCat, index) => (
                    <div key={index}>
                      <h4 className="text-[#0066b3] mb-3 pb-2 border-b border-gray-200">
                        {subCat.name}
                      </h4>
                      <ul className="space-y-2">
                        {subCat.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            <a 
                              href="#" 
                              className="text-sm text-gray-600 hover:text-[#f37021] hover:underline transition-colors block"
                              onClick={(e) => {
                                e.preventDefault();
                                setIsOpen(false);
                              }}
                            >
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}