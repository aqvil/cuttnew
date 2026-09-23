/**
 * Signal-ring motif.
 *
 * The product's stand-in for the reference world's rising sun: a link,
 * broadcast outward as concentric arcs from a source point. Pure inline SVG
 * so it themes from the palette and stays crisp at any size — never a
 * raster, never a gradient standing in for the idea.
 */
export function SignalMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 640"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="320" cy="320" r="14" fill="var(--color-brand)" fillOpacity="0.4" />
      {[80, 150, 220, 290].map((r, i) => (
        <circle
          key={r}
          cx="320"
          cy="320"
          r={r}
          stroke={i % 2 === 0 ? "var(--color-brand)" : "currentColor"}
          strokeOpacity={i % 2 === 0 ? 0.32 - i * 0.06 : 0.16}
          strokeWidth={i === 0 ? 2 : 1}
        />
      ))}
      <path
        d="M320 30 V70 M320 570 V610 M30 320 H70 M570 320 H610"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1"
      />
    </svg>
  )
}
