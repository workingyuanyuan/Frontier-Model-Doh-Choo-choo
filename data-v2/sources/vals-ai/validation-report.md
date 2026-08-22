# Vals AI acquisition validation

- Index evidence: `sha256:98b427cf22271105ee1154f21f1f8f2637debf837cd7a6627212d567bb49e06f`
- Observed at: 2026-08-22T09:36:20.830Z

## Exact counts

| Check | Count |
|---|---:|
| Benchmark slugs discovered from index | 39 |
| Benchmark pages with BenchmarkView data | 38 |
| CandidateResults | 2532 |
| Included CandidateResults | 1695 |
| Excluded CandidateResults | 837 |
| Non-percent raw scores retained without normalization | 17 |
| CostRecords retained | 2408 |
| Included vals_index CostRecords | 47 |
| Canonically unresolved rows | 1741 |
| Distinct canonically unresolved models | 172 |

## Per-page completeness

| Slug | Parsed overall rows | Scoring status |
|---|---:|---|
| `aime` | 96 | EXCLUDED |
| `case_law_v2` | 54 | EXCLUDED |
| `code-migration` | 51 | APPROVED |
| `corp_fin_v2` | 134 | APPROVED |
| `cyber` | 22 | APPROVED |
| `emb` | 48 | APPROVED |
| `fabv2` | 51 | APPROVED |
| `gpqa` | 135 | APPROVED |
| `hlab` | 52 | APPROVED |
| `ioi` | 62 | APPROVED |
| `lcb` | 140 | APPROVED |
| `legal_bench` | 139 | APPROVED |
| `legal_research` | 51 | APPROVED |
| `math500` | 60 | EXCLUDED |
| `medcode` | 86 | APPROVED |
| `medqa` | 95 | EXCLUDED |
| `medscribe` | 87 | APPROVED |
| `mgsm` | 75 | EXCLUDED |
| `mmlu_pro` | 135 | APPROVED |
| `mmmu` | 90 | EXCLUDED |
| `mortgage_tax` | 96 | EXCLUDED |
| `poker_agent` | 17 | EXCLUDED |
| `programbench` | 41 | APPROVED |
| `proof_bench` | 26 | APPROVED |
| `public-benefits-bench` | 30 | APPROVED |
| `public-benefits-bench-v1` | 13 | EXCLUDED |
| `reverse_eng` | 5 | APPROVED |
| `rsi_index` | 0 | EXCLUDED |
| `sage` | 77 | EXCLUDED |
| `skillsbench` | 30 | APPROVED |
| `swebench` | 86 | APPROVED |
| `tax_eval_v2` | 141 | APPROVED |
| `terminal-bench-2` | 67 | EXCLUDED |
| `terminal-bench-2-1` | 57 | APPROVED |
| `time_horizon_index` | 8 | EXCLUDED |
| `vals_index` | 48 | EXCLUDED |
| `vals_multimodal_index` | 33 | EXCLUDED |
| `vibe-code` | 86 | APPROVED |
| `web_search` | 8 | EXCLUDED |

Every parsed page passed the strict `metadata.total_models === Object.keys(tasks.overall).length` check.

## Approved benchmark and role table

| Vals slug | Source-neutral benchmark ID | Source role |
|---|---|---|
| `code-migration` | `code-migration` | ORGANIZER |
| `corp_fin_v2` | `corpfin` | ORGANIZER |
| `cyber` | `cyber` | INDEPENDENT |
| `emb` | `emb` | ORGANIZER |
| `fabv2` | `finance-agent-v2` | ORGANIZER |
| `gpqa` | `gpqa-diamond` | INDEPENDENT |
| `hlab` | `hlab` | INDEPENDENT |
| `ioi` | `ioi` | INDEPENDENT |
| `lcb` | `livecodebench` | INDEPENDENT |
| `legal_bench` | `legal-bench` | INDEPENDENT |
| `legal_research` | `legal-research` | ORGANIZER |
| `medcode` | `medcode` | ORGANIZER |
| `medscribe` | `medscribe` | ORGANIZER |
| `mmlu_pro` | `mmlu-pro` | INDEPENDENT |
| `programbench` | `programbench` | ORGANIZER |
| `proof_bench` | `proofbench` | ORGANIZER |
| `public-benefits-bench` | `public-benefits-bench` | ORGANIZER |
| `reverse_eng` | `reverse-eng` | ORGANIZER |
| `skillsbench` | `skillsbench` | INDEPENDENT |
| `swebench` | `swe-bench` | INDEPENDENT |
| `tax_eval_v2` | `tax-eval-v2` | ORGANIZER |
| `terminal-bench-2-1` | `terminal-bench-2-1` | INDEPENDENT |
| `vibe-code` | `vibe-code-bench` | ORGANIZER |

