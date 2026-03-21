import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Upload } from 'lucide-react';
import { getAll, deleteProduct } from '@/api/productApi';
import type { ProductResponse } from '@/api/productApi';

type Product = ProductResponse & {
  image?: string;
  specs?: {
    [key: string]: string;
  };
};

const categories = ['All', 'CPU', 'GPU', 'RAM', 'SSD', 'Motherboard', 'PSU', 'Case', 'Cooling'];

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAll();
        // Backend may return either ApiResponse<ProductResponse[]> or
        // ApiResponse<ProductPageResponse> where data.items is the array.
        const payload: unknown = res?.data?.data;
        let dataArray: ProductResponse[] = [];
        if (Array.isArray(payload)) {
          // payload is ProductResponse[]
          dataArray = payload as ProductResponse[];
        } else if (payload && typeof payload === 'object') {
          // maybe ProductPageResponse { items: ProductResponse[] }
          const maybePage = payload as { items?: unknown };
          if (Array.isArray(maybePage.items)) {
            dataArray = maybePage.items as ProductResponse[];
          }
        }

        // Map backend fields to local shape if necessary and coerce price
        setProducts(
          dataArray.map((p: ProductResponse) => ({
            ...p,
            price: Number(p.price ?? 0),
          }))
        );
      } catch (err) {
        const maybeErr = err as { response?: { data?: { message?: string } } } | undefined;
        const errMsg = maybeErr?.response?.data?.message || 'Không thể tải danh sách sản phẩm.';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.productId !== id));
    } catch (err) {
      const maybeErr = err as { response?: { data?: { message?: string } } } | undefined;
      alert(maybeErr?.response?.data?.message || 'Delete failed');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (product.categoryName || '') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
          />
        </div>
        <button 
          onClick={() => {/* TODO: open add modal */}}
          className="px-4 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d96319] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? 'bg-[#f37021] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm text-gray-600">Loading...</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm text-red-600">{error}</td>
                </tr>
              )}

              {!loading && !error && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm text-gray-600">No products found.</td>
                </tr>
              )}

              {!loading && !error && filteredProducts.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.categoryName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{product.serialNumber || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatPrice(Number(product.price))}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      (product.stockQuantity ?? 0) < 10 ? 'bg-red-100 text-red-800' :
                      (product.stockQuantity ?? 0) < 20 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.stockQuantity ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.productId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Details Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    defaultValue={editingProduct.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent">
                    <option>{editingProduct.categoryName}</option>
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    defaultValue={editingProduct.serialNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (VND)</label>
                  <input
                    type="number"
                    defaultValue={Number(editingProduct.price)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    defaultValue={editingProduct.stockQuantity ?? 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
              </div>

              {editingProduct.specs && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Specifications</h4>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {Object.entries(editingProduct.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600">{key}:</span>
                        <span className="text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d96319] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
