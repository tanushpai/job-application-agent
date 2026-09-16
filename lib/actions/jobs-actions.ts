"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/auth";
import { getConnector, getActiveConnectors } from "@/lib/connectors/registry";
import { calculateMatchScore } from "@/lib/jobs/matching";
import { seedConnectorSources } from "./connector-actions";
import { revalidatePath } from "next/cache";

export interface DiscoveredJob {
  id: string;
  externalId?: string | null;
  title: string;
  company: string;
  companyLogo?: string | null;
  location: string;
  locationType: string;
  jobType: string;
  experienceLevel: string;
  skills: string[];
  jobUrl: string;
  applyUrl: string;
  postedAt: Date | null;
  isSaved: boolean;
  matchScore: number;
  connectors: Array<{
    id: string;
    slug: string;
    name: string;
    status: string;
  }>;
}

export interface GetJobsOptions {
  search?: string;
  location?: string; // free-text city/country e.g. "Bangalore", "India", "New York"
  locationType?: string; // "all" | "remote" | "onsite" | "hybrid"
  jobType?: string; // "all" | "full_time" | "part_time" | "contract" | "internship"
  experienceLevel?: string; // "all" | "entry" | "mid" | "senior" | "lead" | "executive"
  minMatchScore?: number; // 0 | 60 | 80
  sortBy?: string; // "match" | "recent" | "company"
  connectorSlug?: string; // filter by specific connector
  savedOnly?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Ingests jobs from a given connector into the database.
 */
async function syncConnectorJobs(slug: string) {
  const connector = getConnector(slug);
  if (!connector || connector.metadata.status !== "connected") return;

  const dbConnector = await prisma.connectorSource.findUnique({
    where: { slug },
  });
  if (!dbConnector) return;

  try {
    const result = await connector.search({ limit: 40 });

    for (const job of result.jobs) {
      try {
        const jobId = job.externalId?.trim() || `${slug}_${Math.random().toString(36).slice(2, 9)}`;

        // Upsert global job
        const dbJob = await prisma.job.upsert({
          where: { id: jobId },
          update: {
            title: job.title,
            company: job.company,
            location: job.location,
            locationType: job.locationType,
            jobType: job.jobType,
            experienceLevel: job.experienceLevel,
            skills: job.skills,
            jobUrl: job.jobUrl,
            applyUrl: job.applyUrl || job.jobUrl,
            lastSeenAt: new Date(),
          },
          create: {
            id: jobId,
            externalId: job.externalId || jobId,
            title: job.title,
            company: job.company,
            location: job.location,
            locationType: job.locationType,
            jobType: job.jobType,
            experienceLevel: job.experienceLevel,
            skills: job.skills,
            jobUrl: job.jobUrl,
            applyUrl: job.applyUrl || job.jobUrl,
            postedAt: job.postedAt || new Date(),
          },
        });

        // Link to JobSource
        await prisma.jobSource.upsert({
          where: {
            jobId_connectorId: {
              jobId: dbJob.id,
              connectorId: dbConnector.id,
            },
          },
          update: {
            fetchedAt: new Date(),
          },
          create: {
            jobId: dbJob.id,
            connectorId: dbConnector.id,
            sourceJobId: job.externalId || jobId,
          },
        });
      } catch (jobErr) {
        console.warn(`[Sync] Skipped job ${job.title} from ${slug}:`, jobErr);
      }
    }

    // Update connector status
    await prisma.connectorSource.update({
      where: { id: dbConnector.id },
      data: {
        lastFetchedAt: new Date(),
        lastError: null,
      },
    });
  } catch (err: any) {
    await prisma.connectorSource.update({
      where: { id: dbConnector.id },
      data: {
        lastErrorAt: new Date(),
        lastError: err?.message || "Sync failed",
      },
    });
  }
}

/**
 * Triggers a live background sync across all enabled connectors.
 */
export async function refreshAllConnectors() {
  await requireAuth();
  await seedConnectorSources();

  const active = getActiveConnectors();
  const syncPromises = active.map(c => syncConnectorJobs(c.metadata.slug));
  await Promise.allSettled(syncPromises);

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/connectors");
  return { success: true };
}

/**
 * Triggers sync for a single connector.
 */
export async function refreshSingleConnector(slug: string) {
  await requireAuth();
  await syncConnectorJobs(slug);
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/connectors");
  return { success: true };
}

/**
 * Retrieves discovered jobs tailored to the user's enabled connectors & profile.
 */
export async function getJobsForUser(options: GetJobsOptions = {}): Promise<DiscoveredJob[]> {
  try {
    const user = await requireAuth();

    // 1. Get user profile for scoring
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { skills: true },
  });

