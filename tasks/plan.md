# Implementation Plan: LLM Bench Rebuild

> Status: Proposed for user review
> Date: 2026-07-16
> Requirements: `docs/REFACTOR_SPEC.md`
> Removal scope: `docs/REFACTOR_DISCARD_LIST.md`

## 1. Outcome

Build a new static-data product path inside the existing monorepo:

```text
eight real sources
→ source evidence and Candidate Results
→ frontier model resolution
→ simple eight-dimension scoring and cost data
→ immutable Draft product JSON
→ one responsive Dashboard Preview
→ human Published switch and rollback
```

The new path must not depend on PostgreSQL, Docker, the existing Worker, the old Web contracts, LiveBench-specific publication logic, or the old Edition system.

Data acquisition and the new frontend proceed in parallel after the shared JSON contract is fixed. Old code remains untouched until the new Published version is approved.

## 2. Proposed workspace boundaries

These names are planning defaults and may be adjusted before Task 1.1 without changing the architecture:

```text
apps/
  bench/                         new Next.js Dashboard
packages/
  benchmark-data/                schemas, identity, normalization, scoring, version builder
  acquisition/                   shared evidence and validation utilities
data-v2/
  sources/<source-id>/           source-owned manifests and parsed candidates
  mappings/                      versioned benchmark and display configuration
  versions/draft/                immutable Draft product JSON
  versions/published/            immutable Published product JSON
  pointers/                      draft and published version identifiers
artifacts-v2/                    Git-ignored content-addressed raw evidence
```

Each first-batch source owns a disjoint directory so acquisition work can run in parallel. Shared schemas, model identity, benchmark mappings, product-data generation and version pointers are orchestrator-owned and must be changed serially.

## 3. Dependency graph

```text
Refactor spec and discard list
        │
        ├── Benchmark mapping knowledge base
        │
        └── Shared JSON contracts and filesystem layout
                    │
          ┌─────────┴─────────┐
          │                   │
  Acquisition foundation   New Web shell
          │                   │
  ┌───────┼────────┐          ├── Leaderboard
  │       │        │          ├── Cost curve
  │       │        │          ├── Radar
 AA/LLM  TBench/  Epoch/      └── Evidence detail
 Stats   DeepSWE  LiveBench
          │
       Vals/OpenAI
          │
          └──────┬─────────────┘
                 │
       identity + Frontier Set
                 │
       scoring + product Draft
                 │
        browser and human review
                 │
       corrections and new Draft
                 │
      protected publish + rollback
                 │
       human Published approval
                 │
         old architecture removal
```

## 4. Delegation and ownership

- The orchestrating Codex agent owns shared schemas, architecture, integration, source-role policy, scoring boundaries and final acceptance.
- Before frontend implementation, route each bounded UI task according to the current `AGENTS.md`. The current default is Gemini 3.5 Flash for user-facing frontend work, subject to capability and acceptance-bar review.
- A frontend worker receives one isolated, self-contained contract and may only modify its assigned new-App paths.
- First-batch source investigations can run in parallel only after shared source schemas are fixed. Each worker owns different `data-v2/sources/<source-id>/` paths.
- Workers must not edit shared mappings, schemas, dependency manifests, root configuration or version pointers.
- The orchestrator reviews every diff and validates output against source-visible data.

## 5. Phase 1 — Shared foundation

### Task 1.1 — Create the Benchmark-to-dimension knowledge base

**Description:** Reassess current representative Benchmarks against their actual capability boundary and create the single-purpose mapping document required by the specification.

**Acceptance criteria:**

- `docs/BENCHMARK_DIMENSION_MAPPING.md` records one primary dimension, secondary relationships, rationale, limitations and common misclassification risks for each included current Benchmark.
- Deprecated, replaced or unclear legacy evaluations are excluded.
- The machine-readable mapping references the same canonical Benchmark IDs and assigns only one scoring dimension in v1.

**Verification:**

- Cross-check every first-batch source Benchmark against the document.
- Validate that all eight dimension identifiers are present and ordered correctly.
- Confirm the document contains no source status, acquisition state or weights.

