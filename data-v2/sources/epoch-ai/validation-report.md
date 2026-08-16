# Epoch AI acquisition validation

- Refreshed: **2026-08-12T16:40:13.196Z**
- Official page: <https://epoch.ai/benchmarks/use-this-data>
- Official export: <https://epoch.ai/data/benchmark_data.zip>
- Source-declared ZIP update: **2026-07-27**
- Raw evidence: complete page HTML and ZIP stored content-addressably; every Candidate provenance reference points to the new ZIP hash.

## Before / after

| Check | 2026-07-16 snapshot | 2026-07-27 export |
|---|---:|---:|
| ZIP files / CSV files | 75 / 74 | 77 / 76 |
| ECI finite-score rows | 460 | 521 |
| ECI metadata rows without score | 259 | 294 |
| Materialized direct scored rows | 771 | 1,031 |
| CandidateResults | 1,231 | 1,552 |
| Distinct raw model names | 370 | 411 |
| Canonically unresolved candidates | 931 | 1,130 |

All 521 ECI rows are Epoch-owned composite evidence and remain `EXCLUDED`, selection-only data. The 1,031 materialized direct rows cover GPQA Diamond, MATH Level 5, SWE-bench Verified, OTIS Mock AIME 2024-2025, FrontierMath Tiers 1-3, FrontierMath Tier 4, SimpleQA Verified, and Chess Puzzles. The 64 `_external.csv` mirrors are not represented as Epoch-run CandidateResults.

FrontierMath and ECI use `ORGANIZER`; Epoch reruns of externally created benchmarks use `INDEPENDENT`. Raw Epoch Inspect harness and run fields stay in provenance and do not create Product Profiles.

## Preserved but not promoted

The refreshed ZIP adds two Epoch-hosted result files beyond the existing shared mapping:

| Raw file | Rows | Status |
|---|---:|---|
| `mystery_game_puzzles.csv` (Earthborne Rangers / EBR-bench) | 47 | Preserved in ZIP; not materialized pending shared benchmark ID and dimension mapping |
| `mirrorcode.csv` | 6 | Preserved in ZIP; not materialized pending shared benchmark ID and dimension mapping |

This bounded refresh does not modify the shared benchmark mapping or schema. These 53 rows are therefore excluded from the 1,031 direct Candidate count rather than being assigned an unapproved dimension.

## Risks and unresolved

- 1,130 candidates retain null canonical identity; no fuzzy matching was applied.
- The source page and download describe the export as updated July 27, while several MirrorCode rows inside the ZIP have August timestamps. The immutable ZIP hash is authoritative for this capture, and the temporal discrepancy is recorded for review.
- ECI missing scores remain null and are never converted to zero.
