import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export const metadata: Metadata = {
  title: "Billing & Credits | JobBuddy AI",
  description: "Manage subscription plans, invoices, and AI usage credits.",
};

export default function BillingPage() {
  return (
    <PlaceholderPage
      title="Billing / Credits"
      description="View credit usage history, manage your subscription plan, and purchase additional AI agent credits."
      icon={CreditCard}
      badgeText="Billing & Credits • Blank State"
    />
  );
}
