/**
 * Strongly typed domain interfaces for User Profiles, Experience, Projects, and Education.
 */

export interface SkillItem {
  id?: string;
  name: string;
  category?: string;
}

export interface ExperienceItem {
  id?: string;
  company: string;
  title: string;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
  highlights?: string[];
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  grade?: string | null;
}

export interface ProjectItem {
  id?: string;
  title: string;
  role?: string | null;
  description?: string | null;
  highlights?: string[];
  techStack?: string[];
  link?: string | null;
  githubUrl?: string | null;
  challenges?: string | null;
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer?: string | null;
  issueDate?: string | null;
  url?: string | null;
}

export interface UserProfileData {
  id?: string;
  userId?: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  summary?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  skills: SkillItem[];
  experiences: ExperienceItem[];
  educations: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}
