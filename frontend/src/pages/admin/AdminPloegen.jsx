import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getTeams, createTeam, updateTeam, deleteTeam } from '../../api/teams'

const AGE_GROUPS = [
  { value: 'first_team', label: '1ste Ploeg' },
  { value: 'reserves',   label: 'Reserves' },
  { value: 'u17',        label: 'U17' },
  { value: 'u16',        label: 'U16' },
  { value: 'u15',        label: 'U15' },
  { value: 'u13',        label: 'U13' },
  { value: 'u12',        label: 'U12' },
  { value: 'u11',        label: 'U11' },
  { value: 'u10',        label: 'U10' },
  { value: 'u9',         label: 'U9' },
  { value: 'u8',         label: 'U8' },
  { value: 'u7',         label: 'U7' },
  { value: 'u6',         label: 'U6' },
]

const EMPTY_FORM = {
  name: '',
  slug: '',
  short_name: '',
  age_group: 'first_team',
  coach: '',
  assistant_coach: '',
  color: '',
  logo_url: '',
  rbfa_team_id: '',
  is_active: true,
}

const ageLabel = v => AGE_GROUPS.find(g => g.value === v)?.label ?? v

function Badge({ label, color }) {
  return (
    <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, background: color + '22', color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {label}
    </span>
  )
}

function FormPanel({ form, setForm, onSave, onClose, saving, editId }) {
  const handle = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const autoSlug = (name) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    handle('name', name)
    if (!editId) handle('slug', slug)
  }

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>{editId ? 'PLOEG BEWERKEN' : 'NIEUWE PLOEG'}</h2>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={labelStyle}>
              Naam
              <input
                value={form.name}
                onChange={e => autoSlug(e.target.value)}
                style={inputStyle}
                placeholder="Naam van de ploeg..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Slug
                <input
                  value={form.slug}
                  onChange={e => handle('slug', e.target.value)}
                  style={inputStyle}
                  placeholder="eerste-ploeg"
                />
              </label>
              <label style={labelStyle}>
                Verkorte naam
                <input
                  value={form.short_name}
                  onChange={e => handle('short_name', e.target.value)}
                  style={inputStyle}
                  placeholder="1ste"
                />
              </label>
            </div>

            <label style={labelStyle}>
              Leeftijdsgroep
              <select value={form.age_group} onChange={e => handle('age_group', e.target.value)} style={inputStyle}>
                {AGE_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Trainer
                <input
                  value={form.coach}
                  onChange={e => handle('coach', e.target.value)}
                  style={inputStyle}
                  placeholder="Naam trainer..."
                />
              </label>
              <label style={labelStyle}>
                Assistent-trainer
                <input
                  value={form.assistant_coach}
                  onChange={e => handle('assistant_coach', e.target.value)}
                  style={inputStyle}
                  placeholder="Naam assistent..."
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={labelStyle}>
                Kleur (hex)
                <input
                  value={form.color}
                  onChange={e => handle('color', e.target.value)}
                  style={inputStyle}
                  placeholder="#FF6200"
                />
              </label>
              <label style={labelStyle}>
                RBFA Team ID
                <input
                  value={form.rbfa_team_id}
                  onChange={e => handle('rbfa_team_id', e.target.value)}
                  style={inputStyle}
                  placeholder="rbfa-id..."
                />
              </label>
            </div>

            <label style={labelStyle}>
              Logo URL
              <input
                value={form.logo_url}
                onChange={e => handle('logo_url', e.target.value)}
                style={inputStyle}
                placeholder="https://..."
              />
            </label>

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

export default function AdminPloegen() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getTeams()
      .then(data => { setTeams(data || []); setLoading(false) })
      .catch(() => { setError('Kon ploegen niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setPanelOpen(true)
  }

  const openEdit = (team) => {
    setForm({
      name:            team.name || '',
      slug:            team.slug || '',
      short_name:      team.short_name || '',
      age_group:       team.age_group || 'first_team',
      coach:           team.coach || '',
      assistant_coach: team.assistant_coach || '',
      color:           team.color || '',
      logo_url:        team.logo_url || '',
      rbfa_team_id:    team.rbfa_team_id || '',
      is_active:       team.is_active ?? true,
    })
    setEditId(team.id)
    setPanelOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        short_name:      form.short_name || null,
        coach:           form.coach || null,
        assistant_coach: form.assistant_coach || null,
        color:           form.color || null,
        logo_url:        form.logo_url || null,
        rbfa_team_id:    form.rbfa_team_id || null,
      }
      editId ? await updateTeam(editId, payload) : await createTeam(payload)
      setPanelOpen(false)
      load()
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Ploeg verwijderen?')) return
    try {
      await deleteTeam(id)
      load()
    } catch {
      alert('Verwijderen mislukt')
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>PLOEGEN</h1>
          <p style={pageSub}>{teams.length} ploeg{teams.length !== 1 ? 'en' : ''}</p>
        </div>
        <button onClick={openCreate} style={primaryBtnStyle}>
          <Icon name="plus" size={15} />
          Nieuwe ploeg
        </button>
      </div>

      {loading ? <Spinner /> : error ? <Empty text={error} /> : teams.length === 0 ? <Empty text="Geen ploegen gevonden" /> : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Naam', 'Leeftijdsgroep', 'Trainer', 'Spelers', 'Status', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr
                  key={t.id}
                  style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {t.color && (
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                      )}
                      <span style={{ color: '#fff', fontWeight: 500 }}>{t.name}</span>
                    </div>
                    {t.short_name && <div style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{t.short_name}</div>}
                  </td>
                  <td style={tdStyle}>
                    <Badge label={ageLabel(t.age_group)} color="#FF6200" />
                  </td>
                  <td style={{ ...tdStyle, color: '#888' }}>{t.coach || '—'}</td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{t.player_count ?? 0}</td>
                  <td style={tdStyle}>
                    {t.is_active
                      ? <Badge label="Actief" color="#10b981" />
                      : <Badge label="Inactief" color="#555" />}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <ActionBtn icon="edit" title="Bewerken" onClick={() => openEdit(t)} color="#3b82f6" />
                      <ActionBtn icon="trash" title="Verwijderen" onClick={() => handleDelete(t.id)} color="#ef4444" />
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
