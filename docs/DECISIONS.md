# Decisions

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

## DEC-018 — Comparison state is ordered, bounded and URL-owned

The comparison URL stores two to five repeated canonical `models` query parameters in display order. A shared Zod boundary rejects malformed, duplicate and excessive selections before rendering; resolution against the current snapshot rejects unknown IDs rather than silently dropping or substituting them. Locale changes preserve the ordered query. The comparison table reuses the snapshot's fixed eight-axis order, values, status and quality flags, so null scores stay N/A and the share link cannot alter scoring semantics.
