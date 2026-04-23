import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { getEvents } from '../api/events'

const TYPE_COLORS = {
  social: '#2980b9',
  tournament: '#27ae60',
  celebration: '#8e44ad',
  sponsor: '#e67e22',
}

const TYPE_LABELS = {
  social: 'Sociaal',
  tournament: 'Tornooi',
  celebration: 'Feest',
  sponsor: 'Sponsor',
}

export default function Evenementen() {
  const { data: events = [], isLoading } = useQuery({ queryKey: ['events'], queryFn: getEvents })

  return (
    <Layout title="Evenementen">
      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Laden...</div>
      ) : events.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Geen evenementen gepland</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {events.map(ev => {
            const d = new Date(ev.date)
            const typeColor = TYPE_COLORS[ev.event_type] || '#888'
            return (
              <div
                key={ev.id}
                style={{
                  background: '#fff', borderRadius: 12,
                  border: '1px solid var(--line)',
                  overflow: 'hidden',
                }}
              >
                {/* Color strip */}
                <div style={{ height: 4, background: typeColor }} />
                <div style={{ padding: '20px' }}>
                  {/* Date + type */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 36, fontWeight: 800, color: typeColor, lineHeight: 1 }}>{d.getDate()}</span>
                      <div style={{ lineHeight: 1 }}>
                        <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#888' }}>
                          {d.toLocaleDateString('nl-BE', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>
                          {d.getFullYear()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {ev.event_type && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: typeColor, background: `${typeColor}18`, padding: '3px 8px', borderRadius: 10 }}>
                          {TYPE_LABELS[ev.event_type] || ev.event_type}
                        </span>
                      )}
                      {ev.price > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--orange)', background: 'var(--orange-soft)', padding: '3px 8px', borderRadius: 10 }}>
                          €{Number(ev.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 10px' }}>{ev.title}</h3>

                  {/* Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ev.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666' }}>
                        <Icon name="mapPin" size={14} color="#aaa" />
                        {ev.location}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666' }}>
                      <Icon name="clock" size={14} color="#aaa" />
                      {d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                      {ev.end_date && ` – ${new Date(ev.end_date).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  </div>

                  {ev.description && (
                    <p style={{ fontSize: 13, color: '#666', marginTop: 10, lineHeight: 1.5 }}>
                      {ev.description.slice(0, 120)}{ev.description.length > 120 ? '...' : ''}
                    </p>
                  )}

                  {ev.registration_url && (
                    <a
                      href={ev.registration_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        marginTop: 14, padding: '8px 16px', borderRadius: 8,
                        background: typeColor, color: '#fff', fontSize: 13, fontWeight: 600,
                      }}
                    >
                      <Icon name="ticket" size={14} />
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