  // 2. Get user disabled connectors
  const disabledPrefs = await prisma.userConnectorPref.findMany({
    where: { userId: user.id, enabled: false },
    select: { connectorId: true },
  });
  const disabledConnectorIds = disabledPrefs.map(p => p.connectorId);

  // Check if we have any jobs at all. If 0, do an initial sync automatically
  const totalJobsCount = await prisma.job.count();
  if (totalJobsCount === 0) {
    await seedConnectorSources();
    const active = getActiveConnectors();
    await Promise.allSettled(active.map(c => syncConnectorJobs(c.metadata.slug)));
  }

  // 3. Build query filters
  const where: any = {
    isActive: true,
  };

  // Filter out jobs from disabled connectors
  if (disabledConnectorIds.length > 0) {
    where.sources = {
      some: {
        connectorId: {
          notIn: disabledConnectorIds,
        },
      },
    };
  }

  if (options.connectorSlug) {
    where.sources = {
      some: {
        connector: {
          slug: options.connectorSlug,
        },
      },
    };
  }

  if (options.locationType && options.locationType !== "all") {
    where.locationType = options.locationType;
  }

  // Free-text location filter (city / country / state)
  if (options.location && options.location.trim()) {
    where.location = { contains: options.location.trim(), mode: "insensitive" };
  }

  if (options.jobType && options.jobType !== "all") {
    where.jobType = options.jobType;
  }

  if (options.experienceLevel && options.experienceLevel !== "all") {
    where.experienceLevel = options.experienceLevel;
  }

  if (options.search) {
    where.OR = [
      { title: { contains: options.search, mode: "insensitive" } },
      { company: { contains: options.search, mode: "insensitive" } },
      { location: { contains: options.search, mode: "insensitive" } },
    ];
  }

  if (options.savedOnly) {
    where.savedBy = {
      some: {
        userId: user.id,
      },
    };
  }

  // Determine Prisma orderBy clause
  let orderBy: any = { postedAt: "desc" };
  if (options.sortBy === "company") {
    orderBy = { company: "asc" };
  } else if (options.sortBy === "recent") {
    orderBy = { postedAt: "desc" };
  }

  // 4. Fetch jobs
  const jobs = await prisma.job.findMany({
    where,
    include: {
      sources: {
        include: {
          connector: true,
        },
      },
      savedBy: {
        where: { userId: user.id },
      },
    },
    orderBy,
    take: options.limit || 50,
  });

  // 5. Score jobs and map
  const userProfileCriteria = profile
    ? {
        skills: profile.skills.map(s => s.name),
        headline: profile.headline || undefined,
        summary: profile.summary || undefined,
        location: profile.location || undefined,
      }
    : null;

  let formattedJobs = jobs.map((job) => {
    const isSaved = job.savedBy.length > 0;
    const matchScore = calculateMatchScore(
      {
        title: job.title,
        skills: job.skills,
        description: job.description,
        location: job.location,
        locationType: job.locationType,
      },
      userProfileCriteria
    );

    const connectors = job.sources.map(s => ({
      id: s.connector.id,
      slug: s.connector.slug,
      name: s.connector.name,
      status: s.connector.status,
    }));

    return {
      id: job.id,
      externalId: job.externalId,
      title: job.title,
      company: job.company,
      companyLogo: job.companyLogo,
      location: job.location || "Remote / Various",
      locationType: job.locationType || "remote",
      jobType: job.jobType || "full_time",
      experienceLevel: job.experienceLevel || "mid",
      skills: job.skills,
      jobUrl: job.jobUrl,
      applyUrl: job.applyUrl || job.jobUrl,
      postedAt: job.postedAt,
      isSaved,
      matchScore,
      connectors,
    };
  });

  // Filter by minMatchScore if specified
  if (options.minMatchScore && options.minMatchScore > 0) {
    formattedJobs = formattedJobs.filter(j => j.matchScore >= (options.minMatchScore || 0));
  }

