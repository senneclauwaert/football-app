import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import Pitch from '../components/Pitch'
import Crest from '../components/Crest'
import OppCrest from '../components/OppCrest'
import Icon from '../components/Icon'
import { getMatch } from '../api/matches'

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

function CardIcon({ type }) {
  if (type === 'goal' || type === 'penalty') {
    return <span style={{ fontSize: 16 }}>⚽</span>
  }
  if (type === 'own_goal') {
    return <span style={{ fontSize: 16, opacity: 0.7 }}>⚽</span>
  }
  if (type === 'yellow_card') {
    return <div style={{ width: 12, height: 16, background: '#f5c518', borderRadius: 1, flexShrink: 0 }} />
  }
  if (type === 'red_card' || type === 'second_yellow') {
    return <div style={{ width: 12, height: 16, background: '#d62828', borderRadius: 1, flexShrink: 0 }} />
  }
  if (type === 'sub_in') return <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 16 }}>↑</span>
  if (type === 'sub_out') return <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 16 }}>↓</span>
  return <span>•</span>
}

function fmtDateLong(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('nl-BE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })
}

export default function WedstrijdDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overzicht')

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatch(id),
  })

  if (isLoading) {
    return (
      <Layout title="Wedstrijd">
        <div style={{ color: '#888', textAlign: 'center', padding: 60, fontSize: 14 }}>Laden...</div>
      </Layout>
    )
  }
  if (error || !match) {
    return (
      <Layout title="Wedstrijd">
        <div style={{ color: '#888', textAlign: 'center', padding: 60, fontSize: 14 }}>Wedstrijd niet gevonden</div>
      </Layout>
    )
  }

  const isLive = match.status === 'live'
  const isFt = match.status === 'finished'
  const hasScore = isFt || isLive
  const isUpcoming = !isFt && !isLive

  const goals = match.events?.filter(e => ['goal', 'penalty', 'own_goal'].includes(e.type)) || []
  const ourGoals = goals.filter(e => e.is_our_team)
  const theirGoals = goals.filter(e => !e.is_our_team)
  const cards = match.events?.filter(e => ['yellow_card', 'red_card', 'second_yellow'].includes(e.type)) || []

  return (
    <Layout title="Wedstrijd">
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#888', marginBottom: 20, fontSize: 13,
          transition: 'color .12s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
        onMouseLeave={e => e.currentTarget.style.color = '#888'}
      >
        <Icon name="chevronLeft" size={14} /> Alle wedstrijden
      </button>

      {/* ── Match header ── */}
      <div
        className="card-in"
        style={{
          background: '#0a0a0a',
          color: '#fff',
          borderRadius: 3,
          marginBottom: 24,
          overflow: 'hidden',
        }}
      >
        {/* Competition bar */}
        {match.competition_name && (
          <div style={{
            background: '#1a1a1a',
            padding: '7px 20px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            color: '#888',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>{match.competition_name}</span>
            {match.venue && <span>{match.venue}</span>}
          </div>
        )}

        <div style={{
          padding: '24px 24px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 16,
        }}>
          {/* Home team */}
          <div style={{ textAlign: 'center' }}>
            {match.is_home ? <Crest size={56} /> : <OppCrest name={match.opponent_name} size={56} />}
            <div className="display" style={{ fontSize: 15, marginTop: 8, color: 'var(--orange)' }}>
              {match.is_home ? 'Toekomst Relegem' : match.opponent_name}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
              {match.is_home ? 'Thuis' : 'Uit'}
            </div>
          </div>

          {/* Score / time block */}
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            {isLive && (
              <div className="pill pill-live live-pulse" style={{ marginBottom: 8 }}>
                ● LIVE {match.live_minute ? `${match.live_minute}'` : ''}
              </div>
            )}
            {isFt && (
              <div className="mono" style={{ fontSize: 10, color: '#888', letterSpacing: '.15em', marginBottom: 4 }}>
                EINDSTAND
              </div>
            )}
            {isUpcoming && (
              <div className="mono" style={{ fontSize: 10, color: '#888', letterSpacing: '.15em', marginBottom: 4 }}>
                {match.match_date ? new Date(match.match_date).toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase() : ''}
              </div>
            )}

            {hasScore ? (
              <div className="display score-pop" style={{ fontSize: 54 }}>
                {match.home_score ?? 0}
                <span style={{ color: '#444' }}>–</span>
                {match.away_score ?? 0}
              </div>
            ) : (
              <div className="display" style={{ fontSize: 40, color: 'var(--orange)' }}>
                {fmtTime(match.match_date)}
              </div>
            )}
          </div>

          {/* Away team */}
          <div style={{ textAlign: 'center' }}>
            {match.is_home ? <OppCrest name={match.opponent_name} size={56} /> : <Crest size={56} />}
            <div className="display" style={{ fontSize: 15, marginTop: 8 }}>
              {match.is_home ? match.opponent_name : 'Toekomst Relegem'}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
              {match.is_home ? 'Uit' : 'Thuis'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'overzicht' ? 'active' : ''}`} onClick={() => setTab('overzicht')}>
          Overzicht
        </button>
        <button className={`tab-btn ${tab === 'opstelling' ? 'active' : ''}`} onClick={() => setTab('opstelling')}>
          Opstelling
        </button>
        <button className={`tab-btn ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
          Events
        </button>
      </div>

      {/* ── Overzicht ── */}
      {tab === 'overzicht' && (
        <div className="page-in">
          {isUpcoming && (
            <div style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 3,
              padding: '28px 24px',
              textAlign: 'center',
            }}>
              <div className="display" style={{ fontSize: 22 }}>{fmtDateLong(match.match_date)}</div>
              <div className="mono" style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
                Aftrap {fmtTime(match.match_date)}
              </div>
              <button
                className="btn btn-orange"
                style={{ marginTop: 16 }}
              >
                <Icon name="calendar" size={15} /> Toevoegen aan agenda
              </button>
            </div>
          )}

          {(ourGoals.length > 0 || theirGoals.length > 0) && (
            <div style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 3,
              overflow: 'hidden',
              marginTop: 16,
            }}>
              <div style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--line)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                color: '#888',
              }}>
                Doelpunten
              </div>
              <div style={{ padding: '12px 18px' }}>
                {goals.map((e, i) => (
                  <div
                    key={e.id || i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 0',
                      borderBottom: i < goals.length - 1 ? '1px solid var(--line)' : 'none',
                    }}
                  >
                    <div style={{ textAlign: 'right', fontSize: 14 }}>
                      {e.is_our_team && (
                        <span style={{ fontWeight: 600 }}>
                          {e.player_name || 'Onbekend'}
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      minWidth: 70, justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 16 }}>⚽</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>
                        {e.minute}'
                      </span>
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {!e.is_our_team && (
                        <span style={{ fontWeight: 600 }}>
                          {e.player_name || 'Onbekend'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cards.length > 0 && (
            <div style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 3,
              overflow: 'hidden',
              marginTop: 16,
            }}>
              <div style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--line)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                color: '#888',
              }}>
                Kaarten
              </div>
              <div style={{ padding: '12px 18px' }}>
                {cards.map((e, i) => (
                  <div
                    key={e.id || i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 0',
                      borderBottom: i < cards.length - 1 ? '1px solid var(--line)' : 'none',
                    }}
                  >
                    <div style={{ textAlign: 'right', fontSize: 14 }}>
                      {e.is_our_team && (
                        <span style={{ fontWeight: 600 }}>{e.player_name || 'Onbekend'}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <CardIcon type={e.type} />
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{e.minute}'</span>
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {!e.is_our_team && (
                        <span style={{ fontWeight: 600 }}>{e.player_name || 'Onbekend'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Man of the match */}
          {match.motm_player && (
            <div style={{
              background: 'linear-gradient(135deg, var(--orange), var(--orange-hot))',
              padding: '18px 20px',
              borderRadius: 3,
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginTop: 16,
            }}>
              <Icon name="star" size={28} />
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                  Man van de Wedstrijd
                </div>
                <div className="display" style={{ fontSize: 22, marginTop: 2 }}>
                  {match.motm_player.first_name} {match.motm_player.last_name}
                </div>
              </div>
            </div>
          )}

          {goals.length === 0 && cards.length === 0 && !match.motm_player && !isUpcoming && (
            <div style={{ color: '#888', textAlign: 'center', padding: 40, fontSize: 14 }}>
              Geen overzichtsdata beschikbaar
            </div>
          )}
        </div>
      )}

      {/* ── Opstelling ── */}
      {tab === 'opstelling' && (
        <div className="page-in">
          {match.lineups?.length > 0 ? (
            <>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 16,
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: '#888', letterSpacing: '.15em', textTransform: 'uppercase' }}>
                    Formatie
                  </div>
                  <div className="display" style={{ fontSize: 22 }}>{match.formation || '4-3-3'}</div>
                </div>
                {isUpcoming && (
                  <span className="pill pill-ghost">Voorlopige selectie</span>
                )}
              </div>
              <Pitch lineups={match.lineups} events={match.events || []} />
              {/* Bench */}
              {match.lineups.filter(l => !l.is_starting && l.is_our_team).length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div className="mono" style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase',
                    color: '#888', marginBottom: 10,
                  }}>
                    Bank Toekomst Relegem
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {match.lineups.filter(l => !l.is_starting && l.is_our_team).map((l, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'var(--paper-2)',
                          padding: '6px 12px',
                          borderRadius: 2,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {l.jersey_number ? `#${l.jersey_number} ` : ''}{l.player_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#888', textAlign: 'center', padding: 40, fontSize: 14 }}>
              Geen opstelling beschikbaar
            </div>
          )}
        </div>
      )}

      {/* ── Events ── */}
      {tab === 'events' && (
        <div className="page-in">
          {match.events?.length > 0 ? (
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: 2, background: 'var(--line)',
              }} />

              {[...match.events]
                .sort((a, b) => (a.minute || 0) - (b.minute || 0))
                .map((ev, i) => (
                  <div
                    key={ev.id || i}
                    className="card-in"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      marginBottom: 18,
                      position: 'relative',
                      animationDelay: `${i * 50}ms`,
                    }}
                  >
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute', left: -35,
                      width: 14, height: 14, borderRadius: '50%',
                      background: ev.is_our_team ? 'var(--orange)' : '#888',
                      border: '2px solid var(--paper)',
                      top: 4,
                    }} />

                    <span className="mono" style={{
                      fontSize: 12, color: '#888', minWidth: 32, fontWeight: 700, paddingTop: 2,
                    }}>
                      {ev.minute ? `${ev.minute}'` : '–'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CardIcon type={ev.type} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {EVENT_LABELS[ev.type] || ev.type}
                        </div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>
                          {ev.player_name || 'Onbekend'} · {ev.is_our_team ? 'Toekomst Relegem' : match.opponent_name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div style={{ color: '#888', textAlign: 'center', padding: 40, fontSize: 14 }}>
              Geen events beschikbaar
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
