# Frontier Code acquisition validation

- Page: <https://cognition.com/frontiercode>
- Official static export: <https://cognition.com/data/frontiercode-leaderboard/data.json>
- Export evidence: `sha256:1b418dda0c291be4d5149966620882ef40cbb97cad0c4a2e4aa81b954900a20a`
- Page/JSON-LD evidence: `sha256:99df5234616a757f65d09cc9beb3c24f5f54963bba7a2a6dd9fde725cf58a4cf`

## Acquirable scope

| Check | Count |
|---|---:|
| Models in FrontierCode 1.1 | 28 |
| Main effort configurations | 77 |
| Main configurations with scores | 77 |
| Main configurations with costs | 77 |
| Models with multiple efforts | 15 |
| Models with five efforts | 8 |
| Canonically unresolved models | 5 |

The official export contains both `main` and `extended` results. This source materializes all current `v1_1` Main configurations because Main is the default leaderboard and the JSON-LD comparison target. Extended remains preserved in the content-addressed raw artifact and is not silently mixed into `frontier-code-1-1`.

## Cross-checks

- JSON-LD Top 10 exact rank/name/one-decimal-score matches: 10/10.
- JSON-LD mismatches: none.
- Rendered DOM rows observed: 28; the visible leaderboard showed the same Top 10: yes.
- The rendered UI labels `cost` as mean USD cost per rollout; it is preserved as `AGENT_TASK` / `USD_PER_TASK`.

## Identity and missing-value policy

Exact catalog resolution succeeded for 23/28 models. Unresolved names are retained with null canonical/profile identity: Composer 2.5, Kimi K2.7, Mistral 3.5 Medium, SWE-1.6, SWE-1.7.

Source effort `none` is preserved as null effort and null profile ID. It is not guessed as max/default. Missing costs would be omitted rather than written as zero; this snapshot has a finite cost for every Main configuration.

## Known documentation conflict

Cognition FrontierCode 1.1 percentage scores use the dedicated `frontier-code-1-1` benchmark ID. `frontierswe` belongs to Proximal FrontierSWE, a different organiser scoring model+harness rank and dominance; the two are never merged. See `SPEC.md` §4.2.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Distinct models | 28 | 28 | +0 |
| Main configurations | 77 | 77 | +0 |
| Materialized costs | 77 | 77 | +0 |

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
| MiniMax M3 | `frontier-code:frontier-code-1-1:minimax-m3-none` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-57:1-0-6 |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Qwen 3.7 Plus | `frontier-code:frontier-code-1-1:qwen-3-7-plus-none` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
