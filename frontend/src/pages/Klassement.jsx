import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getStandings, getCompetitions } from '../api/standings'

export default function Klassement() {
  const [competitionId, setCompetitionId] = useState(null)

  const { data: competitions = [] } = useQuery({ queryKey: ['competitions'], queryFn: getCompetitions })
  const selectedComp = competitionId || competitions[0]?.id
  const { data: standings = [], isLoading } = useQuery({
    queryKey: ['standings', selectedComp],
    queryFn: () => getStandings(selectedComp),
    enabled: !!selectedComp,
  })

  return (
    <Layout title="Klassement">
      {/* Competition selector */}
      {competitions.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {competitions.map(c => (
            <button
              key={c.id}
              onClick={() => setCompetitionId(c.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                background: (competitionId || competitions[0]?.id) === c.id ? 'var(--orange)' : 'var(--paper-2)',
                color: (competitionId || competitions[0]?.id) === c.id ? '#fff' : '#666',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Laden...</div>
      ) : standings.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Geen klassement beschikbaar</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--line)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 40px 40px 40px 40px 60px 48px',
            gap: 0, padding: '10px 16px',
            background: 'var(--paper-2)',
            fontSize: 12, fontWeight: 600, color: '#888',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <span>#</span>
            <span>Team</span>
            <span style={{ textAlign: 'center' }}>G</span>
            <span style={{ textAlign: 'center' }}>W</span>
            <span style={{ textAlign: 'center' }}>G</span>
            <span style={{ textAlign: 'center' }}>V</span>
            <span style={{ textAlign: 'center' }}>+/-</span>
            <span style={{ textAlign: 'center' }}>Ptn</span>
          </div>
          {standings.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 40px 40px 40px 40px 60px 48px',
                gap: 0, padding: '12px 16px',
                borderTop: i > 0 ? '1px solid var(--line)' : 'none',
                background: s.is_us ? 'var(--orange-soft)' : '#fff',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 13, color: s.is_us ? 'var(--orange)' : '#888', fontWeight: s.is_us ? 700 : 400 }}>
                {s.position || i + 1}
              </span>
              <span style={{ fontWeight: s.is_us ? 700 : 500, fontSize: 14, color: s.is_us ? 'var(--orange)' : '#0a0a0a' }}>
                {s.team_name}
              </span>
              <span style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>{s.played}</span>
              <span style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>{s.won}</span>
              <span style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>{s.drawn}</span>
              <span style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>{s.lost}</span>
              <span style={{ textAlign: 'center', fontSize: 13, color: s.goal_diff > 0 ? 'var(--green)' : s.goal_diff < 0 ? 'var(--red)' : '#666' }}>
                {s.goal_diff > 0 ? '+' : ''}{s.goal_diff}
              </span>
              <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: s.is_us ? 'var(--orange)' : '#0a0a0a' }}>
                {s.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
