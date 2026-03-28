import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { installmentApi, orderApi, paymentApi, type InstallmentResponse, type OrderResponse } from "@/api/orderApi";

const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export default function MyInstallmentsPage() {
    const [rows, setRows] = useState<InstallmentResponse[]>([]);
    const [ordersMap, setOrdersMap] = useState<Record<number, OrderResponse>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [workingId, setWorkingId] = useState<number | null>(null);
    const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);

    const fetchRows = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await installmentApi.getMyInstallments();
            const data = res.data.data || [];
            const sorted = data.sort((a, b) => a.orderId - b.orderId || a.monthNumber - b.monthNumber);
            setRows(sorted);

            const orderIds = Array.from(new Set(sorted.map((x) => x.orderId)));
            const responses = await Promise.all(orderIds.map((oid) => orderApi.getOrderById(oid)));
            const nextMap: Record<number, OrderResponse> = {};
            responses.forEach((r) => {
                nextMap[r.data.data.orderId] = r.data.data;
            });
            setOrdersMap(nextMap);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể tải danh sách trả góp.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRows();
    }, []);

    const summary = useMemo(() => {
        const total = rows.length;
        const paid = rows.filter((r) => r.installmentStatus === "PAID").length;
        const overdue = rows.filter((r) => r.installmentStatus === "OVERDUE").length;
        return { total, paid, overdue };
    }, [rows]);

    const payInstallment = async (id: number) => {
        try {
            const target = rows.find((r) => r.id === id);
            if (!target) return;

            setWorkingId(id);
            const res = await paymentApi.createMomoPayment({
                orderId: target.orderId,
                installmentId: target.id,
                orderInfo: `Thanh toan tra gop don #${target.orderId}`,
            });
            const payUrl = res.data.data?.payUrl;
            if (!payUrl) throw new Error("Không nhận được payUrl từ MoMo");
            localStorage.setItem(
                "pendingPayment",
                JSON.stringify({
                    orderId: target.orderId,
                    method: "MOMO_INSTALLMENT",
                    installmentMonths: target.totalMonths,
                    installmentId: target.id,
                })
            );
            window.location.href = payUrl;
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể thanh toán kỳ trả góp này.");
            setWorkingId(null);
        }
    };

    const cancelInstallmentContract = async (orderId: number) => {
        const contractRows = rows.filter((x) => x.orderId === orderId);
        const hasPaid = contractRows.some((x) => x.installmentStatus === "PAID");
        const message = hasPaid
            ? "Bạn xác nhận dừng hợp đồng trả góp? Đơn hàng sẽ chuyển sang trạng thái mất khả năng thanh toán."
            : "Bạn chắc chắn muốn hủy đơn trả góp này?";

        const accepted = window.confirm(message);
        if (!accepted) return;

        try {
            setError("");
            setCancelingOrderId(orderId);
            await orderApi.cancelInstallment(orderId);
            await fetchRows();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể hủy đơn trả góp.");
        } finally {
            setCancelingOrderId(null);
        }
    };

    const contracts = useMemo(() => {
        const grouped = new Map<number, InstallmentResponse[]>();
        rows.forEach((row) => {
            const list = grouped.get(row.orderId) || [];
            list.push(row);
            grouped.set(row.orderId, list);
        });

        return Array.from(grouped.entries()).map(([orderId, installments]) => {
            const sorted = installments.sort((a, b) => a.monthNumber - b.monthNumber);
            const paidCount = sorted.filter((x) => x.installmentStatus === "PAID").length;
            const totalMonths = sorted[0]?.totalMonths || sorted.length;
            const currentInstallment = sorted.find((x) => x.installmentStatus !== "PAID");
            const order = ordersMap[orderId];

            const firstProductName = order?.orderDetails?.[0]?.productName || "Sản phẩm trong đơn";
            const totalAmount = order?.totalAmount || sorted.reduce((acc, x) => acc + (x.amount || 0), 0);
            const progressPct = totalMonths > 0 ? Math.round((paidCount / totalMonths) * 100) : 0;
            const canCancel = !!order
                && order.orderStatus !== "CANCELLED"
                && order.orderStatus !== "COMPLETED"
                && order.orderStatus !== "DEFAULTED";

            return {
                orderId,
                firstProductName,
                totalAmount,
                paidCount,
                totalMonths,
                progressPct,
                currentInstallment,
                canCancel,
            };
        });
    }, [rows, ordersMap]);

    const formatCurrentMonthText = (dueDate?: string) => {
        if (!dueDate) return "-";
        const d = new Date(dueDate);
        if (Number.isNaN(d.getTime())) return dueDate;
        return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <h1 className="text-4xl font-bold text-[#0066b3]">
                            Lịch trả góp của tôi
                        </h1>
                        <div className="hidden md:flex gap-2">
                            <Link to="/orders" className="rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition">Đơn hàng</Link>
                            <Link to="/checkout" className="rounded-md bg-[#f37021] px-4 py-2 text-sm font-medium text-white hover:bg-[#d45f1a] transition shadow-md">Tạo đơn mới</Link>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm">Quản lý các khoản trả góp của bạn một cách dễ dàng</p>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest">Tổng kỳ trả góp</p>
                                <p className="text-3xl font-bold text-[#0066b3] mt-1">{summary.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-300 p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-green-700 uppercase tracking-widest">Đã thanh toán</p>
                                <p className="text-3xl font-bold text-green-700 mt-1">{summary.paid}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-300 p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-red-700 uppercase tracking-widest">Quá hạn</p>
                                <p className="text-3xl font-bold text-red-700 mt-1">{summary.overdue}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && <div className="rounded-lg border bg-white p-4 text-center text-sm text-gray-500">Dang tải...</div>}
                {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-start gap-3">
                    <span>{error}</span>
                </div>}

                {!loading && !error && (
                    <div className="space-y-4">
                        {contracts.map((contract) => (
                            <div key={contract.orderId} className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Mã hợp đồng</p>
                                            <Link to={`/orders/${contract.orderId}`} className="font-bold text-[#0066b3] hover:underline text-lg">
                                                #{contract.orderId}
                                            </Link>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Tổng giá trị</p>
                                            <p className="font-bold text-[#f37021] text-lg">{formatVnd(contract.totalAmount)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4">
                                    {/* Product Name */}
                                    <div className="mb-4 pb-4 border-b border-gray-200">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Sản phẩm</p>
                                        <p className="font-medium text-gray-800 text-lg">{contract.firstProductName}</p>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-700">Tiến độ trả góp</span>
                                            </div>
                                            <span className="text-sm font-bold rounded-full px-3 py-1 bg-blue-100 text-[#0066b3]">
                                                {contract.paidCount}/{contract.totalMonths} tháng ({contract.progressPct}%)
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 ring-1 ring-gray-300">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                                style={{ width: `${contract.progressPct}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Current Payment Info */}
                                    <div className="grid gap-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 p-4 border border-orange-200">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-orange-700 uppercase tracking-widest mb-1">Kỳ cần thanh toán</p>
                                                <p className="text-lg font-bold text-orange-800">{formatCurrentMonthText(contract.currentInstallment?.dueDate)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-orange-700 uppercase tracking-widest mb-1">Số tiền cần đóng</p>
                                                <p className="text-lg font-bold text-[#f37021]">{contract.currentInstallment ? formatVnd(contract.currentInstallment.amount) : "0đ"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {contract.currentInstallment ? (
                                                <div className="grid gap-2 md:grid-cols-2">
                                                    <button
                                                        disabled={workingId === contract.currentInstallment.id || cancelingOrderId === contract.orderId}
                                                        onClick={() => payInstallment(contract.currentInstallment!.id)}
                                                        className="rounded-lg bg-[#f37021] px-4 py-2.5 font-semibold text-white hover:bg-[#d45f1a] disabled:opacity-60 disabled:cursor-not-allowed transition shadow-md"
                                                    >
                                                        {workingId === contract.currentInstallment.id ? "Đang chuyển hướng..." : "Thanh toán tháng này"}
                                                    </button>

                                                    {contract.canCancel && (
                                                        <button
                                                            disabled={cancelingOrderId === contract.orderId || workingId === contract.currentInstallment.id}
                                                            onClick={() => cancelInstallmentContract(contract.orderId)}
                                                            className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                                                        >
                                                            {cancelingOrderId === contract.orderId ? "Đang xử lý..." : contract.paidCount > 0 ? "Dừng hợp đồng trả góp" : "Hủy đơn trả góp"}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="rounded-lg bg-green-100 border border-green-300 p-3 text-center">
                                                    <span className="text-green-700 font-semibold">Đã hoàn tất hợp đồng</span>
                                                </div>
                                            )}
                                        </div>

                                        {ordersMap[contract.orderId]?.orderStatus === "DEFAULTED" && (
                                            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                                                Hợp đồng đã chuyển sang trạng thái mất khả năng thanh toán. Vui lòng liên hệ hỗ trợ để xử lý công nợ.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {contracts.length === 0 && (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                <p className="text-gray-600 font-medium mb-4">Bạn chưa có lịch trả góp nào</p>
                                <Link to="/checkout" className="inline-block rounded-lg bg-[#f37021] px-6 py-2.5 font-semibold text-white hover:bg-[#d45f1a] transition">
                                    Tạo đơn hàng ngay
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
