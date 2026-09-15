import { getJobsForUser } from "@/lib/actions/jobs-actions";
import { JobCard, JobCardProps } from "@/components/dashboard/jobs/job-card";
import { JobFilters } from "@/components/dashboard/jobs/job-filters";
import { Briefcase, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Discovered Jobs | JobBuddy AI",
  description: "Browse AI-matched job opportunities synced directly from connected ATS platforms.",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    location?: string;
    locationType?: string;
    jobType?: string;
    experienceLevel?: string;
    minMatchScore?: string;
    sortBy?: string;
    savedOnly?: string;
    connectorSlug?: string;
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const jobs = await getJobsForUser({
    search: params.search,
    location: params.location,
    locationType: params.locationType,
    jobType: params.jobType,
    experienceLevel: params.experienceLevel,
    minMatchScore: params.minMatchScore ? parseInt(params.minMatchScore, 10) : undefined,
    sortBy: params.sortBy,
    savedOnly: params.savedOnly === "true",
    connectorSlug: params.connectorSlug,
  });

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" /> Job Discovery
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Real-time opportunities synced from active applicant tracking systems, ranked by AI match score against your profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/connectors">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Manage Job Sources
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <JobFilters
        initialSearch={params.search}
        initialLocation={params.location}
        initialLocationType={params.locationType}
        initialJobType={params.jobType}
        initialExperienceLevel={params.experienceLevel}
        initialMinMatchScore={params.minMatchScore}
        initialSortBy={params.sortBy}
        initialConnectorSlug={params.connectorSlug}
        initialSavedOnly={params.savedOnly === "true"}
        totalJobsCount={jobs.length}
      />

      {/* Jobs Grid / Empty State */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-card/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
            <AlertCircle className="h-7 w-7 opacity-80" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No matching jobs found</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1.5 leading-relaxed">
            Try adjusting your search criteria, clearing active filters, or enabling more job sources in the Connectors page.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/dashboard/connectors">
              <Button size="sm" variant="default" className="text-xs">
                Check Connectors
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: JobCardProps) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
