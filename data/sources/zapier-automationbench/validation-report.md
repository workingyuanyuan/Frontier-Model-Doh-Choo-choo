# Zapier AutomationBench acquisition validation

- Page: <https://zapier.com/benchmarks>
- Discovered route module: <https://framerusercontent.com/sites/4WTSl4BNjd1q9QFEFibC6h/rn52rdZJHt2gbM6e3TQ2IZeI1ZzaI0JhYlYVcNYii8Y.Bkira_ya.mjs>
- Module evidence: `sha256:74544d733b5bac187e31871927b125d7a6bf21928482e57b0949ab438d14de23`
- Page evidence: `sha256:4f7a8325388237297e3f8862f0c0f285949aa3d0caa274a0b3020a96240049e3`
- Observed at: 2026-11-26T06:56:11.944Z

## Exact counts

| Check | Count |
|---|---:|
| Framer .mjs modules discovered from page HTML | 10 |
| Leaderboard rows parsed | 151 |
| Maximum visible rank | 151 |
| Cost records emitted | 150 |
| Missing-cost rows (—) | 0 |
| Starred standard-price rows | 5 |
| Fallback-composite rows with excluded fallback cost (§) | 0 |
| Provisional launch-version rows adopted (model name §) | 5 |
| Fireworks-marked standard-price rows (‡) | 1 |
| Dedicated-deployment cost rows excluded from costs | 1 |
| Canonically resolved rows | 143 |
| Canonically unresolved rows | 8 |
| Distinct canonically unresolved names | 8 |
| Excluded candidate rows | 3 |
| Excluded cost records | 3 |

## Benchmark contract and visible comparison

- AutomationBench version: `1.0.6`.
- Required content feature: `task_completed_correctly`. The route module is selected by content, never by its deployment hash.
- Visible comparison: maximum rank 151 equals 151 parsed rows.
- Headline metric: API-mode `task_completed_correctly` (strict pass/fail). `partial_credit` is diagnostic-only and is not materialized.

## Adoption status

- User ruling 2026-08-23: Adopted for product scoring and cost aggregation by user ruling on 2026-08-23. Rows are excluded only for a row-specific reason.
- Superseded ruling 2026-08-22: Zapier is retained as reviewed source data but is not approved for product scoring or cost aggregation until the post-N source-adoption review.
- Parsed scores and comparable costs now feed capability dimensions, Overall Score, leaderboard eligibility, ranking, and cost charts.
- Rows still excluded carry a row-specific reason (unreviewed effort segment, or a Minimal label that cannot represent Low). Excluded candidate rows: 3.

## Cost policy

- Starred raw value: `$0.61*` → numeric cost `0.61` by user ruling 2026-08-22. Source note: *These Gemini models have promotional pricing; ranking and Cost / task use standard list pricing. Gemini 4 Argon: $0.85 (High), $0.77 (Medium). Gemini 3.8 Flash: $0.27 (Medium), $0.31 (High). Gemini 3.7 Flash: $0.30 / task through Dec 31, 2026.
- Fallback-composite raw value: `$2.45§` → no CostRecord because the displayed amount excludes Opus fallback tokens. Source note: MISSING
- Fireworks-marked raw value: `$0.14‡` → numeric per-task cost, with the source's Fireworks pricing note preserved. Source note: ‡DeepSeek V4 Flash at Fireworks rates: $0.14 / task uncached, $0.04 cached.
- Missing raw value: `—` → no CostRecord; it is never written as zero.
- Dedicated raw value: `$0.09†` → no CostRecord by user ruling 2026-08-22. Source note: †Dedicated-deployment pricing; not directly comparable to per-token API cost.
- Provisional rows: a § after the model name marks initial results that Zapier says it will update. Scores are adopted as published and the footnote is kept in each rawScore locator. Source note: §Initial results based on the launch version of Haiku 5.5. Scores will be updated after an updated Haiku 5.5 release is evaluated.
- Every raw Cost / task string remains in the CandidateResult provenance locator, including `*`, `§`, `‡`, `†`, and `—`.

## Excluded rows

| Reason | Rows | Examples |
|---|---:|---|
| Unrecognised configuration segment "with Opus 5 Fallback" has not been reviewed as an effort tier. | 1 | Claude Fable 5.1 (with Opus 5 Fallback) |
| Unrecognised configuration segment "default fallbacks, Between tools" has not been reviewed as an effort tier. | 1 | Claude Sonnet 5.5 (default fallbacks, Between tools) |
| Zapier published both Minimal and Low labels for this model; minimal cannot represent low. | 1 | Gemini 3.5 Flash (Minimal) |

## Unresolved model names

- Claude Haiku 4.5
- Gemini 3.1 Pro (preview) (High)
- Gemini 3.1 Pro (preview) (Low)
- Gemini 3.1 Pro (preview) (Medium)
- GPT-OSS 120B (High)
- Minimax M2.7 (High)
- Qwen 3.6+ (High)
- Qwen 3.7+

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `zapier-automationbench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Claude Fable 5.1 (with Opus 5 Fallback) | `zapier-automationbench:automationbench:claude-fable-5-1-with-opus-5-fallback-rank-37:1-0-6` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:fable51-max |
| Claude Sonnet 5.5 (default fallbacks, Between tools) | `zapier-automationbench:automationbench:claude-sonnet-5-5-default-fallbacks-between-tools-rank-67:1-0-6` | — | `max` | anthropic-releases | anthropic-releases:sonnet-5-5:cursorbench-4:sonnet55-max |
| GPT-5.4 | `zapier-automationbench:automationbench:gpt-5-4-rank-150:1-0-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-4-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.5 | `zapier-automationbench:automationbench:gpt-5-5-rank-143:1-0-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-5-2026-04-22-thinking-xhigh:arc-agi-2-v2-semi-private |
| GPT-5.6 Luna | `zapier-automationbench:automationbench:gpt-5-6-luna-rank-149:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-luna-max:arc-agi-2-v2-semi-private |
| GPT-5.6 Sol | `zapier-automationbench:automationbench:gpt-5-6-sol-rank-129:1-0-6` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:codex-gpt-5-6-sol-reasoning-max:1-1 |
| GPT-5.6 Terra | `zapier-automationbench:automationbench:gpt-5-6-terra-rank-144:1-0-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-terra-max:arc-agi-2-v2-semi-private |
| Kimi K2.7 Code | `zapier-automationbench:automationbench:kimi-k2-7-code-rank-134:1-0-6` | — | `max` | surge-chartography | surge-chartography:chartography:kimi-k2-7-code-max-reasoning |
| Kimi K3 | `zapier-automationbench:automationbench:kimi-k3-rank-58:1-0-6` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:kimi-code-kimi-k3-reasoning-max:1-1 |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Kimi K2.6 | `zapier-automationbench:automationbench:kimi-k2-6-rank-136:1-0-6` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
