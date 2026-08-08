import { getAdminOverviewStats } from "@/app/actions/admin";
import Link from "next/link";
import {
  Shield,
  Users,
  Link2,
  BarChart3,
  Globe,
  UserX,
  Database,
  ArrowRight,
  Settings,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
              <Shield className="w-3 h-3" /> ADMIN SYSTEM CONTROL
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Super Admin Operations</h1>
          <p className="text-sm text-muted-foreground">
            Complete platform command center, user management, content moderation, and database migration tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/migration">
            <Button variant="outline" size="sm" className="font-mono text-xs gap-2">
              <Database className="w-3.5 h-3.5" /> Run SQL Importer
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button size="sm" className="font-mono text-xs gap-2">
              <Users className="w-3.5 h-3.5" /> Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card/40 hover:bg-card/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Total Users</span>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-mono font-bold mt-2">{stats.totalUsers.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Platform registered accounts</div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card/40 hover:bg-card/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Short Links</span>
            <Link2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-mono font-bold mt-2">{stats.totalLinks.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Created redirect URLs</div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card/40 hover:bg-card/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Total Clicks</span>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-mono font-bold mt-2">{stats.totalClicks.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Logged redirect events</div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card/40 hover:bg-card/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Custom Domains</span>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-mono font-bold mt-2">{stats.totalDomains.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Active branded domains</div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card/40 hover:bg-card/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Banned Accounts</span>
            <UserX className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-2xl font-mono font-bold mt-2 text-destructive">{stats.bannedUsers}</div>
          <div className="text-xs text-muted-foreground mt-1">Restricted access users</div>
        </div>
      </div>

      {/* Admin Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/admin/users" className="group">
          <div className="p-6 rounded-xl border border-border bg-card/30 hover:border-foreground/30 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-4 bg-background group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">User Directory & Roles</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View all registered accounts, toggle admin roles, ban problematic users, or view account profiles.
              </p>
            </div>
            <div className="flex items-center text-xs font-mono text-muted-foreground group-hover:text-foreground mt-4 pt-4 border-t border-border/50">
              Open Directory <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/admin/links" className="group">
          <div className="p-6 rounded-xl border border-border bg-card/30 hover:border-foreground/30 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-4 bg-background group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Link2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Link Moderation Hub</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Inspect, disable, edit target URLs, or purge dangerous links across the entire platform.
              </p>
            </div>
            <div className="flex items-center text-xs font-mono text-muted-foreground group-hover:text-foreground mt-4 pt-4 border-t border-border/50">
              Moderate Links <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/admin/migration" className="group">
          <div className="p-6 rounded-xl border border-border bg-card/30 hover:border-foreground/30 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-4 bg-background group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Legacy App SQL Importer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Migrate legacy application database dumps (`import-legacy.sql`) into the current platform.
              </p>
            </div>
            <div className="flex items-center text-xs font-mono text-muted-foreground group-hover:text-foreground mt-4 pt-4 border-t border-border/50">
              Launch Importer <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="p-6 rounded-xl border border-border bg-card/30">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <h3 className="font-bold text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" /> Recently Joined Users
            </h3>
            <Link href="/dashboard/admin/users" className="text-xs font-mono text-muted-foreground hover:text-foreground">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 text-sm">
                <div>
                  <div className="font-medium">{user.name || "Unnamed"}</div>
                  <div className="text-xs text-muted-foreground font-mono">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase px-2 py-0.5 rounded border border-border bg-muted/40">
                    {user.role}
                  </span>
                  {user.bannedAt && (
                    <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                      Banned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Links */}
        <div className="p-6 rounded-xl border border-border bg-card/30">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <h3 className="font-bold text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground" /> Recent Short Links
            </h3>
            <Link href="/dashboard/admin/links" className="text-xs font-mono text-muted-foreground hover:text-foreground">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 text-sm">
                <div className="min-w-0 pr-4">
                  <div className="font-mono font-bold text-primary">/l/{link.shortCode}</div>
                  <div className="text-xs text-muted-foreground truncate">{link.originalUrl}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-muted-foreground">
                    {link.clickCount} clicks
                  </span>
                  <span className={`w-2 h-2 rounded-full ${link.isActive ? "bg-emerald-500" : "bg-destructive"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
