# Implementation Plan: LiveBench Release Inventory

## Overview

Replace the judgment-derived three-category denominator with a source-backed
question inventory for one explicit LiveBench release. The first increment
implements and verifies the deterministic selection contract used by the
official LiveBench loader. It does not choose among conflicting judgments and
does not write any publication table.

## Verified Source Rules

- LiveBench stores the six benchmark categories in separate official Hugging
  Face question datasets.
- The official result path selects the configured release and all earlier
  releases, then excludes a question when its removal date is on or before the
  selected release.
- The official loader rejects duplicate question IDs.
- LiveBench documents `2024-11-25` as the most recent public release that
  covers every category in the April 2025 data generation.

Sources:

- https://github.com/LiveBench/LiveBench/blob/main/livebench/common.py
- https://github.com/LiveBench/LiveBench/blob/main/livebench/show_livebench_result.py
- https://github.com/LiveBench/LiveBench
- https://huggingface.co/livebench

## Architecture Decisions

- Put source row validation and release selection in the connectors package;
  keep database and aggregation concerns out of the source boundary.
- Accept only the six known categories, 64-character canonical question IDs,
  bounded turn arrays and ISO calendar dates.
- Treat the configured release list as an explicit versioned input. Do not
  infer a release from timestamps or from the judgment artifact.
- Produce stable category/task/question ordering and one inventory observation
  per turn.
- Reject duplicate question IDs even when the duplicate rows are identical.
- Keep conflicting judgment observations blocked; release filtering is not a
  judgment winner-selection policy.

## Task List

### Phase 1: Pure Release Contract

- [x] Add RED tests for inclusive release selection, removal boundaries,
      multi-turn expansion, stable ordering and duplicate rejection.
- [x] Implement strict source-row parsing and deterministic selection.
- [x] Export the contract from the connectors package.

### Checkpoint: Pure Logic

- [x] Focused tests pass and demonstrate RED-to-GREEN behavior.
- [x] Connector type checking and lint pass.
- [x] Five-axis review finds no correctness, architecture, security,
      performance or maintainability blocker.

### Phase 2: Source Acquisition (next increment)

- [x] Pin the revision and test-split Parquet path of each of the six official
      question datasets.
- [x] Fetch only the inventory fields under explicit byte/row/origin limits.
- [x] Persist immutable evidence and bind all six revisions to one inventory.
- [x] Measure the real `2024-11-25` category/task/question denominator.

Verified acquisition design:

- The Hub `/rows` and `/filter` APIs do not accept a revision or column
  projection, so they cannot satisfy both provenance and payload-minimization.
- Revision-pinned Hub resolver URLs return the exact commit, linked artifact
  size and linked ETag before a manual CDN redirect.
- The largest coding Parquet is 244,785,858 bytes, but its approved CDN supports
  byte ranges. `hyparquet` 1.26.2 projected the six inventory columns in seven
  range requests and 633,632 transferred bytes.
- A six-dataset diagnostic transferred 2,816,787 bytes, decoded 1,436 source
  rows and selected 1,000 observations across 18 tasks and all six categories
  for release `2024-11-25`.

Threat controls:

- Dataset IDs, categories, revisions and artifact paths are a versioned
  allowlist; callers cannot supply a URL.
- Resolver and CDN requests use HTTPS, manual redirects, fixed/approved hosts,
  timeouts and exact commit/ETag/Content-Range checks.
- Each dataset has limits for linked artifact size, range request count,
  individual range size, cumulative downloaded bytes, decoded rows and turns.
- Range status `200` is rejected so a server cannot silently return an entire
  244 MB artifact.
- The stored evidence contains only canonical inventory observations and
  revision metadata, not question prompts or signed CDN URLs.

### Phase 3: Judgment Readiness (after source acquisition)

- [x] Filter staged judgments by the pinned release inventory.
- [x] Report missing observations against all six categories.
- [x] Keep repeated conflicting judgment keys as publication blockers.

Verified readiness measurement:

- The fixed 60,372-row run has 46,118 rows inside release `2024-11-25` and
  14,254 rows outside it.
- The judgment artifact covers 318 of 1,000 pinned observation keys: coding
  128/128, language 140/140, instruction-following 50/200, reasoning 0/150,
  math 0/232 and data-analysis 0/150.
