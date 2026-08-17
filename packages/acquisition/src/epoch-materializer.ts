import AdmZip from 'adm-zip';
import { type CandidateResult } from '@llm-bench/benchmark-data';

import { parseCsv, resolveModel, slugify } from './materializer-utils.js';

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

    // profile effort and thinking logic
    let effort: string | null = null;
    let thinking: string | null = null;
    if (version.endsWith('_promax') || version.endsWith('_pro_max')) {
      effort = 'max';
      thinking = 'pro';
    } else if (version.endsWith('_max')) {
      effort = 'max';
    } else if (version.endsWith('_xhigh')) {
      effort = 'xhigh';
    } else if (version.endsWith('_high')) {
      effort = 'high';
    } else if (version.endsWith('_medium')) {
      effort = 'medium';
    } else if (version.endsWith('_low')) {
      effort = 'low';
    }
    if (version.includes('_thinking')) {
      thinking = 'reasoning';
    }
    if (version.includes('-pro') || version.includes('_pro')) {
      thinking = 'pro';
    }

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
      exclusionReason:
        'Composite index is selection-only and must not be double-counted in eight-dimension scoring.',
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
  const directFiles = [
    {
      name: 'gpqa_diamond.csv',
      benchmarkId: 'gpqa-diamond',
      isOrganizer: false,
    },
    {
      name: 'math_level_5.csv',
      benchmarkId: 'math-level-5',
      isOrganizer: false,
    },
    {
      name: 'swe_bench_verified.csv',
      benchmarkId: 'swe-bench',
      isOrganizer: false,
    },
    {
      name: 'otis_mock_aime_2024_2025.csv',
      benchmarkId: 'aime',
      isOrganizer: false,
    },
    {
      name: 'frontiermath.csv',
      benchmarkId: 'frontiermath',
      isOrganizer: true,
      version: null,
    },
    {
      name: 'frontiermath_tier_4.csv',
      benchmarkId: 'frontiermath',
      isOrganizer: true,
      version: 'Tier 4',
    },
    {
      name: 'simpleqa_verified.csv',
      benchmarkId: 'simpleqa-verified',
      isOrganizer: false,
    },
    {
      name: 'chess_puzzles.csv',
      benchmarkId: 'chess-puzzles',
      isOrganizer: false,
    },
  ];

  for (const f of directFiles) {
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

      // profile effort and thinking logic
      let effort: string | null = null;
      let thinking: string | null = null;
      if (version.endsWith('_promax') || version.endsWith('_pro_max')) {
        effort = 'max';
        thinking = 'pro';
      } else if (version.endsWith('_max')) {
        effort = 'max';
      } else if (version.endsWith('_xhigh')) {
        effort = 'xhigh';
      } else if (version.endsWith('_high')) {
        effort = 'high';
      } else if (version.endsWith('_medium')) {
        effort = 'medium';
      } else if (version.endsWith('_low')) {
        effort = 'low';
      }
      if (version.includes('_thinking')) {
        thinking = 'reasoning';
      }
      if (version.includes('-pro') || version.includes('_pro')) {
        thinking = 'pro';
      }

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
        inclusion: 'INCLUDED',
        exclusionReason: null,
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
