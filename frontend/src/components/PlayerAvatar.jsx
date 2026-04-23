export default function PlayerAvatar({ firstName = '', lastName = '', size = 40, photo, variant = 'orange' }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?'

  if (photo) {
    return (
      <img
        src={photo}
        alt={`${firstName} ${lastName}`}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          flexShrink: 0,
          background: 'var(--paper-2)',
        }}
      />
    )
  }

  const bg = variant === 'ink' ? 'var(--ink)' : 'var(--orange)'
  const fg = variant === 'ink' ? 'var(--orange)' : '#000'

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: bg,
      color: fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Anton, Impact, sans-serif',
      fontSize: Math.round(size * 0.38),
      flexShrink: 0,
      letterSpacing: '.01em',
    }}>
      {initials}
    </div>
  )
}
