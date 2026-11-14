# Epoch AI acquisition validation

- Retrieved at: 2026-11-13T04:50:14.249Z
- Export: https://epoch.ai/data/benchmark_data.zip
- Live comparison channel: https://epoch.ai/data/benchmarks.csv
- Page: https://epoch.ai/benchmarks/use-this-data

## Exact counts

| Check | Count |
|---|---:|
| ZIP entries | 92 |
| External-source mirrors (`_external`) | 67 |
| Epoch Capabilities Index rows | 256 |
| CandidateResults | 1494 |
| Rows without a canonical identity | 971 |

## CandidateResults per benchmark

| Benchmark | Rows |
|---|---:|
| `aime` | 316 |
| `chess-puzzles` | 164 |
| `epoch-capabilities-index` | 256 |
| `frontiermath` | 101 |
| `frontiermath-tier-4` | 72 |
| `gpqa-diamond` | 339 |
| `math-level-5` | 108 |
| `simpleqa-verified` | 103 |
| `swe-bench` | 35 |

## Visible comparison

Epoch serves no countable model table in server-rendered HTML. The rendered
benchmark pages derive their "N models evaluated" line from `benchmarks.csv`,
so the export is compared against that file rather than against a typed count.

| Benchmark | Export models | Live models | Result |
|---|---:|---:|---|
| GPQA diamond | 339 | 339 | matched |
| MATH level 5 | 108 | 108 | matched |
| SWE-Bench verified | 33 | 33 | matched |
| OTIS Mock AIME 2024-2025 | 316 | 316 | matched |
| FrontierMath-2025-02-28-Private | 101 | 101 | matched |
| FrontierMath-Tier-4-2025-07-01-Private | 72 | 72 | matched |
| SimpleQA Verified | 103 | 103 | matched |
| Chess Puzzles | 164 | 164 | matched |

## Known unresolved

- The Epoch Capabilities Index is a composite and stays `EXCLUDED`; it is
  selection-only evidence and must not be double-counted in five-dimension
  scoring.
- `mirrorcode.csv` and `mystery_game_puzzles.csv` are present in the export but
  are not promoted: neither has an approved benchmark ID or dimension mapping.
- `gpqa-diamond` is also published by Artificial Analysis. The cross-source
  selection rule is documented in `docs/SPEC.md` §4.3.1; apply source role,
  completeness and the approved equal-standing score comparison.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| CandidateResults | 1491 | 1494 | +3 |
