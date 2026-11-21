# 2026-11-21 資料刷新報告：代表 profile 改依 benchmark 數，新增測試覆蓋最佳化集合

完整 release 通過，但這次是**計分口徑改變造成的明顯重排，停在審核階段**，等使用者確認後才提交與部署。來源快照沒有任何變更；所有差異都來自使用者 2026-11-21 裁決的兩條新規則：

1. **代表 profile 改依 benchmark 數**：每個前沿模型在合格 effort 中，取持有可計分 benchmark 最多者（同數依序比組織數、AA 分數、profile ID）。每次建置都會重算，現有與日後新增的模型都適用。本次只有 Gemini 4 Neon 改變：`xhigh`（13 項）→ `high`（16 項）。
2. **新增測試覆蓋最佳化集合 `coverage-2`～`coverage-10`**：從同一個前沿窗口（10 個模型）中，為每個 N 挑出共同合格測試最多的 N 個模型。排行榜可以在 Frontier 與 Coverage 之間切換。

預設集合 `aa-top-9` 的共同測試由 **9 項增為 14 項**，模型不變；有效維度由 5 個增為 6 個。新增的測試主要是 Surge 的 DayJob 系列，各模型在這些測試的成績偏低，因此 Overall 普遍下降 4.6～7.7 分，前五名中有兩組相鄰名次互換。判斷依據見「重大變更判斷」。

## 版本與來源基準

