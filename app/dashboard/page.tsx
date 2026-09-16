import type { Metadata } from "next";
import Link from "next/link";
import { 
  Sparkles, 
  Briefcase, 
  FileText, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Zap, 
  Building2,
  ChevronRight,
  TrendingUp,
  Cable,
  UserCheck
} from "lucide-react";
import { getDashboardStats } from "@/lib/actions/jobs-actions";
import { JobCard } from "@/components/dashboard/jobs/job-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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

      {/* ─── Metric KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <Card className="relative overflow-hidden border shadow-sm hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Applications
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalApplications}</div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3 w-3 mr-0.5 inline" /> {metrics.appliedCount} applied
              </span>
              <span>•</span>
              <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                <Clock className="h-3 w-3 mr-0.5 inline" /> {metrics.inProgressCount} in progress
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Live Job Pool */}
        <Card className="relative overflow-hidden border shadow-sm hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Discovered Jobs
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDiscoveredJobs}</div>
            <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
              <Cable className="h-3 w-3 text-emerald-500" />
              Synced via {metrics.activeConnectorsCount} active connector{metrics.activeConnectorsCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* AI Average Match */}
        <Card className="relative overflow-hidden border shadow-sm hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avg AI Match
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.averageMatchScore}%
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Calculated against your profile & skills
            </p>
          </CardContent>
        </Card>

        {/* Saved Opportunities */}
        <Card className="relative overflow-hidden border shadow-sm hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Jobs
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bookmark className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.savedJobsCount}</div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              <Link href="/dashboard/saved-jobs" className="hover:underline text-primary inline-flex items-center">
                View all bookmarks <ChevronRight className="h-3 w-3" />
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Main Grid: Pipeline & Profile Status ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Application Pipeline & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Recent Application Pipeline
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time status of your autonomous and manual job applications
                </CardDescription>
              </div>
              <Link
                href="/dashboard/application-status"
                className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
              >
                View All ({metrics.totalApplications})
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="py-8 text-center rounded-lg border border-dashed bg-muted/20">
                  <div className="h-10 w-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">No Applications Started Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                    Explore available positions and use our automated AI agent or apply manually with one click.
                  </p>
                  <Link
                    href="/dashboard/jobs"
                    className={buttonVariants({ size: "sm" })}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Browse Live Jobs
                  </Link>
                </div>
              ) : (
                <div className="divide-y rounded-md border">
                  {recentApplications.map((app) => {
                    const isApplied = app.status === "APPLIED";
                    const isFailed = app.status === "FAILED" || app.status === "CANCELLED";
                    const isActionNeeded =
                      app.status === "REQUIRES_USER_ACTION" || app.status === "MISSING_PROFILE_INFO";

                    return (
                      <div
                        key={app.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{app.jobTitle}</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 capitalize ${
                                app.mode === "AUTOMATIC"
                                  ? "border-purple-500/30 text-purple-600 bg-purple-500/5"
                                  : "border-gray-500/30 text-muted-foreground"
                              }`}
                            >
                              {app.mode === "AUTOMATIC" ? "🤖 AI Agent" : "Manual"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {app.company}
                            </span>
                            {app.location && <span>• {app.location}</span>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <Badge
                            className={`text-xs px-2.5 py-0.5 font-medium ${
                              isApplied
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                : isFailed
                                ? "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20"
                                : isActionNeeded
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                                : "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20 animate-pulse"
                            }`}
                          >
                            {app.status.replace(/_/g, " ")}
                          </Badge>
                          <Link
                            href="/dashboard/application-status"
                            className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
                          >
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Agent Readiness & Connectors */}
        <div className="space-y-6">
          {/* Profile Health */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Profile Completeness
                </CardTitle>
                <span className="text-xs font-bold text-primary">
                  {profileHealth.completionScore}%
                </span>
              </div>
              <CardDescription className="text-xs">
                A complete profile boosts AI form fill accuracy & match scores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={profileHealth.completionScore} className="h-2" />

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b">
                  <span className="text-muted-foreground">Primary Resume</span>
                  {profileHealth.hasResume ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                    </span>
                  ) : (
                    <Link href="/dashboard/resumes" className="text-amber-600 hover:underline font-medium">
                      + Upload resume
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-between py-1 border-b">
                  <span className="text-muted-foreground">Technical Skills</span>
                  {profileHealth.hasSkills ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {profileHealth.skillsCount} skills
                    </span>
                  ) : (
                    <Link href="/dashboard/profile" className="text-amber-600 hover:underline font-medium">
                      + Add skills
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Work Experience</span>
                  {profileHealth.hasExperiences ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {profileHealth.experiencesCount} roles
                    </span>
                  ) : (
                    <Link href="/dashboard/profile" className="text-amber-600 hover:underline font-medium">
                      + Add experience
                    </Link>
                  )}
                </div>
              </div>

              <Link
                href="/dashboard/profile"
                className={buttonVariants({ variant: "outline", size: "sm", className: "w-full text-xs" })}
              >
                Manage Profile & Credentials
              </Link>
            </CardContent>
          </Card>

          {/* Job Connectors Status */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Cable className="h-4 w-4 text-emerald-600" />
                  Active Job Connectors
                </CardTitle>
                <Link href="/dashboard/connectors" className="text-[11px] text-primary hover:underline">
                  Configure
                </Link>
              </div>
              <CardDescription className="text-xs">
                Automated ingestion channels for fresh postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {connectorsSummary.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/40 border">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          c.status === "connected" ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <span className="text-muted-foreground">{c.jobCount} live jobs</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Bottom Section: Top AI Matched Jobs ─────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Recommended For You
            </h2>
            <p className="text-xs text-muted-foreground">
              Top roles scored against your profile experience and technical skills
            </p>
          </div>
          <Link
            href="/dashboard/jobs"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
          >
            View All Openings ({metrics.totalDiscoveredJobs})
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>

        {recommendedJobs.length === 0 ? (
          <div className="py-8 text-center rounded-lg border bg-muted/10">
            <p className="text-xs text-muted-foreground">
              No jobs discovered yet. Head over to the Connectors page to sync jobs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
