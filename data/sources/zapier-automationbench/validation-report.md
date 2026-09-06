# Zapier AutomationBench acquisition validation

- Page: <https://zapier.com/benchmarks>
- Discovered route module: <https://framerusercontent.com/sites/4WTSl4BNjd1q9QFEFibC6h/EoTxbXN5IqknxERosd2sBrwM9eKEsz_G9J9FFC1HRNA.BaX_1WYu.mjs>
- Module evidence: `sha256:e8377b3a254f87733d8070c5399c39feda6974b668db9d1e65972e73bf5b8f69`
- Page evidence: `sha256:19774a7f462d72c48df077b78ed9fcbd1338dddd3089b393513b37ef421b21a1`
- Observed at: 2026-09-06T03:20:03.737Z

## Exact counts

| Check | Count |
|---|---:|
| Framer .mjs modules discovered from page HTML | 15 |
| Leaderboard rows parsed | 95 |
| Maximum visible rank | 95 |
| Cost records emitted | 93 |
| Missing-cost rows (—) | 0 |
| Starred standard-price rows | 3 |
| Fallback-composite rows with excluded fallback cost (§) | 1 |
| Fireworks-marked standard-price rows (‡) | 1 |
| Dedicated-deployment cost rows excluded from costs | 1 |
| Canonically resolved rows | 81 |
| Canonically unresolved rows | 14 |
| Distinct canonically unresolved names | 14 |
| Excluded candidate rows | 1 |
| Excluded cost records | 1 |

## Benchmark contract and visible comparison

- AutomationBench version: `1.0.6`.
- Required content feature: `task_completed_correctly`. The route module is selected by content, never by its deployment hash.
- Visible comparison: maximum rank 95 equals 95 parsed rows.
- Headline metric: API-mode `task_completed_correctly` (strict pass/fail). `partial_credit` is diagnostic-only and is not materialized.

## Adoption status

- User ruling 2026-08-23: Adopted for product scoring and cost aggregation by user ruling on 2026-08-23. Rows are excluded only for a row-specific reason.
- Superseded ruling 2026-08-22: Zapier is retained as reviewed source data but is not approved for product scoring or cost aggregation until the post-N source-adoption review.
- Parsed scores and comparable costs now feed capability dimensions, Overall Score, leaderboard eligibility, ranking, and cost charts.
- Rows still excluded carry a row-specific reason (unreviewed effort segment, or a Minimal label that cannot represent Low). Excluded candidate rows: 1.

## Cost policy

- Starred raw value: `$0.61*` → numeric cost `0.61` by user ruling 2026-08-22. Source note: *Promotional pricing is available for both Gemini models; Ranking and Cost / task reflect standard list pricing. Gemini 3.7 Flash: $0.30 / task through Dec 31, 2026. Gemini 3.8 Flash: $0.27 (Medium) / $0.31 (High) per task.
- Fallback-composite raw value: `$2.45§` → no CostRecord because the displayed amount excludes Opus fallback tokens. Source note: § Rank 5 is Fable 5.1 with an Opus 5 fallback: when Fable 5.1's safety classifier refuses a step, Opus 5 completes it and Fable finishes the task. Opus 5 handled ~40% of tasks (260 of 657); the 31.4% score includes those fallback completions. Cost/task shown is Fable 5.1 alone and excludes fallback tokens, so the true combo cost is higher.
- Fireworks-marked raw value: `$0.14‡` → numeric per-task cost, with the source's Fireworks pricing note preserved. Source note: ‡DeepSeek V4 Flash priced at Fireworks rates ($0.14 / task uncached, $0.04 cached).
- Missing raw value: `—` → no CostRecord; it is never written as zero.
- Dedicated raw value: `$0.09†` → no CostRecord by user ruling 2026-08-22. Source note: †Dedicated-deployment pricing; not directly comparable to per-token API cost.
- Every raw Cost / task string remains in the CandidateResult provenance locator, including `*`, `§`, `‡`, `†`, and `—`.

## Excluded rows

| Reason | Rows | Examples |
|---|---:|---|
| Zapier published both Minimal and Low labels for this model; minimal cannot represent low. | 1 | Gemini 3.5 Flash (Minimal) |

## Unresolved model names

- Claude Fable 5.1 (Max)
- Claude Fable 5.1 (XHigh)
- Claude Fable 5.1 with Opus 5 Fallback (Max)
- Claude Haiku 4.5
- Gemini 3.1 Pro (preview) (High)
- Gemini 3.1 Pro (preview) (Low)
- Gemini 3.1 Pro (preview) (Medium)
- Gemini 3.8 Flash (High)
- Gemini 3.8 Flash (Medium)
- Gemma 4 31B (Max)
- GPT-OSS 120B (High)
- Minimax M2.7 (High)
- Qwen 3.6+ (High)
- Qwen 3.7+

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Candidate rows | 84 | 95 | +11 |
| Cost records | 82 | 93 | +11 |
| Canonically unresolved rows | 9 | 14 | +5 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `zapier-automationbench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| GPT-5.4 | `zapier-automationbench:automationbench:gpt-5-4-rank-94:1-0-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-4-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.5 | `zapier-automationbench:automationbench:gpt-5-5-rank-88:1-0-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-5-2026-04-22-thinking-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.6 Luna | `zapier-automationbench:automationbench:gpt-5-6-luna-rank-93:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-luna-max:arc-agi-2-v2-semi-private |
| GPT-5.6 Sol | `zapier-automationbench:automationbench:gpt-5-6-sol-rank-75:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-sol-max:arc-agi-2-v2-semi-private |
| GPT-5.6 Terra | `zapier-automationbench:automationbench:gpt-5-6-terra-rank-89:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-terra-max:arc-agi-2-v2-semi-private |
| Kimi K3 | `zapier-automationbench:automationbench:kimi-k3-rank-18:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Kimi K2.6 | `zapier-automationbench:automationbench:kimi-k2-6-rank-82:1-0-6` | — | `default` | — | — |
| Kimi K2.7 Code | `zapier-automationbench:automationbench:kimi-k2-7-code-rank-80:1-0-6` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
