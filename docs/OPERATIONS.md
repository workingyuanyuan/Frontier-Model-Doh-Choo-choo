# 操作與資料流程

本文件負責日常工作流程、完成證據、異動判斷與審核交接。共用文件入口見 [文件索引](README.md)。

## 任務觸發與完成標準

「查核並更新最新 benchmark」、新模型資料更新，以及影響擷取、identity mapping、計分或 schema 的修正，預設完成下列流程：

**查核來源 → 匯入／重新物化快照 → 依核准政策重產 benchmark 集合 → 重建產品 → 驗證展示 → 比較異動 → 交付審核報告。**

先記錄任務工作目錄、起始 commit、既有變更，以及更新前 `current.json`、display set 與來源版本。比較基準應保存在本次操作不會覆寫的位置；不可把另一個 checkout 的未提交修改當成本任務已具備的輸入。

全站更新以 `data/mappings/sources.json` 的現役來源為範圍；指定來源或離線修正則記錄範圍與其餘快照日期。擷取修正必須以修正後的程式重新物化受影響資料。只讀來源、改好 parser、通過單元測試或成功建置舊產品，都不足以宣告更新完成。

代理負責完成可由程式、artifact 與公開證據裁決的檢查。完成證據包含各來源快照與驗證結果、重產集合、產品 `versionId`、建置與瀏覽器結果，以及 §5 的影響判斷和 §6 的報告。使用者收到的應是可審核、可部署的結果。

來源刷新、產品重建與發布是分開的操作。資料提交需使用者審核後明確指示；push、deploy、release 依使用者明確授權執行。來源、模型與計分政策的變更需有使用者裁決。

## 1. 安裝

```bash
pnpm install --frozen-lockfile
```

只需要 Node.js 24+ 與 pnpm 11+。不要設定 `DATABASE_URL`，也不要啟動容器或 migration。

## 2. 刷新來源

### 共用擷取安全政策

新增來源時使用 `refresh-utils.ts` 的 `captureArtifact`；需要自訂請求時使用
`safe-network.ts` 的 `acquisitionClient.get`。每個刷新程序共用
`acquisition-policy.ts` 的預算，所有來源套用相同限制：

| 項目                   | 預設上限        |
| ---------------------- | --------------- |
| 單一回應／整次下載量   | 32 MiB／512 MiB |
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

ZIP 使用 `safe-archive.ts` 的 `AcquisitionArchive`，同時檢查宣告大小與實際
解壓縮量。探索頁面使用 `mapAcquisitionItems`，在發送請求前限制項目數，並在
回呼內完成解析，只回傳後續需要的結構化資料。Vals 即採用此方式釋放每頁原始
HTML。ESLint 會攔截 adapter 直接使用 fetch 或底層網路／ZIP 套件。

超過限制會中止操作並回報錯誤。若資料規模需要調整，集中修改共用政策並補上
邊界測試；不要在個別網站 adapter 內另設不受控的下載或解壓縮路徑。

來源快照與成本使用相同 materializer：

```bash
pnpm --filter @llm-bench/acquisition materialize:artificial-analysis -- --visual-profile-count=<count>
pnpm --filter @llm-bench/acquisition materialize:livebench -- --visual-profile-count=<count>
pnpm --filter @llm-bench/acquisition materialize:deepswe -- --visual-model-count=<count>
pnpm --filter @llm-bench/acquisition materialize:frontier-code -- --visual-row-count <count> --visual-top-ten-matched
pnpm --filter @llm-bench/acquisition materialize:epoch
pnpm --filter @llm-bench/acquisition materialize:arc-prize
pnpm --filter @llm-bench/acquisition materialize:zapier
pnpm --filter @llm-bench/acquisition materialize:vals
pnpm --filter @llm-bench/acquisition materialize:effort-reports
```

上述 AA、LiveBench、DeepSWE、Frontier Code 四個命令必須先核對渲染後頁面的可見母體數，並把實測值傳入。Artificial Analysis 的命令會組合 evaluation RSC、`/models` 與現役 profile 的
`/models/<slug>` detail payload；`ARTIFICIAL_ANALYSIS_API_KEY` 僅從 gitignored
`.env.local` 讀取，官方 API 失效時記錄 warning，不阻斷頁面管道。

Frontier Code 必須先開啟渲染後頁面，核對 Main 列數與 Top 10，再執行帶有
`--visual-row-count` 與 `--visual-top-ten-matched` 的刷新命令。腳本會擷取頁面
JSON-LD 與官方靜態 JSON；未提供 DOM 核對結果時會拒絕標記完成。

