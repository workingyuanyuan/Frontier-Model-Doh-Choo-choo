# CoreCraft 整合審核 — 2026-10-03

採用 [Surge EnterpriseBench CoreCraft](https://surgehq.ai/benchmarks/enterprisebench-corecraft) 主榜；原始值與 normalizedScore 均為百分比，來源角色 ORGANIZER，主要維度 agentic。官方未明示 benchmark 版本，保存 null。

- 起始 commit：`838da8e59a0968a586f4d521628d3854521bdc6c`
- 工作目錄：`C:\Users\YYuan\Workspace\Coding\Frontier-Model-Doh-Choo-choo`
- 舊版本：`sha256:89a756c8b4f273baff9f44ab77ddd89f57715532a48a8b316ce1a98aca197268`
- 新版本：`sha256:b731ff72f0b1853e9288fef63bc6bc566574ac36a659ec657356aa32ab7a0ada`
- 生成時間：2026-10-03T06:28:57.960Z
- 預設集合：free-sources-13 → free-sources-13
- [完整逐模型、五維、Overall、名次、effort 與各集合對照](2026-10-03-corecraft.json)。

| 項目          |   舊 |   新 | 差值 |
| ------------- | ---: | ---: | ---: |
| frontier      |   66 |   66 |    0 |
| profiles      |  198 |  199 |    1 |
| leaderboard   |  135 |  135 |    0 |
| evidence      | 3211 | 3241 |   30 |
| costs         |  620 |  620 |    0 |
| presets       |   13 |   13 |    0 |
| defaultModels |   13 |   13 |    0 |

Profile 新增：openai-gpt-5-2-codex-xhigh, zai-glm-5-2-xhigh；移除：openai-gpt-5-2-codex-default。

主榜候選 50 筆，對應 30 筆配置、30 個模型。回讀原始 HTML 重新物化 50 筆，名稱、配置、原始分數及百分比分數相符。

## 資料與集合影響

固定舊 benchmark 集合的比較見 JSON sameBenchmarkComparison；相同 profile 的差異保存在 sameProfileRows。重產集合影響見 presetRegenerationComparison，最終主畫面所有集合逐模型完整對照見 finalPresetComparison。主榜先通過完整矩陣及五維門檻，再挑最高 Overall 的代表 effort 與重新排名。

最大 Overall 差：free-sources-6，GPT-5.6 Sol，-1.746 分。

最大名次差：free-sources-6，Claude Opus 5，-1 名。

自動生成 13 個集合；CoreCraft 進入 4 個。全來源可行尺度 0；必選模型的逐 effort benchmark 與缺少來源見 JSON requiredModelCoverage。

本次來源加入後，其他來源 effort 推測改變 8 筆；相同 evidence 的 profile 歸屬改變 8 筆。逐列決策、來源票數與依據見 JSON effortInferenceChanges、effortInferences 與 priorEvidenceProfileChanges。

GPT-5.2 Codex 的四筆 LiveBench 由 high 改為 xhigh：原 high 只有 Vals 一個來源，CoreCraft 提供 xhigh 一票後平手，依既有規則選較高 effort；Vals 的一筆 LiveCodeBench 由 default 改為 xhigh，因新增唯一的 CoreCraft 跨來源票。GPT-5.2 的一筆 Epoch 指數與兩筆 ARC Prize 由 high 改為 xhigh：原 high 兩個來源對 xhigh 一個來源，CoreCraft 增加 xhigh 一票形成 2 對 2，依同一規則選 xhigh。逐筆原始票數與依據網址保留於 JSON。

| 集合            | 模型數舊 → 新 | benchmark 新增                                                     | benchmark 移出                    | 來源新增                                                          | 來源移出  | 既有模型順序變動對數 |
| --------------- | ------------- | ------------------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------- | --------- | -------------------: |
| free-sources-20 | 20 → 20       | —                                                                  | —                                 | —                                                                 | —         |                    0 |
| free-sources-18 | 18 → 18       | —                                                                  | —                                 | —                                                                 | —         |                    0 |
| free-sources-16 | 16 → 16       | —                                                                  | —                                 | —                                                                 | —         |                    0 |
| free-sources-15 | 15 → 15       | —                                                                  | —                                 | —                                                                 | —         |                    0 |
| free-sources-13 | 13 → 13       | —                                                                  | —                                 | —                                                                 | —         |                    0 |
| free-sources-11 | 11 → 11       | —                                                                  | —                                 | —                                                                 | —         |                    0 |
| free-sources-10 | 10 → 10       | —                                                                  | —                                 | —                                                                 | —         |                    0 |
| free-sources-9  | 9 → 9         | —                                                                  | —                                 | —                                                                 | —         |                    0 |
| free-sources-8  | 8 → 8         | —                                                                  | —                                 | —                                                                 | —         |                    0 |
| free-sources-6  | 6 → 6         | automationbench, deepswe-1-1, enterprisebench-corecraft, swe-bench | arc-agi-2, cyber, ioi, proofbench | deepswe, openai-releases, surge-corecraft, zapier-automationbench | arc-prize |                    0 |
| free-sources-5  | 5 → 5         | automationbench, enterprisebench-corecraft                         | deepswe-1-1, swe-bench            | surge-corecraft, zapier-automationbench                           | deepswe   |                    0 |
| free-sources-4  | 4 → 4         | enterprisebench-corecraft                                          | —                                 | surge-corecraft                                                   | —         |                    0 |
| free-sources-3  | 3 → 3         | enterprisebench-corecraft                                          | —                                 | surge-corecraft                                                   | —         |                    0 |

### free-sources-6

benchmark 26 → 26；主榜模型 6 → 6。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Fable 5.1 | max → —        | 1 → —       | 71.776 → —      |      — |
| Claude Opus 5    | max → max      | 2 → 1       | 69.157 → 67.756 | -1.401 |
| GPT-5.6 Sol      | max → max      | 3 → 2       | 68.842 → 67.097 | -1.746 |
| Gemini 3.8 Flash | high → high    | 4 → 3       | 65.494 → 67.088 |  1.595 |
| Gemini 3.7 Flash | high → high    | 5 → 4       | 65.202 → 65.843 |  0.641 |
| Grok 4.5         | high → —       | 6 → —       | 58.938 → —      |      — |
| GPT-5.5          | — → xhigh      | — → 5       | — → 64.061      |      — |
| Claude Opus 4.8  | — → max        | — → 6       | — → 62.784      |      — |

- Claude Fable 5.1 退出；新集合要求但該 effort 缺少 deepswe-1-1, swe-bench。

- Grok 4.5 退出；新集合要求但該 effort 缺少 automationbench, enterprisebench-corecraft。

- GPT-5.5 進入；重產集合移除原缺格 cyber, ioi, proofbench；新集合完整通過。

- Claude Opus 4.8 進入；重產集合移除原缺格 arc-agi-2, cyber, ioi, proofbench；新集合完整通過。

### free-sources-5

benchmark 28 → 28；主榜模型 5 → 5。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 2       | 69.835 → 68.882 | -0.953 |
| GPT-5.6 Sol      | max → max      | 2 → 3       | 69.614 → 68.158 | -1.456 |
| Gemini 3.8 Flash | high → high    | 3 → 4       | 66.465 → 65.329 | -1.136 |
| Gemini 3.7 Flash | high → high    | 4 → 5       | 65.902 → 64.999 | -0.903 |
| Grok 4.5         | high → —       | 5 → —       | 59.795 → —      |      — |
| Claude Fable 5.1 | — → max        | — → 1       | — → 71.525      |      — |

- Grok 4.5 退出；新集合要求但該 effort 缺少 automationbench, enterprisebench-corecraft。

- Claude Fable 5.1 進入；重產集合移除原缺格 deepswe-1-1, swe-bench；新集合完整通過。

### free-sources-4

benchmark 29 → 30；主榜模型 4 → 4。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| Claude Opus 5    | max → max      | 1 → 1       | 69.082 → 69.560 |  0.479 |
| GPT-5.6 Sol      | max → max      | 2 → 2       | 68.973 → 68.929 | -0.044 |
| Gemini 3.8 Flash | high → high    | 3 → 3       | 65.959 → 66.300 |  0.341 |
| Gemini 3.7 Flash | high → high    | 4 → 4       | 65.423 → 65.699 |  0.277 |

### free-sources-3

benchmark 30 → 31；主榜模型 3 → 3。

| 模型             | effort 舊 → 新 | 名次舊 → 新 | Overall 舊 → 新 |   差值 |
| ---------------- | -------------- | ----------- | --------------- | -----: |
| GPT-5.6 Sol      | max → max      | 1 → 1       | 69.248 → 69.203 | -0.044 |
| Gemini 3.8 Flash | high → high    | 2 → 2       | 66.371 → 66.712 |  0.341 |
| Gemini 3.7 Flash | high → high    | 3 → 3       | 65.754 → 66.030 |  0.277 |

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
| surge-corecraft           | —                                                  | surge-corecraft:2026-10-03T06:28:33.754Z           | 2026-10-03T06:28:33.754Z |
| epoch-ai                  | epoch-ai:2026-10-01T00:51:24.960Z                  | epoch-ai:2026-10-01T00:51:24.960Z                  | 2026-10-01T00:51:24.960Z |
| arc-prize                 | arc-prize:2026-10-01T00:51:25.353Z                 | arc-prize:2026-10-01T00:51:25.353Z                 | 2026-10-01T00:51:25.353Z |
| zapier-automationbench    | zapier-automationbench:2026-10-01T00:51:25.318Z    | zapier-automationbench:2026-10-01T00:51:25.318Z    | 2026-10-01T00:51:25.318Z |
| vals-ai                   | vals-ai:2026-10-01T00:51:25.754Z                   | vals-ai:2026-10-01T00:51:25.754Z                   | 2026-10-01T00:51:25.754Z |
| openai-releases           | openai-releases:2026-10-02T14:56:49.000Z           | openai-releases:2026-10-02T14:56:49.000Z           | 2026-10-02T14:56:49.000Z |
| anthropic-releases        | anthropic-releases:2026-10-02T14:57:02.279Z        | anthropic-releases:2026-10-02T14:57:02.279Z        | 2026-10-02T14:57:02.279Z |

## Effort 推測揭露

逐筆推測依據保存於 JSON effortInferences，包含來源、目標列、依據列與 URL。以下列出本次來源的全部跨來源推測、未標示 default，以及其他來源受本次資料影響而改變的推測。

| 網站模型名稱               | 目標列                                                                         | 產品 effort | 推測依據     | 依據來源／列                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------ | ----------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| gpt-5.2-codex              | livebench-2026-06-25:livebench-instruction-following:gpt-5-2-codex             | xhigh       | CROSS_SOURCE | surge-corecraft / GPT 5.2 Codex (xHigh reasoning) / surge-corecraft:enterprisebench-corecraft:gpt-5-2-codex-xhigh-reasoning / [依據](https://surgehq.ai/benchmarks/enterprisebench-corecraft) |
| gpt-5.2-codex              | livebench-2026-06-25:livebench-language:gpt-5-2-codex                          | xhigh       | CROSS_SOURCE | surge-corecraft / GPT 5.2 Codex (xHigh reasoning) / surge-corecraft:enterprisebench-corecraft:gpt-5-2-codex-xhigh-reasoning / [依據](https://surgehq.ai/benchmarks/enterprisebench-corecraft) |
| gpt-5.2-codex              | livebench-2026-06-25:livebench-mathematics:gpt-5-2-codex                       | xhigh       | CROSS_SOURCE | surge-corecraft / GPT 5.2 Codex (xHigh reasoning) / surge-corecraft:enterprisebench-corecraft:gpt-5-2-codex-xhigh-reasoning / [依據](https://surgehq.ai/benchmarks/enterprisebench-corecraft) |
| gpt-5.2-codex              | livebench-2026-06-25:livebench-reasoning:gpt-5-2-codex                         | xhigh       | CROSS_SOURCE | surge-corecraft / GPT 5.2 Codex (xHigh reasoning) / surge-corecraft:enterprisebench-corecraft:gpt-5-2-codex-xhigh-reasoning / [依據](https://surgehq.ai/benchmarks/enterprisebench-corecraft) |
| Kimi K2.6 (Thinking on)    | surge-corecraft:enterprisebench-corecraft:kimi-k2-6-thinking-on                | default     | DEFAULT      | — / — / —                                                                                                                                                                                     |
| Qwen 3.7 Max (Thinking on) | surge-corecraft:enterprisebench-corecraft:qwen-3-7-max-thinking-on             | default     | DEFAULT      | — / — / —                                                                                                                                                                                     |
| GPT-5.2                    | epoch-ai:epoch-capabilities-index:openai-gpt-5-2-default-epoch-inspect-row-38  | xhigh       | CROSS_SOURCE | arc-prize / GPT-5.2 (XHigh) / arc-prize:arc-agi-2:gpt-5-2-2025-12-11-thinking-xhigh:arc-agi-2-v2-semi-private / [依據](https://arcprize.org/leaderboard)                                      |
| GPT-5.2                    | arc-prize:arc-agi-2:gpt-5-2-2025-12-11-thinking-none:arc-agi-2-v2-semi-private | xhigh       | CROSS_SOURCE | epoch-ai / GPT-5.2 (xhigh) / epoch-ai:aime:openai-gpt-5-2-xhigh-epoch-inspect-row-184 / [依據](https://epoch.ai/data/benchmark_data.zip)                                                      |
| GPT-5.2 (Refine.)          | arc-prize:arc-agi-2:johan-land-gpt-5-2-refine:arc-agi-2-v2-semi-private        | xhigh       | CROSS_SOURCE | epoch-ai / GPT-5.2 (xhigh) / epoch-ai:aime:openai-gpt-5-2-xhigh-epoch-inspect-row-184 / [依據](https://epoch.ai/data/benchmark_data.zip)                                                      |
| openai/gpt-5.2-codex       | vals-ai:livecodebench:openai-gpt-5-2-codex                                     | xhigh       | CROSS_SOURCE | surge-corecraft / GPT 5.2 Codex (xHigh reasoning) / surge-corecraft:enterprisebench-corecraft:gpt-5-2-codex-xhigh-reasoning / [依據](https://surgehq.ai/benchmarks/enterprisebench-corecraft) |

## 未對應名稱

- DeepSeek V3.2 (High reasoning)
- DeepSeek V4.1 Flash (Max reasoning)
- DeepSeek V4 Flash Vision (experimental) (Max reasoning)
- Gemini 3.1 Pro (High reasoning)
- Gemini 3 Flash (High reasoning)
- Gemini 3 Pro (High reasoning)
- GLM 5.3 Flash (Max reasoning)
- GLM 5.3 (Max reasoning)
- GLM 5 (Auto reasoning)
- Grok 4.1 (Fast)
- Hy Hy3 (High reasoning)
- Hy Hy4 Preview (High reasoning)
- Kimi K2.5 (Thinking on)
- Mistral Large 3
- Muse Glimmer 30B (xHigh reasoning)
- Nemotron Lightning 3.5 30B A3B (Thinking on)
- Nova 2 Pro (High reasoning)
- Qwen 3.5 Plus (Thinking on)
- Qwen 3.8 Flash (xHigh reasoning)
- Qwen 3 Max (Thinking on)

## 驗證

ProductVersion schema／hash、原始 artifact SHA-256 與 byte length、候選與成本 Evidence 引用，以及原始 HTML 名稱、配置與分數回讀通過。固定 generatedAt 重建得到相同完整 versionId。

```json
{
  "unit": {
    "status": "PASS",
    "passed": 593,
    "packageCounts": [7, 350, 122, 114]
  },
  "lint": "PASS",
  "typecheck": "PASS",
  "build": "PASS: direct bench production build",
  "audit": "PASS",
  "e2e": {
    "status": "PASS",
    "passed": 64,
    "skipped": 4,
    "coverage": "desktop/mobile including CoreCraft"
  },
  "footer": {
    "status": "PASS",
    "staticHtml": "PASS",
    "e2e": "PASS",
    "versionId": "sha256:b731ff72f0b1853e9288fef63bc6bc566574ac36a659ec657356aa32ab7a0ada"
  },
  "impactAssessment": {
    "decision": "EXPLAINED_CHANGES_READY_FOR_REVIEW",
    "explanation": "固定舊 benchmark 集合與相同代表 profile 的主榜分數沒有變動。CoreCraft 進入 free-sources-6、5、4、3；4 與 3 各增加一個 benchmark，6 與 5 的 benchmark 數維持相同但成員與主榜模型改變。所有集合保留模型的相對順序變動對數均為 0。最大 Overall 差為 free-sources-6 的 GPT-5.6 Sol −1.746 分；最大名次移動為 1 名，由模型進出造成。集合組成變化可逐格解釋，未見明顯且無法解釋的重排。八筆既有 evidence 的 effort 改為 xhigh，來自 CoreCraft 新增的直接來源票及現行平手取較高 effort 規則；此歸屬變動未改變固定舊集合的主榜分數。"
  }
}
```

Artifact：`artifacts/sha256/40/4033ea47b0e8eaab39c9c78fa3970063a718f657401ef2fab1da12b6a317acf0.html`，731257 bytes，`sha256:4033ea47b0e8eaab39c9c78fa3970063a718f657401ef2fab1da12b6a317acf0`。

## 異動判斷

固定舊 benchmark 集合與相同代表 profile 的主榜分數沒有變動。CoreCraft 進入 free-sources-6、5、4、3；4 與 3 各增加一個 benchmark，6 與 5 的 benchmark 數維持相同但成員與主榜模型改變。所有集合保留模型的相對順序變動對數均為 0。最大 Overall 差為 free-sources-6 的 GPT-5.6 Sol −1.746 分；最大名次移動為 1 名，由模型進出造成。集合組成變化可逐格解釋，未見明顯且無法解釋的重排。八筆既有 evidence 的 effort 改為 xhigh，來自 CoreCraft 新增的直接來源票及現行平手取較高 effort 規則；此歸屬變動未改變固定舊集合的主榜分數。

## 人工抽查

開啟網址，在主榜找到下列網站模型名稱，核對 Score（百分比）數字。

| 網址                                                                  | 頁面位置／網站模型名稱                             | 欄位            | 期望值 |
| --------------------------------------------------------------------- | -------------------------------------------------- | --------------- | -----: |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — GPT 5.5 (xHigh reasoning)         | Score（百分比） |   51.3 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — Claude Opus 4.8 (Adaptive/Max)    | Score（百分比） |   52.3 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — Claude Fable 5.1 (Adaptive/Max)   | Score（百分比） |   77.4 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — GPT 5.6 Sol (Max reasoning)       | Score（百分比） |   46.2 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — Gemini 3.8 Flash (High reasoning) | Score（百分比） |   58.5 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — Claude Opus 5 (Adaptive/Max)      | Score（百分比） |   68.7 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — Kimi K2.6 (Thinking on)           | Score（百分比） |   24.6 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — Qwen 3.7 Max (Thinking on)        | Score（百分比） |   26.2 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — Claude Opus 5.5 (Adaptive/Max)    | Score（百分比） |   74.4 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — Claude Fable 5 (Adaptive/Max)     | Score（百分比） |   70.3 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — Grok 4.7 (xHigh reasoning)        | Score（百分比） |   68.2 |
| [Surge 主榜](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | CoreCraft 主榜 — GPT 6 Astra (Max reasoning)       | Score（百分比） |   42.6 |
