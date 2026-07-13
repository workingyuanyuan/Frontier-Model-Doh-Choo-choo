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
pnpm ingest:livebench
pnpm review:livebench-aliases
pnpm sync:livebench-aliases
pnpm resolve:livebench-aliases
pnpm verify:livebench-aliases
pnpm report:livebench-aggregation -- --summary-only
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

The aggregation report requires a succeeded full-Parquet run. It validates every
staged payload, derives the expected question inventory from all staged rows and
allows only canonical `VALIDATED` rows to contribute scores. Exact repeated
observations are counted and collapsed; repeated keys with different scores are
blocking conflicts. The report is read-only and returns
`isReadyForPublication: false` while a required category, complete model or
conflict gate fails. Omit `--summary-only` for per-model task/category details.

The question-inventory command does not connect to PostgreSQL. It reads only six
allowlisted columns from six revision-pinned official Parquet artifacts through
validated byte ranges, applies the public `2024-11-25` release/removal policy and
writes a prompt-free content-addressed JSON under `data/raw/`. A normal run
reports 1,436 source rows, 1,000 selected observations, 18 tasks, six categories,
42 range requests and SHA-256
`b8a90d2f2308b774fbee982178d433412fd6f349429be2a41def4331b0ee4027`.
