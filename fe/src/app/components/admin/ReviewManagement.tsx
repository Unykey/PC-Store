import { useEffect, useMemo, useState } from 'react';
import { Star, Eye, EyeOff, Trash2, Search } from 'lucide-react';
import { reviewApi, type AdminReview, type ReviewStatus } from '@/api/reviewApi';

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

const toUiStatus = (s: ReviewStatus): Review['status'] => {
  if (s === 'APPROVED') return 'approved';
  if (s === 'PENDING') return 'pending';
  return 'hidden';
};

const toApiStatus = (s: Review['status']): ReviewStatus => {
  if (s === 'approved') return 'APPROVED';
  if (s === 'pending') return 'PENDING';
  return 'HIDDEN';
};

const mapAdminReview = (r: AdminReview): Review => ({
  id: r.reviewId,
  productName: r.productName,
  customerName: r.customerName,
  rating: r.rating,
  comment: r.comment,
  date: r.reviewDate,
  status: toUiStatus(r.status),
  helpful: r.helpfulCount,
});

export function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const statusParam = filterStatus === 'all' ? undefined : toApiStatus(filterStatus as Review['status']);
      const res = await reviewApi.adminList({
        q: searchTerm.trim() || undefined,
        status: statusParam,
      });
      setReviews((res.data.data || []).map(mapAdminReview));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      loadReviews();
    }, 250);
    return () => clearTimeout(t);
  }, [searchTerm, filterStatus]);

  const filteredReviews = useMemo(() => reviews.filter((review) => {
    const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    return matchesSearch && matchesStatus;
  }), [reviews, searchTerm, filterStatus]);

  const handleApprove = async (id: number) => {
    try {
      await reviewApi.adminUpdateStatus(id, 'APPROVED');
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to approve review');
    }
  };

  const handleHide = async (id: number) => {
    try {
      await reviewApi.adminUpdateStatus(id, 'HIDDEN');
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'hidden' } : r)));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to hide review');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await reviewApi.adminDelete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to delete review');
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
        {loading && <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-600">Loading reviews...</div>}
        {!loading && error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>}
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