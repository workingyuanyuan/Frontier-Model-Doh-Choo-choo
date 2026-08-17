# 第二次重構任務計畫

> 狀態：規格已由使用者確認（2026-08-17），可開始執行
> 權威規格：`docs/REFACTOR_SPEC_V2.md`
> 執行者：外部代理（Codex）
> 本文件取代先前的 Gate 0 / Task 1–5 計畫。舊計畫的三個 scope gate 已由使用者回答完畢，答案寫在規格中。

## 共同契約

**每個 task 開始前先讀**：`CLAUDE.md` → `docs/REFACTOR_SPEC_V2.md` → 本文件對應的 task。

**一次只做一個 task。** 每個 task 必須可獨立驗收。

**每個 task 完成即 commit，一個 task 一個 commit。** commit 前先確認 `git status` 只剩本 task 的變更，且索引沒有殘留的部分 staged 檔案。這是不同 harness 之間唯一可靠的邊界：沒有 commit，就無法單獨回退某一個 task，也無法辨識某段變更由誰產生。commit 訊息開頭用 `<type>(<task id>):`，內文最後一行註明 `Executed by: <模型／harness>`。

**若某個 task 讓 repository 進入不可 build 或測試失敗的狀態，必須寫進該 task 的 `risks`，並在 commit 訊息中說明何時會被修復。** 不得因為「後面的 task 會修」而略過不提。

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

production build（B0 完成後不再需要 `LLM_BENCH_CHANNEL`，且在 B0 完成前預期失敗）：

```bash
pnpm --filter @llm-bench/bench build
```

**全程禁止**：push、deploy、release、恢復 `docs/REFACTOR_DISCARD_LIST.md` 中的任何項目。

**commit `data-v2/product/current.json` 需要使用者明確指示**（規格 §11.2）。程式碼變更的 commit 不受此限。

---

## 相依關係總覽

```
A 清理  ──┐
          ├──> B 資料契約 ──> C 擷取 ──> 審核關卡 1 ──┐
          │                                          ├──> D 計分與報告 ──> 審核關卡 2 ──> E 介面 ──> F 驗收
          └──────────────────────────────────────────┘
```

**兩個審核關卡都由使用者人工執行，代理不得自行通過。**

兩個順序陷阱：

1. **A1 之後 repository 不可 build。** A1 刪掉了 `data-v2/product/pointers/`，但把建置改讀 `current.json` 的是 B0。因此 **B0 必須是 Phase B 的第一個 task**，把不可 build 的窗口壓到最短。
2. **`display-set.json` 的內容不能提前決定。** 它要等 coverage-matrix 報告跑出來、使用者判讀後才能填。所以 B3 只建立設定檔的**機制與 schema**，內容在審核關卡 2 才填。

---

# A. 清理

低風險，與其他階段無相依，可最先做。

## A1 — 刪除舊產物

狀態：完成

**目標**：移除改版後讀不出來或已無作用的檔案。

**刪除**：

- `data-v2/product/versions/*.json`（21 個，14 MB）
- `data-v2/product/pointers/`（整個目錄，B0 會移除 pointer 機制）
- `packages/connectors`、`packages/contracts`、`packages/db`、`packages/presentation`、`packages/radar`、`packages/scoring`（Git 未追蹤，內容只有建置產物）

**不得刪除**：`data-v2/sources/` 底下任何目錄；倉庫外的 `codex-gemini-orchestrator` 工作目錄。

**完成條件**：`git status` 顯示的刪除範圍與上表完全一致；`pnpm-workspace.yaml` 的 glob 不會再撈到已刪除的 package；基準驗證通過（e2e 可能因缺少產品資料而失敗，此時記錄為預期失敗並在 C 階段結束後重跑）。

## A2 — 刪除已淘汰的擷取程式

狀態：完成

**目標**：移除期三才會用到的來源擷取程式碼。

**刪除**：

- `packages/acquisition/src/materializers.ts` 中的 `materializeVals`（約 406 行）
- `packages/acquisition/src/organizer-materializers.ts`（arc-prize、scale-hle、zapier、osworld、lech-writing，約 613 行）
- `packages/acquisition/src/materialize-organizers.ts`（約 733 行）
- 上述對應的測試、export、script、CI 步驟

**保留**：`materializeArtificialAnalysis`、`materializeEpoch`。

