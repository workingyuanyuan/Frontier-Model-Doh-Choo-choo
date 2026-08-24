# DeepSWE acquisition validation

- Source: `https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json`
- Evidence ID: `sha256:37423f93a3e51e86e32c64c9c676962e317533536721ba2602dd9f19370a0f6c`
- Generated at: `2026-08-13T16:11:55.708Z`

## Exact counts

| Check | Count |
|---|---:|
| Configuration rows extracted | 61 |
| Distinct models represented | 24 |
| Models with multi-effort reasoning ladders | 11 |
| Canonically resolved candidates | 61 |
| Canonically unresolved candidates | 0 |

## Multi-effort reasoning ladders preserved

Per SPEC.md §9.2 and §6.3, all configuration rows and reasoning effort ladders are preserved unpruned during acquisition for advanced Pareto frontier curves:

- claude-opus-5 (5 levels: max, xhigh, high, medium, low)
- gpt-5-6-sol (5 levels: max, xhigh, high, medium, low)
- claude-fable-5 (5 levels: xhigh, max, high, medium, low)
- gpt-5-6-terra (5 levels: max, xhigh, high, medium, low)
- grok-4-6 (4 levels: medium, xhigh, high, low)
- gpt-5-6-luna (5 levels: max, xhigh, high, medium, low)
- gpt-5-5 (4 levels: xhigh, high, medium, low)
- claude-opus-4-8 (5 levels: max, xhigh, high, medium, low)
- claude-sonnet-5 (5 levels: max, xhigh, high, medium, low)
- glm-5-2 (2 levels: max, high)
- gemini-3-7-flash (3 levels: medium, high, low)

## Role boundary & cost semantics

- DeepSWE is an organizer-run agent benchmark (`ORGANIZER`).
- `mean_cost_usd` is preserved as `AGENT_TASK` cost with harness in provenance.

## Visible comparison

- Fresh rendered page model count: 24
- Complete export distinct model count: 24
- Result: matched

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Configuration rows | 53 | 61 | +8 |
| Distinct models | 21 | 24 | +3 |
| Materialized costs | 43 | 61 | +18 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

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
