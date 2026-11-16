/**
 * `pnpm data:refresh-diff`: after importing sources, says whether the source
 * snapshots differ from the committed ones once capture times and evidence
 * references are set aside. Score and cost rows are compared by id, manifests
 * and evidence metadata by content, hand-reviewed inputs byte for byte; the
 * regenerated validation and cross-check reports are not compared. Read-only.
 *
 * `pnpm data:discard-refresh`: when nothing differs, returns the source
 * snapshots and monitoring state to HEAD and registers that checkout in the
 * evidence store (EVIDENCE_STORE, 匯出與 Git 工作流程). Refuses when a row
 * differs, so a real refresh cannot be thrown away by mistake.
 *
 * Usage: node scripts/source-refresh-diff.mjs [--discard]
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROW_FILES = ['candidates.json', 'costs.json'];
const RESTORED_PATHS = ['data/sources', 'data/source-monitoring'];

/** References to evidence, which is keyed by the hash of the captured bytes. */
const EVIDENCE_REFERENCES = new Set([
  'evidenceId',
  'evidenceIds',
  'pageEvidenceId',
]);
const CAPTURE_TIMES = new Set(['observedAt', 'retrievedAt']);

/** Reports regenerated on every refresh; they restate the rows compared here. */
const REGENERATED_REPORTS = new Set([
  'validation-report.md',
  'cross-checks.json',
]);

/**
 * Removes what a recapture of unchanged content changes. `capturedAt` is the
 * source's `lastVerifiedAt`: rows and evidence stamped with it belong to the
 * latest capture and become `current`; older stamps mark retained rows and
 * stay as they are, because result selection and replay depend on them.
 */
const comparable = (value, capturedAt) => {
  if (Array.isArray(value)) {
    return value.map((item) => comparable(item, capturedAt));
  }
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .filter(
        (key) => !EVIDENCE_REFERENCES.has(key) && key !== 'lastVerifiedAt',
      )
      .sort()
      .map((key) => [
        key,
        CAPTURE_TIMES.has(key) && value[key] === capturedAt
          ? 'current'
          : comparable(value[key], capturedAt),
      ]),
  );
};

const stable = (value, capturedAt) =>
  JSON.stringify(comparable(value, capturedAt));

/**
 * Compares two row arrays by `id`; `beforeAt` and `afterAt` are each side's
 * `lastVerifiedAt`. Row order counts, since it breaks ties between results.
 * Rows without unique ids cannot be paired, so the whole file then counts as
 * one change unless it is identical.
 */
export const diffSourceRows = (before, after, beforeAt, afterAt) => {
  const index = (rows, capturedAt) => {
    if (!Array.isArray(rows)) return null;
    const byId = new Map();
    for (const row of rows) {
      if (typeof row?.id !== 'string' || byId.has(row.id)) return null;
      byId.set(row.id, stable(row, capturedAt));
    }
    return byId;
  };
  const from = index(before, beforeAt);
  const to = index(after, afterAt);
  if (from === null || to === null) {
    const same = stable(before, beforeAt) === stable(after, afterAt);
    return { added: [], removed: [], changed: same ? [] : ['<whole file>'] };
  }
  const difference = {
    added: [...to.keys()].filter((id) => !from.has(id)),
    removed: [...from.keys()].filter((id) => !to.has(id)),
    changed: [...to.keys()].filter(
      (id) => from.has(id) && from.get(id) !== to.get(id),
    ),
  };
  const reordered =
    difference.added.length + difference.removed.length === 0 &&
    [...from.keys()].join('\n') !== [...to.keys()].join('\n');
  return reordered
    ? { ...difference, changed: [...difference.changed, '<row order>'] }
    : difference;
};

const git = (root, ...args) =>
  execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

/** Source directories present in the working tree or in HEAD. */
const sourceIds = (root) => {
  const directory = join(root, 'data/sources');
  const working = existsSync(directory)
    ? readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];
  const committed = git(
    root,
    'ls-tree',
    '-d',
    '--name-only',
    'HEAD',
    'data/sources/',
  )
    .split('\n')
    .filter(Boolean)
    .map((path) => path.slice('data/sources/'.length));
  return [...new Set([...working, ...committed])].sort();
};

const committedText = (root, path) => {
  try {
    return git(root, 'show', `HEAD:${path}`);
  } catch {
    return null;
  }
};

const workingText = (root, path) =>
  existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : null;

/**
 * Evidence records are keyed by content hash, so a recapture replaces them
 * all. What they say apart from the bytes is compared as an unordered set.
 */
export const describeEvidence = (index, capturedAt) =>
  (Array.isArray(index) ? index : [])
    .map((record) =>
      stable(
        {
          requestUrl: record.requestUrl,
          finalUrl: record.finalUrl,
          method: record.method,
          mediaType: record.mediaType,
          retrievedAt: record.retrievedAt,
          metadata: record.metadata ?? null,
        },
        capturedAt,
      ),
    )
    .sort();

