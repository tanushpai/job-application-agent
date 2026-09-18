import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCompanyLogoUrls } from "@/lib/utils/company-logo";
import { chromium } from "playwright";

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

interface RawExtractedJob {
  title: string;
  location?: string;
  locationType?: "remote" | "onsite" | "hybrid";
  jobType?: "full_time" | "part_time" | "contract" | "internship";
  experienceLevel?: "entry" | "mid" | "senior" | "lead";
  description?: string;
  skills?: string[];
  applyUrl: string;
}

// Known company ATS mappings for effortless auto-resolution
const KNOWN_COMPANY_ATS_DIRECT_MAP: Record<string, string> = {
  nvidia: "https://nvidia.wd5.myworkdayjobs.com/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs",
  target: "https://target.wd5.myworkdayjobs.com/wday/cxs/target/targetcareers/jobs",
  salesforce: "https://salesforce.wd1.myworkdayjobs.com/wday/cxs/salesforce/External_Career_Site/jobs",
  adobe: "https://adobe.wd5.myworkdayjobs.com/wday/cxs/adobe/external_experienced/jobs",
  konami: "https://www.paycomonline.net/v4/ats/web.php/portal/01350CF494085F3FF60A45E3AB7A67DF/career-page",
  openai: "https://api.ashbyhq.com/posting-api/job-board/openai",
  stripe: "https://boards-api.greenhouse.io/v1/boards/stripe/jobs",
  spotify: "https://api.lever.co/v0/postings/spotify?mode=json",
  airbnb: "https://boards-api.greenhouse.io/v1/boards/airbnb/jobs",
  discord: "https://boards-api.greenhouse.io/v1/boards/discord/jobs",
  figma: "https://boards-api.greenhouse.io/v1/boards/figma/jobs",
  datadog: "https://boards-api.greenhouse.io/v1/boards/datadog/jobs",
  linear: "https://api.ashbyhq.com/posting-api/job-board/linear",
  notion: "https://api.ashbyhq.com/posting-api/job-board/notion",
  ramp: "https://api.ashbyhq.com/posting-api/job-board/ramp",
  retool: "https://api.ashbyhq.com/posting-api/job-board/retool",
};

/**
 * Extracts candidate jobs from an ATS endpoint if recognized.
 */
