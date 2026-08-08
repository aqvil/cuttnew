'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addCustomDomain, addGlobalTrackingHeader, deleteCustomDomain } from "@/app/actions/domains"
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
  Code,
  Trash2,
  Terminal,
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
      toast.success("Domain added! Configure CNAME DNS record.")
      setIsDomainOpen(false)
      setDomainName("")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to add domain")
    } finally {
      setIsAddingDomain(false)
    }
  }

  const handleAddGlobalHeader = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!headerName || !headerScript) {
      toast.error("Name and script content required")
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
      toast.error(err.message || "Failed to add header")
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
    <div className="dash-narrow space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="dash-kicker mb-2">Branded Custom Domains</div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Custom Domains & Tracking Headers
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl font-mono">
            Connect up to 99 branded custom domains and manage up to 15 tracking script headers per domain.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isHeaderOpen} onOpenChange={setIsHeaderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 px-3 text-xs font-mono gap-1.5">
                <Code className="size-3.5" /> 2s.ms Global Header
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border border-border bg-card">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground">Global Tracking HEADER</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Inject scripts into short links on default 2s.ms domain (Max 99).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGlobalHeader} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Script Name</Label>
                  <Input
                    placeholder="e.g. GA4 Header"
                    value={headerName}
                    onChange={(e) => setHeaderName(e.target.value)}
                    className="dash-field h-10 text-xs font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Script Code</Label>
                  <Textarea
                    placeholder="<script>...</script>"
                    value={headerScript}
                    onChange={(e) => setHeaderScript(e.target.value)}
                    rows={4}
                    className="font-mono text-xs border-border bg-background"
                    required
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsHeaderOpen(false)} className="h-9 text-xs">Cancel</Button>
                  <Button type="submit" disabled={isAddingHeader} size="sm" className="h-9 text-xs bg-foreground text-background font-semibold">Add Script</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDomainOpen} onOpenChange={setIsDomainOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10 px-4 bg-foreground text-background font-semibold text-xs rounded-md hover:opacity-90 transition-opacity gap-2">
                <Plus className="size-3.5" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border border-border bg-card">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground">Connect Custom Domain</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Add subdomains or apex domains (Max 99).
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddDomain} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Domain</Label>
                  <Input
                    placeholder="links.yourbrand.com"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    className="dash-field h-10 text-xs font-mono"
                    required
                  />
                </div>

                <div className="p-3 bg-muted/50 border border-border rounded-md text-xs font-mono space-y-1">
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Terminal className="size-3 text-muted-foreground" /> CNAME Setup:
                  </p>
                  <p className="text-muted-foreground">Type: CNAME | Value: cname.2s.ms</p>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsDomainOpen(false)} className="h-9 text-xs">Cancel</Button>
                  <Button type="submit" disabled={isAddingDomain} size="sm" className="h-9 text-xs bg-foreground text-background font-semibold">Add Domain</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Monochrome Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Custom Domains</p>
          <p className="text-2xl font-bold font-mono text-foreground">{domains.length} <span className="text-xs text-muted-foreground font-normal">/ 99</span></p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Global Headers</p>
          <p className="text-2xl font-bold font-mono text-foreground">{globalHeaders.length} <span className="text-xs text-muted-foreground font-normal">/ 99</span></p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Header Limit</p>
          <p className="text-2xl font-bold font-mono text-foreground">15 / Domain</p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">SSL Security</p>
          <p className="text-xs font-mono font-semibold text-foreground mt-2 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-foreground" /> Auto SSL Active
          </p>
        </div>
      </div>

      {/* Domains List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground uppercase px-1">
          <span>Connected Domains ({domains.length})</span>
          <span>Headers</span>
        </div>

        <div className="space-y-2">
          {domains.map((d: any) => (
            <div
              key={d.id}
              className="group border border-border bg-card rounded-md p-4 transition-all duration-150 hover:border-foreground/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-sm truncate">{d.domain}</h3>
                  <span className="text-[10px] font-mono uppercase bg-muted text-foreground px-2 py-0.5 rounded border border-border font-bold">CNAME</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                <span className="text-xs font-mono text-muted-foreground">{(d.trackingHeaders?.length || 0)} / 15 Headers</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteDomain(d.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {domains.length === 0 && (
            <div className="py-16 text-center border border-dashed border-border rounded-md bg-card">
              <Globe className="size-8 text-muted-foreground/40 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground font-mono">No custom domains connected</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Connect your custom domain name for branded short links.</p>
              <Button onClick={() => setIsDomainOpen(true)} size="sm" className="mt-4 h-9 px-4 text-xs font-semibold bg-foreground text-background">
                <Plus className="mr-1.5 size-3.5" /> Add Custom Domain
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Global Headers List */}
      <div className="space-y-3 pt-6 border-t border-border">
        <h2 className="text-sm font-bold font-mono uppercase text-muted-foreground">2s.ms Global Tracking Headers ({globalHeaders.length}/99)</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {globalHeaders.map((gh: any) => (
            <div key={gh.id} className="border border-border bg-card p-3 rounded-md space-y-1.5">
              <h4 className="font-semibold text-foreground text-xs font-mono flex items-center gap-1.5">
                <Code className="size-3 text-muted-foreground" /> {gh.name}
              </h4>
              <p className="text-[11px] font-mono text-muted-foreground truncate bg-muted p-2 rounded border border-border">
                {gh.script}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