**完成條件**：全域搜尋 `vals`、`arc-prize`、`scale-hle`、`zapier`、`osworld`、`lech-writing` 在 `packages/` 與 `apps/` 下沒有現行程式碼引用（`data-v2/sources/` 的凍結資料不算）；`packages/acquisition` 的 export 面只剩保留項；基準驗證通過。

## A3 — 拆分 `materializers.ts`

狀態：完成

**目標**：`materializers.ts` 目前 1,929 行，按來源拆成獨立模組。

**要求**：每個來源一個模組，各自有測試。共用的工具（模型 catalog 載入、alias 解析、CSV 解析、slug 化）抽成獨立模組。

**禁止**：拆檔過程中改變任何資料、計分或發布語義。這是純結構調整。

**完成條件**：拆分前後產生的資料完全相同；每個模組有獨立測試；基準驗證通過。

## A4 — 文件同步（第一輪）

狀態：完成

**目標**：讓現行文件不再與規格矛盾。

**已完成（不需重做）**：`CLAUDE.md` 與 `docs/REFACTOR_DISCARD_LIST.md` 已於 2026-08-17 同步，包含權威順序、pointer 移除、版本檔刪除與本 task 狀態欄位格式。

**仍必須修正**：

- `docs/PROJECT_HANDOFF.md` §8「待使用者決定」→ 標記為已決定，指向 `docs/REFACTOR_SPEC_V2.md`
- `docs/PROJECT_HANDOFF.md` 中「有多個舊不可變 Draft 是正常審計歷史，不要為『整理』而刪除」→ 移除或改寫（規格 §8 已決定刪除）
- `docs/PROJECT_HANDOFF.md` §5 的數量、hash、branch 狀態 → 更新為實際狀態
- `docs/README.md` → 把 `REFACTOR_SPEC.md` 標為 Historical、`REFACTOR_SPEC_V2.md` 標為 Current／Binding

**完成條件**：搜尋文件集，沒有任何現行說明與規格衝突；`docs/README.md` 的 Current／Binding／Historical 分類正確。

---

# B. 資料契約

**執行順序：B0 → B1 → B2 → B3 → B4。** B0 必須最先做。

## B0 — 發布機制簡化（Phase B 第一個執行）

狀態：完成

**為什麼排在最前面**：A1 已刪除 `data-v2/product/pointers/`，`pnpm --filter @llm-bench/bench build` 目前失敗。本 task 完成前 repository 不可 build。

**目標**：實作規格 §11。移除三段式 Draft／Published／rollback 狀態機，改成單一當前版本。

**要求**：

- 建置只讀 `data-v2/product/current.json` 這一個固定路徑。
- **移除**：`data-v2/product/pointers/` 目錄、`LLM_BENCH_CHANNEL` 環境變數、DRAFT／PUBLISHED 雙軌、publish／rollback 指令與其狀態機、對應測試與 CI 步驟、以及 README／ARCHITECTURE／OPERATIONS 中描述這套流程的段落。
- **保留 `versionId`**（內容的 SHA-256），顯示在頁尾。
- `docs/OPERATIONS.md` 改寫成新流程，並明確寫出 **rollback = `git revert` 資料 commit 後重新部署**。不要做 rollback 指令。
- Draft／Preview 相關的 `noindex` 邏輯一併移除（不再有 Draft 這個狀態）。

**禁止**：不得保留任何「未來也許會用」的 channel 切換相容層。

**完成條件**：negative search 證明 `LLM_BENCH_CHANNEL`、`pointers`、`publish`、`rollback` 在程式、script、CI、測試與現行文件中都不存在；`pnpm --filter @llm-bench/bench build` 在沒有任何環境變數的情況下成功；頁尾顯示正確的 `versionId`。

## B1 — 出處記錄收斂

狀態：完成

**目標**：實作規格 §7。每筆分數的出處記錄從 8 組收斂成 1 組。

**新結構**：

```json
{
  "sourceUrl": "…",
  "locator": "…",
  "method": "EXPORT | API_RESPONSE | EMBEDDED_JSON | NEXT_RSC | DOM | VISUAL",
  "retrievedAt": "…",
  "evidenceId": "sha256:…"
}
```

**要求**：

- `evidenceId` 必須保留並繼續指向 `artifacts-v2` 的內容定址存檔。
- `schemaVersion` 升版。
- 舊版本檔已在 A1 刪除，因此**不需要**讀取相容層。不要寫向後相容程式碼。

**完成條件**：schema 測試覆蓋新結構；舊的欄位級出處結構在程式與型別中完全不存在；同一輸入仍產生 deterministic 的版本 hash。

