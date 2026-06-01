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
  Settings,
  CreditCard,
  ChevronsUpDown,
  LogOut,
  User as UserIcon,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface DashboardSidebarProps {
  user: any
  profile: any | null
}

const navItems = [
  { title: "Home", url: "/dashboard", icon: LayoutGrid },
  { title: "Links", url: "/dashboard/links", icon: LinkIcon },
  { title: "Bio Pages", url: "/dashboard/bio", icon: FileText },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart2 },
]

const bottomItems = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
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
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border pb-0 pt-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer">
              <Link href="/dashboard" className="flex items-center gap-3 w-full">
                <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-accent-foreground text-sidebar shadow-sm shrink-0">
                  <Link2 className="size-4 stroke-[3]" />
                </div>
                <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight">LinkForge</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-6 space-y-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Create short link" className="h-10 rounded-md bg-sidebar-accent-foreground px-3 text-sidebar hover:bg-sidebar-accent-foreground/90 hover:text-sidebar font-semibold">
                  <Link href="/dashboard/links/new" className="flex items-center w-full">
                    <LinkIcon className="size-4 mr-3" />
                    <span className="text-sm">New short link</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
           <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Manage</span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-10 rounded-md px-3 transition-colors duration-200
                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                        data-[active=true]:bg-sidebar-accent-foreground data-[active=true]:text-sidebar font-medium
                        ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center w-full">
                        <item.icon className={`size-4 mr-3 ${isActive ? 'text-current' : 'text-sidebar-foreground/60'}`} />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Account</span>
            </div>
            <SidebarMenu className="gap-1.5">
              {bottomItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-10 rounded-md px-3 transition-colors duration-200
                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                        data-[active=true]:bg-sidebar-accent-foreground data-[active=true]:text-sidebar font-medium
                        ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center w-full">
                        <item.icon className={`size-4 mr-3 ${isActive ? 'text-current' : 'text-sidebar-foreground/60'}`} />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
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
                  <div className="grid flex-1 text-left leading-tight ml-3">
                    <span className="truncate text-sm font-semibold text-sidebar-accent-foreground">{displayName}</span>
                    <span className="truncate text-xs text-sidebar-foreground/60">{planLabel}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/60" />
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
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-md px-3 py-2 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
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
