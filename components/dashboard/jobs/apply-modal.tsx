"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink, Bot, User, CheckCircle2 } from "lucide-react";
import { createApplication } from "@/lib/actions/application-actions";
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
  const router = useRouter();

  const handleManualApply = async () => {
    setLoadingMode("manual");
    try {
      // 1. Open job URL in new tab
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");

      // 2. Track manual application in DB
      await createApplication({
        jobId: job.id,
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
      <DialogContent className="sm:max-w-md rounded-2xl p-6 border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Apply for {job.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {job.company} • Choose how you would like to proceed with your application.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3.5 py-4">
          {/* Option 2: Apply with AI Agent */}
          <div
            onClick={handleAutoApply}
            className="group relative flex cursor-pointer items-start gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-all hover:border-primary hover:bg-primary/10 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Apply Automatically using AI Agent
                </h4>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our autonomous browser agent inspects the form, maps your profile & resume, and applies in the background.
              </p>
            </div>
          </div>

          {/* Option 1: Apply Manually */}
          <div
            onClick={handleManualApply}
            className="group relative flex cursor-pointer items-start gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 transition-all hover:border-border hover:bg-muted/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border/60">
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
                Opens the official job application page in a new browser tab for manual submission. No automation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
