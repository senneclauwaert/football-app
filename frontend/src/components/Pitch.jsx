// FotMob-style pitch with player dots + event badges

function getEventBadges(playerId, playerName, events) {
  const badges = []
  events.forEach(ev => {
    const isPlayer = ev.player_id === playerId || ev.player_name === playerName
    if (!isPlayer) return
    if (ev.type === 'goal' || ev.type === 'penalty') badges.push('goal')
    if (ev.type === 'own_goal') badges.push('own_goal')
    if (ev.type === 'yellow_card') badges.push('yellow')
    if (ev.type === 'red_card' || ev.type === 'second_yellow') badges.push('red')
  })
  return badges
}

function PitchPlayer({ x, y, number, name, isHome, badges = [] }) {
  const bg   = isHome ? '#ff6a13' : '#0a0a0a'
  const fg   = isHome ? '#000'    : '#ff6a13'
  const border = isHome ? '2px solid #000' : '2px solid #ff6a13'

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none',
      width: 48,
      animation: 'pitch-player-in .4s cubic-bezier(.2,.8,.2,1) both',
    }}>
      {/* Circle */}
      <div style={{
        position: 'relative',
        width: 32, height: 32,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Anton, Impact, sans-serif',
        fontSize: 14,
        border,
        boxShadow: '0 2px 6px rgba(0,0,0,.4)',
      }}>
        {number}
        {/* Goal badge */}
        {badges.includes('goal') && (
          <div style={{
            position: 'absolute', top: -5, right: -5,
            width: 15, height: 15, borderRadius: '50%',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, border: '1px solid #ccc',
          }}>
            ⚽
          </div>
        )}
        {/* Yellow card badge */}
        {badges.includes('yellow') && !badges.includes('red') && (
          <div style={{
            position: 'absolute', bottom: -3, left: -4,
            width: 10, height: 13, background: '#f5c518',
            borderRadius: 1, border: '1px solid #000',
          }} />
        )}
        {/* Red card badge */}
        {(badges.includes('red') || badges.includes('own_goal')) && (
          <div style={{
            position: 'absolute', bottom: -3, left: -4,
            width: 10, height: 13, background: '#d62828',
            borderRadius: 1, border: '1px solid #000',
          }} />
        )}
      </div>
      {/* Name label */}
      <div style={{
        marginTop: 3,
        background: 'rgba(0,0,0,.72)',
        color: '#fff',
        fontSize: 8.5,
        padding: '1px 4px',
        borderRadius: 2,
        maxWidth: 56,
        textAlign: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        letterSpacing: '.02em',
        fontWeight: 600,
      }}>
        {name}
      </div>
    </div>
  )
}

export default function Pitch({ lineups = [], events = [] }) {
  const homeStarters = lineups.filter(l => l.is_our_team && l.is_starting)
  const awayStarters = lineups.filter(l => !l.is_our_team && l.is_starting)

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '0 auto' }}>
      {/* Pitch surface */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '68/105',
        background: 'linear-gradient(180deg, #2d7a3f 0%, #256632 100%)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        {/* Alternating stripes */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: 0, right: 0,
              top: `${i * 10}%`, height: '10%',
              background: i % 2 === 0 ? 'rgba(255,255,255,.025)' : 'transparent',
            }}
          />
        ))}

        {/* SVG pitch markings */}
        <svg
          viewBox="0 0 68 105"
          preserveAspectRatio="none"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            stroke: 'rgba(255,255,255,.42)',
            strokeWidth: .3,
            fill: 'none',
          }}
        >
          <rect x="1" y="1" width="66" height="103" />
          <line x1="1" y1="52.5" x2="67" y2="52.5" />
          <circle cx="34" cy="52.5" r="9" />
          <circle cx="34" cy="52.5" r=".6" fill="rgba(255,255,255,.5)" />
          {/* Top penalty box */}
          <rect x="14" y="1" width="40" height="16" />
          <rect x="24" y="1" width="20" height="5" />
          <circle cx="34" cy="10" r=".6" fill="rgba(255,255,255,.5)" />
          {/* Bottom penalty box */}
          <rect x="14" y="88" width="40" height="16" />
          <rect x="24" y="99" width="20" height="5" />
          <circle cx="34" cy="95" r=".6" fill="rgba(255,255,255,.5)" />
        </svg>

        {/* Away players — top half */}
        {awayStarters.map((entry, i) => {
          const x = entry.position_x ?? 50
          const rawY = entry.position_y ?? 50
          // Mirror into top half (0–48%)
          const y = (100 - rawY) / 2
          const name = entry.player_name || (entry.player ? entry.player.last_name : '?')
          const badges = getEventBadges(entry.player_id, entry.player_name, events)
          return (
            <PitchPlayer
              key={`away-${i}`}
              x={100 - x}
              y={Math.min(y, 48)}
              number={entry.jersey_number || ''}
              name={name}
              isHome={false}
              badges={badges}
            />
          )
        })}

        {/* Home players — bottom half */}
        {homeStarters.map((entry, i) => {
          const x = entry.position_x ?? 50
          const rawY = entry.position_y ?? 50
          // Mirror into bottom half (52–100%)
          const y = 50 + (rawY - 50) / 2 + 2
          const name = entry.player_name || (entry.player ? entry.player.last_name : '?')
          const badges = getEventBadges(entry.player_id, entry.player_name, events)
          return (
            <PitchPlayer
              key={`home-${i}`}
              x={x}
              y={Math.max(y, 52)}
              number={entry.jersey_number || ''}
              name={name}
              isHome={true}
              badges={badges}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 20, justifyContent: 'center',
        marginTop: 10, fontSize: 12, color: '#666',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff6a13', border: '1.5px solid #000', display: 'inline-block' }} />
          Toekomst Relegem
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#0a0a0a', border: '1.5px solid #ff6a13', display: 'inline-block' }} />
          Tegenstander
        </span>
      </div>
    </div>
  )
}
