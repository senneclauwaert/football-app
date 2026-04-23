import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Icon from './Icon'

function fmtEur(n) {
  return `€${Number(n).toFixed(2).replace('.', ',')}`
}

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQty, clearCart, total, count } = useCart()
  const navigate = useNavigate()

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="backdrop-in"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.55)',
          zIndex: 100,
        }}
      />

      {/* Drawer */}
      <div
        className="animate-slide-in"
        style={{
          position: 'fixed',
          top: 0, right: 0,
          width: 400, maxWidth: '100vw',
          height: '100vh',
          background: 'var(--paper)',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-12px 0 50px rgba(0,0,0,.2)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper)',
          position: 'sticky', top: 0, zIndex: 2,
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: '.01em',
            textTransform: 'uppercase',
          }}>
            Winkelmand
            {count > 0 && (
              <span style={{
                marginLeft: 8,
                background: 'var(--orange)',
                color: '#000',
                fontSize: 12,
                fontFamily: 'Inter, system-ui',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 2,
                verticalAlign: 'middle',
              }}>
                {count}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34,
              borderRadius: 3,
              background: 'var(--paper-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--paper-2)'}
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>
              <Icon name="cart" size={48} color="#ddd" />
              <p style={{ marginTop: 12, fontSize: 14 }}>Je winkelmand is leeg.</p>
            </div>
          ) : (
            cart.map(item => {
              const key = `${item.id}-${item.size || ''}`
              return (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr auto',
                    gap: 12,
                    padding: '14px 0',
                    borderBottom: '1px solid var(--line)',
                    alignItems: 'center',
                  }}
                >
                  {/* Product placeholder */}
                  <div style={{
                    width: 60, height: 60,
                    borderRadius: 2,
                    background: 'var(--paper-2)',
                    backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,.04) 0 6px, transparent 6px 12px)',
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="shop" size={20} color="#bbb" />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{item.name}</div>
                    {item.size && (
                      <div className="mono" style={{ fontSize: 11, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Maat {item.size}
                      </div>
                    )}
                    {/* Qty controls */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 2 }}>
                      <button
                        onClick={() => updateQty(item.id, item.size, item.qty - 1)}
                        style={{ padding: '4px 8px', display: 'flex' }}
                      >
                        <Icon name="minus" size={12} />
                      </button>
                      <div style={{ padding: '0 10px', fontSize: 13, fontWeight: 700 }}>{item.qty}</div>
                      <button
                        onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                        style={{ padding: '4px 8px', display: 'flex' }}
                      >
                        <Icon name="plus" size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="display" style={{ fontSize: 18, marginBottom: 6 }}>
                      {fmtEur(Number(item.price) * item.qty)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      style={{ fontSize: 11, color: '#888', transition: 'color .1s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = '#888'}
                    >
                      Verwijder
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0 16px',
              borderBottom: '2px solid var(--ink)',
              marginBottom: 14,
            }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Totaal</span>
              <span className="display" style={{ fontSize: 26, color: 'var(--orange-hot)' }}>
                {fmtEur(total)}
              </span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/shop/afrekenen') }}
              className="btn btn-orange"
              style={{ width: '100%', fontSize: 14, padding: '13px', marginBottom: 8, borderRadius: 3 }}
            >
              Afrekenen <Icon name="arrowRight" size={15} />
            </button>
            <button
              onClick={clearCart}
              style={{
                width: '100%', padding: '10px',
                background: 'transparent',
                color: '#888',
                border: '1px solid var(--line)',
                borderRadius: 3,
                fontSize: 13,
                transition: 'background .12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Winkelmand legen
            </button>
          </div>
        )}
      </div>
    </>
  )
}
