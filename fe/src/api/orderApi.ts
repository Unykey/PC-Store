import axiosClient from "./axiosClient";

export type PaymentType = "FULL_PAYMENT" | "INSTALLMENT";

export type InstallmentProvider = "MOMO";

export type InstallmentStatus = "PENDING" | "PAID" | "OVERDUE";

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "COMPLETED" | "CANCELLED";

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    items: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderCreateRequest {
    accountId?: number;
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
    principalAmount: number;
    interestAmount: number;
    overdueFee: number;
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

export interface ProductResponse {
    productId: number;
    name: string;
    description?: string;
    price: number;
    stockQuantity?: number;
    serialNumber?: string;
    categoryId?: number;
    categoryName?: string;
}

export interface OrderResponse {
    orderId: number;
    orderDate: string;
    orderStatus: OrderStatus;
    totalAmount: number;
    accountId: number;
    accountName: string;
    accountEmail?: string;
    accountPhoneNumber?: string;
    shippingAddress?: string;
    note?: string;
    orderDetails: OrderDetailItemResponse[];
    paymentType: PaymentType;
    installmentMonths?: number;
    installmentProvider?: InstallmentProvider;
    monthlyAmount?: number;
    installments?: InstallmentResponse[];
}

export interface MomoCreatePaymentRequest {
    orderId: number;
    installmentId?: number;
    orderInfo?: string;
}

export interface MomoCreatePaymentResponse {
    requestId: string;
    orderCode: string;
    payUrl: string;
    deeplink?: string;
    qrCodeUrl?: string;
}

export interface CashPaymentRequest {
    orderId: number;
    note?: string;
}

export interface CashPaymentResponse {
    requestId: string;
    orderCode: string;
    status: string;
    message: string;
}

export const orderApi = {
    createOrder: (payload: OrderCreateRequest) =>
        axiosClient.post<ApiResponse<OrderResponse>>("/api/orders", payload),

    getMyOrders: () => axiosClient.get<ApiResponse<OrderResponse[]>>("/api/orders/my-orders"),

    getOrderById: (orderId: number) =>
        axiosClient.get<ApiResponse<OrderResponse>>(`/api/orders/${orderId}`),

    confirmReceived: (orderId: number) =>
        axiosClient.put<ApiResponse<OrderResponse>>(`/api/orders/${orderId}/confirm-received`),

    // Admin
    adminList: (params?: { q?: string; status?: OrderStatus; page?: number; size?: number }) =>
        axiosClient.get<ApiResponse<PageResponse<OrderResponse>>>("/api/admin/orders", { params }),

    adminStats: () =>
        axiosClient.get<ApiResponse<{ total: number; byStatus: Partial<Record<OrderStatus, number>> }>>(
            "/api/admin/orders/stats"
        ),

    adminGetById: (orderId: number) =>
        axiosClient.get<ApiResponse<OrderResponse>>(`/api/admin/orders/${orderId}`),

    adminUpdateStatus: (orderId: number, status: OrderStatus) =>
        axiosClient.put<ApiResponse<OrderResponse>>(`/api/admin/orders/${orderId}/status`, null, { params: { status } }),

    adminCancel: (orderId: number) =>
        axiosClient.put<ApiResponse<OrderResponse>>(`/api/admin/orders/${orderId}/cancel`),
};

export const installmentApi = {
    getMyInstallments: () =>
        axiosClient.get<ApiResponse<InstallmentResponse[]>>("/api/installments/my"),

    getByOrderId: (orderId: number) =>
        axiosClient.get<ApiResponse<InstallmentResponse[]>>(`/api/installments/order/${orderId}`),

    payInstallment: (id: number) =>
        axiosClient.put<ApiResponse<InstallmentResponse>>(`/api/installments/${id}/pay`),
};

export const paymentApi = {
    createMomoPayment: (payload: MomoCreatePaymentRequest) =>
        axiosClient.post<ApiResponse<MomoCreatePaymentResponse>>("/api/payments/momo/create", payload),

    payWithCash: (payload: CashPaymentRequest) =>
        axiosClient.post<ApiResponse<CashPaymentResponse>>("/api/payments/cash/pay", payload),
};

export const productApi = {
    getProductById: (productId: number) =>
        axiosClient.get<ProductResponse>(`/api/products/${productId}`),
};
