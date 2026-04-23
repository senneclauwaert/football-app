import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getSponsors } from '../api/sponsors'

const TIERS = [
  { key: 'main', label: 'Hoofdsponsor', size: 96 },
  { key: 'gold', label: 'Goud', size: 72 },
  { key: 'silver', label: 'Zilver', size: 56 },
  { key: 'bronze', label: 'Brons', size: 44 },
]

const TIER_COLORS = {
  main: '#ff6a13',
  gold: '#f5c518',
  silver: '#aaa',
  bronze: '#cd7f32',
}

export default function Sponsors() {
  const { data: sponsors = [], isLoading } = useQuery({ queryKey: ['sponsors'], queryFn: getSponsors })

  return (
    <Layout title="Sponsors">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Onze sponsors</h2>
        <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
          Toekomst Relegem dankt al onze sponsors voor hun onmisbare steun.
        </p>
      </div>

      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Laden...</div>
      ) : sponsors.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Geen sponsors gevonden</div>
      ) : (
        TIERS.map(({ key, label, size }) => {
          const tierSponsors = sponsors.filter(s => s.tier === key)
          if (tierSponsors.length === 0) return null
          return (
            <div key={key} style={{ marginBottom: 36 }}>
              {/* Tier header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ height: 3, width: 32, background: TIER_COLORS[key], borderRadius: 2 }} />
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: TIER_COLORS[key] }}>
                  {label}
                </h3>
                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>

              {/* Sponsors row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {tierSponsors.map(s => (
                  <a
                    key={s.id}
                    href={s.website || '#'}
                    target={s.website ? '_blank' : '_self'}
                    rel="noreferrer"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: '#fff', border: '1px solid var(--line)', borderRadius: 10,
                      padding: '20px 24px', minWidth: 140,
                      textDecoration: 'none', transition: 'box-shadow 0.15s',
                      cursor: s.website ? 'pointer' : 'default',
                    }}
                    onMouseEnter={e => { if (s.website) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)' }}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                  >
                    {s.logo_url ? (
                      <img src={s.logo_url} alt={s.name} style={{ width: size, height: size / 2, objectFit: 'contain', marginBottom: 8 }} />
                    ) : (
                      <div style={{
                        width: size, height: size / 2,
                        background: 'var(--paper-2)', borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 8, fontSize: 24, fontWeight: 700, color: TIER_COLORS[key],
                        fontFamily: 'Anton, Impact',
                      }}>
                        {s.name[0]}
                      </div>
                    )}
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#333', textAlign: 'center' }}>{s.name}</span>
                    {s.sector && <span style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.sector}</span>}
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
