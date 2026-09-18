"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  MapPin, 
  Bookmark, 
  ExternalLink, 
  Sparkles, 
  Cable, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toggleSaveJob } from "@/lib/actions/jobs-actions";
import { ApplyModal } from "@/components/dashboard/jobs/apply-modal";
import { CompanyLogo } from "@/components/dashboard/jobs/company-logo";

export interface JobCardProps {
  id: string;
  externalId?: string | null;
  title: string;
  company: string;
  companyLogo?: string | null;
  location: string;
  locationType: string;
  jobType: string;
  experienceLevel: string;
  skills: string[];
  jobUrl: string;
  applyUrl: string;
  postedAt: Date | null;
  isSaved: boolean;
  matchScore: number;
  applicationStatus?: string | null;
  connectors: Array<{
    id: string;
    slug: string;
    name: string;
    status: string;
  }>;
}

export function JobCard({ job }: { job: JobCardProps }) {
  const [saved, setSaved] = useState(job.isSaved);
  const [saving, setSaving] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    setSaving(true);
    try {
      const res = await toggleSaveJob(job.id);
      setSaved(res.isSaved);
    } catch {
      setSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  // Match score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (score >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  // Application status display helpers
  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const s = status.toUpperCase();
    if (s === "APPLIED") {
      return { label: "Applied", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", Icon: CheckCircle2 };
    }
    if (["QUEUED", "DETECTING_PLATFORM", "OPENING_BROWSER", "DETECTING_FORM",
         "MAPPING_PROFILE", "READY_TO_APPLY", "FILLING_FORM",
         "UPLOADING_RESUME", "VALIDATING", "SUBMITTING", "VERIFYING_SUBMISSION"].includes(s)) {
      return { label: "In Progress", className: "bg-blue-500/10 text-blue-500 border-blue-500/20", Icon: Clock };
    }
    if (s === "REQUIRES_USER_ACTION" || s === "MISSING_PROFILE_INFO") {
      return { label: "Action Needed", className: "bg-amber-500/10 text-amber-500 border-amber-500/20", Icon: AlertTriangle };
    }
    if (s === "FAILED") {
      return { label: "Failed", className: "bg-red-500/10 text-red-500 border-red-500/20", Icon: XCircle };
    }
    if (s === "CANCELLED") {
      return { label: "Cancelled", className: "bg-muted text-muted-foreground border-border/60", Icon: XCircle };
    }
    return null;
  };

  const statusBadge = getStatusBadge(job.applicationStatus);

  const formattedDate = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recently";

  return (
    <Card className="group overflow-hidden border border-border/60 bg-card/60 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between">
      <CardContent className="p-6 flex flex-col justify-between h-full gap-5">
        <div>
          {/* Top Row: Company Info & Match Score */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <CompanyLogo
                company={job.company}
                logoUrl={job.companyLogo}
                jobUrl={job.jobUrl}
                size="md"
              />
              <div>
                <h4 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {job.company}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Match Score Badge */}
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={`gap-1 font-semibold text-xs px-2.5 py-1 ${getScoreColor(job.matchScore)}`}>
                <Sparkles className="h-3 w-3" />
                {job.matchScore}% Match
              </Badge>
            </div>
          </div>

          {/* Job Title */}
          <h3 className="text-base font-bold text-foreground mt-3.5 leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {job.title}
          </h3>

          {/* Metadata Badges (Remote, Full-time, Experience) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <Badge variant="secondary" className="text-xs capitalize font-medium">
              {job.locationType}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize text-muted-foreground font-medium border-border/60">
              {job.jobType.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize text-muted-foreground font-medium border-border/60">
              {job.experienceLevel} level
            </Badge>
          </div>

          {/* Skills Tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
              {job.skills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/40"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-[11px] text-muted-foreground font-medium">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Discovered By & Action Buttons */}
        <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs mt-auto">
          <div className="flex flex-col items-start gap-1.5 text-muted-foreground">
            {/* Application status pill */}
            {statusBadge && (
              <Badge
                variant="outline"
                className={`gap-1 text-[10px] font-semibold px-2 py-0.5 h-auto ${statusBadge.className}`}
              >
                <statusBadge.Icon className="h-3 w-3" />
                {statusBadge.label}
              </Badge>
            )}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Cable className="h-3 w-3 text-primary" />
                <span>{job.connectors[0]?.name || "ATS"}</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] opacity-75">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <Button
              variant="outline"
              size="icon"
              disabled={saving}
              onClick={handleToggleSave}
              className={`h-8 w-8 transition-colors ${
                saved ? "text-primary border-primary/40 bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-primary" : ""}`} />
            </Button>

            {/* Apply Now button with Modal */}
            <Button
              size="sm"
              onClick={() => setIsApplyModalOpen(true)}
              className="h-8 px-3 text-xs gap-1.5 font-medium shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="h-3 w-3" />
              Apply Now
            </Button>

            <ApplyModal
              isOpen={isApplyModalOpen}
              onClose={() => setIsApplyModalOpen(false)}
              job={{
                id: job.id,
                title: job.title,
                company: job.company,
                applyUrl: job.applyUrl || job.jobUrl,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
