import { describe, expect, it } from 'vitest';

import {
  assemblePipelineStatus,
  assembleSourceRegistry,
} from './source-status-repository.js';

const run = {
  sourceSlug: 'livebench',
  status: 'SUCCEEDED',
  connectorVersion: 'livebench-parquet-v1',
  startedAt: new Date('2026-07-13T00:00:00.000Z'),
  completedAt: new Date('2026-07-13T00:05:00.000Z'),
  recordsSeen: 60372,
  recordsAccepted: 60372,
};

describe('source and pipeline repository assembly', () => {
  it('serializes source dates and attaches the latest run', () => {
    const [source] = assembleSourceRegistry(
      [
        {
          slug: 'livebench',
          displayName: 'LiveBench',
          sourceType: 'benchmark_official',
          baseUrl: 'https://github.com/LiveBench/LiveBench',
          trustTier: 'OFFICIAL',
          licenseSpdx: 'Apache-2.0',
          termsUrl: null,
          isEnabled: true,
          snapshotCount: 2,
          latestFetchedAt: new Date('2026-07-13T00:00:00.000Z'),
        },
      ],
      new Map([['livebench', run]]),
    );

    expect(source?.latestFetchedAt).toBe('2026-07-13T00:00:00.000Z');
    expect(source?.latestRun?.recordsAccepted).toBe(60372);
  });

  it('validates pipeline totals with the active data state', () => {
    const status = assemblePipelineStatus(
      { status: 'READY', activeEdition: null, publishedResultCount: 737 },
      {
        sourceCount: 1,
        snapshotCount: 2,
        ingestionRunCount: 1,
        stagedRowCount: 60372,
        rankingSnapshotCount: 2,
        editionCount: 2,
      },
      run,
    );

    expect(status.latestRun?.sourceSlug).toBe('livebench');
    expect(status.data.publishedResultCount).toBe(737);
  });
});
