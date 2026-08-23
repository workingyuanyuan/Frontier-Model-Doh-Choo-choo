import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format as formatWithPrettier } from 'prettier';

import {
  analyzeCoverageMatrix,
  loadWorkspaceCoverageData,
  type CoverageMatrixAnalysis,
} from './coverage-matrix.js';
import {
  DisplaySetPolicySchema,
  DisplaySetSchema,
  validateDisplaySet,
  type DisplaySet,
  type DisplaySetPolicy,
  type DisplaySetPreset,
} from './index.js';

/**
 * Turn the user's preset rule into `display-set.json`.
 *
 * The rule (D-N10-7): for each target complete-model count `M`, take the
 * LARGEST scale `N` that still reaches `M`. Both curves are non-increasing --
 * dropping a benchmark from an optimal `N + 1` subset yields an `N` subset at
 * least as complete -- so each `M` owns a contiguous run of scales and the rule
 * picks its right-hand end. Same model count, more measurement: never pay a
 * benchmark for nothing.
 *
 * `M` is the user-facing axis, so both curves must offer the SAME set of model
 * counts; otherwise flipping the all-sources switch would silently change which
 * positions the slider has. Only counts reachable on both curves are emitted.
 *
 * Nothing here decides preset content. The rule is the user's, and the
 * benchmark lists come straight out of the coverage report, which is why this
 * file is generated rather than hand-typed.
 */
export interface GenerateDisplaySetOptions {
  repositoryRoot?: string;
  referenceDate?: string;
  outputPath?: string;
  /** Smallest target model count offered. */
  minModelCount?: number;
  /** Largest target model count offered. */
  maxModelCount?: number;
  /** Preset the app opens on. */
  defaultPresetId?: string;
}

export const UNCONSTRAINED_PRESET_PREFIX = 'free-sources';
export const ALL_SOURCES_PRESET_PREFIX = 'all-sources';

const presetId = (requireAllSources: boolean, modelCount: number): string =>
  `${
    requireAllSources ? ALL_SOURCES_PRESET_PREFIX : UNCONSTRAINED_PRESET_PREFIX
  }-${modelCount}`;

export interface ScaleChoice {
  benchmarkCount: number;
  benchmarkIds: string[];
}

/**
 * Largest scale reaching each complete-model count, keyed by that count.
 */
export const largestScaleByModelCount = (
  analysis: CoverageMatrixAnalysis,
): Map<number, ScaleChoice> => {
  const byModelCount = new Map<number, ScaleChoice>();
  for (const tradeoff of analysis.tradeoffs) {
    const candidate = tradeoff.candidates[0];
    if (!candidate) continue;
    // Scales are visited in ascending order, so the last write for a given
    // model count is the largest scale that still reaches it.
    byModelCount.set(candidate.completeModelCount, {
      benchmarkCount: tradeoff.benchmarkCount,
      benchmarkIds: candidate.benchmarkIds,
    });
  }
  return byModelCount;
};

export interface GeneratedDisplaySet {
  displaySet: DisplaySet;
  /** Model counts both curves reach: the toggle changes composition, not size. */
  sharedModelCounts: number[];
  /** Model counts only the all-sources curve reaches. */
  allSourcesOnlyModelCounts: number[];
  /** Model counts only the unconstrained curve reaches. */
  unconstrainedOnlyModelCounts: number[];
}

