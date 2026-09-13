import { JobConnector, ConnectorResult, SearchCriteria, NormalizedJob } from './types';

// Curated companies hosting postings on Lever
const LEVER_COMPANIES = [
  'netflix',
  'spotify',
  'palantir',
  'atlassian',
  'automattic',
  'canva',
];

interface LeverPosting {
  id: string;
  text: string;
  hostedUrl: string;
  applyUrl?: string;
  createdAt?: number;
  categories?: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
    workplaceType?: string; // "remote" | "unspecified" | "onsite" | "hybrid"
  };
}

export class LeverConnector implements JobConnector {
  metadata = {
    slug: 'lever',
    name: 'Lever',
    description: 'Direct ATS integration syncing live job postings and fast-track applications from innovative tech companies.',
    category: 'ats' as const,
    websiteUrl: 'https://www.lever.co',
    logoUrl: '/logos/lever.svg',
    status: 'connected' as const,
    supportsRealTime: true,
    requiresAuth: false,
  };

  async search(criteria?: SearchCriteria): Promise<ConnectorResult> {
    const jobs: NormalizedJob[] = [];
    const limit = criteria?.limit || 50;

    const companyBatches = LEVER_COMPANIES.slice(0, 5);

    const promises = companyBatches.map(async (company) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'JobBuddy-AI/1.0',
            'Accept': 'application/json',
          },
          next: { revalidate: 3600 },
        });

        clearTimeout(timeoutId);

        if (!res.ok) return [];

        const rawJobs: LeverPosting[] = await res.json();
        const formattedCompany = company.charAt(0).toUpperCase() + company.slice(1);

        return rawJobs.map((raw): NormalizedJob => {
          const wpType = raw.categories?.workplaceType?.toLowerCase();
          const loc = raw.categories?.location || 'Multiple Locations';
          const isRemote = wpType === 'remote' || /remote/i.test(loc);

          return {
            externalId: `lever_${company}_${raw.id}`,
            title: raw.text,
            company: formattedCompany,
            companyLogo: null,
            location: loc,
            locationType: isRemote ? 'remote' : (wpType === 'hybrid' ? 'hybrid' : 'onsite'),
            jobType: raw.categories?.commitment?.toLowerCase().includes('contract') ? 'contract' : 'full_time',
            experienceLevel: /senior|lead|principal|staff/i.test(raw.text)
              ? 'senior'
              : /intern|junior|entry/i.test(raw.text)
              ? 'entry'
              : 'mid',
            skills: extractSkillsFromTitle(raw.text),
            jobUrl: raw.hostedUrl,
            applyUrl: raw.applyUrl || raw.hostedUrl,
            postedAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
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
      const res = await fetch('https://api.lever.co/v0/postings/spotify?mode=json&limit=1');
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
