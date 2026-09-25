# Zapier AutomationBench acquisition validation

- Page: <https://zapier.com/benchmarks>
- Discovered route module: <https://framerusercontent.com/sites/4WTSl4BNjd1q9QFEFibC6h/EoTxbXN5IqknxERosd2sBrwM9eKEsz_G9J9FFC1HRNA.cZm9uPli.mjs>
- Module evidence: `sha256:b5c968e366bce1a326d33cffacf09492a562a7d66881c69d772c68eeddcba2da`
- Page evidence: `sha256:2f51b26450006237ea35c6fd35e77add6e942cc41f6055d8083f0fffddbada04`
- Observed at: 2026-09-25T11:19:40.036Z

## Exact counts

| Check | Count |
|---|---:|
| Framer .mjs modules discovered from page HTML | 16 |
| Leaderboard rows parsed | 112 |
| Maximum visible rank | 112 |
| Cost records emitted | 111 |
| Missing-cost rows (—) | 0 |
| Starred standard-price rows | 3 |
| Fallback-composite rows with excluded fallback cost (§) | 0 |
| Fireworks-marked standard-price rows (‡) | 1 |
| Dedicated-deployment cost rows excluded from costs | 1 |
| Canonically resolved rows | 103 |
| Canonically unresolved rows | 9 |
| Distinct canonically unresolved names | 9 |
| Excluded candidate rows | 2 |
| Excluded cost records | 2 |

## Benchmark contract and visible comparison

- AutomationBench version: `1.0.6`.
- Required content feature: `task_completed_correctly`. The route module is selected by content, never by its deployment hash.
- Visible comparison: maximum rank 112 equals 112 parsed rows.
- Headline metric: API-mode `task_completed_correctly` (strict pass/fail). `partial_credit` is diagnostic-only and is not materialized.

## Adoption status

- User ruling 2026-08-23: Adopted for product scoring and cost aggregation by user ruling on 2026-08-23. Rows are excluded only for a row-specific reason.
- Superseded ruling 2026-08-22: Zapier is retained as reviewed source data but is not approved for product scoring or cost aggregation until the post-N source-adoption review.
- Parsed scores and comparable costs now feed capability dimensions, Overall Score, leaderboard eligibility, ranking, and cost charts.
- Rows still excluded carry a row-specific reason (unreviewed effort segment, or a Minimal label that cannot represent Low). Excluded candidate rows: 2.

## Cost policy

- Starred raw value: `$0.61*` → numeric cost `0.61` by user ruling 2026-08-22. Source note: *Both Gemini models have promotional pricing; ranking and Cost / task use standard list pricing. Gemini 3.7 Flash: $0.30 / task through Dec 31, 2026. Gemini 3.8 Flash: $0.27 (Medium), $0.31 (High).
- Fallback-composite raw value: `$2.45§` → no CostRecord because the displayed amount excludes Opus fallback tokens. Source note: MISSING
- Fireworks-marked raw value: `$0.14‡` → numeric per-task cost, with the source's Fireworks pricing note preserved. Source note: ‡DeepSeek V4 Flash at Fireworks rates: $0.14 / task uncached, $0.04 cached.
- Missing raw value: `—` → no CostRecord; it is never written as zero.
- Dedicated raw value: `$0.09†` → no CostRecord by user ruling 2026-08-22. Source note: †Dedicated-deployment pricing; not directly comparable to per-token API cost.
- Every raw Cost / task string remains in the CandidateResult provenance locator, including `*`, `§`, `‡`, `†`, and `—`.

## Excluded rows

| Reason | Rows | Examples |
|---|---:|---|
| Unrecognised configuration segment "with Opus 5 Fallback" has not been reviewed as an effort tier. | 1 | Claude Fable 5.1 (with Opus 5 Fallback) |
| Zapier published both Minimal and Low labels for this model; minimal cannot represent low. | 1 | Gemini 3.5 Flash (Minimal) |

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
| Candidate rows | 112 | 112 | +0 |
| Cost records | 93 | 111 | +18 |
| Canonically unresolved rows | 10 | 9 | -1 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `zapier-automationbench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Claude Fable 5.1 (with Opus 5 Fallback) | `zapier-automationbench:automationbench:claude-fable-5-1-with-opus-5-fallback-rank-10:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:anthropic-claude-fable-5-1-max:arc-agi-2-v2-semi-private |
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
