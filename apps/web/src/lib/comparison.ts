import {
  ComparisonSelectionSchema,
  type RankingEntry,
} from '@llm-bench/contracts';

export type ComparisonQueryValue = string | string[] | undefined;

export class InvalidComparisonSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidComparisonSelectionError';
  }
}

function normalizeQueryValue(value: ComparisonQueryValue): string[] | null {
  if (value === undefined) return null;
  const values = Array.isArray(value) ? value : value.split(',');
  return values.map((slug) => slug.trim());
}

export function resolveComparisonEntries(
  entries: RankingEntry[],
  value: ComparisonQueryValue,
): RankingEntry[] {
  const requested =
    normalizeQueryValue(value) ??
    entries.slice(0, 2).map((entry) => entry.slug);
  const parsed = ComparisonSelectionSchema.safeParse(requested);
  if (!parsed.success) {
    throw new InvalidComparisonSelectionError('Invalid comparison selection');
  }

  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const selected = parsed.data.map((slug) => bySlug.get(slug));
  if (selected.some((entry) => entry === undefined)) {
    throw new InvalidComparisonSelectionError('Unknown comparison model');
  }
  return selected as RankingEntry[];
}
