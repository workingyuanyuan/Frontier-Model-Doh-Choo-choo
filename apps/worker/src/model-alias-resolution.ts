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
