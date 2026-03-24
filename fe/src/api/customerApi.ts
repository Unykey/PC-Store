import axiosClient from './axiosClient';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface AdminCustomer {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  joinDate?: string;
  lastOrder?: string;
  status?: 'active' | 'inactive';
}

export interface CustomerCreateRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CustomerUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: 'active' | 'inactive';
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  status: string;
}

// Backend returns OrderResponse-like objects for /api/admin/customers/{id}/orders
export interface AdminCustomerOrderResponse {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
}

export const customerApi = {
  // GET /api/admin/customers
  getAll: () => axiosClient.get<ApiResponse<AdminCustomer[]>>('/api/admin/customers'),

  // GET /api/admin/customers/{id}
  getById: (id: number) => axiosClient.get<ApiResponse<AdminCustomer>>(`/api/admin/customers/${id}`),

  // GET /api/admin/customers/{id}/orders
  getOrders: (id: number) =>
    axiosClient.get<ApiResponse<AdminCustomerOrderResponse[]>>(`/api/admin/customers/${id}/orders`),

  // POST /api/admin/customers
  create: (payload: CustomerCreateRequest) =>
    axiosClient.post<ApiResponse<AdminCustomer>>('/api/admin/customers', payload),

  // PUT /api/admin/customers/{id}
  update: (id: number, payload: CustomerUpdateRequest) =>
    axiosClient.put<ApiResponse<AdminCustomer>>(`/api/admin/customers/${id}`, payload),

  // DELETE /api/admin/customers/{id}
  delete: (id: number) => axiosClient.delete<ApiResponse<null>>(`/api/admin/customers/${id}`),

  // GET /api/admin/customers/search?q=...
  search: (params?: { q?: string; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<AdminCustomer[]>>('/api/admin/customers/search', { params }),
};
