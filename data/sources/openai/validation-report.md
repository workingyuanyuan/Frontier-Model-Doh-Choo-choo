# OpenAI acquisition validation

- Verified: 2026-07-17
- Role: vendor self-report
- Live target: <https://openai.com/index/gpt-5-6/>
- Evidence: normalized score-table DOM excerpt, content-addressed in `evidence-index.json`

## Checks

| Check                         | Result                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source identity               | Official OpenAI product release, dated 2026-07-09.                                                                                                                                                                                                                                                                                         |
| Exact rows                    | Selected GPT-5.6 Sol cells were read together with their table headers and benchmark labels.                                                                                                                                                                                                                                               |
| Profile                       | The page says effort is configurable but does not tie these table cells to one explicit effort; effort remains `null`.                                                                                                                                                                                                                     |
| Completeness                  | This is a selected current-benchmark extraction, not every table on the release page; candidates are `PARTIAL_SOURCE`.                                                                                                                                                                                                                     |
| Normalization                 | Percentage/accuracy/F1 cells use the reported percent directly. GDPval-AA Elo is excluded because no approved first-version normalization exists.                                                                                                                                                                                          |
| Retrieval constraint          | Direct HTTP returned 403, while the accessible semantic DOM exposed the full visible tables.                                                                                                                                                                                                                                               |
| Structured/visual consistency | Resolved by Profile identity: the release table reports a generic/unspecified GPT-5.6 Sol row at 52.7, while the organizer leaderboard reports Codex with `xhigh` effort at 53.6. The current vendor candidate keeps 52.7 under an unspecified Profile. A future 53.6 organizer result must be ingested as a separate Codex/xhigh Profile. |

## Risks and limitations

- Values are vendor-reported and must remain Estimated until matching independent or organizer results supersede them.
- Some evaluations use benchmark-specific tools or harnesses that are not fully described in the table; those profile fields remain `null` rather than inferred.
- The excluded GDPval-AA row is classified `INDEPENDENT` by executor because the metric is Artificial Analysis-run, but its current evidence is only the OpenAI page. It must not enter scoring until the Artificial Analysis source and exact configuration are captured separately.
- A browser-exported raw HTML or PDF artifact would strengthen replayability beyond the normalized DOM excerpt.