## B2 — 來源白名單

狀態：完成

**目標**：實作規格 §3.2。建置流程只讀取白名單內的來源。

**要求**：

- 白名單以設定檔表示，不是硬編碼的條件判斷。
- 期一內容：`artificial-analysis`、`livebench`、`deepswe`、`frontier-code`。
- 凍結目錄存在但不在白名單時，建置必須完全忽略它們，且不得報錯。

**完成條件**：有一個測試證明「在 `data-v2/sources/` 放入一個不在白名單的目錄，建置結果不變」。

## B3 — 顯示清單機制

狀態：完成

**目標**：建立 `data-v2/mappings/display-set.json` 的 schema、載入與驗證機制。

**要求**：

- 內容是一組 benchmark ID。
- 建置流程只**驗證**（每個 ID 都存在於 `benchmarks.json`），不自動選擇內容。
- **本 task 只建立機制。實際內容在審核關卡 2 由使用者決定後填入。** 在那之前放一組暫定值即可，並在檔案中明確標註為暫定。

**完成條件**：載入與驗證有測試；驗證失敗時錯誤訊息明確指出哪個 benchmark ID 不存在。

## B4 — 模型資格條件

狀態：完成

**目標**：實作規格 §5.1。

**要求**：

- 資格 = 未 deprecated 且 `release_date` 在今天往前 12 個月內。
- 移除 `data-v2/mappings/frontier.json` 的 `compositeSources`。
- 保留 `manualModels`。
- 12 個月是設定值，不是硬編碼常數。

**完成條件**：邊界情況有測試（剛好 12 個月、缺 `release_date`、已 deprecated 但在窗內）；`frontier.json` 中不再有任何綜合指數的 Top-N 選模邏輯。

---

# C. 擷取

依風險由低到高執行。**每個 task 完成後保留該來源的 validation report**，供審核關卡 1 使用。

## C1 — LiveBench 擷取

狀態：未開始

**目標**：實作規格 §9.1。目前分數是手工維護的，改成自動擷取。

**要求**：

- 從 `main.<hash>.js` 讀出最新 release 與 cacheVersion，不要硬編碼日期。
- `table_*.csv` 的列數與 `categories_*.json` 的類別歸屬要做對照，數量不符時在 validation report 中明確記錄，不得靜默取值。
- `cost_*.csv` 的 token 單價與 `cost_per_successful_task` 分開保存為兩種成本語意。
- 只納入四個已核准類別。**LiveBench Coding、Agentic Coding、Data Analysis 不得納入。**

**完成條件**：以固定的 artifact 為輸入時輸出可重現；validation report 含母體列數、取得列數與差異說明。

## C2 — DeepSWE 擷取

狀態：未開始

**目標**：實作規格 §9.2。目前分數是手工維護的，改成自動擷取。

**要求**：

- 從 `leaderboard-live.json` 擷取全部 configuration 列，**保留每個模型的完整思考強度階梯**（進階圖需要）。
- `mean_cost_usd` 保存為 `AGENT_TASK` 成本，harness 留在出處記錄。

**完成條件**：擷取到的 configuration 數與模型數與來源宣告一致；思考強度階梯完整保留（不要在擷取階段就取最佳值，那是計分階段的事）。

## C3 — Artificial Analysis 擷取

狀態：未開始

**目標**：實作規格 §9.3。這是四個來源中最複雜的一個。

**要求**：

- **管道一**：解析 `/evaluations/<slug>` 與 `/models`、`/models/<slug>` 的 RSC payload。
- **`"$undefined"` 是空值哨符，是字串不是 null。** 判斷欄位有無資料時必須同時排除 `null` 與 `"$undefined"`。這一點必須有專門的測試。
- **開工第一件事**：確認要組合哪幾個頁面，才能取得完整的現役模型集**以及**這些模型的任務成本 `intelligenceIndexCostPerTask`。實測顯示 `/evaluations/omniscience` 的成本欄位只有舊模型有值。這是本 task 的第一個產出，寫進 validation report。
- **管道二**：API 交叉驗證。金鑰讀自環境變數 `ARTIFICIAL_ANALYSIS_API_KEY`，寫在 gitignored 的 `.env.local`。**金鑰絕不進入 Git、artifact 或 ProductVersion。**
- 兩管道的重疊欄位逐列比對，差異寫進 validation report。母體不同，只在交集上比對。
- 金鑰失效時視為 warning 而非 error，管道一仍可單獨進行。
- token 單價（`pricing.price_1m_*`）保存為 `API_STANDARDIZED`；`intelligenceIndexCostPerTask` 保存為 `MEASURED_TASK`。**兩者不可混用。**

