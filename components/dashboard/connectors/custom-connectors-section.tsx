"use client";

import { useState } from "react";
import { CustomConnectorData, syncCustomCompanyConnector, deleteCustomCompanyConnector } from "@/lib/actions/custom-connector-actions";
import { CompanyLogo } from "@/components/dashboard/jobs/company-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Clock, 
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomConnectorsSectionProps {
  connectors: CustomConnectorData[];
}

export function CustomConnectorsSection({ connectors }: CustomConnectorsSectionProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncCustomCompanyConnector(id);
      router.refresh();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this company connector?")) return;
    setDeletingId(id);
    try {
      await deleteCustomCompanyConnector(id);
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (connectors.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <Building2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No Custom Company Connectors Yet</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
          Add your target dream companies (e.g. TCS, Infosys, Stripe, Airbnb) by pasting their careers URL. Your agent will monitor openings specifically for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {connectors.map((c) => {
        const isSyncing = syncingId === c.id || c.status === "syncing";
        const isDeleting = deletingId === c.id;

        return (
          <Card
            key={c.id}
            className="group overflow-hidden border border-border/60 bg-card/60 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-md flex flex-col justify-between"
          >
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div>
                {/* Header: Logo, Name & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      company={c.companyName}
                      logoUrl={c.logoUrl}
                      jobUrl={c.careersUrl}
                      size="md"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-foreground tracking-tight line-clamp-1">
                        {c.companyName}
                      </h4>
                      <a
                        href={c.careersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors mt-0.5 truncate max-w-[180px]"
                      >
                        Careers Portal <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 font-medium ${
                      c.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : c.status === "syncing"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                    }`}
                  >
                    {c.status === "active" && <CheckCircle2 className="h-2.5 w-2.5 mr-1 inline" />}
                    {c.status === "syncing" && <Loader2 className="h-2.5 w-2.5 mr-1 inline animate-spin" />}
                    {c.status === "error" && <AlertCircle className="h-2.5 w-2.5 mr-1 inline" />}
                    {c.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Job Count & Roles */}
                <div className="mt-4 flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-muted/40 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Live Jobs Discovered:
                  </span>
                  <span className="font-bold text-foreground">{c.jobCount}</span>
                </div>

                {/* Target Roles Tags */}
                {c.targetRoles && c.targetRoles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.targetRoles.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="text-[10px] px-2 py-0 font-normal bg-secondary/60 text-secondary-foreground"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer: Last Synced & Actions */}
              <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                  <Clock className="h-3 w-3 shrink-0" />
                  {c.lastSyncedAt
                    ? `Synced ${new Date(c.lastSyncedAt).toLocaleDateString()}`
                    : "Not synced yet"}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2.5 gap-1"
                    onClick={() => handleSync(c.id)}
                    disabled={isSyncing || isDeleting}
                  >
                    <RotateCcw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                    Sync
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(c.id)}
                    disabled={isSyncing || isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
