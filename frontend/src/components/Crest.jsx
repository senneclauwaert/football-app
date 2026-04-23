export default function Crest({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield shape */}
      <path
        d="M40 4L8 16V46C8 63 23 77 40 86C57 77 72 63 72 46V16L40 4Z"
        fill="#ff6a13"
        stroke="#0a0a0a"
        strokeWidth="2"
      />
      {/* Inner shield */}
      <path
        d="M40 12L16 22V46C16 60 27 71 40 78C53 71 64 60 64 46V22L40 12Z"
        fill="#0a0a0a"
      />
      {/* TR monogram */}
      <text
        x="40"
        y="56"
        textAnchor="middle"
        fill="#ff6a13"
        fontSize="28"
        fontFamily="Anton, Impact, sans-serif"
        fontWeight="400"
      >
        TR
      </text>
    </svg>
  )
}
