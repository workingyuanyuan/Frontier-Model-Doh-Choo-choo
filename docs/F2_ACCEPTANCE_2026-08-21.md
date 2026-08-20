# F2 最終驗收報告 — 2026-08-21

## 結論

**不通過。** F2 驗收工作已完成，但目前 repository 不符合「乾淨 checkout
完整驗證全綠、舊架構在磁碟上無殘留、現行文件與程式一致」的完成條件。

阻擋驗收的事實如下：

1. 乾淨 checkout 的 `pnpm test` 依賴 Git 外 `artifacts-v2`，實際失敗。
2. 依指定順序執行時，乾淨 checkout 的 `pnpm e2e` 在 production build 前啟動
   `next start`，因 `.next` 不存在而失敗。
3. 被 `.gitignore` 隱藏的 `tmp/ci-clean-20260713/` 仍含舊 `apps/web`、
   `apps/video`、`apps/worker` 與 `packages/db`；Git graph 正確，但磁碟不乾淨。
4. 多份現行文件仍描述舊 effort 推測、舊 Overall、舊刷新命令或舊
   Draft/Published pointer 流程。
5. 主畫面確為 12 列且無 N/A，但實際只有 **7** 家 provider，不是宣稱的 8 家。

本驗收沒有修正上述問題。

## A. 驗收結論

| 驗收項目                | 結果       | 摘要                                                                                                               |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 1. 乾淨環境完整驗證     | **不通過** | install、format、lint、typecheck、production build 通過；test 與依指定順序執行的 e2e 失敗                          |
| 2. Git 與外部狀態       | **不通過** | 主工作樹、branch、stash、current commit 與 GitHub release/deployment 檢查通過；既有外部 detached worktree 仍註冊中 |
| 3. 保留功能證據         | **通過**   | 完整矩陣、代表 profile、兩張成本圖、Developer mode、Index exclusion 均有程式／測試／資料證據                       |
| 4. 移除功能負面搜尋     | **不通過** | runtime/schema/lockfile 已移除；現行 task/document 仍有舊契約，且 ignored tmp 仍有舊 app/package                   |
| 5. Package graph 與依賴 | **不通過** | workspace 與 lockfile 正確；磁碟上的 ignored tmp 不符合「舊 app/package 不存在」                                   |
| 6. 文件一致性           | **不通過** | 找到多個可讓接手者依錯誤規則操作的具體敘述                                                                         |

### A1. 乾淨環境完整驗證

驗證在由 `HEAD aa5d930805da59a290f74e3d52c9fc43da04477e` 建立的全新本機 clone
執行。該 clone 沒有 `.env.local`、`artifacts-v2`、既有 `node_modules` 或未追蹤
檔案；`ARTIFICIAL_ANALYSIS_API_KEY`、`LLM_BENCH_CHANNEL`、`DATABASE_URL`、
`POSTGRES_URL`、`DOCKER_HOST` 均未設定。驗證完成後已刪除該暫存 clone。

