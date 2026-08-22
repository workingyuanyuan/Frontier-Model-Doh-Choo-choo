# Epoch AI acquisition validation

- Retrieved at: 2026-08-22T14:07:35.929Z
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
| `frontiermath` | 101 |
| `frontiermath-tier-4` | 72 |
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
| CandidateResults | 1612 | 1612 | +0 |
| Epoch Capabilities Index rows | 553 | 553 | +0 |
| Rows without a canonical identity | 1026 | 1026 | +0 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.
