"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResumeMetadata, TailoredResumePayload } from "@/types/resume";
import { UserProfileData } from "@/types/profile";
import { ResumeListView } from "./resume-list-view";
import { TailorFormView } from "./tailor-form-view";
import { JakesResumePreview } from "./jakes-resume-preview";

interface ResumeStudioProps {
  initialResumes: ResumeMetadata[];
  userProfile: UserProfileData | null;
  savedJobs?: Array<{ id: string; title: string; company: string; description?: string | null }>;
}

export function ResumeStudio({
  initialResumes,
  userProfile,
  savedJobs = [],
}: ResumeStudioProps) {
  const [resumes, setResumes] = useState<ResumeMetadata[]>(initialResumes);
  const [activeTab, setActiveTab] = useState("library");

  const [previewResume, setPreviewResume] = useState<TailoredResumePayload | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenPreview = (
    resume: TailoredResumePayload | null,
    fileUrl: string | null
  ) => {
    setPreviewResume(resume);
    setPreviewFileUrl(fileUrl);
    setIsPreviewOpen(true);
  };

  const handleTailoredSaved = (newResume: ResumeMetadata) => {
    setResumes((prev) => [
      newResume,
      ...prev.map((r) => ({
        ...r,
        isDefault: false,
      })),
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl">
          <CheckCircle2 className="size-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          <AlertCircle className="size-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md h-auto p-1 bg-muted/60 rounded-xl mb-6">
          <TabsTrigger value="library" className="text-xs py-2 gap-1.5">
            <FileText className="size-3.5" />
            <span>Resumes Library ({resumes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="tailor" className="text-xs py-2 gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span>AI Tailor Studio (Jake&apos;s)</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          <ResumeListView
            resumes={resumes}
            setResumes={setResumes}
            onOpenPreview={handleOpenPreview}
            onNavigateToTailor={() => setActiveTab("tailor")}
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
          />
        </TabsContent>

        <TabsContent value="tailor">
          <TailorFormView
            userProfile={userProfile}
            savedJobs={savedJobs}
            onTailoredSaved={handleTailoredSaved}
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
          />
        </TabsContent>
      </Tabs>

      {/* PDF / LaTeX Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Document Preview</DialogTitle>
          </DialogHeader>

          {previewResume ? (
            <JakesResumePreview payload={previewResume} />
          ) : previewFileUrl ? (
            <div className="w-full h-[75vh]">
              <iframe
                src={previewFileUrl}
                className="w-full h-full rounded-lg border border-border"
                title="Resume Preview Frame"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
