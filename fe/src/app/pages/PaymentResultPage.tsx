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

                    if (success || attempt === maxAttempts) {
                        break;
                    }

                    setMessage("Đang xác nhận giao dịch với MoMo, vui lòng chờ...");
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
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="mx-auto max-w-2xl rounded-lg border bg-white p-6 text-center shadow-sm">
                <h1 className="text-2xl font-semibold text-[#0066b3]">Kết quả thanh toán</h1>
                <p className="mt-3 text-sm text-gray-600">{message}</p>
                {loading && <div className="mt-4 text-xs text-gray-500">Vui lòng chờ...</div>}
            </div>
        </div>
    );
}
