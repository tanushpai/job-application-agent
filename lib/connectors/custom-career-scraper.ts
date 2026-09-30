import prisma from "@/lib/prisma";
import { getCompanyLogoUrls } from "@/lib/utils/company-logo";
import { ScrapedJobPayload } from "@/types/job";
import { scrapeKnownDirectATS } from "./scrapers/direct-ats-scraper";
import { scrapeWithPlaywrightInterceptor } from "./scrapers/playwright-interceptor";

export interface CustomScrapeResult {
  success: boolean;
  jobCount: number;
  error?: string;
  jobs: Array<{
    title: string;
    company: string;
    location: string;
    applyUrl: string;
  }>;
}

/**
 * Main scraper orchestrator for custom career portals and company career URLs.
 */
export async function scrapeCustomCareersPage(
  url: string,
  companyName: string,
  targetRoles: string[] = []
): Promise<CustomScrapeResult> {
  console.log(`[Custom Career Scraper] Starting sync for ${companyName} (${url})...`);

  try {
    let scrapedJobs: ScrapedJobPayload[] | null = null;

    // Strategy 1: Direct ATS API (Workday, Greenhouse, Lever, Ashby, SmartRecruiters)
    scrapedJobs = await scrapeKnownDirectATS(url, companyName);

    // Strategy 2: Playwright background network API interception + DOM fallback
    if (!scrapedJobs || scrapedJobs.length === 0) {
      console.log(`[Custom Career Scraper] Falling back to Playwright interceptor for ${companyName}...`);
      scrapedJobs = await scrapeWithPlaywrightInterceptor(url, companyName);
    }

    if (!scrapedJobs || scrapedJobs.length === 0) {
      return {
        success: false,
        jobCount: 0,
        error: `Could not detect open job postings on ${companyName}'s career portal.`,
        jobs: [],
      };
    }

    // Filter by target roles if specified
    let filteredJobs = scrapedJobs;
    if (targetRoles.length > 0) {
      const lowerRoles = targetRoles.map((r) => r.toLowerCase().trim());
      filteredJobs = scrapedJobs.filter((job) =>
        lowerRoles.some((role) => job.title.toLowerCase().includes(role))
      );
      if (filteredJobs.length === 0) {
        filteredJobs = scrapedJobs; // Fallback to all if strict filter yielded 0
      }
    }

    // Persist jobs in database
    const logoUrls = getCompanyLogoUrls(companyName);
    const companyLogo = Array.isArray(logoUrls) ? logoUrls[0] || null : null;

    const savedJobs = await Promise.all(
      filteredJobs.map(async (j) => {
        try {
          return await prisma.job.create({
            data: {
              title: j.title,
              company: companyName,
              companyLogo,
              location: j.location || "Various",
              locationType: j.locationType || "onsite",
              jobType: j.jobType || "full_time",
              experienceLevel: j.experienceLevel || "mid",
              description: j.description || `${j.title} at ${companyName}.`,
              skills: j.skills || ["Software Development", "Problem Solving"],
              jobUrl: j.applyUrl || url,
              applyUrl: j.applyUrl || url,
              isActive: true,
              postedAt: j.postedAt ? new Date(j.postedAt) : new Date(),
            },
          });
        } catch {
          return null;
        }
      })
    );

    const validSaved = savedJobs.filter((j): j is NonNullable<typeof j> => j !== null);

    return {
      success: true,
      jobCount: validSaved.length,
      jobs: validSaved.map((j) => ({
        title: j.title,
        company: j.company,
        location: j.location || "Various",
        applyUrl: j.applyUrl || j.jobUrl,
      })),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown scraping error";
    console.error(`[Custom Career Scraper Error] ${companyName}:`, error);
    return {
      success: false,
      jobCount: 0,
      error: errorMsg,
      jobs: [],
    };
  }
}

/**
 * Ingests jobs for a given custom company connector record.
 */
export async function ingestCustomCompanyJobs(
  connectorId: string,
  userId: string
): Promise<CustomScrapeResult> {
  try {
    const rows: Array<{
      careersUrl: string;
      companyName: string;
      targetRoles: string[];
    }> = await prisma.$queryRawUnsafe(
      `SELECT careers_url as "careersUrl", company_name as "companyName", target_roles as "targetRoles"
       FROM custom_company_connectors
       WHERE id = $1 AND user_id = $2`,
      connectorId,
      userId
    );

    if (!rows || rows.length === 0) {
      return {
        success: false,
        jobCount: 0,
        error: "Connector not found",
        jobs: [],
      };
    }

    const { careersUrl, companyName, targetRoles } = rows[0];
    const result = await scrapeCustomCareersPage(
      careersUrl,
      companyName,
      Array.isArray(targetRoles) ? targetRoles : []
    );

    await prisma.$executeRawUnsafe(
      `UPDATE custom_company_connectors
       SET status = $1, job_count = $2, last_synced_at = NOW(), last_error = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5`,
      result.success ? "active" : "error",
      result.jobCount,
      result.error || null,
      connectorId,
      userId
    );

    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Sync failed";
    await prisma.$executeRawUnsafe(
      `UPDATE custom_company_connectors
       SET status = 'error', last_error = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3`,
      errorMsg,
      connectorId,
      userId
    );
    return {
      success: false,
      jobCount: 0,
      error: errorMsg,
      jobs: [],
    };
  }
}
