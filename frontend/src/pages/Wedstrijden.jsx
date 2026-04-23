import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import MatchCard from '../components/MatchCard'
import { getMatches } from '../api/matches'
import { getTeams } from '../api/teams'

export default function Wedstrijden() {
  const [teamFilter, setTeamFilter] = useState(null)
  const [tab, setTab] = useState('upcoming')

  const { data: matches = [], isLoading } = useQuery({ queryKey: ['matches'], queryFn: () => getMatches() })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: getTeams })

  const filtered = matches.filter(m => !teamFilter || m.team_id === teamFilter)
  const upcoming = filtered
    .filter(m => m.status === 'scheduled' || m.status === 'live')
    .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
  const results = filtered
    .filter(m => m.status === 'finished')
    .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))

  const displayed = tab === 'upcoming' ? upcoming : results

  return (
    <Layout title="Wedstrijden">
      {/* Team filter pills */}
      <div style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 20,
      }}>
        <button
          onClick={() => setTeamFilter(null)}
          className={`pill ${!teamFilter ? 'pill-orange' : 'pill-ghost'}`}
          
          style={{ cursor: 'pointer', padding: '8px 14px' }}
        >
          Alle
        </button>
        {teams.slice(0, 6).map(t => (
          <button
            key={t.id}
            onClick={() => setTeamFilter(teamFilter === t.id ? null : t.id)}
            className={`pill ${teamFilter === t.id ? 'pill-orange' : 'pill-ghost'}`}
            style={{ cursor: 'pointer', padding: '8px 14px' }}
          >
            {t.short_name || t.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Komende wedstrijden
        </button>
        <button
          className={`tab-btn ${tab === 'results' ? 'active' : ''}`}
          onClick={() => setTab('results')}
        >
          Resultaten
        </button>
      </div>

      {/* Match list */}
      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40, fontSize: 14 }}>Laden...</div>
      ) : displayed.length === 0 ? (
        <div style={{
          color: '#888', textAlign: 'center', padding: '40px 20px',
          background: '#fff', border: '1px solid var(--line)', borderRadius: 3,
          fontSize: 14,
        }}>
          {tab === 'upcoming' ? 'Geen komende wedstrijden' : 'Geen resultaten beschikbaar'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map((m, i) => (
            <div key={m.id} className="card-in" style={{ animationDelay: `${Math.min(i * 40, 280)}ms` }}>
              <MatchCard match={m} />
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
