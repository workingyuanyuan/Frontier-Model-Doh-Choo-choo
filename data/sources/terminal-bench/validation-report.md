# Terminal-Bench 4.1 acquisition validation

- Source: <https://www.tbench.ai/leaderboard>
- Evidence: `sha256:4aea4ad853862a552139620302da8dee2bf1b0109b30cfa47ca2642d5ef0ea3e`
- Leaderboard `terminal-bench/terminal-bench` / `4-1-0` ("Terminal-Bench 4.1"), updated 2026-11-20T16:07:10.159Z.
- Configurations: 67; distinct models: 54; rendered browser rows: 54.
- Every row has 330 trials and its resolution rate equals successes / trials.
- Unresolved catalog identities (15): Copilot Fusion; Ember-1; Gemini 3.1 Pro; GLM-5.3; GLM-5.3-Flash; Haiku 5.5; Hy4 Flash; Hy4 Preview; Inkling Small 2; Inkling Small; MiMo V2.6 Flash; MiMo V2.6 Pro; Mistral Large 4; Nemotron 3.5 Super VL; Qwen3.8-Max-0902.
- Rows whose source effort is not a product tier (10): retained with null effort.

The Stanford / Laude Institute Terminal-Bench team hosts this leaderboard, so rows are ORGANIZER results. The page embeds the complete leaderboard query in its Next.js flight data; the rendered table shows only each model's best configuration, so every effort configuration is materialized and the rendered row count is compared with distinct models.

Terminal-Bench 4.1 keeps the 4.0 tasks and replaces verifiers for reward-hack resistance and correctness. The organizer regraded saved 4.0 artifacts; trials without stored artifacts or regrade results keep their 4.0 score.

Each row records the agent harness (Claude Code, Codex, Antigravity CLI, mini-swe-agent and others) and the published reasoning effort. Source effort none is not a product tier and stays null. Fable 5, Opus 4.8 and Sonnet 5 resolve through reviewed exact entries that require the row to link to the vendor's announcement of that model. Tokens and cost are not materialized.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `terminal-bench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Beam 1.0 | `terminal-bench:terminal-bench-4-1:beam-1-0-mini-swe-agent-none` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Inkling | `terminal-bench:terminal-bench-4-1:inkling-mini-swe-agent-none` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:inkling |
| MiniMax M3 | `terminal-bench:terminal-bench-4-1:minimax-m3-mini-swe-agent-none` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
