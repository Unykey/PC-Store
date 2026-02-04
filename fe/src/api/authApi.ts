import axiosClient from "./axiosClient";

export const authApi = {
    login: (data: any) => {
        return axiosClient.post('api/auth/login', data);
    },
    register: (data: any) => {
        return axiosClient.post('api/auth/register', data);
    }
};