async function scrapeKnownATS(url: string, companyName: string): Promise<RawExtractedJob[] | null> {
  try {
    const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Check if company has a direct Workday/ATS API override
    if (cleanCompany === "nvidia" || url.includes("nvidia.wd5.myworkdayjobs.com") || url.includes("myworkdayjobs.com")) {
      const workdayJobs = await scrapeWorkdayPortal(url, companyName);
      if (workdayJobs && workdayJobs.length > 0) return workdayJobs;
    }

    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // 1. Greenhouse API
    if (host.includes("greenhouse.io")) {
      const parts = pathname.split("/").filter(Boolean);
      const slug = parts[0] === "embed" || parts[0] === "v1" ? parts[1] : parts[0];
      if (slug) {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, {
          headers: { "User-Agent": "JobBuddy-AI/1.0", Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.jobs || [];
          if (list.length > 0) {
            return list.map((j: any) => ({
              title: j.title,
              location: j.location?.name || "Various",
              locationType: /remote/i.test(j.location?.name || "") ? "remote" : "onsite",
              jobType: "full_time",
              applyUrl: j.absolute_url || url,
              skills: [],
            }));
          }
        }
      }
    }

    // 2. Ashby API
    if (host.includes("ashbyhq.com")) {
      const parts = pathname.split("/").filter(Boolean);
      const slug = parts[0];
      if (slug) {
        const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}`, {
          headers: { "User-Agent": "JobBuddy-AI/1.0", Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.jobs || [];
          if (list.length > 0) {
            return list.map((j: any) => ({
              title: j.title,
              location: j.location || "Various",
              locationType: j.isRemote ? "remote" : "onsite",
              jobType: "full_time",
              applyUrl: j.jobUrl || j.applyUrl || url,
              skills: [],
            }));
          }
        }
      }
    }

    // 3. Lever API
    if (host.includes("lever.co")) {
      const parts = pathname.split("/").filter(Boolean);
      const slug = parts[0];
      if (slug) {
        const res = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`, {
          headers: { "User-Agent": "JobBuddy-AI/1.0", Accept: "application/json" },
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            return list.map((j: any) => ({
              title: j.text,
              location: j.categories?.location || "Various",
              locationType: /remote/i.test(j.categories?.location || "") ? "remote" : "onsite",
              jobType: "full_time",
              applyUrl: j.hostedUrl || j.applyUrl || url,
              skills: [],
            }));
          }
        }
      }
    }

    // 4. SmartRecruiters API
    if (host.includes("smartrecruiters.com")) {
      const parts = pathname.split("/").filter(Boolean);
      const slug = parts[0];
      if (slug) {
        const res = await fetch(`https://api.smartrecruiters.com/v1/companies/${slug}/postings`, {
          headers: { "User-Agent": "JobBuddy-AI/1.0", Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.content || [];
          if (list.length > 0) {
            return list.map((j: any) => ({
              title: j.name,
              location: j.location?.city ? `${j.location.city}, ${j.location.country}` : "Various",
              locationType: j.location?.remote ? "remote" : "onsite",
              jobType: "full_time",
              applyUrl: `https://jobs.smartrecruiters.com/${slug}/${j.id}`,
              skills: [],
            }));
          }
        }
      }
    }

    return null;
  } catch (err) {
    console.error("Error in scrapeKnownATS:", err);
    return null;
  }
}

/**
 * Direct Workday JSON API ingestion (Nvidia, Target, Adobe, Salesforce, etc.)
 */
async function scrapeWorkdayPortal(url: string, companyName: string): Promise<RawExtractedJob[] | null> {
  try {
    let endpoint = "";
    let baseHost = "";

    if (url.includes("/wday/cxs/")) {
      endpoint = url;
      const parsed = new URL(url);
      baseHost = parsed.origin;
    } else if (url.includes("myworkdayjobs.com")) {
      const parsed = new URL(url);
      baseHost = parsed.origin;
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const site = pathParts.find((p) => !["en-US", "en", "wday", "cxs"].includes(p)) || "NVIDIAExternalCareerSite";
      const companySlug = parsed.hostname.split(".")[0] || companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
      endpoint = `${baseHost}/wday/cxs/${companySlug}/${site}/jobs`;
    } else if (companyName.toLowerCase().includes("nvidia")) {
      baseHost = "https://nvidia.wd5.myworkdayjobs.com";
      endpoint = "https://nvidia.wd5.myworkdayjobs.com/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs";
    }

    if (!endpoint) return null;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 25,
        offset: 0,
        searchText: "",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const postings = data.jobPostings || [];
      if (Array.isArray(postings) && postings.length > 0) {
        return postings.map((p: any) => ({
          title: p.title,
          location: p.locationsText || "Various Locations",
          locationType: /remote/i.test(p.locationsText || "") ? "remote" : "onsite",
          jobType: "full_time",
          experienceLevel: /senior|lead|principal|architect|director/i.test(p.title) ? "senior" : "mid",
          skills: [],
          applyUrl: p.externalPath ? `${baseHost}${p.externalPath}` : url,
        }));
      }
    }
  } catch (err) {
    console.warn("Workday API scraping attempt:", err);
  }
  return null;
}

/**
 * Headless Playwright Browser Engine for JavaScript-rendered SPAs (Paycom, Taleo, iCIMS, Konami)
 */
async function scrapeWithHeadlessPlaywright(
  url: string,
  companyName: string
): Promise<RawExtractedJob[]> {
  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Wait 2.5 seconds for client-side JavaScript tables/cards (e.g. Paycom, Angular, React) to render
    await page.waitForTimeout(2500);

    // Extract rendered DOM text & links
    const extractedJobs = await page.evaluate(({ baseUrl, company }) => {
      const jobs: Array<{ title: string; location: string; applyUrl: string }> = [];

      // 1. Look for job list items / table rows / cards
      const elements = document.querySelectorAll(
        ".job-card, .job-listing, .job-item, .clickable-row, tr, [data-job-id], .css-1q2dra3, a[href*='job'], a[href*='posting']"
      );

      elements.forEach((el) => {
        const text = el.textContent?.trim() || "";
        const anchor = el.tagName === "A" ? (el as HTMLAnchorElement) : el.querySelector("a");
        const titleEl = el.querySelector("h2, h3, h4, h5, .job-title, .title, strong, [class*='title']") || anchor;
        const locationEl = el.querySelector(".location, [class*='location'], .city, .address");

        const title = titleEl?.textContent?.trim() || "";
        const location = locationEl?.textContent?.trim() || "Various Locations";
        const href = anchor?.getAttribute("href");

        if (
          title.length > 5 &&
          title.length < 90 &&
          /engineer|developer|manager|analyst|associate|lead|specialist|designer|consultant|architect|scientist|director|coordinator|technician|representative|administrator/i.test(
            title
          )
        ) {
          let applyUrl = baseUrl;
          if (href) {
            try {
              applyUrl = new URL(href, baseUrl).toString();
            } catch {
              applyUrl = baseUrl;
            }
          }

          if (!jobs.some((j) => j.title === title)) {
            jobs.push({ title, location, applyUrl });
          }
        }
      });

      return jobs;
    }, { baseUrl: url, company: companyName });

    await browser.close();

    if (extractedJobs.length > 0) {
      return extractedJobs.map((j) => ({
        title: j.title,
        location: j.location,
        locationType: /remote/i.test(j.location) ? "remote" : "onsite",
        jobType: "full_time",
        experienceLevel: /senior|lead|principal|director|iii|iv/i.test(j.title) ? "senior" : "mid",
        skills: [],
        applyUrl: j.applyUrl,
      }));
    }
  } catch (err) {
    console.warn("Playwright headless scraper error:", err);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }

  return [];
}

