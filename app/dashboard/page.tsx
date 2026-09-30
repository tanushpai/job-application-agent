import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Bookmark, Zap } from "lucide-react";
import { getDashboardStats } from "@/lib/actions/jobs-actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsOverviewCards } from "@/components/dashboard/overview/stats-overview-cards";
import { ProfileHealthCard } from "@/components/dashboard/overview/profile-health-card";
import { ConnectorsStatusCard } from "@/components/dashboard/overview/connectors-status-card";
import { RecentApplicationsFeed } from "@/components/dashboard/overview/recent-applications-feed";
import { JobCard } from "@/components/dashboard/jobs/job-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Overview | JobBuddy AI",
  description: "AI-powered job applications, tracking, and agent automation overview.",
};

export default async function DashboardOverviewPage() {
  const data = await getDashboardStats();

  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load dashboard data. Please refresh.</p>
        </div>
      </div>
    );
  }

  const { user, metrics, profileHealth, recentApplications, recommendedJobs, connectorsSummary } = data;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* ─── Header & Hero ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {user.name?.split(" ")[0] || "there"} 👋
            </h1>
            <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary text-xs py-0.5">
              <Zap className="h-3 w-3 text-primary animate-pulse" />
              Agent Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your autonomous AI application agent is monitoring active ATS job boards and matching top roles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/saved-jobs"
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-9" })}
          >
            <Bookmark className="mr-1.5 h-4 w-4" />
            Saved Jobs ({metrics.savedJobsCount})
          </Link>
          <Link
            href="/dashboard/jobs"
            className={buttonVariants({ size: "sm", className: "h-9 bg-primary hover:bg-primary/90 shadow-sm" })}
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Explore Jobs
          </Link>
        </div>
      </div>

      {/* ─── Top Stats Cards ────────────────────────────────────────── */}
      <StatsOverviewCards metrics={metrics} />

      {/* ─── Middle Section: Profile Readiness & Connectors ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileHealthCard profileHealth={profileHealth} />
        <ConnectorsStatusCard connectorsSummary={connectorsSummary} />
      </div>

      {/* ─── Bottom Section: Recent Applications Feed ─────────────────── */}
      <RecentApplicationsFeed recentApplications={recentApplications} />

      {/* ─── Recommended Jobs Carousel ───────────────────────────────── */}
      {recommendedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Recommended For Your Profile</h2>
            <Link href="/dashboard/jobs" className="text-xs text-primary hover:underline font-semibold">
              View All Scouted Roles &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
