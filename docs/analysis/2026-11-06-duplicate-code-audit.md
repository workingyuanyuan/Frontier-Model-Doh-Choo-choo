# 重複程式碼合併查核

日期：2026-11-06。分支：`codex/consolidate-identical-code`。
基準 commit：`a41691b8b1dfdb8335ce7a798c12819b93cf5a38`，並以任務開始時的工作樹為差異基準。

完成 **33 組合併，程式碼淨減少 864 行**。統計包含新增共用模組、測試與 package export；排除文件、產生的產品資料，以及前一任務已刪除的 15 行。排序、格式化與圖表的關聯 helper 依同一功能群組計數。

## 查核方法

查核涵蓋三個 workspace、scripts、測試入口、package exports 與 CI。使用全庫 `rg`、TypeScript AST 函數本文比對（至少 25 tokens）、連續敘述區塊比對（2–6 個敘述、至少 200 字元），再人工核對參數、閉包、匯入、錯誤、執行順序及呼叫點。另查閱較短的格式化、物件判定與 Python／啟動腳本。

最後的函數本文掃描包含新增檔案，結果為空。區塊掃描剩餘項目經查核是共用函數的呼叫配置、來源資料宣告，或相同名稱指向不同實作的情況；例如 Chartography 與 ComplexConstraints 的 `configuration` 並非同一行為。

## 共用版本與呼叫點

下表路徑以 `packages/acquisition/src/`、`apps/bench/`、`packages/benchmark-data/src/` 為各區域基準。每組均保留原演算法；來源標籤、圖表邊界等值由呼叫點明確傳入。

