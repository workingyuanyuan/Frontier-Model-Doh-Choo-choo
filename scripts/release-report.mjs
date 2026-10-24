/**
 * Mechanical before/after comparison for a data release (OPERATIONS §5–6).
 * It lists what changed; judging whether a change is significant, and the
 * human spot-check list, stay with the agent and the reviewer.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const byId = (rows, key = 'id') => new Map(rows.map((row) => [row[key], row]));

const setDiff = (before, after) => ({
  added: [...after].filter((id) => !before.has(id)).toSorted(),
  removed: [...before].filter((id) => !after.has(id)).toSorted(),
});

const round = (value) =>
  value === null || value === undefined ? null : Math.round(value * 100) / 100;

export const diffPreset = (before, after) => {
  const oldRows = byId(before?.leaderboard ?? [], 'modelId');
  const newRows = byId(after?.leaderboard ?? [], 'modelId');
  const models = setDiff(new Set(oldRows.keys()), new Set(newRows.keys()));
  const continuing = [...newRows.keys()]
    .filter((id) => oldRows.has(id))
    .map((modelId) => {
      const old = oldRows.get(modelId);
      const now = newRows.get(modelId);
      return {
        modelId,
        oldProfileId: old.profileId,
        newProfileId: now.profileId,
        oldRank: old.rank,
        newRank: now.rank,
        oldOverall: round(old.overallScore),
        newOverall: round(now.overallScore),
        overallDelta:
          old.overallScore === null || now.overallScore === null
            ? null
            : round(now.overallScore - old.overallScore),
      };
    })
    .toSorted((left, right) => (left.newRank ?? 99) - (right.newRank ?? 99));
  return {
    id: after?.id ?? before?.id,
    targetModelCount:
      after?.targetModelCount ?? before?.targetModelCount ?? null,
    benchmarks: setDiff(
      new Set(before?.benchmarkIds ?? []),
      new Set(after?.benchmarkIds ?? []),
    ),
    benchmarkCount: {
      before: before?.benchmarkIds.length ?? 0,
      after: after?.benchmarkIds.length ?? 0,
    },
    models,
    entered: models.added.map((modelId) => {
      const row = newRows.get(modelId);
      return {
        modelId,
        profileId: row.profileId,
        rank: row.rank,
        overall: round(row.overallScore),
      };
    }),
    continuing,
  };
};

export const diffProducts = (before, after) => {
  const presetIds = [
    ...new Set([...before.presets, ...after.presets].map(({ id }) => id)),
  ];
  const oldPresets = byId(before.presets);
  const newPresets = byId(after.presets);
  const frontier = (product) =>
    product.frontier.map(({ modelId, externalCompositeScores }) => ({
      modelId,
      aa: round(externalCompositeScores?.['artificial-analysis']),
    }));
  return {
    versionId: { before: before.versionId, after: after.versionId },
    counts: Object.fromEntries(
      ['profiles', 'evidence', 'costs', 'presets'].map((key) => [
        key,
        { before: before[key].length, after: after[key].length },
      ]),
    ),
    profiles: setDiff(
      new Set(before.profiles.map(({ id }) => id)),
      new Set(after.profiles.map(({ id }) => id)),
    ),
    sourceSnapshots: setDiff(
      new Set(before.sourceSnapshotIds),
      new Set(after.sourceSnapshotIds),
    ),
    frontier: { before: frontier(before), after: frontier(after) },
    defaultPresetId: after.defaultPresetId,
    presets: presetIds.map((id) =>
      diffPreset(oldPresets.get(id), newPresets.get(id)),
    ),
  };
};

const INFERENCE_ROW =
  /^\| (?<model>[^|]+) \| `(?<candidateId>[^`]+)` \| (?<raw>[^|]+) \| `(?<effort>[^`]+)` \| (?<basisSource>[^|]+) \| (?<basisCandidate>[^|]+) \|$/u;

/**
 * Effort inferences (SPEC §4.5) that reach the default preset: the inferred
 * candidate belongs to a model on that leaderboard and a benchmark in it.
 */
export const defaultPresetInferences = (root, product) => {
  const preset = product.presets.find(
    ({ id }) => id === product.defaultPresetId,
  );
  const models = new Set(preset.leaderboard.map(({ modelId }) => modelId));
  const benchmarks = new Set(preset.benchmarkIds);
  const sources = JSON.parse(
    readFileSync(join(root, 'data/mappings/sources.json'), 'utf8'),
  ).whitelist;
  const rows = [];
  for (const source of sources) {
    const directory = join(root, 'data/sources', source);
    const reportPath = join(directory, 'validation-report.md');
    if (!existsSync(reportPath)) continue;
    const candidates = byId(
      JSON.parse(readFileSync(join(directory, 'candidates.json'), 'utf8')),
    );
    for (const line of readFileSync(reportPath, 'utf8').split('\n')) {
      const match = INFERENCE_ROW.exec(line.trim());
      if (!match) continue;
      const candidate = candidates.get(match.groups.candidateId);
      if (
        !candidate ||
        !models.has(candidate.model.canonicalModelId) ||
        !benchmarks.has(candidate.benchmarkId)
      ) {
        continue;
      }
      rows.push({
        sourceId: source,
        modelId: candidate.model.canonicalModelId,
        benchmarkId: candidate.benchmarkId,
        candidateId: match.groups.candidateId,
        effort: match.groups.effort,
        basisSource: match.groups.basisSource.trim(),
        basisCandidate: match.groups.basisCandidate.trim(),
      });
    }
  }
  return rows;
};

