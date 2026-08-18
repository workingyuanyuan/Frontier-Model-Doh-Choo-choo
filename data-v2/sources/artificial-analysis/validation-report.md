# Artificial Analysis acquisition validation

- Evaluation pages combined: `omniscience`, `gdpval-aa`, `apex-agents-aa`, `aa-briefcase`, `critpt`, `tau3-banking`, `gpqa-diamond`, `humanitys-last-exam`, `ifbench`, `scicode`, `terminalbench-v2-1`, `artificial-analysis-long-context-reasoning`, `mmmu-pro`, `aa-analyst-agent`, `automationbench-aa`, `enterprise-ops-gym-aa`, `harvey-lab-aa`, `itbench-aa`
- Model-set composition: union every page row, keep only non-deprecated rows released on or after 2025-08-17, then fetch `/models/<slug>` detail payloads for task cost and token-price fields.
- `$undefined` is treated as missing data together with `null`; it never creates a CandidateResult or CostRecord.

## Exact counts

| Check | Count |
|---|---:|
| Unique profile rows across evaluation pages | 608 |
| Active profile rows (2025-08-17 cutoff, not deprecated) | 228 |
| Generated CandidateResults | 2269 |
| Canonically unresolved candidates | 1727 |
| MEASURED_TASK cost rows | 96 |
| API_STANDARDIZED token-price rows | 223 |

## Page composition finding

- `/evaluations/omniscience` exposes the broad 479-row model-object payload but its task-cost field is sparse for current profiles.
- The combined evaluation-page union contains the complete current profile population; `/models` alone exposes 28 rows and 23 task costs in this capture.
- Detail pages are therefore part of the acquisition contract for task costs. Missing task cost remains absent; it is not estimated or filled with zero.

## API cross-validation

- API source unavailable; page pipeline remains authoritative.
- No real API differences recorded beyond rounding.
- Warning: API cross-validation was not attempted.

## Scope and semantics

- Artificial Analysis composite indices remain `EXCLUDED`; direct evaluation scores are the only AA rows eligible for the eight-dimensional product score.
- Token prices are `API_STANDARDIZED` and task costs are `MEASURED_TASK`; the two cost semantics are emitted as separate records.
- No missing score, identity, or cost is inferred.
