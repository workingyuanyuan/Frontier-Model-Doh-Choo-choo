# N/A Identity Remediation — 2026-07-19

## Outcome

Draft `sha256:84ca804385bcce0c23d7084ef9d50c2fd2353ae845f87c59029723a5b3eb8297` resolves all distinct canonical identities available in the current Epoch AI, Vals AI, and Artificial Analysis composite Top 20 cohorts. It increases scored profile-dimension cells from 161 to 215 without turning any previously scored cell into N/A.

Published was not created or changed.

## Root cause

The raw snapshots contained enough direct Benchmark results, but the model catalog contained only 15 base models and the resolver compared most source names only with catalog display names. Provider-qualified slugs and source configuration labels therefore remained unresolved even when they referred to a current Frontier model.

Examples included `GPT-5.3 Codex (high)`, `Claude Opus 4.6 (32k thinking)`, `kimi/kimi-k2.6`, `Qwen3.7-Max`, and Artificial Analysis reasoning labels.

## Implemented correction

- Added reviewed canonical model entries and exact source aliases to `data-v2/mappings/models.json`.
- Made aliases part of the versioned `ModelCatalog` schema.
- Replaced catalog display-name scanning with a deterministic normalized alias index.
- Alias collisions between different canonical models fail closed.
- Trailing source configuration groups are removed only after an exact raw-name lookup fails.
- Effort is parsed only from the explicit tokens `max`, `xHigh`, `high`, `medium`, or `low`.
- No fuzzy similarity match is used for identity assignment.
- Source Harness, tools, attempt, thinking, and context remain in Evidence configuration and do not create Product Profiles.
- Composite ranking rows remain Excluded from eight-dimension scoring.

## Source results

| Source              | Candidate rows | Unresolved before | Unresolved after | Resolved after | Current composite Top 20 identity gate |
| ------------------- | -------------: | ----------------: | ---------------: | -------------: | -------------------------------------- |
| Epoch AI            |          1,231 |             1,037 |              931 |            300 | Pass                                   |
| Vals AI             |            218 |               114 |               84 |            134 | Pass                                   |
| Artificial Analysis |            376 |               162 |              109 |            267 | Pass                                   |

The remaining unresolved totals contain historical, alias-specific, or lower-ranked distinct models outside the current product catalog. They remain preserved as Candidate Results and are not guessed into a newer model family.

Examples of unsafe merges deliberately rejected include Claude Sonnet 4/4.5 → Claude Sonnet 4.6, DeepSeek V3 → DeepSeek V4, and Gemini 2.5/3 Flash → Gemini 3.5.

## Product impact

| Metric                          | Previous Draft | New Draft |                Change |
| ------------------------------- | -------------: | --------: | --------------------: |
| Frontier base models            |             29 |        35 |                    +6 |
| Ranked base models              |             26 |        34 |                    +8 |
| Product Profiles                |             39 |        52 |                   +13 |
| Evidence rows                   |            568 |       758 |                  +190 |
| Included evidence               |            412 |       550 |                  +138 |
| Effective scoring contributions |            380 |       496 |                  +116 |
| Covered profile-dimension cells |            161 |       215 |                   +54 |
| N/A profile-dimension cells     |      151 / 312 | 201 / 416 |            +50 / +104 |
| N/A rate                        |          48.4% |     48.3% | -0.1 percentage point |

The absolute coverage gain is the meaningful measure here. The N/A rate moves only slightly because successful identity resolution also adds six dynamic Frontier models and thirteen Product Profiles to the denominator.

No previously covered profile-dimension cell regressed to N/A. GPT-5.2 Pro and GPT-5.3 Codex now have direct scored evidence. Claude Mythos Preview is the only current Frontier model still awaiting direct Benchmark evidence.

## N/A interpretation after remediation

N/A continues to mean one of three explicit states:

1. the source did not test the model on that dimension;
2. the source row is retained but its canonical identity remains unresolved;
3. no adopted Benchmark for that dimension is available for the Profile.

N/A is never converted to zero. A model with at least one scored dimension remains visible as Estimated.

## Reproducibility and safety gates

- All distinct current composite Top 20 identities for the three repaired sources have automated coverage tests.
- Re-running all three materializers produced identical hashes for all six Candidate/report outputs.
- Composite metrics are used only for Frontier selection and display.
- Every effective result is selected once per Benchmark, version, Profile, and metric; Harness variants cannot double-count.
- Draft integrity audit found zero duplicate Evidence IDs, zero duplicate scoring contributions, zero missing Evidence references, zero Included composite rows, and zero null Included scores.
- Repository format, lint, typecheck, test, and production build gates pass.
- Browser review loaded the exact Draft and verified Leaderboard sorting, Profile switching, responsive containment, and a clean console. Mobile Lighthouse scored 100 for accessibility, best practices, SEO, and agentic browsing; observed LCP was 242 ms and CLS was 0.00.
- Draft pointer: `data-v2/product/pointers/draft.json`.
- Published pointer: absent.

The final five-axis code review found no correctness, architecture, security, or performance blocker in this remediation. The existing source materializer module is large and should eventually be split by source, but this is an existing structural concern rather than a reason to withhold the data correction.

## Deferred identity work

Historical catalog expansion is not required to remove current-product N/A and must be handled as explicit reviewed catalog work. A future batch may add genuinely distinct models only when they enter the dynamic Top 20, are manually designated as a new model, or otherwise become product-relevant.
