import {
  CandidateResultSchema,
  SourceManifestSchema,
  type CandidateResult,
  type SourceManifest,
} from '@llm-bench/benchmark-data';
import { slugify } from './materializer-utils.js';
import {
  resolveSurgeModel,
  surgeConfiguration,
  surgeLeaderboardRows,
  surgePercentRow,
  surgeText as text,
} from './surge-materializer-utils.js';

/** Everything that distinguishes one Surge percentage leaderboard from another. */
export interface SurgePercentLeaderboardSpec {
  sourceId: string;
  benchmarkId: string;
  pageUrl: string;
  /** Exact `<h1>` text; a different title means a different page. */
  pageTitle: string;
  /** Short name used in errors and the report heading. */
  label: string;
  displayName: string;
  /** Attempts per task when the organizer states it for every row. */
  attempts: number | null;
  metric: { id: string; name: string };
  /** Completes "Scores are the main leaderboard …". */
  scoreSummary: string;
  /** Methodology paragraphs closing the validation report. */
  reportParagraphs: readonly string[];
  manifestNotes: readonly string[];
}

export interface SurgePercentLeaderboardContext {
  evidenceId: string;
  observedAt: string;
  visualRowCount: number;
}

/** Parse only the main leaderboard's HTML. Related benchmark cards and the
 * independently maintained cost/token charts are outside this snapshot. */
export function materializeSurgePercentLeaderboard(
  spec: SurgePercentLeaderboardSpec,
  html: string,
  context: SurgePercentLeaderboardContext,
): {
  candidates: CandidateResult[];
  visibleRows: number;
  validationReport: string;
} {
  if (
    text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1] ?? '') !==
    spec.pageTitle
  ) {
    throw new Error(`${spec.label} page marker missing`);
  }
  const rows = surgeLeaderboardRows(html, context.visualRowCount, spec.label);
  const candidates = rows
    .map((row, index) => {
      const { brand, name, score } = surgePercentRow(row, index, spec.label);
      // Inkling's CMS row repeats its brand as the entire model name.
      const rawName =
        name === brand || name.startsWith(`${brand} `)
          ? name
          : `${brand} ${name}`;
      const config = surgeConfiguration(rawName, spec.label);
      const canonicalModelId = resolveSurgeModel(config.modelName);
      const locator = `.lead-main [data-leaderboard-row] (zero-based index ${index})`;
      return CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `${spec.sourceId}:${spec.benchmarkId}:${slugify(rawName)}`,
        sourceId: spec.sourceId,
        sourceRole: 'ORGANIZER',
        benchmarkId: spec.benchmarkId,
        benchmarkVersion: null,
        model: {
          rawName,
          canonicalModelId,
          profileId:
            canonicalModelId && config.effort
              ? `${canonicalModelId}-${config.effort}`
              : null,
        },
        profile: {
          effort: config.effort,
          thinking: config.thinking,
          tools: null,
          harness: null,
          contextWindowTokens: null,
          quantization: null,
          attempts: spec.attempts,
        },
        metric: {
          id: spec.metric.id,
          name: spec.metric.name,
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: score,
        normalizedScore: score,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: spec.pageUrl,
        observedAt: context.observedAt,
        sourcePublishedAt: null,
        evidenceIds: [context.evidenceId],
        provenance: {
          rawScore: {
            evidenceId: context.evidenceId,
            locator: `${locator} [data-score] (row ${index + 1}: ${rawName})`,
            method: 'DOM',
          },
          profile: {
            evidenceId: context.evidenceId,
            locator: `${locator} .head-rank-table-name (row ${index + 1}: ${rawName})`,
            method: 'DOM',
          },
        },
      });
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  if (new Set(candidates.map(({ id }) => id)).size !== candidates.length)
    throw new Error(`Duplicate ${spec.label} model/configuration`);
  const unresolved = candidates
    .filter((c) => c.model.canonicalModelId === null)
    .map((c) => c.model.rawName);
  return {
    candidates,
    visibleRows: rows.length,
    validationReport: [
      `# Surge ${spec.label} acquisition validation`,
      '',
      `- Source: <${spec.pageUrl}>`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Main leaderboard: ${rows.length} rows; rendered browser count: ${context.visualRowCount}.`,
      '- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.',
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      '',
      `Scores are the main leaderboard ${spec.scoreSummary}. Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.`,
      ...spec.reportParagraphs.flatMap((paragraph) => ['', paragraph]),
      '',
    ].join('\n'),
  };
}

export const surgePercentLeaderboardManifest = (
  spec: SurgePercentLeaderboardSpec,
  observedAt: string,
): SourceManifest =>
  SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: spec.sourceId,
    displayName: spec.displayName,
    role: 'ORGANIZER',
    baseUrl: spec.pageUrl,
    targetUrls: [spec.pageUrl],
    benchmarkIds: [spec.benchmarkId],
    accessMethods: ['DOM'],
    completeness: {
      expectedCountMethod:
        'Compare main leaderboard rows with rendered browser count, validate one numeric score and percent marker per row, and cross-check any numeric data-score attributes against visible text.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      '.head-rank-table-brand + .head-rank-table-name':
        'model.rawName / profile.effort / profile.thinking',
      '[data-score] numeric displayed text': 'rawScore / normalizedScore',
    },
    fallbackMethods: ['VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [...spec.manifestNotes],
  });