Roles are decided benchmark by benchmark: Vals-owned benchmark programs are ORGANIZER; Vals reruns of externally organized benchmarks are INDEPENDENT.

## Unapproved benchmark pages

- `aime`
- `case_law_v2`
- `math500`
- `medqa`
- `mgsm`
- `mmmu`
- `mortgage_tax`
- `poker_agent`
- `public-benefits-bench-v1`
- `rsi_index`
- `sage`
- `terminal-bench-2`
- `time_horizon_index`
- `vals_index`
- `vals_multimodal_index`
- `web_search`

All rows from these pages are retained as EXCLUDED CandidateResults. Composite indices remain excluded regardless of later mapping changes.
Unapproved pages whose `accuracy` field is not a 0–100 percentage (currently Agent Poker Bench ratings) retain the finite raw value but use `normalizedScore: null`; no capability percentage is invented.

## Newly discovered since the reviewed table

- `public-benefits-bench-v1` (not auto-promoted)
- `rsi_index` (not auto-promoted)

## Pages without BenchmarkView data

- `rsi_index`

## Identity and effort policy

Identity resolution is exact catalog/alias resolution only. Unknown names retain their raw source rows with both canonicalModelId and profileId null. No catalog entries or inferred aliases are created by this refresh.
Effort uses the first source-declared value (`reasoning_effort`, otherwise `compute_effort`) only when it is a legal tier. Values such as `0.99` remain null and never create an illegal profile ID.

## Complete unresolved model-name list

