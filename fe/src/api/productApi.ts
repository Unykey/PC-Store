import axiosClient from "./axiosClient";

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ProductSpecificationResponse {
  productSpecificationId: number;
  specKey: string;
  specValue: string;
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

  specifications?: ProductSpecificationResponse[];
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  serialNumber?: string;
  categoryId?: number;
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
export const create = (payload: ProductRequest) =>
  axiosClient.post<ApiResponse<ProductResponse>>('/api/admin/products', payload);
export const update = (id: number, payload: ProductRequest) =>
  axiosClient.put<ApiResponse<ProductResponse>>(`/api/admin/products/${id}`, payload);
export const deleteProduct = (id: number) =>
  axiosClient.delete<ApiResponse<null>>(`/api/admin/products/${id}`);

// PUBLIC API
export const publicProductApi = {
  getAllProducts: () =>
    axiosClient.get<ApiResponse<ProductResponse[]>>("api/products"),

  getProductsPaging: () =>
    axiosClient.get<ApiResponse<ProductResponse[]>>("api/products/paging"),

  getProductById: (id: number) =>
    axiosClient.get<ApiResponse<ProductResponse>>(`api/products/${id}`),

  createProduct: (data: Partial<ProductResponse>) =>
    axiosClient.post<ApiResponse<ProductResponse>>("api/products", data),

  updateProduct: (id: number, data: Partial<ProductResponse>) =>
    axiosClient.put<ApiResponse<ProductResponse>>(`api/products/${id}`, data),

  deleteProduct: (id: number) =>
    axiosClient.delete<ApiResponse<null>>(`api/products/${id}`),
};

export default publicProductApi;
