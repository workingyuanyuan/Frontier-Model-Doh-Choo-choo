# Agents' Last Exam acquisition validation

- Page: <https://agents-last-exam.org/leaderboard>
- Data endpoint: <https://agents-last-exam.org/api/demo/leaderboard/v1.1>
- API evidence: `sha256:eb256326e54beca1d90341cacc6d00927cb239dd06b00c67064545ae319d11b0`
- Page evidence: `sha256:afc1b4913dbbebee70a514ab2c5c80e9ec5ccb1764e033a38e0f4f6f4b84fa11`
- Observed at: 2026-11-18T23:35:34.222Z
- Results updated at (source): 2026-11-18T01:01:54.886914Z
- Cost rates as of (source): 2026-11-17
- Task definitions: https://github.com/rdi-berkeley/agents-last-exam @ `2e91edd3cd26baa35a38127c90c8e5241dfbe62f` (2026-10-27T01:22:44Z)

## Exact counts

| Check | Count |
|---|---:|
| Leaderboard rows parsed | 41 |
| linux platform rows (taskCount 86) | 41 |
| windows platform rows (taskCount 36) | 41 |
| Tasks in the split | 122 |
| Cost records emitted | 41 |
| Canonically resolved rows | 36 |
| Canonically unresolved rows | 5 |
| Distinct canonically unresolved names | 4 |
| Partial-coverage rows (tasks < splitTasks) | 2 |
| Excluded candidate rows | 0 |

## Benchmark contract

- Version `1.1` is read from the page header and the leaderboard version prop; every row's split is `v1.1`.
- Score: `avgScore × 100` (average task score, percent). `passRate` is diagnostic only; it stays in each candidate provenance and is not materialized as a score. Its published denominator is not uniform on partial-coverage rows (tasks for some, splitTasks for others), so it is kept as published and never recomputed.
- Cost: `totalCostUsd / tasks` as USD per task (`AGENT_TASK`), list prices (`costSource: list`) as of the source `costRatesAsOf`.
- Effort: `harnessVariant` `reasoning-<effort>`. `reasoning-none` is an explicit setting passed to the harness, so it is always `non-reasoning`. Unrecognised variants are excluded row by row.
- Every row must have runs equal to tasks and finite numeric fields; platform task counts must be positive integers; the linux and windows platform rows of every configuration must add up to its overall passes and tasks, and to its total cost within one cent per platform of rounding.
- Who executes the runs (organizer or vendor submission) is not stated by the board or the repository README: unknown.

## Partial-coverage rows (included and disclosed)

- claude-fable-5-2 / claude_code / reasoning-max: 113 of 122 tasks
- gpt-5.6-sol / codex / reasoning-max: 121 of 122 tasks

## Excluded rows

- None

## Unresolved model names

- glm-5.3
- kimi-3.1-pro
- minimax-m3-1-flash
- qwen-4

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Candidate rows | 41 | 41 | +0 |
| Cost records | 41 | 41 | +0 |
| Canonically unresolved rows | 5 | 5 | +0 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `agents-last-exam`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
