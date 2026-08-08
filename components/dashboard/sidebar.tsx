'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Link2,
  LayoutGrid,
  FileText,
  LinkIcon,
  BarChart2,
  CreditCard,
  ChevronsUpDown,
  LogOut,
  User as UserIcon,
  QrCode,
  Settings,
  Users,
  Globe,
  Plus,
  Shield,
  Grid,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface DashboardSidebarProps {
  user: any
  profile: any | null
}

const navItems = [
  { title: "Home",           url: "/dashboard",           icon: LayoutGrid },
  { title: "Links",          url: "/dashboard/links",     icon: LinkIcon },
  { title: "QR Codes",       url: "/dashboard/qr-codes",  icon: QrCode },
  { title: "Bio Pages",      url: "/dashboard/bio",       icon: FileText },
  { title: "Analytics",      url: "/dashboard/analytics", icon: BarChart2 },
  { title: "Custom Domains", url: "/dashboard/domains",   icon: Globe },
  { title: "Integrations",   url: "/dashboard/teams",     icon: Grid },
]

const bottomNavItems = [
  { title: "Admin Console", url: "/dashboard/admin", icon: Shield },
  { title: "Settings",  url: "/dashboard/settings",   icon: Settings },
]

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const displayName = profile?.displayName || user?.name || user?.email?.split("@")[0] || "User"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card text-foreground font-mono">
      {/* Top Header Logo (Bitly Style) */}
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/60 px-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
            c
          </div>
          <span className="text-lg font-extrabold text-foreground tracking-tight group-data-[collapsible=icon]:hidden">
            cuttly
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between px-2 py-4">
        <div className="space-y-4">
          {/* Bitly Style Primary Plus Button */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Create new link or QR"
                    className="h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-sm group-data-[collapsible=icon]:justify-center"
                  >
                    <Link href="/dashboard/links/new" className="flex items-center justify-center w-full">
                      <Plus className="size-5 stroke-[2.5]" />
                      <span className="text-xs group-data-[collapsible=icon]:hidden ml-2">Create new</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Navigation Items List */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`h-10 rounded-lg px-3 font-semibold transition-all duration-150 relative
                          ${isActive
                            ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }
                        `}
                      >
                        <Link href={item.url} className="flex items-center w-full">
                          <item.icon className={`size-4 shrink-0 mr-3 group-data-[collapsible=icon]:mr-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="text-xs group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Bottom Menu Items */}
        <SidebarGroup className="mt-4 border-t border-border/60 pt-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {bottomNavItems.map((item) => {
                const isActive = pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-10 rounded-lg px-3 font-semibold transition-all duration-150
                        ${isActive
                          ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center w-full">
                        <item.icon className={`size-4 shrink-0 mr-3 group-data-[collapsible=icon]:mr-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-xs group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer Profile */}
      <SidebarFooter className="border-t border-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="h-10 w-full rounded-lg hover:bg-muted transition-colors">
                  <Avatar className="size-7 rounded-full bg-primary/10 text-primary">
                    <AvatarImage src={profile?.avatarUrl || user?.image || undefined} alt={displayName} />
                    <AvatarFallback className="rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2 grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-xs font-bold text-foreground">{displayName}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 rounded-xl border border-border bg-card shadow-lg font-mono text-xs" side="top" align="start">
                <div className="p-3 border-b border-border/60">
                  <p className="font-bold text-foreground">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <DropdownMenuItem asChild className="rounded-lg px-2.5 py-1.5 focus:bg-muted cursor-pointer">
                    <Link href="/dashboard/settings">
                      <UserIcon className="mr-2 size-3.5 text-muted-foreground" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/60 my-1" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg px-2.5 py-1.5 text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 size-3.5" />
                    Sign out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
