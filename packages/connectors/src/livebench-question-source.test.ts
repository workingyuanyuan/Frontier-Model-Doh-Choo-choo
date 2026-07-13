import { describe, expect, it, vi } from 'vitest';

import {
  LIVEBENCH_QUESTION_DATASET_PINS,
  LIVEBENCH_QUESTION_INVENTORY_COLUMNS,
  createLiveBenchQuestionInventoryEvidence,
  fetchLiveBenchQuestionDataset,
  type FetchedLiveBenchQuestionDataset,
  type LiveBenchQuestionParquetReader,
} from './livebench-question-source.js';

const pin = LIVEBENCH_QUESTION_DATASET_PINS[0]!;
const linkedSize = pin.artifactByteLength;
const rangeBody = new TextEncoder().encode('PAR1test');
const cdnUrl =
  'https://us.aws.cdn.hf.co/xet-bridge-us/repository/object?Policy=signed';

function resolverResponse(overrides: Record<string, string> = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      location: cdnUrl,
      'x-repo-commit': pin.revision,
      'x-linked-size': String(linkedSize),
      'x-linked-etag': pin.linkedEtag,
      ...overrides,
    },
  });
}

function rangeResponse(
  status = 206,
  contentRange = `bytes 0-${rangeBody.byteLength - 1}/${linkedSize}`,
) {
  return new Response(rangeBody, {
    status,
    headers: {
      'content-type': 'application/octet-stream',
      'content-length': String(rangeBody.byteLength),
      'content-range': contentRange,
    },
  });
}

const row = {
  question_id: '1'.padStart(64, '0'),
  category: pin.category,
  task: 'fixture-task',
  turns: ['fixture question'],
  livebench_release_date: new Date('2024-06-24T00:00:00.000Z'),
  livebench_removal_date: '',
};

describe('fetchLiveBenchQuestionDataset', () => {
  it('validates the pinned resolver and reads only allowlisted columns through bounded ranges', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(resolverResponse())
      .mockResolvedValueOnce(rangeResponse());
    const reader: LiveBenchQuestionParquetReader = vi.fn(
      async (file, columns) => {
        expect(columns).toEqual(LIVEBENCH_QUESTION_INVENTORY_COLUMNS);
        expect(
          new Uint8Array(await file.slice(0, rangeBody.byteLength)),
        ).toEqual(rangeBody);
        return [row];
      },
    );

    const fetched = await fetchLiveBenchQuestionDataset(
      pin.category,
      fetchImplementation,
      reader,
    );

    expect(fetchImplementation).toHaveBeenCalledTimes(2);
    expect(fetchImplementation.mock.calls[0]?.[1]).toMatchObject({
      redirect: 'manual',
    });
    expect(fetchImplementation.mock.calls[1]?.[1]).toMatchObject({
      redirect: 'manual',
    });
    expect(
      new Headers(fetchImplementation.mock.calls[1]?.[1]?.headers).get('range'),
    ).toBe(`bytes=0-${rangeBody.byteLength - 1}`);
    expect(fetched).toMatchObject({
      category: pin.category,
      datasetId: pin.datasetId,
      revision: pin.revision,
      artifactByteLength: linkedSize,
      downloadedByteLength: rangeBody.byteLength,
      rangeRequestCount: 1,
      rows: [row],
    });
  });

  it('rejects resolver revision drift before reading the CDN', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(resolverResponse({ 'x-repo-commit': 'a'.repeat(40) }));

    await expect(
      fetchLiveBenchQuestionDataset(pin.category, fetchImplementation, vi.fn()),
    ).rejects.toThrow('revision');
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });

  it('rejects a resolver redirect outside the approved CDN allowlist', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      resolverResponse({
        location: 'https://attacker.example/livebench.parquet',
      }),
    );

    await expect(
      fetchLiveBenchQuestionDataset(pin.category, fetchImplementation, vi.fn()),
    ).rejects.toThrow('approved');
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });

  it('rejects full-body and malformed partial responses', async () => {
    const reader: LiveBenchQuestionParquetReader = async (file) => {
      await file.slice(0, rangeBody.byteLength);
      return [row];
    };
    const fullBodyFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(resolverResponse())
      .mockResolvedValueOnce(rangeResponse(200));
    await expect(
      fetchLiveBenchQuestionDataset(pin.category, fullBodyFetch, reader),
    ).rejects.toThrow('partial');

    const wrongRangeFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(resolverResponse())
      .mockResolvedValueOnce(rangeResponse(206, 'bytes 1-8/100'));
    await expect(
      fetchLiveBenchQuestionDataset(pin.category, wrongRangeFetch, reader),
    ).rejects.toThrow('Content-Range');
  });
});

describe('createLiveBenchQuestionInventoryEvidence', () => {
  it('binds all six pins to a stable prompt-free release inventory', () => {
    const datasets = LIVEBENCH_QUESTION_DATASET_PINS.map(
      (datasetPin, index): FetchedLiveBenchQuestionDataset => ({
        ...datasetPin,
        requestUrl: `https://huggingface.co/datasets/${datasetPin.datasetId}`,
        fetchedAt: '2026-07-13T00:00:00.000Z',
        downloadOrigin: 'https://us.aws.cdn.hf.co',
        downloadedByteLength: 10,
        rangeRequestCount: 1,
        rows: [
          {
            ...row,
            question_id: String(index + 1).padStart(64, '0'),
            category: datasetPin.category,
          },
        ],
      }),
    );

    const evidence = createLiveBenchQuestionInventoryEvidence(
      datasets.toReversed(),
    );
    const repeated = createLiveBenchQuestionInventoryEvidence(datasets);

    expect(evidence).toMatchObject({
      schemaVersion: 'livebench-question-inventory-v1',
      release: '2024-11-25',
      sources: LIVEBENCH_QUESTION_DATASET_PINS.map((datasetPin) => ({
        category: datasetPin.category,
        datasetId: datasetPin.datasetId,
        revision: datasetPin.revision,
        artifactByteLength: datasetPin.artifactByteLength,
        linkedEtag: datasetPin.linkedEtag,
      })),
    });
    expect(evidence.inventory).toHaveLength(6);
    expect(evidence).toEqual(repeated);
    expect(JSON.stringify(evidence)).not.toContain('fixture question');
    expect(JSON.stringify(evidence)).not.toContain('Policy=signed');
  });
});
