# G4 — F2 最終驗收重跑（2026-08-21）

## 結論

**不通過。**

G1–G3 修正了原 F2 的部分缺陷，乾淨 checkout 在正確順序下已能完成 181 筆
unit tests、production build 與 8 筆 browser tests。但 G4 的發布前置條件尚未
成立，而且獨立稽核仍找到會誤導接手者或保留半套契約的缺陷：

1. G3 的新 `current.json` 尚未獲使用者核准或提交；乾淨 HEAD 仍是舊的 253 筆
   成本資料，其中 21 筆 `model-catalog` 成本沒有 Evidence。
2. `CLAUDE.md` 仍把 `pnpm e2e` 排在 build 前；照接手入口逐行執行會失敗。
3. G2 沒有建立契約要求的精簡 fixtures，而是把 7 個原 artifact 逐 byte 複製
   進 Git，共 2,525,203 bytes。
4. G1 把 effort 推測規則寫成「每來源自己的眾數」，與規格及程式的「每來源
   最高具名檔位投一票」不同。
5. G3 雖移除了產生空 Evidence 成本的程式路徑，`ProductCostSchema` 仍接受
   `evidenceIds: []`。
6. 原 F2 指出的現行舊架構文件仍存在，沒有標為 Historical／Superseded。

本任務只記錄證據，沒有修正上述缺陷，沒有提交待審的 `current.json`。

## A. 驗收結論

### A1. 乾淨環境完整驗證 — 部分通過

驗證 checkout：`a9bafa7757c035cb3612d4d1e0731a0008a34209`，本機獨立 clone；
clone 內沒有 `.env`、`.env.local`、`artifacts-v2`、`tmp`、`node_modules` 或
既有 `.next`。沒有設定 `ARTIFICIAL_ANALYSIS_API_KEY`、DB 或 channel 變數。

| 指令                                   | 結果                                                           |
| -------------------------------------- | -------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`       | 通過；171 packages，0 download                                 |
| `pnpm format`                          | 通過                                                           |
| `pnpm lint`                            | 通過                                                           |
| `pnpm typecheck`                       | 通過；4/4 turbo tasks                                          |
| `pnpm test`                            | 通過；181 tests（bench 63、benchmark-data 64、acquisition 54） |
| `pnpm --filter @llm-bench/bench build` | 通過；靜態路由 `/`、`/_not-found`                              |
| `pnpm e2e`（build 後）                 | 通過；8 passed、2 skipped                                      |

production build 另在 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY` 全部指向
`127.0.0.1:1`、`NODE_USE_ENV_PROXY=1` 的條件下執行，仍成功。這個 checkout
沒有 artifact store、DB 或 Docker，也沒有 AA key。建置讀取路徑只到
`apps/bench/lib/load-product-version.ts:13-63` 的 `current.json`、benchmark mapping
與 display set；`apps/bench/app/page.tsx:4-14` 強制 static render。

但契約順序仍失敗：`CLAUDE.md:35-48` 把 `pnpm e2e` 放在 build 前。第二個全新
checkout 證明 `.next` 不存在時，該步驟以 exit 1 結束：

```text
Error: Could not find a production build in the '.next' directory.
Process from config.webServer was not able to start. Exit code: 1
```

`README.md:83-89` 與 `docs/OPERATIONS.md:141-151` 已改為正確順序，但最高優先
接手入口沒有同步。因此「正確順序的工具鏈」通過，「依現行共同契約逐行執行」
不通過。

### A2. Git 與外部狀態 — 不通過

通過部分：

- branch 是 `main`，沒有 stash，local/remote branch 只有 `main` / `origin/main`。
- `git diff --check` 無 whitespace error。
- `current.json` 歷史仍恰好三次，沒有第四次：
  `a416249`、`8283ee4`、`b60e75d`。前兩次在計畫中有審核關卡授權，C7 由
  使用者明確指示「通過並提交 C7」。
