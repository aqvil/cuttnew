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
  CheckCircle2,
  Sparkles,
  Search,
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

  const [searchQuery, setSearchQuery] = useState("yourbrnd.co")
  const [activeTab, setActiveTab] = useState<"search" | "ai">("search")

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
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Bitly Style Hero Branding Banner (Attachment 2) */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
          Brand your links with a custom domain
        </h1>

        {/* Feature Callout Cyan Box */}
        <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-left flex flex-col md:flex-row items-center gap-6 shadow-sm">
          {/* Left Diagram Illustration */}
          <div className="bg-card border border-border p-4 rounded-xl space-y-2 shrink-0 w-52 text-xs font-mono shadow-sm">
            <div className="p-2 rounded bg-muted/60 text-muted-foreground truncate border border-border/50">
              bit.ly/2BN6kd
            </div>
            <div className="p-2 rounded bg-primary/10 text-primary font-bold truncate border border-primary/30 flex items-center justify-between">
              <span>yourbrnd.co/link</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            </div>
          </div>

          {/* Right Feature List */}
          <div className="space-y-2 text-xs font-mono text-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <span>Replace default short domains in your links with your own unique domain</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <span>Help people recognize and trust your links</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <span>Build brand awareness and get up to 2.3x times more clicks</span>
            </div>
          </div>
        </div>

        {/* Domain Search Controls */}
        <div className="space-y-4 pt-2">
          {/* Tab Selector */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold border transition-all ${
                activeTab === "search"
                  ? "bg-card text-foreground border-border shadow-sm"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              <Search className="w-3 h-3 inline mr-1.5" /> Search for a domain
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold border transition-all ${
                activeTab === "ai"
                  ? "bg-card text-foreground border-border shadow-sm"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1.5 text-teal-500" /> Find a domain with AI
            </button>
          </div>

          {/* Search Box Input */}
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try entering your brand or product name"
                className="pl-9 h-11 font-mono text-xs"
              />
            </div>
            <Button
              onClick={() => {
                setDomainName(searchQuery)
                setIsDomainOpen(true)
              }}
              className="h-11 px-6 font-mono text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Search
            </Button>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground">Try entering your brand or product name (0/32)</p>
        </div>
      </div>

      {/* Existing Domains Section */}
      <div className="space-y-6 pt-8 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground font-mono">Connected Custom Domains</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Connect up to 99 branded custom domains and manage up to 15 tracking script headers per domain.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isHeaderOpen} onOpenChange={setIsHeaderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-mono gap-1.5">
                  <Code className="size-3.5" /> Global Header
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
                      className="h-10 text-xs font-mono"
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
                <Button size="sm" className="h-9 px-4 font-mono font-bold text-xs gap-1.5">
                  <Plus className="size-3.5" />
                  Connect Domain
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
                      className="h-10 text-xs font-mono"
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

        {/* Domains List */}
        <div className="space-y-2">
          {domains.map((d: any) => (
            <div
              key={d.id}
              className="border border-border bg-card rounded-xl p-4 transition-all duration-150 hover:border-foreground/30 flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-sm font-mono truncate">{d.domain}</h3>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Active</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
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
            <div className="py-12 text-center border border-dashed border-border rounded-xl bg-card/40">
              <Globe className="size-8 text-muted-foreground/40 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground font-mono">No custom domains connected</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Connect your custom domain name for branded short links.</p>
              <Button onClick={() => setIsDomainOpen(true)} size="sm" className="mt-4 h-9 px-4 text-xs font-semibold">
                <Plus className="mr-1.5 size-3.5" /> Connect Custom Domain
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
