"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Trash2,
  UploadCloud,
  HardDrive,
  CheckCircle2,
  Loader2,
  Sparkles,
  ExternalLink,
  Target,
  Zap,
  Cpu,
  BarChart3,
  Award,
  Layers,
  Star,
  Check,
  AlertCircle,
  Eye,
  Plus,
  RefreshCw,
  FolderGit2,
  Briefcase,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteResume,
  uploadAndParseResume,
} from "@/lib/actions/resume-actions";
import {
  generateAITailoredResumeAction,
  saveTailoredResumeAction,
  setDefaultResumeAction,
} from "@/lib/actions/tailored-resume-actions";
import { TailoredResumePayload } from "@/lib/ai/gemini-tailor";
import { JakesResumePreview } from "./jakes-resume-preview";

interface ResumeStudioProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialResumes: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProfile: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  savedJobs?: any[];
}

export function ResumeStudio({
  initialResumes,
  userProfile,
  savedJobs = [],
}: ResumeStudioProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [activeTab, setActiveTab] = useState("library");

  // Library states
  const [, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<TailoredResumePayload | null>(
    null
  );
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Generator states
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoringPreset, setTailoringPreset] = useState<
    "ats_optimized" | "metric_heavy" | "technical_depth" | "executive"
  >("ats_optimized");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    userProfile?.projects?.map((p: { id: string }) => p.id) || []
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [tailoredResult, setTailoredResult] =
    useState<TailoredResumePayload | null>(null);
  const [isSavingTailored, setIsSavingTailored] = useState(false);
  const [savedTailoredFileUrl, setSavedTailoredFileUrl] = useState<string | null>(
    null
  );

  // Handle saved job selection
  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    if (!jobId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = savedJobs.find((j: any) => j.id === jobId || j.job?.id === jobId);
    const jobData = job?.job || job;
    if (jobData) {
      setTargetRole(jobData.title || "");
      setTargetCompany(jobData.company || "");
      setJobDescription(
        jobData.description ||
          `Position: ${jobData.title} at ${jobData.company}\nLocation: ${
            jobData.location || "Remote"
          }\nRequired Skills: ${jobData.skills?.join(", ") || ""}`
      );
    }
  };

  // Upload Base Resume
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
        setSuccessMessage("Base resume uploaded and profile synced!");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to upload resume.");
      }
      setIsUploading(false);
    });
  };

  // Delete resume
  const handleDelete = (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    setDeletingId(resumeId);
    startTransition(async () => {
      const res = await deleteResume(resumeId);
      if (res.success) {
        setResumes((prev) => prev.filter((r) => r.id !== resumeId));
        setSuccessMessage("Resume deleted.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to delete.");
      }
      setDeletingId(null);
    });
  };

  // Set default resume
  const handleSetDefault = async (resumeId: string) => {
    setSettingDefaultId(resumeId);
    try {
      const res = await setDefaultResumeAction(resumeId);
      if (res.success) {
        setResumes((prev) =>
          prev.map((r) => ({ ...r, isDefault: r.id === resumeId }))
        );
        setSuccessMessage("Primary default resume updated.");
        router.refresh();
      }
    } finally {
      setSettingDefaultId(null);
    }
  };

  // Generate Tailored Resume Action
  const handleGenerateTailored = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      alert("Please paste or select a Job Description.");
      return;
    }

    setIsGenerating(true);
    setTailoredResult(null);
    setSavedTailoredFileUrl(null);
    setErrorMessage(null);

    try {
      const res = await generateAITailoredResumeAction({
        jobDescription,
        targetRole,
        targetCompany,
        preset: tailoringPreset,
        selectedProjectIds,
      });

      if (res.success && res.payload) {
        setTailoredResult(res.payload);
        setSuccessMessage("Tailored ATS resume generated successfully!");
      } else {
        setErrorMessage(res.error || "Failed to generate tailored resume.");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error generating resume."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Tailored Resume to Library
  const handleSaveTailoredToLibrary = async () => {
    if (!tailoredResult) return;
    setIsSavingTailored(true);
    try {
      const res = await saveTailoredResumeAction(tailoredResult);
      if (res.success && res.fileUrl) {
        setSavedTailoredFileUrl(res.fileUrl);
        setSuccessMessage(
          "Resume saved to library and compiled as Jake's ATS vector PDF!"
        );
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to save tailored resume.");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to compile PDF."
      );
    } finally {
      setIsSavingTailored(false);
    }
  };

  // Open Preview for existing resume
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenPreview = (resume: any) => {
    if (resume.parsedData) {
      setPreviewResume(resume.parsedData);
      setPreviewFileUrl(resume.fileUrl);
      setIsPreviewOpen(true);
    } else {
      window.open(resume.fileUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              AI Resume Studio
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 gap-1 font-semibold"
            >
              <Sparkles className="size-3" />
              <span>Jake&apos;s ATS Standard</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Store rich project context, generate job-specific ATS resumes with Gemini AI, and manage tailored copies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Base Upload Button */}
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer">
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Parsing with Gemini...</span>
              </>
            ) : (
              <>
                <UploadCloud className="size-4" />
                <span>Upload Base Resume</span>
              </>
            )}
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60 rounded-2xl max-w-md">
          <TabsTrigger
            value="library"
            className="rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="size-4" />
              <span>Resumes Library</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] ml-1">
                {resumes.length}
              </Badge>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="tailor"
            className="rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>AI Tailor Studio</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: RESUMES LIBRARY
        ───────────────────────────────────────────────────────────── */}
        <TabsContent value="library" className="space-y-4">
          {resumes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card/40">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <FileText className="size-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">No Resumes Yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
                Upload your base resume or use our AI Tailor Studio to generate your first ATS-optimized resume.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => setActiveTab("tailor")}
                  className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold gap-2"
                >
                  <Sparkles className="size-4" />
                  <span>Create Tailored Resume</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => {
                const isDefault = resume.isDefault;
                const isTailored = resume.isTailored;
                const atsScore = resume.atsScore;

                return (
                  <Card
                    key={resume.id}
                    className={`relative rounded-3xl border transition-all duration-200 hover:shadow-md ${
                      isDefault
                        ? "border-primary/40 bg-card shadow-xs ring-1 ring-primary/20"
                        : "border-border/80 bg-card"
                    }`}
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isDefault && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-semibold gap-1">
                              <Star className="size-3 fill-primary text-primary" />
                              <span>Primary Default</span>
                            </Badge>
                          )}
                          {isTailored ? (
                            <Badge
                              variant="secondary"
                              className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] font-semibold gap-1"
                            >
                              <Sparkles className="size-3" />
                              <span>AI Tailored</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-muted-foreground"
                            >
                              Uploaded Master
                            </Badge>
                          )}
                        </div>

                        {atsScore && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                              atsScore >= 80
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : atsScore >= 60
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            }`}
                          >
                            {atsScore}% ATS
                          </span>
                        )}
                      </div>

                      {/* Title & Info */}
                      <div>
                        <h4 className="font-bold text-sm text-foreground line-clamp-1">
                          {resume.title || resume.fileName}
                        </h4>
                        {resume.targetRole && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Target: <span className="text-foreground font-medium">{resume.targetRole}</span>
                            {resume.targetCompany && ` @ ${resume.targetCompany}`}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Added {new Date(resume.createdAt).toLocaleDateString()} •{" "}
                          {(resume.fileSize / 1024).toFixed(0)} KB
                        </p>
                      </div>

                      {/* Matched Keywords Snippet */}
                      {resume.matchedSkills && resume.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resume.matchedSkills.slice(0, 4).map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-foreground/80"
                            >
                              {skill}
                            </span>
                          ))}
                          {resume.matchedSkills.length > 4 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{resume.matchedSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPreview(resume)}
                            className="h-8 rounded-xl text-xs gap-1 cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                            <span>Preview</span>
                          </Button>

                          <a
                            href={resume.fileUrl}
                            download={resume.fileName}
                            className="h-8 px-2.5 inline-flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="size-3.5" />
                          </a>
                        </div>

                        <div className="flex items-center gap-1">
                          {!isDefault && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={settingDefaultId === resume.id}
                              onClick={() => handleSetDefault(resume.id)}
                              className="h-8 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {settingDefaultId === resume.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                "Set Default"
                              )}
                            </Button>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === resume.id}
                            onClick={() => handleDelete(resume.id)}
                            className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            {deletingId === resume.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: AI RESUME TAILOR STUDIO
        ───────────────────────────────────────────────────────────── */}
        <TabsContent value="tailor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-5 space-y-5">
              <form
                onSubmit={handleGenerateTailored}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-5"
              >
                <div className="border-b border-border/60 pb-3">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span>Tailor Strategy &amp; Job Context</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Align your master profile and projects against a specific Job Description.
                  </p>
                </div>

                {/* Optional: Pick from Saved Jobs */}
                {savedJobs && savedJobs.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Auto-fill from Saved Jobs
                    </label>
                    <select
                      value={selectedJobId}
                      onChange={(e) => handleJobSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      <option value="">-- Or paste raw JD below --</option>
                      {savedJobs.map((sj: { id: string; job?: { id: string; title: string; company: string }; title?: string; company?: string }) => {
                        const job = sj.job || sj;
                        return (
                          <option key={sj.id} value={sj.id}>
                            {job.title} at {job.company}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Target Role & Company */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Target Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Staff Frontend"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Target Company
                    </label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Stripe, Airbnb"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Job Description (JD) *
                  </label>
                  <textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description, requirements, and responsibilities here..."
                    required
                    className="w-full p-3.5 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none leading-relaxed"
                  />
                </div>

                {/* Tailoring Presets */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Optimization Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: "ats_optimized",
                        title: "🎯 ATS-Optimized",
                        desc: "Exact keyword matching & algorithmic parsing",
                      },
                      {
                        id: "metric_heavy",
                        title: "📊 Metric-Heavy",
                        desc: "Google XYZ formula (Accomplished X by Y doing Z)",
                      },
                      {
                        id: "technical_depth",
                        title: "💻 Technical Depth",
                        desc: "System design, architecture & low-level nuance",
                      },
                      {
                        id: "executive",
                        title: "⚡ Executive 1-Page",
                        desc: "High-level strategic impact & dense clarity",
                      },
                    ].map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() =>
                          setTailoringPreset(
                            preset.id as
                              | "ats_optimized"
                              | "metric_heavy"
                              | "technical_depth"
                              | "executive"
                          )
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          tailoringPreset === preset.id
                            ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                            : "border-border/70 hover:border-border hover:bg-muted/30"
                        }`}
                      >
                        <div className="font-semibold text-xs text-foreground">
                          {preset.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {preset.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Inclusion */}
                {userProfile?.projects && userProfile.projects.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Include Projects ({selectedProjectIds.length}/{userProfile.projects.length})
                    </label>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {userProfile.projects.map((proj: any) => {
                        const isChecked = selectedProjectIds.includes(proj.id);
                        return (
                          <label
                            key={proj.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/40 text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProjectIds((prev) => [...prev, proj.id]);
                                } else {
                                  setSelectedProjectIds((prev) =>
                                    prev.filter((id) => id !== proj.id)
                                  );
                                }
                              }}
                              className="rounded border-border text-primary focus:ring-primary/20"
                            />
                            <span className="font-medium text-foreground line-clamp-1">
                              {proj.title}
                            </span>
                            {proj.techStack?.length > 0 && (
                              <span className="text-[10px] text-muted-foreground ml-auto line-clamp-1">
                                {proj.techStack.slice(0, 2).join(", ")}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold shadow-md py-3 gap-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Analyzing JD &amp; Formatting Jake&apos;s ATS Resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Generate Tailored Resume with Gemini</span>
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Right Column: ATS Intelligence & Live Preview */}
            <div className="lg:col-span-7 space-y-4">
              {isGenerating ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-primary/30 bg-primary/5 min-h-[500px] flex flex-col items-center justify-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="absolute size-6 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h4 className="font-bold text-sm sm:text-base text-foreground">
                      Gemini AI ATS Optimizer in Progress
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Scanning JD keywords, aligning quantifiable metrics via Google XYZ formula, and structuring Jake&apos;s Resume standard...
                    </p>
                  </div>
                </div>
              ) : tailoredResult ? (
                <div className="space-y-4">
                  {/* ATS Match Intelligence Card */}
                  <Card className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          ATS Optimization Score
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-2xl font-black text-foreground">
                            {tailoredResult.atsScore}%
                          </span>
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                            ATS Ready (Jake&apos;s Template)
                          </Badge>
                        </div>
                      </div>

                      {/* Score Breakdown Bars */}
                      {tailoredResult.scoreBreakdown && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div>
                            <span className="block font-bold text-foreground">
                              {tailoredResult.scoreBreakdown.keywordMatch}%
                            </span>
                            <span>Keywords</span>
                          </div>
                          <div>
                            <span className="block font-bold text-foreground">
                              {tailoredResult.scoreBreakdown.experienceRelevance}%
                            </span>
                            <span>Experience</span>
                          </div>
                          <div>
                            <span className="block font-bold text-foreground">
                              {tailoredResult.scoreBreakdown.skillsAlignment}%
                            </span>
                            <span>Skills</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Matched vs Missing Skills Chips */}
                    <div className="space-y-2">
                      {tailoredResult.matchedSkills?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                            Matched Skills:
                          </span>
                          {tailoredResult.matchedSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold"
                            >
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {tailoredResult.missingSkills?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                            JD Keyword Gaps:
                          </span>
                          {tailoredResult.missingSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-medium"
                            >
                              + {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AI Recommendations */}
                    {tailoredResult.recommendations?.length > 0 && (
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <Zap className="size-3.5 text-amber-500" />
                          <span>AI Recruiter Insights:</span>
                        </span>
                        <ul className="list-disc ml-4 space-y-0.5 text-[11px]">
                          {tailoredResult.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>

                  {/* Live Jake's Resume Render */}
                  <JakesResumePreview
                    resume={tailoredResult}
                    onSaveToLibrary={handleSaveTailoredToLibrary}
                    isSaving={isSavingTailored}
                    savedFileUrl={savedTailoredFileUrl}
                  />
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card/40 min-h-[500px] flex flex-col items-center justify-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <Sparkles className="size-7" />
                  </div>
                  <h4 className="font-bold text-base text-foreground">
                    Ready to Generate Tailored Resume
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                    Paste a job description on the left and click &quot;Generate Tailored Resume&quot; to build a custom Jake&apos;s ATS resume.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog for Library Resumes */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border-border/80 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>Jake&apos;s Resume ATS Preview</span>
            </DialogTitle>
          </DialogHeader>

          {previewResume && (
            <JakesResumePreview
              resume={previewResume}
              savedFileUrl={previewFileUrl}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