- `origin/main` 仍為 `9ab96b26ae75f97fe3a27980a5c7ec56bcfb4860`；本地 main
  在驗收開始時 ahead 67。GitHub 為 0 tags、0 releases、0 deployments、
  0 environments；遠端最新執行仍是舊 SHA 上的既有排程。

不通過部分：

- G4 開始時工作樹已有待審的 `data-v2/product/current.json`；這是 G3 的正常
  產物，但代表 G4 計畫 `tasks/claude-code-plan.md:887` 的「使用者核准之後」
  前置條件未滿足。本次沒有 stage 或提交它。
- `git worktree list` 仍列出倉庫外 detached worktree
  `N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-frontend`，HEAD
  `85e87db18ea97da4b1b654cb9e6f700c1a6317b2`。本驗收沒有進入或修改它。

### A3. ProductVersion 與 G3 — 不通過

| 項目                   | 乾淨 HEAD                                                                 | 工作樹待審版本                                                            |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `versionId`            | `sha256:e113d47e89702a70364372f4cc1dd63ac4673c850d8256f79aeb1d5e1637ef21` | `sha256:bec073cf27357689035bfebaa7c5dcf61adb9b068b81ea3195570958f3e56385` |
| schema                 | `product-version-v3`                                                      | `product-version-v3`                                                      |
| 模型／排行榜／Evidence | 45／106／920                                                              | 45／106／920                                                              |
| 成本列                 | 253                                                                       | 232                                                                       |
| `model-catalog` 成本   | 21                                                                        | 0                                                                         |
| 空 `evidenceIds` 成本  | 21                                                                        | 0                                                                         |

待審版本的 232 筆成本分佈為 Artificial Analysis 51、DeepSWE 61、Frontier Code
72、LiveBench 48。G3 程式本身已移除 catalog projection，且
`packages/benchmark-data/src/pipeline.test.ts:396-403` 會檢查 builder 產物沒有
`model-catalog` 且每筆 cost 有 Evidence。

但有兩個缺陷：

1. 乾淨 checkout／production build 固定讀取的仍是未修正資料，故 G3 尚未成為
   可部署狀態。
2. `packages/benchmark-data/src/index.ts:722-737` 的 `ProductCostSchema` 把
   `evidenceIds` 定義為 `z.array(Sha256Schema)`，沒有 `.min(1)`。實測把任一
   ProductCost 改為 `evidenceIds: []`，`ProductVersionSchema.safeParse` 仍回傳
   `success: true`。這與 `docs/DATA_METHODOLOGY.md:101` 的強制敘述不一致。

圖表沒有因 G3 改變：舊、新資料均為預設圖 12 points、進階圖 42 series / 125
points，其中 25 條 series 有至少 2 points。但
`docs/REFRESH_2026-08-21.md:51` 寫成 34 條，屬報告數值錯誤。

### A4. 保留功能證據 — 通過

#### 完整矩陣與主畫面

- `apps/bench/lib/view-model.ts:181-220` 同時檢查 14-item display set 與八維非 null。
- `apps/bench/lib/view-model.test.ts:234`、
  `apps/bench/components/dashboard.test.tsx:360` 與
  `apps/bench/e2e/dashboard.spec.ts:4` 有 unit、component、browser 三層證據。
- 待審 ProductVersion 實測為 12 rows、7 providers、0 N/A。providers 是
  anthropic、deepseek、google、moonshot、openai、xai、zai。

#### 代表 profile

- `apps/bench/lib/view-model.ts:146-161` 使用同一個 representative selector。
- 45 個模型全量比對，0 個 representative 低於同模型最高 Overall。
- `apps/bench/lib/view-model.test.ts:540-677` 與
  `apps/bench/components/dashboard.test.tsx:384` 覆蓋 leaderboard、預設選取、
  雷達圖與預設成本圖；實測 12 個預設成本點的 profile mismatch 為 0。

#### 兩張性價比圖

