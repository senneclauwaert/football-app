// FotMob-style pitch — coordinate system:
//   position_x: 0=left → 100=right  (from each team's own perspective; away is mirrored)
//   position_y: 0=near own goal (defensive) → 100=near opponent's goal (attacking)
// Home team renders in bottom half (screenY ~54–96%), away in top half (~4–46%).

const FORMATION_SLOTS = {
  '4-3-3': [
    { role: 'K',  x: 50, y: 3  },
    { role: 'RB', x: 85, y: 27 }, { role: 'CB', x: 62, y: 25 }, { role: 'CB', x: 38, y: 25 }, { role: 'LB', x: 15, y: 27 },
    { role: 'RM', x: 82, y: 52 }, { role: 'CM', x: 50, y: 55 }, { role: 'LM', x: 18, y: 52 },
    { role: 'RV', x: 85, y: 80 }, { role: 'SP', x: 50, y: 86 }, { role: 'LV', x: 15, y: 80 },
  ],
  '4-4-2': [
    { role: 'K',  x: 50, y: 3  },
    { role: 'RB', x: 85, y: 27 }, { role: 'CB', x: 62, y: 25 }, { role: 'CB', x: 38, y: 25 }, { role: 'LB', x: 15, y: 27 },
    { role: 'RM', x: 88, y: 52 }, { role: 'CM', x: 62, y: 54 }, { role: 'CM', x: 38, y: 54 }, { role: 'LM', x: 12, y: 52 },
    { role: 'SP', x: 63, y: 83 }, { role: 'SP', x: 37, y: 83 },
  ],
  '4-2-3-1': [
    { role: 'K',   x: 50, y: 3  },
    { role: 'RB',  x: 85, y: 27 }, { role: 'CB', x: 62, y: 25 }, { role: 'CB', x: 38, y: 25 }, { role: 'LB', x: 15, y: 27 },
    { role: 'DM',  x: 63, y: 46 }, { role: 'DM', x: 37, y: 46 },
    { role: 'RV',  x: 82, y: 65 }, { role: 'AM', x: 50, y: 68 }, { role: 'LV', x: 18, y: 65 },
    { role: 'SP',  x: 50, y: 88 },
  ],
  '3-5-2': [
    { role: 'K',  x: 50, y: 3  },
    { role: 'CB', x: 22, y: 26 }, { role: 'CB', x: 50, y: 23 }, { role: 'CB', x: 78, y: 26 },
    { role: 'LV', x: 10, y: 50 }, { role: 'LM', x: 28, y: 53 }, { role: 'CM', x: 50, y: 57 }, { role: 'RM', x: 72, y: 53 }, { role: 'RV', x: 90, y: 50 },
    { role: 'SP', x: 35, y: 83 }, { role: 'SP', x: 65, y: 83 },
  ],
  '5-3-2': [
    { role: 'K',  x: 50, y: 3  },
    { role: 'LV', x: 8,  y: 28 }, { role: 'LB', x: 28, y: 25 }, { role: 'CB', x: 50, y: 23 }, { role: 'RB', x: 72, y: 25 }, { role: 'RV', x: 92, y: 28 },
    { role: 'LM', x: 20, y: 55 }, { role: 'CM', x: 50, y: 58 }, { role: 'RM', x: 80, y: 55 },
    { role: 'SP', x: 35, y: 83 }, { role: 'SP', x: 65, y: 83 },
  ],
  '4-1-4-1': [
    { role: 'K',  x: 50, y: 3  },
    { role: 'RB', x: 85, y: 27 }, { role: 'CB', x: 62, y: 25 }, { role: 'CB', x: 38, y: 25 }, { role: 'LB', x: 15, y: 27 },
    { role: 'DM', x: 50, y: 44 },
    { role: 'RM', x: 88, y: 60 }, { role: 'CM', x: 62, y: 63 }, { role: 'CM', x: 38, y: 63 }, { role: 'LM', x: 12, y: 60 },
    { role: 'SP', x: 50, y: 87 },
  ],
}

function getAutoSlots(formation) {
  return FORMATION_SLOTS[formation] || FORMATION_SLOTS['4-3-3']
}

function toScreenY_home(posY) {
  return 95 - (posY / 100) * 41
}
function toScreenY_away(posY) {
  return 5 + (posY / 100) * 41
}

function getEventBadges(playerId, playerName, events) {
  const badges = []
  events.forEach(ev => {
    const isPlayer = (playerId && ev.player_id === playerId) || (playerName && ev.player_name === playerName)
    if (!isPlayer) return
    if (ev.type === 'goal' || ev.type === 'penalty') badges.push('goal')
    if (ev.type === 'own_goal') badges.push('own_goal')
    if (ev.type === 'yellow_card') badges.push('yellow')
    if (ev.type === 'red_card' || ev.type === 'second_yellow') badges.push('red')
  })
  return badges
}

function lastName(fullName) {
  if (!fullName) return ''
  const parts = fullName.trim().split(' ')
  return parts[parts.length - 1].toUpperCase()
}

