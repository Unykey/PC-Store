import axiosClient from './axiosClient';

export type ReviewStatus = 'APPROVED' | 'PENDING' | 'HIDDEN';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface AdminReview {
  reviewId: number;
  productId: number;
  productName: string;
  accountId: number;
  customerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  status: ReviewStatus;
  helpfulCount: number;
}

export const reviewApi = {
  adminList: (params?: { q?: string; status?: ReviewStatus }) =>
    axiosClient.get<ApiResponse<AdminReview[]>>('/api/admin/reviews', { params }),

  adminUpdateStatus: (id: number, status: ReviewStatus) =>
    axiosClient.put<ApiResponse<AdminReview>>(`/api/admin/reviews/${id}/status`, null, { params: { status } }),

  adminDelete: (id: number) =>
    axiosClient.delete<ApiResponse<null>>(`/api/admin/reviews/${id}`),
};

