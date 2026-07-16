# Artificial Analysis acquisition validation

- Verified: 2026-07-16
- Role: independent evaluator
- Live targets: <https://artificialanalysis.ai/models> and <https://artificialanalysis.ai/articles/gpt-5-6-has-landed>
- Evidence: complete 1,353,178-byte models response and 386,099-byte article response, content-addressed in `evidence-index.json`

## Checks

| Check           | Result                                                                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source identity | The article and methodology are first-party Artificial Analysis pages.                                                                                                                                                                                                                           |
| Freshness       | The score-bearing article is dated 2026-07-09.                                                                                                                                                                                                                                                   |
| Exact rows      | The models page exposes an official embedded Intelligence Index array containing exactly 20 ranked rows; all 20 are retained as selection-only candidates. The article separately states Coding Agent Index 80 for Sol in Codex, AA-Briefcase Rubric Score 42%, and Analytical Quality Elo 1592. |
| Profile         | `max` is explicit. Codex is explicit only for the Coding Agent Index row.                                                                                                                                                                                                                        |
| Completeness    | The approved frontier-selection slice is complete at the currently exposed Top 20. It is not a full 575-model catalog snapshot, so candidates remain `PARTIAL_SOURCE`.                                                                                                                           |
| Scoring safety  | Composite indices and Elo are excluded. The directly reported AA-Briefcase percentage is retained as an includable benchmark result.                                                                                                                                                             |

## Risks and limitations

- The Top 20 values use the embedded full-precision `intelligenceIndex` numbers; the visible UI rounds them to whole index points.
- Article chart images may contain additional per-evaluation values that are not exposed as accessible text. Those values were not transcribed.
- The AA-Briefcase result is a release-article statement rather than a complete leaderboard export.
- Full catalog ingestion needs a separately validated embedded-data or API path.