- 起始 commit：`d6cf092773cc8b2965b566d7cc8dff596f417cbe`（main），於分支 `feat/coverage-presets-representative-profile` 進行。
- 舊版本：`sha256:0d063bf6f5bd0763ab8fde45765dc96f5680b6eb4c963613c482f0c6bc46da35`
- 新版本：`sha256:33be42322e75773597c19754201a36e463c8701cb79b561835b172b1616b104b`
- Release `2026-11-21T05-03-49-592Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-21-coverage-presets-receipt.json)
- 前兩次 release 失敗，修正後重跑：
  - `04-53-28`：release 報告的單元測試仍預期舊表格格式。
  - `04-57-13`：e2e 有 7 項手機版失敗。新增的 Frontier／Coverage 切換鈕讓手機畫面的工具列超出螢幕寬度，頁面因此被縮放，點擊座標錯位。改為讓切換鈕與拉桿分兩行排列。
- 來源快照：無新增、無移除。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| frontier |    10 |    10 |    0 |
| profiles |   296 |   296 |    0 |
| evidence | 11035 | 11035 |    0 |
| costs    |  1088 |  1088 |    0 |
| presets  |     9 |    18 |   +9 |

## 規則一：代表 profile 改依 benchmark 數

benchmark 數的算法與集合交集一致：跨來源選取現行結果後，每個 benchmark 只算一次；AA 的子測試照算，AA Intelligence Index 本身不算；受限測試照算；`comparisonOnly`、被品質政策排除與未分類的測試不算。「至少 2 個獨立組織」的資格條件不變。

| 窗口 # | 模型              | 代表 profile（舊 → 新） | 各合格 effort 的 benchmark 數／組織數             |
| -----: | ----------------- | ----------------------- | ------------------------------------------------- |
|      1 | Claude Fable 5.2  | max                     | max 27/8、xhigh 18/4、high 16/5、medium／low 11/3 |
|      2 | GPT-6.2 Astra     | max                     | max 35/10、high 10/5、其餘 9/4                    |
|      3 | Gemini 4 Neon     | **xhigh → high**        | **high 16/4**、xhigh 13/4、medium／low 9/2        |
|      4 | Gemini 4 Carbon   | high                    | high 38/11、medium 9/3、low 8/3                   |
|      5 | Claude Opus 5.5   | max                     | max 51/11、high／xhigh 15、medium／low 13         |
|      6 | GPT-6.2 Sol       | max                     | max 31/9、high 10/5、其餘 9/4                     |
|      7 | GPT-6 Astra       | max                     | max 51/11、xhigh／high 21/7、medium 20、low 19    |
|      8 | GPT-6.1 Sol       | max                     | max 49/8、xhigh 16/3、low 15、high／medium 14     |
|      9 | Claude Sonnet 5.5 | max                     | max 48/9、high／xhigh 15、medium／low 13          |
|     10 | Gemini 4 Hydrogen | xhigh                   | xhigh 29/6、high 10/5、medium／low 8/3            |

舊規則下，Neon 的 high 與 xhigh 都是 4 個組織，平手時依 AA 分數取 xhigh。Surge 只以「High reasoning」測 Neon，所以 xhigh 一直缺少 Surge 的 7 項測試。Neon 的 AA 名次仍依 AA 勝出的 xhigh（61.4）計算，維持窗口第 3。

## 規則二：測試覆蓋最佳化集合

| 模型數 | `aa-top-N`（前 → 後） | `coverage-N` | coverage 選出的模型（窗口 #）              |
| -----: | --------------------: | -----------: | ------------------------------------------ |
|      2 |               24 → 24 |           48 | Opus 5.5 (5)、Sonnet 5.5 (9)               |
|      3 |               10 → 15 |           46 | Opus 5.5、GPT-6.1 Sol (8)、Sonnet 5.5      |
|      4 |               10 → 15 |           44 | 上列 + GPT-6 Astra (7)                     |
|      5 |               10 → 15 |           33 | 上列 + Gemini 4 Carbon (4)                 |
|      6 |                9 → 15 |           31 | 上列 + GPT-6.2 Astra (2)                   |
|      7 |                9 → 15 |           27 | 上列 + GPT-6.2 Sol (6)                     |
|      8 |                9 → 14 |           23 | 上列 + Gemini 4 Hydrogen (10)；不含 #1、#3 |
|      9 |        9 → 14（預設） |           14 | 與 `aa-top-9` 相同                         |
|     10 |                7 → 12 |           12 | 與 `aa-top-10` 相同                        |

`coverage-2`～`coverage-8` 都排除 Claude Fable 5.2（#1）與 Gemini 4 Neon（#3）。它們的代表 profile 都缺少 LiveBench 的 7 項與 Vals 的 3 項（`hlab`、`legal-research`、`vibe-code-bench`）。Neon 三天前才發布，Epoch、ARC、SWE Atlas 也還沒有它的成績。畫面與每個 agent 頁面都會列出被排除的模型及窗口名次；與前沿集合相同的 N（9、10）會標示「Same models as the AA frontier set」。

## 主畫面（預設集合 `aa-top-9`）的變化

- **模型**：沒有新進或退出，Neon 的 profile 改為 high。
- **benchmark**：
  - 新增 7 項：`complex-constraints`（Language）、`dayjob-finance`、`dayjob-healthcare`、`dayjob-law`、`dayjob-tax`（Agentic）、`gdp-xlsx`（Comprehension）、`riemann-bench`（Reasoning），全部來自 Surge。
  - 移除 2 項：`critpt-v2`、`terminal-bench-4-1`。Neon high 沒有這兩項成績（CritPt v2 只有 xhigh／low／medium；Terminal-Bench 4.1 只列 Neon 一筆，歸在 xhigh）。
- **有效維度**：5 → 6，新增 Language。Agentic 由 4 項增為 7 項，Comprehension 由 1 項增為 2 項。

| 模型              |  名次 |       Overall | Reasoning   | Knowledge   | Comprehension | Coding      | Agentic     | Language |
| ----------------- | ----: | ------------: | ----------- | ----------- | ------------- | ----------- | ----------- | -------- |
| Claude Fable 5.2  | 1 → 1 | 63.77 → 56.03 | 86.3 → 83.2 | 79.7 → 79.7 | 24.2 → 28.5   | 48.2 → 48.2 | 64.2 → 46.0 | — → 64.5 |
| Gemini 4 Neon     | 3 → 2 | 58.11 → 55.27 | 77.4 → 84.0 | 65.9 → 63.9 | 28.0 → 38.2   | 44.8 → 46.2 | 62.4 → 45.0 | — → 72.9 |
| GPT-6.2 Astra     | 2 → 3 | 60.62 → 53.51 | 83.7 → 76.0 | 70.4 → 70.4 | 29.8 → 29.8   | 44.2 → 44.2 | 62.9 → 45.8 | — → 69.6 |
| Claude Opus 5.5   | 5 → 4 | 57.56 → 51.50 | 81.7 → 80.0 | 66.7 → 66.7 | 26.2 → 28.2   | 47.3 → 47.3 | 57.1 → 40.9 | — → 64.4 |
| Gemini 4 Carbon   | 4 → 5 | 57.60 → 51.32 | 82.3 → 80.0 | 63.7 → 63.7 | 28.4 → 33.6   | 42.6 → 42.6 | 61.3 → 36.9 | — → 70.9 |
| GPT-6 Astra       | 6 → 6 | 56.01 → 50.12 | 83.1 → 81.6 | 62.7 → 62.7 | 31.0 → 26.9   | 44.0 → 44.0 | 54.3 → 37.7 | — → 70.8 |
| GPT-6.2 Sol       | 7 → 7 | 55.64 → 49.15 | 78.6 → 80.0 | 62.8 → 62.8 | 30.0 → 26.1   | 43.8 → 43.8 | 55.7 → 35.6 | — → 69.5 |
| GPT-6.1 Sol       | 8 → 8 | 54.18 → 48.04 | 82.6 → 79.2 | 60.3 → 60.3 | 31.0 → 26.5   | 39.6 → 39.6 | 52.7 → 34.9 | — → 70.1 |
| Claude Sonnet 5.5 | 9 → 9 | 51.73 → 47.17 | 75.7 → 76.8 | 52.4 → 52.4 | 25.8 → 27.5   | 42.2 → 42.2 | 56.8 → 39.3 | — → 67.2 |

- **Agentic 普遍下降 15～25 分**：新加入的四項 DayJob 成績偏低。這是 Overall 下降的主因。
- **Neon 的 Knowledge、Coding 變動**：Neon 改用 high profile，所以 AA 子測試與 Frontier Code 也改用 high 的成績。
- **名次互換**：Neon 與 GPT-6.2 Astra 互換第 2、3 名；Opus 5.5 與 Carbon 互換第 4、5 名（新分差 0.18）。第 1 名與第 6～9 名不變。

其他前沿集合的完整逐模型對照見 release 的 [report.md](../../artifacts/releases/2026-11-21T05-03-49-592Z/report.md)（`artifacts/` 不進版控，摘要如下）：

- `aa-top-3`～`aa-top-7`：Neon 與 GPT-6.2 Astra 互換第 2、3 名；從 `aa-top-5` 起，Opus 與 Carbon 也互換第 4、5 名。
- `aa-top-10`：前 8 名與預設相同；Hydrogen 與 Sonnet 5.5 互換第 9、10 名。
- `aa-top-2`：完全不變。

## 檔位推測揭露

本次沒有新增檔位推測。進入預設集合的推測沿用既有一筆：

| 模型              | Benchmark         | 來源                     | Effort | 依據                                                                             |
| ----------------- | ----------------- | ------------------------ | ------ | -------------------------------------------------------------------------------- |
| Claude Sonnet 5.5 | `automationbench` | `zapier-automationbench` | max    | `anthropic-releases`：`anthropic-releases:sonnet-5-5:cursorbench-4:sonnet55-max` |

Neon 的 7 項 Surge 成績不是推測：Surge 榜單明確標示「Gemini 4 Neon (High reasoning)」。

## 程式與測試

- **計分與建置**：`generate-frontier-set.ts` 新增 `scoringEligibleBenchmarksByProfile` 與 `createCoverageCohorts`。preset 以 `family`（`aa-frontier`／`coverage`）取代不再使用的 `requireAllSources`，產品 schema 升為 `product-version-v5`。
- **介面**：
  - 拉桿旁新增 Frontier／Coverage 切換。切換時保留模型數，沒有相同模型數時取最接近者。
  - 排行榜標題下有一句說明，列出被排除的窗口模型。
- **agent 頁面**（Markdown、JSON、HTML）：
  - 每個 preset 頁寫明集合、選法、被排除的模型與同模型數的對應集合，表格新增 `Frontier #` 欄。
  - `llms.txt` 與 methodology 說明兩組集合。
  - JSON schema 升為 `preset-leaderboard-v2`、`data-index-v2`。
