'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Code2,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SectionHeader } from "@/components/app/page-header"
import { EmptyState } from "@/components/app/empty-state"
import { CopyButton } from "@/components/app/copy-button"
import {
  addCustomDomain,
  addGlobalTrackingHeader,
  deleteCustomDomain,
  deleteGlobalTrackingHeader,
  verifyCustomDomain,
} from "@/app/actions/domains"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

interface DomainRow {
  id: string
  domain: string
  status: string | null
  verifiedAt: Date | null
  createdAt: Date | null
}

interface HeaderRow {
  id: string
  name: string
  isActive: boolean | null
  createdAt: Date | null
}

/**
 * Custom domains and global tracking scripts.
 *
 * The setup instructions are the product here: a domain that says "Active"
 * without a verified DNS record is worse than no domain page at all, because
 * the user will hand out links that don't resolve.
 */
export function DomainsClient({
  domains,
  headers,
  appHost,
  canConnect,
  planName,
  maxDomains,
  tokens,
}: {
  domains: DomainRow[]
  headers: HeaderRow[]
  appHost: string
  canConnect: boolean
  planName: string
  maxDomains: number
  tokens: Record<string, string>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [domainOpen, setDomainOpen] = useState(false)
  const [domainInput, setDomainInput] = useState("")
  const [domainError, setDomainError] = useState<string | null>(null)

  const [headerOpen, setHeaderOpen] = useState(false)
  const [headerName, setHeaderName] = useState("")
  const [headerScript, setHeaderScript] = useState("")
  const [headerError, setHeaderError] = useState<string | null>(null)

  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const handleAddDomain = () => {
    setDomainError(null)
    startTransition(async () => {
      const result = await addCustomDomain(domainInput)
      if (!result.ok) {
        setDomainError(result.error)
        return
      }
      setDomainOpen(false)
      setDomainInput("")
      toast.success("Domain added. Add the DNS record to verify it.")
      router.refresh()
    })
  }

  const handleVerify = (id: string) => {
    setVerifyingId(id)
    startTransition(async () => {
      const result = await verifyCustomDomain(id)
      setVerifyingId(null)
      if (!result.ok) {
        toast.error(result.error, { duration: 8000 })
        return
      }
      toast.success("Domain verified.")
      router.refresh()
    })
  }

  const handleDeleteDomain = (id: string, domain: string) => {
    startTransition(async () => {
      const result = await deleteCustomDomain(id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`${domain} disconnected.`)
      router.refresh()
    })
  }

  const handleAddHeader = () => {
    setHeaderError(null)
    startTransition(async () => {
      const result = await addGlobalTrackingHeader(headerName, headerScript)
      if (!result.ok) {
        setHeaderError(result.error)
        return
      }
      setHeaderOpen(false)
      setHeaderName("")
      setHeaderScript("")
      toast.success("Tracking script saved.")
      router.refresh()
    })
  }

  return (
    <div className={cn("space-y-12", isPending && "opacity-70")}>
      <section>
        <SectionHeader
          title="Custom domains"
          description={`Serve short links from your own domain instead of ${appHost}.`}
          actions={
            canConnect ? (
              <Button
                size="sm"
                onClick={() => setDomainOpen(true)}
                disabled={domains.length >= maxDomains}
              >
                <Plus className="size-4" aria-hidden="true" />
                Connect domain
              </Button>
            ) : null
          }
        />

        {!canConnect ? (
          <div className="flex items-start gap-3 rounded-lg border border-border bg-subtle p-4 text-sm">
            <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-medium">
                Custom domains aren&apos;t included in the {planName} plan
              </p>
              <p className="text-muted-foreground">
                Branded links help people recognise and trust what you share.{" "}
                <Link href="/dashboard/billing" className="link-brand font-medium">
                  See plans
                </Link>
              </p>
            </div>
          </div>
        ) : domains.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No custom domains connected"
            description="Point a domain you own at Cuttly, and your short links become yourbrand.com/l/abc123 instead of the default."
            action={
              <Button onClick={() => setDomainOpen(true)}>
                <Plus className="size-4" aria-hidden="true" />
                Connect a domain
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {domains.map((domain) => {
              const verified = domain.status === "active" && domain.verifiedAt
              return (
                <li key={domain.id} className="rounded-lg border border-border bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-mono text-sm font-medium">
                          {domain.domain}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-5 gap-1 text-[11px]",
                            verified
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-warning/30 bg-warning/10 text-warning"
                          )}
                        >
                          {verified ? (
                            <CheckCircle2 className="size-3" aria-hidden="true" />
                          ) : (
                            <Clock className="size-3" aria-hidden="true" />
                          )}
                          {verified ? "Verified" : "Pending verification"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {verified
                          ? `Verified ${formatDate(domain.verifiedAt)}`
                          : `Added ${formatDate(domain.createdAt)}`}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {!verified ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(domain.id)}
                          disabled={verifyingId === domain.id}
                        >
                          {verifyingId === domain.id ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <RefreshCw className="size-4" aria-hidden="true" />
                          )}
                          Check DNS
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteDomain(domain.id, domain.domain)}
                        aria-label={`Disconnect ${domain.domain}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  {!verified ? (
                    <div className="space-y-3 border-t border-border bg-subtle p-4">
                      <p className="text-sm font-medium">Finish setup in two steps</p>

                      <DnsRecord
                        step={1}
                        description="Prove you own the domain."
                        type="TXT"
                        name={`_cuttly-verify.${domain.domain}`}
                        value={tokens[domain.id] ?? ""}
                      />

                      <DnsRecord
                        step={2}
                        description="Point the domain at Cuttly so links resolve."
                        type="CNAME"
                        name={domain.domain}
                        value={appHost}
                      />

                      <p className="text-xs text-muted-foreground">
                        DNS changes usually apply within minutes but can take up to an hour.
                        Press <strong className="font-medium text-foreground">Check DNS</strong>{" "}
                        once you&apos;ve added the TXT record.
                      </p>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}

        {canConnect ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {domains.length} of {maxDomains} domain{maxDomains === 1 ? "" : "s"} on the{" "}
            {planName} plan.
          </p>
        ) : null}
      </section>

      <section className="border-t border-border pt-10">
        <SectionHeader
          title="Tracking scripts"
          description="Scripts stored here can be attached to links that show an interstitial before redirecting."
          actions={
            <Button variant="outline" size="sm" onClick={() => setHeaderOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Add script
            </Button>
          }
        />

        {headers.length === 0 ? (
          <EmptyState
            icon={Code2}
            title="No tracking scripts"
            description="Store an analytics or retargeting snippet once, then attach it to the links that need it."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {headers.map((header) => (
              <li key={header.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{header.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {formatDate(header.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${header.name}`}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteGlobalTrackingHeader(header.id)
                      if (!result.ok) {
                        toast.error(result.error)
                        return
                      }
                      toast.success("Script deleted.")
                      router.refresh()
                    })
                  }
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add domain */}
      <Dialog open={domainOpen} onOpenChange={setDomainOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect a custom domain</DialogTitle>
            <DialogDescription>
              Use a subdomain you control, like <code className="font-mono">links.yourbrand.com</code>.
              We&apos;ll give you the DNS records to add next.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="domain-input">Domain</Label>
            <Input
              id="domain-input"
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              placeholder="links.yourbrand.com"
              autoFocus
              className="h-10 font-mono"
            />
            {domainError ? (
              <p role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {domainError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDomainOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDomain} disabled={isPending || !domainInput.trim()}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Add domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add tracking script */}
      <Dialog open={headerOpen} onOpenChange={setHeaderOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a tracking script</DialogTitle>
            <DialogDescription>
              Stored for later use on links that show an interstitial. Only add scripts you
              trust — they run in your visitors&apos; browsers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="header-name">Name</Label>
              <Input
                id="header-name"
                value={headerName}
                onChange={(event) => setHeaderName(event.target.value)}
                placeholder="GA4 measurement"
                maxLength={80}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="header-script">Script</Label>
              <Textarea
                id="header-script"
                value={headerScript}
                onChange={(event) => setHeaderScript(event.target.value)}
                rows={6}
                placeholder="<script>…</script>"
                className="font-mono text-xs"
              />
            </div>

            {headerError ? (
              <p role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {headerError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHeaderOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddHeader}
              disabled={isPending || !headerName.trim() || !headerScript.trim()}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Save script
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DnsRecord({
  step,
  description,
  type,
  name,
  value,
}: {
  step: number
  description: string
  type: string
  name: string
  value: string
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="mb-2 text-xs font-medium">
        <span className="mr-1.5 inline-flex size-4 items-center justify-center rounded-full bg-secondary text-[10px] tabular">
          {step}
        </span>
        {description}
      </p>

      <dl className="grid gap-2 text-xs sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <dt className="sr-only">Record type</dt>
        <dd>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-medium">{type}</span>
        </dd>

        <dt className="sr-only">Name</dt>
        <dd className="min-w-0 truncate font-mono text-muted-foreground">{name}</dd>

        <dd className="sm:col-span-3">
          <div className="flex items-center gap-2 rounded border border-border bg-subtle px-2 py-1.5">
            <code className="min-w-0 flex-1 truncate font-mono text-[11px]">{value}</code>
            <CopyButton
              value={value}
              variant="ghost"
              size="icon-sm"
              iconOnly
              label="Copy record value"
              successMessage="Record value copied"
            />
          </div>
        </dd>
      </dl>
    </div>
  )
}