| Epoch Capabilities Index rows | 256 | 256 | +0 |
| Rows without a canonical identity | 972 | 971 | -1 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `epoch-ai`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Beam 1.0 | `epoch-ai:epoch-capabilities-index:reflection-beam-1-0-default-epoch-inspect-row-66` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Claude Fable 5 | `epoch-ai:epoch-capabilities-index:anthropic-claude-fable-5-default-epoch-inspect-row-11` | — | `max` | arc-prize | arc-prize:arc-agi-2:anthropic-claude-fable-5-max:arc-agi-2-v2-semi-private |
| Claude Fable 5.1 | `epoch-ai:epoch-capabilities-index:anthropic-claude-fable-5-1-default-epoch-inspect-row-7` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:fable51-max |
| Claude Fable 5.2 | `epoch-ai:epoch-capabilities-index:anthropic-claude-fable-5-2-default-epoch-inspect-row-1` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:anthropic-claude-fable-5-2-xhigh:arc-agi-2-v2-semi-private |
| Claude Opus 4.5 | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-5-default-epoch-inspect-row-61` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (16k thinking) | `epoch-ai:aime:anthropic-claude-opus-4-5-default-epoch-inspect-row-213` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (16k thinking) | `epoch-ai:frontiermath-tier-4:anthropic-claude-opus-4-5-default-epoch-inspect-row-41:tier-4` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (16k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-5-default-epoch-inspect-row-42` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (16k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-5-default-epoch-inspect-row-206` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:aime:anthropic-claude-opus-4-5-default-epoch-inspect-row-212` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:chess-puzzles:anthropic-claude-opus-4-5-default-epoch-inspect-row-101` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:frontiermath-tier-4:anthropic-claude-opus-4-5-default-epoch-inspect-row-42:tier-4` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-5-default-epoch-inspect-row-41` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-5-default-epoch-inspect-row-207` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:simpleqa-verified:anthropic-claude-opus-4-5-default-epoch-inspect-row-84` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (59k thinking) | `epoch-ai:chess-puzzles:anthropic-claude-opus-4-5-default-epoch-inspect-row-100` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (no thinking) | `epoch-ai:aime:anthropic-claude-opus-4-5-default-epoch-inspect-row-211` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (no thinking) | `epoch-ai:chess-puzzles:anthropic-claude-opus-4-5-default-epoch-inspect-row-103` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (no thinking) | `epoch-ai:frontiermath-tier-4:anthropic-claude-opus-4-5-default-epoch-inspect-row-40:tier-4` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (no thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-5-default-epoch-inspect-row-40` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (no thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-5-default-epoch-inspect-row-208` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.5 (no thinking) | `epoch-ai:swe-bench:anthropic-claude-opus-4-5-default-epoch-inspect-row-31` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| Claude Opus 4.6 | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-6-default-epoch-inspect-row-37` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:aime:anthropic-claude-opus-4-6-default-epoch-inspect-row-199` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:frontiermath-tier-4:anthropic-claude-opus-4-6-default-epoch-inspect-row-25:tier-4` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-6-default-epoch-inspect-row-24` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-6-default-epoch-inspect-row-194` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:aime:anthropic-claude-opus-4-6-default-epoch-inspect-row-198` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:frontiermath-tier-4:anthropic-claude-opus-4-6-default-epoch-inspect-row-24:tier-4` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-6-default-epoch-inspect-row-23` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-6-default-epoch-inspect-row-195` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (no thinking) | `epoch-ai:frontiermath-tier-4:anthropic-claude-opus-4-6-default-epoch-inspect-row-26:tier-4` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (no thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-6-default-epoch-inspect-row-25` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (no thinking) | `epoch-ai:swe-bench:anthropic-claude-opus-4-6-default-epoch-inspect-row-16` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.6 (no thinking) | `epoch-ai:swe-bench:anthropic-claude-opus-4-6-default-epoch-inspect-row-27` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| Claude Opus 4.7 | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-7-default-epoch-inspect-row-30` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-opus-4-7 |
| Claude Opus 4.8 | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-8-max-epoch-inspect-row-21` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-opus-4-8 |
| Claude Opus 5 | `epoch-ai:aime:anthropic-claude-opus-5-default-epoch-inspect-row-144` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:opus5-max |
| Claude Opus 5 | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-5-default-epoch-inspect-row-10` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:opus5-max |
| Claude Opus 5 | `epoch-ai:gpqa-diamond:anthropic-claude-opus-5-default-epoch-inspect-row-137` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:opus5-max |
| Claude Opus 5.5 | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-5-5-default-epoch-inspect-row-4` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:opus55-max |
| Claude Sonnet 4.6 | `epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-56` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-sonnet-4-6-max:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (16k thinking) | `epoch-ai:frontiermath-tier-4:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-20:tier-4` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-sonnet-4-6-max:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (16k thinking) | `epoch-ai:frontiermath:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-19` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-sonnet-4-6-max:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (32k thinking) | `epoch-ai:aime:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-195` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-sonnet-4-6-max:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (32k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-191` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-sonnet-4-6-max:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (no thinking) | `epoch-ai:swe-bench:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-14` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-sonnet-4-6-max:arc-agi-2-v2-semi-private |
| Claude Sonnet 5 | `epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-5-default-epoch-inspect-row-33` | — | `max` | anthropic-releases | anthropic-releases:sonnet-5-5:cursorbench-4:sonnet5-max |
| Claude Sonnet 5.5 | `epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-5-5-default-epoch-inspect-row-8` | — | `max` | anthropic-releases | anthropic-releases:sonnet-5-5:cursorbench-4:sonnet55-max |
| DeepSeek V4 Flash 0731 | `epoch-ai:epoch-capabilities-index:deepseek-deepseek-v4-flash-epoch-inspect-row-51` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-flash-0731-max:arc-agi-2-v2-semi-private |
| DeepSeek V4 Pro 0813 | `epoch-ai:epoch-capabilities-index:deepseek-deepseek-v4-pro-epoch-inspect-row-41` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| DeepSeek V4.1 Flash 1017 | `epoch-ai:epoch-capabilities-index:deepseek-deepseek-v4-1-flash-1017-default-epoch-inspect-row-22` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-1-flash-1017-max:arc-agi-2-v2-semi-private |
| DeepSeek-V4-Flash | `epoch-ai:epoch-capabilities-index:deepseek-deepseek-v4-flash-default-epoch-inspect-row-86` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-flash-0731-max:arc-agi-2-v2-semi-private |
| DeepSeek-V4-Pro | `epoch-ai:epoch-capabilities-index:deepseek-deepseek-v4-pro-default-epoch-inspect-row-69` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| Gemini 3 Pro Preview | `epoch-ai:aime:google-gemini-3-pro-preview-default-epoch-inspect-row-214` | — | `high` | vals-ai | vals-ai:corpfin:google-gemini-3-pro-preview |
| Gemini 3 Pro Preview | `epoch-ai:frontiermath-tier-4:google-gemini-3-pro-preview-default-epoch-inspect-row-43:tier-4` | — | `high` | vals-ai | vals-ai:corpfin:google-gemini-3-pro-preview |
| Gemini 3 Pro Preview | `epoch-ai:frontiermath:google-gemini-3-pro-preview-default-epoch-inspect-row-44` | — | `high` | vals-ai | vals-ai:corpfin:google-gemini-3-pro-preview |
| Gemini 3 Pro Preview | `epoch-ai:gpqa-diamond:google-gemini-3-pro-preview-default-epoch-inspect-row-209` | — | `high` | vals-ai | vals-ai:corpfin:google-gemini-3-pro-preview |
| Gemini 3 Pro Preview | `epoch-ai:swe-bench:google-gemini-3-pro-preview-default-epoch-inspect-row-22` | — | `high` | vals-ai | vals-ai:corpfin:google-gemini-3-pro-preview |
| Gemini 3.1 Pro Preview | `epoch-ai:aime:google-gemini-3-1-pro-preview-default-epoch-inspect-row-196` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:frontiermath-tier-4:google-gemini-3-1-pro-preview-default-epoch-inspect-row-21:tier-4` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:frontiermath:google-gemini-3-1-pro-preview-default-epoch-inspect-row-21` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:gpqa-diamond:google-gemini-3-1-pro-preview-default-epoch-inspect-row-192` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:swe-bench:google-gemini-3-1-pro-preview-default-epoch-inspect-row-13` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.5 Flash | `epoch-ai:epoch-capabilities-index:google-gemini-3-5-flash-default-epoch-inspect-row-43` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `epoch-ai:epoch-capabilities-index:google-gemini-3-5-flash-lite-default-epoch-inspect-row-92` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.6 Flash | `epoch-ai:epoch-capabilities-index:google-gemini-3-6-flash-default-epoch-inspect-row-44` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-6-flash-high:arc-agi-2-v2-semi-private |
| Gemini 3.7 Flash | `epoch-ai:epoch-capabilities-index:google-gemini-3-7-flash-default-epoch-inspect-row-25` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-3-7-flash-high:arc-agi-2-v2-semi-private |
| Gemini 3.8 Flash | `epoch-ai:epoch-capabilities-index:google-gemini-3-8-flash-default-epoch-inspect-row-23` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-3-8-flash-high:arc-agi-2-v2-semi-private |
| Gemini 4 Argon | `epoch-ai:epoch-capabilities-index:google-gemini-4-argon-default-epoch-inspect-row-9` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-4-argon-high:arc-agi-2-v2-semi-private |
| Gemini 4 Carbon | `epoch-ai:epoch-capabilities-index:google-gemini-4-carbon-default-epoch-inspect-row-2` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-4-carbon-high:arc-agi-2-v2-semi-private |
| GLM-5.1 | `epoch-ai:aime:zai-glm-5-1-default-epoch-inspect-row-89` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 | `epoch-ai:chess-puzzles:zai-glm-5-1-default-epoch-inspect-row-22` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 | `epoch-ai:epoch-capabilities-index:zai-glm-5-1-default-epoch-inspect-row-68` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 | `epoch-ai:frontiermath-tier-4:zai-glm-5-1-default-epoch-inspect-row-8:tier-4` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 | `epoch-ai:frontiermath:zai-glm-5-1-default-epoch-inspect-row-8` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 | `epoch-ai:gpqa-diamond:zai-glm-5-1-default-epoch-inspect-row-83` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 | `epoch-ai:simpleqa-verified:zai-glm-5-1-default-epoch-inspect-row-42` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 | `epoch-ai:swe-bench:zai-glm-5-1-default-epoch-inspect-row-6` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.2 | `epoch-ai:epoch-capabilities-index:zai-glm-5-2-default-epoch-inspect-row-54` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| GPT-5.2 | `epoch-ai:epoch-capabilities-index:openai-gpt-5-2-default-epoch-inspect-row-50` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-2-2025-12-11-thinking-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.2 Pro | `epoch-ai:epoch-capabilities-index:openai-gpt-5-2-pro-xhigh-epoch-inspect-row-31` | — | `high` | arc-prize | arc-prize:arc-agi-2:gpt-5-2-pro-2025-12-11-high:arc-agi-2-v2-semi-private |
| GPT-5.2 Pro (web) | `epoch-ai:frontiermath-tier-4:openai-gpt-5-2-pro-default-epoch-inspect-row-29:tier-4` | — | `high` | arc-prize | arc-prize:arc-agi-2:gpt-5-2-pro-2025-12-11-high:arc-agi-2-v2-semi-private |
| GPT-5.4 | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-default-epoch-inspect-row-27` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-4-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.4 Mini | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-mini-default-epoch-inspect-row-73` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-4-mini-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.4 Nano | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-nano-default-epoch-inspect-row-89` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-4-nano-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.4 Pro | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-pro-default-epoch-inspect-row-19` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-4-pro-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.4 Pro (web) | `epoch-ai:frontiermath-tier-4:openai-gpt-5-4-pro-default-epoch-inspect-row-19:tier-4` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-4-pro-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.5 | `epoch-ai:epoch-capabilities-index:openai-gpt-5-5-default-epoch-inspect-row-20` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-5-2026-04-22-thinking-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.5 Pro | `epoch-ai:epoch-capabilities-index:openai-gpt-5-5-pro-default-epoch-inspect-row-14` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-5-pro-2026-04-23-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.6 Luna | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-luna-default-epoch-inspect-row-35` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-luna-max:arc-agi-2-v2-semi-private |
| GPT-5.6 Sol | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-sol-default-epoch-inspect-row-13` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:gpt56sol-max |
| GPT-5.6 Terra | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-terra-default-epoch-inspect-row-17` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-terra-max:arc-agi-2-v2-semi-private |
| GPT-6 Astra | `epoch-ai:epoch-capabilities-index:openai-gpt-6-astra-default-epoch-inspect-row-3` | — | `max` | anthropic-releases | anthropic-releases:frontier-code-1-1:gpt6astra-max |
| GPT-6 Luna | `epoch-ai:epoch-capabilities-index:openai-gpt-6-luna-default-epoch-inspect-row-36` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-6-luna-max:arc-agi-2-v2-semi-private |
| GPT-6 Sol | `epoch-ai:epoch-capabilities-index:openai-gpt-6-sol-default-epoch-inspect-row-12` | — | `max` | anthropic-releases | anthropic-releases:sonnet-5-5:frontier-code-1-1:gpt6sol-max |
| GPT-6.1 Sol | `epoch-ai:epoch-capabilities-index:openai-gpt-6-1-sol-default-epoch-inspect-row-5` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-6-1-sol-max:arc-agi-2-v2-semi-private |
| GPT-6.1 Terra | `epoch-ai:epoch-capabilities-index:openai-gpt-6-1-terra-default-epoch-inspect-row-6` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:gpt-6-1-terra |
| Grok 4.5 | `epoch-ai:epoch-capabilities-index:xai-grok-4-5-default-epoch-inspect-row-46` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| Grok 4.6 | `epoch-ai:epoch-capabilities-index:xai-grok-4-6-default-epoch-inspect-row-28` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private |
| Grok 4.7 | `epoch-ai:epoch-capabilities-index:xai-grok-4-7-default-epoch-inspect-row-38` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-7-xhigh:arc-agi-2-v2-semi-private |
| Inkling | `epoch-ai:epoch-capabilities-index:thinking-machines-inkling-default-epoch-inspect-row-76` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:inkling |
| Kimi K2.7 Code | `epoch-ai:aime:moonshot-kimi-k2-7-code-default-epoch-inspect-row-103` | — | `max` | surge-dayjob-finance | surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning |
| Kimi K2.7 Code | `epoch-ai:chess-puzzles:moonshot-kimi-k2-7-code-default-epoch-inspect-row-29` | — | `max` | surge-dayjob-finance | surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning |
| Kimi K2.7 Code | `epoch-ai:epoch-capabilities-index:moonshot-kimi-k2-7-code-default-epoch-inspect-row-64` | — | `max` | surge-dayjob-finance | surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning |
| Kimi K2.7 Code | `epoch-ai:gpqa-diamond:moonshot-kimi-k2-7-code-default-epoch-inspect-row-96` | — | `max` | surge-dayjob-finance | surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning |
| Kimi K2.7 Code | `epoch-ai:simpleqa-verified:moonshot-kimi-k2-7-code-default-epoch-inspect-row-46` | — | `max` | surge-dayjob-finance | surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning |
| Kimi K3 | `epoch-ai:epoch-capabilities-index:moonshot-kimi-k3-default-epoch-inspect-row-24` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| Kimi K3.1 Pro | `epoch-ai:epoch-capabilities-index:moonshot-kimi-k3-1-pro-default-epoch-inspect-row-16` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:kimi-k3-1-pro-max |
| MiniMax-M3 | `epoch-ai:aime:minimax-minimax-m3-default-epoch-inspect-row-86` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `epoch-ai:chess-puzzles:minimax-minimax-m3-default-epoch-inspect-row-137` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `epoch-ai:epoch-capabilities-index:minimax-minimax-m3-default-epoch-inspect-row-79` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `epoch-ai:gpqa-diamond:minimax-minimax-m3-default-epoch-inspect-row-80` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| Muse Spark 1.1 | `epoch-ai:epoch-capabilities-index:meta-muse-spark-1-1-default-epoch-inspect-row-47` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-muse-spark-1-1-xhigh |
| Muse Spark 1.1 | `epoch-ai:simpleqa-verified:meta-muse-spark-1-1-default-epoch-inspect-row-34` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-muse-spark-1-1-xhigh |
| Muse Spark 1.2 | `epoch-ai:epoch-capabilities-index:meta-muse-spark-1-2-default-epoch-inspect-row-45` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:muse-spark-1-2 |
| Muse Spark 1.3 | `epoch-ai:epoch-capabilities-index:meta-muse-spark-1-3-default-epoch-inspect-row-26` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:muse-spark-1-3 |
| Muse Spark Open | `epoch-ai:epoch-capabilities-index:meta-muse-spark-open-default-epoch-inspect-row-42` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:meta-muse-spark-open-xhigh:arc-agi-2-v2-semi-private |
| Muse Wonder | `epoch-ai:epoch-capabilities-index:meta-muse-wonder-default-epoch-inspect-row-15` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:muse-wonder |
| Qwen 3.8 Max | `epoch-ai:epoch-capabilities-index:alibaba-qwen3-8-max-default-epoch-inspect-row-29` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `epoch-ai:epoch-capabilities-index:alibaba-qwen3-8-max-default-epoch-inspect-row-40` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Kimi K2.6 | `epoch-ai:aime:moonshot-kimi-k2-6-default-epoch-inspect-row-187` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:chess-puzzles:moonshot-kimi-k2-6-default-epoch-inspect-row-27` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:epoch-capabilities-index:moonshot-kimi-k2-6-default-epoch-inspect-row-62` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:frontiermath-tier-4:moonshot-kimi-k2-6-default-epoch-inspect-row-10:tier-4` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:frontiermath:moonshot-kimi-k2-6-default-epoch-inspect-row-9` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:gpqa-diamond:moonshot-kimi-k2-6-default-epoch-inspect-row-182` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:simpleqa-verified:moonshot-kimi-k2-6-default-epoch-inspect-row-100` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:swe-bench:moonshot-kimi-k2-6-default-epoch-inspect-row-8` | — | `default` | — | — |
| Muse Spark | `epoch-ai:aime:meta-muse-spark-default-epoch-inspect-row-193` | — | `default` | — | — |
| Muse Spark | `epoch-ai:epoch-capabilities-index:meta-muse-spark-default-epoch-inspect-row-53` | — | `default` | — | — |
| Muse Spark | `epoch-ai:frontiermath-tier-4:meta-muse-spark-default-epoch-inspect-row-17:tier-4` | — | `default` | — | — |
| Muse Spark | `epoch-ai:frontiermath:meta-muse-spark-default-epoch-inspect-row-16` | — | `default` | — | — |
| Muse Spark | `epoch-ai:gpqa-diamond:meta-muse-spark-default-epoch-inspect-row-188` | — | `default` | — | — |
| Nemotron 3 Ultra | `epoch-ai:epoch-capabilities-index:nvidia-nemotron-3-ultra-default-epoch-inspect-row-84` | — | `default` | — | — |
| nemotron-3-ultra | `epoch-ai:aime:nvidia-nemotron-3-ultra-default-epoch-inspect-row-84` | — | `default` | — | — |
| nemotron-3-ultra | `epoch-ai:gpqa-diamond:nvidia-nemotron-3-ultra-default-epoch-inspect-row-78` | — | `default` | — | — |
| Qwen3.6 27B | `epoch-ai:aime:alibaba-qwen3-6-27b-default-epoch-inspect-row-108` | — | `default` | — | — |
| Qwen3.6 27B | `epoch-ai:epoch-capabilities-index:alibaba-qwen3-6-27b-default-epoch-inspect-row-87` | — | `default` | — | — |
| Qwen3.6 27B | `epoch-ai:gpqa-diamond:alibaba-qwen3-6-27b-default-epoch-inspect-row-101` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:aime:alibaba-qwen3-7-max-default-epoch-inspect-row-100` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:chess-puzzles:alibaba-qwen3-7-max-default-epoch-inspect-row-129` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:gpqa-diamond:alibaba-qwen3-7-max-default-epoch-inspect-row-93` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:simpleqa-verified:alibaba-qwen3-7-max-default-epoch-inspect-row-49` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:swe-bench:alibaba-qwen3-7-max-default-epoch-inspect-row-2` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:aime:alibaba-qwen3-7-plus-default-epoch-inspect-row-117` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:gpqa-diamond:alibaba-qwen3-7-plus-default-epoch-inspect-row-111` | — | `default` | — | — |
| Qwen3.7-Max | `epoch-ai:epoch-capabilities-index:alibaba-qwen3-7-max-default-epoch-inspect-row-49` | — | `default` | — | — |
| Qwen3.7-Plus | `epoch-ai:epoch-capabilities-index:alibaba-qwen3-7-plus-default-epoch-inspect-row-78` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
