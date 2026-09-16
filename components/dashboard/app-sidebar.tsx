"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Briefcase,
  FileText,
  User,
  ListTodo,
  CreditCard,
  Settings,
  Sparkles,
  LogOut,
  ChevronsUpDown,
  Zap,
  Cable,
  Bookmark,
  LayoutDashboard,
} from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Jobs",
      url: "/dashboard/jobs",
      icon: Briefcase,
      badge: "Live",
    },
    {
      title: "Saved Jobs",
      url: "/dashboard/saved-jobs",
      icon: Bookmark,
    },
    {
      title: "Connectors",
      url: "/dashboard/connectors",
      icon: Cable,
    },
    {
      title: "Resume",
      url: "/dashboard/resume",
      icon: FileText,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Application Status",
      url: "/dashboard/application-status",
      icon: ListTodo,
    },
  ];

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  // Mock credits data (85/100)
  const creditsUsed = 85;
  const totalCredits = 100;
  const creditsPercent = (creditsUsed / totalCredits) * 100;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" {...props}>
      {/* Sidebar Header: Logo & App Name */}
      <SidebarHeader className="border-b border-sidebar-border/50 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-900 shadow-md">
                <Sparkles className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-base tracking-tight text-sidebar-foreground">
                  JobBuddy AI
                </span>
                <span className="truncate text-xs text-muted-foreground font-normal">
                  Job Application Agent
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold"
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && !isCollapsed && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px] px-1.5 py-0 h-4 font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border/50 gap-2 p-3">
        {/* Credits Display Section */}
        {!isCollapsed ? (
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
                  <Zap className="size-3.5" />
                </div>
                <span className="text-xs font-semibold text-sidebar-foreground">
                  AI Credits
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {creditsUsed}/{totalCredits}
              </span>
            </div>

            <Progress value={creditsPercent} className="h-1.5 bg-sidebar-border" />

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[11px] text-muted-foreground">
                Monthly Refill
              </span>
              <Link
                href="/dashboard/billing"
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Get More
              </Link>
            </div>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/dashboard/billing" />}
                tooltip={`AI Credits: ${creditsUsed}/${totalCredits}`}
                className="hover:bg-sidebar-accent"
              >
                <Zap className="size-4 text-amber-500" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        {/* Billing & Navigation Links */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard/billing" />}
              isActive={pathname === "/dashboard/billing"}
              tooltip="Billing / Credits"
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
            >
              <CreditCard className="size-4 shrink-0" />
              <span className="flex-1 truncate">Billing / Credits</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Profile & Settings Dropdown Menu */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                  />
                }
              >
                <Avatar className="size-8 rounded-lg">
                  {user?.image ? (
                    <AvatarImage src={user.image} alt={user?.name || "User"} />
                  ) : null}
                  <AvatarFallback className="rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-xs text-sidebar-foreground">
                    {user?.name || "User"}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-xl p-1.5 shadow-xl border border-sidebar-border"
                side={isCollapsed ? "right" : "top"}
                align="end"
                sideOffset={8}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-semibold leading-none text-foreground">
                        {user?.name || "User"}
                      </p>
                      <p className="text-[11px] leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1 bg-border/60" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={<Link href="/dashboard/profile" />}
                    className="cursor-pointer rounded-lg text-xs py-2"
                  >
                    <User className="size-4 text-muted-foreground" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href="/dashboard/settings" />}
                    className="cursor-pointer rounded-lg text-xs py-2"
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href="/dashboard/billing" />}
                    className="cursor-pointer rounded-lg text-xs py-2"
                  >
                    <CreditCard className="size-4 text-muted-foreground" />
                    <span>Billing &amp; Credits</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1 bg-border/60" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="cursor-pointer rounded-lg text-xs py-2 text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="size-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Interactive Sidebar Rail for easy drag / hover expand */}
      <SidebarRail />
    </Sidebar>
  );
}
