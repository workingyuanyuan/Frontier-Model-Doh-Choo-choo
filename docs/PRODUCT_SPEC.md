# Product Spec

## Product

`LLM Bench Radar` 是每週更新的 LLM 能力排名平台。它把可追溯的外部評測結果轉成八維能力分數、排名網站與同一資料快照驅動的影片。

## Audience and jobs

- 一般觀眾：快速理解模型強弱、資料新鮮度與可信度。
- 研究者：由總分追溯至維度、Benchmark、測試配置、來源與原始快照。
- 維運者：擷取、審核、發布、回滾並重現任一週版本。

## Fixed capability axes

雷達圖固定依序使用 Reasoning、Math、Knowledge、Language、Instruction、Coding、Agentic、Context。次要維度只作說明，v1 不重複計分。

## Primary experiences

1. 首頁顯示最新 edition、Top-Tier 排名、八維雷達圖、coverage、confidence 與上週變動。
2. 模型頁顯示版本、effort、原始結果、證據、歷史排名與缺失資料。
3. Benchmark 頁顯示定義、版本、metric、方向、harness、風險與 leaderboard。
4. 比較頁支援 2–5 個模型並將模型、edition、locale 與 theme 保留在 URL。
5. 方法學、來源與狀態頁公開正規化、權重、限制與更新狀態。
6. CLI 提供 ingestion、review、scoring、publish、rollback 與 video render。

## Product rules

- 缺失值永遠不是零；不足 coverage 顯示 provisional 或 insufficient data。
- Vendor-reported、stale、low-coverage 與 unverified 資料必須顯著標示。
- 正式分數不得使用來源排名、動態競爭者 percentile 或未標記預測分數。
- BenchLM 只作資訊架構參考，不使用其資料、文字、原始碼或評分公式。
- 平台不自行執行昂貴的大模型 Benchmark。

## Visual and language decisions

- 網站與影片均採使用者指定的淺色灰白基調。
- 提供 Google-inspired 與 Apple-inspired 兩套 semantic token；切換不得改變資料或雷達幾何。
- 繁體中文與英文均為第一版範圍；路由使用 `/zh-TW`、`/en`，未知語系 fallback 為繁中。
- 不打包未授權 Logo；預設使用文字或安全 monogram fallback。

## Completion boundary

本機可由一條命令啟動 Web、PostgreSQL 與 Worker；至少一個真實外部來源能走完 raw → staged → published → scoring → ranking → Web radar → video preview。正式部署、付費服務與網域不在本機交付範圍。
