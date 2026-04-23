import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/shop'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, total, clearCart } = useCart()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [done, setDone] = useState(false)

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      clearCart()
      setDone(true)
      toast.success('Bestelling geplaatst!')
    },
    onError: () => toast.error('Er ging iets mis. Probeer opnieuw.'),
  })

  if (cart.length === 0 && !done) {
    return (
      <Layout title="Afrekenen">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: '#888', marginBottom: 16 }}>Je winkelwagen is leeg</p>
          <button onClick={() => navigate('/shop')} style={{ background: 'var(--orange)', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600 }}>
            Naar de shop
          </button>
        </div>
      </Layout>
    )
  }

  if (done) {
    return (
      <Layout title="Bestelling geplaatst">
        <div style={{ textAlign: 'center', padding: 60, maxWidth: 400, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Bedankt!</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>Je bestelling is ontvangen. We nemen binnenkort contact met je op.</p>
          <button onClick={() => navigate('/')} style={{ background: 'var(--orange)', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700 }}>
            Terug naar home
          </button>
        </div>
      </Layout>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      customer_address: form.address,
      items: cart.map(item => ({
        shop_item_id: item.id,
        size: item.size,
        quantity: item.qty,
        unit_price: item.price,
      })),
    })
  }

  const inp = (field, label, type = 'text', req = false) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
        {label} {req && <span style={{ color: 'var(--red)' }}>*</span>}
      </label>
      <input
        type={type}
        required={req}
        value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        style={{
          width: '100%', padding: '10px 12px',
          border: '1px solid var(--line)', borderRadius: 8,
          fontSize: 14, background: '#fff',
        }}
      />
    </div>
  )

  return (
    <Layout title="Afrekenen">
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* Form */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Jouw gegevens</h2>
          <form onSubmit={handleSubmit}>
            {inp('name', 'Naam', 'text', true)}
            {inp('email', 'E-mail', 'email', true)}
            {inp('phone', 'Telefoon', 'tel')}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Adres</label>
              <textarea
                rows={3}
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid var(--line)', borderRadius: 8,
                  fontSize: 14, resize: 'vertical',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                width: '100%', padding: '13px',
                background: mutation.isPending ? '#ccc' : 'var(--orange)',
                color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 16,
              }}
            >
              {mutation.isPending ? 'Bestelling plaatsen...' : 'Bestelling plaatsen'}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Overzicht</h2>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: 16 }}>
            {cart.map(item => {
              const key = `${item.id}-${item.size || ''}`
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                    {item.size && <div style={{ fontSize: 12, color: '#888' }}>Maat: {item.size}</div>}
                    <div style={{ fontSize: 12, color: '#888' }}>x{item.qty}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>€{(Number(item.price) * item.qty).toFixed(2)}</div>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 700, fontSize: 16 }}>
              <span>Totaal</span>
              <span style={{ color: 'var(--orange)' }}>€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
