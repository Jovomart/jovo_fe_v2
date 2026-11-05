interface Props {
  className?: string
  tone?: 'light' | 'dark'
}

/**
 * Decorative, sketch-style composition of marketplace UI cards.
 * Purely ornamental - kept out of the accessibility tree.
 */
export default function Doodle({ className = '', tone = 'light' }: Props) {
  const dark = tone === 'dark'
  const line = dark ? 'rgba(255,255,255,.28)' : 'rgba(14,14,16,.16)'
  const faint = dark ? 'rgba(255,255,255,.16)' : 'rgba(14,14,16,.08)'
  const card = dark ? '#17171A' : '#FFFFFF'
  const cardStroke = dark ? 'rgba(255,255,255,.16)' : 'rgba(14,14,16,.14)'

  return (
    <svg
      viewBox="0 0 620 460"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g stroke={line} strokeWidth="1.6" strokeLinecap="round">
        <path d="M18 318C74 226 150 178 248 178c102 0 152 46 164 100" strokeDasharray="5 9" />
        <path d="M78 404c58-30 106-70 138-118" />
        <path d="M556 74c30 30 42 72 28 116" />
        <path d="M470 348c26 6 52 2 74-12" strokeDasharray="5 9" />
      </g>

      <circle cx="512" cy="300" r="66" fill="#DCCBF6" opacity={dark ? 0.35 : 0.5} />
      <circle cx="150" cy="128" r="52" fill="#D9EBF8" opacity={dark ? 0.3 : 0.65} />
      <circle cx="330" cy="392" r="34" fill="#D3E8D9" opacity={dark ? 0.3 : 0.7} />

      <g transform="rotate(-7 138 300)">
        <rect x="36" y="232" width="206" height="140" rx="22" fill={card} stroke={cardStroke} />
        <rect x="56" y="252" width="74" height="9" rx="4.5" fill="#FBD9C2" />
        <rect x="56" y="272" width="132" height="9" rx="4.5" fill={faint} />
        <rect x="56" y="290" width="102" height="9" rx="4.5" fill={faint} />
        <rect x="56" y="322" width="82" height="28" rx="14" fill="#0E0E10" opacity={dark ? 0.9 : 0.92} />
        <rect x="70" y="333" width="54" height="6" rx="3" fill="#FFFFFF" opacity=".8" />
        <circle cx="212" cy="254" r="11" fill="#D3E8D9" />
      </g>

      <g>
        <rect x="272" y="92" width="272" height="182" rx="24" fill={card} stroke={cardStroke} />
        <circle cx="294" cy="112" r="4" fill={faint} />
        <circle cx="308" cy="112" r="4" fill={faint} />
        <circle cx="322" cy="112" r="4" fill={faint} />
        <path d="M272 128h272" stroke={cardStroke} />
        <rect x="292" y="146" width="112" height="11" rx="5.5" fill={faint} />
        <rect x="292" y="166" width="78" height="8" rx="4" fill={faint} opacity=".7" />

        <rect x="292" y="226" width="20" height="28" rx="7" fill="#D9EBF8" />
        <rect x="320" y="212" width="20" height="42" rx="7" fill="#D3E8D9" />
        <rect x="348" y="232" width="20" height="22" rx="7" fill="#DCCBF6" />
        <rect x="376" y="202" width="20" height="52" rx="7" fill="#FBD9C2" />

        <rect x="418" y="188" width="104" height="66" rx="16" fill="#D9EBF8" opacity={dark ? 0.4 : 1} />
        <circle cx="440" cy="210" r="9" fill={card} />
        <rect x="456" y="204" width="52" height="8" rx="4" fill={card} opacity=".75" />
        <rect x="432" y="230" width="76" height="8" rx="4" fill={card} opacity=".55" />
      </g>

      <g>
        <rect x="248" y="292" width="118" height="44" rx="22" fill={card} stroke={cardStroke} />
        <circle cx="272" cy="314" r="11" fill="#D3E8D9" />
        <rect x="292" y="308" width="52" height="6" rx="3" fill={faint} />
        <rect x="292" y="320" width="34" height="5" rx="2.5" fill={faint} opacity=".7" />
      </g>

      <g stroke={line} strokeWidth="1.6">
        <circle cx="452" cy="346" r="22" strokeDasharray="4 7" />
        <path d="M576 214l16 16m0-16l-16 16" />
      </g>

      <g fill={dark ? 'rgba(255,255,255,.4)' : 'rgba(14,14,16,.28)'}>
        <path d="M96 92l3.2 8.6L108 104l-8.8 3.4L96 116l-3.2-8.6L84 104l8.8-3.4z" />
        <path d="M410 62l2.4 6.4 6.6 2.6-6.6 2.6-2.4 6.4-2.4-6.4-6.6-2.6 6.6-2.6z" />
      </g>
    </svg>
  )
}
