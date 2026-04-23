import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../api/shop'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'other',
  sizes: [],
  stock_quantity: '',
  is_available: true,
  color_label: '',
}

const CATEGORIES = [
  { value: 'shirt',     label: 'Shirt' },
  { value: 'scarf',     label: 'Sjaal' },
  { value: 'hat',       label: 'Pet' },
  { value: 'jacket',    label: 'Jas' },
  { value: 'cap',       label: 'Cap' },
  { value: 'accessory', label: 'Accessoire' },
  { value: 'kids',      label: 'Kinderen' },
  { value: 'other',     label: 'Overig' },
]

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function Badge({ label, color }) {
  return (
    <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, background: color + '22', color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {label}
    </span>
  )
}

function FormPanel({ form, setForm, onSave, onClose, saving, editId }) {
  const handle = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const toggleSize = size => {
    const next = form.sizes.includes(size)
      ? form.sizes.filter(s => s !== size)
      : [...form.sizes, size]
    handle('sizes', next)
  }

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>{editId ? 'PRODUCT BEWERKEN' : 'NIEUW PRODUCT'}</h2>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={labelStyle}>
              Naam
              <input value={form.name} onChange={e => handle('name', e.target.value)} style={inputStyle} placeholder="Productnaam..." />
            </label>

            <label style={labelStyle}>
              Omschrijving
              <textarea value={form.description} onChange={e => handle('description', e.target.value)} style={{ ...inputStyle, height: 90, resize: 'vertical' }} placeholder="Productomschrijving..." />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Prijs (€)
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => handle('price', e.target.value)} style={inputStyle} placeholder="0.00" />
              </label>
              <label style={labelStyle}>
                Voorraad
                <input type="number" min="0" value={form.stock_quantity} onChange={e => handle('stock_quantity', e.target.value)} style={inputStyle} placeholder="0" />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Categorie
                <select value={form.category} onChange={e => handle('category', e.target.value)} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                Kleur label
                <input value={form.color_label} onChange={e => handle('color_label', e.target.value)} style={inputStyle} placeholder="bv. Oranje/Zwart" />
              </label>
            </div>

            <div>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Maten</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ALL_SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    style={{
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      border: form.sizes.includes(size) ? '2px solid #FF6200' : '1px solid #2a2a2a',
                      background: form.sizes.includes(size) ? 'rgba(255,98,0,0.15)' : '#111',
                      color: form.sizes.includes(size) ? '#FF6200' : '#666',
                      cursor: 'pointer',
                      borderRadius: 0,
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
              <input type="checkbox" checked={form.is_available} onChange={e => handle('is_available', e.target.checked)} style={{ accentColor: '#FF6200', width: 16, height: 16 }} />
              Beschikbaar in shop
            </label>
          </div>
        </div>

        <div style={panelFooterStyle}>
          <button onClick={onClose} style={secondaryBtnStyle}>Annuleren</button>
          <button onClick={onSave} disabled={saving} style={primaryBtnStyle}>
            {saving ? 'Opslaan...' : editId ? 'Bijwerken' : 'Aanmaken'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminShop() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getAllProducts()
      .then(data => { setItems(data || []); setLoading(false) })
      .catch(() => { setError('Kon producten niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setPanelOpen(true) }

  const openEdit = item => {
    setForm({
      name:           item.name || '',
      description:    item.description || '',
      price:          item.price != null ? String(item.price) : '',
      category:       item.category || 'other',
      sizes:          Array.isArray(item.sizes) ? item.sizes : [],
      stock_quantity: item.stock_quantity != null ? String(item.stock_quantity) : '',
      is_available:   item.is_available !== false,
      color_label:    item.color_label || '',
    })
    setEditId(item.id)
    setPanelOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = {
      ...form,
      price:          form.price !== '' ? parseFloat(form.price) : 0,
      stock_quantity: form.stock_quantity !== '' ? parseInt(form.stock_quantity) : 0,
    }
    try {
      editId ? await updateProduct(editId, payload) : await createProduct(payload)
      setPanelOpen(false)
      load()
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Product verwijderen?')) return
    try { await deleteProduct(id); load() }
    catch { alert('Verwijderen mislukt') }
  }

  const catLabel = v => CATEGORIES.find(c => c.value === v)?.label ?? v

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>SHOP</h1>
          <p style={pageSub}>{items.length} product{items.length !== 1 ? 'en' : ''}</p>
        </div>
        <button onClick={openCreate} style={primaryBtnStyle}>
          <Icon name="plus" size={15} />
          Nieuw product
        </button>
      </div>

      {loading ? <Spinner /> : error ? <Empty text={error} /> : items.length === 0 ? <Empty text="Geen producten gevonden" /> : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Naam', 'Categorie', 'Prijs', 'Voorraad', 'Maten', 'Status', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 500 }}>
                    {item.name}
                    {item.color_label && <span style={{ marginLeft: 6, color: '#666', fontWeight: 400, fontSize: 11 }}>{item.color_label}</span>}
                  </td>
                  <td style={tdStyle}><Badge label={catLabel(item.category)} color="#3b82f6" /></td>
                  <td style={{ ...tdStyle, color: '#FF6200', fontWeight: 600 }}>
                    {item.price != null ? `€${Number(item.price).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ ...tdStyle, color: item.stock_quantity <= 5 ? '#ef4444' : '#aaa' }}>
                    {item.stock_quantity ?? 0}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 11, color: '#666' }}>
                    {Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes.join(', ') : '—'}
                  </td>
                  <td style={tdStyle}>
                    {item.is_available
                      ? <Badge label="Beschikbaar" color="#10b981" />
                      : <Badge label="Niet beschikbaar" color="#666" />}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <ActionBtn icon="edit" title="Bewerken" onClick={() => openEdit(item)} color="#3b82f6" />
                      <ActionBtn icon="trash" title="Verwijderen" onClick={() => handleDelete(item.id)} color="#ef4444" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panelOpen && (
        <FormPanel form={form} setForm={setForm} onSave={handleSave} onClose={() => setPanelOpen(false)} saving={saving} editId={editId} />
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
const panelStyle = { width: 520, maxWidth: '100vw', height: '100vh', background: '#1a1a1a', borderLeft: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
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
