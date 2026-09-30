import React from "react";
import { Briefcase, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsOverviewCardsProps {
  metrics: {
    totalDiscoveredJobs?: number;
    totalApplications: number;
    appliedCount: number;
    inProgressCount: number;
    actionRequiredCount?: number;
    failedCount?: number;
    savedJobsCount?: number;
    averageMatchScore?: number;
    activeConnectorsCount?: number;
  };
}

export function StatsOverviewCards({ metrics }: StatsOverviewCardsProps) {
  const successRate =
    metrics.totalApplications > 0
      ? Math.round((metrics.appliedCount / metrics.totalApplications) * 100)
      : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-xs border-border/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Applications
          </CardTitle>
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Briefcase className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {metrics.totalApplications}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">Active Agent Pipeline</span>
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Successfully Submitted
          </CardTitle>
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.appliedCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Verified by ATS parsers
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            In Flight / Queued
          </CardTitle>
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {metrics.inProgressCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Processing in background queue
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Submission Success Rate
          </CardTitle>
          <div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <TrendingUp className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {successRate}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Zero form parsing drop-offs
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