本次範圍內各站完成後執行 `materialize:effort-reports`；它只替換 validation report 中
標記過的推測區段，保留每站刷新產生的可見母體核對與前後 delta。

刷新完成後逐站檢查：

- artifact 是來源回傳的真實 bytes，SHA-256 與 byte length 相符。
- SourceManifest 的 URL、角色、方法、時間與 `FULL`／`PARTIAL_SOURCE` 正確。
- Evidence locator 可指回原始欄位。
- Candidate／CostRecord 的 evidenceIds 全部存在。
- 官方母體、分頁或人眼可見列數與取得列數已對照。
- 結構化資料與畫面衝突已揭露，沒有模糊 identity 猜測。

來源刷新失敗時停止本次資料建立；既有 `current.json` 不受影響。

## 3. 重產集合與建立目前版本

每次刷新都依 `data/mappings/display-set-policy.json` 的核准政策重產集合，再建立產品。集合決定展示資格與計分基準，必須納入前後比較。

```bash
pnpm report:coverage-matrix
pnpm data:generate-display-set
pnpm data:build-current
```

coverage 報告與 generator 應使用相同資料及參考日期；跨日執行時明確固定日期。記錄使用的政策、日期、預設集合與輸出。`data:build-current` 只讀取現有 `display-set.json`，不會替代前兩步。

允許依現有政策重算 `presets`，不代表可以改變 `requiredModelIds`、模型數範圍、預設集合選擇規則、來源約束或選集演算法。若現有政策無法產生合法集合，先排除資料／實作問題；確需政策裁決時，提供失敗證據及可行方案，不以放寬門檻讓流程通過。

產品建立命令會：

1. 驗證所有 manifest、Evidence、Candidate、CostRecord 與 mapping schema。
2. 套用 canonical identity、effort-only Profile 與來源衝突規則。
3. 依據來源資料與人工指定清單建立 Frontier 模型集合。
4. 計算五維、Overall 與 cost point；主畫面另依 display set 驗證完整矩陣。
5. 產生 canonical deterministic JSON 及內容 `versionId`。
6. 驗證內容 hash 後寫入 `data/product/current.json`。

`current.json` 是單一可變工作區輸出；使用者審核前不得提交。固定資料、設定與 `generatedAt` 才會產生相同內容與 `versionId`；僅時間戳造成的 hash 改變不代表來源已刷新。

## 4. 開發與建置

```bash
pnpm --filter @llm-bench/bench dev
pnpm --filter @llm-bench/bench build
```

Dashboard 建置固定讀取 `data/product/current.json`，不讀取來源、artifact、網路或資料庫。**頁尾直接顯示完整 `versionId`；頁首顯示的是縮寫，完整值在該元素的 `title` 屬性上**（見 `apps/bench/components/version-header.tsx`），核對時請以頁尾為準。目前資料沒有預覽通道，也不產生 noindex metadata。

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
- 缺值不是零，Composite index 未重複投入五維。
- Representative Profile 取最高 Overall，且 display set 的每個 benchmark 都有 INCLUDED、非 null 分數。

### UI

- 主畫面五個維度不出現 N/A；Developer mode 的缺格與 partial-coverage 清單分開，後者只顯示已有維度，不給 Overall 或排名。
- Profile selector 只提供仍通過完整矩陣與 no-N/A 門檻的 Profile，並同步更新雷達與 Evidence。
- Leaderboard／Evidence 排序與 Included／Excluded 出處正確。
- 桌面、行動、鍵盤與無障礙檢查通過。

### 更新前後影響

先在相同 benchmark 集合、相同模型與 effort 下比較新舊資料，再比較本次重產集合的最終展示，將資料變化與集合變化分開說明。比較涵蓋預設集合與其他可選集合；集合 ID 相同也要核對實際 benchmark 組成。

