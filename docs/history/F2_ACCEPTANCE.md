# H5 — F2 最終驗收重跑（第三次，2026-08-21）

## 1. 結論

**通過。** 目前 `main`（驗收起點 `eb46d648fb435a90df08cf6ec5b28b00be7e2fb0`）在乾淨 clone 依 `CLAUDE.md` 的不可換序命令全綠；G4 七項阻擋均已解除或有明確使用者裁決；H1–H4 的文件、程式、schema 與已發布資料經獨立重算一致。

## 2. 阻擋項

**無。**

驗收者沒有修正產品、程式、資料或既有文件。唯一產物是本報告。

## 3. 基準驗證

### 3.1 乾淨環境

從主工作目錄的已提交 `main` 建立本機 clone：

```text
Cloning into 'N:\Coding\LLM Bench Project\h5-clean-bbcd791cda394dfca71814539b76e59c'...
done.
H5_CLONE=N:\Coding\LLM Bench Project\h5-clean-bbcd791cda394dfca71814539b76e59c
eb46d648fb435a90df08cf6ec5b28b00be7e2fb0
## main...origin/main
.env=False
.env.local=False
artifacts-v2=False
node_modules=False
apps/bench/.next=False
```

以下七步完全依 `CLAUDE.md:34-46` 的順序執行，沒有調換。

#### 1. `pnpm install --frozen-lockfile`

```text
Scope: all 4 workspace projects
✓ Lockfile passes supply-chain policies (verified 1d ago)
Lockfile is up to date, resolution step is skipped
Progress: resolved 1, reused 0, downloaded 0, added 0
Packages: +171
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 171, reused 171, downloaded 0, added 170
Progress: resolved 171, reused 171, downloaded 0, added 171, done

devDependencies:
+ @axe-core/playwright 4.12.1
+ @eslint/js 10.0.1
+ @playwright/test 1.61.1
+ @types/node 26.1.1
+ eslint 10.7.0
+ prettier 3.9.5
+ tsx 4.23.0
+ turbo 2.10.4
+ typescript 5.9.3
+ typescript-eslint 8.63.0
+ vitest 4.1.10

Done in 2s using pnpm v11.7.0
H5_EXIT_CODE=0
```

#### 2. `pnpm format`

```text
$ prettier --check .
Checking formatting...
All matched files use Prettier code style!
H5_EXIT_CODE=0
```

#### 3. `pnpm lint`

```text
$ eslint . --max-warnings 0
H5_EXIT_CODE=0
```

#### 4. `pnpm typecheck`

```text
$ turbo run typecheck
• turbo 2.10.4

   • Packages in scope: @llm-bench/acquisition, @llm-bench/bench, @llm-bench/benchmark-data
   • Running typecheck in 3 packages
   • Remote caching disabled

@llm-bench/benchmark-data:typecheck: cache miss, executing 7b6b739193e0fc6c
@llm-bench/benchmark-data:build: cache miss, executing 76b8be92bf68db7b
@llm-bench/benchmark-data:typecheck: $ tsc -p tsconfig.json
@llm-bench/benchmark-data:build: $ tsc -p tsconfig.build.json
@llm-bench/bench:typecheck: cache miss, executing 47b2e45dd1a21dc4
@llm-bench/acquisition:typecheck: cache miss, executing 78d6bfe4bc6ac968
@llm-bench/bench:typecheck: $ pnpm --filter @llm-bench/benchmark-data build && tsc --noEmit
@llm-bench/acquisition:typecheck: $ tsc -p tsconfig.json
@llm-bench/bench:typecheck: $ tsc -p tsconfig.build.json

 Tasks:    4 successful, 4 total
Cached:    0 cached, 4 total
  Time:    3.619s

H5_EXIT_CODE=0
```

#### 5. `pnpm test`

乾淨 clone 從未含 `artifacts-v2/`，仍為 182/182 通過：