- ai21labs/jamba-1.5-large
- ai21labs/jamba-1.5-mini
- ai21labs/jamba-large-1.6
- ai21labs/jamba-mini-1.6
- alibaba/qwen3-max
- alibaba/qwen3-max-2026-01-23
- alibaba/qwen3-max-preview
- alibaba/qwen3-vl-plus-2025-09-23
- alibaba/qwen3.5-flash
- alibaba/qwen3.5-plus-thinking
- alibaba/qwen3.6-max-preview
- ant/ling-3.0-flash-2607
- anthropic/claude-3-5-haiku-20241022
- anthropic/claude-3-5-sonnet-20241022
- anthropic/claude-3-7-sonnet-20250219
- anthropic/claude-3-7-sonnet-20250219-thinking
- anthropic/claude-fable-5-exa
- anthropic/claude-haiku-4-5-20251001
- anthropic/claude-haiku-4-5-20251001-thinking
- anthropic/claude-opus-4-1-20250805
- anthropic/claude-opus-4-1-20250805-thinking
- anthropic/claude-opus-4-20250514
- anthropic/claude-opus-4-20250514-thinking
- anthropic/claude-opus-4-5-20251101
- anthropic/claude-opus-4-5-20251101-thinking
- anthropic/claude-opus-4-6-thinking
- anthropic/claude-opus-4-8-claude-code
- anthropic/claude-sonnet-4-20250514
- anthropic/claude-sonnet-4-20250514-thinking
- anthropic/claude-sonnet-4-5-20250929
- anthropic/claude-sonnet-4-5-20250929-thinking
- anthropic/claude-sonnet-4-6-claude-code
- arcee-ai/trinity-large-thinking
- aristotle/aristotle
- cohere/command-a-03-2025
- cohere/command-r
- cohere/command-r-plus
- cursor/composer-2.5
- deepseek/deepseek-v4-flash-0731
- deepseek/deepseek-v4-pro-0813
- devin/swe-1-6-fast
- fireworks/deepseek-r1
- fireworks/deepseek-v3
- fireworks/deepseek-v3-0324
- fireworks/deepseek-v3p1
- fireworks/deepseek-v3p2
- fireworks/deepseek-v3p2-thinking
- fireworks/gpt-oss-120b
- fireworks/gpt-oss-20b
- fireworks/llama4-maverick-instruct-basic
- fireworks/nemotron-lightning-3p5-30b-a3b
- fireworks/qwen3-235b-a22b
- google/gemini-1.0-pro-002
- google/gemini-1.5-flash-001
- google/gemini-1.5-flash-002
- google/gemini-1.5-pro-002
- google/gemini-2.0-flash-001
- google/gemini-2.0-flash-exp
- google/gemini-2.0-flash-thinking-exp-01-21
- google/gemini-2.0-pro-exp-02-05
- google/gemini-2.5-flash
- google/gemini-2.5-flash-lite
- google/gemini-2.5-flash-lite-preview-09-2025
- google/gemini-2.5-flash-lite-preview-09-2025-thinking
- google/gemini-2.5-flash-preview-04-17
- google/gemini-2.5-flash-preview-04-17-thinking
- google/gemini-2.5-flash-preview-09-2025
- google/gemini-2.5-flash-preview-09-2025-thinking
- google/gemini-2.5-flash-thinking
- google/gemini-2.5-pro
- google/gemini-2.5-pro-exp-03-25
- google/gemini-2.5-pro-preview-03-25
- google/gemini-3-flash-preview
- google/gemini-3.1-flash-lite-preview
- google/gemini-3.5-flash-exa
- google/gemma-4-31b-it
- grok/grok-2-1212
- grok/grok-2-vision-1212
- grok/grok-3
- grok/grok-3-mini-fast-high-reasoning
- grok/grok-3-mini-fast-low-reasoning
- grok/grok-4-0709
- grok/grok-4-1-fast-non-reasoning
- grok/grok-4-1-fast-reasoning
- grok/grok-4-fast-non-reasoning
- grok/grok-4-fast-reasoning
- grok/grok-4.20-0309-reasoning
- grok/grok-4.3
- grok/grok-4.5
- grok/grok-4.5-exa
- grok/grok-4.6
- grok/grok-build-0.1
- grok/grok-code-fast-1
- kimi/kimi-k2-thinking
- kimi/kimi-k2.5-thinking
- kimi/kimi-k2.7-code
- kimi/kimi-k3
- logicalintelligence/alephprover
- minimax/MiniMax-M2.1
- minimax/MiniMax-M2.5
- minimax/MiniMax-M2.7
- mistralai/devstral-2512
- mistralai/labs-devstral-small-2512
- mistralai/magistral-medium-2509
- mistralai/magistral-small-2509
- mistralai/mistral-large-2411
- mistralai/mistral-large-2512
- mistralai/mistral-medium-2505
- mistralai/mistral-medium-3.5
- mistralai/mistral-small-2402
- mistralai/mistral-small-2503
- mistralai/mistral-small-2603
- openai/gpt-3.5-turbo
- openai/gpt-4-turbo
- openai/gpt-4.1-2025-04-14
- openai/gpt-4.1-mini-2025-04-14
- openai/gpt-4.1-nano-2025-04-14
- openai/gpt-4o-2024-05-13
- openai/gpt-4o-2024-08-06
- openai/gpt-4o-2024-11-20
- openai/gpt-4o-mini-2024-07-18
- openai/gpt-5-2025-08-07
- openai/gpt-5-codex
- openai/gpt-5-mini-2025-08-07
- openai/gpt-5-nano-2025-08-07
- openai/gpt-5.1-2025-11-13
- openai/gpt-5.1-codex
- openai/gpt-5.1-codex-max
- openai/gpt-5.2-2025-12-11
- openai/gpt-5.4-2026-03-05
- openai/gpt-5.4-2026-03-05-high
- openai/gpt-5.4-nano-2026-03-17
- openai/gpt-5.5-codex
- openai/gpt-5.5-factory
- openai/gpt-5.6-sol-exa
- openai/o1-2024-12-17
- openai/o1-mini-2024-09-12
- openai/o1-preview-2024-09-12
- openai/o3-2025-04-16
- openai/o3-mini-2025-01-31
- openai/o4-mini-2025-04-16
- poolside/laguna-m.1
- poolside/laguna-xs.2
- thinkingmachines/inkling
- thinkingmachines/inkling-small
- together/google/gemma-2-27b-it
- together/google/gemma-2-9b-it
- together/langston/nim/nvidia/llama-3.3-nemotron-super-49b-v1-42e84561
- together/langston/nim/nvidia/llama-3.3-nemotron-super-49b-v1-42e84561-thinking
- together/meta-llama/Llama-2-70b-hf
- together/meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo
- together/meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo
- together/meta-llama/Llama-3.3-70B-Instruct-Turbo
- together/meta-llama/Llama-4-Scout-17B-16E-Instruct
- together/meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo
- together/meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo
- together/meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo
- together/mistralai/Mistral-7B-v0.1
- together/mistralai/Mixtral-8x22B-Instruct-v0.1
- together/mistralai/Mixtral-8x7B-v0.1
- together/moonshotai/Kimi-K2-Instruct
- together/Qwen/Qwen2.5-72B-Instruct-Turbo
- together/Qwen/Qwen2.5-7B-Instruct-Turbo
- together/togethercomputer/llama-2-13b
- together/togethercomputer/llama-2-7b
- xiaomi/mimo-v2-flash
- xiaomi/mimo-v2.5
- zai/glm-4.5
- zai/glm-4.6
- zai/glm-4.7
- zai/glm-5-thinking
- zai/glm-5.3

