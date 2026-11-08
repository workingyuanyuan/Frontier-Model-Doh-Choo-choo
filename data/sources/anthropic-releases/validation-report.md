# Anthropic release-page acquisition validation

- Source: <https://www.anthropic.com/claude-opus-5-5> (published 2026-09-22).
- Evidence: `sha256:e6f3c643572b45883c235393e373469b59f3b5fd721e02811f88af08afcf8a03`
- Selected RSC charts: `tuskchartfrontiercode` (25 rows); `tuskchartcursorbench` (20 rows).
- Each selected chart has the expected benchmark/version marker and complete Low, Med, High, Xhigh, and Max rows for every extracted series.
- The plotted y coordinate is retained as a percent score. The x coordinate is materialized as USD per task; the captured xAxis label specifies Cost per task (USD, log scale). Costs retain the score row identity and exclusions.
- Explicit CSV effort labels are retained. The chart data does not name a harness, so harness is null.
- The FrontierCode Fable 5.1 Low row is preserved at 52.8% but excluded because Cognition reports 49.82% for the corresponding leaderboard row; re-audit the configuration before including it (<https://cognition.com/frontiercode>).
- Source note preserved in row provenance: Anthropic states that Claude Opus 5.5 figures use adaptive thinking at max effort unless noted; each selected chart row has an explicit effort label. Claude Opus 5.5 was evaluated with production safeguards enabled; when they intervened, cybersecurity tasks were completed by Claude Opus 4.8, and biology and frontier LLM development tasks were completed by Claude Opus 5, which Anthropic says likely lowers these scores. The charts do not state a harness, so harness is unknown.
- This is a vendor-reported partial extraction of two release-page charts; separate organizer results remain separate evidence.

# Anthropic expanded release acquisition

- Source: <https://www.anthropic.com/claude-sonnet-5-5>.
- Evidence: `sha256:136b88842396b2005e3f52b053aa9e7c76fa35ec4d107fd877fa95580a36f2aa`.
- Selected charts: 5767a19c590d (20 rows); d41fb6b3ae01 (20 rows); 5270a8faea1f (20 rows).
- Included: 40; excluded: 20.
- Explicit effort labels, tools configuration, chart score units, task-cost units, and source notes are retained in provenance.
- Each CSV row explicitly labels effort. Sonnet 5.5 FrontierCode Max (46.2%) is lower than Xhigh (52.1%); the footnote attributes this to code-review subagents causing timeouts or extra changes in two examined cases. The page discusses production cyber fallback to Sonnet 5; no per-task intervention counts are provided for these coding charts. No harness is named for each chart row. Sonnet 5.5 AA-Briefcase was run by Artificial Analysis on a pre-release deployment with a structured-output bug since fixed; GPT-6 Sol may predate an image-understanding fix.
- Full page findings and chart quarantine: docs/research/anthropic-release-expansion.md.

# Anthropic expanded release acquisition

- Source: <https://www.anthropic.com/claude-fable-and-mythos-5-1>.
- Evidence: `sha256:05bfb04a9f8c6011d00868bd733d4fd2d0bf19dc3cab5078e107ee58029a5e93`.
- Selected charts: lc2chart (20 rows).
- Included: 0; excluded: 20.
- Explicit effort labels, tools configuration, chart score units, task-cost units, and source notes are retained in provenance.
- Fable 5.1 and Fable 5 were evaluated with production safeguards enabled. The page says cybersecurity interventions fall back to Claude Opus 4.8 and biology interventions to Claude Opus 5; these mixed-model HLE rows are excluded. The chart separates with-tools and no-tools series. No HLE dataset version or harness is stated. The displayed release date is September 2026, so no exact day is inferred.
- Full page findings and chart quarantine: docs/research/anthropic-release-expansion.md.

# Claude Opus 5 release review

- Source: <https://www.anthropic.com/news/claude-opus-5>.
- Evidence: `sha256:115f5126e9dda745da466af0af6ef1782c9ea8cef28c4110d1bfd7427375f32e`.
- Benchmark comparisons are raster images without exact embedded chart coordinates; research findings and quarantine are recorded in docs/research/anthropic-release-expansion.md.
- Frontier-Bench v0.1 uses mini-SWE-agent, GKE, mean reward over five attempts, and Opus 4.8 fallback for Opus 5/Fable 5.

## Organizer cross-check

- Matched: 74
- Vendor preview rows absent from reference: 10
- Excluded: 41
- Per-row references and rounding decisions: [cross-checks.json](cross-checks.json).

## Snapshot delta

Comparison uses the immutable pre-import snapshot.

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Candidate results | 125 | 125 | +0 |
| Materialized costs | 125 | 125 | +0 |

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `anthropic-releases`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