**完成條件**：交叉驗證機制有測試（含「兩管道值不一致」的情況）；`.env.local` 在 `.gitignore` 中；全域搜尋金鑰字串在版控內容中無命中。

## C4 — Frontier Code 擷取（新建，風險最高）

狀態：未開始

**目標**：實作規格 §9.4。

**要求**：

- 建立新來源 `frontier-code`，沿用既有的 `frontierswe` benchmark 定義，**不要新增 benchmark 定義**。
- 先確認可取得的資料範圍：完整榜有多少列、是否含成本、是否含思考強度變體。**這是本 task 的第一個產出。**
- JSON-LD 的 `ItemList` 只有 Top 10 分數，作為對照基準；完整資料需解析 RSC payload 或 Sanity 端點。
- 必須有 DOM 或人工視覺對照作為驗證手段。

**若確認取不到成本或思考強度**：如實記錄在 validation report 與規格 §12，進階圖依規格 §6.3 退化為 Artificial Analysis + DeepSWE 兩來源。**這是可接受的結果，不要為了湊齊三來源而推測或填補資料。**

**完成條件**：可取得的資料範圍有明確結論並寫入文件；取得的分數與 JSON-LD 的 Top 10 對照一致。

---

## ▣ 審核關卡 1（使用者執行）

C 階段完成後產生第一個新格式的 `data-v2/product/current.json`（**寫入工作目錄，不 commit**），交由使用者人工審核資料正確性。審核通過並由使用者明確指示後，代理才 commit。

**代理要準備的東西**：

- 四個來源各自的 validation report
- 每一筆分數可點到來源網址與頁面位置（供使用者比對）
- 規格 §12 第 4 項的待查異常（Claude Opus 4.6 max 53.7 vs high 81.1）的現況說明

**使用者未通過審核前，不得進入 D 階段。**

---

# D. 計分與報告

## D1 — 代表 profile 選法改為最佳表現

狀態：未開始

**目標**：實作規格 §4.3。

**要求**：

- 同一模型多個思考強度時，取該來源測出分數最高者。不判斷 effort 標籤。
- 排行榜、雷達圖、兩張圖表使用同一個選法。
- 移除舊的「Coverage 高 → 有效結果數多 → Overall 高」規則。

**完成條件**：有測試證明四個畫面對同一模型選出同一個 profile；舊規則在程式與文件中完全不存在。

## D2 — 完整矩陣門檻

狀態：未開始

**目標**：實作規格 §5.2。這是本次重構影響面最大的一項。

**要求**：

- 模型必須在 `display-set.json` 的每一項上都有分數，才進主畫面。
- 缺任何一項 → 進開發者模式。
- 主畫面不得出現 N/A。
- **移除**：Coverage 比例、`ESTIMATED` 狀態、「至少一維有分數就顯示」、「Developer mode 放寬到 1–7/8」。這些散在約 100 處（`view-model.ts`、`leaderboard.tsx`、`table-sort.ts`、`dashboard.tsx`、`globals.css`）。
- 移除必須涵蓋程式、schema、測試、fixture、文件，**不能只從畫面隱藏**。

**完成條件**：negative search 證明 `coverage`、`ESTIMATED` 相關契約已不存在；主畫面在任何資料狀態下都不出現 N/A 的測試。

## D3 — coverage-matrix 報告指令

狀態：未開始

**目標**：實作規格 §5.3。

**要求**：

- 輸出模型 × benchmark 的有無矩陣。
- 輸出取捨曲線：每個「保留 N 個 benchmark」規模下，能讓最多模型完整的組合、完整模型數、涵蓋維度數。
- 演算法用 bitmask 窮舉子集；模型的有無壓成 bitmask 後先去重計數。
- **必須套用與 B4 完全相同的資格條件。** 這一點要有測試：在含過期模型與已停跑 benchmark 的資料上執行，報告不得推薦它們。

**為什麼這條測試重要**：在全體資料上做最佳化，會產生一組看起來很漂亮（103 列、8/8 維度）但**一個 2026 年模型都沒有、63 個已 deprecated** 的答案。這是靜默失效。

**完成條件**：報告可執行並輸出上述兩份內容；資格條件過濾有專門測試。

---

## ▣ 審核關卡 2（使用者執行）

使用者判讀 coverage-matrix 報告，決定 `display-set.json` 的實際內容。

