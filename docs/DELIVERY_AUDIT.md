# Delivery Audit

Audit date: 2026-07-15

Completion boundary: complete local v1 product; formal production deployment and
publication of source-incomplete rankings remain protected operator actions.

## Outcome

The required vertical slice is runnable and source-backed:

```text
official revision-pinned LiveBench artifacts
→ content-addressed raw evidence
→ 60,372 staged judgments
→ 58,233 reviewed canonical rows + 2,139 explicit exclusions
→ 737 complete, conflict-free published task results
→ 1,216 null-preserving dimension rows
→ immutable 152-model ranking snapshot
→ active PREVIEW edition
→ bilingual Web radar/detail/compare pages
→ deterministic poster, metadata, CSV and H.264 MP4
```

The product is complete without claiming that incomplete evidence is a formal
ranking. All 152 models remain `UNRANKED`, missing dimensions remain null and the
formal edition guard rejects this snapshot. That is the intended safe outcome,
not a failed publication.

## Clean-environment evidence

The acceptance run used a newly created `llm_bench_acceptance` PostgreSQL
database, not the development or browser-fixture database.

| Stage              | Verified result                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install            | `pnpm install --frozen-lockfile` passed with pnpm 11.7.0                                                                                                |
| Database           | All committed migrations applied; 8 dimensions, 2 themes, 18 LiveBench metrics and 18 mappings seeded                                                   |
| Question evidence  | 1,436 source rows selected into 1,000 observations across 18 tasks; evidence SHA-256 `b8a90d2f…027`                                                     |
| Judgment ingestion | 60,372/60,372 rows accepted from official revision `9704e5d…993`; raw SHA-256 `35ad896…182a`                                                            |
| Identity           | 166 source aliases fully adjudicated: 157 canonical mappings and 9 explicit exclusions; 58,233 rows resolved, 2,139 excluded, zero unresolved/ambiguous |
| Promotion          | 737 complete conflict-free task results inserted; 2,014 incomplete and 39 conflicting task aggregates stayed blocked                                    |
| Scoring            | 1,216 ordered dimension rows and 152 eligibility rows created; zero missing values imputed                                                              |
| Snapshot           | `019f6419-908c-7350-b6c6-5d42e043ddd7`, content SHA-256 `68cd936…fd4`, 152 deliberately unranked entries                                                |
| Edition            | `019f6419-90a3-7128-86cc-4f1cfa9c8bf1` activated as `PREVIEW`; repeat run returned activation `NOOP`                                                    |
| Weekly retry       | First run exposed an edition-render stdout defect; the root cause was fixed and the complete retry returned `SUCCEEDED` with ingestion/snapshot reuse   |
| Poster             | Snapshot-bound PREVIEW poster SHA-256 `a6316e4…584`, emitted with metadata, CSV and structured render log                                               |
| Video              | 600-frame 1920×1080 H.264 MP4 rendered twice with identical SHA-256 `376d4b0…a430`                                                                      |
| Web                | Production server returned data status `READY`, 737 published results and the same 152-entry active PREVIEW snapshot                                    |
| Browser            | Real-data zh-TW home/model and en compare pages had zero console warnings/errors; compare LCP 52 ms, CLS 0.00                                           |

Generated acceptance media is intentionally ignored under
`output/video/2026-07-15/019f6419-908c-7350-b6c6-5d42e043ddd7/`. It can be
regenerated from the immutable snapshot with the command below.

## Minimum-delivery reconciliation

