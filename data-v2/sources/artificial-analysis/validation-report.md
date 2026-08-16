# Artificial Analysis acquisition validation

- Refreshed: **2026-08-12T16:40:13.196Z**
- Official models page: <https://artificialanalysis.ai/models>
- Release article retained for AA-Briefcase: <https://artificialanalysis.ai/articles/gpt-5-6-has-landed>
- Raw evidence: complete response HTML stored content-addressably; Candidate provenance references the new evidence hashes.

## Before / after

| Check | 2026-07-16 snapshot | 2026-08-12 snapshot |
|---|---:|---:|
| Embedded model objects | 29 | 27 |
| Wider catalog size shown by source | 575 | 598 |
| CandidateResults | 376 | 313 |
| Included / Excluded | 290 / 86 | 259 / 54 |
| Distinct raw model names | 30 | 28 |
| Canonically unresolved candidates | 109 | 187 |

The lower Candidate count reflects current-source sparsity and cohort turnover, not dropped raw fields. Every non-null field supported by the existing materializer is emitted. Nulls are not converted to zero and identities are not fuzzy-guessed.

## Current structured coverage

The current payload exposes 27 model objects, including 26 Intelligence Index v4.1.1 scores. It materializes AA-LCR, AA-Omniscience index and accuracy, HLE, GPQA, SciCode, CritPt, APEX-Agents, Terminal-Bench 2.1, tau3 Banking, LiveCodeBench, GDPval-AA, and IFBench wherever non-null. The dated article contributes four AA-Briefcase rows.

The Intelligence Index composite and raw AA-Omniscience index remain `EXCLUDED`; direct normalized constituents remain `INCLUDED`. Artificial Analysis-owned evaluations use `ORGANIZER`; AA reruns of external benchmarks use `INDEPENDENT`.

The former Coding Agent Index field is absent from the current embedded model payload and is therefore not carried forward as a stale result.

## Cost materialization

The separate cost materialization preserves nine canonical `MEASURED_TASK` rows from the embedded `costPerIntelligenceIndexTask` data in `costs.json`. Unmatched rows remain in raw evidence and are not guessed into Product Profiles.

## Risks and unresolved

- The models page exposes only a selected 27-row cohort from the wider 598-model catalog, so the source remains `PARTIAL_SOURCE`.
- 187 CandidateResults retain null canonical identity. This is principally cohort turnover into models absent from the current catalog, and must be resolved through explicit aliases or catalog additions.
- The GPT-5.6 article remains reproducible and still contains the four quoted AA-Briefcase values, but it is older than the models payload.
