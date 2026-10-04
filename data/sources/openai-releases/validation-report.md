# OpenAI release chart acquisition validation

- Source: <https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/>
- Evidence: sha256:33f7689cc3fd869510e899690ba278b679ec7ca755e5bdc66e6f8300c88f6e03
- Observed at: 2026-10-04T03:25:28.149Z
- Source role: VENDOR; acquisition status: PARTIAL_SOURCE.
- Selected chart arrays: deepswe 1.1 (15 rows), automationbench 1.0.6 (21 rows).
- Included: 30; excluded: 6.
- Raw and normalized scores use percentages; provenance preserves the source fraction and multiplication by 100. Explicit effort labels agree with chart order.
- Chart costs are materialized as USD per task with the same benchmark version, model, effort, and exclusions as each score row. Cost and unit provenance retain the chart locator.
- Excluded Fable 5.1（以 Opus 5 作為備援）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.

# OpenAI release chart acquisition validation

- Source: <https://openai.com/zh-Hant/index/introducing-gpt-6-sol-and-luna/>
- Evidence: sha256:6ed5eba27d53ac1e2e4ff839e715306e98fe8d6d277cd6c552f31bd7af83d10b
- Observed at: 2026-10-04T04:26:16.028Z
- Source role: VENDOR; acquisition status: PARTIAL_SOURCE.
- Selected chart arrays: deepswe 1.1 (35 rows), automationbench 1.0.6 (31 rows), frontiercode-extended 1.1 (35 rows).
- Included: 95; excluded: 6.
- Raw and normalized scores use percentages; provenance preserves the source fraction and multiplication by 100. Explicit effort labels agree with chart order.
- Chart costs are materialized as USD per task with the same benchmark version, model, effort, and exclusions as each score row. Cost and unit provenance retain the chart locator.
- Excluded Claude Fable 5.1（備援：Opus 5）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded GPT-5.6 Luna: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-5.6 Luna: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-5.6 Luna: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-5.6 Luna: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-5.6 Luna: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..

# OpenAI release chart acquisition validation

- Source: <https://openai.com/zh-Hant/index/gpt-6-astra/>
- Evidence: sha256:7c8d70c336361b32ef5f0d0550f981764739755513ea5fb4e91ac010cb527caf
- Observed at: 2026-10-04T04:26:55.430Z
- Source role: VENDOR; acquisition status: PARTIAL_SOURCE.
- Selected chart arrays: deepswe 1.1 (22 rows), automationbench 1.0.6 (15 rows).
- Included: 30; excluded: 7.
- Raw and normalized scores use percentages; provenance preserves the source fraction and multiplication by 100. Explicit effort labels agree with chart order.
- Chart costs are materialized as USD per task with the same benchmark version, model, effort, and exclusions as each score row. Cost and unit provenance retain the chart locator.
- Excluded Claude Fable 5: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-5.6 Sol: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-5.6 Sol: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-5.6 Sol: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-5.6 Sol: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-5.6 Sol: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..
- Excluded GPT-6 Astra: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..

# OpenAI release chart acquisition validation

- Source: <https://openai.com/zh-Hant/index/gpt-5-6/>
- Evidence: sha256:c7b8ee1f28459713f7180d17f9ec371491f9898b759ad674c6b74789d5a15a75
- Observed at: 2026-10-04T04:31:17.114Z
- Source role: VENDOR; acquisition status: PARTIAL_SOURCE.
- Selected chart arrays: deepswe 1.1 (33 rows).
- Included: 32; excluded: 1.
- Raw and normalized scores use percentages; provenance preserves the source fraction and multiplication by 100. Explicit effort labels agree with chart order.
- Chart costs are materialized as USD per task with the same benchmark version, model, effort, and exclusions as each score row. Cost and unit provenance retain the chart locator.
- Excluded Gemini 3.1 Pro Preview: Published release score conflicts with captured organizer result for the same benchmark version, model and explicit effort; historical evaluation configuration unresolved..

## Organizer cross-check

- Matched: 159
- Vendor preview rows absent from reference: 28
- Excluded: 20
- Per-row references and rounding decisions: [cross-checks.json](cross-checks.json).

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `openai-releases`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| GPT-5.6 Luna | `openai-releases:gpt56:deepswe:16` | none | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-luna-max:arc-agi-2-v2-semi-private |
| GPT-5.6 Sol | `openai-releases:gpt56:deepswe:10` | none | `max` | anthropic-releases | anthropic-releases:cursorbench-4:gpt56sol-max |
| GPT-5.6 Terra | `openai-releases:gpt56:deepswe:22` | none | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-terra-max:arc-agi-2-v2-semi-private |

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
