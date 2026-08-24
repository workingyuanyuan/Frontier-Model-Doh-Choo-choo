# LLM Bench

前沿大語言模型（Frontier LLMs）綜合能力與性價比評測看板。

本專案整合多個第三方評測來源，將模型表現拆解為八項核心能力維度，並結合實際呼叫成本，提供直觀的評測數據與分析視圖。

---

## 核心特色

- **八維能力拆解**
  將模型能力細分為推理（Reasoning）、數學（Math）、知識（Knowledge）、語言（Language）、指令遵循（Instruction）、程式碼（Coding）、智慧體（Agentic）、長上下文（Context）等八個領域。
- **成本與效能分佈**
  結合任務呼叫成本（USD / 任務或百萬 Token 價格）與綜合分數，直觀呈現各模型的性價比位置。
- **原始資料追溯**
  每項評測數據均記錄來源網址、採集時間與原始快照內容雜湊，確保資料來源可供查核。
- **推理強度分級**
  針對支援思考推理的模型，依據不同的推理強度（`non-reasoning < low < medium < high < xhigh < max`）個別記錄與評分，避免混淆不同運算設定下的表現。
- **開發者檢視模式**
  提供切換選項，可查看尚未通過完整評測項目門檻的模型，以及其缺少的測試項目清單。

---

## 看板功能導覽

| 視圖                                    | 功能說明                                                                                         |
| :-------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **綜合天梯榜 (Leaderboard)**            | 條列各模型的綜合評分、各項維度得分、推理強度與發布日期。支援模型選取、排序與側邊欄詳細資料抽屜。 |
| **成本與效能分佈圖 (Quality vs. Cost)** | 互動式散佈圖，支援對數座標切換與不同基準任務切換，方便觀察效能與成本的對應關係。                 |
| **八維能力雷達圖 (Eight Dimensions)**   | 支援同時選取多個模型進行能力雷達圖疊加對比，快速了解各模型的強項與短板。                         |
| **開發者檢視模式 (Developer Mode)**     | 開啟後可查看因測試項目未齊全而未列入主榜的模型，以及其缺少的評測項目。                           |

---

## 能力維度與評測來源

本專案整合來自多個公開評測的數據（如 [Artificial Analysis](https://artificialanalysis.ai/)、[LiveBench](https://livebench.ai/)、[DeepSWE](https://deepswe.datacurve.ai/)、[Frontier Code](https://cognition.com/frontiercode) 等），並依據測試性質歸納至單一主要能力維度：

```text
┌───────────────────────────────────────────────────────────┐
│                    八大能力維度 (Dimensions)                │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ 推理        │ 數學        │ 知識        │ 語言            │
│ (Reasoning) │ (Math)      │ (Knowledge) │ (Language)      │
├─────────────┼─────────────┼─────────────┼─────────────────┤
│ 指令遵循    │ 程式碼      │ 智慧體      │ 長上下文        │
│(Instruction)│ (Coding)    │ (Agentic)   │ (Context)       │
└─────────────┴─────────────┴─────────────┴─────────────────┘
```

詳細的評分計算方式與維度映射規則，請參閱 [計分方法說明](docs/SCORING_METHODOLOGY.md) 與 [維度映射手冊](docs/BENCHMARK_DIMENSION_MAPPING.md)。

---

## 快速上手

### 系統需求

- Node.js >= 24.0.0
- pnpm >= 11.0.0

### 安裝與啟動

```bash
# 安裝依賴套件
pnpm install --frozen-lockfile

# 啟動開發伺服器
pnpm dev
```

啟動後，在瀏覽器打開 `http://localhost:3000` 即可檢視看板。

### 一鍵開啟本地審查頁面

直接雙擊專案根目錄的 `start-bench-review.cmd`。它會使用 4000 port 啟動開發伺服器，並在網站可連線後自動開啟瀏覽器：

```text
http://localhost:4000
```

若網站已經在 4000 port 執行，腳本會直接開啟現有頁面，不會重複啟動伺服器。要停止開發伺服器，請切換到它的 PowerShell 視窗按 `Ctrl+C`。

---

## 專案結構

本專案採用 Turborepo 與 pnpm workspace 管理：

```text
├── apps/
│   └── bench/                  # Next.js 單頁前端看板
├── packages/
│   ├── benchmark-data/         # 核心資料處理：資料格式定義、評分演算法與資料庫工具
│   └── acquisition/            # 資料擷取工具：來源資料抓取、成本計算與快照驗證
├── data/
│   ├── mappings/               # 模型設定、維度映射與顯示門檻設定
│   ├── sources/                # 來源快照清單、驗證紀錄與原始數據
│   └── product/current.json    # 發布用最新整合資料檔
├── artifacts/               # 原始快照內容儲存目錄
└── docs/                       # 設計規格、資料方法論與操作文件
```

---

## 資料更新流程

如需從外部來源更新最新評測數據：

### 1. 擷取來源資料與成本

```bash
# 刷新各評測來源的最新資料
pnpm --filter @llm-bench/acquisition materialize:artificial-analysis -- --visual-profile-count=<count>
pnpm --filter @llm-bench/acquisition materialize:livebench -- --visual-profile-count=<count>
pnpm --filter @llm-bench/acquisition materialize:deepswe -- --visual-model-count=<count>
pnpm --filter @llm-bench/acquisition materialize:frontier-code -- --visual-row-count <count> --visual-top-ten-matched

# 產出推理強度對齊報告
pnpm --filter @llm-bench/acquisition materialize:effort-reports
```

### 2. 產出整合資料檔

```bash
# 驗證來源資料並建立 data/product/current.json
pnpm data:build-current
```

### 3. 建置與端到端測試

```bash
# 建置前端靜態頁面
pnpm --filter @llm-bench/bench build

# 執行 Playwright 測試驗證看板功能
pnpm e2e
```

---

## 程式碼品質與測試

```bash
pnpm format       # 程式碼格式檢查 (Prettier)
pnpm lint         # 語法與規範檢查 (ESLint)
pnpm typecheck    # TypeScript 型別檢查
pnpm test         # 單元與整合測試 (Vitest)
pnpm e2e          # 端到端自動化測試 (Playwright)
```

---

## 相關文件

| 文件                                                                                 | 說明                                     |
| :----------------------------------------------------------------------------------- | :--------------------------------------- |
| [文件索引 (docs/README.md)](docs/README.md)                                          | 完整文件清單與閱讀順序                   |
| [架構設計 (ARCHITECTURE.md)](docs/ARCHITECTURE.md)                                   | 系統架構、目錄分工與資料流說明           |
| [資料方法論 (DATA_METHODOLOGY.md)](docs/DATA_METHODOLOGY.md)                         | 模型定義、設定判定與成本計算規則         |
| [計分方法論 (SCORING_METHODOLOGY.md)](docs/SCORING_METHODOLOGY.md)                   | 分數標準化方式、缺值處理與綜合分數演算法 |
| [維度映射手冊 (BENCHMARK_DIMENSION_MAPPING.md)](docs/BENCHMARK_DIMENSION_MAPPING.md) | 各項評測集與八大能力的映射定義與注意事項 |
| [維護與操作手冊 (OPERATIONS.md)](docs/OPERATIONS.md)                                 | 資料更新、審核流程與發布步驟             |

---

## 資料來源與聲明

- 外部評測基準成績之智慧財產權與數據歸屬於各原發布機構。
- 本專案記錄原始出處網址、採集時間與原始快照內容，以便追溯。
- 本專案不繞過任何登入驗證、付費機制或存取限制。
