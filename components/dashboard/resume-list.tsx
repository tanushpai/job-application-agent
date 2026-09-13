"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Trash2,
  UploadCloud,
  Calendar,
  HardDrive,
  CheckCircle2,
  Loader2,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";
import { deleteResume, uploadAndParseResume } from "@/lib/actions/resume-actions";

interface ResumeListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialResumes: any[];
}

export function ResumeList({ initialResumes }: ResumeListProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDelete = (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    setDeletingId(resumeId);
    startTransition(async () => {
      const res = await deleteResume(resumeId);
      if (res.success) {
        setResumes((prev) => prev.filter((r) => r.id !== resumeId));
        setSuccessMessage("Resume deleted successfully.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to delete resume.");
      }
      setDeletingId(null);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadAndParseResume(formData);
      if (res.success) {
        setSuccessMessage("New resume uploaded and parsed with Google Gemini AI!");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to upload resume.");
      }
      setIsUploading(false);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Resumes
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3" />
              <span>AI ATS Ready</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your uploaded resume documents and AI extracted profiles.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer">
          {isUploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Parsing with Gemini...</span>
            </>
          ) : (
            <>
              <Plus className="size-4" />
              <span>Upload New Resume</span>
            </>
          )}
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            disabled={isUploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium"
        >
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Resumes List */}
      {resumes.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center backdrop-blur-sm">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
            <UploadCloud className="size-7" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Resumes Uploaded</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Upload your first resume in PDF or Word format to automatically extract your skills and experience.
          </p>
          <label className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold shadow-sm transition-all cursor-pointer">
            <Plus className="size-4" />
            <span>Upload Resume</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {resumes.map((resume, idx) => {
            const uploadDate = new Date(resume.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const sizeInMB = (resume.fileSize / 1024 / 1024).toFixed(2);
            const parsed = resume.parsedData || {};

            return (
              <div
                key={resume.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-border/80 bg-card hover:border-border transition-all shadow-sm group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                    <FileText className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground truncate max-w-sm">
                        {resume.fileName}
                      </h4>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active Resume
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        <span>Uploaded {uploadDate}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="size-3.5" />
                        <span>{sizeInMB} MB</span>
                      </span>
                      {parsed.skills && (
                        <>
                          <span>&bull;</span>
                          <span className="text-primary font-medium">
                            {parsed.skills.length} skills extracted
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="View / Download"
                  >
                    <Download className="size-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    disabled={deletingId === resume.id || isPending}
                    className="p-2.5 rounded-xl border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Resume"
                  >
                    {deletingId === resume.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
