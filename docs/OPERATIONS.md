# Operations

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It uses Node 24.18.0, pnpm 11.7.0, PostgreSQL 18.4 and a frozen lockfile. The required gates are formatting, ESLint with zero warnings, strict type checking, tests, migration, seed, production build, Chromium E2E/axe/responsive/performance/security checks, high-severity dependency audit and one Remotion frame render.

All reusable actions are pinned to immutable full commit SHAs. The workflow token has only `contents: read`, and the PostgreSQL credentials exist solely inside the disposable runner service.

Complete, test-passing change batches are committed and pushed together, then their GitHub Actions run is followed to completion. Partial edits are not pushed merely because a file changed; a failed CI batch is diagnosed locally where possible, corrected in a new tested batch and re-run.

## Web read API

Production Web startup requires `DATABASE_URL`; the development-only fallback points to the Docker Compose database. The active edition endpoint is:

```text
GET /api/v1/rankings/latest
200 ACTIVE EDITION  Cache-Control: public, max-age=60, stale-while-revalidate=300
404 ACTIVE_EDITION_NOT_FOUND  Cache-Control: no-store
503 ACTIVE_EDITION_UNAVAILABLE  Cache-Control: no-store
GET /api/v1/health
200 OK  Cache-Control: no-store
GET /api/v1/status/data
200 READY  Cache-Control: no-store
503 DATA_STATUS_UNAVAILABLE  Cache-Control: no-store
```

The response always includes `apiVersion: "v1"`. Preview editions remain explicitly labelled `publicationMode: "PREVIEW"`; this endpoint does not promote, activate or mutate data.

The homepage uses the active database edition when available. If PostgreSQL is reachable but has no active pointer, it uses the visibly labelled fictional design fixture. If PostgreSQL is unavailable, the homepage returns an error state with retry rather than silently serving that fixture. Liveness therefore remains useful during a dependency outage while data status and the homepage correctly fail readiness.

The bilingual read routes are `/{locale}/models/{slug}`, `/{locale}/benchmarks/{slug}`, `/{locale}/compare`, `/{locale}/methodology`, `/{locale}/sources` and `/{locale}/pipeline`. Source and pipeline routes require PostgreSQL and share the retryable unavailable boundary; methodology is version-controlled policy. Comparison accepts two to five repeated `models` parameters, rejects duplicates and unknown IDs, and preserves their order, active `edition`, light `theme` and locale in its shareable URL.

## Browser and security gates

CI seeds three deterministic model variants and one PREVIEW edition only after
the canonical database seed. `apps/web/e2e/seed.ts` requires
`E2E_FIXTURE=1`, is idempotent for its reserved UUIDs and refuses to replace a
non-E2E active edition. The production server is then tested at desktop and
390 px mobile widths across both homepages, model, benchmark, comparison,
methodology, source and pipeline routes. The suite also covers URL-owned theme
and 2–5 model state, API status/cache contracts, invalid-selector 404s, WCAG
A/AA axe scans, response/payload budgets and security headers.

Page responses use a request-unique Next.js nonce with `strict-dynamic` for
scripts, deny framing and unused browser capabilities, and omit arbitrary
inline script/style permission. `robots.txt` and `llms.txt` expose the public
human/API surfaces. The browser report is uploaded for every non-cancelled CI
run; local failure screenshots, videos and traces remain ignored under
`test-results/` and `playwright-report/`.

For a disposable database that has no non-E2E active edition:

```bash
pnpm db:migrate
pnpm db:seed
E2E_FIXTURE=1 pnpm e2e:seed
pnpm build
pnpm exec playwright install chromium
pnpm e2e
```

## Weekly dry run

`.github/workflows/weekly-dry-run.yml` runs every Monday at 09:15 in `Asia/Taipei` (`01:15 UTC`) and can also be started manually with `workflow_dispatch`. It:

