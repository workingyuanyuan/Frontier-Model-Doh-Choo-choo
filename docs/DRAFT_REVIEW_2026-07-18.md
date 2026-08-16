# Draft 8b9de26c 發布前代理審核

> Superseded：目前審核請見 `DRAFT_REVIEW_2026-07-18_6E591984.md`；本文件只保留三站物化前的歷史失敗結論。

> 審核狀態：Agent review failed — source materialization remediation required  
> 發布狀態：Not Published  
> Current Draft：`sha256:8b9de26c0e3aae9b555641051e9d7e72a36066ef1da5029c9e08bbde307cd228`  
> 審核日期：2026-07-18

本文件記錄代理對目前 Draft 的發布前審核。通過代理審核不會自動切換 Published；`Draft → Published` 仍只能由人工明確執行。

## 被取代的 Draft

- `478285fa…` 依先前核准的 effort＋指定 Harness 規則生成；本次產品規則已改為只按 effort 分組，因此已 Superseded，不得 Published。
- `28036c86…` 曾把非選定 Harness 排除，且部分排除 Evidence 綁到另一個 Harness Profile；該版本維持 Superseded。

## 本次規則與修正

- Product Profile 只按 reasoning effort 分離，Product Profile 的 Harness 固定為 null；所有來源 Harness／No Harness 都保留在 Candidate 與 Evidence。
- 未標 effort 的結果歸入同模型已明示的最高 effort；若整個模型皆未標示，採 `profile-policy-v2` 的 `max` fallback，不產生 `unspecified` Profile。
- 同 Benchmark identity 的不同 Harness 結果取可比較分數較高者；同 Harness 衝突仍依來源角色、完整性與快照規則處理，每筆 Evidence 最多計分一次。
- Representative Leaderboard 在 Overall 與 COV 間依序顯示 AGT、COD、RSN、MAT、KNG、LNG、CTX、IF；Category score table 使用相同順序。
- Leaderboard、Profile selector 與圖表名稱只顯示 effort 值；`xhigh` 呈現為 `xHigh`，不顯示 `effort` 字樣或 Harness。
- Score evidence 的 Source Profile 只顯示來源明示的 Harness；No Harness 保持空白。
- `MEASURED_TASK` 價格重新綁到正規化後的 `*-max` Product Profile，恢復 Measured / agent task 圖表。

## 任務 0–7

| 任務                    | 結論 | 代理審核結果                                                                                                                                                                                                                                                         |
| ----------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Draft 完整性         | PASS | Pointer、版本檔名與內容 ID 一致；以相同 `generatedAt` 重建得到相同 `sha256:8b9de26c…7cd228`；Published pointer 不存在。                                                                                                                                              |
| 1. 來源角色與採用邊界   | PASS | 來源角色與採用邊界維持既有核驗；LLM Stats 仍為 `AGGREGATOR`／index-only；外部綜合指標只用於 Frontier 選模與展示。                                                                                                                                                    |
| 2. 八站證據與數值       | FAIL | Artifact 完整性與引用雖通過，但 Artificial Analysis、Epoch AI、Vals AI 的結構化原始資料沒有被完整物化成 CandidateResult。三站只有 1／13／4 筆 Included；至少 4／53／84 筆當前 cohort 的本地可用結果遭遺漏。                                                          |
| 3. 模型與 Profile 身份  | PASS | 19 個可計分 Product Profile 全部有非 null effort、`harness: null`，且 ID 無 `unspecified`。GPT-5.6 Sol 只剩 `openai-gpt-5-6-sol-max`；來源 Harness 仍可在 Evidence 追溯。                                                                                            |
| 4. Benchmark 映射與衝突 | PASS | 所有 Included normalized result 均有主要維度；外部 composite 保持 Excluded。跨 Harness 衝突只取高分：Opus 4.7 採 Claude Code 68.90 而非 Terminus 2 66.07；GPT-5.5 採 Codex 83.15 而非 Terminus 2 77.98。                                                             |
| 5. Frontier 選模        | PASS | 動態 Top 20 聯集按基礎模型去重後為 33；`manualModels` 為空。代表榜為已有直接可標準化結果的 15 個基礎模型。                                                                                                                                                           |
| 6. 八維、排名與成本     | FAIL | 19 個 Profile 的 152 個八維格中有 112 個 null（73.7%）；18 個 Frontier model 沒有任何排名列。缺失值沒有被錯當零，但其中相當部分是上游未物化，而不是來源尚未測試。成本圖本身維持通過。                                                                                |
| 7. Dashboard 與 Preview | PASS | Chrome 驗證欄位順序、Fable max→xHigh selector 切換、Category 表同步與 3 個 task cost 點。Leaderboard 13 欄及 Evidence 6 欄均可升／降排序；Benchmark details 依八維摺疊並保留 non-scoring evidence。390px 行動版無水平溢位、console 無訊息，Lighthouse 四項皆為 100。 |

## 數量差異結論

- **33 Frontier models**：四個綜合榜的動態 Top 20 聯集，按基礎模型去重。
- **15 Ranked models**：已有至少一筆可標準化直接 Benchmark 結果的基礎模型；主榜每模型一列。
- **19 Scored Profiles**：15 個有分模型底下，只按 effort 分離的可計分配置。
- **18 Awaiting direct evidence**：已入 Frontier 但尚無直接八維分數，因此不進代表榜。

