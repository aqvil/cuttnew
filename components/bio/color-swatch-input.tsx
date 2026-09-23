'use client'

import { useId } from "react"
import { Label } from "@/components/ui/label"

/**
 * A color field that reads as a swatch, not a raw browser widget. The
 * native `<input type="color">` still drives the picker (no dependency,
 * every OS's own picker) — it's just reduced to a hidden hit-target behind
 * a chip that actually shows the color, a ring on focus, and the hex value
 * as its own line instead of fighting the swatch for space.
 */
export function ColorSwatchInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()

  return (
    <div className="space-y-2.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-border shadow-[0_1px_2px_rgb(0_0_0_/_0.06)] ring-1 ring-inset ring-black/5">
          <div className="absolute inset-0" style={{ backgroundColor: value }} />
          <input
            id={id}
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            aria-label={`${label} color`}
          />
        </div>
        <span className="font-mono text-[13px] uppercase text-muted-foreground">{value}</span>
      </div>
    </div>
  )
}