- No model is complete against the six-category denominator. The existing
  2,674 repeated observations and 201 conflicting canonical keys remain
  publication blockers.
- The report reads the evidence and PostgreSQL in bounded, validated,
  read-only paths; it does not write scoring or publication tables.

### Phase 4: Revision-Bound Judgment Recovery

- [x] Pin the current three-category judgment revision and the latest earlier
      six-category judgment revision.
- [x] Fetch both immutable Parquet artifacts under the existing origin, size,
      redirect, schema and row limits.
- [x] Produce prompt-free coverage evidence against the pinned `2024-11-25`
      question inventory without selecting a score winner.
- [x] Preserve missing observations and repeated-score conflicts as separate
      publication blockers.

Verified revision history:

- Current revision `9704e5da7bfbefe75ac1482a13de827127295993`, committed
  2025-04-07, contains 60,372 rows but only coding, language and
  instruction-following. It covers 318/1,000 target observations.
- Revision `5896e3b11081702c7f93f4733605fa4f5a072a11`, committed
  2024-10-22, contains 93,624 rows and all six categories. It covers 700/1,000
  target observations.
- Their question-key union covers 800/1,000 observations. The remaining 200
  are instruction-following 150 and reasoning 50; they stay missing rather
  than becoming zero-valued.
- The official judgment generator de-duplicates a task JSONL by
  `(question_id, model)` and keeps the last file occurrence. It does not sort
  by `tstamp`. The current artifact still produces 201 conflicts after our
  reviewed canonical alias mapping: 64 already conflict within one raw model
  spelling and 137 appear only after multiple official spellings map to one
  canonical model. Phase 4 records this evidence but does not invent an alias
  or timestamp precedence rule.

### Delivery

- [x] Update methodology, source registry and progress documentation.
- [x] Run the complete local CI-equivalent quality gate.
- [x] Commit and push tracked changes while leaving
      `reference-table-data/` untracked.
- [x] Wait for the pushed GitHub Actions CI run to pass.

### Phase 2 Delivery

- [x] Add RED boundary and deterministic evidence tests.
- [x] Run the real bounded acquisition and persist its content-addressed JSON.
- [x] Complete five-axis and security review.
- [x] Run the complete local CI-equivalent quality gate.
- [x] Commit, push and wait for GitHub Actions CI.

### Phase 3 Delivery

- [x] Add RED evidence, filtering, duplicate and boundary tests.
- [x] Run the real six-category readiness report twice with stable output.
- [x] Complete five-axis and security review.
- [x] Run the complete local CI-equivalent quality gate.
- [x] Commit, push and wait for GitHub Actions CI.

### Phase 4 Delivery

- [x] Add RED pin, artifact-integrity, metadata-drift and union-coverage tests.
- [x] Run the real bounded two-revision acquisition and persist immutable
      content-addressed evidence.
- [x] Complete five-axis and security review.
- [x] Run the complete local CI-equivalent quality gate.
- [ ] Commit, push and wait for GitHub Actions CI.

## Acceptance Criteria

- Selection matches the official release/removal boundary semantics.
- Unknown releases, malformed dates, duplicate IDs and invalid rows fail
  closed.
- Identical logical inputs produce byte-stable output ordering.
- No timestamp-based judgment preference is introduced.
- No published result, score, snapshot or weekly edition is created.

## Risks and Mitigations

| Risk                                                              | Impact | Mitigation                                                       |
| ----------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| Current question data is mistaken for the pinned April 2025 state | High   | Pin all six Hub revisions before real-data ingestion.            |
| Coding rows carry very large test payloads                        | High   | Design field-minimal acquisition with strict response limits.    |
| Removed questions remain in the denominator                       | High   | Test the removal date equality boundary explicitly.              |
| Duplicate IDs silently shrink coverage                            | High   | Reject duplicates instead of Map-based collapsing.               |
| Release filtering is mistaken for conflict resolution             | High   | Preserve the existing conflict gate and document the separation. |

## Open Questions

- The pinned judgment artifact supplies only 318 of the 1,000 release
  observation keys. The pinned historical revision raises source-evidence
  coverage to 800/1,000 but cannot supply the remaining 200 observations.
- The 201 conflicting judgment keys still require an official run/version key
  or another source-backed selection rule. Until then they remain blocked.