| 組別 | 共用版本                                                       | 已指向共用版本的呼叫點                                                      | 選擇依據                                                                                        |
| ---- | -------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A01  | `surge-materializer-utils.ts`：`surgeText`                     | 8 個 Surge materializer                                                     | HTML、entity、空白替換的內容與順序相同。                                                        |
| A02  | `workspace-root.ts`：`getWorkspaceRoot`                        | refresh-utils、materializer-utils、snapshots、costs、FrontierCode、AA       | 向上搜尋 `data` 並在檔案系統根目錄拋錯；絕對路徑的 dirname／resolve 上層語意相同。              |
| A03  | `refresh-utils.ts`：`prettyDeterministicJson`                  | snapshots、costs、FrontierCode、AA                                          | 沿用既有 deterministic JSON 格式化與結尾換行。                                                  |
| A04  | `benchmark-data/src/node-utils.ts`：`readJson`                 | acquisition refresh-utils 重新導出；costs、AA、monitor、workspace、coverage | 六份 UTF-8 讀取／JSON.parse 語意相同；Node-only subpath 維持前端模組邊界。                      |
| A05  | `source-script.ts`：`runSourceScript`                          | process-source-command、refresh-with-audit                                  | 相同執行檔、參數、cwd、env、stdio、error／exit／signal 行為。                                   |
| A06  | `surge-materializer-utils.ts`：`surgeLeaderboardRows`          | 8 個 Surge materializer                                                     | 相同 section、table、pagination 與列數驗證；診斷標籤保持各來源原文。                            |
| A07  | 同檔 `surgeConfiguration`                                      | Tax、Finance、Healthcare、CoreCraft、Riemann、GDP.xlsx                      | 六份 configuration 分支與回傳欄位相同。                                                         |
| A08  | 同檔 `surgePercentRow`                                         | Tax、Finance、Healthcare、CoreCraft、Riemann、ComplexConstraints            | 六份百分比標記、屬性與可見分數比對相同。                                                        |
| A09  | 同檔 `resolveSurgeModel`                                       | 8 個 Surge materializer                                                     | 保留精確名稱優先、Qwen 空格修正後備，以及 nullish 短路順序。                                    |
| A10  | `source-catalog-discovery.ts`：`SOURCE_CATALOG_URLS`           | discovery、source-change-monitor                                            | 兩份十項來源網址表完全相同。                                                                    |
| A11  | `materializer-utils.ts`：`asRecord`                            | AA、FrontierSWE                                                             | 同樣拒絕 null、primitive、array，成功時回傳原物件。                                             |
| A12  | `safe-network.ts`：`responseHeadersFrom`                       | 成功與非成功回應路徑                                                        | 保留 header 順序、array join、undefined 略過，以及各路徑原呼叫時機。                            |
| A13  | `refresh-utils.ts`：`writeSourceSnapshot`                      | 8 個 Surge refresher                                                        | 相同 manifest→evidence→candidates→report 寫入順序；報告 callback 保持延後求值。                 |
| A14  | `surge-refresh-utils.ts`：`readSurgeBaseline`                  | Riemann、ComplexConstraints                                                 | 相同 baseline 參數、存在性檢查、schema parse、預設空集合。                                      |
| A15  | `refresh-utils.ts`：`readRequiredSnapshotComparison`           | DeepSWE、LiveBench                                                          | 相同三檔依序讀取，錯誤向外傳遞。                                                                |
| A16  | 同檔 `readOptionalSnapshotComparison`                          | ARC Prize、Vals、Zapier                                                     | 相同三檔讀取，個別失敗時沿用空陣列／空字串。                                                    |
| A17  | `surge-version.ts`：`retainSurgeSnapshot`                      | snapshots 的 Riemann、ComplexConstraints 分支                               | 相同舊 candidates parse、留存合併與留存報告流程。                                               |
| A18  | `surge-refresh-utils.ts`：`surgeVisualRowCount`                | 8 個 Surge refresher                                                        | 相同 argv 解讀與正整數檢查；錯誤中的來源名稱明確傳入。                                          |
| A19  | `surge-materializer-utils.ts`：`surgeRowIdentity`              | Chartography、GDP.xlsx、共用百分比 parser                                   | 同樣的 brand/name DOM 擷取與文字清理。                                                          |
| A20  | `epoch-materializer.ts`：`resolveEpochProfile`                 | ECI 與個別 benchmark 路徑                                                   | 相同模型解析、version suffix 解碼、modelPart 後備。                                             |
| U01  | `lib/statistics.ts`：`median`                                  | view-model 與三個研究／測量 scripts                                         | 相同數字排序、中位數與空陣列 NaN 行為；Node 24 原生 TS 匯入 smoke 通過。                        |
| U02  | `lib/view-model.ts`：`getEvidenceForProfile`                      | view-model、dashboard-data payload                                          | 沿用既有 filter 與 INCLUDED／benchmark／source／id 排序。                                       |
| U03  | 同檔 `compareEffortProfiles`、`compareNamedModels`             | advanced series、effort options／model options                              | 同樣 effort 優先序、未知 effort 排序與 localeCompare 次序。                                     |
| U04  | 同檔 `costSourceLogRanges`                                     | weighted curve、advanced series                                             | 共用 log/min/max 計算；各呼叫點自己的成本篩選保留。                                             |
| U05  | `lib/score-format.ts`、`leaderboard-markdown.ts` 的列格式函數  | leaderboard-table、partial-coverage-list；兩份 Markdown 表格                | null-only 的 `N/A`／一位小數格式一致；Markdown 列組裝一致。                                     |
| U06  | `lib/use-expanded-models.ts`：`useExpandedModels`              | Leaderboard、DeveloperModelList                                             | 相同初始值、includes/filter 與附加 ID 行為。                                                    |
| U07  | `components/cost-chart.tsx`：`costCoordinates`、`CostPlotAxes` | 兩張成本圖                                                                  | 相同換算公式、grid／axes markup；邊界、標籤與 key prefix 維持原值。                             |
| U08  | 同檔每個 point 的 activate/deactivate callback                 | 各圖的 pointer enter/leave 與 focus/blur                                    | 同一張圖內相同事件使用同一函數；兩張圖各自的狀態形狀保留。                                      |
| U09  | `e2e/wait-for-paint.ts`：`waitForPaint`                        | dashboard、data-layering e2e                                                | 同樣等待兩次 animation frame 的 browser callback。                                              |
| D01  | `node-utils.ts`：`findRepositoryRoot`                          | generate-display-set、report-coverage-matrix                                | 相同 sources.json sentinel 與找不到時回傳起點的規則。                                           |
| D02  | `index.ts`：`validateResultInclusion`                          | CandidateResultSchema、ProductEvidenceSchema                                | 相同兩個驗證條件、issue 訊息、path 與順序；strict schema 保留。                                 |
| D03  | `coverage-matrix.ts`：`selectCoverageResults`                  | coverage analysis、analyze-dimension-statistics script                      | 沿用 whitelist→profile policy→有效分數／身分→current selection 順序，並回傳報告需要的中間集合。 |
| D04  | `node-utils.ts`：`reportCliError`                              | product CLI、display-set CLI、coverage CLI                                  | 同樣輸出 Error.message／String(error)，並設定 exitCode=1。                                      |

## 有差異而保留的實作

