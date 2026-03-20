import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi, type OrderResponse } from "@/api/orderApi";

const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-5xl px-4">
                <div className="mb-5 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-[#0066b3]">Đơn hàng của tôi</h1>
                    <Link to="/checkout" className="rounded-md bg-[#f37021] px-4 py-2 text-sm font-medium text-white hover:bg-[#d45f1a]">
                        Tạo đơn mới
                    </Link>
                </div>

                {loading && <div className="rounded-lg border bg-white p-4 text-sm">Đang tải...</div>}
                {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

                {!loading && !error && (
                    <div className="space-y-3">
                        {orders.length === 0 && (
                            <div className="rounded-lg border bg-white p-6 text-sm text-gray-600">Bạn chưa có đơn hàng nào.</div>
                        )}

                        {orders.map((order) => (
                            <Link
                                key={order.orderId}
                                to={`/orders/${order.orderId}`}
                                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#0066b3]/40 hover:shadow"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-800">Đơn #{order.orderId}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleString("vi-VN")}</p>
                                    </div>

                                    <div className="text-sm">
                                        <p>
                                            Trạng thái: <span className="font-semibold">{order.orderStatus}</span>
                                        </p>
                                        <p>
                                            Thanh toán: <span className="font-semibold">{order.paymentType === "INSTALLMENT" ? "Trả góp" : "Toàn bộ"}</span>
                                        </p>
                                    </div>

                                    <p className="text-lg font-bold text-[#f37021]">{formatVnd(order.totalAmount)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
