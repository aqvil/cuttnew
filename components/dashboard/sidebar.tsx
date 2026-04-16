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
  Sparkles,
  ChevronsUpDown,
  LogOut,
  User as UserIcon,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface DashboardSidebarProps {
  user: any
  profile: any | null
}

const navItems = [
  {
    title: "OVERVIEW",
    url: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "BIO_PAGES",
    url: "/dashboard/bio",
    icon: FileText,
  },
  {
    title: "SHORT_LINKS",
    url: "/dashboard/links",
    icon: LinkIcon,
  },
  {
    title: "METRICS",
    url: "/dashboard/analytics",
    icon: BarChart2,
  },
]

const bottomItems = [
  {
    title: "CONFIG",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "LOGISTICS",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
]

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const displayName = profile?.displayName || user?.name || user?.email?.split("@")[0] || "ENTITY_0"
  const initials = displayName.slice(0, 2).toUpperCase()
  const planLabel = `${(profile?.plan || "FREE").toUpperCase()}_ACCESS`

  return (
    <Sidebar collapsible="icon" className="border-r-4 border-primary bg-background selection:bg-primary selection:text-primary-foreground">
      <SidebarHeader className="h-16 border-b-4 border-primary bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center border-2 border-primary bg-primary text-primary-foreground transform -rotate-6">
                  <Link2 className="size-5" />
                </div>
                <span className="text-xl font-black uppercase italic tracking-tighter">LinkForge</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-6 space-y-8 bg-[url('https://discbot.io/grid.png')] bg-repeat">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.url || 
                  (item.url !== "/dashboard" && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-11 border-2 border-transparent px-4 font-black uppercase italic tracking-widest text-[10px] transition-all
                        hover:border-primary hover:bg-muted/50
                        data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                      `}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {bottomItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-11 border-2 border-transparent px-4 font-black uppercase italic tracking-widest text-[10px] transition-all
                        hover:border-primary hover:bg-muted/50
                        data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                      `}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t-4 border-primary p-4 bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-14 w-full border-2 border-transparent hover:border-primary rounded-none data-[state=open]:border-primary transition-all"
                >
                  <Avatar className="size-8 rounded-none border-2 border-primary bg-background">
                    <AvatarImage src={profile?.avatarUrl || user?.image || undefined} alt={displayName} className="rounded-none" />
                    <AvatarFallback className="rounded-none bg-primary text-primary-foreground text-[10px] font-black italic">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-none ml-2">
                    <span className="truncate text-[10px] font-black uppercase italic tracking-tighter">{displayName}</span>
                    <span className="truncate text-[8px] font-mono uppercase tracking-widest opacity-50">{planLabel}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-none border-4 border-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                side="top"
                align="start"
                sideOffset={8}
              >
                <div className="px-4 py-3 bg-muted/20">
                  <p className="text-[10px] font-black uppercase italic">{displayName}</p>
                  <p className="text-[8px] font-mono uppercase opacity-50 tracking-widest truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-primary h-0.5" />
                <DropdownMenuItem asChild className="rounded-none px-4 py-3 font-black uppercase italic text-[10px] focus:bg-primary focus:text-primary-foreground cursor-pointer">
                  <Link href="/dashboard/settings">
                    <UserIcon className="mr-3 size-4" />
                    MANAGE_PROFILE
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-none px-4 py-3 font-black uppercase italic text-[10px] focus:bg-primary focus:text-primary-foreground cursor-pointer">
                  <Link href="/dashboard/billing">
                    <CreditCard className="mr-3 size-4" />
                    LOGISTICS_BUFFER
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary h-0.5" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-none px-4 py-3 font-black uppercase italic text-[10px] focus:bg-destructive focus:text-destructive-foreground text-destructive cursor-pointer">
                  <LogOut className="mr-3 size-4" />
                  TERMINATE_SESSION
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
