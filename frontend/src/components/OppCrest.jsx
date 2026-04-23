function hashName(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return Math.abs(h)
}

const COLORS = [
  ['#1a3a6b', '#e8c531'],
  ['#c0392b', '#2c3e50'],
  ['#27ae60', '#f1c40f'],
  ['#8e44ad', '#f39c12'],
  ['#2980b9', '#ecf0f1'],
  ['#e74c3c', '#f5f5f5'],
  ['#2c3e50', '#e74c3c'],
  ['#16a085', '#f39c12'],
]

export default function OppCrest({ name = '', size = 32 }) {
  const h = hashName(name)
  const [primary, secondary] = COLORS[h % COLORS.length]
  const letter = name.trim()[0]?.toUpperCase() || '?'

  return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      <path
        d="M20 2L4 8V24C4 33 11 40 20 43C29 40 36 33 36 24V8L20 2Z"
        fill={primary}
        stroke="#0a0a0a"
        strokeWidth="1.5"
      />
      <text
        x="20" y="28"
        textAnchor="middle"
        fill={secondary}
        fontSize="16"
        fontFamily="Anton, Impact, sans-serif"
      >
        {letter}
      </text>
    </svg>
  )
}
