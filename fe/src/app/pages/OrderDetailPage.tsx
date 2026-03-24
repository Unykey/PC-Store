import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { installmentApi, orderApi, paymentApi, type InstallmentResponse, type OrderResponse } from "@/api/orderApi";

const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const statusClass = (status: InstallmentResponse["installmentStatus"]) => {
    if (status === "PAID") return "bg-green-100 text-green-700 border-green-200";
    if (status === "OVERDUE") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const orderId = Number(id);

    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [installments, setInstallments] = useState<InstallmentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [working, setWorking] = useState(false);

    const fetchOrder = async () => {
        if (!Number.isFinite(orderId) || orderId <= 0) return;
        setLoading(true);
        setError("");

        try {
            const [orderRes, installmentRes] = await Promise.all([
                orderApi.getOrderById(orderId),
                installmentApi.getByOrderId(orderId),
            ]);

            setOrder(orderRes.data.data);
            setInstallments((installmentRes.data.data || []).sort((a, b) => a.monthNumber - b.monthNumber));
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể tải chi tiết đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const payInstallment = async (installmentId: number) => {
        try {
            setWorking(true);
            const res = await paymentApi.createMomoPayment({
                orderId,
                installmentId,
                orderInfo: `Thanh toan tra gop don #${orderId}`,
            });
            const payUrl = res.data.data?.payUrl;
            if (!payUrl) throw new Error("Không nhận được payUrl từ MoMo");
            localStorage.setItem(
                "pendingPayment",
                JSON.stringify({
                    orderId,
                    method: "MOMO_INSTALLMENT",
                    installmentMonths: order?.installmentMonths,
                    installmentId,
                })
            );
            window.location.href = payUrl;
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể thanh toán kỳ trả góp này.");
            setWorking(false);
        }
    };

    const payFullByMomo = async () => {
        if (!order) return;
        try {
            setWorking(true);
            const res = await paymentApi.createMomoPayment({
                orderId: order.orderId,
                orderInfo: `Thanh toan don #${order.orderId}`,
            });
            const payUrl = res.data.data?.payUrl;
            if (!payUrl) throw new Error("Không nhận được payUrl từ MoMo");
            localStorage.setItem(
                "pendingPayment",
                JSON.stringify({
                    orderId: order.orderId,
                    method: "MOMO",
                })
            );
            window.location.href = payUrl;
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể tạo thanh toán MoMo.");
            setWorking(false);
        }
    };

    const payFullByCash = async () => {
        if (!order) return;
        try {
            setWorking(true);
            await paymentApi.payWithCash({
                orderId: order.orderId,
                note: "Paid by cash at counter (demo)",
            });
            await fetchOrder();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể xác nhận thanh toán tiền mặt.");
        } finally {
            setWorking(false);
        }
    };

    const confirmReceived = async () => {
        if (!order) return;
        try {
            setWorking(true);
            await orderApi.confirmReceived(order.orderId);
            await fetchOrder();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể xác nhận đã nhận hàng.");
        } finally {
            setWorking(false);
        }
    };

    const isInstallmentFullyPaid = useMemo(() => {
        if (!order || order.paymentType !== "INSTALLMENT") return false;
        const source = installments.length > 0 ? installments : (order.installments || []);
        return source.length > 0 && source.every((ins) => ins.installmentStatus === "PAID");
    }, [order, installments]);

    const canShowConfirmReceived = useMemo(() => {
        if (!order) return false;
        if (order.orderStatus !== "DELIVERED") return false;
        if (order.paymentType === "INSTALLMENT") return isInstallmentFullyPaid;
        return true;
    }, [order, isInstallmentFullyPaid]);

    const canCancelInstallment = useMemo(() => {
        if (!order || order.paymentType !== "INSTALLMENT") return false;
        if (order.orderStatus === "CANCELLED" || order.orderStatus === "COMPLETED" || order.orderStatus === "DEFAULTED") {
            return false;
        }
        return true;
    }, [order, installments]);

    const hasPaidInstallment = useMemo(() => {
        return installments.some((ins) => ins.installmentStatus === "PAID");
    }, [installments]);

    const cancelInstallmentOrder = async () => {
        if (!order || !canCancelInstallment || working) return;

        const confirmMessage = hasPaidInstallment
            ? "Bạn xác nhận dừng hợp đồng trả góp? Hệ thống sẽ chuyển đơn sang trạng thái mất khả năng thanh toán."
            : "Bạn chắc chắn muốn hủy đơn trả góp này?";

        const accepted = window.confirm(confirmMessage);
        if (!accepted) return;

        try {
            setWorking(true);
            setError("");
            await orderApi.cancelInstallment(order.orderId);
            await fetchOrder();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể hủy đơn trả góp.");
        } finally {
            setWorking(false);
        }
    };

    const displayMonthly = useMemo(() => {
        if (!order) return 0;
        if (order.monthlyAmount) return order.monthlyAmount;
        if (order.paymentType !== "INSTALLMENT" || !order.installmentMonths) return 0;
        return Math.ceil(order.totalAmount / order.installmentMonths);
    }, [order]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-5xl px-4">
                <div className="mb-5 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-[#0066b3]">Chi tiết đơn hàng</h1>
                    <div className="flex gap-2">
                        <Link to="/orders" className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100">
                            Về danh sách đơn
                        </Link>
                        <Link to="/my-installments" className="rounded-md bg-[#0066b3] px-3 py-2 text-sm text-white hover:bg-[#005091]">
                            Trả góp của tôi
                        </Link>
                    </div>
                </div>

                {loading && <div className="rounded-lg border bg-white p-4 text-sm">Đang tải...</div>}
                {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

                {!loading && order && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div>
                                    <p className="text-xs text-gray-500">Mã đơn</p>
                                    <p className="font-semibold">#{order.orderId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Trạng thái</p>
                                    <p className="font-semibold">{order.orderStatus}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Thanh toán</p>
                                    <p className="font-semibold">{order.paymentType === "INSTALLMENT" ? "Trả góp" : "Toàn bộ"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tổng tiền</p>
                                    <p className="text-lg font-bold text-[#f37021]">{formatVnd(order.totalAmount)}</p>
                                </div>
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <div>
                                    <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                                    <p className="font-medium">{order.shippingAddress || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Ghi chú</p>
                                    <p className="font-medium">{order.note || "-"}</p>
                                </div>
                            </div>

                            {order.paymentType === "FULL_PAYMENT" && order.orderStatus === "PENDING" && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        disabled={working}
                                        onClick={payFullByMomo}
                                        className="rounded-md bg-[#0066b3] px-3 py-2 text-sm text-white hover:bg-[#005091] disabled:opacity-60"
                                    >
                                        Thanh toán MoMo
                                    </button>
                                    <button
                                        disabled={working}
                                        onClick={payFullByCash}
                                        className="rounded-md bg-[#f37021] px-3 py-2 text-sm text-white hover:bg-[#d45f1a] disabled:opacity-60"
                                    >
                                        Trả tiền mặt (Demo)
                                    </button>
                                </div>
                            )}

                            {canShowConfirmReceived && (
                                <div className="mt-4">
                                    <button
                                        disabled={working}
                                        onClick={confirmReceived}
                                        className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                                    >
                                        Xác nhận đã nhận hàng
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-2 font-semibold text-gray-800">Sản phẩm</h2>
                            <div className="space-y-2 text-sm">
                                {order.orderDetails?.map((item) => (
                                    <div key={`${item.productId}-${item.productName}`} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                                        <span>
                                            {item.productName} (x{item.quantity})
                                        </span>
                                        <span className="font-medium">{formatVnd(item.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {order.paymentType === "INSTALLMENT" && (
                            <div className="rounded-lg border border-[#0066b3]/20 bg-white p-4 shadow-sm">
                                <h2 className="mb-3 font-semibold text-[#0066b3]">Thông tin trả góp</h2>
                                <div className="mb-4 grid gap-3 md:grid-cols-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Đơn vị</p>
                                        <p className="font-semibold">{order.installmentProvider}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Số tháng</p>
                                        <p className="font-semibold">{order.installmentMonths}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Mỗi tháng</p>
                                        <p className="font-semibold text-[#f37021]">{formatVnd(displayMonthly)}</p>
                                    </div>
                                </div>

                                <div className="mb-4 flex flex-wrap gap-2">
                                    {canCancelInstallment ? (
                                        <button
                                            disabled={working}
                                            onClick={cancelInstallmentOrder}
                                            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-60"
                                        >
                                            {hasPaidInstallment ? "Dừng hợp đồng trả góp" : "Hủy đơn trả góp"}
                                        </button>
                                    ) : (
                                        <p className="text-xs text-gray-500">
                                            Hợp đồng không thể dừng ở trạng thái hiện tại.
                                        </p>
                                    )}
                                </div>

                                {order.orderStatus === "DEFAULTED" && (
                                    <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                                        Hợp đồng đang ở trạng thái mất khả năng thanh toán. Vui lòng liên hệ bộ phận hỗ trợ để xử lý công nợ.
                                    </div>
                                )}

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[680px] border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="px-3 py-2 text-left">Kỳ</th>
                                                <th className="px-3 py-2 text-left">Đến hạn</th>
                                                <th className="px-3 py-2 text-left">Số tiền</th>
                                                <th className="px-3 py-2 text-left">Gốc</th>
                                                <th className="px-3 py-2 text-left">Lãi</th>
                                                <th className="px-3 py-2 text-left">Phí trễ hạn</th>
                                                <th className="px-3 py-2 text-left">Đã trả</th>
                                                <th className="px-3 py-2 text-left">Trạng thái</th>
                                                <th className="px-3 py-2 text-left">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {installments.map((ins) => (
                                                <tr key={ins.id} className="border-b">
                                                    <td className="px-3 py-2">Tháng {ins.monthNumber}/{ins.totalMonths}</td>
                                                    <td className="px-3 py-2">{ins.dueDate}</td>
                                                    <td className="px-3 py-2">{formatVnd(ins.amount)}</td>
                                                    <td className="px-3 py-2">{formatVnd(ins.principalAmount || 0)}</td>
                                                    <td className="px-3 py-2">{formatVnd(ins.interestAmount || 0)}</td>
                                                    <td className="px-3 py-2">{formatVnd(ins.overdueFee || 0)}</td>
                                                    <td className="px-3 py-2">{ins.paidDate || "-"}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(ins.installmentStatus)}`}>
                                                            {ins.installmentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {(ins.installmentStatus === "PENDING" || ins.installmentStatus === "OVERDUE") ? (
                                                            <button
                                                                disabled={working || order.orderStatus === "DEFAULTED"}
                                                                onClick={() => payInstallment(ins.id)}
                                                                className="rounded-md bg-[#f37021] px-3 py-1.5 text-xs text-white hover:bg-[#d45f1a] disabled:opacity-60"
                                                            >
                                                                Thanh toán MoMo
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">Đã hoàn tất</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
