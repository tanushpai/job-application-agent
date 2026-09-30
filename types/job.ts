/**
 * Strongly typed domain interfaces for Job Listings, Scraped Payloads, and Filters.
 */

export type JobLocationType = "remote" | "onsite" | "hybrid";
export type JobType = "full_time" | "part_time" | "contract" | "internship";

export interface JobListing {
  id: string;
  externalId?: string | null;
  title: string;
  company: string;
  companyLogo?: string | null;
  location?: string | null;
  locationType?: string | null;
  jobType?: string | null;
  experienceLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  description?: string | null;
  skills: string[];
  jobUrl: string;
  applyUrl?: string | null;
  postedAt?: Date | null;
  closedAt?: Date | null;
  isActive: boolean;
  firstSeenAt: Date;
  lastSeenAt: Date;
  isSaved?: boolean;
}

export interface ScrapedJobPayload {
  externalId?: string;
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  locationType?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description?: string;
  skills?: string[];
  jobUrl: string;
  applyUrl?: string;
  postedAt?: Date | string;
}

export interface JobFilterCriteria {
  query?: string;
  location?: string;
  locationType?: string;
  jobType?: string;
  experienceLevel?: string;
  connectorId?: string;
  company?: string;
  skills?: string[];
  minSalary?: number;
  isSavedOnly?: boolean;
}
