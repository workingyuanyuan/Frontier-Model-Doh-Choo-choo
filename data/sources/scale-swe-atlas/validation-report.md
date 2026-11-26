# Scale SWE Atlas acquisition validation

- Source https://scale.com/leaderboard/swe-atlas
- Observed 2026-11-26T06:58:25.294Z
- Evidence `sha256:1932ff4782f12e235277f0a5ceaa150f965891318388eb0dffecc1c1418198c4`
- Rendered Overall rows 33; embedded Overall rows 33; candidates 33.
- Embedded variant populations: {"overall":33,"qna":33,"testwriting":33,"refactoring":33}.
- Only Overall contributes one SWE Atlas v1.1 score per model. QnA, Test Writing and Refactoring remain in the raw HTML artifact.
- Published scores use the 0–100 scale directly. maxScore is chart-axis metadata, not the normalization denominator.
- The official v1.1 notice describes 284 tasks and reruns with GPT-6.1 Sol as judge (majority of three votes), refined grading and restricted networking. Judge votes are not agent attempts.
- Effort and harness are taken only from labels of the form "<model> (<harness>) <effort>" or "<model> (<effort>)"; the model part must match the catalog exactly. Unpublished effort, tools, harness, thinking, context, quantization and attempts remain null. Row createdAt is retained in provenance and is not treated as a score publication timestamp.
- Published confidenceInterval_upper/lower fields are retained verbatim in artifact metadata and field provenance. No confidence level or missing bound is inferred.

## Exact model identities

| Source model | Canonical identity | Source effort | Source harness |
|---|---|---|---|
| Beam 1.0 (OpenCode) max | reflection-beam-1-0 | max | OpenCode |
| Claude Fable 5.1 (Claude Code) max | anthropic-claude-fable-5-1 | max | Claude Code |
| Claude Fable 5.2 (Claude Code) max | anthropic-claude-fable-5-2 | max | Claude Code |
| Claude Haiku 5.5 (Claude Code) max | anthropic-claude-haiku-5-5 | max | Claude Code |
| Claude Opus 5.5 (Claude Code) max | anthropic-claude-opus-5-5 | max | Claude Code |
| Claude Sonnet 5.5 (Claude Code) max | anthropic-claude-sonnet-5-5 | max | Claude Code |
| DeepSeek V4.1 Flash (DeepSeek Harness) max | null | max | DeepSeek Harness |
| Gemini 3.8 Flash (Antigravity CLI) high | google-gemini-3-8-flash | high | Antigravity CLI |
| Gemini 4 Argon (Antigravity CLI) high | google-gemini-4-argon | high | Antigravity CLI |
| Gemini 4 Carbon (Antigravity CLI) high | google-gemini-4-carbon | high | Antigravity CLI |
| Gemini 4 Hydrogen (Antigravity CLI) xhigh | google-gemini-4-hydrogen | xhigh | Antigravity CLI |
| Gemini 4 Neon (Antigravity CLI) xhigh | google-gemini-4-neon | xhigh | Antigravity CLI |
| GLM 5.3 Flash (mini-swe-agent) max | null | max | mini-swe-agent |
| GLM 5.3 (mini-swe-agent) max | null | max | mini-swe-agent |
| GPT 6.1 Sol (Codex) max | openai-gpt-6-1-sol | max | Codex |
| GPT 6.1 Terra (Codex) max | openai-gpt-6-1-terra | max | Codex |
| GPT 6.2 Astra (Codex) max | openai-gpt-6-2-astra | max | Codex |
| GPT 6.2 Sol (Codex) max | openai-gpt-6-2-sol | max | Codex |
| GPT 6 Astra (Codex) max | openai-gpt-6-astra | max | Codex |
| GPT 6 Luna (Codex) max | openai-gpt-6-luna | max | Codex |
| gpt-oss-120b (mini-swe-agent) high | null | high | mini-swe-agent |
| Grok 4.7 (Grok Build) xhigh | xai-grok-4-7 | xhigh | Grok Build |
| Inkling 2 Small (mini-swe-agent) xhigh | thinking-machines-inkling-2-small | xhigh | mini-swe-agent |
| Kimi K3.1 Pro (Kimi Code CLI) max | moonshot-kimi-k3-1-pro | max | Kimi Code CLI |
| Kimi K3 (Kimi Code CLI) max | moonshot-kimi-k3 | max | Kimi Code CLI |
| MiniMax M3 (mini-swe-agent) max | minimax-minimax-m3 | max | mini-swe-agent |
| Mistral Large 4 (Mistral Vibe) high | mistral-mistral-large-4 | high | Mistral Vibe |
| Muse Ember 1.0 (Muse Code) max | meta-muse-ember | max | Muse Code |
| Muse Spark Open (Muse Code) xhigh | meta-muse-spark-open | xhigh | Muse Code |
| Muse Wonder 1.0 (Muse Code) max | meta-muse-wonder | max | Muse Code |
| Nemotron 3.5 Super VL (mini-swe-agent) max | nvidia-nemotron-3-5-super-vl | max | mini-swe-agent |
| Nemotron 3 Ultra (mini-swe-agent) max | nvidia-nemotron-3-ultra | max | mini-swe-agent |
| Qwen 3.8 Max (mini-swe-agent) max | alibaba-qwen3-8-max | max | mini-swe-agent |

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `scale-swe-atlas`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
