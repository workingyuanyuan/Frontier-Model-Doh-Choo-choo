# Artificial Analysis acquisition validation

- Evaluation pages combined: `omniscience`, `gdpval-aa`, `apex-agents-aa`, `aa-briefcase`, `critpt`, `tau3-banking`, `gpqa-diamond`, `humanitys-last-exam`, `ifbench`, `scicode`, `terminalbench-v2-1`, `artificial-analysis-long-context-reasoning`, `mmmu-pro`, `aa-analyst-agent`, `automationbench-aa`, `enterprise-ops-gym-aa`, `harvey-lab-aa`, `itbench-aa`
- Model-set composition: union every page row, keep only non-deprecated rows released on or after 2025-08-17, then fetch `/models/<slug>` detail payloads for task cost and token-price fields.
- `$undefined` is treated as missing data together with `null`; it never creates a CandidateResult or CostRecord.

## Exact counts

| Check | Count |
|---|---:|
| Unique profile rows across evaluation pages | 482 |
| Active profile rows (2025-08-17 cutoff, not deprecated) | 223 |
| Generated CandidateResults | 2235 |
| Canonically unresolved candidates | 1591 |
| MEASURED_TASK cost rows | 96 |
| API_STANDARDIZED token-price rows | 217 |

## Page composition finding

- `/evaluations/omniscience` exposes the broad 479-row model-object payload but its task-cost field is sparse for current profiles.
- The combined evaluation-page union contains the complete current profile population; `/models` alone exposes 28 rows and 23 task costs in this capture.
- Detail pages are therefore part of the acquisition contract for task costs. Missing task cost remains absent; it is not estimated or filled with zero.

## API cross-validation

- API source: `https://artificialanalysis.ai/api/v2/data/llms/models`; matched rows 482, compared values 3181.
- Precision-only differences (API rounds to three decimals, within 0.0005): 1893. These are representation differences, not disagreements.
- Real differences (beyond 0.0005): 0.
- No real API differences recorded beyond rounding.

## Scope and semantics

- Artificial Analysis composite indices remain `EXCLUDED`; direct evaluation scores are the only AA rows eligible for the eight-dimensional product score.
- Token prices are `API_STANDARDIZED` and task costs are `MEASURED_TASK`; the two cost semantics are emitted as separate records.
- No missing score, identity, or cost is inferred.

## Visible comparison

