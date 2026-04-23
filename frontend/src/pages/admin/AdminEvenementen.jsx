import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../../api/events'

const EMPTY_FORM = {
  title: '',
  description: '',
  date: '',
  end_date: '',
  location: '',
  event_type: 'social',
  price: '',
  is_published: false,
}

const EVENT_TYPES = [
  { value: 'social',       label: 'Sociaal' },
  { value: 'tournament',   label: 'Toernooi' },
  { value: 'celebration',  label: 'Feest' },
  { value: 'sponsor',      label: 'Sponsor' },
]

function Badge({ label, color }) {
  return (
    <span style={{
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 600,
      background: color + '22',
      color,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    }}>
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
          <h2 style={panelTitleStyle}>{editId ? 'EVENEMENT BEWERKEN' : 'NIEUW EVENEMENT'}</h2>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={labelStyle}>
              Titel
              <input
                value={form.title}
                onChange={e => handle('title', e.target.value)}
                style={inputStyle}
                placeholder="Naam van het evenement..."
              />
            </label>

            <label style={labelStyle}>
              Omschrijving
              <textarea
                value={form.description}
                onChange={e => handle('description', e.target.value)}
                style={{ ...inputStyle, height: 100, resize: 'vertical' }}
                placeholder="Beschrijving..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Startdatum & -tijd
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={e => handle('date', e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Einddatum & -tijd
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={e => handle('end_date', e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>

            <label style={labelStyle}>
              Locatie
              <input
                value={form.location}
                onChange={e => handle('location', e.target.value)}
                style={inputStyle}
                placeholder="Locatienaam of adres..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Type
                <select value={form.event_type} onChange={e => handle('event_type', e.target.value)} style={inputStyle}>
                  {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                Prijs (€)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => handle('price', e.target.value)}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </label>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={e => handle('is_published', e.target.checked)}
                style={{ accentColor: '#FF6200', width: 16, height: 16 }}
              />
              Gepubliceerd
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

export default function AdminEvenementen() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getAllEvents()
      .then(data => { setEvents(data || []); setLoading(false) })
      .catch(() => { setError('Kon evenementen niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setPanelOpen(true)
  }

  const openEdit = ev => {
    const fmtDate = d => d ? d.slice(0, 16) : ''
    setForm({
      title:        ev.title || '',
      description:  ev.description || '',
      date:         fmtDate(ev.date),
      end_date:     fmtDate(ev.end_date),
      location:     ev.location || '',
      event_type:   ev.event_type || 'social',
      price:        ev.price != null ? String(ev.price) : '',
      is_published: ev.is_published || false,
    })
    setEditId(ev.id)
    setPanelOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = {
      ...form,
      price: form.price !== '' ? parseFloat(form.price) : null,
      end_date: form.end_date || null,
    }
    try {
      editId ? await updateEvent(editId, payload) : await createEvent(payload)
      setPanelOpen(false)
      load()
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Evenement verwijderen?')) return
    try {
      await deleteEvent(id)
      load()
    } catch {
      alert('Verwijderen mislukt')
    }
  }

  const typeLabel = v => EVENT_TYPES.find(t => t.value === v)?.label ?? v
  const typeColor = v => ({ social: '#3b82f6', tournament: '#FF6200', celebration: '#ec4899', sponsor: '#f59e0b' }[v] ?? '#666')

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>EVENEMENTEN</h1>
          <p style={pageSub}>{events.length} evenement{events.length !== 1 ? 'en' : ''}</p>
        </div>
        <button onClick={openCreate} style={primaryBtnStyle}>
          <Icon name="plus" size={15} />
          Nieuw evenement
        </button>
      </div>

      {loading ? <Spinner /> : error ? <Empty text={error} /> : events.length === 0 ? <Empty text="Geen evenementen gevonden" /> : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Titel', 'Datum', 'Locatie', 'Type', 'Prijs', 'Status', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr
                  key={ev.id}
                  style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 500 }}>{ev.title}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>
                    {ev.date ? new Date(ev.date).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ ...tdStyle, color: '#888' }}>{ev.location || '—'}</td>
                  <td style={tdStyle}>
                    <Badge label={typeLabel(ev.event_type)} color={typeColor(ev.event_type)} />
                  </td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>
                    {ev.price != null ? `€${Number(ev.price).toFixed(2)}` : 'Gratis'}
                  </td>
                  <td style={tdStyle}>
                    {ev.is_published
                      ? <Badge label="Gepubliceerd" color="#10b981" />
                      : <Badge label="Concept" color="#666" />}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <ActionBtn icon="edit" title="Bewerken" onClick={() => openEdit(ev)} color="#3b82f6" />
                      <ActionBtn icon="trash" title="Verwijderen" onClick={() => handleDelete(ev.id)} color="#ef4444" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panelOpen && (
        <FormPanel
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setPanelOpen(false)}
          saving={saving}
          editId={editId}
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
