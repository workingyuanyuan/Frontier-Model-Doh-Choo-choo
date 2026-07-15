import { describe, expect, it, vi } from 'vitest';

import {
  parseWeeklyOrchestrationArguments,
  runWeeklyOrchestration,
  type WeeklyOrchestrationDependencies,
} from './weekly-orchestration';

const report = { readiness: true };

function createDependencies(
  overrides: Partial<WeeklyOrchestrationDependencies> = {},
): WeeklyOrchestrationDependencies {
  return {
    acquireQuestionInventory: vi.fn(async () => ({ observations: 1_000 })),
    ingestJudgments: vi.fn(async () => ({
      action: 'REUSE' as const,
      ingestionRunId: '019f5f2d-c3df-7c54-96e8-e1939d332c8e',
      recordsAccepted: 60_372,
    })),
    reviewAliases: vi.fn(async () => ({ recordsSeen: 60_372 })),
    createReadinessReport: vi.fn(async () => report),
    promoteResults: vi.fn(async (_report, options) => ({
      dryRun: options.dryRun,
      candidateCount: 737,
      existingResultCount: 737,
      requestedInsertCount: 0,
      insertedResultCount: 0,
    })),
    createScoreSnapshot: vi.fn(async (options) => ({
      dryRun: options.dryRun,
      action: 'REUSE' as const,
      rankingSnapshotId: '019f5f2d-c3df-7c54-96e8-e1939d332c8e',
    })),
    activatePreview: vi.fn(async () => ({ action: 'NOOP' })),
    renderPreview: vi.fn(async (input) => ({ kind: input.kind })),
    wait: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe('weekly orchestration arguments', () => {
  it('defaults to a non-publishing dry run', () => {
    expect(parseWeeklyOrchestrationArguments([])).toEqual({
      mode: 'DRY_RUN',
    });
    expect(
      parseWeeklyOrchestrationArguments(['--', '--apply-preview']),
    ).toEqual({ mode: 'APPLY_PREVIEW' });
  });

  it('rejects unknown and formal publication arguments', () => {
    expect(() => parseWeeklyOrchestrationArguments(['--apply'])).toThrow(
      'Unknown weekly orchestration arguments',
    );
    expect(() => parseWeeklyOrchestrationArguments(['--formal'])).toThrow(
      'Unknown weekly orchestration arguments',
    );
  });
});

describe('weekly orchestration state machine', () => {
  it('retries transient source failures and keeps the structured step order', async () => {
    const acquireQuestionInventory = vi
      .fn()
      .mockRejectedValueOnce(new Error('fetch failed with status 503'))
      .mockResolvedValue({ observations: 1_000 });
    const dependencies = createDependencies({ acquireQuestionInventory });

    const summary = await runWeeklyOrchestration(
      { mode: 'DRY_RUN' },
      dependencies,
      { sourceAttempts: 3, retryBaseDelayMs: 1 },
    );

    expect(summary.status).toBe('SUCCEEDED');
    expect(acquireQuestionInventory).toHaveBeenCalledTimes(2);
    expect(dependencies.wait).toHaveBeenCalledWith(1);
    expect(summary.steps.map(({ name }) => name)).toEqual([
      'question-inventory',
      'judgment-ingestion',
      'alias-review',
      'readiness-report',
      'result-promotion',
      'score-snapshot',
      'preview-render',
    ]);
    expect(summary.steps[0]).toMatchObject({
      status: 'SUCCEEDED',
      attempts: 2,
    });
    expect(dependencies.activatePreview).not.toHaveBeenCalled();
    expect(dependencies.renderPreview).toHaveBeenCalledWith({
      kind: 'DEFAULT_PREVIEW',
    });
  });

  it('isolates a failed source while rendering a safe preview and skipping dependants', async () => {
    const acquireQuestionInventory = vi.fn(async () => {
      throw new Error('fetch failed with status 503');
    });
    const dependencies = createDependencies({ acquireQuestionInventory });

    const summary = await runWeeklyOrchestration(
      { mode: 'DRY_RUN' },
      dependencies,
      { sourceAttempts: 2, retryBaseDelayMs: 1 },
    );

    expect(summary.status).toBe('PARTIAL');
    expect(acquireQuestionInventory).toHaveBeenCalledTimes(2);
    expect(dependencies.ingestJudgments).toHaveBeenCalledOnce();
    expect(dependencies.reviewAliases).toHaveBeenCalledOnce();
    expect(dependencies.createReadinessReport).not.toHaveBeenCalled();
    expect(dependencies.promoteResults).not.toHaveBeenCalled();
    expect(dependencies.createScoreSnapshot).not.toHaveBeenCalled();
    expect(dependencies.renderPreview).toHaveBeenCalledWith({
      kind: 'DEFAULT_PREVIEW',
    });
    expect(summary.steps).toContainEqual(
      expect.objectContaining({
        name: 'readiness-report',
        status: 'SKIPPED',
      }),
    );
  });

  it('does not score unapplied result diffs during a dry run', async () => {
    const dependencies = createDependencies({
      promoteResults: vi.fn(async () => ({
        dryRun: true,
        candidateCount: 737,
        existingResultCount: 0,
        requestedInsertCount: 737,
        insertedResultCount: 0,
      })),
    });

    const summary = await runWeeklyOrchestration(
      { mode: 'DRY_RUN' },
      dependencies,
    );

    expect(dependencies.createScoreSnapshot).not.toHaveBeenCalled();
    expect(summary.steps).toContainEqual(
      expect.objectContaining({
        name: 'score-snapshot',
        status: 'SKIPPED',
        reason: 'Result changes must be applied before scoring',
      }),
    );
  });

  it('applies only a preview edition explicitly and renders its persisted snapshot', async () => {
    const dependencies = createDependencies({
      createScoreSnapshot: vi.fn(async () => ({
        dryRun: false,
        action: 'CREATE' as const,
        rankingSnapshotId: '019f5f2d-c3df-7c54-96e8-e1939d332c8e',
      })),
    });

    const summary = await runWeeklyOrchestration(
      { mode: 'APPLY_PREVIEW' },
      dependencies,
    );

    expect(summary.status).toBe('SUCCEEDED');
    expect(dependencies.promoteResults).toHaveBeenCalledWith(report, {
      dryRun: false,
    });
    expect(dependencies.createScoreSnapshot).toHaveBeenCalledWith({
      dryRun: false,
    });
    expect(dependencies.activatePreview).toHaveBeenCalledWith(
      '019f5f2d-c3df-7c54-96e8-e1939d332c8e',
    );
    expect(dependencies.renderPreview).toHaveBeenCalledWith({
      kind: 'EDITION_PREVIEW',
      snapshotId: '019f5f2d-c3df-7c54-96e8-e1939d332c8e',
    });
  });
});
