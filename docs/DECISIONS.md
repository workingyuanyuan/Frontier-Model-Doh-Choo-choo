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

## DEC-009 — Web TypeScript compatibility boundary

The workspace default is TypeScript 7.0.2. The Next.js 16.2.10 app pins TypeScript 5.9.3 because Next's build-time dependency verifier resolves `typescript/lib/typescript.js`, a package subpath no longer exported by TypeScript 7. This local compatibility boundary preserves production type checking without downgrading other packages or disabling Next checks.
