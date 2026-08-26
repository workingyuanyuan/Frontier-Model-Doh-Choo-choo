# 第二次重構任務計畫

> 權威規格：`docs/SPEC.md`
> 執行者：外部代理（Codex）

## 共同契約

**每個 task 開始前先讀**：`CLAUDE.md` → `docs/SPEC.md` → 本文件對應的 task。

**一次只做一個 task。** 每個 task 必須可獨立驗收。

**每個 task 完成即 commit，一個 task 一個 commit。** 這是不同 harness 之間唯一可靠的邊界：沒有 commit，就無法單獨回退某一個 task，也無法辨識某段變更由誰產生。

commit 的具體做法：

1. **用 `git add` 逐一列出本 task 改動的檔案。不要用 `git add -A`、`git add .` 或 `git commit -a`。**
2. **永遠不要 `git add data/product/current.json`。** 那個檔案需要使用者審核後明確指示才能提交（規格 §11.2）。它會一直以未追蹤狀態留在工作目錄，這是正常的，**不是**阻止你 commit 其他檔案的理由。
3. commit 前確認 `git status` 只剩 `current.json` 未進版。
4. commit 訊息開頭用 `<type>(<task id>):`，內文最後一行註明 `Executed by: <模型／harness>`。

**若某個 task 讓 repository 進入不可 build 或測試失敗的狀態，必須寫進該 task 的 `risks`，並在 commit 訊息中說明何時會被修復。** 不得因為「後面的 task 會修」而略過不提。

**凡是改動計分管線、mapping 或 schema 的 task，完成前必須重新產生產品資料：**

```bash
pnpm data:build-current
```

並在 `validation` 中回報新的 `versionId`、來源數與排行榜列數。**這一步不能省略。** 曾經發生過：B2 的來源白名單實作正確且有測試，但沒有人重新產生 `current.json`，於是磁碟上的產品資料仍帶著全部 13 個來源，而管線只讀 4 個。所有測試、typecheck、lint 與 build 在兩種狀態下都通過——**沒有任何自動化能抓到這種不一致**，只有重新產生後比對 `versionId` 才會發現。

**狀態欄位**：每個 task 標題下有一行 `狀態：`。開始動程式前先改成 `進行中`，完成並通過驗證後改成 `完成`。合法值只有 `未開始`／`進行中`／`完成`／`封鎖（原因）`。不要新增其他欄位或格式。

**每個 task 完成時回報**：`summary`、`changed_files`、`validation`、`risks`、`unresolved`。

**基準驗證**（每個 task 完成前都要跑）：

```bash
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
```

production build：

```bash
pnpm --filter @llm-bench/bench build
```

**全程禁止**：push、deploy、release、恢復 `docs/REFACTOR_DISCARD_LIST.md` 中的任何項目。

**commit `data/product/current.json` 需要使用者明確指示**（規格 §11.2）。程式碼變更的 commit 不受此限。

---

## 階段

A 到 N 已完成，紀錄在 [docs/history/PHASE_A_TO_N.md](../docs/history/PHASE_A_TO_N.md)。
本文件持有 **O 之後**的 task。

**所有審核關卡都由使用者人工執行，代理不得自行通過。**

---

# O. 維度集合改為五維（2026-08-24 使用者裁決）

> 權威依據：`docs/SPEC.md` §4.1、§4.6、**R18**、**R19**。

**這個階段會改動計分結果。** 每個 task 完成後都要重新產生 `current.json` 並回報
`versionId`、來源數、排行榜列數，依共同契約辦理；`current.json` 本身不得 commit。

**執行順序固定 O1 → O2 → O3 → O4 → O5。**

## O1 — mapping 與型別改為五維

狀態：完成

**目的**：把維度集合縮成五個，benchmark 的存在與其他欄位保持原狀。

**做法**：

1. `data/mappings/benchmarks.json`：`dimensions` 改為
   `["reasoning", "knowledge", "coding", "agentic", "language"]`；69 筆 benchmark 的
   `primaryDimension` 依 §4.1 對照：`math`／`context` → `reasoning`，
   `instruction` → `language`，其餘保持原值。
2. 同一批 benchmark 的 `secondaryDimensions` 套用同一組對照後去重，且不與
   `primaryDimension` 重複。
3. `packages/benchmark-data/src/index.ts` 的 `DIMENSION_IDS` 改為五個值。
4. `coverage-matrix.ts` 的維度 bitmask 長度取自 `DIMENSION_IDS.length`；
   確認沒有寫死 8 的位置。

