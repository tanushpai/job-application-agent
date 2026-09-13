import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export const metadata: Metadata = {
  title: "Dashboard Overview | JobBuddy AI",
  description: "AI-powered job applications, tracking, and resume management.",
};

export default function DashboardOverviewPage() {
  return (
    <PlaceholderPage
      title="Dashboard Overview"
      description="Welcome to JobBuddy AI. Your AI agent dashboard is ready for action."
      icon={LayoutDashboard}
      badgeText="Dashboard • Blank State"
    />
  );
}
