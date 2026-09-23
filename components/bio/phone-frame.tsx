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
    <div className="relative w-[300px] shrink-0">
      <div className="relative rounded-[2.75rem] bg-foreground p-[3px] shadow-[0_30px_60px_-20px_rgb(28_23_18_/_0.45)]">
        <div className="rounded-[2.6rem] bg-foreground p-2">
          <div className="relative h-[620px] overflow-hidden rounded-[2.25rem] bg-card">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-2.5">
              <div className="h-[22px] w-[90px] rounded-full bg-foreground" />
            </div>
            <div className="h-full overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
      {/* Side buttons, for the object-ness of it. */}
      <div className="absolute -left-[2px] top-24 h-8 w-[3px] rounded-l-full bg-foreground/70" />
      <div className="absolute -left-[2px] top-36 h-14 w-[3px] rounded-l-full bg-foreground/70" />
      <div className="absolute -right-[2px] top-32 h-16 w-[3px] rounded-r-full bg-foreground/70" />
    </div>
  )
}
