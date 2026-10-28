# 前沿模型集合政策

核定日期：2026-10-04。此政策取代以測試覆蓋最佳化決定預設前沿模型的規則。

## 模型資格

排名依據為 Artificial Analysis Intelligence Index。同一次排名只使用一個指標版本。
同一模型的不同 effort 取最高 AA 分數，該筆的 profile 稱為 AA 勝出 profile。

前沿模型另須有跨來源資料（使用者 2026-10-24 裁決）：代表 profile 至少要在 **2 個獨立組織**的可計分測試中有成績。

代表 profile（使用者 2026-10-28 裁決）：在該模型符合上述條件的 AA effort 中，取有成績的獨立組織數最多者，同數時取 AA 分數較高者。模型的 AA 名次仍依 AA 勝出 profile 的分數；代表 profile 與 AA 勝出 profile 不同時，audit 記錄兩者，前沿理由列出原因。

- 可計分：有正規化分數、已分類、不是 `comparisonOnly`，也沒被品質政策排除。
- AA 不計入，因為它是排名依據。
- 廠商發布頁（`VENDOR` 角色）是自報成績，不計入。
- Surge 的各排行榜同屬一個組織，只算一個。

依 AA 名次逐一檢查，取前十個有合格 effort 的模型作為拉桿的模型範圍。不合格的模型記錄在 audit 的 `eligibility.skipped`，連同其 AA 名次與已有的組織；它們仍可用 Search Models 選取，只是不進拉桿與預設集合。
若有未解析身分的 AA 分數不低於第十個合格模型，或合格模型不足十個，停止產品建置。
使用者可用 Models 拉桿選擇合格前沿模型的前 2～10 名，每個位置都有自己的共同合格測試及分數。
preset ID 依模型數固定：前 8 名為 `aa-frontier`，其餘為 `aa-top-N`。
預設集合從前 8 名開始；若前 9 名的共同合格測試數與前 8 名相同，改用前 9 名，再依同一條件延伸到前 10 名。遇到測試數較少的集合即停止（使用者 2026-10-23 裁決：測試數相同時採用模型數較多的集合）。產品的 `defaultPresetId` 記錄實際採用的集合，刷新報告列出各模型數的共同測試數供使用者調整。
斷層計算保留供稽核參考，不決定首頁數量。

資料缺少可比較版本、前十名身分未解析或樣本不足時，停止產品建置。
AA 綜合指標用於選模，不作為能力維度的計分測試。預設 profile 採該模型的代表 profile；
不同來源的成績經既有 profile 政策對齊，每個 profile 必須自身持有全部共同測試。

拉桿切換會重新選取該組 profiles，清除手動 effort 及保留比較設定，並更新網址。
Search Models 可自由選取模型，包括排除第九名並加入第十名；Default 恢復預設集合。

## 測試分類

| ID            | 名稱 | 核心概念           |
| ------------- | ---- | ------------------ |
| reasoning     | 推理 | 由已知條件推導答案 |
| knowledge     | 知識 | 運用既有領域知識   |
| comprehension | 理解 | 解讀輸入材料       |
| coding        | 程式 | 產出符合要求的程式 |
| agentic       | 代理 | 操作環境完成目標   |
| language      | 語言 | 按要求表達文字     |

分類資料：[benchmarks-v2.json](../data/mappings/benchmarks-v2.json)。每項測試只有一個主要分類。
次要分類供描述用途，不重複計分。完整歸類理由見 [BENCHMARK_DIMENSION_MAPPING.md](BENCHMARK_DIMENSION_MAPPING.md)。

## 品質政策

品質資料：[benchmark-quality-v2.json](../data/mappings/benchmark-quality-v2.json)。
AIME、ProgramBench、ProofBench、LiveBench Mathematics、IOI 排除計分。
2026-10-16 使用者核准新增排除 LiveBench Mathematics 與 IOI，適用所有前沿集合與自選 profiles；
核准紀錄、固定 profiles 分數及來源依據見 [品質審查](analysis/2026-10-16-benchmark-exclusions.json)。
ProofBench 在核准時六個前沿模型的分數為 99–100，
停止計分的依據保存在 [品質稽核](analysis/2026-10-03-proofbench-quality-review.json)。

有限制的測試仍須在同一主要維度中，每項至少搭配兩項無限制測試。
先求共同測試，再排除不合品質政策的項目。若限制比例超標，保留全部無限制測試，
依 benchmark ID 排序保留最多可容許的限制測試，確保重建結果穩定。
`comparisonOnly` 測試不納入預設計分核心。

## 執行階段

1. **Phase 1：政策資料。** 選出前沿模型、套用六類分類、產生共同合格測試。
2. **Phase 2：動態計分及呈現。** 依勾選 profiles 重算共同測試；有測試才顯示維度；
   單項測試的維度權重為 ½，至少兩個獨立測試設計為 1，正規化後計算總分。
   表格及雷達圖共用有效維度。Clear all 清空選取，重新勾選後重新計算。
3. **Phase 3：互動驗證。** 驗證預設、清空、單選、多選及五軸／六軸切換。

Phase 1 產物為 `data/mappings/frontier-set.json`，由以下指令重建：

```sh
pnpm data:generate-frontier-set
```

指令讀取已儲存的來源快照，先套用精確身分對應及產品 profile 政策，再進行 AA 判定。
`frontier-selection-audit.json` 保留 AA 原始前十名、原始分數、來源證據、指標版本、斷層計算，以及 `eligibility`（合格的十個模型與被略過的模型、各自計入的組織）。
排名資料驗證失敗時回傳非零狀態，不覆寫成功的集合。

`pnpm data:build-current` 重新產生前沿集合，使用 v2 分類及品質政策建立合格前沿模型前 2～10 名的九組集合，預設集合依上述「模型資格」的延伸規則決定。
產品保存可供自選模型計分的有效 evidence 及品質政策；網頁於每次模型或 effort 選取變更後，
重新求交集、套用品質限制、計算有效維度及加權總分。實作計分規則見 [計分方法](SCORING_METHODOLOGY.md)。
