# Progress

## Current Phase

Phase 1 — source ingestion, canonical identity and first publishable snapshot.

## Completed

- Preserved the original Scale Labs reference material under `reference-table-data/`.
- Initialized Git and a pinned pnpm/Turborepo strict-TypeScript toolchain.
- Confirmed Chrome DevTools MCP is available for runtime verification.
- Locked an all-light visual baseline and bilingual Traditional Chinese/English scope.
- Defined and tested the ranking snapshot, absolute scoring and deterministic radar contracts.
- Implemented 27 PostgreSQL/Drizzle entities for model identity, evidence, scoring, publishing and audit history.
- Generated and applied the initial SQL migration to PostgreSQL 18.
- Seeded and verified the canonical eight-axis order and two shared-geometry light themes.
- Implemented the LiveBench rows connector with strict Zod validation, fixed HTTPS origin, manual redirect rejection and response byte limits.
- Implemented immutable content-addressed raw storage with SHA-256 deduplication and collision/tamper detection.
- Implemented the worker staging transaction across source, snapshot, ingestion run and staged result entities.
- Completed a real official LiveBench ingestion: 100/100 rows accepted from 60,372 available, with one successful auditable run.
- Built statically generated `/zh-TW` and `/en` Next.js routes with URL-visible locale fallback, shared preview snapshot data and clear non-production labeling.
- Built selectable model rankings, an accessible shared-geometry SVG radar, two all-light semantic themes, evidence/pipeline/methodology cards and responsive layouts.
- Added a project-owned SVG icon without third-party brand assets.

## In Progress

- LiveBench full pagination, Hub revision capture, canonical model aliases and category aggregation.

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
- LiveBench connector/storage tests and worker staging tests pass.
- The real connector response passed the production parser and was written under its verified SHA-256 path.
- PostgreSQL reports one successful LiveBench run and 100 validated unresolved staged rows.
- Web preview snapshot and locale contract tests pass; Next.js production build prerenders both locale routes.
- Chrome DevTools verified model switching and identical radar path geometry across both themes.
- Chrome verified no horizontal overflow at 390px and 1440px, correct English document metadata and a clean runtime console.
- Mobile Lighthouse passes 55/55 audits with Accessibility, Best Practices, SEO and Agentic Browsing all at 100.
- Local Chrome performance trace measured 191 ms LCP and 0.00 CLS without throttling.

## Data Sources Status

- LiveBench: official public data and Apache-2.0 license identified; single-page staging connector READY, publication disabled.
- Scale Labs: local 2026-07 snapshots preserved; license/terms and parser verification pending.
- All other requested sources: registry research pending.

## Risks / Blockers

- No blocking issue. FFmpeg is not installed globally; Remotion renderer feasibility will be tested before video completion.

## Next Actions

- Complete LiveBench pagination, Hub revision capture and canonical alias mapping.
- Aggregate reviewed LiveBench rows and add repository queries that publish a validated ranking snapshot.
- Build the Remotion composition from the same snapshot, locale and theme contracts.
