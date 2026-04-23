import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { getNews } from '../api/news'

const CAT_COLORS = {
  match: 'var(--orange)',
  youth: 'var(--green)',
  club: 'var(--ink)',
  event: 'var(--yellow)',
}

const CAT_LABELS = {
  match: 'Wedstrijd',
  youth: 'Jeugd',
  club: 'Club',
  event: 'Evenement',
}

export default function Nieuws() {
  const navigate = useNavigate()
  const [catFilter, setCatFilter] = useState(null)
  const { data: news = [], isLoading } = useQuery({ queryKey: ['news'], queryFn: getNews })

  const cats = [...new Set(news.map(n => n.category).filter(Boolean))]
  const filtered = catFilter ? news.filter(n => n.category === catFilter) : news

  return (
    <Layout title="Nieuws">
      {/* Category filter */}
      {cats.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            onClick={() => setCatFilter(null)}
            className={`pill ${!catFilter ? 'pill-orange' : 'pill-ghost'}`}
            style={{ cursor: 'pointer', padding: '8px 14px' }}
          >
            Alle
          </button>
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(catFilter === c ? null : c)}
              className={`pill ${catFilter === c ? 'pill-orange' : 'pill-ghost'}`}
              style={{ cursor: 'pointer', padding: '8px 14px' }}
            >
              {CAT_LABELS[c] || c}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 60, fontSize: 14 }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          color: '#888', textAlign: 'center', padding: 60,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 3, fontSize: 14,
        }}>
          Geen nieuws beschikbaar
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map((item, i) => {
            const catColor = CAT_COLORS[item.category] || '#888'
            const d = item.created_at ? new Date(item.created_at) : null
            return (
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
                  position: 'relative',
                  transition: 'transform .08s, box-shadow .12s',
                  willChange: 'transform',
                  animationDelay: `${Math.min(i * 50, 300)}ms`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.07)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                {/* Photo placeholder */}
                <div style={{
                  background: 'var(--paper-2)',
                  backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,.04) 0 8px, transparent 8px 16px)',
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name="news" size={28} color="#bbb" />
                </div>

                {/* Pinned badge */}
                {item.is_pinned && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'var(--orange)', color: '#000',
                    padding: '3px 8px', borderRadius: 2,
                    fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Icon name="pin" size={10} />
                    VASTGEZET
                  </div>
                )}

                <div style={{ padding: '14px 16px', flex: 1 }}>
                  {/* Category + date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {item.category && (
                      <span style={{
                        background: catColor,
                        color: item.category === 'youth' || item.category === 'match' ? '#000' : '#fff',
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 7px', borderRadius: 2,
                        letterSpacing: '.08em', textTransform: 'uppercase',
                      }}>
                        {CAT_LABELS[item.category] || item.category}
                      </span>
                    )}
                    {d && (
                      <span className="mono" style={{ fontSize: 10, color: '#888' }}>
                        {d.getDate()} {['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'][d.getMonth()]}
                      </span>
                    )}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, marginBottom: 6 }}>
                    {item.title}
                  </div>

                  {item.tldr && (
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.45 }}>
                      {item.tldr.slice(0, 100)}{item.tldr.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