舊 34 是 Qwen canonical ID 重複前的 Frontier 數；舊 30／37 是過度拆分來源配置的 Profile 數；`478285` 依 effort＋Harness 規則為 24 Profiles。新規則合併所有 Harness 並把未標 effort 歸入模型最高強度後為 19 Profiles。這些數字都不是前端截斷。

## 三站大量 N/A 的根因

結論是 **raw artifact → CandidateResult 的物化範圍錯誤**，不是計分器遺失 Included 分數，也不是三站只有綜合榜。

| 來源                | 已擷取原始範圍                                                                                      |        目前 Candidate | 已確認遺漏                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Artificial Analysis | 1,353,178-byte models HTML；包含 Intelligence v4.1 各 constituent 欄位與 2026-07-09 發布文章        |  23 total／1 Included | 文章內至少 4 筆精確列未物化；models payload 內 GPQA、HLE、SciCode、IFBench、LCR、Terminal-Bench、Omniscience 等欄位未列舉                                    |
| Epoch AI            | 官方 ZIP 內 73 個 benchmark-result CSV；9 個內部評測共 1,490 列（含 ECI）                           | 33 total／13 Included | Epoch Top 20 的精確 Profile 至少 53 筆 direct row 未物化；Math Level 5、SWE-bench Verified、FrontierMath、FrontierMath Tier 4 四個 family 完全沒有 Candidate |
| Vals AI             | Home 的 `benchmarkView` 含 6 個 task、每個 36 個非空 accuracy；Sol detail 列出 26 個 Benchmark slug |  20 total／4 Included | 當前 16 模型的五個 direct constituent 至少漏 78 筆，update text 另漏至少 6 筆；SSR detail 的 `0.0%` 是 placeholder，不可採用                                 |

三站所有已 Included 的百分比分數都有正常進入計分：AA 1/1、Epoch 12/13（另一筆為同 Profile 同 Benchmark 的較低 Chess 結果而被取代）、Vals 4/4。也就是說，Profile 合併、標準化與分數聚合不是本次廣泛 N/A 的主因。

架構上的直接原因：`packages/acquisition` 目前只有通用 artifact／完整性 helper，沒有三站專用、可重現的 raw-to-Candidate materializer；`packages/benchmark-data` 直接讀取已提交的 `candidates.json`，不會解析 artifact。先前人工 fixture 又刻意只物化 GPT-5.6 或綜合榜 Top cohort 的狹窄子集，導致豐富的原始資料成為不參與產品輸出的 inert artifact。

修復順序由代理裁決為：Epoch ZIP 全九個 internal CSV → Vals `benchmarkView` constituent matrix → Artificial Analysis model payload／evaluation pages。Composite 仍保持 Excluded，不可用綜合指標掩蓋 N/A。每站修復後必須建立 raw row count 對 Candidate row count 的 regression gate，再生成新的不可變 Draft；本文件不授權 Published。

## GPT-5.6 Sol

GPT-5.6 Sol 現在只有 `openai-gpt-5-6-sol-max`：8 維、23 個 current Benchmark component、overall 76.39。原本未標 effort 的來源列已依規則歸入 max；原始 `profile.effort: null` 與 Epoch AI Inspect、mini-swe-agent、Codex 等來源 Harness 仍留在 Evidence，不會出現在 Product Profile 名稱或 selector。

## Published 阻塞項目

- 19 個可計分 Profile 中多數只有一維，且相當部分可由既有 artifact 補回；在完成三站物化修復前，不得把稀疏度全部解讀為「來源尚未測試」。
- 18 個 Frontier 模型尚無直接八維分數；Epoch 與 Vals 的既有 artifact 至少可讓其中 8 個取得第一筆 direct evidence。
- Measured task 成本是 Artificial Analysis 公開的模型任務成本，但 y 軸使用本產品的跨來源 overall score；兩者可比較，但不是 Artificial Analysis 專屬品質分數。

## 驗證

- `@llm-bench/benchmark-data`：28 tests passed。
- `@llm-bench/acquisition`：8 tests passed。
- `@llm-bench/bench`：27 tests passed；涵蓋全欄排序、雙向排序時 N/A 固定置底、八維群組順序、Excluded／non-scoring evidence 保留與映射載入。
- benchmark-data 與 bench typecheck 通過；bench production static build 通過。
- 15 個 artifact：0 missing、0 hash mismatch、0 byte-length mismatch。
- 138 個 Candidate：0 unresolved Evidence／provenance reference。
- 獨立 Terra 審核：0 blocker、0 finding；70 Included Evidence 收斂為 65 筆唯一計分貢獻，5 組跨 Harness 衝突全部取較高可比較分數；42 筆缺 effort 原始列全部正確歸屬。
- Scoped ESLint、Prettier 與 `git diff --check` 通過。
- 真實 Chrome selector、成本圖、Leaderboard／Evidence 排序、八維摺疊、桌面／390px 行動版、console 與 Lighthouse 檢查通過；Accessibility、Best Practices、SEO、Agentic Browsing 均為 100。

## 人工必須處理

目前沒有需要人工逐項裁決的資料問題。上述三站缺口可由代理依公開證據與本地 artifact 修復及複核。

Published 切換仍只能由人工明確執行，但在代理完成三站物化修復、生成新 Draft 並重新審核前，不應提出 Published 核准請求。Agent 不會自行 Published。
