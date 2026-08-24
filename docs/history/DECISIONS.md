# Decisions — Superseded v1 history

> 本文件記錄舊 PostgreSQL／Worker／Edition 架構，已由
> [重構規格](REFACTOR_SPEC.md) 與 [新版架構](../ARCHITECTURE.md) 取代。
> 除非條目已被新版文件重新確認，以下決策不得作為目前實作依據。

## DEC-001 — TypeScript monorepo

Use Node 24, pnpm 11 and Turborepo with Next.js 16, React 19, Drizzle/PostgreSQL and Remotion. A single language keeps contracts shared across connector, scoring, Web and video while the repository has no existing stack.

## DEC-002 — Generated SQL migrations

Drizzle TypeScript schema is the source of truth. Generate and commit SQL migrations, then apply with `drizzle-kit migrate`; never use `push` for published environments.

## DEC-003 — Light visual baseline

User decision on 2026-07-11: both website and video use a light baseline. Google-inspired and Apple-inspired themes share content contracts and radar geometry.

## DEC-004 — Bilingual first release

User decision on 2026-07-11: support Traditional Chinese and English. Locale is URL-visible; unsupported locales redirect to `zh-TW`.

## DEC-005 — No missing-value imputation in v1

Missing scores remain null. Coverage gates determine provisional/verified eligibility; no zero, cohort median or competitor-relative value is inserted.

## DEC-006 — Content-addressed raw evidence

Store raw bytes outside relational rows through a storage adapter, keyed by SHA-256. PostgreSQL owns immutable metadata and evidence locators. Local development uses a mounted directory; an object-store adapter can be added without changing contracts.

## DEC-007 — First source strategy

Implement LiveBench as the first automated source because its official repository exposes public data and documents Apache-2.0 distribution. Treat the existing Scale Labs snapshots as provisional seed/parser fixtures until access terms and a live connector pass review.

## DEC-008 — Dependency script allowlist

pnpm 11 lifecycle scripts remain denied by default. Only reviewed packages are added to `allowBuilds`; the allowlist contains `esbuild` for the TypeScript test toolchain and `sharp` for Next.js image processing.

## DEC-009 — TypeScript compatibility boundary

The workspace pins TypeScript 5.9.3. Next.js 16.2.10 resolves `typescript/lib/typescript.js`, while Remotion 4.0.487 loads TypeScript through its monorepo-root bundler; the package subpath/API shape is not compatible with TypeScript 7. A single compatible workspace version keeps production type checking and rendering enabled without loader shims.

## DEC-010 — Exact and exhaustive source alias adjudication

Each pinned source alias receives exactly one version-controlled canonical mapping or explicit exclusion. Mappings require HTTPS evidence and use only safe normalization (Unicode normalization, trim, case-folding and whitespace collapse). Fuzzy matching never publishes an identity. Private checkpoints, impossible identities and unverifiable source-local aliases remain staged as `EXCLUDED` with reasons and no canonical variant ID.

## DEC-011 — LiveBench release mapping stays source-bounded

Release `2024-11-25` is seeded as one immutable LiveBench benchmark version with 18 task metrics and the prompt-free question-inventory hash. Official task means are percentage metrics with fixed 0 and 100 anchors. Reasoning, math, coding, language and instruction-following map only to their supported primary dimensions; structured data-analysis tasks map to Reasoning because they measure relational and multi-step table reasoning. Knowledge, Agentic and Context receive no LiveBench weight. This preserves nulls instead of stretching one source across unsupported axes. Each supported dimension normalizes its task weights to one, and formal publication remains disabled in scoring method `absolute-capability-v1` until all independent coverage gates pass.

## DEC-012 — Promote conflict-free tasks before formal ranking

Reviewed LiveBench rows may become published benchmark results at task granularity even when the six-category model aggregate is incomplete. Promotion requires one immutable resolved ingestion run, the exact pinned inventory, a complete task denominator and zero conflicting observations. A SHA-256 publication key over run, model variant, task metric and source snapshot makes retries and concurrent inserts idempotent. Each result has one primary evidence record containing the run, release, inventory hash, category, task and source snapshot. This does not authorize a formal overall ranking: incomplete and conflicting tasks remain staged, missing dimensions remain null, and the scoring/edition gates stay independent.

