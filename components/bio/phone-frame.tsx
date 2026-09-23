import type { ReactNode } from "react"

/**
 * The device chrome used everywhere a bio page previews live — the editor
 * and the "create" flow both render inside this, so the preview reads the
 * same wherever it appears. A thin ink bezel and a pill-shaped island read
 * as a current device; the previous chunky 8px border and full-width bar
 * read as a 2015-era phone mockup.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[280px] shrink-0 rounded-[2.5rem] bg-foreground p-2 shadow-[0_24px_48px_-16px_rgb(28_23_18_/_0.4)]">
      <div className="relative h-[580px] overflow-hidden rounded-[2rem] bg-card">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-2.5">
          <div className="h-[20px] w-[80px] rounded-full bg-foreground" />
        </div>
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
