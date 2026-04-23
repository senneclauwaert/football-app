import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import CartDrawer from '../components/CartDrawer'
import Icon from '../components/Icon'
import { useCart } from '../context/CartContext'
import { getProducts } from '../api/shop'

const CATEGORIES = ['shirt', 'scarf', 'hat', 'jacket', 'cap', 'accessory', 'kids', 'other']
const CAT_LABELS = {
  shirt: 'Shirt', scarf: 'Sjaal', hat: 'Muts',
  jacket: 'Jas', cap: 'Pet', accessory: 'Accessoires', kids: 'Kids', other: 'Overige',
}

export default function Shop() {
  const [catFilter, setCatFilter] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [sizeModal, setSizeModal] = useState(null) // { product }
  const [selectedSize, setSelectedSize] = useState(null)
  const { addToCart, count } = useCart()
  const navigate = useNavigate()

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
      {/* Hero */}
      <div style={{
        background: '#111', borderRadius: 12, padding: '28px 28px',
        marginBottom: 24, overflow: 'hidden', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ position: 'absolute', left: -40, top: -40, width: 200, height: 200, background: 'var(--orange)', transform: 'rotate(25deg)', opacity: 0.12 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="display" style={{ fontSize: 32, color: '#fff', margin: '0 0 8px' }}>Clubshop</h2>
          <p style={{ color: '#aaa', margin: 0, fontSize: 14 }}>Officiële merchandise van Toekomst Relegem</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--orange)', color: '#fff',
            padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 14,
          }}
        >
          <Icon name="cart" size={18} />
          Winkelwagen {count > 0 && `(${count})`}
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => setCatFilter(null)}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            background: !catFilter ? 'var(--orange)' : 'var(--paper-2)',
            color: !catFilter ? '#fff' : '#666',
          }}
        >
          Alle
        </button>
        {usedCats.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(catFilter === c ? null : c)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              background: catFilter === c ? 'var(--orange)' : 'var(--paper-2)',
              color: catFilter === c ? '#fff' : '#666',
            }}
          >
            {CAT_LABELS[c] || c}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Geen producten gevonden</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filtered.map(p => (
            <div
              key={p.id}
              style={{
                background: '#fff', borderRadius: 12, border: '1px solid var(--line)',
                overflow: 'hidden',
              }}
            >
              {/* Image */}
              <div style={{ background: 'var(--paper-2)', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Icon name="shop" size={48} color="#ccc" />
                )}
              </div>
              <div style={{ padding: '14px 16px' }}>
                {p.category && (
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {CAT_LABELS[p.category] || p.category}
                  </span>
                )}
                <div style={{ fontWeight: 600, fontSize: 15, margin: '4px 0 6px' }}>{p.name}</div>
                {p.color_label && <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{p.color_label}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--orange)' }}>€{Number(p.price).toFixed(2)}</span>
                  <button
                    onClick={() => handleAddToCart(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--orange)', color: '#fff',
                      padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <Icon name="cart" size={14} />
                    Kopen
                  </button>
                </div>
                {p.stock_quantity !== undefined && p.stock_quantity < 5 && p.stock_quantity > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>Nog {p.stock_quantity} op voorraad</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Size selection modal */}
      {sizeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSizeModal(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 300 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Kies je maat</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {sizeModal.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                    border: '2px solid',
                    borderColor: selectedSize === s ? 'var(--orange)' : 'var(--line)',
                    background: selectedSize === s ? 'var(--orange-soft)' : '#fff',
                    color: selectedSize === s ? 'var(--orange)' : '#666',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={confirmSize}
              style={{ width: '100%', padding: '12px', background: 'var(--orange)', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 15 }}
            >
              In winkelwagen
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