- `apps/bench/lib/view-model.ts:10-15` 是四來源各 0.25。
- `apps/bench/lib/view-model.ts:717-825` 的進階圖只用 AA、DeepSWE、Frontier
  Code，缺任一來源即排除整個模型，且不讀 Overall。
- 待審資料為預設圖 12 points、進階圖 42 series / 125 points；逐點核對
  `sourceId + profileId`，成本與 Y 軸 Evidence 的同源 mismatch 為 0。
- AA Y 軸使用 EXCLUDED Intelligence Index raw score；DeepSWE 與 Frontier Code
  使用各自 INCLUDED benchmark normalized score。

#### Developer mode

- `apps/bench/lib/view-model.ts:229-296` 回傳的型別只有 model/profile/name/missing
  cells，不含 Overall、dimension 或 score。
- 待審資料為 33 rows，33/33 `profileId` 可解析到 `product.profiles`，聚合欄位
  命中 0。
- 回歸測試見 `apps/bench/lib/view-model.test.ts:262-474`。

#### Artificial Analysis Intelligence Index

- 待審 ProductVersion 有 52 筆 Index Evidence；52/52 為 `EXCLUDED`，0 筆被
  leaderboard 的 `evidenceResultIds` 引用。
- `apps/bench/lib/view-model.ts:419-463` 只在 AA 進階圖讀取其 `rawScore`。
- `packages/benchmark-data/src/pipeline.test.ts:172-186` 證明它不進維度或 Overall。

### A5. 移除功能負面搜尋 — 不通過

runtime、schema product shape、產品資料、dependency manifests、lockfile、root
scripts 與 CI 中，舊 app／DB／video 契約已移除：

- ProductVersion 沒有 `status`、Coverage、pointer、state 或 `compositeSources` key。
- `ESTIMATED` 只剩 schema 拒絕測試；Coverage runtime 命中只屬規格 §5.3 的
  coverage-matrix 報告工具。
- tracked tree 沒有 `apps/web`、`apps/video`、`apps/worker`、`packages/db`、
  `versions/*.json` 或 `evidence-detail.tsx`。
- root manifests、lockfile 與 CI 沒有 Drizzle、PostgreSQL client、Remotion、
  Compose 或舊 LiveBench ingest/score/promote/weekly command。

但現行文件仍會讓接手者以為舊架構受支援：

1. `tasks/plan.md:13,18,29-46` 仍把不可變 Draft、Published pointer、Estimated、
   Coverage、Draft pointer 與首次 Published switch 寫成目標或待執行工作。
2. `tasks/todo.md:20-30` 仍把 Developer 1–7/8、Draft review、Draft → Published
   與 rollback 寫成現行 requirements／未完成事項。
3. `docs/BENCHMARK_SCORE_SOURCES.md:8` 自稱「允許匯入成績的來源白名單」，
   並在 `:32-55` 等處將多個非四來源站標為 ACTIVE；實際 whitelist
   `data-v2/mappings/sources.json:3` 只有四站。這份文件在
   `docs/README.md:20` 仍列為現行「可採用來源」，沒有歷史警告。

歷史 `REFACTOR_SPEC.md`、`DECISIONS.md` 與 `DRAFT_REVIEW_*` 命中沒有列為缺陷。

### A6. Package graph 與依賴 — 通過

- workspace 實際只有 root 加三個 package：`@llm-bench/bench`、
  `@llm-bench/acquisition`、`@llm-bench/benchmark-data`。
- 磁碟與 Git 都沒有 `apps/web`、`apps/video`、`apps/worker`、`packages/db`；
  `tmp/` 已不存在。
- `pnpm-lock.yaml` 無 Drizzle、PostgreSQL client 或 Remotion dependency；
  `@vitest/browser-preview` 是 Vitest 的 optional peer 名稱，不是 PREVIEW channel。

本機 `data-v2/product/versions/` 是空目錄，0 files、0 tracked entries；乾淨 clone
不會建立它。這不等於仍有 `versions/*.json` runtime。

### A7. G1 八項對照 — 不通過

