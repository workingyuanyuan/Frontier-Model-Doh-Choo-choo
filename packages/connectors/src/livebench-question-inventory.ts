import * as z from 'zod';

import { LiveBenchCategorySchema } from './livebench.js';

export const LIVEBENCH_PUBLIC_RELEASE = '2024-11-25';

export const LIVEBENCH_MAX_QUESTION_ROWS = 10_000;
const LIVEBENCH_MAX_TURNS_PER_QUESTION = 10;

const DateInputSchema = z.union([z.date(), z.string()]);

const LiveBenchQuestionRowSchema = z.object({
  question_id: z.string().regex(/^[a-f0-9]{64}$/u),
  category: LiveBenchCategorySchema,
  task: z.string().trim().min(1).max(120),
  turns: z.array(z.unknown()).min(1).max(LIVEBENCH_MAX_TURNS_PER_QUESTION),
  livebench_release_date: DateInputSchema,
  livebench_removal_date: z.union([DateInputSchema, z.null()]),
});

const ReleaseDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u);

export type LiveBenchQuestionCategory = z.infer<typeof LiveBenchCategorySchema>;
export type LiveBenchQuestionSourceRow = z.infer<
  typeof LiveBenchQuestionRowSchema
>;

export interface LiveBenchQuestionInventoryObservation {
  readonly category: LiveBenchQuestionCategory;
  readonly task: string;
  readonly questionId: string;
  readonly turn: number;
}

export interface SelectLiveBenchQuestionInventoryInput {
  readonly release: string;
  readonly availableReleases: readonly string[];
  readonly rows: readonly unknown[];
}

export function parseLiveBenchQuestionRows(
  inputRows: readonly unknown[],
  expectedCategory?: LiveBenchQuestionCategory,
): LiveBenchQuestionSourceRow[] {
  if (inputRows.length > LIVEBENCH_MAX_QUESTION_ROWS) {
    throw new Error('LiveBench question inventory exceeds the row limit');
  }

  const rows = inputRows.map((row) => LiveBenchQuestionRowSchema.parse(row));
  if (
    expectedCategory !== undefined &&
    rows.some(({ category }) => category !== expectedCategory)
  ) {
    throw new Error(
      'LiveBench question row category does not match its source',
    );
  }
  const questionIds = rows.map(({ question_id: questionId }) => questionId);
  if (new Set(questionIds).size !== questionIds.length) {
    throw new Error('Duplicate LiveBench question IDs found');
  }
  return rows;
}

function normalizeCalendarDate(input: Date | string, field: string): string {
  if (input instanceof Date) {
    if (!Number.isFinite(input.getTime())) {
      throw new Error(`LiveBench ${field} date is invalid`);
    }
    return input.toISOString().slice(0, 10);
  }

  const calendarDate = input.slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}(?:$|T)/u.test(input) ||
    !ReleaseDateSchema.safeParse(calendarDate).success
  ) {
    throw new Error(`LiveBench ${field} date is invalid`);
  }

  const [year, month, day] = calendarDate.split('-').map(Number);
  const parsed = new Date(Date.UTC(year!, month! - 1, day));
  if (parsed.toISOString().slice(0, 10) !== calendarDate) {
    throw new Error(`LiveBench ${field} date is invalid`);
  }
  if (input.length > 10 && !z.iso.datetime().safeParse(input).success) {
    throw new Error(`LiveBench ${field} date is invalid`);
  }
  return calendarDate;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Reproduces LiveBench's official release/removal question filtering while
 * returning only the fields required by aggregation.
 *
 * Sources:
 * https://github.com/LiveBench/LiveBench/blob/main/livebench/common.py
 * https://github.com/LiveBench/LiveBench/blob/main/livebench/show_livebench_result.py
 */
export function selectLiveBenchQuestionInventory({
  release: inputRelease,
  availableReleases: inputAvailableReleases,
  rows: inputRows,
}: SelectLiveBenchQuestionInventoryInput): LiveBenchQuestionInventoryObservation[] {
  const release = normalizeCalendarDate(inputRelease, 'selected release');
  const availableReleases = inputAvailableReleases.map((candidate) =>
    normalizeCalendarDate(candidate, 'available release'),
  );
  if (new Set(availableReleases).size !== availableReleases.length) {
    throw new Error('LiveBench available release dates must be unique');
  }
  if (!availableReleases.includes(release)) {
    throw new Error('LiveBench selected release is not available');
  }
  const rows = parseLiveBenchQuestionRows(inputRows);

  const selectedReleaseDates = new Set(
    availableReleases.filter((candidate) => candidate <= release),
  );
  return rows
    .flatMap((row): LiveBenchQuestionInventoryObservation[] => {
      const releasedAt = normalizeCalendarDate(
        row.livebench_release_date,
        'question release',
      );
      const removedAt =
        row.livebench_removal_date === null || row.livebench_removal_date === ''
          ? null
          : normalizeCalendarDate(
              row.livebench_removal_date,
              'question removal',
            );
      if (
        !selectedReleaseDates.has(releasedAt) ||
        (removedAt !== null && removedAt <= release)
      ) {
        return [];
      }

      return row.turns.map((_, turnIndex) => ({
        category: row.category,
        task: row.task,
        questionId: row.question_id,
        turn: turnIndex + 1,
      }));
    })
    .sort(
      (left, right) =>
        compareText(left.category, right.category) ||
        compareText(left.task, right.task) ||
        compareText(left.questionId, right.questionId) ||
        left.turn - right.turn,
    );
}
