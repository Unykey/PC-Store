import axiosClient from "./axiosClient";

export const authApi = {
  login: (data: any) => {
    return axiosClient.post("api/auth/login", data);
  },
  register: (data: any) => {
    return axiosClient.post("api/auth/register", data);
  },
  // Account APIs
  getAllAccounts: () => {
    return axiosClient.get("api/accounts");
  },
  getAccountById: (id: number) => {
    return axiosClient.get(`api/accounts/${id}`);
  },
  updateAccount: (id: number, data: any) => {
    return axiosClient.put(`api/accounts/${id}`, data);
  },
  deleteAccount: (id: number) => {
    return axiosClient.delete(`api/accounts/${id}`);
  },
};
