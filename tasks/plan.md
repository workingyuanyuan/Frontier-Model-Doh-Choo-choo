# LLM Bench 重構執行計畫

## 目標狀態

支援中的 repository 只包含：

- `apps/bench`
- `packages/benchmark-data`
- `packages/acquisition`
- `data-v2`
- Git 外 `artifacts-v2`

資料經來源物化、可追溯 Candidate、不可變 Draft 與人工 Published pointer 進入同一套靜態 Dashboard。Docker、PostgreSQL、Drizzle、舊 Worker、Edition、影片及舊 Web 均不屬目標狀態。

## Stage 1 — 契約與映射（完成）

- [x] 建立八維 Benchmark 映射與理由文件。
- [x] 建立 SourceManifest、EvidenceRecord、CandidateResult、CostRecord、ModelProfile、ProductVersion 與 pointer schema。
- [x] 建立 `data-v2`／`artifacts-v2` 保存邊界。
- [x] 建立來源角色、完整性、Included／Excluded 與欄位級 provenance。

## Stage 2 — 資料實證與 Dashboard（完成）

- [x] 建立通用 acquisition/materializer 與八站來源工作區。
- [x] 建立 `apps/bench` 單頁英文淺色 Dashboard。
- [x] 完成 Leaderboard、Quality vs. Cost、Eight Dimensions 與 Evidence。
- [x] 完成響應式、鍵盤與無障礙基線。

## Stage 3 — 真實 Draft（完成）

- [x] 建立 canonical model identity、effort-only Profile 與 exact alias 規則。
- [x] 建立動態綜合榜 Top-20 聯集與人工新品設定。
- [x] 完成缺值安全八維計分、Estimated、Coverage 與成本資料。
- [x] 生成不可變 ProductVersion 並由 Draft pointer 選取。

## Stage 4 — 實證修正與人工發布閘門（持續）

- [x] Agent 先審查 pointer、artifact、來源、identity、mapping、計分和 UI。
- [x] 修正 Profile selector、Representative Profile、排序、N/A 與成本曲線。
- [x] 預設只顯示 8/8；Developer mode 顯示 partial scored models。
- [x] 刷新 Artificial Analysis、LiveBench、Epoch 與 DeepSWE，重新生成 Draft。
- [ ] 人工核准某一個明確 Draft version ID。
- [ ] 人工執行首次 Published switch。
- [ ] 人工驗證 Published B 與 rollback A。

Stage 4 未完成的人工 pointer 操作不授權 Agent 自行 Published。

## Stage 5 — 靜態架構 cutover（完成）

### 5.1 Package graph

- [x] 從 workspace、root scripts 與 lockfile 移除舊 app/package。
- [x] 證明 `apps/bench` 只依賴 `packages/benchmark-data`。
- [x] 證明 acquisition 與 benchmark-data 不 import legacy modules。

### 5.2 應用與資料庫移除

- [x] 移除 `apps/web`、`apps/worker`、`apps/video`。
- [x] 移除 `packages/db`、Drizzle、migration、seed、PostgreSQL 與 Compose。
- [x] 移除 LiveBench 專用 alias/revision/aggregation/promotion/publication/weekly。

### 5.3 舊契約與共用 package

- [x] 移除 Edition、PREVIEW／FORMAL、video 與舊 scoring/presentation contract。
- [x] 移除未被新架構實際使用的 connectors/contracts/scoring/presentation/radar package。
- [x] 純函式只有移入新 ownership 且有獨立測試才可保留。

### 5.4 CI、E2E 與文件

- [x] CI 不使用 DB service、Docker、舊 Web fixture、Worker 或影片 render。
- [x] Browser gate 改驗證 `apps/bench` 的靜態 ProductVersion。
- [x] 重寫 README、Architecture、Data Methodology、Scoring Methodology、Operations。
- [x] 建立權威 Superseded／discard 邊界。

### 5.5 最終驗收

- [x] clean install、format、lint、typecheck、tests、production build 通過。
- [x] import、script、workspace、lockfile 與 repository 搜尋無 legacy runtime path。
- [x] 既有 ProductVersion 在無網路、artifact、PostgreSQL 或 Docker 時可建置顯示。
- [x] 確認 Stage 5 沒有建立或切換 Published pointer。

## 延後至真實資料迭代

- Supported 最終門檻。
- Benchmark／來源品質最終權重。
- 每來源排程最佳化。
- Representative Profile 的未來改版。
- 進階 conflict/confidence policy。
- 管理 UI。
