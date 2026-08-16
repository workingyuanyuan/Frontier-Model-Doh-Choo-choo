# Draft 1095 發布前代理審核（已被取代）

> 本報告記錄當時的舊 Profile 契約，已由 [目前 Draft 發布前代理審核](DRAFT_REVIEW_2026-07-18.md) 取代，不得作為目前發布依據。

> 審核狀態：Agent review passed  
> 發布狀態：Not Published  
> Current Draft：`sha256:1095cfde8a14e9ca60ac29ce50d08e6355ba97a6bb6317556035065f109a8629`  
> 審核日期：2026-07-17

本文件記錄代理對 Draft 的發布前審核。通過代理審核不會自動切換 Published；`Draft → Published` 仍只能由人工明確執行。

## 被取代的 Draft

| Draft       | 代理結論   | 原因                                                                                                                                           |
| ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `a81a51d3…` | Rejected   | Qwen3.7 Max 別名重複；不同 tools／harness／context／attempt 配置被合併；主辦方角色與來源完整性說明不正確；selector 缺少可辨識的 Profile 身份。 |
| `49c6e9de…` | Rejected   | 來源 `lastVerifiedAt` 被錯寫為晚於 Draft 生成時間；未作為可發布候選。                                                                          |
| `a3f4b6c9…` | Superseded | 資料與配置已拆分，但部分 selector 選項仍因未顯示 thinking／context／attempts 而難以辨認。                                                      |

以上版本保持不可變，不是目前發布候選。

## 任務 0–7

| 任務                    | 結論 | 代理審核結果                                                                                                                                                                                                                                                              |
| ----------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Draft 完整性         | PASS | Pointer、版本檔名、內容 SHA-256 與 deterministic JSON 一致；使用相同 `generatedAt` 重建可逐 byte 重現；Published pointer 不存在。                                                                                                                                         |
| 1. 來源角色與採用邊界   | PASS | 角色按結果列判定。AA 自有指標／AA-Briefcase、Epoch ECI、Vals Index／ProofBench 為 `ORGANIZER`；外部重跑為 `INDEPENDENT`；OpenAI 自報為 `VENDOR`；LLM Stats 維持 `AGGREGATOR` 與索引用途。                                                                                 |
| 2. 八站證據與數值       | PASS | 八站共 138 Candidate、15 Evidence artifact；artifact hash、byte length、Evidence 與 provenance 引用全部通過。Product 使用其中 132 筆，內容未被修改。來源頁列數與已保存結構化資料的對照由代理完成。                                                                        |
| 3. 模型與 Profile 身份  | PASS | Qwen3.7 Max 統一為 `alibaba-qwen3-7-max`。不同來源、tools、harness、context 與 attempts 使用不同 Profile；目前沒有任何相同 Profile ID 對應多組明確配置。Pipeline 會拒絕同 ID 的明確配置衝突。                                                                             |
| 4. Benchmark 映射       | PASS | 51 個 Benchmark ID 唯一且各有一個主要維度；所有參與計分的 Benchmark 均有映射。Frontier 選模綜合榜共 59 列，另有 1 列 AA Coding Agent Index；60 列全部 `EXCLUDED` 且 `normalizedScore: null`，不投入八維。                                                                 |
| 5. Frontier 選模        | PASS | 各綜合榜採最多 Top 20，不足時使用實際數量；AA 20、Epoch 20、Vals 16、LLM Stats 3。Qwen 去重後聯集為 33 個基礎模型；`manualModels` 為空。                                                                                                                                  |
| 6. 八維與排名           | PASS | 37 個可計分 Profile、15 個有代表列的基礎模型、18 個 Frontier 模型等待直接標準化證據。獨立重算維度、component count 與 overall 無差異；缺失維度維持 `null`，不計零；全部為 `ESTIMATED`。                                                                                   |
| 7. Dashboard 與 Preview | PASS | 同一 Draft UI 顯示 33 Frontier／15 Ranked／37 Scored Profiles／18 Awaiting evidence。selector 僅能選取目前基礎模型的 Profile，stale ID 會回到代表 Profile；選項顯示 thinking、harness、tools、context 與 attempts；靜態 Draft build、型別、單元測試與 HTML 輸出檢查通過。 |

## 數量差異結論

目前四個數字具有不同語意，不是遺漏或 UI 截斷：

- **33 Frontier models**：四個綜合榜 Top 20 動態聯集，按基礎模型去重。
- **15 Ranked models**：已有至少一筆可標準化直接 Benchmark 結果的基礎模型；主榜每模型只顯示一個代表 Profile。
- **37 Scored Profiles**：15 個基礎模型底下，按 effort／tools／harness／context／attempt 拆開的可計分配置。
- **18 Awaiting direct evidence**：已入 Frontier，但目前沒有直接八維分數，因此不產生綜合分數。

舊 Draft 的 34／30 差異包含一個 Qwen canonical ID 重複，且 30 個 Profile 中存在錯誤合併。修正後的 33／37 是身份拆分後的預期結果。

## 公開證據裁決

- [Artificial Analysis — Qwen3.7 Max](https://artificialanalysis.ai/models/qwen3-7-max)：確認 Alibaba 的 Qwen3.7 Max 身份。
- [Artificial Analysis — AA-Briefcase](https://artificialanalysis.ai/articles/aa-briefcase/)：明確說明 AA-Briefcase 由 Artificial Analysis 開發。
- [Vals AI Benchmarks](https://www.vals.ai/benchmarks)：將 ProofBench 與 Vals Index 標示為 Vals AI original benchmark。
- [Epoch ECI documentation](https://epoch.ai/data/eci-documentation)：說明 ECI 是 Epoch AI 擁有完整權利的獨立產品。
- [OpenAI GPT-5.6 release](https://openai.com/index/gpt-5-6/)：表格的 Agents' Last Exam 為 52.7；同頁敘事的 53.6 屬不同配置結果，不能合併。
- [Agents' Last Exam leaderboard](https://agents-last-exam.org/leaderboard)：53.6 應以 organizer／Codex／xhigh 的獨立 Profile 接入，而不是覆寫 OpenAI 表格的 unspecified 52.7。

## 非阻塞風險

- 15 個代表列中有 12 個只有一個維度，仍符合「至少一項證據即可顯示 Estimated」的已核准規則，但不可解讀為完整八維能力排名。
- 18 個 Frontier 模型尚無直接八維分數；Dashboard 已明確顯示，不以外部綜合指標補分。
- OpenAI artifact 是小型 DOM 摘錄而非完整 HTML/PDF；精確值已由公開頁重新核驗，仍維持 `PARTIAL_SOURCE`。
- Artificial Analysis 採有界 Top 20，而不是完整 29 個可見模型或 575 模型目錄；validation report 已明確揭露。

## 驗證

- `@llm-bench/benchmark-data`：24 tests passed。
- `@llm-bench/acquisition`：8 tests passed。
- `@llm-bench/bench`：17 tests passed。
- 三個 workspace typecheck 通過。
- `@llm-bench/bench` Draft production build 通過。
- Scoped ESLint、Prettier check 與 `git diff --check` 通過。
- 15 個 artifact：0 missing、0 hash mismatch、0 byte-length mismatch。
- Candidate evidence／provenance：0 unresolved references。

## 人工必須處理

沒有剩餘的公開證據裁決問題需要人工判斷。

人工唯一必須處理的下一步是：決定是否接受上述非阻塞風險，並在接受後親自執行 Published 切換。Agent 不會自行 Published。
