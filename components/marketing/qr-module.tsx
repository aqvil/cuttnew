/**
 * A stylized QR module grid — the finder squares are real QR grammar, the
 * data field is a deterministic pseudo-random pattern rather than an
 * encoded payload. It reads as "a QR code" at a glance without claiming to
 * scan as one, which is the honest version of this as a feature icon.
 */
export function QrModule({
  className,
  accentClassName,
}: {
  className?: string
  accentClassName?: string
}) {
  const size = 21
  const cell = 100 / size

  // Deterministic pseudo-random fill so the pattern is stable across renders.
  function on(x: number, y: number) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    return n - Math.floor(n) > 0.52
  }

  const finder = (x: number, y: number) => (
    <g key={`f-${x}-${y}`}>
      <rect x={x * cell} y={y * cell} width={cell * 7} height={cell * 7} fill="currentColor" opacity="0.12" />
      <rect x={(x + 1) * cell} y={(y + 1) * cell} width={cell * 5} height={cell * 5} fill="none" stroke="currentColor" strokeWidth={cell * 0.9} />
      <rect x={(x + 2.5) * cell} y={(y + 2.5) * cell} width={cell * 2} height={cell * 2} fill="currentColor" />
    </g>
  )

  const cells = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder =
        (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)
      if (inFinder) continue
      if (!on(x, y)) continue
      const accent = (x + y) % 9 === 0
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x * cell}
          y={y * cell}
          width={cell * 0.92}
          height={cell * 0.92}
          rx={cell * 0.18}
          className={accent ? accentClassName : undefined}
          fill="currentColor"
        />
      )
    }
  }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {finder(0, 0)}
      {finder(size - 7, 0)}
      {finder(0, size - 7)}
      {cells}
    </svg>
  )
}
