import { createHash } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import type { LiveBenchJudgment } from './livebench.js';
import type { FetchedLiveBenchParquet } from './livebench-parquet.js';
import {
  LIVEBENCH_JUDGMENT_DATASET_PINS,
  assertLiveBenchPinnedJudgmentArtifact,
  createLiveBenchJudgmentCoverageEvidence,
  fetchLiveBenchPinnedJudgmentDatasets,
  type LiveBenchJudgmentDatasetPin,
} from './livebench-judgment-source.js';

function judgment(
  questionId: string,
  category: LiveBenchJudgment['category'],
  task: string,
  model = 'model-a',
): LiveBenchJudgment {
  return {
    question_id: questionId.repeat(64),
    task,
    model,
    score: 0.5,
    turn: 1,
    tstamp: 1_725_000_000,
    category,
  };
}

function pin(
  revisionCharacter: string,
  body: Uint8Array,
  rows: readonly LiveBenchJudgment[],
): LiveBenchJudgmentDatasetPin {
  return {
    revision: revisionCharacter.repeat(40),
    lastModified: '2024-10-22T03:09:21.000Z',
    artifactPath: 'data/leaderboard-00000-of-00001.parquet',
    contentSha256: createHash('sha256').update(body).digest('hex'),
    artifactByteLength: body.byteLength,
    rowCount: rows.length,
    categories: [...new Set(rows.map(({ category }) => category))].sort(),
  };
}

function fetched(
  sourcePin: LiveBenchJudgmentDatasetPin,
  body: Uint8Array,
): FetchedLiveBenchParquet {
  return {
    revision: sourcePin.revision,
    requestUrl: `https://huggingface.co/datasets/livebench/model_judgment/resolve/${sourcePin.revision}/${sourcePin.artifactPath}?download=true`,
    fetchedAt: '2026-07-13T04:00:00.000Z',
    responseStatus: 200,
    contentType: 'application/octet-stream',
    contentSha256: sourcePin.contentSha256,
    byteLength: body.byteLength,
    linkedEtag: '"fixture"',
    downloadOrigin: 'https://cdn-lfs.hf.co',
    body,
  };
}

describe('LiveBench judgment revision pins', () => {
  it('pins the current partial artifact and the latest prior six-category artifact', () => {
    expect(LIVEBENCH_JUDGMENT_DATASET_PINS).toEqual([
      expect.objectContaining({
        revision: '9704e5da7bfbefe75ac1482a13de827127295993',
        contentSha256:
          '35ad896970151776145c96b31c5ddb3a2749ea9a1d91e6b7f1a4c4c04735182a',
        rowCount: 60_372,
        categories: ['coding', 'instruction_following', 'language'],
      }),
      expect.objectContaining({
        revision: '5896e3b11081702c7f93f4733605fa4f5a072a11',
        contentSha256:
          '8f490d557d86b5dab0da9db1169142f69ebe69907fbaba361b4f00e4fe4f171d',
        rowCount: 93_624,
        categories: [
          'coding',
          'data_analysis',
          'instruction_following',
          'language',
          'math',
          'reasoning',
        ],
      }),
    ]);
  });

  it('rejects artifact bytes, revision, row count and category drift', () => {
    const rows = [judgment('a', 'language', 'connections')];
    const body = new Uint8Array([1, 2, 3]);
    const sourcePin = pin('a', body, rows);

    expect(() =>
      assertLiveBenchPinnedJudgmentArtifact(
        sourcePin,
        fetched(sourcePin, new Uint8Array([1, 2, 4])),
        rows,
      ),
    ).toThrow('SHA-256');
    expect(() =>
      assertLiveBenchPinnedJudgmentArtifact(
        sourcePin,
        { ...fetched(sourcePin, body), revision: 'b'.repeat(40) },
        rows,
      ),
    ).toThrow('revision');
    expect(() =>
      assertLiveBenchPinnedJudgmentArtifact(
        sourcePin,
        fetched(sourcePin, body),
        [...rows, judgment('b', 'language', 'connections')],
      ),
    ).toThrow('row count');
    expect(() =>
      assertLiveBenchPinnedJudgmentArtifact(
        sourcePin,
        fetched(sourcePin, body),
        [judgment('a', 'reasoning', 'reasoning-task')],
      ),
    ).toThrow('categories');
  });
});