| Required item                      | Status and evidence                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Runnable website                   | PASS — Next.js production build and real-data Chrome acceptance                |
| PostgreSQL schema/migrations       | PASS — Drizzle schema and committed migration                                  |
| One real external ingestion        | PASS — official LiveBench revision-pinned Parquet path                         |
| Remaining connector states/todos   | PASS — `SOURCE_REGISTRY.md` and the source table below                         |
| Raw/staging/published layers       | PASS — content-addressed artifacts and separate database entities              |
| Alias/version handling             | PASS — exhaustive 166-alias manifest and versioned variants                    |
| Eight-axis scoring                 | PASS — fixed axis order, mappings, coverage and confidence                     |
| Absolute Capability Score          | PASS — versioned `absolute-capability-v1`; currently withheld by coverage gate |
| Ranking snapshot                   | PASS — immutable, content-hashed and reproducible                              |
| Interactive eight-axis radar       | PASS — shared accessible SVG/table presentation contract                       |
| Google-/Apple-inspired themes      | PASS — all-light Editorial/Studio implementations share geometry               |
| Model comparison                   | PASS — 2–5 ordered models in a validated shareable URL                         |
| Benchmark/source/methodology pages | PASS — bilingual, database-backed or durable reviewed policy                   |
| Programmatic video preview         | PASS — Remotion poster/video from persisted edition data                       |
| Successful demo video              | PASS — deterministic 600-frame MP4 evidence above                              |
| Weekly pipeline                    | PASS — scheduled/manual dry-run plus explicit apply-preview path               |
| Tests                              | PASS — 248 unit/integration tests and 25 Chromium gates                        |
| README and environment example     | PASS — empty-environment steps and `.env.example`                              |
| One-command local start            | PASS — `pnpm local:up` starts DB, Web and worker watcher                       |
| Data/scoring limitations           | PASS — methodology, source, risk and live PREVIEW labels                       |
| No hard-coded production ranking   | PASS — fixtures are reserved, visibly fictional and rejected by formal guards  |

## Fifteen acceptance criteria

All criteria pass at the local v1 boundary. `PREVIEW` is never described as a
formal published ranking.

1. **PASS — score-to-raw traceability.** Every materialized dimension stores its
   component result IDs; model detail pages expose the task result and primary
   evidence hash/link.
2. **PASS — complete provenance.** Results bind source snapshot, metric,
   benchmark version and evaluation config; raw artifacts are revision- and
   SHA-256-bound.
3. **PASS — metric semantics.** Percentage, rank, Elo and lower-is-better values
   cross typed normalization policies; incompatible metrics are not averaged as
   raw numbers.
4. **PASS — missing values.** Missing axes remain null/N/A and coverage-gated;
   zero imputation is prohibited and tested.
5. **PASS — effort/snapshot separation.** Canonical variant identity includes
   version/effort distinctions and exact evidence-backed alias decisions.
6. **PASS — latest ranking update.** Web reads only the database-enforced active
   edition pointer and its immutable snapshot; no date heuristic overrides it.
7. **PASS — theme invariance.** Theme is presentation-only URL state; shared
   geometry/value contracts are unchanged.
8. **PASS — desktop/mobile readability.** 390/1440 Chromium tests, axe scans and
   real-data Chrome containment pass; the hidden-table overflow regression is
   guarded.
9. **PASS — shared Web/video snapshot.** Edition video and Web both resolve the
   same validated ranking repository assembly and snapshot ID.
10. **PASS — reproducibility.** Identical inputs reuse the same snapshot content
    hash and produced the same MP4 SHA-256 twice.
11. **PASS — safe weekly dry-run.** Default weekly operation cannot activate an
    edition; source failures are isolated and leave the previous pointer intact.
12. **PASS — quality gates.** Formatting, zero-warning lint, strict types, DB
    integration tests, production build, Chromium, audit and Remotion pass.
13. **PASS — empty-environment documentation.** README starts with frozen install
    and `pnpm local:up`, then documents real ingestion through rollback/video.
14. **PASS — public methodology.** Both locale routes explain normalization,
    weights, nulls, mappings, eligibility, source trust and limitations.
15. **PASS — quality labels.** PREVIEW, PROVISIONAL, INSUFFICIENT_DATA,
    LOW_COVERAGE, stale and source-classification flags remain explicit in
    contracts and relevant UI/operational reports.

## Source and connector status

