import type { CSSProperties } from "react"
import type { BioPageTheme } from "@/lib/types/database"

/**
 * Translates the editor's "Card Style" choice into real, shared rendering —
 * used by both the client-side editor preview (`BioPreview`) and the public
 * page's server-rendered blocks (`app/p/[slug]/page.tsx`), so what a page
 * owner picks is what a visitor actually sees. Previously `theme.style` was
 * saved but never read anywhere, so every style produced an identical card.
 */
export type CardStyle = BioPageTheme["style"]

export interface CardStyleResult {
  className: string
  style: CSSProperties
}

export function getCardStyle(
  cardStyle: CardStyle | undefined,
  theme: Pick<BioPageTheme, "text">
): CardStyleResult {
  const borderColor = `${theme.text}26`

  switch (cardStyle) {
    case "bold":
      // The one deliberate hard-offset shadow in the product — a named,
      // user-chosen "Bold Shadow" option, not a default anyone stumbles into.
      return {
        className: "rounded-lg border-2",
        style: {
          borderColor: theme.text,
          boxShadow: `4px 4px 0 0 ${theme.text}`,
        },
      }
    case "elegant":
      return {
        className: "rounded-3xl shadow-lg",
        style: {},
      }
    case "playful":
      return {
        className: "rounded-full shadow-sm",
        style: {},
      }
    case "minimal":
    default:
      return {
        className: "rounded-md border",
        style: { borderColor },
      }
  }
}