```text
$ turbo run test
• turbo 2.10.4

   • Packages in scope: @llm-bench/acquisition, @llm-bench/bench, @llm-bench/benchmark-data
   • Running test in 3 packages
   • Remote caching disabled

@llm-bench/benchmark-data:test:  Test Files  5 passed (5)
@llm-bench/benchmark-data:test:       Tests  65 passed (65)
@llm-bench/benchmark-data:test:    Duration  825ms (transform 179ms, setup 0ms, import 1.08s, tests 731ms, environment 0ms)

@llm-bench/bench:test:  Test Files  5 passed (5)
@llm-bench/bench:test:       Tests  63 passed (63)
@llm-bench/bench:test:    Duration  840ms (transform 531ms, setup 0ms, import 1.55s, tests 280ms, environment 0ms)

@llm-bench/acquisition:test:  Test Files  11 passed (11)
@llm-bench/acquisition:test:       Tests  54 passed (54)
@llm-bench/acquisition:test:    Duration  1.76s (transform 780ms, setup 0ms, import 2.73s, tests 1.36s, environment 1ms)

 Tasks:    3 successful, 3 total
Cached:    0 cached, 3 total
  Time:    2.343s

H5_EXIT_CODE=0
```

#### 6. `pnpm --filter @llm-bench/bench build`

```text
$ pnpm --filter @llm-bench/benchmark-data build && next build
$ tsc -p tsconfig.build.json
▲ Next.js 16.3.0 (Turbopack)
✓ Running next.config.ts took 24ms

  Creating an optimized production build ...
✓ Compiled successfully in 1379ms
  Running TypeScript ...
  Finished TypeScript in 1314ms ...
  Collecting page data using 4 workers ...
  Generating static pages using 4 workers (0/3) ...
✓ Generating static pages using 4 workers (3/3) in 440ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content

H5_EXIT_CODE=0
```

#### 7. `pnpm e2e`

```text
$ playwright test
[WebServer] $ next start "--port" "3910"
[WebServer] ⚠ "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.

Running 10 tests using 8 workers

  -   5 [desktop-chromium] › apps\bench\e2e\dashboard.spec.ts:45:5 › switching effort updates the selected model scores
  ok  2 [desktop-chromium] › apps\bench\e2e\dashboard.spec.ts:111:5 › keeps leaderboard sort, search, and effort controls keyboard reachable (614ms)
  -   7 [mobile-chromium] › apps\bench\e2e\dashboard.spec.ts:45:5 › switching effort updates the selected model scores
  ok  6 [desktop-chromium] › apps\bench\e2e\dashboard.spec.ts:67:5 › toggles the advanced source-local cost curves by keyboard (596ms)
  ok  8 [mobile-chromium] › apps\bench\e2e\dashboard.spec.ts:67:5 › toggles the advanced source-local cost curves by keyboard (761ms)
  ok  9 [mobile-chromium] › apps\bench\e2e\dashboard.spec.ts:111:5 › keeps leaderboard sort, search, and effort controls keyboard reachable (438ms)
  ok  3 [desktop-chromium] › apps\bench\e2e\dashboard.spec.ts:88:5 › has no serious accessibility violations or page-level mobile overflow (1.8s)
  ok  1 [desktop-chromium] › apps\bench\e2e\dashboard.spec.ts:4:5 › defaults to complete matrix models and exposes excluded cells explicitly (2.0s)
  ok  4 [mobile-chromium] › apps\bench\e2e\dashboard.spec.ts:4:5 › defaults to complete matrix models and exposes excluded cells explicitly (2.2s)
  ok 10 [mobile-chromium] › apps\bench\e2e\dashboard.spec.ts:88:5 › has no serious accessibility violations or page-level mobile overflow (1.3s)

  2 skipped
  8 passed (4.0s)
H5_EXIT_CODE=0
```

完成後 clone 仍是乾淨的 `main`，`git diff --check` exit 0。

### 3.2 主工作目錄暫時移開 `artifacts-v2/`

依驗收指示，在主工作目錄以同磁碟 rename 暫時改名，`try/finally` 保證還原。改名前後皆為 597 檔、1,659,324,830 bytes：

