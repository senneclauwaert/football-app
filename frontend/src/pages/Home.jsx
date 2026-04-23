import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import MatchCard from '../components/MatchCard'
import Icon from '../components/Icon'
import Crest from '../components/Crest'
import { getMatches } from '../api/matches'
import { getNews } from '../api/news'
import { getProducts } from '../api/shop'
import { getEvents } from '../api/events'

export default function Home() {
  const navigate = useNavigate()
  const { data: matches = [] } = useQuery({ queryKey: ['matches'], queryFn: () => getMatches() })
  const { data: news = [] } = useQuery({ queryKey: ['news'], queryFn: getNews })
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: getEvents })

  const liveMatch = matches.find(m => m.status === 'live')
  const nextMatch = matches.filter(m => m.status === 'scheduled').sort((a, b) => new Date(a.match_date) - new Date(b.match_date))[0]
  const recentResults = matches.filter(m => m.status === 'finished').sort((a, b) => new Date(b.match_date) - new Date(a.match_date)).slice(0, 3)
  const pinnedNews = news.filter(n => n.is_pinned).slice(0, 2)
  const featuredProducts = products.slice(0, 4)
  const upcomingEvents = events.slice(0, 2)

  return (
    <Layout title="Home">
      {/* Hero */}
      <div style={{
        position: 'relative', background: '#111',
        borderRadius: 12, padding: '40px 32px',
        marginBottom: 28, overflow: 'hidden', color: '#fff',
      }}>
        <div style={{
          position: 'absolute', right: -60, top: -40,
          width: 300, height: 300,
          background: 'var(--orange)',
          transform: 'rotate(-25deg)', opacity: 0.15,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Crest size={56} />
            <div>
              <h1 className="display" style={{ fontSize: 40, color: '#fff', margin: 0 }}>Toekomst</h1>
              <h1 className="display" style={{ fontSize: 40, color: 'var(--orange)', margin: 0 }}>Relegem</h1>
            </div>
          </div>
          <p style={{ color: '#aaa', fontSize: 16, margin: '0 0 20px' }}>
            Jouw thuisbasis voor alles over onze club
          </p>
          <button
            onClick={() => navigate('/wedstrijden')}
            style={{
              background: 'var(--orange)', color: '#fff',
              padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            Bekijk wedstrijden <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Left column */}
        <div>
          {liveMatch && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#ff4d00', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                <span className="animate-pulse-dot" style={{ width: 8, height: 8, background: '#ff4d00', borderRadius: '50%', display: 'inline-block' }} />
                Live
              </h2>
              <MatchCard match={liveMatch} />
            </div>
          )}
          {nextMatch && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Volgende wedstrijd</h2>
              <MatchCard match={nextMatch} />
            </div>
          )}
          {recentResults.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#666', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Recente resultaten</h2>
                <button onClick={() => navigate('/wedstrijden')} style={{ fontSize: 12, color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Alle <Icon name="chevronRight" size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentResults.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div>
          {pinnedNews.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#666', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Nieuws</h2>
                <button onClick={() => navigate('/nieuws')} style={{ fontSize: 12, color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Meer <Icon name="chevronRight" size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pinnedNews.map(item => (
                  <div key={item.id} onClick={() => navigate(`/nieuws/${item.id}`)}
                    style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {item.is_pinned && <span style={{ background: 'var(--orange)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>VAST</span>}
                      {item.category && <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.category}</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                    {item.tldr && <div style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{item.tldr.slice(0, 100)}...</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {featuredProducts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#666', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Shop</h2>
                <button onClick={() => navigate('/shop')} style={{ fontSize: 12, color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Alle producten <Icon name="chevronRight" size={14} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {featuredProducts.map(p => (
                  <div key={p.id} onClick={() => navigate('/shop')}
                    style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--line)', cursor: 'pointer', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--paper-2)', height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="shop" size={28} color="#ccc" />
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontWeight: 700, color: 'var(--orange)', fontSize: 14 }}>€{Number(p.price).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingEvents.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#666', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Evenementen</h2>
                <button onClick={() => navigate('/evenementen')} style={{ fontSize: 12, color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Alle <Icon name="chevronRight" size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingEvents.map(ev => {
                  const d = new Date(ev.date)
                  return (
                    <div key={ev.id} onClick={() => navigate('/evenementen')}
                      style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--line)', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center', minWidth: 44 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: 'var(--orange)' }}>{d.getDate()}</div>
                        <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>{d.toLocaleDateString('nl-BE', { month: 'short' })}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{ev.title}</div>
                        {ev.location && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{ev.location}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
