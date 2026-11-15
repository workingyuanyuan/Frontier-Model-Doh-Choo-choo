# 2026-11-15 程式重構的 release 報告：移除 v1 設定檔與輔助覆蓋分析工具

這是一次程式與文件的移除，沒有刷新任何來源。完整 release 通過，**沒有重大變更**：新舊產品只有 `generatedAt` 與由它決定的 `versionId` 不同。

## 版本

- 舊版本：`sha256:fb98862b0ae181104a7b4bfb8b2b15cde456beb8992affc7bbb6b248cd4480a0`
- 新版本：`sha256:48fb9c7975b92fcd1d53729a124b053d6c3e859321cf3ef2dbea7df36d7afffd`
- Release `2026-11-15T13-32-53-859Z` 退出碼為 0，receipt.status 為 `complete`，八步驟退出碼皆為 0。[Receipt](2026-11-15-retire-v1-tools-receipt.json)
- 分支 `refactor/retire-v1-coverage-tools`，起點 main `257a461`。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| profiles |   280 |   280 |   +0 |
| evidence | 10437 | 10437 |   +0 |
| costs    |   988 |   988 |   +0 |
| presets  |     9 |     9 |   +0 |

主畫面沒有模型進出；9 個集合的模型、名次、Overall 與共同測試全部不變。release 前先以舊的 `generatedAt` 執行 `pnpm data:verify-fresh`，重算結果等於已提交的舊 `versionId`。

## 決定依據

[前一份報告](2026-11-15-derived-outputs.md)把這些檔案的去留列為待決事項。使用者指示先徵詢其他代理再依主代理的建議執行。Astra（gpt-6-astra）與 Argon（gemini-4-argon）各自唯讀查核後都建議整組移除，理由相同：release 輸入、release 步驟與 CI 都不讀這些檔案，只有獨立的分析指令在用；保留它們會讓每個新 benchmark 都得同時改兩份分類檔。

## 移除了什麼

- **設定檔**：`data/mappings/benchmarks.json`（五維舊版）、`frontier.json`、`display-set-policy.json`、`display-set.json`。
- **工具**：`coverage-matrix.ts` 與其測試、`generate-display-set.ts`、`report-coverage-matrix.ts`；指令 `pnpm report:coverage-matrix`、`pnpm data:generate-display-set`；產出報告 `docs/COVERAGE_MATRIX_REPORT.md`。
- **一次性分析腳本**：`analyze-dimension-statistics.{ts,py}`、`report-benchmark-saturation.mjs`、`analyze-frontier-cohort.py`、`report-dimension-proposal.py`。它們的既有產出仍在 `docs/analysis/` 與 `docs/refresh/`。
- **程式**：`index.ts` 的 `DisplaySetPolicySchema` 與 `FrontierConfigSchema`。

### 沒有移除的部分

`buildFrontierSet`、`isModelQualified`、`isReleaseDateQualified`、`buildProduct` 的 `manualModels`／`qualificationWindowMonths` 輸入，以及五維的 `DIMENSION_IDS` 與 v1 分類 schema 分支都還在。現行產品不走這些路徑，但 `pipeline.test.ts`、`schema.test.ts` 與前端測試 fixture 仍在使用，移除需要改寫那些測試，留作後續。

## 測試

依「測試不寫死當期資料」的原則，原本直接匯入這些 JSON 的測試改用合成資料：

- `benchmark-quality.test.ts`：四個案例保留，改用合成的分類、品質政策與集合。
- `schema.test.ts`：分類與集合驗證改用合成的五維分類；刪除兩個「已提交檔案可通過驗證」的案例，補一個五維集合通過驗證的正向案例。
- `frontier-selection.test.ts`：改用新匯出的 `loadWorkspaceSources`。
- `coverage-matrix.test.ts`（31 個案例）隨工具刪除。

單元測試 911 項通過（acquisition 584、bench 186、benchmark-data 141）；格式、lint、型別檢查通過。

## 文件

- [OPERATIONS](../OPERATIONS.md)：刪除「輔助覆蓋分析與相容產物」與「Display-Set 取捨報告」兩節。
- [DATA_METHODOLOGY](../DATA_METHODOLOGY.md)：「Frontier 模型」改為現行的 AA 排名與資格規則，不再描述 `frontier.json` 的 `manualModels`；Dashboard 資料邊界改指產品內的集合。
- [ARCHITECTURE](../ARCHITECTURE.md)、[REFACTOR_DISCARD_LIST](../REFACTOR_DISCARD_LIST.md)、[文件入口](../README.md)、[SPEC](../SPEC.md) §5.3 同步；歷史文件中指向已刪報告的連結改為移除前版本的永久連結。

## 來源、身分與檔位推測

沒有刷新來源，來源快照、模型身分與檔位推測都與 [2026-11-14 報告](2026-11-14.md) 相同；逐列明細見該報告的 [檔位表](2026-11-14-effort-inferences.md)。預設集合沒有使用任何推測檔位。

## 重大變更判斷

依 [OPERATIONS §5](../OPERATIONS.md#5-代理驗證與異動判斷)：集合結果與計分口徑都沒有改變，沒有無法解釋的變化。移除工具的決定已依使用者指示完成。判定為沒有重大變更。

## 程式審查

Codex（gpt-6.1-sol）唯讀審查提出 1 個 P2、2 個 P3，全部修正：

- DATA_METHODOLOGY 的新段落原本寫成「只有改 mapping 才能讓模型入選」，與資格規則不符；改為說明資格由來源證據決定，mapping 只處理名稱對應。
- `schema.test.ts` 少了五維集合通過驗證的正向案例；已補上。
- 歷史文件 `PHASE_A_TO_N.md` 的連結指向已刪報告；改為永久連結。

## 獨立抽查

沒有任何來源數值改變，所以抽查的對象是「產品確實沒變」，而不是比對來源網站。

- **執行者**：未參與本次修改的 Codex（gpt-6.1-sol），唯讀，自行撰寫腳本，不參考本報告。
- **結果：四項全部相符。**

| 檢查                                                    | 觀察                                                                                                                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HEAD 與工作區的 `current.json` 逐鍵比較                 | 只有 `generatedAt`、`versionId` 不同；`evidence`、`presets`、`costs`、`profiles`、`frontier`、`comparisonEvidenceIds`、`benchmarkQuality`、`sourceSnapshotIds` 深度相等 |
| `data/derived/` 兩個檔案                                | 與 HEAD 位元組相同；SHA-256 分別為 `c04bc0f8…669d4c`、`aadd8a08…8cfdba1`                                                                                                |
| `data/sources`、`data/mappings` 的變動                  | 只有四個設定檔被刪除；指定目錄內沒有非測試程式仍讀取它們                                                                                                                |
| 依 `deterministicJson` 規則自行重算工作區產品的內容雜湊 | 等於宣告的 `sha256:48fb9c7975b92fcd1d53729a124b053d6c3e859321cf3ef2dbea7df36d7afffd`                                                                                    |

## 已知未解

- 上述「沒有移除的部分」。
- Surge 其餘四榜（Chartography、ComplexConstraints、Riemann、GDP.xlsx）尚未併入共用規格，見本次對話的後續決定。
