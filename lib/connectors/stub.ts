import { JobConnector, ConnectorResult, SearchCriteria, ConnectorMetadata } from './types';

export class StubConnector implements JobConnector {
  metadata: ConnectorMetadata;

  constructor(metadata: ConnectorMetadata) {
    this.metadata = metadata;
  }

  async search(_criteria?: SearchCriteria): Promise<ConnectorResult> {
    return {
      jobs: [],
      totalFound: 0,
      hasMore: false,
    };
  }

  async testConnection() {
    return {
      success: false,
      message: this.metadata.status === 'requires_config'
        ? 'Enterprise API keys or tenant subdomain required for synchronization.'
        : 'Integration pipeline currently under development.',
    };
  }
}
