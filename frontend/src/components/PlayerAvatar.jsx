export default function PlayerAvatar({ firstName = '', lastName = '', size = 40, photo }) {
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  if (photo) {
    return (
      <img
        src={photo}
        alt={`${firstName} ${lastName}`}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          background: 'var(--paper-2)',
        }}
      />
    )
  }

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'var(--orange)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      fontSize: size * 0.36,
      fontWeight: 700,
      flexShrink: 0,
      fontFamily: 'Inter, system-ui',
    }}>
      {initials || '?'}
    </div>
  )
}