## DEC-013 — Immutable snapshots preserve incomplete evidence

Scoring materializes all eight dimensions for every model with published evidence, while missing axes remain null and contribute zero coverage. Dimension rows retain their component result IDs, and one content hash binds edition, cutoff, method, sources and ordered entries. A snapshot for an existing edition and method is reusable only when the hash is identical; it is never updated in place. The first real snapshot intentionally contains only unranked entries because LiveBench does not satisfy six formal dimensions. The separate `preview-ui-v1` fixture uses fictional names, explicit provisional flags and a reserved `preview-` method prefix that the formal publication guard always rejects.

## DEC-014 — Editions switch pointers; snapshots never roll back

One partial unique index permits exactly one active weekly edition. Activation and rollback acquire the same PostgreSQL transaction-scoped advisory lock, revalidate the target, deactivate the prior pointer and activate the target atomically. Formal mode requires a published, formal-enabled scoring method and verified ranked entries; incomplete data may be active only under explicit PREVIEW mode. Every successful change appends a SHA-256 audit record whose input includes the previous audit hash, actor, action, edition, snapshot and publication mode. A retry of the already-active target is a no-op. Rollback therefore reactivates an older immutable snapshot rather than altering history.

## DEC-015 — The active edition is the only latest-ranking read pointer

`GET /api/v1/rankings/latest` reads the one database-enforced active weekly edition and its immutable snapshot; recency, edition date or preview fixtures never override that pointer. Shared Zod contracts validate repository assembly and the versioned HTTP envelope. Rows sort by rank and then stable model slug/ID, entry-count drift fails closed, and configuration/query failures return a generic non-cacheable 503 without exposing database details. A process-local lazy pool avoids connection creation per request while keeping initialization inside the request error boundary.

## DEC-016 — Empty data and unavailable data are different product states

The fictional Web preview is a deliberate fallback only when the database query succeeds and returns no active edition. Database initialization, connection, validation and query failures propagate to a retryable unavailable page; they never select preview. Process liveness is independent of PostgreSQL, while the data-status endpoint reports database readiness, the active pointer and published-result count without caching. This prevents a production outage from looking like a valid preview publication.

## DEC-017 — Detail URLs use canonical slugs and expose evidence without reinterpretation

Model and benchmark detail pages bind stable lowercase route slugs to canonical database identities and validate assembled DTOs before rendering. Model history follows immutable edition records, task results retain source values and units, and the primary evidence link exposes its source snapshot hash rather than inventing a UI provenance label. Benchmark leaderboards respect each metric's higher/lower direction and use canonical model slug as the final deterministic tie-breaker. Missing identity facts, scores, samples and evidence remain explicit unknown/N/A values; malformed and unknown slugs fail with 404 instead of fuzzy resolution.

## DEC-018 — Comparison and presentation state is ordered, bounded and URL-owned

The comparison URL stores two to five repeated canonical `models` query parameters in display order plus the active `edition`, locale path and one of the two light `theme` values. Shared boundaries reject malformed, duplicate and excessive selections before rendering; edition resolution accepts only the current active pointer, and model resolution rejects unknown IDs rather than silently dropping or substituting them. Theme changes update the URL and every comparison/locale link preserves the complete presentation state. The comparison table reuses the snapshot's fixed eight-axis order, values, status and quality flags, so null scores stay N/A and the share link cannot alter scoring semantics.

## DEC-019 — Methodology is durable; operational status is live

Methodology pages render reviewed bilingual rules from version-controlled code because evidence, missing-data, conflict and publication policy changes require review and a commit. Source and pipeline pages instead assemble Zod-validated summaries from PostgreSQL: registered sources, immutable snapshots, ingestion runs, staged rows, published results, ranking snapshots, editions and the active pointer. A database failure reaches the shared retryable unavailable UI and never falls back to hard-coded healthy counts. Candidate sources still under research stay in documentation and do not appear as connected until a source record exists.

## DEC-020 — Radar presentation is shared, bounded and null-preserving

Web and Remotion convert model series through one framework-neutral radar presentation contract rather than independently assembling SVG geometry. The boundary accepts one to five uniquely identified series, a fixed 0–100 scale and explicit animation progress. It emits the same rings, axes, label positions, complete polygons, incomplete line segments and equivalent table rows for every renderer. Missing values remain null and produce open geometry plus N/A table cells; they never collapse to the origin. Reduced-motion presentation resolves to final geometry without changing the underlying values.

