import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
    orderApi,
    paymentApi,
    type OrderCreateRequest,
    type OrderItemRequest,
    type PaymentType,
} from "@/api/orderApi";
import { publicProductApi, type ProductResponse } from "@/api/productApi";
import { getImageUrl } from "@/app/utils/image";

const MONTH_OPTIONS = [3, 6, 12] as const;
const DISTRICT_OPTIONS = [
    "Quận 1",
    "Quận 3",
    "Quận 7",
    "Quận Bình Thạnh",
    "TP Thủ Đức",
    "Quận Tân Bình",
] as const;

type CheckoutMethod = "CASH" | "MOMO_WALLET" | "MOMO_INSTALLMENT";

const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const checkoutState = (location.state || {}) as { productId?: number; quantity?: number };
    const prefillProductId = Number(checkoutState.productId);
    const prefillQuantity = Number(checkoutState.quantity);

    const [district, setDistrict] = useState("");
    const [ward, setWard] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [note, setNote] = useState("");
    const [checkoutMethod, setCheckoutMethod] = useState<CheckoutMethod>("MOMO_WALLET");
    const [installmentMonths, setInstallmentMonths] = useState<(typeof MONTH_OPTIONS)[number]>(6);
    const [items, setItems] = useState<OrderItemRequest[]>(() => {
        if (Number.isFinite(prefillProductId) && prefillProductId > 0) {
            return [
                {
                    productId: prefillProductId,
                    quantity: Number.isFinite(prefillQuantity) && prefillQuantity > 0 ? prefillQuantity : 1,
                },
            ];
        }
        return [];
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [productCatalog, setProductCatalog] = useState<ProductResponse[]>([]);
    const [productMap, setProductMap] = useState<Record<number, ProductResponse>>({});
    const [productLoading, setProductLoading] = useState(false);

    const paymentType: PaymentType = checkoutMethod === "MOMO_INSTALLMENT" ? "INSTALLMENT" : "FULL_PAYMENT";

    useEffect(() => {
        let active = true;
        const fetchCatalog = async () => {
            try {
                const res = await publicProductApi.getAllProducts();
                const products = res.data.data || [];
                if (!active) return;
                setProductCatalog(products);
                setProductMap((prev) => ({
                    ...prev,
                    ...Object.fromEntries(products.map((product) => [product.productId, product])),
                }));
            } catch {
                if (!active) return;
                setProductCatalog([]);
            }
        };

        fetchCatalog();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const uniqueProductIds = Array.from(
            new Set(
                items
                    .map((item) => item.productId)
                    .filter((id) => Number.isFinite(id) && id > 0)
            )
        );

        if (uniqueProductIds.length === 0) {
            setProductLoading(false);
            return;
        }

        let active = true;
        const fetchProducts = async () => {
            setProductLoading(true);
            try {
                const entries = await Promise.all(
                    uniqueProductIds.map(async (id) => {
                        const res = await publicProductApi.getProductById(id);
                        return [id, res.data.data] as const;
                    })
                );
                if (!active) return;
                setProductMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
            } catch {
                if (!active) return;
            } finally {
                if (active) {
                    setProductLoading(false);
                }
            }
        };

        fetchProducts();
        return () => {
            active = false;
        };
    }, [items]);

    const actualTotal = useMemo(() => {
        return items.reduce((sum, item) => {
            const price = Number(productMap[item.productId]?.price) || 0;
            const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 0;
            return sum + price * quantity;
        }, 0);
    }, [items, productMap]);

    const monthlyPreview = useMemo(() => {
        if (checkoutMethod !== "MOMO_INSTALLMENT") return 0;
        return Math.ceil(actualTotal / installmentMonths);
    }, [actualTotal, installmentMonths, checkoutMethod]);

    const composedShippingAddress = useMemo(() => {
        return [streetAddress.trim(), ward.trim(), district.trim(), "TP. HCM"].filter(Boolean).join(", ");
    }, [district, streetAddress, ward]);

    const hasCompleteAddress = useMemo(() => {
        return Boolean(district.trim() && ward.trim() && streetAddress.trim());
    }, [district, ward, streetAddress]);

    const canSubmit = useMemo(() => {
        if (!hasCompleteAddress) return false;
        if (items.length === 0) return false;
        if (items.some((item) => item.productId <= 0 || item.quantity <= 0 || !productMap[item.productId])) return false;
        if (productLoading) return false;
        if (checkoutMethod === "MOMO_INSTALLMENT" && !installmentMonths) return false;
        return true;
    }, [hasCompleteAddress, items, productMap, productLoading, checkoutMethod, installmentMonths]);

    const updateItem = (index: number, key: keyof OrderItemRequest, value: number) => {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
    };

    const addItem = () => {
        const defaultProductId = productCatalog[0]?.productId || 1;
        setItems((prev) => [...prev, { productId: defaultProductId, quantity: 1 }]);
    };
    const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

    const increaseQuantity = (index: number) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        quantity: (Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1) + 1,
                    }
                    : item
            )
        );
    };

    const decreaseQuantity = (index: number) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        quantity: Math.max(1, Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity - 1 : 1),
                    }
                    : item
            )
        );
    };

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
                shippingAddress: composedShippingAddress,
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
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h2 className="mb-3 font-semibold text-gray-800">Thông tin giao hàng</h2>
                        <div className="grid gap-3 md:grid-cols-3">
                            <label className="text-sm">
                                <span className="mb-1 block font-medium text-gray-700">Quận/Huyện</span>
                                <select
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                                >
                                    <option value="">Chọn Quận/Huyện</option>
                                    {DISTRICT_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="text-sm">
                                <span className="mb-1 block font-medium text-gray-700">Phường/Xã</span>
                                <input
                                    value={ward}
                                    onChange={(e) => setWard(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    placeholder="VD: Phường 12"
                                />
                            </label>

                            <label className="text-sm">
                                <span className="mb-1 block font-medium text-gray-700">Số nhà và Tên đường</span>
                                <input
                                    value={streetAddress}
                                    onChange={(e) => setStreetAddress(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    placeholder="VD: 123 Nguyễn Trãi"
                                />
                            </label>
                        </div>
                        {!hasCompleteAddress && (
                            <p className="mt-3 text-xs text-orange-700">Vui lòng nhập đầy đủ địa chỉ để có thể thanh toán.</p>
                        )}
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
                            <button
                                onClick={addItem}
                                type="button"
                                className="rounded-md border border-[#0066b3] bg-white px-3 py-1.5 text-sm font-medium text-[#0066b3] hover:bg-blue-50 transition"
                            >
                                + Thêm sản phẩm
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
                                Chưa có sản phẩm trong đơn hàng.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => {
                                    const product = productMap[item.productId];
                                    const productPrice = Number(product?.price) || 0;
                                    const itemTotal = productPrice * (item.quantity || 0);
                                    return (
                                        <div key={index} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                <div className="col-span-3 md:col-span-1">
                                                    <label className="mb-1 block text-xs text-gray-500">Hình ảnh</label>
                                                    {product?.image ? (
                                                        <img
                                                            src={getImageUrl(product.image)}
                                                            alt={product.name}
                                                            className="h-14 w-14 rounded-md border border-gray-200 bg-white object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-gray-300 bg-white text-[11px] text-gray-400">
                                                            No Img
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-span-9 md:col-span-4">
                                                    <label className="mb-1 block text-xs text-gray-500">Tên sản phẩm</label>
                                                    <select
                                                        value={item.productId}
                                                        onChange={(e) => updateItem(index, "productId", Number(e.target.value))}
                                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    >
                                                        {productCatalog.length === 0 && <option value={item.productId}>Sản phẩm #{item.productId}</option>}
                                                        {productCatalog.map((productOption) => (
                                                            <option key={productOption.productId} value={productOption.productId}>
                                                                {productOption.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="mt-1 text-xs text-gray-500">Mã SP: {item.productId}</p>
                                                </div>

                                                <div className="col-span-6 md:col-span-2">
                                                    <label className="mb-1 block text-xs text-gray-500">Đơn giá</label>
                                                    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#0066b3]">
                                                        {formatVnd(productPrice)}
                                                    </div>
                                                </div>

                                                <div className="col-span-6 md:col-span-3">
                                                    <label className="mb-1 block text-xs text-gray-500">Số lượng</label>
                                                    <div className="flex items-center rounded-md border border-gray-300 bg-white">
                                                        <button
                                                            type="button"
                                                            onClick={() => decreaseQuantity(index)}
                                                            className="px-3 py-2 text-gray-700 hover:bg-gray-100"
                                                            aria-label="Giảm số lượng"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <input
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, "quantity", Math.max(1, Number(e.target.value) || 1))}
                                                            type="number"
                                                            min={1}
                                                            className="w-full border-x border-gray-200 px-2 py-2 text-center text-sm focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => increaseQuantity(index)}
                                                            className="px-3 py-2 text-gray-700 hover:bg-gray-100"
                                                            aria-label="Tăng số lượng"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="col-span-12 md:col-span-2">
                                                    <label className="mb-1 block text-xs text-gray-500">Thao tác</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
                                                    >
                                                        <Trash2 size={16} /> Xóa
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-3 border-t border-gray-200 pt-2 text-right text-sm text-gray-700">
                                                Thành tiền: <span className="font-semibold text-[#f37021]">{formatVnd(itemTotal)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5">
                            <h2 className="mb-4 font-semibold text-gray-800">
                                Chọn phương thức thanh toán
                            </h2>

                            <label
                                className={`mb-3 flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${checkoutMethod === "CASH"
                                    ? "border-blue-500 bg-blue-50 shadow-sm"
                                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                                    }`}
                            >
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

                            <label
                                className={`mb-3 flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${checkoutMethod === "MOMO_WALLET"
                                    ? "border-pink-400 bg-pink-50 shadow-sm"
                                    : "border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm"
                                    }`}
                            >
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

                            <label
                                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${checkoutMethod === "MOMO_INSTALLMENT"
                                    ? "border-orange-400 bg-orange-50 shadow-sm"
                                    : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm"
                                    }`}
                            >
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
                                    <span className="text-gray-600">Tổng giá trị sản phẩm:</span>
                                    <span className="text-lg font-bold text-[#f37021]">{formatVnd(actualTotal)}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-gray-600">Tổng tiền:</span>
                                    <span className="text-lg font-bold text-[#0066b3]">{formatVnd(actualTotal)}</span>
                                </div>

                                {productLoading && (
                                    <div className="py-2 text-center text-xs text-gray-500">Đang cập nhật thông tin sản phẩm...</div>
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
