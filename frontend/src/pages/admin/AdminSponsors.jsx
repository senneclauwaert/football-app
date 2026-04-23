import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getSponsors, createSponsor, updateSponsor, deleteSponsor } from '../../api/sponsors'

const EMPTY_FORM = {
  name: '',
  tier: 'bronze',
  sector: '',
  website: '',
  is_active: true,
  sort_order: '',
}

const TIERS = [
  { value: 'main',   label: 'Hoofdsponsor' },
  { value: 'gold',   label: 'Goud' },
  { value: 'silver', label: 'Zilver' },
  { value: 'bronze', label: 'Brons' },
]

const tierColor = v => ({ main: '#FF6200', gold: '#eab308', silver: '#9ca3af', bronze: '#d97706' }[v] ?? '#666')
const tierLabel = v => TIERS.find(t => t.value === v)?.label ?? v

function Badge({ label, color }) {
  return (
    <span style={{ padding: '2px 10px', fontSize: 11, fontWeight: 700, background: color + '22', color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {label}
    </span>
  )
}

function FormPanel({ form, setForm, onSave, onClose, saving, editId }) {
  const handle = (field, value) => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>{editId ? 'SPONSOR BEWERKEN' : 'NIEUWE SPONSOR'}</h2>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={labelStyle}>
              Naam
              <input value={form.name} onChange={e => handle('name', e.target.value)} style={inputStyle} placeholder="Bedrijfsnaam..." />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Niveau
                <select value={form.tier} onChange={e => handle('tier', e.target.value)} style={inputStyle}>
                  {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                Sector
                <input value={form.sector} onChange={e => handle('sector', e.target.value)} style={inputStyle} placeholder="bv. Bouw, Horeca..." />
              </label>
            </div>

            <label style={labelStyle}>
              Website
              <input value={form.website} onChange={e => handle('website', e.target.value)} style={inputStyle} placeholder="https://..." />
            </label>

            <label style={labelStyle}>
              Volgorde (sortering)
              <input type="number" value={form.sort_order} onChange={e => handle('sort_order', e.target.value)} style={inputStyle} placeholder="0" />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
              <input type="checkbox" checked={form.is_active} onChange={e => handle('is_active', e.target.checked)} style={{ accentColor: '#FF6200', width: 16, height: 16 }} />
              Actief
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

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getSponsors()
      .then(data => { setSponsors(data || []); setLoading(false) })
      .catch(() => { setError('Kon sponsors niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setPanelOpen(true) }

  const openEdit = s => {
    setForm({
      name:       s.name || '',
      tier:       s.tier || 'bronze',
      sector:     s.sector || '',
      website:    s.website || '',
      is_active:  s.is_active !== false,
      sort_order: s.sort_order != null ? String(s.sort_order) : '',
    })
    setEditId(s.id)
    setPanelOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = { ...form, sort_order: form.sort_order !== '' ? parseInt(form.sort_order) : 0 }
    try {
      editId ? await updateSponsor(editId, payload) : await createSponsor(payload)
      setPanelOpen(false)
      load()
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Sponsor verwijderen?')) return
    try { await deleteSponsor(id); load() }
    catch { alert('Verwijderen mislukt') }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>SPONSORS</h1>
          <p style={pageSub}>{sponsors.length} sponsor{sponsors.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} style={primaryBtnStyle}>
          <Icon name="plus" size={15} />
          Nieuwe sponsor
        </button>
      </div>

      {loading ? <Spinner /> : error ? <Empty text={error} /> : sponsors.length === 0 ? <Empty text="Geen sponsors gevonden" /> : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Naam', 'Niveau', 'Sector', 'Website', 'Status', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sponsors.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 500 }}>{s.name}</td>
                  <td style={tdStyle}>
                    <Badge label={tierLabel(s.tier)} color={tierColor(s.tier)} />
                  </td>
                  <td style={{ ...tdStyle, color: '#888' }}>{s.sector || '—'}</td>
                  <td style={tdStyle}>
                    {s.website
                      ? <a href={s.website} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: 12, textDecoration: 'none' }}>{s.website.replace(/^https?:\/\//, '')}</a>
                      : <span style={{ color: '#444' }}>—</span>}
                  </td>
                  <td style={tdStyle}>
                    {s.is_active
                      ? <Badge label="Actief" color="#10b981" />
                      : <Badge label="Inactief" color="#666" />}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <ActionBtn icon="edit" title="Bewerken" onClick={() => openEdit(s)} color="#3b82f6" />
                      <ActionBtn icon="trash" title="Verwijderen" onClick={() => handleDelete(s.id)} color="#ef4444" />
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
const panelStyle = { width: 480, maxWidth: '100vw', height: '100vh', background: '#1a1a1a', borderLeft: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
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
