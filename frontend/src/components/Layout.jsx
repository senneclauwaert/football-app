import { NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Crest from './Crest'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/',            icon: 'home',     label: 'Home' },
  { to: '/wedstrijden', icon: 'calendar', label: 'Wedstrijden' },
  { to: '/klassement',  icon: 'trophy',   label: 'Klassement' },
  { to: '/ploegen',     icon: 'users',    label: 'Ploegen' },
  { to: '/evenementen', icon: 'party',    label: 'Evenementen' },
  { to: '/shop',        icon: 'shop',     label: 'Shop' },
  { to: '/nieuws',      icon: 'news',     label: 'Nieuws' },
  { to: '/sponsors',    icon: 'sponsors', label: 'Sponsors' },
]

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
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
      className="sidebar-nav-item"
    >
      {({ isActive }) => (
        <>
          {/* Active left bar marker */}
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
            <Icon name={icon} size={16} />
          </span>
          {label}
        </>
      )}
    </NavLink>
  )
}

export default function Layout({ children, title, onCartClick }) {
  const { count } = useCart()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>

      {/* ── Sidebar desktop ── */}
      <nav
        className="sidebar-desktop"
        style={{
          width: 240,
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div style={{
          padding: '20px 20px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid #1f1f1f',
        }}>
          <Crest size={38} />
          <div style={{ lineHeight: 1 }}>
            <div style={{
              color: '#fff',
              fontSize: 18,
              fontFamily: 'Anton, Impact, sans-serif',
              letterSpacing: '.02em',
            }}>
              Toekomst
            </div>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: '.15em', textTransform: 'uppercase', marginTop: 3 }}>
              KV Relegem · 1952
            </div>
          </div>
        </div>

        {/* Nav group */}
        <div style={{ padding: '12px 10px', flex: 1 }}>
          <div style={{
            fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
            color: '#555', padding: '12px 10px 8px',
          }}>
            Club
          </div>
          {NAV.map(n => <SidebarLink key={n.to} {...n} />)}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #1f1f1f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: '#666',
        }}>
          <span>v1.0 · 2026</span>
          {isAdmin && (
            <NavLink
              to="/admin"
              style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                padding: '4px 10px',
                borderRadius: 3,
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                textDecoration: 'none',
                transition: 'background .12s',
              }}
            >
              Admin →
            </NavLink>
          )}
        </div>
      </nav>

      {/* ── Main column ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          height: 58,
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          gap: 16,
        }}>
          <h1 style={{
            margin: 0,
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: '.01em',
            textTransform: 'uppercase',
            flex: 1,
          }}>
            {title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              style={{
                width: 36, height: 36,
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--paper-2)',
                transition: 'background .12s, transform .1s',
                position: 'relative',
              }}
              title="Winkelwagen"
              onClick={() => {
                if (typeof onCartClick === 'function') onCartClick()
                else navigate('/shop')
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <Icon name="cart" size={16} />
              {count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 3, right: 3,
                  minWidth: 16, height: 16,
                  background: 'var(--orange)',
                  color: '#000',
                  borderRadius: 8,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {count}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{ flex: 1, padding: '28px', overflowY: 'auto', paddingBottom: 80 }}
          className="page-in"
        >
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="sidebar-mobile"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: '#0a0a0a',
          zIndex: 50,
          borderTop: '1px solid #1f1f1f',
        }}
      >
        {NAV.slice(0, 6).map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px 4px',
              flex: 1,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: isActive ? 'var(--orange)' : '#777',
              textDecoration: 'none',
              transition: 'color .12s',
            })}
          >
            <Icon name={n.icon} size={20} />
            <span style={{ marginTop: 3 }}>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        .sidebar-nav-item:hover:not([class*="active"]) {
          background: #1a1a1a !important;
          color: var(--paper) !important;
          transform: translateX(2px);
        }
        .sidebar-nav-item:hover:not([class*="active"]) span:first-of-type {
          color: #ccc !important;
        }
        @media (max-width: 900px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile  { display: flex !important; }
          main { padding-bottom: 80px !important; }
          header { padding: 0 16px !important; }
          main { padding: 16px !important; }
        }
      `}</style>
    </div>
  )
}