**Dependencies:** None
**Likely paths:** `docs/BENCHMARK_DIMENSION_MAPPING.md`, `data-v2/mappings/benchmarks.json`
**Scope:** S

### Task 1.2 — Define versioned static-data contracts

**Description:** Create the schemas that separate source evidence, Candidate Results, normalized evidence, Model Profiles, Draft/Published product data and version pointers.

**Acceptance criteria:**

- Schemas cover field-level provenance, `FULL`/`PARTIAL_SOURCE`, Included/Excluded, source role, raw and normalized score, price type and evidence locator.
- Product data supports one representative Profile per model while retaining alternative Profiles.
- Unknown source fields may remain in raw evidence; unpublished fields remain `null`, never guessed.

**Verification:**

- RED/GREEN schema tests for valid full rows, valid partial-source rows, invalid missing-score rows and invalid cross-version pointers.
- Deterministic JSON serialization test.
- Package typecheck succeeds without importing old DB or Worker packages.

**Dependencies:** Task 1.1 for canonical dimensions and Benchmark IDs
**Likely paths:** `packages/benchmark-data/src/schema.ts`, `packages/benchmark-data/src/schema.test.ts`, package manifests
**Scope:** M

### Task 1.3 — Establish the new filesystem and artifact contract

**Description:** Implement path ownership, immutable version IDs, content hashes and the Git/Git-external evidence split.

**Acceptance criteria:**

- Small manifests/results live under `data-v2`; large raw evidence resolves through a content-addressed `artifacts-v2` index.
- A snapshot cannot reference missing evidence hashes when it is proposed for Draft.
- Existing files are never overwritten in place; identical content is reusable.

**Verification:**

- Unit tests cover path traversal rejection, missing artifact rejection, stable hashes and idempotent writes.
- `.gitignore` excludes large artifacts without excluding committed manifests/results.

**Dependencies:** Task 1.2
**Likely paths:** `packages/acquisition/src/artifacts.ts`, tests, `.gitignore`
**Scope:** M

### Checkpoint 1 — Contract freeze

- [ ] Benchmark mapping baseline is reviewable.
- [ ] JSON contracts and version paths are stable enough for parallel work.
- [ ] No new code imports PostgreSQL, Drizzle, Docker or old Worker modules.
- [ ] User reviews contract-level output before source/UI integration expands.

## 6. Phase 2 — Parallel acquisition and frontend skeleton

### Task 2.1 — Build acquisition validation utilities

**Description:** Provide shared utilities for manifests, raw evidence indexing, Candidate Result output and visible-data completeness reports without implementing source-specific policy.

**Acceptance criteria:**

- A source run emits raw evidence locators, parsed Candidate Results and a validation report.
- The report distinguishes structured-only rows, visible-only rows, value conflicts and display rounding.
- A run can be marked complete, partial or failed without changing Published data.

**Verification:**

- Fixture tests cover API JSON, embedded payload, DOM fallback and visual-field provenance.
- Reports are deterministic and schema-valid.

**Dependencies:** Tasks 1.2–1.3
**Likely paths:** `packages/acquisition/src/run.ts`, `validation.ts`, tests
**Scope:** M

### Task 2.2 — Acquire Artificial Analysis and LLM Stats

**Description:** Use Artificial Analysis for its current composite ranking and underlying independently measured evaluations; use LLM Stats only to discover frontier models and upstream evidence.

**Acceptance criteria:**

- Source manifests document the verified structured/DOM access path and completeness method.
- Artificial Analysis candidate data preserves composite index rows separately from underlying Benchmark rows.
- LLM Stats results are marked display/index-only and never become eight-dimension inputs.

**Verification:**

- Compare extracted Top-N model count and visible leaders with the live pages.
- Produce a human-review report with raw evidence locators and any missing visible rows.

**Dependencies:** Tasks 1.2–2.1
**Owned paths:** `data-v2/sources/artificial-analysis/`, `data-v2/sources/llm-stats/`
**Scope:** M

