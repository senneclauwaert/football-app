import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../../api/players'
import { getTeams } from '../../api/teams'

const POSITIONS = [
  { value: 'keeper',       label: 'Keeper' },
  { value: 'verdediger',   label: 'Verdediger' },
  { value: 'middenvelder', label: 'Middenvelder' },
  { value: 'aanvaller',    label: 'Aanvaller' },
]

const posColor = v => ({ keeper: '#f59e0b', verdediger: '#3b82f6', middenvelder: '#10b981', aanvaller: '#ef4444' }[v] ?? '#666')
const posLabel = v => POSITIONS.find(p => p.value === v)?.label ?? v

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  team_id: '',
  jersey_number: '',
  position: '',
  date_of_birth: '',
  photo_url: '',
  bio: '',
  joined_year: '',
  goals: 0,
  assists: 0,
  appearances: 0,
  yellow_cards: 0,
  red_cards: 0,
  is_active: true,
}

function Badge({ label, color }) {
  return (
    <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, background: color + '22', color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {label}
    </span>
  )
}

function FormPanel({ form, setForm, onSave, onClose, saving, editId, teams }) {
  const handle = (field, value) => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>{editId ? 'SPELER BEWERKEN' : 'NIEUWE SPELER'}</h2>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Voornaam
                <input
                  value={form.first_name}
                  onChange={e => handle('first_name', e.target.value)}
                  style={inputStyle}
                  placeholder="Voornaam..."
                />
              </label>
              <label style={labelStyle}>
                Achternaam
                <input
                  value={form.last_name}
                  onChange={e => handle('last_name', e.target.value)}
                  style={inputStyle}
                  placeholder="Achternaam..."
                />
              </label>
            </div>

            <label style={labelStyle}>
              Ploeg
              <select value={form.team_id} onChange={e => handle('team_id', e.target.value)} style={inputStyle}>
                <option value="">— Selecteer ploeg —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Rugnummer
                <input
                  type="number"
                  min="1"
                  value={form.jersey_number}
                  onChange={e => handle('jersey_number', e.target.value)}
                  style={inputStyle}
                  placeholder="—"
                />
              </label>
              <label style={labelStyle}>
                Positie
                <select value={form.position} onChange={e => handle('position', e.target.value)} style={inputStyle}>
                  <option value="">— Selecteer —</option>
                  {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Geboortedatum
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={e => handle('date_of_birth', e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Jaar gekomen
                <input
                  value={form.joined_year}
                  onChange={e => handle('joined_year', e.target.value)}
                  style={inputStyle}
                  placeholder="2021"
                />
              </label>
            </div>

            <label style={labelStyle}>
              Foto URL
              <input
                value={form.photo_url}
                onChange={e => handle('photo_url', e.target.value)}
                style={inputStyle}
                placeholder="https://..."
              />
            </label>

            <label style={labelStyle}>
              Biografie
              <textarea
                value={form.bio}
                onChange={e => handle('bio', e.target.value)}
                style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                placeholder="Korte bio..."
              />
            </label>

            <div style={{ height: 1, background: '#2a2a2a' }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Statistieken</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { field: 'appearances', label: 'Wedstr.' },
                { field: 'goals',       label: 'Goals' },
                { field: 'assists',     label: 'Assists' },
              ].map(({ field, label }) => (
                <label key={field} style={labelStyle}>
                  {label}
                  <input
                    type="number"
                    min="0"
                    value={form[field]}
                    onChange={e => handle(field, parseInt(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </label>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { field: 'yellow_cards', label: 'Gele kaarten' },
                { field: 'red_cards',    label: 'Rode kaarten' },
              ].map(({ field, label }) => (
                <label key={field} style={labelStyle}>
                  {label}
                  <input
                    type="number"
                    min="0"
                    value={form[field]}
                    onChange={e => handle(field, parseInt(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </label>
              ))}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => handle('is_active', e.target.checked)}
                style={{ accentColor: '#FF6200', width: 16, height: 16 }}
              />
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

export default function AdminSpelers() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [teamFilter, setTeamFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getPlayers(), getTeams()])
      .then(([playerData, teamData]) => {
        setPlayers(playerData || [])
        setTeams(teamData || [])
        setLoading(false)
      })
      .catch(() => { setError('Kon spelers niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, team_id: teamFilter || '' })
    setEditId(null)
    setPanelOpen(true)
  }

  const openEdit = (player) => {
    setForm({
      first_name:   player.first_name || '',
      last_name:    player.last_name || '',
      team_id:      player.team_id ?? '',
      jersey_number: player.jersey_number ?? '',
      position:     player.position || '',
      date_of_birth: player.date_of_birth || '',
      photo_url:    player.photo_url || '',
      bio:          player.bio || '',
      joined_year:  player.joined_year || '',
      goals:        player.goals ?? 0,
      assists:      player.assists ?? 0,
      appearances:  player.appearances ?? 0,
      yellow_cards: player.yellow_cards ?? 0,
      red_cards:    player.red_cards ?? 0,
      is_active:    player.is_active ?? true,
    })
    setEditId(player.id)
    setPanelOpen(true)
  }

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.team_id) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        team_id:       parseInt(form.team_id),
        jersey_number: form.jersey_number !== '' ? parseInt(form.jersey_number) : null,
        position:      form.position || null,
        date_of_birth: form.date_of_birth || null,
        photo_url:     form.photo_url || null,
        bio:           form.bio || null,
        joined_year:   form.joined_year || null,
      }
      editId ? await updatePlayer(editId, payload) : await createPlayer(payload)
      setPanelOpen(false)
      load()
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Speler verwijderen?')) return
    try {
      await deletePlayer(id)
      load()
    } catch {
      alert('Verwijderen mislukt')
    }
  }

  const teamName = (id) => teams.find(t => t.id === id)?.name ?? '—'

  const filtered = teamFilter
    ? players.filter(p => String(p.team_id) === String(teamFilter))
    : players

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>SPELERS</h1>
          <p style={pageSub}>{filtered.length} speler{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            style={{ ...inputStyle, width: 200 }}
          >
            <option value="">Alle ploegen</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={openCreate} style={primaryBtnStyle}>
            <Icon name="plus" size={15} />
            Nieuwe speler
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : error ? <Empty text={error} /> : filtered.length === 0 ? <Empty text="Geen spelers gevonden" /> : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Naam', 'Nr.', 'Ploeg', 'Positie', 'Wedstr.', 'Goals', 'Assists', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.id}
                  style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{p.first_name} {p.last_name}</span>
                    {!p.is_active && <span style={{ marginLeft: 6, color: '#555', fontSize: 11 }}>INACTIEF</span>}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'Anton, Impact, sans-serif', color: '#FF6200', fontSize: 15 }}>
                    {p.jersey_number ?? '—'}
                  </td>
                  <td style={{ ...tdStyle, color: '#888' }}>{teamName(p.team_id)}</td>
                  <td style={tdStyle}>
                    {p.position
                      ? <Badge label={posLabel(p.position)} color={posColor(p.position)} />
                      : <span style={{ color: '#444' }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{p.appearances ?? 0}</td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{p.goals ?? 0}</td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{p.assists ?? 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <ActionBtn icon="edit" title="Bewerken" onClick={() => openEdit(p)} color="#3b82f6" />
                      <ActionBtn icon="trash" title="Verwijderen" onClick={() => handleDelete(p.id)} color="#ef4444" />
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
          teams={teams}
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
