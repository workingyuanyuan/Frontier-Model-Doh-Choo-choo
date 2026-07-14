# Progress

## Current Phase

Phase 6 — data-backed Web product; active-edition contracts, repository and latest-ranking API are complete.

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

- LiveBench category aggregation and benchmark mapping. All 166 normalized model aliases now have exactly one audited mapping or exclusion decision; publication remains disabled until the remaining non-alias coverage gates pass.

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
- Added the three active Amazon Nova 1 Bedrock IDs and active Cohere Command A 03-2025 ID with vendor release dates; idempotent sync now ensures 14 aliases across 5 providers.
- Re-resolved the full run to 6,471 validated rows (10.72%), 53,901 review-required rows and zero ambiguous rows. The remaining 152 normalized aliases stay excluded from publication.
- Pinned the complete 166-alias, 60,372-row inventory and added an exact completeness oracle that rejects missing, extra or conflicting decisions.
- Completed first-party/vendor/model-card research for every alias: 157 aliases map to canonical identities and 9 unverifiable, invalid or benchmark-private aliases have explicit evidence-backed exclusion decisions.
- Synced the 157-entry canonical manifest twice with identical summaries, proving idempotent provider/family/model/variant/alias creation.
- Re-resolved the fixed full run twice with identical results: 58,233 validated rows, 2,139 explicitly excluded rows, zero unresolved rows and zero ambiguous rows.
- Added a read-only persistence verifier; PostgreSQL confirms every validated row has a resolved model variant ID and every excluded row keeps that ID null.
- Replayed the final CI-equivalent gate after full alias adjudication: formatting, zero-warning lint, 9-package type checking, 103 tests, migration, seed, production build, high-severity audit and Remotion still all pass.
- Added a deterministic conflict-aware LiveBench aggregation contract that follows the official question → task → equal-weight category formula while keeping incomplete values null.
- Added a repeatable-read, read-only aggregation repository and CLI. It validates the full-Parquet run and every staged payload, uses all staged rows for expected coverage and permits only canonical validated rows to contribute scores.
- Verified the pinned run contains 494 expected observations across 7 tasks and 3 categories, 157 canonical models and 11 models complete within those available categories.
- Measured 2,674 repeated canonical observations, including 201 keys with different scores. The run also lacks reasoning, math and data-analysis rows, so publication readiness correctly remains false.
- Proved the readiness command is non-publishing: benchmark results, dimension scores, overall scores, ranking snapshots, ranking entries and weekly editions all remained at zero before and after execution.
- Replayed the complete CI-equivalent gate after aggregation readiness: formatting, zero-warning lint, 9-package type checking, 115 tests, migration, seed, production build, high-severity audit and Remotion still all pass. The audit reports only the two previously bounded moderate transitive advisories.
- Confirmed from the official Hub organization that `model_judgment` is a three-category artifact while six separate question datasets define the benchmark inventory. Added a strict deterministic selector for the public `2024-11-25` release that follows official release/removal boundaries, rejects duplicate IDs and emits stable per-turn observations; real acquisition remains gated on six pinned dataset revisions.
- Replayed the complete CI-equivalent gate after the release-inventory contract: formatting, zero-warning lint, 9-package type checking, 118 tests, migration, seed, production build, high-severity audit, Remotion still and snapshot-bound artifacts all pass. The audit still reports only the two previously bounded moderate transitive advisories.
- Added a revision-pinned, range-bounded connector for all six official LiveBench question datasets. It allows only fixed Hub IDs/commits and approved CDN redirects, rejects whole-artifact fallbacks and validates every range, byte budget, projected row and source category.
- Ran the real connector twice with identical output: 1,436 decoded source rows, 2,816,787 transferred bytes over 42 ranges, and a 1,000-observation/18-task/six-category `2024-11-25` inventory. The prompt-free 180,278-byte evidence artifact is stored under SHA-256 `b8a90d2f2308b774fbee982178d433412fd6f349429be2a41def4331b0ee4027`.
- Replayed the complete CI-equivalent gate after bounded inventory acquisition: formatting, zero-warning lint, 9-package type checking, 123 tests, migration, seed, production build, high-severity audit, Remotion still and snapshot-bound artifacts all pass. The six scoring/publication tables remain empty, and the audit still reports only the two previously bounded moderate transitive advisories.
- Bound aggregation readiness to the exact 180,278-byte question inventory evidence. The loader verifies the SHA-256, all six source pins, complete category set, unique question/turn keys and a bounded file read before any database query.
- Filtered the 60,372-row judgment run against release `2024-11-25`: 46,118 rows match the inventory and 14,254 are outside it. The artifact covers 318/1,000 keys—coding 128/128, language 140/140, instruction-following 50/200, and zero reasoning, math or data-analysis keys.
- Recomputed conflict-aware readiness over the six-category denominator: 155 canonical models have at least one in-release validated row, none is complete, 2,674 repeated observations include the same 201 conflicting keys, and publication remains disabled.
- Replayed the complete CI-equivalent gate after pinned judgment filtering: formatting, zero-warning lint, 9-package type checking, 131 tests, migration, seed, production build, high-severity audit, Remotion still and snapshot-bound artifacts all pass. The audit still reports only the two previously bounded moderate transitive advisories.
- Audited all 13 official `model_judgment` commits and pinned the newest earlier six-category artifact: revision `5896e3b11081702c7f93f4733605fa4f5a072a11`, 93,624 rows, six categories and SHA-256 `8f490d557d86b5dab0da9db1169142f69ebe69907fbaba361b4f00e4fe4f171d`.
- Added a fixed-revision connector contract that verifies commit, byte length, body SHA-256, schema, row count, exact category set and question metadata before producing coverage evidence. No caller-supplied URL, score selection or publication write is available.
- Ran the two-revision acquisition twice with identical output. The source-level union covers 800/1,000 observations: coding 128/128, data-analysis 150/150, instruction-following 50/200, language 140/140, math 232/232 and reasoning 100/150. The 3,018-byte prompt/model/score-free manifest is stored at SHA-256 `c80ea84bba3be46ac2a9c6bf5203422a76f5ab0181f0a04c908c0e942125dda5`.
- Classified the 201 current canonical conflicts: 64 conflict within one exact official raw model spelling; 137 arise only after multiple reviewed spellings map to one canonical model. Artifact-aligned official code already had last-JSONL-occurrence de-duplication, but the Parquet schema has no answer/run/version lineage, so timestamp, row order and alias spelling remain unsafe precedence rules.
- Replayed the complete CI-equivalent gate after revision-bound acquisition: formatting, zero-warning lint, 9-package type checking, 136 tests, migration, seed, production build, high-severity audit, Remotion still and snapshot-bound artifacts all pass. All six publication tables remain empty; the audit still reports only the two previously bounded moderate transitive advisories.
- GitHub Actions CI run `29306014499` independently repeated the full quality, PostgreSQL and render-smoke job for commit `dd52511` and completed successfully.
- Seeded immutable LiveBench release configuration for `2024-11-25`: 18 task metrics covering all 1,000 inventory observations, one official evaluation config, fixed percentage normalization and 18 primary-dimension mappings across five source-supported axes. Knowledge, Agentic and Context remain unmapped/null, and scoring method `absolute-capability-v1` remains `DRAFT` with formal publication disabled.
- Verified seed idempotency against PostgreSQL by running it twice: benchmark/version/metric/mapping counts remained 1/1/18/18 and the sorted metric UUID identity hash remained `9f08932798229f9e6c8a5f89acba7a3b`.
- Added a deterministic result publication key and migration, a strict dry-run-by-default promotion CLI and a serializable promotion transaction. Only complete, conflict-free LiveBench task aggregates can cross from staged data into published benchmark results.
- The real 60,372-row run produced 737 promotion candidates while retaining 2,014 incomplete and 39 conflicting task aggregates as blockers. Apply inserted 737 results plus 737 primary evidence rows across 152 canonical models and six task metrics; an immediate retry inserted zero, a following dry run reported all 737 as existing, and the orphan-evidence count is zero.
- Null-safe scoring created 1,216 ordered dimension rows and 152 overall eligibility rows from those results. The immutable 2026-07-13 snapshot contains 152 entries and SHA-256 `f806b8b4e654180958099a528c1e06379ce55cf224f8e03f3b807d323d54ad7a`; all entries correctly remain unranked with null overall scores because only partial dimensions are covered. Re-running apply reused the same snapshot ID and hash.
- Added serializable edition activation and rollback with a database-enforced single active row, explicit FORMAL/PREVIEW modes and chained audit hashes. The real local drill rejected formal activation, activated two preview snapshots in sequence, rolled back to 2026-07-13, and verified one active row, two immutable editions, three audit entries and zero broken hash links. The integration test performs the same write path inside an outer PostgreSQL transaction and rolls back all fixtures.
- Added versioned active-edition API contracts, a fail-closed deterministic database repository and `GET /api/v1/rankings/latest`. The production endpoint returns the active 2026-07-13 PREVIEW snapshot with all 152 entries, stable cache/error semantics and no mutation path; Web unit/type/build gates and real Chrome console/network checks pass.
- Replaced the hard-coded homepage input with the active database edition and added process health plus non-cacheable data-status endpoints. Production/Chrome tests proved all three states: real PREVIEW data uses the immutable 2026-07-13 snapshot, a reachable empty database uses the explicitly fictional design fixture, and an unavailable database returns 503/retry UI without masquerading as preview. Real missing axes remain N/A with no NaN SVG, and fabricated weekly-change/hash values were removed.

