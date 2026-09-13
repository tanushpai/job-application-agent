"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Sparkles, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const routeNames: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/jobs": "Jobs",
  "/dashboard/resume": "Resume",
  "/dashboard/profile": "Profile",
  "/dashboard/application-status": "Application Status",
  "/dashboard/billing": "Billing & Credits",
  "/dashboard/settings": "Profile Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const currentTitle = routeNames[pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard" className="text-xs">
                JobBuddy AI
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-semibold text-foreground">
                {currentTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
          <Sparkles className="size-3" />
          <span>AI Active</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  );
}
