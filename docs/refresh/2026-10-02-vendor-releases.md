# 模型發布頁 benchmark 研究與整合

資料基準日：2026-10-02。完成驗證：2026-10-03（Asia/Taipei）。

已將 OpenAI 與 Anthropic 的模型發布頁接入補充來源。採用單位是經審核的圖表與模型／effort 列；來源保存為 `VENDOR`、`PARTIAL_SOURCE`。相同 benchmark 與 profile 有主辦方實測時，產品優先選用主辦方資料。

## 研究結論

發布頁確實能補足官方榜單的更新空窗，但數字相同只能支持引用一致性，不能據此推定所有供應商都交由同一評測者執行。

[OpenAI 發布頁](https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/) 註明 GPT 評估在其研究環境或 API 執行，競品結果來自公開報告。[Anthropic 發布頁](https://www.anthropic.com/claude-opus-5-5) 則明確寫出 AutomationBench 由 Zapier 執行，Opus 5.5 使用提前存取的測試；同頁也說明 Terminal-Bench 與 Terminal-Bench Science 有自行重跑及統計誤差。提前提供模型給評測者有具體案例，但不能泛化成全體 benchmark 的共同流程。

逐列核對結果保存在 [OpenAI cross-checks](../../data/sources/openai-releases/cross-checks.json) 與 [Anthropic cross-checks](../../data/sources/anthropic-releases/cross-checks.json)，包含原分數、參考分數、URL、模型、effort 及結論。

| 發布來源  | 評測版本              | 取得列數 | 與官方相符 | 官方快照缺列的補充 | 排除 |
| --------- | --------------------- | -------: | ---------: | -----------------: | ---: |
| OpenAI    | DeepSWE 1.1           |       15 |          5 |                 10 |    0 |
| OpenAI    | AutomationBench 1.0.6 |       21 |         10 |                  5 |    6 |
| Anthropic | FrontierCode 1.1 Main |       25 |         24 |                  0 |    1 |
| Anthropic | CursorBench 4.0       |       20 |         15 |                  5 |    0 |
| 合計      | 4 項評測              |       81 |         54 |                 20 |    7 |

74 筆可採用列中，54 筆有官方重疊列支持，20 筆保留為廠商發布的補充成績。這兩種狀態在稽核資料中分別標記 `MATCH`、`SUPPLEMENT`；後者沒有逐列獨立驗證的主張。

## 比對證據與採用範圍

### DeepSWE 1.1

[DeepSWE 官方榜單](https://deepswe.datacurve.ai/) 的 GPT-6 Astra 五個 effort 與 OpenAI 圖表逐列一致，差距落在圖表小數位的四捨五入範圍。例如 xhigh 為官方 74.115044…%，發布頁 74.12%。核對容差為 0.005 個百分點。

官方快照尚缺 GPT-6 Sol、GPT-6.1 Sol；本次補入各五個 effort，共 10 格。GPT-6.1 Sol 的 low／medium／high／xhigh／max 為 64.38／73.01／75.22／71.90／71.90%。來源原始 fraction 保存在 artifact 與 provenance，產品單位統一為百分比。

### AutomationBench 1.0.6

[Zapier 官方榜單](https://zapier.com/benchmarks) 與 OpenAI 的 Astra、Sol 各五個 effort 相符。例如 Astra max 為 41.4%，Sol max 為發布頁 31.96%、官方顯示 32.0%。核對容差為 0.05 個百分點。本次補入 GPT-6.1 Sol 五個 effort：24.7／31.7／33.2／35.5／36.1%。

OpenAI 圖表還有五筆 Opus 5.5 fallback 配置及一筆 Fable 5.1 搭配 Opus 5 fallback。它們是混合模型系統，保留原始列並排除，canonical model 為 null。

Anthropic 的 Opus 5.5 40.0% 明確是 Zapier 提前測試、沒有 fallback 的結果；官方榜單的 max 42.47% 使用 default fallbacks，兩者配置不同。此例支持提前測試存在，也說明同名模型的分數仍須核對執行設定。

### FrontierCode 1.1 Main

[Cognition 官方資料](https://cognition.com/data/frontiercode-leaderboard/data.json) 與 Anthropic 圖表的 25 個模型／effort 配對中，24 筆相符。唯一差異是 Claude Fable 5.1 Low：發布頁為 52.8%，官方 `v1_1` 的 Main `new_score` 為 0.4982，即 49.82%。2026-10-02 另查現行官方資料仍為 49.82%。目前無法用公開配置裁決差異，因此該發布頁列明確排除，保留理由及來源。

其餘列作為相互核對的引用，產品沿用優先級較高的官方結果。解析器鎖定 Main 與 1.1，沒有混用 Correctness 或其他版本。

### CursorBench 4.0

[Cursor 官方評測頁](https://prod.cursor.com/evals) 的可見圖表標籤與 Anthropic 中 Opus 5.5、Fable 5.1、GPT-5.6 Sol 的五個 effort 全部相符，共 15 筆。例如三者 max 分別為 57.8%、51.8%、41.7%。Anthropic 的 Opus 5 五筆在本次官方頁面沒有對應列，標記為補充資料。

新增 `cursorbench-4`，主要維度為 Coding，收錄四個模型、各五個 effort。此版本獨立保存，來源連結顯示 Anthropic (vendor)。官方核對頁完整 HTML 另存為 artifact。

### Google 的交叉參考

[Gemini 4 Argon 發布頁](https://blog.google/intl/zh-tw/products/explore-get-answers/gemini-4-argon/) 中 AutomationBench 的 Argon 51.3%、Astra 41.4%、Opus 5.5 42.5%，可對上 Zapier 對應結果的四捨五入值；Fable 5.1 的 31.4% 也能對上數字，但上游是帶 Opus 5 fallback 的配置，圖表簡稱未完整呈現這個差別。Google 的 DeepSWE Astra 74.1% 同樣符合官方 xhigh 分數四捨五入；新模型列仍有官方更新空窗。

這些比對增加已辨識引用鏈的可信度，但 Google 圖表未逐列交代 effort，不能只靠最佳分數將圖中列對應到本專案檔位。

## 其他候選評測的判斷

| 候選                       | 本次查核結果與整合判斷                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GDP.pdf                    | OpenAI 圖表與 [Surge 主榜](https://surgehq.ai/benchmarks/gdp-pdf) 的部分重疊列不同，例如 Astra max 31.0 對 34.2、Sol 24.8 對 26.4。公開資訊不足以裁決，暫不建立同口徑來源。                                        |
| Terminal-Bench Science 0.1 | OpenAI 與 Anthropic 的 Astra 分別為 68.1、64.6；Anthropic 明示自行重跑及 Claude Code 設定。即使同版，取得時間、harness 與重跑仍須分開查證。[官方頁](https://www.terminal-bench-science.ai/) 可作後續獨立來源候選。 |
| Terminal-Bench 4.0         | Anthropic 註腳明示 Opus 5.5 採 xhigh、Astra 採 high；自身重跑與官方數字在誤差範圍內。不能把摘要表全部當成 max effort 或混入既有 2.1。                                                                              |
| Chartography               | Anthropic 摘要使用 with tools；[Surge 主榜](https://surgehq.ai/benchmarks/chartography) 的現有匯入配置不同，需要獨立配置查核。                                                                                     |
| OSWorld                    | OpenAI 為 2.0 離線資料集 v2026.08.08 的 partial reward，Anthropic 為 2.1；版本、切分與 partial／full 指標不能直接合併。                                                                                            |
| WANDR                      | Anthropic 使用離線搜尋／工具設定，頁面明示與 Perplexity 的公開結果不可直接比較。                                                                                                                                   |
| GDPval-AA v2.1             | 為 Elo，維持專案既有複合／非百分比分數處理規則，不轉成準確率投入五維。                                                                                                                                             |

## 擷取與來源選用

- OpenAI 保存瀏覽器 DOM／RSC 中兩個完整圖表陣列的正規化摘錄，共 36 列。metadata 明示這是摘錄，取得時間為 2026-10-02T14:56:49.000Z。
- Anthropic 保存完整 HTML，選定兩個內嵌 CSV，共 45 列；Cursor 核對頁同時保存。取得時間為 2026-10-02T14:57:02.279Z。
- 比較使用本專案已保存的 DeepSWE、Zapier、Cognition 官方快照；`cross-checks.json` 內含參考 evidence metadata。來源日期與產品快照清單另見下節。
- 解析器驗證版本、列數、精確模型名稱、effort、分數範圍與重複列。未審核的數值衝突會中止物化。已知 Fable Low 差異保留明確排除規則。
- 主辦方 > 獨立評測 > 廠商來源。修正既有不同 harness 分支可能越過角色優先序的問題，並以測試覆蓋輸入順序、完整性、同等來源分數與時間決勝。
- 離線流程先解析、驗證並暫存各來源結果，再用即將寫入的官方結果聯合核對兩個發布頁來源，通過後才寫入快照。
- 詳細操作見 [OPERATIONS](../OPERATIONS.md#模型發布頁)，逐列 product 影響見 [JSON 報告](2026-10-02-vendor-releases.json)。

## 產品與集合影響

- 工作目錄：`C:\Users\YYuan\Workspace\Coding\Frontier-Model-Doh-Choo-choo`。起始 commit：`838da8e59a0968a586f4d521628d3854521bdc6c`。
- 比較基準為任務開始時的工作區資料，包含已完成的 FrontierSWE V2 與 Chartography 整合；基準檔保存於 `artifacts/vendor-review-2026-10-02/`，SHA-256 記錄於 JSON。
- 基準版本：`sha256:4b6499482044bd12154c49bd153b4407ced99eb6261e865f58f7ca4b2cf44cd2`。
- 本次版本：`sha256:6219563f6c6cbd0670715f849a7c3550a02e1691c1271dc298c9007e99a788d7`。
- 產品產生時間：2026-10-02T14:57:51.609Z；集合參考日期：2026-10-02。

| 項目                                                    | 基準 | 本次 |
| ------------------------------------------------------- | ---: | ---: |
| Frontier 模型                                           |   66 |   66 |
| Profiles                                                |  197 |  197 |
| Product evidence                                        | 3081 | 3156 |
| Included evidence                                       | 2514 | 2588 |
| 有有效成績的 benchmark/profile 格                       | 2392 | 2427 |
| 有有效成績的 benchmark（含手動比較）                    |   47 |   48 |
| 成本紀錄                                                |  624 |  624 |
| 比較集合                                                |   18 |   14 |
| 所有集合的排行榜資料列合計（含未達主榜門檻的 profiles） | 3204 | 2434 |
| 預設主榜模型                                            |   12 |   12 |

本次真正補上的 35 個分數格為 DeepSWE 10、AutomationBench 5、CursorBench 20；它們已可供手動選模型／effort 的共同 benchmark 比較。75 筆新 Product evidence 含 74 筆採用與 1 筆已對應模型的衝突排除列；六筆混合模型配置因 identity 為 null，保存在來源快照。

### 固定原集合的比較

先以原 display set 與本次來源重建，固定 generatedAt，以區分資料選用和集合生成的影響。來源角色／完整性選用修正改變五格 GPQA Diamond 的有效來源；其完整 URL、harness、列 ID 與前後分數列於 JSON 的 selection.existingCellSelectionChanges。

| 模型／effort                    | 舊來源／分數                  | 新來源／分數       |
| ------------------------------- | ----------------------------- | ------------------ |
| alibaba-qwen3-7-plus-default    | artificial-analysis 90.000000 | epoch-ai 87.878788 |
| deepseek-deepseek-v4-pro-max    | vals-ai 89.394000             | epoch-ai 91.666667 |
| moonshot-kimi-k2-7-code-default | artificial-analysis 89.595960 | epoch-ai 87.878788 |
| moonshot-kimi-k3-max            | artificial-analysis 93.535354 | epoch-ai 93.118687 |
| openai-gpt-6-astra-max          | artificial-analysis 96.060606 | epoch-ai 95.770202 |

DeepSeek V4 Pro 的 GPQA 選用由 Vals 89.394% 改為 Epoch 91.666667%。先比較角色及完整性，才在同等候選中比較較高分，避免中途的較高分部分快照影響完整來源的選用。這是來源選擇修正，沒有宣稱模型重新測得能力提升。

### 最終展示

預設 free-sources-12 使用 20 項評測、12 個完整模型。DeepSeek V4 Pro Overall 為 58.970135（基準 58.894380，差 +0.075756）。保留集合中最大差為 free-sources-21 的 DeepSeek：59.296404 → 59.447915（+0.151511）；free-sources-19 使 DeepSeek 由第 15 升至第 14、GLM 5.2 由第 14 至第 15，屬接近分數的交換。

本次生成 14 個自由來源集合，模型數為 21、19、17、16、14、12、11、10、9、7、6、5、4、3。原 all-sources-9 至 all-sources-3 七個集合無解：Anthropic 經來源優先選用後只貢獻 CursorBench，而政策必選的 Gemini 3.7 Flash 缺少此評測。生成器因此保留自由來源曲線，新增 free-sources-3、4、5。

GPT-6 Astra、Kimi K3、GPT-5.6 Terra 因原全來源集合消失，現在沒有任何預設集合達到完整門檻。三者仍可在手動模型比較中選取。逐集合進出、缺少評測、代表 effort、五維、Overall 與名次見 JSON 的 fixedBenchmarkComparison.presets 及 finalComparison.presets。這是集合覆蓋率的取捨，與資料本身的分數變化分開記錄。

## Effort 推測依據

本次發布頁列均有明示 effort。新增來源使以下 21 筆既有推測列的依據選用更新；推測值均為 max，推測規則為其他來源的明示檔位投票，平手採較高檔位。以下逐列列出目標與本次依據；完整前後依據及候選是否進入產品見 JSON 的 effortInference。

| 目標來源列                                                                                   | 模型             | 推測 effort | 本次依據來源列                                       |
| -------------------------------------------------------------------------------------------- | ---------------- | ----------- | ---------------------------------------------------- |
| `frontier-swe:frontier-swe-v2:claude-fable-5-1-proximus`                                     | Claude Fable 5.1 | max         | `anthropic-releases:cursorbench-4:fable51-max`       |
| `frontier-swe:frontier-swe-v2:claude-opus-5-5-proximus`                                      | Claude Opus 5.5  | max         | `anthropic-releases:cursorbench-4:opus55-max`        |
| `frontier-swe:frontier-swe-v2:claude-opus-5-proximus`                                        | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `frontier-swe:frontier-swe-v2:gpt-6-astra-proximus`                                          | GPT-6 Astra      | max         | `anthropic-releases:frontier-code-1-1:gpt6astra-max` |
| `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-5-5-default-epoch-inspect-row-1`    | Claude Opus 5.5  | max         | `anthropic-releases:cursorbench-4:opus55-max`        |
| `epoch-ai:epoch-capabilities-index:openai-gpt-6-astra-default-epoch-inspect-row-2`           | GPT-6 Astra      | max         | `anthropic-releases:frontier-code-1-1:gpt6astra-max` |
| `epoch-ai:epoch-capabilities-index:anthropic-claude-fable-5-1-default-epoch-inspect-row-4`   | Claude Fable 5.1 | max         | `anthropic-releases:cursorbench-4:fable51-max`       |
| `epoch-ai:epoch-capabilities-index:anthropic-claude-opus-5-default-epoch-inspect-row-5`      | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `epoch-ai:epoch-capabilities-index:openai-gpt-5-6-sol-default-epoch-inspect-row-8`           | GPT-5.6 Sol      | max         | `anthropic-releases:cursorbench-4:gpt56sol-max`      |
| `epoch-ai:gpqa-diamond:anthropic-claude-opus-5-default-epoch-inspect-row-117`                | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `epoch-ai:aime:anthropic-claude-opus-5-default-epoch-inspect-row-124`                        | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `epoch-ai:chess-puzzles:anthropic-claude-opus-5-default-epoch-inspect-row-137`               | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `zapier-automationbench:automationbench:claude-fable-5-1-with-opus-5-fallback-rank-14:1-0-6` | Claude Fable 5.1 | max         | `anthropic-releases:cursorbench-4:fable51-max`       |
| `zapier-automationbench:automationbench:gpt-5-6-sol-rank-99:1-0-6`                           | GPT-5.6 Sol      | max         | `anthropic-releases:cursorbench-4:gpt56sol-max`      |
| `vals-ai:corpfin:anthropic-claude-opus-5`                                                    | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `vals-ai:gpqa-diamond:anthropic-claude-opus-5`                                               | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `vals-ai:mortgage-tax:anthropic-claude-opus-5`                                               | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `vals-ai:swe-bench:anthropic-claude-opus-5`                                                  | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `vals-ai:tax-eval-v2:anthropic-claude-opus-5`                                                | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `vals-ai:vals-multimodal-index:anthropic-claude-opus-5`                                      | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |
| `vals-ai:vibe-code-bench:anthropic-claude-opus-5`                                            | Claude Opus 5    | max         | `anthropic-releases:cursorbench-4:opus5-max`         |

## 來源快照日期

- `anthropic-releases:2026-10-02T14:57:02.279Z`
- `arc-prize:2026-10-01T00:51:25.353Z`
- `artificial-analysis:2026-10-01T00:50:53.038Z`
- `deepswe:2026-10-01T00:51:23.896Z`
- `epoch-ai:2026-10-01T00:51:24.960Z`
- `frontier-code:2026-10-01T00:51:24.255Z`
- `frontier-swe:2026-10-01T03:28:35.622Z`
- `livebench:2026-10-01T00:51:23.601Z`
- `openai-releases:2026-10-02T14:56:49.000Z`
- `surge-chartography:2026-10-02T14:00:14.368Z`
- `vals-ai:2026-10-01T00:51:25.754Z`
- `zapier-automationbench:2026-10-01T00:51:25.318Z`

## 驗證

- 三個新擷取 artifact 的 SHA-256、byte length 與全部 evidence references 通過；36 筆 OpenAI、45 筆 Anthropic 均可由 artifact 重新解析。
- 固定 generatedAt 重建得到相同 ProductVersion 與 deterministic JSON；完整離線物化在隔離副本中得到相同 candidates 與 cross-checks。
- 在隔離副本注入一筆未審核 DeepSWE 差異後，聯合核對會在發布前失敗，93 個 data 檔案雜湊皆與執行前相符。機械驗證紀錄位於 `artifacts/vendor-review-2026-10-02/verification.json`、`offline-verification.json`。
- Format、lint、typecheck、production build 通過；Vitest 505 項、靜態伺服器整合測試 7 項通過。
- Playwright：58 passed、4 skipped；涵蓋桌面／手機來源連結、跨來源百分比比較、CursorBench、推理檔位、鍵盤、無障礙與版面。四項跳過來自現行資料缺少相應的動態檔位情境。
- pnpm audit --audit-level high：No known vulnerabilities found。
- 瀏覽器測試核對頁尾完整版本為 `sha256:6219563f6c6cbd0670715f849a7c3550a02e1691c1271dc298c9007e99a788d7`。

## 可視抽查

開啟來源，找到下列模型與圖表檔位，比對一個分數即可。Epoch 的精確原值位於官方下載包內的 CSV，該列也已完成程式核對。

| 網址                                                                       | 頁面位置／模型名稱                              | 欄位       | 期望值             |
| -------------------------------------------------------------------------- | ----------------------------------------------- | ---------- | ------------------ |
| [Epoch 官方下載](https://epoch.ai/data/benchmark_data.zip)                 | gpqa_diamond.csv；deepseek-v4-pro-0813_max      | mean_score | 0.9166666666666666 |
| [OpenAI 發布頁](https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/) | DeepSWE 1.1；GPT-6.1 Sol，高                    | score      | 75.22%             |
| [OpenAI 發布頁](https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/) | AutomationBench 1.0.6；GPT-6.1 Sol，Max         | score      | 36.1%              |
| [Anthropic 發布頁](https://www.anthropic.com/claude-opus-5-5)              | CursorBench 4.0；Opus 5.5，Max                  | Accuracy   | 57.8%              |
| [Anthropic 發布頁](https://www.anthropic.com/claude-opus-5-5)              | CursorBench 4.0；Fable 5.1，Max（推測依據之一） | Accuracy   | 51.8%              |
| [Cognition 官方榜單](https://cognition.com/frontiercode)                   | FrontierCode 1.1 Main；Claude Fable 5.1，Low    | Main       | 49.82%             |
