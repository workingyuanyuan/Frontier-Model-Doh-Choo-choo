# MaxxBench acquisition validation

- Source https://maxxbench.unlap.ai/
- Evidence `sha256:2f1eecf08ea42a7f7e71d5fb8d331f40f709ec8771fdfead491ee37ae70360c6`
- Observed 2026-11-26T06:58:22.376Z
- Visible leaderboard configurations 21
- Embedded configurations 22
- Materialized costs 21
- Every visible name, effort, one-decimal score and two-decimal cost matches the embedded data.
- Every selected score equals passed / attempts × 100. The embedded completionData curves (cost, output tokens, agent steps) each account for exactly `passed` attempts for the stated task count, with the solved-task count rising in steps of 1 / repetitions. Mean cost is at least the sum of the passed-attempt costs divided by all attempts; failed-attempt costs and task IDs are not published, so the mean itself and per-task repetition counts cannot be recomputed.

## Scope and settings

- Embedded configurations outside the default visible leaderboard are omitted from candidates and costs. Muse Spark 1.3 (xhigh).
- The score averages independent evaluation attempts. profile.attempts stores repetitions per task.
- Costs are mean USD per evaluation attempt including failed attempts. Pricing schedules and cache assumptions are unpublished.
- The benchmark release has no explicit version label. The task manifest schema version describes its file format.
- Harness, tools, thinking, quantization and context window remain null where the leaderboard does not specify them.
- Unresolved canonical identities DeepSeek V4.1 Flash, GLM-5.3, Step 5 Preview.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `maxxbench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
