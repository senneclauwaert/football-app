import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import PlayerAvatar from '../components/PlayerAvatar'
import Icon from '../components/Icon'
import { getTeam } from '../api/teams'
import { getPlayers } from '../api/players'

const POS_LABELS = {
  goalkeeper: 'Doelwachter',
  defender: 'Verdediger',
  midfielder: 'Middenvelder',
  forward: 'Aanvaller',
}
const POS_ORDER = ['goalkeeper', 'defender', 'midfielder', 'forward']

export default function PloegenDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { data: team, isLoading: tLoading } = useQuery({
    queryKey: ['team', slug],
    queryFn: () => getTeam(slug),
  })
  const { data: players = [] } = useQuery({
    queryKey: ['players', team?.id],
    queryFn: () => getPlayers(team?.id),
    enabled: !!team?.id,
  })

  if (tLoading) return <Layout title="Ploeg"><div style={{ padding: 40, color: '#888', textAlign: 'center' }}>Laden...</div></Layout>
  if (!team) return <Layout title="Ploeg"><div style={{ padding: 40, color: '#888', textAlign: 'center' }}>Ploeg niet gevonden</div></Layout>

  const grouped = {}
  POS_ORDER.forEach(p => {
    const inPos = players.filter(pl => pl.position === p)
    if (inPos.length > 0) grouped[p] = inPos
  })
  const noPos = players.filter(pl => !pl.position || !POS_ORDER.includes(pl.position))
  if (noPos.length > 0) grouped['other'] = noPos

  return (
    <Layout title={team.name}>
      <button onClick={() => navigate('/ploegen')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', marginBottom: 16, fontSize: 14 }}>
        <Icon name="chevronLeft" size={16} /> Alle ploegen
      </button>

      {/* Team header */}
      <div style={{
        background: team.color || '#111',
        borderRadius: 12, padding: '28px 24px',
        color: '#fff', marginBottom: 24,
      }}>
        <h1 className="display" style={{ fontSize: 36, color: '#fff', margin: '0 0 8px' }}>{team.name}</h1>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          {team.coach && <span>Trainer: {team.coach}</span>}
          {team.assistant_coach && <span>Assistent: {team.assistant_coach}</span>}
          <span>{players.length} spelers</span>
        </div>
      </div>

      {/* Players by position */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Geen spelers gevonden</div>
      ) : (
        Object.entries(grouped).map(([pos, posPlayers]) => (
          <div key={pos} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              {POS_LABELS[pos] || 'Overige'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {posPlayers.map(player => (
                <div
                  key={player.id}
                  onClick={() => navigate(`/ploegen/${slug}/${player.id}`)}
                  style={{
                    background: '#fff', borderRadius: 10, padding: '16px',
                    border: '1px solid var(--line)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                >
                  <PlayerAvatar firstName={player.first_name} lastName={player.last_name} photo={player.photo_url} size={48} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{player.first_name} {player.last_name}</div>
                    {player.jersey_number && (
                      <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 700 }}>#{player.jersey_number}</div>
                    )}
                    <div style={{ fontSize: 12, color: '#888' }}>{POS_LABELS[player.position] || ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </Layout>
  )
}
