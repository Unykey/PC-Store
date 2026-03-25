import axiosClient from './axiosClient';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface CategoryResponse {
  categoryId: number;
  name: string;
  description?: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

export const categoryApi = {
  getAll: () =>
    axiosClient.get<ApiResponse<CategoryResponse[]>>('/api/categories'),

  getById: (categoryId: number) =>
    axiosClient.get<ApiResponse<CategoryResponse>>(
      `/api/categories/${categoryId}`
    ),

  getByName: (name: string) =>
    axiosClient.get<ApiResponse<CategoryResponse>>(
      `/api/categories/name/${name}`
    ),

  getByIds: (ids: number[]) =>
    axiosClient.get<ApiResponse<CategoryResponse[]>>(
      `/api/categories/bulk/ids`,
      { params: { ids } }
    ),

  searchByNames: (names: string) =>
    axiosClient.get<ApiResponse<CategoryResponse[]>>(
      `/api/categories/search`,
      { params: { names } }
    ),

  create: (data: CategoryRequest) =>
    axiosClient.post<ApiResponse<CategoryResponse>>(
      `/api/categories`,
      data
    ),

  update: (categoryId: number, data: CategoryRequest) =>
    axiosClient.put<ApiResponse<CategoryResponse>>(
      `/api/categories/${categoryId}`,
      data
    ),

  delete: (categoryId: number) =>
    axiosClient.delete<ApiResponse<void>>(
      `/api/categories/${categoryId}`
    ),
};