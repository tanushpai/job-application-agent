import { ScrapedJobPayload } from "@/types/job";
import { scrapeWorkdayPortal } from "./workday-scraper";

/**
 * Fast direct REST API scraper for common ATS portals (Greenhouse, Lever, Ashby, SmartRecruiters, Recruitee, Workable).
 */
export async function scrapeKnownDirectATS(
  url: string,
  companyName: string
): Promise<ScrapedJobPayload[] | null> {
  try {
    const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Workday ATS
    if (
      cleanCompany === "nvidia" ||
      url.includes("myworkdayjobs.com") ||
      url.includes("/wday/cxs/")
    ) {
      const workdayJobs = await scrapeWorkdayPortal(url, companyName);
      if (workdayJobs && workdayJobs.length > 0) return workdayJobs;
    }

    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // 2. Greenhouse API
    if (host.includes("greenhouse.io")) {
      const parts = pathname.split("/").filter(Boolean);
      const slug = parts[0] === "embed" || parts[0] === "v1" || parts[0] === "boards"
        ? parts[1] || parts[0]
        : parts[0] || cleanCompany;

      if (slug) {
        try {
          const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, {
            headers: { "User-Agent": "JobBuddy-AI/1.0", Accept: "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            const list = data.jobs || [];
            if (list.length > 0) {
              return list.map((j: {
                title: string;
                location?: { name: string };
                absolute_url?: string;
                updated_at?: string;
              }) => ({
                title: j.title,
                company: companyName,
                location: j.location?.name || "Various",
                applyUrl: j.absolute_url || url,
                jobUrl: j.absolute_url || url,
                postedAt: j.updated_at ? new Date(j.updated_at) : undefined,
              }));
            }
          }
        } catch {
          // ignore & fallback
        }
      }
    }

    // 3. Lever API
    if (host.includes("lever.co")) {
      const parts = pathname.split("/").filter(Boolean);
      const slug = parts[0] || cleanCompany;
      if (slug) {
        try {
          const res = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`, {
            headers: { "User-Agent": "JobBuddy-AI/1.0", Accept: "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              return data.map((j: {
                text?: string;
                categories?: { location?: string; commitment?: string };
                applyUrl?: string;
                hostedUrl?: string;
                createdAt?: number;
              }) => ({
                title: j.text || "Position",
                company: companyName,
                location: j.categories?.location || "Various",
                applyUrl: j.applyUrl || j.hostedUrl || url,
                jobUrl: j.hostedUrl || j.applyUrl || url,
                postedAt: j.createdAt ? new Date(j.createdAt) : undefined,
              }));
            }
          }
        } catch {
          // ignore & fallback
        }
      }
    }

    // 4. Ashby API
    if (host.includes("ashbyhq.com")) {
      const parts = pathname.split("/").filter(Boolean);
      const slug = parts[0] || cleanCompany;
      if (slug) {
        try {
          const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}`, {
            headers: { "User-Agent": "JobBuddy-AI/1.0", Accept: "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            const list = data.jobs || [];
            if (list.length > 0) {
              return list.map((j: {
                title: string;
                location?: string;
                jobUrl?: string;
                publishedAt?: string;
              }) => ({
                title: j.title,
                company: companyName,
                location: j.location || "Remote",
                applyUrl: j.jobUrl || url,
                jobUrl: j.jobUrl || url,
                postedAt: j.publishedAt ? new Date(j.publishedAt) : undefined,
              }));
            }
          }
        } catch {
          // ignore & fallback
        }
      }
    }

    // 5. SmartRecruiters API
    if (host.includes("smartrecruiters.com")) {
      const parts = pathname.split("/").filter(Boolean);
      const slug = parts[0] || cleanCompany;
      if (slug) {
        try {
          const res = await fetch(`https://api.smartrecruiters.com/v1/companies/${slug}/postings`, {
            headers: { "User-Agent": "JobBuddy-AI/1.0", Accept: "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            const content = data.content || [];
            if (content.length > 0) {
              return content.map((j: {
                name: string;
                location?: { city?: string; region?: string; country?: string };
                refNumber?: string;
                releasedDate?: string;
              }) => ({
                title: j.name,
                company: companyName,
                location: [j.location?.city, j.location?.region, j.location?.country].filter(Boolean).join(", ") || "Various",
                applyUrl: `https://jobs.smartrecruiters.com/${slug}/${j.refNumber || ""}`,
                jobUrl: `https://jobs.smartrecruiters.com/${slug}/${j.refNumber || ""}`,
                postedAt: j.releasedDate ? new Date(j.releasedDate) : undefined,
              }));
            }
          }
        } catch {
          // ignore & fallback
        }
      }
    }

    return null;
  } catch (err) {
    console.warn(`[Direct ATS Scraper] Failed for ${companyName}:`, err);
    return null;
  }
}