**範圍限制**：benchmark 的新增、刪除、改名與跨維度歸屬調整不屬於本 task。
`cyber` 維持 `agentic`，`terminal-bench-2-1` 維持 `coding`。

**驗收**：

- `pnpm typecheck` 通過；測試中列舉維度的固定陣列改為五個值。
- 重跑 `pnpm data:build-current`，回報預設 preset 的可計分 profile 數，預期為 **35**。
  數字不符時停下回報，mapping 保持依 §4.1 對照的結果。

## O2 — preset 與取捨曲線以五維重新產生

狀態：完成

**目的**：完整性判定逐維度進行（R12），維度集合變動後所有 preset 的完整模型數都要重算。

**做法**：

1. 重跑 §5.3 的 coverage-matrix 報告，產生兩條曲線與逐 N 對照。
2. `display-set-v2` 的 schema 驗證改為「覆蓋全部 `DIMENSION_IDS`」（D-N10-3），
   維度數取自常數。
3. 重新產生 `docs/COVERAGE_MATRIX_REPORT.md`。

`maxModelCount` 維持 22，`defaultPresetId` 維持 `free-sources-13`。preset 的
benchmark 組成依 **R2** 由使用者挑選：若 `free-sources-13` 不在新曲線上，停下回報，
由使用者指定預設 preset。

**驗收**：報告中每個 preset 的維度覆蓋欄顯示 5/5；回報新的滑桿刻度序列、預設 preset 的
可計分 profile 數，以及前 22 名相對於現行榜單的名次變動（預期前三名不變、最大位移 ±2）。

## O3 — partial-coverage 清單（R19）

狀態：完成

**目的**：揭露「五缺一」的 profile。

**做法**：

1. 主排行榜的資格條件維持五維全非 null 才有 `overallScore` 與 `rank`，
   `scoreProfiles` 的閘門邏輯保持原狀。
2. 新增獨立區塊列出缺一維的 profile：顯示模型、缺少的維度、已有的各維度分數。
   該區塊不顯示總分、不顯示名次、不參與排序比較，放在開發者模式內（R20），預設不顯示。
3. 區塊附一句說明其與主榜的度量差異，依 R19 判準 3：缺一維的 profile 在其持有
   benchmark 上的平均 z 為 −0.188，完整者為 +0.114，且 31 個裡有 27 個缺的是 Language。

**驗收**：預設 preset 下該清單有 **31 筆**；e2e 驗證預設頁面不渲染該區塊，開啟開發者模式後
出現，且主榜列數不含這 31 筆。

## O4 — 介面與雷達圖改為五軸

狀態：完成

**做法**：雷達圖改為五軸（正五邊形）；排行榜維度欄、模型明細維度卡、開發者模式清單
一併改為五個維度。維度顯示名稱採 §4.1 的標籤。

軸的順序由 `DIMENSION_IDS` 驅動，元件內不另存一份順序（見 L7）。

**驗收**：`pnpm e2e` 全綠；截圖確認雷達圖為五軸。

## O5 — 文件同步與最終驗證

狀態：完成

**做法**：

1. `docs/SCORING_METHODOLOGY.md`：總分定義改為五維平均；納入 R18／R19。
2. `docs/BENCHMARK_DIMENSION_MAPPING.md`：對照表改為五維。
3. `docs/ARCHITECTURE.md`、`docs/BENCHMARK_SCORE_SOURCES.md`、`README.md` 中的維度數。

**範圍限制**：`docs/history/REFACTOR_SPEC.md` 與 `docs/history/DECISIONS.md` 屬考證文件，保持原狀。

**驗收**：跑完整基準驗證（`pnpm install --frozen-lockfile` → `format` → `lint` →
`typecheck` → `test` → `--filter @llm-bench/bench build` → `e2e`，順序不可調換）。

## ▣ 審核關卡 O（使用者執行）

狀態：未開始

O5 完成後暫停，由使用者審核以下四項後才決定是否 commit `current.json`：

1. 新榜單前 22 名與現行榜單的逐名對照。
2. 開發者模式中 partial-coverage 清單的 31 筆。
3. 五軸雷達圖的視覺。
4. 新的滑桿刻度與預設 preset。

---

# P. 前端資訊層級與品牌簡化

## P1 — Header、Leaderboard、成本圖與 Footer 優化

狀態：完成

