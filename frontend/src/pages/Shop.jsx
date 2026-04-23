import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import CartDrawer from '../components/CartDrawer'
import Icon from '../components/Icon'
import { useCart } from '../context/CartContext'
import { getProducts } from '../api/shop'

const CATEGORIES = ['shirt', 'scarf', 'hat', 'jacket', 'cap', 'accessory', 'kids', 'other']
const CAT_LABELS = {
  shirt: 'Shirts', scarf: 'Sjaals', hat: 'Mutsen',
  jacket: 'Jassen', cap: 'Petten', accessory: 'Accessoires', kids: 'Kids', other: 'Overige',
}

function fmtEur(n) {
  return `€${Number(n).toFixed(2).replace('.', ',')}`
}

export default function Shop() {
  const [catFilter, setCatFilter] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [sizeModal, setSizeModal] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const { addToCart, count } = useCart()

  const { data: products = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts })

  const filtered = catFilter ? products.filter(p => p.category === catFilter) : products
  const usedCats = [...new Set(products.map(p => p.category).filter(Boolean))]

  const handleAddToCart = (product) => {
    if (product.sizes?.length > 0) {
      setSizeModal(product)
      setSelectedSize(product.sizes[0])
    } else {
      addToCart({ id: product.id, name: product.name, price: product.price, category: product.category })
      setCartOpen(true)
    }
  }

  const confirmSize = () => {
    if (!sizeModal) return
    addToCart({ id: sizeModal.id, name: sizeModal.name, price: sizeModal.price, size: selectedSize, category: sizeModal.category })
    setSizeModal(null)
    setCartOpen(true)
  }

  return (
    <Layout title="Shop">
      {/* ── Striped hero ── */}
      <div style={{
        background: 'repeating-linear-gradient(135deg, #ff6a13 0 40px, #0a0a0a 40px 80px)',
        padding: 28,
        borderRadius: 3,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          background: 'rgba(0,0,0,.55)',
          padding: '20px 22px',
          borderRadius: 2,
          maxWidth: 420,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--orange)', letterSpacing: '.15em' }}>
              OFFICIËLE FANSHOP
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 6, color: '#fff' }}>
              Draag de kleuren
            </div>
            <p style={{ color: '#ccc', margin: '8px 0 0', fontSize: 13, lineHeight: 1.4 }}>
              Shirts, sjaals & meer. Gratis ophaling aan het clubhuis.
            </p>
          </div>
        </div>
        {/* Cart button overlay */}
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'absolute', top: 20, right: 20,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,0,0,.7)',
            border: '1px solid rgba(255,255,255,.15)',
            color: '#fff',
            padding: '9px 16px',
            borderRadius: 3,
            fontSize: 13,
            fontWeight: 600,
            transition: 'background .12s, transform .08s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0a0a0a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,.7)'; e.currentTarget.style.transform = '' }}
        >
          <Icon name="cart" size={16} />
          Winkelmand {count > 0 && `(${count})`}
        </button>
      </div>

      {/* ── Category filter ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => setCatFilter(null)}
          className={`pill ${!catFilter ? 'pill-ink' : 'pill-ghost'}`}
          style={{ cursor: 'pointer', padding: '8px 14px' }}
        >
          Alles
        </button>
        {usedCats.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(catFilter === c ? null : c)}
            className={`pill ${catFilter === c ? 'pill-ink' : 'pill-ghost'}`}
            style={{ cursor: 'pointer', padding: '8px 14px' }}
          >
            {CAT_LABELS[c] || c}
          </button>
        ))}
      </div>

      {/* ── Products grid ── */}
      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 60, fontSize: 14 }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          color: '#888', textAlign: 'center', padding: 60,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 3, fontSize: 14,
        }}>
          Geen producten gevonden
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="card-in"
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform .08s, box-shadow .12s',
                willChange: 'transform',
                animationDelay: `${Math.min(i * 50, 300)}ms`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              {/* Image / placeholder */}
              <div style={{
                background: 'var(--paper-2)',
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,.04) 0 8px, transparent 8px 16px)',
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <>
                    <div style={{
                      fontFamily: 'Anton, Impact, sans-serif',
                      fontSize: 11,
                      color: '#bbb',
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                    }}>
                      {(p.category || 'PRODUCT').toUpperCase()}
                    </div>
                  </>
                )}
                {p.stock_quantity !== undefined && p.stock_quantity < 5 && p.stock_quantity > 0 && (
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    background: 'var(--red)', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '3px 7px',
                    borderRadius: 2, letterSpacing: '.05em',
                  }}>
                    BIJNA OP
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {p.category && (
                  <div style={{ fontSize: 11, color: '#888', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                    {CAT_LABELS[p.category] || p.category}
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, lineHeight: 1.25, flex: 1 }}>{p.name}</div>
                {p.color_label && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{p.color_label}</div>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginTop: 12,
                }}>
                  <div className="display" style={{ fontSize: 22, color: 'var(--orange-hot)' }}>
                    {fmtEur(p.price)}
                  </div>
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="btn btn-orange"
                    style={{ padding: '8px 14px', fontSize: 12, borderRadius: 3 }}
                  >
                    <Icon name="cart" size={13} />
                    Kopen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Size modal */}
      {sizeModal && (
        <div
          className="backdrop-in"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.55)',
            zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setSizeModal(null)}
        >
          <div
            className="sheet-in"
            style={{
              background: '#fff',
              borderRadius: 3,
              padding: 24,
              width: '100%',
              maxWidth: 360,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 className="display" style={{ fontSize: 22, margin: 0 }}>Kies je maat</h3>
              <button
                onClick={() => setSizeModal(null)}
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 3, background: 'var(--paper-2)',
                }}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {sizeModal.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: '9px 16px',
                    border: '1.5px solid',
                    borderColor: selectedSize === s ? 'var(--ink)' : 'var(--line)',
                    borderRadius: 2,
                    background: selectedSize === s ? 'var(--ink)' : '#fff',
                    color: selectedSize === s ? '#fff' : 'var(--ink)',
                    fontWeight: 600, fontSize: 13,
                    transition: 'background .1s, border-color .1s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={confirmSize}
              className="btn btn-orange"
              style={{ width: '100%', fontSize: 14, padding: '12px' }}
            >
              <Icon name="cart" size={15} /> In winkelmand
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
