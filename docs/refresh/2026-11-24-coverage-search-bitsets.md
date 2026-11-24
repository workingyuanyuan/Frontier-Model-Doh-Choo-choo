# 2026-11-24 資料刷新報告：coverage 搜尋改用位元集合（輸出不變）

完整 release 通過。這次只改 `packages/benchmark-data/src/generate-frontier-set.ts` 中 `createCoverageCohorts` 的實作，修正「Workspace integration timing」在 PR #90～#92 的逾時失敗（分析見 [2026-11-24 coverage 搜尋與 CI 逾時](../analysis/2026-11-24-coverage-search-ci-timeout.md)）。來源快照、mapping、計分政策都沒有變動，產品內容與前一版完全相同。

判定為**沒有重大變更**，依據見文末。

## 版本與來源基準

- 起始 commit：`38e51775dd2b3754b56a7c0ae69d1a260b7328cd`（main），於分支 `fix/coverage-search-bitsets` 進行。
- Release `2026-11-24T09-57-13-952Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-24-coverage-search-bitsets-receipt.json)
- 前一次 release `2026-11-24T09-56-56-549Z` 在 `sources` 步驟失敗：這個 worktree 沒有內容定址證據庫 `artifacts/sha256`。把主 checkout 的證據庫以 symlink 接上後重跑即通過，程式未變。
- Release 的 `versionId` 為 `sha256:64ea6966…6e35977`，與已提交的 `sha256:0f65655b…94055` 只差 `generatedAt`。兩份產品逐鍵比對，除 `generatedAt` 與 `versionId` 外完全相同，因此本次**不提交** `data/product/current.json`，保留原本的 `generatedAt` 與 `versionId`。`pnpm data:verify-fresh` 以已提交的 `generatedAt` 重算，結果為 `Current product sha256:0f65655bafe325e1233aadfd1424acbdcc49a6b4cf872b727338e07229994055 matches its sources and mappings`。
- `pnpm data:generate-frontier-set` 重產的 `data/derived/frontier-set.json` 與 `frontier-selection-audit.json` 與已提交檔案逐位元組相同。
- 來源快照：無新增、無移除。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| frontier |    20 |    20 |    0 |
| profiles |   346 |   346 |    0 |
| evidence | 11638 | 11638 |    0 |
| costs    |  1182 |  1182 |    0 |
| presets  |    28 |    28 |    0 |

## 集合與主畫面

`aa-top-2`～`aa-top-10` 與 `coverage-2`～`coverage-20` 的共同測試數、模型、分數與名次全部不變（release 報告各列 Δ 皆為 0）。預設集合仍是 `aa-top-9`，沒有模型進出主畫面。

## 檔位推測揭露

本次沒有新增或改變檔位推測。進入預設集合的推測與前一版相同：

| Profile                            | 推測的 benchmark  | 來源                     | Effort | 依據來源：依據列                                                               |
| ---------------------------------- | ----------------- | ------------------------ | ------ | ------------------------------------------------------------------------------ |
| anthropic-claude-sonnet-5-5（max） | `automationbench` | `zapier-automationbench` | max    | anthropic-releases：`anthropic-releases:sonnet-5-5:cursorbench-4:sonnet55-max` |

## 已知未解

無。

## 程式與測試

- `createCoverageCohorts`：把所有候選測試排序後編號，每個 profile 的測試轉成 `Uint32Array` 位元集合；交集改為逐字 AND 並以 popcount 計數，每層深度共用預先配置的緩衝區，`positions`／`choice` 改為可變堆疊，只在出現新最佳解時複製。分數快取改以位元字串為鍵，只在快取未命中時還原排序後的測試清單。剪枝條件、走訪順序與同分規則不變。
- `workspace.test.ts` 只在註解加上新分析文件的連結，測試內容與 15 秒預算不變。
- 單元測試與 e2e 由 release 的 `tests`、`e2e` 步驟執行，全部通過。
- GPT-6.2 Sol 唯讀審查程式：符合 schema 的輸入沒有找到正確性問題。它提出的唯一反例是 benchmark ID 含換行時，**舊程式**以換行串接的快取鍵會讓兩個不同交集撞號；新程式不受影響，且 schema 拒絕這種 ID，因此不需修改。

## 代理抽查

這次產品內容沒有任何數值變動，風險在於新舊演算法是否等價，因此抽查改為差分驗證，不比對來源網站。抽查由未參與實作的 GPT-6.2 Sol 執行（2026-11-24），使用自寫腳本，把 HEAD 的舊實作與新實作放在同一組輸入上比較。

| 項目         | 方法                                                                                                                                                                                      | 結果                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 隨機合成輸入 | 1,285 組：窗口 2～20 個模型、每模型 1～4 個 effort，benchmark 數跨過 32 與 64，含 limited benchmark、空 profile、測試相同的重複 effort、同一 benchmark 兩筆現行成績、某些模型數無可行組合 | 符合 schema 的 1,284 組完全相同（649 組 cohort 陣列逐項相等、635 組拋出相同錯誤訊息）；唯一不同的一組是含換行的 ID，即上述舊程式快取撞號 |
| 真實資料     | `data:verify-fresh`（唯讀，以已提交的 `generatedAt` 重算 frontier、audit 與產品）                                                                                                         | 相符                                                                                                                                     |

**方法異動**：抽查代理執行 `tsx` 時遇到 IPC socket 的 `EPERM`，改用 `node --import tsx` 執行同一腳本與同一個 CLI。

## 重大變更判斷

**沒有重大變更**，依據如下：

- 產品除 `generatedAt` 外與前一版完全相同，前沿集合檔逐位元組相同，`data:verify-fresh` 通過。
- 預設集合、前沿集合與 coverage 集合都不變，主畫面沒有模型進出。
- 來源快照、evidence、成本、檔位推測都不變。
- 計分政策與同分規則沒有改動，只是同一搜尋的更快實作。
