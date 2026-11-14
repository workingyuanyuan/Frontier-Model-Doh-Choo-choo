# MaxxBench acquisition validation

- Source https://maxxbench.unlap.ai/
- Evidence `sha256:10bd1f36dff979cda82d604eadd378756035385c6a28f0bd6c810d92434e97cb`
- Observed 2026-11-13T04:46:09.645Z
- Visible leaderboard configurations 15
- Embedded configurations 16
- Materialized costs 15
- Every visible name, effort, one-decimal score and two-decimal cost matches the embedded data.
- Every selected score equals passed / attempts × 100. Task counts, repetitions and mean costs match completed trial records.

## Scope and settings

- Embedded configurations outside the default visible leaderboard are omitted from candidates and costs. Muse Spark 1.3 (xhigh).
- The score averages independent evaluation attempts. profile.attempts stores repetitions per task.
- Costs are mean USD per evaluation attempt including failed attempts. Pricing schedules and cache assumptions are unpublished.
- The benchmark release has no explicit version label. The task manifest schema version describes its file format.
- Harness, tools, thinking, quantization and context window remain null where the leaderboard does not specify them.
- Unresolved canonical identities DeepSeek V4.1 Flash, GLM-5.3 Flash, GLM-5.3, Qwen3.8 Flash Next.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `maxxbench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
