import { JobConnector, ConnectorResult, SearchCriteria, NormalizedJob } from './types';

// Curated companies using Ashby
const ASHBY_COMPANIES = [
  'openai',
  'ramp',
  'linear',
  'notion',
  'retool',
];

export class AshbyConnector implements JobConnector {
  metadata = {
    slug: 'ashby',
    name: 'Ashby',
    description: 'Modern hiring platform connector syncing live positions across leading AI labs and high-growth startups.',
    category: 'ats' as const,
    websiteUrl: 'https://www.ashbyhq.com',
    logoUrl: '/logos/ashby.svg',
    status: 'connected' as const,
    supportsRealTime: true,
    requiresAuth: false,
  };

  async search(criteria?: SearchCriteria): Promise<ConnectorResult> {
    const jobs: NormalizedJob[] = [];
    const limit = criteria?.limit || 50;

    const companyBatches = ASHBY_COMPANIES.slice(0, 4);

    const promises = companyBatches.map(async (company) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${company}`, {
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
        const rawJobs: any[] = data.jobs || [];
        const formattedCompany = company.charAt(0).toUpperCase() + company.slice(1);

        return rawJobs.map((raw): NormalizedJob => {
          const loc = raw.location || raw.address?.postalAddress?.addressLocality || 'Remote';
          const isRemote = Boolean(raw.isRemote) || /remote/i.test(loc);

          return {
            externalId: `ashby_${company}_${raw.id}`,
            title: raw.title,
            company: formattedCompany,
            companyLogo: null,
            location: loc,
            locationType: isRemote ? 'remote' : 'onsite',
            jobType: raw.employmentType === 'Contract' ? 'contract' : 'full_time',
            experienceLevel: /senior|lead|principal|staff/i.test(raw.title)
              ? 'senior'
              : /intern|junior|entry/i.test(raw.title)
              ? 'entry'
              : 'mid',
            skills: extractSkillsFromTitle(raw.title),
            jobUrl: raw.jobUrl || `https://jobs.ashbyhq.com/${company}/${raw.id}`,
            applyUrl: raw.applyUrl || raw.jobUrl || `https://jobs.ashbyhq.com/${company}/${raw.id}`,
            postedAt: raw.publishedAt ? new Date(raw.publishedAt) : new Date(),
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
      const res = await fetch('https://api.ashbyhq.com/posting-api/job-board/ramp');
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
