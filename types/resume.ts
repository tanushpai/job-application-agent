/**
 * Strongly typed domain interfaces for Resumes, ATS Scoring, and Jake's Resume Template.
 */

export type TailoringPreset =
  | "ats_optimized"
  | "metric_heavy"
  | "technical_depth"
  | "executive";

export interface AtsScoreBreakdown {
  keywordMatch: number;
  experienceRelevance: number;
  skillsAlignment: number;
  formattingReadiness: number;
}

export interface JakesResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface JakesResumeCategorizedSkills {
  languages: string[];
  frameworksAndLibraries: string[];
  developerTools: string[];
  cloudAndDatabases: string[];
}

export interface JakesResumeExperienceItem {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface JakesResumeProjectItem {
  title: string;
  role?: string;
  techStack: string[];
  link?: string;
  githubUrl?: string;
  highlights: string[];
}

export interface JakesResumeEducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade?: string;
}

export interface JakesResumeCertificationItem {
  name: string;
  issuer?: string;
  issueDate?: string;
  url?: string;
}

export interface TailoredResumePayload {
  title: string;
  targetRole: string;
  targetCompany: string;
  preset: TailoringPreset;
  atsScore: number;
  scoreBreakdown: AtsScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];

  // Jake's Resume Standard Content
  personalInfo: JakesResumePersonalInfo;
  summary: string;
  skillsCategorized: JakesResumeCategorizedSkills;
  experiences: JakesResumeExperienceItem[];
  projects: JakesResumeProjectItem[];
  educations: JakesResumeEducationItem[];
  certifications?: JakesResumeCertificationItem[];
}

export interface ResumeMetadata {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  title: string | null;
  isTailored: boolean;
  targetRole: string | null;
  targetCompany: string | null;
  tailoringPreset: string | null;
  atsScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  jobDescription: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
