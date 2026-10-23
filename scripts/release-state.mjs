/**
 * Shared state for `pnpm data:release` and the agent stop gate. A release
 * receipt binds three digests: the inputs the product build consumes, the
 * outputs it writes, and the implementation that turns one into the other.
 * Any later change to one of them makes the receipt stale.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const RELEASES_DIR = 'artifacts/releases';
export const LATEST_RECEIPT = `${RELEASES_DIR}/latest.json`;

/** Mappings read by the product builder, frontier generator or dashboard. */
export const CONSUMED_MAPPINGS = [
  'benchmark-quality-v2.json',
  'benchmarks-v2.json',
  'benchmarks.json',
  'frontier-identities.json',
  'frontier.json',
  'models.json',
  'profile-policy.json',
  'sources.json',
].map((name) => `data/mappings/${name}`);

export const SOURCE_SNAPSHOT_FILES = [
  'manifest.json',
  'candidates.json',
  'costs.json',
  'evidence-index.json',
];

export const RELEASE_OUTPUTS = [
  'data/product/current.json',
  'data/mappings/frontier-set.json',
  'data/mappings/frontier-selection-audit.json',
];

// The builder, the dashboard, and the release verification itself: changing
// any of them means an earlier receipt no longer describes what would run.
const IMPLEMENTATION_ROOTS = [
  'packages/benchmark-data/src',
  'apps/bench/app',
  'apps/bench/components',
  'apps/bench/lib',
  'apps/bench/e2e',
];
const IMPLEMENTATION_FILES = [
  'apps/bench/next.config.ts',
  'apps/bench/package.json',
  'package.json',
  'packages/benchmark-data/package.json',
  'playwright.config.ts',
  'pnpm-lock.yaml',
  'scripts/data-release.mjs',
  'scripts/release-report.mjs',
  'scripts/release-state.mjs',
  'scripts/serve-static.mjs',
];
const isTestFile = (path) => /\.test\.[cm]?[jt]sx?$/u.test(path);

const toPosix = (path) => path.split(sep).join('/');

const walk = (root, directory) => {
  const absolute = join(root, directory);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? walk(root, path) : [path];
  });
};

export const readWhitelist = (root) =>
  JSON.parse(readFileSync(join(root, 'data/mappings/sources.json'), 'utf8'))
    .whitelist;

export const releaseInputPaths = (root) =>
  [
    ...CONSUMED_MAPPINGS,
    ...readWhitelist(root).flatMap((source) =>
      SOURCE_SNAPSHOT_FILES.map((file) => `data/sources/${source}/${file}`),
    ),
  ].toSorted();

export const implementationPaths = (root) =>
  [
    ...IMPLEMENTATION_ROOTS.flatMap((directory) => walk(root, directory)),
    ...IMPLEMENTATION_FILES,
  ]
    .filter((path) => !isTestFile(path))
    .toSorted();

/** Missing files hash as absent, so deleting an input also changes the digest. */
export const digestFiles = (root, paths) => {
  const hash = createHash('sha256');
  for (const path of paths) {
    const absolute = join(root, path);
    const content = existsSync(absolute)
      ? createHash('sha256').update(readFileSync(absolute)).digest('hex')
      : 'absent';
    hash.update(`${path}\0${content}\n`);
  }
  return `sha256:${hash.digest('hex')}`;
};

export const computeReleaseState = (root) => ({
  inputsDigest: digestFiles(root, releaseInputPaths(root)),
  outputsDigest: digestFiles(root, RELEASE_OUTPUTS),
  implementationDigest: digestFiles(root, implementationPaths(root)),
});

export const exportDigest = (root, outDir = 'apps/bench/out') => {
  const files = walk(root, outDir).toSorted();
  return files.length === 0 ? null : digestFiles(root, files);
};

/** Paths whose change requires a new release before work can be called done. */
export const isReleaseRelevantPath = (root, path) => {
  const posix = toPosix(path);
  if (RELEASE_OUTPUTS.includes(posix) || CONSUMED_MAPPINGS.includes(posix)) {
    return true;
  }
  const source = /^data\/sources\/([^/]+)\/([^/]+)$/u.exec(posix);
  if (source) return SOURCE_SNAPSHOT_FILES.includes(source[2]);
  return posix.startsWith('packages/benchmark-data/src/') && !isTestFile(posix);
};

/** Parses `git status --porcelain=v1 -z`, keeping both sides of a rename. */
export const parsePorcelainZ = (output) => {
  const fields = output.split('\0').filter(Boolean);
  const paths = [];
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    const status = field.slice(0, 2);
    paths.push(field.slice(3));
    if (status.includes('R') || status.includes('C')) {
      index += 1;
      if (fields[index]) paths.push(fields[index]);
    }
  }
  return paths;
};

export const readReceipt = (root, path = LATEST_RECEIPT) => {
  try {
    return JSON.parse(readFileSync(join(root, path), 'utf8'));
  } catch {
    return null;
  }
};

/** A finished receipt matches only when all three digests equal the workspace. */
export const receiptMatches = (receipt, state) =>
  receipt !== null &&
  ['complete', 'failed'].includes(receipt.status) &&
  receipt.inputsDigest === state.inputsDigest &&
  receipt.outputsDigest === state.outputsDigest &&
  receipt.implementationDigest === state.implementationDigest;

const sha256File = (path) =>
  `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;

/**
 * OPERATIONS §2 per-source checks that the product builder does not repeat:
 * every candidate and cost cites recorded Evidence, and every Evidence file is
 * present locally with the recorded SHA-256 and byte length.
 */
export const validateActiveSources = (root) => {
  const issues = [];
  const sources = [];
  for (const source of readWhitelist(root)) {
    const directory = join(root, 'data/sources', source);
    const read = (file) =>
      existsSync(join(directory, file))
        ? JSON.parse(readFileSync(join(directory, file), 'utf8'))
        : null;
    const manifest = read('manifest.json');
    const evidence = read('evidence-index.json');
    if (manifest === null || evidence === null) {
      issues.push(`${source}: manifest.json or evidence-index.json is missing`);
      continue;
    }
    const evidenceIds = new Set(evidence.map(({ id }) => id));
    for (const [file, rows] of [
      ['candidates.json', read('candidates.json') ?? []],
      ['costs.json', read('costs.json') ?? []],
    ]) {
      const missing = new Set(
        rows.flatMap(({ evidenceIds: ids = [] }) =>
          ids.filter((id) => !evidenceIds.has(id)),
        ),
      );
      if (missing.size > 0) {
        issues.push(
          `${source}/${file} cites missing Evidence: ${[...missing].slice(0, 5).join(', ')}`,
        );
      }
    }
    for (const record of evidence) {
      const path = join(root, record.artifactPath);
      if (!existsSync(path)) {
        issues.push(`${source}: artifact missing ${record.artifactPath}`);
        continue;
      }
      if (statSync(path).size !== record.byteLength) {
        issues.push(`${source}: byte length differs ${record.artifactPath}`);
      } else if (sha256File(path) !== record.sha256) {
        issues.push(`${source}: SHA-256 differs ${record.artifactPath}`);
      }
    }
    sources.push({
      sourceId: source,
      lastVerifiedAt: manifest.lastVerifiedAt ?? null,
      evidence: evidence.length,
    });
  }
  return { issues, sources };
};

export const relativeTo = (root, path) => toPosix(relative(root, path));
