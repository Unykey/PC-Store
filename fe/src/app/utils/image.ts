import axiosClient from "@/api/axiosClient";

export const getImageUrl = (path?: string) =>
  path ? `${axiosClient.defaults.baseURL}${path}` : "";