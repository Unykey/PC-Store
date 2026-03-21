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

            return {
                orderId,
                firstProductName,
                totalAmount,
                paidCount,
                totalMonths,
                progressPct,
                currentInstallment,
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h1 className="text-3xl font-bold text-[#0066b3]">Lịch trả góp của tôi</h1>
                    <div className="flex gap-2">
                        <Link to="/orders" className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100">Đơn hàng</Link>
                        <Link to="/checkout" className="rounded-md bg-[#f37021] px-3 py-2 text-sm text-white hover:bg-[#d45f1a]">Tạo đơn mới</Link>
                    </div>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border bg-white p-3 text-sm">Tổng kỳ: <span className="font-semibold">{summary.total}</span></div>
                    <div className="rounded-lg border bg-white p-3 text-sm">Đã thanh toán: <span className="font-semibold text-green-700">{summary.paid}</span></div>
                    <div className="rounded-lg border bg-white p-3 text-sm">Quá hạn: <span className="font-semibold text-red-700">{summary.overdue}</span></div>
                </div>

                {loading && <div className="rounded-lg border bg-white p-4 text-sm">Đang tải...</div>}
                {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

                {!loading && !error && (
                    <div className="space-y-4">
                        {contracts.map((contract) => (
                            <div key={contract.orderId} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Mã đơn</p>
                                        <Link to={`/orders/${contract.orderId}`} className="font-semibold text-[#0066b3] hover:underline">
                                            #{contract.orderId}
                                        </Link>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tên sản phẩm</p>
                                        <p className="font-medium text-gray-800">{contract.firstProductName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tổng tiền</p>
                                        <p className="font-semibold text-[#f37021]">{formatVnd(contract.totalAmount)}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Đã trả {contract.paidCount}/{contract.totalMonths} tháng</span>
                                        <span className="font-medium text-[#0066b3]">{contract.progressPct}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full bg-[#0066b3] transition-all"
                                            style={{ width: `${contract.progressPct}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm md:grid-cols-3">
                                    <div>
                                        <p className="text-gray-500">Tháng cần đóng</p>
                                        <p className="font-medium">{formatCurrentMonthText(contract.currentInstallment?.dueDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Số tiền cần đóng</p>
                                        <p className="font-medium">{contract.currentInstallment ? formatVnd(contract.currentInstallment.amount) : "0đ"}</p>
                                    </div>
                                    <div className="flex items-end">
                                        {contract.currentInstallment ? (
                                            <button
                                                disabled={workingId === contract.currentInstallment.id}
                                                onClick={() => payInstallment(contract.currentInstallment!.id)}
                                                className="rounded-md bg-[#f37021] px-3 py-2 text-xs text-white hover:bg-[#d45f1a] disabled:opacity-60"
                                            >
                                                {workingId === contract.currentInstallment.id ? "Đang chuyển..." : "Thanh toán tháng này"}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-green-700">Đã hoàn tất hợp đồng</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {contracts.length === 0 && (
                            <div className="rounded-lg border bg-white p-6 text-sm text-gray-600">Bạn chưa có lịch trả góp nào.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
