// SVG Football Pitch with player positions

function getEventBadges(playerId, playerName, events) {
  const badges = []
  events.forEach(ev => {
    const isPlayer = ev.player_id === playerId || ev.player_name === playerName
    if (!isPlayer) return
    if (ev.type === 'goal' || ev.type === 'penalty') badges.push('⚽')
    if (ev.type === 'own_goal') badges.push('⚽og')
    if (ev.type === 'yellow_card') badges.push('🟨')
    if (ev.type === 'red_card' || ev.type === 'second_yellow') badges.push('🟥')
  })
  return badges
}

function PlayerDot({ entry, events = [], orange = true }) {
  const x = (entry.position_x ?? 50) + '%'
  const y = (100 - (entry.position_y ?? 50)) + '%'
  const name = entry.player_name || (entry.player ? `${entry.player.last_name}` : '?')
  const badges = getEventBadges(entry.player_id, entry.player_name, events)

  return (
    <g>
      {/* Circle */}
      <circle
        cx={x} cy={y} r="4%"
        fill={orange ? '#ff6a13' : '#0a0a0a'}
        stroke="#fff"
        strokeWidth="1"
      />
      {/* Jersey number */}
      <text
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize="3%"
        fontFamily="Inter, system-ui"
        fontWeight="700"
      >
        {entry.jersey_number || ''}
      </text>
      {/* Name below */}
      <text
        x={x}
        y={`calc(${y} + 6%)`}
        textAnchor="middle"
        fill="#fff"
        fontSize="2.5%"
        fontFamily="Inter, system-ui"
        fontWeight="500"
      >
        {name.split(' ').pop()}
      </text>
      {/* Event badges */}
      {badges.map((b, i) => (
        <text key={i} x={`calc(${x} + ${(i * 4) - 4}%)`} y={`calc(${y} - 6%)`} fontSize="2.5%">
          {b}
        </text>
      ))}
    </g>
  )
}

export default function Pitch({ lineups = [], events = [], height = 400 }) {
  const homeTeam = lineups.filter(l => l.is_our_team && l.is_starting)
  const awayTeam = lineups.filter(l => !l.is_our_team && l.is_starting)

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <svg
        viewBox="0 0 100 150"
        style={{
          width: '100%',
          background: '#2d7a3f',
          borderRadius: 8,
          display: 'block',
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Pitch stripes */}
        {[0, 1, 2, 3, 4].map(i => (
          <rect key={i} x="0" y={i * 30} width="100" height="15" fill={i % 2 === 0 ? '#2d7a3f' : '#2a7039'} />
        ))}

        {/* Border */}
        <rect x="2" y="2" width="96" height="146" fill="none" stroke="#ffffff55" strokeWidth="0.5" />

        {/* Centre line */}
        <line x1="2" y1="75" x2="98" y2="75" stroke="#ffffff55" strokeWidth="0.5" />

        {/* Centre circle */}
        <circle cx="50" cy="75" r="12" fill="none" stroke="#ffffff55" strokeWidth="0.5" />
        <circle cx="50" cy="75" r="0.8" fill="#ffffff55" />

        {/* Top penalty area */}
        <rect x="20" y="2" width="60" height="20" fill="none" stroke="#ffffff55" strokeWidth="0.5" />
        <rect x="35" y="2" width="30" height="8" fill="none" stroke="#ffffff55" strokeWidth="0.5" />

        {/* Bottom penalty area */}
        <rect x="20" y="128" width="60" height="20" fill="none" stroke="#ffffff55" strokeWidth="0.5" />
        <rect x="35" y="140" width="30" height="8" fill="none" stroke="#ffffff55" strokeWidth="0.5" />

        {/* Goals */}
        <rect x="38" y="0" width="24" height="3" fill="none" stroke="#ffffffaa" strokeWidth="0.5" />
        <rect x="38" y="147" width="24" height="3" fill="none" stroke="#ffffffaa" strokeWidth="0.5" />

        {/* Players - away team top half */}
        {awayTeam.map((entry, i) => (
          <PlayerDot key={`away-${i}`} entry={{ ...entry, position_y: entry.position_y != null ? Math.min(entry.position_y, 48) : 25 }} events={events} orange={false} />
        ))}

        {/* Players - home team bottom half */}
        {homeTeam.map((entry, i) => (
          <PlayerDot key={`home-${i}`} entry={{ ...entry, position_y: entry.position_y != null ? Math.max(entry.position_y, 52) : 75 }} events={events} orange={true} />
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff6a13', display: 'inline-block' }} />
          Toekomst Relegem
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#0a0a0a', display: 'inline-block' }} />
          Tegenstander
        </span>
      </div>
    </div>
  )
}
