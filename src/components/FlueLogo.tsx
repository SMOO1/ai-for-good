interface FlueLogoProps {
  iconSize?: number
  showWordmark?: boolean
  className?: string
}

export default function FlueLogo({ iconSize = 88, showWordmark = true, className = '' }: FlueLogoProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Logo mark — See + Hear + Speak in one icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 88 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="88" height="88" rx="22" fill="#2E7D5E" />

        {/* SEE — eye shape (top-left) */}
        <path
          d="M10 32 Q26 18 42 32 Q26 46 10 32 Z"
          stroke="white"
          strokeWidth="2.2"
          fill="none"
          strokeLinejoin="round"
        />
        <circle cx="26" cy="32" r="5.5" fill="white" />
        <circle cx="26" cy="32" r="2.8" fill="#2E7D5E" />

        {/* HEAR — sound waves (top-right) */}
        <circle cx="54" cy="32" r="3.5" fill="white" />
        <path
          d="M60 25 Q68 32 60 39"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M65 20 Q77 32 65 44"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* SPEAK — speech bubble (bottom) */}
        <rect x="11" y="53" width="50" height="22" rx="7" fill="white" fillOpacity="0.92" />
        <path d="M18 75 L13 84 L25 75 Z" fill="white" fillOpacity="0.92" />
        <line x1="19" y1="61" x2="52" y2="61" stroke="#2E7D5E" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="19" y1="68" x2="39" y2="68" stroke="#2E7D5E" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span className="text-5xl font-extrabold tracking-[0.18em] text-gray-900">
          FLUE
        </span>
      )}
    </div>
  )
}
