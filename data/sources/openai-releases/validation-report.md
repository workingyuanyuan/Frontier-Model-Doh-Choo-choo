# OpenAI release chart acquisition validation

- Source: <https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/>
- Evidence: sha256:09acc7bb91d0abdebfcfc07d196c94c98861da690a9c6d05543da7308c9cb36b
- Observed at: 2026-10-02T14:56:49.000Z
- Source role: VENDOR; acquisition status: PARTIAL_SOURCE.
- Selected chart arrays: DeepSWE 1.1 (15 rows), AutomationBench 1.0.6 (21 rows).
- Included: 30; excluded: 6.
- Raw and normalized scores use percentages; provenance preserves the source fraction and multiplication by 100. Explicit effort labels agree with chart order.
- Harness and publication date are unspecified. Chart cost values are preserved in evidence provenance.
- Excluded Fable 5.1（以 Opus 5 作為備援）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.
- Excluded Opus 5.5（含備援機制）: Multi-model fallback configuration; single-model identity unavailable.

## Organizer cross-check

- Matched: 15
- Vendor preview rows absent from reference: 15
- Excluded: 6
- Per-row references and rounding decisions: [cross-checks.json](cross-checks.json).
- Research: [vendor release review](../../../docs/refresh/2026-10-02-vendor-releases.md).

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `openai-releases`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
