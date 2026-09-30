import React from "react";
import Link from "next/link";
import { UserCheck, FileText, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProfileHealthCardProps {
  profileHealth: {
    completionScore: number;
    hasResume: boolean;
    hasSkills: boolean;
    hasExperiences: boolean;
    skillsCount?: number;
    experiencesCount?: number;
  };
}

export function ProfileHealthCard({ profileHealth }: ProfileHealthCardProps) {
  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Profile &amp; Agent Readiness</CardTitle>
          </div>
          <span className="text-xs font-bold text-primary">{profileHealth.completionScore}%</span>
        </div>
        <CardDescription className="text-xs">
          A completed profile and active Jake&apos;s Resume maximizes ATS matching.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={profileHealth.completionScore} className="h-2" />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`size-3.5 ${
                profileHealth.hasResume ? "text-emerald-500" : "text-muted-foreground/40"
              }`}
            />
            <span className={profileHealth.hasResume ? "text-foreground font-medium" : "text-muted-foreground"}>
              Active Resume
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`size-3.5 ${
                profileHealth.hasSkills ? "text-emerald-500" : "text-muted-foreground/40"
              }`}
            />
            <span className={profileHealth.hasSkills ? "text-foreground font-medium" : "text-muted-foreground"}>
              Technical Skills ({profileHealth.skillsCount ?? 0})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`size-3.5 ${
                profileHealth.hasExperiences ? "text-emerald-500" : "text-muted-foreground/40"
              }`}
            />
            <span className={profileHealth.hasExperiences ? "text-foreground font-medium" : "text-muted-foreground"}>
              Work Experience ({profileHealth.experiencesCount ?? 0})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`size-3.5 ${
                profileHealth.completionScore >= 80 ? "text-emerald-500" : "text-muted-foreground/40"
              }`}
            />
            <span className={profileHealth.completionScore >= 80 ? "text-foreground font-medium" : "text-muted-foreground"}>
              Projects &amp; Context
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border">
          <Link
            href="/dashboard/profile"
            className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>Edit Profile &amp; Projects</span>
            <ChevronRight className="size-3" />
          </Link>
          <Link
            href="/dashboard/resume"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <FileText className="size-3" />
            <span>Resume Studio</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