const sourceFiles = (root, sourceId) => {
  const directory = `data/sources/${sourceId}`;
  const working = existsSync(join(root, directory))
    ? readdirSync(join(root, directory), {
        recursive: true,
        withFileTypes: true,
      })
        .filter((entry) => entry.isFile())
        .map((entry) =>
          relative(join(root, directory), join(entry.parentPath, entry.name)),
        )
    : [];
  const committed = git(
    root,
    'ls-tree',
    '-r',
    '--name-only',
    'HEAD',
    `${directory}/`,
  )
    .split('\n')
    .filter(Boolean)
    .map((path) => path.slice(directory.length + 1));
  return [...new Set([...working, ...committed])].sort();
};

const one = (file, example) => ({
  file,
  added: 0,
  removed: 0,
  changed: 1,
  examples: [example],
});

const parse = (text) => (text === null ? null : JSON.parse(text));

/** Null when the file says the same thing in HEAD and in the working tree. */
const diffSourceFile = (root, sourceId, file, beforeAt, afterAt) => {
  const path = `data/sources/${sourceId}/${file}`;
  const before = committedText(root, path);
  const after = workingText(root, path);
  if (REGENERATED_REPORTS.has(file)) return null;
  // The same bytes still differ when the capture they are measured against moved.
  if (before === after && beforeAt === afterAt) return null;
  if (ROW_FILES.includes(file)) {
    const { added, removed, changed } = diffSourceRows(
      parse(before) ?? [],
      parse(after) ?? [],
      beforeAt,
      afterAt,
    );
    return added.length + removed.length + changed.length === 0
      ? null
      : {
          file,
          added: added.length,
          removed: removed.length,
          changed: changed.length,
          examples: [...added, ...removed, ...changed].slice(0, 5),
        };
  }
  if (before === null || after === null) {
    return one(file, before === null ? 'not in HEAD' : 'deleted');
  }
  if (file === 'manifest.json') {
    return stable(parse(before), beforeAt) === stable(parse(after), afterAt)
      ? null
      : one(file, 'manifest fields other than lastVerifiedAt');
  }
  if (file === 'evidence-index.json') {
    const from = describeEvidence(parse(before), beforeAt);
    const to = describeEvidence(parse(after), afterAt);
    return JSON.stringify(from) === JSON.stringify(to)
      ? null
      : one(file, 'URL, method, media type, capture group or metadata');
  }
  // Reviewed captures and research inputs are edited by hand; any change counts.
  return before === after ? null : one(file, 'content');
};

const verifiedAt = (text) => {
  try {
    return parse(text)?.lastVerifiedAt ?? null;
  } catch {
    return null;
  }
};

export const diffSourceRefresh = (root) => {
  const sources = [];
  for (const sourceId of sourceIds(root)) {
    const manifest = `data/sources/${sourceId}/manifest.json`;
    const beforeAt = verifiedAt(committedText(root, manifest));
    const afterAt = verifiedAt(workingText(root, manifest));
    for (const file of sourceFiles(root, sourceId)) {
      const difference = diffSourceFile(
        root,
        sourceId,
        file,
        beforeAt,
        afterAt,
      );
      if (difference) sources.push({ sourceId, ...difference });
    }
  }
  return {
    head: git(root, 'rev-parse', 'HEAD').trim(),
    changed: sources.length > 0,
    sources,
  };
};

/** Staged paths under the restored directories; a checkout would drop them. */
const stagedPaths = (root) =>
  git(root, 'diff', '--cached', '--name-only', '--', ...RESTORED_PATHS)
    .split('\n')
    .filter(Boolean);

/** Paths under the restored directories that Git does not track. */
const untrackedPaths = (root) =>
  git(
    root,
    'ls-files',
    '--others',
    '--exclude-standard',
    '--',
    ...RESTORED_PATHS,
  )
    .split('\n')
    .filter(Boolean);

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const result = diffSourceRefresh(root);
  if (!process.argv.includes('--discard')) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.changed) {
    console.error(JSON.stringify(result, null, 2));
    console.error(
      'Source snapshots differ from HEAD; this refresh is not discarded. Continue with `pnpm data:release`.',
    );
    process.exitCode = 1;
  } else {
    const blocking = [...stagedPaths(root), ...untrackedPaths(root)];
    if (blocking.length > 0) {
      console.error(
        `Staged or untracked files would be lost or left behind; review them first:\n${blocking.join('\n')}`,
      );
      process.exitCode = 1;
    } else {
      git(root, 'checkout', 'HEAD', '--', ...RESTORED_PATHS);
      execFileSync('pnpm', ['-s', 'evidence', 'init'], {
        cwd: root,
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      // Opening the store finishes any interrupted export, which rewrites files.
      const left = git(root, 'status', '--porcelain', '--', ...RESTORED_PATHS);
      if (left.trim() !== '') {
        console.error(
          `The evidence store rewrote files after the restore; nothing is settled:\n${left}`,
        );
        process.exitCode = 1;
      } else {
        console.log(
          JSON.stringify(
            { ...result, discarded: true, evidenceInitialized: true },
            null,
            2,
          ),
        );
      }
    }
  }
}
