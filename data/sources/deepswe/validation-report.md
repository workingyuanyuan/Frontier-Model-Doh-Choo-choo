# DeepSWE acquisition validation

- Source: `https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json`
- Evidence ID: `sha256:005cbedb49f988ba3f0d9636300862ad7ace93ce1992b37faf9945fe5b383415`
- Generated at: `2026-09-03T22:24:37.984Z`

## Exact counts

| Check | Count |
|---|---:|
| Configuration rows extracted | 70 |
| Distinct models represented | 28 |
| Models with multi-effort reasoning ladders | 13 |
| Canonically resolved candidates | 68 |
| Canonically unresolved candidates | 2 |

## Multi-effort reasoning ladders preserved

Per SPEC.md §9.2 and §6.3, all configuration rows and reasoning effort ladders are preserved unpruned during acquisition for advanced Pareto frontier curves:

- gpt-6-astra (5 levels: xhigh, high, max, medium, low)
- gemini-3-8-flash (2 levels: high, medium)
- claude-opus-5 (5 levels: max, xhigh, high, medium, low)
- gpt-5-6-sol (5 levels: max, xhigh, high, medium, low)
- claude-fable-5 (5 levels: xhigh, max, high, medium, low)
- gpt-5-6-terra (5 levels: max, xhigh, high, medium, low)
- grok-4-6 (4 levels: medium, xhigh, high, low)
- gpt-5-6-luna (5 levels: max, xhigh, high, medium, low)
- gpt-5-5 (4 levels: xhigh, high, medium, low)
- gemini-3-7-flash (3 levels: medium, high, low)
- claude-opus-4-8 (5 levels: max, xhigh, high, medium, low)
- claude-sonnet-5 (5 levels: max, xhigh, high, medium, low)
- glm-5-2 (2 levels: max, high)

## Role boundary & cost semantics

- DeepSWE is an organizer-run agent benchmark (`ORGANIZER`).
- `mean_cost_usd` is preserved as `AGENT_TASK` cost with harness in provenance.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `deepswe`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| kimi-k2-7-code | `deepswe-1-1:mini-swe-agent-kimi-k2-7-code-default` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
