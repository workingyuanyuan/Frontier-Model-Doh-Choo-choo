/** Resource policy shared by every provider adapter. Values are bytes/counts/ms. */
export const DEFAULT_ACQUISITION_LIMITS = Object.freeze({
  responseBytes: 32 * 1024 * 1024,
  totalBytes: 512 * 1024 * 1024,
  requests: 1024,
  discoveredItems: 512,
  concurrency: 6,
  requestTimeoutMs: 120_000,
  runTimeoutMs: 30 * 60_000,
  redirects: 5,
  archiveBytes: 32 * 1024 * 1024,
  archiveEntries: 1024,
  entryBytes: 16 * 1024 * 1024,
  expandedBytes: 64 * 1024 * 1024,
});

export type AcquisitionLimits = {
  readonly [K in keyof typeof DEFAULT_ACQUISITION_LIMITS]: number;
};

export class AcquisitionLimitError extends Error {}

export function acquisitionLimits(
  overrides: Partial<AcquisitionLimits> = {},
): AcquisitionLimits {
  const limits = { ...DEFAULT_ACQUISITION_LIMITS, ...overrides };
  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new Error(`Invalid acquisition limit: ${name}`);
    }
  }
  return Object.freeze(limits);
}

/** One budget per refresh, shared across concurrent requests and redirects. */
export class AcquisitionBudget {
  readonly limits: AcquisitionLimits;
  readonly startedAt = Date.now();
  private requests = 0;
  private bytes = 0;

  constructor(overrides: Partial<AcquisitionLimits> = {}) {
    this.limits = acquisitionLimits(overrides);
  }

  remainingTime(): number {
    const remaining = this.limits.runTimeoutMs - (Date.now() - this.startedAt);
    if (remaining <= 0)
      throw new AcquisitionLimitError('Acquisition deadline exceeded');
    return remaining;
  }

  request(): void {
    this.remainingTime();
    if (++this.requests > this.limits.requests) {
      throw new AcquisitionLimitError('Acquisition request budget exceeded');
    }
  }

  consume(bytes: number): void {
    this.remainingTime();
    this.bytes += bytes;
    if (this.bytes > this.limits.totalBytes) {
      throw new AcquisitionLimitError('Acquisition total byte budget exceeded');
    }
  }

  checkItems(count: number): void {
    if (count > this.limits.discoveredItems) {
      throw new AcquisitionLimitError(
        'Acquisition discovered-item budget exceeded',
      );
    }
  }
}

/** Bound discovery before dispatch; callback results should omit raw bodies. */
export async function mapAcquisitionItems<T, R>(
  items: readonly T[],
  budget: AcquisitionBudget,
  consume: (item: T) => Promise<R>,
): Promise<R[]> {
  budget.checkItems(items.length);
  const results: R[] = [];
  for (
    let offset = 0;
    offset < items.length;
    offset += budget.limits.concurrency
  ) {
    budget.remainingTime();
    results.push(
      ...(await Promise.all(
        items.slice(offset, offset + budget.limits.concurrency).map(consume),
      )),
    );
  }
  return results;
}
