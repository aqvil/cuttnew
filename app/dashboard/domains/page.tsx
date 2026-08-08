import { getCustomDomains, getGlobalTrackingHeaders } from "@/app/actions/domains"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Globe, Plus, Code, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function DomainsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const domains = await getCustomDomains()
  const globalHeaders = await getGlobalTrackingHeaders()

  return (
    <div className="space-y-8">
      {/* Branded domains section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Branded Custom Domains</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add up to 99 branded custom domains and attach up to 15 tracking headers per domain.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="size-4" />
            Add Custom Domain
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {domains.map((d: any) => (
            <div key={d.id} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="size-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{d.domain}</h3>
                    <p className="text-xs text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="size-3" /> Verified & Active
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Code className="size-3.5" /> {(d.trackingHeaders?.length || 0)} / 15 tracking headers
                </span>
              </div>
            </div>
          ))}

          {domains.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl">
              <Globe className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-semibold text-foreground">No branded domains added</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connect your custom domain (e.g. `links.brand.com`) for custom branded short links.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Global 2s.ms domain tracking headers section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">2s.ms Domain Tracking Headers</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add up to 99 global tracking scripts for links on the default domain.
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Plus className="size-4" />
            Add Global Header
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalHeaders.map((gh: any) => (
            <div key={gh.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Code className="size-4 text-primary" />
                {gh.name}
              </h4>
              <p className="text-xs font-mono text-muted-foreground line-clamp-2 bg-muted p-2 rounded">
                {gh.script}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
