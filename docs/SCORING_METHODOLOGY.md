# 計分方法

## 能力分類

| 維度          | UI 縮寫 | 定義               |
| ------------- | ------- | ------------------ |
| Agentic       | AGT     | 操作環境完成目標   |
| Coding        | COD     | 產出符合要求的程式 |
| Reasoning     | RSN     | 由已知條件推導答案 |
| Knowledge     | KNG     | 運用既有領域知識   |
| Comprehension | CMP     | 解讀輸入材料       |
| Language      | LNG     | 按要求表達文字     |

主要分類由 `data/mappings/benchmarks-v2.json` 決定，每項 benchmark 只投入一個維度。
次要分類僅供描述。歸類理由見 [Benchmark 維度映射](BENCHMARK_DIMENSION_MAPPING.md)。

## 預設模型

依 [前沿政策](FRONTIER_POLICY.md) 使用 Artificial Analysis Intelligence Index 的明顯分差決定前沿模型。
同一模型採 AA 分數最高的 effort profile。`pnpm data:build-current` 會重新產生前沿集合，
排名資料驗證失敗時停止建置。拉桿提供 AA 前 2～10 名，預設 `aa-frontier` 為前 8 名；每組分別計算共同合格測試。

## 共同測試

每次勾選、取消勾選或切換 effort，重新計算所有選定 profiles 共同持有的有效 benchmark。
清空後沒有計分列；只選一個 profile 時使用它本身的合格測試。固定比較的其他 effort 也參與交集。
不同 effort 的結果不能合併成一個 profile；同一測試的 metric、單位及分數方向須一致。

結果須為 `INCLUDED` 且具有有限的 0–100 normalized score。AA 等外部綜合指標不投入能力計分。
`comparisonOnly` 項目限手動 profile 比較使用，不投入預設集合。缺失資料不當成零。

先求共同測試，再套用 `benchmark-quality-v2.json`：

- AIME、ProgramBench、ProofBench 排除計分。
- 每項受限測試須在同一主要維度搭配至少兩項無限制測試。
- 保留全部無限制測試，按 benchmark ID 排序保留可容許的受限測試數量。

## 維度及總分

同一 benchmark 有多個相容 metric 時，先取其算術平均；同一維度再對不同 benchmark 的分數取算術平均。
以獨立 benchmark ID 計算測試數，不能用同一 benchmark 的多個 metric 增加權重。

- 維度有一項合格 benchmark：權重為 ½。
- 維度有至少兩項合格 benchmark：權重為 1。
- 維度沒有合格 benchmark：不參與計分，也不顯示欄位或雷達軸。

總分為有效維度的加權平均：`Σ(維度分數 × 權重) / Σ權重`。
沒有共同合格測試時總分為 null，不給名次。其餘列依總分排序，profile ID 作為穩定的平手次序。

Leaderboard、Markdown 匯出及雷達圖使用相同的有效維度順序。
語言測試納入共同集合時自然增加 LNG 欄位及雷達軸。

## 有效結果及衝突

同一 benchmark、模型、effort、metric 及歸屬 profile 只保留一筆有效結果。
`benchmarkVersion` 保存來源版本證據；不可比較的不同測驗需使用不同 benchmark ID。

1. 套用來源角色優先級。
2. `FULL` 優先於 `PARTIAL_SOURCE`。
3. 地位相同的跨來源重複量測取可比較分數較高者；完整新快照替換該站舊快照，其他條件相同再以公開／觀測時間裁決。
4. Harness 可比較且前述條件相同時取較高分，不建立 Harness Profile。
5. 未採用結果保留在 evidence 稽核軌跡。

## 成本及可重現性

成本不回饋能力總分。Quality vs. Cost 的來源分數、成本正規化及 Pareto 計算見
[資料方法](DATA_METHODOLOGY.md)。

來源、profiles、evidence 及計分結果按固定次序序列化。固定輸入和 `generatedAt`
產生相同 canonical JSON 及 SHA-256 `versionId`。
