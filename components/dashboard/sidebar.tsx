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
  ClipboardList,
  Layers,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface DashboardSidebarProps {
  user: any
  profile: any | null
}

const navItems = [
  { title: "Home",           url: "/dashboard",              icon: LayoutGrid },
  { title: "Links",          url: "/dashboard/links",        icon: LinkIcon },
  { title: "Bio Pages",      url: "/dashboard/bio",          icon: FileText },
  { title: "Surveys",        url: "/dashboard/surveys",      icon: ClipboardList },
  { title: "Action Pages",   url: "/dashboard/action-pages", icon: Layers },
  { title: "QR Codes",       url: "/dashboard/qr-codes",     icon: QrCode },
  { title: "Custom Domains", url: "/dashboard/domains",      icon: Globe },
  { title: "Teams",          url: "/dashboard/teams",        icon: Users },
  { title: "Analytics",      url: "/dashboard/analytics",    icon: BarChart2 },
]

const bottomNavItems = [
  { title: "Settings",  url: "/dashboard/settings",   icon: Settings },
  { title: "Billing",   url: "/dashboard/billing",    icon: CreditCard },
]

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const displayName = profile?.displayName || user?.name || user?.email?.split("@")[0] || "User"
  const initials = displayName.slice(0, 2).toUpperCase()
  const planLabel = profile?.plan ? `${profile.plan.charAt(0).toUpperCase()}${profile.plan.slice(1)} Plan` : "Free Plan"

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="h-16 flex items-center border-b border-sidebar-border px-4 pb-0 pt-0 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="cursor-pointer transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center">
              <Link href="/dashboard" className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center">
                <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-accent-foreground text-sidebar shadow-sm shrink-0">
                  <Link2 className="size-4 stroke-[3]" />
                </div>
                <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight group-data-[collapsible=icon]:hidden">Cuttly</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between px-3 py-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <div className="space-y-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Create short link" className="h-10 rounded-md bg-sidebar-accent-foreground px-3 font-semibold text-sidebar hover:bg-sidebar-accent-foreground/90 hover:text-sidebar group-data-[collapsible=icon]:justify-center">
                    <Link href="/dashboard/links/new" className="flex w-full items-center group-data-[collapsible=icon]:justify-center">
                      <LinkIcon className="mr-2.5 size-3.5 group-data-[collapsible=icon]:mr-0" />
                      <span className="text-sm group-data-[collapsible=icon]:hidden">New short link</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <div className="mb-1.5 px-2 group-data-[collapsible=icon]:hidden">
              <span className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-[0.12em]">Workspace</span>
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`h-9 rounded-md px-2.5 transition-colors duration-150
                          hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                          data-[active=true]:bg-sidebar-accent-foreground data-[active=true]:text-sidebar font-medium
                          ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/70'}
                        `}
                      >
                        <Link href={item.url} className="flex items-center w-full">
                          <item.icon className={`mr-2.5 size-3.5 group-data-[collapsible=icon]:mr-0 ${isActive ? 'text-current' : 'text-sidebar-foreground/50'}`} />
                          <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <SidebarGroup className="mt-4">
          <div className="mb-1.5 px-2 group-data-[collapsible=icon]:hidden">
            <span className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-[0.12em]">Account</span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {bottomNavItems.map((item) => {
                const isActive = pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-9 rounded-md px-2.5 transition-colors duration-150
                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                        data-[active=true]:bg-sidebar-accent-foreground data-[active=true]:text-sidebar font-medium
                        ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/70'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center w-full">
                        <item.icon className={`mr-2.5 size-3.5 group-data-[collapsible=icon]:mr-0 ${isActive ? 'text-current' : 'text-sidebar-foreground/50'}`} />
                        <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 w-full rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
                >
                  <Avatar className="size-8 rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
                    <AvatarImage src={profile?.avatarUrl || user?.image || undefined} alt={displayName} />
                    <AvatarFallback className="rounded-md bg-sidebar-accent-foreground text-sidebar text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-semibold text-sidebar-accent-foreground">{displayName}</span>
                    <span className="truncate text-xs text-sidebar-foreground/60">{planLabel}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-md border border-border bg-card shadow-lg"
                side="top"
                align="start"
                sideOffset={8}
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="p-1">
                  <DropdownMenuItem asChild className="rounded-md px-3 py-2 text-sm font-medium text-foreground focus:bg-muted cursor-pointer">
                    <Link href="/dashboard/settings">
                      <UserIcon className="mr-2 size-4 text-muted-foreground" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md px-3 py-2 text-sm font-medium text-foreground focus:bg-muted cursor-pointer">
                    <Link href="/dashboard/billing">
                      <CreditCard className="mr-2 size-4 text-muted-foreground" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-md px-3 py-2 text-sm font-medium text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 size-4" />
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