### Task 2.3 — Acquire Terminal-Bench and DeepSWE

**Description:** Capture current official coding/agentic leaderboard rows, Profiles, harnesses, dates and source evidence.

**Acceptance criteria:**

- Terminal-Bench 2.1 is distinct from legacy versions and retains agent, model, effort, date and cost fields when published.
- DeepSWE 1.1 is distinct from earlier versions and preserves its model Profile.
- Selected leaderboards are complete or explicitly emitted as partial without replacing a prior full snapshot.

**Verification:**

- Extracted row count and visible leaders match the pages.
- Candidate Results validate and link to exact evidence.

**Dependencies:** Tasks 1.2–2.1
**Owned paths:** `data-v2/sources/terminal-bench/`, `data-v2/sources/deepswe/`
**Scope:** M

### Task 2.4 — Acquire Epoch AI and LiveBench

**Description:** Capture current frontier-relevant Epoch internal runs and the current LiveBench release without rebuilding the old judgment pipeline.

**Acceptance criteria:**

- Epoch rows distinguish internal runs from benchmark-creator, vendor or reposted results.
- LiveBench uses the current displayed release and categories, not the pinned historical judgment inventory.
- Current and legacy Benchmark versions are not merged.

**Verification:**

- Compare extracted current models/categories with the visible sites.
- Confirm no imports from old LiveBench connectors or Worker code.

**Dependencies:** Tasks 1.2–2.1
**Owned paths:** `data-v2/sources/epoch-ai/`, `data-v2/sources/livebench/`
**Scope:** M

### Task 2.5 — Acquire Vals AI and OpenAI

**Description:** Capture Vals independently run Benchmarks and OpenAI vendor-reported GPT-5.6 results plus official identity and pricing data.

**Acceptance criteria:**

- Vals proprietary Benchmarks and third-party implementations retain the correct per-result role.
- OpenAI rows include only OpenAI model values; third-party-run values link back to the actual evaluator.
- GPT-5.6 Sol/Terra/Luna Profiles and pricing are not merged.

**Verification:**

- Compare visible current model/date values and Benchmark names with the source pages.
- Produce a report of fields available only in visual/PDF evidence.

**Dependencies:** Tasks 1.2–2.1
**Owned paths:** `data-v2/sources/vals-ai/`, `data-v2/sources/openai/`
**Scope:** M

### Task 2.6 — Create the new Web App shell

**Description:** Delegate a clean Next.js App skeleton that reads versioned static product data and implements the single-page responsive layout without importing old Web modules.

**Acceptance criteria:**

- New App builds from an empty schema-valid product data file and later accepts the first real Draft unchanged.
- The page contains defined regions for Leaderboard, cost curve, radar and evidence detail.
- Draft mode is visibly labelled and carries noindex metadata; Published mode uses the same UI.

**Verification:**

- Production build succeeds.
- Browser checks at representative desktop and mobile widths show no overflow.
- Diff review confirms no dependency on `@llm-bench/db`, old Web repositories or old Edition contracts.

**Dependencies:** Task 1.2
**Likely paths:** new `apps/bench/` only, plus its package manifest
**Scope:** M per delegated slice

### Task 2.7 — Implement the Leaderboard interaction

**Description:** Add representative-Profile rows, search/selection, Estimated state and eight-dimension columns using only the new product contract.

**Acceptance criteria:**

- Each base model occupies one default row; alternative Profiles remain accessible.
- Models with at least one dimension score can appear as Estimated.
- Missing dimensions display N/A and never become zero.

**Verification:**

- Component tests cover full, sparse and partial-source models.
- Keyboard selection and mobile table behavior pass browser checks.

**Dependencies:** Task 2.6
**Owned paths:** bounded Leaderboard component paths inside `apps/bench/`
**Scope:** M

### Task 2.8 — Implement Quality vs. Cost

**Description:** Add a responsive chart that separates standardized API cost from measured task cost and does not fabricate incomparable prices.

