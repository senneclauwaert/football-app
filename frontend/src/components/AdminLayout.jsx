import { NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Crest from './Crest'
import { useAuth } from '../context/AuthContext'

const ADMIN_NAV = [
  { to: '/admin',              icon: 'grid',     label: 'Dashboard',    exact: true },
  { to: '/admin/nieuws',       icon: 'news',     label: 'Nieuws' },
  { to: '/admin/evenementen',  icon: 'party',    label: 'Evenementen' },
  { to: '/admin/shop',         icon: 'shop',     label: 'Shop' },
  { to: '/admin/sponsors',     icon: 'sponsors', label: 'Sponsors' },
  { to: '/admin/wedstrijden',  icon: 'calendar', label: 'Wedstrijden' },
  { to: '/admin/scraper',      icon: 'whistle',  label: 'Scraper' },
]

const sidebarStyle = {
  width: 240,
  minWidth: 240,
  background: '#0a0a0a',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflowY: 'auto',
  borderRight: '1px solid #1f1f1f',
}

export default function AdminLayout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('tr_admin_unlocked')
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111' }}>
      {/* Sidebar */}
      <nav style={sidebarStyle}>
        {/* Header */}
        <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Crest size={34} />
          <div>
            <div style={{
              color: '#FF6200',
              fontSize: 15,
              fontFamily: 'Anton, Impact, sans-serif',
              letterSpacing: 1,
              lineHeight: 1.1,
            }}>
              TR ADMIN
            </div>
            <div style={{ color: '#555', fontSize: 10, letterSpacing: 2, marginTop: 2 }}>
              TOEKOMST RELEGEM
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#1f1f1f', margin: '0 16px 8px' }} />

        {/* Back to public site */}
        <NavLink
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            fontSize: 12,
            color: '#555',
            textDecoration: 'none',
          }}
        >
          <Icon name="chevronLeft" size={13} />
          Terug naar site
        </NavLink>

        <div style={{ height: 1, background: '#1f1f1f', margin: '8px 16px 12px' }} />

        {/* Nav links */}
        <div style={{ padding: '0 8px', flex: 1 }}>
          {ADMIN_NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={!!n.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 0,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? '#FF6200' : '#888',
                background: isActive ? 'rgba(255,98,0,0.12)' : 'transparent',
                textDecoration: 'none',
                borderLeft: isActive ? '3px solid #FF6200' : '3px solid transparent',
                transition: 'background 0.15s, color 0.15s',
              })}
            >
              <Icon name={n.icon} size={16} />
              {n.label}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #1f1f1f' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              width: '100%',
              borderRadius: 0,
              fontSize: 13,
              color: '#555',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
          >
            <Icon name="logout" size={16} />
            Uitloggen
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#111' }}>
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
