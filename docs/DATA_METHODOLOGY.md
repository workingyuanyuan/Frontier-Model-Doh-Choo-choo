# 資料方法

## 來源角色

- `ORGANIZER`：Benchmark 主辦方或官方排行榜。
- `INDEPENDENT`：自行執行評測的獨立評測者。
- `VENDOR`：受測模型廠商自行公布。
- `AGGREGATOR`：混合來源索引，只作發現與選模。

同一 Benchmark、版本、Profile 與配置下，優先順序為主辦方、獨立評測、廠商自報、聚合站。相同角色下完整快照優先於 `PARTIAL_SOURCE`，再以較新的公開時間為準。

## 首批實證來源

| 來源                | 角色        | 主要取得方法            |
| ------------------- | ----------- | ----------------------- |
| Terminal-Bench      | ORGANIZER   | Next/RSC、DOM           |
| DeepSWE             | ORGANIZER   | 官方 JSON、DOM          |
| LiveBench           | ORGANIZER   | CSV、JSON、SPA bundle   |
| Epoch AI            | INDEPENDENT | 官方 ZIP export、DOM    |
| Artificial Analysis | INDEPENDENT | HTML、內嵌結構化資料    |
| Vals AI             | INDEPENDENT | HTML、模型設定頁        |
| OpenAI              | VENDOR      | semantic DOM／可視表格  |
| LLM Stats           | AGGREGATOR  | HTML 索引，永不直接計分 |

每站必須提交：

- `manifest.json`
- `evidence-index.json`
- `candidates.json`
- `validation-report.md`
- `artifacts-v2/sha256/...` 的真實 bytes

## 擷取順序

依來源能力混合使用：

1. 官方 API 或表格匯出。
2. 網站內嵌 JSON 或 API response。
3. Next/RSC payload。
4. DOM。
5. PDF。
6. 視覺讀取與人工轉錄。

較低層 fallback 不會自動覆蓋結構化資料；若畫面與結構化內容衝突，驗證報告必須標記人工複核。例如 OpenAI GPT-5.6 頁面的 Agents’ Last Exam 敘述值與表格值不同，Draft 保留表格值並明確記錄衝突。

## 完整性

- `FULL`：目標快照的可見列、分頁或官方結構化母體已對齊。
- `PARTIAL_SOURCE`：候選列本身可驗證，但來源快照有界或未完整取得。
- `PARTIAL_SOURCE` 不設期限，仍可參與 Estimated 排名。
- 聚合指標、無可靠正規化的 Elo 或來源衝突列可保留為 `EXCLUDED`。

## Model 與 Profile

基礎模型使用 provider-prefixed canonical ID。Profile 保留 reasoning effort、thinking、tools、harness、context、quantization 與 attempts。

跨來源共用 Profile 時，只合併一致或唯一已知的模型屬性；來源特定 tools、harness 或 attempts 若互相不同，ModelProfile 顯示未知，CandidateResult 仍保存每筆精確配置。代表 Profile 演算法仍是實證迭代項目。

## Frontier 選模

每個設定中的綜合榜最多取 Top 20，來源不足 20 筆時不補齊；按基礎模型去重後取聯集，再加入人工新品。外部綜合分數只用於選模與展示，不投入八維計分。

目前設定位於 `data-v2/mappings/frontier.json`，採用 Artificial Analysis Intelligence Index、Epoch Capabilities Index、Vals Index 與 LLM Stats Coding Index。

## 保存邊界

- Git：Schema、mapping、manifest、Evidence metadata、Candidate、驗證報告、ProductVersion 與 pointer。
- Git 外：原始 HTML、JSON、CSV、ZIP、PDF、JS 或視覺轉錄 artifact。
- EvidenceRecord 必須包含 SHA-256、byte length、URL、時間、方法與實際 artifact path。

`artifacts-v2/` 目前是本機 Git-ignored store；部署前需複製到耐久儲存，但網站建置不依賴它。
