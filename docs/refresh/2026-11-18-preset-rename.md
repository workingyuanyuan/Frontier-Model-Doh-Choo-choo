# 2026-11-18 集合 ID 改名的 release 報告：`aa-frontier` 改為 `aa-top-8`

這次只改一條命名規則，沒有刷新任何來源。完整 release 通過，**沒有重大變更**：新舊產品只有 8 個模型那組集合的 ID、`generatedAt` 與由它們決定的 `versionId` 不同，9 組集合的模型、名次、Overall 與共同測試全部不變，預設仍是 `aa-top-10`。

## 起因與決定

純抓取代理重測網站時指出，集合導覽是 `aa-top-7`、`aa-frontier`、`aa-top-9`，看不出 8 個模型的集合是哪一個，也找不到 `aa-top-8`。使用者 2026-11-18 指示處理。

原規則把前 8 名的集合固定命名為 `aa-frontier`，因為預設集合從前 8 名開始延伸。目前預設是 `aa-top-10`，這個名稱已不代表預設集合。改為所有集合一律 `aa-top-N`；預設集合仍由 `defaultPresetId` 記錄，選取規則不變。

## 修改

- **程式**：`packages/benchmark-data/src/generate-frontier-set.ts` 的集合 ID 一律為 `aa-top-${targetModelCount}`。
- **測試**：`generate-frontier-set.test.ts` 改成檢查每個集合的 ID 等於 `aa-top-N`；`scripts/release-report.test.mjs` 的合成資料改用新 ID。
- **文件**：[前沿政策](../FRONTIER_POLICY.md)、[OPERATIONS](../OPERATIONS.md)、[計分方法](../SCORING_METHODOLOGY.md) 同步。歷史報告保留原文。

## 版本

- 起始 commit：`ae092c0c5de6cb34b6bd9dc6c66934b655fa22a2`，分支 `data/rename-frontier-preset`。
- 舊版本：`sha256:b72c6c1cefe17040e4a7a3ec815434a0c27595f52ffe5d7fd6057906d87d5427`
- 新版本：`sha256:511a7966411490db7c9747a52ac0a69ff25229e73cdc97ffa5efd14aa140767b`
- Release `2026-11-18T03-47-50-529Z`：退出碼 0，`status: complete`，8 個步驟全部退出碼 0。[Receipt](2026-11-18-preset-rename-receipt.json)

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| profiles |   281 |   281 |   +0 |
| evidence | 10521 | 10521 |   +0 |
| costs    |   992 |   992 |   +0 |
| presets  |     9 |     9 |   +0 |

主畫面沒有模型進出。

## 各集合對照

依模型數對照新舊集合；除 ID 外，每組的排行榜列、名次、分數、共同測試與其他欄位逐位元組相同。

| 模型數 | 舊 ID         | 新 ID       | 共同測試 | 內容 |
| -----: | ------------- | ----------- | -------: | ---- |
|      2 | `aa-top-2`    | `aa-top-2`  |       17 | 相同 |
|      3 | `aa-top-3`    | `aa-top-3`  |       17 | 相同 |
|      4 | `aa-top-4`    | `aa-top-4`  |       17 | 相同 |
|      5 | `aa-top-5`    | `aa-top-5`  |       17 | 相同 |
|      6 | `aa-top-6`    | `aa-top-6`  |       16 | 相同 |
|      7 | `aa-top-7`    | `aa-top-7`  |        8 | 相同 |
|      8 | `aa-frontier` | `aa-top-8`  |        8 | 相同 |
|      9 | `aa-top-9`    | `aa-top-9`  |        8 | 相同 |
|     10 | `aa-top-10`   | `aa-top-10` |        8 | 相同 |

release 自動產生的 `report.md` 以 ID 比對集合，所以把這次改名顯示成「`aa-frontier` 的 8 個模型全部退出、共同測試 8 → 0」與「`aa-top-8` 有 8 個模型新進、共同測試 0 → 8」。這是比對方式造成的，不是資料變動；上表依模型數比對才是實際情況。

## 對網站的影響

- 8 個模型集合的檔案路徑改變：`data/presets/aa-top-8.{md,json}` 與 `presets/aa-top-8.html` 取代原本以 `aa-frontier` 命名的三個檔案。`llms.txt` 與 `data/index.json` 由產品生成，會列出新路徑。
- 舊的分享連結 `?preset=aa-frontier` 不再對應任何集合，會顯示預設集合。沒有保留相容別名。

## 來源、身分與檔位推測

沒有刷新來源，來源快照、模型身分與檔位推測都與 [2026-11-17 報告](2026-11-17-aa-briefcase-leaderboard.md) 相同；逐列明細見 [檔位表](2026-11-17-effort-inferences.md)。預設集合 `aa-top-10` 沒有使用任何推測檔位。

## 重大變更判斷

依 [OPERATIONS §5](../OPERATIONS.md#5-代理驗證與異動判斷)：集合內容與計分口徑都沒有改變，沒有無法解釋的變化。命名規則的改動是使用者的指示。判定為沒有重大變更。

## 驗證

- `pnpm data:release` 八個步驟通過（來源、證據庫、前沿集合、產品、可重現、單元測試、建置、e2e）。
- 另跑格式、lint、型別檢查，以及帶 GitHub Pages 子路徑的建置與 e2e，全部通過。

## 獨立查核

沒有任何來源數值改變，所以查核的對象是「產品除了那個 ID 之外確實沒變」，而不是比對來源網站。

- **執行者**：未參與本次修改的 Codex（gpt-6.1-sol），唯讀，自行撰寫比對，不參考本報告。
- **結果：六項全部相符。**

| 檢查                                    | 觀察                                                                                                                                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HEAD 與工作區的 `current.json` 逐鍵比較 | 只有 `presets`、`generatedAt`、`versionId` 不同；`profiles`、`evidence`、`costs`、`frontier`、`sourceSnapshotIds`、`defaultPresetId`、`benchmarkQuality`、`comparisonEvidenceIds` 相等。把 HEAD 的這三處換掉後與工作區檔案逐位元組相同 |
| 9 組集合依模型數比對                    | 54 列排行榜的名次、分數與測試清單全部相同，只有 8 個模型那組的 ID 改變                                                                                                                                                                 |
| `data/derived/` 兩個檔案                | `frontier-set.json` 只有那一個 ID 不同；`frontier-selection-audit.json` 逐位元組相同                                                                                                                                                   |
| 以專案的驗證器重算                      | `verify-fresh` 退出碼 0，新 `versionId` 與來源、mapping 相符                                                                                                                                                                           |
| 全庫搜尋 `aa-frontier`                  | 現行程式、測試、腳本、workflow、hook、mapping 與資料都沒有殘留；唯一一處是前沿政策裡說明改名的那句話                                                                                                                                   |
| 程式是否以 ID 字串做判斷                | 預設集合的選取與介面排序都依 `targetModelCount` 與 `defaultPresetId`，沒有針對 8 個模型集合的特例                                                                                                                                      |

查核另外指出的兩點已寫在上文：自動報告的呈現方式，以及舊分享連結會回到預設集合。

## 已知未解

- 舊連結 `?preset=aa-frontier` 沒有轉址。
