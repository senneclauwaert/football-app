import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import MatchCard from '../components/MatchCard'
import { getMatches } from '../api/matches'
import { getTeams } from '../api/teams'

export default function Wedstrijden() {
  const [teamFilter, setTeamFilter] = useState(null)
  const [tab, setTab] = useState('upcoming') // upcoming | results

  const { data: matches = [], isLoading } = useQuery({ queryKey: ['matches'], queryFn: () => getMatches() })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: getTeams })

  const filtered = matches.filter(m => !teamFilter || m.team_id === teamFilter)
  const upcoming = filtered.filter(m => m.status === 'scheduled' || m.status === 'live')
    .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
  const results = filtered.filter(m => m.status === 'finished')
    .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))

  return (
    <Layout title="Wedstrijden">
      {/* Team filter pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => setTeamFilter(null)}
          style={{
            padding: '6px 14px', borderRadius: 20,
            background: !teamFilter ? 'var(--orange)' : 'var(--paper-2)',
            color: !teamFilter ? '#fff' : '#666',
            fontWeight: 500, fontSize: 13,
          }}
        >
          Alle
        </button>
        {teams.map(t => (
          <button
            key={t.id}
            onClick={() => setTeamFilter(teamFilter === t.id ? null : t.id)}
            style={{
              padding: '6px 14px', borderRadius: 20,
              background: teamFilter === t.id ? 'var(--orange)' : 'var(--paper-2)',
              color: teamFilter === t.id ? '#fff' : '#666',
              fontWeight: 500, fontSize: 13,
            }}
          >
            {t.short_name || t.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--line)' }}>
        {[
          { key: 'upcoming', label: 'Wedstrijden' },
          { key: 'results', label: 'Resultaten' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '10px 20px', fontWeight: 600, fontSize: 14,
              borderBottom: tab === key ? '2px solid var(--orange)' : '2px solid transparent',
              color: tab === key ? 'var(--orange)' : '#666',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Match list */}
      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Laden...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(tab === 'upcoming' ? upcoming : results).map(m => (
            <MatchCard key={m.id} match={m} />
          ))}
          {(tab === 'upcoming' ? upcoming : results).length === 0 && (
            <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>
              Geen wedstrijden gevonden
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