**Acceptance criteria:**

- The main series contains only comparable standardized API task costs.
- Measured task cost is a separate view/series with an explicit cost type.
- Profile selection is shared with the Leaderboard.

**Verification:**

- Tests cover missing price, multiple Profiles and non-API Agent products.
- Chart has a table/text equivalent and responsive containment.

**Dependencies:** Task 2.6 and cost fields from Task 1.2
**Owned paths:** bounded cost-chart component paths inside `apps/bench/`
**Scope:** M

### Task 2.9 — Implement radar and evidence detail

**Description:** Add the eight-dimension Category Profile and the Included/Excluded evidence table used for data QA.

**Acceptance criteria:**

- Radar preserves the fixed dimension order and represents missing values without plotting them as zero.
- Evidence rows show Benchmark/version, raw/normalized score, role, Profile, URL, status, weight and exclusion reason.
- Selecting a model or dimension updates both views consistently.

**Verification:**

- Tests cover sparse axes, long names, Included/Excluded and `PARTIAL_SOURCE`.
- Keyboard, screen-reader and mobile equivalents pass.

**Dependencies:** Tasks 2.6–2.7
**Owned paths:** bounded radar/evidence component paths inside `apps/bench/`
**Scope:** M

### Checkpoint 2 — Parallel outputs ready

- [ ] Eight source attempts have evidence and validation reports.
- [ ] New frontend shell and three views build independently of the old system.
- [ ] Source workers have not edited shared contracts or each other's paths.
- [ ] No source result is Published.

## 7. Phase 3 — Integration into the first real Draft

### Task 3.1 — Resolve model identities and Profiles

**Description:** Normalize source-local identities into base models and explicit Profiles without fuzzy automatic merges.

**Acceptance criteria:**

- Source aliases map to one reviewed model/Profile or remain unresolved.
- Effort, tools, harness, context and provider endpoint differences remain separate.
- Agent products are not collapsed into their underlying model.

**Verification:**

- Tests cover GPT-5.6 Profiles, vendor/API aliases and Agent systems.
- Unresolved identities do not disappear from validation reports.

**Dependencies:** Tasks 2.2–2.5
**Likely paths:** `packages/benchmark-data/src/identity.ts`, tests, `data-v2/mappings/models.json`
**Scope:** M

### Task 3.2 — Build the dynamic Frontier Set

**Description:** Merge each credible composite ranking's available Top 20 after base-model deduplication, then add manually specified new models.

**Acceptance criteria:**

- Sources with fewer than 20 eligible models contribute only their actual count.
- Multiple Profiles consume one frontier slot per base model.
- Composite scores remain selection/display data and do not enter dimension scoring.

**Verification:**

- Deterministic union tests cover overlapping rankings and short leaderboards.
- Report lists every included model and its inclusion reason.

**Dependencies:** Tasks 2.2, 2.5 and 3.1
**Likely paths:** `packages/benchmark-data/src/frontier.ts`, tests, generated report
**Scope:** M

### Task 3.3 — Normalize Benchmark results and source precedence

**Description:** Convert eligible current Benchmark rows to 0–100 where a documented transform exists and select the current result using source precedence.

**Acceptance criteria:**

- Raw score and transform metadata remain available.
- Main-dimension-only mapping is enforced.
- Higher-priority complete values replace lower-priority or partial values; prior evidence remains visible.

**Verification:**

- Tests cover percentage metrics, display-only non-comparable metrics, vendor-to-independent replacement and complete-over-partial replacement.
- No current-cohort percentile or dynamic min-max transform exists.

**Dependencies:** Tasks 1.1, 3.1–3.2
**Likely paths:** `packages/benchmark-data/src/normalize.ts`, `select.ts`, tests
**Scope:** M

### Task 3.4 — Generate dimension, overall and cost outputs

**Description:** Produce simple configurable dimension weighted means, Estimated overall scores and comparable cost points for the Frontier Set.

**Acceptance criteria:**

