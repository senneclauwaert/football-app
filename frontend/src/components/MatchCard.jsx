import { useNavigate } from 'react-router-dom'
import Crest from './Crest'
import OppCrest from './OppCrest'

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const days = ['Zon', 'Maa', 'Din', 'Woe', 'Don', 'Vri', 'Zat']
  const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
}

function fmtTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function resultBorderColor(match) {
  if (match.status === 'live') return 'var(--red)'
  if (match.status === 'finished') {
    const hs = match.home_score ?? 0
    const as = match.away_score ?? 0
    if (match.is_home) return hs > as ? 'var(--green)' : hs === as ? 'var(--line)' : 'var(--red)'
    else return as > hs ? 'var(--green)' : as === hs ? 'var(--line)' : 'var(--red)'
  }
  return 'var(--orange)'
}

export default function MatchCard({ match, compact = false }) {
  const navigate = useNavigate()
  const isLive = match.status === 'live'
  const isFt = match.status === 'finished'
  const borderColor = resultBorderColor(match)

  const homeName = match.is_home ? 'Toekomst Relegem' : match.opponent_name
  const awayName = match.is_home ? match.opponent_name : 'Toekomst Relegem'
  const homeScore = match.home_score ?? 0
  const awayScore = match.away_score ?? 0

  return (
    <button
      onClick={() => navigate(`/wedstrijden/${match.id}`)}
      style={{
        display: 'grid',
        gridTemplateColumns: compact ? '56px 1fr auto' : '68px 1fr auto',
        alignItems: 'center',
        gap: 14,
        padding: compact ? '10px 12px' : '14px 16px',
        background: '#fff',
        border: '1px solid var(--line)',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 3,
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'transform .08s, box-shadow .12s',
        willChange: 'transform',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.07)'; e.currentTarget.style.transform = 'translateX(2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
    >
      {/* Left: date / status / score */}
      <div style={{ textAlign: 'center' }}>
        {isLive ? (
          <span className="pill pill-live live-pulse" style={{ fontSize: 10, padding: '3px 6px' }}>
            ● {match.live_minute ? `${match.live_minute}'` : 'LIVE'}
          </span>
        ) : isFt ? (
          <>
            <div className="display" style={{ fontSize: 22 }}>{homeScore}–{awayScore}</div>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 1 }}>Eindstand</div>
          </>
        ) : (
          <>
            <div className="mono" style={{ fontSize: 10, color: '#888' }}>{fmtDate(match.match_date)}</div>
            <div className="display" style={{ fontSize: 18, marginTop: 2 }}>{fmtTime(match.match_date)}</div>
          </>
        )}
      </div>

      {/* Middle: team names */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: compact ? 2 : 5 }}>
          {match.is_home ? <Crest size={20} /> : <OppCrest name={match.opponent_name} size={20} />}
          <span style={{ fontWeight: 700, fontSize: 13 }}>{homeName}</span>
          {match.is_home && (
            <span className="mono" style={{ fontSize: 9, color: '#888', letterSpacing: '.1em' }}>THUIS</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {match.is_home ? <OppCrest name={match.opponent_name} size={20} /> : <Crest size={20} />}
          <span style={{ fontWeight: 700, fontSize: 13 }}>{awayName}</span>
          {!match.is_home && (
            <span className="mono" style={{ fontSize: 9, color: '#888', letterSpacing: '.1em' }}>UIT</span>
          )}
        </div>
      </div>

      {/* Right: competition */}
      <div style={{ textAlign: 'right' }}>
        {match.competition_name && (
          <div className="mono" style={{ fontSize: 10, color: '#888', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {match.competition_name}
          </div>
        )}
        {match.status === 'scheduled' && (
          <span className="pill pill-orange" style={{ marginTop: 4, fontSize: 10 }}>Gepland</span>
        )}
      </div>
    </button>
  )
}
