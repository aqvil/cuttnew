'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  BarChart3,
  ChevronsUpDown,
  Globe,
  LayoutDashboard,
  Link2,
  LogOut,
  Plus,
  QrCode,
  Settings,
  Shield,
  Sparkles,
  User as UserIcon,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

/**
 * Primary navigation.
 *
 * Grouped by what the user is trying to do rather than by feature name:
 * "Create & manage" is the daily work, "Configure" is set-up you touch rarely.
 * The admin group only renders for accounts that actually hold the role.
 */

const primaryNav = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Links", url: "/dashboard/links", icon: Link2 },
  { title: "QR codes", url: "/dashboard/qr-codes", icon: QrCode },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
]

const workspaceNav = [
  { title: "Bio pages", url: "/dashboard/bio", icon: Sparkles },
  { title: "Domains", url: "/dashboard/domains", icon: Globe },
  { title: "Teams", url: "/dashboard/teams", icon: Users },
]

interface DashboardSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  profile: { displayName?: string | null; avatarUrl?: string | null; plan?: string | null } | null
}

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const isAdmin = user?.role === "admin" || user?.role === "superadmin"

  const displayName =
    profile?.displayName || user?.name || user?.email?.split("@")[0] || "Account"
  const initials = displayName.slice(0, 2).toUpperCase()
  const planName = (profile?.plan || "free").replace(/^\w/, (c) => c.toUpperCase())

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`)

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 justify-center px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-md"
          aria-label="Cuttly dashboard"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Link2 className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] group-data-[collapsible=icon]:hidden">
            Cuttly
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-3">
        {/* The primary action, always one click away. */}
        <SidebarGroup className="px-0 py-3">
          <SidebarGroupContent>
            <Button
              asChild
              className="h-9 w-full justify-center gap-2 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0"
            >
              <Link href="/dashboard/links/new">
                <Plus className="size-4" aria-hidden="true" />
                <span className="group-data-[collapsible=icon]:hidden">Create link</span>
              </Link>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <NavItem key={item.url} item={item} active={isActive(item.url, item.exact)} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-0 pt-4">
          <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceNav.map((item) => (
                <NavItem key={item.url} item={item} active={isActive(item.url)} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <SidebarGroup className="px-0 pt-4">
            <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem
                  item={{ title: "Admin console", url: "/dashboard/admin", icon: Shield }}
                  active={isActive("/dashboard/admin")}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        <SidebarGroup className="mt-auto px-0 pb-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                item={{ title: "Settings", url: "/dashboard/settings", icon: Settings }}
                active={isActive("/dashboard/settings")}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 gap-2.5 rounded-md data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="size-7 shrink-0">
                    <AvatarImage
                      src={profile?.avatarUrl || user?.image || undefined}
                      alt=""
                    />
                    <AvatarFallback className="bg-secondary text-[11px] font-semibold text-secondary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-[13px] font-medium">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {planName} plan
                    </span>
                  </span>
                  <ChevronsUpDown
                    className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
                    aria-hidden="true"
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="start" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <UserIcon className="size-4" aria-hidden="true" />
                    Profile & settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing">
                    <Sparkles className="size-4" aria-hidden="true" />
                    Plan & billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => signOut({ callbackUrl: "/" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function NavItem({
  item,
  active,
}: {
  item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }
  active: boolean
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className="h-9 gap-2.5 rounded-md px-2 text-[13px] font-medium text-muted-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground hover:text-foreground"
      >
        <Link href={item.url} aria-current={active ? "page" : undefined}>
          <item.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
