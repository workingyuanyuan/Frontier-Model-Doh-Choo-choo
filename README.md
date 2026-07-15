# LLM Bench Radar

A bilingual, traceable LLM benchmark ranking platform that produces an interactive eight-axis website and deterministic weekly videos from the same immutable ranking snapshot.

## Current status

The local v1 product is complete: one command starts PostgreSQL, the Web app and
the command-driven worker development process; the official LiveBench path runs
from immutable raw evidence through staging, reviewed aliases, task-result
publication, null-safe scoring, an active PREVIEW edition, the Web radar and a
snapshot-bound video. Formal publication remains fail-closed because the
available official evidence does not satisfy the documented coverage and
conflict gates. Files in `reference-table-data/` are local Scale Labs research,
not verified production data, and are intentionally excluded from Git.

## Requirements

- Node.js 24+
- pnpm 11+
- Docker Desktop with Compose
- Chrome for DevTools/E2E verification

## Start from an empty environment

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm local:up
```

On PowerShell, use `Copy-Item .env.example .env` instead of `cp`. `local:up`
starts and waits for PostgreSQL, applies committed migrations, idempotently
seeds canonical configuration, builds the worker, then starts Next.js and the
worker TypeScript watch process. Open <http://localhost:3000>. Stop the foreground
command with `Ctrl+C`; stop PostgreSQL later with `pnpm db:down`.

The canonical seed intentionally contains no fabricated ranking. Until a real
edition is activated, the homepage displays its clearly labelled fictional
design fixture. In a second terminal, create the real data-backed PREVIEW path:

```bash
pnpm weekly:apply-preview
```

This reacquires the revision-pinned LiveBench artifacts, preserves raw evidence,
stages and resolves all reviewed aliases, promotes only complete conflict-free
task results, scores without imputing missing axes, creates or reuses an
immutable snapshot, activates a PREVIEW edition and renders its poster bundle.

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

## Data, publication and video commands

```bash
pnpm local:up
pnpm ingest:livebench
pnpm ingest:livebench:all
pnpm review:livebench-aliases
pnpm sync:livebench-aliases
pnpm resolve:livebench-aliases
pnpm verify:livebench-aliases
pnpm report:livebench-aggregation -- --summary-only
pnpm weekly:dry-run
pnpm weekly:apply-preview
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
fail-closed until the remaining benchmark and coverage gates are complete.
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

Render a persisted edition with the same snapshot assembly used by the Web app:

```bash
pnpm video:edition -- --edition <uuidv7> --locale zh-TW --theme editorial --top 5 --media poster
pnpm video:edition -- --edition <uuidv7> --locale zh-TW --theme editorial --top 5 --media video
```

Formal activation re-runs every publication guard and therefore rejects the
currently incomplete LiveBench snapshot without writing. A reviewed future
snapshot can be planned and applied explicitly; rollback only switches the
active pointer to an immutable prior edition:

```bash
pnpm edition -- --activate-snapshot <uuidv7> --mode formal
pnpm edition -- --activate-snapshot <uuidv7> --mode formal --apply
pnpm edition -- --rollback-edition YYYY-MM-DD --actor <name>
pnpm edition -- --rollback-edition YYYY-MM-DD --actor <name> --apply
```

`video:render` writes a 1920×1080 H.264 MP4 from the bounded preview fixture.
`video:artifacts` writes deterministic metadata JSON and ranking CSV with its
input snapshot ID and SHA-256. Fixture values never enter the publication path.

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
