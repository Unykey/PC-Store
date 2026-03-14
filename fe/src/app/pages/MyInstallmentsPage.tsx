import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { installmentApi, type InstallmentResponse } from "@/api/orderApi";

const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const statusClass = (status: InstallmentResponse["installmentStatus"]) => {
    if (status === "PAID") return "bg-green-100 text-green-700 border-green-200";
    if (status === "OVERDUE") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
};

export default function MyInstallmentsPage() {
    const [rows, setRows] = useState<InstallmentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRows = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await installmentApi.getMyInstallments();
            const data = res.data.data || [];
            setRows(data.sort((a, b) => a.orderId - b.orderId || a.monthNumber - b.monthNumber));
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
            await installmentApi.payInstallment(id);
            await fetchRows();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể thanh toán kỳ trả góp này.");
        }
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
                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                        <table className="w-full min-w-[820px] border-collapse text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-3 py-2 text-left">Order</th>
                                    <th className="px-3 py-2 text-left">Kỳ</th>
                                    <th className="px-3 py-2 text-left">Đến hạn</th>
                                    <th className="px-3 py-2 text-left">Đã trả</th>
                                    <th className="px-3 py-2 text-left">Số tiền</th>
                                    <th className="px-3 py-2 text-left">Trạng thái</th>
                                    <th className="px-3 py-2 text-left">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id} className={`border-b ${row.installmentStatus === "OVERDUE" ? "bg-red-50/60" : ""}`}>
                                        <td className="px-3 py-2">
                                            <Link to={`/orders/${row.orderId}`} className="text-[#0066b3] hover:underline">
                                                #{row.orderId}
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2">Tháng {row.monthNumber}/{row.totalMonths}</td>
                                        <td className="px-3 py-2">{row.dueDate}</td>
                                        <td className="px-3 py-2">{row.paidDate || "-"}</td>
                                        <td className="px-3 py-2">{formatVnd(row.amount)}</td>
                                        <td className="px-3 py-2">
                                            <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(row.installmentStatus)}`}>
                                                {row.installmentStatus}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            {(row.installmentStatus === "PENDING" || row.installmentStatus === "OVERDUE") ? (
                                                <button
                                                    onClick={() => payInstallment(row.id)}
                                                    className="rounded-md bg-[#f37021] px-3 py-1.5 text-xs text-white hover:bg-[#d45f1a]"
                                                >
                                                    Thanh toán
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-500">Đã thanh toán</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {rows.length === 0 && (
                            <div className="p-6 text-sm text-gray-600">Bạn chưa có lịch trả góp nào.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
