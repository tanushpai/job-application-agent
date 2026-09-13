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
  Calendar 
} from "lucide-react";
import { toggleSaveJob } from "@/lib/actions/jobs-actions";

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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/60 border border-border/60 font-bold text-foreground text-sm shadow-sm group-hover:border-primary/30 transition-colors">
                {job.company.slice(0, 2).toUpperCase()}
              </div>
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
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Cable className="h-3 w-3 text-primary" />
              <span>{job.connectors[0]?.name || "ATS"}</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] opacity-75">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
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

            {/* Apply Now button */}
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="h-8 px-3 text-xs gap-1.5 font-medium shadow-sm">
                Apply Now
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
