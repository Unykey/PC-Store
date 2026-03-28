import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, type AccountResponse } from "../../api/authApi";
import { orderApi, type OrderResponse, type OrderStatus } from "../../api/orderApi";

// ── helpers ────────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    PENDING:   { label: "Chờ xác nhận", color: "#b45309", bg: "#fef3c7" },
    CONFIRMED: { label: "Đã xác nhận",  color: "#1d4ed8", bg: "#dbeafe" },
    SHIPPING:  { label: "Đang giao",    color: "#7c3aed", bg: "#ede9fe" },
    DELIVERED: { label: "Đã giao",      color: "#065f46", bg: "#d1fae5" },
    COMPLETED: { label: "Hoàn tất",     color: "#065f46", bg: "#d1fae5" },
    DEFAULTED: { label: "Vi phạm",      color: "#991b1b", bg: "#fee2e2" },
    CANCELLED: { label: "Đã hủy",       color: "#6b7280", bg: "#f3f4f6" },
};

// ── sub-components ─────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13, color: "#9ca3af", width: 110, flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 14, color: "#111827", fontWeight: 500, wordBreak: "break-word" }}>
                {value || <span style={{ color: "#d1d5db", fontStyle: "italic" }}>Chưa cập nhật</span>}
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: OrderStatus }) {
    const m = STATUS_META[status] ?? { label: status, color: "#374151", bg: "#f9fafb" };
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            color: m.color,
            background: m.bg,
            whiteSpace: "nowrap",
        }}>
            {m.label}
        </span>
    );
}

