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
