import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Icon from './Icon'

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQty, clearCart, total, count } = useCart()
  const navigate = useNavigate()

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
      />
      {/* Drawer */}
      <div
        className="animate-slide-in"
        style={{
          position: 'fixed', top: 0, right: 0,
          width: 380, maxWidth: '100vw',
          height: '100vh',
          background: 'var(--paper)',
          zIndex: 41,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid var(--line)',
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            Winkelwagen {count > 0 && <span style={{ color: '#ff6a13' }}>({count})</span>}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--paper-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', marginTop: 60 }}>
              <Icon name="cart" size={48} color="#ddd" />
              <p style={{ marginTop: 12 }}>Winkelwagen is leeg</p>
            </div>
          ) : cart.map(item => {
            const key = `${item.id}-${item.size || ''}`
            return (
              <div
                key={key}
                style={{
                  display: 'flex', gap: 12, padding: '14px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                {/* Image placeholder */}
                <div style={{
                  width: 56, height: 56, borderRadius: 8,
                  background: 'var(--paper-2)',
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="shop" size={22} color="#ccc" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.name}</div>
                  {item.size && (
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Maat: {item.size}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => updateQty(item.id, item.size, item.qty - 1)}
                      style={{
                        width: 26, height: 26, borderRadius: 6,
                        border: '1px solid var(--line)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Icon name="minus" size={12} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                      style={{
                        width: 26, height: 26, borderRadius: 6,
                        border: '1px solid var(--line)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Icon name="plus" size={12} />
                    </button>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#ff6a13', fontSize: 14 }}>
                      €{(Number(item.price) * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  style={{ color: '#888', alignSelf: 'flex-start', padding: 4 }}
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 14, fontSize: 16, fontWeight: 700,
            }}>
              <span>Totaal</span>
              <span style={{ color: '#ff6a13' }}>€{total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/shop/afrekenen') }}
              style={{
                width: '100%', padding: '13px',
                background: '#ff6a13', color: '#fff',
                borderRadius: 8, fontWeight: 700, fontSize: 15,
                marginBottom: 8,
              }}
            >
              Afrekenen
            </button>
            <button
              onClick={clearCart}
              style={{
                width: '100%', padding: '10px',
                background: 'var(--paper-2)', color: '#666',
                borderRadius: 8, fontSize: 14,
              }}
            >
              Winkelwagen legen
            </button>
          </div>
        )}
      </div>
    </>
  )
}
