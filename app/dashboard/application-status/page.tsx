import type { Metadata } from "next";
import { getUserApplications } from "@/lib/actions/application-actions";
import { ApplicationTracker } from "@/components/dashboard/applications/application-tracker";
import { ListTodo, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Application Status | JobBuddy AI",
  description: "Track submitted job applications, real-time AI automation stages, and outcomes.",
};

export default async function ApplicationStatusPage() {
  const rawApplications = await getUserApplications();

  // Format dates/objects for client serialization
  const applications = rawApplications.map((app) => ({
    ...app,
    createdAt: app.createdAt.toISOString(),
    submittedAt: app.submittedAt ? app.submittedAt.toISOString() : null,
    events: app.events.map((ev) => ({
      ...ev,
      createdAt: ev.createdAt.toISOString(),
    })),
    missingFields: app.missingFields as any,
    customQuestions: app.customQuestions as any,
    browserSessions: app.browserSessions.map((bs) => ({
      ...bs,
      screenshotPaths: (bs.screenshotPaths as string[]) || [],
    })),
  }));

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ListTodo className="h-8 w-8 text-primary" /> Application Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Monitor live background browser automation, form inspection stages, and submission records in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/jobs">
            <Button size="sm" className="gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Apply to More Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Tracker */}
      <ApplicationTracker initialApplications={applications as any} />
    </div>
  );
}
