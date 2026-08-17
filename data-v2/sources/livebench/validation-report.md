# LiveBench acquisition validation

- Release: `2026-06-25` (cacheVersion `1786549038`) dynamically extracted from `https://livebench.ai/static/js/main.b540d9a3.js`
- Evidence: `https://livebench.ai/table_2026_06_25.csv?v=1786549038` and `https://livebench.ai/categories_2026_06_25.json?v=1786549038`

## Exact counts

| Check | Count |
|---|---:|
| Raw model rows in table CSV | 40 |
| Approved scoring categories | 4 (Reasoning, Mathematics, Language, IF) |
| Excluded/Unapproved categories | 3 (Coding, Agentic Coding, Data Analysis) |
| Generated CandidateResults | 160 |
| Canonically resolved candidates | 96 |
| Canonically unresolved candidates | 64 |

## Category scope boundary

Per REFACTOR_SPEC_V2.md §9.1 and §5.2, only the 4 approved categories (Reasoning, Mathematics, Language, Instruction Following) enter scoring. Coding, Agentic Coding, and Data Analysis categories are unapproved and excluded.

## Discrepancies and notes

- None. All 40 model rows have complete task coverage across the 4 approved categories.
