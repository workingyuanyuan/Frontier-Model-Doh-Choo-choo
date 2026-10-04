# Chartography 整合與審核 — 2026-10-02

已接入 [Surge AI Chartography 主榜](https://surgehq.ai/benchmarks/chartography)，主要維度為 Reasoning，Knowledge 為次要關聯。

- 工作目錄：`C:\Users\YYuan\Workspace\Coding\Frontier-Model-Doh-Choo-choo`
- 起始 commit：`838da8e59a0968a586f4d521628d3854521bdc6c`
- 起始版本：`sha256:e61cff5ba049d50ed5158607b9817e1fc7c67edd4f784832ccb21a1d9e334a99`
- 本次版本：`sha256:4b6499482044bd12154c49bd153b4407ced99eb6261e865f58f7ca4b2cf44cd2`
- 產生時間：2026-10-02T14:01:53.894Z
- 比較基準為任務開始時的工作區資料，含當時已完成的 FrontierSWE V2 修改；快照與起始異動清單存於 `artifacts/chartography-review-2026-10-02/`。
- 完整逐列五維、Overall、名次、effort 與集合組成比較：[JSON 報告](2026-10-02-chartography.json)。

## 來源與產品

官方主榜及瀏覽器均為 42 列，42 筆百分比分數逐列相符；32 筆精確對應現有 catalog，10 筆保留原始名稱及 null canonical identity。每筆都有 SHA-256 artifact 與欄位定位，來源角色為 ORGANIZER。

| 項目          | 更新前 | 更新後 |
| ------------- | -----: | -----: |
| Frontier 模型 |     66 |     66 |
| Profiles      |    196 |    197 |
| Evidence      |   3049 |   3081 |
| 成本          |    624 |    624 |
| 比較集合      |     21 |     18 |
| 預設主榜模型  |     12 |     12 |

本次指定來源為 Chartography；各來源快照日期如下。

- `arc-prize:2026-10-01T00:51:25.353Z`
- `artificial-analysis:2026-10-01T00:50:53.038Z`
- `deepswe:2026-10-01T00:51:23.896Z`
- `epoch-ai:2026-10-01T00:51:24.960Z`
- `frontier-code:2026-10-01T00:51:24.255Z`
- `frontier-swe:2026-10-01T03:28:35.622Z`
- `livebench:2026-10-01T00:51:23.601Z`
- `surge-chartography:2026-10-02T14:00:14.368Z`
- `vals-ai:2026-10-01T00:51:25.754Z`
- `zapier-automationbench:2026-10-01T00:51:25.318Z`

## 集合與計分影響

固定原有 benchmark 集合重建後，各集合符合完整矩陣的主榜模型、代表 effort、五維分數、Overall 與排名相同。預設 free-sources-12 維持 12 個模型、20 項 benchmark，沒有新進或退出。

依既有政策重產後，Chartography 進入 8 個集合。要求所有來源時，最高可比較模型數從 11 降為 9，因此 all-sources-11 與 all-sources-10 不再可行；free-sources-5 與 all-sources-5 的 benchmark 組成相同，生成器按既有去重規則保留後者。

下列變化由集合組成改變引起，不能視為模型本身退步。all-sources-9 的既有模型最大 Overall 差為 9.576 分、最大名次差為 4 名，屬明顯重排；交付完整影響供審核。

### all-sources-9

新增 benchmark：chartography, simpleqa-verified。移出：code-migration, emb, finance-agent-v2, hlab, legal-bench, legal-research, medcode, medscribe, swe-bench, vibe-code-bench。

| 模型             | 舊 effort → 新 effort | 舊名次 | 新名次 | 舊 Overall | 新 Overall |   差值 |
| ---------------- | --------------------- | -----: | -----: | ---------: | ---------: | -----: |
| Claude Opus 5    | max → max             |      1 |      5 |     68.728 |     59.152 | -9.576 |
| Claude Fable 5   | max → —               |      2 |      — |     67.578 |          — |      — |
| GPT-5.6 Sol      | max → max             |      3 |      3 |     64.571 |     63.514 | -1.057 |
| Gemini 3.8 Flash | high → high           |      4 |      2 |     64.423 |     63.552 | -0.871 |
| Gemini 3.7 Flash | high → high           |      5 |      4 |     63.704 |     62.151 | -1.552 |
| GPT-5.5          | xhigh → xhigh         |      6 |      7 |     61.749 |     54.607 | -7.143 |
| Gemini 3.6 Flash | high → —              |      7 |      — |     58.532 |          — |      — |
| GPT-5.6 Luna     | max → max             |      8 |      9 |     57.830 |     48.760 | -9.070 |
| GLM-5.2          | max → —               |      9 |      — |     52.305 |          — |      — |
| GPT-6 Astra      | — → max               |      — |      1 |          — |     70.001 |      — |
| Kimi K3          | — → max               |      — |      6 |          — |     54.769 |      — |
| GPT-5.6 Terra    | — → max               |      — |      8 |          — |     54.227 |      — |

- Claude Fable 5 退出：新集合在該 effort 缺少 simpleqa-verified。
- Gemini 3.6 Flash 退出：新集合在該 effort 缺少 chartography。
- GLM-5.2 退出：新集合在該 effort 缺少 chartography。
- GPT-6 Astra 進入：舊集合在該 effort 缺少 legal-bench, swe-bench。
- Kimi K3 進入：舊集合在該 effort 缺少 code-migration, emb, finance-agent-v2, hlab, legal-bench, legal-research, medcode, medscribe, swe-bench, vibe-code-bench。
- GPT-5.6 Terra 進入：舊集合在該 effort 缺少 medcode, medscribe。

### all-sources-8

新增 benchmark：chartography。移出：legal-bench, mmlu-pro, simpleqa-verified, swe-bench。

| 模型             | 舊 effort → 新 effort | 舊名次 | 新名次 | 舊 Overall | 新 Overall |   差值 |
| ---------------- | --------------------- | -----: | -----: | ---------: | ---------: | -----: |
| Claude Opus 5    | max → max             |      1 |      2 |     70.352 |     65.535 | -4.817 |
| GPT-5.6 Sol      | max → max             |      2 |      5 |     69.295 |     61.860 | -7.435 |
| Gemini 3.8 Flash | high → high           |      3 |      4 |     68.667 |     61.957 | -6.710 |
| Gemini 3.7 Flash | high → high           |      4 |      6 |     67.206 |     61.037 | -6.170 |
| GPT-5.5          | xhigh → xhigh         |      5 |      7 |     65.279 |     58.845 | -6.434 |
| Gemini 3.6 Flash | high → —              |      6 |      — |     61.810 |          — |      — |
| GPT-5.6 Luna     | max → max             |      7 |      8 |     60.647 |     54.642 | -6.005 |
| GLM-5.2          | max → —               |      8 |      — |     54.930 |          — |      — |
| GPT-6 Astra      | — → max               |      — |      1 |          — |     66.659 |      — |
| Claude Fable 5   | — → max               |      — |      3 |          — |     64.653 |      — |

- Gemini 3.6 Flash 退出：新集合在該 effort 缺少 chartography。
- GLM-5.2 退出：新集合在該 effort 缺少 chartography。
- GPT-6 Astra 進入：舊集合在該 effort 缺少 legal-bench, mmlu-pro, swe-bench。
- Claude Fable 5 進入：舊集合在該 effort 缺少 simpleqa-verified。

### all-sources-7

新增 benchmark：chartography, skillsbench。移出：livecodebench, medcode, medscribe, mmlu-pro。

| 模型             | 舊 effort → 新 effort | 舊名次 | 新名次 | 舊 Overall | 新 Overall |   差值 |
| ---------------- | --------------------- | -----: | -----: | ---------: | ---------: | -----: |
| Claude Opus 5    | max → max             |      1 |      4 |     70.889 |     65.994 | -4.895 |
| GPT-5.6 Sol      | max → max             |      2 |      1 |     69.716 |     68.607 | -1.109 |
| Gemini 3.8 Flash | high → high           |      3 |      2 |     69.603 |     67.985 | -1.618 |
| Gemini 3.7 Flash | high → high           |      4 |      3 |     68.205 |     66.415 | -1.790 |
| GPT-5.5          | xhigh → xhigh         |      5 |      5 |     66.072 |     63.486 | -2.586 |
| Gemini 3.6 Flash | high → —              |      6 |      — |     63.047 |          — |      — |
| GLM-5.2          | max → —               |      7 |      — |     55.560 |          — |      — |
| GPT-5.6 Terra    | — → max               |      — |      6 |          — |     60.027 |      — |
| GPT-5.6 Luna     | — → max               |      — |      7 |          — |     55.947 |      — |

- Gemini 3.6 Flash 退出：新集合在該 effort 缺少 chartography, skillsbench。
- GLM-5.2 退出：新集合在該 effort 缺少 chartography。
- GPT-5.6 Terra 進入：舊集合在該 effort 缺少 livecodebench, medcode, medscribe, mmlu-pro。
- GPT-5.6 Luna 進入：舊集合在該 effort 缺少 livecodebench。

### all-sources-6

新增 benchmark：chartography, proofbench, skillsbench。移出：medcode, medscribe, mmlu-pro。

| 模型             | 舊 effort → 新 effort | 舊名次 | 新名次 | 舊 Overall | 新 Overall |   差值 |
| ---------------- | --------------------- | -----: | -----: | ---------: | ---------: | -----: |
| Claude Opus 5    | max → max             |      1 |      2 |     71.437 |     67.526 | -3.911 |
| GPT-5.6 Sol      | max → max             |      2 |      1 |     71.176 |     70.325 | -0.851 |
| Gemini 3.8 Flash | high → high           |      3 |      3 |     68.562 |     67.020 | -1.542 |
| Gemini 3.7 Flash | high → high           |      4 |      4 |     67.608 |     66.221 | -1.387 |
| GPT-5.6 Luna     | max → max             |      5 |      6 |     61.837 |     56.623 | -5.214 |
| Gemini 3.6 Flash | high → —              |      6 |      — |     61.677 |          — |      — |
| GPT-5.6 Terra    | — → max               |      — |      5 |          — |     61.584 |      — |

- Gemini 3.6 Flash 退出：新集合在該 effort 缺少 chartography, proofbench, skillsbench。
- GPT-5.6 Terra 進入：舊集合在該 effort 缺少 medcode, medscribe, mmlu-pro。

### free-sources-6

新增 benchmark：chartography。移出：terminal-bench-2-1。

| 模型             | 舊 effort → 新 effort | 舊名次 | 新名次 | 舊 Overall | 新 Overall |   差值 |
| ---------------- | --------------------- | -----: | -----: | ---------: | ---------: | -----: |
| GPT-5.6 Sol      | max → max             |      1 |      2 |     72.278 |     70.908 | -1.371 |
| Gemini 3.8 Flash | high → high           |      2 |      3 |     69.021 |     67.449 | -1.572 |
| Gemini 3.7 Flash | high → high           |      3 |      4 |     68.585 |     67.125 | -1.459 |
| Grok 4.6         | high → —              |      4 |      — |     66.370 |          — |      — |
| GPT-5.6 Luna     | max → max             |      5 |      5 |     63.296 |     61.834 | -1.462 |
| Grok 4.5         | high → high           |      6 |      6 |     62.740 |     61.091 | -1.649 |
| Claude Opus 5    | — → max               |      — |      1 |          — |     71.621 |      — |

- Grok 4.6 退出：新集合在該 effort 缺少 chartography。
- Claude Opus 5 進入：舊集合在該 effort 缺少 terminal-bench-2-1。

### all-sources-5

新增 benchmark：chartography。移出：無。

| 模型             | 舊 effort → 新 effort | 舊名次 | 新名次 | 舊 Overall | 新 Overall |   差值 |
| ---------------- | --------------------- | -----: | -----: | ---------: | ---------: | -----: |
| Claude Opus 5    | max → max             |      1 |      1 |     72.291 |     70.868 | -1.424 |
| GPT-5.6 Sol      | max → max             |      2 |      2 |     71.287 |     70.267 | -1.020 |
| Gemini 3.8 Flash | high → high           |      3 |      3 |     67.926 |     66.943 | -0.983 |
| Gemini 3.7 Flash | high → high           |      4 |      4 |     67.610 |     66.646 | -0.965 |
| GPT-5.6 Luna     | max → max             |      5 |      5 |     61.951 |     60.921 | -1.030 |

### all-sources-4

新增 benchmark：chartography。移出：無。

| 模型             | 舊 effort → 新 effort | 舊名次 | 新名次 | 舊 Overall | 新 Overall |   差值 |
| ---------------- | --------------------- | -----: | -----: | ---------: | ---------: | -----: |
| GPT-5.6 Sol      | max → max             |      1 |      1 |     71.638 |     70.618 | -1.020 |
| Gemini 3.8 Flash | high → high           |      2 |      2 |     68.515 |     67.533 | -0.983 |
| Gemini 3.7 Flash | high → high           |      3 |      3 |     68.105 |     67.140 | -0.965 |
| GPT-5.6 Luna     | max → max             |      4 |      4 |     62.383 |     61.354 | -1.030 |

### all-sources-3

新增 benchmark：chartography。移出：無。

| 模型             | 舊 effort → 新 effort | 舊名次 | 新名次 | 舊 Overall | 新 Overall |   差值 |
| ---------------- | --------------------- | -----: | -----: | ---------: | ---------: | -----: |
| GPT-5.6 Sol      | max → max             |      1 |      1 |     71.822 |     70.802 | -1.020 |
| Gemini 3.8 Flash | high → high           |      2 |      2 |     69.162 |     68.180 | -0.983 |
| Gemini 3.7 Flash | high → high           |      3 |      3 |     68.754 |     67.789 | -0.965 |

## Effort 推測揭露

Chartography 的 30 筆已對應模型有明示 effort；Kimi K2.6 與 Qwen 3.7 Plus 只有 Thinking on，產品沿用 default。Chartography 本身沒有跨來源推測。新增明示 effort 按既有投票政策改變了以下其他來源的 7 筆歸屬；其來源驗證報告保留 target 與 basis row。

| 來源列                                                                               | 舊 Profile                        | 新 Profile                      |
| ------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------- |
| `epoch-ai:epoch-capabilities-index:meta-muse-spark-1-3-default-epoch-inspect-row-17` | `meta-muse-spark-1-3-max`         | `meta-muse-spark-1-3-xhigh`     |
| `livebench-2026-06-25:livebench-instruction-following:grok-4-3`                      | `xai-grok-4-3-default`            | `xai-grok-4-3-high`             |
| `livebench-2026-06-25:livebench-language:grok-4-3`                                   | `xai-grok-4-3-default`            | `xai-grok-4-3-high`             |
| `livebench-2026-06-25:livebench-mathematics:grok-4-3`                                | `xai-grok-4-3-default`            | `xai-grok-4-3-high`             |
| `livebench-2026-06-25:livebench-reasoning:grok-4-3`                                  | `xai-grok-4-3-default`            | `xai-grok-4-3-high`             |
| `vals-ai:aime:anthropic-claude-opus-4-7`                                             | `anthropic-claude-opus-4-7-xhigh` | `anthropic-claude-opus-4-7-max` |
| `vals-ai:case-law-v2:anthropic-claude-opus-4-7`                                      | `anthropic-claude-opus-4-7-xhigh` | `anthropic-claude-opus-4-7-max` |

完整依據： [LiveBench](../../data/sources/livebench/validation-report.md)、[Epoch](../../data/sources/epoch-ai/validation-report.md)、[Vals](../../data/sources/vals-ai/validation-report.md)、[Chartography](../../data/sources/surge-chartography/validation-report.md)。

## 來源限制

- 待確認 catalog 對應：DeepSeek V4.1 Flash (Max reasoning)；DeepSeek V4 Flash Vision (experimental) (Max reasoning)；Gemini 3.1 Pro (High reasoning)；GLM 5.3 Flash (Max reasoning)；Inkling Small (xHigh reasoning)；Kimi K2.5 (Thinking on)；Mistral Large 3；Muse Glimmer 30B (xHigh reasoning)；Qwen 3.5 Plus (Thinking on)；Qwen 3.8 Flash (xHigh reasoning)。
- [官方 README](https://github.com/surge-ai/chartography) 寫 10 epochs，頁面成本圖註記為 20 trials；主榜沒有逐列試驗次數，因此 attempts 保存 null。benchmarkVersion 與逐列發布日期也保存 null。
- 成本圖的獨立 JS 含 35 個配置，與主榜的 42 列不同。Grok 4.5 high 在圖資料為 16.7%，主榜為 17.0%；本次明確採主榜，沒有將不同配置的成本與主榜綁定。來源 JS 與其 hash 保存在本次本地審核目錄。

## 驗證

- 原始 artifact SHA-256、byte length、manifest、candidate schema 與 evidence references 通過。
- 從 artifact 離線重新解析得到相同 42 筆候選；固定 generatedAt 重建得到相同 ProductVersion hash。
- Format、lint、typecheck、單元測試與 production build 通過；另以來源 fixture 驗證 Chartography 解析、分數邊界、頁面範圍、重複列及推理強度對應。
- Playwright：54 passed、4 skipped；包含桌面／手機 Chartography 分數、來源連結、effort 切換，以及既有鍵盤、可存取性與版面測試。4 項動態測試因本次集合缺乏可用情境而跳過。
- pnpm audit --audit-level high：No known vulnerabilities found。
- 瀏覽器 all-sources-9 的 GPT-6 Astra 明細顯示 Chartography（Surge AI）71.0，頁尾完整版本與本次產品一致。

## 人工抽查

依 [操作手冊 §6](../OPERATIONS.md#6-提交與部署)，請開啟官方主榜，找到下列模型列，核對百分比分數；另審核上列集合重排與 effort 推測。

| 網址                                                       | 頁面位置／模型名稱                             | 欄位       | 期望值 |
| ---------------------------------------------------------- | ---------------------------------------------- | ---------- | -----: |
| [Chartography](https://surgehq.ai/benchmarks/chartography) | Leaderboard — GPT 6 Astra (Max reasoning)      | 百分比分數 |    71% |
| [Chartography](https://surgehq.ai/benchmarks/chartography) | Leaderboard — Kimi K3 (Max reasoning)          | 百分比分數 |  26.6% |
| [Chartography](https://surgehq.ai/benchmarks/chartography) | Leaderboard — GPT 5.6 Terra (Max reasoning)    | 百分比分數 |    34% |
| [Chartography](https://surgehq.ai/benchmarks/chartography) | Leaderboard — Claude Fable 5 (Adaptive/Max)    | 百分比分數 |  34.8% |
| [Chartography](https://surgehq.ai/benchmarks/chartography) | Leaderboard — GPT 5.6 Luna (Max reasoning)     | 百分比分數 |  31.4% |
| [Chartography](https://surgehq.ai/benchmarks/chartography) | Leaderboard — Claude Opus 5 (Adaptive/Max)     | 百分比分數 |  27.3% |
| [Chartography](https://surgehq.ai/benchmarks/chartography) | Leaderboard — Grok 4.3 (High reasoning)        | 百分比分數 |  12.9% |
| [Chartography](https://surgehq.ai/benchmarks/chartography) | Leaderboard — Muse Spark 1.3 (xHigh reasoning) | 百分比分數 |  27.6% |
| [Chartography](https://surgehq.ai/benchmarks/chartography) | Leaderboard — Claude Opus 4.7 (Adaptive/Max)   | 百分比分數 |  16.5% |
