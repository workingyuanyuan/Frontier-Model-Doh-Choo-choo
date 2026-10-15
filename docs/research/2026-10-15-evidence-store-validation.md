# Evidence store 驗收與量測

日期：2026-10-15。基準 commit：`69a71f1f1ff43282f92463653d815654fef0db19`。
機器為 WSL2 Linux 6.18.54.1、Intel Core Ultra 9 285HX（24 logical CPUs），Node 24.18.0、pnpm 11.7.0。
機器可讀結果見 [量測 JSON](2026-10-15-evidence-store-validation.json)，操作命令見 [Evidence store](../EVIDENCE_STORE.md)。

## 資料與方法

對目前 20 個來源初始化，掃描 2,020 個內容定址原始檔。歷史範圍為目前保留來源的可達 Git revisions，完整性驗證核對檔案 SHA-256、大小、SQLite integrity、快照內容與引用索引。初始化重跑比對資料庫筆數，備份於另一個 root 還原並重新核對。

物化測試使用隔離副本中的 17 個離線來源。舊版以基準 commit 的程式執行；新版依序執行 `--force`、暖快取、單一來源變更、變更後 `--force`。單一來源變更為 DeepSWE JSON 增加換行，更新內容 hash、長度、路徑與 Evidence ID。每次對所有來源輸出逐檔 SHA-256，比較固定建置時間的 ProductVersion。

Node preload 計數 `fs.readFileSync` 呼叫、回傳 bytes 與 `JSON.parse` 次數，含 loader、設定、驗證與格式化；不包含 SQLite 原生 I/O 或串流 hash 的 readSync。解析來源數由物化器另外回報。每次只量一次，未清除 OS page cache；首次為空的處理快取，後續為暖處理快取。這些結果適合判斷工作量差異，不作統計顯著性推論。

## 物化結果

| 執行         | 耗時 ms | readFileSync 次數 |       bytes | JSON.parse 次數 | 解析來源 |
| ------------ | ------: | ----------------: | ----------: | --------------: | -------: |
| 改造前完整   |   6,911 |               409 | 539,540,598 |          21,996 |       17 |
| 改造後完整   |   8,643 |               783 | 565,991,665 |          22,950 |       17 |
| 暖快取       |   2,423 |               617 |  54,805,021 |             734 |        0 |
| 單一來源變更 |   2,456 |               618 |  54,899,780 |             802 |        1 |
| 變更後完整   |   8,372 |           見 JSON |     見 JSON |         見 JSON |       17 |

暖快取較新版完整處理減少約 72% 耗時；單一來源變更命中其餘 16 個來源。新增紀錄與完整性核對讓首次完整處理成本增加約 25%。所有暖快取／完整輸出 bytes 一致，變更後的增量／完整輸出也一致。

- 原輸入完整／增量 versionId：`sha256:8c1d5969e9399508c2f8dc77968e978719a27dfd738dbc68af70ae601b1192ce`
- 變更輸入完整／增量 versionId：`sha256:e58fa98cc8dd4252d7ab252d378ecb0ed509fdca994b3e395cbb4f3f75549ad3`

## 查詢工作量

命令的 stdout bytes 直接由子程序量測，包含 JSON envelope；已建立索引，OS cache 為暖。耗時包括 Node／tsx 啟動。

| 任務         | 原流程                                       | CLI 流程                                                           | 回傳 bytes | 耗時 ms |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------ | ---------: | ------: |
| 模型原始證據 | 搜候選列，再找 evidence-index 對應 URL／path | `find --source deepswe --model anthropic-claude-fable-5 --limit 5` |      4,405 |     357 |
| 來源比較     | 查 Git commits、讀兩份來源檔、比較內容       | `snapshots` 選兩 ID 後 `diff`                                      |        356 |     261 |
| 檔案歷史引用 | `git log` 後逐 revision 搜 hash              | `references --hash … --limit 20`                                   |      5,167 |     256 |

比較案例使用 DeepSWE 的最早與最後已匯入快照，其檔案相同；`diff` 因此只回傳比較摘要。新增／移除／變更的案例由 CLI 測試覆蓋。舊流程回傳量取決於搜尋方式及讀取檔案範圍，沒有唯一固定值；新介面把每頁大小固定並提供下一頁定位。原始內容以 `read`／`raw` 額外讀取。

## 驗證

- 專案測試：26 個 Node tests、159 個 benchmark-data tests、495 個 acquisition tests、177 個 UI tests 通過。
- 型別檢查與 ESLint 通過。
- 測試涵蓋同內容多次取得、多輸入快取、parser／設定／metadata 失效、損毀內容、取得失敗、來源更新中斷、匯出恢復、跨路徑還原、CLI 分頁及遷移冪等性。
- 以 Git 檔案建立的隔離 checkout 以 Next.js webpack 進行網站建置成功；不提供 artifacts 或 SQLite。

## 成本與範圍

目前快照首次建立索引約 9.9 秒；加入 15 個相關 commits 的歷史匯入約 32.6 秒，重跑約 27.2 秒。初輪歷史資料庫約 392 MiB，包含完整來源快照、385,595 個引用位置與索引；原始 bytes 共用既有內容定址檔案。最後核對為 2,020 blobs、1,590 captures、126 snapshots，完整性檢查通過。

保留完整 JSON 快照會增加儲存成本；共用 parser／mapping 變動採保守快取失效。查詢目前仍會解析選中的快照候選陣列，改善主要是定位與回傳內容控制。後續若量測顯示資料量成為瓶頸，可再將候選列建立專用索引。
