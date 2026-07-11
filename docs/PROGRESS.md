# Progress

## Current Phase

Phase 1 — evidence database and first source connector.

## Completed

- Preserved the original Scale Labs reference material under `reference-table-data/`.
- Initialized Git and a pinned pnpm/Turborepo strict-TypeScript toolchain.
- Confirmed Chrome DevTools MCP is available for runtime verification.
- Locked an all-light visual baseline and bilingual Traditional Chinese/English scope.
- Defined and tested the ranking snapshot, absolute scoring and deterministic radar contracts.
- Implemented 27 PostgreSQL/Drizzle entities for model identity, evidence, scoring, publishing and audit history.
- Generated and applied the initial SQL migration to PostgreSQL 18.
- Seeded and verified the canonical eight-axis order and two shared-geometry light themes.

## In Progress

- LiveBench ingestion vertical slice: fetch, immutable snapshot, validation and staging.

## Decisions Made

- Full TypeScript monorepo, PostgreSQL/Drizzle, Next.js and Remotion.
- LiveBench is the first automated connector; Scale snapshots remain provisional fixtures.
- Missing values stay null and eligibility is coverage-gated.
- Published environments require an explicit `DATABASE_URL`; the local fallback is development-only.
- Schema changes use committed generated migrations, never direct production `push`.

## Tests Run

- Contracts, scoring, radar, schema, seed and database URL policy tests pass.
- Database schema and seed compile under strict TypeScript.
- PostgreSQL 18 accepted the migration and reports exactly 27 application tables.
- PostgreSQL returned all eight ordered dimensions and both `radar-v1` light themes.

## Data Sources Status

- LiveBench: official public data and Apache-2.0 license identified; connector implementation next.
- Scale Labs: local 2026-07 snapshots preserved; license/terms and parser verification pending.
- All other requested sources: registry research pending.

## Risks / Blockers

- No blocking issue. FFmpeg is not installed globally; Remotion renderer feasibility will be tested before video completion.

## Next Actions

- Implement and test the LiveBench connector and content-addressed raw storage.
- Add repository queries that publish a validated ranking snapshot.
- Build the bilingual Next.js vertical slice against the published snapshot contract.
