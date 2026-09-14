"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Calendar,
  ExternalLink,
  Bot,
  User,
  RotateCcw,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  FileText,
} from "lucide-react";
import { retryApplication, cancelApplication } from "@/lib/actions/application-actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ApplicationRecord {
  id: string;
  userId: string;
  jobId: string;
  mode: "MANUAL" | "AUTOMATIC";
  status:
    | "QUEUED"
    | "DETECTING_PLATFORM"
    | "OPENING_BROWSER"
    | "DETECTING_FORM"
    | "MAPPING_PROFILE"
    | "MISSING_PROFILE_INFO"
    | "READY_TO_APPLY"
    | "FILLING_FORM"
    | "UPLOADING_RESUME"
    | "VALIDATING"
    | "SUBMITTING"
    | "VERIFYING_SUBMISSION"
    | "APPLIED"
    | "REQUIRES_USER_ACTION"
    | "FAILED"
    | "CANCELLED";
  platform: string;
  missingFields: Array<{ field: string; label: string; reason: string }> | null;
  customQuestions: Array<{ question: string; answer: string; confidence: number }> | null;
  appliedUrl: string | null;
  submittedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  job: {
    title: string;
    company: string;
    location: string;
    locationType: string;
    applyUrl: string;
  };
  events: Array<{
    id: string;
    eventType: string;
    stage: string | null;
    message: string;
    createdAt: string;
  }>;
  browserSessions: Array<{
    id: string;
    status: string;
    screenshotPaths: string[] | null;
  }>;
}

const STAGES = [
  { key: "PLATFORM", label: "Platform detected", checkStatuses: ["DETECTING_FORM", "MAPPING_PROFILE", "MISSING_PROFILE_INFO", "READY_TO_APPLY", "FILLING_FORM", "UPLOADING_RESUME", "VALIDATING", "SUBMITTING", "VERIFYING_SUBMISSION", "APPLIED"] },
  { key: "FORM", label: "Application form detected", checkStatuses: ["MAPPING_PROFILE", "MISSING_PROFILE_INFO", "READY_TO_APPLY", "FILLING_FORM", "UPLOADING_RESUME", "VALIDATING", "SUBMITTING", "VERIFYING_SUBMISSION", "APPLIED"] },
  { key: "PROFILE", label: "Profile verified", checkStatuses: ["READY_TO_APPLY", "FILLING_FORM", "UPLOADING_RESUME", "VALIDATING", "SUBMITTING", "VERIFYING_SUBMISSION", "APPLIED"] },
  { key: "RESUME", label: "Resume attached", checkStatuses: ["FILLING_FORM", "UPLOADING_RESUME", "VALIDATING", "SUBMITTING", "VERIFYING_SUBMISSION", "APPLIED"] },
  { key: "FILLING", label: "Filling application", checkStatuses: ["VALIDATING", "SUBMITTING", "VERIFYING_SUBMISSION", "APPLIED"] },
  { key: "VALIDATING", label: "Validating form", checkStatuses: ["SUBMITTING", "VERIFYING_SUBMISSION", "APPLIED"] },
  { key: "SUBMITTING", label: "Submitting & Verifying", checkStatuses: ["APPLIED"] },
];

