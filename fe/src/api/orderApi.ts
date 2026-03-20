import axiosClient from "./axiosClient";

export type PaymentType = "FULL_PAYMENT" | "INSTALLMENT";

export type InstallmentProvider =
    | "HOME_CREDIT"
    | "FE_CREDIT"
    | "MCREDIT"
    | "HD_SAISON"
    | "CREDIT_CARD";

export type InstallmentStatus = "PENDING" | "PAID" | "OVERDUE";

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderCreateRequest {
    accountId: number;
    shippingAddress?: string;
    note?: string;
    items: OrderItemRequest[];
    paymentType: PaymentType;
    installmentMonths?: 3 | 6 | 12 | 24;
    installmentProvider?: InstallmentProvider;
}

export interface InstallmentResponse {
    id: number;
    orderId: number;
    provider: InstallmentProvider;
    totalMonths: number;
    monthNumber: number;
    amount: number;
    dueDate: string;
    paidDate: string | null;
    installmentStatus: InstallmentStatus;
}

export interface OrderDetailItemResponse {
    productId: number;
    productName: string;
    productImage?: string;
    quantity: number;
    price: number;
}

export interface OrderResponse {
    orderId: number;
    orderDate: string;
    orderStatus: OrderStatus;
    totalAmount: number;
    accountId: number;
    accountName: string;
    orderDetails: OrderDetailItemResponse[];
    paymentType: PaymentType;
    installmentMonths?: number;
    installmentProvider?: InstallmentProvider;
    monthlyAmount?: number;
    installments?: InstallmentResponse[];
}

export const orderApi = {
    createOrder: (payload: OrderCreateRequest) =>
        axiosClient.post<ApiResponse<OrderResponse>>("/api/orders", payload),

    getMyOrders: () => axiosClient.get<ApiResponse<OrderResponse[]>>("/api/orders/my-orders"),

    getOrderById: (orderId: number) =>
        axiosClient.get<ApiResponse<OrderResponse>>(`/api/orders/${orderId}`),
};

export const installmentApi = {
    getMyInstallments: () =>
        axiosClient.get<ApiResponse<InstallmentResponse[]>>("/api/installments/my"),

    getByOrderId: (orderId: number) =>
        axiosClient.get<ApiResponse<InstallmentResponse[]>>(`/api/installments/order/${orderId}`),

    payInstallment: (id: number) =>
        axiosClient.put<ApiResponse<InstallmentResponse>>(`/api/installments/${id}/pay`),
};
