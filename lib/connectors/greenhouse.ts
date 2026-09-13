import { JobConnector, ConnectorResult, SearchCriteria, NormalizedJob } from './types';

// Curated list of active companies hiring on Greenhouse with public job boards
const GREENHOUSE_COMPANIES = [
  'airbnb',
  'stripe',
  'discord',
  'figma',
  'github',
  'gitlab',
  'datadog',
  'dropbox',
  'gusto',
  'hashicorp',
];

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location?: {
    name: string;
  };
  updated_at?: string;
  departments?: Array<{ id: number; name: string }>;
  offices?: Array<{ id: number; name: string; location: string }>;
}

export class GreenhouseConnector implements JobConnector {
  metadata = {
    slug: 'greenhouse',
    name: 'Greenhouse',
    description: 'Direct ATS integration discovering live engineering, product, and design roles from high-growth tech companies.',
    category: 'ats' as const,
    websiteUrl: 'https://www.greenhouse.io',
    logoUrl: '/logos/greenhouse.svg',
    status: 'connected' as const,
    supportsRealTime: true,
    requiresAuth: false,
  };

  async search(criteria?: SearchCriteria): Promise<ConnectorResult> {
    const jobs: NormalizedJob[] = [];
    const limit = criteria?.limit || 50;

    // Pick top companies to query (querying in parallel)
    const companyBatches = GREENHOUSE_COMPANIES.slice(0, 6);

    const promises = companyBatches.map(async (company) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs`, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'JobBuddy-AI/1.0',
            'Accept': 'application/json',
          },
          next: { revalidate: 3600 },
        });

        clearTimeout(timeoutId);

        if (!res.ok) return [];

        const data = await res.json();
        const rawJobs: GreenhouseJob[] = data.jobs || [];

        const formattedCompany = company.charAt(0).toUpperCase() + company.slice(1);

        return rawJobs.map((raw): NormalizedJob => {
          const loc = raw.location?.name || 'Remote / Multiple Locations';
          const isRemote = /remote/i.test(loc) || /anywhere/i.test(loc) || /us - remote/i.test(loc);

          return {
            externalId: `gh_${company}_${raw.id}`,
            title: raw.title,
            company: formattedCompany,
            companyLogo: null,
            location: loc,
            locationType: isRemote ? 'remote' : 'onsite',
            jobType: 'full_time',
            experienceLevel: /senior|lead|principal|staff/i.test(raw.title)
              ? 'senior'
              : /intern|junior|associate/i.test(raw.title)
              ? 'entry'
              : 'mid',
            skills: extractSkillsFromTitle(raw.title),
            jobUrl: raw.absolute_url,
            applyUrl: raw.absolute_url,
            postedAt: raw.updated_at ? new Date(raw.updated_at) : new Date(),
          };
        });
      } catch {
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    for (const r of results) {
      if (r.status === 'fulfilled') {
        jobs.push(...r.value);
      }
    }

    // Apply keywords filter if given
    let filtered = jobs;
    if (criteria?.keywords) {
      const kw = criteria.keywords.toLowerCase();
      filtered = filtered.filter(
        j => j.title.toLowerCase().includes(kw) || j.company.toLowerCase().includes(kw)
      );
    }
    if (criteria?.remoteOnly) {
      filtered = filtered.filter(j => j.locationType === 'remote');
    }

    return {
      jobs: filtered.slice(0, limit),
      totalFound: filtered.length,
      hasMore: filtered.length > limit,
    };
  }

  async testConnection() {
    try {
      const res = await fetch('https://boards-api.greenhouse.io/v1/boards/stripe/jobs', {
        headers: { 'Accept': 'application/json' },
      });
      return { success: res.ok };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Connection failed' };
    }
  }
}

function extractSkillsFromTitle(title: string): string[] {
  const common = ['React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'AWS', 'GCP', 'PostgreSQL', 'GraphQL', 'Kubernetes', 'Docker', 'AI', 'Machine Learning', 'DevOps'];
  return common.filter(s => new RegExp(`\\b${s.replace('+', '\\+')}\\b`, 'i').test(title));
}
