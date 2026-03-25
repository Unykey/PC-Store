import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi, type OrderResponse } from "@/api/orderApi";

const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const getStatusBadgeColor = (status: string) => {
    switch (status) {
        case "PENDING":
            return "bg-yellow-100 text-yellow-700";
        case "CONFIRMED":
            return "bg-blue-100 text-blue-700";
        case "SHIPPING":
            return "bg-purple-100 text-purple-700";
        case "DELIVERED":
            return "bg-green-100 text-green-700";
        case "DEFAULTED":
            return "bg-rose-100 text-rose-700";
        case "CANCELLED":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        PENDING: "Chờ xác nhận",
        CONFIRMED: "Đã xác nhận",
        SHIPPING: "Đang giao",
        DELIVERED: "Đã giao",
        DEFAULTED: "Mất khả năng thanh toán",
        CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await orderApi.getMyOrders();
                setOrders(res.data.data || []);
            } catch (e: any) {
                setError(e?.response?.data?.message || "Không thể tải danh sách đơn hàng.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
            <div className="mx-auto max-w-5xl px-4">
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-4xl font-bold text-[#0066b3]">Đơn hàng của tôi</h1>
                        <Link to="/checkout" className="rounded-lg bg-[#f37021] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d45f1a] transition shadow-md">
                            Tạo đơn mới
                        </Link>
                    </div>
                </div>

                {loading && <div className="rounded-lg border bg-white p-6 text-center text-gray-500">Đang tải...</div>}
                {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">Lỗi: {error}</div>}

                {!loading && !error && (
                    <div className="space-y-4">
                        {orders.length === 0 && (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                <p className="text-gray-600 font-medium mb-4">Bạn chưa có đơn hàng nào</p>
                                <Link to="/checkout" className="inline-block rounded-lg bg-[#f37021] px-6 py-2.5 font-semibold text-white hover:bg-[#d45f1a] transition">
                                    Mua sắm ngay
                                </Link>
                            </div>
                        )}

                        {orders.map((order) => {
                            const firstProduct = order.orderDetails?.[0]?.productName || "Sản phẩm";
                            const itemCount = order.orderDetails?.length || 0;
                            const statusLabel = getStatusLabel(order.orderStatus);
                            const statusColorClass = getStatusBadgeColor(order.orderStatus);

                            return (
                                <Link
                                    key={order.orderId}
                                    to={`/orders/${order.orderId}`}
                                    className="block rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition hover:border-[#0066b3]/50 overflow-hidden"
                                >
                                    <div className="p-5">
                                        {/* Header Row */}
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Mã đơn hàng</p>
                                                <p className="text-lg font-bold text-[#0066b3]">#{order.orderId}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Ngày đặt</p>
                                                <p className="text-sm font-medium text-gray-700">{new Date(order.orderDate).toLocaleDateString("vi-VN")}</p>
                                            </div>
                                            <div className="flex-1 text-right">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Tổng tiền</p>
                                                <p className="text-xl font-bold text-[#f37021]">{formatVnd(order.totalAmount)}</p>
                                            </div>
                                        </div>

                                        {/* Product Info Row */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Sản phẩm</p>
                                                <p className="text-sm font-medium text-gray-800 truncate">{firstProduct}</p>
                                                {itemCount > 1 && (
                                                    <p className="text-xs text-gray-600 mt-1">+ {itemCount - 1} sản phẩm khác</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Trạng thái</p>
                                                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColorClass}`}>
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Thanh toán</p>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {order.paymentType === "INSTALLMENT" ? "Trả góp" : "Toàn bộ"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
