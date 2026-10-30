# Artificial Analysis acquisition validation

- Evaluation pages combined: `omniscience`, `gdpval-aa`, `gdp-pdf`, `apex-agents-aa`, `aa-briefcase`, `critpt`, `tau3-banking`, `gpqa-diamond`, `humanitys-last-exam`, `ifbench`, `scicode`, `terminalbench-v2-1`, `artificial-analysis-long-context-reasoning`, `mmmu-pro`, `aa-analyst-agent`, `automationbench-aa`, `enterprise-ops-gym-aa`, `harvey-lab-aa`, `itbench-aa`, `hle-diamond`, `terminal-bench-science`, `critpt-v2`, `frontiercode-2-0`, `terminalbench-4-0`
- Model-set composition: union every page row, keep non-deleted rows released on or after 2025-08-17 including deprecated models, then fetch `/models/<slug>` detail payloads for task cost and token-price fields.
- `$undefined` is treated as missing data together with `null`; it never creates a CandidateResult or CostRecord.

## Exact counts

| Check | Count |
|---|---:|
| Unique profile rows across all captured page payloads | 219 |
| Unique profile rows in evaluation-page payloads | 101 |
| Unique profile rows in model-detail payloads | 219 |
| Profile rows in the /models payload | 28 |
| Eligible profile rows (2025-08-17 cutoff, including deprecated) | 219 |
| Generated CandidateResults | 2636 |
| Intelligence Index candidates (EXCLUDED) | 85 |
| GDPval-AA normalized candidates | 184 |
| Canonically unresolved candidates | 764 |
| MEASURED_TASK cost rows | 83 |
| API_STANDARDIZED token-price rows | 211 |

## Page composition finding

- The rendered `/models` catalog total is checked separately by the refresh command; its RSC payload exposes 28 selected profile rows in this capture.
- The evaluation-page payload union exposes 101 profiles. `/evaluations/gdpval-aa` carries 0 `gdpvalNormalized` values, so normalized GDPval-AA is read from the model-detail payload that actually carries the field.
- The model-detail payload union exposes 219 profiles and is the source for Intelligence Index, normalized GDPval-AA, task cost, and token-price fields when present.
- Missing Index, score, or cost remains absent; it is not estimated or filled with zero.

## API cross-validation

- API source: `https://artificialanalysis.ai/api/v2/data/llms/models`; matched rows 219, compared values 1081.
- Precision-only differences (API rounds to three decimals, within 0.0005): 540. These are representation differences, not disagreements.
- Real differences (beyond 0.0005): 0.
- No real API differences recorded beyond rounding.

## Scope and semantics

- Artificial Analysis composite indices remain `EXCLUDED`; direct evaluation scores are the only AA rows eligible for the eight-dimensional product score.
- Token prices are `API_STANDARDIZED` and task costs are `MEASURED_TASK`; the two cost semantics are emitted as separate records.
- No missing score, identity, or cost is inferred.

## Intelligence Index v5 evaluations

Integrated for scoring on 2026-10-28 (user decision: AA v5 additions are scored).

| Evaluation page | Field | Benchmark ID | Candidates | Canonically resolved |
|---|---|---|---:|---:|
| `terminalbench-4-0` | `terminalBench40` | `terminal-bench-4-0` | 166 | 124 |
| `hle-diamond` | `hleDiamond` | `hle-diamond` | 108 | 73 |
| `terminal-bench-science` | `terminalBenchScience` | `terminal-bench-science` | 102 | 73 |
| `critpt-v2` | `critptAgentic` | `critpt-v2` | 40 | 24 |
| `frontiercode-2-0` | `frontierCode20` | `frontier-code-2-0` | 85 | 59 |

- `frontier-code-2-0` is shared with the organizer source `frontier-code` (Cognition). AA rows are INDEPENDENT/PARTIAL_SOURCE, so the ORGANIZER row wins every overlapping profile; AA rows only fill profiles Cognition did not run.
- `critpt-v2` uses the Full Set (`critptAgentic`, the default leaderboard tab). The Index weights the 40-question Hard Subset (`critptAgenticHard`), which is not materialized.
- Not integrated: AutomationBench-AA (`automationBenchPartialScore`); CritPt v2 Hard Subset (`critptAgenticHard`); AA FrontierCode 1.1 (`frontierCode`).

