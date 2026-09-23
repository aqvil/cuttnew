/**
 * Hero scene: the product's own skyline.
 *
 * The reference world staged its rising sun behind a city skyline. Cuttly's
 * skyline is built from what the product actually is — link chains, stacked
 * like the towers of a settlement, tiers receding the way a pagoda roofline
 * does. A gradient signal disc rises behind them; two packet trails arc
 * across the sky the way birds cross the reference's skyline. A fine grain
 * filter keeps it from reading as flat vector chrome.
 *
 * Pure SVG — no raster, no photography — so it themes from the palette and
 * stays crisp at any size.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 760"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <radialGradient id="hs-sun" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.55" />
          <stop offset="45%" stopColor="var(--color-brand)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hs-tower-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="hs-tower-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.78" />
        </linearGradient>
        <filter id="hs-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
        </filter>
      </defs>

      {/* Signal disc */}
      <circle cx="450" cy="330" r="300" fill="url(#hs-sun)" />
      <circle cx="450" cy="330" r="160" stroke="var(--color-brand)" strokeOpacity="0.35" />
      <circle cx="450" cy="330" r="230" stroke="var(--color-brand)" strokeOpacity="0.2" />
      <circle cx="450" cy="330" r="90" fill="var(--color-brand)" fillOpacity="0.9" />

      {/* Packet trails */}
      <path d="M60 210 Q 300 120 620 190" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="620" cy="190" r="4" fill="var(--color-brand)" />
      <path d="M340 90 Q 560 40 830 150" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
      <circle cx="830" cy="150" r="3.5" fill="var(--color-brand)" />

      {/* Far skyline — link-chain towers, low tier */}
      <g fill="url(#hs-tower-far)">
        <rect x="0" y="470" width="70" height="230" rx="6" />
        <rect x="90" y="440" width="56" height="260" rx="6" />
        <rect x="770" y="450" width="60" height="250" rx="6" />
        <rect x="840" y="480" width="60" height="220" rx="6" />
      </g>

      {/* Near skyline — stepped "pagoda" towers built from stacked chain links */}
      <g fill="url(#hs-tower-near)">
        <path d="M170 700 V520 h44 v-30 h-70 v-24 h96 v-30 h-44 v-30 h52 v30 h-30 v30 h84 v24 h-56 v30 h56 v180 z" />
        <path d="M330 700 V560 h30 v-26 h72 v-22 h-40 v-26 h48 v26 h30 v22 h-58 v26 h58 v140 z" />
        <path d="M500 700 V480 h56 v-34 h-96 v-26 h122 v-34 h-52 v-30 h60 v30 h34 v34 h-70 v26 h96 v34 h-64 v170 z" />
        <path d="M660 700 V580 h34 v-24 h64 v-20 h-38 v-22 h44 v22 h26 v20 h-50 v24 h50 v120 z" />
      </g>

      {/* Chain-link "windows": the towers' one repeating ornament. */}
      <g stroke="var(--color-background)" strokeWidth="3" strokeLinecap="round" opacity="0.85">
        <path d="M190 600 h16 M190 630 h16 M190 660 h16" />
        <path d="M520 560 h16 M520 590 h16 M520 620 h16 M520 650 h16" />
        <path d="M350 610 h14 M350 640 h14 M350 670 h14" />
      </g>

      {/* Ground line */}
      <rect x="0" y="700" width="900" height="1" fill="currentColor" opacity="0.15" />

      {/* Grain */}
      <rect x="0" y="0" width="900" height="760" filter="url(#hs-grain)" opacity="0.5" />
    </svg>
  )
}
