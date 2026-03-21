import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    orderApi,
    paymentApi,
    productApi,
    type OrderCreateRequest,
    type OrderItemRequest,
    type PaymentType,
} from "@/api/orderApi";

const MONTH_OPTIONS = [3, 6, 12] as const;

type CheckoutMethod = "CASH" | "MOMO_WALLET" | "MOMO_INSTALLMENT";

const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const prefillProductId = Number(searchParams.get("productId") || "1");
    const prefillQuantity = Number(searchParams.get("quantity") || "1");

    const [shippingAddress, setShippingAddress] = useState("HCM City");
    const [note, setNote] = useState("");
    const [checkoutMethod, setCheckoutMethod] = useState<CheckoutMethod>("MOMO_WALLET");
    const [installmentMonths, setInstallmentMonths] = useState<(typeof MONTH_OPTIONS)[number]>(6);
    const [items, setItems] = useState<OrderItemRequest[]>([
        {
            productId: Number.isFinite(prefillProductId) && prefillProductId > 0 ? prefillProductId : 1,
            quantity: Number.isFinite(prefillQuantity) && prefillQuantity > 0 ? prefillQuantity : 1,
        },
    ]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [priceMap, setPriceMap] = useState<Record<number, number>>({});
    const [priceLoading, setPriceLoading] = useState(false);

    const paymentType: PaymentType = checkoutMethod === "MOMO_INSTALLMENT" ? "INSTALLMENT" : "FULL_PAYMENT";

    useEffect(() => {
        const uniqueProductIds = Array.from(
            new Set(
                items
                    .map((item) => item.productId)
                    .filter((id) => Number.isFinite(id) && id > 0)
            )
        );

        if (uniqueProductIds.length === 0) {
            setPriceMap({});
            return;
        }

        let active = true;
        const fetchPrices = async () => {
            setPriceLoading(true);
            try {
                const entries = await Promise.all(
                    uniqueProductIds.map(async (id) => {
                        const res = await productApi.getProductById(id);
                        return [id, Number(res.data.price) || 0] as const;
                    })
                );
                if (!active) return;
                setPriceMap(Object.fromEntries(entries));
            } catch {
                if (!active) return;
                setPriceMap({});
            } finally {
                if (active) {
                    setPriceLoading(false);
                }
            }
        };

        fetchPrices();
        return () => {
            active = false;
        };
    }, [items]);

    const actualTotal = useMemo(() => {
        return items.reduce((sum, item) => {
            const price = priceMap[item.productId] || 0;
            const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 0;
            return sum + price * quantity;
        }, 0);
    }, [items, priceMap]);

    const monthlyPreview = useMemo(() => {
        if (checkoutMethod !== "MOMO_INSTALLMENT") return 0;
        return Math.ceil(actualTotal / installmentMonths);
    }, [actualTotal, installmentMonths, checkoutMethod]);

    const canSubmit = useMemo(() => {
        if (items.length === 0) return false;
        if (items.some((item) => item.productId <= 0 || item.quantity <= 0)) return false;
        if (checkoutMethod === "MOMO_INSTALLMENT" && !installmentMonths) return false;
        return true;
    }, [items, checkoutMethod, installmentMonths]);

    const updateItem = (index: number, key: keyof OrderItemRequest, value: number) => {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
    };

    const addItem = () => setItems((prev) => [...prev, { productId: 1, quantity: 1 }]);
    const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

    const getActionText = () => {
        if (checkoutMethod === "CASH") return "Đặt hàng";
        if (checkoutMethod === "MOMO_INSTALLMENT") return "Thanh toán MoMo (Sandbox)";
        return "Thanh toán ngay";
    };

    const handleSubmit = async () => {
        if (!canSubmit || submitting) return;
        setSubmitting(true);
        setError("");

        try {
            const payload: OrderCreateRequest = {
                shippingAddress,
                note,
                items,
                paymentType,
            };

            if (checkoutMethod === "MOMO_INSTALLMENT") {
                payload.installmentMonths = installmentMonths;
                payload.installmentProvider = "MOMO";
            }

            const orderRes = await orderApi.createOrder(payload);
            const order = orderRes.data.data;

            if (checkoutMethod === "CASH") {
                await paymentApi.payWithCash({
                    orderId: order.orderId,
                    note: "Mock COD demo",
                });

                navigate(`/order-success?orderId=${order.orderId}&method=${encodeURIComponent("Tien mat")}`);
                return;
            }

            let installmentId: number | undefined;
            if (checkoutMethod === "MOMO_INSTALLMENT") {
                const firstPendingInstallment = order.installments?.find(
                    (installment) => installment.installmentStatus === "PENDING"
                );
                installmentId = firstPendingInstallment?.id;
                if (!installmentId) {
                    throw new Error("Không tìm thấy kỳ trả góp để thanh toán. Vui lòng thử lại.");
                }
            }

            const momoRes = await paymentApi.createMomoPayment({
                orderId: order.orderId,
                installmentId,
                orderInfo:
                    checkoutMethod === "MOMO_INSTALLMENT"
                        ? `Tra gop MoMo don #${order.orderId}`
                        : `Thanh toan MoMo don #${order.orderId}`,
            });

            localStorage.setItem(
                "pendingPayment",
                JSON.stringify({
                    orderId: order.orderId,
                    method: checkoutMethod === "MOMO_INSTALLMENT" ? "MOMO_INSTALLMENT" : "MOMO",
                    installmentMonths: checkoutMethod === "MOMO_INSTALLMENT" ? installmentMonths : undefined,
                    installmentId,
                })
            );

            const payUrl = momoRes.data.data?.payUrl;
            if (!payUrl) {
                navigate(`/order-fail?orderId=${order.orderId}`);
                return;
            }

            window.location.href = payUrl;
        } catch (e: any) {
            setError(e?.response?.data?.message || "Không thể xử lý thanh toán. Vui lòng thử lại.");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4">
                <h1 className="mb-2 text-3xl font-bold text-[#0066b3]">Thanh Toán</h1>
                <p className="mb-6 text-sm text-gray-600">Chọn phương thức phù hợp và hoàn tất đơn hàng nhanh chóng.</p>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <label className="text-sm">
                        <span className="mb-1 block font-medium text-gray-700">Địa chỉ giao hàng</span>
                        <input
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            placeholder="Số nhà, đường, quận..."
                        />
                    </label>

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
                            <button
                                onClick={addItem}
                                type="button"
                                className="rounded-md bg-[#0066b3] px-3 py-1.5 text-sm text-white hover:bg-[#005091]"
                            >
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

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h2 className="mb-3 font-semibold text-gray-800">A. Chọn phương thức</h2>

                            <label className="mb-2 flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                                <input
                                    type="radio"
                                    checked={checkoutMethod === "CASH"}
                                    onChange={() => setCheckoutMethod("CASH")}
                                />
                                <div>
                                    <div className="font-medium">Thanh toán tiền mặt khi nhận hàng</div>
                                </div>
                            </label>

                            <label className="mb-2 flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                                <input
                                    type="radio"
                                    checked={checkoutMethod === "MOMO_WALLET"}
                                    onChange={() => setCheckoutMethod("MOMO_WALLET")}
                                />
                                <div>
                                    <div className="font-medium">Thanh toán qua ví MoMo</div>
                                </div>
                            </label>

                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-[#f37021]/40 bg-[#fff7f2] p-3">
                                <input
                                    type="radio"
                                    checked={checkoutMethod === "MOMO_INSTALLMENT"}
                                    onChange={() => setCheckoutMethod("MOMO_INSTALLMENT")}
                                />
                                <div>
                                    <div className="font-medium text-[#d45f1a]">Mua trả góp</div>
                                </div>
                            </label>

                            {checkoutMethod === "MOMO_INSTALLMENT" && (
                                <div className="mt-3 rounded-md border border-[#f37021]/20 bg-white p-3">
                                    <span className="mb-2 block text-sm font-medium text-gray-700">Chọn kỳ hạn</span>
                                    <div className="flex gap-2">
                                        {MONTH_OPTIONS.map((month) => (
                                            <button
                                                key={month}
                                                type="button"
                                                onClick={() => setInstallmentMonths(month)}
                                                className={`rounded-md px-3 py-1.5 text-sm ${installmentMonths === month
                                                    ? "bg-[#0066b3] text-white"
                                                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {month} tháng
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h2 className="mb-3 font-semibold text-gray-800">B. Tóm tắt</h2>

                            <div className="space-y-2 text-sm">
                                <p>
                                    Tổng tiền tạm tính: <span className="font-semibold text-[#f37021]">{formatVnd(actualTotal)}</span>
                                </p>
                                {priceLoading && <p className="text-xs text-gray-500">Đang cập nhật giá sản phẩm...</p>}
                                {checkoutMethod === "MOMO_INSTALLMENT" && (
                                    <p className="rounded-md bg-[#0066b3]/5 px-2 py-1">
                                        Số tiền cần thanh toán mỗi tháng: <span className="font-semibold text-[#0066b3]">{formatVnd(monthlyPreview)}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit || submitting}
                            className="rounded-md bg-[#f37021] px-5 py-2.5 font-medium text-white hover:bg-[#d45f1a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Đang xử lý..." : getActionText()}
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
