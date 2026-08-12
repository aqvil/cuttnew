'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

/**
 * Search, filter and sort controls for the links list.
 *
 * State lives in the URL, so filtering happens on the server, the browser back
 * button works, and a filtered view can be bookmarked or shared. Typing is
 * debounced and wrapped in a transition, which keeps the current results
 * visible (dimmed) while the next page streams in instead of flashing a
 * spinner over the whole list.
 */

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All links" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "clicks", label: "Most clicks" },
  { value: "title", label: "Name A–Z" },
]

export function LinksToolbar({ tags }: { tags: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get("q") ?? ""
  const [searchValue, setSearchValue] = useState(currentSearch)
  const isFirstRender = useRef(true)

  // Keep the field in step when the URL changes from elsewhere (back button,
  // "clear filters"), without clobbering what the user is typing.
  useEffect(() => {
    setSearchValue(currentSearch)
  }, [currentSearch])

  const updateParams = useMemo(
    () =>
      (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())

        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === "") params.delete(key)
          else params.set(key, value)
        }

        // Any filter change invalidates the current page number.
        if (!("page" in updates)) params.delete("page")

        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
      },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (searchValue === currentSearch) return

    const timer = setTimeout(() => updateParams({ q: searchValue || null }), 300)
    return () => clearTimeout(timer)
  }, [searchValue, currentSearch, updateParams])

  const status = searchParams.get("status") ?? "active"
  const sort = searchParams.get("sort") ?? "newest"
  const tag = searchParams.get("tag")
  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""

  const activeFilterCount = [tag, from, to].filter(Boolean).length
  const hasAnyFilter = activeFilterCount > 0 || Boolean(currentSearch) || status !== "active"

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by title, short code or destination"
            aria-label="Search links"
            className="h-9 pl-9 pr-9"
          />
          {isPending ? (
            <Loader2
              className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(value) => updateParams({ status: value })}>
            <SelectTrigger className="h-9 w-[140px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => updateParams({ sort: value })}>
            <SelectTrigger className="h-9 w-[150px]" aria-label="Sort links">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 ? (
                  <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 tabular">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filter-tag" className="text-xs font-medium">
                  Tag
                </Label>
                {tags.length > 0 ? (
                  <Select
                    value={tag ?? "__all"}
                    onValueChange={(value) =>
                      updateParams({ tag: value === "__all" ? null : value })
                    }
                  >
                    <SelectTrigger id="filter-tag" className="h-9">
                      <SelectValue placeholder="Any tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">Any tag</SelectItem>
                      {tags.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    You haven&apos;t tagged any links yet.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="filter-from" className="text-xs font-medium">
                    Created from
                  </Label>
                  <Input
                    id="filter-from"
                    type="date"
                    value={from}
                    max={to || undefined}
                    onChange={(event) => updateParams({ from: event.target.value || null })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-to" className="text-xs font-medium">
                    Created to
                  </Label>
                  <Input
                    id="filter-to"
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => updateParams({ to: event.target.value || null })}
                    className="h-9"
                  />
                </div>
              </div>

              {activeFilterCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => updateParams({ tag: null, from: null, to: null })}
                >
                  Clear filters
                </Button>
              ) : null}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasAnyFilter ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtered by</span>
          {currentSearch ? (
            <FilterChip label={`“${currentSearch}”`} onClear={() => updateParams({ q: null })} />
          ) : null}
          {status !== "active" ? (
            <FilterChip
              label={STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status}
              onClear={() => updateParams({ status: null })}
            />
          ) : null}
          {tag ? <FilterChip label={`Tag: ${tag}`} onClear={() => updateParams({ tag: null })} /> : null}
          {from ? <FilterChip label={`From ${from}`} onClear={() => updateParams({ from: null })} /> : null}
          {to ? <FilterChip label={`To ${to}`} onClear={() => updateParams({ to: null })} /> : null}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-sm"
            onClick={() =>
              updateParams({ q: null, status: null, tag: null, from: null, to: null })
            }
          >
            Reset all
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-subtle py-0.5 pl-2 pr-1 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove filter ${label}`}
        className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </span>
  )
}