```text
H5_ARTIFACT_SOURCE=N:\Coding\LLM Bench Project\LLM Bench Codex\artifacts-v2
H5_ARTIFACT_HIDDEN=N:\Coding\LLM Bench Project\LLM Bench Codex\artifacts-v2.h5-hidden-20260821
H5_BEFORE_FILES=597
H5_BEFORE_BYTES=1659324830
H5_RENAMED_SOURCE_EXISTS=False
H5_RENAMED_HIDDEN_EXISTS=True

@llm-bench/acquisition:test:  Test Files  11 passed (11)
@llm-bench/acquisition:test:       Tests  54 passed (54)
@llm-bench/bench:test:  Test Files  5 passed (5)
@llm-bench/bench:test:       Tests  63 passed (63)
@llm-bench/benchmark-data:test:  Test Files  5 passed (5)
@llm-bench/benchmark-data:test:       Tests  65 passed (65)
 Tasks:    3 successful, 3 total
Cached:    0 cached, 3 total
  Time:    1.429s

H5_TEST_EXIT_CODE=0
H5_RESTORED_SOURCE_EXISTS=True
H5_RESTORED_HIDDEN_EXISTS=False
H5_AFTER_FILES=597
H5_AFTER_BYTES=1659324830
```

## 4. Git、倉庫與外部狀態

### 4.1 Git

驗收開始時的實際輸出：

```text
## main...origin/main [ahead 72]
N:/Coding/LLM Bench Project/LLM Bench Codex eb46d64 [main]
DIFF_CHECK_EXIT=0
```

- `git stash list` 無輸出；local/remote branch 只有 `main`／`origin/main`。
- `git worktree list` 只剩主 worktree；舊 `llm-bench-frontend` 未註冊且路徑不存在。
- `git diff -- data-v2/sources data-v2/product/current.json` 無輸出。
- `HEAD:data-v2/product/current.json` 與 `dfbca29:data-v2/product/current.json` 的 blob 都是 `939c9916c8608d092253f41fa2be861962e25090`，驗收沒有重建或改動已發布版本。

`current.json` 歷史恰有四次：`a416249`、`8283ee4`、`b60e75d`、`dfbca29`。最後一次 commit body 明載：

```text
Published on the user's explicit 2026-08-21 approval, per
SPEC.md section 11.2.
```

沒有發現未經使用者指示的 `current.json` commit。

### 4.2 GitHub read-only audit

```text
origin/main = 9ab96b26ae75f97fe3a27980a5c7ec56bcfb4860
releases=0
tags=0
deployments=0
environments=0
```

最近五次 workflow run 都是舊遠端 SHA `9ab96b26…` 上的既有 `Weekly benchmark dry run` schedule。H5 沒有 push、deploy、release 或其他外部寫入。

## 5. G4 七項阻擋逐項判定

|   # | G4 阻擋項                                | H5 判定                            | 獨立證據                                                                                                                                                                                                                                              |
| --: | ---------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | `current.json` 未提交                    | **已解除**                         | `dfbca29` 只提交 `data-v2/product/current.json:1`，commit body 記錄使用者明確核准；HEAD 與該 commit blob 相同。實測版本 `sha256:bec073cf27357689035bfebaa7c5dcf61adb9b068b81ea3195570958f3e56385`，232 costs、0 `model-catalog`、0 空 `evidenceIds`。 |
|   2 | `CLAUDE.md` e2e 在 build 前              | **已解除**                         | `CLAUDE.md:37-43` 為 install → format → lint → typecheck → test → build → e2e；`CLAUDE.md:45-46` 說明 e2e 需要 `.next`。本次照此順序 8 passed / 2 skipped。                                                                                           |
|   3 | 每來源票值誤寫為該來源眾數               | **已解除**                         | 規格 `docs/SPEC.md:117-123`、程式 `packages/benchmark-data/src/index.ts:517-560`、`docs/DATA_METHODOLOGY.md:78-84`、`docs/BENCHMARK_SCORE_SOURCES.md:14-16` 均為「單一來源先取最高具名檔位，一來源一票；跨來源取眾數，平手取高」。                    |
|   4 | `ProductCostSchema.evidenceIds` 可為空   | **已解除**                         | `packages/benchmark-data/src/index.ts:722-738` 使用 `.min(1)`；`packages/benchmark-data/src/schema.test.ts:242-283` 同時覆蓋 null performance 正例與空 evidenceIds 負例；動態 `safeParse` 空陣列失敗。                                                |
|   5 | 過期 task 無標記；來源文件自稱匯入白名單 | **已解除**                         | `docs/history/STAGE5_PLAN.md:3-7`、`docs/history/STAGE5_TODO.md:3-7` 明標 Historical／Superseded；`docs/BENCHMARK_SCORE_SOURCES.md:8-10` 明定是時效登錄、不是匯入授權，真正四來源白名單在 `data-v2/mappings/sources.json:1`。                         |
|   6 | 刷新報告 34；計畫 8 providers            | **已解除**                         | `docs/refresh/2026-08-21.md:48-68` 列 14 models／42 total series／25 series with ≥2 points；`tasks/claude-code-plan.md:593-599` 為 12 列、7 家與實際分布。H5 builder 重算完全一致。                                                                   |
|   7 | fixture 原樣複製而非精簡                 | **有明確裁決紀錄，文字與實作一致** | `tasks/claude-code-plan.md:856-869` 記錄使用者裁決維持逐位元組副本；`packages/acquisition/test-fixtures/README.md:3-16` 同義。7 個 tracked fixture 共 2,525,203 bytes，檔名 SHA-256 與內容及本機原 artifact 7/7 相同。                                |