- Missing Benchmarks renormalize available weight and never count as zero.
- At least one mapped dimension permits an Estimated overall score.
- Cost outputs preserve distinct cost types and public assumptions.

**Verification:**

- Tests cover one-axis new models, sparse eight-axis data, missing prices and multiple Profiles.
- Sensitivity/output report shows components and weights used for each result.

**Dependencies:** Task 3.3 and acquired pricing data
**Likely paths:** `packages/benchmark-data/src/score.ts`, `cost.ts`, tests
**Scope:** M

### Task 3.5 — Build the first immutable Draft product version

**Description:** Assemble source summaries, models, Profiles, rankings, cost points, radar values and evidence rows into one static product data version.

**Acceptance criteria:**

- Draft content hash binds exact Candidate Results, mappings and builder version.
- Every displayed score traces to evidence and Included/Excluded components.
- The version is immutable and the Draft pointer can switch without changing content.

**Verification:**

- Two identical builds are byte-stable.
- Schema and evidence-reference validation pass.
- New `apps/bench` renders the real Draft without hand edits.

**Dependencies:** Tasks 3.1–3.4 and 2.7–2.9
**Likely paths:** product builder, `data-v2/versions/draft/<id>.json`, pointer file
**Scope:** M

### Checkpoint 3 — First real Preview

- [ ] Preview uses the real Draft, not fictional model scores.
- [ ] Leaderboard, curve, radar and evidence table agree on selected Profiles.
- [ ] Human-visible source row counts and extracted counts are available for review.
- [ ] User reviews the Preview and reports data/UI mismatches.

## 8. Phase 4 — Empirical correction loop

### Task 4.1 — Perform source-to-UI visual audit

**Description:** Compare each source page and its raw evidence with the Draft UI, prioritizing missing rows, incorrect Profiles, stale Benchmarks and unexpected rankings.

**Acceptance criteria:**

- Each first-batch source has an explicit pass/fail and visible-vs-extracted comparison.
- Every suspicious UI value links to its Candidate Result and raw evidence.
- Findings distinguish acquisition, identity, mapping, normalization and presentation defects.

**Verification:**

- Browser screenshots and validation reports are attached to the Draft review artifact.
- No issue is closed solely because schema validation passed.

**Dependencies:** Checkpoint 3
**Scope:** M

### Task 4.2 — Correct acquisition and mapping defects

**Description:** Repair source methods, manifests, model identities or Benchmark mappings identified by real-page review; Agent may merge acquisition-rule fixes.

**Acceptance criteria:**

- Corrected runs produce new immutable snapshots and a new Draft.
- New values directly replace prior current values while history remains traceable.
- Fixes do not modify Published data.

**Verification:**

- Before/after row and field diffs are recorded.
- Source-visible leaders and relevant target models match after correction.

**Dependencies:** Task 4.1
**Scope:** M per source defect

### Task 4.3 — Correct UI interpretation and responsive defects

**Description:** Repair misleading labels, profile presentation, chart scaling, evidence navigation and mobile/desktop issues found during human review.

**Acceptance criteria:**

- Estimated, partial, cost type and missing data cannot be mistaken for supported complete values.
- The same Draft data produces consistent values across all three views.
- Desktop and mobile remain usable with the real model/Benchmark volume.

**Verification:**

- Production browser tests, accessibility scan and manual responsive review pass.
- Frontend worker changes receive orchestrator diff review.

**Dependencies:** Task 4.1
**Scope:** M per bounded UI defect

### Checkpoint 4 — Publish candidate

- [ ] User confirms the corrected Draft numbers are sufficient to publish.
- [ ] Known deviations are visible rather than hidden.
- [ ] No unresolved defect is capable of switching the wrong data version.

## 9. Phase 5 — Protected publication

### Task 5.1 — Implement Draft, Published and rollback commands

**Description:** Add a simple CLI or protected workflow that switches immutable version pointers without re-fetching or recalculating.

**Acceptance criteria:**

- Only an explicit human action can switch Published.
- Publish records actor, timestamp, prior version and target version.
- Rollback restores a prior Published version atomically.

