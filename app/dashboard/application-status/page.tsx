import type { Metadata } from "next";
import { ListTodo } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export const metadata: Metadata = {
  title: "Application Status | JobBuddy AI",
  description: "Track submitted job applications, interview stages, and outcomes.",
};

export default function ApplicationStatusPage() {
  return (
    <PlaceholderPage
      title="Application Status"
      description="Monitor live updates, responses, and interview schedules for your automated job applications."
      icon={ListTodo}
      badgeText="Application Tracker • Blank State"
    />
  );
}
