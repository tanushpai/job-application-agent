"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink, Bot, User, CheckCircle2, FileText, Star, ArrowRight } from "lucide-react";
import { createApplication } from "@/lib/actions/application-actions";
import { getUserResumesWithMetadata } from "@/lib/actions/tailored-resume-actions";
import { useRouter } from "next/navigation";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    applyUrl: string;
  };
}

export function ApplyModal({ isOpen, onClose, job }: ApplyModalProps) {
  const [loadingMode, setLoadingMode] = useState<"manual" | "auto" | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsLoadingResumes(true);
      getUserResumesWithMetadata()
        .then((data) => {
          setResumes(data);
          // Pre-select default resume or first resume
          const defaultResume = data.find((r) => r.isDefault) || data[0];
          if (defaultResume) {
            setSelectedResumeId(defaultResume.id);
          }
        })
        .catch((err) => console.error("Failed to load resumes:", err))
        .finally(() => setIsLoadingResumes(false));
    }
  }, [isOpen]);

  const handleManualApply = async () => {
    setLoadingMode("manual");
    try {
      // 1. Open job URL in new tab
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");

      // 2. Track manual application in DB with chosen resume
      await createApplication({
        jobId: job.id,
        resumeId: selectedResumeId || undefined,
        mode: "MANUAL",
      });
      onClose();
      router.refresh();
    } catch (err) {
      console.error("Manual apply tracking failed:", err);
    } finally {
      setLoadingMode(null);
    }
  };

  const handleAutoApply = async () => {
    setLoadingMode("auto");
    try {
      await createApplication({
        jobId: job.id,
        resumeId: selectedResumeId || undefined,
        mode: "AUTOMATIC",
      });
      onClose();
      router.push("/dashboard/application-status");
    } catch (err) {
      console.error("Auto apply dispatch failed:", err);
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 border-border/80 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Apply for {job.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {job.company} • Choose which resume to attach and select your application method.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Resume Selection Selector */}
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                <span>Select Resume Document</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/dashboard/resume?jobId=${job.id}`);
                }}
                className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
              >
                <span>AI Tailor New</span>
                <ArrowRight className="size-3" />
              </button>
            </div>

            {isLoadingResumes ? (
              <div className="text-xs text-muted-foreground py-1 flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-ping" />
                <span>Loading your resumes...</span>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                No resumes found. Base profile will be used.
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.isDefault ? "★ " : ""}
                    {r.title || r.fileName}
                    {r.atsScore ? ` (${r.atsScore}% ATS)` : ""}
                    {r.isTailored ? " [Tailored]" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid gap-3">
            {/* Option 2: Apply with AI Agent */}
            <div
              onClick={handleAutoApply}
              className="group relative flex cursor-pointer items-start gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 transition-all hover:border-primary hover:bg-primary/10 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Apply with AI Agent
                  </h4>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our autonomous Playwright agent auto-fills the ATS application form and attaches your chosen resume.
                </p>
              </div>
            </div>

            {/* Option 1: Apply Manually */}
            <div
              onClick={handleManualApply}
              className="group relative flex cursor-pointer items-start gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 transition-all hover:border-border hover:bg-muted/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border/60">
                <User className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-foreground">
                    Apply Manually
                  </h4>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Opens official job application in a new tab and tracks submission status in your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs rounded-xl">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

