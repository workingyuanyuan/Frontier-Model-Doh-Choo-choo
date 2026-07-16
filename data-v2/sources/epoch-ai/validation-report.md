# Epoch AI acquisition validation

- Verified: 2026-07-16
- Official export: https://epoch.ai/data/benchmark_data.zip
- Export page date: **Updated Jul. 16, 2026**
- Completeness: **73 CSVs** inspected: **9 internal** and **64 external**.

## Role boundary

Only the nine files without an `_external.csv` suffix are eligible as Epoch AI independent runs. External files are mirrors and are deliberately absent from this source fixture. ECI rows are retained as `EXCLUDED` because the composite is used for frontier selection, not eight-dimension scoring.

## Bounded candidate set

The ECI selection set contains the current Top 20 unique base models. Rows are sorted by numeric `ECI Score`; duplicate base models are collapsed, with ties resolved by retaining the highest declared reasoning-effort profile. All 20 ECI rows are `EXCLUDED` from eight-dimension scoring and retain exact export profile identities and field-level provenance.

The scoring candidate set includes GPT-5.6 profiles from Chess Puzzles, SimpleQA Verified, GPQA Diamond and OTIS Mock AIME 2024-2025. FrontierMath and SWE-bench Verified remain available in the complete ZIP but had no matching GPT-5.6 rows in this export.

## Limitations

Some newest Epoch rows do not yet expose public log-viewer links. Missing logs are not inferred.
