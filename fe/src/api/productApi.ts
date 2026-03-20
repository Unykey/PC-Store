import axiosClient from "./axiosClient";

export const productApi = {
  getAllProducts: () => {
    return axiosClient.get("api/products");
  },

  getProductById: (id: number) => {
    return axiosClient.get(`api/products/${id}`);
  },

  createProduct: (data: any) => {
    return axiosClient.post("api/products", data);
  },

  updateProduct: (id: number, data: any) => {
    return axiosClient.put(`api/products/${id}`, data);
  },

  deleteProduct: (id: number) => {
    return axiosClient.delete(`api/products/${id}`);
  },
};
