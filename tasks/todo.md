# LLM Bench Rebuild Tasks

## Phase 1 — Shared foundation

- [ ] Create `docs/BENCHMARK_DIMENSION_MAPPING.md` and machine-readable primary mappings.
- [ ] Define versioned evidence, Candidate Result, Model Profile and product-data schemas.
- [ ] Establish immutable `data-v2` paths and content-addressed `artifacts-v2` rules.
- [ ] Checkpoint: user reviews the frozen contract and mapping baseline.

## Phase 2 — Parallel acquisition and frontend

- [ ] Build shared acquisition, provenance and completeness-report utilities.
- [ ] Acquire and validate Artificial Analysis plus LLM Stats.
- [ ] Acquire and validate Terminal-Bench plus DeepSWE.
- [ ] Acquire and validate Epoch AI plus LiveBench.
- [ ] Acquire and validate Vals AI plus OpenAI.
- [ ] Route and delegate the clean new Next.js App shell according to `AGENTS.md`.
- [ ] Implement the representative-Profile Leaderboard.
- [ ] Implement standardized API cost and measured-task-cost views.
- [ ] Implement eight-axis radar plus Included/Excluded evidence detail.
- [ ] Checkpoint: eight source attempts and the new frontend build independently of legacy code.

## Phase 3 — First real Draft

- [ ] Resolve base-model identities and explicit Profiles.
- [ ] Build the dynamic composite Top-20 union plus manually specified new models.
- [ ] Normalize eligible Benchmark rows and apply source precedence.
- [ ] Generate dimension scores, Estimated overall scores and typed cost points.
- [ ] Build the first immutable Draft product JSON.
- [ ] Render the real Draft in the new Preview.
- [ ] Checkpoint: user reviews source counts, rankings, curve, radar and evidence.

## Phase 4 — Empirical correction

- [ ] Audit each source page against raw evidence, Candidate Results and the Draft UI.
- [ ] Correct acquisition, Manifest, identity and Benchmark mapping defects.
- [ ] Correct misleading UI, responsive and accessibility defects.
- [ ] Produce a new immutable Draft after every accepted correction set.
- [ ] Checkpoint: user confirms one Draft is sufficient to publish.

## Phase 5 — Publication

- [ ] Implement explicit Draft → Published and rollback commands.
- [ ] Configure restricted/noindex Draft Preview using the same App and schema.
- [ ] Replace DB/video CI requirements with static-data, build and browser gates.
- [ ] Demonstrate publish and rollback without re-fetching or recalculating.
- [ ] Checkpoint: user approves the exact Draft hash as Published.

## Phase 6 — Compulsory legacy removal

- [ ] Prove the new path has zero dependency on legacy packages.
- [ ] Remove old `apps/web`.
- [ ] Remove old `apps/worker` and LiveBench publication flow.
- [ ] Remove `packages/db`, migrations, DB commands and `compose.yaml`.
- [ ] Remove obsolete LiveBench connectors and old scoring/presentation contracts.
- [ ] Remove `apps/video` and Remotion paths unless explicitly re-scoped before cutover.
- [ ] Remove PostgreSQL/Docker services and obsolete steps from CI.
- [ ] Rewrite README, architecture, methodology, operations and decision status.
- [ ] Run clean install, lint, typecheck, tests, production build and browser checks.
- [ ] Verify Published renders without network, artifacts, PostgreSQL or Docker.

## Deferred until real-data evidence

- [ ] Define the final Supported threshold.
- [ ] Tune Benchmark and source-quality weights.
- [ ] Tune standardized API task-cost assumptions.
- [ ] Refine representative-Profile selection.
- [ ] Consider per-source scheduling and advanced conflict/confidence policy.
- [ ] Consider a management UI only if actual operation demonstrates the need.
