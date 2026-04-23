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

function teamBg(index, teamColor) {
  if (teamColor) return teamColor
  return index % 2 === 0 ? '#0a0a0a' : '#ff6a13'
}

function teamFg(index, teamColor) {
  if (teamColor) return '#fff'
  return index % 2 === 0 ? '#fff' : '#000'
}

export default function Ploegen() {
  const navigate = useNavigate()
  const { data: teams = [], isLoading } = useQuery({ queryKey: ['teams'], queryFn: getTeams })

  return (
    <Layout title="Ploegen">
      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 60, fontSize: 14 }}>Laden...</div>
      ) : teams.length === 0 ? (
        <div style={{
          color: '#888', textAlign: 'center', padding: 60,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 3, fontSize: 14,
        }}>
          Geen ploegen gevonden
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 14,
        }}>
          {teams.map((team, i) => {
            const bg = teamBg(i, team.color)
            const fg = teamFg(i, team.color)
            return (
              <button
                key={team.id}
                onClick={() => navigate(`/ploegen/${team.slug}`)}
                className="card-in"
                style={{
                  background: bg,
                  color: fg,
                  padding: '20px 18px',
                  borderRadius: 3,
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  aspectRatio: '4/3',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform .1s, box-shadow .15s',
                  willChange: 'transform',
                  animationDelay: `${Math.min(i * 50, 350)}ms`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                {/* Background watermark text */}
                <div style={{
                  position: 'absolute',
                  right: -12, top: -12,
                  fontFamily: 'Anton, Impact, sans-serif',
                  fontSize: 100,
                  opacity: 0.1,
                  lineHeight: 1,
                  color: fg,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}>
                  {team.short_name || team.name.slice(0, 3).toUpperCase()}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <Crest size={28} />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '.15em', opacity: 0.7, marginBottom: 4 }}>
                    {AGE_LABELS[team.age_group] || team.age_group || team.league}
                  </div>
                  <div className="display" style={{ fontSize: 28, lineHeight: 1, marginBottom: 8 }}>
                    {team.name}
                  </div>
                  <div className="mono" style={{ fontSize: 11, opacity: 0.75 }}>
                    {(team.player_count ?? 0)} spelers
                    {team.coach ? ` · T: ${team.coach}` : ''}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
