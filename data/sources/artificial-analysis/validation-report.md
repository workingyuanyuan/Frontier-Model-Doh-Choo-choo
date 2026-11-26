# Artificial Analysis acquisition validation

- Evaluation pages combined: `omniscience`, `gdpval-aa`, `gdp-pdf`, `apex-agents-aa`, `aa-briefcase`, `mka`, `critpt`, `tau3-banking`, `gpqa-diamond`, `humanitys-last-exam`, `ifbench`, `scicode`, `terminalbench-v2-1`, `artificial-analysis-long-context-reasoning`, `mmmu-pro`, `aa-analyst-agent`, `automationbench-aa`, `enterprise-ops-gym-aa`, `harvey-lab-aa`, `itbench-aa`, `hle-diamond`, `terminal-bench-science`, `critpt-v2`, `frontiercode-2-0`, `terminalbench-4-0`, `terminalbench-4-1`, `frontierphysics`
- Model-set composition: union every page row, keep non-deleted rows released on or after 2025-08-17 including deprecated models, then fetch `/models/<slug>` detail payloads for task cost and token-price fields.
- `$undefined` is treated as missing data together with `null`; it never creates a CandidateResult or CostRecord.

## Exact counts

| Check | Count |
|---|---:|
| Unique profile rows across all captured page payloads | 306 |
| Unique profile rows in evaluation-page payloads | 140 |
| Unique profile rows in model-detail payloads | 306 |
| Profile rows in the /models payload | 28 |
| Eligible profile rows (2025-08-17 cutoff, including deprecated) | 295 |
| Generated CandidateResults | 3726 |
| Intelligence Index candidates (EXCLUDED) | 144 |
| GDPval-AA normalized candidates | 210 |
| Canonically unresolved candidates | 527 |
| MEASURED_TASK cost rows | 134 |
| API_STANDARDIZED token-price rows | 262 |

## Page composition finding

- The rendered `/models` catalog total is checked separately by the refresh command; its RSC payload exposes 28 selected profile rows in this capture.
- The evaluation-page payload union exposes 140 profiles. `/evaluations/gdpval-aa` carries 0 `gdpvalNormalized` values, so normalized GDPval-AA is read from the model-detail payload that actually carries the field.
- The model-detail payload union exposes 306 profiles and is the source for Intelligence Index, normalized GDPval-AA, task cost, and token-price fields when present.
- Missing Index, score, or cost remains absent; it is not estimated or filled with zero.

## API cross-validation

- API source unavailable; page pipeline remains authoritative.
- No real API differences recorded beyond rounding.
- Warning: API cross-validation was not attempted.

## Scope and semantics

- Artificial Analysis composite indices remain `EXCLUDED`; direct evaluation scores are the only AA rows eligible for the eight-dimensional product score.
- Token prices are `API_STANDARDIZED` and task costs are `MEASURED_TASK`; the two cost semantics are emitted as separate records.
- No missing score, identity, or cost is inferred.

## Intelligence Index v5 evaluations

Integrated for scoring on 2026-10-28 (user decision: AA v5 additions are scored).

| Evaluation page | Field | Benchmark ID | Candidates | Canonically resolved |
|---|---|---|---:|---:|
| `terminalbench-4-0` | `terminalBench40` | `terminal-bench-4-0` | 220 | 201 |
| `terminalbench-4-1` | `terminalBench41` | `terminal-bench-4-1` | 219 | 201 |
| `hle-diamond` | `hleDiamond` | `hle-diamond` | 166 | 153 |
| `terminal-bench-science` | `terminalBenchScience` | `terminal-bench-science` | 157 | 151 |
| `critpt-v2` | `critptAgentic` | `critpt-v2` | 71 | 68 |
| `frontiercode-2-0` | `frontierCode20` | `frontier-code-2-0` | 145 | 141 |

- `frontier-code-2-0` is shared with the organizer source `frontier-code` (Cognition). AA rows are INDEPENDENT/PARTIAL_SOURCE, so the ORGANIZER row wins every overlapping profile; AA rows only fill profiles Cognition did not run.
- `terminal-bench-4-1` is shared with the organizer source `terminal-bench`. AA rows are INDEPENDENT/PARTIAL_SOURCE, so the ORGANIZER row wins every overlapping profile; AA rows only fill profiles the organizer did not run.
- `critpt-v2` uses the Full Set (`critptAgentic`, the default leaderboard tab). The Index weights the 40-question Hard Subset (`critptAgenticHard`), which is not materialized.
- Not integrated: AutomationBench-AA (`automationBenchPartialScore`); CritPt v2 Hard Subset (`critptAgenticHard`); AA FrontierCode 1.1 (`frontierCode`).

