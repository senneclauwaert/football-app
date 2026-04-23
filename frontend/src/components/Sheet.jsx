import { useEffect } from 'react'
import Icon from './Icon'

export default function Sheet({ open, onClose, title, children, maxWidth = '520px' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 12,
          width: '90vw',
          maxWidth,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
        className="animate-fade-in"
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid var(--line)',
          position: 'sticky', top: 0, background: 'var(--paper)', zIndex: 1,
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--paper-2)',
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: 20 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
