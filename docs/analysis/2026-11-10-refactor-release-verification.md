# 2026-11-10 程式碼共用重構驗證

本次驗證 `codex/consolidate-identical-code` 的既有重構，基準 commit 為 `a41691b8b1dfdb8335ce7a798c12819b93cf5a38`。完整 release 通過，獨立代理 `review_refactor` 抽查相符。判定沒有重大變更：整份產品除建置時間與 versionId 外逐欄相等，全部集合、分數、排名、代表 profile、effort 與來源快照均相同。

## 版本與數量

本分支於 2026-11-10 rebase 到 `origin/main` `2e656d5`（含 PR #39–#41：11/08 刷新、11/09 查核、BioBasicsBench／MaxxBench 採用）後重跑 release；下列數字以 rebase 後為準。rebase 前在舊基準 `a41691b` 的驗證（run `2026-11-09T23-50-37-368Z`，產品 `sha256:ef186ccd…`）見下節「rebase 前驗證」。

- Release run ID：`2026-11-10T00-13-06-588Z`，HEAD `76134f72a6b30d4101e9462d5005c02f823e58ec`。
- Receipt：`artifacts/releases/2026-11-10T00-13-06-588Z/receipt.json`；命令退出碼 0，`status=complete`，八步驟退出碼皆為 0。
- 完整差異報告：`artifacts/releases/2026-11-10T00-13-06-588Z/report.md`。
- 舊 versionId（main）：`sha256:720ec5d5ead2dc2953b9c768073ffef59777db085be53f1bea0e2f95fdf4c258`。
- 新 versionId：`sha256:a40f713c899f4bc1d1c6c24d8bf0055afb26e820af13ae13aa671bab70dd3430`。
- 新產品與 main 的 `current.json` 遞迴比較，只有 `generatedAt`、`versionId` 兩欄不同；frontier set 與 selection audit 與 main 逐位元組相同。

| 項目                             |   舊 |   新 | 增減 |
| -------------------------------- | ---: | ---: | ---: |
| models                           |   83 |   83 |    0 |
| profiles                         |  263 |  263 |    0 |
| leaderboard rows（九個集合合計） |   54 |   54 |    0 |
| evidence                         | 9836 | 9836 |    0 |
| costs                            |  933 |  933 |    0 |
| presets                          |    9 |    9 |    0 |

main 在本分支建立後新增的 BioBasicsBench／MaxxBench 程式已使用共用的 `refresh-utils`，沒有本次合併範圍內的重複實作，rebase 時無程式衝突；唯一衝突為 `current.json`，以 release 重建結果解決。

## 集合、資料與 effort

預設 `aa-frontier` 維持八個模型、十二項共同測試（與 main 相同）。九個集合均沒有模型進出、benchmark 增減、有效維度變化或名次／分數差異。二至十模型的共同測試數依序為 14、14、14、14、12、12、12、11、11。來源 snapshot IDs、benchmark／指數版本、品質與計分政策均經完整產品比較核對相等；frontier set 與 selection audit 與 HEAD 及本次 baseline 逐位元組相等。

沿用 [11 月 9 日刷新報告](../refresh/2026-11-09.md) 與先前各日報告的來源版本、資料日期、原始證據、來源抽查及未解析名稱揭露。本次 release 是既有資料的重構驗證。

| 檔位推測揭露範圍            | 結果       | 依據                                                                         |
| --------------------------- | ---------- | ---------------------------------------------------------------------------- |
| 本次新增或改變的推測 effort | 無         | 所有 profiles、evidence 與配置欄位逐欄相等                                   |
| 進入預設集合的推測 effort   | 無         | 本次 release report 的 Effort inferences reaching the default preset 為 None |
| 既有其他推測 effort         | 沿用原揭露 | [11 月 6 日報告](../refresh/2026-11-06.md) 與各來源 validation-report        |

## 驗證與獨立抽查

rebase 後：`pnpm lint`、`pnpm typecheck` 退出碼均為 0；release 單元測試 915 項（acquisition 558、bench 184、benchmark-data 173）與 116 項 e2e 通過。

### rebase 前驗證

在舊基準 `a41691b`：lint、typecheck 退出碼 0，log 位於 `artifacts/refactor-20261110/`；release `2026-11-09T23-50-37-368Z` 八步驟皆為 0，941 項單元測試與 116 項 e2e 通過，產品與當時 HEAD 僅 generatedAt／versionId 不同。獨立代理 `review_refactor` 完成以下查核：

- 全部重構 diff 與新增 helper 的實際呼叫點相符，原有來源差異與錯誤／寫入順序保留。
- 八個 Surge parser 對十份保存頁面、336 列的舊新完整輸出相等；六個 configuration 呼叫點共 96 組成功／錯誤案例相等。
- 九個 presets 的 weighted curve、六來源的 64 種進階成本來源組合、model／effort options 與全部 261 profiles 的 evidence 選取及排序，舊新結果相等。
- 最終產品與 HEAD 遞迴比較，僅 generatedAt／versionId 不同；frontier／audit 逐位元組相等；receipt 八步驟及靜態首頁版本相符。

本次修正查核表 U02 的函數名稱為實際的 `getEvidenceForProfile`。程式檢查沒有需要修復的失敗。

## 交付狀態

[重複程式碼查核](2026-11-06-duplicate-code-audit.md)、[未使用程式碼查核](2026-11-06-unused-code-audit.md) 與 [11 月 6 日重構驗證追加紀錄](../refresh/2026-11-06.md#程式碼共用重構驗證) 一併提交；`current.json` 為 rebase 後 release 的重建結果。判定沒有重大變更：產品內容與 main 相同，只有建置時間與版本號改變。