## DEC-021 — Video artifacts are edition-bound; only formal renders persist jobs

The production video CLI must resolve exactly one persisted weekly edition, addressed by edition UUID or its attached immutable snapshot UUID. Locale, all-light theme, Top-N (one to five), selected canonical model and poster/video media are validated before Remotion receives a JSON props file; no inline Windows-shell JSON is used. Output paths include edition date, snapshot, locale, theme, Top-N, model and media. Metadata records the canonical database snapshot SHA-256 plus a separate serialized-props SHA-256, while the operational render log records timestamps, paths, output hash and failure summary. PREVIEW output stays explicitly labeled and does not write `video_jobs`. FORMAL output alone follows the guarded `QUEUED → RUNNING → SUCCEEDED|FAILED` lifecycle.

## DEC-022 — Weekly automation is idempotent, partial and non-formal by default

The weekly CLI acquires the pinned question inventory and full official judgment artifact independently, using each connector's bounded timeout plus at most three retries for transient network/status failures. A PostgreSQL advisory lock and exact source-snapshot/content/count reconciliation reuse a complete succeeded ingestion run rather than duplicating 60,372 staged rows. Alias sync/resolution, readiness, promotion diff, scoring diff and rendering emit one versioned JSON summary; a source failure skips only dependent steps and still attempts a visibly fictional safe preview. The default command may update raw/staged review state but cannot insert promoted results, create a score snapshot, activate an edition or attempt FORMAL publication. Explicit `--apply-preview` may apply guarded result/snapshot writes and activate only PREVIEW; FORMAL activation remains a separate protected operator action. Hugging Face's exact `cas-bridge.xethub.hf.co` Xet endpoint is allowlisted without suffix matching; its missing `Content-Type` is accepted only on that exact host while length, ETag, range and Parquet structure checks remain mandatory.

## DEC-023 — Browser acceptance uses a guarded fixture and a nonce CSP

Browser gates run the production Next.js build against reserved, deterministic E2E identities in a disposable PostgreSQL database. The fixture requires an explicit environment flag, is idempotent only for its own UUIDs and refuses to displace any other active edition. Playwright covers required routes, shareable presentation state, responsive containment, bounded API/performance behavior and fail-closed selectors; axe checks automated WCAG A/AA rules. Page requests use the official Next.js 16 proxy nonce pattern, so framework scripts receive a unique nonce and `strict-dynamic` without arbitrary inline-script permission. Locale routes are dynamic as required by nonce rendering. Semantic progress and fixed legend classes replace the only application inline styles. CI installs Chromium from the lock-pinned Playwright version and uploads its report.

## DEC-024 — Local worker operation is command-driven

The worker has no continuously polled queue: ingestion, scoring, edition and video work is explicitly bounded by CLI arguments, source timeouts, transaction guards and scheduled GitHub Actions. `pnpm local:up` still supplies the required single local entry point by starting and health-checking PostgreSQL, migrating and seeding it, building the worker, then running Next.js alongside the worker TypeScript watcher. Data-changing jobs run from a second terminal and never occur merely because the development environment started. This intentionally avoids an idle process with implicit writes while keeping the Web, database and worker code live in one command.

## DEC-025 — Native accessible controls and semantic CSS replace UI framework defaults

The Web app uses React/Next.js with native buttons, selects, links, tables and semantic regions plus version-controlled CSS instead of adding Tailwind and a headless component dependency. The product requires two tightly bounded themes and a shared geometry contract, not a general component framework. Native controls reduce bundle and supply-chain surface while retaining keyboard/screen-reader behavior; axe WCAG A/AA scans, 390/1440 containment tests and production Chrome verification are the acceptance authority. Theme tokens and component classes remain documented in `DESIGN_SYSTEM.md`.

# Superseded historical decisions

This document describes the removed PostgreSQL, Edition, legacy Web, Worker and video architecture. It is retained only as historical context. None of these decisions govern the current static-data product; see `ARCHITECTURE.md`, `DATA_METHODOLOGY.md`, `SCORING_METHODOLOGY.md` and `OPERATIONS.md`.
