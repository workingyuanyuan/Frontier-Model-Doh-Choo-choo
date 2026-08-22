import AdmZip from 'adm-zip';
import { type CandidateResult } from '@llm-bench/benchmark-data';

import {
  normalizeSourceEffort,
  parseCsv,
  resolveModel,
  slugify,
} from './materializer-utils.js';

function parseEciLine(line: string): string[] {
  const row: string[] = [];
  let cell = '';
  let inQuotes = false;
  let escapeNext = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (escapeNext) {
      cell += char;
      escapeNext = false;
    } else if (char === '\\') {
      escapeNext = true;
    } else if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell);
  return row;
}

/**
 * Every Epoch-run result file the materializer promotes, paired with the task
 * name the same rows carry in the live `benchmarks.csv` the rendered pages read.
 * The refresh compares the two channels row for row; keeping both names in one
 * table is what makes that comparison impossible to drift.
 */
/**
 * Epoch encodes the run configuration as a suffix on `Model version`, for
 * example `gpt-5.6-sol_max` or `gemini-3.6-flash_minimal`. Only suffixes that
 * name an effort tier become `profile.effort`; anything else stays null so that
 * section 4.5 inference decides, which is the honest reading of "the source did
 * not say".
 *
 * Two suffixes must not be left to inference, because the source did say:
 *
 * - `_none` is reasoning switched off. Left unlabelled it was inferred to
 *   whatever tier the other sources ran, so a reasoning-off run was filed as the
 *   model's max-effort result. GPT-5.6 Sol's Chess Puzzles score became 7.00
 *   instead of 55.00 and its AIME score 68.89 instead of its real max run, which
 *   is what made its Reasoning and Math dimensions look wrong on the main screen.
 *   Section 4.4 rule 2 files a source-declared configuration; it never infers it.
 * - `_minimal` is the bottom tier and section 4.4 maps it to `low`. It was being
 *   inferred to `high`.
 *
 * Token-budget suffixes such as `_32K`, and the literal `_unknown`, are not
 * effort tiers and stay null deliberately.
 */
export interface EpochVersionConfiguration {
  effort: string | null;
  thinking: string | null;
  /**
   * True when the `pro` marker sits in the configuration suffix rather than in
   * the model version itself, which means Epoch is describing a configuration of
   * the base model, not a separate model.
   *
   * Where Epoch treats a Pro release as its own model it says so in the version
   * prefix and in the model name: `gpt-5.5-pro_xhigh` / "GPT-5.5 Pro (xhigh)",
   * likewise `gpt-5.4-pro-2026-03-05_xhigh`. Those resolve to their own catalog
   * models and score normally.
   *
   * GPT-5.6 Sol Pro is not published that way. It is `gpt-5.6-sol_promax`, still
   * named "GPT-5.6 Sol", with the base model's release date and `pro` appearing
   * only inside the effort parenthetical. Per the user's criterion (2026-08-22)
   * that is not a distinct model, so the row stays under GPT-5.6 Sol -- but it
   * must not stand in for the base model's own max run either. Left included it
   * did exactly that: Sol's Chess Puzzles score came out as the Pro run's 64.00
   * instead of its own 55.00.
   */
  proConfiguration: boolean;
}

export const decodeVersionSuffix = (
  version: string,
): EpochVersionConfiguration => {
  const lower = version.toLowerCase();
  const separator = lower.lastIndexOf('_');
  const prefix = separator === -1 ? lower : lower.slice(0, separator);
  const suffix = separator === -1 ? '' : lower.slice(separator + 1);

  const proModel = prefix.includes('-pro') || prefix.includes('_pro');
  const proConfiguration = !proModel && suffix.startsWith('pro');
  const thinking =
    proModel || proConfiguration
      ? 'pro'
      : lower.includes('_thinking')
        ? 'reasoning'
        : null;

  if (suffix === 'promax' || suffix === 'pro_max') {
    return { effort: 'max', thinking, proConfiguration };
  }
  if (suffix === 'none') {
    return { effort: 'non-reasoning', thinking, proConfiguration };
  }
  return {
    effort: normalizeSourceEffort(suffix),
    thinking,
    proConfiguration,
  };
};