- Fresh rendered models page catalog total: 609
- Complete evaluation-page union of score-bearing profiles: 482
- Result: scopes differ. The catalog total includes models outside the selected evaluation pages; it is recorded for visual validation but is not used to synthesize missing score rows.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Unique source profiles | 608 | 482 | -126 |
| Active source profiles | 228 | 223 | -5 |
| Candidate results | 2269 | 2235 | -34 |
| Materialized costs | 319 | 313 | -6 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `artificial-analysis`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:aa-briefcase:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:aa-lcr:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:aa-omniscience:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:aa-omniscience:claude-fable-5:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:critpt:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:gpqa-diamond:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:humanitys-last-exam:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:ifbench:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:scicode:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:tau3-banking:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | `artificial-analysis:terminal-bench-2-1:claude-fable-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-fable-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:aa-briefcase:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:aa-lcr:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:aa-omniscience:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:aa-omniscience:claude-opus-5-high:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:critpt:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:gdpval-aa:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:gpqa-diamond:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:humanitys-last-exam:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:scicode:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:tau3-banking:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, High Effort) | `artificial-analysis:terminal-bench-2-1:claude-opus-5-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:aa-briefcase:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:aa-lcr:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:aa-omniscience:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:aa-omniscience:claude-opus-5-low:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:critpt:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:gdpval-aa:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:gpqa-diamond:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:humanitys-last-exam:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:scicode:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:tau3-banking:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Low Effort) | `artificial-analysis:terminal-bench-2-1:claude-opus-5-low` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:aa-briefcase:claude-opus-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:aa-lcr:claude-opus-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:aa-omniscience:claude-opus-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:aa-omniscience:claude-opus-5:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:critpt:claude-opus-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:gpqa-diamond:claude-opus-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:humanitys-last-exam:claude-opus-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:scicode:claude-opus-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:tau3-banking:claude-opus-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:terminal-bench-2-1:claude-opus-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:aa-briefcase:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:aa-lcr:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:aa-omniscience:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:aa-omniscience:claude-opus-5-medium:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:critpt:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:gdpval-aa:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:gpqa-diamond:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:humanitys-last-exam:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:scicode:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:tau3-banking:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Medium Effort) | `artificial-analysis:terminal-bench-2-1:claude-opus-5-medium` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:aa-briefcase:claude-opus-5-xhigh` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:aa-lcr:claude-opus-5-xhigh` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:aa-omniscience:claude-opus-5-xhigh` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:aa-omniscience:claude-opus-5-xhigh:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:critpt:claude-opus-5-xhigh` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:gpqa-diamond:claude-opus-5-xhigh` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:humanitys-last-exam:claude-opus-5-xhigh` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:scicode:claude-opus-5-xhigh` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:tau3-banking:claude-opus-5-xhigh` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Opus 5 (Adaptive Reasoning, Xhigh Effort) | `artificial-analysis:terminal-bench-2-1:claude-opus-5-xhigh` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-5-max |
| Claude Sonnet 4.6 (Non-reasoning, Low Effort) | `artificial-analysis:aa-lcr:claude-sonnet-4-6-non-reasoning-low-effort` | — | `max` | frontier-code | frontier-code:frontier-code-1-1:claude-sonnet-4-6-max |
| Claude Sonnet 4.6 (Non-reasoning, Low Effort) | `artificial-analysis:aa-omniscience:claude-sonnet-4-6-non-reasoning-low-effort` | — | `max` | frontier-code | frontier-code:frontier-code-1-1:claude-sonnet-4-6-max |
| Claude Sonnet 4.6 (Non-reasoning, Low Effort) | `artificial-analysis:aa-omniscience:claude-sonnet-4-6-non-reasoning-low-effort:index` | — | `max` | frontier-code | frontier-code:frontier-code-1-1:claude-sonnet-4-6-max |
| Claude Sonnet 4.6 (Non-reasoning, Low Effort) | `artificial-analysis:critpt:claude-sonnet-4-6-non-reasoning-low-effort` | — | `max` | frontier-code | frontier-code:frontier-code-1-1:claude-sonnet-4-6-max |
| Claude Sonnet 4.6 (Non-reasoning, Low Effort) | `artificial-analysis:gpqa-diamond:claude-sonnet-4-6-non-reasoning-low-effort` | — | `max` | frontier-code | frontier-code:frontier-code-1-1:claude-sonnet-4-6-max |
| Claude Sonnet 4.6 (Non-reasoning, Low Effort) | `artificial-analysis:humanitys-last-exam:claude-sonnet-4-6-non-reasoning-low-effort` | — | `max` | frontier-code | frontier-code:frontier-code-1-1:claude-sonnet-4-6-max |
| Claude Sonnet 4.6 (Non-reasoning, Low Effort) | `artificial-analysis:ifbench:claude-sonnet-4-6-non-reasoning-low-effort` | — | `max` | frontier-code | frontier-code:frontier-code-1-1:claude-sonnet-4-6-max |
| Claude Sonnet 4.6 (Non-reasoning, Low Effort) | `artificial-analysis:scicode:claude-sonnet-4-6-non-reasoning-low-effort` | — | `max` | frontier-code | frontier-code:frontier-code-1-1:claude-sonnet-4-6-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:aa-briefcase:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:aa-lcr:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:aa-omniscience:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:aa-omniscience:claude-sonnet-5:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:critpt:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:gdpval-aa:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:gpqa-diamond:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:humanitys-last-exam:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:scicode:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:tau3-banking:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Adaptive Reasoning, Max Effort) | `artificial-analysis:terminal-bench-2-1:claude-sonnet-5` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:aa-lcr:claude-sonnet-5-non-reasoning` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:aa-omniscience:claude-sonnet-5-non-reasoning` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:aa-omniscience:claude-sonnet-5-non-reasoning:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:critpt:claude-sonnet-5-non-reasoning` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:gdpval-aa:claude-sonnet-5-non-reasoning` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:gpqa-diamond:claude-sonnet-5-non-reasoning` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:humanitys-last-exam:claude-sonnet-5-non-reasoning` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:scicode:claude-sonnet-5-non-reasoning` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:tau3-banking:claude-sonnet-5-non-reasoning` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| Claude Sonnet 5 (Non-reasoning, High Effort) | `artificial-analysis:terminal-bench-2-1:claude-sonnet-5-non-reasoning` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-5-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:aa-briefcase:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:aa-lcr:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:aa-omniscience:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:aa-omniscience:deepseek-v4-flash:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:critpt:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:gdpval-aa:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:gpqa-diamond:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:humanitys-last-exam:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:scicode:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:tau3-banking:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `artificial-analysis:terminal-bench-2-1:deepseek-v4-flash` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-flash-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:aa-lcr:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:aa-omniscience:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:aa-omniscience:deepseek-v4-pro-0424-high:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:critpt:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:gdpval-aa:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:gpqa-diamond:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:humanitys-last-exam:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:ifbench:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:scicode:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:tau3-banking:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, High Effort) | `artificial-analysis:terminal-bench-2-1:deepseek-v4-pro-0424-high` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:aa-briefcase:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:aa-lcr:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:aa-omniscience:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:aa-omniscience:deepseek-v4-pro-0424:index` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:apex-agents:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:critpt:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:gdpval-aa:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:gpqa-diamond:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:humanitys-last-exam:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:ifbench:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:scicode:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:tau3-banking:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| DeepSeek V4 Pro (Reasoning, Max Effort) | `artificial-analysis:terminal-bench-2-1:deepseek-v4-pro-0424` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-deepseek-v4-pro-max |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-briefcase:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-lcr:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-omniscience:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-omniscience:gemini-3-1-pro-preview:index` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:apex-agents:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:critpt:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gdpval-aa:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gpqa-diamond:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:humanitys-last-exam:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:ifbench:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:scicode:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:tau3-banking:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:terminal-bench-2-1:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-briefcase:gemini-3-5-flash-lite` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-lcr:gemini-3-5-flash-lite` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite:index` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:critpt:gemini-3-5-flash-lite` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gpqa-diamond:gemini-3-5-flash-lite` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:humanitys-last-exam:gemini-3-5-flash-lite` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:scicode:gemini-3-5-flash-lite` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:tau3-banking:gemini-3-5-flash-lite` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-2-1:gemini-3-5-flash-lite` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Qwen3.8 Max | `artificial-analysis:aa-briefcase:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:aa-lcr:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:aa-omniscience:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:aa-omniscience:qwen3-8-max:index` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:critpt:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:gpqa-diamond:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:humanitys-last-exam:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:scicode:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:tau3-banking:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:terminal-bench-2-1:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Kimi K2.7 Code | `artificial-analysis:aa-lcr:kimi-k2-7-code` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:aa-omniscience:kimi-k2-7-code` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:aa-omniscience:kimi-k2-7-code:index` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:critpt:kimi-k2-7-code` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:gdpval-aa:kimi-k2-7-code` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:gpqa-diamond:kimi-k2-7-code` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:humanitys-last-exam:kimi-k2-7-code` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:ifbench:kimi-k2-7-code` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:scicode:kimi-k2-7-code` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:tau3-banking:kimi-k2-7-code` | — | `default` | — | — |
| Kimi K2.7 Code | `artificial-analysis:terminal-bench-2-1:kimi-k2-7-code` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:aa-briefcase:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:aa-lcr:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:aa-omniscience:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:aa-omniscience:mimo-v2-5-pro:index` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:apex-agents:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:critpt:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:gdpval-aa:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:gpqa-diamond:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:humanitys-last-exam:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:ifbench:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:scicode:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:tau3-banking:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro | `artificial-analysis:terminal-bench-2-1:mimo-v2-5-pro` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:aa-briefcase:minimax-m3` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:aa-lcr:minimax-m3` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3:index` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:critpt:minimax-m3` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:gpqa-diamond:minimax-m3` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:humanitys-last-exam:minimax-m3` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:ifbench:minimax-m3` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:scicode:minimax-m3` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:tau3-banking:minimax-m3` | — | `default` | — | — |
| MiniMax-M3 | `artificial-analysis:terminal-bench-2-1:minimax-m3` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-briefcase:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-lcr:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b:index` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:critpt:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gpqa-diamond:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:humanitys-last-exam:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:ifbench:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:scicode:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:tau3-banking:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-2-1:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:aa-briefcase:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:aa-lcr:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:aa-omniscience:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:aa-omniscience:qwen3-6-27b:index` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:critpt:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:gdpval-aa:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:gpqa-diamond:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:humanitys-last-exam:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:ifbench:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:scicode:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:tau3-banking:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.6 27B (Reasoning) | `artificial-analysis:terminal-bench-2-1:qwen3-6-27b` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:aa-lcr:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:aa-omniscience:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:aa-omniscience:qwen3-7-plus:index` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:apex-agents:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:critpt:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:gdpval-aa:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:gpqa-diamond:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:humanitys-last-exam:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:ifbench:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:scicode:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:tau3-banking:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:terminal-bench-2-1:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.8 27B | `artificial-analysis:aa-lcr:qwen3-8-27b` | — | `default` | — | — |
| Qwen3.8 27B | `artificial-analysis:aa-omniscience:qwen3-8-27b` | — | `default` | — | — |
| Qwen3.8 27B | `artificial-analysis:aa-omniscience:qwen3-8-27b:index` | — | `default` | — | — |
| Qwen3.8 27B | `artificial-analysis:critpt:qwen3-8-27b` | — | `default` | — | — |
| Qwen3.8 27B | `artificial-analysis:gpqa-diamond:qwen3-8-27b` | — | `default` | — | — |
| Qwen3.8 27B | `artificial-analysis:humanitys-last-exam:qwen3-8-27b` | — | `default` | — | — |
| Qwen3.8 27B | `artificial-analysis:scicode:qwen3-8-27b` | — | `default` | — | — |
| Qwen3.8 27B | `artificial-analysis:tau3-banking:qwen3-8-27b` | — | `default` | — | — |
| Qwen3.8 27B | `artificial-analysis:terminal-bench-2-1:qwen3-8-27b` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
