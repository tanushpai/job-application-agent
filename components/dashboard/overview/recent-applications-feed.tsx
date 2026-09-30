import React from "react";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/dashboard/jobs/company-logo";

interface RecentApplicationItem {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  status: string;
  mode: string;
  createdAt: Date;
  updatedAt: Date;
  jobUrl: string;
  applyUrl: string;
}

interface RecentApplicationsFeedProps {
  recentApplications: RecentApplicationItem[];
}

export function RecentApplicationsFeed({ recentApplications }: RecentApplicationsFeedProps) {
  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Recent Agent Activity</CardTitle>
          <CardDescription className="text-xs">
            Live execution status of automated applications submitted by Playwright.
          </CardDescription>
        </div>
        <Link
          href="/dashboard/application-status"
          className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1"
        >
          <span>View Pipeline</span>
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {recentApplications.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No applications submitted yet. Launch the AI agent on any job to start automated applications.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentApplications.map((app) => (
              <div key={app.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <CompanyLogo
                    company={app.company}
                    logoUrl={app.companyLogo}
                    jobUrl={app.jobUrl}
                    className="size-9 rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-foreground truncate">
                      {app.jobTitle}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {app.company} • {app.location || "Remote"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                    {app.mode}
                  </span>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase ${
                      app.status === "APPLIED"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : app.status === "FAILED"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}
                  >
                    {app.status === "APPLIED" ? (
                      <CheckCircle2 className="size-3 mr-1 inline" />
                    ) : app.status === "FAILED" ? (
                      <AlertCircle className="size-3 mr-1 inline" />
                    ) : (
                      <Clock className="size-3 mr-1 inline" />
                    )}
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
