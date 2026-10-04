# DAYJOB Finance 整合審核 — 2026-10-03

採用 [Surge DAYJOB Finance](https://surgehq.ai/benchmarks/dayjob-finance) 主榜；原始值與 normalizedScore 均為 mean-reward 百分比，來源角色 ORGANIZER，主要維度 agentic，次要維度 reasoning、knowledge。官方未明示 benchmark 版本，保存 null。

[官方 grading 說明](https://github.com/surge-ai/dayjob#grading)：榜單每題執行五次，先對未發生錯誤的 trial reward 求平均，再對各題平均值取等權平均。榜單顯示此 mean reward 的百分比。

- 起始 commit：`838da8e59a0968a586f4d521628d3854521bdc6c`
- 工作目錄：`C:\Users\YYuan\Workspace\Coding\Frontier-Model-Doh-Choo-choo`
- 舊版本：`sha256:74e472e695340ab694537f7f614ae6a987ad1a08778105628c56779d5fb08b01`
- 新版本：`sha256:1f538285637dc46e084386fbf27d738269b8293e3ec19111a21236678b68b57c`
- 生成時間：2026-10-03T07:49:30.418Z
- 預設集合：free-sources-13 → free-sources-13
- [完整逐模型、五維、Overall、名次、effort 與各集合對照](2026-10-03-dayjob-finance.json)。

| 項目          |   舊 |   新 | 差值 |
| ------------- | ---: | ---: | ---: |
| frontier      |   66 |   66 |    0 |
| profiles      |  200 |  201 |    1 |
| leaderboard   |  136 |  136 |    0 |
| evidence      | 3274 | 3299 |   25 |
| costs         |  620 |  620 |    0 |
| presets       |   15 |   15 |    0 |
| defaultModels |   13 |   13 |    0 |

Profile 新增：moonshot-kimi-k2-7-code-max, thinking-machines-inkling-max；移除：moonshot-kimi-k2-7-code-default。

主榜候選 32 筆，對應 25 筆配置、25 個模型。回讀原始 HTML 重新物化 32 筆，名稱、配置、原始分數及百分比分數相符。

## 資料與集合影響

固定舊 benchmark 集合的比較見 JSON sameBenchmarkComparison；相同 profile 的差異保存在 sameProfileRows。重產集合影響見 presetRegenerationComparison，最終主畫面所有集合逐模型完整對照見 finalPresetComparison。主榜先通過完整矩陣及五維門檻，再挑最高 Overall 的代表 effort 與重新排名。

最大 Overall 差：free-sources-8，Gemini 3.8 Flash，-8.176 分；該集合重產新增 7 個、移出 7 個 benchmark。

最大名次差：free-sources-9，Gemini 3.8 Flash，4 名；進入 5 個模型，退出 5 個模型，既有模型相對順序變動 0 對。

自動生成 15 個集合；DAYJOB Finance 進入 5 個。全來源可行尺度 0；必選模型的逐 effort benchmark 與缺少來源見 JSON requiredModelCoverage。

本次來源加入後，其他來源 effort 推測改變 25 筆；相同 evidence 的 profile 歸屬改變 25 筆。逐列決策、來源票數與依據見 JSON effortInferenceChanges、effortInferences 與 priorEvidenceProfileChanges。

- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:aa-briefcase:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:aa-lcr:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:aa-omniscience:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:aa-omniscience:kimi-k2-7-code:index`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:critpt:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:gdp-pdf:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:gdpval-aa:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/claude-fable-5)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:gpqa-diamond:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:humanitys-last-exam:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:ifbench:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:moonshot-kimi-k2-7-code-aa-index:intelligence-index-v4-3-2`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/claude-fable-5)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:scicode:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:tau3-banking:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- artificial-analysis / Kimi K2.7 Code / `artificial-analysis:terminal-bench-2-1:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://artificialanalysis.ai/models/kimi-k2-7-code)
- livebench / kimi-k2.7-code / `livebench-2026-06-25:livebench-instruction-following:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://livebench.ai/table_2026_06_25.csv?v=1790708459)
- livebench / kimi-k2.7-code / `livebench-2026-06-25:livebench-language:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://livebench.ai/table_2026_06_25.csv?v=1790708459)
- livebench / kimi-k2.7-code / `livebench-2026-06-25:livebench-mathematics:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://livebench.ai/table_2026_06_25.csv?v=1790708459)
- livebench / kimi-k2.7-code / `livebench-2026-06-25:livebench-reasoning:kimi-k2-7-code`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://livebench.ai/table_2026_06_25.csv?v=1790708459)
- deepswe / kimi-k2-7-code / `deepswe-1-1:mini-swe-agent-kimi-k2-7-code-default`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json)
- epoch-ai / Kimi K2.7 Code / `epoch-ai:epoch-capabilities-index:moonshot-kimi-k2-7-code-default-epoch-inspect-row-50`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://epoch.ai/data/benchmark_data.zip)
- epoch-ai / Kimi K2.7 Code / `epoch-ai:gpqa-diamond:moonshot-kimi-k2-7-code-default-epoch-inspect-row-76`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://epoch.ai/data/benchmark_data.zip)
- epoch-ai / Kimi K2.7 Code / `epoch-ai:aime:moonshot-kimi-k2-7-code-default-epoch-inspect-row-83`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://epoch.ai/data/benchmark_data.zip)
- epoch-ai / Kimi K2.7 Code / `epoch-ai:simpleqa-verified:moonshot-kimi-k2-7-code-default-epoch-inspect-row-28`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://epoch.ai/data/benchmark_data.zip)
- epoch-ai / Kimi K2.7 Code / `epoch-ai:chess-puzzles:moonshot-kimi-k2-7-code-default-epoch-inspect-row-89`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://epoch.ai/data/benchmark_data.zip)
- zapier-automationbench / Kimi K2.7 Code / `zapier-automationbench:automationbench:kimi-k2-7-code-rank-104:1-0-6`：default → max；來源票數 {} → {"max":["surge-dayjob-finance"]}。[來源頁面](https://zapier.com/benchmarks)
  | 集合            | 模型數舊 → 新 | benchmark 新增                                                                                   | benchmark 移出                                                                                   | 來源新增                                                                          | 來源移出                           | 既有模型順序變動對數 |
  | --------------- | ------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------- | -------------------: |
  | free-sources-20 | 20 → 20       | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-18 | 18 → 18       | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-17 | 17 → 17       | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-16 | 16 → 16       | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-15 | 15 → 15       | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-14 | 14 → 14       | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-13 | 13 → 13       | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-11 | 11 → 11       | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-10 | 10 → 10       | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-9  | 9 → 9         | automationbench, chartography, cyber, dayjob-finance, enterprisebench-corecraft, ioi, proofbench | chess-puzzles, complex-constraints, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, swe-bench | surge-chartography, surge-corecraft, surge-dayjob-finance, zapier-automationbench | deepswe, surge-complex-constraints |                    0 |
  | free-sources-8  | 8 → 8         | automationbench, chartography, cyber, dayjob-finance, enterprisebench-corecraft, ioi, proofbench | chess-puzzles, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench         | surge-chartography, surge-corecraft, surge-dayjob-finance, zapier-automationbench | deepswe                            |                    0 |
  | free-sources-6  | 6 → 6         | —                                                                                                | —                                                                                                | —                                                                                 | —                                  |                    0 |
  | free-sources-5  | 5 → 5         | dayjob-finance                                                                                   | —                                                                                                | surge-dayjob-finance                                                              | —                                  |                    0 |
  | free-sources-4  | 4 → 4         | dayjob-finance                                                                                   | —                                                                                                | surge-dayjob-finance                                                              | —                                  |                    0 |
  | free-sources-3  | 3 → 3         | dayjob-finance                                                                                   | —                                                                                                | surge-dayjob-finance                                                              | —                                  |                    0 |

### free-sources-9

benchmark 24 → 24；主榜模型 9 → 9。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 4       | 69.166 → 67.795 | -1.371 |
| GPT-5.6 Sol      | max → max      | 2 → 5       | 68.439 → 66.138 | -2.302 |
| Gemini 3.8 Flash | high → high    | 3 → 7       | 67.451 → 61.578 | -5.873 |
| Gemini 3.7 Flash | high → high    | 4 → 8       | 65.452 → 61.545 | -3.907 |
| GPT-5.5          | xhigh → —      | 5 → —       | 65.198 → —      |      — |
| Gemini 3.6 Flash | high → —       | 6 → —       | 60.595 → —      |      — |
| Grok 4.5         | high → —       | 7 → —       | 59.883 → —      |      — |
| DeepSeek V4 Pro  | max → —        | 8 → —       | 56.117 → —      |      — |
| GLM-5.2          | max → —        | 9 → —       | 52.959 → —      |      — |
| Claude Opus 5.5  | — → max        | — → 1       | — → 70.726      |      — |
| GPT-6 Astra      | — → max        | — → 2       | — → 70.494      |      — |
| Claude Fable 5.1 | — → max        | — → 3       | — → 70.017      |      — |
| GPT-6 Sol        | — → max        | — → 6       | — → 64.481      |      — |
| GPT-6 Luna       | — → max        | — → 9       | — → 54.811      |      — |

- GPT-5.5 退出；新集合要求但該 effort 缺少 cyber, dayjob-finance, ioi, proofbench。

- Gemini 3.6 Flash 退出；新集合要求但該 effort 缺少 chartography, dayjob-finance, proofbench。

- Grok 4.5 退出；新集合要求但該 effort 缺少 automationbench, dayjob-finance, enterprisebench-corecraft。

- DeepSeek V4 Pro 退出；新集合要求但該 effort 缺少 automationbench, chartography, cyber, ioi。

- GLM-5.2 退出；新集合要求但該 effort 缺少 chartography, cyber, dayjob-finance, enterprisebench-corecraft, ioi, proofbench。

- Claude Opus 5.5 進入；新集合完整通過；舊集合缺格 chess-puzzles, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, swe-bench；集合移除的缺格 chess-puzzles, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, swe-bench；來源及集合各自影響見兩階段比較。

- GPT-6 Astra 進入；新集合完整通過；舊集合缺格 legal-bench, livecodebench, mmlu-pro, swe-bench；集合移除的缺格 legal-bench, livecodebench, mmlu-pro, swe-bench；來源及集合各自影響見兩階段比較。

- Claude Fable 5.1 進入；新集合完整通過；舊集合缺格 deepswe-1-1, swe-bench；集合移除的缺格 deepswe-1-1, swe-bench；來源及集合各自影響見兩階段比較。

- GPT-6 Sol 進入；新集合完整通過；舊集合缺格 chess-puzzles, legal-bench, livecodebench, mmlu-pro, swe-bench；集合移除的缺格 chess-puzzles, legal-bench, livecodebench, mmlu-pro, swe-bench；來源及集合各自影響見兩階段比較。

- GPT-6 Luna 進入；新集合完整通過；舊集合缺格 chess-puzzles, complex-constraints, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, swe-bench；集合移除的缺格 chess-puzzles, complex-constraints, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, swe-bench；來源及集合各自影響見兩階段比較。

### free-sources-8

benchmark 25 → 25；主榜模型 8 → 8。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 4       | 69.643 → 65.603 | -4.039 |
| GPT-5.6 Sol      | max → max      | 2 → 5       | 68.837 → 64.583 | -4.253 |
| Gemini 3.8 Flash | high → high    | 3 → 7       | 67.945 → 59.769 | -8.176 |
| Gemini 3.7 Flash | high → high    | 4 → 8       | 66.351 → 59.510 | -6.841 |
| GPT-5.5          | xhigh → —      | 5 → —       | 66.082 → —      |      — |
| Grok 4.5         | high → —       | 6 → —       | 61.003 → —      |      — |
| DeepSeek V4 Pro  | max → —        | 7 → —       | 56.942 → —      |      — |
| GLM-5.2          | max → —        | 8 → —       | 53.266 → —      |      — |
| Claude Opus 5.5  | — → max        | — → 1       | — → 69.164      |      — |
| GPT-6 Astra      | — → max        | — → 2       | — → 69.163      |      — |
| Claude Fable 5.1 | — → max        | — → 3       | — → 68.042      |      — |
| GPT-6 Sol        | — → max        | — → 6       | — → 63.089      |      — |

- GPT-5.5 退出；新集合要求但該 effort 缺少 cyber, dayjob-finance, ioi, proofbench。

- Grok 4.5 退出；新集合要求但該 effort 缺少 automationbench, dayjob-finance, enterprisebench-corecraft。

- DeepSeek V4 Pro 退出；新集合要求但該 effort 缺少 automationbench, chartography, cyber, ioi。

- GLM-5.2 退出；新集合要求但該 effort 缺少 chartography, cyber, dayjob-finance, enterprisebench-corecraft, ioi, proofbench。

- Claude Opus 5.5 進入；新集合完整通過；舊集合缺格 chess-puzzles, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench；集合移除的缺格 chess-puzzles, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench；來源及集合各自影響見兩階段比較。

- GPT-6 Astra 進入；新集合完整通過；舊集合缺格 legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench；集合移除的缺格 legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench；來源及集合各自影響見兩階段比較。

- Claude Fable 5.1 進入；新集合完整通過；舊集合缺格 deepswe-1-1, swe-bench；集合移除的缺格 deepswe-1-1, swe-bench；來源及集合各自影響見兩階段比較。

- GPT-6 Sol 進入；新集合完整通過；舊集合缺格 chess-puzzles, legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench；集合移除的缺格 chess-puzzles, legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench；來源及集合各自影響見兩階段比較。

### free-sources-5

benchmark 29 → 30；主榜模型 5 → 5。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Fable 5.1 | max → max      | 1 → 1       | 71.166 → 70.414 | -0.752 |
| Claude Opus 5    | max → max      | 2 → 2       | 68.679 → 67.776 | -0.903 |
| GPT-5.6 Sol      | max → max      | 3 → 3       | 68.018 → 67.079 | -0.939 |
| Gemini 3.8 Flash | high → high    | 4 → 4       | 64.793 → 63.821 | -0.972 |
| Gemini 3.7 Flash | high → high    | 5 → 5       | 64.222 → 63.258 | -0.965 |

### free-sources-4

benchmark 31 → 32；主榜模型 4 → 4。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 1       | 69.357 → 68.454 | -0.903 |
| GPT-5.6 Sol      | max → max      | 2 → 2       | 68.789 → 67.850 | -0.939 |
| Gemini 3.8 Flash | high → high    | 3 → 3       | 65.765 → 64.792 | -0.972 |
| Gemini 3.7 Flash | high → high    | 4 → 4       | 64.922 → 63.958 | -0.965 |

### free-sources-3

benchmark 32 → 33；主榜模型 3 → 3。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| GPT-5.6 Sol      | max → max      | 1 → 1       | 69.064 → 68.125 | -0.939 |
| Gemini 3.8 Flash | high → high    | 2 → 2       | 66.177 → 65.205 | -0.972 |
| Gemini 3.7 Flash | high → high    | 3 → 3       | 65.253 → 64.289 | -0.965 |

## 來源快照與日期

| 來源                      | 舊快照                                             | 新快照                                             | 最後驗證日期             |
| ------------------------- | -------------------------------------------------- | -------------------------------------------------- | ------------------------ |
| artificial-analysis       | artificial-analysis:2026-10-03T05:51:23.777Z       | artificial-analysis:2026-10-03T05:51:23.777Z       | 2026-10-03T05:51:23.777Z |
| livebench                 | livebench:2026-10-01T00:51:23.601Z                 | livebench:2026-10-01T00:51:23.601Z                 | 2026-10-01T00:51:23.601Z |
| deepswe                   | deepswe:2026-10-01T00:51:23.896Z                   | deepswe:2026-10-01T00:51:23.896Z                   | 2026-10-01T00:51:23.896Z |
| frontier-code             | frontier-code:2026-10-01T00:51:24.255Z             | frontier-code:2026-10-01T00:51:24.255Z             | 2026-10-01T00:51:24.255Z |
| frontier-swe              | frontier-swe:2026-10-01T03:28:35.622Z              | frontier-swe:2026-10-01T03:28:35.622Z              | 2026-10-01T03:28:35.622Z |
| surge-chartography        | surge-chartography:2026-10-02T14:00:14.368Z        | surge-chartography:2026-10-02T14:00:14.368Z        | 2026-10-02T14:00:14.368Z |
| surge-complex-constraints | surge-complex-constraints:2026-10-03T06:07:59.884Z | surge-complex-constraints:2026-10-03T06:07:59.884Z | 2026-10-03T06:07:59.884Z |
| surge-corecraft           | surge-corecraft:2026-10-03T06:28:33.754Z           | surge-corecraft:2026-10-03T06:28:33.754Z           | 2026-10-03T06:28:33.754Z |
| surge-riemann             | surge-riemann:2026-10-03T06:41:42.680Z             | surge-riemann:2026-10-03T06:41:42.680Z             | 2026-10-03T06:41:42.680Z |
| surge-dayjob-finance      | —                                                  | surge-dayjob-finance:2026-10-03T07:48:50.202Z      | 2026-10-03T07:48:50.202Z |
| epoch-ai                  | epoch-ai:2026-10-01T00:51:24.960Z                  | epoch-ai:2026-10-01T00:51:24.960Z                  | 2026-10-01T00:51:24.960Z |
| arc-prize                 | arc-prize:2026-10-01T00:51:25.353Z                 | arc-prize:2026-10-01T00:51:25.353Z                 | 2026-10-01T00:51:25.353Z |
| zapier-automationbench    | zapier-automationbench:2026-10-01T00:51:25.318Z    | zapier-automationbench:2026-10-01T00:51:25.318Z    | 2026-10-01T00:51:25.318Z |
| vals-ai                   | vals-ai:2026-10-01T00:51:25.754Z                   | vals-ai:2026-10-01T00:51:25.754Z                   | 2026-10-01T00:51:25.754Z |
| openai-releases           | openai-releases:2026-10-02T14:56:49.000Z           | openai-releases:2026-10-02T14:56:49.000Z           | 2026-10-02T14:56:49.000Z |
| anthropic-releases        | anthropic-releases:2026-10-02T14:57:02.279Z        | anthropic-releases:2026-10-02T14:57:02.279Z        | 2026-10-02T14:57:02.279Z |

## Effort 推測揭露

逐筆推測依據保存於 JSON effortInferences，包含來源、candidate ID、依據列、URL 與原始 Evidence locator；來源 URL 為擷取頁面，模型位置以 Evidence locator 確認。以下列出本次來源的全部跨來源推測、未標示 default，以及其他來源受本次資料影響而改變的推測。

| 網站模型名稱     | 目標列                                                                                 | 產品 effort | 推測依據     | 依據來源／列                                                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------- | ----------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kimi K2.7 Code   | artificial-analysis:aa-briefcase:kimi-k2-7-code                                        | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:aa-lcr:kimi-k2-7-code                                              | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:aa-omniscience:kimi-k2-7-code                                      | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:aa-omniscience:kimi-k2-7-code:index                                | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:critpt:kimi-k2-7-code                                              | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:gdp-pdf:kimi-k2-7-code                                             | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:gdpval-aa:kimi-k2-7-code                                           | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:gpqa-diamond:kimi-k2-7-code                                        | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:humanitys-last-exam:kimi-k2-7-code                                 | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:ifbench:kimi-k2-7-code                                             | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:moonshot-kimi-k2-7-code-aa-index:intelligence-index-v4-3-2         | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:scicode:kimi-k2-7-code                                             | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:tau3-banking:kimi-k2-7-code                                        | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | artificial-analysis:terminal-bench-2-1:kimi-k2-7-code                                  | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| kimi-k2.7-code   | livebench-2026-06-25:livebench-instruction-following:kimi-k2-7-code                    | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| kimi-k2.7-code   | livebench-2026-06-25:livebench-language:kimi-k2-7-code                                 | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| kimi-k2.7-code   | livebench-2026-06-25:livebench-mathematics:kimi-k2-7-code                              | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| kimi-k2.7-code   | livebench-2026-06-25:livebench-reasoning:kimi-k2-7-code                                | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| kimi-k2-7-code   | deepswe-1-1:mini-swe-agent-kimi-k2-7-code-default                                      | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Nemotron 3 Ultra | surge-dayjob-finance:dayjob-finance:nemotron-3-ultra                                   | default     | DEFAULT      | — / — / —                                                                                                                                                                               |
| Kimi K2.7 Code   | epoch-ai:epoch-capabilities-index:moonshot-kimi-k2-7-code-default-epoch-inspect-row-50 | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | epoch-ai:gpqa-diamond:moonshot-kimi-k2-7-code-default-epoch-inspect-row-76             | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | epoch-ai:aime:moonshot-kimi-k2-7-code-default-epoch-inspect-row-83                     | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | epoch-ai:simpleqa-verified:moonshot-kimi-k2-7-code-default-epoch-inspect-row-28        | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | epoch-ai:chess-puzzles:moonshot-kimi-k2-7-code-default-epoch-inspect-row-89            | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |
| Kimi K2.7 Code   | zapier-automationbench:automationbench:kimi-k2-7-code-rank-104:1-0-6                   | max         | CROSS_SOURCE | surge-dayjob-finance / Kimi K2.7 Code (Max reasoning) / surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning / [依據來源頁面](https://surgehq.ai/benchmarks/dayjob-finance) |

## 未對應名稱

- Gemini 3.1 Pro (High reasoning)
- GLM 5.3 Flash (Max reasoning)
- GLM 5.3 (Max reasoning)
- Hy Hy3 (High reasoning)
- Hy Hy4 Preview (High reasoning)
- Mistral Large 3
- Muse Glimmer 30B (xHigh reasoning)

## 驗證

ProductVersion schema／hash、原始 artifact SHA-256 與 byte length、候選與成本 Evidence 引用，以及原始 HTML 名稱、配置與分數回讀通過。固定 generatedAt 重建得到相同完整 versionId。

```json
{
  "build": "PASS",
  "typecheck": "PASS",
  "lint": "PASS",
  "tests": {
    "status": "PASS",
    "total": 640,
    "server": 7,
    "acquisition": 397,
    "benchmarkData": 114,
    "ui": 122
  },
  "e2e": {
    "status": "PASS",
    "passed": 68,
    "skipped": 4,
    "footerVersionId": "sha256:1f538285637dc46e084386fbf27d738269b8293e3ec19111a21236678b68b57c",
    "footerMatchesProduct": true,
    "footerObservedIn": "Browser and exported HTML; E2E"
  },
  "audit": {
    "status": "PASS",
    "vulnerabilities": 0
  },
  "format": {
    "scope": "Final refresh Markdown and JSON; Prettier write and check",
    "status": "PASS"
  },
  "sourceMonitoring": {
    "surgeSources": 5,
    "attention": 15,
    "remainingPerSource": 3,
    "errors": 0
  },
  "impactAssessment": {
    "decision": "ordinary-completed-review",
    "explanation": "固定舊 benchmark 集合的所有模型分數與名次均無異動；最終五個集合的既有模型相對順序變動均為零。free-sources-8 與 free-sources-9 各替換七個 benchmark；Gemini 3.8 Flash High 在 free-sources-8 的 Overall 降低 8.176 分，最大名次下降四名由進入及退出模型改變榜單組成所致。DAYJOB Finance 首次提供 Kimi K2.7 Code 的明確 max effort 來源票，原先缺少直接來源票，依既有政策使 25 筆推測由 default 轉 max，Evidence 引用完整保留。異動完成一般審查。"
  }
}
```

Artifact：`artifacts/sha256/a0/a0f705d60b185c0d57165d6941580a66a5b85c8c3291175fcb2f7c1f9981f190.html`，719695 bytes，`sha256:a0f705d60b185c0d57165d6941580a66a5b85c8c3291175fcb2f7c1f9981f190`。

## 異動判斷

固定舊 benchmark 集合的所有模型分數與名次均無異動；最終五個集合的既有模型相對順序變動均為零。free-sources-8 與 free-sources-9 各替換七個 benchmark；Gemini 3.8 Flash High 在 free-sources-8 的 Overall 降低 8.176 分，最大名次下降四名由進入及退出模型改變榜單組成所致。DAYJOB Finance 首次提供 Kimi K2.7 Code 的明確 max effort 來源票，原先缺少直接來源票，依既有政策使 25 筆推測由 default 轉 max，Evidence 引用完整保留。異動完成一般審查。

## 人工抽查

開啟網址，在主榜找到下列網站模型名稱，核對百分比分數。

| 網址                                                       | 頁面位置／網站模型名稱                                  | 欄位       | 期望值 |
| ---------------------------------------------------------- | ------------------------------------------------------- | ---------- | -----: |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — Kimi K2.7 Code (Max reasoning)    | 百分比分數 |     0% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — Claude Opus 5.5 (Adaptive/Max)    | 百分比分數 |  23.9% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — GPT 6 Astra (Max reasoning)       | 百分比分數 |  21.5% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — Claude Fable 5.1 (Adaptive/Max)   | 百分比分數 |  19.8% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — GPT 6 Sol (Max reasoning)         | 百分比分數 |   9.3% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — GPT 6 Luna (Max reasoning)        | 百分比分數 |   2.3% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — Gemini 3.8 Flash (High reasoning) | 百分比分數 |   2.8% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — Gemini 3.7 Flash (High reasoning) | 百分比分數 |   2.8% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — GPT 5.6 Sol (Max reasoning)       | 百分比分數 |   5.5% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — Claude Opus 5 (Adaptive/Max)      | 百分比分數 |  11.3% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — Nemotron 3 Ultra                  | 百分比分數 |     0% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — Gemini 4 Argon (High reasoning)   | 百分比分數 |  20.3% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-finance) | DAYJOB Finance 主榜 — Muse Spark 1.3 (Max reasoning)    | 百分比分數 |  14.8% |