| G1 項目                              | 結果       | 證據                                                                                                                                                  |
| ------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| effort 推測與 `xhigh`                | **不通過** | casing 已修；但 `docs/DATA_METHODOLOGY.md:82` 寫每來源自己的眾數，規格 `REFACTOR_SPEC_V2.md:119` 與程式 `index.ts:504-551` 是每來源最高具名檔位投票。 |
| 進階圖缺來源規則                     | 通過       | `DATA_METHODOLOGY.md:135` 與 `view-model.ts:793-801` 都是缺任一來源即排除模型。                                                                       |
| LiveBench／DeepSWE live refresh 命令 | 通過       | `DATA_METHODOLOGY.md:45-52` 與 `packages/acquisition/package.json:16-20` 一致。                                                                       |
| Overall 與 PROJECT_HANDOFF 狀態      | 通過       | `PROJECT_HANDOFF.md:60` 為八維不齊即 null；`docs/README.md:9` 標 Historical。                                                                         |
| §11.4 刷新報告欄位                   | 通過       | `OPERATIONS.md:112-132` 包含 version/delta、主畫面進出、最大分數變動、推測揭露與抽查四欄。                                                            |
| version header                       | 通過       | `OPERATIONS.md:76` 與 `version-header.tsx:35-43` 都是頁首縮寫 + title、頁尾完整值。                                                                   |
| validation 順序                      | **不通過** | README／OPERATIONS 已修，但 `CLAUDE.md:35-48` 仍是 e2e before build，實測 exit 1。                                                                    |
| 成本 Evidence（交由 G3）             | **不通過** | builder 與待審資料已修；乾淨 HEAD 未修，且 ProductCost schema 仍接受空陣列。                                                                          |

另有一個計畫內部矛盾：`tasks/claude-code-plan.md:599` 仍宣稱主畫面有 8 家
provider，同文件 `:825` 與實際資料都是 7 家。G 階段雖把它定性為先前的口頭
誤述，卻沒有更正原宣稱所在行。

### A8. G2 fixture 契約 — 不通過

G2 的目標「乾淨 clone 無 `artifacts-v2` 仍能跑 tests」已達成，181 tests 全綠；
但作法直接違反 `tasks/claude-code-plan.md:858-860` 的「縮成精簡 fixture、不要整份
artifact 進 Git」。

`packages/acquisition/test-fixtures/README.md:3-17` 明確寫：

- `Byte-for-byte copies`
- `copied verbatim rather than trimmed on purpose`
- 更新方式是從 `artifacts-v2/sha256/...` 直接 copy

7 個 fixture 的 SHA-256 均等於原 artifact 檔名，總計 2,525,203 bytes（2.408
MiB）；其中兩個 HTML 為 1,353,178 與 386,099 bytes，zip 為 407,600 bytes。
這不是「只保留測試實際斷言內容」的精簡 fixture。

## B. 仍需使用者人工處理的項目

### B1. `current.json` 審核與 commit 指示

現況：G3 待審版本是
`sha256:bec073cf27357689035bfebaa7c5dcf61adb9b068b81ea3195570958f3e56385`，
45 models / 106 leaderboard rows / 920 evidence / 232 costs；成本只剩四個來源，
0 `model-catalog`、0 空 `evidenceIds`。它仍是未提交變更。

建議：先處理本報告的 ProductCost schema 與文件問題，重新建置並核對 versionId；
使用者依 §11.4 審核 `docs/REFRESH_2026-08-21.md`（其中 34 應更正為 25）後，
再明確指示是否提交 `current.json`。本次 G4 指示不視為資料 commit 授權。

### B2. 首次部署

現況：origin/main 仍是 2026-07-15 的舊 SHA，0 deployment/release/tag/environment；
本地變更尚未 push。

建議：修完阻擋項、重跑 G4 並核准/提交產品資料後，才由使用者決定 push 與部署。
部署後以頁尾完整 versionId 對照獲核准版本。G4 commit 不是 push/deploy 授權。

