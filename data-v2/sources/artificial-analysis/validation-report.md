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
| Canonically unresolved candidates | 1769 |
| MEASURED_TASK cost rows | 96 |
| API_STANDARDIZED token-price rows | 223 |

## Page composition finding

- `/evaluations/omniscience` exposes the broad 479-row model-object payload but its task-cost field is sparse for current profiles.
- The combined evaluation-page union contains the complete current profile population; `/models` alone exposes 28 rows and 23 task costs in this capture.
- Detail pages are therefore part of the acquisition contract for task costs. Missing task cost remains absent; it is not estimated or filled with zero.

## API cross-validation

- API source: `https://artificialanalysis.ai/api/v2/data/llms/models`; matched rows 608, compared values 3680, mismatches 2335.
- Mismatch a-x-k2 / hle: page=0.295644114921223, api=0.296
- Mismatch a-x-k2 / gpqa: page=0.856565656565657, api=0.857
- Mismatch a-x-k2 / scicode: page=0.385416666666667, api=0.385
- Mismatch claude-4-5-haiku-reasoning / hle: page=0.103799814643188, api=0.104
- Mismatch claude-4-5-haiku-reasoning / gpqa: page=0.671717171717172, api=0.672
- Mismatch claude-4-5-haiku-reasoning / scicode: page=0.43287037037037, api=0.433
- Mismatch claude-4-5-haiku-reasoning / livecodebench: page=0.614814814814815, api=0.615
- Mismatch claude-fable-5 / hle: page=0.554680259499537, api=0.555
- Mismatch claude-fable-5 / gpqa: page=0.926262626262626, api=0.926
- Mismatch claude-fable-5 / scicode: page=0.601851851851852, api=0.602
- Mismatch claude-opus-5 / hle: page=0.548656163113994, api=0.549
- Mismatch claude-opus-5 / gpqa: page=0.932323232323232, api=0.932
- Mismatch claude-opus-5 / scicode: page=0.556712962962963, api=0.557
- Mismatch command-a-plus / hle: page=0.119555143651529, api=0.12
- Mismatch command-a-plus / gpqa: page=0.760606060606061, api=0.761
- Mismatch command-a-plus / scicode: page=0.378472222222222, api=0.378
- Mismatch deepseek-v4-pro / hle: page=0.410101946246525, api=0.41
- Mismatch deepseek-v4-pro / gpqa: page=0.928282828282828, api=0.928
- Mismatch deepseek-v4-pro / scicode: page=0.491898148148148, api=0.492
- Mismatch gemini-3-5-flash-lite / hle: page=0.188137164040778, api=0.188
- Mismatch gemini-3-5-flash-lite / gpqa: page=0.838383838383838, api=0.838
- Mismatch gemini-3-5-flash-lite / scicode: page=0.408564814814815, api=0.409
- Mismatch gemini-3-7-flash / hle: page=0.478683966635774, api=0.479
- Mismatch gemini-3-7-flash / gpqa: page=0.945454545454545, api=0.945
- Mismatch gemini-3-7-flash / scicode: page=0.568287037037037, api=0.568
- Mismatch glm-5-2 / hle: page=0.411492122335496, api=0.411
- Mismatch glm-5-2 / gpqa: page=0.894949494949495, api=0.895
- Mismatch glm-5-2 / scicode: page=0.50462962962963, api=0.505
- Mismatch gpt-5-6-luna / hle: page=0.394810009267841, api=0.395
- Mismatch gpt-5-6-luna / gpqa: page=0.911111111111111, api=0.911
- Mismatch gpt-5-6-luna / scicode: page=0.525462962962963, api=0.525
- Mismatch gpt-5-6-sol / hle: page=0.494902687673772, api=0.495
- Mismatch gpt-5-6-sol / gpqa: page=0.941414141414141, api=0.941
- Mismatch gpt-5-6-sol / scicode: page=0.561342592592593, api=0.561
- Mismatch gpt-5-6-terra / hle: page=0.429101019462465, api=0.429
- Mismatch gpt-5-6-terra / gpqa: page=0.925252525252525, api=0.925
- Mismatch gpt-5-6-terra / scicode: page=0.539351851851852, api=0.539
- Mismatch gpt-oss-120b / hle: page=0.196014828544949, api=0.196
- Mismatch gpt-oss-120b / gpqa: page=0.781818181818182, api=0.782
- Mismatch gpt-oss-120b / scicode: page=0.388888888888889, api=0.389
- Mismatch gpt-oss-120b / livecodebench: page=0.878306878306878, api=0.878
- Mismatch grok-4-6 / hle: page=0.429101019462465, api=0.429
- Mismatch grok-4-6 / gpqa: page=0.94949494949495, api=0.949
- Mismatch grok-4-6 / scicode: page=0.53587962962963, api=0.536
- Mismatch inkling / hle: page=0.318813716404078, api=0.319
- Mismatch inkling / gpqa: page=0.871717171717172, api=0.872
- Mismatch inkling / scicode: page=0.460648148148148, api=0.461
- Mismatch k-exaone-2-0-0803 / hle: page=0.185820203892493, api=0.186
- Mismatch k-exaone-2-0-0803 / gpqa: page=0.829292929292929, api=0.829
- Mismatch k-exaone-2-0-0803 / scicode: page=0.409722222222222, api=0.41
- Warning: API cross-validation found 2335 mismatched overlapping values.

## Scope and semantics

- Artificial Analysis composite indices remain `EXCLUDED`; direct evaluation scores are the only AA rows eligible for the eight-dimensional product score.
- Token prices are `API_STANDARDIZED` and task costs are `MEASURED_TASK`; the two cost semantics are emitted as separate records.
- No missing score, identity, or cost is inferred.
