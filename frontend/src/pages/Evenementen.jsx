import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { getEvents } from '../api/events'

const TYPE_COLORS = {
  social: '#ff6a13',
  tournament: '#1f8a3d',
  celebration: '#f5c518',
  sponsor: '#0a0a0a',
}

const TYPE_LABELS = {
  social: 'Sociaal',
  tournament: 'Tornooi',
  celebration: 'Feest',
  sponsor: 'Sponsor',
}

const MONTHS = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']

function fmtEur(n) {
  return `€${Number(n).toFixed(2).replace('.', ',')}`
}

export default function Evenementen() {
  const { data: events = [], isLoading } = useQuery({ queryKey: ['events'], queryFn: getEvents })

  return (
    <Layout title="Evenementen">
      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 60, fontSize: 14 }}>Laden...</div>
      ) : events.length === 0 ? (
        <div style={{
          color: '#888', textAlign: 'center', padding: 60,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 3, fontSize: 14,
        }}>
          Geen evenementen gepland
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {events.map((ev, i) => {
            const d = new Date(ev.date)
            const typeColor = TYPE_COLORS[ev.event_type] || 'var(--orange)'
            return (
              <div
                key={ev.id}
                className="card-in"
                style={{
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  display: 'flex',
                  transition: 'transform .1s, box-shadow .15s',
                  willChange: 'transform',
                  animationDelay: `${Math.min(i * 60, 300)}ms`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                {/* Date block */}
                <div style={{
                  background: 'var(--ink)',
                  color: '#fff',
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 76,
                  borderRight: `4px solid ${typeColor}`,
                }}>
                  <div className="display" style={{ fontSize: 38, color: typeColor, lineHeight: 1 }}>
                    {d.getDate()}
                  </div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 4 }}>
                    {MONTHS[d.getMonth()]}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                    {d.getFullYear()}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 18px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {ev.event_type && (
                      <span className="pill pill-ghost" style={{ fontSize: 10 }}>
                        {TYPE_LABELS[ev.event_type] || ev.event_type}
                      </span>
                    )}
                    {ev.price > 0
                      ? <span className="pill pill-orange" style={{ fontSize: 10 }}>{fmtEur(ev.price)}</span>
                      : <span className="pill pill-ink" style={{ fontSize: 10 }}>Gratis</span>
                    }
                  </div>

                  <div className="display" style={{ fontSize: 20, lineHeight: 1.05, marginBottom: 8 }}>
                    {ev.title}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                    {ev.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#666' }}>
                        <Icon name="mapPin" size={13} />
                        {ev.location}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#666' }}>
                      <Icon name="clock" size={13} />
                      {d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                      {ev.end_date && ` – ${new Date(ev.end_date).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  </div>

                  {ev.description && (
                    <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px', lineHeight: 1.5 }}>
                      {ev.description.slice(0, 100)}{ev.description.length > 100 ? '...' : ''}
                    </p>
                  )}

                  {ev.registration_url && (
                    <a
                      href={ev.registration_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{
                        background: typeColor,
                        color: typeColor === '#f5c518' ? '#000' : '#fff',
                        fontSize: 12,
                        padding: '8px 14px',
                        borderRadius: 3,
                        display: 'inline-flex',
                        gap: 6,
                      }}
                    >
                      <Icon name="ticket" size={13} />
                      Inschrijven
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
