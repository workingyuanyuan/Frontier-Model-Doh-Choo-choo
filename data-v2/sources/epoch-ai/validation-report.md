# Epoch AI acquisition validation

- Retrieved at: 2026-08-21T15:23:11.828Z
- Export: https://epoch.ai/data/benchmark_data.zip
- Live comparison channel: https://epoch.ai/data/benchmarks.csv
- Page: https://epoch.ai/benchmarks/use-this-data

## Exact counts

| Check | Count |
|---|---:|
| ZIP entries | 77 |
| External-source mirrors (`_external`) | 64 |
| Epoch Capabilities Index rows | 553 |
| CandidateResults | 1612 |
| Rows without a canonical identity | 1026 |

## CandidateResults per benchmark

| Benchmark | Rows |
|---|---:|
| `aime` | 239 |
| `chess-puzzles` | 162 |
| `epoch-capabilities-index` | 553 |
| `frontiermath` | 173 |
| `gpqa-diamond` | 264 |
| `math-level-5` | 108 |
| `simpleqa-verified` | 78 |
| `swe-bench` | 35 |

## Visible comparison

Epoch serves no countable model table in server-rendered HTML. The rendered
benchmark pages derive their "N models evaluated" line from `benchmarks.csv`,
so the export is compared against that file rather than against a typed count.

| Benchmark | Export models | Live models | Result |
|---|---:|---:|---|
| GPQA diamond | 264 | 264 | matched |
| MATH level 5 | 108 | 108 | matched |
| SWE-Bench verified | 33 | 33 | matched |
| OTIS Mock AIME 2024-2025 | 239 | 239 | matched |
| FrontierMath-2025-02-28-Private | 101 | 101 | matched |
| FrontierMath-Tier-4-2025-07-01-Private | 72 | 72 | matched |
| SimpleQA Verified | 78 | 78 | matched |
| Chess Puzzles | 162 | 162 | matched |

## Known unresolved

- The Epoch Capabilities Index is a composite and stays `EXCLUDED`; it is
  selection-only evidence and must not be double-counted in eight-dimension
  scoring.
- `mirrorcode.csv` and `mystery_game_puzzles.csv` are present in the export but
  are not promoted: neither has an approved benchmark ID or dimension mapping.
- `gpqa-diamond` is also published by Artificial Analysis. The cross-source
  merge rule is not yet decided; see `tasks/claude-code-plan.md` L1.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| CandidateResults | 1552 | 1612 | +60 |