## Visible comparison

- Fresh rendered models page catalog total: 718
- Unique profiles across the captured models, evaluation, and model-detail payloads: 219
- Result: scopes differ. The catalog total includes models outside the selected evaluation pages; it is recorded for visual validation but is not used to synthesize missing score rows.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Unique source profiles | 215 | 219 | +4 |
| Active source profiles | 215 | 219 | +4 |
| Candidate results | 2568 | 2636 | +68 |
| Materialized costs | 282 | 294 | +12 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `artificial-analysis`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
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
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-briefcase:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-lcr:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite:index` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:critpt-v2:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:critpt:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:frontier-code-2-0:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gdp-pdf:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gdpval-aa:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:google-gemini-3-5-flash-lite-aa-index:intelligence-index-v5-0` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gpqa-diamond:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:hle-diamond:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:humanitys-last-exam:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:scicode:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:tau3-banking:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-2-1:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-4-0:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-science:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| GLM-5.1 (Reasoning) | `artificial-analysis:aa-briefcase:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:aa-lcr:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:critpt:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:gdp-pdf:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:gdpval-aa:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:gpqa-diamond:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:humanitys-last-exam:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:ifbench:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:scicode:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:tau3-banking:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:terminal-bench-2-1:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:terminal-bench-4-0:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-95:1-0-6 |
| Kimi K3.1 Pro | `artificial-analysis:aa-briefcase:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:aa-lcr:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:aa-omniscience:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:aa-omniscience:kimi-k3-1-pro:index` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:critpt-v2:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:critpt:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:frontier-code-2-0:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:gdp-pdf:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:gdpval-aa:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:hle-diamond:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:humanitys-last-exam:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:moonshot-kimi-k3-1-pro-aa-index:intelligence-index-v5-0` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:scicode:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:terminal-bench-4-0:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| Kimi K3.1 Pro | `artificial-analysis:terminal-bench-science:kimi-k3-1-pro` | — | `max` | livebench | livebench-2026-10-25:livebench-browser:kimi-k3-1-pro |
| MiniMax-M3 | `artificial-analysis:aa-briefcase:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:aa-lcr:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3:index` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:critpt-v2:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:critpt:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:frontier-code-2-0:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:gdp-pdf:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:gdpval-aa:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:gpqa-diamond:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:hle-diamond:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:humanitys-last-exam:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:ifbench:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:minimax-minimax-m3-aa-index:intelligence-index-v5-0` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:scicode:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:tau3-banking:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:terminal-bench-2-1:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:terminal-bench-4-0:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| MiniMax-M3 | `artificial-analysis:terminal-bench-science:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
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
| Qwen3.8 Max (0902) | `artificial-analysis:aa-briefcase:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-lcr:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-omniscience:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-omniscience:qwen3-8-max:index` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:alibaba-qwen3-8-max-aa-index:intelligence-index-v5-0` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:apex-agents:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:critpt-v2:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:critpt:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:frontier-code-2-0:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:gdp-pdf:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:gdpval-aa:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:gpqa-diamond:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:hle-diamond:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:humanitys-last-exam:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:scicode:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:tau3-banking:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-2-1:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-4-0:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-science:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
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
| Muse Spark | `artificial-analysis:aa-briefcase:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:aa-lcr:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:critpt:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:gdpval-aa:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:gpqa-diamond:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:humanitys-last-exam:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:ifbench:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:terminal-bench-2-1:muse-spark` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-briefcase:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-lcr:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b:index` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:critpt-v2:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:critpt:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:frontier-code-2-0:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gdp-pdf:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gdpval-aa:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gpqa-diamond:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:hle-diamond:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:humanitys-last-exam:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:ifbench:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:nvidia-nemotron-3-ultra-aa-index:intelligence-index-v5-0` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:scicode:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:tau3-banking:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-2-1:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-4-0:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-science:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
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

<!-- C6-EFFORT-INFERENCE:END -->