  // Sort results
  if (options.sortBy === "match" || (!options.sortBy && !options.search)) {
    formattedJobs.sort((a, b) => b.matchScore - a.matchScore);
  } else if (options.sortBy === "recent") {
    formattedJobs.sort((a, b) => {
      const timeA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
      const timeB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      return timeB - timeA;
    });
  } else if (options.sortBy === "company") {
    formattedJobs.sort((a, b) => a.company.localeCompare(b.company));
  }

  return formattedJobs;
} catch (error) {
  console.error("Error in getJobsForUser:", error);
  return [];
}
}

/**
 * Saves or bookmarks a job for the user.
 */
export async function toggleSaveJob(jobId: string) {
  const user = await requireAuth();

  const existing = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId: user.id,
        jobId,
      },
    },
  });

  if (existing) {
    await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId,
        },
      },
    });
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/saved-jobs");
    return { isSaved: false };
  } else {
    await prisma.savedJob.create({
      data: {
        userId: user.id,
        jobId,
      },
    });
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/saved-jobs");
    return { isSaved: true };
  }
}

/**
 * Returns all jobs saved by the current user, each with the latest
 * application status so the UI can display the correct applied state.
 */
export async function getSavedJobsForUser(): Promise<(DiscoveredJob & { applicationStatus?: string | null })[]> {
  try {
    const user = await requireAuth();

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { skills: true },
    });

    const savedRows = await prisma.savedJob.findMany({
      where: { userId: user.id },
      orderBy: { savedAt: "desc" },
      include: {
        job: {
          include: {
            sources: { include: { connector: true } },
            savedBy: { where: { userId: user.id } },
            applications: {
              where: { userId: user.id },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    const userProfileCriteria = profile
      ? {
          skills: profile.skills.map((s) => s.name),
          headline: profile.headline || undefined,
          summary: profile.summary || undefined,
          location: profile.location || undefined,
        }
      : null;

    return savedRows.map(({ job }) => {
      const matchScore = calculateMatchScore(
        {
          title: job.title,
          skills: job.skills,
          description: job.description,
          location: job.location,
          locationType: job.locationType,
        },
        userProfileCriteria
      );

      const connectors = job.sources.map((s) => ({
        id: s.connector.id,
        slug: s.connector.slug,
        name: s.connector.name,
        status: s.connector.status,
      }));

      const latestApplication = job.applications[0] ?? null;

      return {
        id: job.id,
        externalId: job.externalId,
        title: job.title,
        company: job.company,
        companyLogo: job.companyLogo,
        location: job.location || "Remote / Various",
        locationType: job.locationType || "remote",
        jobType: job.jobType || "full_time",
        experienceLevel: job.experienceLevel || "mid",
        skills: job.skills,
        jobUrl: job.jobUrl,
        applyUrl: job.applyUrl || job.jobUrl,
        postedAt: job.postedAt,
        isSaved: true,
        matchScore,
        connectors,
        applicationStatus: latestApplication?.status ?? null,
      };
    });
  } catch (error) {
    console.error("Error in getSavedJobsForUser:", error);
    return [];
  }
}

/**
 * Aggregates all statistics and recent data needed for the main dashboard overview page.
 */
export async function getDashboardStats() {
  try {
    const user = await requireAuth();

    // 1. Fetch user profile + counts
    const [profile, resumeCount, savedCount, applications, totalJobsCount, connectorSources, rawJobs] =
      await Promise.all([
        prisma.profile.findUnique({
          where: { userId: user.id },
          include: {
            skills: true,
            experiences: true,
            educations: true,
          },
        }),
        prisma.resume.count({ where: { userId: user.id } }),
        prisma.savedJob.count({ where: { userId: user.id } }),
        prisma.application.findMany({
          where: { userId: user.id },
          include: {
            job: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.job.count({ where: { isActive: true } }),
        prisma.connectorSource.findMany({
          orderBy: { jobCount: "desc" },
        }),
        prisma.job.findMany({
          where: { isActive: true },
          include: {
            sources: {
              include: {
                connector: true,
              },
            },
            savedBy: {
              where: { userId: user.id },
              select: { id: true },
            },
            applications: {
              where: { userId: user.id },
              select: { status: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          take: 20,
          orderBy: { postedAt: "desc" },
        }),
      ]);

    // Calculate profile completeness score (0-100)
    let completeness = 0;
    if (profile?.fullName) completeness += 15;
    if (profile?.headline || profile?.summary) completeness += 20;
    if ((profile?.skills?.length ?? 0) >= 3) completeness += 25;
    else if ((profile?.skills?.length ?? 0) > 0) completeness += 10;
    if ((profile?.experiences?.length ?? 0) > 0) completeness += 20;
    if (resumeCount > 0) completeness += 20;

    // Categorize applications
    const inProgressStatuses = [
      "QUEUED",
      "DETECTING_PLATFORM",
      "OPENING_BROWSER",
      "DETECTING_FORM",
      "MAPPING_PROFILE",
      "READY_TO_APPLY",
      "FILLING_FORM",
      "UPLOADING_RESUME",
      "VALIDATING",
      "SUBMITTING",
      "VERIFYING_SUBMISSION",
    ];
    const actionRequiredStatuses = ["REQUIRES_USER_ACTION", "MISSING_PROFILE_INFO"];

    const appliedCount = applications.filter((a) => a.status === "APPLIED").length;
    const inProgressCount = applications.filter((a) =>
      inProgressStatuses.includes(a.status)
    ).length;
    const actionRequiredCount = applications.filter((a) =>
      actionRequiredStatuses.includes(a.status)
    ).length;
    const failedCount = applications.filter(
      (a) => a.status === "FAILED" || a.status === "CANCELLED"
    ).length;

    // Map recent applications
    const recentApplications = applications.slice(0, 5).map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      company: app.job.company,
      companyLogo: app.job.companyLogo,
      location: app.job.location,
      status: app.status,
      mode: app.mode,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      jobUrl: app.job.jobUrl,
      applyUrl: app.job.applyUrl || app.job.jobUrl,
    }));

    // Fetch top recommended jobs
    const userProfileCriteria = profile
      ? {
          skills: profile.skills.map((s) => s.name),
          headline: profile.headline || undefined,
          summary: profile.summary || undefined,
          location: profile.location || undefined,
        }
      : null;

    const scoredJobs = rawJobs.map((job) => {
      const matchScore = calculateMatchScore(
        {
          title: job.title,
          skills: job.skills,
          description: job.description,
          location: job.location,
          locationType: job.locationType,
        },
        userProfileCriteria
      );
      return {
        id: job.id,
        externalId: job.externalId,
        title: job.title,
        company: job.company,
        companyLogo: job.companyLogo,
        location: job.location || "Remote / Various",
        locationType: job.locationType || "remote",
        jobType: job.jobType || "full_time",
        experienceLevel: job.experienceLevel || "mid",
        skills: job.skills,
        jobUrl: job.jobUrl,
        applyUrl: job.applyUrl || job.jobUrl,
        postedAt: job.postedAt,
        isSaved: job.savedBy.length > 0,
        matchScore,
        connectors: job.sources.map((s) => ({
          id: s.connector.id,
          slug: s.connector.slug,
          name: s.connector.name,
          status: s.connector.status,
        })),
        applicationStatus: job.applications[0]?.status ?? null,
      };
    });

    // Sort by match score descending and take top 4
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommendedJobs = scoredJobs.slice(0, 4);

    const avgScore =
      topRecommendedJobs.length > 0
        ? Math.round(
            topRecommendedJobs.reduce((acc, curr) => acc + curr.matchScore, 0) /
              topRecommendedJobs.length
          )
        : 85;

    return {
      user: {
        name: user.name || "Job Seeker",
        email: user.email || "",
      },
      metrics: {
        totalDiscoveredJobs: totalJobsCount,
        totalApplications: applications.length,
        appliedCount,
        inProgressCount,
        actionRequiredCount,
        failedCount,
        savedJobsCount: savedCount,
        averageMatchScore: avgScore,
        activeConnectorsCount: connectorSources.filter((c) => c.status === "connected").length,
      },
      profileHealth: {
        completionScore: completeness,
        hasResume: resumeCount > 0,
        hasExperiences: (profile?.experiences?.length ?? 0) > 0,
        hasSkills: (profile?.skills?.length ?? 0) > 0,
        skillsCount: profile?.skills?.length ?? 0,
        experiencesCount: profile?.experiences?.length ?? 0,
      },
      recentApplications,
      recommendedJobs: topRecommendedJobs,
      connectorsSummary: connectorSources.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        status: c.status,
        jobCount: c.jobCount,
      })),
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return null;
  }
}
