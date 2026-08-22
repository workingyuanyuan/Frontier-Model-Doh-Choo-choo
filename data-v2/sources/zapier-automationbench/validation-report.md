# Zapier AutomationBench acquisition validation

- Page: <https://zapier.com/benchmarks>
- Discovered route module: <https://framerusercontent.com/sites/4WTSl4BNjd1q9QFEFibC6h/EoTxbXN5IqknxERosd2sBrwM9eKEsz_G9J9FFC1HRNA.DiRrazN8.mjs>
- Module evidence: `sha256:76c693bbda064645c276a80688f1a8cd9190a4ba12b549f8c2df1b6674188b53`
- Page evidence: `sha256:70aeac3acccb510f033d28f2438a748b90c93080fd062c6705326fc6956a280b`
- Observed at: 2026-08-22T09:13:22.151Z

## Exact counts

| Check | Count |
|---|---:|
| Framer .mjs modules discovered from page HTML | 15 |
| Leaderboard rows parsed | 84 |
| Maximum visible rank | 84 |
| Cost records emitted | 82 |
| Missing-cost rows (—) | 1 |
| Starred standard-price rows | 1 |
| Dedicated-deployment cost rows excluded from costs | 1 |
| Canonically resolved rows | 75 |
| Canonically unresolved rows | 9 |
| Distinct canonically unresolved names | 9 |
| Excluded candidate rows | 84 |
| Excluded cost records | 82 |

## Benchmark contract and visible comparison

- AutomationBench version: `1.0.6`.
- Required content feature: `task_completed_correctly`. The route module is selected by content, never by its deployment hash.
- Visible comparison: maximum rank 84 equals 84 parsed rows.
- Headline metric: API-mode `task_completed_correctly` (strict pass/fail). `partial_credit` is diagnostic-only and is not materialized.

## Adoption status

- User ruling 2026-08-22: Zapier is retained as reviewed source data but is not approved for product scoring or cost aggregation until the post-N source-adoption review.
- All parsed scores and comparable costs remain in the source artifacts as EXCLUDED records. They do not affect capability dimensions, Overall Score, leaderboard eligibility, ranking, or cost charts.
- Revisit whether to adopt the Zapier source only after the N phase is complete.

## Cost policy

- Starred raw value: `$0.61*` → numeric cost `0.61` by user ruling 2026-08-22. Source note: *Gemini 3.7 Flash launch promo: $0.30 / task through Dec 31, 2026 ($0.75 in / $3.75 out per MTok). Ranking and Cost / task reflect standard list pricing; the promo is noted but does not affect rank.
- Missing raw value: `—` → no CostRecord; it is never written as zero.
- Dedicated raw value: `$0.09†` → no CostRecord by user ruling 2026-08-22. Source note: †Dedicated-deployment pricing; not directly comparable to per-token API cost.
- Every raw Cost / task string remains in the CandidateResult provenance locator, including `*`, `†`, and `—`.

## Excluded rows

| Reason | Rows | Examples |
|---|---:|---|
| Zapier is retained as reviewed source data but is not approved for product scoring or cost aggregation until the post-N source-adoption review. | 83 | Claude Fable 5.0 (High); Claude Fable 5.0 (Low); Claude Fable 5.0 (Max); Claude Fable 5.0 (Medium); Claude Fable 5.0 (XHigh); … |
| Zapier is retained as reviewed source data but is not approved for product scoring or cost aggregation until the post-N source-adoption review. Zapier published both Minimal and Low labels for this model; minimal cannot represent low. | 1 | Gemini 3.5 Flash (Minimal) |

## Unresolved model names

- Claude Haiku 4.5
- Gemini 3.1 Pro (preview) (High)
- Gemini 3.1 Pro (preview) (Low)
- Gemini 3.1 Pro (preview) (Medium)
- Gemma 4 31B (Max)
- GPT-OSS 120B (High)
- Minimax M2.7 (High)
- Qwen 3.6+ (High)
- Qwen 3.7+

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Candidate rows | 84 | 84 | +0 |
| Cost records | 82 | 82 | +0 |
| Canonically unresolved rows | 9 | 9 | +0 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.
