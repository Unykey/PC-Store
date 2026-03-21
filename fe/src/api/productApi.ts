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

export interface ProductPageResponse {
  items: ProductResponse[];
  total: number;
}

// Admin endpoints
// Note: backend may return either ApiResponse<ProductResponse[]> or ApiResponse<ProductPageResponse>
export const getAll = () =>
  axiosClient.get<ApiResponse<ProductResponse[] | ProductPageResponse>>('/api/admin/products');
export const getById = (id: number) =>
  axiosClient.get<ApiResponse<ProductResponse>>(`/api/admin/products/${id}`);
export const create = (payload: Partial<ProductResponse>) =>
  axiosClient.post<ApiResponse<ProductResponse>>('/api/admin/products', payload);
export const update = (id: number, payload: Partial<ProductResponse>) =>
  axiosClient.put<ApiResponse<ProductResponse>>(`/api/admin/products/${id}`, payload);
export const deleteProduct = (id: number) =>
  axiosClient.delete<ApiResponse<null>>(`/api/admin/products/${id}`);

// Dashboard-specific endpoint: low-stock list
export const getLowStockList = () =>
  axiosClient.get<ApiResponse<ProductResponse[]>>('/api/admin/dashboard/low-stock-list');

// Public product APIs (default export)
export const publicProductApi = {
  // these public endpoints in backend may return bare objects/arrays (not wrapped in ApiResponse)
  getAllProducts: () => axiosClient.get('api/products'),
  getProductById: (id: number) => axiosClient.get(`api/products/${id}`),
  createProduct: (data: Partial<ProductResponse>) => axiosClient.post('api/products', data),
  updateProduct: (id: number, data: Partial<ProductResponse>) => axiosClient.put(`api/products/${id}`, data),
  deleteProduct: (id: number) => axiosClient.delete(`api/products/${id}`),
};

// Add named exports for admin helpers grouped under productApi
export const productApi = {
  getAll,
  getById,
  create,
  update,
  delete: deleteProduct,
  getLowStockList,
};

export default publicProductApi;
