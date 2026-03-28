import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi, type OrderResponse } from "@/api/orderApi";

interface PendingPaymentContext {
    orderId: number;
    method: "MOMO" | "CASH" | "MOMO_INSTALLMENT";
    installmentMonths?: number;
    installmentId?: number;
}

export default function PaymentResultPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("Đang kiểm tra trạng thái thanh toán...");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const checkStatus = async () => {
            const raw = localStorage.getItem("pendingPayment");
            if (!raw) {
                navigate("/order-fail?reason=missing_context");
                return;
            }

            let context: PendingPaymentContext;
            try {
                context = JSON.parse(raw) as PendingPaymentContext;
            } catch {
                navigate("/order-fail?reason=invalid_context");
                return;
            }

            try {
                // IPN can arrive a bit later than browser redirect, so retry briefly before declaring failure.
                let order: OrderResponse | null = null;
                let success = false;
                const maxAttempts = 6;

                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    const res = await orderApi.getOrderById(context.orderId);
                    order = res.data.data;

                    if (context.method === "MOMO" || context.method === "CASH") {
                        success = order.orderStatus !== "PENDING" && order.orderStatus !== "CANCELLED";
                    }

                    if (context.method === "MOMO_INSTALLMENT") {
                        const target = context.installmentId
                            ? (order.installments || []).find((x) => x.id === context.installmentId)
                            : (order.installments || []).find((x) => x.installmentStatus === "PAID");
                        success = !!target && target.installmentStatus === "PAID";
                    }

                    const currentProgress = (attempt / maxAttempts) * 100;
                    setProgress(currentProgress);

                    if (success || attempt === maxAttempts) {
                        break;
                    }

                    setMessage(`Dang xác nhẫn giao dịch với MoMo... (Lần ${attempt}/${maxAttempts})`);
                    await sleep(1200);
                }

                if (!order) {
                    throw new Error("Order not found");
                }

                localStorage.removeItem("pendingPayment");

                if (success) {
                    const methodText = context.method === "MOMO_INSTALLMENT"
                        ? `Tra gop MoMo - Ky han ${context.installmentMonths ?? "?"} thang`
                        : context.method === "MOMO"
                            ? "Vi MoMo"
                            : "Tien mat";

                    navigate(
                        `/order-success?orderId=${order.orderId}&method=${encodeURIComponent(methodText)}`
                    );
                    return;
                }

                navigate(`/order-fail?orderId=${context.orderId}`);
            } catch {
                setMessage("Không kiểm tra được trạng thái thanh toán. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-10 px-4">
            <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-blue-200 bg-white p-8 shadow-lg text-center">
                    {/* Loading Animation */}
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <span className="text-2xl font-bold text-blue-600">...</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-[#0066b3] mb-2">Đang xác nhận thanh toán</h1>
                    <p className="text-gray-600 mb-8 text-lg">{message}</p>

                    {/* Progress Bar */}
                    {loading && (
                        <div className="mb-6">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Vui lòng đừng đóng trang này...</p>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                        <p className="font-semibold mb-2">Thông tin:</p>
                        <ul className="space-y-1 text-left">
                            <li>Không tắt hoặc reload trang</li>
                            <li>Tiến trình có thể mất 15-30 giây</li>
                            <li>Bạn sẽ được chuyển hướng tự động</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
