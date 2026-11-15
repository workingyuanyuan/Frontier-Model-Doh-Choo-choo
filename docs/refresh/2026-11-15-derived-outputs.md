# 2026-11-15 程式重構的 release 報告：生成物移出 mappings、現役路徑改讀 v2 分類

這是一次程式與目錄重構，沒有刷新任何來源。完整 release 通過，**沒有重大變更**：新舊產品只有 `generatedAt` 與由它決定的 `versionId` 不同。當日的來源刷新另見當日的刷新報告。

## 版本

- 舊版本：`sha256:368f6474a763cc8345204afc39eaa1c2b6e88c3d31613adbf3734a25fde4b787`
- 新版本：`sha256:fb98862b0ae181104a7b4bfb8b2b15cde456beb8992affc7bbb6b248cd4480a0`
- Release `2026-11-15T11-19-12-698Z` 退出碼為 0，receipt.status 為 `complete`，八步驟退出碼皆為 0。[Receipt](2026-11-15-derived-outputs-receipt.json)
- 分支 `refactor/derived-outputs-and-v2-mapping`，起點 main `e81893d7322e838ff21abd7e2d8da880220bf7bc`。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| profiles |   280 |   280 |   +0 |
| evidence | 10437 | 10437 |   +0 |
| costs    |   988 |   988 |   +0 |
| presets  |     9 |     9 |   +0 |

主畫面沒有模型進出；9 個集合的模型、名次、Overall 與共同測試全部不變。release 前先以舊的 `generatedAt` 執行 `pnpm data:verify-fresh`，重算結果等於已提交的舊 `versionId`，確認重構沒有改變任何計算。

## 改了什麼

- **生成物移出政策目錄**：`frontier-set.json` 與 `frontier-selection-audit.json` 由 `data/mappings/` 搬到 `data/derived/`，內容位元組不變。`data/mappings/` 只剩人工審核的政策。
- **現役路徑不再讀 v1 檔案**：前沿生成器改用自己的輸入載入器；產品建置移除對 `benchmarks.json`、`frontier.json` 的相容檢查；檔位推測報告、Vals 刷新與重新物化、離線物化改讀 `benchmarks-v2.json`；前端載入器只接受 `benchmarks-v2.json`，移除 v1 與 `display-set.json` 分支。這兩個 v1 檔案也從 release 的輸入摘要移除。
- **建置不再順手寫檔**：`buildWorkspaceProduct` 不寫任何檔案。`data:build-current` 先算完集合與產品，全部成功才寫入集合、audit 與 `current.json`；集合需要審核時只寫 `needs-review` audit。
- **保留**：`benchmarks.json`、`frontier.json`、`display-set-policy.json`、`display-set.json` 仍在 `data/mappings/`，只供輔助覆蓋分析工具使用，不是產品輸入。

### 會在下次刷新出現的差異

Vals 的 `validation-report.md` 有一張維度對照表，原本讀五維的 `benchmarks.json`。v1 與 v2 的 benchmark ID 與 `comparisonOnly` 清單相同，但有 13 個 benchmark 的主要維度不同，所以下次 Vals 刷新時這張表會改成 v2 的維度。該報告不是產品輸入，分數與集合不受影響。檔位推測只用到 `comparisonOnly` 清單，結果不變。

## 來源、身分與檔位推測

沒有刷新來源，來源快照、模型身分與檔位推測都與 [2026-11-14 報告](2026-11-14.md) 相同；逐列明細見該報告的 [檔位表](2026-11-14-effort-inferences.md)。預設集合沒有使用任何推測檔位。

## 重大變更判斷

依 [OPERATIONS §5](../OPERATIONS.md#5-代理驗證與異動判斷)：集合結果、計分口徑都沒有改變，沒有無法解釋的變化，也沒有需使用者決定的資料事項。判定為沒有重大變更。

## 驗證

- 格式、lint、型別檢查通過；單元測試 930 項通過（acquisition 571、bench 186、benchmark-data 173）。
- 程式審查：Codex（gpt-6.1-sol）唯讀審查，結果為「No findings」。它的沙箱無法執行 Vitest，測試由主代理執行。
- 靜態建置顯示新 `versionId`，e2e 通過（release 的 `site`、`e2e` 步驟）。

## 獨立抽查

沒有任何來源數值改變，所以抽查的對象是「產品確實沒變」，而不是比對來源網站。

- **執行者**：未參與本次修改的 Codex（gpt-6.1-sol），唯讀，自行撰寫腳本，不參考本報告。
- **結果：四項全部相符。**

| 檢查                                                    | 觀察                                                                                                  |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| HEAD 與工作區的 `current.json` 逐鍵比較                 | 只有 `generatedAt`、`versionId` 不同；`evidence`、`presets`、`costs`、`profiles`、`frontier` 深度相等 |
| `frontier-set.json` 搬移前後                            | 位元組相同，SHA-256 `c04bc0f8127ad5731b7423519130a72fe4085874dc6392a973136b0f5d669d4c`                |
| `frontier-selection-audit.json` 搬移前後                | 位元組相同，SHA-256 `aadd8a0899a30647d77cbae70b222ad69f3ac04cdde4f196212b417138cfdba1`                |
| `data/sources`、`data/mappings` 的其他變動              | 無，只有上述兩個檔案移出                                                                              |
| 依 `deterministicJson` 規則自行重算工作區產品的內容雜湊 | 等於宣告的 `sha256:fb98862b0ae181104a7b4bfb8b2b15cde456beb8992affc7bbb6b248cd4480a0`                  |

## 已知未解

- [DATA_METHODOLOGY](../DATA_METHODOLOGY.md) 仍描述以 `frontier.json` 的 `manualModels` 組成前沿清單；現行產品的前沿來自 AA 排名，該檔的 `manualModels` 為空。這段文字的修訂與輔助覆蓋分析工具的去留，留待後續決定。
