"use client";

import { useState } from "react";
import {
  getAdminLinks,
  toggleLinkActiveAdminAction,
  deleteLinkAdminAction,
} from "@/app/actions/admin";
import {
  Link2,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface LinkItem {
  id: string;
  shortCode: string;
  customSlug: string | null;
  originalUrl: string;
  title: string | null;
  clickCount: number | null;
  isActive: boolean | null;
  expiresAt: Date | null;
  createdAt: Date | null;
  userId: string | null;
}

export function AdminLinksClient({
  initialData,
}: {
  initialData: {
    links: LinkItem[];
    total: number;
    totalPages: number;
    page: number;
  };
}) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchLinks = async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await getAdminLinks({ page: p, query: q });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLinks(1, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchLinks(newPage, search);
  };

  const handleToggleActive = async (link: LinkItem) => {
    try {
      await toggleLinkActiveAdminAction(link.id, !link.isActive);
      await fetchLinks(data.page, search);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLink = async () => {
    if (!selectedLink) return;
    try {
      await deleteLinkAdminAction(selectedLink.id);
      setDeleteModalOpen(false);
      setSelectedLink(null);
      await fetchLinks(data.page, search);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, title, or original destination URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-mono text-xs"
          />
        </form>

        <div className="text-xs font-mono text-muted-foreground">
          Total <span className="text-foreground font-bold">{data.total}</span> links across platform
        </div>
      </div>

      {/* Links Table */}
      <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs font-mono uppercase text-muted-foreground">
              <tr>
                <th className="p-4 font-semibold">Short Code</th>
                <th className="p-4 font-semibold">Destination URL</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Clicks</th>
                <th className="p-4 font-semibold">Created Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.links.map((link) => (
                <tr key={link.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono">
                    <div className="font-bold text-primary flex items-center gap-1.5">
                      /l/{link.shortCode}
                      {link.customSlug && (
                        <span className="text-xs font-normal text-muted-foreground">
                          ({link.customSlug})
                        </span>
                      )}
                    </div>
                    {link.title && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{link.title}</div>}
                  </td>

                  <td className="p-4 max-w-[320px]">
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-muted-foreground hover:text-foreground hover:underline truncate flex items-center gap-1"
                    >
                      <span className="truncate">{link.originalUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>

                  <td className="p-4">
                    {link.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-destructive/10 text-destructive border border-destructive/20">
                        <XCircle className="w-3 h-3" /> Disabled
                      </span>
                    )}
                  </td>

                  <td className="p-4 font-mono text-xs font-bold">
                    {link.clickCount || 0}
                  </td>

                  <td className="p-4 font-mono text-xs text-muted-foreground">
                    {link.createdAt ? new Date(link.createdAt).toLocaleDateString() : "—"}
                  </td>

                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 font-mono text-xs">
                        <DropdownMenuItem onClick={() => handleToggleActive(link)}>
                          {link.isActive ? "Disable Link" : "Enable Link"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedLink(link);
                            setDeleteModalOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-card/40">
            <div className="text-xs font-mono text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page <= 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page >= data.totalPages || loading}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Link Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Permanently Delete Link?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to purge short code <strong>/l/{selectedLink?.shortCode}</strong>? This action cannot be undone and link redirection will permanently stop.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLink}>
              Delete Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
