export type WeeklyOrchestrationMode = 'DRY_RUN' | 'APPLY_PREVIEW';

export interface WeeklyOrchestrationCommand {
  readonly mode: WeeklyOrchestrationMode;
}

export interface WeeklyIngestionSummary {
  readonly action: 'CREATE' | 'REUSE';
  readonly ingestionRunId: string;
  readonly recordsAccepted: number;
}

export interface WeeklyPromotionSummary {
  readonly dryRun: boolean;
  readonly candidateCount: number;
  readonly existingResultCount: number;
  readonly requestedInsertCount: number;
  readonly insertedResultCount: number;
}

export interface WeeklyScoreSummary {
  readonly dryRun: boolean;
  readonly action: 'CREATE' | 'REUSE';
  readonly rankingSnapshotId: string | null;
}

export interface WeeklyOrchestrationDependencies {
  readonly acquireQuestionInventory: () => Promise<unknown>;
  readonly ingestJudgments: () => Promise<WeeklyIngestionSummary>;
  readonly reviewAliases: (ingestionRunId: string) => Promise<unknown>;
  readonly createReadinessReport: (
    ingestionRunId: string,
    questionInventory: unknown,
  ) => Promise<unknown>;
  readonly promoteResults: (
    report: unknown,
    options: { readonly dryRun: boolean },
  ) => Promise<WeeklyPromotionSummary>;
  readonly createScoreSnapshot: (options: {
    readonly dryRun: boolean;
  }) => Promise<WeeklyScoreSummary>;
  readonly activatePreview: (rankingSnapshotId: string) => Promise<unknown>;
  readonly renderPreview: (
    input:
      | { readonly kind: 'DEFAULT_PREVIEW' }
      | {
          readonly kind: 'EDITION_PREVIEW';
          readonly snapshotId: string;
        },
  ) => Promise<unknown>;
  readonly wait: (milliseconds: number) => Promise<void>;
}

export type WeeklyStepSummary =
  | {
      readonly name: string;
      readonly status: 'SUCCEEDED';
      readonly attempts: number;
      readonly output: unknown;
    }
  | {
      readonly name: string;
      readonly status: 'FAILED';
      readonly attempts: number;
      readonly error: string;
    }
  | {
      readonly name: string;
      readonly status: 'SKIPPED';
      readonly attempts: 0;
      readonly reason: string;
    };

export interface WeeklyOrchestrationSummary {
  readonly schemaVersion: 1;
  readonly mode: WeeklyOrchestrationMode;
  readonly status: 'SUCCEEDED' | 'PARTIAL';
  readonly formalPublicationAttempted: false;
  readonly steps: readonly WeeklyStepSummary[];
}

interface WeeklyOrchestrationOptions {
  readonly sourceAttempts?: number;
  readonly retryBaseDelayMs?: number;
}

const defaultWait = async (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown orchestration error';
}

export function parseWeeklyOrchestrationArguments(
  arguments_: readonly string[],
): WeeklyOrchestrationCommand {
  const meaningfulArguments = arguments_.filter(
    (argument) => argument !== '--',
  );
  const allowedArguments = new Set(['--apply-preview']);
  const unknownArguments = meaningfulArguments.filter(
    (argument) => !allowedArguments.has(argument),
  );
  if (
    unknownArguments.length > 0 ||
    meaningfulArguments.filter((argument) => argument === '--apply-preview')
      .length > 1
  ) {
    throw new Error(
      `Unknown weekly orchestration arguments: ${meaningfulArguments.join(', ')}`,
    );
  }
  return {
    mode: meaningfulArguments.includes('--apply-preview')
      ? 'APPLY_PREVIEW'
      : 'DRY_RUN',
  };
}

export function isRetryableWeeklySourceError(error: unknown): boolean {
  const message = messageFromError(error);
  return (
    /(?:fetch|network|socket|timed?\s*out|aborted|ECONN|EAI_AGAIN)/iu.test(
      message,
    ) || /status\s+(?:408|425|429|5\d\d)\b/u.test(message)
  );
}

interface WeeklyStepExecution<T> {
  readonly summary: WeeklyStepSummary;
  readonly value?: T;
}

async function runStep<T>(
  name: string,
  operation: () => Promise<T>,
  input: {
    readonly attempts: number;
    readonly retryBaseDelayMs: number;
    readonly wait: (milliseconds: number) => Promise<void>;
    readonly retryable: boolean;
  },
  summarize: (value: T) => unknown = (value) => value,
): Promise<WeeklyStepExecution<T>> {
  let attempts = 0;
  while (attempts < input.attempts) {
    attempts += 1;
    try {
      const value = await operation();
      return {
        summary: {
          name,
          status: 'SUCCEEDED',
          attempts,
          output: summarize(value),
        },
        value,
      };
    } catch (error) {
      const mayRetry =
        input.retryable &&
        attempts < input.attempts &&
        isRetryableWeeklySourceError(error);
      if (!mayRetry) {
        return {
          summary: {
            name,
            status: 'FAILED',
            attempts,
            error: messageFromError(error),
          },
        };
      }
      await input.wait(input.retryBaseDelayMs * 2 ** (attempts - 1));
    }
  }
  throw new Error('Weekly orchestration retry loop ended unexpectedly');
}

function skipStep<T>(name: string, reason: string): WeeklyStepExecution<T> {
  return {
    summary: { name, status: 'SKIPPED', attempts: 0, reason },
  };
}

