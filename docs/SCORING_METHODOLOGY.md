# 計分方法

## 八維

固定順序：

1. Reasoning
2. Math
3. Knowledge
4. Language
5. Instruction
6. Coding
7. Agentic
8. Context

Benchmark 映射由 `data-v2/mappings/benchmarks.json` 控制，完整理由與限制見 [Benchmark 八維映射](BENCHMARK_DIMENSION_MAPPING.md)。

## Benchmark 規則

- 第一版每個 Benchmark 只投入一個主要維度。
- 次要關聯只作文件與未來調整依據，不重複加權。
- 百分比或可靠 accuracy 類指標直接標準化到 0–100。
- 沒有核准轉換的 Elo、ECI、Intelligence Index 等只展示原始值。
- 缺失值為 `null`，永不當成零。

## Profile 分數

對一個 Profile：

1. 先依來源角色、完整性與時間選出當前有效結果。
2. 同一維度內，對已映射的 normalized score 取算術平均。
3. Overall Score 對有資料的維度重新正規化後取平均。
4. 沒有資料的維度保持 N/A。
5. 至少一筆已映射 normalized score 即可產生 Estimated 分數與排名。

因此稀疏新品會立刻顯示，但 Coverage 必須與分數一起閱讀。

## Estimated 與 Supported

- 第一版所有實際資料均為 `ESTIMATED`。
- 只有廠商自報的模型仍可顯示分數。
- Supported 門檻尚未以理論值硬編碼，待真實資料、人眼審查與產品使用後再設定。
- `PARTIAL_SOURCE` 可參與 Estimated，不因時間自動失效。

## 綜合榜

Artificial Analysis Intelligence Index、Epoch Capabilities Index、Vals Index 與 LLM Stats Coding Index 用於：

- 找出前沿模型。
- 顯示外部核心排名指標。

它們不投入八維 Overall Score，避免把同一組底層 Benchmark 重複計分。

## 成本

成本序列分開展示：

- `API_STANDARDIZED`：目前採 3:1 input/output token 的可修改混合假設。
- `MEASURED_TASK`／`AGENT_TASK`：來源實際公布的每任務成本。

兩種成本不可混為同一語義。API 曲線的 cost 是比較單位，不宣稱等於實際每任務支出。

目前 GPT-5.6 定價與 Artificial Analysis 每任務成本在 `data-v2/mappings/models.json`；權重與成本假設未來可直接改設定並生成新 Draft，不修改舊版本。

## 可重現性

ProductVersion 的 versionId 是移除 versionId 欄位後，對 canonical deterministic JSON 計算 SHA-256。來源順序、維度順序、Profile、Evidence 與 cost point 均排序，固定輸入與 generatedAt 會得到相同版本。
