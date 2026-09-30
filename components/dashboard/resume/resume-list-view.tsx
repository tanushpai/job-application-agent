import React, { useState } from "react";
import {
  FileText,
  Download,
  Trash2,
  UploadCloud,
  Loader2,
  Sparkles,
  Eye,
} from "lucide-react";
import { ResumeMetadata, TailoredResumePayload } from "@/types/resume";
import {
  deleteResume,
  uploadAndParseResume,
} from "@/lib/actions/resume-actions";
import { setDefaultResumeAction } from "@/lib/actions/tailored-resume-actions";

interface ResumeListViewProps {
  resumes: ResumeMetadata[];
  setResumes: React.Dispatch<React.SetStateAction<ResumeMetadata[]>>;
  onOpenPreview: (resume: TailoredResumePayload | null, fileUrl: string | null) => void;
  onNavigateToTailor: () => void;
  setErrorMessage: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
}

export function ResumeListView({
  resumes,
  setResumes,
  onOpenPreview,
  onNavigateToTailor,
  setErrorMessage,
  setSuccessMessage,
}: ResumeListViewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadAndParseResume(formData);
      if (result.success && result.resume) {
        setResumes((prev) => [result.resume as unknown as ResumeMetadata, ...prev]);
        setSuccessMessage("Resume uploaded and parsed successfully!");
      } else {
        setErrorMessage(result.error || "Failed to upload resume.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setDeletingId(resumeId);
    setErrorMessage(null);

    try {
      const result = await deleteResume(resumeId);
      if (result.success) {
        setResumes((prev) => prev.filter((r) => r.id !== resumeId));
        setSuccessMessage("Resume deleted.");
      } else {
        setErrorMessage(result.error || "Failed to delete resume.");
      }
    } catch {
      setErrorMessage("Failed to delete resume.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (resumeId: string) => {
    setSettingDefaultId(resumeId);
    setErrorMessage(null);

    try {
      const result = await setDefaultResumeAction(resumeId);
      if (result.success) {
        setResumes((prev) =>
          prev.map((r) => ({
            ...r,
            isDefault: r.id === resumeId,
          }))
        );
        setSuccessMessage("Default active resume updated.");
      } else {
        setErrorMessage(result.error || "Failed to set default resume.");
      }
    } catch {
      setErrorMessage("Failed to set default resume.");
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Action Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-card border border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Manage &amp; Upload Base Resumes
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload your existing PDF or DOCX resume to extract base career history.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg border border-border transition-colors">
            {isUploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <UploadCloud className="size-3.5" />
            )}
            <span>{isUploading ? "Parsing..." : "Upload Base PDF"}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>

          <button
            type="button"
            onClick={onNavigateToTailor}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
          >
            <Sparkles className="size-3.5" />
            <span>AI Tailor for Job</span>
          </button>
        </div>
      </div>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-card border border-dashed border-border">
          <FileText className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-medium text-foreground">No Resumes in Library</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Upload your master resume or generate an ATS-optimized Jake&apos;s Resume with AI.
          </p>
          <button
            type="button"
            onClick={onNavigateToTailor}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg"
          >
            <Sparkles className="size-3.5" />
            Create First Tailored Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between relative group hover:border-border/80 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                        {resume.title || resume.fileName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {resume.targetCompany
                          ? `${resume.targetCompany} • ${resume.targetRole || "Tailored"}`
                          : resume.isTailored
                          ? "Jake's LaTeX Format"
                          : "Uploaded Base Resume"}
                      </p>
                    </div>
                  </div>

                  {resume.isDefault && (
                    <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      DEFAULT
                    </span>
                  )}
                </div>

                {resume.atsScore !== null && resume.atsScore !== undefined && (
                  <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                    <span className="text-muted-foreground font-medium">ATS Match Score:</span>
                    <span
                      className={`font-bold ${
                        resume.atsScore >= 85
                          ? "text-emerald-500"
                          : resume.atsScore >= 70
                          ? "text-amber-500"
                          : "text-destructive"
                      }`}
                    >
                      {resume.atsScore}%
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenPreview(null, resume.fileUrl)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                    title="View PDF"
                  >
                    <Eye className="size-4" />
                  </button>

                  <a
                    href={resume.fileUrl}
                    download={resume.fileName}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                    title="Download File"
                  >
                    <Download className="size-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(resume.id)}
                    disabled={deletingId === resume.id}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                    title="Delete Resume"
                  >
                    {deletingId === resume.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>

                {!resume.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(resume.id)}
                    disabled={settingDefaultId === resume.id}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    {settingDefaultId === resume.id ? "Setting..." : "Set as Default"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
