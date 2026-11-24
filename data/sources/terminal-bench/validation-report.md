# Terminal-Bench 4.1 acquisition validation

- Source: <https://www.tbench.ai/leaderboard>
- Evidence: `sha256:e0a083fab8c2302e32e3fc09bf4090a8a1f587e16c69bdd17e94b0f67c49f7d3`
- Leaderboard `terminal-bench/terminal-bench` / `4-1-0` ("Terminal-Bench 4.1"), updated 2026-11-20T16:07:10.159Z.
- Configurations: 67; distinct models: 54; rendered browser rows: 54.
- Every row has 330 trials and its resolution rate equals successes / trials.
- Unresolved catalog identities (9): Copilot Fusion; Ember-1; Gemini 3.1 Pro; GLM-5.3; Hy4 Flash; Hy4 Preview; Inkling Small 2; MiMo V2.6 Pro; Qwen3.8-Max-0902.
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
| GLM-5.3-Flash | `terminal-bench:terminal-bench-4-1:glm-5-3-flash-claude-code-none` | — | `max` | arc-prize | arc-prize:arc-agi-2:zai-glm-5-3-flash-max:arc-agi-2-v2-semi-private |
| Inkling | `terminal-bench:terminal-bench-4-1:inkling-mini-swe-agent-none` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:inkling |
| Inkling Small | `terminal-bench:terminal-bench-4-1:inkling-small-mini-swe-agent-none` | — | `high` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-small-high:arc-agi-2-v2-semi-private |
| MiniMax M3 | `terminal-bench:terminal-bench-4-1:minimax-m3-mini-swe-agent-none` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| Nemotron 3.5 Super VL | `terminal-bench:terminal-bench-4-1:nemotron-3-5-super-vl-mini-swe-agent-none` | — | `high` | arc-prize | arc-prize:arc-agi-2:nvidia-nemotron-3-5-super-vl-120b-a12b-high:arc-agi-2-v2-semi-private |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| MiMo V2.6 Flash | `terminal-bench:terminal-bench-4-1:mimo-v2-6-flash-mini-swe-agent-none` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
