# 未使用程式碼查核

日期：2026-11-06。分支：`codex/remove-proven-unused-code`。
查核基準：`a41691b8b1dfdb8335ce7a798c12819b93cf5a38`。

## 方法與入口

搜尋範圍包含整個儲存庫的追蹤檔案：程式、測試、文件、package scripts、CI、hook 與設定。以 `rg` 查詢符號及匯入，再以 `git grep` 確認追蹤檔案結果。沒有引用不直接代表檔案可刪；可執行腳本本身也算入口。

- Web：`apps/bench/app/page.tsx`、`layout.tsx`、`evidence/[version]/[profile]/route.ts`；並納入 Next.js、Vitest、Playwright 設定與測試探索。
- 套件：兩個套件的 `package.json` exports 指向 `src/index.ts` 建出的公開介面；另追蹤 package scripts 指向的 CLI 及其匯入。
- 維運：根目錄 package scripts、`.github/workflows`、`.claude/settings.json`、啟動器，以及文件中的手動指令。
- 檢查動態 import、require、namespace import、wildcard re-export、字串符號引用；刪除項目沒有這些間接使用路徑。
- Web 入口的模組遍歷可到達所有 production TS/TSX 模組。套件 TypeScript 不可達程式碼／unused-label 檢查通過；硬編碼 false 條件與註解掃描沒有產生可確證的額外刪除項目。

## 刪除前證據：第一批

以下為基準版本的完整符號搜尋結果，各自僅一處定義。可重現：

```bash
git grep -n -w -E 'publishSourceDirectories|ZAPIER_FALLBACK_NOTE|ZAPIER_DEEPSEEK_NOTE|ArtificialAnalysisEvaluationSlug' a41691b8b1dfdb8335ce7a798c12819b93cf5a38 -- .
```

| 項目                               | 全庫搜尋唯一命中（刪除前行號）                           | 入口可達性                                                                                     | 測試使用 |
| ---------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------- |
| `publishSourceDirectories`         | `packages/acquisition/src/source-processing.ts:149`      | 指令匯入此模組的其他函數，但沒有匯入或呼叫此 wrapper；`index.ts` 未導出                        | 無       |
| `ZAPIER_FALLBACK_NOTE`             | `packages/acquisition/src/zapier-materializer.ts:42`     | Zapier refresh／materialize 入口使用解析結果的 `fallbackNote`，沒有讀此常數；`index.ts` 未導出 | 無       |
| `ZAPIER_DEEPSEEK_NOTE`             | `packages/acquisition/src/zapier-materializer.ts:44`     | 同一流程使用解析結果的 `deepseekPricingNote`，沒有讀此常數；`index.ts` 未導出                  | 無       |
| `ArtificialAnalysisEvaluationSlug` | `packages/acquisition/src/artificial-analysis-rsc.ts:46` | 型別僅定義，沒有型別使用或重新導出；AA 入口使用其他具名匯入                                    | 無       |

入口所在模組會被載入，但這不使未被引用的函數或型別成為可達呼叫。兩個常數的初始化只有字串值，沒有副作用。Zapier 註記的擷取、語意驗證、逐列傳遞及報告輸出都有獨立的現行路徑。

本批刪除 4 個宣告，修改 3 個檔案，刪除 15 行（13 行程式／型別、2 行空白），完整刪除檔案數為 0。

## 保留清單

| 項目                                                                                  | 搜尋／使用證據與保留理由                                                                                                                |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `filterLeaderboard`                                                                   | 定義 `apps/bench/lib/view-model.ts:441`；`view-model.test.ts:8,263` 匯入及呼叫。production 無呼叫，但測試確實使用。                     |
| `splitCostSeries`                                                                     | 定義 `view-model.ts:518`；`view-model.test.ts:21,783` 使用。                                                                            |
| `getDataScopeSummary`、`DataScopeSummary`                                             | 函數定義 `view-model.ts:1415`；`view-model.test.ts:9,559` 使用；型別支援該函數。                                                        |
| `sortEvidenceRows`、`EvidenceSortKey`                                                 | 函數定義 `apps/bench/lib/table-sort.ts:76`；`table-sort.test.ts:5,83,89,95` 使用；型別支援該函數。                                      |
| `groupEvidenceByDimension`、`EvidenceGroups`                                          | 函數定義 `table-sort.ts:124`；`table-sort.test.ts:4,105,115,137` 使用；型別支援該函數。                                                 |
| `commonQualityBenchmarks`                                                             | `packages/benchmark-data/src/generate-frontier-set.ts:30` 的 wrapper 有 5 個測試呼叫；底層 helper 也由 production 使用。                |
| `materializeArtificialAnalysis` 的 `articleHtml` 參數                                 | TypeScript 指出未讀取，但函數由 acquisition `index.ts` 公開導出；刪除位置參數會改變 API 契約。                                          |
| 套件 `index.ts` 的公開導出                                                            | 公開 API 不能只以儲存庫內呼叫者數量判定；保留。                                                                                         |
| `capture-meta-release.ts`、`capture-release-assets.ts`、`capture-release-research.ts` | 無其他追蹤檔案引用，但含可直接執行的頂層擷取流程，屬可能由人手執行的入口。                                                              |
| `scripts/report-dimension-proposal.py`                                                | 檔名沒有其他追蹤引用，但可直接產出研究附錄；無法證明手動用途已結束。                                                                    |
| 其他研究／報告 scripts                                                                | 文件存在重現命令或產出來源引用，包括 dimension statistics、frontier cohort、advanced cost、benchmark saturation、duplicate benchmarks。 |
| `profile-evidence.ts`                                                                 | `ModelDetailPanel` 呼叫 loader 與 key helper；loader 再呼叫 parser，是現行路由資料流程。                                                |

## 驗證

刪除前 `CI=1 pnpm test` 通過。第一批刪除後：

| 命令               | 結果                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| `CI=1 pnpm test`   | 通過：scripts 35、acquisition 550、bench 184、benchmark-data 171，共 940 項 |
| `pnpm build`       | 通過：3 個 workspace；Next.js 靜態頁面與 evidence 路由成功產出              |
| `pnpm typecheck`   | 通過                                                                        |
| `pnpm lint`        | 通過                                                                        |
| `pnpm e2e`         | 通過：桌面／行動 Chromium 共 116 項                                         |
| `git diff --check` | 通過                                                                        |

獨立代理 `audit_packages` 在刪除後再次核對三檔 diff，確認正好移除上述 4 個宣告，無剩餘程式引用，Zapier 現行註記流程與 source publication 呼叫路徑成立。`audit_ui` 獨立查核 Web 入口及測試專用 helpers。

執行紀錄保存在本機 `artifacts/dead-code-audit/2026-11-06/`。
