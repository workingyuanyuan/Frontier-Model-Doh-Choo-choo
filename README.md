# LLM Bench

LLM Bench 是一個以可追溯靜態資料為核心的前沿模型 Dashboard。產品使用同一份不可變 `ProductVersion` 提供三個主要視圖：

- Leaderboard：綜合分數、八維能力與 Coverage。
- Quality vs. Cost：跨來源正規化成本與效能曲線。
- Eight Dimensions：八維雷達圖、Category score 與分數證據。

## 支援中的架構

```text
apps/bench/                  Next.js 單頁 Dashboard
packages/benchmark-data/     Schema、身份、Profile、計分、版本與 pointer CLI
packages/acquisition/        來源快照、成本物化、artifact 與完整性驗證
data-v2/mappings/            Benchmark、模型、Frontier 與 Profile 設定
data-v2/sources/             manifest、evidence、candidate、cost 與驗證報告
data-v2/product/             不可變 ProductVersion 與 Draft/Published pointer
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

## 資料刷新與 Draft

刷新支援來源的結構化快照與成本：

```bash
pnpm --filter @llm-bench/acquisition materialize:snapshots
pnpm --filter @llm-bench/acquisition materialize:costs
```

刷新不會直接改變網站版本。驗證來源後，另行建立不可變 Draft：

```bash
pnpm data:v2:build-draft
```

預覽 Draft：

```powershell
$env:LLM_BENCH_CHANNEL = "DRAFT"
pnpm --filter @llm-bench/bench dev
```

Draft 有明顯狀態標示並設為 `noindex`。Agent 必須先審核來源、身份、映射、計分、UI 與版本 hash；只有公開證據無法裁決的問題才交給人工。

## Published 與回退

Published 永遠需要人工明確操作，Agent 不得因資料或程式測試通過而自行發布：

```bash
pnpm data:v2:publish
pnpm data:v2:rollback
```

`publish` 只把 Published pointer 原子切至已存在且已驗證的 Draft，不重新擷取或計分。`rollback` 只切回 pointer 記錄的前一個不可變版本。

Published 建置必須明確指定通道：

```powershell
$env:LLM_BENCH_CHANNEL = "PUBLISHED"
pnpm --filter @llm-bench/bench build
```

## Dashboard 顯示規則

- 預設只顯示 Representative Profile 具有完整八維分數（8/8）的模型。
- 右上角無文字 switch 是 Developer mode；開啟後才顯示已有分數但 Coverage 未達 8/8 的模型。
- 沒有任何可計分結果的模型不因 Developer mode 而成為排名列。
- Representative Profile 先比 Coverage，再比有效 Benchmark Results 數、Overall Score，最後以 `profileId` 字典序決勝。
- Profile selector 只區分 reasoning effort；Harness、tools、attempt、thinking 與 context 設定不建立 Product Profile。

## 驗證

```bash
pnpm --filter @llm-bench/benchmark-data test:run
pnpm --filter @llm-bench/benchmark-data typecheck
pnpm --filter @llm-bench/acquisition test:run
pnpm --filter @llm-bench/acquisition typecheck
pnpm --filter @llm-bench/bench test:run
pnpm --filter @llm-bench/bench typecheck
pnpm --filter @llm-bench/bench build
```

## 權威文件

- [文件索引與閱讀順序](docs/README.md)
- [專案現況與 Claude Code 交接](docs/PROJECT_HANDOFF.md)
- [Claude Code 下一階段任務](tasks/claude-code-plan.md)
- [架構](docs/ARCHITECTURE.md)
- [資料方法](docs/DATA_METHODOLOGY.md)
- [計分方法](docs/SCORING_METHODOLOGY.md)
- [操作與發布](docs/OPERATIONS.md)
- [重構規格](docs/REFACTOR_SPEC.md)
- [已捨棄項目](docs/REFACTOR_DISCARD_LIST.md)
- [Benchmark 八維映射](docs/BENCHMARK_DIMENSION_MAPPING.md)
- [可採用成績來源](docs/BENCHMARK_SCORE_SOURCES.md)

外部評測結果仍屬其發布者。專案保存 URL、取得方法、原始值、標準化值、來源 Profile 與 evidence；不繞過登入、付費牆、CAPTCHA 或存取控制。