| 項目                                           | 必須保留的差異                                                                                                                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chartography／GDP.xlsx 分數解析                | Chartography 要求單一帶 data-score 的節點，以數值比較文字／屬性；GDP.xlsx 的百分號是沒有 data-score 的相鄰節點；一般百分比 parser 允許帶空屬性的百分號節點且保留文字一致性檢查。 |
| Chartography／ComplexConstraints configuration | 允許的 named labels 不同；ComplexConstraints 拒絕 Auto reasoning、Fast；Chartography 支援集合更小。                                                                              |
| 必填／可選舊快照                               | A15 向外傳遞讀檔或解析錯誤；A16 個別回退為空值。兩者各自合併，同時保留不同契約。                                                                                                 |
| 根目錄搜尋                                     | acquisition 找 `data` 且找不到會拋錯；benchmark-data 找 `data/mappings/sources.json` 且找不到回傳起點。                                                                          |
| HTTP capture wrappers                          | AA 加 Accept header 並依回應決定 media type；FrontierCode 回傳 bytes/evidence；captureArtifact 回傳 bytes/text/record。                                                          |
| CSV parsers                                    | Epoch 支援 backslash escaping；一般 parser 處理多行；pricing parser 處理單行並總是輸出最後一格。                                                                                 |
| HTML entity decoders                           | 支援的 named entities 與無效 Unicode 處理不同。                                                                                                                                  |
| 物件驗證                                       | FrontierCode asRecord 接受 array；OpenAI object helper 會拋出帶欄位名稱的錯誤；A11 則回傳 null。                                                                                 |
| UI 分數格式                                    | 表格只將 null 顯示 N/A；detail panel 也處理 undefined／非有限數並顯示破折號；Markdown 接受 null／undefined。                                                                     |
| task cost 篩選與來源分數                       | 各處對 unit、正成本、performance 的要求不同；歷史研究腳本使用舊來源 score basis，不能改成目前產品 basis。                                                                        |
| 比較與 effort normalization                    | binary 字串排序與 locale/base-insensitive 排序不同；來源 effort 的 minimal 與產品 minimal→low 規則不同。                                                                         |
| 完整來源 loader／refresher                     | manifest、cost、evidence、mapping 版本、identity 與歷史列留存政策不同，只抽出已證明相同的區塊。                                                                                  |
| 啟動器／測量 subprocess                        | Windows 與 Linux 的 shell、路徑、背景執行與 process 結果需求不同。                                                                                                               |

## 驗證與證據

每個群組後都有對應測試：A01–A10 跑全 workspace；A11–A20 跑 acquisition；U01–U08 跑 bench；U09 在 build 後跑 e2e；資料套件各組跑 benchmark-data，跨套件 JSON 組另跑全 workspace。最終各組 log 均已核對通過。

- 全套單元測試：**941 項通過**（scripts 35、acquisition 551、bench 184、benchmark-data 171）。
- 端對端／無障礙：**116 項通過**，涵蓋桌面與行動 Chromium。
- `pnpm typecheck`、`pnpm lint` 通過；改動檔案的格式與 diff whitespace 檢查通過。
- 三個 workspace 的建構通過；release 完成靜態輸出與其版本確認。
- Schema 對照：原始與共用驗證器對 64 組有效／無效輸入產生相同解析結果或完全相同、同順序的 issues。
- 研究輸出：`effective-results.json` 與合併前逐位元組相等。
- 固定原 `generatedAt` 重新建置：產品與原始已提交 JSON **逐位元組相等**，版本為 `sha256:66cf70b45446a07be5a3551a90d5e9a2d71d3bcc33938eeecb86f377287d8879`。
- 正式 release 的新建置時間產生新 versionId；除了 `generatedAt`／`versionId`，所有產品欄位均相等，frontier set 與 selection audit 位元組也相等。

Release：`artifacts/releases/2026-11-06T15-33-01-806Z/receipt.json`，`status=complete`，8 個步驟 exitCode 全部為 0。完整資料驗證摘要附於 [當日刷新紀錄](../refresh/2026-11-06.md#程式碼共用重構驗證)。

獨立代理 `duplicates_data` 已核對 acquisition 前十組：8 份文字／表格驗證、6 份 configuration／百分比區塊經來源本文比對一致；網址表相同，子程序參數／signal、model lookup 的短路順序一致。`duplicates_ui` 與 `duplicates_data` 分別完成 UI 與資料群組的獨立原始實作查核。後續由主代理核對最終呼叫點、剩餘差異、測試、完整產品等價性與 release receipt。

本機完整 logs、掃描結果、行數計算與等價性腳本保存在 `artifacts/duplicate-code-audit/2026-11-06/`。`line-counts.json` 記錄 tracked 新增 754 行、刪除 1925 行，以及新增模組 292 行；扣除前次刪除的 15 行後，淨減少 864 行。
