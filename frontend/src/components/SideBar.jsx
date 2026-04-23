import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const navItems = [
    { path: "/admin",             label: "Dashboard",  icon: "▣" },
    { path: "/admin/items",       label: "Items",      icon: "◈" },
    { path: "/admin/users",       label: "Users",      icon: "◎" },
    { path: "/admin/orders",      label: "Orders",     icon: "◇" },
    { path: "/admin/suppliers",   label: "Suppliers",  icon: "◆" },
    { path: "/admin/warehouses",  label: "Warehouses", icon: "⬡" },
    { path: "/admin/categories",  label: "Categories", icon: "⊞" },
    { path: "/admin/movements",   label: "Movements",  icon: "↯" },
]

export default function Sidebar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate("/login")
    }

    return (
        <aside style={{ width: 240, minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column", borderRight: "1px solid #1e2030" }}>
            {/* Logo */}
            <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #1e2030" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◈</div>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.5px" }}>Inventra</span>
                </div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ color: "#4b5563", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{user?.role}</span>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
                {navItems.map(item => {
                    const active = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "9px 12px", borderRadius: 8,
                                fontSize: 13, fontWeight: active ? 600 : 400,
                                color: active ? "#fff" : "#6b7280",
                                background: active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                                textDecoration: "none", transition: "all 0.15s",
                            }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#1e2030" }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
                        >
                            <span style={{ fontSize: 15, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* User */}
            <div style={{ padding: "16px 12px", borderTop: "1px solid #1e2030" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{user?.username}</div>
                        <div style={{ color: "#4b5563", fontSize: 11 }}>{user?.email}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#ef4444", fontSize: 13, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1e2030"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                    Sign out
                </button>
            </div>
        </aside>
    )
}