import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { getNewsItem } from '../api/news'

const CAT_LABELS = {
  match: 'Wedstrijd',
  youth: 'Jeugd',
  club: 'Club',
  event: 'Evenement',
}

export default function NieuwsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['news', id],
    queryFn: () => getNewsItem(id),
  })

  if (isLoading) return <Layout title="Nieuws"><div style={{ padding: 40, color: '#888', textAlign: 'center' }}>Laden...</div></Layout>
  if (error || !item) return <Layout title="Nieuws"><div style={{ padding: 40, color: '#888', textAlign: 'center' }}>Artikel niet gevonden</div></Layout>

  return (
    <Layout title="Nieuws">
      <button onClick={() => navigate('/nieuws')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', marginBottom: 20, fontSize: 14 }}>
        <Icon name="chevronLeft" size={16} /> Terug naar nieuws
      </button>

      <div style={{ maxWidth: 720 }}>
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {item.is_pinned && (
            <span style={{ background: 'var(--orange)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>VAST</span>
          )}
          {item.category && (
            <span style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {CAT_LABELS[item.category] || item.category}
            </span>
          )}
          {item.created_at && (
            <span style={{ fontSize: 12, color: '#aaa' }}>
              {new Date(item.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px' }}>{item.title}</h1>

        {/* Image */}
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            style={{ width: '100%', borderRadius: 10, marginBottom: 20, maxHeight: 400, objectFit: 'cover' }}
          />
        )}

        {/* TLDR */}
        {item.tldr && (
          <div style={{
            background: 'var(--orange-soft)',
            borderLeft: '4px solid var(--orange)',
            padding: '14px 18px', borderRadius: '0 8px 8px 0',
            marginBottom: 24, fontSize: 16, color: '#333', lineHeight: 1.6, fontStyle: 'italic',
          }}>
            {item.tldr}
          </div>
        )}

        {/* Body */}
        {item.body && (
          <div style={{ fontSize: 15, lineHeight: 1.7, color: '#333', whiteSpace: 'pre-wrap' }}>
            {item.body}
          </div>
        )}
      </div>
    </Layout>
  )
}