export function ApplicationTracker({ initialApplications }: { initialApplications: ApplicationRecord[] }) {
  const [applications, setApplications] = useState<ApplicationRecord[]>(initialApplications);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    initialApplications[0]?.id || null
  );
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  // Poll for real-time status updates every 3 seconds for active jobs
  useEffect(() => {
    const hasActiveJob = applications.some(
      (a) =>
        a.status !== "APPLIED" &&
        a.status !== "FAILED" &&
        a.status !== "CANCELLED" &&
        a.status !== "MISSING_PROFILE_INFO" &&
        a.status !== "REQUIRES_USER_ACTION"
    );

    if (!hasActiveJob) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [applications, router]);

  useEffect(() => {
    setApplications(initialApplications);
    if (!selectedAppId && initialApplications.length > 0) {
      setSelectedAppId(initialApplications[0].id);
    }
  }, [initialApplications, selectedAppId]);

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  const handleRetry = async (appId: string) => {
    setActionLoading(true);
    try {
      await retryApplication(appId);
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (appId: string) => {
    setActionLoading(true);
    try {
      await cancelApplication(appId);
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: ApplicationRecord["status"]) => {
    switch (status) {
      case "APPLIED":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Applied</Badge>;
      case "QUEUED":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Queued</Badge>;
      case "MISSING_PROFILE_INFO":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1"><AlertTriangle className="h-3 w-3" /> Missing Info</Badge>;
      case "REQUIRES_USER_ACTION":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1"><User className="h-3 w-3" /> Action Required</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary border-primary/20 animate-pulse gap-1"><Bot className="h-3 w-3" /> Processing...</Badge>;
    }
  };

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-card/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
          <Bot className="h-7 w-7 opacity-80" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No applications submitted yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1.5 leading-relaxed">
          Discover matching opportunities and use our automated AI agent to apply seamlessly.
        </p>
        <Link href="/dashboard/jobs" className="mt-6">
          <Button size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Discover Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Applications List */}
      <div className="lg:col-span-5 space-y-3">
        {applications.map((app) => {
          const isSelected = app.id === selectedAppId;
          return (
            <div
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                isSelected
                  ? "border-primary/50 bg-primary/5 shadow-sm"
                  : "border-border/60 bg-card/60 hover:border-border hover:bg-card/90"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {app.job.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1 font-medium text-foreground/80">
                      <Building2 className="h-3 w-3" />
                      {app.job.company}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{app.platform || "Direct"}</span>
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/40">
                <span className="flex items-center gap-1">
                  {app.mode === "AUTOMATIC" ? (
                    <>
                      <Bot className="h-3 w-3 text-primary" /> AI Agent
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3" /> Manual
                    </>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(app.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Detail View */}
      {selectedApp && (
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border/60 bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      {selectedApp.job.title}
                    </h2>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedApp.job.company} • {selectedApp.job.location} ({selectedApp.job.locationType})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedApp.status === "MISSING_PROFILE_INFO" && (
                    <Button
                      size="sm"
                      onClick={() => handleRetry(selectedApp.id)}
                      disabled={actionLoading}
                      className="text-xs gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retry Application
                    </Button>
                  )}
                  {selectedApp.status === "QUEUED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(selectedApp.id)}
                      disabled={actionLoading}
                      className="text-xs gap-1.5 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  )}
                  <a
                    href={selectedApp.appliedUrl || selectedApp.job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="text-xs gap-1.5">
                      View Job Post
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Missing Profile Alert */}
              {selectedApp.status === "MISSING_PROFILE_INFO" && selectedApp.missingFields && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-500">
                        Missing Profile Information
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        The application form requires details not found on your profile:
                      </p>
                      <ul className="list-disc list-inside text-xs font-medium text-foreground mt-2 space-y-1">
                        {selectedApp.missingFields.map((f, idx) => (
                          <li key={idx}>{f.label}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Link href="/dashboard/profile">
                      <Button size="sm" variant="default" className="text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
                        Complete Profile
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Automation Progress Visualizer */}
              {selectedApp.mode === "AUTOMATIC" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Automation Progress
                  </h4>

                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                    {STAGES.map((stage) => {
                      const isComplete = stage.checkStatuses.includes(selectedApp.status);
                      const isCurrent =
                        selectedApp.status === "FILLING_FORM" && stage.key === "FILLING"
                        ? true
                        : selectedApp.status === "VALIDATING" && stage.key === "VALIDATING"
                        ? true
                        : selectedApp.status === "SUBMITTING" && stage.key === "SUBMITTING"
                        ? true
                        : false;

                      return (
                        <div key={stage.key} className="flex items-center gap-3 text-xs">
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : isCurrent ? (
                            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-border/80 shrink-0" />
                          )}
                          <span
                            className={`font-medium ${
                              isComplete
                                ? "text-foreground"
                                : isCurrent
                                ? "text-primary font-semibold"
                                : "text-muted-foreground/70"
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}

                    {selectedApp.status === "APPLIED" && (
                      <div className="pt-2 text-xs font-semibold text-emerald-500 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Application submitted successfully
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Timeline */}
              {selectedApp.events && selectedApp.events.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Execution Log
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedApp.events.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-lg border border-border/40 bg-card/40 p-2.5 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground text-[11px]">
                            {ev.stage || ev.eventType}
                          </span>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {ev.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/70 shrink-0">
                          {new Date(ev.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screenshots Gallery if available */}
              {selectedApp.browserSessions?.[0]?.screenshotPaths &&
                (selectedApp.browserSessions[0].screenshotPaths as string[]).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      Session Screenshots
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(selectedApp.browserSessions[0].screenshotPaths as string[]).map((imgUrl, idx) => (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/40 hover:border-primary transition-all"
                        >
                          <img
                            src={imgUrl}
                            alt={`Step Screenshot ${idx + 1}`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
