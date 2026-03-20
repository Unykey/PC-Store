import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi, type InstallmentProvider, type OrderCreateRequest, type OrderItemRequest, type PaymentType } from "@/api/orderApi";

const INSTALLMENT_OPTIONS: Array<{ label: string; value: InstallmentProvider }> = [
    { label: "Home Credit", value: "HOME_CREDIT" },
    { label: "FE Credit", value: "FE_CREDIT" },
    { label: "Mcredit (MB Bank)", value: "MCREDIT" },
    { label: "HD Saison", value: "HD_SAISON" },
    { label: "Thẻ tín dụng ngân hàng", value: "CREDIT_CARD" },
];

const MONTH_OPTIONS = [3, 6, 12, 24] as const;

const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const getAccountIdFromStorage = () => {
    const raw = localStorage.getItem("accountId");
    if (!raw) return "";
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : "";
};

export default function CheckoutPage() {
    const navigate = useNavigate();

    const [accountId, setAccountId] = useState<string>(getAccountIdFromStorage());
    const [shippingAddress, setShippingAddress] = useState("HCM City");
    const [note, setNote] = useState("");
    const [estimatedTotal, setEstimatedTotal] = useState<number>(15000000);
    const [paymentType, setPaymentType] = useState<PaymentType>("FULL_PAYMENT");
    const [installmentMonths, setInstallmentMonths] = useState<(typeof MONTH_OPTIONS)[number]>(12);
    const [installmentProvider, setInstallmentProvider] = useState<InstallmentProvider>("HOME_CREDIT");
    const [items, setItems] = useState<OrderItemRequest[]>([{ productId: 1, quantity: 1 }]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const monthlyPreview = useMemo(() => {
        if (paymentType !== "INSTALLMENT") return 0;
        return Math.ceil(estimatedTotal / installmentMonths);
    }, [estimatedTotal, installmentMonths, paymentType]);

    const canSubmit = useMemo(() => {
        const parsedAccountId = Number(accountId);
        if (!Number.isFinite(parsedAccountId) || parsedAccountId <= 0) return false;
        if (items.length === 0) return false;
        if (items.some((item) => item.productId <= 0 || item.quantity <= 0)) return false;
        if (paymentType === "INSTALLMENT" && (!installmentMonths || !installmentProvider)) return false;
        return true;
    }, [accountId, items, paymentType, installmentMonths, installmentProvider]);

    const updateItem = (index: number, key: keyof OrderItemRequest, value: number) => {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
    };

    const addItem = () => setItems((prev) => [...prev, { productId: 1, quantity: 1 }]);
    const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        if (!canSubmit || submitting) return;
        setSubmitting(true);
        setError("");

        try {
            const payload: OrderCreateRequest = {
                accountId: Number(accountId),
                shippingAddress,
                note,
                items,
                paymentType,
            };

            if (paymentType === "INSTALLMENT") {
                payload.installmentMonths = installmentMonths;
                payload.installmentProvider = installmentProvider;
            }

            const res = await orderApi.createOrder(payload);
            const order = res.data.data;
            navigate(`/orders/${order.orderId}`);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể tạo đơn hàng. Vui lòng kiểm tra dữ liệu và thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4">
                <h1 className="mb-2 text-3xl font-bold text-[#0066b3]">Thanh Toán</h1>
                <p className="mb-6 text-sm text-gray-600">Tạo đơn hàng mới và chọn thanh toán toàn bộ hoặc trả góp.</p>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm">
                            <span className="mb-1 block font-medium text-gray-700">Account ID</span>
                            <input
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                type="number"
                                min={1}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                placeholder="Nhập accountId"
                            />
                        </label>

                        <label className="text-sm">
                            <span className="mb-1 block font-medium text-gray-700">Địa chỉ giao hàng</span>
                            <input
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                placeholder="Số nhà, đường, quận..."
                            />
                        </label>
                    </div>

                    <label className="mt-4 block text-sm">
                        <span className="mb-1 block font-medium text-gray-700">Ghi chú</span>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            placeholder="Ghi chú cho đơn hàng"
                        />
                    </label>

                    <div className="mt-6 rounded-lg border border-gray-200 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">Sản phẩm trong đơn</h2>
                            <button onClick={addItem} type="button" className="rounded-md bg-[#0066b3] px-3 py-1.5 text-sm text-white hover:bg-[#005091]">
                                + Thêm dòng
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2">
                                    <input
                                        value={item.productId}
                                        onChange={(e) => updateItem(index, "productId", Number(e.target.value))}
                                        type="number"
                                        min={1}
                                        className="col-span-5 rounded-md border border-gray-300 px-3 py-2"
                                        placeholder="Product ID"
                                    />
                                    <input
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                        type="number"
                                        min={1}
                                        className="col-span-4 rounded-md border border-gray-300 px-3 py-2"
                                        placeholder="Số lượng"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length === 1}
                                        className="col-span-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h2 className="mb-3 font-semibold text-gray-800">Phương thức thanh toán</h2>

                        <div className="grid gap-3 md:grid-cols-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                                <input
                                    type="radio"
                                    checked={paymentType === "FULL_PAYMENT"}
                                    onChange={() => setPaymentType("FULL_PAYMENT")}
                                />
                                <div>
                                    <div className="font-medium">Thanh toán toàn bộ</div>
                                    <div className="text-xs text-gray-500">Thanh toán ngay 100%</div>
                                </div>
                            </label>

                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                                <input
                                    type="radio"
                                    checked={paymentType === "INSTALLMENT"}
                                    onChange={() => setPaymentType("INSTALLMENT")}
                                />
                                <div>
                                    <div className="font-medium">Trả góp</div>
                                    <div className="text-xs text-gray-500">Chia nhỏ thanh toán theo tháng</div>
                                </div>
                            </label>
                        </div>

                        {paymentType === "INSTALLMENT" && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <label className="text-sm">
                                    <span className="mb-1 block font-medium text-gray-700">Số tháng</span>
                                    <select
                                        value={installmentMonths}
                                        onChange={(e) => setInstallmentMonths(Number(e.target.value) as (typeof MONTH_OPTIONS)[number])}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    >
                                        {MONTH_OPTIONS.map((month) => (
                                            <option key={month} value={month}>
                                                {month} tháng
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="text-sm">
                                    <span className="mb-1 block font-medium text-gray-700">Đơn vị tài chính</span>
                                    <select
                                        value={installmentProvider}
                                        onChange={(e) => setInstallmentProvider(e.target.value as InstallmentProvider)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    >
                                        {INSTALLMENT_OPTIONS.map((provider) => (
                                            <option key={provider.value} value={provider.value}>
                                                {provider.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="text-sm md:col-span-2">
                                    <span className="mb-1 block font-medium text-gray-700">Tổng tiền tạm tính (để preview trả góp)</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={estimatedTotal}
                                        onChange={(e) => setEstimatedTotal(Number(e.target.value) || 0)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </label>

                                <div className="md:col-span-2 rounded-lg border border-[#0066b3]/20 bg-[#0066b3]/5 p-3 text-sm">
                                    Mỗi tháng thanh toán: <span className="font-semibold text-[#0066b3]">~{formatVnd(monthlyPreview)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit || submitting}
                            className="rounded-md bg-[#f37021] px-5 py-2.5 font-medium text-white hover:bg-[#d45f1a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Đang tạo đơn..." : "Tạo đơn hàng"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/orders")}
                            className="rounded-md border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-100"
                        >
                            Xem đơn hàng của tôi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
