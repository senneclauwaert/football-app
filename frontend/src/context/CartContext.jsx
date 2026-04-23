import { createContext, useContext, useState } from "react"
import toast from "react-hot-toast"

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])

    function addToCart(item) {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
            }
            return [...prev, { ...item, qty: 1 }]
        })
        toast.success(`${item.name} added to cart`)
    }

    function removeFromCart(id) {
        const item = cart.find(i => i.id === id)
        setCart(prev => prev.filter(i => i.id !== id))
        if (item) toast.error(`${item.name} removed`)
    }

    function updateQty(id, qty) {
        if (qty <= 0) return removeFromCart(id)
        setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
    }

    function clearCart() {
        setCart([])
        toast.error("Cart cleared")
    }

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
    const count = cart.reduce((sum, i) => sum + i.qty, 0)

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}