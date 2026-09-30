"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateUserProfile } from "@/lib/actions/profile-actions";
import { PersonalInfoTab, GeneralInfoState } from "@/components/dashboard/profile/personal-info-tab";
import { ExperienceTab } from "@/components/dashboard/profile/experience-tab";
import { EducationTab } from "@/components/dashboard/profile/education-tab";
import { SkillsTab } from "@/components/dashboard/profile/skills-tab";
import { ProjectsTab } from "@/components/dashboard/profile/projects-tab";
import { CertificationsTab } from "@/components/dashboard/profile/certifications-tab";
import { UserProfileData, SkillItem, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/types/profile";

interface ProfileTabsFormProps {
  initialProfile: UserProfileData | null;
}

export function ProfileTabsForm({ initialProfile }: ProfileTabsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [general, setGeneral] = useState<GeneralInfoState>({
    fullName: initialProfile?.fullName || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    location: initialProfile?.location || "",
    headline: initialProfile?.headline || "",
    summary: initialProfile?.summary || "",
    website: initialProfile?.website || "",
    linkedin: initialProfile?.linkedin || "",
    github: initialProfile?.github || "",
    twitter: initialProfile?.twitter || "",
  });

  const [skills, setSkills] = useState<SkillItem[]>(initialProfile?.skills || []);
  const [experiences, setExperiences] = useState<ExperienceItem[]>(initialProfile?.experiences || []);
  const [educations, setEducations] = useState<EducationItem[]>(initialProfile?.educations || []);
  const [projects, setProjects] = useState<ProjectItem[]>(initialProfile?.projects || []);
  const [certifications, setCertifications] = useState<CertificationItem[]>(initialProfile?.certifications || []);

  const handleGeneralChange = (field: keyof GeneralInfoState, value: string) => {
    setGeneral((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSaveMessage(null);
    startTransition(async () => {
      try {
        const payload = {
          ...general,
          skills: skills.map((s) => ({ name: s.name, category: s.category || "Technical" })),
          experiences,
          educations,
          projects,
          certifications,
        };

        const result = await updateUserProfile(payload);
        if (result.success) {
          setSaveMessage({ type: "success", text: "Profile & Project Context saved successfully!" });
          router.refresh();
        } else {
          setSaveMessage({ type: "error", text: result.error || "Failed to save profile." });
        }
      } catch {
        setSaveMessage({ type: "error", text: "An unexpected error occurred while saving." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Save / Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl">
        <div className="flex items-center gap-2">
          {saveMessage && (
            <div
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg ${
                saveMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {saveMessage.type === "success" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <AlertCircle className="size-4" />
              )}
              <span>{saveMessage.text}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>Save Profile</span>
        </button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full h-auto p-1 bg-muted/60 rounded-xl mb-6">
          <TabsTrigger value="general" className="text-xs py-2 gap-1.5">
            <User className="size-3.5" />
            <span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="text-xs py-2 gap-1.5">
            <Briefcase className="size-3.5" />
            <span>Experience</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="text-xs py-2 gap-1.5">
            <GraduationCap className="size-3.5" />
            <span>Education</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs py-2 gap-1.5">
            <Wrench className="size-3.5" />
            <span>Skills</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-xs py-2 gap-1.5">
            <FolderGit2 className="size-3.5" />
            <span>Projects Hub</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="text-xs py-2 gap-1.5">
            <Award className="size-3.5" />
            <span>Certs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <PersonalInfoTab general={general} onChange={handleGeneralChange} />
        </TabsContent>

        <TabsContent value="experience">
          <ExperienceTab experiences={experiences} setExperiences={setExperiences} />
        </TabsContent>

        <TabsContent value="education">
          <EducationTab educations={educations} setEducations={setEducations} />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsTab skills={skills} setSkills={setSkills} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsTab projects={projects} setProjects={setProjects} />
        </TabsContent>

        <TabsContent value="certifications">
          <CertificationsTab
            certifications={certifications}
            setCertifications={setCertifications}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