| Epoch Capabilities Index rows | 521 | 553 | +32 |
| Rows without a canonical identity | 1130 | 1026 | -104 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `epoch-ai`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Claude Fable 5 | `epoch-ai:epoch-capabilities-index:anthropic-claude-fable-5-default-epoch-inspect-row-510` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-fable-5 |
| Claude Fable 5 (unknown) | `epoch-ai:epoch-capabilities-index:anthropic-claude-fable-5-default-epoch-inspect-row-467` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-fable-5 |
| Claude Opus 4.5 (128k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-5-default-epoch-inspect-row-159` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (16k thinking) | `epoch-ai:aime:anthropic-claude-opus-4-5-default-epoch-inspect-row-134` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (16k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-5-default-epoch-inspect-row-222` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (16k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-5-default-epoch-inspect-row-41:tier-4` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (16k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-5-default-epoch-inspect-row-42` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (16k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-5-default-epoch-inspect-row-130` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:aime:anthropic-claude-opus-4-5-default-epoch-inspect-row-133` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:chess-puzzles:anthropic-claude-opus-4-5-default-epoch-inspect-row-160` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-5-default-epoch-inspect-row-175` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-5-default-epoch-inspect-row-41` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-5-default-epoch-inspect-row-42:tier-4` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-5-default-epoch-inspect-row-131` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (32k thinking) | `epoch-ai:simpleqa-verified:anthropic-claude-opus-4-5-default-epoch-inspect-row-68` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (48k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-5-default-epoch-inspect-row-125` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (64k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-5-default-epoch-inspect-row-618` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (8k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-5-default-epoch-inspect-row-623` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (no thinking) | `epoch-ai:aime:anthropic-claude-opus-4-5-default-epoch-inspect-row-132` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (no thinking) | `epoch-ai:chess-puzzles:anthropic-claude-opus-4-5-default-epoch-inspect-row-77` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (no thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-5-default-epoch-inspect-row-92` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (no thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-5-default-epoch-inspect-row-40` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (no thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-5-default-epoch-inspect-row-40:tier-4` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (no thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-5-default-epoch-inspect-row-132` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (no thinking) | `epoch-ai:swe-bench:anthropic-claude-opus-4-5-default-epoch-inspect-row-31` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.5 (unknown thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-5-default-epoch-inspect-row-330` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:claude-opus-4-5-20251101-thinking-64k-high-effort |
| Claude Opus 4.6 (120k thinking) | `epoch-ai:chess-puzzles:anthropic-claude-opus-4-6-default-epoch-inspect-row-136` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (120k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-6-default-epoch-inspect-row-189` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:aime:anthropic-claude-opus-4-6-default-epoch-inspect-row-120` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:chess-puzzles:anthropic-claude-opus-4-6-default-epoch-inspect-row-141` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-6-default-epoch-inspect-row-196` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-6-default-epoch-inspect-row-24` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-6-default-epoch-inspect-row-25:tier-4` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-6-default-epoch-inspect-row-118` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (32k thinking) | `epoch-ai:simpleqa-verified:anthropic-claude-opus-4-6-default-epoch-inspect-row-48` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:aime:anthropic-claude-opus-4-6-default-epoch-inspect-row-119` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:chess-puzzles:anthropic-claude-opus-4-6-default-epoch-inspect-row-140` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-6-default-epoch-inspect-row-195` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-6-default-epoch-inspect-row-23` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-6-default-epoch-inspect-row-24:tier-4` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (64k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-6-default-epoch-inspect-row-119` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (no thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-6-default-epoch-inspect-row-101` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (no thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-6-default-epoch-inspect-row-25` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (no thinking) | `epoch-ai:frontiermath:anthropic-claude-opus-4-6-default-epoch-inspect-row-26:tier-4` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (no thinking) | `epoch-ai:simpleqa-verified:anthropic-claude-opus-4-6-default-epoch-inspect-row-49` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (no thinking) | `epoch-ai:swe-bench:anthropic-claude-opus-4-6-default-epoch-inspect-row-16` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (no thinking) | `epoch-ai:swe-bench:anthropic-claude-opus-4-6-default-epoch-inspect-row-27` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.6 (unknown thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-6-default-epoch-inspect-row-329` | — | `high` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-6-high |
| Claude Opus 4.7 (no thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-7-default-epoch-inspect-row-100` | — | `xhigh` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-7-xhigh |
| Claude Opus 4.7 (unknown) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-7-default-epoch-inspect-row-469` | — | `xhigh` | frontier-code | frontier-code:frontier-code-1-1:claude-opus-4-7-xhigh |
| Claude Opus 4.8 | `epoch-ai:aime:anthropic-claude-opus-4-8-max-epoch-inspect-row-66` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-4-8-max |
| Claude Opus 4.8 | `epoch-ai:chess-puzzles:anthropic-claude-opus-4-8-max-epoch-inspect-row-74` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-4-8-max |
| Claude Opus 4.8 | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-8-max-epoch-inspect-row-326` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-4-8-max |
| Claude Opus 4.8 | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-4-8-max-epoch-inspect-row-89` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-4-8-max |
| Claude Opus 4.8 | `epoch-ai:gpqa-diamond:anthropic-claude-opus-4-8-max-epoch-inspect-row-63` | — | `max` | deepswe | deepswe-1-1:mini-swe-agent-claude-opus-4-8-max |
| Claude Opus 5 | `epoch-ai:aime:anthropic-claude-opus-5-default-epoch-inspect-row-65` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-opus-5 |
| Claude Opus 5 | `epoch-ai:chess-puzzles:anthropic-claude-opus-5-default-epoch-inspect-row-73` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-opus-5 |
| Claude Opus 5 | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-5-default-epoch-inspect-row-87` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-opus-5 |
| Claude Opus 5 | `epoch-ai:gpqa-diamond:anthropic-claude-opus-5-default-epoch-inspect-row-61` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-opus-5 |
| Claude Opus 5 (unknown) | `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-5-default-epoch-inspect-row-472` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-opus-5 |
| Claude Sonnet 4.6 (16k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-187` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (16k thinking) | `epoch-ai:frontiermath:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-19` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (16k thinking) | `epoch-ai:frontiermath:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-20:tier-4` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (32k thinking) | `epoch-ai:aime:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-116` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (32k thinking) | `epoch-ai:chess-puzzles:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-137` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (32k thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-188` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (32k thinking) | `epoch-ai:gpqa-diamond:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-115` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (32k thinking) | `epoch-ai:simpleqa-verified:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-45` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (no thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-98` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (no thinking) | `epoch-ai:swe-bench:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-14` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 4.6 (unknown thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-468` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-claude-sonnet-4-6-high |
| Claude Sonnet 5 (no thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-5-default-epoch-inspect-row-105` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-sonnet-5 |
| Claude Sonnet 5 (unknown thinking) | `epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-5-default-epoch-inspect-row-328` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-sonnet-5 |
| DeepSeek V4 Flash 0731 (unknown) | `epoch-ai:epoch-capabilities-index:deepseek-deepseek-v4-flash-epoch-inspect-row-526` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-flash |
| DeepSeek v4 Pro (unknown thinking) | `epoch-ai:aime:deepseek-deepseek-v4-pro-default-epoch-inspect-row-50` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:deepseek-v4-pro |
| DeepSeek v4 Pro (unknown thinking) | `epoch-ai:chess-puzzles:deepseek-deepseek-v4-pro-default-epoch-inspect-row-58` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:deepseek-v4-pro |
| DeepSeek v4 Pro (unknown thinking) | `epoch-ai:epoch-capabilities-index:deepseek-deepseek-v4-pro-default-epoch-inspect-row-607` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:deepseek-v4-pro |
| DeepSeek v4 Pro (unknown thinking) | `epoch-ai:epoch-capabilities-index:deepseek-deepseek-v4-pro-default-epoch-inspect-row-72` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:deepseek-v4-pro |
| DeepSeek v4 Pro (unknown thinking) | `epoch-ai:gpqa-diamond:deepseek-deepseek-v4-pro-default-epoch-inspect-row-45` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:deepseek-v4-pro |
| Gemini 3.1 Pro Preview | `epoch-ai:aime:google-gemini-3-1-pro-preview-default-epoch-inspect-row-117` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:chess-puzzles:google-gemini-3-1-pro-preview-default-epoch-inspect-row-138` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:epoch-capabilities-index:google-gemini-3-1-pro-preview-default-epoch-inspect-row-160` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:epoch-capabilities-index:google-gemini-3-1-pro-preview-default-epoch-inspect-row-186` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:frontiermath:google-gemini-3-1-pro-preview-default-epoch-inspect-row-21` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:frontiermath:google-gemini-3-1-pro-preview-default-epoch-inspect-row-21:tier-4` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:gpqa-diamond:google-gemini-3-1-pro-preview-default-epoch-inspect-row-116` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:simpleqa-verified:google-gemini-3-1-pro-preview-default-epoch-inspect-row-46` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `epoch-ai:swe-bench:google-gemini-3-1-pro-preview-default-epoch-inspect-row-13` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.5 Flash | `epoch-ai:aime:google-gemini-3-5-flash-default-epoch-inspect-row-89` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-5-flash-high |
| Gemini 3.5 Flash | `epoch-ai:chess-puzzles:google-gemini-3-5-flash-default-epoch-inspect-row-105` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-5-flash-high |
| Gemini 3.5 Flash | `epoch-ai:epoch-capabilities-index:google-gemini-3-5-flash-default-epoch-inspect-row-144` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-5-flash-high |
| Gemini 3.5 Flash | `epoch-ai:epoch-capabilities-index:google-gemini-3-5-flash-default-epoch-inspect-row-345` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-5-flash-high |
| Gemini 3.5 Flash | `epoch-ai:gpqa-diamond:google-gemini-3-5-flash-default-epoch-inspect-row-87` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-5-flash-high |
| Gemini 3.5 Flash-Lite | `epoch-ai:aime:google-gemini-3-5-flash-lite-default-epoch-inspect-row-55` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `epoch-ai:chess-puzzles:google-gemini-3-5-flash-lite-default-epoch-inspect-row-61` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `epoch-ai:epoch-capabilities-index:google-gemini-3-5-flash-lite-default-epoch-inspect-row-539` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `epoch-ai:epoch-capabilities-index:google-gemini-3-5-flash-lite-default-epoch-inspect-row-77` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.5 Flash-Lite | `epoch-ai:gpqa-diamond:google-gemini-3-5-flash-lite-default-epoch-inspect-row-51` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high |
| Gemini 3.6 Flash | `epoch-ai:aime:google-gemini-3-6-flash-default-epoch-inspect-row-33` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:gemini-3-6-flash |
| Gemini 3.6 Flash | `epoch-ai:chess-puzzles:google-gemini-3-6-flash-default-epoch-inspect-row-39` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:gemini-3-6-flash |
| Gemini 3.6 Flash | `epoch-ai:epoch-capabilities-index:google-gemini-3-6-flash-default-epoch-inspect-row-524` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:gemini-3-6-flash |
| Gemini 3.6 Flash | `epoch-ai:epoch-capabilities-index:google-gemini-3-6-flash-default-epoch-inspect-row-53` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:gemini-3-6-flash |
| Gemini 3.6 Flash | `epoch-ai:gpqa-diamond:google-gemini-3-6-flash-default-epoch-inspect-row-31` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:gemini-3-6-flash |
| Gemini 3.7 Flash (unknown) | `epoch-ai:epoch-capabilities-index:google-gemini-3-7-flash-default-epoch-inspect-row-520` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:gemini-3-7-flash |
| GLM-5.2 | `epoch-ai:aime:zai-glm-5-2-default-epoch-inspect-row-7` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| GLM-5.2 | `epoch-ai:chess-puzzles:zai-glm-5-2-default-epoch-inspect-row-7` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| GLM-5.2 | `epoch-ai:epoch-capabilities-index:zai-glm-5-2-default-epoch-inspect-row-13` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| GLM-5.2 | `epoch-ai:epoch-capabilities-index:zai-glm-5-2-default-epoch-inspect-row-471` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| GLM-5.2 | `epoch-ai:gpqa-diamond:zai-glm-5-2-default-epoch-inspect-row-7` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| GPT-5.2 (none) | `epoch-ai:aime:openai-gpt-5-2-default-epoch-inspect-row-93` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-2-2025-12-11-high |
| GPT-5.2 (none) | `epoch-ai:chess-puzzles:openai-gpt-5-2-default-epoch-inspect-row-111` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-2-2025-12-11-high |
| GPT-5.2 (none) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-2-default-epoch-inspect-row-150` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-2-2025-12-11-high |
| GPT-5.2 (none) | `epoch-ai:gpqa-diamond:openai-gpt-5-2-default-epoch-inspect-row-91` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-2-2025-12-11-high |
| GPT-5.2 (unknown thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-2-default-epoch-inspect-row-511` | — | `high` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-2-2025-12-11-high |
| GPT-5.4 | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-default-epoch-inspect-row-470` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-4-xhigh |
| GPT-5.4 (none) | `epoch-ai:aime:openai-gpt-5-4-default-epoch-inspect-row-86` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-4-xhigh |
| GPT-5.4 (none) | `epoch-ai:chess-puzzles:openai-gpt-5-4-default-epoch-inspect-row-97` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-4-xhigh |
| GPT-5.4 (none) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-default-epoch-inspect-row-138` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-4-xhigh |
| GPT-5.4 (none) | `epoch-ai:gpqa-diamond:openai-gpt-5-4-default-epoch-inspect-row-84` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-4-xhigh |
| GPT-5.4 mini (none) | `epoch-ai:aime:openai-gpt-5-4-mini-default-epoch-inspect-row-15` | — | `xhigh` | frontier-code | frontier-code:frontier-code-1-1:gpt-5-4-mini-xhigh |
| GPT-5.4 mini (none) | `epoch-ai:chess-puzzles:openai-gpt-5-4-mini-default-epoch-inspect-row-19` | — | `xhigh` | frontier-code | frontier-code:frontier-code-1-1:gpt-5-4-mini-xhigh |
| GPT-5.4 mini (none) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-mini-default-epoch-inspect-row-32` | — | `xhigh` | frontier-code | frontier-code:frontier-code-1-1:gpt-5-4-mini-xhigh |
| GPT-5.4 mini (none) | `epoch-ai:gpqa-diamond:openai-gpt-5-4-mini-default-epoch-inspect-row-15` | — | `xhigh` | frontier-code | frontier-code:frontier-code-1-1:gpt-5-4-mini-xhigh |
| GPT-5.4 mini (unknown thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-mini-default-epoch-inspect-row-525` | — | `xhigh` | frontier-code | frontier-code:frontier-code-1-1:gpt-5-4-mini-xhigh |
| GPT-5.4 nano (no thinking) | `epoch-ai:aime:openai-gpt-5-4-nano-default-epoch-inspect-row-43` | — | `xhigh` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-4-nano-xhigh |
| GPT-5.4 nano (no thinking) | `epoch-ai:chess-puzzles:openai-gpt-5-4-nano-default-epoch-inspect-row-54` | — | `xhigh` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-4-nano-xhigh |
| GPT-5.4 nano (no thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-nano-default-epoch-inspect-row-68` | — | `xhigh` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-4-nano-xhigh |
| GPT-5.4 nano (no thinking) | `epoch-ai:gpqa-diamond:openai-gpt-5-4-nano-default-epoch-inspect-row-40` | — | `xhigh` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-4-nano-xhigh |
| GPT-5.4 nano (unknown thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-nano-default-epoch-inspect-row-603` | — | `xhigh` | livebench | livebench-2026-06-25:livebench-instruction-following:gpt-5-4-nano-xhigh |
| GPT-5.5 (no thinking) | `epoch-ai:aime:openai-gpt-5-5-default-epoch-inspect-row-11` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-5-xhigh |
| GPT-5.5 (no thinking) | `epoch-ai:chess-puzzles:openai-gpt-5-5-default-epoch-inspect-row-14` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-5-xhigh |
| GPT-5.5 (no thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-5-default-epoch-inspect-row-27` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-5-xhigh |
| GPT-5.5 (no thinking) | `epoch-ai:gpqa-diamond:openai-gpt-5-5-default-epoch-inspect-row-11` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-5-xhigh |
| GPT-5.5 (unknown thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-5-default-epoch-inspect-row-389` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-gpt-5-5-xhigh |
| GPT-5.5 Pro (unknown thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-5-pro-default-epoch-inspect-row-773` | — | `xhigh` | artificial-analysis | artificial-analysis:critpt:gpt-5-5-pro |
| GPT-5.6 Luna (none) | `epoch-ai:aime:openai-gpt-5-6-luna-default-epoch-inspect-row-25` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-luna |
| GPT-5.6 Luna (none) | `epoch-ai:chess-puzzles:openai-gpt-5-6-luna-default-epoch-inspect-row-29` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-luna |
| GPT-5.6 Luna (none) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-luna-default-epoch-inspect-row-42` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-luna |
| GPT-5.6 Luna (none) | `epoch-ai:gpqa-diamond:openai-gpt-5-6-luna-default-epoch-inspect-row-22` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-luna |
| GPT-5.6 Luna (unknown thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-luna-default-epoch-inspect-row-523` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-luna |
| GPT-5.6 Sol (none) | `epoch-ai:aime:openai-gpt-5-6-sol-default-epoch-inspect-row-10` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:gpt-5-6-sol |
| GPT-5.6 Sol (none) | `epoch-ai:chess-puzzles:openai-gpt-5-6-sol-default-epoch-inspect-row-13` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:gpt-5-6-sol |
| GPT-5.6 Sol (none) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-sol-default-epoch-inspect-row-26` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:gpt-5-6-sol |
| GPT-5.6 Sol (none) | `epoch-ai:gpqa-diamond:openai-gpt-5-6-sol-default-epoch-inspect-row-10` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:gpt-5-6-sol |
| GPT-5.6 Sol (pro, unknown thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-sol-default-epoch-inspect-row-774` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:gpt-5-6-sol |
| GPT-5.6 Sol (unknown thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-sol-default-epoch-inspect-row-474` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:gpt-5-6-sol |
| GPT-5.6 Terra (none) | `epoch-ai:aime:openai-gpt-5-6-terra-default-epoch-inspect-row-14` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-terra |
| GPT-5.6 Terra (none) | `epoch-ai:chess-puzzles:openai-gpt-5-6-terra-default-epoch-inspect-row-18` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-terra |
| GPT-5.6 Terra (none) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-terra-default-epoch-inspect-row-31` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-terra |
| GPT-5.6 Terra (none) | `epoch-ai:gpqa-diamond:openai-gpt-5-6-terra-default-epoch-inspect-row-14` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-terra |
| GPT-5.6 Terra (unknown thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-terra-default-epoch-inspect-row-522` | — | `max` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-6-terra |
| Grok 4.5 (unknown thinking) | `epoch-ai:epoch-capabilities-index:xai-grok-4-5-default-epoch-inspect-row-473` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-5 |
| Grok 4.6 (unknown) | `epoch-ai:epoch-capabilities-index:xai-grok-4-6-default-epoch-inspect-row-519` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-6 |
| Inkling | `epoch-ai:epoch-capabilities-index:thinking-machines-inkling-default-epoch-inspect-row-527` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:inkling |
| Kimi K3 (unknown) | `epoch-ai:epoch-capabilities-index:moonshot-kimi-k3-default-epoch-inspect-row-393` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:kimi-k3 |
| Muse Spark 1.1 | `epoch-ai:epoch-capabilities-index:meta-muse-spark-1-1-default-epoch-inspect-row-475` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-muse-spark-1-1-xhigh |
| Qwen3.8 Max (unknown) | `epoch-ai:epoch-capabilities-index:alibaba-qwen3-8-max-default-epoch-inspect-row-535` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Gemini 3 Pro Preview | `epoch-ai:aime:google-gemini-3-pro-preview-default-epoch-inspect-row-135` | — | `default` | — | — |
| Gemini 3 Pro Preview | `epoch-ai:chess-puzzles:google-gemini-3-pro-preview-default-epoch-inspect-row-162` | — | `default` | — | — |
| Gemini 3 Pro Preview | `epoch-ai:epoch-capabilities-index:google-gemini-3-pro-preview-default-epoch-inspect-row-193` | — | `default` | — | — |
| Gemini 3 Pro Preview | `epoch-ai:frontiermath:google-gemini-3-pro-preview-default-epoch-inspect-row-43:tier-4` | — | `default` | — | — |
| Gemini 3 Pro Preview | `epoch-ai:frontiermath:google-gemini-3-pro-preview-default-epoch-inspect-row-44` | — | `default` | — | — |
| Gemini 3 Pro Preview | `epoch-ai:gpqa-diamond:google-gemini-3-pro-preview-default-epoch-inspect-row-133` | — | `default` | — | — |
| Gemini 3 Pro Preview | `epoch-ai:simpleqa-verified:google-gemini-3-pro-preview-default-epoch-inspect-row-77` | — | `default` | — | — |
| Gemini 3 Pro Preview | `epoch-ai:swe-bench:google-gemini-3-pro-preview-default-epoch-inspect-row-22` | — | `default` | — | — |
| GLM-5.1 | `epoch-ai:aime:zai-glm-5-1-default-epoch-inspect-row-8` | — | `default` | — | — |
| GLM-5.1 | `epoch-ai:chess-puzzles:zai-glm-5-1-default-epoch-inspect-row-8` | — | `default` | — | — |
| GLM-5.1 | `epoch-ai:epoch-capabilities-index:zai-glm-5-1-default-epoch-inspect-row-14` | — | `default` | — | — |
| GLM-5.1 | `epoch-ai:frontiermath:zai-glm-5-1-default-epoch-inspect-row-8` | — | `default` | — | — |
| GLM-5.1 | `epoch-ai:frontiermath:zai-glm-5-1-default-epoch-inspect-row-8:tier-4` | — | `default` | — | — |
| GLM-5.1 | `epoch-ai:gpqa-diamond:zai-glm-5-1-default-epoch-inspect-row-8` | — | `default` | — | — |
| GLM-5.1 | `epoch-ai:simpleqa-verified:zai-glm-5-1-default-epoch-inspect-row-34` | — | `default` | — | — |
| GLM-5.1 | `epoch-ai:swe-bench:zai-glm-5-1-default-epoch-inspect-row-6` | — | `default` | — | — |
| GPT-5.2 Pro | `epoch-ai:epoch-capabilities-index:openai-gpt-5-2-pro-xhigh-epoch-inspect-row-776` | — | `default` | — | — |
| GPT-5.2 Pro (web) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-2-pro-default-epoch-inspect-row-204` | — | `default` | — | — |
| GPT-5.2 Pro (web) | `epoch-ai:frontiermath:openai-gpt-5-2-pro-default-epoch-inspect-row-29:tier-4` | — | `default` | — | — |
| GPT-5.3 Codex | `epoch-ai:epoch-capabilities-index:openai-gpt-5-3-codex-default-epoch-inspect-row-531` | — | `default` | — | — |
| GPT-5.4 Pro | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-pro-default-epoch-inspect-row-763` | — | `default` | — | — |
| GPT-5.4 Pro (no thinking) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-pro-default-epoch-inspect-row-795` | — | `default` | — | — |
| GPT-5.4 Pro (web) | `epoch-ai:epoch-capabilities-index:openai-gpt-5-4-pro-default-epoch-inspect-row-184` | — | `default` | — | — |
| GPT-5.4 Pro (web) | `epoch-ai:frontiermath:openai-gpt-5-4-pro-default-epoch-inspect-row-19:tier-4` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:aime:moonshot-kimi-k2-6-default-epoch-inspect-row-108` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:chess-puzzles:moonshot-kimi-k2-6-default-epoch-inspect-row-128` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:epoch-capabilities-index:moonshot-kimi-k2-6-default-epoch-inspect-row-131` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:frontiermath:moonshot-kimi-k2-6-default-epoch-inspect-row-10:tier-4` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:frontiermath:moonshot-kimi-k2-6-default-epoch-inspect-row-9` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:gpqa-diamond:moonshot-kimi-k2-6-default-epoch-inspect-row-106` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:simpleqa-verified:moonshot-kimi-k2-6-default-epoch-inspect-row-35` | — | `default` | — | — |
| Kimi K2.6 | `epoch-ai:swe-bench:moonshot-kimi-k2-6-default-epoch-inspect-row-8` | — | `default` | — | — |
| Kimi K2.7 Code | `epoch-ai:aime:moonshot-kimi-k2-7-code-default-epoch-inspect-row-23` | — | `default` | — | — |
| Kimi K2.7 Code | `epoch-ai:chess-puzzles:moonshot-kimi-k2-7-code-default-epoch-inspect-row-26` | — | `default` | — | — |
| Kimi K2.7 Code | `epoch-ai:epoch-capabilities-index:moonshot-kimi-k2-7-code-default-epoch-inspect-row-39` | — | `default` | — | — |
| Kimi K2.7 Code | `epoch-ai:gpqa-diamond:moonshot-kimi-k2-7-code-default-epoch-inspect-row-21` | — | `default` | — | — |
| Kimi K2.7 Code | `epoch-ai:simpleqa-verified:moonshot-kimi-k2-7-code-default-epoch-inspect-row-25` | — | `default` | — | — |
| MiniMax-M3 | `epoch-ai:aime:minimax-minimax-m3-default-epoch-inspect-row-6` | — | `default` | — | — |
| MiniMax-M3 | `epoch-ai:chess-puzzles:minimax-minimax-m3-default-epoch-inspect-row-6` | — | `default` | — | — |
| MiniMax-M3 | `epoch-ai:epoch-capabilities-index:minimax-minimax-m3-default-epoch-inspect-row-12` | — | `default` | — | — |
| MiniMax-M3 | `epoch-ai:gpqa-diamond:minimax-minimax-m3-default-epoch-inspect-row-6` | — | `default` | — | — |
| Muse Spark | `epoch-ai:aime:meta-muse-spark-default-epoch-inspect-row-114` | — | `default` | — | — |
| Muse Spark | `epoch-ai:epoch-capabilities-index:meta-muse-spark-default-epoch-inspect-row-182` | — | `default` | — | — |
| Muse Spark | `epoch-ai:frontiermath:meta-muse-spark-default-epoch-inspect-row-16` | — | `default` | — | — |
| Muse Spark | `epoch-ai:frontiermath:meta-muse-spark-default-epoch-inspect-row-17:tier-4` | — | `default` | — | — |
| Muse Spark | `epoch-ai:gpqa-diamond:meta-muse-spark-default-epoch-inspect-row-112` | — | `default` | — | — |
| Muse Spark | `epoch-ai:simpleqa-verified:meta-muse-spark-default-epoch-inspect-row-41` | — | `default` | — | — |
| Nemotron 3 Ultra | `epoch-ai:epoch-capabilities-index:nvidia-nemotron-3-ultra-default-epoch-inspect-row-542` | — | `default` | — | — |
| Qwen3.6 27B | `epoch-ai:aime:alibaba-qwen3-6-27b-default-epoch-inspect-row-28` | — | `default` | — | — |
| Qwen3.6 27B | `epoch-ai:aime:alibaba-qwen3-6-27b-default-epoch-inspect-row-29` | — | `default` | — | — |
| Qwen3.6 27B | `epoch-ai:chess-puzzles:alibaba-qwen3-6-27b-default-epoch-inspect-row-33` | — | `default` | — | — |
| Qwen3.6 27B | `epoch-ai:chess-puzzles:alibaba-qwen3-6-27b-default-epoch-inspect-row-34` | — | `default` | — | — |
| Qwen3.6 27B | `epoch-ai:gpqa-diamond:alibaba-qwen3-6-27b-default-epoch-inspect-row-26` | — | `default` | — | — |
| Qwen3.6 27B | `epoch-ai:gpqa-diamond:alibaba-qwen3-6-27b-default-epoch-inspect-row-27` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:aime:alibaba-qwen3-7-max-default-epoch-inspect-row-19` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:chess-puzzles:alibaba-qwen3-7-max-default-epoch-inspect-row-23` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:epoch-capabilities-index:alibaba-qwen3-7-max-default-epoch-inspect-row-36` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:gpqa-diamond:alibaba-qwen3-7-max-default-epoch-inspect-row-18` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:simpleqa-verified:alibaba-qwen3-7-max-default-epoch-inspect-row-24` | — | `default` | — | — |
| Qwen3.7 Max | `epoch-ai:swe-bench:alibaba-qwen3-7-max-default-epoch-inspect-row-2` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:aime:alibaba-qwen3-7-plus-default-epoch-inspect-row-37` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:aime:alibaba-qwen3-7-plus-default-epoch-inspect-row-38` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:chess-puzzles:alibaba-qwen3-7-plus-default-epoch-inspect-row-45` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:chess-puzzles:alibaba-qwen3-7-plus-default-epoch-inspect-row-46` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:epoch-capabilities-index:alibaba-qwen3-7-plus-default-epoch-inspect-row-59` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:epoch-capabilities-index:alibaba-qwen3-7-plus-default-epoch-inspect-row-60` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:gpqa-diamond:alibaba-qwen3-7-plus-default-epoch-inspect-row-36` | — | `default` | — | — |
| Qwen3.7 Plus | `epoch-ai:gpqa-diamond:alibaba-qwen3-7-plus-default-epoch-inspect-row-37` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
