export interface ModelAliasCandidate {
  readonly namespace: string;
  readonly alias: string;
  readonly modelVariantId: string;
  readonly priority?: number;
}

export type ModelAliasResolution =
  | {
      readonly status: 'RESOLVED';
      readonly normalizedAlias: string;
      readonly modelVariantId: string;
    }
  | {
      readonly status: 'UNRESOLVED';
      readonly normalizedAlias: string;
    }
  | {
      readonly status: 'AMBIGUOUS';
      readonly normalizedAlias: string;
      readonly candidateModelVariantIds: readonly string[];
    };

export interface ModelAliasReviewRecord {
  readonly rawModelName: string;
}

export interface ModelAliasReviewQueueItem {
  readonly normalizedAlias: string;
  readonly totalRows: number;
  readonly rawAliases: readonly {
    readonly alias: string;
    readonly rows: number;
  }[];
  readonly resolution: ModelAliasResolution;
}

export function normalizeModelAlias(alias: string): string {
  return alias
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/gu, ' ');
}

export function resolveExactModelAlias(
  namespace: string,
  rawAlias: string,
  candidates: readonly ModelAliasCandidate[],
): ModelAliasResolution {
  const normalizedAlias = normalizeModelAlias(rawAlias);
  const matchingVariantIds = [
    ...new Set(
      candidates
        .filter(
          (candidate) =>
            candidate.namespace === namespace &&
            normalizeModelAlias(candidate.alias) === normalizedAlias,
        )
        .map((candidate) => candidate.modelVariantId),
    ),
  ].sort();

  if (matchingVariantIds.length === 0) {
    return { status: 'UNRESOLVED', normalizedAlias };
  }
  if (matchingVariantIds.length > 1) {
    return {
      status: 'AMBIGUOUS',
      normalizedAlias,
      candidateModelVariantIds: matchingVariantIds,
    };
  }

  return {
    status: 'RESOLVED',
    normalizedAlias,
    modelVariantId: matchingVariantIds[0]!,
  };
}

const resolutionReviewOrder: Readonly<
  Record<ModelAliasResolution['status'], number>
> = {
  AMBIGUOUS: 0,
  UNRESOLVED: 1,
  RESOLVED: 2,
};

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function buildModelAliasReviewQueue(
  namespace: string,
  records: readonly ModelAliasReviewRecord[],
  candidates: readonly ModelAliasCandidate[],
): ModelAliasReviewQueueItem[] {
  const groups = new Map<string, Map<string, number>>();

  for (const record of records) {
    const normalizedAlias = normalizeModelAlias(record.rawModelName);
    const rawAliases = groups.get(normalizedAlias) ?? new Map<string, number>();
    rawAliases.set(
      record.rawModelName,
      (rawAliases.get(record.rawModelName) ?? 0) + 1,
    );
    groups.set(normalizedAlias, rawAliases);
  }

  return [...groups.entries()]
    .map(([normalizedAlias, rawAliasCounts]) => {
      const rawAliases = [...rawAliasCounts.entries()]
        .map(([alias, rows]) => ({ alias, rows }))
        .sort((left, right) => compareText(left.alias, right.alias));

      return {
        normalizedAlias,
        totalRows: rawAliases.reduce((sum, alias) => sum + alias.rows, 0),
        rawAliases,
        resolution: resolveExactModelAlias(
          namespace,
          normalizedAlias,
          candidates,
        ),
      };
    })
    .sort(
      (left, right) =>
        resolutionReviewOrder[left.resolution.status] -
          resolutionReviewOrder[right.resolution.status] ||
        right.totalRows - left.totalRows ||
        compareText(left.normalizedAlias, right.normalizedAlias),
    );
}
