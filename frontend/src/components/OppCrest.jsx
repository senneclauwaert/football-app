import { useMemo } from 'react'

const HUES = [210, 0, 45, 140, 280, 20, 180, 320, 60, 200]

function hashName(name = '') {
  let h = 0
  for (const c of name) h = ((h * 31) + c.charCodeAt(0)) >>> 0
  return h
}

export default function OppCrest({ name = '', size = 32 }) {
  const seed = useMemo(() => hashName(name), [name])
  const bg = `hsl(${HUES[seed % HUES.length]} 50% 35%)`
  const initials = name
    .split(/[\s.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <div style={{
      width: size,
      height: size,
      background: bg,
      color: '#fff',
      borderRadius: 3,
      fontFamily: 'Anton, Impact, sans-serif',
      fontSize: Math.round(size * 0.4),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      letterSpacing: '.02em',
      userSelect: 'none',
    }}>
      {initials}
    </div>
  )
}
