import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getScraperRuns, triggerScraper } from '../../api/admin'

const statusColor = s => ({ success: '#10b981', running: '#3b82f6', error: '#ef4444' }[s] ?? '#888')
const statusLabel = s => ({ success: 'Geslaagd', running: 'Bezig', error: 'Fout' }[s] ?? s)

function Badge({ label, color }) {
  return (
    <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, background: color + '22', color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {label}
    </span>
  )
}

export default function AdminScraper() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState(null)

  const load = () => {
    setLoading(true)
    getScraperRuns()
      .then(data => { setRuns(data || []); setLoading(false) })
      .catch(() => { setError('Kon runs niet laden'); setLoading(false) })
  }

  useEffect(load, [])

  const handleTrigger = async () => {
    setTriggering(true)
    setTriggerMsg(null)
    try {
      await triggerScraper()
      setTriggerMsg({ type: 'success', text: 'Scraper gestart!' })
      setTimeout(load, 1500)
    } catch {
      setTriggerMsg({ type: 'error', text: 'Scraper starten mislukt.' })
    } finally {
      setTriggering(false)
    }
  }

  const fmtDate = d => d
    ? new Date(d).toLocaleString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  const fmtDuration = s => s != null ? `${Math.round(s)}s` : '—'

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={pageTitle}>SCRAPER</h1>
          <p style={pageSub}>RBFA data synchronisatie — laatste {runs.length} runs</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {triggerMsg && (
            <span style={{
              fontSize: 12,
              color: triggerMsg.type === 'success' ? '#10b981' : '#ef4444',
              padding: '6px 12px',
              background: (triggerMsg.type === 'success' ? '#10b981' : '#ef4444') + '18',
              border: `1px solid ${triggerMsg.type === 'success' ? '#10b981' : '#ef4444'}44`,
            }}>
              {triggerMsg.text}
            </span>
          )}
          <button onClick={handleTrigger} disabled={triggering} style={primaryBtnStyle}>
            <Icon name="whistle" size={15} />
            {triggering ? 'Bezig...' : 'Scraper starten'}
          </button>
        </div>
      </div>

      {/* Info block */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderLeft: '3px solid #FF6200',
        padding: '12px 16px',
        marginBottom: 24,
        fontSize: 12,
        color: '#888',
      }}>
        De scraper draait automatisch dagelijks om 02:00. Gebruik "Scraper starten" om handmatig te synchroniseren. Wedstrijden en klassementen worden bijgewerkt op basis van RBFA data.
      </div>

      {loading ? <Spinner /> : error ? <Empty text={error} /> : runs.length === 0 ? <Empty text="Nog geen scraper runs" /> : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Tijdstip', 'Status', 'Wedstrijden', 'Klassement', 'Spelers', 'Duur', 'Fout'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map(r => (
                <tr
                  key={r.id}
                  style={{ borderBottom: '1px solid #222' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, fontSize: 12, color: '#666' }}>{fmtDate(r.run_at)}</td>
                  <td style={tdStyle}>
                    <Badge label={statusLabel(r.status)} color={statusColor(r.status)} />
                  </td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{r.matches_updated ?? 0}</td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{r.standings_updated ?? 0}</td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{r.players_updated ?? 0}</td>
                  <td style={{ ...tdStyle, color: '#666', fontSize: 12 }}>{fmtDuration(r.duration_seconds)}</td>
                  <td style={{ ...tdStyle, color: '#ef4444', fontSize: 12, maxWidth: 200 }}>
                    {r.error_message
                      ? <span title={r.error_message} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.error_message}
                        </span>
                      : <span style={{ color: '#333' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

const pageTitle = { fontFamily: 'Anton, Impact, sans-serif', fontSize: 28, color: '#fff', margin: 0, letterSpacing: 1 }
const pageSub = { color: '#555', fontSize: 13, margin: '4px 0 0' }
const thStyle = { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }
const tdStyle = { padding: '12px 16px', fontSize: 13, color: '#aaa', verticalAlign: 'middle' }
const primaryBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#FF6200', border: 'none', borderRadius: 0, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }
