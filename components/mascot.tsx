/**
 * Byte — the friendly AI guide who greets learners.
 * Pure SVG so it stays crisp at any size; blink/float animations
 * come from globals.css.
 */
export function Mascot({ size = 180 }: { size?: number }) {
  return (
    <div className="animate-float" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        role="img"
        aria-label="Byte, your friendly AI guide"
      >
        {/* antenna */}
        <line x1="100" y1="38" x2="100" y2="18" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
        <circle cx="100" cy="14" r="9" fill="#22d3ee" className="animate-glow" />

        {/* head */}
        <rect x="30" y="38" width="140" height="110" rx="34" fill="#8b5cf6" />
        <rect x="30" y="38" width="140" height="110" rx="34" fill="url(#shine)" />

        {/* face plate */}
        <rect x="46" y="56" width="108" height="74" rx="24" fill="#150c38" />

        {/* eyes */}
        <g className="animate-blink">
          <circle cx="78" cy="90" r="11" fill="#22d3ee" />
          <circle cx="122" cy="90" r="11" fill="#22d3ee" />
          <circle cx="81" cy="86" r="3.5" fill="#f5f2ff" />
          <circle cx="125" cy="86" r="3.5" fill="#f5f2ff" />
        </g>

        {/* smile */}
        <path
          d="M82 110 Q100 124 118 110"
          stroke="#f472b6"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* ears */}
        <rect x="16" y="78" width="14" height="30" rx="7" fill="#22d3ee" />
        <rect x="170" y="78" width="14" height="30" rx="7" fill="#22d3ee" />

        {/* body */}
        <rect x="62" y="150" width="76" height="34" rx="16" fill="#6d3ff2" />
        <circle cx="100" cy="167" r="8" fill="#fbbf24" />

        <defs>
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