describe('LiveBench revision-bound judgment coverage', () => {
  const currentRows = [
    judgment('a', 'language', 'connections'),
    judgment('b', 'instruction_following', 'if-task'),
  ];
  const historicalRows = [
    judgment('a', 'language', 'connections'),
    judgment('c', 'reasoning', 'reasoning-task'),
    judgment('d', 'math', 'math-task'),
  ];
  const currentBody = new Uint8Array([1, 2]);
  const historicalBody = new Uint8Array([3, 4, 5]);
  const currentPin = pin('a', currentBody, currentRows);
  const historicalPin = pin('b', historicalBody, historicalRows);
  const inventory = [
    ['language', 'connections', 'a'],
    ['instruction_following', 'if-task', 'b'],
    ['reasoning', 'reasoning-task', 'c'],
    ['math', 'math-task', 'd'],
    ['coding', 'coding-task', 'e'],
    ['data_analysis', 'data-task', 'f'],
  ].map(([category, task, questionId]) => ({
    category: category as LiveBenchJudgment['category'],
    task: task!,
    questionId: questionId!.repeat(64),
    turn: 1,
  }));

  it('unions question evidence across revisions without selecting scores', () => {
    const evidence = createLiveBenchJudgmentCoverageEvidence(
      [
        {
          pin: currentPin,
          fetched: fetched(currentPin, currentBody),
          rows: currentRows,
        },
        {
          pin: historicalPin,
          fetched: fetched(historicalPin, historicalBody),
          rows: historicalRows,
        },
      ],
      inventory,
    );

    expect(evidence).toMatchObject({
      schemaVersion: 'livebench-judgment-coverage-v1',
      release: '2024-11-25',
      inventoryObservationCount: 6,
      coveredObservationKeyCount: 4,
      missingObservationCount: 2,
      sources: [
        { revision: currentPin.revision, coveredObservationKeyCount: 2 },
        { revision: historicalPin.revision, coveredObservationKeyCount: 3 },
      ],
    });
    expect(evidence.categories).toHaveLength(6);
    expect(evidence.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'coding',
          expectedObservations: 1,
          coveredObservationKeys: 0,
          missingObservations: 1,
        }),
        expect.objectContaining({
          category: 'data_analysis',
          expectedObservations: 1,
          coveredObservationKeys: 0,
          missingObservations: 1,
        }),
        expect.objectContaining({ category: 'language', coverage: 1 }),
        expect.objectContaining({ category: 'math', coverage: 1 }),
        expect.objectContaining({ category: 'reasoning', coverage: 1 }),
      ]),
    );
    expect(JSON.stringify(evidence)).not.toContain('score');
    expect(JSON.stringify(evidence)).not.toContain('model-a');
  });

  it('rejects source metadata drift for a known question turn', () => {
    expect(() =>
      createLiveBenchJudgmentCoverageEvidence(
        [
          {
            pin: currentPin,
            fetched: fetched(currentPin, currentBody),
            rows: [judgment('a', 'language', 'wrong-task'), currentRows[1]!],
          },
        ],
        inventory,
      ),
    ).toThrow('metadata');
  });

  it('starts only from the fixed current revision and rejects tampered bytes', async () => {
    const sourcePin = LIVEBENCH_JUDGMENT_DATASET_PINS[0];
    const body = new Uint8Array(sourcePin.artifactByteLength);
    const parquetFetcher = vi.fn(async () => fetched(sourcePin, body));
    const parquetParser = vi.fn(async () => currentRows);

    await expect(
      fetchLiveBenchPinnedJudgmentDatasets(parquetFetcher, parquetParser),
    ).rejects.toThrow('SHA-256');
    expect(parquetFetcher).toHaveBeenCalledOnce();
    expect(parquetFetcher).toHaveBeenCalledWith(sourcePin.revision);
  });
});
