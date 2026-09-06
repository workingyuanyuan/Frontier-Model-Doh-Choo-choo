# Artificial Analysis acquisition validation

- Evaluation pages combined: `omniscience`, `gdpval-aa`, `apex-agents-aa`, `aa-briefcase`, `critpt`, `tau3-banking`, `gpqa-diamond`, `humanitys-last-exam`, `ifbench`, `scicode`, `terminalbench-v2-1`, `artificial-analysis-long-context-reasoning`, `mmmu-pro`, `aa-analyst-agent`, `automationbench-aa`, `enterprise-ops-gym-aa`, `harvey-lab-aa`, `itbench-aa`
- Model-set composition: union every page row, keep only non-deprecated rows released on or after 2025-08-17, then fetch `/models/<slug>` detail payloads for task cost and token-price fields.
- `$undefined` is treated as missing data together with `null`; it never creates a CandidateResult or CostRecord.

## Exact counts

| Check | Count |
|---|---:|
| Unique profile rows across all captured page payloads | 80 |
| Unique profile rows in evaluation-page payloads | 62 |
| Unique profile rows in model-detail payloads | 54 |
| Profile rows in the /models payload | 23 |
| Active profile rows (2025-08-17 cutoff, not deprecated) | 66 |
| Generated CandidateResults | 785 |
| Intelligence Index candidates (EXCLUDED) | 65 |
| GDPval-AA normalized candidates | 53 |
| Canonically unresolved candidates | 237 |
| MEASURED_TASK cost rows | 52 |
| API_STANDARDIZED token-price rows | 64 |

## Page composition finding

- The rendered `/models` catalog total is checked separately by the refresh command; its RSC payload exposes 23 selected profile rows in this capture.
- The evaluation-page payload union exposes 62 profiles. `/evaluations/gdpval-aa` carries 0 `gdpvalNormalized` values, so normalized GDPval-AA is read from the model-detail payload that actually carries the field.
- The model-detail payload union exposes 54 profiles and is the source for Intelligence Index, normalized GDPval-AA, task cost, and token-price fields when present.
- Missing Index, score, or cost remains absent; it is not estimated or filled with zero.

## API cross-validation

- API source unavailable; page pipeline remains authoritative.
- No real API differences recorded beyond rounding.
- Warning: ARTIFICIAL_ANALYSIS_API_KEY is not set; API cross-validation skipped.

## Scope and semantics

- Artificial Analysis composite indices remain `EXCLUDED`; direct evaluation scores are the only AA rows eligible for the eight-dimensional product score.
- Token prices are `API_STANDARDIZED` and task costs are `MEASURED_TASK`; the two cost semantics are emitted as separate records.
- No missing score, identity, or cost is inferred.

## Visible comparison

- Fresh rendered models page catalog total: 643
- Unique profiles across the captured models, evaluation, and model-detail payloads: 80
- Result: scopes differ. The catalog total includes models outside the selected evaluation pages; it is recorded for visual validation but is not used to synthesize missing score rows.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Unique source profiles | 482 | 80 | -402 |
| Active source profiles | 223 | 66 | -157 |
| Candidate results | 2194 | 785 | -1409 |
| Materialized costs | 307 | 116 | -191 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `artificial-analysis`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-briefcase:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-lcr:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-omniscience:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-omniscience:gemini-3-1-pro-preview:index` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:apex-agents:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:critpt:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gdpval-aa:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:google-gemini-3-1-pro-preview-aa-index:intelligence-index-v4-2` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gpqa-diamond:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:humanitys-last-exam:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:ifbench:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:scicode:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:tau3-banking:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:terminal-bench-2-1:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-briefcase:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-lcr:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite:index` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:critpt:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gdpval-aa:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:google-gemini-3-5-flash-lite-aa-index:intelligence-index-v4-2` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gpqa-diamond:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:humanitys-last-exam:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:scicode:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:tau3-banking:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-2-1:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| MiniMax-M3 | `artificial-analysis:aa-briefcase:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:aa-lcr:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3:index` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:critpt:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:gdpval-aa:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:gpqa-diamond:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:humanitys-last-exam:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:ifbench:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:minimax-minimax-m3-aa-index:intelligence-index-v4-2` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:scicode:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:tau3-banking:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| MiniMax-M3 | `artificial-analysis:terminal-bench-2-1:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| Qwen3.8 Max | `artificial-analysis:aa-briefcase:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:aa-lcr:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:aa-omniscience:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:aa-omniscience:qwen3-8-max:index` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:alibaba-qwen3-8-max-aa-index:intelligence-index-v4-2` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:critpt:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:gdpval-aa:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:gpqa-diamond:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:humanitys-last-exam:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:scicode:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:tau3-banking:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:terminal-bench-2-1:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
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
| MiMo-V2.5-Pro | `artificial-analysis:xiaomi-mimo-v2-5-pro-aa-index:intelligence-index-v4-2` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-briefcase:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-lcr:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b:index` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:critpt:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gpqa-diamond:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:humanitys-last-exam:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:ifbench:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:nvidia-nemotron-3-ultra-aa-index:intelligence-index-v4-2` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:scicode:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:tau3-banking:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-2-1:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
