import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import Crest from '../components/Crest'
import OppCrest from '../components/OppCrest'
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
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {competitions.map(c => (
            <button
              key={c.id}
              onClick={() => setCompetitionId(c.id)}
              className={`pill ${(competitionId || competitions[0]?.id) === c.id ? 'pill-orange' : 'pill-ghost'}`}
              style={{ cursor: 'pointer', padding: '8px 14px' }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 60, fontSize: 14 }}>Laden...</div>
      ) : standings.length === 0 ? (
        <div style={{
          color: '#888', textAlign: 'center', padding: 60,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 3, fontSize: 14,
        }}>
          Geen klassement beschikbaar
        </div>
      ) : (
        <div
          className="card-in"
          style={{
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', width: 36, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                  #
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Ploeg
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700 }}>G</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700 }}>W</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700 }}>G</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700 }}>V</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700 }}>+/-</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700 }}>Ptn</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => {
                const isPromotion = i < 2
                const isRelegation = i >= standings.length - 2
                const isUs = s.is_us

                return (
                  <tr
                    key={s.id || i}
                    style={{
                      background: isUs ? 'var(--orange-soft)' : '#fff',
                      borderBottom: '1px solid var(--line)',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={e => { if (!isUs) e.currentTarget.style.background = 'var(--paper-2)' }}
                    onMouseLeave={e => { if (!isUs) e.currentTarget.style.background = '#fff' }}
                  >
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 22, height: 22,
                        borderRadius: 2,
                        background: isPromotion ? 'var(--green)' : isRelegation ? 'var(--red)' : 'transparent',
                        color: (isPromotion || isRelegation) ? '#fff' : '#888',
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {s.position || i + 1}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isUs ? <Crest size={22} /> : <OppCrest name={s.team_name} size={22} />}
                        <span style={{ fontWeight: isUs ? 700 : 500, fontSize: 14 }}>{s.team_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', color: '#666' }}>{s.played}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', color: '#666' }}>{s.won}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', color: '#666' }}>{s.drawn}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', color: '#666' }}>{s.lost}</td>
                    <td style={{
                      padding: '11px 12px', textAlign: 'center',
                      fontFamily: 'ui-monospace, monospace',
                      color: s.goal_diff > 0 ? 'var(--green)' : s.goal_diff < 0 ? 'var(--red)' : '#666',
                    }}>
                      {s.goal_diff > 0 ? '+' : ''}{s.goal_diff}
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                      {s.points}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div style={{
            display: 'flex', gap: 16, padding: '10px 14px',
            borderTop: '1px solid var(--line)',
            background: 'var(--paper-2)',
            fontSize: 11, color: '#888',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 1, background: 'var(--green)', display: 'inline-block' }} />
              Promotie
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 1, background: 'var(--red)', display: 'inline-block' }} />
              Degradatie
            </span>
          </div>
        </div>
      )}
    </Layout>
  )
}
