import { useState } from 'react';
import { Star, Eye, EyeOff, Trash2, Search } from 'lucide-react';

type Review = {
  id: number;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'hidden';
  helpful: number;
};

const mockReviews: Review[] = [
  {
    id: 1,
    productName: 'Intel Core i9-13900K',
    customerName: 'Nguyễn Văn A',
    rating: 5,
    comment: 'CPU rất mạnh mẽ, chơi game mượt mà. Đóng gói cẩn thận, giao hàng nhanh. Rất hài lòng!',
    date: '2026-01-15',
    status: 'approved',
    helpful: 12,
  },
  {
    id: 2,
    productName: 'NVIDIA RTX 4090',
    customerName: 'Trần Thị B',
    rating: 5,
    comment: 'Card đồ họa tuyệt vời! Render video nhanh gấp đôi so với card cũ. Giá hơi cao nhưng xứng đáng.',
    date: '2026-01-14',
    status: 'approved',
    helpful: 8,
  },
  {
    id: 3,
    productName: 'Samsung 990 Pro 2TB',
    customerName: 'Lê Văn C',
    rating: 4,
    comment: 'SSD tốc độ cao, boot máy rất nhanh. Tuy nhiên giá có vẻ cao hơn so với thị trường một chút.',
    date: '2026-01-13',
    status: 'approved',
    helpful: 5,
  },
  {
    id: 4,
    productName: 'Corsair Vengeance RGB 32GB',
    customerName: 'Phạm Thị D',
    rating: 3,
    comment: 'RAM hoạt động ổn nhưng đèn RGB không sáng đúng như quảng cáo. Đã liên hệ hỗ trợ.',
    date: '2026-01-12',
    status: 'pending',
    helpful: 2,
  },
  {
    id: 5,
    productName: 'ASUS ROG Strix B650E',
    customerName: 'Hoàng Văn E',
    rating: 5,
    comment: 'Mainboard chất lượng cao, nhiều tính năng. BIOS dễ dàng overclock. Recommend!',
    date: '2026-01-11',
    status: 'approved',
    helpful: 15,
  },
  {
    id: 6,
    productName: 'WD Black SN850X 1TB',
    customerName: 'Võ Thị F',
    rating: 2,
    comment: 'Sản phẩm không tốt, nhiệt độ cao bất thường khi sử dụng.',
    date: '2026-01-10',
    status: 'pending',
    helpful: 1,
  },
];

export function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: number) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, status: 'approved' as const } : r
    ));
  };

  const handleHide = (id: number) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, status: 'hidden' as const } : r
    ));
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    hidden: reviews.filter(r => r.status === 'hidden').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#f37021]">
          <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-[#f37021]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#0db14b]">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-2xl font-bold text-[#0db14b]">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#ffa500]">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-[#ffa500]">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-600">
          <p className="text-sm text-gray-600 mb-1">Hidden</p>
          <p className="text-2xl font-bold text-gray-600">{stats.hidden}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{review.productName}</h3>
                    {renderStars(review.rating)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{review.customerName}</span>
                    <span>•</span>
                    <span>{new Date(review.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  review.status === 'approved' ? 'bg-green-100 text-green-800' :
                  review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {review.status === 'approved' ? 'Approved' :
                   review.status === 'pending' ? 'Pending' :
                   'Hidden'}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {review.helpful} people found this helpful
                </div>
                <div className="flex items-center gap-2">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  {review.status !== 'hidden' && (
                    <button
                      onClick={() => handleHide(review.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}