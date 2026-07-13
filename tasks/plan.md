# Implementation Plan: LiveBench Aggregation Readiness

## Overview

Turn the fully adjudicated LiveBench staged rows into deterministic task and
category aggregates without bypassing publication safety. The first deliverable
is a read-only readiness report for the pinned 60,372-row ingestion run. It must
make incomplete category coverage and repeated/conflicting observations
explicit; it must not write `benchmark_results`, scores, ranking snapshots or
weekly editions.

## Verified Source Rules

- LiveBench's official result script averages question scores within each task,
  then averages task scores within each category.
- LiveBench requires complete judgments before including a model in its task and
  category tables.
- The project keeps missing values null and blocks publication when coverage or
  identity/configuration gates are incomplete.

Sources:

- https://github.com/LiveBench/LiveBench/blob/main/livebench/show_livebench_result.py
- https://github.com/LiveBench/LiveBench

## Architecture Decisions

- Keep LiveBench-specific parsing, inventory and readiness logic in the worker;
  the shared scoring package remains source-agnostic.
- Treat the database JSON payload as an explicit typed boundary before using it
  in aggregation.
- Use canonical `(model variant, category, task, question, turn)` keys.
- Collapse identical repeated observations deterministically, but record their
  multiplicity. A key with different scores is a blocking conflict and cannot
  contribute to a category score.
- Emit a category score only when every expected task/question observation for
  that category is present and conflict-free. Missing data remains null.
- Do not emit an overall LiveBench score or persist published results in this
  slice. Benchmark-to-dimension mapping and publication remain separate gates.

## Task List

### Phase 1: Aggregation Contract

- [x] Add RED tests for task means, equal-weight category means, stable ordering,
      missing observations and conflicting repeated observations.
- [x] Implement the smallest pure aggregation/readiness module that passes the
      tests.
- [x] Document the contract so downstream repository code cannot interpret
      incomplete category values as formal scores.

### Checkpoint: Pure Logic

- [x] Worker tests pass, including deterministic repeat execution.
- [x] Worker type checking and lint pass.
- [x] Five-axis review finds no unhandled correctness, architecture, security or
      performance blocker.

### Phase 2: Read-only Repository and CLI

- [x] Query one explicit ingestion run and accept only `VALIDATED` rows with a
      canonical model variant.
- [x] Build the expected task/question inventory from the complete staged run,
      including excluded aliases, so exclusions cannot shrink coverage.
- [x] Emit JSON with run identity, inventory coverage, duplicate/conflict counts
      and per-model task/category aggregates.
- [x] Reject a missing, non-succeeded or non-full-run ingestion run.

### Checkpoint: Real Data

- [x] The pinned run reports 60,372 staged rows, 58,233 validated rows and 2,139
      excluded rows.
- [x] The report reproduces the observed seven-task, three-category inventory.
- [x] Publication readiness is false while required categories or conflict gates
      remain unresolved.
- [x] The command is read-only and leaves published/scoring tables unchanged.

### Phase 3: Delivery

- [x] Update progress and operations documentation with measured results.
- [x] Run the complete local CI-equivalent quality gate.
- [x] Commit and push all tracked changes while leaving
      `reference-table-data/` untracked.
- [x] Wait for the pushed GitHub Actions CI run to pass.

## Acceptance Criteria

- No excluded or unresolved row contributes to aggregation.
- Identical inputs always produce byte-stable ordering and values.
- A category score is null when any required observation is missing or
  conflicting.
- Task scores are arithmetic means of canonical question observations; category
  scores are equal-weight means of complete task scores.
- No published result, dimension score, ranking snapshot or weekly edition is
  created.
- `main` and `origin/main` match after a green CI run.

## Risks and Mitigations

| Risk                                                     | Impact | Mitigation                                                               |
| -------------------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| Historical reruns silently double-weight questions       | High   | Canonical observation keys, duplicate counts and conflict blocking.      |
| Alias exclusions shrink the benchmark inventory          | High   | Derive expected questions from all staged rows, not validated rows only. |
| Partial categories look like formal scores               | High   | Null incomplete category scores and explicit readiness status.           |
| LiveBench categories are mistaken for project dimensions | High   | Keep source aggregation separate from benchmark-dimension mapping.       |
| Readiness query mutates publication state                | High   | Read-only repository/CLI plus before/after table-count verification.     |

## Open Questions

- Repeated judgments with different timestamps need a source-backed selection
  policy (for example, an official evaluation-run identifier) before formal
  publication. Until then they remain blocking conflicts.
