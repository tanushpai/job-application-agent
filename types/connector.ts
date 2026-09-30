/**
 * Strongly typed domain interfaces for Job Source Connectors and Custom Company Portals.
 */

export interface ConnectorSourceInfo {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  websiteUrl: string;
  logoUrl?: string | null;
  status: string;
  jobCount: number;
  lastFetchedAt?: Date | null;
  lastErrorAt?: Date | null;
  lastError?: string | null;
  isEnabled?: boolean;
}

export interface CustomCompanyConnectorInfo {
  id: string;
  userId: string;
  companyName: string;
  careersUrl: string;
  logoUrl?: string | null;
  targetRoles: string[];
  status: string;
  lastSyncedAt?: Date | null;
  jobCount: number;
  lastError?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
