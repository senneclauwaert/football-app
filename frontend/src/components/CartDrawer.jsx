import { useCart } from "../context/CartContext"

export default function CartDrawer({ open, onClose }) {
    const { cart, removeFromCart, updateQty, total, clearCart } = useCart()

    if (!open) return null

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
            <div style={{ position: "fixed", top: 0, right: 0, width: 380, height: "100vh", background: "#fff", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Cart ({cart.length})</h2>
                    <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 60 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                            <p>Your cart is empty</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #f8fafc" }}>
                            <img src={item.image_url} alt={item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", background: "#f1f5f9" }} onError={e => e.target.style.display = "none"} />
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.name}</p>
                                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6366f1", fontWeight: 600 }}>€{item.price.toFixed(2)}</p>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14 }}>-</button>
                                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14 }}>+</button>
                                    <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: "auto", border: "none", background: "none", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {cart.length > 0 && (
                    <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Total</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: "#6366f1" }}>€{total.toFixed(2)}</span>
                        </div>
                        <button style={{ width: "100%", padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>
                            Checkout
                        </button>
                        <button onClick={clearCart} style={{ width: "100%", padding: "10px", borderRadius: 10, background: "transparent", color: "#94a3b8", border: "1px solid #e2e8f0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}