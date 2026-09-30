import { chromium } from "playwright";
import { ScrapedJobPayload } from "@/types/job";

/**
 * Robust Playwright browser scraper with background network response interception.
 * Enforces strict try ... finally browser teardown.
 */
export async function scrapeWithPlaywrightInterceptor(
  url: string,
  companyName: string
): Promise<ScrapedJobPayload[]> {
  const extractedJobs: ScrapedJobPayload[] = [];
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    // 1. Intercept background JSON API responses
    page.on("response", async (response) => {
      try {
        const reqUrl = response.url().toLowerCase();
        const contentType = response.headers()["content-type"] || "";

        if (
          contentType.includes("application/json") &&
          (reqUrl.includes("job") ||
            reqUrl.includes("position") ||
            reqUrl.includes("career") ||
            reqUrl.includes("search") ||
            reqUrl.includes("wday/cxs") ||
            reqUrl.includes("graphql") ||
            reqUrl.includes("posting"))
        ) {
          const json = await response.json();
          const items = Array.isArray(json)
            ? json
            : json.jobPostings ||
              json.jobs ||
              json.postings ||
              json.items ||
              json.results ||
              json.data?.jobs ||
              json.data?.jobPostings ||
              [];

          if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
              const title = item.title || item.name || item.text || item.jobTitle;
              if (typeof title === "string" && title.length > 2 && title.length < 120) {
                const loc =
                  item.locationsText ||
                  item.location?.name ||
                  item.location ||
                  item.city ||
                  "Various";
                const applyUrl =
                  item.externalPath || item.applyUrl || item.hostedUrl || item.absolute_url || url;

                extractedJobs.push({
                  title: title.trim(),
                  company: companyName,
                  location: typeof loc === "string" ? loc : "Various",
                  applyUrl: typeof applyUrl === "string" ? applyUrl : url,
                  jobUrl: typeof applyUrl === "string" ? applyUrl : url,
                });
              }
            }
          }
        }
      } catch {
        // Safe skip on unparseable responses
      }
    });

    // 2. Navigate with 25s timeout
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(3500);

    // 3. Fallback: Extract from DOM if network interception found nothing
    if (extractedJobs.length === 0) {
      const domJobs = await page.evaluate(() => {
        const results: Array<{ title: string; location: string; applyUrl: string }> = [];
        const seen = new Set<string>();

        const jobLinks = document.querySelectorAll(
          'a[href*="/job/"], a[href*="/jobs/"], a[href*="/careers/"], a[href*="/position/"], a[href*="/positions/"], a[href*="/posting/"], a[href*="/postings/"]'
        );

        jobLinks.forEach((el) => {
          const title = el.textContent?.trim();
          const href = (el as HTMLAnchorElement).href;
          if (
            title &&
            title.length > 3 &&
            title.length < 100 &&
            !title.toLowerCase().includes("see all") &&
            !title.toLowerCase().includes("view all") &&
            !seen.has(title)
          ) {
            seen.add(title);
            results.push({
              title,
              location: "Various",
              applyUrl: href,
            });
          }
        });

        return results;
      }, companyName);

      for (const dj of domJobs) {
        extractedJobs.push({
          title: dj.title,
          company: companyName,
          location: dj.location,
          applyUrl: dj.applyUrl,
          jobUrl: dj.applyUrl,
        });
      }
    }

    await context.close();
  } catch (err) {
    console.warn(`[Playwright Interceptor] Navigation error for ${url}:`, err);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // safe close
      }
    }
  }

  // Deduplicate by title
  const uniqueMap = new Map<string, ScrapedJobPayload>();
  for (const j of extractedJobs) {
    const key = j.title.toLowerCase().trim();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, j);
    }
  }

  return Array.from(uniqueMap.values());
}