**Verification:**

- Integration test performs Draft → Published A → Published B → rollback A.
- Failed validation leaves the Published pointer unchanged.

**Dependencies:** Task 3.5
**Likely paths:** bounded CLI/pointer implementation and tests
**Scope:** M

### Task 5.2 — Configure restricted Draft Preview

**Description:** Ensure Draft is available at a restricted/noindex Preview while Published remains the public build input.

**Acceptance criteria:**

- Draft pages are visibly labelled and cannot be indexed.
- Published and Draft render through the same App and product schema.
- Production cannot select Draft implicitly.

**Verification:**

- Browser checks inspect labels, metadata and selected version IDs.
- Build commands demonstrate explicit Draft and Published inputs.

**Dependencies:** Tasks 2.6 and 5.1
**Scope:** M

### Task 5.3 — Replace CI with the new static-data gate

**Description:** Remove DB/video requirements from the new-path CI and validate schemas, data builder, new frontend, browser behavior and dependency security.

**Acceptance criteria:**

- CI does not start PostgreSQL or use Docker.
- CI validates committed Candidate Results, mappings, Draft/Published pointers and production build.
- Browser gates cover the real static fixture/version without DB seeding.

**Verification:**

- The new CI-equivalent chain passes locally.
- GitHub workflow succeeds without `DATABASE_URL`.

**Dependencies:** Tasks 3.5, 5.1–5.2
**Scope:** M per CI slice

### Checkpoint 5 — Human Published approval

- [ ] User performs or explicitly approves the Published switch.
- [ ] The public build shows the exact reviewed Draft hash.
- [ ] Rollback is demonstrated.
- [ ] This checkpoint authorizes old-system removal.

## 10. Phase 6 — Cutover and removal

### Task 6.1 — Prove zero new-path dependency on legacy packages

**Description:** Run import, command, route and build analysis before deleting anything.

**Acceptance criteria:**

- New App and data workspace do not import old Web, Worker, DB or LiveBench-specific modules.
- Root commands needed by the new path are identified.
- Any reusable code is already extracted into new-owned paths.

**Verification:**

- Dependency graph and `rg` report are attached.
- New production build succeeds with legacy packages temporarily excluded from the workspace graph.

**Dependencies:** Checkpoint 5
**Scope:** S

### Task 6.2 — Remove old Web

**Description:** Delete `apps/web`, its DB fixture, routes and old browser tests after the new App owns production.

**Acceptance criteria:**

- Workspace and root E2E commands target the new App.
- No old locale, Edition, pipeline, source or API routes remain.
- The new App production build and browser tests still pass.

**Verification:**

- Workspace package discovery no longer includes the old Web package.
- New App build and browser suite pass after deletion.

**Dependencies:** Task 6.1
**Scope:** Mechanical M

### Task 6.3 — Remove old Worker and LiveBench publication path

**Description:** Delete `apps/worker` and the old alias, revision, aggregation, promotion, scoring and Edition orchestration.

**Acceptance criteria:**

- No root command references the old Worker.
- LiveBench remains represented only through the new source path.
- New acquisition and Draft generation tests pass.

**Verification:**

- `rg` finds no root or package reference to `@llm-bench/worker`.
- A fresh source run and Draft build pass without the old Worker.

**Dependencies:** Task 6.1
**Scope:** Mechanical M

### Task 6.4 — Remove PostgreSQL, Drizzle and Docker

**Description:** Delete `packages/db`, migrations, Compose, DB scripts and environment assumptions.

**Acceptance criteria:**

- Repository contains no product dependency on PostgreSQL, Drizzle, Docker, Compose or `DATABASE_URL`.
- `pnpm install`, development, build and tests work without Docker.
- Lockfile no longer retains dependencies used only by the removed DB package.

**Verification:**

- Dependency and text scans show no supported-path DB/Docker reference.
- Clean install, tests and production build pass on a host without Docker.

**Dependencies:** Tasks 6.2–6.3
**Scope:** Mechanical M

