# LLM Stats acquisition validation

- Verified: 2026-07-16
- Role: mixed-source aggregator (`INDEX ONLY`)
- Live target: <https://llm-stats.com/leaderboards/best-ai-for-coding>
- Evidence: complete 240,663-byte HTML response, content-addressed in `evidence-index.json`

## Checks

| Check                 | Result                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| Freshness             | Page states “Updated July 16, 2026”.                                                                   |
| Visible population    | Page states 165 models reviewed. This fixture does not claim to ingest all 165.                        |
| Exact rows            | The narrative states Claude Mythos Preview 56.5, Claude Fable 5 56.0, and GPT-5.6 Sol 55.6.            |
| Metric definition     | Coding index combines arena votes with benchmark performance.                                          |
| Upstream traceability | The row-level page does not assign one authoritative upstream execution source to the composite score. |
| Inclusion             | Every candidate is `EXCLUDED` with an `INDEX ONLY` reason.                                             |

## Risks and limitations

- LLM Stats is useful for frontier discovery but mixes independently measured, vendor-reported, and aggregated data.
- Profile details are not sufficiently specified for the three composite rows.
- A future full-table connector must validate lazy-loaded rows against the stated count before claiming `FULL`.
