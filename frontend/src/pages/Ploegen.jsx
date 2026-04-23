import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Crest from '../components/Crest'
import { getTeams } from '../api/teams'

const AGE_LABELS = {
  first_team: '1e Ploeg', reserves: 'Reserven',
  u17: 'U17', u16: 'U16', u15: 'U15', u13: 'U13', u12: 'U12',
  u11: 'U11', u10: 'U10', u9: 'U9', u8: 'U8', u7: 'U7', u6: 'U6',
}

export default function Ploegen() {
  const navigate = useNavigate()
  const { data: teams = [], isLoading } = useQuery({ queryKey: ['teams'], queryFn: getTeams })

  return (
    <Layout title="Ploegen">
      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Laden...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {teams.map(team => (
            <div
              key={team.id}
              onClick={() => navigate(`/ploegen/${team.slug}`)}
              style={{
                background: team.color || '#111',
                borderRadius: 12, padding: '24px 20px',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                transition: 'transform 0.15s, box-shadow 0.15s',
                minHeight: 160,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              {/* Watermark */}
              <div style={{
                position: 'absolute', right: -10, top: -10,
                fontSize: 72, fontFamily: 'Anton, Impact', opacity: 0.1,
                color: '#fff', userSelect: 'none', lineHeight: 1,
              }}>
                {team.short_name || team.name.slice(0, 3).toUpperCase()}
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <Crest size={32} />
                <h2 className="display" style={{ fontSize: 28, color: '#fff', margin: '12px 0 6px', lineHeight: 1 }}>
                  {team.name}
                </h2>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
                  {AGE_LABELS[team.age_group] || team.age_group}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {team.player_count ?? 0} spelers
                  </span>
                  {team.coach && (
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                      T: {team.coach}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
