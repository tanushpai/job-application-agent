/**
 * Dynamic Universal Company Logo Resolution Utility
 * 
 * Automatically resolves high-resolution company logos for ANY company (known or newly discovered)
 * using multi-layered dynamic CDN discovery and URL parsing.
 */

// Common edge-case TLD overrides for known startups
const POPULAR_TLD_OVERRIDES: Record<string, string> = {
  notion: "notion.so",
  linear: "linear.app",
  prisma: "prisma.io",
  zoom: "zoom.us",
  anthropic: "anthropic.com",
};

/**
 * Extracts a candidate domain dynamically from a job/apply URL or company name.
 */
export function extractDomainFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    // If it's an ATS sub-path/subdomain (e.g. jobs.ashbyhq.com/company-name or boards.greenhouse.io/company-name)
    if (host.includes("greenhouse.io") || host.includes("ashbyhq.com") || host.includes("lever.co")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length > 0 && !["job", "jobs", "v1", "posting-api"].includes(parts[0])) {
        return `${parts[0].toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
      } else if (parts.length > 1) {
        return `${parts[1].toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
      }
    }

    // Direct company domain (e.g. careers.stripe.com -> stripe.com)
    const hostParts = host.split(".");
    if (hostParts.length >= 2) {
      return hostParts.slice(-2).join(".");
    }
    return host;
  } catch {
    return null;
  }
}

/**
 * Returns candidate logo URLs in priority order for ANY company.
 * 
 * Works dynamically with:
 * 1. An explicitly provided logo URL
 * 2. Domain extracted from the company's job posting / careers URL
 * 3. Universal Name-based Branding DB (Unavatar)
 * 4. Google Global Favicon V2 CDN
 * 5. Clearbit Global Logo API
 */
export function getCompanyLogoUrls(
  companyName: string,
  existingLogoUrl?: string | null,
  jobUrl?: string | null
): string[] {
  const urls: string[] = [];

  // 1. Direct explicit logo if present
  if (existingLogoUrl && existingLogoUrl.startsWith("http")) {
    urls.push(existingLogoUrl);
  }

  const cleanName = companyName
    ? companyName.toLowerCase().trim().replace(/[^a-z0-9]/g, "")
    : "";

  // 2. Try URL-extracted domain
  const extractedDomain = extractDomainFromUrl(jobUrl);

  // 3. Candidate domains to query
  const candidateDomains: string[] = [];
  if (extractedDomain) candidateDomains.push(extractedDomain);
  if (cleanName) {
    if (POPULAR_TLD_OVERRIDES[cleanName]) {
      candidateDomains.push(POPULAR_TLD_OVERRIDES[cleanName]);
    }
    candidateDomains.push(`${cleanName}.com`);
    candidateDomains.push(`${cleanName}.io`);
    candidateDomains.push(`${cleanName}.ai`);
    candidateDomains.push(`${cleanName}.co`);
  }

  // Deduplicate domains
  const uniqueDomains = Array.from(new Set(candidateDomains)).filter(Boolean);

  // 4. Query Unavatar (searches Clearbit, Twitter, GitHub, Gravatar by company name/domain)
  if (cleanName) {
    urls.push(`https://unavatar.io/${encodeURIComponent(cleanName)}?fallback=false`);
  }

  // 5. Query Google Favicon V2 (128px high-res) for candidate domains
  for (const dom of uniqueDomains) {
    urls.push(
      `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${dom}&size=128`
    );
  }

  // 6. Query Clearbit for candidate domains
  for (const dom of uniqueDomains) {
    urls.push(`https://logo.clearbit.com/${dom}`);
  }

  // Return unique candidate URLs
  return Array.from(new Set(urls));
}
