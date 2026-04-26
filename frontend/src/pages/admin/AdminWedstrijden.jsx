import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getMatches, createMatch, updateMatch, deleteMatch } from '../../api/matches'
import { getTeams } from '../../api/teams'
import { getCompetitions } from '../../api/standings'

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

const EMPTY_FORM = {
  match_date: '',
  opponent_name: '',
  is_home: true,
  team_id: '',
  competition_id: '',
  matchday: '',
  venue: '',
  status: 'scheduled',
  home_score: '',
  away_score: '',
}

function Badge({ label, color }) {
  return (
    <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, background: color + '22', color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {label}
    </span>
  )
}

function MatchPanel({ form, setForm, onSave, onClose, saving, editId }) {
  const handle = (field, value) => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>{editId ? 'WEDSTRIJD BEWERKEN' : 'NIEUWE WEDSTRIJD'}</h2>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={labelStyle}>
              Tegenstander
              <input
                value={form.opponent_name}
                onChange={e => handle('opponent_name', e.target.value)}
                style={inputStyle}
                placeholder="Naam tegenstander..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Datum & tijd
                <input
                  type="datetime-local"
                  value={form.match_date}
                  onChange={e => handle('match_date', e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Status
                <select value={form.status} onChange={e => handle('status', e.target.value)} style={inputStyle}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.is_home}
                  onChange={e => handle('is_home', e.target.checked)}
                  style={{ accentColor: '#FF6200', width: 16, height: 16 }}
                />
                Thuiswedstrijd
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Score thuis
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
                Score uit
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Speeldag
                <input
                  type="number"
                  min="1"
                  value={form.matchday}
                  onChange={e => handle('matchday', e.target.value)}
                  style={inputStyle}
                  placeholder="—"
                />
              </label>
              <label style={labelStyle}>
                Locatie
                <input
                  value={form.venue}
                  onChange={e => handle('venue', e.target.value)}
                  style={inputStyle}
                  placeholder="Speelplaats..."
                />
              </label>
            </div>

            <label style={labelStyle}>
              Ploeg
              <select value={form.team_id} onChange={e => handle('team_id', e.target.value)} style={inputStyle}>
                <option value="">— Selecteer ploeg —</option>
                {(form._teams || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              Competitie
              <select value={form.competition_id} onChange={e => handle('competition_id', e.target.value)} style={inputStyle}>
                <option value="">— Geen / Vriendschappelijk —</option>
                {(form._competitions || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
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

export default function AdminWedstrijden() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getMatches(), getTeams(), getCompetitions()])
      .then(([matchData, teamData, compData]) => {
        const list = Array.isArray(matchData) ? matchData : (matchData?.items ?? [])
        list.sort((a, b) => new Date(b.match_date ?? b.date ?? 0) - new Date(a.match_date ?? a.date ?? 0))
        setMatches(list)
        setTeams(teamData || [])
        setCompetitions(compData || [])
        setLoading(false)
      })
      .catch(() => { setError('Kon wedstrijden niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const enrichForm = (base) => ({ ...base, _teams: teams, _competitions: competitions })

  const openCreate = () => {
    setForm(enrichForm(EMPTY_FORM))
    setEditId(null)
    setPanelOpen(true)
  }

  const openEdit = (match) => {
    const fmtDate = d => d ? d.slice(0, 16) : ''
    setForm(enrichForm({
      match_date:     fmtDate(match.match_date || match.date),
      opponent_name:  match.opponent_name || match.opponent || '',
      is_home:        match.is_home ?? true,
      team_id:        match.team_id ?? '',
      competition_id: match.competition_id ?? '',
      matchday:       match.matchday ?? '',
      venue:          match.venue || '',
      status:         match.status || 'scheduled',
      home_score:     match.home_score != null ? String(match.home_score) : '',
      away_score:     match.away_score != null ? String(match.away_score) : '',
    }))
    setEditId(match.id)
    setPanelOpen(true)
  }

  const handleSave = async () => {
    if (!form.opponent_name.trim()) return
    setSaving(true)
    try {
      const payload = {
        opponent_name:  form.opponent_name,
        match_date:     form.match_date || null,
        is_home:        form.is_home,
        status:         form.status,
        home_score:     form.home_score !== '' ? parseInt(form.home_score) : null,
        away_score:     form.away_score !== '' ? parseInt(form.away_score) : null,
        matchday:       form.matchday !== '' ? parseInt(form.matchday) : null,
        venue:          form.venue || null,
        team_id:        form.team_id !== '' ? parseInt(form.team_id) : (teams[0]?.id ?? 1),
        competition_id: form.competition_id !== '' ? parseInt(form.competition_id) : null,
      }
      editId ? await updateMatch(editId, payload) : await createMatch(payload)
      setPanelOpen(false)
      load()
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Wedstrijd verwijderen?')) return
    try {
      await deleteMatch(id)
      load()
    } catch {
      alert('Verwijderen mislukt')
    }
  }

  const fmtScore = m => {
    if (m.home_score != null && m.away_score != null) return `${m.home_score} - ${m.away_score}`
    return '—'
  }

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>WEDSTRIJDEN</h1>
          <p style={pageSub}>{matches.length} wedstrijd{matches.length !== 1 ? 'en' : ''}</p>
        </div>
        <button onClick={openCreate} style={primaryBtnStyle}>
          <Icon name="plus" size={15} />
          Nieuwe wedstrijd
        </button>
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
                <tr
                  key={m.id}
                  style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, fontSize: 12, color: '#666' }}>
                    {fmtDate(m.match_date || m.date)}
                  </td>
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 500 }}>
                    {m.opponent_name || m.opponent || '—'}
                  </td>
                  <td style={tdStyle}>
                    <Badge label={m.is_home ? 'Thuis' : 'Uit'} color={m.is_home ? '#10b981' : '#3b82f6'} />
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'Anton, Impact, sans-serif', color: '#FF6200', fontSize: 15 }}>
                    {fmtScore(m)}
                  </td>
                  <td style={tdStyle}>
                    <Badge label={statusLabel(m.status)} color={statusColor(m.status)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <ActionBtn icon="edit" title="Bewerken" onClick={() => openEdit(m)} color="#3b82f6" />
                      <ActionBtn icon="users" title="Opstelling" onClick={() => navigate(`/admin/wedstrijden/${m.id}/opstelling`)} color="#10b981" />
                      <ActionBtn icon="trash" title="Verwijderen" onClick={() => handleDelete(m.id)} color="#ef4444" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panelOpen && (
        <MatchPanel
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
const panelStyle = { width: 500, maxWidth: '100vw', height: '100vh', background: '#1a1a1a', borderLeft: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
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
