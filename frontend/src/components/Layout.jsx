import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
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
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 16px',
        borderRadius: 8,
        marginBottom: 2,
        fontSize: 14,
        fontWeight: 500,
        color: isActive ? '#ff6a13' : '#aaa',
        background: isActive ? 'rgba(255,106,19,0.12)' : 'transparent',
        transition: 'background 0.15s, color 0.15s',
        textDecoration: 'none',
      })}
    >
      <Icon name={icon} size={18} />
      {label}
    </NavLink>
  )
}

export default function Layout({ children, title, cartDrawerContent }) {
  const { count } = useCart()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: '100vh' }}>
      {/* Sidebar - desktop */}
      <nav style={{
        width: 220,
        background: '#111',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
        className="sidebar-desktop"
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Crest size={36} />
          <div>
            <div style={{ color: '#ff6a13', fontSize: 13, fontFamily: 'Anton, Impact', letterSpacing: 1, lineHeight: 1 }}>TOEKOMST</div>
            <div style={{ color: '#fff', fontSize: 12, letterSpacing: 2 }}>RELEGEM</div>
          </div>
        </div>
        <div style={{ height: 1, background: '#222', margin: '0 16px 12px' }} />
        {/* Nav */}
        <div style={{ padding: '0 8px', flex: 1 }}>
          {NAV.map(n => <SidebarLink key={n.to} {...n} />)}
        </div>
        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #222' }}>
          {isAdmin && (
            <NavLink
              to="/admin"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderRadius: 8, fontSize: 14, color: '#888', textDecoration: 'none' }}
            >
              <Icon name="settings" size={18} />
              Admin
            </NavLink>
          )}
        </div>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center',
          padding: '0 24px',
          height: 56,
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: 1 }}>{title}</h1>
          {/* Cart button */}
          <button
            onClick={() => navigate('/shop')}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--paper-2)',
            }}
          >
            <Icon name="cart" size={18} />
            {count > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                background: '#ff6a13', color: '#fff',
                width: 16, height: 16, borderRadius: '50%',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {count}
              </span>
            )}
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#111',
        zIndex: 20,
        borderTop: '1px solid #222',
      }}
        className="sidebar-mobile"
      >
        {NAV.slice(0, 5).map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px 4px',
              flex: 1,
              fontSize: 10, color: isActive ? '#ff6a13' : '#888',
              textDecoration: 'none',
            })}
          >
            <Icon name={n.icon} size={20} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile { display: flex !important; }
          main { padding-bottom: 72px !important; }
        }
      `}</style>
    </div>
  )
}
