# 代理入口

本專案是由 `data/product/current.json` 建置的靜態看板。文件總覽見 [docs/README.md](docs/README.md)，`apps/bench/AGENTS.md` 只涵蓋 Next.js 的程式細節。

## 資料變更的完成條件

只要改動以下任一項，就必須在同一次任務內執行 `pnpm data:release`：

- `data/sources/<來源>/` 的快照（`manifest`、`candidates`、`costs`、`evidence-index`）
- `data/mappings/` 中會被讀取的 mapping（模型、benchmark、品質政策、前沿身分、來源白名單）
- `packages/benchmark-data/src/` 的計分或建置程式

這個命令會依序完成：核對來源與 artifact → 驗證證據庫 → 產生前沿集合並檢查 audit → 重建 `current.json` → 確認產品可由輸入重現 → 單元測試 → 建置靜態網頁 → 執行 e2e。結果寫入 `artifacts/releases/<run-id>/`，包含 `receipt.json`、`report.md` 與各步驟的 log。

- **完成**：命令退出碼為 0，且 receipt 的 `status` 為 `complete`。接著依 `report.md` 撰寫 `docs/refresh/<日期>.md`（格式見 [OPERATIONS §6](docs/OPERATIONS.md#6-提交與部署)），附上人工抽查清單，再請使用者審核。
- **失敗**：修正原因後重跑；無法修正時，把 receipt、失敗步驟與錯誤訊息交給使用者，不可宣稱已完成。
- 只靠單元測試、parser 修正或建置舊產品，都不算完成資料更新。

匯入來源的命令與畫面列數核對見 [OPERATIONS §2](docs/OPERATIONS.md#2-刷新來源)。新增模型身分必須有官方證據，不可模糊比對。

## 機械驗證與使用者核准是兩件事

- `complete` 只代表機械檢查通過。未經使用者審核並明確指示，不得提交 `data/product/current.json`，也不得 push、deploy 或 release。
- 計分口徑改變造成明顯重排，或出現無法解釋的變化時，同樣要跑完整個流程，然後停在審核階段（[OPERATIONS §5](docs/OPERATIONS.md#5-代理驗證與異動判斷)）。
- 以下由代理依證據自行決定，並在刷新報告寫明依據：官方公告支持的模型身分拆分；來源欄位或 benchmark 被移除時保留既有資料、benchmark 改版時跟隨新版；來源標示為暫定的成績照常採用並揭露。
- 來源大幅改版的整合方向、預設集合的明顯重排、新 benchmark 的計分政策與來源採用規則，由使用者決定。

## 不可跨越的邊界

- 只維護 `apps/bench`、`packages/benchmark-data`、`packages/acquisition` 三個 workspace 與靜態資料流程；不得恢復 DB、Docker、Worker 或舊 Web（[REFACTOR_DISCARD_LIST.md](docs/REFACTOR_DISCARD_LIST.md)）。
- 缺少的成績保持 null，不補零，也不用綜合指數代替。
- 保留使用者既有的變更；提交時逐一加入檔案，不使用 `git add -A`。

## 檢查機制

- Claude Code 的 Stop hook（`.claude/settings.json`）會在上述檔案有變更、卻沒有對應的 release receipt 時阻止結束。
- CI 會執行 `pnpm data:verify-fresh`，以目前的輸入重算產品，結果與已提交的 `current.json` 不符就失敗。
