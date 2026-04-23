import { createContext, useContext, useState } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  // item: { id, name, price, size, category }
  const addToCart = (item) => {
    const key = `${item.id}-${item.size || ''}`
    setCart(prev => {
      const existing = prev.find(i => `${i.id}-${i.size || ''}` === key)
      if (existing) {
        return prev.map(i => `${i.id}-${i.size || ''}` === key ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
    toast.success(`${item.name} toegevoegd aan winkelwagen`)
  }

  const removeFromCart = (id, size) => {
    const key = `${id}-${size || ''}`
    setCart(prev => prev.filter(i => `${i.id}-${i.size || ''}` !== key))
  }

  const updateQty = (id, size, qty) => {
    if (qty <= 0) return removeFromCart(id, size)
    const key = `${id}-${size || ''}`
    setCart(prev => prev.map(i => `${i.id}-${i.size || ''}` === key ? { ...i, qty } : i))
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((sum, i) => sum + Number(i.price) * i.qty, 0)
  const count = cart.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
