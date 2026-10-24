# 操作與資料流程

## 前沿集合政策產物

正式產品使用 `pnpm data:build-current` 建置。此指令會重新判定 AA 前沿集合並套用 v2 分類及品質政策，產生合格前沿模型前 2～10 名的拉桿集合；預設集合從前 8 名（`aa-frontier`）開始，共同測試數相同時延伸，規則見[前沿政策](FRONTIER_POLICY.md#模型資格)。排名資料驗證失敗時停止。

依 [前沿政策](FRONTIER_POLICY.md)，`pnpm data:generate-frontier-set` 會產生 `data/mappings/frontier-set.json` 及同目錄的 `frontier-selection-audit.json`，產品建置則會再次呼叫同一生成器並寫入這兩份檔案，再由本次 cohorts 建立記憶體中的 display set，驗證後建立產品。日常資料發布統一透過 `pnpm data:release` 依序執行來源與證據核對、前沿集合產生與 audit 狀態檢查、產品重建、可重現性驗證、靜態網站建置與 e2e 測試；集合與產品差異的人工審閱移至事後的刷新報告。完整輸入、寫入範圍與停止條件見 §3。

本文件負責日常工作流程、完成證據、異動判斷與審核交接。共用文件入口見 [文件索引](README.md)，代理執行守則見 [AGENTS.md](../AGENTS.md)。

## 任務觸發與完成標準

「查核並更新最新 benchmark」、新模型資料更新，以及影響擷取、identity mapping、計分或 schema 的修正，預設完成下列流程：

**查核來源 → 匯入／重新物化快照 → 執行 `pnpm data:release`（退出碼為 0 且 receipt 的 `status` 為 `complete`）→ 依 `report.md` 與 §5–6 撰寫刷新報告交付審核。**

匯入來源前，先記錄任務工作目錄、起始 commit、既有變更，以及更新前 `current.json` 的完整 `versionId`、frontier 集合、selection audit、政策與來源版本。匯入來源**之前**的比較基準仍需自行保存在不會被覆寫的位置（`pnpm data:release` 內建的 `baseline/` 是在匯入之後執行時才保存）；不可把另一個 checkout 的未提交修改當成本任務已具備的輸入。

全站更新以 `data/mappings/sources.json` 的現役來源為範圍；指定來源或離線修正則記錄範圍與其餘快照日期。擷取修正必須以修正後的程式重新物化受影響資料。只要改動了來源快照、會被讀取的 mapping 或 `packages/benchmark-data/src/` 的計分／建置程式，就必須在同一次任務內執行 `pnpm data:release`；只讀來源、改好 parser、通過單元測試或成功建置舊產品，都不足以宣告更新完成。

代理負責完成可由程式、artifact 與公開證據裁決的檢查。完成證據包含各來源快照與驗證結果、`artifacts/releases/<run-id>/` 的 `receipt.json`（`status: "complete"`）與 `report.md`、重產集合、產品 `versionId`、靜態建置與瀏覽器測試結果，以及 §5 的影響判斷和 §6 的刷新報告。若 `pnpm data:release` 失敗且無法在任務內排除，必須把 receipt、失敗步驟與錯誤訊息如實交給使用者，不可宣稱已完成。使用者收到的應是可審核、可部署的結果。

### 每日 benchmark 查核的兩份文件

每日查核會產生兩種紀錄，分工不同：

| 文件                                                                     | 內容                                                                                                                                                                           | 何時產生                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `docs/research/<YYYY-MM-DD>-benchmark-update-check.md`（附同名 `.json`） | 聯網查核：上游新 benchmark、新模型、方法或版本變更，範圍不限於現役來源。原始擷取放在 `artifacts/research/<YYYY-MM-DD>-benchmark-check/`，JSON 保存逐欄差異、來源時間與 SHA-256 | 每次查核                   |
| `docs/refresh/<YYYY-MM-DD>.md`                                           | 資料更新審核：匯入現役來源後 `pnpm data:release` 的結果、產品差異與抽查清單（§6）                                                                                              | 有匯入或重新物化現役來源時 |

查核發現現役來源有變，才進入匯入與 `pnpm data:release`；只有非現役來源的消息時，寫查核文件即可。

機械驗證通過與使用者核准是兩件事：`complete` 只代表機械檢查通過，receipt 的 `review` 欄固定為 `pending-user-review`。來源刷新、產品重建與發布是分開的操作；資料提交（含 `data/product/current.json`）需使用者審核後明確指示，push、deploy、release 依使用者明確授權執行。來源、模型與計分政策的變更需有使用者裁決。

## 1. 安裝

```bash
pnpm install --frozen-lockfile
```

使用 Node.js 24+ 與 pnpm 11+。採集紀錄使用 Node.js 內建 SQLite；首次初始化、查詢、匯出與備份還原見 [證據儲存與操作](EVIDENCE_STORE.md)。

### Linux／WSL 開發環境

使用 Linux 內安裝的 Node.js 與專案指定的 pnpm 11.7.0。在專案根目錄執行 `./start-bench-review.sh`，腳本會依 lockfile 安裝依賴、編譯 `benchmark-data`，再啟動 `http://localhost:4000`；可傳入 port 作為第一個參數。開啟瀏覽器驗收，按 `Ctrl+C` 停止服務。

跨作業系統搬移時，在目標環境重新安裝依賴與產生建置輸出。WSL 專案建議放在 Linux 檔案系統中。來源作業需要的 `artifacts/` 與 `.env.local` 受 Git 忽略，須另外搬移；其中 artifact 保存規則見 §8，AA API 金鑰用途見 §2。

Linux 瀏覽器測試首次執行前，安裝 Chromium 與系統函式庫；系統套件安裝可能要求 sudo 密碼：

```bash
pnpm exec playwright install --with-deps chromium
```

之後依 §7 先完成 production build，再執行 `pnpm e2e`。

## 2. 刷新來源

### 共用擷取安全政策

新增來源時使用 `refresh-utils.ts` 的 `captureArtifact`；需要自訂請求時使用
`safe-network.ts` 的 `acquisitionClient.get`。每個刷新程序共用
`acquisition-policy.ts` 的預算，所有來源套用相同限制：

| 項目                   | 預設上限        |
| ---------------------- | --------------- |
| 單一回應／整次下載量   | 32 MiB／2 GiB   |
| 請求數（含重新導向）   | 1,024           |
| 探索項目／批次並行數   | 512／6          |
| 單次請求／整次刷新時間 | 120 秒／30 分鐘 |
| 每次請求重新導向       | 5 次            |
| ZIP 輸入／項目數       | 32 MiB／1,024   |
| 單一項目／累計解壓縮量 | 16 MiB／64 MiB  |

目的地必須是公開 IP 的 HTTPS 443；DNS 的所有回覆均須通過檢查，連線固定使用
已驗證的 IP，每次重新導向重新檢查。帶有自訂憑證標頭的請求不得跨 origin
重新導向。HTTP 要求 identity encoding，遇到其他編碼會終止擷取；回應串流
即時計算位元組，即使沒有 Content-Length 仍會套用上限。

讀取連線遭 `ECONNRESET` 重設時，同一次 GET 最多重試兩次（包含重新導向的
整條請求鏈）。每次重試重新驗證公開 DNS 目的地，並計入請求次數；已讀取的
位元組不退回下載額度。重試共用原請求截止時間，不重試 HTTP 錯誤、其他網路
錯誤或安全／預算限制錯誤。

ZIP 使用 `safe-archive.ts` 的 `AcquisitionArchive`，同時檢查宣告大小與實際
解壓縮量。探索頁面使用 `mapAcquisitionItems`，在發送請求前限制項目數，並在
回呼內完成解析，只回傳後續需要的結構化資料。Vals 即採用此方式釋放每頁原始
HTML。ESLint 會攔截 adapter 直接使用 fetch 或底層網路／ZIP 套件。

超過限制會中止操作並回報錯誤。若資料規模需要調整，集中修改共用政策並補上
邊界測試；不要在個別網站 adapter 內另設不受控的下載或解壓縮路徑。

來源快照與成本使用相同 materializer：

```bash
pnpm --filter @llm-bench/acquisition materialize:artificial-analysis -- --visual-profile-count=<count>
pnpm --filter @llm-bench/acquisition materialize:livebench -- --visual-profile-count=<2.0 rows> --visual-v1-profile-count=<1.0 rows>
pnpm --filter @llm-bench/acquisition materialize:deepswe -- --visual-model-count=<count>
pnpm --filter @llm-bench/acquisition materialize:frontier-code -- --visual-row-count=<count> --visual-top-ten-matched
pnpm --filter @llm-bench/acquisition materialize:frontier-swe
pnpm --filter @llm-bench/acquisition materialize:chartography -- --visual-row-count=<count>
pnpm --filter @llm-bench/acquisition materialize:complex-constraints -- --visual-row-count=<count>
pnpm --filter @llm-bench/acquisition materialize:corecraft -- --visual-row-count=<count>
pnpm --filter @llm-bench/acquisition materialize:riemann -- --visual-row-count=<count>
pnpm --filter @llm-bench/acquisition materialize:dayjob-finance -- --visual-row-count=<count>
pnpm --filter @llm-bench/acquisition materialize:dayjob-healthcare -- --visual-row-count=<count>
pnpm --filter @llm-bench/acquisition materialize:gdp-xlsx -- --visual-row-count=<count>
pnpm --filter @llm-bench/acquisition materialize:epoch
pnpm --filter @llm-bench/acquisition materialize:arc-prize
pnpm --filter @llm-bench/acquisition materialize:zapier
pnpm --filter @llm-bench/acquisition materialize:vals
pnpm --filter @llm-bench/acquisition materialize:effort-reports
```

### 來源變更監測

上述命令中，除了離線產生檔位推測報告的 `materialize:effort-reports`，其餘 17 個線上刷新命令都透過 `refresh-with-audit.ts` 接上共用監測：執行前讀取來源快照，來源刷新成功後比較 benchmark、版本、指標、模型及設定覆蓋。既有排程沿用這些 package 命令即可執行監測；直接呼叫個別 `refresh-*.ts` 不會經過包裝器。

AA、Vals、Surge 另擷取即時官方 benchmark 目錄，比較新增、移除連結及名稱／版本異動。Vals 既有的動態頁面擷取照常運作。其他現役來源目前比較刷新前後的已物化快照；報告的 `scope` 明確標示此範圍，不能據此宣稱已掃描其上游所有新 benchmark。

```bash
pnpm report:source-changes
pnpm report:source-changes -- --sources=artificial-analysis,vals-ai
pnpm report:source-changes -- --offline
pnpm report:source-changes -- --check
```

獨立命令檢查目錄與現有快照，不刷新模型成績。`--offline` 不存取網路、不推進即時目錄基準；`--check` 在本次檢查有待審閱項目時回傳非零狀態，適合排程要求明確回報。一般模式在待審閱項目存在時仍完成報告；擷取或解析失敗一律回傳非零狀態，保留該來源上次成功的監測基準。

輸出為 `data/source-monitoring/REPORT.md`、`current.json` 及 `state/<source-id>.json`；原始目錄回應保存到內容定址 artifact，每次完整報告另留存於 `artifacts/source-monitoring/`。初次執行建立基準，既有未整合項目列入清單，但不冒稱是本次才新增。子集檢查保留其他來源報告及各自檢查時間。

目錄清單區分是否登記擷取，以及 `scored`、`captured-not-scored`、`supported-no-scores`、`unintegrated`、`reviewed-deferred`。`scored` 指來源已有 INCLUDED 候選列，不保證其模型已通過產品的 identity、前沿資格與共同集合條件。版本只採官方目錄明示值；缺失保持 unknown。模型覆蓋使用 canonical ID；設定覆蓋保留來源名稱、effort、thinking、harness、tools、quantization、attempts 與 context window，總數不變的成員流失也會回報。

`data/mappings/source-monitoring.json` 保存明確的暫緩決定與原因。新 benchmark 的發現不會自動改變維度、來源優先序或計分政策；依使用者決定完成整合及驗證後再採用。暫緩項目若發生目錄版本變動仍會出現在差異報告中。

### 模型發布頁

已接入的逐頁清單、方法差異與重建步驟見 [2026-10-04 採用查核](research/2026-10-04-release-adoption.md)。OpenAI／Anthropic 的 snapshots 與 costs 會處理各自全部已保存發布頁；Google／xAI 使用各自的離線重建器。

#### 主動尋找補充來源

資料收集代理在來源快照、排行榜或官方公告發現新模型、新 checkpoint／別名改指，或現役模型缺少 benchmark／effort／任務成本時，應在同次研究中主動搜尋模型供應商的官方發布頁。搜尋範圍包含模型目錄與來源新出現的模型；以當期前沿集合、已知缺口和新發布模型安排優先序。

從官方公告查到原始推出文章後，沿文內連結查找 model card、system card、技術報告、評測方法與更新公告。也檢查其他供應商新文章中的同模型比較列。用 canonical model、checkpoint、發布日期核對身分，保存原始 URL、語言版本、觀測日期、benchmark／版本、metric、effort、harness、tools、attempts、fallback 與成本單位；未知設定明確保留缺值。

在本次研究／刷新報告中維護候選清單：模型、官方連結、能補充的項目、現有缺口、已讀證據及後續查核條件。依序標示「已定位」「已讀方法」「已完成逐列核對」「已整合」。搜尋摘要與文章比較圖只作發現依據；逐 benchmark 套用 [發布頁採用方法](DATA_METHODOLOGY.md#模型發布頁補充分數)，並檢查官方主辦方重疊列。分數相同只能證明數值一致；執行者與環境需有方法註腳支持。Quality vs. Cost 所需的任務成本須與同模型、同檔位、同版本的分數一起查找和驗證。

候選探索紀錄見 [2026-10-04 模型發布頁研究](research/2026-10-04-model-release-candidates.md)。此步驟由執行資料收集任務的代理完成；來源變更監測命令的實際探索範圍仍以其輸出 `scope` 為準。

OpenAI 頁面以瀏覽器讀取已載入的 DOM／RSC，擷取 `linkId=deepswe` 與 `linkId=automationbench` 的 Vega `data.values`，同時核對圖說的 1.1 與 1.0.6 版本。保存成 `vendor-chart-capture-v1` JSON；格式見 `data/sources/openai-releases/reviewed-capture.json`。每列保留 `model`、`modelLabel`、`effortLabel`、`order`、`score`、`cost`。這是有界、正規化的瀏覽器擷取摘錄，artifact metadata 明確標示，不冒充完整 HTTP bytes。`reviewed-capture-index.json` 為每頁保存實際 `observedAt`，離線重跑保持原始時間。

```bash
pnpm --filter @llm-bench/acquisition materialize:vendor-releases -- --openai-capture-index ../../data/sources/openai-releases/reviewed-capture-index.json
```

命令使用共用安全擷取器取得 Anthropic 原始 HTML 與 Cursor 官方核對頁；解析 FrontierCode Main 與 CursorBench 的內嵌 CSV，再以現有 DeepSWE、Zapier、FrontierCode 官方快照核對。各來源在寫入前必須完成全部檢查，分數不一致即停止；經研究確認需保留的衝突列明確排除。`cross-checks.json` 保存逐列分數、來源與比較結論。新增圖表、版本或模型需要重新審核解析器與核對依據。

`materialize:snapshots` 可由內容定址 artifact 離線重建兩個來源，使用原取得時間並重新執行交叉檢查。接續執行 effort report、§3 的 frontier 生成及產品建置，交付逐集合影響報告；需要分析覆蓋取捨時另產 coverage report。

上述 AA、LiveBench、DeepSWE、Frontier Code 四個命令必須先核對渲染後頁面的可見母體數，並把實測值傳入。Artificial Analysis 的命令會組合 evaluation RSC、`/models` 與現役 profile 的
`/models/<slug>` detail payload；`ARTIFICIAL_ANALYSIS_API_KEY` 僅從 gitignored
`.env.local` 讀取，官方 API 失效時記錄 warning，不阻斷頁面管道。

Frontier Code 必須先開啟渲染後頁面，核對 Main 列數與 Top 10，再執行帶有
`--visual-row-count` 與 `--visual-top-ten-matched` 的刷新命令。腳本會擷取頁面
JSON-LD 與官方靜態 JSON；未提供 DOM 核對結果時會拒絕標記完成。

本次範圍內各站完成後執行 `materialize:effort-reports`；它只替換 validation report 中
標記過的推測區段，保留每站刷新產生的可見母體核對與前後 delta。

Chartography 先核對主榜的渲染列數，再傳入 `--visual-row-count=<count>`。解析器限定主榜區塊，逐列比對 `data-score` 與文字百分比；相關評測卡片及另一份成本圖資料不屬於該主榜快照。來源 HTML 保存於 artifact store，可由 `materialize:snapshots` 離線重建。

FrontierSWE V2 擷取官方頁面的完整 `entries.abs.mean`，以 coverage matrix 的模型／harness 清單確認母體，並核對伺服器渲染榜單的 mean@5 分數。`frontier-swe-v2` 在 benchmark mapping 設定 `comparisonOnly: true`，僅用於手動 profiles 的共同 benchmark 比較。重產預設集合時會套用此範圍設定。

LiveBench 需核對兩個畫面：`--visual-profile-count` 是 2.0 主榜（`https://livebench.ai/#/`）的渲染列數；`--visual-v1-profile-count` 是 1.0 歷史 release 頁（`#/release/2026-06-25`）啟用 Include finetunes 後的列數。1.0 匯出仍保留兩個已不在畫面的 bare slugs：`deepseek-v4-flash`、`deepseek-v4-pro`；腳本僅精確扣除這兩筆再比對可見數，不能用前綴排除仍可見的 Vision Exp。原始匯出列仍保留。若來源改變此關係，重新查核畫面與匯出，不調整人工數字以繞過檢查。2.0 與 1.0 的處理規則見 [SPEC §9.1](SPEC.md#91-livebench)。

2026-09-23 起亦核對來源 bundle 明示的 variants 分組：同組有多個 CSV 檔位時，主表只顯示一列，核對數量按分組折算，候選成績與成本仍各自保留。

Epoch 同時支援歷史 `epoch_capabilities_index.csv` 與目前 `epoch_capabilities_index/eci_scores.csv`；目前格式必須有 `model_metadata.csv` 對照 direct benchmark run version。family-level ECI 的日期是模型日期，不是檔位或 benchmark 版本；未宣告版本保存 null，綜合指數保持 EXCLUDED。

刷新完成後逐站檢查：

- artifact 是來源回傳的真實 bytes，SHA-256 與 byte length 相符。
- SourceManifest 的 URL、角色、方法、時間與 `FULL`／`PARTIAL_SOURCE` 正確。
- Evidence locator 可指回原始欄位。
- Candidate／CostRecord 的 evidenceIds 全部存在。
- 官方母體、分頁或人眼可見列數與取得列數已對照。
- 結構化資料與畫面衝突已揭露，沒有模糊 identity 猜測。

來源刷新失敗時，refresh 腳本在通過檢查前不寫入，該來源保留上一份快照；既有 `current.json` 不受影響。依失敗原因處理：

- **上游與 adapter 不符**（版面改版、母體或列數互相矛盾等公開資料問題），且已確認不是本專案程式錯誤：可以沿用該來源的舊快照，繼續其他來源與 `pnpm data:release`。刷新報告的「已知未解」必須寫明失敗命令、錯誤訊息、上游證據與沿用快照的日期。若要放寬 adapter 的採用規則，屬於來源採用規則的變更，交使用者決定。
- **其他失敗**（網路、權限、預算限制、本專案程式錯誤、證據庫驗證失敗）：先排除再繼續，不得以舊快照帶過。

`pnpm data:release` 的 `sources` 步驟會再核對每個現役來源的快照與 artifact 一致，半寫入的快照不會通過。

## 3. 重產集合與建立目前版本

正式流程依 [前沿政策](FRONTIER_POLICY.md) 從已保存快照依同版 AA Intelligence Index 排名，取前十個具備至少 2 個獨立組織成績的合格模型，再對前 2～10 名各自求共同合格測試。每組 cohort 保存模型、AA 勝出 profiles、benchmark 與逐列 evidence，產品以這九組 cohorts 建立 presets；前 8 名的 ID 為 `aa-frontier`，實際預設集合記錄在 `defaultPresetId`。

模型數範圍 2～10 與預設從 8 開始延伸是目前核准設定；2026-10-04 基準資料的預設集合含 17 項共同測試，是快照與品質政策計算的結果。後續依本次輸入重算，報告實際增減及 evidence，不把 17 當成固定門檻。

### 輸入與命令的寫入範圍

從 repository 根目錄執行下列命令。共同 loader 讀取 `data/mappings/` 的 `sources.json`、`models.json`、`profile-policy.json`、`benchmarks.json`、`frontier.json`，以及白名單來源目錄中的 `candidates.json`。後兩份 mapping 仍須通過 loader 的 schema 檢查；AA frontier 的選模、分類與品質判定另外使用 `frontier-identities.json`、`benchmarks-v2.json`、`benchmark-quality-v2.json`。

| 命令                              | 用途與輸出                                                                                                                                                                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm data:generate-frontier-set` | 讀取上述快照與 mapping，成功時寫入 `data/mappings/frontier-set.json` 及 `frontier-selection-audit.json`。                                                                                                                                                                                              |
| `pnpm data:build-current`         | 另讀各來源 `manifest.json`，有 `costs.json` 時讀取成本及 `evidence-index.json` 並檢查成本 evidence 參照。重新呼叫 frontier 生成器，具有相同集合／audit 寫入效果；由回傳的 `artifact.cohorts` 建立並驗證記憶體中的 `displaySet`，計算產品、驗證 schema 與內容 hash 後寫入 `data/product/current.json`。 |
| `pnpm data:verify-fresh`          | 不寫入任何檔案，以已提交（工作區）`current.json` 的 `generatedAt` 在記憶體中重算 frontier 集合、audit 與產品，三者任何一項與工作區檔案不同即失敗。                                                                                                                                                     |
| `pnpm data:release`               | 串聯完整發布驗證管線（`sources` → `evidence` → `frontier` → `product` → `fresh` → `tests` → `site` → `e2e`），將執行紀錄、基線副本與差異報告寫入 `artifacts/releases/<run-id>/`，並更新 `artifacts/releases/latest.json`。                                                                             |

`data:build-current` 不讀取既有 `display-set.json`，也不將記憶體中的 `displaySet` 寫成該檔案。它會重新產生 frontier，不能只憑上一次 `selected` audit 宣告本次成功。實作依據為 [frontier 生成器](../packages/benchmark-data/src/generate-frontier-set.ts)、[workspace builder](../packages/benchmark-data/src/workspace.ts)、[產品 CLI](../packages/benchmark-data/src/cli.ts) 與 [資料發布腳本](../scripts/data-release.mjs)。

### 必要操作順序

1. **保存比較基準。** 記錄 `git rev-parse HEAD`、`git status --short`、工作目錄及來源日期。`pnpm data:release` 會在執行開始時將當下的 `current.json`、frontier 集合、audit 與 mapping 自動複製到 `artifacts/releases/<run-id>/baseline/`；但**匯入來源之前的基準仍需在匯入前自行保存**（因為 `data:release` 是在匯入來源之後才執行，若中途重跑或分批匯入，`baseline/` 只會反映該次 `data:release` 啟動前的狀態）。既有未提交輸入也要保存；只記 commit 無法還原它們。
2. **確認輸入。** 完成 §2 的來源快照匯入／重新物化，核對上述 mapping 及核准政策。缺檔、schema 錯誤、identity 未解析或政策不符時先停止，保留現有產品並交付錯誤證據。
3. **執行 `pnpm data:release`。** 由腳本（`scripts/data-release.mjs`）依序自動執行下列步驟，任一步驟失敗即停止：
   - `sources`：核對作用中來源的 `candidates.json`／`costs.json` 引用的 Evidence 都存在，且每個 artifact 檔的 SHA-256 與 `byteLength` 相符。
   - `evidence`：執行 `pnpm evidence verify` 驗證證據庫完整性。
   - `frontier`：執行 `pnpm data:generate-frontier-set`，並要求 `frontier-selection-audit.json` 最外層 `status` 為 `selected`。
   - `product`：執行 `pnpm data:build-current` 重建 `data/product/current.json`，並再次檢查 audit 狀態為 `selected`。
   - `fresh`：執行 `pnpm data:verify-fresh`，確認工作區的 frontier 集合、audit 與 `current.json` 可由目前輸入完全重現。
   - `tests`：執行 `pnpm test`。部分單元測試會核對已保存快照的前十名與集合大小，資料改變後須依新快照更新斷言，並在刷新報告說明。
   - `site`：執行 `pnpm --filter @llm-bench/bench build`，並確認靜態匯出 `apps/bench/out/index.html` 顯示新的 `versionId`。
   - `e2e`：設定 `DATA_RELEASE=1` 執行 `pnpm e2e`（讓 Playwright 不沿用既有伺服器），驗證靜態建置成果。

```bash
pnpm data:release
```

每次執行都會寫入 `artifacts/releases/<run-id>/`（且 `artifacts/releases/latest.json` 指向最近一次）：

- `receipt.json`：記錄狀態（`complete`／`failed`）、`review`（固定為 `pending-user-review`）、各步驟退出碼與耗時、新舊 `versionId`、`inputs`／`outputs`／`implementation` 三組摘要與靜態匯出摘要（`exportDigest`）。
- `report.md`：自動產出與 **HEAD 已提交的 `current.json`** 相比的差異（HEAD 沒有該檔時才改用執行前的工作區檔案），所以前一次失敗的 release 即使已改寫工作區產品，也不會讓差異消失。內容包含計數、來源快照、合格前沿模型與被資格規則略過的模型、各集合的 benchmark 增減與模型進出／名次／Overall 變化，以及進入預設集合的 effort 推測。
- `baseline/`：執行前的 `current.json`、frontier、audit 與 mapping 副本。
- `logs/`：各步驟的完整輸出 log。

同時只能執行一個 release（有 lock 機制）；執行期間輸入或程式若被改動，release 會直接判定失敗。原本在建置前手動審閱 frontier 的步驟，改由 `data:release` 自動檢查 audit 狀態，人工審閱則集中於事後的刷新報告。

4. **交付審查。** 確認 `pnpm data:release` 退出碼為 0 且 `receipt.json` 的 `status` 為 `complete` 後，依 `report.md` 與 §5–6 撰寫 `docs/refresh/<YYYY-MM-DD>.md` 刷新審核報告，保存來源版本、政策、audit、逐集合差異及驗證證據，附上人眼可驗的抽查清單，再依資料提交與部署審核流程交由使用者審核。

### 停止條件與保存

判定是否繼續以 audit 最外層 `status` 為準：`selected` 表示本次排名及共同集合已通過生成器檢查，`needs-review` 表示停止並處理問題。內層 `gapAudit` 僅保存斷層計算供參考，其 `needs-review` 不會單獨阻擋目前固定前 2～10 名的政策。

AA 版本不可比較、前十名或合格前沿窗口內有未解析身分、合格模型不足十個、樣本不足或無法產生共同合格測試時，生成器寫入 `needs-review` audit 並回傳非零狀態（`pnpm data:release` 會在 `frontier` 或 `product` 步驟失敗並寫入 `status: "failed"` 的 receipt），保留原成功的 `frontier-set.json`。較早的讀檔／schema 錯誤可能尚未寫入新 audit，因此既有 `selected` 不能抵銷本次命令失敗。停止產品建立，保存 receipt、命令、退出碼、錯誤及本次 audit，先排除資料／實作問題；仍需政策裁決時交付具體證據。

產品驗證失敗發生在 `current.json` 寫入之前，保留現有產品；但成功生成的 frontier／audit 可能已更新。這些檔案與產品不是一次原子寫入，遇到 I/O 失敗須比對 `baseline/` 與保存基準確認各檔案狀態。生成命令會覆寫工作區集合／audit；匯入前的獨立基準副本、`artifacts/releases/<run-id>/baseline/` 及 Git 中已保存的歷史版本必須保留，不以新結果覆蓋歷史審核證據。

依政策重算 presets 時，模型數範圍、預設模型數、identity、來源約束、分類、品質及計分規則都須沿用核准設定。不得以放寬門檻讓失敗流程通過。

`current.json` 是單一可變工作區輸出；`receipt.json` 為 `complete` 只代表機械驗證通過，使用者審核前不得提交。CLI 使用執行當時的時間作為 `generatedAt`。固定資料、設定與 `generatedAt` 才會產生相同內容與 `versionId`；僅時間戳造成的 hash 改變不代表來源已刷新。

### 輔助覆蓋分析與相容產物

以下命令保留覆蓋最佳化分析與舊 display-set 產物的相容用途，按分析需要執行：

| 命令                             | 輸入與預設輸出                                                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm report:coverage-matrix`    | 使用共同 loader 的快照／mapping 及 `display-set-policy.json`，分析無來源約束與全來源兩條取捨曲線，寫入 `docs/COVERAGE_MATRIX_REPORT.md`。 |
| `pnpm data:generate-display-set` | 使用相同輸入與政策，在記憶體中重算兩條曲線、驗證後寫入 `data/mappings/display-set.json`；不讀取前一命令的 Markdown 報告。                 |

正式 AA frontier 流程的必要命令見上方步驟 3。輔助分析的 `requiredModelIds`、來源約束與預設選擇使用 `display-set-policy.json`，不能據此替代 AA 前沿政策。比較 coverage 報告與 display-set generator 時使用相同資料及 `--reference-date=YYYY-MM-DD`，記錄政策、日期與輸出路徑；兩者預設以當日 UTC 日期分析，跨日應明確固定日期。分析失敗時保留錯誤證據，不以舊報告宣稱本次分析成功。

覆蓋率的模型 presence mask 以 BigInt 精確計算；分析結果在安全整數範圍內使用 number，超出時使用十進位字串，避免評測數超過 53 項時遺失低位元。

## 4. 開發與建置

```bash
pnpm --filter @llm-bench/bench dev
pnpm --filter @llm-bench/bench build
```

Dashboard 建置固定讀取 `data/product/current.json`，不讀取來源、artifact、網路或資料庫。**頁尾顯示完整 `versionId`**（見 `apps/bench/components/dashboard.tsx`），核對時請以頁尾為準。目前資料沒有預覽通道，也不產生 noindex metadata。

## 5. 代理驗證與異動判斷

Agent 必須先完成所有可由 repository、artifact 或公開來源裁決的審核，不把機械檢查交給人工。

### 版本完整性

- `current.json` 的 schema、deterministic bytes 與內容 hash 一致。
- 重新建立結果的 `versionId` 與審核材料一致。
- ProductVersion 可在無網路、artifact、DB 或 Docker 時建置。

### 資料與計分

- 來源角色、時效、母體列數與 `FULL`／`PARTIAL_SOURCE` 敘述正確。
- canonical identity、alias 與 effort 歸屬可由證據支持。
- Harness、tools、attempt、thinking、context 沒有拆成 Product Profile。
- Included Benchmark 皆有主要維度映射；Excluded 不計分。
- 缺值不是零，Composite index 未重複投入能力維度。
- AA preset 使用該 cohort 的 AA 勝出 profiles，每個 profile 自身持有全部共同合格 benchmark 的 INCLUDED、非 null 分數。

### UI

- 核對目前選定 profiles 的共同合格測試與有效維度；沒有測試的維度不顯示欄位或雷達軸，沒有共同合格測試時不給 Overall 或排名。
- 切換模型數、模型或 effort 後，依 [計分方法](SCORING_METHODOLOGY.md) 重新求共同測試並套用品質政策，確認表格、雷達與 Evidence 同步；預設、清空及五軸／六軸切換均需驗證。
- Leaderboard／Evidence 排序與 Included／Excluded 出處正確。
- 桌面、行動、鍵盤與無障礙檢查通過。

### 更新前後影響

先在相同 benchmark 集合、相同模型與 effort 下比較新舊資料，再比較本次重產集合的最終展示，將資料變化與集合變化分開說明。比較涵蓋預設集合與其他可選集合；集合 ID 相同也要核對實際 benchmark 組成。

來源 delta 以上一次實際物化結果為基準；讀取上一份差異報告時取 `Refreshed` 欄，不能沿用其 `Previous` 欄。預設畫面比較使用各 cohort 的 AA 勝出 profiles 及共同合格測試，依有效維度重算分數與名次；手動選取則記錄實際模型及 effort，產品中所有非 null Overall 列不等於當次主榜模型。

- 列出模型新進、退出與缺格原因，並檢查代表 profile／effort 是否改變。
- 列出既有模型的舊／新有效維度與 Overall、分數差、舊／新排名及名次差；區分新模型加入造成的名次平移與既有模型相對順序改變。
- 列出集合的 benchmark／來源增減、模型數選項及預設集合變化。
- 區分來源數值更新、來源 benchmark／指數版本切換、集合組成改變、identity／effort 修正的影響；結論需指回具體證據。
- AA Intelligence Index 不直接投入能力維度 Overall，但可能影響外部指標、進階成本圖或 Frontier 選模。換版時逐一查證實際受影響的視圖及底層 benchmark，不把指數變動直接當成主榜分數變動。

### 繼續與交接

| 判斷                                             | 代理動作                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| 新模型尚未滿足門檻，或補齊資料後正常進榜         | 完成整個流程，報告展示與缺格結果                                               |
| 正常或輕微、可解釋的分數／排名／集合變化         | 繼續完成，在完成報告提醒並列出差異                                             |
| 計分口徑改變造成既有模型明顯重排，或異動無法解釋 | 完成可驗證的重建、展示驗證與具體差異報告後，停在審核階段，由使用者決定是否接受 |
| 資料驗證失敗，或核准政策無法產生合法產品         | 排除可修復問題；仍失敗時交付阻礙與證據，不把失敗產物宣告為可部署               |

「明顯」由代理結合受影響模型比例、名次位移、領先群相對順序、分差與版本可比性判斷，寫出具體理由；不自行發明固定數值閾值。排名輕微交換、近分模型互換或新模型正常入榜，本身不構成中途中斷理由。

只有以下問題交給人工：公開證據互相衝突且無法由版本或配置裁決；來源未公開必要資訊而無法不靠猜測判定；以及是否接受已揭露的殘餘產品風險。

任何修正都要重新生成新的 ProductVersion，不能直接改寫內容 hash。

## 6. 提交與部署

每次資料更新在完成 §2–5 後，依下列程序交付：

1. 刷新來源、依政策重產集合並執行 `pnpm data:build-current` 後，`data/product/current.json` 會以變更狀態留在工作目錄，**代理絕不得自動提交**。
2. 產出 `docs/refresh/<YYYY-MM-DD>.md` 刷新審核報告（格式參考最近一份報告，例如 [2026-10-23.md](refresh/2026-10-23.md)），內容必須涵蓋：
   - **舊／新 `versionId`**，以及模型數、排行榜列數、evidence 筆數、成本筆數各自的增減。
   - **主畫面的進出**：本次新進、退出主畫面的模型，各附原因（缺哪一格／補上哪一格）。
   - **§5 的完整差異與判斷依據**：主文摘要分數／名次變動最大者，附逐模型、逐集合對照；明確標示需使用者決定的事項。
   - 來源新舊快照與 benchmark／指數版本、資料日期、政策與集合組成；記錄來源查核、集合生成、產品重建及 UI 驗證各步驟結果。
   - **檔位推測揭露表（強制）**：本次有哪些 profile 的 effort 是推測出來的，依規格 §4.5 逐筆列出推測依據來源與依據列。缺這一項的報告不算完成。
   - 已知未解：擷取失敗、來源改版、無法解析的名稱。
   - 依風險排序的人眼可驗抽查清單。排序為：本次新進主畫面的模型（每個至少一筆）→ 分數變動最大的幾筆 → 檔位為推測而非來源標示的 profile → 每個來源至少一筆。每一筆必須寫成以下四欄：

     | 欄位     | 要求                                                         |
     | -------- | ------------------------------------------------------------ |
     | 網址     | 可直接點開的頁面，落在該數字所在的那一頁                     |
     | 頁面位置 | 該頁上的區塊或表格名稱，以及**網站上顯示的那個模型名稱字串** |
     | 欄位     | 網站上該欄的顯示名稱                                         |
     | 期望值   | 我們存的值，四捨五入到與網站相同的位數                       |

     驗證動作必須能被壓縮成「打開連結、找到這一列、比對一個數字」。**不得**把 `benchmarkId`、`profileId`、`evidenceId` 或 CSS 選擇器當成抽查指示交給使用者。

   - 驗證畫面的完整 `versionId`，與本次產品及報告一致。
3. **主動提示使用者進行人工抽查，並明確指名抽查哪幾筆資料、如何核對**。
4. 使用者完成審核並明確指示後，才可提交 `data/product/current.json` 與相關報告。
5. 部署由包含該資料的 Git commit 決定；部署前核對建置顯示的 `versionId` 等於審核值。

若需要 rollback，請對包含資料的 Git commit 執行 `git revert`，再以還原後的工作樹重新建置與部署。不要新增版本切換指令，也不要重抓來源或重算未變更的資料。

## 7. 驗證與報告命令

### 基準驗證清單

**順序不可調換**：`pnpm e2e` 的 `webServer` 以 `scripts/serve-static.mjs` 服務靜態匯出產物 `apps/bench/out`，因此必須排在 production build 之後。乾淨 checkout 下先跑 e2e 會因缺少該目錄而失敗。

```bash
pnpm install --frozen-lockfile
pnpm format        # prettier --check，只檢查不自動修改
pnpm format:write  # 需要自動修排版時使用
pnpm lint          # eslint 語法與型別規則檢查
pnpm typecheck     # turbo 跨套件型別檢查
pnpm test          # vitest 單元測試
pnpm data:verify-fresh  # 不寫入檔案，以已提交的 generatedAt 重算 frontier、audit 與產品並比對工作區檔案
pnpm --filter @llm-bench/bench build  # Next.js 靜態生產建置
pnpm e2e           # playwright 端對端測試（必須排在 build 之後）
pnpm audit --audit-level high  # CI 的相依套件公告門檻
```

### Release Receipt、Stop Hook 與 CI 檢查分工

資料更新的可重現性與完整性由三層機制共同把關，各自分工如下：

- **Release Receipt（`artifacts/releases/<run-id>/receipt.json` 與 `latest.json`）**：`pnpm data:release` 的本機執行憑證，記錄 `status`（`complete`／`failed`）、`review`（固定為 `pending-user-review`）、各步驟退出碼與耗時、新舊 `versionId`，以及 `inputs`、`outputs`、`implementation` 與靜態匯出的雜湊摘要。若執行期間輸入或程式被改動，release 會直接判定失敗。
- **Claude Code Stop Hook（`.claude/settings.json` → `scripts/agent-stop-gate.mjs`）**：本機代理提醒機制。當工作區改動了產品會讀取的來源快照、mapping、產品輸出或 `packages/benchmark-data/src/`，卻沒有與目前檔案雜湊相符的 receipt 時，會阻止代理結束回合。若 receipt 為 `failed` 則放行，讓代理能如實向使用者交付失敗原因；連續第二次阻擋時也會改為放行並提示使用者，避免無限迴圈。
- **CI 檢查（`pnpm data:verify-fresh`）**：排在 CI 的 `pnpm test` 之後執行，不寫入任何檔案，直接以已提交的 `generatedAt` 重算 frontier 集合、selection audit 與 `current.json`；三者任何一項與工作區（已提交）檔案不同即失敗。Stop hook 只是本機開發階段的防漏提醒，CI 的 `pnpm data:verify-fresh` 才是最終的權威檢查。

### AA 指數分版報告

從已驗證的 ProductVersion 產生逐列可追溯的 JSON 與 Markdown：

```bash
pnpm --filter @llm-bench/benchmark-data report:aa-index ../../data/product/current.json ../../docs/refresh/2026-09-08-aa-index.json ../../docs/refresh/2026-09-08-aa-index.md
```

輸出檔名依本次資料日期設定。比較兩次產品時，分別對保存的新舊 ProductVersion 執行。
AA 指數使用 `rawScore`（index points）；`normalizedScore` 為 null，不能用作報告分數。
排名只涵蓋產品收錄的同版本配置，以完整精度降冪排序，同分並列並跳號；版本未明不排名。
JSON 保留 result ID、Evidence ID、來源 URL 與 locator，缺少有效原始分數時直接拒絕產生報告。

### Display-Set 取捨報告

```bash
pnpm report:coverage-matrix
```

此命令輸出模型 × benchmark 矩陣與集合取捨曲線，用途及輸入見 §3 的輔助覆蓋分析。正式 AA frontier 依 §3 的必要步驟生成，依 §5 比較影響；需要改變政策時才交由使用者裁決。

日常報告依核准政策產生無約束與全來源曲線。`--require=a,b` 僅供探索指定 benchmark 必選時的影響，會約束兩條曲線，不作為日常集合生成政策。

CI 的支援路徑只允許 schema、資料 builder、三個新 workspace、靜態 build、瀏覽器／無障礙與依賴安全檢查；不得啟動 DB service、Docker、舊 Web fixture、Worker 或影片 render。

## 8. Artifact 保存

看板在建置時讀取已整理的 `data/product/current.json` 與 mapping，瀏覽器使用建置產物，因此 `artifacts/` 缺少時，既有產品仍可建置與正常瀏覽。`artifacts/` 保存採集端的原始證據，供核對來源內容、驗證雜湊，以及使用新版解析器離線重新物化快照；只有產品 JSON 無法還原完整原始回應。遷移後若要延續這些作業，須另外搬回原始 artifact store。

本流程的「耐久儲存」包含 SQLite 採集紀錄與本機 artifact store；完整備份與還原見 [證據儲存](EVIDENCE_STORE.md#備份還原與中斷恢復)。原始內容位於：工作目錄下的 `artifacts/sha256/<SHA-256 前兩碼>/<完整 SHA-256><副檔名>`。擷取程序將來源回傳的原始 bytes 依內容 SHA-256 寫入此處，供後續溯源與重新物化；檔案須在程序結束後持續保留，不作為可隨任務清除的暫存。架構依據見 [ARCHITECTURE 的 artifacts 說明](ARCHITECTURE.md#artifacts)，寫入實作見 [`writeContentAddressedArtifact`](../packages/acquisition/src/index.ts) 與 [`captureArtifact`](../packages/acquisition/src/refresh-utils.ts)。

每次成功擷取後，依本次快照 Evidence 的 `artifactPath` 回讀本機原始檔，核對 SHA-256 與 `byteLength`；全部相符才算完成 artifact 保存驗證。`artifacts/` 不進 Git，Evidence metadata 不能取代原始 artifact。若本次快照所需檔案缺失、無法讀寫或完整性不符，新快照不得標為驗證完成；報告須列出具體路徑與失敗證據。

現行流程未要求第二份外部備份，也未定義遠端儲存服務或同步命令。本機保存與上述驗證完成，即滿足本節要求；不得僅因沒有外部同步位置而判定使用者欠缺儲存設定或阻擋完成。另有使用者明確要求或已核准的備份政策時，才依其指定的目的地、操作方式與驗收條件執行額外備份。

## 9. 已移除命令

任何 `db:*`、Compose、migration、seed、Edition、LiveBench ingest／score／promote、舊 weekly Worker、舊 Web E2E 或 video render 命令都屬已移除流程。不要在 runbook、CI 或故障排除中恢復；需要新能力時，應在目前三個 workspace 與靜態資料邊界內另行設計。

## 10. 任務與文件維護

開始工作先讀 [文件入口](README.md)，再讀受影響的主題契約。每個任務保持單一目的與可驗證的完成條件；延續既有授權，日常可逆實作與可由證據裁決的問題由代理完成，產品政策與無法裁決的衝突交給使用者。

- 保留使用者既有變更。辨識當前 worktree 與起始 commit；舊 worktree、歷史文件及對話交接不能替代實際輸入。
- 沿用三個 workspace 與靜態資料邊界；詳見 [架構](ARCHITECTURE.md) 與 [移除項目](REFACTOR_DISCARD_LIST.md)。現役來源按刷新流程維護；不得用猜測 identity、補零或綜合指數替代缺失成績。
- 變更架構、產品行為、schema、mapping、計分、來源或操作命令時，同一次任務同步負責的權威文件與必要測試。其他入口使用連結，避免複製流程。
- 對純文件變更檢查格式、連結、指令／路徑存在性及契約一致性；程式與資料變更按受影響範圍驗證，完整發布驗證依 §7。建置舊資料成功不能取代刷新完成證據。
- 儲存在專案內的文件使用相對於該文件的連結；命令範例使用專案根目錄相對路徑，必要的外部位置使用有說明的佔位符。不得寫入個人電腦的磁碟代號、使用者家目錄或 worktree 絕對路徑。
- 結案前核對任務狀態、使用者審核證據與實際輸出；機械驗證通過與人工接受分別記錄。仍有效的待辦移入現行文件，再將完成計畫或一次性報告標記歷史、移至 `history/` 並修正引用。
- 歷史文件保留當時內容；新增封存說明、來源路徑與結案證據，不把舊數量或舊契約更新成假造的歷史。產出報告標示資料日期與生成依據。
- 已授權提交時，逐一加入本任務檔案、檢視 diff，以單一目的 commit 保存可回復邊界。`current.json` 與刷新審核材料依 §6 的資料審核閘門處理。
- 交付說明具體結果、驗證證據、重要影響與待裁決事項；只有證據完整才宣告完成。
