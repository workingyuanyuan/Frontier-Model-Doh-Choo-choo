// Lets a main push deploy the Pages artifact its pull request already
// verified, instead of rebuilding and retesting the same tree.
//
//   find                  name the PR run that verified this merge's PR head
//   check <receipt> <id> <attempt>
//                         confirm that run built exactly this commit's tree
//
// Either step failing, or `find` naming no run, means CI runs every gate.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SHA = /^[a-f0-9]{40}$/;
const WORKFLOW = '.github/workflows/ci.yml';

/** The same-repository PR into main that this commit merged, if any. */
export function mergedPullRequest(pulls, repo, sha) {
  return pulls.find(
    (pr) =>
      Boolean(pr.merged_at) &&
      pr.merge_commit_sha === sha &&
      pr.base?.ref === 'main' &&
      pr.base?.repo?.full_name === repo &&
      pr.head?.repo?.full_name === repo &&
      SHA.test(pr.head?.sha ?? ''),
  );
}

/** The newest successful CI run of that PR head, from this repository. */
export function latestSuccessfulRun(runs, repo, headSha) {
  return runs
    .filter(
      (run) =>
        run.event === 'pull_request' &&
        run.status === 'completed' &&
        run.conclusion === 'success' &&
        run.path === WORKFLOW &&
        run.head_sha === headSha &&
        run.head_repository?.full_name === repo &&
        Number.isSafeInteger(run.id) &&
        Number.isSafeInteger(run.run_attempt),
    )
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
}

/**
 * The Pages artifact a run's `quality` job verified, provided that run built
 * `tree`. The receipt is written by `quality` only after every gate passed.
 */
export function verifiedArtifact(receipt, tree, runId, attempt) {
  const fields = new Map();
  for (const line of receipt.trim().split('\n')) {
    const at = line.indexOf('=');
    if (at <= 0 || fields.has(line.slice(0, at)))
      throw new Error(`Malformed receipt line: ${line}`);
    fields.set(line.slice(0, at), line.slice(at + 1));
  }
  if (fields.size !== 2) throw new Error('Receipt must hold tree and artifact');
  if (!SHA.test(tree)) throw new Error('This commit has no tree SHA');
  if (!/^[1-9][0-9]*$/.test(String(runId)))
    throw new Error(`Invalid run ID: ${runId}`);
  if (fields.get('tree') !== tree)
    throw new Error(`PR run built ${fields.get('tree')}, not ${tree}`);
  if (!/^[1-9][0-9]*$/.test(String(attempt)))
    throw new Error(`Invalid run attempt: ${attempt}`);
  // A partial rerun keeps an earlier attempt's build, never a later one's.
  const artifact = fields.get('artifact') ?? '';
  const built = new RegExp(`^github-pages-${runId}-([1-9][0-9]*)$`).exec(
    artifact,
  );
  if (!built || Number(built[1]) > Number(attempt))
    throw new Error(`Receipt names an artifact outside run ${runId}`);
  return artifact;
}

const gh = (path) =>
  JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8' }));

function output(values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
}

function find({ GITHUB_REPOSITORY: repo, GITHUB_SHA: sha }) {
  const pr = mergedPullRequest(
    gh(`repos/${repo}/commits/${sha}/pulls`),
    repo,
    sha,
  );
  if (!pr) {
    console.log(`::notice::${sha} is not a PR merge; running every gate`);
    return;
  }
  const run = latestSuccessfulRun(
    gh(
      `repos/${repo}/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${pr.head.sha}&per_page=20`,
    ).workflow_runs ?? [],
    repo,
    pr.head.sha,
  );
  if (!run) {
    console.log(`::notice::No passing CI run for PR #${pr.number}`);
    return;
  }
  console.log(`PR #${pr.number}: run ${run.id} attempt ${run.run_attempt}`);
  output({ pr: pr.number, 'run-id': run.id, attempt: run.run_attempt });
}

function check(receiptPath, runId, attempt) {
  const tree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], {
    encoding: 'utf8',
  }).trim();
  const artifact = verifiedArtifact(
    readFileSync(receiptPath, 'utf8'),
    tree,
    runId,
    attempt,
  );
  console.log(`Run ${runId} verified ${artifact} for tree ${tree}`);
  output({ artifact });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'find') find(process.env);
  else if (command === 'check' && args.length === 3) check(...args);
  else throw new Error('usage: find | check <receipt> <run-id> <attempt>');
}
