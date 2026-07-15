# Architecture

## Monorepo

```text
apps/
  web/       Next.js App Router, server-first data access, REST read API
  worker/    ingestion, review, scoring, publishing and weekly CLI
  video/     Remotion preview and deterministic renders
packages/
  contracts/ shared Zod schemas, branded IDs and API DTOs
  db/        Drizzle schema, SQL migrations and repositories
  connectors/source-specific fetch/parse/validate adapters
  scoring/   normalization, coverage, confidence and ranking
  radar/     framework-neutral geometry and shared React SVG
  presentation/ validated view models shared by Web and video
```

## Data flow

```text
allowlisted HTTPS source
→ immutable raw artifact + SHA-256 + HTTP metadata
→ source-specific parser
→ boundary schema validation
→ staged rows and quality issues
→ exact alias/config resolution
→ reviewed published result
→ versioned normalization and dimension aggregation
→ immutable ranking snapshot
→ website API/server components + Remotion composition
```

## Storage layers

- Raw bodies use content-addressed files under a configurable storage adapter; PostgreSQL stores URI, hash, headers and provenance.
- Staged results preserve source names and parse issues without requiring canonical aliases.
- Published results are canonical, reviewed rows; lower-priority sources cannot silently overwrite them.
- Ranking snapshots and entries are append-only and contain scoring version plus all source snapshot IDs.

## Runtime boundaries

- External responses, manual imports, URL parameters and environment variables are untrusted and Zod-validated.
- Connector URLs are registry-owned, HTTPS-only and host-allowlisted; redirects to unapproved hosts fail.
- Website reads through repositories/services; it does not parse external source data.
- Video receives a serialized ranking snapshot contract and never maintains separate hand-authored scores.
- Web comparison charts and Remotion scenes consume the same framework-neutral radar presentation contract. It validates one to five series, preserves null axes, fixes the scale at 0–100 and emits rings, axes, label positions, line/polygon geometry and equivalent table rows from one input. Animation progress is an input to that contract; reduced motion resolves directly to final geometry.
- Edition video rendering resolves exactly one persisted edition or attached snapshot through the same validated ranking assembly as Web. The CLI bounds locale, theme, Top-N, selected canonical model and media type before writing props. Artifact directories include every presentation selector; metadata binds the database snapshot hash and serialized props hash. PREVIEW renders remain visibly labeled and never create `video_jobs`; FORMAL renders transition one job through `QUEUED → RUNNING → SUCCEEDED|FAILED`.

## Public interfaces

- Read API prefix: `/api/v1`.
- Resources: editions, rankings, models, benchmarks, comparisons, sources and methodology.
- Every response carries `apiVersion: "v1"`. Success envelope: `{ apiVersion, data, meta? }`; error envelope: `{ apiVersion, error: { code, message, details? } }`.
- List resources use cursor pagination. Contract changes are additive within v1.
- `GET /api/v1/rankings/latest` resolves only the database-enforced active edition, validates the complete response contract and returns deterministic rank/slug order. It returns non-cacheable stable `404`/`503` codes when the active pointer is absent or unavailable; successful responses use a 60-second public cache with 300-second stale revalidation.
- Web database access is a process-local lazy pool so development hot reload and repeated requests do not create an unbounded connection pool. Connection configuration and repository failures stay inside the API error boundary.
- Locale homepages are dynamic Server Components that read the repository directly. A reachable database with no active edition selects the project-owned fictional preview fixture; a connection or query failure renders a retryable unavailable state and never masquerades as preview data.
- `GET /api/v1/health` is process liveness and has no database dependency. `GET /api/v1/status/data` is non-cacheable readiness/data state and reports the active pointer plus published-result count, or a stable 503 when PostgreSQL is unavailable.
- `/{locale}/models/{variant-slug}` reads canonical identity, the active ranking row, edition history and task-level benchmark evidence through a validated detail DTO. `/{locale}/benchmarks/{benchmark-slug}` reads the newest benchmark version, metric definitions and direction-aware deterministic leaderboards. Route slugs are lowercase canonical identifiers; unknown or malformed identifiers return 404.
- `/{locale}/compare?models={slug}&models={slug}` resolves two to five unique canonical entries from the same active snapshot used by the homepage. Query order is presentation order and survives locale switching. Missing, duplicate, malformed, unknown or excessive identifiers fail at the route boundary; the empty-database design fixture remains explicitly separated from data-backed model detail links.
- `/{locale}/methodology` is a bilingual durable statement of versioned evidence, null, conflict and publication policy. `/{locale}/sources` validates live source/snapshot/latest-run summaries from PostgreSQL, while `/{locale}/pipeline` validates persisted source, ingestion, staged, result, ranking and edition counts plus the active pointer. Repository failures propagate to the shared unavailable boundary; neither page substitutes static success data.

## Local and automated operation

- Node 24 + pnpm workspace + Turborepo.
- PostgreSQL runs in Docker Compose with a persistent named volume.
- `pnpm local:up` waits for PostgreSQL, migrates and seeds it, builds the worker,
  then starts the Web server and the command-driven worker's compile watcher.
  The worker has no idle queue consumer; ingestion, scoring, edition and video
  jobs are explicit bounded CLIs locally and scheduled GitHub Actions in CI.
- GitHub Actions runs frozen installs, migrations, unit/integration/E2E tests, build and scheduled dry-run ingestion.
- Publishing is transactional; a failed source or validation run leaves the previous edition active.