1. creates a disposable PostgreSQL database;
2. applies committed migrations and canonical seeds;
3. reacquires the pinned six-category question inventory and full official LiveBench judgment artifact with bounded source retries;
4. reuses a complete ingestion run when source snapshot, connector and all 60,372 staged rows match exactly;
5. revalidates the reviewed alias manifest, persistence and aggregation readiness;
6. reports promotion and score-snapshot diffs without applying them;
7. renders a deterministic fictional preview poster plus metadata/CSV; and
8. uploads the versioned orchestration summary, poster, metadata and raw evidence as a short-lived immutable artifact even when a source step fails.

The scheduled workflow is deliberately dry-run only. It has no write permission, production secret or publish command, so a source failure cannot replace the current edition.

`pnpm weekly:dry-run` is the local equivalent. Source acquisition steps use the
connector's 30/60-second abort limits and retry transient network, timeout,
408/425/429 and 5xx failures at most three times. Independent source failures
are recorded as `FAILED`; dependent steps become `SKIPPED`, while the safe
preview render is still attempted. A partial run exits nonzero after writing
`artifacts/weekly-orchestration.json`. `pnpm weekly:apply-preview` is explicit
and may apply guarded result/snapshot changes plus a PREVIEW pointer only;
FORMAL publication is not an accepted weekly-orchestrator argument.

## Publication and rollback gate

Formal publication remains disabled until alias resolution, benchmark mapping, coverage gates and snapshot repository queries are complete. The future publish job must use a protected GitHub Environment named `benchmark-production`, require reviewers, and operate transactionally:

```text
validated staged results
→ reviewed canonical evidence
→ immutable ranking snapshot
→ activate new weekly edition
→ render snapshot-bound artifacts
```

Rollback must reactivate a prior immutable edition; it must never rewrite its ranking snapshot. No preview fixture is accepted by the publication path.

## Local equivalents

```bash
pnpm install --frozen-lockfile
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm fetch:livebench-inventory
pnpm fetch:livebench-judgments
pnpm ingest:livebench
pnpm review:livebench-aliases
pnpm sync:livebench-aliases
pnpm resolve:livebench-aliases
pnpm verify:livebench-aliases
pnpm report:livebench-aggregation -- --summary-only
pnpm promote:livebench-results
pnpm score:livebench
pnpm edition -- --activate-snapshot <uuidv7> --mode preview
pnpm test:run
pnpm build
pnpm video:still
pnpm video:artifacts
pnpm video:edition -- --edition <uuidv7> --locale zh-TW --theme editorial --top 5 --model <canonical-slug> --media poster
```

`video:edition` accepts exactly one of `--edition` or `--snapshot`. Locale is
`zh-TW` or `en`, theme is `editorial` or `studio`, Top-N is 1–5 and media is
`poster` or `video`. `--model` is optional and must resolve within Top-N; the
first entry is selected when omitted. Remotion receives an on-disk JSON props
file through a shell-free process invocation. Outputs are isolated under
`output/video/` and include props, artifact-v2 metadata, ranking CSV, media and
a structured render log. PREVIEW renders never insert `video_jobs`; FORMAL
renders persist the guarded job lifecycle and output SHA-256.

Set `LIVEBENCH_INGESTION_RUN_ID` to a UUIDv7 before running the alias review,
resolution or persistence-verification commands. Review reads the run and
`livebench` alias namespace in a repeatable-read, read-only transaction. Sync
transactionally ensures the versioned evidence-backed canonical manifest.
Resolve applies exact mapping or exclusion decisions to staged rows. Verify is
read-only and rejects any status other than `VALIDATED` or `EXCLUDED`, any
validated row without a model variant, and any excluded row with one.

The aggregation report requires a succeeded full-Parquet run and the exact
content-addressed question evidence under `data/raw/` (or `RAW_STORAGE_DIR`). It
verifies the 180,278-byte body and SHA-256 before parsing all six pinned sources,
then validates at most 100,000 staged payloads in a repeatable-read, read-only
transaction. Judgments outside release `2024-11-25` are counted but excluded;
metadata drift for a known question/turn fails closed. Only canonical
`VALIDATED` rows contribute scores. Exact repeats collapse, conflicting repeats
remain blockers, and missing observations remain null. Omit `--summary-only`
for per-model task/category details.