const PRO_CONFIGURATION_EXCLUSION =
  'A `pro` configuration of the base model is not evidence for the base model at that effort tier. Epoch publishes its distinct Pro models in the model version itself (gpt-5.5-pro, gpt-5.4-pro); this row is a suffix on the base version and stays with the base model as reviewable, non-scoring evidence.';

export const EPOCH_DIRECT_FILES = [
  {
    name: 'gpqa_diamond.csv',
    benchmarkId: 'gpqa-diamond',
    isOrganizer: false,
    version: null,
    liveTaskName: 'GPQA diamond',
  },
  {
    name: 'math_level_5.csv',
    benchmarkId: 'math-level-5',
    isOrganizer: false,
    version: null,
    liveTaskName: 'MATH level 5',
  },
  {
    name: 'swe_bench_verified.csv',
    benchmarkId: 'swe-bench',
    isOrganizer: false,
    version: null,
    liveTaskName: 'SWE-Bench verified',
  },
  {
    name: 'otis_mock_aime_2024_2025.csv',
    benchmarkId: 'aime',
    isOrganizer: false,
    version: null,
    liveTaskName: 'OTIS Mock AIME 2024-2025',
  },
  {
    name: 'frontiermath.csv',
    benchmarkId: 'frontiermath',
    isOrganizer: true,
    version: null,
    liveTaskName: 'FrontierMath-2025-02-28-Private',
  },
  {
    name: 'frontiermath_tier_4.csv',
    benchmarkId: 'frontiermath',
    isOrganizer: true,
    version: 'Tier 4',
    liveTaskName: 'FrontierMath-Tier-4-2025-07-01-Private',
  },
  {
    name: 'simpleqa_verified.csv',
    benchmarkId: 'simpleqa-verified',
    isOrganizer: false,
    version: null,
    liveTaskName: 'SimpleQA Verified',
  },
  {
    name: 'chess_puzzles.csv',
    benchmarkId: 'chess-puzzles',
    isOrganizer: false,
    version: null,
    liveTaskName: 'Chess Puzzles',
  },
] as const;

