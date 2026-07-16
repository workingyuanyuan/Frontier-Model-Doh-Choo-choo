# OpenAI acquisition validation

- Verified: 2026-07-16
- Role: vendor self-report
- Live target: <https://openai.com/index/gpt-5-6/>
- Evidence: normalized score-table DOM excerpt, content-addressed in `evidence-index.json`

## Checks

| Check                         | Result                                                                                                                                                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source identity               | Official OpenAI product release, dated 2026-07-09.                                                                                                                                                                                             |
| Exact rows                    | Selected GPT-5.6 Sol cells were read together with their table headers and benchmark labels.                                                                                                                                                   |
| Profile                       | The page says effort is configurable but does not tie these table cells to one explicit effort; effort remains `null`.                                                                                                                         |
| Completeness                  | This is a selected current-benchmark extraction, not every table on the release page; candidates are `PARTIAL_SOURCE`.                                                                                                                         |
| Normalization                 | Percentage/accuracy/F1 cells use the reported percent directly. GDPval-AA Elo is excluded because no approved first-version normalization exists.                                                                                              |
| Retrieval constraint          | Direct HTTP returned 403, while the accessible semantic DOM exposed the full visible tables.                                                                                                                                                   |
| Structured/visual consistency | `STRUCTURED_VISUAL_CONFLICT`: the release narrative reports Agents' Last Exam 53.6, while the benchmark table reports 52.7. The candidate preserves the table-derived 52.7 and requires human review; the conflict is not silently reconciled. |

## Risks and limitations

- Values are vendor-reported and must remain Estimated until matching independent or organizer results supersede them.
- Some evaluations use benchmark-specific tools or harnesses that are not fully described in the table; those profile fields remain `null` rather than inferred.
- A browser-exported raw HTML or PDF artifact would strengthen replayability beyond the normalized DOM excerpt.
