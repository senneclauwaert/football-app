import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import Crest from '../components/Crest'
import OppCrest from '../components/OppCrest'
import { getStandings, getTeamCompetitions } from '../api/standings'
import { getTeams } from '../api/teams'

const AGE_LABEL = {
  first_team: 'Eerste Elftal',
  reserves:   'Reserven',
  u17: 'U17', u16: 'U16', u15: 'U15', u14: 'U14',
  u13: 'U13', u12: 'U12', u11: 'U11', u10: 'U10',
  u9: 'U9',   u8:  'U8',  u7:  'U7',  u6:  'U6',
}

// ── Level 1: team list ──────────────────────────────────
function TeamList({ onSelect }) {
  const { data: teams = [], isLoading } = useQuery({ queryKey: ['teams'], queryFn: getTeams })

  if (isLoading) return <LoadingState />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {teams.map(team => (
        <button
          key={team.id}
          onClick={() => onSelect(team)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: '#fff',
            border: '1px solid var(--line)',
            borderLeft: '3px solid var(--orange)',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'background .12s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Crest size={28} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{team.name}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                {AGE_LABEL[team.age_group] || team.age_group}
              </div>
            </div>
          </div>
          <span style={{ color: 'var(--orange)', fontSize: 18, lineHeight: 1 }}>›</span>
        </button>
      ))}
    </div>
  )
}

// ── Level 2: competition list for a team ───────────────
function CompetitionList({ team, onSelect, onBack }) {
  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['team-competitions', team.id],
    queryFn: () => getTeamCompetitions(team.id),
  })

  return (
    <>
      <BackBar label={team.name} onBack={onBack} />
      {isLoading ? <LoadingState /> : competitions.length === 0 ? (
        <EmptyState text="Geen competities gevonden voor dit team" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {competitions.map(comp => (
            <button
              key={comp.id}
              onClick={() => onSelect(comp)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 18px',
                background: '#fff',
                border: '1px solid var(--line)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background .12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{comp.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2, textTransform: 'capitalize' }}>
                  {comp.type === 'league' ? 'Competitie' : comp.type}
                </div>
              </div>
              <span style={{ color: 'var(--orange)', fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

// ── Level 3: standings table ───────────────────────────
function StandingsTable({ competition, team, onBack }) {
  const { data: standings = [], isLoading } = useQuery({
    queryKey: ['standings', competition.id],
    queryFn: () => getStandings(competition.id),
  })

  const sorted = standings.slice().sort((a, b) => (a.position ?? 999) - (b.position ?? 999))

  return (
    <>
      <BackBar label={competition.name} onBack={onBack} />
      {isLoading ? <LoadingState /> : sorted.length === 0 ? (
        <EmptyState text="Geen klassement beschikbaar" />
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 3, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
                {[
                  { label: '#',       align: 'left',   width: 36 },
                  { label: 'Ploeg',   align: 'left' },
                  { label: 'G',       align: 'center' },
                  { label: 'W',       align: 'center' },
                  { label: 'G',       align: 'center' },
                  { label: 'V',       align: 'center' },
                  { label: 'DV',      align: 'center' },
                  { label: 'DT',      align: 'center' },
                  { label: '+/-',     align: 'center' },
                  { label: 'Ptn',     align: 'center' },
                ].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 10px',
                    textAlign: h.align,
                    width: h.width,
                    fontSize: 10, letterSpacing: '.12em',
                    textTransform: 'uppercase', fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => {
                const isPromotion  = i < 2
                const isRelegation = i >= sorted.length - 2
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
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: 2,
                        background: isPromotion ? 'var(--green)' : isRelegation ? 'var(--red)' : 'transparent',
                        color: (isPromotion || isRelegation) ? '#fff' : '#888',
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {s.position || i + 1}
                      </span>
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isUs ? <Crest size={22} /> : <OppCrest name={s.team_name} size={22} />}
                        <span style={{ fontWeight: isUs ? 700 : 500, fontSize: 14 }}>{s.team_name}</span>
                      </div>
                    </td>
                    <td style={tdCenter}>{s.played ?? '—'}</td>
                    <td style={tdCenter}>{s.won ?? '—'}</td>
                    <td style={tdCenter}>{s.drawn ?? '—'}</td>
                    <td style={tdCenter}>{s.lost ?? '—'}</td>
                    <td style={tdCenter}>{s.goals_for ?? '—'}</td>
                    <td style={tdCenter}>{s.goals_against ?? '—'}</td>
                    <td style={{
                      ...tdCenter,
                      fontFamily: 'ui-monospace, monospace',
                      color: s.goal_diff > 0 ? 'var(--green)' : s.goal_diff < 0 ? 'var(--red)' : '#666',
                    }}>
                      {s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff ?? '—'}
                    </td>
                    <td style={{ ...tdCenter, fontWeight: 700, fontSize: 14 }}>{s.points ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

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
    </>
  )
}

// ── Shared sub-components ──────────────────────────────
function BackBar({ label, onBack }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 16, paddingBottom: 14,
      borderBottom: '1px solid var(--line)',
    }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1px solid var(--line)',
          padding: '6px 12px', cursor: 'pointer',
          fontSize: 12, color: '#666', fontWeight: 600,
          letterSpacing: '.05em', textTransform: 'uppercase',
        }}
      >
        ‹ Terug
      </button>
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
    </div>
  )
}

function LoadingState() {
  return <div style={{ color: '#888', textAlign: 'center', padding: 60, fontSize: 14 }}>Laden...</div>
}

function EmptyState({ text }) {
  return (
    <div style={{
      color: '#888', textAlign: 'center', padding: 60,
      background: '#fff', border: '1px solid var(--line)', borderRadius: 3, fontSize: 14,
    }}>
      {text}
    </div>
  )
}

const tdCenter = { padding: '11px 10px', textAlign: 'center', color: '#666' }

// ── Page ───────────────────────────────────────────────
export default function Klassement() {
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedComp, setSelectedComp] = useState(null)

  let view = 'teams'
  if (selectedTeam && selectedComp) view = 'standings'
  else if (selectedTeam) view = 'competitions'

  return (
    <Layout title="Klassement">
      {view === 'teams' && (
        <TeamList onSelect={team => { setSelectedTeam(team); setSelectedComp(null) }} />
      )}
      {view === 'competitions' && (
        <CompetitionList
          team={selectedTeam}
          onSelect={setSelectedComp}
          onBack={() => setSelectedTeam(null)}
        />
      )}
      {view === 'standings' && (
        <StandingsTable
          competition={selectedComp}
          team={selectedTeam}
          onBack={() => setSelectedComp(null)}
        />
      )}
    </Layout>
  )
}
