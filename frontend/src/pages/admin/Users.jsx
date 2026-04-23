import { useEffect, useState } from "react"
import Layout from "../../components/Layout"

const BASE = "http://localhost:8000/api"
function getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` }
}

const ROLE_COLORS = {
    admin:   { bg: "#ede9fe", color: "#7c3aed" },
    premium: { bg: "#fef9c3", color: "#ca8a04" },
    normal:  { bg: "#f1f5f9", color: "#64748b" },
}

export default function Users() {
    const [users,   setUsers]   = useState([])
    const [loading, setLoading] = useState(true)
    const [search,  setSearch]  = useState("")

    useEffect(() => {
        load()
    }, [])

    async function load() {
    setLoading(true)
    try {
        const res  = await fetch(`${BASE}/users/`, { headers: getHeaders() })
        if (!res.ok) throw new Error("Failed to fetch users")
        const data = await res.json()
        setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
        console.error(err)
        setUsers([])
    } finally {
        setLoading(false)
    }
}

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Layout>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>Users</h1>
                        <p style={{ color: "#94a3b8", marginTop: 4, fontSize: 14 }}>{users.length} registered accounts</p>
                    </div>
                    <button style={{ padding: "10px 20px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                        + Add User
                    </button>
                </div>

                {/* Role summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                    {[
                        { role: "admin",   label: "Admins",   color: "#7c3aed", bg: "#ede9fe" },
                        { role: "premium", label: "Premium",  color: "#ca8a04", bg: "#fef9c3" },
                        { role: "normal",  label: "Normal",   color: "#64748b", bg: "#f1f5f9" },
                    ].map(r => (
                        <div key={r.role} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{r.label}</span>
                            <span style={{ padding: "4px 12px", borderRadius: 20, background: r.bg, color: r.color, fontSize: 13, fontWeight: 700 }}>
                                {users.filter(u => u.role === r.role).length}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ marginBottom: 16 }}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", maxWidth: 340, padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff" }}
                    />
                </div>

                {/* Table */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                {["Avatar", "Username", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading...</td>
                                </tr>
                            ) : filtered.map(user => {
                                const rc = ROLE_COLORS[user.role] || ROLE_COLORS.normal
                                return (
                                    <tr
                                        key={user.id}
                                        style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                                                {user.username?.[0]?.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{user.username}</td>
                                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{user.email}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: rc.bg, color: rc.color }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: user.is_active ? "#22c55e" : "#ef4444" }} />
                                                <span style={{ fontSize: 12, color: user.is_active ? "#16a34a" : "#dc2626" }}>
                                                    {user.is_active ? "Active" : "Disabled"}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB") : "—"}
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

                    {filtered.length === 0 && !loading && (
                        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                            No users found
                        </div>
                    )}

                    <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>Showing {filtered.length} of {users.length} users</span>
                    </div>
                </div>
            </div>
        </Layout>
    )
}