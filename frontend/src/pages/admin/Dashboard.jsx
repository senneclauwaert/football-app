import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import Layout from "../../components/Layout"

const BASE = "http://localhost:8000/api"
function getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` }
}

function StatCard({ label, value, sub, accent }) {
    return (
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8, margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 36, fontWeight: 800, color: accent, margin: "8px 0 4px", lineHeight: 1 }}>{value ?? "—"}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{sub}</p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {label.includes("Item") ? "◈" : label.includes("User") ? "◎" : label.includes("Stock") ? "↯" : "◇"}
                </div>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({ totalItems: null, totalUsers: null, totalOrders: null, pendingOrders: null, lowStock: null })

    useEffect(() => {
        async function load() {
            try {
                const [iR, uR, oR, invR] = await Promise.all([
                    fetch(`${BASE}/inventory/?per_page=1`, { headers: getHeaders() }),
                    fetch(`${BASE}/users/`, { headers: getHeaders() }),
                    fetch(`${BASE}/orders/`, { headers: getHeaders() }),
                    fetch(`${BASE}/inventory/?per_page=1000`, { headers: getHeaders() }),
                ])
                const iD = await iR.json()
                const uD = await uR.json()
                const oD = await oR.json()
                const invD = await invR.json()
                setStats({
                    totalItems: iD.total,
                    totalUsers: Array.isArray(uD) ? uD.length : 0,
                    totalOrders: Array.isArray(oD) ? oD.length : 0,
                    pendingOrders: Array.isArray(oD) ? oD.filter(o => o.status === "pending").length : 0,
                    lowStock: invD.items?.filter(i => i.quantity <= i.reorder_level).length ?? 0,
                })
            } catch (err) {
                console.error(err)
            }
        }
        load()
    }, [])

    const cards = [
        { label: "Total Items",     value: stats.totalItems,    sub: "Products tracked",     accent: "#6366f1" },
        { label: "Total Users",     value: stats.totalUsers,    sub: "Registered accounts",  accent: "#0ea5e9" },
        { label: "Total Orders",    value: stats.totalOrders,   sub: "All time",             accent: "#8b5cf6" },
        { label: "Pending Orders",  value: stats.pendingOrders, sub: "Awaiting processing",  accent: "#f59e0b" },
        { label: "Low Stock Items", value: stats.lowStock,      sub: "Need reordering",      accent: "#ef4444" },
    ]

    return (
        <Layout>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                        Good day, {user?.username} 👋
                    </h1>
                    <p style={{ color: "#94a3b8", marginTop: 4, fontSize: 14 }}>Here is your inventory overview</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                    {cards.map(c => <StatCard key={c.label} {...c} />)}
                </div>

                <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Quick Actions</h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {[
                            { label: "View Items",      path: "/admin/items",     color: "#6366f1" },
                            { label: "Manage Users",    path: "/admin/users",     color: "#0ea5e9" },
                            { label: "View Orders",     path: "/admin/orders",    color: "#8b5cf6" },
                            { label: "Stock Movements", path: "/admin/movements", color: "#f59e0b" },
                        ].map(a => (
                            <a key={a.path} href={a.path} style={{ padding: "8px 16px", borderRadius: 8, background: a.color + "12", color: a.color, fontSize: 13, fontWeight: 600, textDecoration: "none", border: `1px solid ${a.color}22` }}>
                                {a.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    )
}