| 指令                                   | 結果     | 證據                                                                                                         |
| -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile`       | 通過     | 171 packages，lockfile 未變                                                                                  |
| `pnpm format`                          | 通過     | `All matched files use Prettier code style!`                                                                 |
| `pnpm lint`                            | 通過     | exit 0，0 warnings                                                                                           |
| `pnpm typecheck`                       | 通過     | Turbo 4/4 tasks successful                                                                                   |
| `pnpm test`                            | **失敗** | acquisition 4 test files failed、6 assertions/setup failures；benchmark-data 64 tests 與 bench 63 tests 通過 |
| `pnpm e2e`（指定順序、build 前）       | **失敗** | `Could not find a production build in the '.next' directory`                                                 |
| `pnpm --filter @llm-bench/bench build` | 通過     | 3/3 static pages；無 key、`.env.local`、artifact store、DB 或 Docker                                         |
| `pnpm e2e`（build 後補跑）             | 通過     | 8 passed、2 skipped                                                                                          |

production build 另以 `NODE_USE_ENV_PROXY=1` 並把 HTTP(S) 指向不可連線的本機
代理重跑，仍成功完成。這證明建置不以 Artificial Analysis API、artifact、DB 或
遠端 HTTP(S) 成功回應為必要條件。

#### 缺陷 F2-01：unit tests 依賴未進 Git 的 artifact store

乾淨 clone 的失敗是 `ENOENT`，不是來源網站或金鑰問題。測試直接讀取
`.gitignore` 排除的 `artifacts-v2/sha256/...`：

- `packages/acquisition/src/artificial-analysis-materializer.test.ts:31-42,82-93`
- `packages/acquisition/src/deepswe-materializer.test.ts:9-12`
- `packages/acquisition/src/livebench-materializer.test.ts:13-25`
- `packages/acquisition/src/epoch-materializer.test.ts:31-34,80-84`
- `.gitignore:19` 明確忽略 `artifacts-v2/`

因此目前的「乾淨 checkout 可跑 tests」宣稱不成立。

#### 缺陷 F2-02：`pnpm e2e` 不是自足命令

`playwright.config.ts:20-25` 的 web server 只執行 `next start`，不先 build；
README 與 Operations 卻都把 e2e 排在 production build 前：

- `README.md:82-89`
- `docs/OPERATIONS.md:140-148`

乾淨 checkout 依該順序必然缺少 `.next`。CI 因
`.github/workflows/ci.yml` 先 build 後 e2e 而不會暴露此問題。

### A2. Git 與外部狀態

通過部分：

- `git status --short --branch`：`main...origin/main [ahead 62]`，主工作樹乾淨。
- `git diff --check`：無輸出。
- local/remote branch 只有 `main` / `origin/main`，無長期功能分支。
- `git stash list` 與 `refs/stash` 均為空。
- `current.json` 歷史恰好三次，沒有第四次：
  - `a416249de6ef7787d08f3d2e8aca99880196372c`
  - `8283ee428438344d65e508697ca6a591fda1023c`
  - `b60e75df5ad4c47858dc0b06129e1a5399e3f29a`
- 前兩次授權記錄見 `tasks/claude-code-plan.md:475-480,593-599`；C7 在本次
  工作對話中由使用者明確指示「通過並提交 C7」。
- origin `main` 仍停在 `9ab96b26ae75f97fe3a27980a5c7ec56bcfb4860`；本地 62 個新
  commit 尚未 push。
- GitHub API：0 tags、0 releases、0 deployments、0 environments；現行 CI 無
  deploy/release step。遠端仍有舊 commit 上的 scheduled weekly runs，但沒有本次
  重構 commit 的 push/run/deployment。

不通過部分：

- `git worktree list` 仍列出倉庫外 detached worktree
  `N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-frontend`。本驗收依指示
  沒有進入或修改它。

### A3. 保留功能的實際證據

#### 完整矩陣與主畫面

- `data-v2/mappings/display-set.json` 為審核關卡 2 定案的 14 項，定案後無 diff。
- `apps/bench/lib/view-model.ts:181-220` 分別驗證每個 display-set cell 與八維
  非 null。
- `apps/bench/lib/view-model.test.ts:234-260`、
  `apps/bench/components/dashboard.test.tsx:360-382` 與
  `apps/bench/e2e/dashboard.spec.ts:9-14` 有回歸證據。
- 直接以目前 ProductVersion 計算：12 個 eligible profile、12 個主畫面 row、
  12 個 row 的 Overall 與八維全數非 null。

數量勘誤：這 12 列的唯一 provider 為 `anthropic`、`deepseek`、`google`、
`moonshot`、`openai`、`xai`、`zai`，共 **7 家**；
`tasks/claude-code-plan.md:599` 的「8 家廠商」不符目前資料。

#### 代表 profile

- `apps/bench/lib/view-model.ts:146-177` 以最高 `overallScore` 選取，平手以
  `profileId` 決定。
- 對目前 45 個 leaderboard model 全量核對，沒有選到低於同模型最高
  `overallScore` 的反例。
- `apps/bench/lib/view-model.test.ts:540-677` 與
  `apps/bench/components/dashboard.test.tsx:384-405` 驗證 leaderboard、預設選取、
  雷達圖與成本圖不分岔。

#### 兩張性價比圖

- `apps/bench/lib/view-model.ts:10-40` 定義四來源各 0.25；
  `:574-677` 建立預設圖並排除 API standardized cost。
- `apps/bench/lib/view-model.ts:717-826` 只建立 AA、DeepSWE、Frontier Code 的
  source-local series，且缺任一來源即排除整個模型。
- 目前資料：預設圖 12 點；進階圖 42 series / 125 points（每來源 14 series）。
- 全量核對每個進階點，cost 與 score 都可由相同 `sourceId + profileId` 解析。
- `apps/bench/lib/view-model.test.ts:653-918` 覆蓋四來源權重、API cost 排除、
  三來源門檻、AA Index 與同源配對；e2e 的 keyboard toggle 見
  `apps/bench/e2e/dashboard.spec.ts:67-85`。

#### Developer mode

- `apps/bench/lib/view-model.ts:229-296` 只產生 model/profile/missing cell 診斷列。
- 目前為 33 列；33/33 的 `profileId` 都存在於 `product.profiles`。
- `apps/bench/lib/view-model.test.ts:262-462` 驗證不產生 Overall／維度聚合、選
  缺格最少 profile，並排除不存在的 placeholder profile。

#### Artificial Analysis Intelligence Index

- 目前 52 筆 Index evidence，52/52 為 `EXCLUDED`，0 筆被 leaderboard 引用。
- `apps/bench/lib/view-model.ts:419-474` 只在進階圖讀取其 `rawScore`。
- `packages/benchmark-data/src/pipeline.test.ts:172-186` 驗證 EXCLUDED composite
  不進八維或 Overall。

### A4. 移除功能的負面搜尋

程式、schema、產品資料、dependency manifest、lockfile、root scripts、CI 與測試
中的 runtime 舊契約已移除：

- `ESTIMATED` 只剩 schema 的拒絕測試；ProductVersion v3 無 status 欄位。
- `coverage` 的現行命中是 §5.3 `coverage-matrix` 報告，不是 UI 比例或 8/8 欄位。
- `compositeSources` 只剩 schema 防回歸測試與「已移除」文件；
  `data-v2/mappings/frontier.json` 只有 `qualificationWindowMonths` 與
  `manualModels`。
- 無 pointer、`LLM_BENCH_CHANNEL`、publish/rollback state machine、
  `versions/*.json`、`evidence-detail.tsx` 或舊 LiveBench root command。
- 歷史 `REFACTOR_SPEC.md`、`DECISIONS.md`、`DRAFT_REVIEW_*` 的命中沒有列為缺陷。

但負面搜尋仍不通過：

1. `tasks/plan.md:13,18,29-46` 與 `tasks/todo.md:20-30` 沒有被現行文件索引標成
   歷史，仍把 Draft/Published pointer、Estimated、Coverage、Developer 1-7/8
   寫成待執行或現行流程。
2. `docs/BENCHMARK_SCORE_SOURCES.md:8,32-55` 自稱「允許匯入成績的來源白名單」
   並列出大量 ACTIVE 來源；實際 active whitelist 只有四站。
3. ignored `tmp/ci-clean-20260713/` 仍含舊 app/package，詳見 A5。

### A5. Package graph 與依賴

通過部分：

- workspace 實際只有 `apps/bench`、`packages/acquisition`、
  `packages/benchmark-data`；root `apps/` 與 `packages/` 也只有這三個目錄。
- HEAD tree 沒有 `apps/web`、`apps/video`、`apps/worker`、`packages/db`。
- package manifests 與 `pnpm-lock.yaml` 無 Drizzle、PostgreSQL client、Remotion 或
  只因它們存在的 transitive entry。

不通過部分：

`tmp/` 被 `.gitignore:22` 忽略，因此 `git status` 看起來乾淨，但磁碟仍有：

| 路徑                                | 檔案數 |   bytes |
| ----------------------------------- | -----: | ------: |
| `tmp/ci-clean-20260713/apps/web`    |     30 | 243,441 |
| `tmp/ci-clean-20260713/apps/video`  |     40 |  88,832 |
| `tmp/ci-clean-20260713/apps/worker` |     29 |  63,514 |
| `tmp/ci-clean-20260713/packages/db` |     82 | 378,639 |

這正是驗收要求特別指出的「未追蹤舊建置產物殘留」。本驗收沒有刪除它們。

### A6. 文件一致性抽查

以下均為現行文件與權威規格／程式不一致，不是單純措辭問題：

1. `docs/DATA_METHODOLOGY.md:77-82` 與
   `docs/BENCHMARK_SCORE_SOURCES.md:14` 寫「未標 effort 取最高檔」；規格 §4.5
   與 `packages/benchmark-data/src/index.ts:504-561` 實際為每來源一票的眾數，
   平手才取較高。`DATA_METHODOLOGY.md:78` 還把合法值 `xhigh` 寫成 `xHigh`；
   schema 定義見 `packages/benchmark-data/src/index.ts:352-360`。
2. `docs/DATA_METHODOLOGY.md:134` 寫缺來源時只不顯示「該來源曲線」；規格
   §6.3 與 `apps/bench/lib/view-model.ts:793-818` 是缺任一來源即不顯示整個模型。
3. `docs/DATA_METHODOLOGY.md:45-52` 的 LiveBench／DeepSWE 操作仍用 replay 型
   `materialize:snapshots` / `materialize:costs`，沒有列出 package manifest
   `packages/acquisition/package.json:18-19` 的 live refresh commands；README 與
   Operations 則列出正確命令。
4. `docs/PROJECT_HANDOFF.md:60` 寫 Overall 只平均已有維度；實作
   `packages/benchmark-data/src/index.ts:1037-1049` 是八維不齊即 `null`。
   `docs/README.md:9` 仍把 PROJECT_HANDOFF 標成 Current。
5. `docs/DATA_METHODOLOGY.md:100-105` 寫所有 cost 必須帶 Evidence、不能從
   model catalog 手工提供；實作 `packages/benchmark-data/src/index.ts:1268-1308`
   仍產生 21 筆 `model-catalog` cost，`evidenceIds` 為空。這些列因 source weight
   為 0 不進預設圖，但文件描述不是現況。
6. `docs/OPERATIONS.md:113-129` 的刷新報告清單沒有完整抄入規格 §11.4 的
   強制欄位：舊／新 versionId 及模型／leaderboard／evidence／cost delta、主畫面
   進出與原因、既有模型最大分數變動、逐筆檔位推測揭露表。
7. `docs/OPERATIONS.md:76` 說頁首與頁尾都顯示完整 versionId；
   `apps/bench/components/version-header.tsx:3-4,37-38` 的頁首文字是縮寫，完整值
   只在 `title`，頁尾才直接顯示完整值。
8. `README.md:82-89` 與 `docs/OPERATIONS.md:140-148` 的驗證順序在乾淨 checkout
   不可執行，證據見 F2-02。

## B. 仍需使用者人工處理的項目

### B1. `current.json` 審核與 commit 指示

現況：`current.json` 已追蹤且工作樹無新變更；內容驗證通過：

- `versionId`: `sha256:e113d47e89702a70364372f4cc1dd63ac4673c850d8256f79aeb1d5e1637ef21`
- schema: `product-version-v3`
- 45 個 leaderboard/profile 模型
- 106 leaderboard rows
- 920 evidence
- 253 costs
- 14 個 display-set benchmark

建議：未來每次刷新依規格 §11.4 先保留未提交的 `current.json`，產出完整刷新
報告與人眼抽查清單，等使用者明確說「通過並提交」後才 commit。F2 本身沒有
重建或 stage `current.json`。

### B2. 首次部署

現況：GitHub origin/main 仍是舊 commit；GitHub 無 release、deployment、tag 或
environment。production build 可在無 key／artifact／DB／Docker 下成功。

建議：**先修完本報告的阻擋缺陷並重跑 F2，再進首次部署。** 屆時由使用者決定
push 與部署平台；部署後核對頁尾完整 versionId 等於上述審核值。代理不得把本次
驗收 commit 視為 push/deploy 授權。

### B3. 倉庫外舊 worktree

現況：`N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-frontend` 仍註冊為
detached worktree，指向 `85e87db18ea97da4b1b654cb9e6f700c1a6317b2`。本驗收沒有
進入、讀取或修改它。

建議：使用者先決定未追蹤 UI／建置產物是否需要備份；不需要時，再由使用者明確
授權以原建立工具解除 worktree 註冊並刪除目錄。不要把它合併回 main。

### B4. Artificial Analysis 金鑰輪換

現況：金鑰只由 gitignored `.env.local` 載入；
`packages/acquisition/package.json:20` 定義載入，讀取點在
`packages/acquisition/src/refresh-artificial-analysis.ts:177-188`。以目前
`.env.local` 的值做不輸出內容的精確掃描，Git HEAD、Git 歷史、`artifacts-v2` 與
`data-v2/product/current.json` 均為 0 命中。

建議：因金鑰曾出現在對話中，MVP 驗收缺陷修正後立即在 Artificial Analysis
撤銷舊金鑰、建立新金鑰，只更新 `.env.local`，再以一個 warning-safe refresh
驗證新金鑰。不要把值寫入 report、artifact 或 ProductVersion。

## C. 尚未解決但不單獨阻擋驗收的項目

1. `product.frontier` 53/53 列仍使用 `<modelId>-unspecified` placeholder；0/53
   可解析到 `product.profiles`。E5 已避免它污染 Developer mode，但規格 §4.4
   沒有定義 `unspecified`。需另行決定它是純 frontier 指標，或改用非 profile
   結構；本驗收不決定。
2. Artificial Analysis 的 captured profile 母體由 manifest 的 482（舊 report
   曾記 476）降為 151。`docs/REFRESH_2026-08-20.md:118-121` 已揭露，但仍需要
   日後確認是頁面 projection 改變或擷取範圍縮水。
3. AA API 對未解析列 `g9v3-39a5b` 有 5 項超出容差差異：LCR、HLE、GPQA、
   SciCode、Terminal-Bench 2.1；見
   `data-v2/sources/artificial-analysis/validation-report.md:30-40`。
4. 本地主 checkout 有被忽略的 `.env`，只包含舊 `POSTGRES_*`、`DATABASE_URL`
   等變數名稱；它不在 Git、乾淨 checkout 或現行程式依賴中，但屬本機舊 DB
   設定殘留。若值仍有效，建議使用者另行撤銷並清理。
5. `data-v2/product/versions/` 在本機是空目錄，無 JSON、無 tracked file，乾淨
   checkout 不會重建；不影響 runtime，但可與 ignored tmp 一併清理。
6. 目前有 21 筆 `model-catalog` cost、`evidenceIds: []`。它們不在四來源權重表，
   不進成本圖；是否保留此 legacy catalog cost contract 應另立規格決定。

## D. 任務回報

### summary

F2 稽核已完整執行；最終判定為不通過。未修正任何產品、程式、資料或文件缺陷。

### changed_files

- `docs/F2_ACCEPTANCE_2026-08-21.md`
- `tasks/claude-code-plan.md`（只把 F2 狀態改為完成）

### validation

- 主 checkout：`git status` 原先乾淨、`git diff --check` 通過、main、無 stash。
- 乾淨 clone：install／format／lint／typecheck／build 通過；test 與 build 前 e2e
  失敗；build 後 e2e 8 passed / 2 skipped。
- ProductVersion schema 與內容 hash 驗證通過。
- GitHub remote/release/deployment read-only audit 完成。
- 保留功能全量資料查核與負面搜尋完成。

### risks

- `git status` 不會顯示 ignored tmp、`.env` 或空目錄，因此不能把「status clean」
  當成磁碟乾淨證據。
- 現行 CI 的 build-before-e2e 順序會遮蔽 `pnpm e2e` 非自足的問題。
- production build 通過不代表完整 validation 通過；acquisition tests 仍需要外部
  artifact store。

### unresolved

- 修正 F2-01、F2-02、ignored legacy tmp、provider 數宣稱與文件衝突後，需重新
  執行完整 F2。
- 首次部署、外部 worktree 處置、AA key 輪換仍由使用者人工執行或明確授權。
