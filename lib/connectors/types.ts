export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'other';
export type LocationType = 'remote' | 'onsite' | 'hybrid';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export interface NormalizedJob {
  externalId: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  location?: string | null;
  locationType?: LocationType;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  description?: string | null;
  skills: string[];
  jobUrl: string;
  applyUrl?: string | null;
  postedAt?: Date | null;
}

export interface SearchCriteria {
  keywords?: string;
  location?: string;
  remoteOnly?: boolean;
  limit?: number;
}

export interface ConnectorResult {
  jobs: NormalizedJob[];
  totalFound: number;
  hasMore: boolean;
  error?: string;
}

export type ConnectorStatus = 'connected' | 'requires_config' | 'coming_soon' | 'error';
export type ConnectorCategory = 'ats' | 'job_board' | 'remote' | 'other';

export interface ConnectorMetadata {
  slug: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  websiteUrl: string;
  logoUrl?: string;
  status: ConnectorStatus;
  supportsRealTime: boolean;
  requiresAuth: boolean;
}

export interface JobConnector {
  metadata: ConnectorMetadata;
  search(criteria?: SearchCriteria): Promise<ConnectorResult>;
  testConnection?(): Promise<{ success: boolean; message?: string }>;
}
