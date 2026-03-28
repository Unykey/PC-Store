import axiosClient from "./axiosClient";

export interface RoleResponse {
  roleId: number;
  roleName: string;
}

export interface AccountResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: RoleResponse;
  orders: OrderResponse[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  password: string;
}

export interface UpdateAccountRequest {
  fullName?: string;
  email?: string;
  password?: string;
}

export const authApi = {
  login: (data: LoginRequest) => {
    return axiosClient.post<{ token: string }>("api/auth/login", data);
  },
  register: (data: RegisterRequest) => {
    return axiosClient.post<string>("api/auth/register", data);
  },

  // Account APIs
  getAllAccounts: () => {
    return axiosClient.get<AccountResponse[]>("api/accounts");
  },
  getAccountById: (id: number) => {
    return axiosClient.get<AccountResponse>(`api/accounts/${id}`);
  },
  updateAccount: (id: number, data: UpdateAccountRequest) => {
    return axiosClient.put<AccountResponse>(`api/accounts/${id}`, data);
  },
  deleteAccount: (id: number) => {
    return axiosClient.delete<void>(`api/accounts/${id}`);
  },
};