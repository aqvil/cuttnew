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
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
  { title: "Link-in-bio", url: "/dashboard/bio", icon: FileText },
  { title: "Links", url: "/dashboard/links", icon: LinkIcon },
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
    <Sidebar collapsible="icon" className="border-r-0 bg-slate-900 text-slate-300">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-white/5 pb-0 pt-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-slate-800 hover:text-white transition-colors duration-200 cursor-pointer">
              <Link href="/dashboard" className="flex items-center gap-3 w-full">
                <div className="flex size-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm shrink-0">
                  <Link2 className="size-4 stroke-[3]" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">LinkForge</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-6 space-y-6">
        <SidebarGroup>
           <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connections</span>
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
                      className={`h-10 rounded-lg px-3 transition-colors duration-200
                        hover:bg-slate-800 hover:text-white
                        data-[active=true]:bg-blue-600 data-[active=true]:text-white font-medium
                        ${isActive ? 'text-white' : 'text-slate-300'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center w-full">
                        <item.icon className={`size-4 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</span>
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
                      className={`h-10 rounded-lg px-3 transition-colors duration-200
                        hover:bg-slate-800 hover:text-white
                        data-[active=true]:bg-blue-600 data-[active=true]:text-white font-medium
                        ${isActive ? 'text-white' : 'text-slate-300'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center w-full">
                        <item.icon className={`size-4 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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

      <SidebarFooter className="border-t border-white/5 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 w-full rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200"
                >
                  <Avatar className="size-8 rounded-md bg-slate-800 text-white">
                    <AvatarImage src={profile?.avatarUrl || user?.image || undefined} alt={displayName} />
                    <AvatarFallback className="rounded-md bg-blue-600 text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight ml-3">
                    <span className="truncate text-sm font-semibold text-white">{displayName}</span>
                    <span className="truncate text-xs text-slate-400">{planLabel}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-xl border border-slate-200 bg-white shadow-lg"
                side="top"
                align="start"
                sideOffset={8}
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="p-1">
                  <DropdownMenuItem asChild className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-100 cursor-pointer">
                    <Link href="/dashboard/settings">
                      <UserIcon className="mr-2 size-4 text-slate-500" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-100 cursor-pointer">
                    <Link href="/dashboard/billing">
                      <CreditCard className="mr-2 size-4 text-slate-500" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
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
