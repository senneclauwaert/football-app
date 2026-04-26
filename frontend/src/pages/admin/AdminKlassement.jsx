import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getStandings, getCompetitions, updateStanding } from '../../api/standings'

function EditPanel({ row, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    position:       row.position ?? '',
    played:         row.played ?? 0,
    won:            row.won ?? 0,
    drawn:          row.drawn ?? 0,
    lost:           row.lost ?? 0,
    goals_for:      row.goals_for ?? 0,
    goals_against:  row.goals_against ?? 0,
    goal_diff:      row.goal_diff ?? 0,
    points:         row.points ?? 0,
    form:           row.form || '',
    is_us:          row.is_us ?? false,
  })
  const handle = (field, value) => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={overlayStyle}>
      <div style={{ ...panelStyle, width: 440 }}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>KLASSEMENT BEWERKEN</h2>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: '12px 16px', marginBottom: 24 }}>
            <p style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>Team</p>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{row.team_name}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={labelStyle}>
                Positie
                <input type="number" min="1" value={form.position} onChange={e => handle('position', e.target.value)} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Punten
                <input type="number" min="0" value={form.points} onChange={e => handle('points', parseInt(e.target.value) || 0)} style={inputStyle} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
              {[
                { field: 'played', label: 'Gespeeld' },
                { field: 'won',    label: 'Gewonnen' },
                { field: 'drawn',  label: 'Gelijk' },
                { field: 'lost',   label: 'Verloren' },
              ].map(({ field, label }) => (
                <label key={field} style={labelStyle}>
                  {label}
                  <input type="number" min="0" value={form[field]} onChange={e => handle(field, parseInt(e.target.value) || 0)} style={inputStyle} />
                </label>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { field: 'goals_for',     label: 'Goals voor' },
                { field: 'goals_against', label: 'Goals tegen' },
                { field: 'goal_diff',     label: 'Doelsaldo' },
              ].map(({ field, label }) => (
                <label key={field} style={labelStyle}>
                  {label}
                  <input type="number" value={form[field]} onChange={e => handle(field, parseInt(e.target.value) || 0)} style={inputStyle} />
                </label>
              ))}
            </div>

            <label style={labelStyle}>
              Vorm (bijv. WDWLW)
              <input value={form.form} onChange={e => handle('form', e.target.value)} style={inputStyle} placeholder="WDWLW" />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.is_us}
                onChange={e => handle('is_us', e.target.checked)}
                style={{ accentColor: '#FF6200', width: 16, height: 16 }}
              />
              Dit is Toekomst Relegem
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

export default function AdminKlassement() {
  const [competitions, setCompetitions] = useState([])
  const [selectedComp, setSelectedComp] = useState('')
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCompetitions()
      .then(data => {
        const list = data || []
        setCompetitions(list)
        if (list.length > 0) setSelectedComp(String(list[0].id))
      })
      .catch(() => setError('Kon competities niet laden'))
  }, [])

  useEffect(() => {
    if (!selectedComp) return
    setLoading(true)
    getStandings(selectedComp)
      .then(data => {
        const sorted = (data || []).slice().sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
        setStandings(sorted)
        setLoading(false)
      })
      .catch(() => { setError('Kon klassement niet laden'); setLoading(false) })
  }, [selectedComp])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      await updateStanding(editRow.id, {
        position:      form.position !== '' ? parseInt(form.position) : null,
        played:        form.played,
        won:           form.won,
        drawn:         form.drawn,
        lost:          form.lost,
        goals_for:     form.goals_for,
        goals_against: form.goals_against,
        goal_diff:     form.goal_diff,
        points:        form.points,
        form:          form.form || null,
        is_us:         form.is_us,
      })
      setEditRow(null)
      setLoading(true)
      getStandings(selectedComp)
        .then(data => {
          const sorted = (data || []).slice().sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
          setStandings(sorted)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>KLASSEMENT</h1>
          <p style={pageSub}>Beheerd door de scraper — rijen zijn bewerkbaar</p>
        </div>
        <select
          value={selectedComp}
          onChange={e => setSelectedComp(e.target.value)}
          style={{ ...inputStyle, width: 260 }}
        >
          {competitions.length === 0 && <option value="">Geen competities</option>}
          {competitions.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!selectedComp ? (
        <Empty text="Selecteer een competitie" />
      ) : loading ? (
        <Spinner />
      ) : error ? (
        <Empty text={error} />
      ) : standings.length === 0 ? (
        <Empty text="Geen klassement gevonden voor deze competitie" />
      ) : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['#', 'Team', 'Gespeeld', 'W', 'G', 'V', 'Goals', '+/-', 'Punten', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.map(s => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: '1px solid #222',
                    borderLeft: s.is_us ? '3px solid #FF6200' : '3px solid transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: '#555', width: 32 }}>{s.position ?? '—'}</td>
                  <td style={{ ...tdStyle, color: s.is_us ? '#FF6200' : '#fff', fontWeight: s.is_us ? 600 : 500 }}>
                    {s.team_name}
                    {s.is_us && <span style={{ marginLeft: 6, fontSize: 10, color: '#FF6200', opacity: 0.7 }}>●</span>}
                  </td>
                  <td style={{ ...tdStyle, color: '#666' }}>{s.played}</td>
                  <td style={{ ...tdStyle, color: '#10b981' }}>{s.won}</td>
                  <td style={{ ...tdStyle, color: '#f59e0b' }}>{s.drawn}</td>
                  <td style={{ ...tdStyle, color: '#ef4444' }}>{s.lost}</td>
                  <td style={{ ...tdStyle, color: '#666', fontSize: 12 }}>{s.goals_for}–{s.goals_against}</td>
                  <td style={{ ...tdStyle, color: s.goal_diff > 0 ? '#10b981' : s.goal_diff < 0 ? '#ef4444' : '#666' }}>
                    {s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'Anton, Impact, sans-serif', color: '#FF6200', fontSize: 15 }}>
                    {s.points}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <ActionBtn icon="edit" title="Bewerken" onClick={() => setEditRow(s)} color="#3b82f6" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editRow && (
        <EditPanel
          row={editRow}
          onSave={handleSave}
          onClose={() => setEditRow(null)}
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
