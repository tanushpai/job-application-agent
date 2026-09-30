import { ScrapedJobPayload } from "@/types/job";

/**
 * Direct scraper for Workday CXS (Candidate Experience Services) REST API endpoints.
 */
export async function scrapeWorkdayPortal(
  url: string,
  companyName: string
): Promise<ScrapedJobPayload[] | null> {
  try {
    let cxsUrl = url;
    let baseSiteUrl = url;

    // Normalize Workday direct API URL
    if (url.includes(".myworkdayjobs.com") && !url.includes("/wday/cxs/")) {
      const match = url.match(/https:\/\/([^.]+)\.([a-z0-9]+)\.myworkdayjobs\.com\/(?:en-US\/)?([^/?#]+)/i);
      if (match) {
        const [, tenant, instance, site] = match;
        cxsUrl = `https://${tenant}.${instance}.myworkdayjobs.com/wday/cxs/${tenant}/${site}/jobs`;
        baseSiteUrl = `https://${tenant}.${instance}.myworkdayjobs.com/en-US/${site}`;
      }
    }

    if (!cxsUrl.includes("/wday/cxs/")) {
      const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const hostMatch = url.match(/https:\/\/([a-z0-9-]+)\.([a-z0-9]+)\.myworkdayjobs\.com/i);
      if (hostMatch) {
        const [, tenant, instance] = hostMatch;
        cxsUrl = `https://${tenant}.${instance}.myworkdayjobs.com/wday/cxs/${tenant}/${cleanCompany}/jobs`;
        baseSiteUrl = `https://${tenant}.${instance}.myworkdayjobs.com/en-US/${cleanCompany}`;
      }
    }

    const res = await fetch(cxsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 20,
        offset: 0,
        searchText: "",
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const jobPostings = data.jobPostings || [];
    if (!Array.isArray(jobPostings) || jobPostings.length === 0) return null;

    return jobPostings.map((j: {
      title?: string;
      externalPath?: string;
      locationsText?: string;
      bulletFields?: string[];
      postedOn?: string;
    }) => {
      let applyUrl = url;
      if (j.externalPath) {
        applyUrl = baseSiteUrl.replace(/\/$/, "") + "/job" + j.externalPath;
      }
      return {
        title: j.title || "Software Position",
        company: companyName,
        location: j.locationsText || "Various",
        locationType: (j.locationsText || "").toLowerCase().includes("remote")
          ? "remote"
          : "onsite",
        applyUrl,
        jobUrl: applyUrl,
        postedAt: j.postedOn ? new Date() : undefined,
      };
    });
  } catch (err) {
    console.warn(`[Workday Scraper] Direct CXS fetch failed for ${companyName}:`, err);
    return null;
  }
}
