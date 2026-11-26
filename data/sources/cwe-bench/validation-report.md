# CWE-bench v2 acquisition validation

- Source: <https://cwe-bench.com/>
- Evidence: `sha256:2ababb8339ba790219c56247d989c605501b56634300cd9f3b34ff562eec9475`
- Results as of 2026-11-24; leaderboard rows: 22; rendered browser count: 22.
- Each row's Combined Pass@1 attribute equals the displayed default column, and Pass@4 is never below Pass@1.
- Unresolved catalog identities (5): GLM-5.3; GPT-5.6 Cyber; Hy4 Preview; MiniMax-M3.1-Flash (max); Qwen3.8-Max (0902).

Collinear AI organizes CWE-bench and runs every model itself, so rows are ORGANIZER results. Scores are the default Combined view: Pass@1 over all 250 tasks (100 public and 150 held-out), four rollouts per task. The Public (100) and Held-out (150) views are not materialized.

The organizer states every model runs at high reasoning, so each row records effort high. Harness differs by row (Claude Code, Codex, Antigravity, opencode) and is kept in the profile. Average cost per rollout is not materialized.

Model names resolve only through exact catalog aliases. Dated builds such as Qwen3.8-Max (0902) stay unresolved.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `cwe-bench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
