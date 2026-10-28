# Frontier Code acquisition validation

- Page (renders FrontierCode 2.0 only since 2026-10-27): <https://cognition.com/frontiercode>
- FrontierCode 2.0 export: <https://cognition.com/data/frontier-code-2.0/data.json>
- FrontierCode 1.1 export (no longer rendered): <https://cognition.com/data/frontiercode-leaderboard/data.json>
- Page/JSON-LD evidence: `sha256:aaf284bc3932c789ab4c188043c68ff6e710b17e997fc38245e491a834dce8b9`
- 1.1 export evidence: `sha256:ff0040778b7bdf69c705ad7474f771fb5e53cfaf5cf8573b3a4614153543d75f`

FrontierCode 1.1 (`frontier-code-1-1`) and FrontierCode 2.0 (`frontier-code-2-0`) are different benchmarks. Neither replaces the other; their scores are never merged.

## FrontierCode 2.0

- 2.0 export evidence: `sha256:d0c31eab422050e400627d3ed0578706dc2b3c0605db281a06fd3eadce21b566`

| Check | Count |
|---|---:|
| 2.0 visible models | 25 |
| 2.0 Main configurations | 98 |
| 2.0 configurations with costs (not materialized) | 98 |
| 2.0 models with multiple efforts | 23 |
| 2.0 hidden export models | 1 |
| 2.0 canonically unresolved models | 10 |

- Rendered Best reasoning mode rows: 25; All reasoning levels rows: 98; both equal the export after removing the page's hidden models (Obsidian 3).
- JSON-LD `FrontierCode 2.0 Leaderboard` Top 10 exact rank/name/one-decimal-score matches: 10/10; mismatches: none.
- The rendered Top 10 matched the JSON-LD and export: yes.
- Hidden models stay in the raw artifact and are not materialized. 2.0 rollout costs stay in the raw artifact; the cost chart pairs Frontier Code costs with `frontier-code-1-1`.
- Effort `na` (SWE-1.6, SWE-1.7) and other non-policy keys stay null. Neither the export nor the methodology states a per-configuration rollout count, so attempts stays null.
- Unresolved names keep null canonical/profile identity: Beam 1.0, Claude Haiku 5.5, DeepSeek V4.1 Flash, GLM 5.3, GLM 5.3 Flash, Inkling Small, Mistral Large 4, SWE-1.6, SWE-1.7, SWE-2.

## FrontierCode 1.1

| Check | Count |
|---|---:|
| 1.1 export models | 46 |
| 1.1 export Main configurations | 136 |
| Rows preserved from the previous snapshot | 5 |
| Costs preserved from the previous snapshot | 5 |
| Export rows new since the previous snapshot | 0 |
| Score/cost changes against the previous snapshot | 0 |
| Models with multiple efforts | 30 |
| Models with five efforts | 17 |
| Canonically unresolved models | 11 |

- The main page no longer renders 1.1; the 1.1 post shows only its launch chart. The `v1_1` export is therefore checked against the previous snapshot instead of a rendered board.
- Models removed upstream and preserved unchanged: GPT-6.1 Terra.
- New export rows: none.
- Value changes: none.
- The export contains both `main` and `extended`; only Main is materialized. Source effort `none` stays null. Missing costs are omitted, never zero.
- Unresolved names keep null canonical/profile identity: Claude Haiku 5.5, Composer 2.5, DeepSeek V4.1 Flash, GLM 5.3, GLM 5.3 Flash, Kimi K2.7, Mistral 3.5 Medium, Mistral Large 4 (Preview), SWE-1.6, SWE-1.7, SWE-2.

## Known documentation conflict

Cognition FrontierCode percentages use the dedicated `frontier-code-1-1` and `frontier-code-2-0` IDs. `frontierswe` belongs to Proximal FrontierSWE, a different organiser scoring model+harness rank and dominance; they are never merged. See `SPEC.md` §4.2.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Distinct models | 47 | 47 | +0 |
| Main configurations | 141 | 141 | +0 |
| Materialized costs | 141 | 141 | +0 |
| 2.0 models | 0 | 25 | +25 |
| 2.0 configurations | 0 | 98 | +98 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `frontier-code`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| DeepSeek V4 Pro | `frontier-code:frontier-code-1-1:deepseek-v4-pro-none` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| GLM 5.2 | `frontier-code:frontier-code-1-1:glm-5-2-none` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| Inkling | `frontier-code:frontier-code-1-1:inkling-0-99` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:inkling |
| Kimi K3 | `frontier-code:frontier-code-1-1:kimi-k3-none` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| MiniMax M3 | `frontier-code:frontier-code-1-1:minimax-m3-none` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-99:1-0-6 |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Nemotron 3 Ultra | `frontier-code:frontier-code-1-1:nemotron-3-ultra-none` | — | `default` | — | — |
| Qwen 3.7 Plus | `frontier-code:frontier-code-1-1:qwen-3-7-plus-none` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
