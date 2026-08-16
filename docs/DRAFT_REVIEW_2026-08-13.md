# Draft review — 2026-08-13

## Verdict

Draft `sha256:8adb32f9b2600c9215a80f4deeaa4e67c9f9a024e5cfc62c05ebb039c6917c21` passes the agent review for preview use. It has not been Published. No Published pointer exists.

## Refreshed sources

| Source              | Previous snapshot                         | Refreshed snapshot                        | Product impact                                                                                |
| ------------------- | ----------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| Artificial Analysis | 376 candidates                            | 313 candidates; Intelligence Index v4.1.1 | 104 resolved scoring cells; removed obsolete codingIndex data rather than carrying it forward |
| LiveBench           | 38 source profiles; 16 bounded candidates | 40 source profiles; 160 candidates        | 24 resolved profiles contribute 96 Reasoning, Math, Language and Instruction results          |
| Epoch AI            | 75 ZIP files; 1,231 candidates            | 77 ZIP files; 1,552 candidates            | 250 resolved scoring cells; ECI snapshot 2026-07-27                                           |
| DeepSWE             | 42 configurations / 14 models             | 53 configurations / 21 models             | 15 resolved models contribute Coding; 43 retained cost records                                |

All adopted rows have schema-valid Candidate, Evidence and provenance records. Artifact hashes and byte lengths match the content-addressed files. Unresolved source identities remain in raw evidence and do not enter scoring through fuzzy matching.

## Organizer expansion

| Source                             | Public rows | Canonical rows | Product evidence | Cost rows | Review result                                                              |
| ---------------------------------- | ----------: | -------------: | ---------------: | --------: | -------------------------------------------------------------------------- |
| ARC Prize / ARC-AGI-3 semi-private |          26 |             25 |               24 |         0 | FULL; one Grok 4.20 beta identity remains unresolved                       |
| Scale AI / CAIS HLE final 2,500    |          50 |              9 |                7 |         0 | FULL; older model aliases remain raw rather than being guessed             |
| Zapier AutomationBench 1.0.6       |          83 |             76 |               66 |        82 | FULL; API-mode task score and per-task cost preserved                      |
| XLANG OSWorld 2.0                  |          10 |              8 |                8 |         7 | FULL; only official 500-step rows used                                     |
| Lech Mazur Writing                 |          39 |             24 |               22 |         0 | FULL; current pairwise win chance used, archived absolute ratings excluded |

The source-level public, extracted and Candidate row counts match for all five organizers. All 11 new Evidence records have matching content-addressed artifact hashes and byte lengths, and every Candidate and Cost evidence reference resolves. Canonical counts can be lower than source counts because the product intentionally refuses fuzzy identity assignment.

## Coverage change

| Metric                   | Previous Draft `e7f19241…` | Current Draft `8adb32f9…` | Change |
| ------------------------ | -------------------------: | ------------------------: | -----: |
| Frontier models          |                         31 |                        31 |      0 |
| Scored Profiles          |                         59 |                        82 |    +23 |
| Complete 8/8 Profiles    |                         14 |                        14 |      0 |
| Partial 1/8–7/8 Profiles |                         45 |                        68 |    +23 |
| Evidence rows            |                        782 |                       909 |   +127 |
| Cost points              |                         88 |                       110 |    +22 |

Dimension availability changed as follows: Reasoning 48→62, Knowledge 31→32, Language 22→35 and Agentic 24→67. Math, Instruction, Coding and Context did not gain covered Profiles in this refresh. The organizer expansion therefore materially improves developer-mode evidence depth, but does not yet increase the 14 complete 8/8 representative models shown by default.

The Frontier count decreased because the current Artificial Analysis payload no longer exposes the previous `codingIndex`; stale selection-only values were removed. This is a source correction, not lost direct Benchmark evidence.

## UI review

- Default mode renders 14 representative models and every displayed row is 8/8.
- The unlabeled visual switch has the accessible name `Developer mode`, uses `role="switch"`, and defaults off.
- Developer mode renders all 30 scored representative models, including 1/8–7/8 rows. The one Frontier model without a score remains absent.
- Model picker, radar comparison and cost curve use the same visibility boundary as the Leaderboard.
- Keyboard focus, reduced-motion handling and responsive header layout are preserved.

## Deferred raw evidence

- Epoch EBR and MirrorCode are retained in the refreshed ZIP but are not Candidate results until their Benchmark IDs and eight-dimension mappings are added.
- LiveBench Coding, Agentic Coding and Data Analysis remain in raw artifacts because their current mapping is not approved for scoring.
- Artificial Analysis has 187 unresolved candidates; Epoch has 1,130; LiveBench has 64; DeepSWE has 6. These remain traceable but excluded from canonical scoring.
- The five organizer additions retain 66 unresolved rows in total: ARC 1, HLE 41, Zapier 7, OSWorld 2 and Lech Writing 15. Most are older or non-frontier aliases; they are not a blocker for this Draft.

## Validation

- Acquisition: 22 tests passed.
- Benchmark data: 29 tests passed.
- Dashboard: 43 tests passed.
- Browser acceptance: 6 Playwright tests passed across desktop and mobile Chromium.
- Monorepo typecheck and build passed.
- `git diff --check` passed.