## 6. H1–H4 與程式／資料一致性

### 6.1 檔位推測

`higherEffortEvidence` 的實際兩層運算是：

1. `packages/benchmark-data/src/index.ts:500-524` 排除 `non-reasoning`，只接受 `low`／`medium`／`high`／`xhigh`／`max` 的直接或名稱可判定 evidence。
2. `:528-543` 在每個來源內保留該來源對模型發布過的最高具名檔位；同檔時 candidate ID 只負責 deterministic basis row。
3. `:545-551` 每來源一票，跨來源取票數眾數，平手以 effort rank 取較高檔。
4. `:553-560` 從勝出檔位選 deterministic basis row；`:586-593` 排除目標來源本身；無票時 `:605-610` 得到 `default`。

此行為與 `docs/SPEC.md:117-136`、`docs/DATA_METHODOLOGY.md:78-84`、`docs/BENCHMARK_SCORE_SOURCES.md:14-16` 一致。

以四個 whitelist 來源的 1,544 candidates 重算：202 筆 canonical model 未標 effort 列中，74 筆 `CROSS_SOURCE`、128 筆 `DEFAULT`；Grok 4.6 對 LiveBench 的票為 AA=`high`、DeepSWE=`xhigh`、Frontier Code=`high`，彙總為 `high`，符合規格示例。

### 6.2 Schema 不變式

動態結果：

```json
{
  "currentVersionId": "sha256:bec073cf27357689035bfebaa7c5dcf61adb9b068b81ea3195570958f3e56385",
  "currentSchemaParse": true,
  "emptyEvidenceRejected": true,
  "costs": 232,
  "emptyEvidenceCosts": 0,
  "modelCatalogCosts": 0
}
```

因此已發布 `current.json` 在新 schema 下通過，且 schema 本身會拒絕空 `evidenceIds`。

### 6.3 圖表與 provider 自行重算

H5 直接匯入 `apps/bench/lib/view-model.ts:574-677` 的 `buildWeightedCostCurve` 與 `:722-825` 的 `buildAdvancedCostSeries`。預設圖先完全重現 `apps/bench/components/dashboard.tsx:42-88` 的 `visibleProduct` 投影；進階圖使用完整 product。舊基準直接以 `git show b60e75d:data-v2/product/current.json` 讀入記憶體。

```json
{
  "current": {
    "mainRows": 12,
    "providers": [
      "anthropic",
      "deepseek",
      "google",
      "moonshot",
      "openai",
      "xai",
      "zai"
    ],
    "providerCount": 7,
    "defaultPoints": 12,
    "advancedModels": 14,
    "advancedSeries": 42,
    "advancedSeriesAtLeast2": 25,
    "advancedPoints": 125,
    "costs": 232
  },
  "b60e75d": {
    "mainRows": 12,
    "providerCount": 7,
    "defaultPoints": 12,
    "advancedModels": 14,
    "advancedSeries": 42,
    "advancedSeriesAtLeast2": 25,
    "advancedPoints": 125,
    "costs": 253
  }
}
```

