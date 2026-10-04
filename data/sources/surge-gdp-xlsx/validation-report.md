# Surge GDP.xlsx acquisition validation

- Source: <https://surgehq.ai/benchmarks/gdp-xlsx>
- Evidence: `sha256:d67e58a77b33049197f3f9f0fe78403b862ac2ed0be3a794af6499340f2d384d`
- Main leaderboard: 20 rows; rendered browser count: 20.
- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.
- Unresolved catalog identities (4): Gemini 3.1 Pro (High reasoning); GLM 5.3 (Max reasoning); Hy Hy4 Preview (High reasoning); Mistral Large 3.

Scores are the main leaderboard mean reward percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.

The official GDP.xlsx repository defines each trial reward as the mean of binary rubric verdicts on 0–1, each task score as the mean reward over five attempts excluding errored trials, and the benchmark score as the unweighted mean of task scores. The main leaderboard displays that benchmark score as a percentage. The repository explicitly specifies five attempts per task, so attempts is 5. Tasks with no successful attempts are missing rather than zero.

GDP.xlsx covers 70 professional spreadsheet tasks across 12 domains. The official repository documents a Harbor adapter and OpenHands SDK agent harness, with Gemini 3.8 Flash as an agentic judge grading final response text. These published general descriptions do not establish exact tools or harness metadata for each current row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.

- Methodology: <https://surgehq.ai/blog/gdp-xlsx> and <https://github.com/surge-ai/gdp-xlsx#grading>. The blog publication date is not the leaderboard publication date.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `surge-gdp-xlsx`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Nemotron 3 Ultra | `surge-gdp-xlsx:gdp-xlsx:nemotron-3-ultra` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
