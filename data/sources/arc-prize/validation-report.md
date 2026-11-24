# ARC Prize acquisition validation

- Leaderboard Page: <https://arcprize.org/leaderboard>
- Evaluations Export: <https://arcprize.org/media/data/evaluations.json>
- Models Export: <https://arcprize.org/media/data/models.json>
- Datasets Export: <https://arcprize.org/media/data/datasets.json>
- Evaluations evidence: `sha256:b0a982bcca21daacdce77b8662fa00730ebdf56e50092e67af2251b9b26dd3bf`
- Models evidence: `sha256:55b22723416758db2a159581c1db82966919a93f68775602995363577db55478`
- Datasets evidence: `sha256:ad1595f5e707a715afe36f49d918c5de085a11246ae53029dfead5ecc17731b6`
- Page evidence: `sha256:83c177d73c2e0e8f011db30a60de74f17c4fb6dfcd1fee79ef4e8522fc7ad8e6`
- Observed at: 2026-11-23T13:29:46.761Z

## Exact counts

| Check | Count |
|---|---:|
| Total evaluation rows (all splits) | 1395 |
| Total models in models.json | 418 |
| Total datasets in datasets.json | 8 |
| Total v2_Semi_Private evaluations | 324 |
| Promoted v2_Semi_Private rows (display=true) | 318 |
| Promoted cost records (USD/task) | 318 |
| Canonically resolved rows | 194 |
| Canonically unresolved rows | 124 |
| Canonically unresolved models | 124 |
| Excluded candidate rows | 8 |

## CandidateResults per benchmark

| Benchmark | Split Version | Promoted Rows |
|---|---|---:|
| `arc-agi-2` | `ARC-AGI-2-v2_Semi_Private` | 318 |

## Completeness and machine cross-checks

- Model completeness: All 318/318 promoted evaluation rows matched a declared modelId in `models.json`. Missing model IDs: 0.
- Scope restriction: Only `v2_Semi_Private` (ARC-AGI-2) with `display=true` is promoted per user ruling 2026-08-22 (plan D1). Other splits (v1_*, v2_Public_Eval, v2_Private_Eval, v3_*) are preserved in raw content-addressed artifacts and not mixed into `arc-agi-2`.
- Cost coverage: 318/318 promoted rows carry numeric `costPerTask` (preserved as `AGENT_TASK` / `USD_PER_TASK`).
- Page evidence captured: `https://arcprize.org/leaderboard` captured with method `DOM` for human spot-check audit.

## Identity and effort policy

Exact catalog resolution succeeded for 194/318 promoted rows (124 unresolved rows across 124 distinct model names).
Effort tiers are derived from the model display name trailing parentheticals using the canonical effort policy (`max/xhigh/high/medium/low/non-reasoning`). Reasoning-off indicators (`(None)`, `(Thinking, None)`) are filed as `non-reasoning` per §4.4 rule 2. Non-effort parentheticals such as token budgets (`Thinking 16K`, `120K`) remain null effort without illegal profile IDs.

## Excluded rows

| Reason | Excluded Rows |
|---|---:|
| ARC published both Minimal and Low labels for this model; minimal cannot represent low. | 7 |
| Unrecognised configuration segment "Refinement" has not been reviewed as an effort tier. | 1 |

### ARC published both Minimal and Low labels for this model; minimal cannot represent low. (7 rows)

- Gemini 3.5 Flash-Lite (Minimal) (`google-gemini-3-5-flash-lite`)
- Gemini 3.6 Flash (Minimal) (`google-gemini-3-6-flash`)
- Gemini 3 Flash Preview (Minimal) (unresolved)
- GPT-5 (Minimal) (unresolved)
- GPT-5 Mini (Minimal) (unresolved)
- GPT-5 Nano (Minimal) (unresolved)
- Inkling Small (Minimal) (`thinking-machines-inkling-small`)

### Unrecognised configuration segment "Refinement" has not been reviewed as an effort tier. (1 row)

- GPT-5.2 (Refinement) (`openai-gpt-5-2`)

## Unresolved model names

