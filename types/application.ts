/**
 * Strongly typed domain interfaces for Automated Job Applications and Execution Events.
 */

export type ApplicationStatus =
  | "QUEUED"
  | "DETECTING_PLATFORM"
  | "OPENING_BROWSER"
  | "DETECTING_FORM"
  | "MAPPING_PROFILE"
  | "MISSING_PROFILE_INFO"
  | "READY_TO_APPLY"
  | "FILLING_FORM"
  | "UPLOADING_RESUME"
  | "VALIDATING"
  | "SUBMITTING"
  | "VERIFYING_SUBMISSION"
  | "APPLIED"
  | "REQUIRES_USER_ACTION"
  | "FAILED"
  | "CANCELLED";

export type ApplicationMode = "MANUAL" | "AUTOMATIC";

export interface MissingFieldInfo {
  field: string;
  label: string;
  reason: string;
}

export interface CustomQuestionAnswer {
  question: string;
  answer: string;
  confidence: number;
}

export interface ApplicationRecord {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string | null;
  mode: ApplicationMode;
  status: ApplicationStatus;
  platform: string;
  missingFields?: MissingFieldInfo[];
  customQuestions?: CustomQuestionAnswer[];
  appliedUrl?: string | null;
  submittedAt?: Date | null;
  failureReason?: string | null;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}
