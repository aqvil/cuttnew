import { ArrowUpRight, Radio } from "lucide-react"

export function GamePromoPanel() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-md border border-border bg-card p-8 sm:p-10">
      <div>
        <div className="mb-8 inline-flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">
          <Radio className="size-3" />
          Featured game
        </div>

        <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-[0.02em] text-foreground sm:text-5xl">
          Tactical
          <br />
          Terminal
        </h2>

        <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
          A browser-based tactical ops RPG. Recruit your squad, run PvE campaigns,
          and climb the ranks — no download required.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-sm border border-border bg-background p-4">
            <div className="text-[10px] font-bold uppercase tracking-[1px] text-muted-foreground">Genre</div>
            <div className="mt-1 text-sm font-semibold text-foreground">Tactical PvE RPG</div>
          </div>
          <div className="rounded-sm border border-border bg-background p-4">
            <div className="text-[10px] font-bold uppercase tracking-[1px] text-muted-foreground">Access</div>
            <div className="mt-1 text-sm font-semibold text-foreground">Free to play</div>
          </div>
        </div>
      </div>

      <a
        href="https://tacterm.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold uppercase tracking-[1px] text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
      >
        Play Tactical Terminal
        <ArrowUpRight className="size-4" />
      </a>
    </div>
  )
}