- ARChitects
- Claude 3.7
- Claude 3.7 (16K)
- Claude 3.7 (1K)
- Claude 3.7 (8K)
- Claude 4.7 (High)
- Claude 4.7 (Low)
- Claude 4.7 (Max)
- Claude 4.7 (Medium)
- Claude Haiku 4.5
- Claude Haiku 4.5 (Thinking 16K)
- Claude Haiku 4.5 (Thinking 1K)
- Claude Haiku 4.5 (Thinking 32K)
- Claude Haiku 4.5 (Thinking 8K)
- Claude Opus 4
- Claude Opus 4 (Thinking 16K)
- Claude Opus 4 (Thinking 1K)
- Claude Opus 4 (Thinking 8K)
- Claude Sonnet 4
- Claude Sonnet 4 (Thinking 16K)
- Claude Sonnet 4 (Thinking 1K)
- Claude Sonnet 4 (Thinking 8K)
- Claude Sonnet 4.5
- Claude Sonnet 4.5 (Thinking 16K)
- Claude Sonnet 4.5 (Thinking 1K)
- Claude Sonnet 4.5 (Thinking 32K)
- Claude Sonnet 4.5 (Thinking 8K)
- Codex Mini (Latest)
- Deepseek R1
- Deepseek R1 (05/28)
- Deepseek V3.2
- DeepSeek V4.1 Flash (High)
- DeepSeek V4.1 Flash (Low)
- DeepSeek V4.1 Flash (Max)
- DeepSeek V4.1 Flash (None)
- Dots3-Note Preview (Max)
- Gemini 1.5 Pro
- Gemini 2.0 Flash
- Gemini 2.5 Flash (Preview)
- Gemini 2.5 Flash (Preview) (Thinking 16K)
- Gemini 2.5 Flash (Preview) (Thinking 1K)
- Gemini 2.5 Flash (Preview) (Thinking 24K)
- Gemini 2.5 Flash (Preview) (Thinking 8K)
- Gemini 2.5 Pro (Thinking 16K)
- Gemini 2.5 Pro (Thinking 1K)
- Gemini 2.5 Pro (Thinking 32K)
- Gemini 2.5 Pro (Thinking 8K)
- Gemini 3 Deep Think (2/26)
- Gemini 3 Deep Think (Preview) ²
- Gemini 3 Flash Preview (High)
- Gemini 3 Flash Preview (Low)
- Gemini 3 Flash Preview (Medium)
- Gemini 3 Flash Preview (Minimal)
- Gemini 3 Pro
- Gemini 3 Pro (Refinement)
- Gemini 3.1 Pro (Preview)
- GLM-5
- GPT-4.1
- GPT-4.1-Mini
- GPT-4.1-Nano
- GPT-4.5
- GPT-4o
- GPT-4o-mini
- GPT-5 (High)
- GPT-5 (Low)
- GPT-5 (Medium)
- GPT-5 (Minimal)
- GPT-5 Mini (High)
- GPT-5 Mini (Low)
- GPT-5 Mini (Medium)
- GPT-5 Mini (Minimal)
- GPT-5 Nano (High)
- GPT-5 Nano (Low)
- GPT-5 Nano (Medium)
- GPT-5 Nano (Minimal)
- GPT-5 Pro
- GPT-5.1 (Thinking, High)
- GPT-5.1 (Thinking, Low)
- GPT-5.1 (Thinking, Medium)
- GPT-5.1 (Thinking, None)
- GPT-5.6 Luna 2026-07-30 (High)
- GPT-5.6 Luna 2026-07-30 (Low)
- GPT-5.6 Luna 2026-07-30 (Max)
- GPT-5.6 Luna 2026-07-30 (Medium)
- GPT-5.6 Luna 2026-07-30 (None)
- GPT-5.6 Luna 2026-07-30 (XHigh)
- Grok 3
- Grok 3 Mini (Low)
- Grok 4 (Fast Reasoning)
- Grok 4 (Refinement)
- Grok 4 (Thinking)
- Grok 4.20 (Reasoning)
- Human Panel
- Icecuber
- Kimi K2.5
- Llama 4 Maverick
- Llama 4 Scout
- Magistral Medium
- Magistral Medium (Thinking)
- Magistral Small
- Mercury 3 Preview (High)
- Mercury 3 Preview (Instant)
- Mercury 3 Preview (Low)
- Mercury 3 Preview (Medium)
- Minimax M2.5
- NVARC
- o1-mini
- o3 (High)
- o3 (Low)
- o3 (Medium)
- o3-mini (Low)
- o3-mini (Medium)
- o3-Pro (High)
- o3-Pro (Low)
- o3-Pro (Medium)
- o4-mini (High)
- o4-mini (Low)
- o4-mini (Medium)
- Opus 4.5 (Thinking, 16K)
- Opus 4.5 (Thinking, 64K)
- Opus 4.5 (Thinking, 8K)
- Opus 4.5 (Thinking, None)
- Qwen3-235b-a22b Instruct (25/07)
- Tiny Recursion Model (TRM)

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `arc-prize`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| GLM-5.2 | `arc-prize:arc-agi-2:glm-5-2:arc-agi-2-v2-semi-private` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| GPT-5.2 | `arc-prize:arc-agi-2:gpt-5-2-2025-12-11-thinking-none:arc-agi-2-v2-semi-private` | — | `xhigh` | biobasicsbench | biobasicsbench:openai-gpt-5-2-xhigh |
| GPT-5.2 (Refinement) | `arc-prize:arc-agi-2:johan-land-gpt-5-2-refine:arc-agi-2-v2-semi-private` | — | `xhigh` | biobasicsbench | biobasicsbench:openai-gpt-5-2-xhigh |
| Inkling | `arc-prize:arc-agi-2:thinky-inkling:arc-agi-2-v2-semi-private` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:inkling |

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