**目的**：依使用者指定的文案與佈局簡化單頁 Dashboard，並修正寬螢幕下成本圖圖例高度。

**範圍**：`apps/bench` 的元件、樣式、metadata 與對應測試。不改動產品資料、mapping 或計分邏輯。

**驗收**：指定文案與區塊調整全部落地；header 呼吸燈支援 reduced motion；Leaderboard 控制項等高且順序正確；成本圖圖例在寬螢幕與圖表等高；完整基準驗證通過。

## P2 — 三主題切換與 Anthropic 風格淺色主題

狀態：完成

**目的**：在 Header 的開發者模式切換器左側新增圖示式三主題控制，提供淺色、黑暗與藍色主題；現行視覺歸為藍色主題，淺色主題依 `N:\Markdown\Desing\anthropic-DESIGN.md` 建立。

**範圍**：`apps/bench` 的主題狀態、Header 控制、設計 token、持久化與對應測試。不改動產品資料、mapping 或計分邏輯。

**驗收**：三個主題可由圖示控制並具可存取名稱；選擇會持久化且首屏不閃爍；各主題涵蓋完整 Dashboard、圖表與互動狀態；桌面與行動版視覺、鍵盤操作、reduced motion 與完整基準驗證通過。

## P3 — Claude 淺色、Kage 黑暗主題與區段標籤外移

狀態：完成

**目的**：淺色主題改依 `N:\Markdown\Design\claude-DESIGN.md`，黑暗主題改依 `N:\Markdown\Design\Kage-DESIGN.md`；將 Representative profiles、Capability profile、Price efficiency 移至各自 Section 正上方，建立清楚的區段節奏。

**範圍**：`apps/bench` 的淺色／黑暗主題 token、背景材質、排版、區段結構與對應測試。不改動藍色主題、產品資料、mapping 或計分邏輯。

**驗收**：兩套主題忠於指定參考稿且維持資料可讀性與可存取性；三個標籤均位於對應 Section 外並直接置於其上方；桌面與行動版區段間距清楚、無水平溢位；完整基準驗證通過。

---

# Q. Quality vs. Cost 進階互動

## Q1 — 動態來源與逐 effort 可見性控制

狀態：完成

**目的**：讓進階成本圖可依使用者啟用的來源即時重算資格與等權聚合，並讓模型層與 effort 層各自可控制可見性。

**做法**：

1. 進階模式與預設模式使用相同說明句：`Lower cost is better. Higher Overall Score is better.`。
2. 以 Artificial Analysis、DeepSWE、Frontier Code、ARC Prize 四個可切換按鈕取代固定權重說明；四個來源預設啟用。
3. 每個 profile 必須在目前啟用的每個來源都有可配對分數與成本才出點；聚合權重在啟用來源間等分。來源關閉後立即重算資格、座標與軸域。
4. 模型 checkbox 控制該模型目前合格的全部 effort；每個 effort 另有獨立按鈕。控制清單同時顯示完整 effort 母體與目前合格數，未通過目前來源交集的 effort 保持不可用。
5. 保留原生可聚焦控制、mixed checkbox 狀態、鍵盤操作、窄螢幕無溢位與動態空狀態。

**範圍**：`apps/bench` 的成本圖 view model、元件、樣式、測試，以及對應現行文件。不改動來源快照、mapping、ProductVersion schema 或 `data/product/current.json`。

**驗收**：四來源時 Claude Opus 5 顯示 2/5；關閉 ARC Prize 後顯示 5/5 且 low／medium／xhigh effort 回到圖中，三來源各 1/3 聚合。模型與單一 effort 均可由鍵盤開關；完整基準驗證依規定順序通過。

## Q2 — 成本圖開發者明細與等高模型圖例

狀態：完成

**目的**：讓成本圖的來源貢獻資料只在開發者模式顯示，並讓 Advanced 模式的模型圖例與圖表保持相同高度，不再由完整模型控制清單撐高 Section。

**範圍**：`apps/bench` 的 Dashboard 到 CostChart 開發者模式傳遞、Advanced 模型圖例分層、樣式與對應測試。不改動產品資料、mapping、計分或圖表座標算法。

**驗收**：預設模式不渲染 `Quality vs. Cost chart data and source contributions`，開發者模式才顯示；寬螢幕下 default 與 Advanced 圖例均和圖表列底部對齊；超出可見範圍的模型可透過可聚焦的下拉 disclosure 操作；行動版無水平溢位，完整基準驗證依規定順序通過。
