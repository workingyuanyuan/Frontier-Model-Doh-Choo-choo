# Implementation Plan: Complete LiveBench Alias Adjudication

## Overview

Review all 166 safe-normalized aliases in the pinned 60,372-row LiveBench ingestion run. Every alias must end with an evidence-backed canonical mapping or an explicit exclusion decision. Excluded rows remain unpublished and carry a machine-readable reason instead of being silently guessed or left pending.

## Architecture Decisions

- Keep canonical mappings and exclusions as versioned source-controlled manifests.
- Resolve exact safe-normalized aliases only; never use fuzzy matching.
- Treat vendor model documentation, vendor model cards and the pinned LiveBench source as evidence. Vendor identity takes precedence over benchmark spelling.
- Exclude unverifiable benchmark-private checkpoints, impossible model names and non-model aggregate aliases from publication.
- Split large static manifests into focused modules before the existing manifest approaches the 1,000-line review threshold.

## Task List

### Phase 1: Foundation

- [x] Add an exclusion decision type, validation and deterministic summary.
- [x] Apply exclusions during full-run resolution with explicit `EXCLUDED` status and reason metadata.
- [x] Extend review reporting and summaries so mapped, excluded, ambiguous and pending counts are independently visible.

### Checkpoint: Foundation

- [x] TDD RED/GREEN cycle proves exclusions cannot accidentally validate rows.
- [x] Worker tests and type checking pass.
- [x] Foundation commit is pushed and GitHub CI passes.

### Phase 2: Complete Adjudication

- [x] Export the exact 166-alias inventory from the pinned ingestion run.
- [ ] Add evidence-backed canonical mappings in provider-sized batches.
- [ ] Add evidence-backed exclusions for benchmark-private or invalid identities.
- [ ] Validate that the decision manifest covers every normalized source alias exactly once.

### Checkpoint: Adjudication

- [ ] Manifest validation rejects duplicate, missing and conflicting decisions.
- [ ] Database sync is idempotent.
- [ ] Full-run resolution reports zero pending and zero ambiguous aliases.

### Phase 3: Delivery

- [ ] Update progress and data methodology documentation with final counts.
- [ ] Complete correctness, readability, architecture, security and performance review.
- [ ] Run the complete local CI-equivalent quality gate.
- [ ] Push all commits and wait for the final GitHub CI run to pass.

## Risks and Mitigations

| Risk                                   | Impact | Mitigation                                                                     |
| -------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| Guessing a private checkpoint identity | High   | Exclude unless a first-party source proves the canonical identity.             |
| Large, unreviewable static manifest    | Medium | Split by decision type/provider and use typed compact definitions.             |
| Duplicate normalized aliases           | High   | Enforce one decision owner per normalized alias before DB writes.              |
| Excluded rows entering rankings        | High   | Store `EXCLUDED`, keep `resolved_model_variant_id` null and test the boundary. |
| Vendor lifecycle drift                 | Medium | Preserve evidence URLs and current review date in progress documentation.      |

## Open Questions

- None. The user explicitly authorized continuous execution until all aliases are adjudicated.
