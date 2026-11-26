# Frontier Code acquisition validation

- Page (renders FrontierCode 2.0 only since 2026-10-27): <https://cognition.com/frontiercode>
- FrontierCode 2.0 export: <https://cognition.com/data/frontier-code-2.0/data.json>
- FrontierCode 1.1 export (no longer rendered): <https://cognition.com/data/frontiercode-leaderboard/data.json>
- Page/JSON-LD evidence: `sha256:d860b7cac2e349a5816e981d39a609743c5f891254ad1f92f39868b0f74fb328`
- 1.1 export evidence: `sha256:9306c93c1029981c8e5bd3e1cf6d18d4d669690622e92b88f23d939e9abb8070`

FrontierCode 1.1 (`frontier-code-1-1`) and FrontierCode 2.0 (`frontier-code-2-0`) are different benchmarks. Neither replaces the other; their scores are never merged.

## FrontierCode 2.0

- 2.0 export evidence: `sha256:feda9f00a605cfef9fc9b7168437eeec39d34f930bd65558fa55b601bf282fb0`

| Check | Count |
|---|---:|
| 2.0 visible models | 36 |
| 2.0 Main configurations | 144 |
| 2.0 configurations with costs (materialized, INCLUDED) | 144 |
| 2.0 models with multiple efforts | 34 |
| 2.0 hidden export models | 0 |
| 2.0 canonically unresolved models | 4 |

- Rendered Best reasoning mode rows: 36; All reasoning levels rows: 144; both equal the export after removing the page's hidden models (none).
- JSON-LD `FrontierCode 2.0 Leaderboard` Top 10 exact rank/name/one-decimal-score matches: 10/10; mismatches: none.
- The rendered Top 10 matched the JSON-LD and export: yes.
- Hidden models stay in the raw artifact and are not materialized; neither are their costs.
- Cost is the mean USD spend per rollout at list API pricing (page methodology), stored as `AGENT_TASK` / `USD_PER_TASK`. Since the 2026-10-28 user decision the cost chart pairs Frontier Code costs with `frontier-code-2-0`; 1.1 costs are kept EXCLUDED as superseded and are never blended with 2.0.
- Effort `na` (SWE-1.6, SWE-1.7) and other non-policy keys stay null. Neither the export nor the methodology states a per-configuration rollout count, so attempts stays null.
- Unresolved names keep null canonical/profile identity: GLM 5.3, SWE-1.6, SWE-1.7, SWE-2.

## FrontierCode 1.1

| Check | Count |
|---|---:|
| 1.1 export models | 45 |
| 1.1 export Main configurations | 134 |
| Rows preserved from the previous snapshot | 7 |
| Costs preserved from the previous snapshot | 7 |
| Export rows new since the previous snapshot | 0 |
| Score/cost changes against the previous snapshot | 0 |
| Models with multiple efforts | 30 |
| Models with five efforts | 17 |
| Canonically unresolved models | 8 |

- The main page no longer renders 1.1; the 1.1 post shows only its launch chart. The `v1_1` export is therefore checked against the previous snapshot instead of a rendered board.
- Models removed upstream and preserved unchanged: GPT-6.1 Terra, Mistral Large 4 (Preview).
- Preserved rows and costs re-resolved against the current effort rule and model catalog (scores, evidence and provenance unchanged): none.
- New export rows: none.
- Value changes: none.
- The export contains both `main` and `extended`; only Main is materialized. Source effort `none` becomes `non-reasoning` only among multiple distinct options for the same model and benchmark version; singleton `none` and `na` stay null. Scores and costs share the same effort decision and retain the raw key in provenance. Missing costs are omitted, never zero.
- All 141 1.1 cost records keep their IDs but are EXCLUDED: Superseded by the FrontierCode 2.0 mean rollout cost (user decision 2026-10-28); the 1.1 cost remains as evidence only.
- Unresolved names keep null canonical/profile identity: Composer 2.5, DeepSeek V4.1 Flash, GLM 5.3, Kimi K2.7, Mistral 3.5 Medium, SWE-1.6, SWE-1.7, SWE-2.

## Known documentation conflict

Cognition FrontierCode percentages use the dedicated `frontier-code-1-1` and `frontier-code-2-0` IDs. `frontierswe` belongs to Proximal FrontierSWE, a different organiser scoring model+harness rank and dominance; they are never merged. See `SPEC.md` §4.2.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `frontier-code`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| DeepSeek V4 Pro | `frontier-code:frontier-code-1-1:deepseek-v4-pro-none` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| GLM 5.2 | `frontier-code:frontier-code-1-1:glm-5-2-none` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| Inkling | `frontier-code:frontier-code-1-1:inkling-0-99` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:inkling |
| Kimi K3 | `frontier-code:frontier-code-1-1:kimi-k3-none` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:kimi-code-kimi-k3-reasoning-max:1-1 |
| MiniMax M3 | `frontier-code:frontier-code-1-1:minimax-m3-none` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| Nemotron 3 Ultra | `frontier-code:frontier-code-1-1:nemotron-3-ultra-none` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:nemotron-3-ultra-mini-swe-agent-max |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Qwen 3.7 Plus | `frontier-code:frontier-code-1-1:qwen-3-7-plus-none` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
