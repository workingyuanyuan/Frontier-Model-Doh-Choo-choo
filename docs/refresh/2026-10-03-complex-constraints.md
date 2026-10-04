# ComplexConstraints 整合審核 — 2026-10-03

採用 [Surge ComplexConstraints](https://surgehq.ai/benchmarks/complex-constraints) 主榜 Pass@1；原始值與 normalizedScore 均為百分比，來源角色 ORGANIZER，主要維度 language。官方未明示 benchmark 版本，保存 null。

- 起始 commit：`838da8e59a0968a586f4d521628d3854521bdc6c`
- 工作目錄：`C:\Users\YYuan\Workspace\Coding\Frontier-Model-Doh-Choo-choo`
- 舊版本：`sha256:063d8dedb7cb58a70a33e693f20b648adefe3998321275b16f38271077c3347e`
- 新版本：`sha256:89a756c8b4f273baff9f44ab77ddd89f57715532a48a8b316ce1a98aca197268`
- 生成時間：2026-10-03T06:12:32.768Z
- 預設集合：free-sources-12 → free-sources-13
- [完整逐模型、五維、Overall、名次、effort 與各集合對照](2026-10-03-complex-constraints.json)。

使用者已核准預設 free-sources-13（13 個模型、19 個 benchmark）；依核准政策完成正式集合重產與產品建立。

| 項目          |   舊 |   新 | 差值 |
| ------------- | ---: | ---: | ---: |
| frontier      |   66 |   66 |    0 |
| profiles      |  198 |  198 |    0 |
| leaderboard   |  187 |  135 |  -52 |
| evidence      | 3175 | 3211 |   36 |
| costs         |  620 |  620 |    0 |
| presets       |   14 |   13 |   -1 |
| defaultModels |   12 |   13 |    1 |

主榜候選 56 筆，對應 36 筆配置、33 個模型。回讀原始 HTML 重新物化 56 筆，名稱、配置、原始分數及百分比分數相符。

## 資料與集合影響

固定舊 benchmark 集合的比較見 JSON sameBenchmarkComparison；相同 profile 的差異保存在 sameProfileRows。重產集合影響見 presetRegenerationComparison，最終主畫面所有集合逐模型完整對照見 finalPresetComparison。主榜先通過完整矩陣及五維門檻，再挑最高 Overall 的代表 effort 與重新排名。

最大 Overall 差：free-sources-10，GPT-5.6 Sol，-6.278 分。

最大名次差：free-sources-11，Gemini 3.8 Flash，5 名。

自動生成 13 個集合；ComplexConstraints 進入 8 個。全來源可行尺度 0；必選模型的逐 effort benchmark 與缺少來源見 JSON requiredModelCoverage。

Grok 4.6 的未標示 effort 列受現行跨來源推測政策重新歸屬：四筆 LiveBench 由 high 移至 xhigh，依據為 ARC Prize 的 Grok 4.6 (XHigh)。新來源新增 xhigh 直接證據，使來源票數平手後依既有規則選較高 effort；前後各 tier 的來源票數見 JSON effortInferenceChanges。因此 high 配置缺 LiveBench instruction following、language、mathematics、reasoning，固定舊集合 free-sources-21 的主榜由 21 變 20；其餘模型的相對順序未改變。逐列依據見 effortInferences 與 priorEvidenceProfileChanges。

| 集合            | 模型數舊 → 新 | benchmark 新增                                                                                                                                                                                                                                                                                                                                                                  | benchmark 移出                                                                                                                                                                                                                                                                                                                                                      | 來源新增                                                                                                                                             | 來源移出                                                                                                                  | 既有模型順序變動對數 |
| --------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------: |
| free-sources-21 | 21 → 0        | —                                                                                                                                                                                                                                                                                                                                                                               | code-migration, emb, finance-agent-v2, gpqa-diamond, hlab, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, livecodebench, medcode, medscribe, swe-bench, vibe-code-bench                                                                                                                           | —                                                                                                                                                    | artificial-analysis, epoch-ai, livebench, vals-ai                                                                         |                    0 |
| free-sources-19 | 19 → 0        | —                                                                                                                                                                                                                                                                                                                                                                               | chess-puzzles, code-migration, emb, finance-agent-v2, gpqa-diamond, hlab, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, livecodebench, medcode, medscribe, swe-bench, vibe-code-bench                                                                                                            | —                                                                                                                                                    | artificial-analysis, epoch-ai, livebench, vals-ai                                                                         |                    0 |
| free-sources-17 | 17 → 0        | —                                                                                                                                                                                                                                                                                                                                                                               | chess-puzzles, code-migration, emb, finance-agent-v2, gpqa-diamond, hlab, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, livecodebench, medcode, medscribe, swe-bench, terminal-bench-2-1, vibe-code-bench                                                                                        | —                                                                                                                                                    | artificial-analysis, epoch-ai, livebench, vals-ai                                                                         |                    0 |
| free-sources-16 | 16 → 16       | terminal-bench-2-1                                                                                                                                                                                                                                                                                                                                                              | mmlu-pro, simpleqa-verified                                                                                                                                                                                                                                                                                                                                         | —                                                                                                                                                    | —                                                                                                                         |                    3 |
| free-sources-14 | 14 → 0        | —                                                                                                                                                                                                                                                                                                                                                                               | chess-puzzles, code-migration, deepswe-1-1, emb, finance-agent-v2, gpqa-diamond, hlab, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, livecodebench, medcode, medscribe, mmlu-pro, simpleqa-verified, swe-bench, vibe-code-bench                                                                  | —                                                                                                                                                    | artificial-analysis, deepswe, epoch-ai, livebench, openai-releases, vals-ai                                               |                    0 |
| free-sources-12 | 12 → 0        | —                                                                                                                                                                                                                                                                                                                                                                               | arc-agi-2, chess-puzzles, code-migration, deepswe-1-1, emb, finance-agent-v2, gpqa-diamond, hlab, legal-bench, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, medcode, medscribe, mmlu-pro, simpleqa-verified, swe-bench, vibe-code-bench                                                         | —                                                                                                                                                    | arc-prize, artificial-analysis, deepswe, epoch-ai, livebench, openai-releases, vals-ai                                    |                    0 |
| free-sources-11 | 11 → 11       | chartography, cyber, ioi, proofbench                                                                                                                                                                                                                                                                                                                                            | chess-puzzles, deepswe-1-1, legal-bench, mmlu-pro, swe-bench                                                                                                                                                                                                                                                                                                        | surge-chartography                                                                                                                                   | deepswe, openai-releases                                                                                                  |                    2 |
| free-sources-10 | 10 → 10       | complex-constraints                                                                                                                                                                                                                                                                                                                                                             | mmlu-pro, simpleqa-verified                                                                                                                                                                                                                                                                                                                                         | surge-complex-constraints                                                                                                                            | —                                                                                                                         |                    1 |
| free-sources-9  | 9 → 9         | complex-constraints                                                                                                                                                                                                                                                                                                                                                             | skillsbench                                                                                                                                                                                                                                                                                                                                                         | surge-complex-constraints                                                                                                                            | —                                                                                                                         |                    1 |
| free-sources-7  | 7 → 0         | —                                                                                                                                                                                                                                                                                                                                                                               | arc-agi-2, chess-puzzles, code-migration, cyber, deepswe-1-1, emb, finance-agent-v2, frontier-code-1-1, gpqa-diamond, hlab, ioi, legal-bench, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, medcode, medscribe, mmlu-pro, proofbench, simpleqa-verified, skillsbench, swe-bench, vibe-code-bench | —                                                                                                                                                    | anthropic-releases, arc-prize, artificial-analysis, deepswe, epoch-ai, frontier-code, livebench, openai-releases, vals-ai |                    0 |
| free-sources-6  | 6 → 6         | complex-constraints, livecodebench                                                                                                                                                                                                                                                                                                                                              | deepswe-1-1, swe-bench                                                                                                                                                                                                                                                                                                                                              | surge-complex-constraints                                                                                                                            | deepswe, openai-releases                                                                                                  |                    0 |
| free-sources-5  | 5 → 5         | complex-constraints, livecodebench                                                                                                                                                                                                                                                                                                                                              | automationbench                                                                                                                                                                                                                                                                                                                                                     | surge-complex-constraints                                                                                                                            | zapier-automationbench                                                                                                    |                    0 |
| free-sources-4  | 4 → 4         | complex-constraints, livecodebench                                                                                                                                                                                                                                                                                                                                              | terminal-bench-2-1                                                                                                                                                                                                                                                                                                                                                  | surge-complex-constraints                                                                                                                            | —                                                                                                                         |                    0 |
| free-sources-3  | 3 → 3         | complex-constraints                                                                                                                                                                                                                                                                                                                                                             | —                                                                                                                                                                                                                                                                                                                                                                   | surge-complex-constraints                                                                                                                            | —                                                                                                                         |                    0 |
| free-sources-20 | 0 → 20        | code-migration, emb, finance-agent-v2, gpqa-diamond, hlab, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, livecodebench, medcode, medscribe, swe-bench, vibe-code-bench                                                                                                                                       | —                                                                                                                                                                                                                                                                                                                                                                   | artificial-analysis, epoch-ai, livebench, vals-ai                                                                                                    | —                                                                                                                         |                    0 |
| free-sources-18 | 0 → 18        | chess-puzzles, code-migration, emb, finance-agent-v2, gpqa-diamond, hlab, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, livecodebench, medcode, medscribe, swe-bench, vibe-code-bench                                                                                                                        | —                                                                                                                                                                                                                                                                                                                                                                   | artificial-analysis, epoch-ai, livebench, vals-ai                                                                                                    | —                                                                                                                         |                    0 |
| free-sources-15 | 0 → 15        | chess-puzzles, code-migration, emb, finance-agent-v2, gpqa-diamond, hlab, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, livecodebench, medcode, medscribe, mmlu-pro, simpleqa-verified, swe-bench, vibe-code-bench                                                                                           | —                                                                                                                                                                                                                                                                                                                                                                   | artificial-analysis, epoch-ai, livebench, vals-ai                                                                                                    | —                                                                                                                         |                    0 |
| free-sources-13 | 0 → 13        | chess-puzzles, code-migration, complex-constraints, emb, finance-agent-v2, gpqa-diamond, hlab, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, livecodebench, medcode, medscribe, mmlu-pro, simpleqa-verified, swe-bench, vibe-code-bench                                                                      | —                                                                                                                                                                                                                                                                                                                                                                   | artificial-analysis, epoch-ai, livebench, surge-complex-constraints, vals-ai                                                                         | —                                                                                                                         |                    0 |
| free-sources-8  | 0 → 8         | arc-agi-2, chess-puzzles, code-migration, complex-constraints, deepswe-1-1, emb, finance-agent-v2, frontier-code-1-1, gpqa-diamond, hlab, legal-bench, legal-research, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning, livecodebench, medcode, medscribe, mmlu-pro, simpleqa-verified, skillsbench, swe-bench, vibe-code-bench | —                                                                                                                                                                                                                                                                                                                                                                   | anthropic-releases, arc-prize, artificial-analysis, deepswe, epoch-ai, frontier-code, livebench, openai-releases, surge-complex-constraints, vals-ai | —                                                                                                                         |                    0 |

### free-sources-13（對照原預設 free-sources-12）

benchmark 20 → 19；主榜模型 12 → 13。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 1       | 72.459 → 70.346 | -2.113 |
| GPT-5.6 Sol      | max → max      | 2 → 2       | 71.034 → 69.628 | -1.405 |
| Gemini 3.8 Flash | high → high    | 3 → 3       | 70.477 → 69.201 | -1.277 |
| Gemini 3.7 Flash | high → high    | 4 → 4       | 68.550 → 67.340 | -1.209 |
| GPT-5.5          | xhigh → xhigh  | 5 → 5       | 67.769 → 66.915 | -0.853 |
| Grok 4.6         | high → —       | 6 → —       | 67.104 → —      |      — |
| Gemini 3.6 Flash | high → high    | 7 → 7       | 63.493 → 63.772 |  0.278 |
| Grok 4.5         | high → high    | 8 → 9       | 62.908 → 62.866 | -0.042 |
| GPT-5.6 Luna     | max → —        | 9 → —       | 62.790 → —      |      — |
| Gemini 3.5 Flash | high → —       | 10 → —      | 62.786 → —      |      — |
| DeepSeek V4 Pro  | max → max      | 11 → 10     | 58.970 → 59.162 |  0.191 |
| GLM-5.2          | max → max      | 12 → 11     | 57.419 → 57.595 |  0.176 |
| Claude Opus 4.8  | — → max        | — → 6       | — → 66.353      |      — |
| Qwen3.8 Max      | — → xhigh      | — → 8       | — → 63.182      |      — |
| Qwen 3.7 Max     | — → default    | — → 12      | — → 57.366      |      — |
| Kimi K2.6        | — → default    | — → 13      | — → 54.719      |      — |

- Grok 4.6 退出；缺格：complex-constraints, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning。

- GPT-5.6 Luna 退出；缺格：complex-constraints, livecodebench。

- Gemini 3.5 Flash 退出；缺格：complex-constraints。

- Claude Opus 4.8 進入；缺格：arc-agi-2。

- Qwen3.8 Max 進入；缺格：arc-agi-2。

- Qwen 3.7 Max 進入；缺格：arc-agi-2, deepswe-1-1。

- Kimi K2.6 進入；缺格：arc-agi-2, deepswe-1-1。

### free-sources-11（對照原預設 free-sources-12）

benchmark 20 → 20；主榜模型 12 → 11。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 4       | 72.459 → 69.439 | -3.020 |
| GPT-5.6 Sol      | max → max      | 2 → 5       | 71.034 → 68.193 | -2.841 |
| Gemini 3.8 Flash | high → high    | 3 → 8       | 70.477 → 63.399 | -7.078 |
| Gemini 3.7 Flash | high → high    | 4 → 7       | 68.550 → 63.645 | -4.904 |
| GPT-5.5          | xhigh → —      | 5 → —       | 67.769 → —      |      — |
| Grok 4.6         | high → —       | 6 → —       | 67.104 → —      |      — |
| Gemini 3.6 Flash | high → —       | 7 → —       | 63.493 → —      |      — |
| Grok 4.5         | high → high    | 8 → 11      | 62.908 → 55.999 | -6.910 |
| GPT-5.6 Luna     | max → max      | 9 → 9       | 62.790 → 57.162 | -5.628 |
| Gemini 3.5 Flash | high → —       | 10 → —      | 62.786 → —      |      — |
| DeepSeek V4 Pro  | max → —        | 11 → —      | 58.970 → —      |      — |
| GLM-5.2          | max → —        | 12 → —      | 57.419 → —      |      — |
| Claude Fable 5.1 | — → max        | — → 1       | — → 71.641      |      — |
| GPT-6 Astra      | — → max        | — → 2       | — → 71.587      |      — |
| Claude Opus 5.5  | — → max        | — → 3       | — → 71.441      |      — |
| GPT-6 Sol        | — → max        | — → 6       | — → 66.362      |      — |
| GPT-6 Luna       | — → max        | — → 10      | — → 56.855      |      — |

- GPT-5.5 退出；缺格：cyber, ioi, proofbench。

- Grok 4.6 退出；缺格：chartography, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning。

- Gemini 3.6 Flash 退出；缺格：chartography, proofbench。

- Gemini 3.5 Flash 退出；缺格：chartography, cyber, frontier-code-1-1, ioi。

- DeepSeek V4 Pro 退出；缺格：chartography, cyber, ioi。

- GLM-5.2 退出；缺格：chartography, cyber, ioi, proofbench。

- Claude Fable 5.1 進入；缺格：deepswe-1-1, swe-bench。

- GPT-6 Astra 進入；缺格：legal-bench, mmlu-pro, swe-bench。

- Claude Opus 5.5 進入；缺格：chess-puzzles, deepswe-1-1, legal-bench, mmlu-pro, swe-bench。

- GPT-6 Sol 進入；缺格：chess-puzzles, legal-bench, mmlu-pro, swe-bench。

- GPT-6 Luna 進入；缺格：chess-puzzles, deepswe-1-1, legal-bench, mmlu-pro, swe-bench。

### free-sources-21

benchmark 15 → 0；主榜模型 21 → 0。

| 模型                   | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5          | max → —        | 1 → —       | 73.938 → —      |    — |
| Claude Fable 5         | max → —        | 2 → —       | 72.848 → —      |    — |
| Claude Opus 4.8        | max → —        | 3 → —       | 69.020 → —      |    — |
| GPT-5.6 Sol            | max → —        | 4 → —       | 68.427 → —      |    — |
| Gemini 3.8 Flash       | high → —       | 5 → —       | 68.320 → —      |    — |
| Gemini 3.7 Flash       | high → —       | 6 → —       | 68.124 → —      |    — |
| Grok 4.6               | high → —       | 7 → —       | 67.848 → —      |    — |
| GPT-5.5                | xhigh → —      | 8 → —       | 66.952 → —      |    — |
| Gemini 3.6 Flash       | high → —       | 9 → —       | 64.904 → —      |    — |
| Grok 4.5               | high → —       | 10 → —      | 64.420 → —      |    — |
| Gemini 3.5 Flash       | high → —       | 11 → —      | 64.338 → —      |    — |
| Qwen3.8 Max            | xhigh → —      | 12 → —      | 63.801 → —      |    — |
| Gemini 3.1 Pro Preview | high → —       | 13 → —      | 62.530 → —      |    — |
| GLM-5.2                | max → —        | 14 → —      | 60.494 → —      |    — |
| DeepSeek V4 Pro        | max → —        | 15 → —      | 59.448 → —      |    — |
| Qwen 3.7 Max           | default → —    | 16 → —      | 58.447 → —      |    — |
| Qwen3.8 27B            | xhigh → —      | 17 → —      | 58.365 → —      |    — |
| MiniMax M3             | max → —        | 18 → —      | 58.037 → —      |    — |
| Kimi K2.6              | default → —    | 19 → —      | 56.969 → —      |    — |
| Gemini 3.5 Flash-Lite  | high → —       | 20 → —      | 52.309 → —      |    — |
| Qwen3.6 Plus           | default → —    | 21 → —      | 52.154 → —      |    — |

- Claude Opus 5 退出；缺格：代表配置／完整五維與集合資格變動。

- Claude Fable 5 退出；缺格：代表配置／完整五維與集合資格變動。

- Claude Opus 4.8 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.6 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.5 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.6 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 Max 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.1 Pro Preview 退出；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 退出；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 退出；缺格：代表配置／完整五維與集合資格變動。

- Qwen 3.7 Max 退出；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 27B 退出；缺格：代表配置／完整五維與集合資格變動。

- MiniMax M3 退出；缺格：代表配置／完整五維與集合資格變動。

- Kimi K2.6 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash-Lite 退出；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.6 Plus 退出；缺格：代表配置／完整五維與集合資格變動。

### free-sources-19

benchmark 16 → 0；主榜模型 19 → 0。

| 模型                   | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5          | max → —        | 1 → —       | 70.915 → —      |    — |
| Claude Fable 5         | max → —        | 2 → —       | 70.251 → —      |    — |
| Gemini 3.8 Flash       | high → —       | 3 → —       | 66.766 → —      |    — |
| GPT-5.6 Sol            | max → —        | 4 → —       | 66.459 → —      |    — |
| Claude Opus 4.8        | max → —        | 5 → —       | 66.121 → —      |    — |
| Gemini 3.7 Flash       | high → —       | 6 → —       | 65.873 → —      |    — |
| Grok 4.6               | high → —       | 7 → —       | 65.219 → —      |    — |
| GPT-5.5                | xhigh → —      | 8 → —       | 64.993 → —      |    — |
| Gemini 3.6 Flash       | high → —       | 9 → —       | 62.476 → —      |    — |
| Gemini 3.5 Flash       | high → —       | 10 → —      | 62.454 → —      |    — |
| Grok 4.5               | high → —       | 11 → —      | 61.696 → —      |    — |
| Qwen3.8 Max            | xhigh → —      | 12 → —      | 61.248 → —      |    — |
| Gemini 3.1 Pro Preview | high → —       | 13 → —      | 60.472 → —      |    — |
| DeepSeek V4 Pro        | max → —        | 14 → —      | 57.255 → —      |    — |
| GLM-5.2                | max → —        | 15 → —      | 57.207 → —      |    — |
| Qwen 3.7 Max           | default → —    | 16 → —      | 55.072 → —      |    — |
| MiniMax M3             | max → —        | 17 → —      | 54.668 → —      |    — |
| Kimi K2.6              | default → —    | 18 → —      | 54.028 → —      |    — |
| Gemini 3.5 Flash-Lite  | high → —       | 19 → —      | 49.779 → —      |    — |

- Claude Opus 5 退出；缺格：代表配置／完整五維與集合資格變動。

- Claude Fable 5 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 退出；缺格：代表配置／完整五維與集合資格變動。

- Claude Opus 4.8 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.6 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.5 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.6 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 退出；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 Max 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.1 Pro Preview 退出；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 退出；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 退出；缺格：代表配置／完整五維與集合資格變動。

- Qwen 3.7 Max 退出；缺格：代表配置／完整五維與集合資格變動。

- MiniMax M3 退出；缺格：代表配置／完整五維與集合資格變動。

- Kimi K2.6 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash-Lite 退出；缺格：代表配置／完整五維與集合資格變動。

### free-sources-17

benchmark 17 → 0；主榜模型 17 → 0。

| 模型                   | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------------- | -------------- | ----------- | --------------- | ---: |
| Claude Fable 5         | max → —        | 1 → —       | 70.170 → —      |    — |
| Gemini 3.8 Flash       | high → —       | 2 → —       | 67.170 → —      |    — |
| GPT-5.6 Sol            | max → —        | 3 → —       | 66.768 → —      |    — |
| Gemini 3.7 Flash       | high → —       | 4 → —       | 66.228 → —      |    — |
| Claude Opus 4.8        | max → —        | 5 → —       | 65.933 → —      |    — |
| Grok 4.6               | high → —       | 6 → —       | 65.303 → —      |    — |
| Gemini 3.5 Flash       | high → —       | 7 → —       | 62.996 → —      |    — |
| Gemini 3.6 Flash       | high → —       | 8 → —       | 62.801 → —      |    — |
| Grok 4.5               | high → —       | 9 → —       | 61.612 → —      |    — |
| Qwen3.8 Max            | xhigh → —      | 10 → —      | 61.323 → —      |    — |
| Gemini 3.1 Pro Preview | high → —       | 11 → —      | 61.137 → —      |    — |
| GLM-5.2                | max → —        | 12 → —      | 57.377 → —      |    — |
| DeepSeek V4 Pro        | max → —        | 13 → —      | 56.850 → —      |    — |
| Qwen 3.7 Max           | default → —    | 14 → —      | 55.263 → —      |    — |
| MiniMax M3             | max → —        | 15 → —      | 54.564 → —      |    — |
| Kimi K2.6              | default → —    | 16 → —      | 53.880 → —      |    — |
| Gemini 3.5 Flash-Lite  | high → —       | 17 → —      | 49.813 → —      |    — |

- Claude Fable 5 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Claude Opus 4.8 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.6 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.6 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 退出；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 Max 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.1 Pro Preview 退出；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 退出；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 退出；缺格：代表配置／完整五維與集合資格變動。

- Qwen 3.7 Max 退出；缺格：代表配置／完整五維與集合資格變動。

- MiniMax M3 退出；缺格：代表配置／完整五維與集合資格變動。

- Kimi K2.6 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash-Lite 退出；缺格：代表配置／完整五維與集合資格變動。

### free-sources-16

benchmark 18 → 17；主榜模型 16 → 16。

| 模型                   | effort 舊 → 新    | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------------- | ----------------- | ----------- | --------------- | -----: |
| Claude Opus 5          | max → —           | 1 → —       | 72.538 → —      |      — |
| GPT-5.6 Sol            | max → max         | 2 → 3       | 71.183 → 66.768 | -4.415 |
| Gemini 3.8 Flash       | high → high       | 3 → 2       | 71.009 → 67.170 | -3.839 |
| Gemini 3.7 Flash       | high → high       | 4 → 4       | 69.376 → 66.228 | -3.148 |
| Claude Opus 4.8        | max → max         | 5 → 5       | 68.531 → 65.933 | -2.598 |
| GPT-5.5                | xhigh → —         | 6 → —       | 68.523 → —      |      — |
| Grok 4.6               | high → —          | 7 → —       | 68.504 → —      |      — |
| Gemini 3.6 Flash       | high → high       | 8 → 7       | 65.754 → 62.801 | -2.953 |
| Gemini 3.5 Flash       | high → high       | 9 → 6       | 65.392 → 62.996 | -2.395 |
| Grok 4.5               | high → high       | 10 → 8      | 65.091 → 61.612 | -3.479 |
| Qwen3.8 Max            | xhigh → xhigh     | 11 → 9      | 64.885 → 61.323 | -3.562 |
| Gemini 3.1 Pro Preview | high → high       | 12 → 10     | 63.563 → 61.137 | -2.426 |
| DeepSeek V4 Pro        | max → max         | 13 → 12     | 60.810 → 56.850 | -3.961 |
| GLM-5.2                | max → max         | 14 → 11     | 59.831 → 57.377 | -2.455 |
| Qwen 3.7 Max           | default → default | 15 → 13     | 59.577 → 55.263 | -4.314 |
| Kimi K2.6              | default → default | 16 → 15     | 56.841 → 53.880 | -2.961 |
| Claude Fable 5         | — → max           | — → 1       | — → 70.170      |      — |
| MiniMax M3             | — → max           | — → 14      | — → 54.564      |      — |
| Gemini 3.5 Flash-Lite  | — → high          | — → 16      | — → 49.813      |      — |

- Claude Opus 5 退出；缺格：terminal-bench-2-1。

- GPT-5.5 退出；缺格：terminal-bench-2-1。

- Grok 4.6 退出；缺格：livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning。

- Claude Fable 5 進入；缺格：simpleqa-verified。

- MiniMax M3 進入；缺格：simpleqa-verified。

- Gemini 3.5 Flash-Lite 進入；缺格：simpleqa-verified。

### free-sources-14

benchmark 19 → 0；主榜模型 14 → 0。

| 模型                   | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5          | max → —        | 1 → —       | 72.165 → —      |    — |
| Gemini 3.8 Flash       | high → —       | 2 → —       | 71.115 → —      |    — |
| GPT-5.6 Sol            | max → —        | 3 → —       | 70.967 → —      |    — |
| Gemini 3.7 Flash       | high → —       | 4 → —       | 69.240 → —      |    — |
| GPT-5.5                | xhigh → —      | 5 → —       | 68.375 → —      |    — |
| Grok 4.6               | high → —       | 6 → —       | 68.065 → —      |    — |
| Claude Opus 4.8        | max → —        | 7 → —       | 67.826 → —      |    — |
| Gemini 3.6 Flash       | high → —       | 8 → —       | 64.995 → —      |    — |
| Qwen3.8 Max            | xhigh → —      | 9 → —       | 64.563 → —      |    — |
| Grok 4.5               | high → —       | 10 → —      | 64.446 → —      |    — |
| Gemini 3.5 Flash       | high → —       | 11 → —      | 64.410 → —      |    — |
| Gemini 3.1 Pro Preview | high → —       | 12 → —      | 61.866 → —      |    — |
| DeepSeek V4 Pro        | max → —        | 13 → —      | 60.911 → —      |    — |
| GLM-5.2                | max → —        | 14 → —      | 59.041 → —      |    — |

- Claude Opus 5 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.5 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.6 退出；缺格：代表配置／完整五維與集合資格變動。

- Claude Opus 4.8 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.6 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 Max 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.1 Pro Preview 退出；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 退出；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 退出；缺格：代表配置／完整五維與集合資格變動。

### free-sources-12

benchmark 20 → 0；主榜模型 12 → 0。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5    | max → —        | 1 → —       | 72.459 → —      |    — |
| GPT-5.6 Sol      | max → —        | 2 → —       | 71.034 → —      |    — |
| Gemini 3.8 Flash | high → —       | 3 → —       | 70.477 → —      |    — |
| Gemini 3.7 Flash | high → —       | 4 → —       | 68.550 → —      |    — |
| GPT-5.5          | xhigh → —      | 5 → —       | 67.769 → —      |    — |
| Grok 4.6         | high → —       | 6 → —       | 67.104 → —      |    — |
| Gemini 3.6 Flash | high → —       | 7 → —       | 63.493 → —      |    — |
| Grok 4.5         | high → —       | 8 → —       | 62.908 → —      |    — |
| GPT-5.6 Luna     | max → —        | 9 → —       | 62.790 → —      |    — |
| Gemini 3.5 Flash | high → —       | 10 → —      | 62.786 → —      |    — |
| DeepSeek V4 Pro  | max → —        | 11 → —      | 58.970 → —      |    — |
| GLM-5.2          | max → —        | 12 → —      | 57.419 → —      |    — |

- Claude Opus 5 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.5 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.6 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.6 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Luna 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 退出；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 退出；缺格：代表配置／完整五維與集合資格變動。

### free-sources-11

benchmark 21 → 20；主榜模型 11 → 11。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 4       | 71.216 → 69.439 | -1.777 |
| GPT-5.6 Sol      | max → max      | 2 → 5       | 69.911 → 68.193 | -1.718 |
| Gemini 3.8 Flash | high → high    | 3 → 8       | 69.305 → 63.399 | -5.907 |
| Gemini 3.7 Flash | high → high    | 4 → 7       | 67.726 → 63.645 | -4.081 |
| GPT-5.5          | xhigh → —      | 5 → —       | 66.841 → —      |      — |
| Grok 4.6         | high → —       | 6 → —       | 66.208 → —      |      — |
| Gemini 3.6 Flash | high → —       | 7 → —       | 62.629 → —      |      — |
| Grok 4.5         | high → high    | 8 → 11      | 62.146 → 55.999 | -6.148 |
| GPT-5.6 Luna     | max → max      | 9 → 9       | 61.565 → 57.162 | -4.403 |
| DeepSeek V4 Pro  | max → —        | 10 → —      | 57.510 → —      |      — |
| GLM-5.2          | max → —        | 11 → —      | 56.115 → —      |      — |
| Claude Fable 5.1 | — → max        | — → 1       | — → 71.641      |      — |
| GPT-6 Astra      | — → max        | — → 2       | — → 71.587      |      — |
| Claude Opus 5.5  | — → max        | — → 3       | — → 71.441      |      — |
| GPT-6 Sol        | — → max        | — → 6       | — → 66.362      |      — |
| GPT-6 Luna       | — → max        | — → 10      | — → 56.855      |      — |

- GPT-5.5 退出；缺格：cyber, ioi, proofbench。

- Grok 4.6 退出；缺格：chartography, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning。

- Gemini 3.6 Flash 退出；缺格：chartography, proofbench。

- DeepSeek V4 Pro 退出；缺格：chartography, cyber, ioi。

- GLM-5.2 退出；缺格：chartography, cyber, ioi, proofbench。

- Claude Fable 5.1 進入；缺格：deepswe-1-1, swe-bench。

- GPT-6 Astra 進入；缺格：legal-bench, mmlu-pro, swe-bench。

- Claude Opus 5.5 進入；缺格：chess-puzzles, deepswe-1-1, legal-bench, mmlu-pro, swe-bench。

- GPT-6 Sol 進入；缺格：chess-puzzles, legal-bench, mmlu-pro, swe-bench。

- GPT-6 Luna 進入；缺格：chess-puzzles, deepswe-1-1, legal-bench, mmlu-pro, swe-bench。

### free-sources-10

benchmark 22 → 21；主榜模型 10 → 10。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 1       | 71.753 → 67.937 | -3.816 |
| GPT-5.6 Sol      | max → max      | 2 → 4       | 70.332 → 64.055 | -6.278 |
| Gemini 3.8 Flash | high → high    | 3 → 3       | 70.242 → 64.190 | -6.052 |
| Gemini 3.7 Flash | high → high    | 4 → 5       | 68.725 → 63.186 | -5.538 |
| GPT-5.5          | xhigh → xhigh  | 5 → 6       | 67.633 → 62.496 | -5.137 |
| Grok 4.6         | high → —       | 6 → —       | 66.952 → —      |      — |
| Gemini 3.6 Flash | high → high    | 7 → 7       | 63.865 → 58.605 | -5.260 |
| Grok 4.5         | high → high    | 8 → 8       | 63.135 → 57.514 | -5.621 |
| DeepSeek V4 Pro  | max → max      | 9 → 9       | 58.864 → 53.660 | -5.204 |
| GLM-5.2          | max → max      | 10 → 10     | 56.746 → 51.885 | -4.861 |
| Claude Fable 5   | — → max        | — → 2       | — → 67.040      |      — |

- Grok 4.6 退出；缺格：complex-constraints, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning。

- Claude Fable 5 進入；缺格：simpleqa-verified。

### free-sources-9

benchmark 23 → 23；主榜模型 9 → 9。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 1       | 72.229 → 69.561 | -2.669 |
| Gemini 3.8 Flash | high → high    | 2 → 3       | 70.735 → 68.433 | -2.302 |
| GPT-5.6 Sol      | max → max      | 3 → 2       | 70.730 → 68.778 | -1.952 |
| Gemini 3.7 Flash | high → high    | 4 → 4       | 69.623 → 66.689 | -2.934 |
| GPT-5.5          | xhigh → xhigh  | 5 → 5       | 68.517 → 66.025 | -2.492 |
| Grok 4.6         | high → —       | 6 → —       | 67.379 → —      |      — |
| Grok 4.5         | high → high    | 7 → 7       | 64.255 → 60.910 | -3.345 |
| DeepSeek V4 Pro  | max → max      | 8 → 8       | 59.690 → 57.216 | -2.474 |
| GLM-5.2          | max → max      | 9 → 9       | 57.053 → 54.510 | -2.544 |
| Gemini 3.6 Flash | — → high       | — → 6       | — → 61.883      |      — |

- Grok 4.6 退出；缺格：complex-constraints, livebench-instruction-following, livebench-language, livebench-mathematics, livebench-reasoning。

- Gemini 3.6 Flash 進入；缺格：skillsbench。

### free-sources-7

benchmark 25 → 0；主榜模型 7 → 0。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5    | max → —        | 1 → —       | 73.045 → —      |    — |
| GPT-5.6 Sol      | max → —        | 2 → —       | 71.927 → —      |    — |
| Gemini 3.8 Flash | high → —       | 3 → —       | 68.432 → —      |    — |
| Gemini 3.7 Flash | high → —       | 4 → —       | 68.090 → —      |    — |
| Grok 4.6         | high → —       | 5 → —       | 65.930 → —      |    — |
| GPT-5.6 Luna     | max → —        | 6 → —       | 62.864 → —      |    — |
| Grok 4.5         | high → —       | 7 → —       | 62.369 → —      |    — |

- Claude Opus 5 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.6 退出；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Luna 退出；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 退出；缺格：代表配置／完整五維與集合資格變動。

### free-sources-6

benchmark 26 → 26；主榜模型 6 → 6。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 2       | 71.621 → 69.157 | -2.464 |
| GPT-5.6 Sol      | max → max      | 2 → 3       | 70.908 → 68.842 | -2.065 |
| Gemini 3.8 Flash | high → high    | 3 → 4       | 67.449 → 65.494 | -1.956 |
| Gemini 3.7 Flash | high → high    | 4 → 5       | 67.125 → 65.202 | -1.923 |
| GPT-5.6 Luna     | max → —        | 5 → —       | 61.834 → —      |      — |
| Grok 4.5         | high → high    | 6 → 6       | 61.091 → 58.938 | -2.153 |
| Claude Fable 5.1 | — → max        | — → 1       | — → 71.776      |      — |

- GPT-5.6 Luna 退出；缺格：complex-constraints, livecodebench。

- Claude Fable 5.1 進入；缺格：deepswe-1-1, swe-bench。

### free-sources-5

benchmark 27 → 28；主榜模型 5 → 5。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 1       | 70.868 → 69.835 | -1.032 |
| GPT-5.6 Sol      | max → max      | 2 → 2       | 70.267 → 69.614 | -0.654 |
| Gemini 3.8 Flash | high → high    | 3 → 3       | 66.943 → 66.465 | -0.479 |
| Gemini 3.7 Flash | high → high    | 4 → 4       | 66.646 → 65.902 | -0.743 |
| GPT-5.6 Luna     | max → —        | 5 → —       | 60.921 → —      |      — |
| Grok 4.5         | — → high       | — → 5       | — → 59.795      |      — |

- GPT-5.6 Luna 退出；缺格：complex-constraints, livecodebench。

- Grok 4.5 進入；缺格：automationbench。

### free-sources-4

benchmark 28 → 29；主榜模型 4 → 4。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| GPT-5.6 Sol      | max → max      | 1 → 2       | 70.618 → 68.973 | -1.645 |
| Gemini 3.8 Flash | high → high    | 2 → 3       | 67.533 → 65.959 | -1.574 |
| Gemini 3.7 Flash | high → high    | 3 → 4       | 67.140 → 65.423 | -1.718 |
| GPT-5.6 Luna     | max → —        | 4 → —       | 61.354 → —      |      — |
| Claude Opus 5    | — → max        | — → 1       | — → 69.082      |      — |

- GPT-5.6 Luna 退出；缺格：complex-constraints, livecodebench。

- Claude Opus 5 進入；缺格：terminal-bench-2-1。

### free-sources-3

benchmark 29 → 30；主榜模型 3 → 3。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| GPT-5.6 Sol      | max → max      | 1 → 1       | 70.802 → 69.248 | -1.554 |
| Gemini 3.8 Flash | high → high    | 2 → 2       | 68.180 → 66.371 | -1.808 |
| Gemini 3.7 Flash | high → high    | 3 → 3       | 67.789 → 65.754 | -2.035 |

### free-sources-20

benchmark 0 → 15；主榜模型 0 → 20。

| 模型                   | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5          | — → max        | — → 1       | — → 73.938      |    — |
| Claude Fable 5         | — → max        | — → 2       | — → 72.848      |    — |
| Claude Opus 4.8        | — → max        | — → 3       | — → 69.020      |    — |
| GPT-5.6 Sol            | — → max        | — → 4       | — → 68.427      |    — |
| Gemini 3.8 Flash       | — → high       | — → 5       | — → 68.320      |    — |
| Gemini 3.7 Flash       | — → high       | — → 6       | — → 68.124      |    — |
| GPT-5.5                | — → xhigh      | — → 7       | — → 66.952      |    — |
| Gemini 3.6 Flash       | — → high       | — → 8       | — → 64.904      |    — |
| Grok 4.5               | — → high       | — → 9       | — → 64.420      |    — |
| Gemini 3.5 Flash       | — → high       | — → 10      | — → 64.338      |    — |
| Qwen3.8 Max            | — → xhigh      | — → 11      | — → 63.801      |    — |
| Gemini 3.1 Pro Preview | — → high       | — → 12      | — → 62.530      |    — |
| GLM-5.2                | — → max        | — → 13      | — → 60.494      |    — |
| DeepSeek V4 Pro        | — → max        | — → 14      | — → 59.448      |    — |
| Qwen 3.7 Max           | — → default    | — → 15      | — → 58.447      |    — |
| Qwen3.8 27B            | — → xhigh      | — → 16      | — → 58.365      |    — |
| MiniMax M3             | — → max        | — → 17      | — → 58.037      |    — |
| Kimi K2.6              | — → default    | — → 18      | — → 56.969      |    — |
| Gemini 3.5 Flash-Lite  | — → high       | — → 19      | — → 52.309      |    — |
| Qwen3.6 Plus           | — → default    | — → 20      | — → 52.154      |    — |

- Claude Opus 5 進入；缺格：代表配置／完整五維與集合資格變動。

- Claude Fable 5 進入；缺格：代表配置／完整五維與集合資格變動。

- Claude Opus 4.8 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.5 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.6 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 Max 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.1 Pro Preview 進入；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 進入；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen 3.7 Max 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 27B 進入；缺格：代表配置／完整五維與集合資格變動。

- MiniMax M3 進入；缺格：代表配置／完整五維與集合資格變動。

- Kimi K2.6 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash-Lite 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.6 Plus 進入；缺格：代表配置／完整五維與集合資格變動。

### free-sources-18

benchmark 0 → 16；主榜模型 0 → 18。

| 模型                   | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5          | — → max        | — → 1       | — → 70.915      |    — |
| Claude Fable 5         | — → max        | — → 2       | — → 70.251      |    — |
| Gemini 3.8 Flash       | — → high       | — → 3       | — → 66.766      |    — |
| GPT-5.6 Sol            | — → max        | — → 4       | — → 66.459      |    — |
| Claude Opus 4.8        | — → max        | — → 5       | — → 66.121      |    — |
| Gemini 3.7 Flash       | — → high       | — → 6       | — → 65.873      |    — |
| GPT-5.5                | — → xhigh      | — → 7       | — → 64.993      |    — |
| Gemini 3.6 Flash       | — → high       | — → 8       | — → 62.476      |    — |
| Gemini 3.5 Flash       | — → high       | — → 9       | — → 62.454      |    — |
| Grok 4.5               | — → high       | — → 10      | — → 61.696      |    — |
| Qwen3.8 Max            | — → xhigh      | — → 11      | — → 61.248      |    — |
| Gemini 3.1 Pro Preview | — → high       | — → 12      | — → 60.472      |    — |
| DeepSeek V4 Pro        | — → max        | — → 13      | — → 57.255      |    — |
| GLM-5.2                | — → max        | — → 14      | — → 57.207      |    — |
| Qwen 3.7 Max           | — → default    | — → 15      | — → 55.072      |    — |
| MiniMax M3             | — → max        | — → 16      | — → 54.668      |    — |
| Kimi K2.6              | — → default    | — → 17      | — → 54.028      |    — |
| Gemini 3.5 Flash-Lite  | — → high       | — → 18      | — → 49.779      |    — |

- Claude Opus 5 進入；缺格：代表配置／完整五維與集合資格變動。

- Claude Fable 5 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 進入；缺格：代表配置／完整五維與集合資格變動。

- Claude Opus 4.8 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.5 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.6 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 Max 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.1 Pro Preview 進入；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 進入；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen 3.7 Max 進入；缺格：代表配置／完整五維與集合資格變動。

- MiniMax M3 進入；缺格：代表配置／完整五維與集合資格變動。

- Kimi K2.6 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash-Lite 進入；缺格：代表配置／完整五維與集合資格變動。

### free-sources-15

benchmark 0 → 18；主榜模型 0 → 15。

| 模型                   | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5          | — → max        | — → 1       | — → 72.538      |    — |
| GPT-5.6 Sol            | — → max        | — → 2       | — → 71.183      |    — |
| Gemini 3.8 Flash       | — → high       | — → 3       | — → 71.009      |    — |
| Gemini 3.7 Flash       | — → high       | — → 4       | — → 69.376      |    — |
| Claude Opus 4.8        | — → max        | — → 5       | — → 68.531      |    — |
| GPT-5.5                | — → xhigh      | — → 6       | — → 68.523      |    — |
| Gemini 3.6 Flash       | — → high       | — → 7       | — → 65.754      |    — |
| Gemini 3.5 Flash       | — → high       | — → 8       | — → 65.392      |    — |
| Grok 4.5               | — → high       | — → 9       | — → 65.091      |    — |
| Qwen3.8 Max            | — → xhigh      | — → 10      | — → 64.885      |    — |
| Gemini 3.1 Pro Preview | — → high       | — → 11      | — → 63.563      |    — |
| DeepSeek V4 Pro        | — → max        | — → 12      | — → 60.810      |    — |
| GLM-5.2                | — → max        | — → 13      | — → 59.831      |    — |
| Qwen 3.7 Max           | — → default    | — → 14      | — → 59.577      |    — |
| Kimi K2.6              | — → default    | — → 15      | — → 56.841      |    — |

- Claude Opus 5 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Claude Opus 4.8 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.5 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.6 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.5 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 Max 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.1 Pro Preview 進入；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 進入；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen 3.7 Max 進入；缺格：代表配置／完整五維與集合資格變動。

- Kimi K2.6 進入；缺格：代表配置／完整五維與集合資格變動。

### free-sources-13

benchmark 0 → 19；主榜模型 0 → 13。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5    | — → max        | — → 1       | — → 70.346      |    — |
| GPT-5.6 Sol      | — → max        | — → 2       | — → 69.628      |    — |
| Gemini 3.8 Flash | — → high       | — → 3       | — → 69.201      |    — |
| Gemini 3.7 Flash | — → high       | — → 4       | — → 67.340      |    — |
| GPT-5.5          | — → xhigh      | — → 5       | — → 66.915      |    — |
| Claude Opus 4.8  | — → max        | — → 6       | — → 66.353      |    — |
| Gemini 3.6 Flash | — → high       | — → 7       | — → 63.772      |    — |
| Qwen3.8 Max      | — → xhigh      | — → 8       | — → 63.182      |    — |
| Grok 4.5         | — → high       | — → 9       | — → 62.866      |    — |
| DeepSeek V4 Pro  | — → max        | — → 10      | — → 59.162      |    — |
| GLM-5.2          | — → max        | — → 11      | — → 57.595      |    — |
| Qwen 3.7 Max     | — → default    | — → 12      | — → 57.366      |    — |
| Kimi K2.6        | — → default    | — → 13      | — → 54.719      |    — |

- Claude Opus 5 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.5 進入；缺格：代表配置／完整五維與集合資格變動。

- Claude Opus 4.8 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.6 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen3.8 Max 進入；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 進入；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 進入；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 進入；缺格：代表配置／完整五維與集合資格變動。

- Qwen 3.7 Max 進入；缺格：代表配置／完整五維與集合資格變動。

- Kimi K2.6 進入；缺格：代表配置／完整五維與集合資格變動。

### free-sources-8

benchmark 0 → 24；主榜模型 0 → 8。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 | 差值 |
| ---------------- | -------------- | ----------- | --------------- | ---: |
| Claude Opus 5    | — → max        | — → 1       | — → 70.037      |    — |
| GPT-5.6 Sol      | — → max        | — → 2       | — → 69.175      |    — |
| Gemini 3.8 Flash | — → high       | — → 3       | — → 68.927      |    — |
| Gemini 3.7 Flash | — → high       | — → 4       | — → 67.588      |    — |
| GPT-5.5          | — → xhigh      | — → 5       | — → 66.909      |    — |
| Grok 4.5         | — → high       | — → 6       | — → 62.030      |    — |
| DeepSeek V4 Pro  | — → max        | — → 7       | — → 58.041      |    — |
| GLM-5.2          | — → max        | — → 8       | — → 54.817      |    — |

- Claude Opus 5 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.6 Sol 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.8 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- Gemini 3.7 Flash 進入；缺格：代表配置／完整五維與集合資格變動。

- GPT-5.5 進入；缺格：代表配置／完整五維與集合資格變動。

- Grok 4.5 進入；缺格：代表配置／完整五維與集合資格變動。

- DeepSeek V4 Pro 進入；缺格：代表配置／完整五維與集合資格變動。

- GLM-5.2 進入；缺格：代表配置／完整五維與集合資格變動。

## 來源快照與日期

| 來源                      | 舊快照                                          | 新快照                                             | 最後驗證日期             |
| ------------------------- | ----------------------------------------------- | -------------------------------------------------- | ------------------------ |
| artificial-analysis       | artificial-analysis:2026-10-03T05:51:23.777Z    | artificial-analysis:2026-10-03T05:51:23.777Z       | 2026-10-03T05:51:23.777Z |
| livebench                 | livebench:2026-10-01T00:51:23.601Z              | livebench:2026-10-01T00:51:23.601Z                 | 2026-10-01T00:51:23.601Z |
| deepswe                   | deepswe:2026-10-01T00:51:23.896Z                | deepswe:2026-10-01T00:51:23.896Z                   | 2026-10-01T00:51:23.896Z |
| frontier-code             | frontier-code:2026-10-01T00:51:24.255Z          | frontier-code:2026-10-01T00:51:24.255Z             | 2026-10-01T00:51:24.255Z |
| frontier-swe              | frontier-swe:2026-10-01T03:28:35.622Z           | frontier-swe:2026-10-01T03:28:35.622Z              | 2026-10-01T03:28:35.622Z |
| surge-chartography        | surge-chartography:2026-10-02T14:00:14.368Z     | surge-chartography:2026-10-02T14:00:14.368Z        | 2026-10-02T14:00:14.368Z |
| surge-complex-constraints | —                                               | surge-complex-constraints:2026-10-03T06:07:59.884Z | 2026-10-03T06:07:59.884Z |
| epoch-ai                  | epoch-ai:2026-10-01T00:51:24.960Z               | epoch-ai:2026-10-01T00:51:24.960Z                  | 2026-10-01T00:51:24.960Z |
| arc-prize                 | arc-prize:2026-10-01T00:51:25.353Z              | arc-prize:2026-10-01T00:51:25.353Z                 | 2026-10-01T00:51:25.353Z |
| zapier-automationbench    | zapier-automationbench:2026-10-01T00:51:25.318Z | zapier-automationbench:2026-10-01T00:51:25.318Z    | 2026-10-01T00:51:25.318Z |
| vals-ai                   | vals-ai:2026-10-01T00:51:25.754Z                | vals-ai:2026-10-01T00:51:25.754Z                   | 2026-10-01T00:51:25.754Z |
| openai-releases           | openai-releases:2026-10-02T14:56:49.000Z        | openai-releases:2026-10-02T14:56:49.000Z           | 2026-10-02T14:56:49.000Z |
| anthropic-releases        | anthropic-releases:2026-10-02T14:57:02.279Z     | anthropic-releases:2026-10-02T14:57:02.279Z        | 2026-10-02T14:57:02.279Z |

## Effort 推測揭露

逐筆推測依據保存於 JSON effortInferences，包含來源、目標列、依據列與 URL。以下列出本次來源的全部跨來源推測、未標示 default，以及其他來源受本次資料影響而改變的推測。

| 網站模型名稱                     | 目標列                                                                                       | 產品 effort | 推測依據     | 依據來源／列                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------- | ----------- | ------------ | -------------------------------------------------------------------------------- |
| grok-4.6                         | livebench-2026-06-25:livebench-instruction-following:grok-4-6                                | xhigh       | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private     |
| grok-4.6                         | livebench-2026-06-25:livebench-language:grok-4-6                                             | xhigh       | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private     |
| grok-4.6                         | livebench-2026-06-25:livebench-mathematics:grok-4-6                                          | xhigh       | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private     |
| grok-4.6                         | livebench-2026-06-25:livebench-reasoning:grok-4-6                                            | xhigh       | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private     |
| Kimi K2.6 (Thinking on)          | surge-complex-constraints:complex-constraints:kimi-k2-6-thinking-on                          | default     | DEFAULT      | — / —                                                                            |
| Nemotron 3 Ultra                 | surge-complex-constraints:complex-constraints:nemotron-3-ultra                               | default     | DEFAULT      | — / —                                                                            |
| Qwen 3.7 Max (Thinking on)       | surge-complex-constraints:complex-constraints:qwen-3-7-max-thinking-on                       | default     | DEFAULT      | — / —                                                                            |
| Grok 4.6                         | epoch-ai:epoch-capabilities-index:xai-grok-4-6-default-epoch-inspect-row-19                  | xhigh       | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private     |
| Claude Sonnet 4.6                | epoch-ai:epoch-capabilities-index:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-40   | high        | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (32k thinking) | epoch-ai:gpqa-diamond:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-170              | high        | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (no thinking)  | epoch-ai:swe-bench:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-14                  | high        | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (32k thinking) | epoch-ai:aime:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-175                      | high        | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (16k thinking) | epoch-ai:frontiermath:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-19               | high        | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (16k thinking) | epoch-ai:frontiermath-tier-4:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-20:tier-4 | high        | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |
| Claude Sonnet 4.6 (32k thinking) | epoch-ai:chess-puzzles:anthropic-claude-sonnet-4-6-default-epoch-inspect-row-200             | high        | CROSS_SOURCE | arc-prize / arc-prize:arc-agi-2:claude-sonnet-4-6-high:arc-agi-2-v2-semi-private |

## 未對應名稱

- DeepSeek V3.2 (No reasoning)
- DeepSeek V4.1 Flash (Max reasoning)
- DeepSeek V4 Flash (preview) (High reasoning)
- DeepSeek V4 Flash Vision (experimental) (Max reasoning)
- DeepSeek V4 Pro (preview) (High reasoning)
- Ernie 4.5 300B
- Ernie 5.1
- Gemini 3.1 Pro (High reasoning)
- GLM 5.3 Flash (Max reasoning)
- GLM 5.3 (Max reasoning)
- Grok 4.20 Beta
- Hy Hy3 (High reasoning)
- Hy Hy4 Preview (High reasoning)
- Kimi K2.5 (Thinking on)
- Mistral Large 3
- Muse Glimmer 30B (xHigh reasoning)
- Nemotron Lightning 3.5 30B A3B (Thinking on)
- Nova 2 Pro (No reasoning)
- Qwen 3.5 Plus (Thinking on)
- Qwen 3.8 Flash (xHigh reasoning)

## 驗證

ProductVersion schema／hash、原始 artifact SHA-256 與 byte length、候選與成本 Evidence 引用，以及原始 HTML 名稱、配置與分數回讀通過。固定 generatedAt 重建得到相同完整 versionId。

```json
{
  "status": "PASS",
  "unitTests": "PASS",
  "lint": "PASS",
  "typecheck": "PASS",
  "build": "PASS",
  "directProductionBuild": {
    "status": "PASS",
    "command": "pnpm --filter @llm-bench/bench build"
  },
  "e2e": {
    "status": "PASS",
    "passed": 62,
    "skipped": 4,
    "complexConstraintsDesktopMobilePassed": 2,
    "actualFooterVersionVerified": "sha256:89a756c8b4f273baff9f44ab77ddd89f57715532a48a8b316ce1a98aca197268"
  },
  "audit": {
    "status": "PASS",
    "vulnerabilities": 0
  },
  "gitDiffCheck": "PASS",
  "displaySetGeneration": {
    "status": "PASS",
    "approvedDefaultPreset": "free-sources-13",
    "modelCount": 13,
    "benchmarkCount": 19
  }
}
```

Artifact：`artifacts/sha256/92/924dff79ccaa2e1371f82e93fb1615b603b017ebedbb0bbd6d4c11345082967c.html`，731059 bytes，`sha256:924dff79ccaa2e1371f82e93fb1615b603b017ebedbb0bbd6d4c11345082967c`。

## 人工抽查

開啟網址，在主榜找到下列網站模型名稱，核對 Pass@1 數字。

| 網址                                                            | 頁面位置／網站模型名稱                                           | 欄位   | 期望值 |
| --------------------------------------------------------------- | ---------------------------------------------------------------- | ------ | -----: |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Claude Fable 5 (Max reasoning)         | Pass@1 |   38.1 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Gemini 3.5 Flash-Lite (High reasoning) | Pass@1 |   23.2 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Claude Fable 5.1 (Adaptive/Max)        | Pass@1 |   45.1 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — GPT 6 Astra (Max reasoning)            | Pass@1 |   57.7 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Claude Opus 5.5 (Adaptive/Max)         | Pass@1 |   49.9 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — GPT 6 Sol (Max reasoning)              | Pass@1 |   50.8 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — GPT 6 Luna (Medium reasoning)          | Pass@1 |   27.3 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Gemini 3.6 Flash (High reasoning)      | Pass@1 |   40.0 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Grok 4.5 (High reasoning)              | Pass@1 |   35.9 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Claude Opus 5 (Adaptive/Max)           | Pass@1 |   37.3 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Claude Opus 4.8 (Max reasoning)        | Pass@1 |   35.6 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — GPT 5.6 Sol (Max reasoning)            | Pass@1 |   50.5 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Gemini 3.8 Flash (High reasoning)      | Pass@1 |   48.4 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Gemini 3.7 Flash (High reasoning)      | Pass@1 |   42.4 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — GPT 5.5 (xHigh reasoning)              | Pass@1 |   49.5 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Gemini 3.5 Flash (Medium reasoning)    | Pass@1 |   37.1 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Qwen 3.8 Max (xHigh reasoning)         | Pass@1 |   45.5 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — GLM 5.2 (Max reasoning)                | Pass@1 |   29.3 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — DeepSeek V4 Pro (Max reasoning)        | Pass@1 |   42.0 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Qwen 3.7 Max (Thinking on)             | Pass@1 |   33.5 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Kimi K2.6 (Thinking on)                | Pass@1 |   30.1 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Nemotron 3 Ultra                       | Pass@1 |   17.8 |
| [Surge 主榜](https://surgehq.ai/benchmarks/complex-constraints) | ComplexConstraints 主榜 — Muse Spark 1.3 (xHigh reasoning)       | Pass@1 |   51.9 |
