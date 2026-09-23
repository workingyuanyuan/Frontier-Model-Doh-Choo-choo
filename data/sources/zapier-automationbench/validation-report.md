# Zapier AutomationBench acquisition validation

- Page: <https://zapier.com/benchmarks>
- Discovered route module: <https://framerusercontent.com/sites/4WTSl4BNjd1q9QFEFibC6h/EoTxbXN5IqknxERosd2sBrwM9eKEsz_G9J9FFC1HRNA.Cx1g6uSd.mjs>
- Module evidence: `sha256:438ab4b64e40894a152629225061abf06e1015a4eb073f1d7c0faddc9ee3171a`
- Page evidence: `sha256:b4305ae2512d8d41dd488f9b2e81b64c22ff1253399cf92d7f9cf6bcc4c39a93`
- Observed at: 2026-09-23T04:19:19.162Z

## Exact counts

| Check | Count |
|---|---:|
| Framer .mjs modules discovered from page HTML | 16 |
| Leaderboard rows parsed | 112 |
| Maximum visible rank | 112 |
| Cost records emitted | 110 |
| Missing-cost rows (—) | 0 |
| Starred standard-price rows | 3 |
| Fallback-composite rows with excluded fallback cost (§) | 1 |
| Fireworks-marked standard-price rows (‡) | 1 |
| Dedicated-deployment cost rows excluded from costs | 1 |
| Canonically resolved rows | 102 |
| Canonically unresolved rows | 10 |
| Distinct canonically unresolved names | 10 |
| Excluded candidate rows | 1 |
| Excluded cost records | 1 |

## Benchmark contract and visible comparison

- AutomationBench version: `1.0.6`.
- Required content feature: `task_completed_correctly`. The route module is selected by content, never by its deployment hash.
- Visible comparison: maximum rank 112 equals 112 parsed rows.
- Headline metric: API-mode `task_completed_correctly` (strict pass/fail). `partial_credit` is diagnostic-only and is not materialized.

## Adoption status

- User ruling 2026-08-23: Adopted for product scoring and cost aggregation by user ruling on 2026-08-23. Rows are excluded only for a row-specific reason.
- Superseded ruling 2026-08-22: Zapier is retained as reviewed source data but is not approved for product scoring or cost aggregation until the post-N source-adoption review.
- Parsed scores and comparable costs now feed capability dimensions, Overall Score, leaderboard eligibility, ranking, and cost charts.
- Rows still excluded carry a row-specific reason (unreviewed effort segment, or a Minimal label that cannot represent Low). Excluded candidate rows: 1.

## Cost policy

- Starred raw value: `$0.61*` → numeric cost `0.61` by user ruling 2026-08-22. Source note: *Promotional pricing is available for both Gemini models; Ranking and Cost / task reflect standard list pricing. Gemini 3.7 Flash: $0.30 / task through Dec 31, 2026. Gemini 3.8 Flash: $0.27 (Medium) / $0.31 (High) per task.
- Fallback-composite raw value: `$2.45§` → no CostRecord because the displayed amount excludes Opus fallback tokens. Source note: § Rank 10 is Fable 5.1 with an Opus 5 fallback: when Fable 5.1's safety classifier refuses a step, Opus 5 completes it and Fable finishes the task. Opus 5 handled ~40% of tasks (260 of 657); the 31.4% score includes those fallback completions. Cost/task shown is Fable 5.1 alone and excludes fallback tokens, so the true combo cost is higher.
- Fireworks-marked raw value: `$0.14‡` → numeric per-task cost, with the source's Fireworks pricing note preserved. Source note: ‡DeepSeek V4 Flash priced at Fireworks rates ($0.14 / task uncached, $0.04 cached).
- Missing raw value: `—` → no CostRecord; it is never written as zero.
- Dedicated raw value: `$0.09†` → no CostRecord by user ruling 2026-08-22. Source note: †Dedicated-deployment pricing; not directly comparable to per-token API cost.
- Every raw Cost / task string remains in the CandidateResult provenance locator, including `*`, `§`, `‡`, `†`, and `—`.

## Excluded rows

| Reason | Rows | Examples |
|---|---:|---|
| Zapier published both Minimal and Low labels for this model; minimal cannot represent low. | 1 | Gemini 3.5 Flash (Minimal) |

## Unresolved model names

- Claude Fable 5.1 with Opus 5 Fallback (Max)
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
| Candidate rows | 112 | 112 | +0 |
| Cost records | 93 | 110 | +17 |
| Canonically unresolved rows | 27 | 10 | -17 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `zapier-automationbench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| GPT-5.4 | `zapier-automationbench:automationbench:gpt-5-4-rank-111:1-0-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-4-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.5 | `zapier-automationbench:automationbench:gpt-5-5-rank-104:1-0-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-5-2026-04-22-thinking-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.6 Luna | `zapier-automationbench:automationbench:gpt-5-6-luna-rank-110:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-luna-max:arc-agi-2-v2-semi-private |
| GPT-5.6 Sol | `zapier-automationbench:automationbench:gpt-5-6-sol-rank-90:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-sol-max:arc-agi-2-v2-semi-private |
| GPT-5.6 Terra | `zapier-automationbench:automationbench:gpt-5-6-terra-rank-105:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-terra-max:arc-agi-2-v2-semi-private |
| Kimi K3 | `zapier-automationbench:automationbench:kimi-k3-rank-27:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Kimi K2.6 | `zapier-automationbench:automationbench:kimi-k2-6-rank-97:1-0-6` | — | `default` | — | — |
| Kimi K2.7 Code | `zapier-automationbench:automationbench:kimi-k2-7-code-rank-95:1-0-6` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