export const buildDisplaySetFromCurves = (
  unconstrained: CoverageMatrixAnalysis,
  allSources: CoverageMatrixAnalysis,
  options: {
    minModelCount: number;
    maxModelCount: number;
    defaultPresetId: string;
  },
): GeneratedDisplaySet => {
  const freeByCount = largestScaleByModelCount(unconstrained);
  const allByCount = largestScaleByModelCount(allSources);

  // Emit every model count each curve can actually reach, not only the ones
  // both reach. Pinning a model narrows the two curves by different amounts --
  // with google-gemini-3-7-flash pinned the all-sources curve tops out at ten
  // complete models while the unconstrained one still reaches twenty-four --
  // and intersecting them would delete exactly the range that makes the second
  // curve worth having. Which positions the slider offers, and what the toggle
  // does where only one curve has a preset, is a UI ruling (N10c).
  const sharedModelCounts: number[] = [];
  const allSourcesOnlyModelCounts: number[] = [];
  const unconstrainedOnlyModelCounts: number[] = [];
  const presets: DisplaySetPreset[] = [];
  for (
    let modelCount = options.maxModelCount;
    modelCount >= options.minModelCount;
    modelCount -= 1
  ) {
    const inAll = allByCount.has(modelCount);
    const inFree = freeByCount.has(modelCount);
    if (inAll && inFree) sharedModelCounts.push(modelCount);
    else if (inAll) allSourcesOnlyModelCounts.push(modelCount);
    else if (inFree) unconstrainedOnlyModelCounts.push(modelCount);

    // When both curves land on the same benchmarks, emit one preset, the
    // all-sources one: `requireAllSources: true` is the stronger statement and
    // it is true. Two identical presets would show the UI a switch that cannot
    // change anything.
    const identical =
      inAll &&
      inFree &&
      allByCount.get(modelCount)!.benchmarkIds.join() ===
        freeByCount.get(modelCount)!.benchmarkIds.join();

    for (const [requireAllSources, byCount] of (identical
      ? [[true, allByCount]]
      : [
          [true, allByCount],
          [false, freeByCount],
        ]) as readonly (readonly [boolean, Map<number, ScaleChoice>])[]) {
      const chosen = byCount.get(modelCount);
      if (!chosen) continue;
      presets.push({
        id: presetId(requireAllSources, modelCount),
        targetModelCount: modelCount,
        requireAllSources,
        benchmarkIds: [...chosen.benchmarkIds].toSorted((left, right) =>
          left.localeCompare(right),
        ),
      });
    }
  }

  const onlyNote = [
    allSourcesOnlyModelCounts.length > 0
      ? `Counts ${allSourcesOnlyModelCounts.join(', ')} exist only with every source represented.`
      : '',
    unconstrainedOnlyModelCounts.length > 0
      ? `Counts ${unconstrainedOnlyModelCounts.join(', ')} exist only without that constraint.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const notes = [
    `Generated by "pnpm data:v2:generate-display-set" from the coverage report, reference date ${unconstrained.referenceDate}. Do not hand-edit: rerun the command.`,
    'Ruling R1: a preset is the scoring basis, not merely an eligibility gate. A preset scores its own benchmarks only, so adding a benchmark here does change scores. This replaces the display-set-v1 note that claimed the opposite.',
    `Ruling D-N10-7: for each target complete-model count, the preset is the LARGEST benchmark count that still reaches it, so the same model count is measured on as many benchmarks as it can be. Model count is the user-facing axis. Both curves reach these counts: ${sharedModelCounts.join(', ') || 'none'}. ${onlyNote}`,
    'requireAllSources presets come from the curve in which every source holding an active benchmark contributes at least one; the rest come from the unconstrained curve, which is free to drop whole sources to reach a higher model count.',
    unconstrained.requiredModelIds.length > 0
      ? `Every preset is constrained to leave these models complete, per display-set-policy.json: ${unconstrained.requiredModelIds.join(', ')}.`
      : 'No model is pinned, so a preset may exclude any given model.',
  ].join(' ');

  const displaySet = DisplaySetSchema.parse({
    schemaVersion: 'display-set-v2',
    notes,
    defaultPresetId: options.defaultPresetId,
    presets,
  } satisfies DisplaySet);

  return {
    displaySet,
    sharedModelCounts,
    allSourcesOnlyModelCounts,
    unconstrainedOnlyModelCounts,
  };
};

const findRepositoryRoot = (startDir: string): string => {
  let current = resolve(startDir);
  for (;;) {
    if (existsSync(join(current, 'data-v2', 'mappings', 'sources.json'))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return resolve(startDir);
};

export const generateDisplaySet = async (
  options: GenerateDisplaySetOptions = {},
): Promise<GeneratedDisplaySet & { outputPath: string }> => {
  const repoRoot = options.repositoryRoot
    ? resolve(options.repositoryRoot)
    : findRepositoryRoot(process.cwd());
  const referenceDate =
    options.referenceDate ?? new Date().toISOString().split('T')[0]!;
  const outputPath = resolve(
    options.outputPath ??
      join(repoRoot, 'data-v2', 'mappings', 'display-set.json'),
  );

  const workspaceData = await loadWorkspaceCoverageData(repoRoot);
  const policy: DisplaySetPolicy = DisplaySetPolicySchema.parse(
    JSON.parse(
      await readFile(
        join(repoRoot, 'data-v2', 'mappings', 'display-set-policy.json'),
        'utf8',
      ),
    ),
  );
  const shared = {
    ...workspaceData,
    referenceDate,
    candidatesPerScale: 1,
    requireAllDimensions: true,
    requiredModelIds: policy.requiredModelIds,
  };
  const unconstrained = analyzeCoverageMatrix({
    ...shared,
    requireAllSources: false,
  });
  const allSources = analyzeCoverageMatrix({
    ...shared,
    requireAllSources: true,
  });

  const generated = buildDisplaySetFromCurves(unconstrained, allSources, {
    minModelCount: options.minModelCount ?? policy.minModelCount,
    maxModelCount: options.maxModelCount ?? policy.maxModelCount,
    defaultPresetId: options.defaultPresetId ?? policy.defaultPresetId,
  });
  validateDisplaySet(generated.displaySet, workspaceData.benchmarkMapping);

  const json = await formatWithPrettier(
    JSON.stringify(generated.displaySet, null, 2),
    { parser: 'json', endOfLine: 'lf' },
  );
  await writeFile(outputPath, json, 'utf8');

  return { ...generated, outputPath };
};

export const parseGenerateDisplaySetArgs = (
  args: readonly string[],
): GenerateDisplaySetOptions => {
  const options: GenerateDisplaySetOptions = {};
  const numeric = (arg: string, prefix: string): number => {
    const value = Number(arg.slice(prefix.length));
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`Invalid value for ${prefix}${arg.slice(prefix.length)}`);
    }
    return value;
  };
  for (const arg of args) {
    if (arg.startsWith('--root=')) options.repositoryRoot = arg.slice(7);
    else if (arg.startsWith('--reference-date='))
      options.referenceDate = arg.slice('--reference-date='.length);
    else if (arg.startsWith('--out=')) options.outputPath = arg.slice(6);
    else if (arg.startsWith('--default='))
      options.defaultPresetId = arg.slice('--default='.length);
    else if (arg.startsWith('--min-models='))
      options.minModelCount = numeric(arg, '--min-models=');
    else if (arg.startsWith('--max-models='))
      options.maxModelCount = numeric(arg, '--max-models=');
    else if (!arg.startsWith('-') && options.repositoryRoot === undefined)
      options.repositoryRoot = arg;
  }
  return options;
};

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  generateDisplaySet(parseGenerateDisplaySetArgs(process.argv.slice(2)))
    .then((generated) => {
      console.log(
        [
          'Display set generated:',
          `- Output: ${generated.outputPath}`,
          `- Presets: ${generated.displaySet.presets.length}`,
          `- Default: ${generated.displaySet.defaultPresetId}`,
          `- Model counts on both curves: ${
            generated.sharedModelCounts.join(', ') || 'none'
          }`,
          `- All-sources only: ${
            generated.allSourcesOnlyModelCounts.join(', ') || 'none'
          }`,
          `- Unconstrained only: ${
            generated.unconstrainedOnlyModelCounts.join(', ') || 'none'
          }`,
        ].join('\n'),
      );
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
