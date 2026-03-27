import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Copy } from 'lucide-react';

type Promotion = {
  id: number;
  code: string;
  type: 'percentage' | 'fixed' | 'bundle';
  value: number;
  description: string;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'inactive' | 'expired';
};

const mockPromotions: Promotion[] = [
  {
    id: 1,
    code: 'NEWYEAR2026',
    type: 'percentage',
    value: 15,
    description: 'New Year Sale - 15% off all products',
    minPurchase: 5000000,
    maxDiscount: 2000000,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    usageLimit: 1000,
    usageCount: 342,
    status: 'active',
  },
  {
    id: 2,
    code: 'GAMING50K',
    type: 'fixed',
    value: 500000,
    description: 'Gaming PC Bundle - 500K discount',
    minPurchase: 10000000,
    startDate: '2026-01-10',
    endDate: '2026-02-28',
    usageLimit: 500,
    usageCount: 87,
    status: 'active',
  },
  {
    id: 3,
    code: 'FLASHSALE20',
    type: 'percentage',
    value: 20,
    description: 'Flash Sale - 20% off selected items',
    minPurchase: 3000000,
    maxDiscount: 1500000,
    startDate: '2025-12-15',
    endDate: '2025-12-31',
    usageLimit: 200,
    usageCount: 200,
    status: 'expired',
  },
  {
    id: 4,
    code: 'CPUGPU2026',
    type: 'bundle',
    value: 1000000,
    description: 'CPU + GPU Bundle - Save 1M VND',
    minPurchase: 20000000,
    startDate: '2026-01-15',
    endDate: '2026-03-15',
    usageLimit: 100,
    usageCount: 23,
    status: 'active',
  },
  {
    id: 5,
    code: 'STUDENT10',
    type: 'percentage',
    value: 10,
    description: 'Student Discount - 10% off',
    minPurchase: 2000000,
    maxDiscount: 1000000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 5000,
    usageCount: 1234,
    status: 'active',
  },
];

export function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPromotions = promotions.filter((promo) =>
    promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code "${code}" copied to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d96319] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Promotion
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPromotions.map((promo) => (
          <div key={promo.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{promo.code}</h3>
                    <button
                      onClick={() => copyCode(promo.code)}
                      className="p-1 text-gray-400 hover:text-[#f37021] transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{promo.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  promo.status === 'active' ? 'bg-green-100 text-green-800' :
                  promo.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {promo.status === 'active' ? 'Active' :
                   promo.status === 'inactive' ? 'Inactive' :
                   'Expired'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-gray-900">
                    {promo.type === 'percentage' ? `${promo.value}%` :
                     promo.type === 'fixed' ? formatPrice(promo.value) :
                     `Bundle - ${formatPrice(promo.value)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min Purchase:</span>
                  <span className="font-semibold text-gray-900">{formatPrice(promo.minPurchase)}</span>
                </div>
                {promo.maxDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Max Discount:</span>
                    <span className="font-semibold text-gray-900">{formatPrice(promo.maxDiscount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Valid:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium text-gray-900">
                    {promo.usageCount} / {promo.usageLimit}
                  </span>
                </div>
              </div>

              {/* Usage Progress */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#f37021] h-2 rounded-full"
                    style={{ width: `${(promo.usageCount / promo.usageLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(promo.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create New Promotion</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SALE2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    placeholder="10 or 100000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase (VND)</label>
                  <input
                    type="number"
                    placeholder="1000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (VND)</label>
                  <input
                    type="number"
                    placeholder="500000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe this promotion..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d96319] transition-colors"
              >
                Create Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
