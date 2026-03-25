import { useState, useMemo, Fragment, useEffect } from "react";
import {
  X,
  Plus,
  Search,
  ChevronDown,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";

interface Product {
  model: string;
  image: string;
  processor: string;
  ram: string;
  rom: string;
  display: string;
  graphics: string;
  os: string;
  battery: string;
  price: string;
  brand?: string;
  year?: string;
  weight?: string;
  refreshRate?: string;
  storageType?: string;
}

interface ComparisonTableProps {
  products: Product[];
}

interface ComparisonCriteria {
  category: string;
  items: {
    label: string;
    key: keyof Product | "derived";
    getValue?: (product: Product) => string;
  }[];
}

export function ComparisonTable({ products }: ComparisonTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      setSelectedProducts([products[0]]);
    }
  }, [products]);

  // Thêm brand và các thông tin khác cho products
  const enhancedProducts = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        brand: p.brand || p.model.split(" ")[0] || "",
        year: p.year || "",
        weight: p.weight || "",
        refreshRate: p.refreshRate || "",
        storageType: p.storageType || "",
      })),
    [products],
  );

  // Lấy danh sách brands unique
  const brands = useMemo(
    () => ["all", ...new Set(enhancedProducts.map((p) => p.brand || ""))],
    [enhancedProducts],
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    return enhancedProducts.filter((p) => {
      const matchSearch = p.model
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchBrand = filterBrand === "all" || p.brand === filterBrand;

      const priceNum = Number(p.price); // giá từ API (VND)

      const matchPrice =
        filterPrice === "all" ||
        (filterPrice === "under15" && priceNum < 15000000) ||
        (filterPrice === "15-25" &&
          priceNum >= 15000000 &&
          priceNum < 25000000) ||
        (filterPrice === "25-35" &&
          priceNum >= 25000000 &&
          priceNum < 35000000) ||
        (filterPrice === "over35" && priceNum >= 35000000);

      const notSelected = !selectedProducts.find((sp) => sp.model === p.model);

      return matchSearch && matchBrand && matchPrice && notSelected;
    });
  }, [
    enhancedProducts,
    searchQuery,
    filterBrand,
    filterPrice,
    selectedProducts,
  ]);

  // Tiêu chí so sánh
  const comparisonCriteria: ComparisonCriteria[] = [
    {
      category: "Tổng Quan",
      items: [
        { label: "Giá", key: "price" },
        { label: "Hãng", key: "brand" },
        { label: "Năm", key: "year" },
      ],
    },
    {
      category: "Hiệu Năng",
      items: [
        { label: "CPU", key: "processor" },
        { label: "GPU", key: "graphics" },
        { label: "RAM", key: "ram" },
      ],
    },
    {
      category: "Lưu Trữ",
      items: [
        { label: "Loại ổ", key: "storageType" },
        { label: "Dung lượng", key: "rom" },
      ],
    },
    {
      category: "Màn Hình",
      items: [
        { label: "Kích thước", key: "display" },
        { label: "Tần số quét", key: "refreshRate" },
      ],
    },
    {
      category: "Di Động",
      items: [
        { label: "Pin", key: "battery" },
        { label: "Trọng lượng", key: "weight" },
      ],
    },
  ];

  // Lọc tiêu chí nếu bật "chỉ hiển thị khác biệt"
  const visibleCriteria = useMemo(() => {
    if (!showDifferencesOnly || selectedProducts.length < 2) {
      return comparisonCriteria;
    }

    return comparisonCriteria
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const values = selectedProducts.map((p) => {
            if (item.getValue) return item.getValue(p);
            return p[item.key as keyof Product] || "";
          });
          return new Set(values).size > 1; // Có sự khác biệt
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [showDifferencesOnly, selectedProducts]);

  // Tìm giá thấp nhất
  const lowestPriceIndex = useMemo(() => {
    if (selectedProducts.length === 0) return -1;
    const prices = selectedProducts.map((p) =>
      parseInt(p.price.replace(/[^0-9]/g, "")),
    );
    const minPrice = Math.min(...prices);
    return prices.indexOf(minPrice);
  }, [selectedProducts]);

  const handleAddProduct = (product: Product) => {
    if (selectedProducts.length < 4) {
      setSelectedProducts([...selectedProducts, product]);
      setIsModalOpen(false);
      setSearchQuery("");
    }
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Top Section - Selected Products Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Selected Product Cards */}
        {selectedProducts.map((product, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-4 relative hover:shadow-lg transition-shadow"
          >
            <button
              onClick={() => handleRemoveProduct(index)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
            >
              <X size={14} />
            </button>
            <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden mb-3">
              <img
                src={product.image}
                alt={product.model}
                className="w-full h-full object-cover"
              />
            </div>
            <h3
              className="text-sm font-medium text-gray-800 truncate mb-2"
              title={product.model}
            >
              {product.model}
            </h3>
            <p className="text-lg font-bold text-[#f37021]">{product.price}</p>
          </div>
        ))}

        {/* Add Product Card */}
        {selectedProducts.length < 4 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white rounded-lg shadow-md p-4 border-2 border-dashed border-gray-300 hover:border-[#0066b3] hover:shadow-lg transition-all flex flex-col items-center justify-center min-h-[200px] group"
          >
            <div className="w-12 h-12 bg-[#0066b3]/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#0066b3]/20 transition-colors">
              <Plus size={24} className="text-[#0066b3]" />
            </div>
            <span className="text-gray-600 font-medium">Thêm laptop</span>
          </button>
        )}
      </div>

      {/* Message when less than 2 products */}
      {selectedProducts.length < 2 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">
            Vui lòng chọn ít nhất 2 laptop để bắt đầu so sánh
          </p>
        </div>
      )}

      {/* Toggle and Controls */}
      {selectedProducts.length >= 2 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDifferencesOnly}
              onChange={(e) => setShowDifferencesOnly(e.target.checked)}
              className="w-4 h-4 text-[#0066b3] rounded"
            />
            <span className="text-sm text-gray-700">
              Chỉ hiển thị khác biệt
            </span>
          </label>
          <div className="text-sm text-gray-500">
            {selectedProducts.length} / 4 laptop
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedProducts.length >= 2 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Sticky Header with Product Info */}
              <thead className="sticky top-0 z-20 bg-white shadow-md">
                <tr>
                  <th className="sticky left-0 z-30 bg-white border-b-2 border-r-2 border-gray-200 p-4 text-left min-w-[180px]">
                    <span className="text-sm font-semibold text-gray-600">
                      Tiêu chí
                    </span>
                  </th>
                  {selectedProducts.map((product, index) => (
                    <th
                      key={index}
                      className="border-b-2 border-gray-200 p-4 min-w-[200px] bg-gradient-to-b from-gray-50 to-white"
                    >
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-2 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.model}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {product.model}
                        </p>
                        <p
                          className={`text-lg font-bold ${index === lowestPriceIndex ? "text-[#0db14b]" : "text-[#f37021]"}`}
                        >
                          {product.price}
                        </p>
                        {index === lowestPriceIndex && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-[#0db14b] text-white text-xs rounded-full">
                            Giá tốt nhất
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Comparison Rows */}
              <tbody>
                {visibleCriteria.map((category, catIndex) => (
                  <Fragment key={`cat-${catIndex}`}>
                    {/* Category Header */}
                    <tr>
                      <td
                        colSpan={selectedProducts.length + 1}
                        className="bg-[#0066b3] text-white font-semibold p-3 text-sm sticky left-0 z-10"
                      >
                        {category.category}
                      </td>
                    </tr>

                    {/* Category Items */}
                    {category.items.map((item, itemIndex) => (
                      <tr
                        key={`item-${catIndex}-${itemIndex}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-white border-r-2 border-b border-gray-200 p-4 font-medium text-sm text-gray-700">
                          {item.label}
                        </td>
                        {selectedProducts.map((product, prodIndex) => {
                          const value = item.getValue
                            ? item.getValue(product)
                            : product[item.key as keyof Product] || "";

                          return (
                            <td
                              key={prodIndex}
                              className="border-b border-gray-200 p-4 text-sm text-gray-600 text-center"
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}

                {/* CTA Row */}
                <tr>
                  <td className="sticky left-0 z-10 bg-gray-50 border-r-2 border-t-2 border-gray-200 p-4"></td>
                  {selectedProducts.map((_, index) => (
                    <td
                      key={index}
                      className="border-t-2 border-gray-200 p-4 bg-gray-50"
                    >
                      <div className="flex flex-col gap-2">
                        <button className="bg-[#f37021] text-white px-4 py-2 rounded-md hover:bg-[#d45f1a] transition-colors text-sm font-medium flex items-center justify-center gap-2">
                          <ShoppingCart size={16} />
                          Mua ngay
                        </button>
                        <button className="bg-white text-[#0066b3] border border-[#0066b3] px-4 py-2 rounded-md hover:bg-[#0066b3] hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2">
                          <ExternalLink size={16} />
                          Xem chi tiết
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#0066b3] to-[#004d8a]">
              <h2 className="text-white text-xl font-semibold">
                Chọn Laptop để So Sánh
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên laptop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066b3] focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hãng
                  </label>
                  <div className="relative">
                    <select
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#0066b3] focus:border-transparent bg-white"
                    >
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand === "all" ? "Tất cả hãng" : brand}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoảng giá
                  </label>
                  <div className="relative">
                    <select
                      value={filterPrice}
                      onChange={(e) => setFilterPrice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">Tất cả giá</option>
                      <option value="under15">Dưới 15 triệu</option>
                      <option value="15-25">15 - 25 triệu</option>
                      <option value="25-35">25 - 35 triệu</option>
                      <option value="over35">Trên 35 triệu</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Không tìm thấy laptop phù hợp
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddProduct(product)}
                      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-[#0066b3] hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden mb-3">
                        <img
                          src={product.image}
                          alt={product.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3
                        className="text-sm font-medium text-gray-800 mb-2 truncate"
                        title={product.model}
                      >
                        {product.model}
                      </h3>
                      <p className="text-lg font-bold text-[#f37021] mb-2">
                        {product.price}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-[#0066b3] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} />
                        <span>Thêm để so sánh</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