The verified 60,372-row run reports 46,118 rows inside the release, 14,254
outside, and 318/1,000 distinct inventory keys covered. Coding and language are
complete at the artifact level, instruction-following is 50/200, and reasoning,
math and data-analysis have no judgments. No model is complete and all 201
conflicting canonical keys remain blocked, so `isReadyForPublication` is false.

The question-inventory command does not connect to PostgreSQL. It reads only six
allowlisted columns from six revision-pinned official Parquet artifacts through
validated byte ranges, applies the public `2024-11-25` release/removal policy and
writes a prompt-free content-addressed JSON under `data/raw/`. A normal run
reports 1,436 source rows, 1,000 selected observations, 18 tasks, six categories,
42 range requests and SHA-256
`b8a90d2f2308b774fbee982178d433412fd6f349429be2a41def4331b0ee4027`.

The judgment-evidence command also does not connect to PostgreSQL. It fetches
only two fixed official revisions through the existing manual-redirect,
approved-CDN and 2 MiB artifact boundary; each body must match its pinned
revision, byte length, SHA-256, row count and category set. It stores both raw
Parquets and a prompt/model/score-free coverage manifest under `data/raw/`.
Two verified runs produced the same 3,018-byte manifest at SHA-256
`c80ea84bba3be46ac2a9c6bf5203422a76f5ab0181f0a04c908c0e942125dda5`
and reported 800/1,000 covered observations. This command measures evidence
availability only; it does not stage rows, select among conflicts or publish.

`promote:livebench-results` requires `LIVEBENCH_INGESTION_RUN_ID` and defaults
to a serializable, read-only dry run. It accepts only the exact full-Parquet,
alias-resolved run and pinned question inventory used by the readiness report.
Use `pnpm promote:livebench-results -- --apply` to insert complete,
conflict-free task aggregates and their primary evidence in one transaction.
The first verified apply promoted 737 task results across 152 models and six
currently supported task metrics; 2,014 incomplete and 39 conflicting task
aggregates remained blocked. Repeating the same apply inserted zero rows, and a
subsequent dry run reported all 737 as existing. This command publishes
reviewed benchmark results only; it does not create scores, a ranking snapshot
or a weekly edition.

`score:livebench` defaults to a serializable, read-only dry run and accepts an
optional `--edition YYYY-MM-DD`; otherwise the UTC date of the newest bound
source snapshot is used. `pnpm score:livebench -- --apply` writes eight ordered
dimension rows and one eligibility row per model, then creates one immutable
ranking snapshot. A retry reuses only an identical content hash and rejects a
changed snapshot for the same edition/method. The verified local run created
1,216 dimension rows and 152 overall rows from 737 promoted task results. All
152 models remain `UNRANKED` with null overall score and rank because the
source does not cover enough dimensions. This snapshot is data-backed but is
not an active or formally published weekly edition.

`edition` also defaults to a serializable read-only dry run. Activate an
eligible snapshot with `--activate-snapshot <uuidv7> --mode formal|preview`;
append `--apply` only after reviewing the plan. Formal mode re-runs the scoring
method and verified-entry guard, while preview mode remains visibly labelled
and never sets `published_at`. Roll back with
`pnpm edition -- --rollback-edition YYYY-MM-DD --actor <name> --apply`.
Activation and rollback serialize on a transaction lock, preserve one active
edition, and append a chained audit hash. Repeating an already-active command
returns `NOOP` without another audit row. The verified drill activated
2026-07-13 preview, switched to 2026-07-14, rolled back to 2026-07-13, and
left one active edition plus three unbroken audit links. Formal activation of
the same incomplete snapshot was rejected before any write.
