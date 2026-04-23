import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getSponsors } from '../api/sponsors'

const TIERS = [
  { key: 'main',   label: 'Hoofdsponsors', minWidth: 200 },
  { key: 'gold',   label: 'Goud',          minWidth: 160 },
  { key: 'silver', label: 'Zilver',         minWidth: 130 },
  { key: 'bronze', label: 'Brons',          minWidth: 110 },
]

const TIER_COLORS = {
  main:   'var(--orange)',
  gold:   '#f5c518',
  silver: '#aaa',
  bronze: '#cd7f32',
}

export default function Sponsors() {
  const { data: sponsors = [], isLoading } = useQuery({ queryKey: ['sponsors'], queryFn: getSponsors })

  return (
    <Layout title="Sponsors">
      {/* Intro */}
      <div style={{
        background: 'var(--ink)',
        color: '#fff',
        padding: '28px 24px',
        borderRadius: 3,
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%',
          background: 'repeating-linear-gradient(135deg, var(--orange) 0 20px, transparent 20px 40px)',
          opacity: 0.08,
        }} />
        <div className="display" style={{ fontSize: 32, marginBottom: 8 }}>Onze sponsors</div>
        <p style={{ color: '#aaa', fontSize: 14, margin: 0, maxWidth: 500 }}>
          Toekomst Relegem dankt al onze sponsors voor hun onmisbare steun aan de club.
        </p>
      </div>

      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 60, fontSize: 14 }}>Laden...</div>
      ) : sponsors.length === 0 ? (
        <div style={{
          color: '#888', textAlign: 'center', padding: 60,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 3, fontSize: 14,
        }}>
          Geen sponsors gevonden
        </div>
      ) : (
        TIERS.map(({ key, label, minWidth }) => {
          const tierSponsors = sponsors.filter(s => s.tier === key)
          if (tierSponsors.length === 0) return null
          const color = TIER_COLORS[key]

          return (
            <div key={key} style={{ marginBottom: 36 }}>
              {/* Tier header */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <h2 className="display" style={{ fontSize: 26, margin: 0 }}>{label}</h2>
              </div>

              {/* Divider */}
              <div style={{ height: 3, background: color, borderRadius: 1, marginBottom: 16 }} />

              {/* Sponsors grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
                gap: 12,
              }}>
                {tierSponsors.map((s, i) => (
                  <a
                    key={s.id}
                    href={s.website || '#'}
                    target={s.website ? '_blank' : '_self'}
                    rel="noreferrer"
                    className="card-in"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fff',
                      border: '1.5px solid var(--line)',
                      borderRadius: 3,
                      padding: '24px 16px',
                      aspectRatio: '4/3',
                      textDecoration: 'none',
                      textAlign: 'center',
                      transition: 'transform .1s, box-shadow .15s, border-color .15s',
                      cursor: s.website ? 'pointer' : 'default',
                      animationDelay: `${Math.min(i * 60, 300)}ms`,
                    }}
                    onMouseEnter={e => {
                      if (s.website) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.08)'
                        e.currentTarget.style.borderColor = color
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.boxShadow = ''
                      e.currentTarget.style.borderColor = 'var(--line)'
                    }}
                  >
                    {s.logo_url ? (
                      <img
                        src={s.logo_url}
                        alt={s.name}
                        style={{ maxWidth: '70%', maxHeight: 60, objectFit: 'contain', marginBottom: 10 }}
                      />
                    ) : (
                      <div style={{
                        width: 48, height: 48,
                        background: 'var(--paper-2)',
                        backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,.05) 0 6px, transparent 6px 12px)',
                        borderRadius: 3,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Anton, Impact, sans-serif',
                        fontSize: 20, color: color,
                        marginBottom: 10,
                      }}>
                        {s.name?.[0] || 'S'}
                      </div>
                    )}
                    <div className="display" style={{ fontSize: key === 'main' ? 16 : 13, lineHeight: 1.1 }}>
                      {s.name}
                    </div>
                    {s.sector && (
                      <div className="mono" style={{ fontSize: 9, color: '#888', letterSpacing: '.12em', marginTop: 4, textTransform: 'uppercase' }}>
                        {s.sector}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )
        })
      )}
    </Layout>
  )
}
