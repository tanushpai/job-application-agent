export interface PlatformDetectorResult {
  platform: "greenhouse" | "lever" | "workable" | "ashby" | "smartrecruiters" | "workday" | "unknown";
  confidence: number;
}

export function detectPlatformFromUrl(url: string): PlatformDetectorResult {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("greenhouse.io") || lowerUrl.includes("gh_jid") || lowerUrl.includes("boards.greenhouse")) {
    return { platform: "greenhouse", confidence: 0.99 };
  }
  if (lowerUrl.includes("jobs.lever.co") || lowerUrl.includes("lever.co")) {
    return { platform: "lever", confidence: 0.99 };
  }
  if (lowerUrl.includes("apply.workable.com") || lowerUrl.includes("workable.com")) {
    return { platform: "workable", confidence: 0.99 };
  }
  if (lowerUrl.includes("ashbyhq.com") || lowerUrl.includes("jobs.ashbyhq")) {
    return { platform: "ashby", confidence: 0.95 };
  }
  if (lowerUrl.includes("smartrecruiters.com") || lowerUrl.includes("jobs.smartrecruiters")) {
    return { platform: "smartrecruiters", confidence: 0.95 };
  }
  if (lowerUrl.includes("myworkdayjobs.com") || lowerUrl.includes("workday.com")) {
    return { platform: "workday", confidence: 0.95 };
  }

  return { platform: "unknown", confidence: 0.5 };
}