## FrontierPhysics

- Integrated for scoring on 2026-11-26 (user decision). `frontierphysics` field candidates: 41; canonically resolved: 39.
- Standalone evaluation, not part of the Intelligence Index. Score is the mean over three runs per task; Pass@1 and the verifier pass rate in `frontierphysicsBreakdown` are not materialized.

## AA-Briefcase leaderboard join

- `/evaluations/aa-briefcase` leaderboard rows (display name and internal UUID, no slug): 291.
- Joined to exactly one captured profile row with the identical `name` and release day: 228.
- Rubric rows read from the leaderboard because no captured row of the profile carries `briefcaseBreakdown.rubricPassRate`: 114 (a-x-k2, claude-fable-5-1-high, claude-fable-5-1-low, claude-fable-5-1-medium, claude-fable-5-2-high, claude-fable-5-2-low, claude-fable-5-2-medium, claude-fable-5-2-xhigh, claude-haiku-5-5-high, claude-haiku-5-5-low, claude-haiku-5-5-medium, claude-haiku-5-5-xhigh, claude-opus-4-7-non-reasoning, claude-opus-5-5-high, claude-opus-5-5-low, claude-opus-5-5-medium, claude-opus-5-5-xhigh, claude-opus-5-low, claude-opus-5-medium, claude-sonnet-5-5-high, claude-sonnet-5-5-low, claude-sonnet-5-5-medium, claude-sonnet-5-5-xhigh, claude-sonnet-5-high, claude-sonnet-5-low, claude-sonnet-5-medium, claude-sonnet-5-xhigh, deepseek-v4-1-flash-1017-high, deepseek-v4-1-flash-1017-non-reasoning, deepseek-v4-1-flash-non-reasoning, deepseek-v4-flash-0420-high, deepseek-v4-pro-high, deepseek-v4-pro-non-reasoning, gemini-3-5-flash-medium, gemini-3-8-flash-low, gemini-4-carbon-low, gemini-4-hydrogen-high, gemini-4-hydrogen-low, gemini-4-hydrogen-medium, gemma-4-e4b, glm-5-3-low, gpt-5-5-high, gpt-5-6-luna-high, gpt-5-6-luna-low, gpt-5-6-luna-medium, gpt-5-6-luna-non-reasoning, gpt-5-6-luna-xhigh, gpt-5-6-sol-high, gpt-5-6-sol-low, gpt-5-6-sol-medium, gpt-5-6-sol-non-reasoning, gpt-5-6-terra-high, gpt-5-6-terra-low, gpt-5-6-terra-medium, gpt-5-6-terra-non-reasoning, gpt-5-6-terra-xhigh, gpt-6-1-sol-high, gpt-6-1-sol-medium, gpt-6-1-sol-xhigh, gpt-6-1-terra-high, gpt-6-1-terra-low, gpt-6-1-terra-medium, gpt-6-1-terra-non-reasoning, gpt-6-1-terra-xhigh, gpt-6-2-astra-high, gpt-6-2-astra-low, gpt-6-2-astra-medium, gpt-6-2-astra-xhigh, gpt-6-2-sol-high, gpt-6-2-sol-low, gpt-6-2-sol-medium, gpt-6-2-sol-xhigh, gpt-6-astra-low, gpt-6-luna-high, gpt-6-luna-low, gpt-6-luna-medium, gpt-6-luna-non-reasoning, gpt-6-luna-xhigh, gpt-6-sol-high, gpt-6-sol-low, gpt-6-sol-medium, gpt-6-sol-non-reasoning, gpt-6-sol-xhigh, granite-4-2-30b, granite-4-2-8b, grok-4-3-non-reasoning, grok-4-6-low, grok-4-6-medium, grok-4-7-high, grok-4-7-low, hypernova-60b, inkling, inkling-high, inkling-small-high, k2-horizon-32b, k2-horizon-7b, k2-horizon-mova-36b-a4b, kimi-k3-low, ling-3-0-flash-vl, mimo-v2-6-flash, mistral-large-4-medium, mistral-medium-3-5, mistral-small-4, muse-ember-xhigh, muse-glimmer, nanbeige4-3-33b, nemotron-3-5-bolt-74b-a9b, nemotron-3-5-lightning, north-mini-code, qwen3-5-9b, qwen3-8-27b-low, qwen3-8-27b-medium, qwen3-8-27b-non-reasoning, solar-pro4).
- Profile-row rubric and leaderboard rubric disagree: 0. The profile-row value is kept.
- Not joined: 63 names match no captured profile (no identity is inferred); 0 ambiguous; 0 release-day mismatches or missing release days.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `artificial-analysis`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Beam 1.0 | `artificial-analysis:aa-briefcase:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:aa-lcr:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:aa-omniscience:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:aa-omniscience:reflection-beam:index` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:critpt-v2:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:critpt:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:frontier-code-2-0:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:gdp-pdf:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:gdpval-aa:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:hle-diamond:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:humanitys-last-exam:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:reflection-beam-1-0-aa-index:intelligence-index-v5-0-2` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:scicode:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:terminal-bench-4-0:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:terminal-bench-4-1:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:terminal-bench-science:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Gemini 3.1 Flash-Lite | `artificial-analysis:aa-briefcase:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:aa-lcr:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-1-flash-lite-preview:index` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:apex-agents:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:critpt-v2:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:critpt:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:frontier-code-2-0:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:gdp-pdf:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:gdpval-aa:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:google-gemini-3-1-flash-lite-aa-index:intelligence-index-v5-0-2` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:gpqa-diamond:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:hle-diamond:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:humanitys-last-exam:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:ifbench:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:scicode:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:tau3-banking:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:terminal-bench-2-1:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:terminal-bench-4-0:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:terminal-bench-4-1:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Flash-Lite | `artificial-analysis:terminal-bench-science:gemini-3-1-flash-lite-preview` | — | `high` | epoch-ai | epoch-ai:aime:google-gemini-3-1-flash-lite-default-epoch-inspect-row-144 |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-briefcase:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-lcr:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:apex-agents:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:critpt:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gdp-pdf:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gdpval-aa:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gpqa-diamond:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:hle-diamond:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:humanitys-last-exam:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:ifbench:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:scicode:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:tau3-banking:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:terminal-bench-2-1:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:terminal-bench-4-0:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:terminal-bench-4-1:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-briefcase:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-lcr:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite:index` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:critpt-v2:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:critpt:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:frontier-code-2-0:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gdp-pdf:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gdpval-aa:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:google-gemini-3-5-flash-lite-aa-index:intelligence-index-v5-0-2` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gpqa-diamond:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:hle-diamond:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:humanitys-last-exam:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:scicode:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:tau3-banking:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-2-1:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-4-0:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-4-1:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-science:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemma 4 31B (Reasoning) | `artificial-analysis:aa-briefcase:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:aa-lcr:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:aa-omniscience:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:aa-omniscience:gemma-4-31b:index` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:critpt-v2:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:critpt:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:frontier-code-2-0:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:gdp-pdf:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:gdpval-aa:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:google-gemma-4-31b-aa-index:intelligence-index-v5-0-2` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:gpqa-diamond:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:hle-diamond:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:humanitys-last-exam:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:ifbench:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:scicode:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:tau3-banking:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:terminal-bench-2-1:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:terminal-bench-4-0:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:terminal-bench-4-1:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| Gemma 4 31B (Reasoning) | `artificial-analysis:terminal-bench-science:gemma-4-31b` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:gemma-4-31b |
| GLM-5.1 (Reasoning) | `artificial-analysis:aa-briefcase:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:aa-lcr:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:critpt:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:gdp-pdf:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:gdpval-aa:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:gpqa-diamond:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:humanitys-last-exam:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:ifbench:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:scicode:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:tau3-banking:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:terminal-bench-2-1:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:terminal-bench-4-0:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:terminal-bench-4-1:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| Inkling 2 Mini | `artificial-analysis:aa-briefcase:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:aa-omniscience:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:aa-omniscience:inkling-2-mini:index` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:critpt-v2:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:frontier-code-2-0:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:gdp-pdf:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:gdpval-aa:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:hle-diamond:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:terminal-bench-4-0:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:terminal-bench-4-1:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:terminal-bench-science:inkling-2-mini` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Mini | `artificial-analysis:thinking-machines-inkling-2-mini-aa-index:intelligence-index-v5-0-2` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-mini-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:aa-briefcase:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:aa-lcr:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:aa-omniscience:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:aa-omniscience:inkling-2-small:index` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:critpt-v2:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:frontier-code-2-0:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:frontierphysics:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:gdp-pdf:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:gdpval-aa:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:hle-diamond:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:humanitys-last-exam:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:scicode:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:tau3-banking:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:terminal-bench-2-1:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:terminal-bench-4-0:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:terminal-bench-4-1:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:terminal-bench-science:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:thinking-machines-inkling-2-small-aa-index:intelligence-index-v5-0-2` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:aa-briefcase:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:aa-lcr:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:aa-omniscience:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:aa-omniscience:inkling-small:index` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:critpt-v2:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:critpt:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:frontier-code-2-0:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:gdp-pdf:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:gdpval-aa:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:gpqa-diamond:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:hle-diamond:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:humanitys-last-exam:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:scicode:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:tau3-banking:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:terminal-bench-2-1:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:terminal-bench-4-0:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:terminal-bench-4-1:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:terminal-bench-science:inkling-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling Small | `artificial-analysis:thinking-machines-inkling-small-aa-index:intelligence-index-v5-0-2` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-xhigh:arc-agi-2-v2-semi-private |
| Kimi K3.1 Pro | `artificial-analysis:aa-briefcase:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:aa-lcr:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:aa-omniscience:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:aa-omniscience:kimi-k3-1-pro:index` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:critpt-v2:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:critpt:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:frontier-code-2-0:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:frontierphysics:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:gdp-pdf:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:gdpval-aa:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:hle-diamond:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:humanitys-last-exam:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:mka:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:moonshot-kimi-k3-1-pro-aa-index:intelligence-index-v5-0-2` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:scicode:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:terminal-bench-4-0:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:terminal-bench-4-1:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| Kimi K3.1 Pro | `artificial-analysis:terminal-bench-science:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-6 |
| MiniMax-M3 | `artificial-analysis:aa-briefcase:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:aa-lcr:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3:index` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:critpt-v2:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:critpt:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:frontier-code-2-0:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:gdp-pdf:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:gdpval-aa:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:gpqa-diamond:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:hle-diamond:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:humanitys-last-exam:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:ifbench:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:minimax-minimax-m3-aa-index:intelligence-index-v5-0-2` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:scicode:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:tau3-banking:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:terminal-bench-2-1:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:terminal-bench-4-0:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:terminal-bench-4-1:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3 | `artificial-analysis:terminal-bench-science:minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| MiniMax-M3.1-Flash | `artificial-analysis:aa-briefcase:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:aa-lcr:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:aa-omniscience:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:aa-omniscience:minimax-m3-1-flash:index` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:critpt-v2:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:critpt:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:frontier-code-2-0:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:gdp-pdf:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:gdpval-aa:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:hle-diamond:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:humanitys-last-exam:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:minimax-minimax-m3-1-flash-aa-index:intelligence-index-v5-0-2` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:mka:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:scicode:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:terminal-bench-4-0:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:terminal-bench-4-1:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| MiniMax-M3.1-Flash | `artificial-analysis:terminal-bench-science:minimax-m3-1-flash` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:minimax-m3-1-flash |
| Mistral Large 4 Preview | `artificial-analysis:aa-briefcase:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:aa-lcr:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:aa-omniscience:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:aa-omniscience:mistral-large-4-preview:index` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:critpt-v2:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:critpt:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:frontier-code-2-0:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:gdp-pdf:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:gdpval-aa:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:hle-diamond:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:humanitys-last-exam:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:mistral-mistral-large-4-preview-aa-index:intelligence-index-v5-0-2` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:scicode:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:terminal-bench-4-0:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:terminal-bench-4-1:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Large 4 Preview | `artificial-analysis:terminal-bench-science:mistral-large-4-preview` | — | `high` | epoch-ai | epoch-ai:aime:mistral-mistral-large-4-preview-high-epoch-inspect-row-20 |
| Mistral Medium 3.5 | `artificial-analysis:aa-briefcase:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:aa-lcr:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:aa-omniscience:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:aa-omniscience:mistral-medium-3-5:index` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:critpt:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:frontier-code-2-0:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:gdp-pdf:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:gdpval-aa:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:gpqa-diamond:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:hle-diamond:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:humanitys-last-exam:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:ifbench:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:mistral-mistral-medium-3-5-aa-index:intelligence-index-v5-0-2` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:scicode:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:tau3-banking:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:terminal-bench-2-1:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:terminal-bench-4-0:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:terminal-bench-4-1:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Mistral Medium 3.5 | `artificial-analysis:terminal-bench-science:mistral-medium-3-5` | — | `high` | vals-ai | vals-ai:code-migration:mistralai-mistral-medium-3-5 |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-briefcase:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-lcr:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b:index` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:critpt-v2:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:critpt:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:frontier-code-2-0:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gdp-pdf:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gdpval-aa:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gpqa-diamond:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:hle-diamond:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:humanitys-last-exam:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:ifbench:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:nvidia-nemotron-3-ultra-aa-index:intelligence-index-v5-0-2` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:scicode:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:tau3-banking:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-2-1:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-4-0:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-4-1:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-science:nvidia-nemotron-3-ultra-550b-a55b` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |
| Nemotron 3.5 Super VL | `artificial-analysis:aa-briefcase:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:aa-lcr:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:aa-omniscience:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:aa-omniscience:nemotron-3-5-super-vl:index` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:critpt-v2:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:critpt:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:frontier-code-2-0:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:frontierphysics:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:gdp-pdf:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:gdpval-aa:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:hle-diamond:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:humanitys-last-exam:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:nvidia-nemotron-3-5-super-vl-aa-index:intelligence-index-v5-0-2` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:scicode:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:terminal-bench-4-0:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:terminal-bench-4-1:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Nemotron 3.5 Super VL | `artificial-analysis:terminal-bench-science:nemotron-3-5-super-vl` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |
| Qwen3.8 Max | `artificial-analysis:aa-briefcase:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:aa-lcr:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:critpt:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:gdp-pdf:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:gdpval-aa:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:gpqa-diamond:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:humanitys-last-exam:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:scicode:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:tau3-banking:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:terminal-bench-2-1:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:terminal-bench-4-0:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:terminal-bench-4-1:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-briefcase:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-lcr:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-omniscience:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-omniscience:qwen3-8-max:index` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:alibaba-qwen3-8-max-aa-index:intelligence-index-v5-0-2` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:apex-agents:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:critpt-v2:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:critpt:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:frontier-code-2-0:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:gdp-pdf:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:gdpval-aa:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:gpqa-diamond:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:hle-diamond:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:humanitys-last-exam:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:mka:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:scicode:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:tau3-banking:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-2-1:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-4-0:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-4-1:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-science:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:aa-briefcase:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:aa-lcr:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:aa-omniscience:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:aa-omniscience:qwen3-8-flash-next:index` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:alibaba-qwen3-8-flash-next-aa-index:intelligence-index-v5-0-2` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:critpt-v2:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:critpt:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:frontier-code-2-0:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:gdp-pdf:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:gdpval-aa:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:gpqa-diamond:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:hle-diamond:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:humanitys-last-exam:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:scicode:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:tau3-banking:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:terminal-bench-2-1:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:terminal-bench-4-0:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:terminal-bench-4-1:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen3.8-Flash-Next | `artificial-analysis:terminal-bench-science:qwen3-8-flash-next` | — | `xhigh` | maxxbench | maxxbench:maxxbench:qwen-xhigh |
| Qwen4 Max | `artificial-analysis:aa-briefcase:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:aa-omniscience:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:aa-omniscience:qwen4-max:index` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:alibaba-qwen4-max-aa-index:intelligence-index-v5-0-2` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:apex-agents:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:critpt-v2:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:frontier-code-2-0:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:frontierphysics:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:gdp-pdf:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:gdpval-aa:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:hle-diamond:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:terminal-bench-4-0:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:terminal-bench-4-1:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Qwen4 Max | `artificial-analysis:terminal-bench-science:qwen4-max` | — | `xhigh` | epoch-ai | epoch-ai:aime:alibaba-qwen4-max-xhigh-epoch-inspect-row-1 |
| Tencent Hy4 | `artificial-analysis:aa-briefcase:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:aa-omniscience:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:aa-omniscience:tencent-hy4:index` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:critpt-v2:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:frontier-code-2-0:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:frontierphysics:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:gdp-pdf:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:hle-diamond:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:tencent-hy4-aa-index:intelligence-index-v5-0-2` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:terminal-bench-4-0:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:terminal-bench-4-1:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |
| Tencent Hy4 | `artificial-analysis:terminal-bench-science:tencent-hy4` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-hy4-reasoning-high:1-1 |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| A.X-K2 | `artificial-analysis:aa-briefcase:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:aa-lcr:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:aa-omniscience:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:aa-omniscience:a-x-k2:index` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:critpt:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:frontier-code-2-0:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:gdp-pdf:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:gdpval-aa:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:gpqa-diamond:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:hle-diamond:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:humanitys-last-exam:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:scicode:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:sk-telecom-a-x-k2-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:tau3-banking:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:terminal-bench-2-1:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:terminal-bench-4-0:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:terminal-bench-4-1:a-x-k2` | — | `default` | — | — |
| A.X-K2 | `artificial-analysis:terminal-bench-science:a-x-k2` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:aa-briefcase:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:aa-lcr:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:aa-omniscience:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:aa-omniscience:agnes-2-5-pro-theta:index` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:agnes-agnes-2-5-pro-theta-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:critpt-v2:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:critpt:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:frontier-code-2-0:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:gdp-pdf:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:gdpval-aa:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:hle-diamond:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:humanitys-last-exam:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:scicode:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:terminal-bench-4-0:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:terminal-bench-4-1:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:terminal-bench-science:agnes-2-5-pro-theta` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:aa-briefcase:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:aa-lcr:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:aa-omniscience:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:aa-omniscience:apodex-1-1:index` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:apex-agents:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:apodex-apodex-1-1-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:critpt-v2:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:critpt:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:frontier-code-2-0:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:gdp-pdf:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:gdpval-aa:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:gpqa-diamond:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:hle-diamond:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:humanitys-last-exam:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:scicode:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:tau3-banking:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:terminal-bench-2-1:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:terminal-bench-4-0:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:terminal-bench-4-1:apodex-1-1` | — | `default` | — | — |
| Apodex 1.1 | `artificial-analysis:terminal-bench-science:apodex-1-1` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:aa-briefcase:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:aa-lcr:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:aa-omniscience:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:aa-omniscience:gemma-4-e4b:index` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:critpt:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:frontier-code-2-0:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:gdp-pdf:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:gdpval-aa:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:google-gemma-4-e4b-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:gpqa-diamond:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:hle-diamond:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:humanitys-last-exam:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:ifbench:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:scicode:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:terminal-bench-2-1:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:terminal-bench-4-0:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:terminal-bench-4-1:gemma-4-e4b` | — | `default` | — | — |
| Gemma 4 E4B (Reasoning) | `artificial-analysis:terminal-bench-science:gemma-4-e4b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:aa-briefcase:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:aa-lcr:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:aa-omniscience:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:aa-omniscience:granite-4-2-30b:index` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:critpt:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:gdp-pdf:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:gdpval-aa:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:gpqa-diamond:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:hle-diamond:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:humanitys-last-exam:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:scicode:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:tau3-banking:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:terminal-bench-2-1:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:terminal-bench-4-0:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:terminal-bench-4-1:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 30B | `artificial-analysis:terminal-bench-science:granite-4-2-30b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:aa-briefcase:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:aa-lcr:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:aa-omniscience:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:aa-omniscience:granite-4-2-8b:index` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:critpt:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:gdp-pdf:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:gdpval-aa:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:gpqa-diamond:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:hle-diamond:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:humanitys-last-exam:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:scicode:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:tau3-banking:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:terminal-bench-2-1:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:terminal-bench-4-0:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:terminal-bench-4-1:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:terminal-bench-science:granite-4-2-8b` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:aa-briefcase:k2-horizon-32b` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:aa-omniscience:k2-horizon-32b` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:aa-omniscience:k2-horizon-32b:index` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:frontier-code-2-0:k2-horizon-32b` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:gdp-pdf:k2-horizon-32b` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:hle-diamond:k2-horizon-32b` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:ifm-k2-horizon-32b-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:terminal-bench-4-0:k2-horizon-32b` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:terminal-bench-4-1:k2-horizon-32b` | — | `default` | — | — |
| K2 Horizon 32B | `artificial-analysis:terminal-bench-science:k2-horizon-32b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:aa-briefcase:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:aa-lcr:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:aa-omniscience:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:aa-omniscience:k2-horizon-375b-a23b:index` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:critpt-v2:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:critpt:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:frontier-code-2-0:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:gdp-pdf:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:gdpval-aa:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:gpqa-diamond:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:hle-diamond:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:humanitys-last-exam:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:ifm-k2-horizon-375b-a23b-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:scicode:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:tau3-banking:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:terminal-bench-2-1:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:terminal-bench-4-0:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:terminal-bench-4-1:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 375B A23B | `artificial-analysis:terminal-bench-science:k2-horizon-375b-a23b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:aa-briefcase:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:aa-lcr:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:aa-omniscience:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:aa-omniscience:k2-horizon-7b:index` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:critpt:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:frontier-code-2-0:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:gdp-pdf:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:gdpval-aa:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:gpqa-diamond:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:hle-diamond:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:humanitys-last-exam:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:ifm-k2-horizon-7b-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:scicode:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:tau3-banking:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:terminal-bench-2-1:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:terminal-bench-4-0:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:terminal-bench-4-1:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon 7B | `artificial-analysis:terminal-bench-science:k2-horizon-7b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:aa-briefcase:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:aa-lcr:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:aa-omniscience:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:aa-omniscience:k2-horizon-mova-36b-a4b:index` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:critpt:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:frontier-code-2-0:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:gdp-pdf:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:gdpval-aa:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:gpqa-diamond:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:hle-diamond:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:humanitys-last-exam:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:ifm-k2-horizon-mova-36b-a4b-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:scicode:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:tau3-banking:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:terminal-bench-2-1:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:terminal-bench-4-0:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:terminal-bench-4-1:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| K2 Horizon MoVA 36B A4B | `artificial-analysis:terminal-bench-science:k2-horizon-mova-36b-a4b` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:aa-briefcase:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:aa-lcr:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:apex-agents:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:critpt:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:gdp-pdf:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:gdpval-aa:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:gpqa-diamond:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:humanitys-last-exam:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:ifbench:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:scicode:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:tau3-banking:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:terminal-bench-2-1:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:terminal-bench-4-0:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:terminal-bench-4-1:kimi-k2-6` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:aa-briefcase:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:aa-lcr:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:aa-omniscience:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:aa-omniscience:ling-3-1-flash:index` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:critpt-v2:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:critpt:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:frontier-code-2-0:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:gdp-pdf:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:gdpval-aa:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:hle-diamond:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:humanitys-last-exam:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:inclusionai-ling-3-1-flash-1019-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:scicode:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:terminal-bench-4-0:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:terminal-bench-4-1:ling-3-1-flash` | — | `default` | — | — |
| Ling 3.1 Flash 1019 | `artificial-analysis:terminal-bench-science:ling-3-1-flash` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:aa-briefcase:ling-3-2-air` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:aa-omniscience:ling-3-2-air` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:aa-omniscience:ling-3-2-air:index` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:critpt-v2:ling-3-2-air` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:frontier-code-2-0:ling-3-2-air` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:gdp-pdf:ling-3-2-air` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:hle-diamond:ling-3-2-air` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:inclusionai-ling-3-2-air-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:terminal-bench-4-0:ling-3-2-air` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:terminal-bench-4-1:ling-3-2-air` | — | `default` | — | — |
| Ling-3.2-air | `artificial-analysis:terminal-bench-science:ling-3-2-air` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:aa-briefcase:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:aa-lcr:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:apex-agents:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:critpt:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:gdp-pdf:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:gdpval-aa:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:gpqa-diamond:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:humanitys-last-exam:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:ifbench:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:scicode:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:tau3-banking:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:terminal-bench-2-1:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:terminal-bench-4-0:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:terminal-bench-4-1:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:aa-briefcase:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:aa-lcr:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:aa-omniscience:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:aa-omniscience:mimo-v2-6-flash:index` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:critpt:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:frontier-code-2-0:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:gdp-pdf:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:gdpval-aa:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:hle-diamond:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:humanitys-last-exam:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:scicode:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:terminal-bench-4-0:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:terminal-bench-4-1:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:terminal-bench-science:mimo-v2-6-flash` | — | `default` | — | — |
| MiMo-V2.6-Flash | `artificial-analysis:xiaomi-mimo-v2-6-flash-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:aa-briefcase:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:aa-lcr:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:aa-omniscience:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:aa-omniscience:mistral-small-4:index` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:critpt:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:frontier-code-2-0:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:gdp-pdf:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:gdpval-aa:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:gpqa-diamond:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:hle-diamond:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:humanitys-last-exam:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:ifbench:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:mistral-mistral-small-4-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:scicode:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:tau3-banking:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:terminal-bench-2-1:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:terminal-bench-4-0:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:terminal-bench-4-1:mistral-small-4` | — | `default` | — | — |
| Mistral Small 4 (Reasoning) | `artificial-analysis:terminal-bench-science:mistral-small-4` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:aa-briefcase:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:aa-lcr:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:critpt:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:gdpval-aa:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:gpqa-diamond:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:humanitys-last-exam:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:ifbench:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:terminal-bench-2-1:muse-spark` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:aa-briefcase:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:aa-omniscience:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:aa-omniscience:nanbeige4-3-33b:index` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:frontier-code-2-0:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:gdp-pdf:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:hle-diamond:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:nanbeige-nanbeige4-3-33b-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:terminal-bench-4-0:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:terminal-bench-4-1:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:terminal-bench-science:nanbeige4-3-33b` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:aa-briefcase:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:aa-lcr:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:aa-omniscience:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:aa-omniscience:nemotron-3-5-lightning:index` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:critpt:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:frontier-code-2-0:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:gdp-pdf:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:gdpval-aa:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:gpqa-diamond:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:hle-diamond:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:humanitys-last-exam:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:nvidia-nemotron-3-5-lightning-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:scicode:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:tau3-banking:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:terminal-bench-2-1:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:terminal-bench-4-0:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:terminal-bench-4-1:nemotron-3-5-lightning` | — | `default` | — | — |
| Nemotron 3.5 Lightning | `artificial-analysis:terminal-bench-science:nemotron-3-5-lightning` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:aa-briefcase:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:aa-lcr:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:aa-omniscience:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:aa-omniscience:north-mini-code:index` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:cohere-north-mini-code-1-0-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:critpt:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:frontier-code-2-0:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:gdp-pdf:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:gdpval-aa:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:gpqa-diamond:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:hle-diamond:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:humanitys-last-exam:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:ifbench:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:scicode:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:tau3-banking:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:terminal-bench-2-1:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:terminal-bench-4-0:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:terminal-bench-4-1:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:terminal-bench-science:north-mini-code` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:aa-briefcase:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:aa-lcr:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:critpt:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:gdp-pdf:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:gdpval-aa:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:gpqa-diamond:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:humanitys-last-exam:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:ifbench:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:scicode:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:tau3-banking:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:terminal-bench-2-1:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:terminal-bench-4-0:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:terminal-bench-4-1:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:aa-briefcase:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:aa-lcr:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:apex-agents:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:critpt:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:gdp-pdf:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:gdpval-aa:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:gpqa-diamond:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:hle-diamond:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:humanitys-last-exam:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:ifbench:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:scicode:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:tau3-banking:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:terminal-bench-2-1:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:terminal-bench-4-0:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:terminal-bench-4-1:qwen3-7-plus` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:aa-briefcase:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:aa-lcr:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:aa-omniscience:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:aa-omniscience:solar-pro4:index` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:critpt:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:frontier-code-2-0:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:gdp-pdf:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:gdpval-aa:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:gpqa-diamond:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:hle-diamond:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:humanitys-last-exam:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:scicode:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:tau3-banking:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:terminal-bench-2-1:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:terminal-bench-4-0:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:terminal-bench-4-1:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:terminal-bench-science:solar-pro4` | — | `default` | — | — |
| Solar Pro 4 | `artificial-analysis:upstage-solar-pro-4-aa-index:intelligence-index-v5-0-2` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
