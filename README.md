# LLM Bench

LLM Bench 是以可追溯靜態資料為核心的前沿模型 Dashboard。產品提供三個主要視圖：

- Leaderboard：模型、綜合分數、覆蓋度與八維能力。
- Quality vs. Cost：品質與 API／實測任務成本曲線。
- Category Profile：Reasoning、Math、Knowledge、Language、Instruction、Coding、Agentic、Context 八維雷達圖。

## 目前狀態

新版資料工作區、八站實證快照、不可變 ProductVersion、Draft pointer 與 Dashboard 已建立。所有資料目前仍是人工審查中的 Draft；Published pointer 尚未建立，因此舊系統暫時保留作回退，不代表仍是目標架構。

新版永久不使用 Docker、PostgreSQL、Drizzle、Edition、PREVIEW／FORMAL 或 LiveBench 專用發布管線。

## 需求

- Node.js 24+
- pnpm 11+

不需要 Docker Desktop、資料庫或網路才能建置既有 Draft／Published 靜態版本。

## 新版工作區

```text
apps/bench/                  Next.js 單頁 Dashboard
packages/benchmark-data/     Schema、選模、計分、版本與發布工具
packages/acquisition/        artifact 與來源完整性驗證
data-v2/mappings/            八維、Frontier 與模型／價格設定
data-v2/sources/             八站 manifest、evidence、candidate 與驗證報告
data-v2/product/             不可變 ProductVersion 與 Draft/Published pointer
artifacts-v2/                Git 外內容定址原始證據
```

## 常用命令

```bash
pnpm install --frozen-lockfile
pnpm data:v2:build-draft
pnpm --filter @llm-bench/bench dev
```

Dashboard 預設讀取 Draft。要明確指定資料通道：

```powershell
$env:LLM_BENCH_CHANNEL = "DRAFT"
pnpm --filter @llm-bench/bench dev
```

人工核准後才可發布：

```bash
pnpm data:v2:publish
pnpm data:v2:rollback
```

`publish` 只把 Published pointer 切到已存在的 Draft 版本，不重新擷取或計分。`rollback` 只切回上一個不可變版本。

## 驗證

```bash
pnpm --filter @llm-bench/benchmark-data test:run
pnpm --filter @llm-bench/acquisition test:run
pnpm --filter @llm-bench/bench test:run
pnpm --filter @llm-bench/bench typecheck
pnpm --filter @llm-bench/bench build
```

完整 monorepo 的舊套件仍在移轉期內，首次 Published 與 rollback 經人工驗收前，不應把根層舊 DB／Worker 命令視為新版操作方式。

## 文件

- [重構規格](docs/REFACTOR_SPEC.md)
- [可捨棄項目](docs/REFACTOR_DISCARD_LIST.md)
- [新版架構](docs/ARCHITECTURE.md)
- [資料方法](docs/DATA_METHODOLOGY.md)
- [計分方法](docs/SCORING_METHODOLOGY.md)
- [操作與發布](docs/OPERATIONS.md)
- [Benchmark 八維映射](docs/BENCHMARK_DIMENSION_MAPPING.md)
- [可採用成績來源](docs/BENCHMARK_SCORE_SOURCES.md)

## 資料與歸屬

外部評測結果仍屬其發布者。專案保存出處、擷取方法、原始值、標準化值、Profile 與 evidence URL；不繞過登入、付費牆、CAPTCHA 或存取控制。
