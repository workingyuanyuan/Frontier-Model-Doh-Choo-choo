# 第二次重構任務計畫

> 狀態：規格已由使用者確認（2026-08-17），可開始執行
> 權威規格：`docs/REFACTOR_SPEC_V2.md`
> 執行者：外部代理（Codex）
> 本文件取代先前的 Gate 0 / Task 1–5 計畫。舊計畫的三個 scope gate 已由使用者回答完畢，答案寫在規格中。

## 共同契約

**每個 task 開始前先讀**：`CLAUDE.md` → `docs/REFACTOR_SPEC_V2.md` → 本文件對應的 task。

**一次只做一個 task。** 每個 task 必須可獨立驗收。

**每個 task 完成即 commit，一個 task 一個 commit。** 這是不同 harness 之間唯一可靠的邊界：沒有 commit，就無法單獨回退某一個 task，也無法辨識某段變更由誰產生。

commit 的具體做法：

1. **用 `git add` 逐一列出本 task 改動的檔案。不要用 `git add -A`、`git add .` 或 `git commit -a`。**
2. **永遠不要 `git add data-v2/product/current.json`。** 那個檔案需要使用者審核後明確指示才能提交（規格 §11.2）。它會一直以未追蹤狀態留在工作目錄，這是正常的，**不是**阻止你 commit 其他檔案的理由。
3. commit 前確認 `git status` 只剩 `current.json` 未進版。
4. commit 訊息開頭用 `<type>(<task id>):`，內文最後一行註明 `Executed by: <模型／harness>`。

**若某個 task 讓 repository 進入不可 build 或測試失敗的狀態，必須寫進該 task 的 `risks`，並在 commit 訊息中說明何時會被修復。** 不得因為「後面的 task 會修」而略過不提。

**凡是改動計分管線、mapping 或 schema 的 task，完成前必須重新產生產品資料：**