### Task 6.5 — Remove obsolete Connector, scoring and presentation code

**Description:** Delete old LiveBench Connector code and any old shared package code not explicitly reused by the new path.

**Acceptance criteria:**

- `packages/connectors` no longer contains the historical LiveBench pipeline.
- Old formal coverage/confidence and Edition DTOs are absent.
- Any retained radar/artifact utility is owned and tested by the new architecture.

**Verification:**

- Package graph contains only new-path shared packages.
- Focused scoring, artifact and acquisition tests pass after cleanup.

**Dependencies:** Tasks 6.1, 6.3–6.4
**Scope:** Mechanical M per package

### Task 6.6 — Remove or re-scope video

**Description:** Since video is outside the MVP and tied to the old Edition system, remove it unless the user explicitly reintroduces it before cutover.

**Acceptance criteria:**

- Default action: delete `apps/video`, Remotion-only dependencies, commands, CI steps and docs.
- No new contract retains Edition/video compatibility.
- If retained by explicit user decision, it must consume Published static JSON through a separately approved plan.

**Verification:**

- Default path: workspace and lockfile contain no Remotion-only package or command.
- Full production build and CI pass without video artifacts.

**Dependencies:** Checkpoint 5
**Scope:** Mechanical M

### Task 6.7 — Rewrite authoritative documentation

**Description:** Make README, architecture, data methodology, scoring methodology, operations and decisions reflect the shipped new system.

**Acceptance criteria:**

- Old PostgreSQL, Docker, Worker, Edition, bilingual and dual-theme instructions are removed.
- Historical decisions are marked superseded rather than silently rewritten.
- Clean setup, acquisition, Draft preview, publish and rollback commands are documented.

**Verification:**

- Documentation link and command checks pass.
- A clean-environment walkthrough follows only documented supported commands.

**Dependencies:** Tasks 6.2–6.6
**Scope:** M per document group

### Checkpoint 6 — Final cutover

- [ ] No legacy application path remains active.
- [ ] Full install, lint, typecheck, tests, build and browser gates pass.
- [ ] Published static data renders without network, artifact, DB or Docker availability.
- [ ] Documentation and commands describe only the supported system.

## 11. Risks and mitigations

| Risk                                                        | Impact | Mitigation                                                                         |
| ----------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| Agent extracts fewer rows than a human can see              | High   | Mandatory visible-vs-extracted reports and Draft UI review                         |
| Shared schema changes while source/UI work runs in parallel | High   | Freeze Task 1.2 before delegation; orchestrator owns shared contracts              |
| Composite scores are double-counted                         | High   | Keep composite metrics selection/display-only                                      |
| Profile aliases inflate or merge rankings incorrectly       | High   | Explicit Profile identity; unresolved aliases remain visible                       |
| Early sparse data creates misleading ranks                  | Medium | Estimated, evidence detail and missing-value display; human Draft gate             |
| Frontend uses a convenient but wrong fixture contract       | High   | Empty contract fixture only until first real Draft in the same phase               |
| Legacy deletion removes needed utility code                 | Medium | Extract and test reusable pure code before Task 6.1 zero-dependency gate           |
| Old architecture lingers indefinitely                       | High   | Published approval explicitly triggers compulsory removal tasks                    |
| Source site changes during implementation                   | Medium | Agent may repair and merge manifests/connectors; data remains Draft                |
| Planning drifts into premature automation                   | Medium | Uniform schedule and simple rules; postpone empirical questions listed in the spec |

## 12. Open questions reserved for empirical iteration

These are not blockers for implementation planning:

- Exact Supported threshold
- Final Benchmark weights
- Final standardized token-use assumption
- Best representative-Profile selection
- Per-source schedule optimization
- Advanced conflict/confidence policy
- Need for a future management UI

## 13. Plan acceptance

Implementation must not begin until the user reviews this plan and confirms:

- workspace boundaries are acceptable;
- the parallel source/UI split matches expectations;
- first real Draft and human Published checkpoints are correctly placed;
- old-system deletion remains after Published approval.
