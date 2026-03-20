import axiosClient from './axiosClient';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ProductResponse {
  productId: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  serialNumber?: string;
  categoryId?: number;
  categoryName?: string;
}

// Admin endpoints
export const getAll = () => axiosClient.get<ApiResponse<ProductResponse[]>>('/api/admin/products');
export const getById = (id: number) => axiosClient.get<ApiResponse<ProductResponse>>(`/api/admin/products/${id}`);
export const create = (payload: Partial<ProductResponse>) => axiosClient.post<ApiResponse<ProductResponse>>('/api/admin/products', payload);
export const update = (id: number, payload: Partial<ProductResponse>) => axiosClient.put<ApiResponse<ProductResponse>>(`/api/admin/products/${id}`, payload);
export const deleteProduct = (id: number) => axiosClient.delete<ApiResponse<null>>(`/api/admin/products/${id}`);

const productApi = { getAll, getById, create, update, delete: deleteProduct };
export default productApi;
