import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import Pitch from '../components/Pitch'
import Crest from '../components/Crest'
import OppCrest from '../components/OppCrest'
import Icon from '../components/Icon'
import { getMatch } from '../api/matches'

const EVENT_ICONS = {
  goal: '⚽',
  own_goal: '⚽ (eigen doel)',
  penalty: '⚽ (penalty)',
  yellow_card: '🟨',
  red_card: '🟥',
  second_yellow: '🟨🟥',
  sub_in: '↑',
  sub_out: '↓',
}

const EVENT_LABELS = {
  goal: 'Doelpunt',
  own_goal: 'Eigen doel',
  penalty: 'Penalty',
  yellow_card: 'Gele kaart',
  red_card: 'Rode kaart',
  second_yellow: 'Tweede gele kaart',
  sub_in: 'Wissel in',
  sub_out: 'Wissel uit',
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function WedstrijdDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overzicht')

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatch(id),
  })

  if (isLoading) return <Layout title="Wedstrijd"><div style={{ padding: 40, color: '#888', textAlign: 'center' }}>Laden...</div></Layout>
  if (error || !match) return <Layout title="Wedstrijd"><div style={{ padding: 40, color: '#888', textAlign: 'center' }}>Wedstrijd niet gevonden</div></Layout>

  const homeName = match.is_home ? 'Toekomst Relegem' : match.opponent_name
  const awayName = match.is_home ? match.opponent_name : 'Toekomst Relegem'
  const hasScore = match.status === 'finished' || match.status === 'live'
  const isLive = match.status === 'live'

  const goals = match.events?.filter(e => ['goal', 'penalty'].includes(e.type)) || []
  const ourGoals = goals.filter(e => e.is_our_team)
  const theirGoals = goals.filter(e => !e.is_our_team)

  return (
    <Layout title="Wedstrijd">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', marginBottom: 16, fontSize: 14 }}>
        <Icon name="chevronLeft" size={16} /> Terug
      </button>

      {/* Match header */}
      <div style={{
        background: '#111', borderRadius: 12, padding: '28px 24px',
        color: '#fff', marginBottom: 24, textAlign: 'center',
      }}>
        {isLive && (
          <div style={{ marginBottom: 10 }}>
            <span style={{ background: '#ff4d00', color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
              LIVE {match.live_minute ? `${match.live_minute}'` : ''}
            </span>
          </div>
        )}
        <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          {formatDate(match.match_date)}
          {match.venue && <span style={{ marginLeft: 8 }}>• {match.venue}</span>}
        </div>

        {/* Teams + score */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {/* Home */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            {match.is_home ? <Crest size={48} /> : <OppCrest name={match.opponent_name} size={48} />}
            <div style={{ fontWeight: 700, fontSize: 16 }}>{homeName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {match.is_home ? 'Thuis' : 'Uit'}
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: 'center', padding: '0 20px' }}>
            <div className="display" style={{ fontSize: 52, color: '#fff' }}>
              {hasScore ? `${match.home_score ?? 0} - ${match.away_score ?? 0}` : 'vs'}
            </div>
            {!hasScore && <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              {match.status === 'scheduled' ? 'Gepland' : match.status}
            </div>}
          </div>

          {/* Away */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            {match.is_home ? <OppCrest name={match.opponent_name} size={48} /> : <Crest size={48} />}
            <div style={{ fontWeight: 700, fontSize: 16 }}>{awayName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {match.is_home ? 'Uit' : 'Thuis'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
        {['overzicht', 'opstelling', 'events'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px', fontWeight: 600, fontSize: 14, textTransform: 'capitalize',
              borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
              color: tab === t ? 'var(--orange)' : '#666', marginBottom: -1,
            }}
          >
            {t === 'overzicht' ? 'Overzicht' : t === 'opstelling' ? 'Opstelling' : 'Events'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overzicht' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Our goals */}
          {ourGoals.length > 0 && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Doelpunten TR
              </h3>
              {ourGoals.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>⚽</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{e.player_name || 'Onbekend'}</div>
                    {e.minute && <div style={{ fontSize: 12, color: '#888' }}>{e.minute}'</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Their goals */}
          {theirGoals.length > 0 && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Doelpunten {match.opponent_name}
              </h3>
              {theirGoals.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>⚽</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{e.player_name || 'Onbekend'}</div>
                    {e.minute && <div style={{ fontSize: 12, color: '#888' }}>{e.minute}'</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Man of the match */}
          {match.motm_player && (
            <div style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Man van de Wedstrijd
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--orange-soft)', padding: '14px 16px', borderRadius: 10 }}>
                <Icon name="star" size={24} color="var(--orange)" />
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  {match.motm_player.first_name} {match.motm_player.last_name}
                </span>
              </div>
            </div>
          )}

          {goals.length === 0 && !match.motm_player && (
            <div style={{ gridColumn: '1 / -1', color: '#888', textAlign: 'center', padding: 30 }}>
              Geen overzichtsdata beschikbaar
            </div>
          )}
        </div>
      )}

      {tab === 'opstelling' && (
        <div>
          {match.lineups?.length > 0 ? (
            <>
              <Pitch lineups={match.lineups} events={match.events} />
              {/* Bench */}
              {match.lineups.filter(l => !l.is_starting && l.is_our_team).length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Bank</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {match.lineups.filter(l => !l.is_starting && l.is_our_team).map((l, i) => (
                      <span key={i} style={{ background: 'var(--paper-2)', padding: '6px 12px', borderRadius: 20, fontSize: 13 }}>
                        {l.jersey_number ? `#${l.jersey_number} ` : ''}{l.player_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Geen opstelling beschikbaar</div>
          )}
        </div>
      )}

      {tab === 'events' && (
        <div>
          {match.events?.length > 0 ? (
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--line)' }} />
              {match.events.sort((a, b) => (a.minute || 0) - (b.minute || 0)).map(ev => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: -30,
                    width: 14, height: 14, borderRadius: '50%',
                    background: ev.is_our_team ? 'var(--orange)' : '#888',
                    border: '2px solid var(--paper)',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#888', minWidth: 30 }}>{ev.minute ? `${ev.minute}'` : '-'}</span>
                    <span style={{ fontSize: 18 }}>{EVENT_ICONS[ev.type] || '•'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{EVENT_LABELS[ev.type] || ev.type}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>
                        {ev.player_name || 'Onbekend'} • {ev.is_our_team ? 'Toekomst Relegem' : match.opponent_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Geen events beschikbaar</div>
          )}
        </div>
      )}
    </Layout>
  )
}