export function materializeEpoch(
  zipBuffer: Buffer,
  observedAt: string,
  context: { evidenceId?: string; sourceUrl?: string } = {},
): CandidateResult[] {
  const zip = new AdmZip(zipBuffer);
  const candidates: CandidateResult[] = [];
  const sourceId = 'epoch-ai';
  const sourceUrl =
    context.sourceUrl ?? 'https://epoch.ai/benchmarks/use-this-data';
  const evidenceId =
    context.evidenceId ??
    'sha256:f8ce95989868ba75347e92b661e5f700f5c07767f9884768d36632425c78a3b9';

  // 1. Load ECI capabilities index to map versions to display names
  const eciEntry = zip.getEntry('epoch_capabilities_index.csv');
  if (!eciEntry) throw new Error('epoch_capabilities_index.csv not found');
  const eciText = eciEntry.getData().toString('utf8');

  // ECI must be split naively by line to get exactly 719 rows
  const eciLines = eciText.split(/\r?\n/).filter((line) => line.trim());
  const eciRows = eciLines.map(parseEciLine);

  const versionToDisplayName = new Map<string, string>();
  for (let i = 1; i < eciRows.length; i++) {
    const row = eciRows[i];
    if (!row) continue;
    const version = row[0];
    if (version) {
      const displayName = row[10] || row[8] || version;
      versionToDisplayName.set(version, displayName);
    }
  }

  // Parse ECI candidates (from row 1 to 719)
  for (let i = 1; i < eciRows.length; i++) {
    const row = eciRows[i];
    if (!row) continue;
    const version = row[0];
    if (!version) continue;
    const scoreStr = row[1]?.trim();
    if (!scoreStr) continue;
    const rawScoreVal = parseFloat(scoreStr);
    if (isNaN(rawScoreVal) || !isFinite(rawScoreVal)) continue;
    const releaseDate = row[2] ? `${row[2]}T00:00:00.000Z` : null;
    const displayName = row[10] || row[8] || version;

    const { canonicalModelId, profileId, rawName } = resolveModel(
      displayName,
      'epoch-ai',
    );

    const { effort, thinking, proConfiguration } = decodeVersionSuffix(version);

    const modelPart = profileId || slugify(rawName);

    candidates.push({
      schemaVersion: 'candidate-result-v1',
      id: `${sourceId}:epoch-capabilities-index:${modelPart}-row-${i}`,
      sourceId,
      sourceRole: 'ORGANIZER',
      benchmarkId: 'epoch-capabilities-index',
      benchmarkVersion: '2026-07-16',
      model: {
        rawName,
        canonicalModelId,
        profileId,
      },
      profile: {
        effort,
        thinking,
        tools: null,
        harness: 'Epoch AI Inspect',
        contextWindowTokens: null,
        quantization: null,
        attempts: 1,
      },
      metric: {
        id: 'eci-score',
        name: 'ECI Score',
        unit: 'eci-points',
        higherIsBetter: true,
      },
      rawScore: rawScoreVal,
      normalizedScore: null,
      acquisitionStatus: 'FULL',
      inclusion: 'EXCLUDED',
      exclusionReason: proConfiguration
        ? PRO_CONFIGURATION_EXCLUSION
        : 'Composite index is selection-only and must not be double-counted in eight-dimension scoring.',
      sourceUrl,
      observedAt,
      sourcePublishedAt: releaseDate,
      evidenceIds: [evidenceId],
      provenance: {
        rawScore: {
          evidenceId,
          method: 'EXPORT',
          locator: `epoch_capabilities_index.csv[Model version="${version}"].ECI Score`,
        },
        sourceRole: {
          evidenceId,
          method: 'EXPORT',
          locator:
            'epoch_capabilities_index.csv (filename has no _external suffix)',
        },
      },
    });
  }

  // 2. Parse direct benchmarks using the robust CSV parser
  for (const f of EPOCH_DIRECT_FILES) {
    const entry = zip.getEntry(f.name);
    if (!entry) continue;
    const text = entry.getData().toString('utf8');
    const rows = parseCsv(text);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row[0]) continue;
      const version = row[0];
      const scoreStr = row[1]?.trim();
      if (!scoreStr) continue;
      const meanScore = parseFloat(scoreStr);
      if (isNaN(meanScore) || !isFinite(meanScore)) continue;
      const startedAt = row[11] || null;

      const displayName = versionToDisplayName.get(version) || version;
      const { canonicalModelId, profileId, rawName } = resolveModel(
        displayName,
        'epoch-ai',
      );

      const { effort, thinking, proConfiguration } =
        decodeVersionSuffix(version);

      const modelPart = profileId || slugify(rawName);
      const versionPart = f.version ? `:${slugify(f.version)}` : '';
      const candidateId = `${sourceId}:${f.benchmarkId}:${modelPart}-row-${i}${versionPart}`;

      candidates.push({
        schemaVersion: 'candidate-result-v1',
        id: candidateId,
        sourceId,
        sourceRole: f.isOrganizer ? 'ORGANIZER' : 'INDEPENDENT',
        benchmarkId: f.benchmarkId,
        benchmarkVersion: f.version || null,
        model: {
          rawName,
          canonicalModelId,
          profileId,
        },
        profile: {
          effort,
          thinking,
          tools: null,
          harness: 'Epoch AI Inspect',
          contextWindowTokens: null,
          quantization: null,
          attempts: 1,
        },
        metric: {
          id: 'accuracy',
          name: 'Accuracy',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: meanScore,
        normalizedScore: meanScore * 100,
        acquisitionStatus: 'FULL',
        inclusion: proConfiguration ? 'EXCLUDED' : 'INCLUDED',
        exclusionReason: proConfiguration ? PRO_CONFIGURATION_EXCLUSION : null,
        sourceUrl,
        observedAt,
        sourcePublishedAt: startedAt,
        evidenceIds: [evidenceId],
        provenance: {
          rawScore: {
            evidenceId,
            method: 'EXPORT',
            locator: `${f.name}[Model version="${version}"].mean_score`,
          },
          sourceRole: {
            evidenceId,
            method: 'EXPORT',
            locator: f.isOrganizer
              ? `${f.name} (FrontierMath is organizer evidence)`
              : `${f.name} (rerun of external benchmark)`,
          },
        },
      });
    }
  }

  return candidates;
}