- 列出模型新進、退出與缺格原因，並檢查代表 profile／effort 是否改變。
- 列出既有模型的舊／新五維與 Overall、分數差、舊／新排名及名次差；區分新模型加入造成的名次平移與既有模型相對順序改變。
- 列出集合的 benchmark／來源增減、模型數選項及預設集合變化。
- 區分來源數值更新、來源 benchmark／指數版本切換、集合組成改變、identity／effort 修正的影響；結論需指回具體證據。
- AA Intelligence Index 不直接投入五維 Overall，但可能影響外部指標、進階成本圖或 Frontier 選模。換版時逐一查證實際受影響的視圖及底層 benchmark，不把指數變動直接當成主榜分數變動。

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
2. 產出 `docs/refresh/<YYYY-MM-DD>.md` 刷新審核報告（格式參考 [2026-08-20.md](refresh/2026-08-20.md)），內容必須涵蓋：
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
pnpm --filter @llm-bench/bench build  # Next.js 靜態生產建置
pnpm e2e           # playwright 端對端測試（必須排在 build 之後）
pnpm audit --audit-level high  # CI 的相依套件公告門檻
```

### Display-Set 取捨報告

```bash
pnpm report:coverage-matrix
```

此命令輸出模型 × benchmark 矩陣與集合取捨曲線。依 §3 以核准政策生成集合，依 §5 比較影響；需要改變政策時才交由使用者裁決。

**`--require`：把必選 benchmark 釘死。**

```bash
pnpm report:coverage-matrix -- --require=deepswe-1-1,frontier-code-1-1
```

可重複 `--require <id>`，也可用逗號分隔。給定之後，曲線上**每一個**組合都會包含這些 benchmark，低於必選數量的規模不再產生列。

沒有這個選項時，最佳化回答的是「挑哪些 benchmark 能讓完整模型數最多」，而那不一定是實際要問的問題。2026-08-22 的實例：未加約束的 N=17 之所以能到 15 個模型，是因為它把 `frontier-code-1-1` 整個拿掉——對它被問的問題來說是正確答案，對真正的問題來說是錯的，因為那等於讓一整個來源退出主畫面的資格判定。釘死必須繼續把關的來源之後，曲線回答的才是「在不掉模型的前提下門檻能拉多嚴」。

不是現行 active benchmark 的 ID 會直接讓命令失敗，而不是被忽略——打錯字若被忽略，產出的會是未加約束的曲線，而且看不出來。

CI 的支援路徑只允許 schema、資料 builder、三個新 workspace、靜態 build、瀏覽器／無障礙與依賴安全檢查；不得啟動 DB service、Docker、舊 Web fixture、Worker 或影片 render。

## 8. Artifact 保存

`artifacts/` 不進 Git。每次成功擷取後應把內容定址 bytes 同步至耐久儲存；Evidence metadata 不能取代原始 artifact。artifact store 暫時不可用時，新快照不得標為驗證完成。

## 9. 已移除命令

任何 `db:*`、Compose、migration、seed、Edition、LiveBench ingest／score／promote、舊 weekly Worker、舊 Web E2E 或 video render 命令都屬已移除流程。不要在 runbook、CI 或故障排除中恢復；需要新能力時，應在目前三個 workspace 與靜態資料邊界內另行設計。

## 10. 任務與文件維護

開始工作先讀 [文件入口](README.md)，再讀受影響的主題契約。每個任務保持單一目的與可驗證的完成條件；延續既有授權，日常可逆實作與可由證據裁決的問題由代理完成，產品政策與無法裁決的衝突交給使用者。

- 保留使用者既有變更。辨識當前 worktree 與起始 commit；舊 worktree、歷史文件及對話交接不能替代實際輸入。
- 沿用三個 workspace 與靜態資料邊界；詳見 [架構](ARCHITECTURE.md) 與 [移除項目](REFACTOR_DISCARD_LIST.md)。現役來源按刷新流程維護，凍結來源保持歷史資料；不得用猜測 identity、補零或綜合指數替代缺失成績。
- 變更架構、產品行為、schema、mapping、計分、來源或操作命令時，同一次任務同步負責的權威文件與必要測試。其他入口使用連結，避免複製流程。
- 對純文件變更檢查格式、連結、指令／路徑存在性及契約一致性；程式與資料變更按受影響範圍驗證，完整發布驗證依 §7。建置舊資料成功不能取代刷新完成證據。
- 結案前核對任務狀態、使用者審核證據與實際輸出；機械驗證通過與人工接受分別記錄。仍有效的待辦移入現行文件，再將完成計畫或一次性報告標記歷史、移至 `history/` 並修正引用。
- 歷史文件保留當時內容；新增封存說明、來源路徑與結案證據，不把舊數量或舊契約更新成假造的歷史。產出報告標示資料日期與生成依據。
- 已授權提交時，逐一加入本任務檔案、檢視 diff，以單一目的 commit 保存可回復邊界。`current.json` 與刷新審核材料依 §6 的資料審核閘門處理。
- 交付說明具體結果、驗證證據、重要影響與待裁決事項；只有證據完整才宣告完成。