**代理要準備的東西**：報告輸出、以及每個候選組合對應的模型名單。

**使用者填定 `display-set.json` 前，不得進入 E 階段。**

---

# E. 介面

## E1 — 模型明細面板

狀態：未開始

**目標**：實作規格 §6.2。

**要求**：

- 點擊排行榜的模型列，展開該模型的詳細資料，按維度列出組成該維度的每一筆 benchmark 分數（含來源名稱）。
- **同一個元件同時服務排行榜與開發者模式**。從開發者模式進來時，缺的格子顯示為空。不要做兩個元件。
- 每一格可點開看出處：來源網址（可點）、`rawScore`、`locator`、`retrievedAt`。
- 移除 `evidence-detail.tsx`（282 行）的獨立 Evidence 區塊。

**完成條件**：兩種進入路徑共用同一元件的測試；`evidence-detail.tsx` 已刪除且無殘留引用。

## E2 — 排行榜與雷達圖

狀態：未開始

**目標**：配合 D1／D2 的規則調整，並拆分過度集中的檔案。

**要求**：

- 排行榜保留排序、搜尋、思考強度選擇。
- **雷達圖上不得加任何 benchmark 數量標記。**
- 雷達圖不得把缺值畫成 0（主畫面雖無缺值，開發者模式仍可能有）。
- `leaderboard.tsx`（509 行）與 `globals.css`（1,875 行）在本階段拆分。拆分不得改變任何語義。

**完成條件**：桌面與 390px 行動裝置無水平溢出；鍵盤焦點與 axe 檢查通過。

## E3 — 兩張性價比圖表

狀態：未開始

**目標**：實作規格 §6.3。

**要求**：

- **預設圖**：四來源加權，每個模型每個來源取最佳表現那一筆。
- **進階圖**：按鈕開啟，顯示各模型多種思考強度的曲線，**同一模型的各強度點要連成線**。只用 Artificial Analysis、DeepSWE、Frontier Code。缺任一來源資料的模型不顯示。
- **Artificial Analysis 的 token 單價不得進入成本圖。** 進成本圖的是 `intelligenceIndexCostPerTask`。
- 若 C4 確認 Frontier Code 取不到成本或思考強度，進階圖退化為兩來源，並在畫面上說明退化原因。

**完成條件**：有測試證明 `API_STANDARDIZED` 成本不會進入任何一張成本圖；進階圖的「缺任一來源即不顯示」有測試。

## E4 — 開發者模式

狀態：未開始

**目標**：實作規格 §5.4。

**要求**：

- 顯示被排除模型的模型 × benchmark 矩陣，每格顯示原始 normalized 分數。
- **不做任何加總**：不算維度分數、不算總分。
- 沿用 E1 的明細面板元件。

**完成條件**：有測試證明開發者模式不會產生任何聚合數值。

---

# F. 驗收

## F1 — 文件最終同步

狀態：未開始

**要求**：

- `README.md`、`CLAUDE.md`、`docs/README.md`、`docs/ARCHITECTURE.md`、`docs/DATA_METHODOLOGY.md`、`docs/SCORING_METHODOLOGY.md`、`docs/OPERATIONS.md` 只描述一套現行流程。
- `docs/SCORING_METHODOLOGY.md` 的 Coverage、Representative Profile、ESTIMATED 章節依 D1／D2 改寫。
- `docs/DATA_METHODOLOGY.md` 的來源清單、成本規則、出處結構依規格改寫。
- `docs/REFACTOR_DISCARD_LIST.md` 至少維持原有負面範圍，並追加本次刪除的項目。
- 搜尋沒有會讓接手者誤以為舊架構仍受支援的現行操作說明。

## F2 — 最終驗收

狀態：未開始

**要求**：

- 乾淨 checkout 下完整跑一次基準驗證與 production build（不需任何環境變數）。
- 檢查 Git branch／worktree 狀態、`git diff --check`、package graph、legacy negative search。
- 確認沒有未經使用者指示的 `current.json` commit，也沒有 push、deploy 或其他外部狀態改變。
- 所有保留功能有 unit／browser／build 證據；所有移除功能在程式、資料、依賴、script、CI、測試、文件都沒有半殘狀態。

**最終回報必須明確列出**仍需使用者人工處理的項目：`current.json` 的審核與 commit 指示、首次部署、倉庫外 `codex-gemini-orchestrator` 舊工作目錄的處置、Artificial Analysis 金鑰輪換。
