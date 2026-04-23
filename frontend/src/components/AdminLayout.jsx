import { NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Crest from './Crest'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ADMIN_NAV = [
  { to: '/admin',             icon: 'grid',     label: 'Dashboard', exact: true },
  { to: '/admin/wedstrijden', icon: 'calendar', label: 'Wedstrijden' },
  { to: '/admin/ploegen',     icon: 'users',    label: 'Ploegen & Spelers' },
  { to: '/admin/klassement',  icon: 'trophy',   label: 'Klassement' },
  { to: '/admin/shop',        icon: 'shop',     label: 'Shop' },
  { to: '/admin/evenementen', icon: 'party',    label: 'Evenementen' },
  { to: '/admin/nieuws',      icon: 'news',     label: 'Nieuws' },
  { to: '/admin/sponsors',    icon: 'sponsors', label: 'Sponsors' },
  { to: '/admin/scraper',     icon: 'whistle',  label: 'Scraper' },
]

export default function AdminLayout({ children, title }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Uitgelogd')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav style={{
        width: 240,
        background: '#1a0f06',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Crest size={36} />
          <div>
            <div style={{ color: '#ff6a13', fontSize: 12, fontFamily: 'Anton, Impact', letterSpacing: 1, lineHeight: 1 }}>ADMIN PANEL</div>
            <div style={{ color: '#fff', fontSize: 11, letterSpacing: 2, opacity: 0.7 }}>TOEKOMST RELEGEM</div>
          </div>
        </div>

        <div style={{ height: 1, background: '#2a1a0a', margin: '0 16px 8px' }} />

        {/* Back to app */}
        <NavLink
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 24px',
            fontSize: 12, color: '#ff6a13', opacity: 0.8,
            textDecoration: 'none',
          }}
        >
          <Icon name="chevronLeft" size={14} />
          Terug naar app
        </NavLink>

        <div style={{ height: 1, background: '#2a1a0a', margin: '8px 16px' }} />

        {/* Nav */}
        <div style={{ padding: '0 8px', flex: 1 }}>
          {ADMIN_NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={!!n.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px',
                borderRadius: 8,
                marginBottom: 2,
                fontSize: 14, fontWeight: 500,
                color: isActive ? '#ff6a13' : '#999',
                background: isActive ? 'rgba(255,106,19,0.15)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              })}
            >
              <Icon name={n.icon} size={17} />
              {n.label}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #2a1a0a' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 16px', width: '100%', borderRadius: 8,
              fontSize: 14, color: '#888',
            }}
          >
            <Icon name="logout" size={17} />
            Uitloggen
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--paper)' }}>
        {title && (
          <header style={{
            padding: '0 28px',
            height: 56,
            borderBottom: '1px solid var(--line)',
            display: 'flex', alignItems: 'center',
            background: '#fff',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h1>
          </header>
        )}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
