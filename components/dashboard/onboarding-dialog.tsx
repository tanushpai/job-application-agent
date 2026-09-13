"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Bot,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { uploadAndParseResume } from "@/lib/actions/resume-actions";

interface OnboardingDialogProps {
  isOpen: boolean;
  onComplete?: () => void;
}

export function OnboardingDialog({ isOpen, onComplete }: OnboardingDialogProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [parseStep, setParseStep] = useState<number>(0); // 0: Idle, 1: Uploading, 2: Parsing with AI, 3: Populating Profile, 4: Done
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMessage(null);
    const validExtensions = [".pdf", ".docx", ".doc"];
    const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(extension)) {
      setErrorMessage("Please upload a valid PDF or Word document (.pdf, .docx, .doc).");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File size exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      setErrorMessage("Please select a resume file first.");
      return;
    }

    setErrorMessage(null);
    setParseStep(1);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        // Step 1: Upload
        setTimeout(() => setParseStep(2), 800);
        // Step 2: Gemini AI Parsing
        setTimeout(() => setParseStep(3), 2200);

        const res = await uploadAndParseResume(formData);

        if (!res.success) {
          setErrorMessage(res.error || "Failed to process resume. Please try again.");
          setParseStep(0);
          return;
        }

        setParseStep(4);
        setSuccess(true);
      } catch (err) {
        console.error("Resume processing error:", err);
        setErrorMessage("An unexpected error occurred during parsing.");
        setParseStep(0);
      }
    });
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    }
    router.push("/dashboard/profile");
    router.refresh();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300"
      // Non-closable dialog
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-6 text-foreground animate-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center text-white dark:text-zinc-900 shadow-md mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>JobBuddy AI Setup</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {success ? "Resume Parsed Successfully!" : "Welcome! Upload Your Resume"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            {success
              ? "Google Gemini AI has extracted your experience, skills, and education to populate your profile."
              : "To personalize your automated job matching and AI applications, please upload your resume to get started."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="flex flex-col gap-2 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
            {errorMessage.toLowerCase().includes("unauthorized") || errorMessage.toLowerCase().includes("sign in") || errorMessage.toLowerCase().includes("user") ? (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign In Again</span>
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Upload State vs Success State */}
        {!success ? (
          <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/40"
              }`}
            >
              <input
                id="resume-upload-modal"
                type="file"
                accept=".pdf,.docx,.doc"
                disabled={isPending}
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              {file ? (
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-sm truncate max-w-xs">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready to parse
                  </div>
                  <span className="text-xs font-semibold text-primary underline pt-1">
                    Click or drop to replace
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-sm">
                    Drag and drop your resume here
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF or DOCX (up to 10MB)
                  </p>
                  <button
                    type="button"
                    className="mt-2 px-4 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold transition-colors"
                  >
                    Browse File
                  </button>
                </div>
              )}
            </div>

            {/* Live Step Visualizer */}
            {isPending && (
              <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Processing with Google Gemini AI...</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    Step {parseStep}/3
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className={`flex items-center gap-2 ${parseStep >= 1 ? "text-primary font-medium" : ""}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saving file to secure storage</span>
                  </div>
                  <div className={`flex items-center gap-2 ${parseStep >= 2 ? "text-primary font-medium" : ""}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Gemini AI extracting skills, experience &amp; education</span>
                  </div>
                  <div className={`flex items-center gap-2 ${parseStep >= 3 ? "text-primary font-medium" : ""}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Populating profile and structured database</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              onClick={handleSubmit}
              disabled={!file || isPending}
              className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Parsing Resume...</span>
                </>
              ) : (
                <>
                  <span>Upload &amp; Auto-Fill Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Switch Account / Sign Out Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Wrong account? Sign out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-emerald-700 dark:text-emerald-300">
                Profile Ready!
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
                Your work experience, technical skills, education, and contact information have been populated into your profile.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View &amp; Edit Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
