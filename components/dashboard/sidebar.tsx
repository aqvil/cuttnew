'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
  ShieldCheck,
  Zap
} from "lucide-react"
import { signOut } from "next-auth/react"

interface DashboardSidebarProps {
  user: any
  profile: any | null
}

const navItems = [
  { id: "01", title: "OVERVIEW", url: "/dashboard", icon: LayoutGrid },
  { id: "02", title: "BIO_SEGMENTS", url: "/dashboard/bio", icon: FileText },
  { id: "03", title: "RELAY_NODES", url: "/dashboard/links", icon: LinkIcon },
  { id: "04", title: "METRIC_FLOW", url: "/dashboard/analytics", icon: BarChart2 },
]

const bottomItems = [
  { id: "05", title: "SYS_CONFIG", url: "/dashboard/settings", icon: Settings },
  { id: "06", title: "LOGISTICS", url: "/dashboard/billing", icon: CreditCard },
]

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const displayName = profile?.displayName || user?.name || user?.email?.split("@")[0] || "ENTITY_0"
  const initials = displayName.slice(0, 2).toUpperCase()
  const planLabel = `${(profile?.plan || "FREE").toUpperCase()}_ACCESS`

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-black">
      <SidebarHeader className="h-20 border-b border-white/10 flex items-center px-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center border border-white bg-white text-black transform rotate-3">
                  <Link2 className="size-5" />
                </div>
                <span className="text-xl font-black uppercase italic tracking-tighter">LinkForge</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-10 space-y-12 bg-[url('https://discbot.io/grid.png')] bg-repeat opacity-80">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {navItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-12 border border-transparent px-4 transition-all group
                        hover:border-white/20 hover:bg-white/5
                        data-[active=true]:border-white data-[active=true]:bg-white data-[active=true]:text-black
                      `}
                    >
                      <Link href={item.url} className="flex items-center w-full">
                        <span className={`mr-4 text-[8px] font-mono font-bold transition-opacity ${isActive ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`}>
                          [{item.id}]
                        </span>
                        <item.icon className="size-4 mr-3" />
                        <span className="text-[10px] font-black uppercase italic tracking-[0.2em]">{item.title}</span>
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
            <div className="px-4 mb-4">
              <span className="text-[8px] font-mono font-black uppercase tracking-[0.4em] opacity-20">SYSTEM_UTILITIES</span>
            </div>
            <SidebarMenu className="gap-3">
              {bottomItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-12 border border-transparent px-4 transition-all group
                        hover:border-white/20 hover:bg-white/5
                        data-[active=true]:border-white data-[active=true]:bg-white data-[active=true]:text-black
                      `}
                    >
                      <Link href={item.url} className="flex items-center w-full">
                         <span className={`mr-4 text-[8px] font-mono font-bold transition-opacity ${isActive ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`}>
                          [{item.id}]
                        </span>
                        <item.icon className="size-4 mr-3" />
                        <span className="text-[10px] font-black uppercase italic tracking-[0.2em]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Vitals Aesthetic */}
        <div className="px-6 pt-12 space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-30">ENCRYPTION</span>
              <ShieldCheck className="size-3 text-emerald-400" />
            </div>
            <div className="h-1 bg-white/5 overflow-hidden">
               <div className="h-full bg-white/20 w-3/4" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-30">FLUX_STABILITY</span>
              <Zap className="size-3 text-amber-400 animate-pulse" />
            </div>
            <div className="h-1 bg-white/5 overflow-hidden">
               <div className="h-full bg-white/20 w-1/2" />
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-6 bg-black">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-14 w-full border border-transparent hover:border-white/20 px-4 transition-all"
                >
                  <Avatar className="size-8 rounded-none border border-white/20 bg-black">
                    <AvatarImage src={profile?.avatarUrl || user?.image || undefined} alt={displayName} className="rounded-none" />
                    <AvatarFallback className="rounded-none bg-white text-black text-[10px] font-black italic">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-none ml-3">
                    <span className="truncate text-[10px] font-black uppercase italic tracking-tighter">{displayName}</span>
                    <span className="truncate text-[8px] font-mono uppercase tracking-widest opacity-40">{planLabel}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-none border border-white/20 bg-black"
                side="top"
                align="start"
                sideOffset={8}
              >
                <div className="px-4 py-4 border-b border-white/10">
                  <p className="text-[10px] font-black uppercase italic tracking-tight">{displayName}</p>
                  <p className="text-[8px] font-mono uppercase opacity-40 tracking-widest truncate mt-1">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild className="rounded-none px-4 py-4 font-black uppercase italic text-[10px] focus:bg-white focus:text-black cursor-pointer">
                  <Link href="/dashboard/settings">
                    <UserIcon className="mr-3 size-4" />
                    MANAGE_PROFILE
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-none px-4 py-4 font-black uppercase italic text-[10px] focus:bg-white focus:text-black cursor-pointer">
                  <Link href="/dashboard/billing">
                    <CreditCard className="mr-3 size-4" />
                    BILLING_PROTOCOL
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-none px-4 py-4 font-black uppercase italic text-[10px] focus:bg-red-500 focus:text-white text-red-500 cursor-pointer">
                  <LogOut className="mr-3 size-4" />
                  TERMINATE_NODE
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