function PitchPlayer({ x, y, number, name, isHome, badges = [] }) {
  const bg          = isHome ? '#ff6a13' : '#111'
  const borderColor = isHome ? '#000'    : '#ff6a13'

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 2,
      pointerEvents: 'none',
      animation: 'pitch-player-in .35s cubic-bezier(.2,.8,.2,1) both',
    }}>
      {/* Circle with jersey number inside */}
      <div style={{
        position: 'relative',
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: bg,
        border: `2.5px solid ${borderColor}`,
        boxShadow: '0 3px 12px rgba(0,0,0,.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'Anton, Impact, sans-serif',
          fontSize: 13,
          color: '#fff',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          {number != null ? number : ''}
        </span>

        {badges.includes('goal') && (
          <div style={{
            position: 'absolute', top: -8, right: -8,
            width: 16, height: 16, borderRadius: '50%',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, border: '1px solid #ccc', zIndex: 1,
          }}>⚽</div>
        )}
        {badges.includes('yellow') && !badges.includes('red') && (
          <div style={{
            position: 'absolute', top: -5, left: -6,
            width: 9, height: 12, background: '#f5c518',
            borderRadius: 1, border: '1px solid #000', zIndex: 1,
          }} />
        )}
        {(badges.includes('red') || badges.includes('own_goal')) && (
          <div style={{
            position: 'absolute', top: -5, left: -6,
            width: 9, height: 12, background: '#d62828',
            borderRadius: 1, border: '1px solid #000', zIndex: 1,
          }} />
        )}
      </div>

      {/* Last name label below circle */}
      {name && (
        <div style={{
          marginTop: 4,
          fontSize: 8,
          fontWeight: 700,
          color: '#fff',
          textShadow: '0 1px 5px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,1)',
          lineHeight: 1,
          maxWidth: 56,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: 0.4,
        }}>
          {lastName(name)}
        </div>
      )}
    </div>
  )
}

export default function Pitch({ lineups = [], events = [], formation = '4-3-3' }) {
  const sortByNumber = arr =>
    [...arr].sort((a, b) => (a.jersey_number ?? 99) - (b.jersey_number ?? 99))

  const homeStarters = sortByNumber(lineups.filter(l => l.is_our_team && l.is_starting))
  const awayStarters = sortByNumber(lineups.filter(l => !l.is_our_team && l.is_starting))

  const slots = getAutoSlots(formation)

  const resolveHome = (entry, idx) => {
    const px = entry?.position_x ?? slots[idx]?.x ?? 50
    const py = entry?.position_y ?? slots[idx]?.y ?? 50
    return { screenX: px, screenY: toScreenY_home(py) }
  }

  const resolveAway = (entry, idx) => {
    const px = entry?.position_x ?? slots[idx]?.x ?? 50
    const py = entry?.position_y ?? slots[idx]?.y ?? 50
    return { screenX: 100 - px, screenY: toScreenY_away(py) }
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '0 auto' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '68/105',
        background: 'linear-gradient(180deg, #27713a 0%, #1f5c2e 50%, #27713a 100%)',
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 6px 32px rgba(0,0,0,.55)',
      }}>
        {/* Alternating pitch stripes */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0,
            top: `${i * 10}%`, height: '10%',
            background: i % 2 === 0 ? 'rgba(255,255,255,.035)' : 'transparent',
          }} />
        ))}

        {/* SVG pitch markings */}
        <svg
          viewBox="0 0 68 105"
          preserveAspectRatio="none"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            stroke: 'rgba(255,255,255,.45)',
            strokeWidth: .35,
            fill: 'none',
          }}
        >
          <rect x="1" y="1" width="66" height="103" />
          <line x1="1" y1="52.5" x2="67" y2="52.5" />
          <circle cx="34" cy="52.5" r="9" />
          <circle cx="34" cy="52.5" r=".7" fill="rgba(255,255,255,.6)" />
          <rect x="14" y="1" width="40" height="16" />
          <rect x="24" y="1" width="20" height="5.5" />
          <circle cx="34" cy="11" r=".7" fill="rgba(255,255,255,.5)" />
          <rect x="14" y="88" width="40" height="16" />
          <rect x="24" y="99.5" width="20" height="5.5" />
          <circle cx="34" cy="94" r=".7" fill="rgba(255,255,255,.5)" />
          <path d="M1 4 A3 3 0 0 0 4 1" />
          <path d="M64 1 A3 3 0 0 0 67 4" />
          <path d="M1 101 A3 3 0 0 1 4 104" />
          <path d="M64 104 A3 3 0 0 1 67 101" />
        </svg>

        {/* Away players (top half) */}
        {awayStarters.map((entry, i) => {
          const { screenX, screenY } = resolveAway(entry, i)
          const badges = getEventBadges(entry.player_id, entry.player_name, events)
          return (
            <PitchPlayer
              key={`away-${i}`}
              x={screenX}
              y={Math.min(Math.max(screenY, 3), 48)}
              number={entry.jersey_number}
              name={entry.player_name}
              isHome={false}
              badges={badges}
            />
          )
        })}

        {/* Home players (bottom half) — always render all 11 slots */}
        {slots.map((slot, i) => {
          const entry = homeStarters[i]
          const { screenX, screenY } = resolveHome(entry, i)
          const badges = entry
            ? getEventBadges(entry.player_id, entry.player_name, events)
            : []
          return (
            <PitchPlayer
              key={`home-${i}`}
              x={screenX}
              y={Math.min(Math.max(screenY, 52), 97)}
              number={entry?.jersey_number ?? null}
              name={entry?.player_name ?? null}
              isHome={true}
              badges={badges}
            />
          )
        })}
      </div>
    </div>
  )
}

export { FORMATION_SLOTS }