- **測試**：只用合成 fixture，沒有寫死當期資料。
  - 代表 profile：依 benchmark 數選擇、平手規則、日後自動切換。
  - coverage 選法：最多測試、依名次與維度數打破平手、N = 10 與前沿集合相同。
  - 切換鈕的目標選擇與範圍說明句；e2e 涵蓋切換、網址與拉桿。
- **審查**：設計先經 Astra、Neon、Fable 三位顧問審閱；兩項分歧（覆蓋集合提供 2～10、不設維度硬限制）由使用者決定。程式由 GPT-6.2 Sol 審查，修正了：
  - e2e 欄位位移
  - 切換鈕對比不足
  - 靜態頁缺少選法與對應集合
  - 「最高分 effort」的舊敘述
- **未處理的既有風險**：Sol 指出前沿選取與產品計分對同分來源列的排序方式不同，極端情況下可能對同一 benchmark 選到不同列。這是本次之前就存在的行為，本次未改。

## 代理抽查

抽查由未參與實作的 GPT-6.2 Sol 執行（2026-11-21）。A～D 全部相符；E 因抽查代理的沙箱無法啟動瀏覽器，改由實作代理以 Playwright 執行並記錄。

**比對基準**：release 的 `baseline/` 是第二次（失敗）release 留下的工作目錄，已含本次變更。抽查改以 receipt 記錄的 commit `d6cf092` 的產品為舊版，其 `versionId` 與 receipt 的舊版本一致。兩版的來源快照 ID、11,035 筆 evidence 與 `comparisonEvidenceIds` 完全相同。

### A. 新進預設集合的 Surge 成績

Neon high 與對照的 Claude Fable 5.2 max，各 7 筆。每筆比對四處：產品 `rawScore`、`candidates.json`、保存的 HTML 列，以及公開榜單（2026-11-21 查看）。14 筆全部相符。Neon 的 7 列在保存頁與公開頁都標示「Gemini 4 Neon (High reasoning)」，Fable 的 7 列標示「Claude Fable 5.2 (Adaptive/Max)」。