function summarizeReadinessReport(report: unknown): unknown {
  if (typeof report !== 'object' || report === null) return report;
  const value = report as Record<string, unknown>;
  const aggregation =
    typeof value.aggregation === 'object' && value.aggregation !== null
      ? (value.aggregation as Record<string, unknown>)
      : undefined;
  if (
    !value.ingestionRun ||
    !value.questionInventory ||
    !aggregation?.summary
  ) {
    return report;
  }
  return {
    ingestionRun: value.ingestionRun,
    questionInventory: value.questionInventory,
    aggregationSummary: aggregation.summary,
  };
}

export async function runWeeklyOrchestration(
  command: WeeklyOrchestrationCommand,
  dependencies: WeeklyOrchestrationDependencies,
  options: WeeklyOrchestrationOptions = {},
): Promise<WeeklyOrchestrationSummary> {
  const sourceAttempts = options.sourceAttempts ?? 3;
  const retryBaseDelayMs = options.retryBaseDelayMs ?? 1_000;
  if (
    !Number.isSafeInteger(sourceAttempts) ||
    sourceAttempts < 1 ||
    sourceAttempts > 5
  ) {
    throw new Error('Weekly source attempts must be an integer from 1 to 5');
  }
  if (
    !Number.isSafeInteger(retryBaseDelayMs) ||
    retryBaseDelayMs < 0 ||
    retryBaseDelayMs > 30_000
  ) {
    throw new Error('Weekly retry delay must be an integer from 0 to 30000');
  }
  const wait = dependencies.wait ?? defaultWait;
  const stepOptions = {
    attempts: sourceAttempts,
    retryBaseDelayMs,
    wait,
    retryable: true,
  } as const;
  const ordinaryStepOptions = {
    attempts: 1,
    retryBaseDelayMs,
    wait,
    retryable: false,
  } as const;
  const steps: WeeklyStepSummary[] = [];

  const questionInventoryStep = await runStep(
    'question-inventory',
    dependencies.acquireQuestionInventory,
    stepOptions,
  );
  steps.push(questionInventoryStep.summary);

  const ingestionStep = await runStep(
    'judgment-ingestion',
    dependencies.ingestJudgments,
    stepOptions,
  );
  steps.push(ingestionStep.summary);
  const ingestion = ingestionStep.value;

  const aliasStep = ingestion
    ? await runStep(
        'alias-review',
        () => dependencies.reviewAliases(ingestion.ingestionRunId),
        ordinaryStepOptions,
      )
    : skipStep('alias-review', 'Judgment ingestion did not succeed');
  steps.push(aliasStep.summary);

  const questionInventory = questionInventoryStep.value;
  const readinessStep =
    ingestion &&
    aliasStep.summary.status === 'SUCCEEDED' &&
    questionInventory !== undefined
      ? await runStep(
          'readiness-report',
          () =>
            dependencies.createReadinessReport(
              ingestion.ingestionRunId,
              questionInventory,
            ),
          ordinaryStepOptions,
          summarizeReadinessReport,
        )
      : skipStep(
          'readiness-report',
          'Question inventory, ingestion, and alias review must succeed',
        );
  steps.push(readinessStep.summary);

  const readinessReport = readinessStep.value;
  const promotionStep =
    readinessReport === undefined
      ? skipStep<WeeklyPromotionSummary>(
          'result-promotion',
          'Readiness report did not succeed',
        )
      : await runStep(
          'result-promotion',
          () =>
            dependencies.promoteResults(readinessReport, {
              dryRun: command.mode === 'DRY_RUN',
            }),
          ordinaryStepOptions,
        );
  steps.push(promotionStep.summary);

  const promotion = promotionStep.value;
  let scoreStep: WeeklyStepExecution<WeeklyScoreSummary>;
  if (!promotion) {
    scoreStep = skipStep('score-snapshot', 'Result promotion did not succeed');
  } else if (command.mode === 'DRY_RUN' && promotion.requestedInsertCount > 0) {
    scoreStep = skipStep(
      'score-snapshot',
      'Result changes must be applied before scoring',
    );
  } else {
    scoreStep = await runStep(
      'score-snapshot',
      () =>
        dependencies.createScoreSnapshot({
          dryRun: command.mode === 'DRY_RUN',
        }),
      ordinaryStepOptions,
    );
  }
  steps.push(scoreStep.summary);

  const score = scoreStep.value;
  let renderInput:
    | { readonly kind: 'DEFAULT_PREVIEW' }
    | { readonly kind: 'EDITION_PREVIEW'; readonly snapshotId: string } = {
    kind: 'DEFAULT_PREVIEW',
  };
  if (command.mode === 'APPLY_PREVIEW') {
    if (!score?.rankingSnapshotId) {
      const skippedActivation = skipStep(
        'preview-activation',
        'Applied score snapshot did not return a persisted snapshot ID',
      );
      steps.push(skippedActivation.summary);
    } else {
      const snapshotId = score.rankingSnapshotId;
      const activationStep = await runStep(
        'preview-activation',
        () => dependencies.activatePreview(snapshotId),
        ordinaryStepOptions,
      );
      steps.push(activationStep.summary);
      if (activationStep.summary.status === 'SUCCEEDED') {
        renderInput = { kind: 'EDITION_PREVIEW', snapshotId };
      }
    }
  }

  const renderStep = await runStep(
    'preview-render',
    () => dependencies.renderPreview(renderInput),
    ordinaryStepOptions,
  );
  steps.push(renderStep.summary);

  const hasFailure = steps.some(({ status }) => status === 'FAILED');
  const applyWasIncomplete =
    command.mode === 'APPLY_PREVIEW' &&
    steps.some(
      (step) =>
        step.name === 'preview-activation' && step.status !== 'SUCCEEDED',
    );
  return {
    schemaVersion: 1,
    mode: command.mode,
    status: hasFailure || applyWasIncomplete ? 'PARTIAL' : 'SUCCEEDED',
    formalPublicationAttempted: false,
    steps,
  };
}
