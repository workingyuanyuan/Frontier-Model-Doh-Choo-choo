import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format as formatWithPrettier } from 'prettier';

import { DisplaySetPolicySchema } from './index.js';
import {
  analyzeCoverageMatrix,
  formatCoverageMatrixMarkdown,
  loadWorkspaceCoverageData,
  type CoverageMatrixAnalysis,
} from './coverage-matrix.js';

export interface ReportCoverageMatrixCliOptions {
  repositoryRoot?: string;
  referenceDate?: string;
  outputPath?: string;
  candidatesPerScale?: number;
  /**
   * Smallest scale rendered. Defaults to the number of sources holding an
   * active benchmark. That is a reporting floor chosen to keep the review
   * range legible, not a feasibility bound.
   */
  minBenchmarkCount?: number;
  /**
   * Benchmarks every combination in BOTH curves must contain, from repeated
   * `--require <id>` flags or one comma-separated `--require=a,b`. Empty by
   * default: ruling R7 forbids pinning a benchmark globally, so this exists
   * only for ad-hoc "what if we insisted on X" questions.
   */
  requiredBenchmarkIds?: string[];
}

const splitRequired = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

export const parseReportArgs = (
  args: readonly string[],
): ReportCoverageMatrixCliOptions => {
  const options: ReportCoverageMatrixCliOptions = {};
  const positional: string[] = [];
  const required: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--reference-date' || arg === '-d') {
      const next = args[++i];
      if (!next) {
        throw new Error(`Missing value for ${arg}`);
      }
      options.referenceDate = next;
    } else if (arg.startsWith('--reference-date=')) {
      options.referenceDate = arg.slice('--reference-date='.length);
    } else if (arg === '--output' || arg === '--out' || arg === '-o') {
      const next = args[++i];
      if (!next) {
        throw new Error(`Missing value for ${arg}`);
      }
      options.outputPath = next;
    } else if (arg.startsWith('--output=')) {
      options.outputPath = arg.slice('--output='.length);
    } else if (arg.startsWith('--out=')) {
      options.outputPath = arg.slice('--out='.length);
    } else if (arg === '--candidates' || arg === '-k') {
      const next = args[++i];
      if (!next) {
        throw new Error(`Missing value for ${arg}`);
      }
      const parsed = Number(next);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`Invalid value for ${arg}: ${next}`);
      }
      options.candidatesPerScale = parsed;
    } else if (arg === '--min-n') {
      const next = args[++i];
      if (!next) {
        throw new Error(`Missing value for ${arg}`);
      }
      const parsedMin = Number(next);
      if (!Number.isInteger(parsedMin) || parsedMin < 1) {
        throw new Error(`Invalid value for ${arg}: ${next}`);
      }
      options.minBenchmarkCount = parsedMin;
    } else if (arg.startsWith('--min-n=')) {
      const val = arg.slice('--min-n='.length);
      const parsedMin = Number(val);
      if (!Number.isInteger(parsedMin) || parsedMin < 1) {
        throw new Error(`Invalid value for --min-n: ${val}`);
      }
      options.minBenchmarkCount = parsedMin;
    } else if (arg.startsWith('--candidates=')) {
      const val = arg.slice('--candidates='.length);
      const parsed = Number(val);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`Invalid value for --candidates: ${val}`);
      }
      options.candidatesPerScale = parsed;
    } else if (arg === '--require') {
      const next = args[++i];
      if (!next) {
        throw new Error(`Missing value for ${arg}`);
      }
      required.push(...splitRequired(next));
    } else if (arg.startsWith('--require=')) {
      required.push(...splitRequired(arg.slice('--require='.length)));
    } else if (arg === '--root' || arg === '-r') {
      const next = args[++i];
      if (!next) {
        throw new Error(`Missing value for ${arg}`);
      }
      options.repositoryRoot = next;
    } else if (arg.startsWith('--root=')) {
      options.repositoryRoot = arg.slice('--root='.length);
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  const firstPositional = positional[0];
  if (!options.repositoryRoot && firstPositional !== undefined) {
    options.repositoryRoot = firstPositional;
  }
  if (required.length > 0) {
    options.requiredBenchmarkIds = required;
  }

  return options;
};