const list = (values) =>
  values.length === 0 ? '—' : values.map((value) => `\`${value}\``).join(', ');

export const renderReleaseMarkdown = ({
  receipt,
  diff,
  inferences,
  skipped = [],
}) => {
  const lines = [
    `# Data release ${receipt.runId}`,
    '',
    `- Status: **${receipt.status}**${receipt.failedStep ? ` (failed at \`${receipt.failedStep}\`)` : ''}`,
    `- Review: ${receipt.review}`,
    `- versionId: \`${diff?.versionId.before ?? receipt.previousVersionId}\` → \`${diff?.versionId.after ?? receipt.versionId}\``,
    `- HEAD: \`${receipt.head}\`; started ${receipt.startedAt}; finished ${receipt.finishedAt}`,
    `- Baseline copy: \`${receipt.baselineDir}\``,
    '',
    '## Steps',
    '',
    '| Step | Exit | Seconds | Log |',
    '| --- | --- | --- | --- |',
    ...receipt.steps.map(
      ({ id, exitCode, ms, log }) =>
        `| ${id} | ${exitCode} | ${(ms / 1000).toFixed(1)} | \`${log ?? '—'}\` |`,
    ),
  ];
  if (!diff) return `${lines.join('\n')}\n`;
  lines.push(
    '',
    '## Counts',
    '',
    '| Item | Before | After |',
    '| --- | --- | --- |',
    ...Object.entries(diff.counts).map(
      ([key, { before, after }]) => `| ${key} | ${before} | ${after} |`,
    ),
    '',
    `Profiles added: ${list(diff.profiles.added)}`,
    '',
    `Profiles removed: ${list(diff.profiles.removed)}`,
    '',
    '## Source snapshots',
    '',
    `Added: ${list(diff.sourceSnapshots.added)}`,
    '',
    `Removed: ${list(diff.sourceSnapshots.removed)}`,
    '',
    '## Model-count options',
    '',
    'Common tests per cohort size; the default grows past eight models only while the count holds.',
    '',
    '| Models | Preset | Common tests (before → after) |',
    '| --- | --- | --- |',
    ...diff.presets
      .filter(({ targetModelCount }) => targetModelCount !== null)
      .toSorted((left, right) => left.targetModelCount - right.targetModelCount)
      .map(
        ({ id, targetModelCount, benchmarkCount }) =>
          `| ${targetModelCount} | \`${id}\`${id === diff.defaultPresetId ? ' (default)' : ''} | ${benchmarkCount.before} → ${benchmarkCount.after} |`,
      ),
    '',
    '## Frontier models (AA-ranked, passing eligibility)',
    '',
    '| # | Before | AA | After | AA |',
    '| --- | --- | --- | --- | --- |',
    ...diff.frontier.after.map((row, index) => {
      const old = diff.frontier.before[index];
      return `| ${index + 1} | ${old?.modelId ?? '—'} | ${old?.aa ?? '—'} | ${row.modelId} | ${row.aa ?? '—'} |`;
    }),
    '',
    '## Skipped by frontier eligibility',
    '',
    'AA leaders whose AA-winning profile is scored by fewer than two independent organizations (FRONTIER_POLICY).',
    '',
    skipped.length === 0
      ? 'None.'
      : [
          '| AA rank | Model | AA | Organizations |',
          '| --- | --- | --- | --- |',
          ...skipped.map(
            (row) =>
              `| ${row.rank} | ${row.modelId} | ${round(row.score)} | ${row.organizations.length === 0 ? '—' : row.organizations.join(', ')} |`,
          ),
        ].join('\n'),
  );
  for (const preset of diff.presets) {
    lines.push(
      '',
      `## Preset \`${preset.id}\`${preset.id === diff.defaultPresetId ? ' (default)' : ''}`,
      '',
      `- Benchmarks ${preset.benchmarkCount.before} → ${preset.benchmarkCount.after}; added ${list(preset.benchmarks.added)}; removed ${list(preset.benchmarks.removed)}`,
      `- Models entered: ${list(preset.models.added)}; left: ${list(preset.models.removed)}`,
      '',
      '| Model | Profile | Rank | Overall | Δ |',
      '| --- | --- | --- | --- | --- |',
      ...preset.entered.map(
        ({ modelId, profileId, rank, overall }) =>
          `| ${modelId} (new) | ${profileId} | ${rank ?? '—'} | ${overall ?? '—'} | — |`,
      ),
      ...preset.continuing.map(
        (row) =>
          `| ${row.modelId} | ${row.oldProfileId === row.newProfileId ? row.newProfileId : `${row.oldProfileId} → ${row.newProfileId}`} | ${row.oldRank ?? '—'} → ${row.newRank ?? '—'} | ${row.oldOverall ?? '—'} → ${row.newOverall ?? '—'} | ${row.overallDelta ?? '—'} |`,
      ),
    );
  }
  lines.push(
    '',
    '## Effort inferences reaching the default preset',
    '',
    inferences.length === 0
      ? 'None.'
      : [
          '| Model | Benchmark | Source | Effort | Basis |',
          '| --- | --- | --- | --- | --- |',
          ...inferences.map(
            (row) =>
              `| ${row.modelId} | ${row.benchmarkId} | ${row.sourceId} | ${row.effort} | ${row.basisSource}: ${row.basisCandidate} |`,
          ),
        ].join('\n'),
  );
  return `${lines.join('\n')}\n`;
};
