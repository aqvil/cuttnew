"use client";

import { useState } from "react";
import { deleteDomainAdminAction } from "@/app/actions/admin";
import { Globe, Trash2, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DomainItem {
  id: string;
  domain: string;
  status: string | null;
  verifiedAt: Date | null;
  createdAt: Date | null;
  userId: string | null;
}

export function AdminDomainsClient({ initialDomains }: { initialDomains: DomainItem[] }) {
  const [domains, setDomains] = useState(initialDomains);

  const handleDeleteDomain = async (id: string) => {
    try {
      await deleteDomainAdminAction(id);
      setDomains(domains.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 border-b border-border text-xs font-mono uppercase text-muted-foreground">
            <tr>
              <th className="p-4 font-semibold">Branded Domain</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Verified Date</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {domains.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-xs font-mono text-muted-foreground">
                  No custom domains registered yet.
                </td>
              </tr>
            ) : (
              domains.map((domain) => (
                <tr key={domain.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono font-bold">
                    <a
                      href={`https://${domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1.5 text-foreground"
                    >
                      <Globe className="w-3.5 h-3.5 text-primary" /> {domain.domain}
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> {domain.status || "active"}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-xs text-muted-foreground">
                    {domain.verifiedAt ? new Date(domain.verifiedAt).toLocaleDateString() : "—"}
                  </td>

                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDomain(domain.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive font-mono text-xs gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
