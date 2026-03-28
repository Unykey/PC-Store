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
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <h1 className="mb-2 text-4xl font-bold text-[#0066b3]">
                        Thanh Toán & Trả Góp
                    </h1>
                    <p className="text-gray-600">Chọn phương thức thanh toán phù hợp và hoàn tất đơn hàng nhanh chóng.</p>
                </div>

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
                                className="rounded-md bg-[#0066b3] px-3 py-1.5 text-sm text-white hover:bg-[#005091] transition"
                            >
                                + Thêm sản phẩm
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => {
                                const productPrice = priceMap[item.productId] || 0;
                                const itemTotal = productPrice * (item.quantity || 0);
                                return (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-end rounded-md border border-gray-200 bg-gray-50 p-3">
                                        <div className="col-span-5">
                                            <label className="text-xs text-gray-500 mb-1 block">ID Sản phẩm</label>
                                            <input
                                                value={item.productId}
                                                onChange={(e) => updateItem(index, "productId", Number(e.target.value))}
                                                type="number"
                                                min={1}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                placeholder="VD: 1"
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <label className="text-xs text-gray-500 mb-1 block">Số lượng</label>
                                            <input
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                type="number"
                                                min={1}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                placeholder="1"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            className="col-span-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 transition"
                                        >
                                            Xóa
                                        </button>
                                        {productPrice > 0 && (
                                            <div className="col-span-12 text-right text-xs text-gray-600 pt-1 border-t border-gray-200 mt-1">
                                                <span className="text-[#f37021] font-semibold">{formatVnd(itemTotal)}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5">
                            <h2 className="mb-4 font-semibold text-gray-800">
                                Chọn phương thức thanh toán
                            </h2>

                            {/* Cash Option */}
                            <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition">
                                <input
                                    type="radio"
                                    checked={checkoutMethod === "CASH"}
                                    onChange={() => setCheckoutMethod("CASH")}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800">Tiền mặt (COD)</div>
                                    <div className="text-xs text-gray-600 mt-1">Thanh toán khi nhận hàng</div>
                                    <div className="text-xs font-medium text-green-600 mt-2">Không phí, không lãi</div>
                                </div>
                            </label>

                            {/* MoMo Wallet Option */}
                            <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 hover:border-pink-300 hover:shadow-sm transition">
                                <input
                                    type="radio"
                                    checked={checkoutMethod === "MOMO_WALLET"}
                                    onChange={() => setCheckoutMethod("MOMO_WALLET")}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800">Ví MoMo</div>
                                    <div className="text-xs text-gray-600 mt-1">Thanh toán ngay toàn bộ</div>
                                    <div className="text-xs font-medium text-blue-600 mt-2">Nhanh gọn, an toàn</div>
                                </div>
                            </label>

                            {/* Installment Option */}
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-orange-300 bg-orange-50 p-4 hover:shadow-sm transition">
                                <input
                                    type="radio"
                                    checked={checkoutMethod === "MOMO_INSTALLMENT"}
                                    onChange={() => setCheckoutMethod("MOMO_INSTALLMENT")}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-orange-800">Mua trả góp</div>
                                    <div className="text-xs text-gray-600 mt-1">Chia nhỏ khoản thanh toán</div>
                                    <div className="text-xs font-medium text-orange-600 mt-2">0% lãi suất | Duyệt nhanh</div>
                                </div>
                            </label>

                            {/* Installment Terms */}
                            {checkoutMethod === "MOMO_INSTALLMENT" && (
                                <div className="mt-4 rounded-md border border-orange-200 bg-white p-4">
                                    <span className="mb-3 block text-sm font-semibold text-gray-700">Chọn kỳ hạn thanh toán</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {MONTH_OPTIONS.map((month) => (
                                            <button
                                                key={month}
                                                type="button"
                                                onClick={() => setInstallmentMonths(month)}
                                                className={`rounded-md px-3 py-2.5 text-sm font-medium transition ${installmentMonths === month
                                                    ? "bg-[#0066b3] text-white shadow-md"
                                                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {month}
                                                <br />
                                                <span className="text-xs">tháng</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-5">
                            <h2 className="mb-4 font-semibold text-gray-800">
                                Tóm tắt đơn hàng
                            </h2>

                            <div className="space-y-3 bg-white rounded-lg p-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-gray-600">Tổng giá trị:</span>
                                    <span className="text-lg font-bold text-[#f37021]">{formatVnd(actualTotal)}</span>
                                </div>

                                {priceLoading && (
                                    <div className="text-xs text-gray-500 text-center py-2">⏳ Đang cập nhật giá...</div>
                                )}

                                {checkoutMethod === "MOMO_INSTALLMENT" && (
                                    <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
                                        <p className="text-xs text-gray-600 mb-2">Thanh toán hàng tháng:</p>
                                        <p className="text-2xl font-bold text-[#0066b3]">{formatVnd(monthlyPreview)}</p>
                                        <p className="text-xs text-gray-500 mt-2">Trong {installmentMonths} tháng • 0% lãi suất</p>
                                        <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-gray-600 space-y-1">
                                            <p>Xét duyệt tức thì</p>
                                            <p>Cam kết 0% lãi suất</p>
                                            <p>Linh hoạt thanh toán sớm</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4">
                            <div>
                                <p className="font-semibold text-red-700">Lỗi</p>
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit || submitting}
                            className="rounded-md bg-[#f37021] px-6 py-3 font-semibold text-white hover:bg-[#d45f1a] disabled:cursor-not-allowed disabled:opacity-60 transition shadow-md"
                        >
                            {submitting ? "Đang xử lý..." : getActionText()}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/orders")}
                            className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100 transition"
                        >
                            Xem đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
