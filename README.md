# LLM Bench

LLM Bench 是一個以可追溯靜態資料為核心的前沿模型 Dashboard。產品使用單一目前的 `ProductVersion` 提供三個主要視圖：

- Leaderboard：完整顯示清單模型的綜合分數與八維能力。
- Quality vs. Cost：跨來源正規化成本與效能曲線。
- Eight Dimensions：八維雷達圖、Category score 與分數證據。

## 支援中的架構

```text
apps/bench/                  Next.js 單頁 Dashboard
packages/benchmark-data/     Schema、身份、Profile、計分與產品資料 CLI
packages/acquisition/        來源快照、成本物化、artifact 與完整性驗證
data-v2/mappings/            Benchmark、模型、Frontier 與 Profile 設定
data-v2/sources/             manifest、evidence、candidate、cost 與驗證報告
data-v2/product/current.json 單一目前 ProductVersion
artifacts-v2/                Git 外、內容定址的原始來源 bytes
```

專案不使用 Docker、PostgreSQL、Drizzle、背景 Worker 或執行期資料庫。舊 Web、LiveBench 專用 publication、Edition、影片、雙語／雙主題／多頁介面及 PREVIEW／FORMAL 契約均已移除或標記為 Superseded，不是相容介面。

## 環境

- Node.js 24+
- pnpm 11+

```bash
pnpm install --frozen-lockfile
```

不需要 Docker Desktop、資料庫或來源網站連線即可測試、建置及顯示已存在的 ProductVersion。

## 資料刷新與目前版本

刷新支援來源的結構化快照與成本：

```bash
pnpm --filter @llm-bench/acquisition materialize:artificial-analysis -- --visual-profile-count=<count>
pnpm --filter @llm-bench/acquisition materialize:livebench -- --visual-profile-count=<count>
pnpm --filter @llm-bench/acquisition materialize:deepswe -- --visual-model-count=<count>
pnpm --filter @llm-bench/acquisition materialize:frontier-code -- --visual-row-count <count> --visual-top-ten-matched
pnpm --filter @llm-bench/acquisition materialize:effort-reports
```

四個刷新命令都要求先核對渲染後頁面的可見母體數。Artificial Analysis 擷取會讀取 gitignored 的 `.env.local` 中的
`ARTIFICIAL_ANALYSIS_API_KEY` 做交叉驗證；頁面 RSC 管道在金鑰失效時仍可單獨完成。
Frontier Code 刷新前需以渲染後 DOM 核對列數與 Top 10，再把實測列數傳入命令；
腳本會將官方靜態 JSON 的完整 Main 設定與頁面 JSON-LD Top 10 交叉驗證。
四站完成後執行 `materialize:effort-reports`，以同一 policy 產生不改寫來源
`profile.effort` 的跨來源推測表；表格保持 `PENDING USER REVIEW`。

驗證來源後，建立單一 `data-v2/product/current.json`：

```bash
pnpm data:v2:build-current
```

這個檔案包含由內容 SHA-256 計算的 `versionId`，Dashboard 建置固定讀取它；頁尾會顯示完整 ID。刷新與建立目前版本不會自動代表發布，必須由使用者審核變更後再提交資料 commit。

使用目前資料開發或建置：

```bash
pnpm --filter @llm-bench/bench dev
pnpm --filter @llm-bench/bench build
```

若要回復已部署資料，請 `git revert` 對應的資料 commit，然後重新部署；不要以指令改寫版本狀態。

## Dashboard 顯示規則

- 主畫面只顯示在 `data-v2/mappings/display-set.json` 每個 benchmark 都有
  INCLUDED、非 null normalized score，且八個維度都可渲染的代表 Profile。
- 右上角無文字 switch 是 Developer mode；開啟後顯示被完整矩陣門檻排除的模型及其缺少的 benchmark 格子。
- Developer mode 不計算或顯示被排除模型的 Overall／維度聚合值。
- Representative Profile 取該模型測得 Overall Score 最高者，分數相同時以 `profileId` 字典序決勝；主畫面只保留通過顯示清單的 Profile，避免切換 effort 重新引入缺格資料。
- Profile selector 只區分 reasoning effort；Harness、tools、attempt、thinking 與 context 設定不建立 Product Profile。
- Product effort 階梯為 `non-reasoning < low < medium < high < xhigh < max`；無其他來源依據的未標列使用階梯外的 `default`，不得當成 `max`。

## 驗證

```bash
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @llm-bench/bench build
pnpm e2e  # 必須排在 build 之後：webServer 服務靜態匯出產物 apps/bench/out
```

## 權威文件

- [文件索引與閱讀順序](docs/README.md)
- [第二次重構規格（現行唯一權威）](docs/REFACTOR_SPEC_V2.md)
- [第二次重構任務計畫](tasks/claude-code-plan.md)
- [專案現況與歷史交接](docs/PROJECT_HANDOFF.md)
- [架構](docs/ARCHITECTURE.md)
- [資料方法](docs/DATA_METHODOLOGY.md)
- [計分方法](docs/SCORING_METHODOLOGY.md)
- [操作與資料流程](docs/OPERATIONS.md)
- [已捨棄項目](docs/REFACTOR_DISCARD_LIST.md)
- [第一次重構規格（歷史考證）](docs/REFACTOR_SPEC.md)
- [Benchmark 八維映射](docs/BENCHMARK_DIMENSION_MAPPING.md)
- [可採用成績來源](docs/BENCHMARK_SCORE_SOURCES.md)

外部評測結果仍屬其發布者。專案保存 URL、取得方法、原始值、標準化值、來源 Profile 與 evidence；不繞過登入、付費牆、CAPTCHA 或存取控制。
