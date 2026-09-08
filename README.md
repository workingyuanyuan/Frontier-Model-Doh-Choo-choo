# Frontier Model Doh Choo-choo (FM-DCC)

前沿大語言模型（Frontier LLMs）綜合能力與性價比評測看板。

🌐 **線上看板**：[https://workingyuanyuan.github.io/Frontier-Model-Doh-Choo-choo/](https://workingyuanyuan.github.io/Frontier-Model-Doh-Choo-choo/)

本專案整合公開評測快照，呈現推理、知識、程式碼、智慧體與語言五項能力，並依推理強度分開比較。看板使用建置時的資料版本；評測結果可追溯至來源與採集紀錄。

---

## 看板功能導覽

| 視圖                                    | 功能說明                                                                                                 |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **綜合天梯榜 (Leaderboard)**            | 條列各前沿模型的綜合評分、五大維度得分、推理強度與發布日期。支援模型選取、欄位排序與側邊欄詳細資料抽屜。 |
| **成本與效能分佈圖 (Quality vs. Cost)** | 比較分數與正規化任務成本指標；進階模式可選來源並比較推理強度曲線。來源美元成本可在明細查看。             |
| **五維能力雷達圖 (Five Dimensions)**    | 支援同時選取多個模型進行能力雷達圖疊加對比，快速了解各模型的強項與短板。                                 |
| **開發者檢視模式 (Developer Mode)**     | 開啟後可查看因測試項目未齊全而未列入主榜的模型與缺少的評測項目，以及只缺單一維度的 Profile 清單。        |

---

## 快速上手

### 系統需求

- Node.js >= 24.0.0
- pnpm >= 11.0.0

### 安裝與啟動

```bash
# 複製專案庫
git clone https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo.git
cd Frontier-Model-Doh-Choo-choo

# 安裝依賴套件
pnpm install --frozen-lockfile

# 啟動開發伺服器
pnpm dev
```

啟動後，在瀏覽器打開 `http://localhost:3000` 即可檢視看板。

### 一鍵開啟本地審查頁面

直接執行專案根目錄的 `start-bench-review.cmd`。腳本會使用 4000 port 啟動開發伺服器，並在服務就緒後自動開啟瀏覽器：

```text
http://localhost:4000
```

若服務已在 4000 port 執行，腳本會直接開啟瀏覽器頁面，不會重複啟動伺服器。要停止伺服器，請切換至該命令提示字元或 PowerShell 視窗按下 `Ctrl+C`。

---

## 專案結構

本專案採用 Turborepo 與 pnpm workspace 管理：

```text
├── apps/
│   └── bench/                  # Next.js 靜態前端看板應用
├── packages/
│   ├── benchmark-data/         # 核心資料處理：資料格式定義、評分演算法與產品建置
│   └── acquisition/            # 資料擷取工具：來源資料抓取、成本計算與快照驗證
├── data/
│   ├── mappings/               # 模型設定、維度映射與顯示門檻設定
│   ├── sources/                # 來源快照清單、驗證紀錄與原始數據
│   └── product/current.json    # 發布用最新整合資料檔
├── artifacts/                  # 原始快照內容儲存目錄（SHA-256 尋址）
└── docs/                       # 設計規格、資料方法論與操作文件
```

---

## 資料更新流程

資料更新預設完成來源查核與快照匯入、依核准政策重產 benchmark 集合、產品重建、展示驗證及異動報告。正常或輕微變化由代理完成後報告；重大計分口徑影響與無法解釋的變化備妥證據後交付審核。

完整命令、完成標準與提交部署程序見 [操作手冊](docs/OPERATIONS.md)。架構、設計、開發與代理工作的共用入口是 [文件索引](docs/README.md)。

---

## 驗證

驗證命令與執行順序見 [操作手冊 §7](docs/OPERATIONS.md#7-驗證與報告命令)。

---

## 資料來源與聲明

- 外部評測基準成績之智慧財產權與數據歸屬於各原發布機構。
- 本專案記錄原始出處網址、採集時間與原始快照內容，以便追溯。
- 本專案不繞過任何登入驗證、付費機制或存取限制。
