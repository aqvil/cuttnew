'use client'

import { getCardStyle } from "@/lib/bio/card-style"
import type { BioPageTheme } from "@/lib/types/database"
import { cn } from "@/lib/utils"

const OPTIONS: { id: BioPageTheme["style"]; label: string }[] = [
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold shadow" },
  { id: "elegant", label: "Elegant rounded" },
  { id: "playful", label: "Pill shape" },
]

/**
 * Each option renders the real card style — same `getCardStyle` helper the
 * live preview and the public page use — instead of a text label standing
 * in for what the choice actually looks like.
 */
export function CardStylePicker({
  value,
  accent,
  onChange,
}: {
  value: BioPageTheme["style"]
  accent: string
  onChange: (style: BioPageTheme["style"]) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPTIONS.map((option) => {
        const card = getCardStyle(option.id, { text: "#1c1712" })
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border p-4 transition-colors",
              active
                ? "border-brand bg-brand/5"
                : "border-border hover:border-foreground/25 hover:bg-subtle"
            )}
          >
            <div
              className={cn("flex h-9 w-20 items-center justify-center text-[11px] font-medium text-white", card.className)}
              style={{ backgroundColor: accent, ...card.style }}
            >
              Link
            </div>
            <span
              className={cn(
                "text-[13px] font-medium",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