function OrderCard({ order, onClick }: { order: OrderResponse; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "16px 20px",
                cursor: "pointer",
                transition: "box-shadow 0.18s, border-color 0.18s",
                marginBottom: 12,
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.09)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#f97316";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb";
            }}
        >
            {/* top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Đơn hàng </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>#{order.orderId}</span>
                </div>
                <StatusBadge status={order.orderStatus} />
            </div>

            {/* products */}
            <div style={{ marginBottom: 10 }}>
                {order.orderDetails.slice(0, 2).map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        {item.productImage ? (
                            <img src={item.productImage} alt={item.productName}
                                style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid #f3f4f6", flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: 36, height: 36, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 16 }}>📦</span>
                            </div>
                        )}
                        <span style={{ fontSize: 13, color: "#374151" }} >
                            {item.productName}
                            <span style={{ color: "#9ca3af" }}> x{item.quantity}</span>
                        </span>
                    </div>
                ))}
                {order.orderDetails.length > 2 && (
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>+{order.orderDetails.length - 2} sản phẩm khác</span>
                )}
            </div>

            {/* bottom row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{formatDate(order.orderDate)}</span>
                <div style={{ textAlign: "right" }}>
                    {order.paymentType === "INSTALLMENT" && (
                        <div style={{ fontSize: 11, color: "#7c3aed", marginBottom: 2 }}>
                            Trả góp {order.installmentMonths} tháng
                        </div>
                    )}
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#f97316" }}>
                        {formatCurrency(order.totalAmount)}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── main page ──────────────────────────────────────────────────────────────────

type Tab = "info" | "orders";

export default function ProfilePage() {
    const navigate = useNavigate();

    const [account, setAccount] = useState<AccountResponse | null>(null);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [tab, setTab] = useState<Tab>("info");
    const [loadingAccount, setLoadingAccount] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // read stored user id / email from localStorage (set at login)
    const userEmail = localStorage.getItem("USER_EMAIL") ?? "";
    const token = localStorage.getItem("ACCESS_TOKEN") ?? localStorage.getItem("accessToken") ?? "";

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        // Fetch all accounts and find the one matching current email.
        // If your backend exposes /api/accounts/me use that instead.
        setLoadingAccount(true);
        authApi
            .getAllAccounts()
            .then((res: any) => {
                const list: AccountResponse[] = res?.data?.data ?? res?.data ?? [];
                const me = list.find((a) => a.email === userEmail) ?? list[0] ?? null;
                setAccount(me);
            })
            .catch(() => setError("Không thể tải thông tin tài khoản."))
            .finally(() => setLoadingAccount(false));
    }, []);

    useEffect(() => {
        if (tab !== "orders") return;
        setLoadingOrders(true);
        orderApi
            .getMyOrders()
            .then((res: any) => {
                const data: OrderResponse[] = res?.data?.data ?? res?.data ?? [];
                setOrders(data);
            })
            .catch(() => setError("Không thể tải danh sách đơn hàng."))
            .finally(() => setLoadingOrders(false));
    }, [tab]);

    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("USER_EMAIL");
        navigate("/login");
    };

    const avatarLetter = account?.fullName?.[0]?.toUpperCase() ?? userEmail?.[0]?.toUpperCase() ?? "U";

    // ── render ─────────────────────────────────────────────────────────────────

    return (
        <div style={{
            minHeight: "100vh",
            background: "#f9fafb",
            fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
            paddingBottom: 60,
        }}>

            {/* ── hero banner ── */}
            <div style={{
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                padding: "48px 0 80px",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* decorative circles */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, left: 80, width: 150, height: 150, borderRadius: "50%", background: "rgba(249,115,22,0.07)", pointerEvents: "none" }} />

                <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 24 }}>
                    {/* avatar */}
                    <div style={{
                        width: 72, height: 72, borderRadius: "50%",
                        background: "linear-gradient(135deg, #f97316, #ea580c)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 28, fontWeight: 800, color: "#fff",
                        boxShadow: "0 0 0 4px rgba(249,115,22,0.3)",
                        flexShrink: 0,
                    }}>
                        {avatarLetter}
                    </div>

                    <div style={{ flex: 1 }}>
                        {loadingAccount ? (
                            <div style={{ height: 24, width: 180, borderRadius: 8, background: "rgba(255,255,255,0.1)" }} />
                        ) : (
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>
                                {account?.fullName ?? "Người dùng"}
                            </h1>
                        )}
                        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#94a3b8" }}>{userEmail}</p>
                        {account?.role && (
                            <span style={{
                                display: "inline-block", marginTop: 8,
                                padding: "2px 12px", borderRadius: 999,
                                background: "rgba(249,115,22,0.18)", color: "#fb923c",
                                fontSize: 12, fontWeight: 600,
                            }}>
                                {account.role.roleName}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
                            background: "rgba(255,255,255,0.07)", color: "#cbd5e1",
                            fontSize: 13, cursor: "pointer", fontWeight: 500,
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* ── card container (overlaps banner) ── */}
            <div style={{ maxWidth: 860, margin: "-40px auto 0", padding: "0 20px" }}>
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>

                    {/* tabs */}
                    <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6" }}>
                        {([ ["info", "👤 Thông tin cá nhân"], ["orders", "📦 Đơn hàng của tôi"] ] as [Tab, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                style={{
                                    flex: 1, padding: "16px", border: "none", background: "transparent",
                                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                                    color: tab === key ? "#f97316" : "#6b7280",
                                    borderBottom: tab === key ? "2px solid #f97316" : "2px solid transparent",
                                    transition: "color 0.15s",
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* tab content */}
                    <div style={{ padding: "28px 32px", minHeight: 320 }}>
                        {error && (
                            <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 14 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* ── INFO TAB ── */}
                        {tab === "info" && (
                            loadingAccount ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} style={{ height: 44, background: "#f3f4f6", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
                                    ))}
                                </div>
                            ) : account ? (
                                <div>
                                    <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
                                        Thông tin tài khoản
                                    </h2>
                                    <InfoRow icon="👤" label="Họ và tên"    value={account.fullName} />
                                    <InfoRow icon="📧" label="Email"        value={account.email} />
                                    <InfoRow icon="📱" label="Số điện thoại" value={account.phoneNumber} />
                                    <InfoRow icon="📍" label="Địa chỉ"      value={account.address} />
                                    <InfoRow icon="🔑" label="Vai trò"      value={account.role?.roleName} />

                                    <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
                                        <button
                                            onClick={() => navigate("/orders")}
                                            style={{
                                                padding: "10px 22px", borderRadius: 8,
                                                background: "#f97316", border: "none",
                                                color: "#fff", fontSize: 14, fontWeight: 600,
                                                cursor: "pointer", transition: "background 0.15s",
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "#ea580c")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
                                        >
                                            Xem đơn hàng
                                        </button>
                                        <button
                                            onClick={() => navigate("/my-installments")}
                                            style={{
                                                padding: "10px 22px", borderRadius: 8,
                                                background: "#fff", border: "1px solid #e5e7eb",
                                                color: "#374151", fontSize: 14, fontWeight: 600,
                                                cursor: "pointer", transition: "border-color 0.15s",
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.borderColor = "#f97316")}
                                            onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                                        >
                                            Lịch trả góp
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: "#6b7280" }}>Không tìm thấy thông tin tài khoản.</p>
                            )
                        )}

                        {/* ── ORDERS TAB ── */}
                        {tab === "orders" && (
                            loadingOrders ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} style={{ height: 110, background: "#f3f4f6", borderRadius: 12 }} />
                                    ))}
                                </div>
                            ) : orders.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                                    <p style={{ fontSize: 15 }}>Bạn chưa có đơn hàng nào.</p>
                                    <button
                                        onClick={() => navigate("/")}
                                        style={{
                                            marginTop: 12, padding: "10px 24px", borderRadius: 8,
                                            background: "#f97316", border: "none", color: "#fff",
                                            fontSize: 14, fontWeight: 600, cursor: "pointer",
                                        }}
                                    >
                                        Mua sắm ngay
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
                                        Đơn hàng của tôi ({orders.length})
                                    </h2>
                                    {orders.map((order) => (
                                        <OrderCard
                                            key={order.orderId}
                                            order={order}
                                            onClick={() => navigate(`/orders/${order.orderId}`)}
                                        />
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
