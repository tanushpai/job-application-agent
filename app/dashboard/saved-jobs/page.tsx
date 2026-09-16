import { getSavedJobsForUser } from "@/lib/actions/jobs-actions";
import { JobCard } from "@/components/dashboard/jobs/job-card";
import { Bookmark, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Saved Jobs | JobBuddy AI",
  description: "View all the jobs you have bookmarked for later.",
};

export default async function SavedJobsPage() {
  const savedJobs = await getSavedJobsForUser();

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-primary fill-primary/20" />
            Saved Jobs
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {savedJobs.length > 0
              ? `${savedJobs.length} bookmarked job${savedJobs.length !== 1 ? "s" : ""} — sorted by most recently saved.`
              : "Jobs you bookmark will appear here for quick access."}
          </p>
        </div>

        <Link href="/dashboard/jobs">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Browse All Jobs
          </Button>
        </Link>
      </div>

      {/* Jobs Grid / Empty State */}
      {savedJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-card/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-5">
            <Bookmark className="h-8 w-8 opacity-60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No saved jobs yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2 leading-relaxed">
            Hit the bookmark icon on any job card to save it here. Your saved jobs will stay in sync with their latest application status.
          </p>
          <Link href="/dashboard/jobs" className="mt-6">
            <Button size="sm" className="text-xs gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Discover Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
