import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import MatchCard from '../components/MatchCard'
import Icon from '../components/Icon'
import Crest from '../components/Crest'
import OppCrest from '../components/OppCrest'
import { getMatches } from '../api/matches'
import { getNews } from '../api/news'
import { getProducts } from '../api/shop'
import { getEvents } from '../api/events'

function fmtEur(n) {
  return `€${Number(n).toFixed(2).replace('.', ',')}`
}

export default function Home() {
  const navigate = useNavigate()
  const { data: matches = [] } = useQuery({ queryKey: ['matches'], queryFn: () => getMatches() })
  const { data: news = [] } = useQuery({ queryKey: ['news'], queryFn: getNews })
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: getEvents })

  const liveMatch = matches.find(m => m.status === 'live')
  const nextMatch = matches
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))[0]
  const recentResults = matches
    .filter(m => m.status === 'finished')
    .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
    .slice(0, 3)
  const pinnedNews = news.filter(n => n.is_pinned).slice(0, 2)
  const featuredProducts = products.slice(0, 4)
  const upcomingEvents = events.slice(0, 2)

  const featuredMatch = liveMatch || nextMatch

  return (
    <Layout title="Home">
      {/* ── Hero ── */}
      <div style={{
        background: '#0a0a0a',
        color: '#fff',
        margin: '-28px -28px 28px',
        padding: '40px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* diagonal stripe accent */}
        <div style={{
          position: 'absolute',
          padding: 4 ,
          top: 0, right: 0, bottom: 0,
          width: '40%',
          background: 'repeating-linear-gradient(135deg, #ff6a13 0 30px, #0a0a0a 30px 60px)',
          opacity: 0.12,
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 24,
          alignItems: 'center',
        }}>
          <div>
            <div className="mono" style={{
              fontSize: 11, color: 'var(--orange)',
              letterSpacing: '.2em', marginBottom: 12,
            }}>
              TOEKOMST RELEGEM · 1952
            </div>
            <div className="display" style={{ fontSize: 52, lineHeight: .9, marginBottom: 14 }}>
              Welkom bij<br />
              <span style={{ color: 'var(--orange)' }}>Toekomst Relegem</span>
            </div>
            <p style={{ color: '#ccc', fontSize: 14, margin: '0 0 20px', maxWidth: 480, lineHeight: 1.5 }}>
              Alles over je favoriete club. Wedstrijden, ploegen, fanshop en evenementen — op één plek.
            </p>
            <button
              onClick={() => navigate('/wedstrijden')}
              className="btn btn-orange"
              style={{ fontSize: 13 }}
            >
              Bekijk wedstrijden <Icon name="arrowRight" size={14} />
            </button>
          </div>
          <div className="crest-float" style={{ display: 'flex' }}>
            <Crest size={120} />
          </div>
        </div>
      </div>

      {/* ── Featured match ── */}
      {featuredMatch && (
        <div
          onClick={() => navigate(`/wedstrijden/${featuredMatch.id}`)}
          className="card-in"
          style={{
            background: '#fff',
            border: '2px solid var(--ink)',
            borderRadius: 3,
            cursor: 'pointer',
            marginBottom: 28,
            overflow: 'hidden',
            transition: 'transform .1s, box-shadow .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
        >
          <div style={{
            background: 'var(--ink)',
            color: '#fff',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--orange)' }}>
              {liveMatch ? '● LIVE NU' : 'EERSTVOLGENDE MATCH'}
            </span>
            {featuredMatch.competition_name && (
              <span className="mono" style={{ fontSize: 10, letterSpacing: '.15em', color: '#888' }}>
                {featuredMatch.competition_name}
              </span>
            )}
          </div>

          {/* Match header */}
          <div style={{
            background: '#0a0a0a',
            color: '#fff',
            padding: '20px 24px',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 16,
          }}>
            {/* Home */}
            <div style={{ textAlign: 'center' }}>
              {featuredMatch.is_home ? <Crest size={48} /> : <OppCrest name={featuredMatch.opponent_name} size={48} />}
              <div className="display" style={{ fontSize: 14, marginTop: 6, color: '#fff' }}>
                {featuredMatch.is_home ? 'Toekomst Relegem' : featuredMatch.opponent_name}
              </div>
            </div>
            {/* Score / time */}
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              {liveMatch ? (
                <>
                  <div className="pill pill-live live-pulse" style={{ marginBottom: 6 }}>
                    ● LIVE {liveMatch.live_minute ? `${liveMatch.live_minute}'` : ''}
                  </div>
                  <div className="display score-pop" style={{ fontSize: 44 }}>
                    {liveMatch.home_score ?? 0}
                    <span style={{ color: '#555' }}>–</span>
                    {liveMatch.away_score ?? 0}
                  </div>
                </>
              ) : (
                <>
                  <div className="mono" style={{ fontSize: 10, color: '#888', letterSpacing: '.15em' }}>
                    {featuredMatch.match_date ? new Date(featuredMatch.match_date).toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase() : ''}
                  </div>
                  <div className="display" style={{ fontSize: 36, marginTop: 4, color: 'var(--orange)' }}>
                    {featuredMatch.match_date ? new Date(featuredMatch.match_date).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </>
              )}
            </div>
            {/* Away */}
            <div style={{ textAlign: 'center' }}>
              {featuredMatch.is_home ? <OppCrest name={featuredMatch.opponent_name} size={48} /> : <Crest size={48} />}
              <div className="display" style={{ fontSize: 14, marginTop: 6, color: '#fff' }}>
                {featuredMatch.is_home ? featuredMatch.opponent_name : 'Toekomst Relegem'}
              </div>
            </div>
          </div>

          <div style={{
            padding: '10px 16px',
            textAlign: 'center',
            background: 'var(--paper-2)',
          }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--orange-hot)', fontWeight: 700, letterSpacing: '.05em' }}>
              BEKIJK DETAILS →
            </span>
          </div>
        </div>
      )}

      {/* ── Two-column grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 28,
      }}>
        {/* Left */}
        <div>
          {/* Recente resultaten */}
          {recentResults.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between', marginBottom: 14,
              }}>
                <h2 className="display" style={{ fontSize: 26, margin: 0 }}>Laatste resultaten</h2>
                <button
                  onClick={() => navigate('/wedstrijden')}
                  style={{ color: 'var(--orange-hot)', fontSize: 13, fontWeight: 600, letterSpacing: '.02em' }}
                >
                  Alle matchen →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentResults.map((m, i) => (
                  <div key={m.id} style={{ animationDelay: `${i * 60}ms` }} className="card-in">
                    <MatchCard match={m} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nieuws */}
          {pinnedNews.length > 0 && (
            <section>
              <div style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between', marginBottom: 14,
              }}>
                <h2 className="display" style={{ fontSize: 26, margin: 0 }}>Nieuws</h2>
                <button
                  onClick={() => navigate('/nieuws')}
                  style={{ color: 'var(--orange-hot)', fontSize: 13, fontWeight: 600 }}
                >
                  Alles →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {pinnedNews.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/nieuws/${item.id}`)}
                    className="card-in"
                    style={{
                      background: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform .1s, box-shadow .15s',
                      animationDelay: `${i * 80}ms`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.07)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                  >
                    {/* Stripe photo placeholder */}
                    <div style={{
                      height: 80,
                      background: 'var(--paper-2)',
                      backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,.04) 0 8px, transparent 8px 16px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="news" size={24} color="#ccc" />
                    </div>
                    {item.is_pinned && (
                      <div style={{
                        background: 'var(--orange)', color: '#000',
                        padding: '3px 8px', fontSize: 10, fontWeight: 700,
                        letterSpacing: '.1em',
                      }}>
                        ● VASTGEZET
                      </div>
                    )}
                    <div style={{ padding: '12px 14px' }}>
                      {item.category && (
                        <span className="mono" style={{ fontSize: 10, color: '#888', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                          {item.category}
                        </span>
                      )}
                      <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, lineHeight: 1.3 }}>{item.title}</div>
                      {item.tldr && (
                        <div style={{ fontSize: 12, color: '#666', marginTop: 6, lineHeight: 1.4 }}>
                          {item.tldr.slice(0, 90)}{item.tldr.length > 90 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right */}
        <div>
          {/* Fanshop */}
          {featuredProducts.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between', marginBottom: 14,
              }}>
                <h2 className="display" style={{ fontSize: 26, margin: 0 }}>Fanshop</h2>
                <button
                  onClick={() => navigate('/shop')}
                  style={{ color: 'var(--orange-hot)', fontSize: 13, fontWeight: 600 }}
                >
                  Alles →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {featuredProducts.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => navigate('/shop')}
                    className="card-in"
                    style={{
                      background: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform .08s',
                      animationDelay: `${i * 60}ms`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    <div style={{
                      background: 'var(--paper-2)',
                      backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,.04) 0 8px, transparent 8px 16px)',
                      aspectRatio: '1/1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="shop" size={28} color="#ccc" />
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, color: '#888' }}>{p.category}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2, lineHeight: 1.2 }}>{p.name}</div>
                      <div className="display" style={{ fontSize: 18, marginTop: 6, color: 'var(--orange-hot)' }}>
                        {fmtEur(p.price)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Evenementen */}
          {upcomingEvents.length > 0 && (
            <section>
              <div style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between', marginBottom: 14,
              }}>
                <h2 className="display" style={{ fontSize: 26, margin: 0 }}>Evenementen</h2>
                <button
                  onClick={() => navigate('/evenementen')}
                  style={{ color: 'var(--orange-hot)', fontSize: 13, fontWeight: 600 }}
                >
                  Alles →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingEvents.map((ev, i) => {
                  const d = new Date(ev.date)
                  return (
                    <button
                      key={ev.id}
                      onClick={() => navigate('/evenementen')}
                      className="card-in"
                      style={{
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: 3,
                        overflow: 'hidden',
                        display: 'flex',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'transform .1s, box-shadow .15s',
                        animationDelay: `${i * 80}ms`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.07)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                    >
                      {/* Date block */}
                      <div style={{
                        background: 'var(--ink)',
                        color: '#fff',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 62,
                        borderRight: '4px solid var(--orange)',
                      }}>
                        <div className="display" style={{ fontSize: 26, color: 'var(--orange)' }}>{d.getDate()}</div>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 2 }}>
                          {['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'][d.getMonth()]}
                        </div>
                      </div>
                      {/* Content */}
                      <div style={{ padding: '12px 14px', flex: 1, minWidth: 0 }}>
                        <div className="mono" style={{ fontSize: 9, color: '#888', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                          {d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                          {ev.location && ` · ${ev.location}`}
                        </div>
                        <div className="display" style={{ fontSize: 16, marginTop: 4, lineHeight: 1.1 }}>{ev.title}</div>
                        {ev.price > 0
                          ? <span className="pill pill-orange" style={{ fontSize: 9, marginTop: 6 }}>{fmtEur(ev.price)}</span>
                          : <span className="pill pill-ink" style={{ fontSize: 9, marginTop: 6 }}>Gratis</span>
                        }
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .home-grid { grid-template-columns: 1fr !important; }
          .hero-section { margin: -16px -16px 20px !important; padding: 28px 16px !important; }
          .hero-section .display { font-size: 36px !important; }
          .hero-crest { display: none !important; }
        }
      `}</style>
    </Layout>
  )
}
