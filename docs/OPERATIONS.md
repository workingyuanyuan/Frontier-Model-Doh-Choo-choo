# Operations

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It uses Node 24.18.0, pnpm 11.7.0, PostgreSQL 18.4 and a frozen lockfile. The required gates are formatting, ESLint with zero warnings, strict type checking, tests, migration, seed, production build, high-severity dependency audit and one Remotion frame render.

All reusable actions are pinned to immutable full commit SHAs. The workflow token has only `contents: read`, and the PostgreSQL credentials exist solely inside the disposable runner service.

## Weekly dry run

`.github/workflows/weekly-dry-run.yml` runs every Monday at 09:15 in `Asia/Taipei` and can also be started manually with `workflow_dispatch`. It:

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
pnpm ingest:livebench
pnpm test:run
pnpm build
pnpm video:still
pnpm video:artifacts
```