## Approved N3a dimension mapping

| Vals slug | Benchmark ID | Primary dimension | Secondary dimensions |
|---|---|---|---|
| `code-migration` | `code-migration` | coding | agentic, context |
| `corp_fin_v2` | `corpfin` | context | reasoning, knowledge |
| `cyber` | `cyber` | agentic | coding, reasoning |
| `emb` | `emb` | agentic | math, context, instruction |
| `fabv2` | `finance-agent-v2` | agentic | knowledge, coding, context |
| `gpqa` | `gpqa-diamond` | reasoning | knowledge |
| `hlab` | `hlab` | agentic | context, knowledge, instruction |
| `ioi` | `ioi` | coding | reasoning, math |
| `lcb` | `livecodebench` | coding | reasoning |
| `legal_bench` | `legal-bench` | reasoning | knowledge, language |
| `legal_research` | `legal-research` | agentic | knowledge, reasoning, context |
| `medcode` | `medcode` | knowledge | context, instruction |
| `medscribe` | `medscribe` | language | context, instruction, knowledge |
| `mmlu_pro` | `mmlu-pro` | knowledge | reasoning |
| `programbench` | `programbench` | coding | agentic, context |
| `proof_bench` | `proofbench` | math | reasoning, coding |
| `public-benefits-bench` | `public-benefits-bench` | agentic | knowledge, language, instruction |
| `reverse_eng` | `reverse-eng` | agentic | reasoning, coding, context |
| `skillsbench` | `skillsbench` | agentic | coding, instruction |
| `swebench` | `swe-bench` | coding | agentic, context |
| `tax_eval_v2` | `tax-eval-v2` | knowledge | reasoning, math |
| `terminal-bench-2-1` | `terminal-bench-2-1` | coding | agentic |
| `vibe-code` | `vibe-code-bench` | coding | agentic, context |

