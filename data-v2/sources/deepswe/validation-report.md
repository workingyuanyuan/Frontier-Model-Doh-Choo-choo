# DeepSWE acquisition validation

- Source: `https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json`
- Evidence ID: `sha256:c4be4303194e8c91a6033b7e03cc1952845817412daaef42cab8679797191c3f`
- Generated at: `2026-08-07T19:41:58.007Z`

## Exact counts

| Check | Count |
|---|---:|
| Configuration rows extracted | 53 |
| Distinct models represented | 21 |
| Models with multi-effort reasoning ladders | 9 |
| Canonically resolved candidates | 53 |
| Canonically unresolved candidates | 0 |

## Multi-effort reasoning ladders preserved

Per REFACTOR_SPEC_V2.md §9.2 and §6.3, all configuration rows and reasoning effort ladders are preserved unpruned during acquisition for advanced Pareto frontier curves:

- claude-opus-5 (5 levels: max, xhigh, high, medium, low)
- gpt-5-6-sol (5 levels: max, xhigh, high, medium, low)
- claude-fable-5 (5 levels: xhigh, max, high, medium, low)
- gpt-5-6-terra (5 levels: max, xhigh, high, medium, low)
- gpt-5-6-luna (5 levels: max, xhigh, high, medium, low)
- gpt-5-5 (4 levels: xhigh, high, medium, low)
- claude-opus-4-8 (5 levels: max, xhigh, high, medium, low)
- claude-sonnet-5 (5 levels: max, xhigh, high, medium, low)
- glm-5-2 (2 levels: max, high)

## Role boundary & cost semantics

- DeepSWE is an organizer-run agent benchmark (`ORGANIZER`).
- `mean_cost_usd` is preserved as `AGENT_TASK` cost with harness in provenance.
