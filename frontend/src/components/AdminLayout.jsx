import { NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Crest from './Crest'
import { useAuth } from '../context/AuthContext'

const ADMIN_NAV = [
  { to: '/admin',               icon: 'grid',     label: 'Dashboard',    exact: true },
  { to: '/admin/nieuws',        icon: 'news',     label: 'Nieuws' },
  { to: '/admin/evenementen',   icon: 'party',    label: 'Evenementen' },
  { to: '/admin/shop',          icon: 'shop',     label: 'Shop' },
  { to: '/admin/bestellingen',  icon: 'cart',     label: 'Bestellingen' },
  { to: '/admin/sponsors',      icon: 'sponsors', label: 'Sponsors' },
  { to: '/admin/wedstrijden',   icon: 'calendar', label: 'Wedstrijden' },
  { to: '/admin/ploegen',       icon: 'users',    label: 'Ploegen' },
  { to: '/admin/spelers',       icon: 'ball',     label: 'Spelers' },
  { to: '/admin/klassement',    icon: 'trophy',   label: 'Klassement' },
  { to: '/admin/scraper',       icon: 'whistle',  label: 'Scraper' },
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
              className="sidebar-nav-item"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 4,
                marginBottom: 2,
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? '#000' : '#bbb',
                background: isActive ? 'var(--orange)' : 'transparent',
                textDecoration: 'none',
                position: 'relative',
                transition: 'background .13s, color .13s, transform .1s',
                willChange: 'transform',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      left: 0, top: 6, bottom: 6,
                      width: 3,
                      background: '#000',
                      borderRadius: '0 2px 2px 0',
                      animation: 'nav-mark .22s cubic-bezier(.2,.7,.2,1) both',
                    }} />
                  )}
                  <span style={{ color: isActive ? '#000' : '#888', display: 'flex', flexShrink: 0 }}>
                    <Icon name={n.icon} size={16} />
                  </span>
                  {n.label}
                </>
              )}
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

      <style>{`
        .sidebar-nav-item:hover:not([class*="active"]) {
          background: #1a1a1a !important;
          color: var(--paper) !important;
          transform: translateX(2px);
        }
        .sidebar-nav-item:hover:not([class*="active"]) span:first-of-type {
          color: #ccc !important;
        }
      `}</style>
    </div>
  )
}
