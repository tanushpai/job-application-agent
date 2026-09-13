import type { Metadata } from "next";
import { getUserProfile } from "@/lib/actions/profile-actions";
import { calculateProfileCompleteness } from "@/lib/profile-utils";
import { ProfileTabsForm } from "@/components/dashboard/profile-tabs-form";
import { ProfileCompletenessCard } from "@/components/dashboard/profile-completeness-card";
import { Sparkles, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile | JobBuddy AI",
  description: "Manage your professional career profile and AI agent preferences.",
};

export default async function ProfilePage() {
  const profile = await getUserProfile();
  const completeness = calculateProfileCompleteness(profile);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Career Profile
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <UserCheck className="size-3" />
              <span>Parsed &amp; Editable</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review and edit your auto-populated details extracted from your resume by Google Gemini AI.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Tabs Form (2 cols) & Right Completeness Card (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Tabbed Editable Form */}
        <div className="lg:col-span-2">
          <ProfileTabsForm initialProfile={profile} />
        </div>

        {/* Right Column: Profile Completeness Circular Progress Card */}
        <div className="lg:col-span-1 lg:sticky lg:top-20 space-y-6">
          <ProfileCompletenessCard completeness={completeness} />
        </div>
      </div>
    </div>
  );
}
