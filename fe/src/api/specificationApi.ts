import axiosClient from './axiosClient';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ProductSpecificationResponse {
  productSpecificationId: number;
  specKey: string;
  specValue: string;
  productId: number;
}

export interface ProductSpecificationRequest {
  specKey: string;
  specValue: string;
  productId: number;
}

export const specificationApi = {
  getAll: () =>
    axiosClient.get<ApiResponse<ProductSpecificationResponse[]>>(
      '/api/specifications'
    ),

  getById: (id: number) =>
    axiosClient.get<ApiResponse<ProductSpecificationResponse>>(
      `/api/specifications/${id}`
    ),

  getByProductId: (productId: number) =>
    axiosClient.get<ApiResponse<ProductSpecificationResponse[]>>(
      `/api/specifications/product/${productId}`
    ),

  create: (productId: number, data: ProductSpecificationRequest) =>
    axiosClient.post<ApiResponse<ProductSpecificationResponse>>(
      `/api/specifications/product/${productId}`,
      data
    ),

  update: (id: number, data: ProductSpecificationRequest) =>
    axiosClient.put<ApiResponse<ProductSpecificationResponse>>(
      `/api/specifications/${id}`,
      data
    ),

  delete: (id: number) =>
    axiosClient.delete<ApiResponse<void>>(
      `/api/specifications/${id}`
    ),
};