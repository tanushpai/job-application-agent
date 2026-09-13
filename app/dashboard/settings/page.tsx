import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export const metadata: Metadata = {
  title: "Profile Settings | JobBuddy AI",
  description: "Account settings, notifications, security, and preferences.",
};

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Profile Settings"
      description="Manage account details, password security, email notifications, and general preferences."
      icon={Settings}
      badgeText="Settings • Blank State"
    />
  );
}
