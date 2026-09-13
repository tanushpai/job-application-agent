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
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Share2,
  Code2,
  MapPin,
  Mail,
  Phone,
  Link2,
  GitBranch,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateUserProfile } from "@/lib/actions/profile-actions";

interface ProfileTabsFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProfile: any;
}

export function ProfileTabsForm({ initialProfile }: ProfileTabsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [general, setGeneral] = useState({
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

  const [skills, setSkills] = useState<Array<{ name: string; category: string }>>(
    initialProfile?.skills?.map((s: { name: string; category: string }) => ({
      name: s.name,
      category: s.category || "Technical",
    })) || []
  );
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Technical");

  const [experiences, setExperiences] = useState<Array<{
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    highlights: string[];
  }>>(
    initialProfile?.experiences?.map((e: {
      company: string;
      title: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      isCurrent?: boolean;
      description?: string;
      highlights?: string[];
    }) => ({
      company: e.company || "",
      title: e.title || "",
      location: e.location || "",
      startDate: e.startDate || "",
      endDate: e.endDate || "",
      isCurrent: Boolean(e.isCurrent),
      description: e.description || "",
      highlights: e.highlights || [],
    })) || []
  );

  const [educations, setEducations] = useState<Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade: string;
  }>>(
    initialProfile?.educations?.map((ed: {
      institution: string;
      degree?: string;
      fieldOfStudy?: string;
      startDate?: string;
      endDate?: string;
      grade?: string;
    }) => ({
      institution: ed.institution || "",
      degree: ed.degree || "",
      fieldOfStudy: ed.fieldOfStudy || "",
      startDate: ed.startDate || "",
      endDate: ed.endDate || "",
      grade: ed.grade || "",
    })) || []
  );

  const [projects, setProjects] = useState<Array<{
    title: string;
    description: string;
    techStack: string[];
    link: string;
  }>>(
    initialProfile?.projects?.map((p: {
      title: string;
      description?: string;
      techStack?: string[];
      link?: string;
    }) => ({
      title: p.title || "",
      description: p.description || "",
      techStack: p.techStack || [],
      link: p.link || "",
    })) || []
  );

  const [certifications, setCertifications] = useState<Array<{
    name: string;
    issuer: string;
    issueDate: string;
    url: string;
  }>>(
    initialProfile?.certifications?.map((c: {
      name: string;
      issuer?: string;
      issueDate?: string;
      url?: string;
    }) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      issueDate: c.issueDate || "",
      url: c.url || "",
    })) || []
  );

  // Handlers for General Info
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneral((prev) => ({ ...prev, [name]: value }));
    setSaveMessage(null);
  };

  // Handlers for Skills
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) return;

    setSkills((prev) => [...prev, { name: newSkillName.trim(), category: newSkillCategory }]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers for Experience
  const handleAddExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        company: "",
        title: "",
        location: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
        highlights: [],
      },
    ]);
  };

  const handleExperienceChange = (index: number, field: string, value: unknown) => {
    setExperiences((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers for Education
  const handleAddEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        grade: "",
      },
    ]);
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setEducations((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveEducation = (index: number) => {
    setEducations((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers for Projects
  const handleAddProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        techStack: [],
        link: "",
      },
    ]);
  };

  const handleProjectChange = (index: number, field: string, value: unknown) => {
    setProjects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveProject = (index: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers for Certifications
  const handleAddCertification = () => {
    setCertifications((prev) => [
      ...prev,
      {
        name: "",
        issuer: "",
        issueDate: "",
        url: "",
      },
    ]);
  };

  const handleCertificationChange = (index: number, field: string, value: string) => {
    setCertifications((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Save full profile
  const handleSaveAll = () => {
    setSaveMessage(null);
    startTransition(async () => {
      const res = await updateUserProfile({
        ...general,
        skills,
        experiences: experiences.filter((e) => e.company.trim() && e.title.trim()),
        educations: educations.filter((ed) => ed.institution.trim()),
        projects: projects.filter((p) => p.title.trim()),
        certifications: certifications.filter((c) => c.name.trim()),
      });

      if (res.success) {
        setSaveMessage({ type: "success", text: "Profile changes saved successfully!" });
        router.refresh();
      } else {
        setSaveMessage({ type: "error", text: res.error || "Failed to save profile." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {saveMessage && (
        <div
          role="status"
          className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium animate-in fade-in duration-200 ${
            saveMessage.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border border-destructive/20 text-destructive"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0" />
          ) : (
            <AlertCircle className="size-5 shrink-0" />
          )}
          <span className="flex-1">{saveMessage.text}</span>
        </div>
      )}

      {/* Tabs Container */}
      <Tabs defaultValue="general" className="w-full">
        {/* Tabs List with Icons */}
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto p-1.5 bg-muted/60 rounded-2xl border border-border/60 gap-1 inline-flex min-w-full sm:min-w-0">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <User className="size-4 shrink-0 text-indigo-500" />
              <span>General &amp; Summary</span>
            </TabsTrigger>

            <TabsTrigger
              value="experience"
              className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <Briefcase className="size-4 shrink-0 text-emerald-500" />
              <span>Experience ({experiences.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="education"
              className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <GraduationCap className="size-4 shrink-0 text-blue-500" />
              <span>Education ({educations.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="skills"
              className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <Wrench className="size-4 shrink-0 text-amber-500" />
              <span>Skills ({skills.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="projects"
              className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <FolderGit2 className="size-4 shrink-0 text-purple-500" />
              <span>Projects ({projects.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="certifications"
              className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <Award className="size-4 shrink-0 text-rose-500" />
              <span>Certifications ({certifications.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: General & Summary */}
        <TabsContent value="general" className="mt-4 space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
              Personal Information &amp; Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={general.fullName}
                    onChange={handleGeneralChange}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Professional Headline / Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="headline"
                    value={general.headline}
                    onChange={handleGeneralChange}
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={general.email}
                    onChange={handleGeneralChange}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={general.phone}
                    onChange={handleGeneralChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Location (City, Country / Remote)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="location"
                    value={general.location}
                    onChange={handleGeneralChange}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Portfolio / Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <input
                    type="url"
                    name="website"
                    value={general.website}
                    onChange={handleGeneralChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <input
                    type="url"
                    name="linkedin"
                    value={general.linkedin}
                    onChange={handleGeneralChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  GitHub URL
                </label>
                <div className="relative">
                  <GitBranch className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <input
                    type="url"
                    name="github"
                    value={general.github}
                    onChange={handleGeneralChange}
                    placeholder="https://github.com/username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Professional Summary
              </label>
              <textarea
                name="summary"
                rows={4}
                value={general.summary}
                onChange={handleGeneralChange}
                placeholder="A compelling overview of your background, core technical skills, and career achievements..."
                className="w-full p-3.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Work Experience */}
        <TabsContent value="experience" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Work Experience</h3>
              <p className="text-xs text-muted-foreground">
                Your past employment history and key accomplishments
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddExperience}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add Experience</span>
            </button>
          </div>

          {experiences.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-dashed border-border bg-card/40 text-muted-foreground">
              No work experience added yet. Click &quot;Add Experience&quot; above.
            </div>
          ) : (
            experiences.map((exp, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4 relative"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="font-bold text-sm text-foreground">
                    Role #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Remove role"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(idx, "startDate", e.target.value)}
                      placeholder="e.g. Jan 2021"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      disabled={exp.isCurrent}
                      value={exp.isCurrent ? "Present" : exp.endDate}
                      onChange={(e) => handleExperienceChange(idx, "endDate", e.target.value)}
                      placeholder="e.g. Present"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`current-${idx}`}
                    checked={exp.isCurrent}
                    onChange={(e) => handleExperienceChange(idx, "isCurrent", e.target.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor={`current-${idx}`} className="text-xs font-medium text-foreground cursor-pointer">
                    I currently work in this role
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Responsibilities &amp; Achievements
                  </label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                    placeholder="Key responsibilities and achievements in this role..."
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Tab 3: Education */}
        <TabsContent value="education" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Education</h3>
              <p className="text-xs text-muted-foreground">
                Degrees, universities, and academic accomplishments
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add Education</span>
            </button>
          </div>

          {educations.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-dashed border-border bg-card/40 text-muted-foreground">
              No education entries added yet.
            </div>
          ) : (
            educations.map((ed, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="font-bold text-sm text-foreground">
                    Education #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(idx)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Institution / University
                    </label>
                    <input
                      type="text"
                      value={ed.institution}
                      onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={ed.degree}
                      onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                      placeholder="e.g. Bachelor of Science"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={ed.fieldOfStudy}
                      onChange={(e) => handleEducationChange(idx, "fieldOfStudy", e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Dates / GPA
                    </label>
                    <input
                      type="text"
                      value={ed.startDate ? `${ed.startDate} - ${ed.endDate || ""}` : ed.grade}
                      onChange={(e) => handleEducationChange(idx, "grade", e.target.value)}
                      placeholder="e.g. 2018 - 2022 • 3.8 GPA"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Tab 4: Skills */}
        <TabsContent value="skills" className="mt-4 space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
              Skills &amp; Expertise
            </h3>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Python, Next.js, System Design"
                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="Technical">Technical</option>
                <option value="Soft">Soft Skill</option>
                <option value="Tools">Tool / Platform</option>
                <option value="Languages">Language</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Add Skill</span>
              </button>
            </form>

            {/* Skill Tags Display */}
            <div className="space-y-4 pt-2">
              {["Technical", "Soft", "Tools", "Languages"].map((cat) => {
                const categorySkills = skills.filter((s) => (s.category || "Technical") === cat);
                if (categorySkills.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {cat} Skills
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((s, i) => {
                        const originalIndex = skills.findIndex((item) => item.name === s.name);
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/80 text-foreground text-xs font-medium border border-border/80 shadow-2xs group"
                          >
                            <span>{s.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(originalIndex)}
                              className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                            >
                              &times;
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: Projects */}
        <TabsContent value="projects" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Featured Projects</h3>
              <p className="text-xs text-muted-foreground">
                Key repositories, products, and applications you built
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddProject}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add Project</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-dashed border-border bg-card/40 text-muted-foreground">
              No projects added yet. Click &quot;Add Project&quot; above.
            </div>
          ) : (
            projects.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="font-bold text-sm text-foreground">
                    Project #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
                      placeholder="e.g. AI Resume Generator"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Live / GitHub URL
                    </label>
                    <input
                      type="url"
                      value={proj.link}
                      onChange={(e) => handleProjectChange(idx, "link", e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Project Description
                  </label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                    placeholder="Brief overview of features, architecture, and results..."
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Tab 6: Certifications */}
        <TabsContent value="certifications" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Certifications &amp; Licenses</h3>
              <p className="text-xs text-muted-foreground">
                Professional certificates and accredited badges
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCertification}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add Certification</span>
            </button>
          </div>

          {certifications.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-dashed border-border bg-card/40 text-muted-foreground">
              No certifications added yet.
            </div>
          ) : (
            certifications.map((cert, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="font-bold text-sm text-foreground">
                    Certificate #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(idx)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Certificate Name
                    </label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(idx, "name", e.target.value)}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Issuing Organization
                    </label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleCertificationChange(idx, "issuer", e.target.value)}
                      placeholder="e.g. Amazon Web Services"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Save Actions Bar */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Auto-saved sections &bull; Click save to persist all changes
        </span>
        <button
          onClick={handleSaveAll}
          disabled={isPending}
          className="py-3 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>Save Profile Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