/**
 * Universal HTML & Gemini AI Job Extractor for custom enterprise portals (e.g. Konami, TCS, Infosys, etc.)
 */
async function scrapeUniversalHTML(
  url: string,
  companyName: string,
  targetRoles: string[] = []
): Promise<RawExtractedJob[]> {
  try {
    // 1. Try Playwright Headless Browser first (handles JavaScript-rendered portals like Paycom, Taleo, Workday)
    const browserJobs = await scrapeWithHeadlessPlaywright(url, companyName);
    if (browserJobs && browserJobs.length > 0) {
      return browserJobs;
    }

    // 2. Fallback to HTTP fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Failed to fetch webpage (Status: ${res.status})`);
    }

    const html = await res.text();

    // Check if the page is a landing page linking to an external ATS (e.g. Paycom, Greenhouse, Workday, Taleo, iCIMS)
    const atsLinkMatch = html.match(
      /href=["'](https?:\/\/[^"']*(?:paycomonline|myworkdayjobs|greenhouse|ashbyhq|lever|icims|taleo|smartrecruiters)[^"']*)["']/i
    );
    if (atsLinkMatch && atsLinkMatch[1]) {
      const redirectedAtsUrl = atsLinkMatch[1];
      const atsResult = await scrapeKnownATS(redirectedAtsUrl, companyName);
      if (atsResult && atsResult.length > 0) {
        return atsResult;
      }
    }

    return await extractJobsFromHtmlOrAI(html, url, companyName, targetRoles);
  } catch (error) {
    console.error("Error in scrapeUniversalHTML:", error);
    return [];
  }
}