| 網址                                                                     | 頁面上的模型名稱                                                | 欄位  | 期望值（Neon／Fable） | 觀察值（Neon／Fable） | 結果 |
| ------------------------------------------------------------------------ | --------------------------------------------------------------- | ----- | --------------------- | --------------------- | ---- |
| [complex-constraints](https://surgehq.ai/benchmarks/complex-constraints) | Gemini 4 Neon (High reasoning)／Claude Fable 5.2 (Adaptive/Max) | Score | 72.9／64.5            | 72.9／64.5            | 相符 |
| [dayjob-finance](https://surgehq.ai/benchmarks/dayjob-finance)           | 同上                                                            | Score | 50.5／43.7            | 50.5／43.7            | 相符 |
| [dayjob-healthcare](https://surgehq.ai/benchmarks/dayjob-healthcare)     | 同上                                                            | Score | 47.2／45              | 47.2／45              | 相符 |
| [dayjob-law](https://surgehq.ai/benchmarks/dayjob-law)                   | 同上                                                            | Score | 26.2／26.5            | 26.2／26.5            | 相符 |
| [dayjob-tax](https://surgehq.ai/benchmarks/dayjob-tax)                   | 同上                                                            | Score | 12.8／15.6            | 12.8／15.6            | 相符 |
| [gdp-xlsx](https://surgehq.ai/benchmarks/gdp-xlsx)                       | 同上                                                            | Score | 43.1／32.9            | 43.1／32.9            | 相符 |
| [riemann-bench](https://surgehq.ai/benchmarks/riemann-bench)             | 同上                                                            | Score | 84／83.2              | 84／83.2              | 相符 |

七個保存 artifact 的 SHA-256 與 evidence-index 及產品 provenance 一致。

### B. 代表 profile

抽查代理以自己的腳本重算 10 個窗口模型全部 46 個合格 effort 的 benchmark 數、組織數與 AA 分數，再依規則排序。97 項比對沒有任何不符，10 個代表 profile 全部相符。與舊版相比，唯一的改變是 Neon：high 有 16 項 benchmark、4 個組織；xhigh 有 13 項、4 個組織。

### C. 測試覆蓋最佳化集合

窮舉 N = 2～10 的 1,013 個組合，套用品質政策後排序。九個 `coverage-N` 的模型組合、benchmark 數與有效維度數全部相符；`coverage-10` 與 `aa-top-10` 的模型、benchmark 與排行列完全相同；每個 N 的 coverage 測試數都不少於 `aa-top-N`。

### D. 預設集合 `aa-top-9`

14 項 benchmark 都由 9 個代表 profile 持有 INCLUDED、非 null 的現行成績。重算的交集與儲存值相同。兩列 Overall 重算結果與儲存值一致到小數第 12 位：Fable 5.2 max 56.029761086565、Neon high 55.269082663368。重放兩個版本的九個前沿集合，模型、benchmark、分數、名次與 evidence 引用全部重現。

### E. 介面（桌面 1440×900 與 Pixel 7）

| 操作          | 預期                                                                                      | 觀察（兩種尺寸相同） | 結果 |
| ------------- | ----------------------------------------------------------------------------------------- | -------------------- | ---- |
| 開啟首頁      | `aa-top-9`，9 列，說明句為 AA frontier                                                    | `/`，N = 9，9 列     | 相符 |
| 切到 Coverage | 保留 N，網址 `?preset=coverage-9`，說明句列出未納入的 Hydrogen (#10) 並標示與前沿集合相同 | 相同                 | 相符 |
| 拉桿到 8      | `?preset=coverage-8`，8 列，未納入 Fable 5.2 (#1)、Neon (#3)                              | 相同                 | 相符 |
| 切回 Frontier | 保留 N，`?preset=aa-top-8`                                                                | 相同                 | 相符 |
| 水平溢出      | 頁面寬度不超過視窗                                                                        | 四個步驟皆為 0       | 相符 |

Release 的 e2e 另有 142 項通過，包含兩種尺寸的切換與網址測試。

## 重大變更判斷

**有重大變更，停在審核階段。** 依據：

- **計分口徑改變**：代表 profile 的選法與預設集合的 benchmark 組成改變。預設集合由 9 項增為 14 項，並新增 Language 維度。
- **既有模型明顯重排**：前五名中兩組相鄰名次互換，九個模型的 Overall 都下降 4.6～7.7 分。原因可完整追溯到上述兩條規則，沒有無法解釋的變化。
- **新集合**：新增 9 個 coverage 集合，是使用者指示的功能，網站預設仍是前沿集合 `aa-top-9`。

需要使用者決定的事項：是否接受上述重排與分數變化，並提交、推送、部署。
