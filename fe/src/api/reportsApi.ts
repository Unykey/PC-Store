import axiosClient from './axiosClient';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface MonthlySalesPoint {
  month: string;
  sales: number;
  orders: number;
}

export interface CategoryRevenuePoint {
  categoryId: number;
  name: string;
  revenue: number;
}

export interface CustomerInsights {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  avgCustomerValue: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  serialNumber?: string;
  totalQuantitySold: number;
  totalSalesAmount: number;
}

export const reportsApi = {
  salesOverview: (params?: { months?: number }) =>
    axiosClient.get<ApiResponse<MonthlySalesPoint[]>>('/api/admin/reports/sales-overview', { params }),

  categoryRevenue: (params?: { months?: number }) =>
    axiosClient.get<ApiResponse<CategoryRevenuePoint[]>>('/api/admin/reports/category-revenue', { params }),

  customerInsights: (params?: { months?: number }) =>
    axiosClient.get<ApiResponse<CustomerInsights>>('/api/admin/reports/customer-insights', { params }),

  topProducts: (params?: { limit?: number; sortBy?: 'quantity' | 'sales' }) =>
    axiosClient.get<ApiResponse<TopProduct[]>>('/api/admin/dashboard/top-products', { params }),
};

