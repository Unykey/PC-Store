// Giữ nguyên UI, chỉ thay data tĩnh bằng data API

import { useState, useEffect } from "react";
import { Laptop, Cpu, HardDrive, ChevronRight } from "lucide-react";
import { categoryApi } from "@/api/categoryApi";
import publicProductApi from "@/api/productApi";

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const cateRes = await categoryApi.getAll();
      setCategories(cateRes.data.data);

      const productRes = await publicProductApi.getAllProducts();
      setProducts(productRes.data.data);
    };
    fetchData();
  }, []);

  // map icon theo index (giữ UI cũ)
  const icons = [Laptop, Cpu, HardDrive];

  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#f37021] text-sm"
      >
        <span>Danh mục sản phẩm</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 shadow-2xl rounded-lg overflow-hidden">
          <div className="flex bg-white">
            {/* LEFT */}
            <div className="w-56 bg-gray-50 border-r">
              {categories.map((c, index) => {
                const Icon = icons[index % icons.length];
                return (
                  <button
                    key={c.categoryId}
                    onMouseEnter={() => setActiveCategory(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${
                      activeCategory === index
                        ? "bg-white text-[#0066b3]"
                        : ""
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-sm">{c.name}</span>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </div>

            {/* RIGHT */}
            <div className="w-[700px] p-6 bg-white">
              <div className="grid grid-cols-3 gap-6">
                {products
                  .filter(
                    (p) =>
                      p.categoryId ===
                      categories[activeCategory]?.categoryId
                  )
                  .slice(0, 15) // giới hạn cho đẹp UI
                  .map((p) => (
                    <div key={p.productId}>
                      <a
                        href={`/product/${p.productId}`}
                        className="text-sm text-gray-600 hover:text-[#f37021]"
                      >
                        {p.name}
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}