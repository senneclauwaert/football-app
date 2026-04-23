import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getMatches, updateMatch } from '../../api/matches'

const STATUSES = [
  { value: 'scheduled',  label: 'Gepland' },
  { value: 'live',       label: 'Live' },
  { value: 'finished',   label: 'Gespeeld' },
  { value: 'postponed',  label: 'Uitgesteld' },
  { value: 'cancelled',  label: 'Geannuleerd' },
]

const statusColor = v => ({
  scheduled: '#3b82f6',
  live:       '#10b981',
  finished:   '#888',
  postponed:  '#f59e0b',
  cancelled:  '#ef4444',
}[v] ?? '#666')

const statusLabel = v => STATUSES.find(s => s.value === v)?.label ?? v

function Badge({ label, color }) {
  return (
    <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, background: color + '22', color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {label}
    </span>
  )
}

function EditPanel({ match, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    home_score: match.home_score != null ? String(match.home_score) : '',
    away_score: match.away_score != null ? String(match.away_score) : '',
    status:     match.status || 'scheduled',
  })
  const handle = (field, value) => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={overlayStyle}>
      <div style={{ ...panelStyle, width: 400 }}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>WEDSTRIJD BEWERKEN</h2>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Match info */}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: '12px 16px', marginBottom: 24 }}>
            <p style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>
              {match.date ? new Date(match.date).toLocaleDateString('nl-BE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Datum onbekend'}
            </p>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>
              {match.is_home ? `Toekomst Relegem vs ${match.opponent}` : `${match.opponent} vs Toekomst Relegem`}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Doelpunten thuis
                <input
                  type="number"
                  min="0"
                  value={form.home_score}
                  onChange={e => handle('home_score', e.target.value)}
                  style={inputStyle}
                  placeholder="—"
                />
              </label>
              <label style={labelStyle}>
                Doelpunten uit
                <input
                  type="number"
                  min="0"
                  value={form.away_score}
                  onChange={e => handle('away_score', e.target.value)}
                  style={inputStyle}
                  placeholder="—"
                />
              </label>
            </div>

            <label style={labelStyle}>
              Status
              <select value={form.status} onChange={e => handle('status', e.target.value)} style={inputStyle}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div style={panelFooterStyle}>
          <button onClick={onClose} style={secondaryBtnStyle}>Annuleren</button>
          <button onClick={() => onSave(form)} disabled={saving} style={primaryBtnStyle}>
            {saving ? 'Opslaan...' : 'Bijwerken'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminWedstrijden() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editMatch, setEditMatch] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getMatches()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items ?? [])
        list.sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0))
        setMatches(list)
        setLoading(false)
      })
      .catch(() => { setError('Kon wedstrijden niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      await updateMatch(editMatch.id, {
        home_score: form.home_score !== '' ? parseInt(form.home_score) : null,
        away_score: form.away_score !== '' ? parseInt(form.away_score) : null,
        status:     form.status,
      })
      setEditMatch(null)
      load()
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const fmtScore = m => {
    if (m.home_score != null && m.away_score != null) return `${m.home_score} - ${m.away_score}`
    return '—'
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>WEDSTRIJDEN</h1>
          <p style={pageSub}>{matches.length} wedstrijd{matches.length !== 1 ? 'en' : ''} — beheerd door de scraper</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', fontSize: 12, color: '#555' }}>
          <Icon name="whistle" size={13} />
          Alleen score &amp; status aanpasbaar
        </div>
      </div>

      {loading ? <Spinner /> : error ? <Empty text={error} /> : matches.length === 0 ? <Empty text="Geen wedstrijden gevonden" /> : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Datum', 'Tegenstander', 'T/U', 'Score', 'Status', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, fontSize: 12, color: '#666' }}>
                    {m.date ? new Date(m.date).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 500 }}>{m.opponent || '—'}</td>
                  <td style={tdStyle}>
                    <Badge
                      label={m.is_home ? 'Thuis' : 'Uit'}
                      color={m.is_home ? '#10b981' : '#3b82f6'}
                    />
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'Anton, Impact, sans-serif', color: '#FF6200', fontSize: 15 }}>
                    {fmtScore(m)}
                  </td>
                  <td style={tdStyle}>
                    <Badge label={statusLabel(m.status)} color={statusColor(m.status)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <ActionBtn icon="edit" title="Score/status aanpassen" onClick={() => setEditMatch(m)} color="#3b82f6" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editMatch && (
        <EditPanel
          match={editMatch}
          onSave={handleSave}
          onClose={() => setEditMatch(null)}
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
