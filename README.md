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
```

Application, ingestion, scoring and video commands will be added with their corresponding vertical slices rather than exposed before they work.

## Documentation

- [Product spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data methodology](docs/DATA_METHODOLOGY.md)
- [Scoring methodology](docs/SCORING_METHODOLOGY.md)
- [Source registry](docs/SOURCE_REGISTRY.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Video spec](docs/VIDEO_SPEC.md)
- [Decisions](docs/DECISIONS.md)
- [Risks](docs/RISKS.md)
- [Progress](docs/PROGRESS.md)
- [Backlog](docs/BACKLOG.md)

## Data and attribution

External results remain owned by their publishers. The platform stores provenance, displays concise factual values, preserves attribution and links to the original source. It does not bypass authentication, paywalls, CAPTCHA or access controls.
