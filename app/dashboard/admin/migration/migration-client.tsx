"use client";

import { useState } from "react";
import { triggerLegacyMigrationAction } from "@/app/actions/admin";
import {
  Database,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Link2,
  Globe,
  BarChart3,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminMigrationClient() {
  const [sqlPath, setSqlPath] = useState("import-legacy.sql");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunMigration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await triggerLegacyMigrationAction(sqlPath);
      if (res.success) {
        setResult(res.stats);
      } else {
        setError(res.error || "Migration failed");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error occurred during migration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Import Configuration Card */}
      <div className="p-6 rounded-xl border border-border bg-card/40 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Legacy Database SQL File Runner</h3>
            <p className="text-xs text-muted-foreground font-mono">
              Parses MySQL/MariaDB export dumps (`import-legacy.sql`) and populates users, links, custom domains, and analytics.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-muted-foreground uppercase">
              SQL File Path (Relative or Absolute)
            </label>
            <Input
              value={sqlPath}
              onChange={(e) => setSqlPath(e.target.value)}
              placeholder="import-legacy.sql"
              className="font-mono text-xs"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Default detects `import-legacy.sql` in the application root folder.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <Button
              onClick={handleRunMigration}
              disabled={loading || !sqlPath.trim()}
              className="font-mono text-xs gap-2 min-w-[180px]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Importing SQL Dump...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start SQL Migration
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Error Notification */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold font-mono">Migration Failed</h4>
            <p className="mt-1 font-mono text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Migration Stats Result */}
      {result && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <h4 className="font-bold font-mono">Legacy Migration Completed Successfully!</h4>
                <p className="text-xs text-emerald-400 font-mono">
                  All accounts, links, domains, and redirect analytics have been imported into the active PostgreSQL database.
                </p>
              </div>
            </div>
            <div className="font-mono text-xs text-emerald-400 shrink-0 flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              <Clock className="w-3.5 h-3.5" /> {(result.durationMs / 1000).toFixed(2)}s
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-border bg-card/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Users Imported</span>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-mono font-bold mt-2">{result.usersCount.toLocaleString()}</div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Links Imported</span>
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-mono font-bold mt-2">{result.linksCount.toLocaleString()}</div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Domains Imported</span>
                <Globe className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-mono font-bold mt-2">{result.domainsCount.toLocaleString()}</div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Click Events</span>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-mono font-bold mt-2">{result.clicksCount.toLocaleString()}</div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="p-5 rounded-xl border border-border bg-card/30 space-y-3">
              <h4 className="font-bold text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Migration Notice Log ({result.errors.length} notices)
              </h4>
              <div className="font-mono text-xs text-muted-foreground bg-background p-4 rounded-lg border border-border/60 max-h-48 overflow-y-auto space-y-1">
                {result.errors.map((err: string, idx: number) => (
                  <div key={idx} className="truncate">{err}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
