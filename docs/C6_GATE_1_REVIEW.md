# C6 Gate 1 review material

Status: prepared by the agent; **Gate 1 remains pending user review**.

## ProductVersion

- `versionId`: `sha256:07914ef3ca4f632b6c71a3f7ef67618c931f6d0b5e13d1425c7807bd490805dd`
- Frontier model count: 53 (before C6: 33)
- Models represented by all four active sources: 15 (before C6: 8)
- Four source snapshot IDs are embedded in the uncommitted
  `data-v2/product/current.json`.

The 15 four-source models are Claude Fable 5, Claude Opus 5, Claude Sonnet
4.6/5, DeepSeek V4 Flash/Pro, Gemini 3.6/3.7 Flash, Kimi K3, GPT-5.6
Luna/Sol/Terra, Grok 4.5/4.6, and GLM-5.2.

## Refreshed source populations

| Source              |            Refreshed population | Visible comparison                              | Validation report                                          |
| ------------------- | ------------------------------: | ----------------------------------------------- | ---------------------------------------------------------- |
| Artificial Analysis | 482 score profiles / 223 active | rendered catalog 609; different disclosed scope | `data-v2/sources/artificial-analysis/validation-report.md` |
| LiveBench           |    44 profiles / 176 candidates | 44/44                                           | `data-v2/sources/livebench/validation-report.md`           |
| DeepSWE             |          61 configs / 24 models | 24/24 models; UI also shows 61 configs          | `data-v2/sources/deepswe/validation-report.md`             |
| FrontierCode        |          28 models / 77 configs | 28/28; JSON-LD Top 10 10/10                     | `data-v2/sources/frontier-code/validation-report.md`       |

All four manifests have `lastVerifiedAt` on 2026-08-18. Raw artifacts remain
content-addressed outside Git; missing scores, costs, and identities remain
null/absent rather than zero-filled.

## Effort-inference review

Every source validation report contains a deterministic tagged section marked
`PENDING USER REVIEW`. Raw `profile.effort` is unchanged.

| Target source       | Cross-source rows | Distinct models | `default` rows | Distinct default models |
| ------------------- | ----------------: | --------------: | -------------: | ----------------------: |
| Artificial Analysis |               161 |              15 |             79 |                       7 |
| LiveBench           |                44 |              11 |             32 |                       8 |
| DeepSWE             |                 0 |               0 |              1 |                       1 |
| FrontierCode        |                 4 |               4 |              2 |                       2 |

FrontierCode's four known inferences are:

| Model           | Raw source effort     | Product effort | Basis                         |
| --------------- | --------------------- | -------------- | ----------------------------- |
| DeepSeek V4 Pro | null                  | `max`          | DeepSWE max row               |
| GLM 5.2         | null                  | `max`          | Artificial Analysis max row   |
| Inkling         | invalid `0.99` → null | `xhigh`        | Artificial Analysis xhigh row |
| Kimi K3         | null                  | `max`          | Artificial Analysis max row   |

MiniMax M3 and Qwen 3.7 Plus have no direct tier in another source and use the
outside-the-ladder `default`. The full row-level basis candidate IDs are in the
source reports; this document does not approve them.

## Claude Opus 4.6 anomaly from spec §12

The previously recorded `max 53.7` versus `high 81.1` pair is **not reproduced
by the four current active source snapshots**:

- LiveBench now has only the high profile for the four approved categories:
  Reasoning 88.673, Mathematics 89.317, Language 83.270, and Instruction
  Following 63.313.
- FrontierCode has high 26.64, medium 23.67, and low 18.31; it has no max row.
- Artificial Analysis and DeepSWE have no active Claude Opus 4.6 candidate.

Therefore the old pair cannot be adjudicated from current active evidence and
does not enter the new ProductVersion. It remains a historical unresolved
observation rather than being corrected or estimated.

## Gate boundary

`data-v2/product/current.json` remains untracked and must not be committed until
the user completes Gate 1. No D-phase task may begin before that review.
