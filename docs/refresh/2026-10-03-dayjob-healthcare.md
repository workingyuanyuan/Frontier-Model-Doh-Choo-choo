# DAYJOB Healthcare 整合審核 — 2026-10-03

採用 [Surge DAYJOB Healthcare](https://surgehq.ai/benchmarks/dayjob-healthcare) 主榜；原始值與 normalizedScore 均為 mean-reward 百分比，來源角色 ORGANIZER，主要維度 agentic，次要維度 reasoning、knowledge。官方未明示 benchmark 版本，保存 null。

[官方 grading 說明](https://github.com/surge-ai/dayjob#grading)：榜單每題執行五次，先對未發生錯誤的 trial reward 求平均，再對各題平均值取等權平均。榜單顯示此 mean reward 的百分比。

- 起始 commit：`838da8e59a0968a586f4d521628d3854521bdc6c`
- 工作目錄：`C:\Users\YYuan\Workspace\Coding\Frontier-Model-Doh-Choo-choo`
- 舊版本：`sha256:1f538285637dc46e084386fbf27d738269b8293e3ec19111a21236678b68b57c`
- 新版本：`sha256:91ecfdaed7e334a72fb2b0110807a4a539255b7f9a5dd31793c937b63bd6ff16`
- 生成時間：2026-10-03T08:02:30.629Z
- 預設集合：free-sources-13 → free-sources-13
- [完整逐模型、五維、Overall、名次、effort 與各集合對照](2026-10-03-dayjob-healthcare.json)。

| 項目          |   舊 |   新 | 差值 |
| ------------- | ---: | ---: | ---: |
| frontier      |   66 |   66 |    0 |
| profiles      |  201 |  201 |    0 |
| leaderboard   |  136 |  136 |    0 |
| evidence      | 3299 | 3324 |   25 |
| costs         |  620 |  620 |    0 |
| presets       |   15 |   15 |    0 |
| defaultModels |   13 |   13 |    0 |

Profile 新增：無；移除：無。

主榜候選 32 筆，對應 25 筆配置、25 個模型。回讀原始 HTML 重新物化 32 筆，名稱、配置、原始分數及百分比分數相符。

## 資料與集合影響

固定舊 benchmark 集合的比較見 JSON sameBenchmarkComparison；相同 profile 的差異保存在 sameProfileRows。重產集合影響見 presetRegenerationComparison，最終主畫面所有集合逐模型完整對照見 finalPresetComparison。主榜先通過完整矩陣及五維門檻，再挑最高 Overall 的代表 effort 與重新排名。

最大 Overall 差：free-sources-6，Gemini 3.8 Flash，-7.711 分；該集合重產新增 6 個、移出 6 個 benchmark。

最大名次差：free-sources-10，Gemini 3.8 Flash，5 名；進入 6 個模型，退出 6 個模型，既有模型相對順序變動 1 對。

自動生成 15 個集合；DAYJOB Healthcare 進入 7 個。全來源可行尺度 0；必選模型的逐 effort benchmark 與缺少來源見 JSON requiredModelCoverage。

本次來源加入後，其他來源 effort 推測改變 0 筆；相同 evidence 的 profile 歸屬改變 0 筆。逐列決策、來源票數與依據見 JSON effortInferenceChanges、effortInferences 與 priorEvidenceProfileChanges。

| 集合            | 模型數舊 → 新 | benchmark 新增                                                                                      | benchmark 移出                                                                                                  | 來源新增                                                                                             | 來源移出                                          | 既有模型順序變動對數 |
| --------------- | ------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------: |
| free-sources-20 | 20 → 20       | —                                                                                                   | —                                                                                                               | —                                                                                                    | —                                                 |                    0 |
| free-sources-18 | 18 → 18       | —                                                                                                   | —                                                                                                               | —                                                                                                    | —                                                 |                    0 |
| free-sources-17 | 17 → 17       | —                                                                                                   | —                                                                                                               | —                                                                                                    | —                                                 |                    0 |
| free-sources-16 | 16 → 16       | —                                                                                                   | —                                                                                                               | —                                                                                                    | —                                                 |                    0 |
| free-sources-15 | 15 → 15       | —                                                                                                   | —                                                                                                               | —                                                                                                    | —                                                 |                    0 |
| free-sources-14 | 14 → 14       | —                                                                                                   | —                                                                                                               | —                                                                                                    | —                                                 |                    0 |
| free-sources-13 | 13 → 13       | —                                                                                                   | —                                                                                                               | —                                                                                                    | —                                                 |                    0 |
| free-sources-11 | 11 → 11       | —                                                                                                   | —                                                                                                               | —                                                                                                    | —                                                 |                    0 |
| free-sources-10 | 10 → 10       | arc-agi-2, automationbench, chartography, cyber, dayjob-finance, dayjob-healthcare, ioi, proofbench | chess-puzzles, complex-constraints, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, riemann-bench, swe-bench | arc-prize, surge-chartography, surge-dayjob-finance, surge-dayjob-healthcare, zapier-automationbench | deepswe, surge-complex-constraints, surge-riemann |                    1 |
| free-sources-9  | 9 → 9         | dayjob-healthcare                                                                                   | —                                                                                                               | surge-dayjob-healthcare                                                                              | —                                                 |                    0 |
| free-sources-8  | 8 → 8         | dayjob-healthcare                                                                                   | —                                                                                                               | surge-dayjob-healthcare                                                                              | —                                                 |                    0 |
| free-sources-6  | 6 → 6         | arc-agi-2, cyber, dayjob-finance, dayjob-healthcare, ioi, proofbench                                | deepswe-1-1, legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench                                       | arc-prize, surge-dayjob-finance, surge-dayjob-healthcare                                             | deepswe                                           |                    0 |
| free-sources-5  | 5 → 5         | dayjob-healthcare                                                                                   | —                                                                                                               | surge-dayjob-healthcare                                                                              | —                                                 |                    0 |
| free-sources-4  | 4 → 4         | dayjob-healthcare                                                                                   | —                                                                                                               | surge-dayjob-healthcare                                                                              | —                                                 |                    0 |
| free-sources-3  | 3 → 3         | dayjob-healthcare                                                                                   | —                                                                                                               | surge-dayjob-healthcare                                                                              | —                                                 |                    0 |

### free-sources-10

benchmark 23 → 23；主榜模型 10 → 10。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 4       | 68.813 → 66.712 | -2.101 |
| GPT-5.6 Sol      | max → max      | 2 → 5       | 68.175 → 65.295 | -2.880 |
| Gemini 3.8 Flash | high → high    | 3 → 8       | 67.168 → 60.836 | -6.332 |
| Gemini 3.7 Flash | high → high    | 4 → 7       | 65.176 → 61.214 | -3.963 |
| GPT-5.5          | xhigh → —      | 5 → —       | 65.032 → —      |      — |
| Claude Opus 4.8  | max → —        | 6 → —       | 63.956 → —      |      — |
| Gemini 3.6 Flash | high → —       | 7 → —       | 60.883 → —      |      — |
| Grok 4.5         | high → —       | 8 → —       | 60.435 → —      |      — |
| DeepSeek V4 Pro  | max → —        | 9 → —       | 56.454 → —      |      — |
| GLM-5.2          | max → —        | 10 → —      | 54.097 → —      |      — |
| GPT-6 Astra      | — → max        | — → 1       | — → 70.282      |      — |
| Claude Opus 5.5  | — → max        | — → 2       | — → 70.056      |      — |
| Claude Fable 5.1 | — → max        | — → 3       | — → 68.916      |      — |
| GPT-6 Sol        | — → max        | — → 6       | — → 64.049      |      — |
| GPT-5.6 Luna     | — → max        | — → 9       | — → 54.140      |      — |
| GPT-6 Luna       | — → max        | — → 10      | — → 54.012      |      — |

- GPT-5.5 退出；新集合要求但該 effort 缺少 cyber, dayjob-finance, dayjob-healthcare, ioi, proofbench。

- Claude Opus 4.8 退出；新集合要求但該 effort 缺少 arc-agi-2, cyber, dayjob-finance, dayjob-healthcare, ioi, proofbench。

- Gemini 3.6 Flash 退出；新集合要求但該 effort 缺少 chartography, dayjob-finance, dayjob-healthcare, proofbench。

- Grok 4.5 退出；新集合要求但該 effort 缺少 automationbench, dayjob-finance, dayjob-healthcare。

- DeepSeek V4 Pro 退出；新集合要求但該 effort 缺少 automationbench, chartography, cyber, ioi。

- GLM-5.2 退出；新集合要求但該 effort 缺少 chartography, cyber, dayjob-finance, dayjob-healthcare, ioi, proofbench。

- GPT-6 Astra 進入；新集合完整通過；舊集合缺格 legal-bench, livecodebench, mmlu-pro, swe-bench；集合移除的缺格 legal-bench, livecodebench, mmlu-pro, swe-bench；來源及集合各自影響見兩階段比較。

- Claude Opus 5.5 進入；新集合完整通過；舊集合缺格 chess-puzzles, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, swe-bench；集合移除的缺格 chess-puzzles, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, swe-bench；來源及集合各自影響見兩階段比較。

- Claude Fable 5.1 進入；新集合完整通過；舊集合缺格 deepswe-1-1, swe-bench；集合移除的缺格 deepswe-1-1, swe-bench；來源及集合各自影響見兩階段比較。

- GPT-6 Sol 進入；新集合完整通過；舊集合缺格 chess-puzzles, legal-bench, livecodebench, mmlu-pro, swe-bench；集合移除的缺格 chess-puzzles, legal-bench, livecodebench, mmlu-pro, swe-bench；來源及集合各自影響見兩階段比較。

- GPT-5.6 Luna 進入；新集合完整通過；舊集合缺格 complex-constraints, livecodebench, riemann-bench；集合移除的缺格 complex-constraints, livecodebench, riemann-bench；來源及集合各自影響見兩階段比較。

- GPT-6 Luna 進入；新集合完整通過；舊集合缺格 chess-puzzles, complex-constraints, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, swe-bench；集合移除的缺格 chess-puzzles, complex-constraints, deepswe-1-1, legal-bench, livecodebench, mmlu-pro, swe-bench；來源及集合各自影響見兩階段比較。

### free-sources-9

benchmark 24 → 25；主榜模型 9 → 9。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5.5  | max → max      | 1 → 1       | 70.726 → 70.206 | -0.520 |
| GPT-6 Astra      | max → max      | 2 → 2       | 70.494 → 69.872 | -0.622 |
| Claude Fable 5.1 | max → max      | 3 → 3       | 70.017 → 69.154 | -0.863 |
| Claude Opus 5    | max → max      | 4 → 4       | 67.795 → 66.964 | -0.831 |
| GPT-5.6 Sol      | max → max      | 5 → 5       | 66.138 → 65.247 | -0.891 |
| GPT-6 Sol        | max → max      | 6 → 6       | 64.481 → 63.690 | -0.791 |
| Gemini 3.8 Flash | high → high    | 7 → 7       | 61.578 → 60.714 | -0.864 |
| Gemini 3.7 Flash | high → high    | 8 → 8       | 61.545 → 60.694 | -0.852 |
| GPT-6 Luna       | max → max      | 9 → 9       | 54.811 → 53.994 | -0.817 |

### free-sources-8

benchmark 25 → 26；主榜模型 8 → 8。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5.5  | max → max      | 1 → 1       | 69.164 → 68.644 | -0.520 |
| GPT-6 Astra      | max → max      | 2 → 2       | 69.163 → 68.542 | -0.622 |
| Claude Fable 5.1 | max → max      | 3 → 3       | 68.042 → 67.179 | -0.863 |
| Claude Opus 5    | max → max      | 4 → 4       | 65.603 → 64.772 | -0.831 |
| GPT-5.6 Sol      | max → max      | 5 → 5       | 64.583 → 63.692 | -0.891 |
| GPT-6 Sol        | max → max      | 6 → 6       | 63.089 → 62.298 | -0.791 |
| Gemini 3.8 Flash | high → high    | 7 → 7       | 59.769 → 58.906 | -0.864 |
| Gemini 3.7 Flash | high → high    | 8 → 8       | 59.510 → 58.658 | -0.852 |

### free-sources-6

benchmark 27 → 27；主榜模型 6 → 6。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 3       | 67.662 → 63.579 | -4.084 |
| GPT-5.6 Sol      | max → max      | 2 → 4       | 66.984 → 63.003 | -3.981 |
| Gemini 3.8 Flash | high → high    | 3 → 5       | 66.336 → 58.625 | -7.711 |
| Gemini 3.7 Flash | high → high    | 4 → 6       | 64.817 → 58.054 | -6.763 |
| GPT-5.5          | xhigh → —      | 5 → —       | 63.491 → —      |      — |
| Claude Opus 4.8  | max → —        | 6 → —       | 62.183 → —      |      — |
| GPT-6 Astra      | — → max        | — → 1       | — → 68.119      |      — |
| Claude Fable 5.1 | — → max        | — → 2       | — → 66.269      |      — |

- GPT-5.5 退出；新集合要求但該 effort 缺少 cyber, dayjob-finance, dayjob-healthcare, ioi, proofbench。

- Claude Opus 4.8 退出；新集合要求但該 effort 缺少 arc-agi-2, cyber, dayjob-finance, dayjob-healthcare, ioi, proofbench。

- GPT-6 Astra 進入；新集合完整通過；舊集合缺格 legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench；集合移除的缺格 legal-bench, livecodebench, mmlu-pro, skillsbench, swe-bench；來源及集合各自影響見兩階段比較。

- Claude Fable 5.1 進入；新集合完整通過；舊集合缺格 deepswe-1-1, swe-bench；集合移除的缺格 deepswe-1-1, swe-bench；來源及集合各自影響見兩階段比較。

### free-sources-5

benchmark 30 → 31；主榜模型 5 → 5。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Fable 5.1 | max → max      | 1 → 1       | 70.414 → 69.608 | -0.806 |
| Claude Opus 5    | max → max      | 2 → 2       | 67.776 → 66.995 | -0.781 |
| GPT-5.6 Sol      | max → max      | 3 → 3       | 67.079 → 66.250 | -0.829 |
| Gemini 3.8 Flash | high → high    | 4 → 4       | 63.821 → 63.003 | -0.818 |
| Gemini 3.7 Flash | high → high    | 5 → 5       | 63.258 → 62.430 | -0.828 |

### free-sources-4

benchmark 32 → 33；主榜模型 4 → 4。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 1       | 68.454 → 67.673 | -0.781 |
| GPT-5.6 Sol      | max → max      | 2 → 2       | 67.850 → 67.021 | -0.829 |
| Gemini 3.8 Flash | high → high    | 3 → 3       | 64.792 → 63.974 | -0.818 |
| Gemini 3.7 Flash | high → high    | 4 → 4       | 63.958 → 63.130 | -0.828 |

### free-sources-3

benchmark 33 → 34；主榜模型 3 → 3。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| GPT-5.6 Sol      | max → max      | 1 → 1       | 68.125 → 67.295 | -0.829 |
| Gemini 3.8 Flash | high → high    | 2 → 2       | 65.205 → 64.387 | -0.818 |
| Gemini 3.7 Flash | high → high    | 3 → 3       | 64.289 → 63.461 | -0.828 |

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
| surge-dayjob-finance      | surge-dayjob-finance:2026-10-03T07:48:50.202Z      | surge-dayjob-finance:2026-10-03T07:48:50.202Z      | 2026-10-03T07:48:50.202Z |
| surge-dayjob-healthcare   | —                                                  | surge-dayjob-healthcare:2026-10-03T08:01:53.254Z   | 2026-10-03T08:01:53.254Z |
| epoch-ai                  | epoch-ai:2026-10-01T00:51:24.960Z                  | epoch-ai:2026-10-01T00:51:24.960Z                  | 2026-10-01T00:51:24.960Z |
| arc-prize                 | arc-prize:2026-10-01T00:51:25.353Z                 | arc-prize:2026-10-01T00:51:25.353Z                 | 2026-10-01T00:51:25.353Z |
| zapier-automationbench    | zapier-automationbench:2026-10-01T00:51:25.318Z    | zapier-automationbench:2026-10-01T00:51:25.318Z    | 2026-10-01T00:51:25.318Z |
| vals-ai                   | vals-ai:2026-10-01T00:51:25.754Z                   | vals-ai:2026-10-01T00:51:25.754Z                   | 2026-10-01T00:51:25.754Z |
| openai-releases           | openai-releases:2026-10-02T14:56:49.000Z           | openai-releases:2026-10-02T14:56:49.000Z           | 2026-10-02T14:56:49.000Z |
| anthropic-releases        | anthropic-releases:2026-10-02T14:57:02.279Z        | anthropic-releases:2026-10-02T14:57:02.279Z        | 2026-10-02T14:57:02.279Z |

## Effort 推測揭露

逐筆推測依據保存於 JSON effortInferences，包含來源、candidate ID、依據列、URL 與原始 Evidence locator；來源 URL 為擷取頁面，模型位置以 Evidence locator 確認。以下列出本次來源的全部跨來源推測、未標示 default，以及其他來源受本次資料影響而改變的推測。

| 網站模型名稱     | 目標列                                                     | 產品 effort | 推測依據 | 依據來源／列 |
| ---------------- | ---------------------------------------------------------- | ----------- | -------- | ------------ |
| Nemotron 3 Ultra | surge-dayjob-healthcare:dayjob-healthcare:nemotron-3-ultra | default     | DEFAULT  | — / — / —    |

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
  "format": {
    "status": "PASS",
    "log": "artifacts/healthcare-before/format.log"
  },
  "lint": {
    "status": "PASS"
  },
  "typecheck": {
    "status": "PASS"
  },
  "tests": {
    "suiteCounts": [7, 422, 114, 122],
    "status": "PASS",
    "passed": 665
  },
  "build": {
    "status": "PASS"
  },
  "audit": {
    "status": "PASS",
    "auditLevel": "high"
  },
  "gitDiffCheck": {
    "status": "PASS"
  },
  "e2e": {
    "status": "PASS",
    "exportedHtmlFooter": "PASS",
    "footerVersionId": "sha256:91ecfdaed7e334a72fb2b0110807a4a539255b7f9a5dd31793c937b63bd6ff16",
    "desktopHealthcare": "PASS",
    "footerMatchesProduct": true,
    "passed": 70,
    "skipped": 4,
    "total": 74,
    "mobileHealthcare": "PASS",
    "log": "artifacts/healthcare-before/e2e.log",
    "durationSeconds": 23
  },
  "sourceMonitoring": {
    "errors": 0,
    "status": "PASS",
    "attentionItems": 12,
    "liveSources": 6
  },
  "impactAssessment": {
    "explanation": "固定舊 benchmark 與相同 profile 的 15 個集合均没有分數變化；既有 effort 推測與 Evidence profile 歸屬皆没有改變。新來源增加 25 筆產品 Evidence，核准政策重產後 DAYJOB Healthcare 納入七個較小集合。free-sources-10 更換八個 benchmark，六個模型進入、六個退出；free-sources-6 更換六個 benchmark，兩個模型進入、兩個退出。其餘五個受影響集合只新增 Healthcare。Gemini 3.8 Flash high 在 free-sources-6 的 Overall 由 66.336149 降至 58.625453（-7.710695），在 free-sources-10 由第三名降至第八名。所有集合的既有模型相對順序只變動一對：free-sources-10 的 Gemini 3.8 Flash high 與 Gemini 3.7 Flash high，舊分數 67.167722 對 65.176420，新分數 60.835889 對 61.213877，新差距只有 0.377988 分；其他名次移動可由新模型進入解釋。預設集合採用既有政策。變化來自已記錄的集合組成與完整矩陣門檻，沒有來源數值、benchmark 版本、identity 或 effort 修正混入，沒有廣泛的既有模型相對重排。依 OPERATIONS §5 完成正常、可解釋更新並交付逐模型與逐集合審核資料。",
    "reviewDecision": "CONTINUE_COMPLETED_REVIEW"
  }
}
```

Artifact：`artifacts/sha256/03/033cee25911e0d1d615dfc1ab651a762b7a24188cb9e4c2f7753aa9c2d977cea.html`，707442 bytes，`sha256:033cee25911e0d1d615dfc1ab651a762b7a24188cb9e4c2f7753aa9c2d977cea`。

## 異動判斷

固定舊 benchmark 與相同 profile 的 15 個集合均没有分數變化；既有 effort 推測與 Evidence profile 歸屬皆没有改變。新來源增加 25 筆產品 Evidence，核准政策重產後 DAYJOB Healthcare 納入七個較小集合。free-sources-10 更換八個 benchmark，六個模型進入、六個退出；free-sources-6 更換六個 benchmark，兩個模型進入、兩個退出。其餘五個受影響集合只新增 Healthcare。Gemini 3.8 Flash high 在 free-sources-6 的 Overall 由 66.336149 降至 58.625453（-7.710695），在 free-sources-10 由第三名降至第八名。所有集合的既有模型相對順序只變動一對：free-sources-10 的 Gemini 3.8 Flash high 與 Gemini 3.7 Flash high，舊分數 67.167722 對 65.176420，新分數 60.835889 對 61.213877，新差距只有 0.377988 分；其他名次移動可由新模型進入解釋。預設集合採用既有政策。變化來自已記錄的集合組成與完整矩陣門檻，沒有來源數值、benchmark 版本、identity 或 effort 修正混入，沒有廣泛的既有模型相對重排。依 OPERATIONS §5 完成正常、可解釋更新並交付逐模型與逐集合審核資料。

## 人工抽查

開啟網址，在主榜找到下列網站模型名稱，核對百分比分數。

| 網址                                                          | 頁面位置／網站模型名稱                                     | 欄位       | 期望值 |
| ------------------------------------------------------------- | ---------------------------------------------------------- | ---------- | -----: |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — GPT 6 Astra (Max reasoning)       | 百分比分數 |  11.6% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — Claude Opus 5.5 (Adaptive/Max)    | 百分比分數 |  24.7% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — Claude Fable 5.1 (Adaptive/Max)   | 百分比分數 |   9.6% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — GPT 6 Sol (Max reasoning)         | 百分比分數 |   3.6% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — GPT 5.6 Luna (Max reasoning)      | 百分比分數 |   0.4% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — GPT 6 Luna (Max reasoning)        | 百分比分數 |     0% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — Gemini 3.8 Flash (High reasoning) | 百分比分數 |   0.8% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — Gemini 3.7 Flash (High reasoning) | 百分比分數 |     0% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — Claude Opus 5 (Adaptive/Max)      | 百分比分數 |   8.4% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — GPT 5.6 Sol (Max reasoning)       | 百分比分數 |   1.6% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — Nemotron 3 Ultra                  | 百分比分數 |     0% |
| [Surge 主榜](https://surgehq.ai/benchmarks/dayjob-healthcare) | DAYJOB Healthcare 主榜 — Gemini 4 Argon (High reasoning)   | 百分比分數 |   9.6% |
