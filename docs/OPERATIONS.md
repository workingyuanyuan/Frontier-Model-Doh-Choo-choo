# Operations

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It uses Node 24.18.0, pnpm 11.7.0, PostgreSQL 18.4 and a frozen lockfile. The required gates are formatting, ESLint with zero warnings, strict type checking, tests, migration, seed, production build, high-severity dependency audit and one Remotion frame render.

All reusable actions are pinned to immutable full commit SHAs. The workflow token has only `contents: read`, and the PostgreSQL credentials exist solely inside the disposable runner service.

## Weekly dry run

`.github/workflows/weekly-dry-run.yml` runs every Monday at 09:15 in `Asia/Taipei` (`01:15 UTC`) and can also be started manually with `workflow_dispatch`. It:

1. creates a disposable PostgreSQL database;
2. applies committed migrations and canonical seeds;
3. captures the official LiveBench Hub commit SHA and fetches one bounded page;
4. preserves the content-addressed raw response;
5. runs validation tests;
6. renders a representative poster;
7. exports snapshot-bound metadata JSON and ranking CSV; and
8. uploads the log, poster, metadata and raw evidence as a short-lived immutable artifact.

The scheduled workflow is deliberately dry-run only. It has no write permission, production secret or publish command, so a source failure cannot replace the current edition.

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
```

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
