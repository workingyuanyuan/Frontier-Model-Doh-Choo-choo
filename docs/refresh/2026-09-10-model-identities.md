# Gemini 3.8 Flash and Claude Fable 5.1 identity materialization

The model catalog now resolves `google-gemini-3-8-flash` and `anthropic-claude-fable-5-1` through exact normalized names and provider-qualified aliases. DeepSWE's model lookup and LiveBench's cost lookup also include the captured names.

Release dates come from `releaseDate` on the two model rows in the recorded Artificial Analysis models-page RSC payload: Gemini 3.8 Flash `2026-09-02`, Claude Fable 5.1 `2026-09-01`. Locate the content-addressed artifact via `data/sources/artificial-analysis/evidence-index.json`, request URL `https://artificialanalysis.ai/models`. The capture is dated September 8. Candidate publication timestamps are not substituted for release dates.

Offline replay commands:

```sh
pnpm data:materialize-snapshots
pnpm --filter @llm-bench/acquisition rematerialize:vals
pnpm data:materialize-costs
pnpm --filter @llm-bench/acquisition materialize:effort-reports
pnpm data:generate-display-set
pnpm data:build-current
```

`materialize:snapshots` now also supports the recorded Epoch ZIP, ARC Prize JSON and Zapier route-module artifacts. Capture timestamps and evidence remain the source of provenance. Epoch's original cross-channel validation report is retained while current unresolved counts are updated.

All eight sources retained their candidate counts. Candidate semantic changes were confined to the two requested model families. Gemini resolves all 60 source candidates; Fable resolves 104. The separately named Zapier `Claude Fable 5.1 with Opus 5 Fallback (Max)` remains a distinct unresolved configuration. Artificial Analysis's explicit Default Fallback labels remain in raw measurement provenance.

Product coverage:

| Model            | Profiles                      | Included measurements | Distinct benchmarks across profiles | Sources |
| ---------------- | ----------------------------- | --------------------: | ----------------------------------: | ------: |
| Gemini 3.8 Flash | high, medium                  |                    50 |                                  35 |       6 |
| Claude Fable 5.1 | high, low, max, medium, xhigh |                    87 |                                  36 |       7 |

Cross-profile coverage totals are descriptive; comparisons always use one profile per model. Astra max versus Gemini high shares 27 benchmarks; Astra max versus Fable max shares 30; all three share 26.

Adding these models changes the coverage frontier. The former `free-sources-13` default is absent from regenerated optimal combinations: 25 benchmarks now reaches 14 models, and 26 reaches 12. The default is updated to `free-sources-14`, retaining the 25-benchmark scale. The generator emits 24 presets using the existing quality, required-model and source policies. Workspace tests verify actual complete-model counts against every generated preset.