文件宣稱的 12 主畫面列、12 預設點、14 模型、42 條進階 series、25 條 ≥2 點、232 成本列與 7 providers 全部重現；變更前只有成本列為 253，其餘相同。

## 7. 保留與移除完整性

### 7.1 保留功能

| 功能                            | 程式／unit 證據                                                                                                                                                                | browser／build 證據                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 排行榜、排序、搜尋、effort 選擇 | `apps/bench/components/leaderboard.tsx:27-130`、`leaderboard-table.tsx:142-158`；`view-model.test.ts:69-210`、`table-sort.test.ts:15-58`、`dashboard.test.tsx:291-298,332-357` | `apps/bench/e2e/dashboard.spec.ts:4-14,111-143`；production build 通過 |
| 八維雷達圖                      | `apps/bench/components/radar-chart.tsx:22`；`dashboard.test.tsx:251-271,306-330`、`view-model.test.ts:926-948`                                                                 | `dashboard.spec.ts:31-42,88-108`；desktop/mobile 通過                  |
| 共用模型明細面板與 provenance   | `apps/bench/components/model-detail-panel.tsx:107-290`；`model-detail-panel.test.tsx:50-118`                                                                                   | Developer mode browser path `dashboard.spec.ts:16-42`；build 通過      |
| 預設與進階成本圖                | `apps/bench/components/cost-chart.tsx:493-562`；`view-model.test.ts:518-921`、`dashboard.test.tsx:77-203`                                                                      | 進階鍵盤 toggle `dashboard.spec.ts:67-85`；兩張圖均在 build 產物通過   |
| Developer mode                  | `apps/bench/lib/view-model.ts:229-296`；`view-model.test.ts:262-274,433-461`                                                                                                   | `dashboard.spec.ts:16-42` 實際切換、點列、顯示雷達並跑 axe             |

### 7.2 移除完整性

- 磁碟與 Git 的 `apps/` 只有 `bench`；`packages/` 只有 `acquisition`、`benchmark-data`。
- `apps/web`、`apps/video`、`apps/worker`、`packages/db`、舊輔助 packages、product pointers 與 `evidence-detail.tsx` 都不存在。
- manifests 與 lockfile 無 PostgreSQL client、Drizzle、Remotion；`@vitest/browser-preview` 是 Vitest optional peer，不是 PREVIEW channel。
- root scripts 與 `.github/workflows/ci.yml:1-64` 無 DB／Docker／migration／seed／Edition／video／舊 Worker／publish／rollback／channel 流程。
- `data-v2/product/current.json:1` 遞迴搜尋 `status`、Coverage 欄位、`compositeSources`、Edition、revision、publication、channel、pointer 全為 0。
- `schema.test.ts:231-239` 的 `ESTIMATED` 是刻意證明 schema 拒絕舊欄位；runtime `coverage` 只剩規格 §5.3 明確保留的 coverage-matrix 報告。
- app route tree只有 `page.tsx`、`layout.tsx` 與 CSS；`apps/bench/app/page.tsx:4` 強制 static，production build 只產生 `/` 與框架 `/_not-found`。
- 雙語、雙主題、多頁、Edition、PREVIEW／FORMAL 在現行文件的命中都是禁止／已移除敘述；`docs/history/STAGE5_PLAN.md`、`docs/history/STAGE5_TODO.md` 舊正文已有檔首 Superseded 裁決。

## 8. 非阻擋觀察

