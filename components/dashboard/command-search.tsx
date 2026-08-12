'use client'

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Globe,
  LayoutDashboard,
  Link2,
  Loader2,
  Plus,
  QrCode,
  Search,
  Settings,
} from "lucide-react"

import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

/**
 * Global search (⌘K / Ctrl+K).
 *
 * Queries the server rather than filtering a client-side copy of the data, so
 * it finds every link the account owns regardless of how many there are.
 * Requests are debounced and the in-flight one is aborted when the term
 * changes, so fast typing can't deliver results out of order.
 */

interface SearchResult {
  id: string
  title: string | null
  shortCode: string
  shortUrl: string
  destination: string
  clicks: number
}

const NAVIGATION = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Links", href: "/dashboard/links", icon: Link2 },
  { label: "QR codes", href: "/dashboard/qr-codes", icon: QrCode },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Domains", href: "/dashboard/domains", icon: Globe },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

const ACTIONS = [
  { label: "Create a short link", href: "/dashboard/links/new", icon: Plus },
  { label: "Create a QR code", href: "/dashboard/qr-codes/new", icon: QrCode },
]

/** Simple substring match — cmdk's own filter is off while results are server-side. */
function matches(label: string, term: string) {
  return !term || label.toLowerCase().includes(term.toLowerCase())
}

export function CommandSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    const term = query.trim()

    if (term.length < 2) {
      abortRef.current?.abort()
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error("search failed")
        const data = (await response.json()) as { results: SearchResult[] }
        setResults(data.results ?? [])
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([])
      } finally {
        // A superseded request must not clear the spinner for the live one.
        if (abortRef.current === controller) setLoading(false)
      }
    }, 180)

    return () => clearTimeout(timer)
  }, [query])

  const go = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery("")
      router.push(href)
    },
    [router]
  )

  const term = query.trim()
  const actions = ACTIONS.filter((action) => matches(action.label, term))
  const pages = NAVIGATION.filter((item) => matches(item.label, term))

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-border bg-subtle px-3",
          "text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        )}
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">Search links…</span>
        <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search your links or jump to a page"
        // Results come pre-filtered from the server; filtering again locally
        // would hide matches cmdk's fuzzy scorer doesn't like.
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Search links, or type a page name…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Searching…
            </div>
          ) : null}

          {!loading &&
          term.length >= 2 &&
          results.length === 0 &&
          actions.length === 0 &&
          pages.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nothing matches “{term}”.
            </div>
          ) : null}

          {results.length > 0 ? (
            <>
              <CommandGroup heading="Links">
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => go(`/dashboard/links/${result.id}`)}
                    className="gap-3"
                  >
                    <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {result.title || result.shortUrl}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {result.destination}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular text-muted-foreground">
                      {result.clicks.toLocaleString()} clicks
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          ) : null}

          {actions.length > 0 ? (
            <CommandGroup heading="Actions">
              {actions.map((action) => (
                <CommandItem
                  key={action.href}
                  value={action.href}
                  onSelect={() => go(action.href)}
                >
                  <action.icon className="size-4" aria-hidden="true" />
                  {action.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {pages.length > 0 ? (
            <CommandGroup heading="Go to">
              {pages.map((item) => (
                <CommandItem key={item.href} value={item.href} onSelect={() => go(item.href)}>
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  )
}
