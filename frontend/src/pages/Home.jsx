import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Home() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate("/login")
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column" }}>
            <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #1e2030" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Inventra</span>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ color: "#6b7280", fontSize: 13 }}>Hello, {user?.username}</span>
                    <button onClick={handleLogout} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #1e2030", background: "transparent", color: "#ef4444", fontSize: 13, cursor: "pointer" }}>Sign out</button>
                </div>
            </nav>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 40px", textAlign: "center" }}>
                <h1 style={{ fontSize: 52, fontWeight: 900, color: "#fff", margin: "0 0 16px", lineHeight: 1.1 }}>
                    Your inventory, <span style={{ color: "#8b5cf6" }}>under control</span>
                </h1>
                <p style={{ color: "#6b7280", fontSize: 18, maxWidth: 480, margin: "0 0 40px", lineHeight: 1.6 }}>
                    Browse our full product catalog, track your orders, and manage your account.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                    <a href="/catalog" style={{ padding: "14px 28px", borderRadius: 12, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>View Catalog</a>
                    <a href="/orders" style={{ padding: "14px 28px", borderRadius: 12, background: "transparent", color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none", border: "1px solid #1e2030" }}>My Orders</a>
                </div>
                <div style={{ display: "flex", gap: 40, marginTop: 60, padding: "24px 40px", background: "#0d0e14", borderRadius: 16, border: "1px solid #1e2030" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>989+</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Products</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>7</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Categories</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>3</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Warehouses</div>
                    </div>
                </div>
            </div>
        </div>
    )
}