'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Page navigation for server-paginated lists.
 *
 * Keeps every existing search parameter so paging never silently drops the
 * user's filters.
 */
export function PaginationControls({
  page,
  totalPages,
  total,
  pageSize,
  itemLabel = "items",
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  itemLabel?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goTo = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextPage <= 1) params.delete("page")
    else params.set("page", String(nextPage))
    router.push(`${pathname}?${params.toString()}`, { scroll: true })
  }

  const first = (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)

  return (
    <nav
      aria-label={`${itemLabel} pagination`}
      className="flex items-center justify-between gap-4 pt-1"
    >
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground tabular">{first}</span>–
        <span className="font-medium text-foreground tabular">{last}</span> of{" "}
        <span className="font-medium text-foreground tabular">{total.toLocaleString()}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground tabular">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
