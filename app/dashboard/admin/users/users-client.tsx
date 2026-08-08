"use client";

import { useState } from "react";
import {
  getAdminUsers,
  updateUserRoleAction,
  toggleUserBanAction,
  deleteUserAdminAction,
} from "@/app/actions/admin";
import {
  Users,
  Search,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  role: string | null;
  image: string | null;
  bannedAt: Date | null;
  createdAt: Date | null;
}

export function AdminUsersClient({
  initialData,
}: {
  initialData: {
    users: UserItem[];
    total: number;
    totalPages: number;
    page: number;
  };
}) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Ban/Unban confirmation dialog
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchUsers = async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ page: p, query: q });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, search);
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "admin" | "superadmin") => {
    setActionLoading(userId);
    try {
      await updateUserRoleAction(userId, newRole);
      await fetchUsers(data.page, search);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBan = async () => {
    if (!selectedUser) return;
    setActionLoading(selectedUser.id);
    const isCurrentlyBanned = !!selectedUser.bannedAt;
    try {
      await toggleUserBanAction(selectedUser.id, !isCurrentlyBanned);
      setBanModalOpen(false);
      setSelectedUser(null);
      await fetchUsers(data.page, search);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(selectedUser.id);
    try {
      await deleteUserAdminAction(selectedUser.id);
      setDeleteModalOpen(false);
      setSelectedUser(null);
      await fetchUsers(data.page, search);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-mono text-xs"
          />
        </form>

        <div className="text-xs font-mono text-muted-foreground">
          Showing <span className="text-foreground font-bold">{data.users.length}</span> of{" "}
          <span className="text-foreground font-bold">{data.total}</span> accounts
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs font-mono uppercase text-muted-foreground">
              <tr>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Username</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.users.map((user) => {
                const isBanned = !!user.bannedAt;
                return (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-border bg-muted/60 flex items-center justify-center font-bold font-mono text-xs uppercase">
                          {user.name?.[0] || user.email?.[0] || "U"}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name || "Unnamed"}</div>
                          <div className="text-xs text-muted-foreground font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      @{user.username || "n/a"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border uppercase ${
                          user.role === "superadmin"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : user.role === "admin"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                            : "bg-muted/50 text-muted-foreground border-border"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>

                    <td className="p-4">
                      {isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-destructive/10 text-destructive border border-destructive/20">
                          <UserX className="w-3 h-3" /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>

                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 font-mono text-xs">
                          <div className="px-2 py-1.5 text-xs text-muted-foreground font-semibold uppercase">
                            Set Access Role
                          </div>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "user")}
                            disabled={user.role === "user"}
                          >
                            Set to User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "admin")}
                            disabled={user.role === "admin"}
                          >
                            Set to Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "superadmin")}
                            disabled={user.role === "superadmin"}
                          >
                            Set to Superadmin
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setBanModalOpen(true);
                            }}
                            className={isBanned ? "text-emerald-500" : "text-amber-500"}
                          >
                            {isBanned ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 mr-2" /> Revoke Ban
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5 mr-2" /> Ban User
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteModalOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
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

      {/* Ban / Unban Modal */}
      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {selectedUser?.bannedAt ? "Revoke User Ban?" : "Confirm User Ban"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.bannedAt
                ? `Restoring platform access for ${selectedUser?.email}. The user will be able to sign in and redirect links again.`
                : `Banning ${selectedUser?.email} will immediately invalidate their sessions and disable link redirection.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setBanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.bannedAt ? "default" : "destructive"}
              onClick={handleToggleBan}
              disabled={!!actionLoading}
            >
              {selectedUser?.bannedAt ? "Unban Account" : "Confirm Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Permanently Delete User Account?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All links, bio pages, custom domains, and data belonging to{" "}
              <strong className="text-foreground">{selectedUser?.email}</strong> will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={!!actionLoading}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
