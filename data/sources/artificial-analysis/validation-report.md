# Artificial Analysis acquisition validation

- Evaluation pages combined: `omniscience`, `gdpval-aa`, `gdp-pdf`, `apex-agents-aa`, `aa-briefcase`, `critpt`, `tau3-banking`, `gpqa-diamond`, `humanitys-last-exam`, `ifbench`, `scicode`, `terminalbench-v2-1`, `artificial-analysis-long-context-reasoning`, `mmmu-pro`, `aa-analyst-agent`, `automationbench-aa`, `enterprise-ops-gym-aa`, `harvey-lab-aa`, `itbench-aa`
- Model-set composition: union every page row, keep non-deleted rows released on or after 2025-08-17 including deprecated models, then fetch `/models/<slug>` detail payloads for task cost and token-price fields.
- `$undefined` is treated as missing data together with `null`; it never creates a CandidateResult or CostRecord.

## Exact counts

| Check | Count |
|---|---:|
| Unique profile rows across all captured page payloads | 192 |
| Unique profile rows in evaluation-page payloads | 63 |
| Unique profile rows in model-detail payloads | 189 |
| Profile rows in the /models payload | 24 |
| Eligible profile rows (2025-08-17 cutoff, including deprecated) | 180 |
| Generated CandidateResults | 2246 |
| Intelligence Index candidates (EXCLUDED) | 178 |
| GDPval-AA normalized candidates | 174 |
| Canonically unresolved candidates | 704 |
| MEASURED_TASK cost rows | 167 |
| API_STANDARDIZED token-price rows | 179 |

## Page composition finding

- The rendered `/models` catalog total is checked separately by the refresh command; its RSC payload exposes 24 selected profile rows in this capture.
- The evaluation-page payload union exposes 63 profiles. `/evaluations/gdpval-aa` carries 0 `gdpvalNormalized` values, so normalized GDPval-AA is read from the model-detail payload that actually carries the field.
- The model-detail payload union exposes 189 profiles and is the source for Intelligence Index, normalized GDPval-AA, task cost, and token-price fields when present.
- Missing Index, score, or cost remains absent; it is not estimated or filled with zero.

## API cross-validation

- API source unavailable; page pipeline remains authoritative.
- No real API differences recorded beyond rounding.
- Warning: API cross-validation was not attempted.

## Scope and semantics

- Artificial Analysis composite indices remain `EXCLUDED`; direct evaluation scores are the only AA rows eligible for the eight-dimensional product score.
- Token prices are `API_STANDARDIZED` and task costs are `MEASURED_TASK`; the two cost semantics are emitted as separate records.
- No missing score, identity, or cost is inferred.
