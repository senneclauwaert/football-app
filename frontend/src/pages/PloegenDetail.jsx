import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import PlayerAvatar from '../components/PlayerAvatar'
import Crest from '../components/Crest'
import Icon from '../components/Icon'
import { getTeam } from '../api/teams'
import { getPlayers } from '../api/players'

const POS_LABELS = {
  goalkeeper: 'Doelwachter',
  defender: 'Verdediger',
  midfielder: 'Middenvelder',
  forward: 'Aanvaller',
}
const POS_ICONS = {
  goalkeeper: '🧤',
  defender: '🛡️',
  midfielder: '⚙️',
  forward: '⚡',
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

  if (tLoading) {
    return (
      <Layout title="Ploeg">
        <div style={{ padding: 60, color: '#888', textAlign: 'center', fontSize: 14 }}>Laden...</div>
      </Layout>
    )
  }
  if (!team) {
    return (
      <Layout title="Ploeg">
        <div style={{ padding: 60, color: '#888', textAlign: 'center', fontSize: 14 }}>Ploeg niet gevonden</div>
      </Layout>
    )
  }

  const grouped = {}
  POS_ORDER.forEach(p => {
    const inPos = players.filter(pl => pl.position === p)
    if (inPos.length > 0) grouped[p] = inPos
  })
  const noPos = players.filter(pl => !pl.position || !POS_ORDER.includes(pl.position))
  if (noPos.length > 0) grouped['other'] = noPos

  const teamBg = team.color || '#0a0a0a'
  const isOrange = teamBg === '#ff6a13' || teamBg?.toLowerCase() === '#ff6200'

  return (
    <Layout title={team.name}>
      <button
        onClick={() => navigate('/ploegen')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#888', marginBottom: 20, fontSize: 13,
          transition: 'color .12s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
        onMouseLeave={e => e.currentTarget.style.color = '#888'}
      >
        <Icon name="chevronLeft" size={14} /> Alle ploegen
      </button>

      {/* Team header */}
      <div
        className="card-in"
        style={{
          background: teamBg,
          color: isOrange ? '#000' : '#fff',
          padding: '28px 24px',
          borderRadius: 3,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Watermark */}
        <div style={{
          position: 'absolute', right: -16, top: -16,
          fontFamily: 'Anton, Impact, sans-serif',
          fontSize: 120, opacity: 0.08, lineHeight: 1,
          color: isOrange ? '#000' : '#fff',
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {team.short_name || team.name.slice(0, 3).toUpperCase()}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Crest size={72} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="display" style={{ fontSize: 40, lineHeight: .95, marginBottom: 8 }}>
            {team.name}
          </div>
          <div className="mono" style={{ fontSize: 12, letterSpacing: '.12em', opacity: 0.8 }}>
            {team.league && `${team.league} · `}
            {team.coach && `Trainer: ${team.coach}`}
            {team.assistant_coach && ` · Ass.: ${team.assistant_coach}`}
          </div>
          <div className="mono" style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>
            {players.length} spelers
          </div>
        </div>
      </div>

      {/* Players by position */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{
          color: '#888', textAlign: 'center', padding: 60,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 3, fontSize: 14,
        }}>
          Geen spelers gevonden
        </div>
      ) : (
        Object.entries(grouped).map(([pos, posPlayers]) => (
          <div key={pos} style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              letterSpacing: '.15em', textTransform: 'uppercase',
              color: '#888', marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>{POS_ICONS[pos] || ''}</span>
              {POS_LABELS[pos] || 'Overige'} · {posPlayers.length}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
              {posPlayers.map((player, i) => (
                <button
                  key={player.id}
                  onClick={() => navigate(`/ploegen/${slug}/${player.id}`)}
                  className="card-in"
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: 3,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'transform .08s, border-color .15s',
                    willChange: 'transform',
                    animationDelay: `${Math.min(i * 40, 280)}ms`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--orange)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--line)'
                    e.currentTarget.style.transform = ''
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <PlayerAvatar
                      firstName={player.first_name}
                      lastName={player.last_name}
                      photo={player.photo_url}
                      size={46}
                    />
                    {player.jersey_number && (
                      <div style={{
                        position: 'absolute', bottom: -2, right: -4,
                        background: '#0a0a0a', color: 'var(--orange)',
                        fontFamily: 'Anton, Impact, sans-serif',
                        fontSize: 10, padding: '1px 4px',
                        borderRadius: 2, minWidth: 18, textAlign: 'center',
                      }}>
                        {player.jersey_number}
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {player.first_name} {player.last_name}
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: '#888', letterSpacing: '.08em', marginTop: 2 }}>
                      {POS_LABELS[player.position] || ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </Layout>
  )
}
