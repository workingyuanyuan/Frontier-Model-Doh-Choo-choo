# LLM Bench Radar

A bilingual, traceable LLM benchmark ranking platform that produces an interactive eight-axis website and deterministic weekly videos from the same immutable ranking snapshot.

## Current status

The repository foundation and product/methodology documents are complete. Domain contracts, scoring, database, connector, Web and video are being delivered as tested vertical slices. Files in `reference-table-data/` are preserved Scale Labs research/fixtures, not verified production data.

## Requirements

- Node.js 24+
- pnpm 11+
- Docker Desktop with Compose
- Chrome for DevTools/E2E verification

## Setup

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm db:up
```

On PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

## Quality commands

```bash
pnpm format
pnpm typecheck
pnpm test:run
pnpm build
pnpm e2e
```

`pnpm e2e` runs the production build through Chromium. CI prepares its
disposable fixture with `E2E_FIXTURE=1 pnpm e2e:seed`; the fixture refuses to
replace a non-E2E active edition. Repository changes are pushed as complete,
test-passing batches rather than once per edited file.

## Working applications

```bash
pnpm --filter @llm-bench/web dev
pnpm ingest:livebench
pnpm ingest:livebench:all
pnpm review:livebench-aliases
pnpm sync:livebench-aliases
pnpm resolve:livebench-aliases
pnpm verify:livebench-aliases
pnpm report:livebench-aggregation -- --summary-only
pnpm weekly:dry-run
pnpm video:studio
pnpm video:still
pnpm video:render
pnpm video:artifacts
```

Both LiveBench ingestion commands capture the official Hub commit SHA before
fetching rows and bind that immutable revision to every staged evidence record.
`review:livebench-aliases` requires `LIVEBENCH_INGESTION_RUN_ID` and emits a
read-only deterministic JSON review queue; it never creates aliases.
`sync:livebench-aliases` transactionally ensures only the reviewed,
evidence-backed canonical identities in the versioned manifest.
`resolve:livebench-aliases` also requires `LIVEBENCH_INGESTION_RUN_ID` and
applies exact manifest-backed mapping or exclusion decisions to that run.
`verify:livebench-aliases` is read-only and proves that resolved rows have a
canonical variant while explicitly excluded rows do not. Publication remains
disabled until the remaining benchmark and coverage gates are complete.
`report:livebench-aggregation` requires the same ingestion-run variable and
builds a repeatable-read, read-only task/category readiness report. Omit
`--summary-only` to include deterministic per-model aggregates. Incomplete or
conflicting task/category scores remain null and the command never writes
published results or ranking snapshots.

`weekly:dry-run` is the one-command, non-formal weekly path. It builds required
workspace packages, reacquires pinned source evidence with bounded retries,
reuses an identical complete ingestion run, revalidates all aliases, reports
promotion/scoring diffs and renders deterministic preview artifacts. Its
versioned summary is `artifacts/weekly-orchestration.json`. Only the explicit
`pnpm weekly:apply-preview` variant can apply guarded result/snapshot changes
and activate a PREVIEW edition; neither command can request FORMAL publication.

`video:render` writes a 1920×1080 H.264 MP4 to `output/llm-bench-weekly.mp4`. `video:artifacts` writes deterministic metadata JSON and ranking CSV with the input snapshot ID and SHA-256. The Web and video defaults intentionally use the same clearly labeled fictional preview snapshot. Preview values must never be promoted to a published edition.

## Documentation

- [Product spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data methodology](docs/DATA_METHODOLOGY.md)
- [Scoring methodology](docs/SCORING_METHODOLOGY.md)
- [Source registry](docs/SOURCE_REGISTRY.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Video spec](docs/VIDEO_SPEC.md)
- [Operations and CI](docs/OPERATIONS.md)
- [Decisions](docs/DECISIONS.md)
- [Risks](docs/RISKS.md)
- [Progress](docs/PROGRESS.md)
- [Backlog](docs/BACKLOG.md)

## Data and attribution

External results remain owned by their publishers. The platform stores provenance, displays concise factual values, preserves attribution and links to the original source. It does not bypass authentication, paywalls, CAPTCHA or access controls.
