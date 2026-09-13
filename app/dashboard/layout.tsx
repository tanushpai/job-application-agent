import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OnboardingDialog } from "@/components/dashboard/onboarding-dialog";
import { checkUserOnboardingStatus } from "@/lib/actions/profile-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  const onboardingStatus = await checkUserOnboardingStatus();

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar user={session.user} />
      <SidebarInset className="flex flex-col min-h-screen bg-background">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>

      {/* Non-closable onboarding dialog if user has 0 resumes */}
      <OnboardingDialog isOpen={!onboardingStatus.isOnboarded} />
    </SidebarProvider>
  );
}