function findRepositoryRoot(startDir: string = '.'): string {
  let current = resolve(startDir);
  while (true) {
    if (existsSync(join(current, 'data', 'mappings', 'sources.json'))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return resolve(startDir);
}

export const generateCoverageMatrixReport = async (
  options: ReportCoverageMatrixCliOptions = {},
): Promise<{
  analysis: CoverageMatrixAnalysis;
  baseline: CoverageMatrixAnalysis;
  markdown: string;
  outputPath: string;
}> => {
  const repoRoot = options.repositoryRoot
    ? resolve(options.repositoryRoot)
    : findRepositoryRoot(process.cwd());
  const referenceDate =
    options.referenceDate ?? new Date().toISOString().split('T')[0]!;
  const outputPath = resolve(
    options.outputPath ?? join(repoRoot, 'docs', 'COVERAGE_MATRIX_REPORT.md'),
  );

  const workspaceData = await loadWorkspaceCoverageData(repoRoot);
  // The report is what the presets are chosen from, so it has to be computed
  // under the same pins the generator applies. A report showing a scale the
  // presets cannot use is worse than no report.
  const policy = DisplaySetPolicySchema.parse(
    JSON.parse(
      await readFile(
        join(repoRoot, 'data', 'mappings', 'display-set-policy.json'),
        'utf8',
      ),
    ),
  );

  const shared = {
    ...workspaceData,
    referenceDate,
    requiredModelIds: policy.requiredModelIds,
    requiredBenchmarkIds: options.requiredBenchmarkIds ?? [],
    // A subset that cannot fill all eight dimensions is not a display-set
    // candidate, so offering it would inflate the curve with unrankable rows.
    requireAllDimensions: true,
    ...(options.candidatesPerScale !== undefined
      ? { candidatesPerScale: options.candidatesPerScale }
      : {}),
  };

  // Two curves, always: one free to drop whole sources, one that must keep
  // every source represented. The gap between them is the report's whole
  // point, so neither is optional.
  const analysis = analyzeCoverageMatrix({
    ...shared,
    requireAllSources: false,
  });
  const baseline = analyzeCoverageMatrix({
    ...shared,
    requireAllSources: true,
  });

  const markdown = await formatWithPrettier(
    formatCoverageMatrixMarkdown(analysis, {
      baseline,
      ...(options.minBenchmarkCount !== undefined
        ? { minBenchmarkCount: options.minBenchmarkCount }
        : {}),
    }),
    {
      parser: 'markdown',
      endOfLine: 'lf',
    },
  );
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown, 'utf8');

  return { analysis, baseline, markdown, outputPath };
};

export const runReportCoverageMatrixCli = async (
  args: string[],
): Promise<string> => {
  const options = parseReportArgs(args);
  const { analysis, baseline, outputPath } =
    await generateCoverageMatrixReport(options);

  const lines = [
    `Coverage matrix report generated successfully:`,
    `- Output: ${outputPath}`,
    `- Reference Date: ${analysis.referenceDate}`,
    `- Qualified Models: ${analysis.qualifiedModels.length}`,
    `- Active Benchmarks: ${analysis.activeBenchmarkIds.length}`,
    `- Candidates Per Scale: ${analysis.candidatesPerScale}`,
    `- Sources With An Active Benchmark: ${analysis.coverableSourceIds.length}`,
    `- Pinned Models: ${analysis.requiredModelIds.join(', ') || 'none'}`,
    `- Unconstrained Tradeoff Scale Rows: ${analysis.tradeoffs.length}`,
    `- All-Sources Tradeoff Scale Rows: ${baseline.tradeoffs.length} (smallest feasible $N$ = ${baseline.tradeoffs[0]?.benchmarkCount ?? 'n/a'})`,
  ];

  if (analysis.requiredBenchmarkIds.length > 0) {
    lines.push(
      `- Pinned Benchmarks: ${analysis.requiredBenchmarkIds.join(', ')}`,
    );
  }

  return lines.join('\n');
};

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  runReportCoverageMatrixCli(process.argv.slice(2))
    .then((message) => {
      console.log(message);
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
