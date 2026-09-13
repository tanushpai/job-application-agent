import { JobConnector, ConnectorResult, SearchCriteria, NormalizedJob } from './types';

// Curated companies using SmartRecruiters public career portals
const SMARTRECRUITERS_COMPANIES = [
  'square',
  'visa',
  'ubisoft',
  'ikea',
  'bosch',
];

interface SmartRecruiterPosting {
  id: string;
  name: string;
  releasedDate?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    remote?: boolean;
  };
  typeOfEmployment?: {
    id?: string;
    label?: string;
  };
  experienceLevel?: {
    id?: string;
    label?: string;
  };
  refNumber?: string;
}

export class SmartRecruitersConnector implements JobConnector {
  metadata = {
    slug: 'smartrecruiters',
    name: 'SmartRecruiters',
    description: 'Enterprise recruitment platform connector querying real-time requisitions from top global organizations.',
    category: 'ats' as const,
    websiteUrl: 'https://www.smartrecruiters.com',
    logoUrl: '/logos/smartrecruiters.svg',
    status: 'connected' as const,
    supportsRealTime: true,
    requiresAuth: false,
  };

  async search(criteria?: SearchCriteria): Promise<ConnectorResult> {
    const jobs: NormalizedJob[] = [];
    const limit = criteria?.limit || 50;

    const companyBatches = SMARTRECRUITERS_COMPANIES.slice(0, 4);

    const promises = companyBatches.map(async (company) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://api.smartrecruiters.com/v1/companies/${company}/postings?limit=25`, {
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
        const rawJobs: SmartRecruiterPosting[] = data.content || [];
        const formattedCompany = company.charAt(0).toUpperCase() + company.slice(1);

        return rawJobs.map((raw): NormalizedJob => {
          const locParts = [raw.location?.city, raw.location?.region, raw.location?.country].filter(Boolean);
          const loc = locParts.join(', ') || 'Multiple Locations';
          const isRemote = Boolean(raw.location?.remote) || /remote/i.test(loc);

          const jobUrl = `https://jobs.smartrecruiters.com/${company}/${raw.id}`;

          return {
            externalId: `sr_${company}_${raw.id}`,
            title: raw.name,
            company: formattedCompany,
            companyLogo: null,
            location: loc,
            locationType: isRemote ? 'remote' : 'onsite',
            jobType: 'full_time',
            experienceLevel: /senior|lead|principal/i.test(raw.name)
              ? 'senior'
              : /intern|junior|entry/i.test(raw.name)
              ? 'entry'
              : 'mid',
            skills: extractSkillsFromTitle(raw.name),
            jobUrl: jobUrl,
            applyUrl: jobUrl,
            postedAt: raw.releasedDate ? new Date(raw.releasedDate) : new Date(),
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
      const res = await fetch('https://api.smartrecruiters.com/v1/companies/square/postings?limit=1');
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