The N3a user ruling remains authoritative. The deferred multimodal watchlist includes `sage` and `mortgage_tax`; neither is promoted by this refresh.
## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Benchmark slugs discovered from index | 39 | 39 | +0 |
| CandidateResults | 2532 | 2532 | +0 |
| CostRecords retained | 2408 | 2408 | +0 |
| Canonically unresolved rows | 1741 | 1741 | +0 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `vals-ai`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| alibaba/qwen3.8-max | `vals-ai:code-migration:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:corpfin:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:emb:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:finance-agent-v2:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:gpqa-diamond:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:hlab:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:ioi:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:legal-bench:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:legal-research:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:livecodebench:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:medcode:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:medscribe:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:mmlu-pro:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:mmmu:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:mortgage-tax:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:programbench:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:proofbench:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:public-benefits-bench:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:sage:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:skillsbench:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:swe-bench:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:tax-eval-v2:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:terminal-bench-2-1:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:vals-index:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:vals-multimodal-index:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| alibaba/qwen3.8-max | `vals-ai:vibe-code-bench:alibaba-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| anthropic/claude-fable-5 | `vals-ai:terminal-bench-2-1:anthropic-claude-fable-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-fable-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-4-7 | `vals-ai:aime:anthropic-claude-opus-4-7` | — | `xhigh` | epoch-ai | epoch-ai:aime:anthropic-claude-opus-4-7-xhigh-epoch-inspect-row-111 |
| anthropic/claude-opus-4-7 | `vals-ai:case-law-v2:anthropic-claude-opus-4-7` | — | `xhigh` | epoch-ai | epoch-ai:aime:anthropic-claude-opus-4-7-xhigh-epoch-inspect-row-111 |
| anthropic/claude-opus-4-7 | `vals-ai:cyber:anthropic-claude-opus-4-7` | — | `xhigh` | epoch-ai | epoch-ai:aime:anthropic-claude-opus-4-7-xhigh-epoch-inspect-row-111 |
| anthropic/claude-opus-4-8 | `vals-ai:cyber:anthropic-claude-opus-4-8` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-4-8-max |
| anthropic/claude-opus-5 | `vals-ai:corpfin:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:cyber:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:gpqa-diamond:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:hlab:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:legal-research:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:mortgage-tax:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:programbench:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:proofbench:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:swe-bench:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:tax-eval-v2:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:vals-multimodal-index:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-5 | `vals-ai:vibe-code-bench:anthropic-claude-opus-5` | — | `max` | arc-prize | arc-prize:arc-agi:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-sonnet-4-6 | `vals-ai:aime:anthropic-claude-sonnet-4-6` | — | `high` | arc-prize | arc-prize:arc-agi:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |
| anthropic/claude-sonnet-4-6 | `vals-ai:case-law-v2:anthropic-claude-sonnet-4-6` | — | `high` | arc-prize | arc-prize:arc-agi:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |
| anthropic/claude-sonnet-4-6 | `vals-ai:medqa:anthropic-claude-sonnet-4-6` | — | `high` | arc-prize | arc-prize:arc-agi:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |
| deepseek/deepseek-v4-flash | `vals-ai:cyber:deepseek-deepseek-v4-flash` | — | `max` | arc-prize | arc-prize:arc-agi:deepseek-v4-flash-0731-max:arc-agi-2-v2-semi-private |
| deepseek/deepseek-v4-pro | `vals-ai:cyber:deepseek-deepseek-v4-pro` | — | `max` | arc-prize | arc-prize:arc-agi:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| deepseek/deepseek-v4-pro | `vals-ai:terminal-bench-2-1:deepseek-deepseek-v4-pro` | — | `max` | arc-prize | arc-prize:arc-agi:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| deepseek/deepseek-v4-pro | `vals-ai:terminal-bench-2:deepseek-deepseek-v4-pro` | — | `max` | arc-prize | arc-prize:arc-agi:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| google/gemini-3.1-pro-preview | `vals-ai:cyber:google-gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| google/gemini-3.5-flash | `vals-ai:cyber:google-gemini-3-5-flash` | — | `high` | arc-prize | arc-prize:arc-agi:gemini-3-5-flash-high:arc-agi-2-v2-semi-private |
| meta/muse_spark_1_2 | `vals-ai:ioi:meta-muse-spark-1-2` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:muse-spark-1-2 |
| meta/muse_spark_1_2 | `vals-ai:proofbench:meta-muse-spark-1-2` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:muse-spark-1-2 |
| meta/muse_spark_1_2 | `vals-ai:vals-multimodal-index:meta-muse-spark-1-2` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:muse-spark-1-2 |
| openai/gpt-5.4 | `vals-ai:vibe-code-bench:openai-gpt-5-4` | — | `xhigh` | arc-prize | arc-prize:arc-agi:gpt-5-4-xhigh:arc-agi-2-v2-semi-private |
| openai/gpt-5.5 | `vals-ai:cyber:openai-gpt-5-5` | — | `xhigh` | arc-prize | arc-prize:arc-agi:gpt-5-5-2026-04-22-thinking-xhigh:arc-agi-2-v2-semi-private |
| openai/gpt-5.6-luna | `vals-ai:cyber:openai-gpt-5-6-luna` | — | `max` | arc-prize | arc-prize:arc-agi:openai-gpt-5-6-luna-max:arc-agi-2-v2-semi-private |
| openai/gpt-5.6-sol | `vals-ai:cyber:openai-gpt-5-6-sol` | — | `max` | arc-prize | arc-prize:arc-agi:openai-gpt-5-6-sol-max:arc-agi-2-v2-semi-private |
| zai/glm-5.2 | `vals-ai:corpfin:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:cyber:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:emb:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:finance-agent-v2:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:gpqa-diamond:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:legal-bench:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:livecodebench:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:medcode:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:medscribe:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:mmlu-pro:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:tax-eval-v2:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| zai/glm-5.2 | `vals-ai:vals-index:zai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| alibaba/qwen3.6-27b | `vals-ai:case-law-v2:alibaba-qwen3-6-27b` | — | `default` | — | — |
| alibaba/qwen3.6-27b | `vals-ai:corpfin:alibaba-qwen3-6-27b` | — | `default` | — | — |
| alibaba/qwen3.6-27b | `vals-ai:mortgage-tax:alibaba-qwen3-6-27b` | — | `default` | — | — |
| alibaba/qwen3.6-27b | `vals-ai:sage:alibaba-qwen3-6-27b` | — | `default` | — | — |
| alibaba/qwen3.6-27b | `vals-ai:swe-bench:alibaba-qwen3-6-27b` | — | `default` | — | — |
| alibaba/qwen3.6-27b | `vals-ai:tax-eval-v2:alibaba-qwen3-6-27b` | — | `default` | — | — |
| alibaba/qwen3.6-27b | `vals-ai:terminal-bench-2:alibaba-qwen3-6-27b` | — | `default` | — | — |
| alibaba/qwen3.6-27b | `vals-ai:vibe-code-bench:alibaba-qwen3-6-27b` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:aime:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:case-law-v2:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:code-migration:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:corpfin:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:emb:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:finance-agent-v2:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:gpqa-diamond:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:hlab:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:legal-bench:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:legal-research:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:livecodebench:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:medcode:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:medscribe:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:mmlu-pro:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:mmmu:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:mortgage-tax:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:programbench:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:sage:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:swe-bench:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:tax-eval-v2:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:terminal-bench-2-1:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:terminal-bench-2:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:vals-index:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:vals-multimodal-index:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.6-plus | `vals-ai:vibe-code-bench:alibaba-qwen3-6-plus` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:code-migration:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:corpfin:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:emb:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:finance-agent-v2:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:gpqa-diamond:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:hlab:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:ioi:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:legal-bench:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:legal-research:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:livecodebench:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:medcode:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:medscribe:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:mmlu-pro:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:swe-bench:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:tax-eval-v2:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:terminal-bench-2-1:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:terminal-bench-2:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:vals-index:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-max | `vals-ai:vibe-code-bench:alibaba-qwen3-7-max` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:code-migration:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:cyber:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:emb:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:finance-agent-v2:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:hlab:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:legal-research:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:mortgage-tax:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:sage:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:skillsbench:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:terminal-bench-2-1:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:vals-index:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:vals-multimodal-index:alibaba-qwen3-7-plus` | — | `default` | — | — |
| alibaba/qwen3.7-plus | `vals-ai:vibe-code-bench:alibaba-qwen3-7-plus` | — | `default` | — | — |
| google/gemini-3-pro-preview | `vals-ai:livecodebench:google-gemini-3-pro-preview` | — | `default` | — | — |
| google/gemini-3-pro-preview | `vals-ai:mmlu-pro:google-gemini-3-pro-preview` | — | `default` | — | — |
| google/gemini-3-pro-preview | `vals-ai:poker-agent:google-gemini-3-pro-preview` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:case-law-v2:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:code-migration:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:corpfin:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:cyber:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:emb:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:finance-agent-v2:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:gpqa-diamond:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:hlab:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:legal-bench:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:legal-research:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:livecodebench:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:medcode:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:medscribe:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:mmlu-pro:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:mmmu:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:mortgage-tax:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:programbench:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:public-benefits-bench-v1:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:public-benefits-bench:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:sage:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:swe-bench:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:tax-eval-v2:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:terminal-bench-2-1:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:terminal-bench-2:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:vals-index:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:vals-multimodal-index:kimi-kimi-k2-6` | — | `default` | — | — |
| kimi/kimi-k2.6 | `vals-ai:vibe-code-bench:kimi-kimi-k2-6` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:aime:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:case-law-v2:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:corpfin:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:gpqa-diamond:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:legal-bench:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:medcode:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:medscribe:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:mmlu-pro:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:mmmu:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:swe-bench:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:tax-eval-v2:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:terminal-bench-2:meta-muse-spark` | — | `default` | — | — |
| meta/muse_spark | `vals-ai:vibe-code-bench:meta-muse-spark` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:code-migration:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:corpfin:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:cyber:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:emb:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:finance-agent-v2:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:gpqa-diamond:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:hlab:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:legal-bench:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:legal-research:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:livecodebench:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:medcode:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:medscribe:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:mmlu-pro:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:mmmu:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:mortgage-tax:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:proofbench:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:public-benefits-bench-v1:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:public-benefits-bench:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:sage:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:skillsbench:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:swe-bench:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:tax-eval-v2:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:terminal-bench-2-1:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:terminal-bench-2:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:vals-index:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:vals-multimodal-index:minimax-minimax-m3` | — | `default` | — | — |
| minimax/MiniMax-M3 | `vals-ai:vibe-code-bench:minimax-minimax-m3` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:code-migration:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:corpfin:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:emb:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:finance-agent-v2:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:gpqa-diamond:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:hlab:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:legal-bench:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:legal-research:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:livecodebench:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:medcode:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:mmlu-pro:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:programbench:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:swe-bench:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:tax-eval-v2:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:terminal-bench-2-1:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:vals-index:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nvidia/nemotron-3-ultra-550b-a55b | `vals-ai:vibe-code-bench:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| openai/gpt-5.2-codex | `vals-ai:livecodebench:openai-gpt-5-2-codex` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:code-migration:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:corpfin:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:emb:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:finance-agent-v2:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:gpqa-diamond:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:hlab:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:legal-bench:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:legal-research:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:livecodebench:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:medcode:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:medscribe:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:mmlu-pro:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:proofbench:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:swe-bench:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:tax-eval-v2:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:terminal-bench-2-1:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:vals-index:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `vals-ai:vibe-code-bench:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:aime:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:case-law-v2:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:code-migration:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:corpfin:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:finance-agent-v2:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:gpqa-diamond:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:hlab:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:legal-bench:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:legal-research:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:livecodebench:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:medcode:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:medscribe:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:mmlu-pro:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:programbench:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:public-benefits-bench-v1:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:public-benefits-bench:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:swe-bench:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:tax-eval-v2:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:terminal-bench-2-1:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:terminal-bench-2:zai-glm-5-1` | — | `default` | — | — |
| zai/glm-5.1 | `vals-ai:vibe-code-bench:zai-glm-5-1` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
