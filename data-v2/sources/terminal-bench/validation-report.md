# Terminal-Bench acquisition validation

- Verified: 2026-07-16
- Official source: https://www.tbench.ai/leaderboard/terminal-bench/2.1
- Method: Next/RSC payload, checked against rendered table.
- Completeness: **17/17 rows**. The visible page and embedded payload agree.
- Current benchmark: **terminal-bench@2.1**.
- Role: **Benchmark organizer**. The page explicitly says the Terminal-Bench team ran and verified the results.

## Checks

| Check                              | Result                                          |
| ---------------------------------- | ----------------------------------------------- |
| Exact numeric accuracy             | Pass                                            |
| Harness retained                   | Pass                                            |
| Reasoning effort retained          | Pass                                            |
| Model/profile duplicates collapsed | No; distinct harnesses remain distinct profiles |
| Legacy versions imported           | No                                              |

## Limitations

The fixture records leaderboard accuracy only. Confidence intervals, reward-hack adjustments, token totals and task costs remain available in the evidence payload but are not represented by CandidateResultSchema.
