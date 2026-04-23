import { useEffect, useState } from "react"
import Layout from "../../components/Layout"

const BASE = "http://localhost:8000/api"
function getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` }
}

const STATUS_COLORS = {
    active:       { bg: "#dcfce7", color: "#16a34a" },
    backordered:  { bg: "#fef9c3", color: "#ca8a04" },
    discontinued: { bg: "#fee2e2", color: "#dc2626" },
}

export default function Items() {
    const [items,   setItems]   = useState([])
    const [total,   setTotal]   = useState(0)
    const [page,    setPage]    = useState(1)
    const [search,  setSearch]  = useState("")
    const [loading, setLoading] = useState(true)
    const perPage = 10

    useEffect(() => {
        load()
    }, [page, search])

    async function load() {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page, per_page: perPage })
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
        <Layout>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>Items</h1>
                        <p style={{ color: "#94a3b8", marginTop: 4, fontSize: 14 }}>{total} products in inventory</p>
                    </div>
                    <button style={{ padding: "10px 20px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                        + Add Item
                    </button>
                </div>

                {/* Search */}
                <div style={{ marginBottom: 20 }}>
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                        style={{ width: "100%", maxWidth: 340, padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff" }}
                    />
                </div>

                {/* Table */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                {["Image", "Name", "SKU", "Category", "Stock", "Price", "Status", "Actions"].map(h => (
                                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading...</td>
                                </tr>
                            ) : items.map((item, i) => {
                                const sc = STATUS_COLORS[item.status] || STATUS_COLORS.active
                                const lowStock = item.quantity <= item.reorder_level
                                return (
                                    <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: "12px 16px" }}>
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", background: "#f1f5f9" }}
                                                onError={e => e.target.style.display = "none"}
                                            />
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.name}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.warehouse?.city}</div>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6366f1", fontWeight: 600, fontFamily: "monospace" }}>{item.sku}</td>
                                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{item.category?.name}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: lowStock ? "#ef4444" : "#0f172a" }}>{item.quantity}</span>
                                            {lowStock && <span style={{ fontSize: 10, color: "#ef4444", marginLeft: 4 }}>↓ Low</span>}
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>€{item.price?.toFixed(2)}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: "pointer", color: "#6366f1" }}>Edit</button>
                                                <button style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fee2e2", background: "#fff", fontSize: 12, cursor: "pointer", color: "#ef4444" }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>
                            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
                        </span>
                        <div style={{ display: "flex", gap: 4 }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#cbd5e1" : "#0f172a" }}
                            >← Prev</button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: page === p ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#fff", color: page === p ? "#fff" : "#0f172a", fontSize: 13, cursor: "pointer", fontWeight: page === p ? 700 : 400 }}
                                    >{p}</button>
                                )
                            })}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#cbd5e1" : "#0f172a" }}
                            >Next →</button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}