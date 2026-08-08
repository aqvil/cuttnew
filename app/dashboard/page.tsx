import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { QuickLinkForm } from "@/components/dashboard/quick-link-form"
import { CheckCircle2, ArrowRight, Chrome } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Dashboard - Cuttly",
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto space-y-5 p-4 sm:p-6 font-mono text-foreground">
      {/* Quick Create Box */}
      <QuickLinkForm />

      {/* Bottom Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left Box: Connect your account */}
        <div className="p-5 rounded-[3px] border border-border bg-card space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Connect your account</h2>
            <Link href="/dashboard/settings" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              Explore Integrations <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="text-xs font-semibold text-muted-foreground uppercase">
            Recommended for you
          </div>

          <div className="space-y-3">
            {/* Chrome Extension */}
            <div className="p-3.5 rounded-[3px] border border-border bg-muted/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[3px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Chrome className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="font-bold text-xs text-foreground">Chrome Extension</div>
                <div className="text-[11px] text-muted-foreground truncate">Instant links and QR codes from anywhere</div>
              </div>
            </div>

            {/* Canva */}
            <div className="p-3.5 rounded-[3px] border border-border bg-muted/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[3px] bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <span className="font-bold text-sky-500 text-xs">Canva</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="font-bold text-xs text-foreground">Canva</div>
                <div className="text-[11px] text-muted-foreground truncate">Popular pick in productivity and design</div>
              </div>
            </div>

            {/* Shopify */}
            <div className="p-3.5 rounded-[3px] border border-border bg-muted/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[3px] bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <span className="font-bold text-green-600 text-xs">Shop</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-foreground">Shopify</span>
                  <span className="px-1.5 py-0.2 rounded-[2px] bg-primary/10 text-primary text-[9px] font-bold">NEW</span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate">Connect marketing activity to revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Box: Do more with Cuttly */}
        <div className="p-5 rounded-[3px] border border-border bg-card space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Do more with Cuttly</h2>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              100% <span className="w-3 h-3 rounded-full border-2 border-emerald-500 border-t-transparent inline-block" />
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>QR Code created</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Custom domains discovered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
