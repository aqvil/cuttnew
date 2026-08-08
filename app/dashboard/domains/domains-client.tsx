'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addCustomDomain, addDomainTrackingHeader, addGlobalTrackingHeader, deleteCustomDomain } from "@/app/actions/domains"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Globe,
  Plus,
  CheckCircle2,
  Code,
  ShieldCheck,
  Server,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Terminal,
  FileCode,
} from "lucide-react"
import { toast } from "sonner"

interface DomainsClientProps {
  initialDomains: any[]
  initialGlobalHeaders: any[]
}

export function DomainsClient({ initialDomains, initialGlobalHeaders }: DomainsClientProps) {
  const [domains, setDomains] = useState(initialDomains)
  const [globalHeaders, setGlobalHeaders] = useState(initialGlobalHeaders)

  const [isDomainOpen, setIsDomainOpen] = useState(false)
  const [domainName, setDomainName] = useState("")
  const [isAddingDomain, setIsAddingDomain] = useState(false)

  const [isHeaderOpen, setIsHeaderOpen] = useState(false)
  const [headerName, setHeaderName] = useState("")
  const [headerScript, setHeaderScript] = useState("")
  const [isAddingHeader, setIsAddingHeader] = useState(false)

  const router = useRouter()

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainName) {
      toast.error("Domain name is required")
      return
    }

    setIsAddingDomain(true)
    try {
      const newDomain = await addCustomDomain(domainName)
      setDomains([newDomain, ...domains])
      toast.success("Branded domain added! Configure CNAME DNS records.")
      setIsDomainOpen(false)
      setDomainName("")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to add custom domain")
    } finally {
      setIsAddingDomain(false)
    }
  }

  const handleAddGlobalHeader = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!headerName || !headerScript) {
      toast.error("Header name and script content are required")
      return
    }

    setIsAddingHeader(true)
    try {
      const newHeader = await addGlobalTrackingHeader(headerName, headerScript)
      setGlobalHeaders([newHeader, ...globalHeaders])
      toast.success("Global tracking HEADER script added!")
      setIsHeaderOpen(false)
      setHeaderName("")
      setHeaderScript("")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to add tracking header")
    } finally {
      setIsAddingHeader(false)
    }
  }

  const handleDeleteDomain = async (id: string) => {
    try {
      await deleteCustomDomain(id)
      setDomains(domains.filter((d) => d.id !== id))
      toast.success("Domain removed")
      router.refresh()
    } catch {
      toast.error("Failed to delete domain")
    }
  }

  return (
    <div className="dash-narrow space-y-10">
      {/* Hero Banner */}
      <div className="dash-hero relative overflow-hidden bg-gradient-to-br from-card via-card to-blue-500/5 border border-border p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-left">
            <div className="dash-kicker text-blue-500 bg-blue-500/10 border-blue-500/20">
              <Sparkles className="size-3.5" /> Branded Domains & Scripts
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Branded Domains Studio
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Connect up to 99 branded custom domains and manage up to 15 tracking script headers per domain (99 for 2s.ms domain).
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Dialog open={isHeaderOpen} onOpenChange={setIsHeaderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 font-semibold">
                  <Code className="size-4" /> Global Script (2s.ms)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileCode className="size-5 text-blue-500" /> Add Global Tracking HEADER
                  </DialogTitle>
                  <DialogDescription>
                    Inject custom tracking scripts into short links on 2s.ms (Max 99).
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddGlobalHeader} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Script Name</Label>
                    <Input
                      placeholder="e.g. Google Analytics 4 Header"
                      value={headerName}
                      onChange={(e) => setHeaderName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">JS / HTML Script Code</Label>
                    <Textarea
                      placeholder="<script>...</script>"
                      value={headerScript}
                      onChange={(e) => setHeaderScript(e.target.value)}
                      rows={5}
                      className="font-mono text-xs"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsHeaderOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isAddingHeader} className="btn-primary">Add Header Script</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDomainOpen} onOpenChange={setIsDomainOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="btn-primary gap-2 shadow-lg hover:shadow-xl font-semibold">
                  <Plus className="size-5" /> Add Branded Domain
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Globe className="size-5 text-primary" /> Connect Custom Domain
                  </DialogTitle>
                  <DialogDescription>
                    Add custom subdomains or apex domains for short links (Max 99).
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddDomain} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Domain Name</Label>
                    <Input
                      placeholder="e.g. links.yourbrand.com"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="p-3 bg-muted/60 border border-border rounded-xl text-xs space-y-1.5">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <Terminal className="size-3.5 text-primary" /> DNS Setup Instructions:
                    </p>
                    <p className="text-muted-foreground font-mono">Type: CNAME | Host: links | Value: cname.2s.ms</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDomainOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isAddingDomain} className="btn-primary">Add Domain</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="size-3.5 text-blue-500" /> Custom Domains
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">{domains.length} <span className="text-xs text-muted-foreground font-normal">/ 99</span></p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Code className="size-3.5 text-emerald-500" /> Global Headers
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">{globalHeaders.length} <span className="text-xs text-muted-foreground font-normal">/ 99</span></p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-amber-500" /> SSL Status
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">Active</p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Server className="size-3.5 text-purple-500" /> Header Limit / Domain
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">15 / Domain</p>
        </div>
      </div>

      {/* Branded Custom Domains Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Branded Custom Domains</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((d: any) => (
            <div key={d.id} className="group bg-card border border-border hover:border-blue-500/40 rounded-2xl p-6 transition-all shadow-md hover:shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Globe className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{d.domain}</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 mt-0.5">
                      <CheckCircle2 className="size-3" /> SSL Verified
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDomain(d.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Code className="size-3.5 text-primary" /> {(d.trackingHeaders?.length || 0)} / 15 tracking headers
                </span>
                <span className="font-mono text-[10px] uppercase bg-muted px-2 py-0.5 rounded">CNAME</span>
              </div>
            </div>
          ))}

          {domains.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
              <Globe className="size-12 text-muted-foreground/40 mx-auto mb-3 animate-float" />
              <h3 className="text-lg font-bold text-foreground">No Custom Domains Connected</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Build brand authority by shortening links on your custom domain name.
              </p>
              <Button onClick={() => setIsDomainOpen(true)} className="btn-primary mt-6 gap-2">
                <Plus className="size-4" /> Add Branded Domain
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Global 2s.ms Domain Scripts */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h2 className="text-lg font-bold text-foreground">Global 2s.ms Domain Tracking Headers ({globalHeaders.length}/99)</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalHeaders.map((gh: any) => (
            <div key={gh.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Code className="size-4 text-blue-500" />
                {gh.name}
              </h4>
              <p className="text-xs font-mono text-muted-foreground line-clamp-2 bg-muted p-2 rounded-lg">
                {gh.script}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
