import React, { useState } from "react";
import {
  Sparkles,
  Target,
  Briefcase,
  Loader2,
  Save,
} from "lucide-react";
import {
  TailoredResumePayload,
  TailoringPreset,
  ResumeMetadata,
} from "@/types/resume";
import { UserProfileData } from "@/types/profile";
import { StrategySelector } from "./strategy-selector";
import { AtsBreakdownCard } from "./ats-breakdown-card";
import { JakesResumePreview } from "./jakes-resume-preview";
import {
  generateAITailoredResumeAction,
  saveTailoredResumeAction,
} from "@/lib/actions/tailored-resume-actions";

interface TailorFormViewProps {
  userProfile: UserProfileData | null;
  savedJobs: Array<{ id: string; title: string; company: string; description?: string | null }>;
  onTailoredSaved: (newResume: ResumeMetadata) => void;
  setErrorMessage: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
}

export function TailorFormView({
  userProfile,
  savedJobs,
  onTailoredSaved,
  setErrorMessage,
  setSuccessMessage,
}: TailorFormViewProps) {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoringPreset, setTailoringPreset] =
    useState<TailoringPreset>("ats_optimized");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    userProfile?.projects?.map((p) => p.id!).filter(Boolean) || []
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [tailoredResult, setTailoredResult] =
    useState<TailoredResumePayload | null>(null);
  const [isSavingTailored, setIsSavingTailored] = useState(false);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    if (!jobId) return;

    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setTargetRole(job.title || "");
      setTargetCompany(job.company || "");
      setJobDescription(job.description || "");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setErrorMessage("Please paste the job description or select a saved job.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setTailoredResult(null);

    try {
      const result = await generateAITailoredResumeAction({
        jobDescription,
        targetRole: targetRole || undefined,
        targetCompany: targetCompany || undefined,
        preset: tailoringPreset,
        selectedProjectIds:
          selectedProjectIds.length > 0 ? selectedProjectIds : undefined,
      });

      if (result.success && result.data) {
        setTailoredResult(result.data);
        setSuccessMessage(
          `Generated Jake's ATS Resume tailored for ${result.data.targetRole || "target job"}!`
        );
      } else if (!result.success) {
        setErrorMessage(result.error || "Failed to tailor resume with AI.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred during AI resume tailoring.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCompiledPdf = async () => {
    if (!tailoredResult) return;

    setIsSavingTailored(true);
    setErrorMessage(null);

    try {
      const result = await saveTailoredResumeAction(tailoredResult, true);
      if (result.success && result.data) {
        onTailoredSaved(result.data);
        setSuccessMessage(
          "Tailored Jake's Resume compiled to PDF and set as default active resume!"
        );
      } else if (!result.success) {
        setErrorMessage(result.error || "Failed to save tailored resume.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred while saving the resume.");
    } finally {
      setIsSavingTailored(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handleGenerate}
            className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4"
          >
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Target className="size-4 text-primary" />
                Target Job Specification
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paste the job description to match ATS keywords and align experience.
              </p>
            </div>

            {savedJobs.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Auto-fill from Saved Jobs
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => handleJobSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 text-foreground"
                >
                  <option value="">-- Choose a Saved Job --</option>
                  {savedJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.company} — {j.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Company Name
                </label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Stripe, Inc."
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Job Description / Key Requirements *
              </label>
              <textarea
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description text here..."
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 resize-none font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block">
                Tailoring Strategy &amp; Tone Preset
              </label>
              <StrategySelector
                value={tailoringPreset}
                onChange={setTailoringPreset}
              />
            </div>

            {userProfile?.projects && userProfile.projects.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">
                  Include Projects from Context Hub
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-lg bg-muted/40 border border-border text-xs">
                  {userProfile.projects.map((proj) => (
                    <label
                      key={proj.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.includes(proj.id!)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjectIds([...selectedProjectIds, proj.id!]);
                          } else {
                            setSelectedProjectIds(
                              selectedProjectIds.filter((id) => id !== proj.id)
                            );
                          }
                        }}
                        className="rounded border-input text-primary"
                      />
                      <span className="text-foreground font-medium truncate">
                        {proj.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs inline-flex items-center justify-center gap-2 hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Gemini AI is analyzing JD &amp; tailoring LaTeX...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Generate Jake&apos;s ATS Resume</span>
                </>
              )}
            </button>
          </form>

          {tailoredResult && (
            <AtsBreakdownCard
              atsScore={tailoredResult.atsScore}
              scoreBreakdown={tailoredResult.scoreBreakdown}
              matchedSkills={tailoredResult.matchedSkills}
              missingSkills={tailoredResult.missingSkills}
              recommendations={tailoredResult.recommendations}
            />
          )}
        </div>

        {/* Right Column: Live Jake's Resume Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Jake&apos;s Resume (Overleaf ATS Gold Standard Preview)
            </h3>

            {tailoredResult && (
              <button
                type="button"
                onClick={handleSaveCompiledPdf}
                disabled={isSavingTailored}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isSavingTailored ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span>Save Compiled PDF &amp; Set Active</span>
              </button>
            )}
          </div>

          <div className="bg-muted/30 border border-border rounded-xl p-4 min-h-[600px] flex items-center justify-center">
            {tailoredResult ? (
              <JakesResumePreview payload={tailoredResult} />
            ) : (
              <div className="text-center p-8">
                <Briefcase className="size-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <h4 className="text-sm font-medium text-foreground">
                  Ready to Tailor Your Next Offer
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Fill in the target role and job description on the left, then click
                  Generate to preview your ATS-optimized Jake&apos;s Resume live.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
