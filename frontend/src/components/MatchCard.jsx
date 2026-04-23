import { useNavigate } from 'react-router-dom'
import Crest from './Crest'
import OppCrest from './OppCrest'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function resultColor(match) {
  if (match.status === 'live') return '#ff4d00'
  if (match.status === 'finished') {
    const hs = match.home_score ?? 0
    const as = match.away_score ?? 0
    if (match.is_home) return hs > as ? '#1f8a3d' : hs === as ? '#888' : '#d62828'
    else return as > hs ? '#1f8a3d' : as === hs ? '#888' : '#d62828'
  }
  return '#ff6a13'
}

export default function MatchCard({ match }) {
  const navigate = useNavigate()
  const color = resultColor(match)
  const isLive = match.status === 'live'
  const hasScore = match.status === 'finished' || match.status === 'live'

  const homeName = match.is_home ? 'Toekomst Relegem' : match.opponent_name
  const awayName = match.is_home ? match.opponent_name : 'Toekomst Relegem'
  const homeScore = match.home_score ?? '-'
  const awayScore = match.away_score ?? '-'

  return (
    <div
      onClick={() => navigate(`/wedstrijden/${match.id}`)}
      style={{
        display: 'flex', alignItems: 'center',
        background: '#fff',
        border: '1px solid var(--line)',
        borderLeft: `4px solid ${color}`,
        borderRadius: 8,
        padding: '14px 16px',
        cursor: 'pointer',
        gap: 12,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Left: date / status */}
      <div style={{ minWidth: 80, fontSize: 12, color: '#666', lineHeight: 1.4 }}>
        {isLive ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#ff4d00', color: '#fff',
            borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700,
          }}>
            <span className="animate-pulse-dot" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', display: 'inline-block' }} />
            LIVE {match.live_minute ? `${match.live_minute}'` : ''}
          </span>
        ) : (
          formatDate(match.match_date)
        )}
      </div>

      {/* Teams + score */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{homeName}</span>
          {match.is_home ? <Crest size={24} /> : <OppCrest name={match.opponent_name} size={24} />}
        </div>

        {/* Score */}
        <div style={{
          minWidth: 56, textAlign: 'center',
          fontFamily: 'Anton, Impact, sans-serif',
          fontSize: 20, letterSpacing: 2,
          color: hasScore ? '#0a0a0a' : '#aaa',
        }}>
          {hasScore ? `${homeScore} - ${awayScore}` : 'vs'}
        </div>

        {/* Away */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          {match.is_home ? <OppCrest name={match.opponent_name} size={24} /> : <Crest size={24} />}
          <span style={{ fontWeight: 600, fontSize: 14 }}>{awayName}</span>
        </div>
      </div>

      {/* Right: venue */}
      {match.venue && (
        <div style={{ fontSize: 12, color: '#888', minWidth: 80, textAlign: 'right' }}>
          {match.venue}
        </div>
      )}
    </div>
  )
}
