import type { ReactNode } from "react"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"

/**
 * Layout for policy documents. Constrains the measure to a comfortable reading
 * width and gives headings and lists consistent rhythm without a prose plugin.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-[68ch] px-5 py-20 sm:px-6">
          <h1 className="text-4xl font-semibold tracking-[-0.03em]">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>

          <div
            className={[
              "mt-12 space-y-6 text-[15px] leading-7 text-muted-foreground",
              "[&_h2]:mt-12 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h2]:text-foreground",
              "[&_h2:first-child]:mt-0",
              "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
              "[&_strong]:font-medium [&_strong]:text-foreground",
              "[&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline",
              "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px]",
            ].join(" ")}
          >
            {children}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