| Source              | State       | v1 use                                                                                                         |
| ------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| LiveBench           | READY       | Automated official ingestion, promotion and scoring; formal ranking blocked by incomplete/conflicting evidence |
| Scale Labs          | RESEARCHING | Local reference only; terms/live parser verification pending                                                   |
| Artificial Analysis | RESEARCHING | Disabled pending approved structured access and terms                                                          |
| Epoch AI            | RESEARCHING | Disabled pending structured access/license review                                                              |
| Snorkel             | RESEARCHING | Disabled pending leaderboard/methodology research                                                              |
| FrontierSWE         | RESEARCHING | Disabled pending official format/license review                                                                |
| Vals AI             | RESEARCHING | Disabled pending access/terms review                                                                           |
| Agents' Last Exam   | RESEARCHING | Disabled pending official data access review                                                                   |
| DeepSWE             | RESEARCHING | Disabled pending official result/license review                                                                |
| Manual import       | PLANNED     | Contract/backlog only; future rows must be validated and always provisional until review                       |
| BenchLM             | DISABLED    | Information-architecture reference only; never a scoring source                                                |

## Operator commands

```bash
# One-command local environment
pnpm local:up

# Weekly safe preview
pnpm weekly:dry-run
pnpm weekly:apply-preview

# Explicit scoring/publication plans and guarded writes
pnpm score:livebench
pnpm score:livebench -- --apply
pnpm edition -- --activate-snapshot <uuidv7> --mode formal
pnpm edition -- --activate-snapshot <uuidv7> --mode formal --apply
pnpm edition -- --rollback-edition YYYY-MM-DD --actor <name>
pnpm edition -- --rollback-edition YYYY-MM-DD --actor <name> --apply

# Persisted-edition media
pnpm video:edition -- --edition <uuidv7> --locale zh-TW --theme editorial --top 5 --media poster
pnpm video:edition -- --edition <uuidv7> --locale zh-TW --theme editorial --top 5 --media video
```

## Quality and release evidence

- Local gate: Prettier, ESLint, 9-package strict types, migrations, 248
  unit/integration tests, canonical seed, 9-package production build, 25
  Chromium tests, high-severity audit, Remotion still and artifact export.
- Browser accessibility/security: automated WCAG A/AA scans, nonce CSP, bounded
  response/performance tests, security headers and zero real-data console noise.
- Dependency audit: no high/critical advisories; two bounded moderate transitive
  advisories remain documented in `RISKS.md`.
- GitHub Actions: SHA-pinned least-privilege CI repeats database, browser, audit
  and render gates on every complete pushed batch. The scheduled workflow is
  dry-run-only and does not run on ordinary pushes.

## Known limitations and next priorities

1. Formal LiveBench publication remains blocked by 201 conflicting canonical
   observation keys and incomplete six-category evidence. No precedence is
   invented from timestamp, row order or alias spelling.
2. Historical official judgment evidence expands source-level coverage to
   800/1,000 observations but is not composed into per-model scores until a
   source-backed revision policy exists.
3. Scale Labs and other requested sources remain research/manual states; their
   absence does not weaken the completed first-source vertical slice.
4. Formal deployment, production secrets, protected GitHub Environment approval,
   domain purchase and alert destination provisioning are external operations,
   not silently performed by this repository.

## Architecture and decisions

The monorepo separates Web, worker and video applications from contracts,
database, connectors, scoring, radar and presentation packages. PostgreSQL owns
canonical/published state; raw bytes remain content-addressed. Snapshot and
edition pointers are immutable/transactional boundaries shared by Web and video.

Key ADRs are DEC-005 (no imputation), DEC-010 (exhaustive aliases), DEC-011
(source-bounded mapping), DEC-013 (immutable incomplete snapshots), DEC-014
(pointer-only rollback), DEC-021 (edition-bound video), DEC-022 (safe weekly
automation), DEC-023 (browser/CSP gate), DEC-024 (command-driven worker) and
DEC-025 (native accessible controls and semantic CSS).

The final delivery batch adds or updates `README.md`, `docs/DELIVERY_AUDIT.md`,
`docs/PROGRESS.md`, `docs/DESIGN_SYSTEM.md`, `docs/DECISIONS.md`,
`docs/SOURCE_REGISTRY.md`, `tasks/plan.md` and `tasks/todo.md`. The preceding
tested fix batch changed only the Remotion stdout boundary, its regression test,
the `srOnly` containment CSS and the responsive E2E assertion.