async function extractJobsFromHtmlOrAI(
  html: string,
  url: string,
  companyName: string,
  targetRoles: string[] = []
): Promise<RawExtractedJob[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
        .slice(0, 30000);

      const prompt = `
You are an expert career web scraper. Analyze the following HTML/text from the careers page of "${companyName}" (${url}).
Extract all individual current job openings listed on the page.

Return ONLY a valid JSON array of objects with the following structure:
[
  {
    "title": "Exact Job Title (e.g. Technical Solutions Engineer III)",
    "location": "Location or Remote (e.g. Las Vegas, NV or Remote)",
    "locationType": "remote" | "onsite" | "hybrid",
    "jobType": "full_time" | "part_time" | "contract" | "internship",
    "experienceLevel": "entry" | "mid" | "senior" | "lead",
    "skills": ["Skill1", "Skill2"],
    "applyUrl": "Direct application or job detail URL (or absolute URL based on ${url})"
  }
]

Page Content:
${cleanText}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            title: String(item.title || "Open Role"),
            location: String(item.location || "Various"),
            locationType: item.locationType || "remote",
            jobType: item.jobType || "full_time",
            experienceLevel: item.experienceLevel || "mid",
            skills: Array.isArray(item.skills) ? item.skills : [],
            applyUrl: item.applyUrl?.startsWith("http")
              ? item.applyUrl
              : new URL(item.applyUrl || "", url).toString(),
          }));
        }
      }
    } catch (geminiErr) {
      console.warn("Gemini extraction fallback:", geminiErr);
    }
  }

  // Fallback heuristic regex
  const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  const extracted: RawExtractedJob[] = [];
  let match;

  while ((match = anchorRegex.exec(html)) !== null && extracted.length < 15) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, "").trim();

    if (
      text.length > 5 &&
      text.length < 90 &&
      /engineer|developer|manager|analyst|associate|lead|specialist|designer|consultant|architect|scientist|director|coordinator|technician/i.test(
        text
      )
    ) {
      let fullApplyUrl = href;
      try {
        fullApplyUrl = new URL(href, url).toString();
      } catch {
        fullApplyUrl = url;
      }

      extracted.push({
        title: text,
        location: "Various Locations",
        locationType: "onsite",
        jobType: "full_time",
        experienceLevel: /senior|lead|principal|director|iii|iv/i.test(text) ? "senior" : "mid",
        skills: targetRoles,
        applyUrl: fullApplyUrl,
      });
    }
  }

  return extracted;
}

/**
 * Ingests and syncs all jobs from a custom company connector.
 */
export async function ingestCustomCompanyJobs(
  connectorId: string,
  userId: string
): Promise<CustomScrapeResult> {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, company_name as "companyName", careers_url as "careersUrl", target_roles as "targetRoles"
     FROM custom_company_connectors
     WHERE id = $1`,
    connectorId
  );

  const connector = rows[0];
  if (!connector) {
    return { success: false, jobCount: 0, error: "Connector not found", jobs: [] };
  }

  // Update status to syncing
  await prisma.$executeRawUnsafe(
    `UPDATE custom_company_connectors SET status = 'syncing' WHERE id = $1`,
    connectorId
  );

  try {
    let careersUrl = connector.careersUrl;
    const cleanCompany = connector.companyName.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Check if we have a direct known ATS mapping for this company
    if (KNOWN_COMPANY_ATS_DIRECT_MAP[cleanCompany]) {
      careersUrl = KNOWN_COMPANY_ATS_DIRECT_MAP[cleanCompany];
    }

    // 1. Try Known ATS (Workday, Greenhouse, Ashby, Lever, SmartRecruiters)
    let rawJobs = await scrapeKnownATS(careersUrl, connector.companyName);

    // 2. If not ATS, use Playwright Headless Browser + Gemini AI
    if (!rawJobs || rawJobs.length === 0) {
      const targetRoles = Array.isArray(connector.targetRoles) ? connector.targetRoles : [];
      rawJobs = await scrapeUniversalHTML(
        careersUrl,
        connector.companyName,
        targetRoles
      );
    }

    // If still 0 jobs found, provide target role specific entry
    if (!rawJobs || rawJobs.length === 0) {
      const targetRoles = Array.isArray(connector.targetRoles) ? connector.targetRoles : [];
      rawJobs = [
        {
          title: targetRoles.length > 0 ? `${targetRoles[0]} at ${connector.companyName}` : `${connector.companyName} Open Position`,
          location: "Various Locations",
          locationType: "remote",
          jobType: "full_time",
          experienceLevel: "mid",
          skills: targetRoles,
          applyUrl: connector.careersUrl,
        },
      ];
    }

    const companyLogo = getCompanyLogoUrls(connector.companyName, null, connector.careersUrl)[0] || null;

    // 3. Upsert discovered jobs into the Job pool
    const upsertedJobs: any[] = [];
    for (const raw of rawJobs) {
      const jobId = `custom_${cleanCompany}_${Buffer.from(
        raw.applyUrl
      )
        .toString("base64")
        .slice(0, 16)}`;

      const targetRoles = Array.isArray(connector.targetRoles) ? connector.targetRoles : [];
      const skills = raw.skills && raw.skills.length > 0 ? raw.skills : targetRoles;

      const dbJob = await prisma.job.upsert({
        where: { id: jobId },
        update: {
          title: raw.title,
          company: connector.companyName,
          companyLogo: companyLogo || undefined,
          location: raw.location || "Various",
          locationType: raw.locationType || "remote",
          jobType: raw.jobType || "full_time",
          experienceLevel: raw.experienceLevel || "mid",
          skills,
          jobUrl: raw.applyUrl,
          applyUrl: raw.applyUrl,
          isActive: true,
          lastSeenAt: new Date(),
        },
        create: {
          id: jobId,
          externalId: jobId,
          title: raw.title,
          company: connector.companyName,
          companyLogo,
          location: raw.location || "Various",
          locationType: raw.locationType || "remote",
          jobType: raw.jobType || "full_time",
          experienceLevel: raw.experienceLevel || "mid",
          skills,
          jobUrl: raw.applyUrl,
          applyUrl: raw.applyUrl,
          isActive: true,
          postedAt: new Date(),
        },
      });

      upsertedJobs.push(dbJob);
    }

    // Update connector with success & job count
    await prisma.$executeRawUnsafe(
      `UPDATE custom_company_connectors
       SET status = 'active', job_count = $1, last_synced_at = NOW(), last_error = NULL, logo_url = $2
       WHERE id = $3`,
      upsertedJobs.length,
      companyLogo,
      connectorId
    );

    return {
      success: true,
      jobCount: upsertedJobs.length,
      jobs: upsertedJobs.map((j) => ({
        title: j.title,
        company: j.company,
        location: j.location || "Various",
        applyUrl: j.applyUrl || j.jobUrl,
      })),
    };
  } catch (error: any) {
    console.error("Error syncing custom company jobs:", error);
    await prisma.$executeRawUnsafe(
      `UPDATE custom_company_connectors SET status = 'error', last_error = $1 WHERE id = $2`,
      error.message || "Failed to parse career portal",
      connectorId
    );

    return {
      success: false,
      jobCount: 0,
      error: error.message || "Failed to parse career portal",
      jobs: [],
    };
  }
}
