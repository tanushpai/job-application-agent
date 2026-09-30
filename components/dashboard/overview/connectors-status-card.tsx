import React from "react";
import Link from "next/link";
import { Cable, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ConnectorSummaryItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  jobCount: number;
}

interface ConnectorsStatusCardProps {
  connectorsSummary: ConnectorSummaryItem[];
}

export function ConnectorsStatusCard({ connectorsSummary }: ConnectorsStatusCardProps) {
  const activeCount = connectorsSummary.filter((c) => c.status === "connected").length;
  const totalJobs = connectorsSummary.reduce((acc, c) => acc + (c.jobCount || 0), 0);

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cable className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Live Career Connectors</CardTitle>
          </div>
          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {activeCount} Active
          </span>
        </div>
        <CardDescription className="text-xs">
          Automatic synchronization with enterprise ATS engines and career portals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">
              {totalJobs.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground">Scouted Live Roles</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">
              {activeCount} / {connectorsSummary.length}
            </div>
            <div className="text-[11px] text-muted-foreground">Connected Portals</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            href="/dashboard/connectors"
            className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>Manage Connectors &amp; Custom URLs</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
