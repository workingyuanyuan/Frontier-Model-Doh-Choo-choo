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
| Canonically unresolved models | 7 |

The official export contains both `main` and `extended` results. This source materializes all current `v1_1` Main configurations because Main is the default leaderboard and the JSON-LD comparison target. Extended remains preserved in the content-addressed raw artifact and is not silently mixed into `frontier-code-1-1`.

## Cross-checks

- JSON-LD Top 10 exact rank/name/one-decimal-score matches: 10/10.
- JSON-LD mismatches: none.
- Rendered DOM rows observed: 28; the visible leaderboard showed the same Top 10: yes.
- The rendered UI labels `cost` as mean USD cost per rollout; it is preserved as `AGENT_TASK` / `USD_PER_TASK`.

## Identity and missing-value policy

Exact catalog resolution succeeded for 21/28 models. Unresolved names are retained with null canonical/profile identity: Composer 2.5, DeepSeek V4 Flash 0731, Kimi K2.7, Mistral 3.5 Medium, Qwen 3.7 Plus, SWE-1.6, SWE-1.7.

Source effort `none` is preserved as null effort and null profile ID. It is not guessed as max/default. Missing costs would be omitted rather than written as zero; this snapshot has a finite cost for every Main configuration.

## Known documentation conflict

Cognition FrontierCode 1.1 percentage scores use the dedicated `frontier-code-1-1` benchmark ID. `frontierswe` belongs to Proximal FrontierSWE, a different organiser scoring model+harness rank and dominance; the two are never merged. See `REFACTOR_SPEC_V2.md` §4.2.
