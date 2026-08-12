import Link from "next/link"
import { Globe, Link2, MousePointerClick, UserX, Users } from "lucide-react"

import { getAdminOverviewStats } from "@/app/actions/admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/app/page-header"
import { Stat, StatRow } from "@/components/app/stat"
import { fullNumber, truncateMiddle } from "@/lib/format"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin overview" }

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats()

  return (
    <div className="space-y-8">
      <StatRow className="lg:grid-cols-5">
        <Stat label="Users" value={fullNumber(stats.totalUsers)} hint="Registered accounts" />
        <Stat label="Short links" value={fullNumber(stats.totalLinks)} hint="Across all accounts" />
        <Stat label="Clicks" value={fullNumber(stats.totalClicks)} hint="Recorded redirects" />
        <Stat label="Custom domains" value={fullNumber(stats.totalDomains)} hint="Connected" />
        <Stat
          label="Suspended"
          value={fullNumber(stats.bannedUsers)}
          hint={stats.bannedUsers > 0 ? "Accounts with access revoked" : "None"}
        />
      </StatRow>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeader
            title="Newest accounts"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/admin/users">View all</Link>
              </Button>
            }
          />

          {stats.recentUsers.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No accounts yet.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {stats.recentUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.name || "Unnamed"}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {user.bannedAt ? (
                      <Badge
                        variant="outline"
                        className="h-5 border-destructive/30 bg-destructive/10 text-[11px] text-destructive"
                      >
                        Suspended
                      </Badge>
                    ) : null}
                    <Badge variant="secondary" className="h-5 text-[11px] capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader
            title="Newest links"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/admin/links">View all</Link>
              </Button>
            }
          />

          {stats.recentLinks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No links yet.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {stats.recentLinks.map((link) => (
                <li key={link.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-medium">/l/{link.shortCode}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {truncateMiddle(link.originalUrl, 52)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular text-muted-foreground">
                    {fullNumber(link.clickCount)}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      link.isActive
                        ? "h-5 border-success/30 bg-success/10 text-[11px] text-success"
                        : "h-5 border-border bg-muted text-[11px] text-muted-foreground"
                    }
                  >
                    {link.isActive ? "Active" : "Paused"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <SectionHeader title="Tools" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "/dashboard/admin/users",
              icon: Users,
              title: "User directory",
              body: "Search accounts, change roles, suspend or remove access.",
            },
            {
              href: "/dashboard/admin/links",
              icon: Link2,
              title: "Link moderation",
              body: "Inspect and disable links reported for abuse.",
            },
            {
              href: "/dashboard/admin/domains",
              icon: Globe,
              title: "Domains",
              body: "Review every custom domain connected to the platform.",
            },
            {
              href: "/dashboard/admin/migration",
              icon: MousePointerClick,
              title: "Legacy import",
              body: "Import a legacy SQL dump into this database.",
            },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/30"
            >
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-md border border-border bg-subtle text-muted-foreground"
              >
                <tool.icon className="size-4" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{tool.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{tool.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
