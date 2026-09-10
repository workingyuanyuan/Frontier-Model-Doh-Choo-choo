# Frontier Code acquisition validation

- Page: <https://cognition.com/frontiercode>
- Official static export: <https://cognition.com/data/frontiercode-leaderboard/data.json>
- Export evidence: `sha256:7573c844a9420a24c6450405dd919eeb59457f22df16d8b1bcc286e604aa5e5b`
- Page/JSON-LD evidence: `sha256:48bb1567aa56eb823cd7388e0d7519dc99ef7bdcf4e907448c5b31a0813adf72`

## Acquirable scope

| Check | Count |
|---|---:|
| Models in FrontierCode 1.1 | 35 |
| Main effort configurations | 95 |
| Main configurations with scores | 95 |
| Main configurations with costs | 95 |
| Models with multiple efforts | 19 |
| Models with five efforts | 10 |
| Canonically unresolved models | 7 |

The official export contains both `main` and `extended` results. This source materializes all current `v1_1` Main configurations because Main is the default leaderboard and the JSON-LD comparison target. Extended remains preserved in the content-addressed raw artifact and is not silently mixed into `frontier-code-1-1`.

## Cross-checks

- JSON-LD Top 10 exact rank/name/one-decimal-score matches: 10/10.
- JSON-LD mismatches: none.
- Rendered DOM rows observed: 35; the visible leaderboard showed the same Top 10: yes.
- The rendered UI labels `cost` as mean USD cost per rollout; it is preserved as `AGENT_TASK` / `USD_PER_TASK`.

## Identity and missing-value policy

Exact catalog resolution succeeded for 28/35 models. Unresolved names are retained with null canonical/profile identity: Composer 2.5, GLM 5.3, GLM 5.3 Flash, Kimi K2.7, Mistral 3.5 Medium, SWE-1.6, SWE-1.7.

Source effort `none` is preserved as null effort and null profile ID. It is not guessed as max/default. Missing costs would be omitted rather than written as zero; this snapshot has a finite cost for every Main configuration.

## Known documentation conflict

Cognition FrontierCode 1.1 percentage scores use the dedicated `frontier-code-1-1` benchmark ID. `frontierswe` belongs to Proximal FrontierSWE, a different organiser scoring model+harness rank and dominance; the two are never merged. See `SPEC.md` §4.2.

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
| MiniMax M3 | `frontier-code:frontier-code-1-1:minimax-m3-none` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Nemotron 3 Ultra | `frontier-code:frontier-code-1-1:nemotron-3-ultra-none` | — | `default` | — | — |
| Qwen 3.7 Plus | `frontier-code:frontier-code-1-1:qwen-3-7-plus-none` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
