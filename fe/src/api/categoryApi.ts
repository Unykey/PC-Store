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

export const categoryApi = {
  getAll: () => axiosClient.get<ApiResponse<CategoryResponse[]>>('/api/categories'),
};