## Data Sources Status

- LiveBench: official public data and Apache-2.0 license identified; revision-pinned staging, task-result promotion and null-safe snapshot generation READY; formal edition publication remains disabled.
- Scale Labs: local 2026-07 snapshots preserved; license/terms and parser verification pending.
- All other requested sources: registry research pending.

## Risks / Blockers

- Formal LiveBench publication is blocked by 201 repeated canonical question keys with conflicting scores until a source-backed evaluation-run selection policy is defined.
- The current staged judgment run contains only coding, instruction-following and language. Historical source evidence fills data-analysis, math and 100 reasoning keys, but it is not yet staged/adjudicated for per-model aggregation; 200 question observations remain absent from every pinned revision.
- A global FFmpeg installation is unnecessary for the verified local path because Remotion's managed renderer completed the H.264 encode.

## Next Actions

- Add bilingual model and benchmark detail routes backed by stable repository identifiers and null-safe evidence tables.
- Stage the pinned historical judgment revision as a separate auditable run, resolve it through the completed alias manifest and define a revision-composition report without treating coverage union as score precedence.
- Locate official answer/judgment evidence for the remaining 150 instruction-following and 50 reasoning observations; never infer them or treat them as zero.
- Resolve repeated LiveBench judgments with a source-backed evaluation-run policy; release filtering alone does not select a winning conflicting judgment.
- Keep the fictional `preview-ui-v1` fixture isolated from data-backed snapshots and reject it at the formal publication guard.
- Connect the deterministic artifact manifest to future published-edition video job records.
- Add weekly dry-run orchestration around the completed guarded publish/rollback primitives.