```bash
pnpm data:v2:build-current
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
          ├──> B 資料契約 ──> C 擷取 ──> C5／C6 補正 ──> 審核關卡 1 ──┐
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

狀態：完成

**目標**：實作規格 §9.1。目前分數是手工維護的，改成自動擷取。

**要求**：

- 從 `main.<hash>.js` 讀出最新 release 與 cacheVersion，不要硬編碼日期。
- `table_*.csv` 的列數與 `categories_*.json` 的類別歸屬要做對照，數量不符時在 validation report 中明確記錄，不得靜默取值。
- `cost_*.csv` 的 token 單價與 `cost_per_successful_task` 分開保存為兩種成本語意。
- 只納入四個已核准類別。**LiveBench Coding、Agentic Coding、Data Analysis 不得納入。**

**完成條件**：以固定的 artifact 為輸入時輸出可重現；validation report 含母體列數、取得列數與差異說明。

## C2 — DeepSWE 擷取

狀態：完成

**目標**：實作規格 §9.2。目前分數是手工維護的，改成自動擷取。

**要求**：

- 從 `leaderboard-live.json` 擷取全部 configuration 列，**保留每個模型的完整思考強度階梯**（進階圖需要）。
- `mean_cost_usd` 保存為 `AGENT_TASK` 成本，harness 留在出處記錄。

**完成條件**：擷取到的 configuration 數與模型數與來源宣告一致；思考強度階梯完整保留（不要在擷取階段就取最佳值，那是計分階段的事）。

## C3 — Artificial Analysis 擷取

狀態：完成

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

## C4 — Frontier Code 擷取（新建）

狀態：完成

**目標**：實作規格 §9.4。

**要求**：

- 建立新來源 `frontier-code`，沿用既有的 `frontierswe` benchmark 定義，**不要新增 benchmark 定義**。
- 先確認可取得的資料範圍：完整榜有多少列、是否含成本、是否含思考強度變體。**這是本 task 的第一個產出。**
- JSON-LD 的 `ItemList` 只有 Top 10 分數，作為對照基準；完整資料需解析 RSC payload 或 Sanity 端點。
- 必須有 DOM 或人工視覺對照作為驗證手段。

**若確認取不到成本或思考強度**：如實記錄在 validation report 與規格 §12，進階圖依規格 §6.3 退化為 Artificial Analysis + DeepSWE 兩來源。**這是可接受的結果，不要為了湊齊三來源而推測或填補資料。**

**完成條件**：可取得的資料範圍有明確結論並寫入文件；取得的分數與 JSON-LD 的 Top 10 對照一致。

**完成結果（2026-08-17）**：官方靜態 JSON 提供 28 個模型、77 組 Main effort 設定，全部有分數與平均 rollout 成本；15 個模型有多 effort。JSON-LD Top 10 與完整資料 10/10 一致，渲染 DOM 顯示 28 列且 Top 10 一致。Extended 只保留於原始 artifact；`none` effort 與 9 個未解析模型維持 null。

## C5 — Phase C 補正（審核關卡 1 的前置條件）

狀態：完成

**為什麼存在**：Phase C 的四個擷取 task 各自都做對了，但整合起來後有五個問題會讓使用者在錯的資料上做審核。**本 task 完成並重新產生 `current.json` 之前，不得進入審核關卡 1。**

依序處理，前兩項會改變資料內容，後三項是修正與回填。

### C5-1 Frontier Code 改用自己的 benchmark ID

規格 §4.2 已於 2026-08-17 修正：既有的 `frontierswe` 是 **Proximal 的 FrontierSWE**，與 Cognition 的 Frontier Code 是不同主辦方、不同指標（avg rank／dominance vs 加權 rubric 百分比），C4 把後者灌進了前者的 ID。

- 在 `benchmarks.json` 新增 `frontier-code-1-1`，primary = `coding`，secondary = `agentic, context`。
- `frontier-code` 來源的全部 candidate 與 CostRecord 改指向新 ID。
- `frontierswe` 保留給 Proximal，期一不擷取。
- `docs/BENCHMARK_DIMENSION_MAPPING.md` 與 `docs/BENCHMARK_SCORE_SOURCES.md` 明確區分這兩個 benchmark。

**完成條件**：全域搜尋 `frontierswe` 在 `data-v2/sources/frontier-code/` 底下沒有命中；兩份文件各有一列描述正確的主辦方與指標。

### C5-2 放寬模型資格條件

規格 §5.1 已於 2026-08-17 放寬。目前的實作把「缺 `releaseDate`」當成淘汰，`models.json` 38 筆中 33 筆為 null，導致整個產品母體只剩 5 個模型——決定誰上榜的是「哪筆 catalog 剛好填了日期」，不是模型實際有多少成績。

- 資格改為：未 deprecated **且不存在**「已知且早於時間窗」的 `releaseDate`。`releaseDate` 為 null **通過**。
- 時間窗維持設定值、預設 12 個月，但語義改為「只排除已知的舊模型」，不再用來挑選前沿模型。
- 邊界測試要涵蓋：null 通過、窗內通過、窗外淘汰、deprecated 淘汰。

**完成條件**：上述四種情況各有測試；`current.json` 的模型母體不再等於「有 `releaseDate` 的 catalog 筆數」。

### C5-3 修正 Frontier Code 的非法 effort 值

Frontier Code export 中 Inkling 一列的 effort 被解析成 `"0.99"`，造出 `thinking-machines-inkling-0-99` 這個 profile。`profile-policy.json` 的合法值只有 `max`／`xhigh`／`high`／`medium`／`low`。

- effort 只接受合法值；不合法的值視為未標示（null），原始值保留在出處記錄。
- 加一個測試，輸入含非法 effort 的 fixture，斷言不會產生非法 profile id。

**完成條件**：全部 product profile 的 effort 都是合法值或 null。

### C5-4 讓 Artificial Analysis 的交叉驗證真正可用

目前 3,680 次比對報出 2,335 次不一致，**全部是精度差**（頁面全精度 vs API 三位小數）。63% 的比對都在報警，等於沒有警報。

- 比對時加容差：在 API 的精度上比較，或 `|page − api| ≤ 0.0005`。
- validation report 只列出**超出容差**的差異，並分開統計「精度差」與「真實差異」兩個數字。

**完成條件**：真實差異為 0 時 report 明確說明；人為改動一筆 fixture 值時該差異會被列出。

### C5-5 回填 `models.json` 並補上可解析的 alias

- 從 Artificial Analysis payload 的 `release_date` 與 Frontier Code export 自動回填 `models.json` 的 `releaseDate`，**回填結果列成表交使用者核對**，不要自行認定正確。
- 補上 alias：`Gemini 3.7 Flash` 與 `Grok 4.6` 在 Artificial Analysis 的資料中存在，屬於 alias 缺漏而非未知模型。
- 其餘未解析名稱（Composer 2.5、SWE-1.6／1.7、Kimi K2.7、Mistral 3.5 Medium、Qwen 3.7 Plus、DeepSeek V4 Flash 0731）**保持 null**，不得模糊匹配。

**完成條件**：回填表已產出；新增的 alias 是精確比對；未解析數量下降且沒有任何模糊匹配。

### C5 整體完成條件

- 重新產生 `data-v2/product/current.json`，並在 `validation` 中回報新的 `versionId`、來源數、模型數與各 benchmark 的 evidence 數。
- 回報修正前後的模型母體對照（修正前：3 個 profile 通過完整矩陣，全部是 `openai-gpt-5-6-*-max`）。
- 基準驗證通過。

## C6 — 身份解析、來源刷新與檔位階梯（審核關卡 1 的前置條件）

狀態：完成

**為什麼存在**：審核關卡 1 的第一輪抽查（54 筆，53 MATCH）證實擷取到的**數值**是準的，但同時查出三類問題會讓產品少掉一批本來有資料的模型。**本 task 完成並重新產生 `current.json` 之前，不得進入審核關卡 1。**

C5 已完成，不要重做。本 task 處理的是 C5 之後才發現的問題。

### C6-1 重新擷取全部四個來源

**建議代理：Gemini 3.7 Flash Medium**（有界、可客觀驗證，既有 refresh 腳本已存在）

- DeepSWE 的快照落後：我們是 `2026-08-12`、53 列 / 21 個模型；來源現在是 `generated_at 2026-08-13T16:11:55Z`、**61 列 / 24 個模型**，新增 `deepseek-v4-pro`（`reasoning_effort: "max"`, `pass_rate 0.6283`）、`gemini-3-7-flash`、`grok-4-6`。
- 其餘三個來源同時刷新，讓四個來源的快照時間一致。
- **必須保留舊 artifact**，新舊都是內容定址存檔，不覆寫。
- 在各來源 validation report 記錄新舊列數差異。

**完成條件**：四個來源的 `lastVerifiedAt` 同日；DeepSWE 含 `deepseek-v4-pro`；差異寫進 report。

### C6-2 修正 LiveBench 的模型名稱解析

**建議代理：GPT-5.6 Luna Max**（需要探索命名格式、反覆試錯，不是照規格填空）

LiveBench 把 effort 併進 slug，現行解析只吃了一部分格式，導致 **16 個名稱、64 列**未解析。其中**至少三個是 catalog 已經有的模型**：

| LiveBench 原始名稱         | catalog 既有 ID           | 目前後果           |
| -------------------------- | ------------------------- | ------------------ |
| `kimi-k3`                  | `moonshot-kimi-k3`        | 該模型缺 LiveBench |
| `claude-opus-5-max-effort` | `anthropic-claude-opus-5` | 同上               |
| `gemini-3.6-flash-high`    | `google-gemini-3-6-flash` | 同上               |

這三個都出現在「只缺一個來源」的名單上，缺的正是 LiveBench。它們不是沒有資料，是名字沒對上。

已知需要處理的格式：`<model>-<effort>-effort`、`<model>-<effort>`、帶日期的 `claude-opus-4-5-20251101-thinking-64k-high-effort`、以及點號與連字號混用（`gemini-3.1-pro-preview-high` vs catalog 的 `google-gemini-3-1-pro-preview`）。

**解析出的 effort 必須進 `profile.effort`**，不要只用來去掉後綴。

**禁止模糊匹配。** 解析規則要能明確說出「這個 slug 依哪條規則對應到哪個 canonical ID」；對不上就保持 null。

**完成條件**：上述三個模型解析成功；未解析清單縮短且每一筆都能說明為什麼對不上；有測試涵蓋四種格式。

### C6-3 補齊 catalog 缺項

**建議代理：Gemini 3.7 Flash Medium**（機械性補資料，但清單要人工核可）

LiveBench 與 Frontier Code 仍有未解析名稱屬於 catalog 根本沒有的模型，例如 `kimi-k2.7-code`、`qwen3.8-max`、`muse-spark-1.2-xhigh`、`grok-4.3`、`gemini-3.5-flash-lite-high`、`gpt-5.2-codex`、`gpt-5.4-nano-xhigh`。

- **先產出候選清單交使用者核對，核可後才寫入 `models.json`。** 不得自行決定哪些該進 catalog。
- 新增條目的 `releaseDate` 從 Artificial Analysis payload 取，取不到就留 null（規格 §5.1 允許）。
- Frontier Code 的 `Composer 2.5`、`SWE-1.6`、`SWE-1.7`、`Mistral 3.5 Medium` 等非前沿或小廠模型，**維持 null，不強行建立 canonical ID**。

**完成條件**：候選清單已產出並經使用者核可；新增條目全部是精確比對，無模糊匹配。

### C6-4 實作思考強度檔位階梯

**建議代理：Gemini 3.7 Flash Medium**（規格 §4.4 已把規則寫死，照著實作即可）

實作規格 §4.4：

- 階梯 `non-reasoning < low < medium < high < xhigh < max`，加上不進階梯的 `default`。
- `(Non-reasoning)` → `non-reasoning`；`(minimal)` → `low`。
- 來源只給一個未命名配置 → `default`。
- 移除舊的「未標就填 `max`」fallback，以及 `profile-policy.json` 的 `defaultEffort: "max"` 語義。

**必須有測試**涵蓋：`(Non-reasoning)` 不會變成 `max`、`minimal` 併入 `low`、單一未命名配置得到 `default`、非法值（例如 Frontier Code 的 `"0.99"`）視為未標示。

**完成條件**：全域搜尋不存在「未標 effort 就填最高檔」的邏輯；現行資料中 110 筆 `(Non-reasoning)` 全部歸到 `non-reasoning`。

### C6-5 實作跨來源檔位推測與推測說明

**建議代理：GPT-5.6 Luna Max**（跨來源狀態合併，錯了不會被測試抓到，需要較強的推理）

實作規格 §4.5：

- 某來源未標檔位時，取該模型在其他來源出現過的最高檔位。
- **不得覆寫已依 §4.4 規則 2 歸檔的列。** `(Non-reasoning)` 不會因為別的來源標了 `max` 而被改成 `max`。
- 產出**推測說明**，逐筆列出：模型、未標的來源、推測檔位、依據來源與依據列，寫進該來源的 validation report。
- 已知會觸發推測的例子（供驗證）：`deepseek-v4-pro` 在 Frontier Code 未標，AA 與 LiveBench 為 `max`；`glm-5-2`、`kimi-k3` 同型態；`inkling` 在 Frontier Code 未標，AA 與 LiveBench 為 `xhigh`。

**完成條件**：推測說明存在且可讀；有測試證明 `(Non-reasoning)` 不會被推測覆寫；有測試證明沒有任何其他來源標示時結果是 `default` 而非猜測值。

### C6 整體完成條件

- 重新產生 `data-v2/product/current.json`。
- 回報：新 `versionId`、模型數、四來源齊全的模型數、以及**修正前後對照**（修正前：33 個模型，四來源齊全 8 個）。
- 回報推測說明表，交使用者審核。
- 基準驗證通過。

**不要順手做的事**：不要調整 `display-set.json` 的內容（那是審核關卡 2）；不要改動維度 mapping；不要為了讓更多模型上榜而放寬任何規則。

---

## ▣ 審核關卡 1（使用者執行）

C 階段完成後產生第一個新格式的 `data-v2/product/current.json`（**寫入工作目錄，不 commit**），交由使用者人工審核資料正確性。審核通過並由使用者明確指示後，代理才 commit。

**代理要準備的東西**：

- 四個來源各自的 validation report
- 每一筆分數可點到來源網址與頁面位置（供使用者比對）
- 規格 §12 第 4 項的待查異常（Claude Opus 4.6 max 53.7 vs high 81.1）的現況說明

**使用者未通過審核前，不得進入 D 階段。**

### 狀態：已通過（2026-08-18）

使用者審核通過並指示提交，`data-v2/product/current.json` 已 commit：

```
sha256:1b8a47b195d30ca5e3bf834d9e562c97f7e34d3a5b8ae93dec92b849f53a8025
46 個模型 · 113 列排行榜 · 909 筆 evidence · 252 筆成本 · 15 個模型四來源齊全
```

審核證據：[docs/GATE1_AUDIT_ROUND2_2026-08-18.md](../docs/GATE1_AUDIT_ROUND2_2026-08-18.md)——18 個 benchmark 各抽三列共 54 筆，全部屬於會出現在主畫面的模型；52 筆逐位相符、0 筆不符，另 2 筆是出處指錯頁面（已修）。

審核過程中修掉的缺陷（都已 commit）：

- Frontier Code 的分數原本掛在 Proximal 的 `frontierswe` ID 上 → 新增 `frontier-code-1-1`
- `releaseDate` 缺漏導致產品母體只剩 5 個模型 → 日期改為負向過濾器
- `(Non-reasoning, X Effort)` 解析失敗後被推測成 `max` → 逐段解析，推理開關優先
- 跨來源推測把 `non-reasoning` 帶到別的來源 → 推測只在具名檔位之間進行
- 「取最高檔位」讓掃過完整階梯的單一來源替所有人決定 → 改為每來源一票的眾數
- AA 的 DeepSeek 舊版（0424 Pro、0424 Flash）以新版身份進榜 → 依 `release_date` 只保留最新建置
- 202 筆 evidence 的來源連結指向不相干的模型頁 → 每列指向自己的模型頁

**Phase D 起交由其他 harness 執行。**

---

## C7 — 補齊 Artificial Analysis 的 Intelligence Index 與 GDPval-AA

狀態：已完成

**這一項在 E3 進行中才被發現，因此編號屬 C 但排在 D 之後。E3 的 AA 曲線相依於它。**

**目標**：讓 §6.3 進階圖的 AA Y 軸有資料可用。

**背景**：規格 §6.3 定 AA 的 Y 軸採用 AA 發布的 Intelligence Index 值本身，而不是自行平均 benchmark 分數（理由見該節）。目前有兩個擷取缺口：

**缺口一：Index 值沒有被擷取。**
`packages/acquisition/src/artificial-analysis-materializer.ts:239` 已有讀取 `model.intelligenceIndex` 並產生 `benchmarkId: 'artificial-analysis-intelligence-index'` 候選的程式碼，但 C6 重整擷取路徑後該欄位不在現在抓的 RSC 列裡，實測源頭 `candidates.json` 有 **0 筆** Index 候選，`current.json` 亦為 0 筆。

**缺口二：`gdpval-aa` 缺 17 筆。**
50 個帶成本的 AA profile 中，33 個 9 項齊全，**17 個恰好只缺 `gdpval-aa`**。受影響的是主畫面前段班：GPT-5.6 Sol／Luna／Terra、Claude Opus 5、Claude Fable 5、Kimi K3、Grok 4.6、GLM-5.2、DeepSeek V4 Pro、Qwen3.8 Max、Muse Spark 1.2、Gemini 3.7 Flash、Gemini 3.5 Flash-Lite、MiniMax-M3、Nemotron 3 Ultra、Inkling。判斷是某個 evaluation 頁面沒有被聯集進來——C3 已確認 AA 必須聯集多個頁面才能取得完整母體，先從那裡查。

**要求**：

- 找出承載 `intelligenceIndex` 的頁面／欄位並恢復擷取。**必須維持 `inclusion: 'EXCLUDED'`**，理由字串不變——它只供選模與展示，投入八維會與構成它的 benchmark 重複計分。
- 補齊 `gdpval-aa`，目標是那 17 個 profile 全數有值；若某些模型 AA 官方確實未測，逐一列出並保持 null，不得推估。
- 出處記錄依 §7 的單一結構，`sourceUrl` 必須指向實際讀取的頁面（C6 已修過一次指錯頁的問題，不要重蹈）。
- 更新該來源的 validation report，對照人眼可見列數。
- 重跑 `pnpm data:v2:build-current`，回報新的 `versionId`、Index 候選筆數、`gdpval-aa` 筆數，以及 9 項齊全的 AA profile 數（目前 33 / 50）。

**不得**：

- 不得為了補齊而放寬 §5.2 或改動 `display-set.json`。
- 不得把 Index 投入八維或 Overall Score。
- 不得推估任何缺值。

**完成條件**：`current.json` 內 `artificial-analysis-intelligence-index` 的 evidence 筆數大於 0 且全部 `inclusion: 'EXCLUDED'`；有測試證明該 benchmark 不會進入任何維度分數；`gdpval-aa` 的缺口有明確結論（補齊或逐一列出官方未測）。

**注意**：`current.json` 會變更但**不得提交**。C7 屬於「會改動 `current.json` 的來源刷新」，必須走規格 §11.4 的常態程序：產出 `docs/REFRESH_<YYYY-MM-DD>.md`、主動提示使用者抽查、指名該查哪幾筆與怎麼查，等使用者明確指示後才 commit。

# D. 計分與報告

## D1 — 代表 profile 選法改為最佳表現

狀態：完成

**目標**：實作規格 §4.3。

**要求**：

- 同一模型多個思考強度時，取該來源測出分數最高者。不判斷 effort 標籤。
- 排行榜、雷達圖、兩張圖表使用同一個選法。
- 移除舊的「Coverage 高 → 有效結果數多 → Overall 高」規則。

**完成條件**：有測試證明四個畫面對同一模型選出同一個 profile；舊規則在程式與文件中完全不存在。

## D2 — 完整矩陣門檻

狀態：完成

**目標**：實作規格 §5.2。這是本次重構影響面最大的一項。

**要求**：

- 模型必須在 `display-set.json` 的每一項上都有分數，才進主畫面。
- 缺任何一項 → 進開發者模式。
- 主畫面不得出現 N/A。
- **移除**：Coverage 比例、`ESTIMATED` 狀態、「至少一維有分數就顯示」、「Developer mode 放寬到 1–7/8」。這些散在約 100 處（`view-model.ts`、`leaderboard.tsx`、`table-sort.ts`、`dashboard.tsx`、`globals.css`）。
- 移除必須涵蓋程式、schema、測試、fixture、文件，**不能只從畫面隱藏**。

**完成條件**：negative search 證明 `coverage`、`ESTIMATED` 相關契約已不存在；主畫面在任何資料狀態下都不出現 N/A 的測試。

## D3 — coverage-matrix 報告指令

狀態：完成

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

### 狀態：已通過（2026-08-20）

使用者判讀 [docs/COVERAGE_MATRIX_REPORT.md](../docs/COVERAGE_MATRIX_REPORT.md) 後，選定報告中 N=15 的最佳組合**減去 `aa-briefcase`**，共 14 項。`aa-briefcase` 一項就擋掉 DeepSeek V4 Pro、GPT-5.6 Luna 與 GPT-5.6 Terra；移除後完整模型數由 11 升到 14，維度仍為 8/8，四個來源全部保留。

留一法顯示這 14 項中有 12 項邊際成本為零——真正篩掉模型的只有 `frontier-code-1-1`（4 個）與 `deepswe-1-1`（2 個），也就是「四個來源都要」這個要求的全部代價。落選的 `aa-briefcase`、`apex-agents`、`gdpval-aa`、`ifbench` 皆因 Artificial Analysis 覆蓋率偏低。

產物：`sha256:73768465f61b638e58f65070e8f4054b94c38c738bf8e19b6b463983b673ff24`，主畫面 **12 列**、**7 家廠商**（anthropic 2、openai 3、google 2、xai 2、deepseek 1、moonshot 1、zai 1）、無 N/A。原本寫 8 家是口頭誤述，2026-08-21 於 H4 更正。

**報告的 14 與主畫面的 12 差在哪：**報告的完整模型數是跨 profile 聯集的上界，§5.2 的門檻則要求**單一 profile** 同時滿足矩陣。Claude Sonnet 5（AA 測 `max`、LiveBench 測 `xhigh`）與 DeepSeek V4 Flash（`max` 只差 `frontier-code-1-1`，而 Frontier Code 測 `high`）兩者聯集完整、交集為空，因此落入開發者模式。

**這是刻意不放寬的。** 改成跨 profile 聯集的話，一列裡的八個維度分數會來自不同思考強度，正是當初按 effort 拆 profile 要防止的事。此決定不修改 §5.2；待來源補測後會自行消失。

---

## D4 — 修正成本投影被顯示門檻連坐刪除

狀態：完成

**這一項在審核關卡 2 通過之後才被發現，因此編號屬 D 但排在關卡之後。它不影響關卡 2 的結論——`display-set.json` 與主畫面的 12 列都不受此缺陷影響，受影響的只有成本資料。**

**目標**：實作規格 §5.2 新增的「完整矩陣門檻只作用於顯示，不得傳染到資料保存」。

**背景**：D2 把 `overallScore` 改成「八維不齊即為 null」之後，`packages/benchmark-data/src/index.ts` 的 `materializedCosts` 守衛語意跟著變了：

```js
const performance = leaderboardByProfile.get(
  record.model.profileId,
)?.overallScore;
if (performance === null || performance === undefined) return [];
```

原意是「這個 profile 至少有一維分數」，現在變成「必須八維全滿」。

**實測後果**（修好後在 `current.json` 上量測，可複現）：

| 指標                                     |  數值 |
| ---------------------------------------- | ----: |
| 成本列總數                               |   252 |
| 其中 `performance` 為 null               |   172 |
| 其中 `performance` 非 null               |    80 |
| 任務成本列（四來源，排除 model-catalog） |   207 |
| 具兩個以上帶成本 effort profile 的模型   |    20 |
| 同上，若守衛存在                         | **0** |

`performance` 為 null 的 172 列，就是舊守衛會整列刪除的資料。修正前 §6.3 的進階圖沒有任何一條線可以畫。這是靜默失效：測試全綠，畫面上看不出來。

修好後各來源的任務成本列 / profile 數 / 模型數：

| 來源                | 成本列 | profile | 模型 |
| ------------------- | -----: | ------: | ---: |
| Frontier Code       |     72 |      72 |   23 |
| DeepSWE             |     61 |      61 |   24 |
| Artificial Analysis |     50 |      50 |   26 |
| LiveBench           |     24 |      24 |   24 |

> **勘誤（2026-08-20）**：本節初稿曾記載「源頭 307／61／77 列，進到 current.json 只剩 21／17／14，183 筆被刪」。那組數字是用源頭 `costs.json` 的 `profileId` 直接比對 leaderboard 得到的，但建置過程中 `applyProductProfilePolicyToCosts` 會重寫該欄位，因此比對大量落空。結論（守衛在丟資料、進階圖無資料可畫）不變，數字已更正為上表。

**要求**：

- `ProductCost.performance` 改為 nullable（schema、型別、測試一併改）。
- 移除上述守衛。**所有 `INCLUDED` 且能解析出 `canonicalModelId` 與 `profileId` 的成本列都必須保存**，不論該 profile 是否通過顯示門檻。
- `catalogCosts` 內同樣的 `performance === null` 守衛一併檢查，套用相同規則。
- 由呼叫端決定是否濾掉 null：`buildWeightedCostCurve`（預設圖）必須濾，進階圖不濾。
- 重跑 `pnpm data:v2:build-current`，回報新的 `versionId`、成本列數、以及具兩個以上帶成本 effort profile 的模型數。
- **不得**為了讓數字變好看而放寬 §5.2 的顯示門檻，或改動 `display-set.json`（那是審核關卡 2 的產物，已定案）。

**完成條件**：有測試以「profile 的 `overallScore` 為 null 但有成本列」的 fixture 證明該成本列仍保存在 ProductVersion 中；重建後具兩個以上帶成本 effort profile 的模型數大於 0（實測 20 個）。

**注意**：`current.json` 會變更但**不得提交**，交由使用者審核。

# E. 介面

## E1 — 模型明細面板

狀態：完成

**目標**：實作規格 §6.2。

**要求**：

- 點擊排行榜的模型列，展開該模型的詳細資料，按維度列出組成該維度的每一筆 benchmark 分數（含來源名稱）。
- **同一個元件同時服務排行榜與開發者模式**。從開發者模式進來時，缺的格子顯示為空。不要做兩個元件。
- 每一格可點開看出處：來源網址（可點）、`rawScore`、`locator`、`retrievedAt`。
- 移除 `evidence-detail.tsx`（282 行）的獨立 Evidence 區塊。

**完成條件**：兩種進入路徑共用同一元件的測試；`evidence-detail.tsx` 已刪除且無殘留引用。

## E2 — 排行榜與雷達圖

狀態：完成

**目標**：配合 D1／D2 的規則調整，並拆分過度集中的檔案。

**要求**：

- 排行榜保留排序、搜尋、思考強度選擇。
- **雷達圖上不得加任何 benchmark 數量標記。**
- 雷達圖不得把缺值畫成 0（主畫面雖無缺值，開發者模式仍可能有）。
- `leaderboard.tsx`（509 行）與 `globals.css`（1,875 行）在本階段拆分。拆分不得改變任何語義。

**完成條件**：桌面與 390px 行動裝置無水平溢出；鍵盤焦點與 axe 檢查通過。

## E3 — 兩張性價比圖表

狀態：完成

**目標**：實作規格 §6.3。

**要求**：

- **預設圖**：四來源加權，X 軸為混合正規化成本、Y 軸為 Overall Score。每個模型每個來源取最佳表現那一筆。
- **權重為四來源各 25%。** 取代 `view-model.ts` 現行的 `COST_SOURCE_WEIGHTS`（AA 40／LiveBench 40／DeepSWE 20，三來源時代的遺留值）。理由見規格 §6.3，不要自行調整。
- **進階圖**：按鈕開啟，顯示各模型多種思考強度的曲線，**同一模型的各強度點要連成線**。只用 Artificial Analysis、DeepSWE、Frontier Code。缺任一來源資料的模型不顯示。
- **進階圖的軸：X 軸＝該來源自己的成本，Y 軸＝該來源自己的分數。** 一條曲線只屬於一個來源，不跨來源聚合。多 effort profile 多半不是 8/8 完整、沒有 Overall Score，**不得為了湊 Y 軸而放寬 §5.2，也不得拿跨來源 Overall 去配單一來源成本**。
- **DeepSWE 與 Frontier Code** 一個分數對一個成本，Y 軸直接用該來源的 normalized 分數。
- **Artificial Analysis 的 Y 軸＝AA 發布的 Intelligence Index 值本身**（規格 §6.3）。AA 同一 profile 有 6–12 個 benchmark 但只有一筆 `intelligenceIndexCostPerTask`，因此不唯一。**明確禁止**用「該 profile 所有 INCLUDED 的 AA benchmark 算術平均」當 Y 軸：其中 `aa-briefcase`、`apex-agents`、`ifbench` 不在 Index 內、成本未涵蓋，且分母在 6–12 間浮動會讓不同點落在不同座標系，實測最大差 2.93 分。
- **AA 曲線相依於 C7**（Index 值目前尚未擷取，實測 0 筆）。C7 完成前不要實作 AA 曲線；若必須先出畫面，採用規格 §6.3 的備案（恰好 9 項、全齊才出點），並在畫面標示資料受限。
- 曲線上的點依 §4.4 的思考強度階梯排序（`non-reasoning < low < medium < high < xhigh < max`）；`default` 不上梯子，單獨標示。
- **Artificial Analysis 的 token 單價不得進入成本圖。** 進成本圖的是 `intelligenceIndexCostPerTask`。
- C4 已確認 Frontier Code 的成本與思考強度皆可取得（28 個模型、15 個具多 effort），進階圖維持三來源，不需要退化路徑。

**完成條件**：有測試證明 `API_STANDARDIZED` 成本不會進入任何一張成本圖；進階圖的「缺任一來源即不顯示」有測試；有測試證明進階圖的每個點其成本與分數來自同一個 `sourceId`。

## E4 — 開發者模式

狀態：完成

**目標**：實作規格 §5.4。

**要求**：

- 顯示被排除模型的模型 × benchmark 矩陣，每格顯示原始 normalized 分數。
- **不做任何加總**：不算維度分數、不算總分。
- 沿用 E1 的明細面板元件。
- **修正 D1／D2 交互產生的診斷缺陷（見下）。**

### 必修：開發者模式的代表 profile 退化成字母序

D2 把 `overallScore` 改成「八維不齊即為 null」。D1 的代表 profile 比較器只看 `overallScore`，null 視為 `-Infinity`，於是**八維不齊的模型其所有 profile 都同分，代表 profile 實際由 `profileId` 字典序決定**。46 個模型中有 10 個落入此狀況。

後果是開發者模式給出假的缺格清單。實例（2026-08-20 資料）：

| profile                                           | display-set 缺格 |
| ------------------------------------------------- | ---------------- |
| `anthropic-claude-sonnet-5-high` ← 目前被選為代表 | 12               |
| `anthropic-claude-sonnet-5-xhigh`                 | 8                |

畫面因此宣稱 Claude Sonnet 5 缺 12 格，實際最好的配置只缺 8 格。§5.4 說開發者模式唯一的職責就是「顯示被排除的模型缺哪些格子」，這裡給的是最差答案。

**修法**：不要改 `compareRepresentativeCandidates`。那會把 D2 剛移除的 coverage 式排序從後門放回來，且違反規格 §4.3「只看分數」。改在 `getDeveloperModelRows` 內為診斷用途另外挑 profile，順序為：display-set 缺格數最少 → `overallScore` 較高 → `profileId` 字典序。主畫面的資格判定不受影響（`isMainEligibleRow` 掃全部 leaderboard 列，不是只看代表列），不得更動。

**完成條件**：有測試證明開發者模式不會產生任何聚合數值；另有測試以「同一模型多個 profile 缺格數不同且 `overallScore` 全為 null」的 fixture，證明選出的是缺格最少者而非字典序最前者。

---

## E5 — 修正開發者模式的無效候選列（e2e 紅燈）

狀態：完成

**這一項是 E 階段驗收時發現的已提交破損，必須先修才能進 F。**

**現象**：`pnpm e2e` 有兩個測試失敗（desktop 與 mobile 各一）：

```
dashboard.spec.ts:4 › defaults to complete matrix models and exposes excluded cells explicitly
Error: locator('.radar-chart') — element(s) not found
```

測試在開發者模式點第一列，預期出現雷達圖，實際什麼都沒有。

**根因**：`product.frontier` 的 53 筆記錄全部帶著 `<modelId>-unspecified` 形式的佔位 `profileId`，這些 ID 在 `product.profiles` 內並不存在（`profiles` 於 `buildProduct` 內被過濾為 `leaderboardProfileIds`）。`getDeveloperModelRows` 會把沒有任何 profile 的模型用 frontier 後備列補進來，因此產生 41 列中的 8 列無效候選：

```
anthropic-claude-mythos-preview-unspecified   deepseek-deepseek-v4-unspecified
google-gemini-3-pro-preview-unspecified       meta-muse-spark-unspecified
openai-gpt-5-2-pro-unspecified                openai-gpt-5-3-codex-unspecified
openai-gpt-5-4-pro-unspecified                zai-glm-5-1-unspecified
```

這些列有三個問題：點擊後 `resolveActiveProfile` 解析不到 profile，明細面板與雷達圖都不渲染；`displayName` 掉回原始 slug；而模型本身在來源上一筆資料都沒有（例如 Claude Mythos Preview 在 coverage matrix 報告中是 0/18），把它列成「缺 14 格」沒有任何診斷價值。

**為什麼現在才爆**：缺陷一直存在，但 E4 新增的 `rows.sort((a, b) => a.displayName.localeCompare(b.displayName))` 讓 slug 形式的顯示名稱排到第一位，正好是 e2e 點的 `.first()`。

**要求**：

- `getDeveloperModelRows` 必須排除 `profileId` 不在 `product.profiles` 內的候選。一個沒有任何可解析 profile 的模型不進開發者模式。
- 保留 `displayName` 的後備分支，但它不應再被觸發；若被觸發代表過濾漏了。
- 不得改動 `product.frontier` 的結構或 `-unspecified` 佔位機制本身（見下方待確認事項）。
- 不得放寬 §5.2、不得改 `display-set.json`。

**完成條件**：`pnpm e2e` 全綠；有單元測試以「frontier 指向不存在 profile 的模型」fixture 證明該模型不出現在開發者模式列表中；有測試證明開發者模式的每一列其 `profileId` 都能在 `product.profiles` 內解析。

**待確認（不在 E5 範圍，回報即可）**：`frontier` 使用 `<modelId>-unspecified` 作為 profileId 是否合理。規格 §4.4 的檔位階梯中未標 effort 者歸為 `default`，並無 `unspecified`。這個佔位符若要保留，應在規格中明文定義它只是 frontier 的模型指標、不是 profile 身分；若要移除則是另一個任務。**執行者不得自行決定**，把觀察寫進回報。

# F. 驗收

## F1 — 文件最終同步

狀態：完成

**要求**：

- `README.md`、`CLAUDE.md`、`docs/README.md`、`docs/ARCHITECTURE.md`、`docs/DATA_METHODOLOGY.md`、`docs/SCORING_METHODOLOGY.md`、`docs/OPERATIONS.md` 只描述一套現行流程。
- `docs/SCORING_METHODOLOGY.md` 的 Coverage、Representative Profile、ESTIMATED 章節依 D1／D2 改寫。
- `docs/DATA_METHODOLOGY.md` 的來源清單、成本規則、出處結構依規格改寫。
- `docs/REFACTOR_DISCARD_LIST.md` 至少維持原有負面範圍，並追加本次刪除的項目。
- 搜尋沒有會讓接手者誤以為舊架構仍受支援的現行操作說明。

## F2 — 最終驗收

狀態：完成

**要求**：

- 乾淨 checkout 下完整跑一次基準驗證與 production build（不需任何環境變數）。
- 檢查 Git branch／worktree 狀態、`git diff --check`、package graph、legacy negative search。
- 確認沒有未經使用者指示的 `current.json` commit，也沒有 push、deploy 或其他外部狀態改變。
- 所有保留功能有 unit／browser／build 證據；所有移除功能在程式、資料、依賴、script、CI、測試、文件都沒有半殘狀態。

**最終回報必須明確列出**仍需使用者人工處理的項目：`current.json` 的審核與 commit 指示、首次部署、倉庫外 `codex-gemini-orchestrator` 舊工作目錄的處置、Artificial Analysis 金鑰輪換。

---

# G. 驗收缺陷修正

F2 於 2026-08-21 判定**不通過**（[驗收報告](../docs/F2_ACCEPTANCE_2026-08-21.md)）。本階段清掉阻擋項，完成後**必須由未參與實作與審查的第三方重跑 F2**。

已排除的兩項非缺陷：

- `pnpm e2e` 在 build 前失敗是 `playwright.config.ts` 的 `webServer` 跑 `next start`、本來就需要先 build，屬文件命令順序問題，併入 G1。
- `tmp/ci-clean-20260713/` 是 gitignore 內的本機殘留，Git graph 乾淨。已於 2026-08-21 依使用者指示整個 `tmp/` 清除。

F2 另指出主畫面為 7 家 provider 而非先前口頭宣稱的 8 家。實測確認為 7 家（anthropic 2、openai 3、google 2、xai 2、deepseek 1、moonshot 1、zai 1），12 列與無 N/A 均正確。此為口頭誤述，非產品缺陷。

## G1 — 修正文件與程式不一致

狀態：完成

**目標**：清掉 F2 報告 A6 列出的八項不一致。每一項都要**實際對照程式或資料**驗證後再改，不要只改措辭。

**要求**：

1. `docs/DATA_METHODOLOGY.md:77-82` 與 `docs/BENCHMARK_SCORE_SOURCES.md:14`：未標 effort 的推測寫成「取最高檔」，與規格 §4.5 及 `packages/benchmark-data/src/index.ts` 的每來源一票眾數（平手取較高）矛盾。同處 `xHigh` 應為 `xhigh`。
2. `docs/DATA_METHODOLOGY.md:134`：寫缺來源時只不顯示「該來源曲線」；規格 §6.3 與 `apps/bench/lib/view-model.ts` 是缺任一來源即整個模型不顯示。
3. `docs/DATA_METHODOLOGY.md:45-52`：LiveBench／DeepSWE 操作仍列 replay 型 `materialize:snapshots` / `materialize:costs`，未列 `packages/acquisition/package.json` 的 live refresh 命令。README 與 OPERATIONS 已是正確版本，以它們為準。
4. `docs/PROJECT_HANDOFF.md:60`：寫 Overall 只平均已有維度；實作為八維不齊即 `null`。另 `docs/README.md:9` 仍把 PROJECT_HANDOFF 標為 **Current**，應降為歷史文件。
5. `docs/OPERATIONS.md:113-129`：刷新報告的強制欄位未完整抄入規格 §11.4——缺舊／新 `versionId` 與四項 delta、主畫面進出與原因、既有模型最大分數變動、逐筆檔位推測揭露表。
6. `docs/OPERATIONS.md:76`：說頁首與頁尾都顯示完整 `versionId`；實際頁首是縮寫、完整值在 `title`，頁尾才直接顯示。
7. `README.md:82-89` 與 `docs/OPERATIONS.md:140-148`：驗證命令順序在乾淨 checkout 不可執行，`pnpm e2e` 必須排在 `pnpm --filter @llm-bench/bench build` 之後。
8. `docs/DATA_METHODOLOGY.md:100-105` 的成本 Evidence 宣稱由 G3 處理，G1 不動該段。

**不得**修改 `docs/REFACTOR_SPEC_V2.md`；文件對齊規格，不是反過來。

**完成條件**：上述八處逐一對照程式或資料確認一致；基準驗證全綠。

## G2 — 讓乾淨 checkout 能跑 `pnpm test`

狀態：完成

**目標**：`packages/acquisition` 的多個測試直接讀取 Git 外的 `artifacts-v2/`（見 `artificial-analysis-materializer.test.ts`、`livebench-materializer.test.ts`、`deepswe-materializer.test.ts`、`epoch-materializer.test.ts`、`artifacts.test.ts`），因此乾淨 clone 後 `pnpm test` 必然失敗，而 `pnpm test` 是 CLAUDE.md 的基準驗證項目。

**使用者已決定的作法**：把測試實際讀取的 artifact **原樣複製**進 Git，`artifacts-v2/` 維持 Git 外。

**本段於 2026-08-21 修訂（H 階段）。** 原文寫的是「縮成精簡 fixture」，實作提交的是
七份逐位元組副本（合計 2,525,203 bytes），G4 據原文判定不通過。使用者裁決維持原樣複製，改的是
本段文字而非程式碼：裁剪 Artificial Analysis 那份 1,353,178 bytes 的 RSC stream 需要理解它的
內部結構，剪錯會讓測試改為驗證一個從未存在過的格式，而且**不會有任何測試失敗來
指出剪錯了**。2.4 MiB 換掉這個風險是划算的。理由另記於
`packages/acquisition/test-fixtures/README.md`。

**要求**：

- fixture 是來源 artifact 的逐位元組副本，以其 SHA-256 命名，不得裁剪、重排或美化。
- fixture 放在測試套件內的固定目錄，路徑不得再指向 `artifacts-v2/`。
- 該目錄要排除在 `.prettierignore` 與 `eslint.config.mjs` 之外，避免格式化工具改動位元組。
- 目錄內附 README 說明為何不裁剪，以免後人誤以為是疏漏。
- 保持斷言的實質強度，**不得為了讓測試過而弱化斷言或改成 snapshot 比對**。
- `data-v2/sources/` 底下任何目錄不得刪除或修改。
- 不得改動 `artifacts-v2/` 既有內容。

**完成條件**：在沒有 `artifacts-v2/` 的環境下 `pnpm test` 全綠；測試數量不低於現行 181 筆。

## G3 — 移除無出處的 model-catalog 成本列

狀態：完成（`current.json` 待使用者審核）

**目標**：`docs/DATA_METHODOLOGY.md:100` 寫「成本必須是帶 Evidence 的 CostRecord，不得只手工塞入模型 catalog」，但 `buildProduct` 的 `catalogCosts` 產生 21 筆 `sourceId: 'model-catalog'` 的成本列，`evidenceIds` 全為空。

**使用者已決定**：文件是對的，移除 catalog 成本列。

**要求**：

- 移除 `catalogCosts` 的產生路徑，使 ProductVersion 只保留有出處的成本列。
- 確認移除後預設圖與進階圖皆無變化——這 21 筆的 `sourceId` 權重為 0，本來就不進任何圖表。若有變化，停下來回報。
- 重跑 `pnpm data:v2:build-current`，回報新 `versionId`、成本列數（現為 253）與各來源分佈。
- **`current.json` 不得提交**，依規格 §11.4 交由使用者審核。因本次不涉及來源刷新、分數不變，刷新報告可精簡為變更摘要。

**完成條件**：ProductVersion 內無 `sourceId: 'model-catalog'` 的成本列；有測試證明成本列的 `evidenceIds` 皆非空；兩張圖表的資料點數與 G3 前相同。

## G4 — 重跑最終驗收

狀態：完成（驗收不通過；詳見 `docs/G4_F2_ACCEPTANCE_2026-08-21.md`）

G1 至 G3 完成、使用者核准 `current.json` 之後，**由未參與本次實作與審查的第三方重跑 F2**。沿用 F2 的 prompt 與驗收項目，另加驗一項：G1 的八處修正是否真的與程式一致。

---

# H. G 階段缺陷修正

G4 重跑 F2 於 2026-08-21 再次判定**不通過**（[驗收報告](../docs/G4_F2_ACCEPTANCE_2026-08-21.md)），
獨立第三方代理得到相同判定。七項阻擋項中：

- 第 1 項（`current.json` 未提交）已於 2026-08-21 依使用者核准提交（`dfbca29`），解除。
- 第 2 至第 6 項成立，其中三項是 G1／G3 引入的**新錯誤**，由本階段清除。
- 第 7 項（G2 fixture 原樣複製 vs 精簡）經使用者裁決：**維持原樣複製**，改的是計畫文字而非程式碼，理由見 G2 修訂段。

共同形狀值得記錄：G1 與 G3 的三個錯誤都發生在「修正別人的錯誤時，自己沒有回頭
對照原始出處」——檔位規則憑印象重寫、曲線數用簡化模型估算、`CLAUDE.md` 照既有
清單走而未重新掃描。本階段每一項都必須附上實際對照的來源位置。

## H1 — 修正檔位推測措辭與 CLAUDE.md 命令順序

狀態：完成

**目標**：G1 把跨來源檔位推測寫成「每來源自己的眾數」，與規格 §4.5 及程式不符；
`CLAUDE.md` 的基準驗證順序在 G1 完全未被觸及。

**權威依據**（本階段不得修改）：

- `docs/REFACTOR_SPEC_V2.md:119`：「每個其他來源投一票（**該來源對這個模型發布過的最高具名檔位**），得票最多的檔位勝出；平手時取較高的檔位。」
- `packages/benchmark-data/src/index.ts` 的 `higherEffortEvidence`：每來源以 `byRank(entry.effort) > byRank(current.effort)` 取**該來源最高具名檔位**，眾數只作用在跨來源那一層。

**要求**：

1. `docs/DATA_METHODOLOGY.md:82`：「該來源自己的眾數」改為「該來源對這個模型發布過的最高具名檔位」，並保留「不是取最高檔」的警告但寫清楚它指的是**不直接取所有來源中的最高檔**。
2. `docs/BENCHMARK_SCORE_SOURCES.md:14`：同樣補上每來源投票值的定義。
3. `CLAUDE.md:36-49`：`pnpm e2e` 移到 `pnpm --filter @llm-bench/bench build` 之後，並附上與 README／OPERATIONS 一致的理由註記。

**完成條件**：三處措辭與規格 §4.5 逐字對應；`CLAUDE.md` 的命令順序與 `README.md:82-89`、`docs/OPERATIONS.md:140-148` 一致。

## H2 — ProductCost 的 evidenceIds 補上 `.min(1)`

狀態：完成

**目標**：G3 移除了無出處的成本列，但 `ProductCostSchema`（`packages/benchmark-data/src/index.ts:736`）
仍是 `z.array(Sha256Schema)`，接受空陣列；同檔的 `CandidateResultBaseSchema:192` 與
`CostRecordSchema:286` 都有 `.min(1)`。不變式目前只靠一條測試守著，schema 本身沒有守。

**要求**：

- `ProductCostSchema.evidenceIds` 加 `.min(1)`。
- 重建 `current.json` 並確認內容不變——現行 232 筆成本列全部帶 `evidenceIds`。
- 加測試證明 schema 拒絕空 `evidenceIds`；`schema.test.ts` 既有那筆以空陣列驗證
  `performance` 可為 null 的案例要補上真實 evidence id，不得為了讓它過而放寬 schema。

**已實測**：重建後除 `generatedAt` 外所有欄位逐一相等，成本列仍為 232 筆、
無空 `evidenceIds`。但 `versionId` 是對含 `generatedAt` 的全部內容取 sha256
（`index.ts:1340`），因此任何重建都必然產生新 id。既然內容沒有實質變化，
**已發布的 `current.json`（`dfbca29`，`sha256:bec073cf…`）維持不動**，不重新發布，
也就不需要再走一次 §11.2 審核。

**完成條件**：schema 拒絕空 `evidenceIds`；已發布的 `current.json` 在新 schema 下
仍能通過驗證且未被改動。

## H3 — 標記過期任務文件並釐清來源登錄的定位

狀態：完成

**目標**：`tasks/` 底下三個檔案有兩個在描述已廢棄的架構且無任何歷史標記；
`docs/BENCHMARK_SCORE_SOURCES.md` 自稱是匯入白名單，但真正的白名單是
`data-v2/mappings/sources.json`。

**要求**：

1. `tasks/plan.md`、`tasks/todo.md`：在檔首加歷史標記，明確指出它們描述的是
   Stage 5 時代的架構（Draft／Published pointer、「預設只顯示 8/8」等），現行依據是
   `docs/REFACTOR_SPEC_V2.md` 與 `tasks/claude-code-plan.md`。**不刪除內容**，只加標記。
2. `docs/BENCHMARK_SCORE_SOURCES.md:8`：改寫為「來源分類與時效登錄」，並指明
   允許進入 ProductVersion 的來源白名單是 `data-v2/mappings/sources.json` 的四個來源，
   本文件列出的其他站台是候選與時效追蹤對象，不是匯入授權。

**完成條件**：三處標記與現行架構一致；不新增也不刪除任何實質內容。

## H4 — 更正 G3 刷新報告的曲線數與計畫的 provider 數

狀態：完成

**目標**：G3 的刷新報告寫進階圖有 34 條曲線，實際 25 條——漏套「模型必須三個來源
都有資料」的閘門（`apps/bench/lib/view-model.ts:790-800`）。計畫 `:599` 也仍寫主畫面
8 家 provider，同檔 `:825` 與實際資料都是 7 家。

**實測結果**（以 `current.json` 與 `display-set.json` 跑 `buildWeightedCostCurve`／
`buildAdvancedCostSeries`，並以 `b60e75d` 的 `current.json` 跑同一組作為變更前基準）：

| 指標                 | G3 前 | G3 後 |
| -------------------- | ----: | ----: |
| 主畫面列數           |    12 |    12 |
| 預設圖資料點         |    12 |    12 |
| 進階圖納入模型數     |    14 |    14 |
| 進階圖曲線總數       |    42 |    42 |
| 進階圖 ≥2 點的曲線數 |    25 |    25 |
| 成本列數             |   253 |   232 |

**要求**：

- `docs/REFRESH_2026-08-21.md` 的圖表影響表改為上表，並標註曲線總數與 ≥2 點曲線數是兩個不同的量。
- `tasks/claude-code-plan.md:599` 的「8 家廠商」改為 7 家並列出實際分佈。

**完成條件**：文件中所有圖表數字都能由上述兩支 builder 重現。

## H 階段期間完成的使用者項目

**倉庫外舊 worktree 已於 2026-08-21 依使用者指示移除。**
`N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-frontend` 是本 repository 的
detached worktree（HEAD `85e87db`，為 `main` 的祖先，無獨有 commit）。唯一的獨有內容是
未追蹤的 `apps/bench/`——21 個原始檔（96 KB）加上 `node_modules`／`.next` 產物，共 24 MB。
那 21 個檔案的 blob 不存在於任何 Git 歷史中，因此**先封存再刪除**：
`N:/Coding/LLM Bench Project/llm-bench-frontend-worktree-apps-bench-2026-08-21.zip`（19,486 bytes）。
封存檔刻意放在 repository 之外，不進 Git；確認不需要後可自行刪除。
`git worktree remove --force` 已解除註冊但因 `node_modules` 路徑過長無法刪目錄，改以
`rm -rf` 完成，再跑 `git worktree prune`。現在 `git worktree list` 只剩主線。

同層還留有 `llm-bench-materializers-20260718` 與 `llm-bench-model-column-20260718`
兩個目錄，**兩者都沒有 `.git`**，不是本 repository 的 worktree，也未被 Git 註冊。
本次未處置，待使用者決定。

`CLAUDE.md` 對該路徑的警告予以保留：它記錄的是「不得當成工作來源」這條判斷，
即使目錄已不存在，後續代理仍可能從舊文件或舊對話得到該路徑。

## H5 — 重跑最終驗收

狀態：未開始

H1 至 H4 完成後，**由未參與 G／H 實作與審查的第三方重跑 F2**。沿用 F2 的 prompt 與
驗收項目，另加驗兩項：H1 至 H4 的修正是否真的與程式一致；G4 報告的七項阻擋項是否
逐項解除或有明確裁決紀錄。

---

# I. 部署與資料衛生

H5 於 2026-08-21 判定**通過**（[驗收報告](../docs/H5_F2_ACCEPTANCE_2026-08-21.md)），
零阻擋項。本階段處理 H5 列出的使用者人工事項與非阻擋觀察。

**使用者裁決（2026-08-21）**：

- 部署目標為 **GitHub Pages**。
- `frontier` 只砍掉 `profileId` 欄位，保留 53 列與兩個計數。
- **不輪換 Artificial Analysis 金鑰。** 已實測確認：`aa_lbeg…` 這個值不在工作目錄的
  任何 tracked 檔案中，也不在 `git log --all -S` 的任何歷史裡；唯一持有處是 gitignored
  的 `.env.local`（`.gitignore:12` 的 `.env.*` 涵蓋，且從未被 track）。倉庫在 GitHub 上
  是 **private**。因此 push 不會外洩該金鑰。此決定不改變規格對金鑰保存位置的要求。

## I1 — 清除倉庫外殘留工作目錄

狀態：完成

`N:/Coding/codex-gemini-orchestrator/worktrees/` 底下兩個非 worktree 目錄依 frontend 的
同一套處理：先找出不在本 repository 物件庫中的獨有內容，封存後再刪除。

- `llm-bench-model-column-20260718`：228 個非建置檔中**獨有 0 個**，全部可由 Git 復原，直接刪除。
- `llm-bench-materializers-20260718`：獨有 4 個檔（78,605 bytes），為較早的 materializer 實作，
  封存於 `N:/Coding/LLM Bench Project/llm-bench-materializers-20260718-unique-2026-08-21.zip`（17,531 bytes）後刪除。

`worktrees/` 目錄現為空。其上層 `codex-gemini-orchestrator` 是使用者另一個獨立
repository（有自己的 `.git`、README、LICENSE），**未觸碰**。

## I2 — `frontier` 移除虛構的 `profileId`

狀態：完成

**問題**：`ProductVersion.frontier` 的 53 列，`profileId` 全部是 `<modelId>-unspecified`，
53/53 無法在 `product.profiles` 解析，且違反 §4 的「不建立 `unspecified` effort」。
三次驗收都列為非阻擋觀察，根因是規格從未定義 `frontier` 的結構。

**做法**：規格新增 §5.5 定義 `frontier` 為模型層級集合，明定不得有 `profileId`；
`ProductVersionSchema.frontier`、`FrontierModel`、`ManualFrontierModel` 與
`FrontierConfigSchema.manualModels` 一併移除該欄位；`buildFrontier` 兩條路徑停止捏造。

**實測**：重建後的 ProductVersion 與已發布的 `dfbca29` 相比，**只有 `frontier` 不同，
且差異只是被移除的 `profileId`**；`profiles`、`leaderboard`、`costs`、`evidence` 逐一相等。
新 `versionId` 為 `sha256:1d2f571445d9fa794553d75401181b59cc107246956e1e7e025664ca322728b2`。
主畫面兩個計數只取 `modelId`，畫面數字不變。

## I3 — GitHub Pages 部署

狀態：完成

**問題**：倉庫沒有任何部署設定；`next.config.ts` 是 `output: 'standalone'`，與實際
「單頁、全靜態、無 server 行為」不符，也是 e2e 那則 `next start` 警告的來源。

**做法**：

- `output: 'export'`，產出 `apps/bench/out`。`basePath`／`assetPrefix` 由
  `NEXT_PUBLIC_BASE_PATH` 決定：本機與 e2e 為空，Pages workflow 傳入 `/<repo>`。
- 新增 `scripts/serve-static.mjs`（node:http，零新相依）供 Playwright 服務 `out/`，
  因為 `next start` 不支援靜態匯出。`playwright.config.ts` 的 `webServer` 改用它。
- 新增 `.github/workflows/pages.yml`：build → `upload-pages-artifact` → `deploy-pages`，
  actions 全部 pin 到 commit SHA，與既有 `ci.yml` 一致。加 `.nojekyll` 保護 `_next/`。
- `apps/bench/out/` 加入 `.gitignore`、`.prettierignore` 與 eslint ignores。

**順帶修掉的 CI 阻擋項**：`pnpm audit --audit-level high` 是 `ci.yml` 的最後一關，
push 前實測**失敗**——`pnpm-workspace.yaml` 的 overrides 把 `nanoid` 釘在 3.3.17，
而該版本本身中了 GHSA-2v37-7h3g-55p8（high）。已改釘 3.3.18（`legacy` dist-tag 的
修補版），audit 歸零。若不先修，第一次 push 的 CI 就會紅。

## I4 — 首次部署

狀態：完成（2026-08-21）

**使用者明確授權**本次 push 與部署，並指示把倉庫轉為公開。CLAUDE.md「Agent 不得 push、
deploy 或 release」維持不變，本次是一次性的個別授權，不是規則變更。

轉公開前先做全歷史祕密掃描，結果全部乾淨：

- 曾被加入的檔名中只有 `.env.example`，內容僅為本機 Docker Compose 的 Postgres 佔位值
  （`llm_bench_dev`），且該檔在 HEAD 已不存在。
- `aa_`、`sk-`、`ghp_`、`github_pat_`、`AKIA`、`AIza`、`xox[baprs]-`、PEM 私鑰標頭
  八組樣式對 `git rev-list --all` 全掃，零命中。

**執行順序**：commit `current.json` → push 78 commits → 祕密掃描 → 倉庫轉公開 →
以 API 啟用 Pages（`build_type=workflow`）→ 驗證線上頁面。

**結果**：

- `9ab96b2..bdb5037  main -> main`
- CI 全綠，含 `pnpm audit --audit-level high`
- Pages workflow 全綠，站台 <https://workingyuanyuan.github.io/llm-benchmarks/>，強制 HTTPS
- 線上實測：12 列排行榜、四格 Dataset scope、雷達圖、兩張成本圖皆正常；
  `_next/` 資產在 `/llm-benchmarks` 前綴下全部 200，主控台零錯誤，
  證明 `assetPrefix` 與 `.nojekyll` 都生效

舊的 `Weekly benchmark dry run` workflow 檔案已不在 main，只會留下歷史 run 紀錄，不再觸發。

---

# J. 介面回饋（2026-08-21 使用者回饋）

使用者對線上站台提出三項回饋，四個決定點已於 2026-08-21 拍板，規格
`docs/REFACTOR_SPEC_V2.md` §6.1／6.2／6.3／6.4 已同步改寫：

1. 模型明細不再是頁面下方的獨立區塊，改為排行榜的列內展開，且可同時展開多列。
2. 八維雷達圖與排行榜解耦，自己持有比較模型（預設 Overall 第 1 名一個）。
   性價比圖表同樣自帶高亮選取，不再接受外部 `selectedProfileId`。
3. 性價比圖表的資料點改用自繪懸停卡片，取代有約一秒延遲的 SVG 原生 `<title>`。

J1 與 J3 檔案不重疊（`globals.css` 除外，區段不同），可並行；J2 動 `dashboard.tsx`
的狀態結構，必須排在 J1 之後。

## J1 — 模型明細改為列內展開

狀態：完成

**目標**：實作規格 §6.2 改寫後的版本。

**要求**：

- `ModelDetailPanel` 的內容改由 `<tr>` 底下的展開列呈現，不再由 `dashboard.tsx` 以
  獨立 `section` 渲染。刪除「Select a model to view its profile…」的空狀態區塊。
- 展開狀態是排行榜表格的區域狀態（一組已展開的 modelId），**可同時展開多列**。
- 開發者模式清單同樣改為列內展開，與排行榜共用同一個展開元件。
- 展開內容不刪減：八維、逐 benchmark 分數、可點開的出處全部保留。
- 思考強度下拉選單留在模型格內，切換強度不得收合該列。

**完成條件**：展開兩列後兩份明細同時可見的測試；`dashboard.tsx` 不再渲染獨立明細
區塊；桌面與 390px 行動裝置無水平溢出。

## J2 — 雷達圖與成本圖的選取解耦

狀態：未開始

**目標**：實作規格 §6.4。

**要求**：

- `dashboard.tsx` 移除全域 `selectedModelId`／`selectedProfileId`／`modelProfiles`
  的跨區塊用途（排行榜自己的思考強度選擇仍需保留）。
- `RadarChart` 自己持有比較序列：預設 Overall 第 1 名一個模型，可新增與移除，上限 3。
  移除 `onClearActiveProfile` 與 `activeProfile`／`selectedResult` 這類外部驅動的 props。
- `CostChart` 自己持有高亮模型，由圖例或資料點點擊決定；移除 `selectedProfileId` prop。
- 三個區塊之間不得再有隱含連動。

**完成條件**：排行榜展開任一列不改變雷達圖與成本圖內容的測試；雷達圖預設一條序列；
成本圖點圖例可切換高亮。

## J3 — 性價比圖表的懸停卡片

狀態：進行中

**目標**：實作規格 §6.3 的「資料點的懸停資訊」。

**要求**：

- 預設圖與進階圖的資料點都改用自繪懸停卡片，指標進入即顯示，離開即消失，無延遲。
- 移除資料點上的 `<title>` 子元素；`aria-label` 保留不變。
- 卡片內容至少涵蓋原 `<title>` 的資訊（名稱、分數、成本、來源摘要／檔位）。
- 鍵盤焦點（`focus`）同樣要顯示卡片，不得只綁滑鼠事件。

**完成條件**：懸停卡片的顯示／隱藏測試；axe 檢查通過；無 `<title>` 殘留於資料點。
