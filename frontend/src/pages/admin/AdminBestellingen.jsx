import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getOrders, updateOrder } from '../../api/shop'

const STATUSES = [
  { value: 'pending',   label: 'In afwachting' },
  { value: 'paid',      label: 'Betaald' },
  { value: 'shipped',   label: 'Verzonden' },
  { value: 'delivered', label: 'Geleverd' },
  { value: 'cancelled', label: 'Geannuleerd' },
]

const statusColor = v => ({
  pending:   '#f59e0b',
  paid:      '#10b981',
  shipped:   '#3b82f6',
  delivered: '#06b6d4',
  cancelled: '#ef4444',
}[v] ?? '#666')

const statusLabel = v => STATUSES.find(s => s.value === v)?.label ?? v

function Badge({ label, color }) {
  return (
    <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, background: color + '22', color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {label}
    </span>
  )
}

function DetailPanel({ order, onSave, onClose, saving }) {
  const [status, setStatus] = useState(order.status || 'pending')
  const [notes, setNotes] = useState(order.notes || '')

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>BESTELLING #{order.id}</h2>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Customer info */}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Klantgegevens</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ color: '#555', fontSize: 11 }}>Naam</div>
                <div style={{ color: '#fff', fontSize: 13 }}>{order.customer_name}</div>
              </div>
              <div>
                <div style={{ color: '#555', fontSize: 11 }}>E-mail</div>
                <div style={{ color: '#fff', fontSize: 13 }}>{order.customer_email}</div>
              </div>
              {order.customer_phone && (
                <div>
                  <div style={{ color: '#555', fontSize: 11 }}>Telefoon</div>
                  <div style={{ color: '#fff', fontSize: 13 }}>{order.customer_phone}</div>
                </div>
              )}
              {order.customer_address && (
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ color: '#555', fontSize: 11 }}>Adres</div>
                  <div style={{ color: '#fff', fontSize: 13 }}>{order.customer_address}</div>
                </div>
              )}
              <div>
                <div style={{ color: '#555', fontSize: 11 }}>Datum</div>
                <div style={{ color: '#aaa', fontSize: 13 }}>{fmtDate(order.created_at)}</div>
              </div>
              {order.mollie_payment_id && (
                <div>
                  <div style={{ color: '#555', fontSize: 11 }}>Mollie ID</div>
                  <div style={{ color: '#666', fontSize: 12, fontFamily: 'monospace' }}>{order.mollie_payment_id}</div>
                </div>
              )}
            </div>
          </div>

          {/* Order items */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Artikelen</div>
            <div style={{ background: '#111', border: '1px solid #2a2a2a' }}>
              {(order.items || []).map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: i < order.items.length - 1 ? '1px solid #2a2a2a' : 'none',
                  }}
                >
                  <div>
                    <div style={{ color: '#fff', fontSize: 13 }}>
                      Artikel #{item.shop_item_id}
                      {item.size && <span style={{ marginLeft: 8, color: '#555', fontSize: 11 }}>maat: {item.size}</span>}
                    </div>
                    <div style={{ color: '#555', fontSize: 11 }}>Aantal: {item.quantity}</div>
                  </div>
                  <div style={{ color: '#aaa', fontSize: 13 }}>
                    €{(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid #2a2a2a' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8 }}>Totaal</span>
                <span style={{ fontFamily: 'Anton, Impact, sans-serif', color: '#FF6200', fontSize: 16 }}>
                  €{order.total != null ? Number(order.total).toFixed(2) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Status + notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={labelStyle}>
              Status
              <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              Notities
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                placeholder="Interne notities..."
              />
            </label>
          </div>
        </div>

        <div style={panelFooterStyle}>
          <button onClick={onClose} style={secondaryBtnStyle}>Sluiten</button>
          <button onClick={() => onSave({ status, notes })} disabled={saving} style={primaryBtnStyle}>
            {saving ? 'Opslaan...' : 'Bijwerken'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBestellingen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getOrders()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items ?? [])
        list.sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0))
        setOrders(list)
        setLoading(false)
      })
      .catch(() => { setError('Kon bestellingen niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const handleSave = async (update) => {
    setSaving(true)
    try {
      await updateOrder(selectedOrder.id, update)
      setSelectedOrder(null)
      load()
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>BESTELLINGEN</h1>
          <p style={pageSub}>{orders.length} bestelling{orders.length !== 1 ? 'en' : ''}</p>
        </div>
      </div>

      {loading ? <Spinner /> : error ? <Empty text={error} /> : orders.length === 0 ? <Empty text="Geen bestellingen gevonden" /> : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['#', 'Klant', 'E-mail', 'Datum', 'Artikelen', 'Totaal', 'Status', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr
                  key={o.id}
                  style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: '#555', fontSize: 12 }}>#{o.id}</td>
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 500 }}>{o.customer_name}</td>
                  <td style={{ ...tdStyle, color: '#888', fontSize: 12 }}>{o.customer_email}</td>
                  <td style={{ ...tdStyle, color: '#666', fontSize: 12 }}>{fmtDate(o.created_at)}</td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{(o.items || []).length}</td>
                  <td style={{ ...tdStyle, fontFamily: 'Anton, Impact, sans-serif', color: '#FF6200', fontSize: 14 }}>
                    {o.total != null ? `€${Number(o.total).toFixed(2)}` : '—'}
                  </td>
                  <td style={tdStyle}>
                    <Badge label={statusLabel(o.status)} color={statusColor(o.status)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <ActionBtn icon="eye" title="Bekijken / bewerken" onClick={() => setSelectedOrder(o)} color="#3b82f6" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <DetailPanel
          order={selectedOrder}
          onSave={handleSave}
          onClose={() => setSelectedOrder(null)}
          saving={saving}
        />
      )}
    </AdminLayout>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#555', fontSize: 13, padding: 32 }}>
      <div style={{ width: 18, height: 18, border: '2px solid #FF6200', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Laden...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Empty({ text }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#555', fontSize: 14 }}>
      {text}
    </div>
  )
}

function ActionBtn({ icon, title, onClick, color }) {
  return (
    <button title={title} onClick={onClick} style={{ background: color + '18', border: 'none', borderRadius: 0, padding: '5px 8px', cursor: 'pointer', color, display: 'flex', alignItems: 'center' }}>
      <Icon name={icon} size={14} color={color} />
    </button>
  )
}

const overlayStyle = { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.7)' }
const panelStyle = { width: 540, maxWidth: '100vw', height: '100vh', background: '#1a1a1a', borderLeft: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
const panelHeaderStyle = { padding: '20px 24px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const panelTitleStyle = { fontFamily: 'Anton, Impact, sans-serif', fontSize: 18, color: '#fff', margin: 0, letterSpacing: 1 }
const panelFooterStyle = { padding: '16px 24px', borderTop: '1px solid #2a2a2a', display: 'flex', gap: 10, justifyContent: 'flex-end' }
const iconBtnStyle = { background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }
const pageTitle = { fontFamily: 'Anton, Impact, sans-serif', fontSize: 28, color: '#fff', margin: 0, letterSpacing: 1 }
const pageSub = { color: '#555', fontSize: 13, margin: '4px 0 0' }
const thStyle = { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }
const tdStyle = { padding: '12px 16px', fontSize: 13, color: '#aaa', verticalAlign: 'middle' }
const labelStyle = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8 }
const inputStyle = { padding: '9px 12px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 0, color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }
const primaryBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#FF6200', border: 'none', borderRadius: 0, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }
const secondaryBtnStyle = { padding: '9px 18px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 0, color: '#888', fontSize: 13, cursor: 'pointer' }
