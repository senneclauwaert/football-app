import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getAllNews, createNews, updateNews, deleteNews } from '../../api/news'

const EMPTY_FORM = {
  title: '',
  category: 'club',
  tldr: '',
  body: '',
  is_pinned: false,
  is_published: false,
}

const CATEGORIES = [
  { value: 'match',  label: 'Wedstrijd' },
  { value: 'club',   label: 'Club' },
  { value: 'youth',  label: 'Jeugd' },
  { value: 'event',  label: 'Evenement' },
]

function Badge({ label, color }) {
  return (
    <span style={{
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 600,
      borderRadius: 0,
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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.7)',
    }}>
      <div style={{
        width: 520,
        maxWidth: '100vw',
        height: '100vh',
        background: '#1a1a1a',
        borderLeft: '1px solid #2a2a2a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Panel header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: 18,
            color: '#fff',
            margin: 0,
            letterSpacing: 1,
          }}>
            {editId ? 'ARTIKEL BEWERKEN' : 'NIEUW ARTIKEL'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Form body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={labelStyle}>
              Titel
              <input
                value={form.title}
                onChange={e => handle('title', e.target.value)}
                style={inputStyle}
                placeholder="Artikeltitel..."
              />
            </label>

            <label style={labelStyle}>
              Categorie
              <select
                value={form.category}
                onChange={e => handle('category', e.target.value)}
                style={inputStyle}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Samenvatting (tldr)
              <textarea
                value={form.tldr}
                onChange={e => handle('tldr', e.target.value)}
                style={{ ...inputStyle, height: 72, resize: 'vertical' }}
                placeholder="Korte samenvatting..."
              />
            </label>

            <label style={labelStyle}>
              Inhoud
              <textarea
                value={form.body}
                onChange={e => handle('body', e.target.value)}
                style={{ ...inputStyle, height: 180, resize: 'vertical' }}
                placeholder="Volledige inhoud..."
              />
            </label>

            <div style={{ display: 'flex', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.is_pinned}
                  onChange={e => handle('is_pinned', e.target.checked)}
                  style={{ accentColor: '#FF6200', width: 16, height: 16 }}
                />
                Vastgepind
              </label>
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
        </div>

        {/* Panel footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #2a2a2a',
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={secondaryBtnStyle}>Annuleren</button>
          <button onClick={onSave} disabled={saving} style={primaryBtnStyle}>
            {saving ? 'Opslaan...' : editId ? 'Bijwerken' : 'Aanmaken'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminNieuws() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getAllNews()
      .then(data => { setArticles(data || []); setLoading(false) })
      .catch(() => { setError('Kon artikelen niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setPanelOpen(true)
  }

  const openEdit = (article) => {
    setForm({
      title:        article.title || '',
      category:     article.category || 'club',
      tldr:         article.tldr || '',
      body:         article.body || '',
      is_pinned:    article.is_pinned || false,
      is_published: article.is_published || false,
    })
    setEditId(article.id)
    setPanelOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editId) {
        await updateNews(editId, form)
      } else {
        await createNews(form)
      }
      setPanelOpen(false)
      load()
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Artikel verwijderen?')) return
    try {
      await deleteNews(id)
      load()
    } catch {
      alert('Verwijderen mislukt')
    }
  }

  const catLabel = v => CATEGORIES.find(c => c.value === v)?.label ?? v

  return (
    <AdminLayout>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>NIEUWS</h1>
          <p style={pageSub}>{articles.length} artikel{articles.length !== 1 ? 'en' : ''}</p>
        </div>
        <button onClick={openCreate} style={primaryBtnStyle}>
          <Icon name="plus" size={15} />
          Nieuw artikel
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <Empty text={error} />
      ) : articles.length === 0 ? (
        <Empty text="Geen artikelen gevonden" />
      ) : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Titel', 'Categorie', 'Status', 'Aangemaakt', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr
                  key={a.id}
                  style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{a.title}</span>
                    {a.is_pinned && (
                      <span style={{ marginLeft: 6, color: '#FF6200', fontSize: 11 }}>VAST</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <Badge label={catLabel(a.category)} color="#3b82f6" />
                  </td>
                  <td style={tdStyle}>
                    {a.is_published
                      ? <Badge label="Gepubliceerd" color="#10b981" />
                      : <Badge label="Concept" color="#666" />}
                  </td>
                  <td style={{ ...tdStyle, color: '#666', fontSize: 12 }}>
                    {a.created_at ? new Date(a.created_at).toLocaleDateString('nl-BE') : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <ActionBtn icon="edit" title="Bewerken" onClick={() => openEdit(a)} color="#3b82f6" />
                      <ActionBtn icon="trash" title="Verwijderen" onClick={() => handleDelete(a.id)} color="#ef4444" />
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

// ---- shared sub-components ----

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#555', fontSize: 13, padding: 32 }}>
      <div style={{
        width: 18, height: 18,
        border: '2px solid #FF6200',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      Laden...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Empty({ text }) {
  return (
    <div style={{
      padding: '48px 24px',
      textAlign: 'center',
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      color: '#555',
      fontSize: 14,
    }}>
      {text}
    </div>
  )
}

function ActionBtn({ icon, title, onClick, color }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: color + '18',
        border: 'none',
        borderRadius: 0,
        padding: '5px 8px',
        cursor: 'pointer',
        color,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Icon name={icon} size={14} color={color} />
    </button>
  )
}

// ---- shared styles ----

const pageTitle = {
  fontFamily: 'Anton, Impact, sans-serif',
  fontSize: 28,
  color: '#fff',
  margin: 0,
  letterSpacing: 1,
}

const pageSub = {
  color: '#555',
  fontSize: 13,
  margin: '4px 0 0',
}

const thStyle = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: 1,
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '12px 16px',
  fontSize: 13,
  color: '#aaa',
  verticalAlign: 'middle',
}

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 18px',
  background: '#FF6200',
  border: 'none',
  borderRadius: 0,
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
}

const secondaryBtnStyle = {
  padding: '9px 18px',
  background: 'transparent',
  border: '1px solid #2a2a2a',
  borderRadius: 0,
  color: '#888',
  fontSize: 13,
  cursor: 'pointer',
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
}

const inputStyle = {
  padding: '9px 12px',
  background: '#111',
  border: '1px solid #2a2a2a',
  borderRadius: 0,
  color: '#fff',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
}
