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
- Extracted the fictional, clearly labeled preview snapshot into a shared presentation package consumed by both Web and video.
- Built a bilingual four-scene Remotion composition at 1920×1080, 30 fps and 600 frames with validated snapshot, locale, theme and selected-model props.
- Rendered and visually inspected four representative stills, then completed a 20-second H.264 MP4 render with Remotion's managed media toolchain.

## In Progress

- LiveBench canonical model alias expansion and category aggregation. The first 10 of 166 normalized aliases are evidence-backed and resolved; publication remains disabled until coverage gates pass.

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
- The read-only alias review CLI verified that the run contains 100 rows grouped into 69 normalized aliases; all 69 remain unresolved because no aliases have been reviewed and registered yet.
- The full-run review report groups 195 raw model spellings into 166 safe-normalized aliases; all 166 remain unresolved pending canonical provider/model/effort review.
- Web preview snapshot and locale contract tests pass; Next.js production build prerenders both locale routes.
- Chrome DevTools verified model switching and identical radar path geometry across both themes.
- Chrome verified no horizontal overflow at 390px and 1440px, correct English document metadata and a clean runtime console.
- Mobile Lighthouse passes 55/55 audits with Accessibility, Best Practices, SEO and Agentic Browsing all at 100.
- Local Chrome performance trace measured 191 ms LCP and 0.00 CLS without throttling.
- Video timeline and prop-validation tests pass, including full-frame coverage and intentional scene overlaps.
- Remotion rendered all 600 frames to a 3.11 MiB H.264 MP4.
- Chrome decoded the MP4 at 1920×1080 and approximately 20.05 seconds, sought successfully across all four scenes and reported no console warnings or errors.
- `pnpm audit --audit-level high` passes; two moderate transitive advisories are recorded with bounded, currently unreachable application paths and a review date.
- Added SHA-pinned CI gates for formatting, types, tests, PostgreSQL migration/seed, production build, high-severity audit and Remotion frame rendering.
- Added a least-privilege Monday 09:15 Asia/Taipei weekly dry run that stages one bounded official LiveBench page and uploads short-lived immutable evidence without publishing.
- Replayed the complete CI chain locally: Prettier, ESLint with zero warnings, 9-package type checking, 57 tests, PostgreSQL migration/seed, 9-package production build, high-severity audit and Remotion still render all pass.
- Added deterministic video metadata JSON and ranking CSV bound to the input snapshot ID and SHA-256; the preview bundle was generated successfully.
- Added a tested deterministic LiveBench pagination planner that covers every declared row exactly once and enforces the official 100-row request ceiling.
- Added sequential full-dataset LiveBench orchestration with aggregate run summaries, total-row drift rejection and a dedicated CLI; publication remains disabled.
- Added fixed-origin Hub revision capture and bound the immutable dataset commit SHA to every LiveBench source snapshot and ingestion run.
- Added a deterministic source-scoped model alias resolver that permits only exact safe-normalized matches and surfaces cross-variant collisions for manual review.
- Added transactional LiveBench staged-row alias decisions with explicit resolved, unresolved and ambiguous outcomes; no unreviewed aliases are auto-created.
- Added a read-only repeatable-read LiveBench alias review report that groups raw spellings, counts rows and prioritizes ambiguous/unresolved names deterministically.
- Reproduced a rows-API HTTP 429 after 45 pages/4,500 rows, then added a revision-pinned single-Parquet connector with strict Hub/CDN redirect, size, hash, magic and row-schema validation.
- Switched full LiveBench ingestion to one Parquet snapshot and one transactional run with 1,000-row staging batches; the verified run accepted all 60,372 rows across 195 raw model names.
- Added a versioned, HTTPS-evidence-backed LiveBench alias manifest with normalized collision rejection and an idempotent PostgreSQL sync transaction.
- Synced the first three reviewed Anthropic aliases twice with stable counts, then resolved the full run to 1,482 validated rows (494 per variant), 58,890 review-required rows and zero ambiguous rows.
- Added seven official dated IDs from OpenAI, Cohere and Google, including current lifecycle states from vendor documentation; idempotent sync now ensures 10 aliases across 4 providers.
- Re-resolved the full run to 5,067 validated rows (8.39%), 55,305 review-required rows and zero ambiguous rows. The remaining 156 normalized aliases stay excluded from publication.

## Data Sources Status

- LiveBench: official public data and Apache-2.0 license identified; full revision-pinned staging connector READY, publication disabled.
- Scale Labs: local 2026-07 snapshots preserved; license/terms and parser verification pending.
- All other requested sources: registry research pending.

## Risks / Blockers

- No blocking issue. A global FFmpeg installation is unnecessary for the verified local path because Remotion's managed renderer completed the H.264 encode.

## Next Actions

- Complete LiveBench canonical alias mapping.
- Aggregate reviewed LiveBench rows and add repository queries that publish a validated ranking snapshot.
- Connect the deterministic artifact manifest to future published-edition video job records.
- Add weekly dry-run/publish/rollback orchestration with explicit publication gates.
