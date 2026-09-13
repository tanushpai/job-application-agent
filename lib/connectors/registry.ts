import { JobConnector, ConnectorMetadata } from './types';
import { GreenhouseConnector } from './greenhouse';
import { LeverConnector } from './lever';
import { AshbyConnector } from './ashby';
import { SmartRecruitersConnector } from './smartrecruiters';
import { StubConnector } from './stub';

export const CONNECTORS_METADATA: ConnectorMetadata[] = [
  {
    slug: 'greenhouse',
    name: 'Greenhouse',
    description: 'Direct ATS integration discovering live engineering, product, and design roles from high-growth tech companies.',
    category: 'ats',
    websiteUrl: 'https://www.greenhouse.io',
    logoUrl: '/logos/greenhouse.svg',
    status: 'connected',
    supportsRealTime: true,
    requiresAuth: false,
  },
  {
    slug: 'lever',
    name: 'Lever',
    description: 'Direct ATS integration syncing live job postings and fast-track applications from innovative tech companies.',
    category: 'ats',
    websiteUrl: 'https://www.lever.co',
    logoUrl: '/logos/lever.svg',
    status: 'connected',
    supportsRealTime: true,
    requiresAuth: false,
  },
  {
    slug: 'ashby',
    name: 'Ashby',
    description: 'Modern hiring platform connector syncing live positions across leading AI labs and high-growth startups.',
    category: 'ats',
    websiteUrl: 'https://www.ashbyhq.com',
    logoUrl: '/logos/ashby.svg',
    status: 'connected',
    supportsRealTime: true,
    requiresAuth: false,
  },
  {
    slug: 'smartrecruiters',
    name: 'SmartRecruiters',
    description: 'Enterprise recruitment platform connector querying real-time requisitions from top global organizations.',
    category: 'ats',
    websiteUrl: 'https://www.smartrecruiters.com',
    logoUrl: '/logos/smartrecruiters.svg',
    status: 'connected',
    supportsRealTime: true,
    requiresAuth: false,
  },
  {
    slug: 'workday',
    name: 'Workday',
    description: 'Enterprise HCM connector for Fortune 500 career portals and multinational corporate boards.',
    category: 'ats',
    websiteUrl: 'https://www.workday.com',
    logoUrl: '/logos/workday.svg',
    status: 'requires_config',
    supportsRealTime: false,
    requiresAuth: true,
  },
  {
    slug: 'recruitee',
    name: 'Recruitee',
    description: 'Collaborative hiring platform for fast-scaling European and international tech teams.',
    category: 'ats',
    websiteUrl: 'https://recruitee.com',
    logoUrl: '/logos/recruitee.svg',
    status: 'requires_config',
    supportsRealTime: false,
    requiresAuth: true,
  },
  {
    slug: 'personio',
    name: 'Personio',
    description: 'All-in-one HR platform powering recruitment workflows for European mid-market enterprises.',
    category: 'ats',
    websiteUrl: 'https://www.personio.com',
    logoUrl: '/logos/personio.svg',
    status: 'coming_soon',
    supportsRealTime: false,
    requiresAuth: true,
  },
  {
    slug: 'bamboohr',
    name: 'BambooHR',
    description: 'Leading HR software platform for growing businesses and modern agile teams.',
    category: 'ats',
    websiteUrl: 'https://www.bamboohr.com',
    logoUrl: '/logos/bamboohr.svg',
    status: 'coming_soon',
    supportsRealTime: false,
    requiresAuth: true,
  },
];

const connectorInstances: Record<string, JobConnector> = {
  greenhouse: new GreenhouseConnector(),
  lever: new LeverConnector(),
  ashby: new AshbyConnector(),
  smartrecruiters: new SmartRecruitersConnector(),
  workday: new StubConnector(CONNECTORS_METADATA.find(c => c.slug === 'workday')!),
  recruitee: new StubConnector(CONNECTORS_METADATA.find(c => c.slug === 'recruitee')!),
  personio: new StubConnector(CONNECTORS_METADATA.find(c => c.slug === 'personio')!),
  bamboohr: new StubConnector(CONNECTORS_METADATA.find(c => c.slug === 'bamboohr')!),
};

export function getConnector(slug: string): JobConnector | undefined {
  return connectorInstances[slug];
}

export function getAllConnectors(): JobConnector[] {
  return Object.values(connectorInstances);
}

export function getActiveConnectors(): JobConnector[] {
  return Object.values(connectorInstances).filter(c => c.metadata.status === 'connected');
}
