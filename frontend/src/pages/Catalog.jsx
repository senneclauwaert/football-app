import { useEffect, useState } from "react"
import { useCart } from "../context/CartContext"
import CartDrawer from "../components/CartDrawer"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const BASE = "http://localhost:8000/api"
function getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` }
}

function ItemCard({ item, onAdd }) {
    const [hovered, setHovered] = useState(false)
    const lowStock = item.quantity <= item.reorder_level

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid #f1f5f9", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", transform: hovered ? "translateY(-4px)" : "none", boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.04)", position: "relative" }}
        >
            {/* Image */}
            <div style={{ position: "relative", height: 220, overflow: "hidden", background: "#f8fafc" }}>
                <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hovered ? "scale(1.05)" : "scale(1)" }}
                    onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/400/300` }}
                />
                {lowStock && (
                    <div style={{ position: "absolute", top: 10, left: 10, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                        Low Stock
                    </div>
                )}
                {item.status === "discontinued" && (
                    <div style={{ position: "absolute", top: 10, right: 10, background: "#64748b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                        Discontinued
                    </div>
                )}

                {/* Hover overlay */}
                {hovered && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(99,102,241,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 20 }}>
                        <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: 0, textAlign: "center" }}>{item.description?.slice(0, 80)}...</p>
                        <p style={{ color: "#c7d2fe", fontSize: 12, margin: 0 }}>Stock: {item.quantity} units</p>
                        <p style={{ color: "#c7d2fe", fontSize: 12, margin: 0 }}>{item.warehouse?.city}</p>
                        <button
                            onClick={() => onAdd(item)}
                            disabled={item.status === "discontinued" || item.quantity === 0}
                            style={{ marginTop: 8, padding: "8px 20px", borderRadius: 8, background: "#fff", color: "#6366f1", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                        >
                            Add to Cart
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: "14px 16px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.name}</p>
                <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8" }}>{item.category?.name}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#6366f1" }}>€{item.price?.toFixed(2)}</span>
                    <button
                        onClick={() => onAdd(item)}
                        disabled={item.status === "discontinued" || item.quantity === 0}
                        style={{ padding: "5px 12px", borderRadius: 8, background: "#ede9fe", color: "#6366f1", border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                    >
                        + Cart
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Catalog() {
    const [items,   setItems]   = useState([])
    const [total,   setTotal]   = useState(0)
    const [page,    setPage]    = useState(1)
    const [search,  setSearch]  = useState("")
    const [loading, setLoading] = useState(true)
    const [cartOpen, setCartOpen] = useState(false)
    const { addToCart, count } = useCart()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const perPage = 12

    useEffect(() => {
        load()
    }, [page, search])

    async function load() {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page, per_page: perPage, status: "active" })
            if (search) params.append("search", search)
            const res  = await fetch(`${BASE}/inventory/?${params}`, { headers: getHeaders() })
            const data = await res.json()
            setItems(data.items)
            setTotal(data.total)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(total / perPage)

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            {/* Navbar */}
            <nav style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>◈</div>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Inventra</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                        style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", width: 260 }}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>Hello, <b>{user?.username}</b></span>
                    <button
                        onClick={() => setCartOpen(true)}
                        style={{ position: "relative", padding: "8px 16px", borderRadius: 10, background: "#ede9fe", color: "#6366f1", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                        🛒 Cart
                        {count > 0 && (
                            <span style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {count}
                            </span>
                        )}
                    </button>
                    <button onClick={() => { logout(); navigate("/login") }} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #fee2e2", background: "transparent", color: "#ef4444", fontSize: 13, cursor: "pointer" }}>
                        Sign out
                    </button>
                </div>
            </nav>

            {/* Content */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px" }}>
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Product Catalog</h1>
                    <p style={{ color: "#94a3b8", marginTop: 4, fontSize: 14 }}>{total} products available</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading products...</div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                        {items.map(item => (
                            <ItemCard key={item.id} item={item} onAdd={addToCart} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 40 }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#cbd5e1" : "#0f172a", fontSize: 13 }}>← Prev</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                        return (
                            <button key={p} onClick={() => setPage(p)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: page === p ? "#6366f1" : "#fff", color: page === p ? "#fff" : "#0f172a", fontSize: 13, cursor: "pointer", fontWeight: page === p ? 700 : 400 }}>{p}</button>
                        )
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#cbd5e1" : "#0f172a", fontSize: 13 }}>Next →</button>
                </div>
            </div>

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    )
}