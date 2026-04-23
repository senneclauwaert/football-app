import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { getNews } from '../api/news'

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
      {/* Category pills */}
      {cats.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            onClick={() => setCatFilter(null)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, background: !catFilter ? 'var(--orange)' : 'var(--paper-2)', color: !catFilter ? '#fff' : '#666' }}
          >
            Alle
          </button>
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(catFilter === c ? null : c)}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, background: catFilter === c ? 'var(--orange)' : 'var(--paper-2)', color: catFilter === c ? '#fff' : '#666' }}
            >
              {CAT_LABELS[c] || c}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Geen nieuws beschikbaar</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/nieuws/${item.id}`)}
              style={{
                background: '#fff', borderRadius: 12, padding: '18px 20px',
                border: '1px solid var(--line)', cursor: 'pointer',
                display: 'flex', gap: 16, alignItems: 'flex-start',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
            >
              {/* Date */}
              <div style={{ textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--orange)', lineHeight: 1 }}>
                  {item.created_at ? new Date(item.created_at).getDate() : '-'}
                </div>
                <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('nl-BE', { month: 'short' }) : ''}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {item.is_pinned && (
                    <span style={{ background: 'var(--orange)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>VAST</span>
                  )}
                  {item.category && (
                    <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {CAT_LABELS[item.category] || item.category}
                    </span>
                  )}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>{item.title}</h3>
                {item.tldr && (
                  <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>
                    {item.tldr.slice(0, 150)}{item.tldr.length > 150 ? '...' : ''}
                  </p>
                )}
              </div>

              <Icon name="chevronRight" size={18} color="#ccc" />
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
