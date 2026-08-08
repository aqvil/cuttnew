import { AdminMigrationClient } from "./migration-client";
import { Database, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMigrationPage() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
            <Shield className="w-3 h-3" /> ADMIN SYSTEM CONTROL
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Legacy App Database Migration</h1>
        <p className="text-sm text-muted-foreground">
          Import legacy MariaDB/MySQL exports (`import-legacy.sql`) containing users, short links, domain names, and click analytics.
        </p>
      </div>

      <AdminMigrationClient />
    </div>
  );
}
