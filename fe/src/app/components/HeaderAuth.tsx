import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function HeaderAuth() {
    const navigate = useNavigate();

    // Read token + email from localStorage (same keys shown in DevTools screenshot)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token =
            localStorage.getItem("ACCESS_TOKEN") ??
            localStorage.getItem("accessToken");
        const email = localStorage.getItem("USER_EMAIL") ?? "";
        setIsLoggedIn(!!token);
        setUserEmail(email);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("USER_EMAIL");
        setIsLoggedIn(false);
        setMenuOpen(false);
        navigate("/login");
    };

    const avatarLetter =
        userEmail?.[0]?.toUpperCase() ?? "U";

    // ── NOT logged in: original "Đăng nhập / Đăng ký" buttons ──────────────
    if (!isLoggedIn) {
        return (
            <div
                style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 2 }}
                onClick={() => navigate("/login")}
            >
                {/* person icon — keep whatever SVG/icon your Header currently uses */}
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
                <span style={{ fontSize: 11, lineHeight: 1 }}>Đăng nhập</span>
                <span style={{ fontSize: 11, lineHeight: 1 }}>Đăng ký</span>
            </div>
        );
    }

    // ── Logged in: avatar + "Hồ sơ" dropdown ──────────────────────────────
    return (
        <div ref={menuRef} style={{ position: "relative" }}>
            <button
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "inherit",
                    padding: 0,
                }}
            >
                {/* avatar circle */}
                <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#fff",
                }}>
                    {avatarLetter}
                </div>
                <span style={{ fontSize: 11, lineHeight: 1 }}>Hồ sơ</span>
            </button>

            {/* dropdown */}
            {menuOpen && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    minWidth: 180,
                    zIndex: 9999,
                    overflow: "hidden",
                }}>
                    {/* email header */}
                    <div style={{ padding: "10px 14px", borderBottom: "1px solid #f3f4f6" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Đã đăng nhập</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: "#111827", wordBreak: "break-all" }}>
                            {userEmail}
                        </p>
                    </div>

                    {/* menu items */}
                    {[
                        { label: "👤 Hồ sơ của tôi",  path: "/profile" },
                        { label: "📦 Đơn hàng",        path: "/orders" },
                        { label: "💳 Lịch trả góp",    path: "/my-installments" },
                    ].map(({ label, path }) => (
                        <button
                            key={path}
                            onClick={() => { setMenuOpen(false); navigate(path); }}
                            style={{
                                display: "block", width: "100%", padding: "10px 14px",
                                background: "transparent", border: "none",
                                textAlign: "left", fontSize: 13, color: "#374151",
                                cursor: "pointer", transition: "background 0.12s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#fff7ed")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                            {label}
                        </button>
                    ))}

                    <div style={{ borderTop: "1px solid #f3f4f6" }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                display: "block", width: "100%", padding: "10px 14px",
                                background: "transparent", border: "none",
                                textAlign: "left", fontSize: 13, color: "#ef4444",
                                cursor: "pointer", fontWeight: 600, transition: "background 0.12s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                            🚪 Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