### B3. 倉庫外舊 worktree

現況：外部 detached worktree 仍註冊；本驗收依指示沒有進入或修改。

建議：使用者先決定未追蹤 UI／build 產物是否備份；不需要時，再明確授權由原
建立工具解除 worktree 註冊並刪除目錄。不要合併回 main。

### B4. Artificial Analysis 金鑰輪換

現況：`.env.local` 被 `.gitignore:12` 忽略；載入指令在
`packages/acquisition/package.json:20`，唯一程式讀取點在
`packages/acquisition/src/refresh-artificial-analysis.ts:177-188`。用目前 key 的
完整值做不輸出內容的精確掃描，Git 全歷史、`artifacts-v2`、
`data-v2/product/` 與本機 `apps/bench/.next` 均為 0 matches；Git 也沒有 tracked
env file。

建議：因舊 key 曾出現在對話中，MVP 修正與驗收完成後撤銷舊 key、建立新 key，
只更新 `.env.local`，再執行一次 warning-safe AA refresh。不要把值寫進 report、
artifact 或 ProductVersion。

## C. 尚未解決但不單獨阻擋驗收的項目

1. `product.frontier` 53/53 rows 使用 `<modelId>-unspecified`，0/53 可解析到
   `product.profiles`。Developer mode 已排除污染，但 §4.4 沒有 `unspecified`。
2. AA captured profile 母體從 482（舊 report 476）降到 151；
   `docs/REFRESH_2026-08-20.md:118-121` 已揭露，仍需後續確認 projection 或擷取
   範圍變化。
3. `g9v3-39a5b` 的 LCR、HLE、GPQA、SciCode、Terminal-Bench 2.1 五項 API
   差異仍存在，見 `data-v2/sources/artificial-analysis/validation-report.md:35-39`。
4. 本地主 checkout 的 ignored `.env` 仍含舊 `POSTGRES_*`、`DATABASE_URL` 等
   變數名稱。它不在 Git、乾淨 checkout 或現行 runtime，但若值仍有效，建議
   使用者撤銷並清理。
5. e2e 通過時仍警告 `next start` 不支援 `output: standalone`，建議日後把
   Playwright webServer 改為啟動 `.next/standalone/server.js`。目前不是功能阻擋，
   browser suite 仍為 8 passed / 2 skipped。

## D. 任務回報

### summary

G4 已按 F2 範圍完整重跑，結論不通過。產品功能與正確順序的乾淨建置均通過，
但發布狀態、G1/G2/G3 契約與現行文件仍有可重現缺陷。

### changed_files

- `docs/G4_F2_ACCEPTANCE_2026-08-21.md`
- `tasks/claude-code-plan.md`（只更新 G4 狀態）

### validation

- 乾淨 HEAD：install、format、lint、typecheck、181 tests、offline production build、
  build 後 e2e 全綠。
- 另一個乾淨 checkout：依 `CLAUDE.md` 在 build 前跑 e2e，exit 1。
- 工作樹待審 ProductVersion：schema/hash、資料量、成本來源、主畫面、兩張圖、
  Developer mode、AA Index 全量核對完成。
- Git history、remote state、worktree/stash/branch、package graph、lockfile、CI、
  key 泄漏與 legacy negative search 完成。

### risks

- 只看 tests 綠燈會漏掉 G2 直接提交完整 artifacts 與 ProductCost schema 可接受
  空 Evidence 的契約缺陷。
- 只在工作樹 build 會遮蔽 HEAD 尚未包含 G3 產品資料；首次部署只會拿到 HEAD。
- `git status` 不顯示 ignored `.env`、外部 worktree 內容或空 versions 目錄。

### unresolved

- 修正本報告 A3、A5、A7、A8，核准並提交新的 `current.json` 後，需由新的獨立
  驗收者再跑一次 G4。
- 首次部署、外部 worktree 處置與 AA key 輪換仍需使用者人工執行或明確授權。
