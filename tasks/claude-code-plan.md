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

產物：`sha256:73768465f61b638e58f65070e8f4054b94c38c738bf8e19b6b463983b673ff24`，主畫面 **12 列**、8 家廠商、無 N/A。

**報告的 14 與主畫面的 12 差在哪：**報告的完整模型數是跨 profile 聯集的上界，§5.2 的門檻則要求**單一 profile** 同時滿足矩陣。Claude Sonnet 5（AA 測 `max`、LiveBench 測 `xhigh`）與 DeepSeek V4 Flash（`max` 只差 `frontier-code-1-1`，而 Frontier Code 測 `high`）兩者聯集完整、交集為空，因此落入開發者模式。

**這是刻意不放寬的。** 改成跨 profile 聯集的話，一列裡的八個維度分數會來自不同思考強度，正是當初按 effort 拆 profile 要防止的事。此決定不修改 §5.2；待來源補測後會自行消失。

---

## D4 — 修正成本投影被顯示門檻連坐刪除

狀態：未開始

**這一項在審核關卡 2 通過之後才被發現，因此編號屬 D 但排在關卡之後。它不影響關卡 2 的結論——`display-set.json` 與主畫面的 12 列都不受此缺陷影響，受影響的只有成本資料。**

**目標**：實作規格 §5.2 新增的「完整矩陣門檻只作用於顯示，不得傳染到資料保存」。

**背景**：D2 把 `overallScore` 改成「八維不齊即為 null」之後，`packages/benchmark-data/src/index.ts` 的 `materializedCosts` 守衛語意跟著變了：

```js
const performance = leaderboardByProfile.get(
  record.model.profileId,
)?.overallScore;
if (performance === null || performance === undefined) return [];
```

原意是「這個 profile 至少有一維分數」，現在變成「必須八維全滿」。實測後果：

| 來源                | 源頭成本列 | 具多 effort 的模型 | 進到 `current.json` |
| ------------------- | ---------: | -----------------: | ------------------: |
| Artificial Analysis |        307 |                 12 |                  21 |
| DeepSWE             |         61 |                 11 |                  17 |
| Frontier Code       |         77 |                 15 |                  14 |

183 筆成本列被整列刪除。**具備兩個以上帶成本 effort profile 的模型從 21 個變成 0 個**，因此 §6.3 的進階圖沒有任何一條線可以畫。這是靜默失效：測試全綠，畫面上看不出來。

**要求**：

- `ProductCost.performance` 改為 nullable（schema、型別、測試一併改）。
- 移除上述守衛。**所有 `INCLUDED` 且能解析出 `canonicalModelId` 與 `profileId` 的成本列都必須保存**，不論該 profile 是否通過顯示門檻。
- `catalogCosts` 內同樣的 `performance === null` 守衛一併檢查，套用相同規則。
- 由呼叫端決定是否濾掉 null：`buildWeightedCostCurve`（預設圖）必須濾，進階圖不濾。
- 重跑 `pnpm data:v2:build-current`，回報新的 `versionId`、成本列數、以及具兩個以上帶成本 effort profile 的模型數。
- **不得**為了讓數字變好看而放寬 §5.2 的顯示門檻，或改動 `display-set.json`（那是審核關卡 2 的產物，已定案）。

**完成條件**：有測試以「profile 的 `overallScore` 為 null 但有成本列」的 fixture 證明該成本列仍保存在 ProductVersion 中；重建後具兩個以上帶成本 effort profile 的模型數大於 0（預期 21 個左右）。

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

狀態：未開始（**相依：D4 必須先完成**）

**目標**：實作規格 §6.3。

**要求**：

- **預設圖**：四來源加權，X 軸為混合正規化成本、Y 軸為 Overall Score。每個模型每個來源取最佳表現那一筆。
- **權重為四來源各 25%。** 取代 `view-model.ts` 現行的 `COST_SOURCE_WEIGHTS`（AA 40／LiveBench 40／DeepSWE 20，三來源時代的遺留值）。理由見規格 §6.3，不要自行調整。
- **進階圖**：按鈕開啟，顯示各模型多種思考強度的曲線，**同一模型的各強度點要連成線**。只用 Artificial Analysis、DeepSWE、Frontier Code。缺任一來源資料的模型不顯示。
- **進階圖的軸：X 軸＝該來源自己的成本，Y 軸＝該來源自己的分數。** 一條曲線只屬於一個來源，不跨來源聚合。多 effort profile 多半不是 8/8 完整、沒有 Overall Score，**不得為了湊 Y 軸而放寬 §5.2，也不得拿跨來源 Overall 去配單一來源成本**。
- 曲線上的點依 §4.4 的思考強度階梯排序（`non-reasoning < low < medium < high < xhigh < max`）；`default` 不上梯子，單獨標示。
- **Artificial Analysis 的 token 單價不得進入成本圖。** 進成本圖的是 `intelligenceIndexCostPerTask`。
- C4 已確認 Frontier Code 的成本與思考強度皆可取得（28 個模型、15 個具多 effort），進階圖維持三來源，不需要退化路徑。

**完成條件**：有測試證明 `API_STANDARDIZED` 成本不會進入任何一張成本圖；進階圖的「缺任一來源即不顯示」有測試；有測試證明進階圖的每個點其成本與分數來自同一個 `sourceId`。

## E4 — 開發者模式

狀態：未開始

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
