import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import { getTeams } from '../../api/teams'
import { getPlayers } from '../../api/players'
import { getMatches } from '../../api/matches'
import { getAllProducts } from '../../api/shop'
import { getAllEvents } from '../../api/events'

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div style={{
      background: '#1a1a1a',
      padding: '24px 20px',
      border: '1px solid #2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{
          fontSize: 11,
          color: '#666',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          margin: 0,
        }}>
          {label}
        </p>
        <div style={{
          width: 32,
          height: 32,
          background: accent + '22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
        }}>
          <Icon name={icon} size={15} color={accent} />
        </div>
      </div>
      <p style={{
        fontSize: 40,
        fontFamily: 'Anton, Impact, sans-serif',
        color: '#fff',
        margin: 0,
        lineHeight: 1,
      }}>
        {value ?? <span style={{ color: '#333' }}>—</span>}
      </p>
      <p style={{ fontSize: 12, color: '#555', margin: 0 }}>{sub}</p>
    </div>
  )
}

function QuickLink({ label, to, icon }) {
  return (
    <a
      href={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        color: '#ccc',
        textDecoration: 'none',
        fontSize: 13,
        fontWeight: 500,
        transition: 'border-color 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#FF6200'
        e.currentTarget.style.color = '#FF6200'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#2a2a2a'
        e.currentTarget.style.color = '#ccc'
      }}
    >
      <Icon name={icon} size={15} />
      {label}
    </a>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    teams: null,
    players: null,
    matches: null,
    upcoming: null,
    shopItems: null,
    events: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date().toISOString()
    Promise.allSettled([
      getTeams(),
      getPlayers(),
      getMatches(),
      getAllProducts(),
      getAllEvents(),
    ]).then(([teams, players, matches, shop, events]) => {
      const matchList = matches.status === 'fulfilled' ? (matches.value || []) : []
      const upcoming = matchList.filter(m => m.date && m.date > now).length

      setStats({
        teams:     teams.status === 'fulfilled'   ? (teams.value || []).length      : 0,
        players:   players.status === 'fulfilled' ? (players.value || []).length    : 0,
        matches:   matchList.length,
        upcoming,
        shopItems: shop.status === 'fulfilled'    ? (shop.value || []).length       : 0,
        events:    events.status === 'fulfilled'  ? (events.value || []).length     : 0,
      })
      setLoading(false)
    })
  }, [])

  const cards = [
    { label: 'Ploegen',          value: stats.teams,     sub: 'Actieve ploegen',         icon: 'users',    accent: '#FF6200' },
    { label: 'Spelers',          value: stats.players,   sub: 'Geregistreerde spelers',  icon: 'star',     accent: '#3b82f6' },
    { label: 'Wedstrijden',      value: stats.matches,   sub: 'Alle wedstrijden',         icon: 'calendar', accent: '#8b5cf6' },
    { label: 'Komende matches',  value: stats.upcoming,  sub: 'Nog te spelen',            icon: 'ball',     accent: '#10b981' },
    { label: 'Shop artikelen',   value: stats.shopItems, sub: 'Beschikbare producten',   icon: 'shop',     accent: '#f59e0b' },
    { label: 'Evenementen',      value: stats.events,    sub: 'Geplande activiteiten',   icon: 'party',    accent: '#ec4899' },
  ]

  return (
    <AdminLayout>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'Anton, Impact, sans-serif',
          fontSize: 30,
          color: '#fff',
          margin: '0 0 4px',
          letterSpacing: 1,
        }}>
          DASHBOARD
        </h1>
        <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
          Overzicht van Toekomst Relegem
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#555', fontSize: 14 }}>
          <div style={{
            width: 20,
            height: 20,
            border: '2px solid #FF6200',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          Statistieken laden...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 36,
        }}>
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: 24 }}>
        <h2 style={{
          fontFamily: 'Anton, Impact, sans-serif',
          fontSize: 16,
          color: '#fff',
          margin: '0 0 16px',
          letterSpacing: 1,
        }}>
          SNELLE LINKS
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <QuickLink label="Nieuws beheren"       to="/admin/nieuws"      icon="news" />
          <QuickLink label="Evenementen beheren"  to="/admin/evenementen" icon="party" />
          <QuickLink label="Shop beheren"         to="/admin/shop"        icon="shop" />
          <QuickLink label="Sponsors beheren"     to="/admin/sponsors"    icon="sponsors" />
          <QuickLink label="Wedstrijden"          to="/admin/wedstrijden" icon="calendar" />
          <QuickLink label="Scraper uitvoeren"    to="/admin/scraper"     icon="whistle" />
        </div>
      </div>
    </AdminLayout>
  )
}