1. `pnpm e2e` 仍警告 `next start` 不支援 `output: standalone`。browser suite 實際為 8 passed；目前不是功能失敗，但日後可改用 `.next/standalone/server.js` 消除警告。
2. effort 切換 e2e 在 desktop/mobile 各 skipped 一次，因目前主畫面沒有 Claude Fable 5 alternative profile（`apps/bench/e2e/dashboard.spec.ts:45-53`）。元件與 unit coverage 存在，鍵盤可達性測試在 selector 存在時檢查；這是現有資料條件造成的 browser coverage 缺口，不是 runtime 錯誤。
3. `product.frontier` 53/53 列仍使用 `<modelId>-unspecified` placeholder，0/53 可解析到 `product.profiles`。`getDeveloperModelRows` 已排除這些無效 profile，規格仍未定義 frontier placeholder 的長期結構；延續前兩次驗收的非阻擋觀察。
4. `docs/REFACTOR_DISCARD_LIST.md:35` 的 Stage 5 正文仍寫「Draft 流程」，但同檔 `:3-12,53` 已明確總括裁決 DRAFT／PUBLISHED pointer 與 versions 被 V2 取代。依 H3 對 Superseded 歷史正文的相同原則，不視為現行支援承諾；措辭仍可在未來清理。
5. 本機 ignored `artifacts/`（13 檔／4,163,024 bytes）與 `output/`（28 檔／10,708,878 bytes）保留 2026-07 的舊影片輸出；tracked 程式、scripts、CI 無引用。它們是未知使用者歷史輸出，不是受支援 runtime，H5 依邊界未刪除或修改。`data-v2/product/versions/` 亦只剩 0 檔空目錄。
6. `docs/refresh/2026-08-21.md:65-66` 以「曲線數」簡稱應為「≥2 點的曲線數」，但緊鄰表格 `:48-60` 已清楚區分 42 total series 與 25 multi-point series，實測數字正確。

## 9. 仍需使用者人工處理

以下依指示列入，不算阻擋：

1. **首次部署**：`origin/main` 仍停在 `9ab96b26…`，本地 `main` ahead 72；H5 沒有 push 或 deploy。
2. **Artificial Analysis 金鑰輪換**：撤銷曾出現在對話中的舊 key，建立新 key，只更新 gitignored `.env.local`。
3. **兩個非 worktree 目錄**：
   - `N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-materializers-20260718`
   - `N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-model-column-20260718`

   兩者實測存在且都沒有 `.git`，未被 `git worktree list` 註冊；是否保存或刪除由使用者決定。

舊 `llm-bench-frontend` worktree 已移除；封存檔 `N:/Coding/LLM Bench Project/llm-bench-frontend-worktree-apps-bench-2026-08-21.zip` 存在，19,486 bytes。`CLAUDE.md:22` 的警告依指示視為刻意保留，不是殘留缺陷。

## 10. 任務回報

### summary

H5 已按 F2 第三次完整重跑，結論通過。七步乾淨基準、無 `artifacts-v2/` tests、Git／GitHub、G4 七項、H1–H4 builder/schema 與保留／移除完整性均已獨立驗證。

### changed_files

- `docs/history/F2_ACCEPTANCE.md`

### validation

- 乾淨 clone：install、format、lint、typecheck、182 unit tests、production build、8 browser tests 全綠（2 個資料條件 skip）。
- 主工作目錄暫時移開 `artifacts-v2/`：182/182 tests 全綠，597 檔／1,659,324,830 bytes 完整還原。
- 已發布 ProductVersion：schema 通過、232 costs、0 空 `evidenceIds`、0 `model-catalog`；空 evidence 動態負測試失敗如預期。
- builder：12 主畫面列、12 預設點、14 進階模型、42 series、25 multi-point series、125 points、7 providers；`b60e75d` 除成本 253 外相同。
- `git diff --check`、branch/worktree/stash、current history/blob、package graph、legacy negative search與 GitHub releases/tags/deployments/environments audit 完成。

### risks

- `git status` 不顯示 ignored 歷史輸出、空目錄或 `.env`；本報告已另列實際發現，不把 status clean 當磁碟全空證據。
- browser effort-switch test 目前因產品資料沒有指定 alternative profile 而 skip；未來資料變化或專用 browser fixture 才能讓此路徑固定執行。
- 首次部署尚未發生，故本次只能驗證可部署的靜態 build，不能驗證實際 hosting 行為。

### unresolved

- 只剩第 9 節列出的使用者人工事項，以及第 8 節的非阻擋觀察；沒有 H5 驗收阻擋。
