# 2026-11-26 benchmark 聯網查核

距上次查核（11-23）三天，有幾項實質變化：

- **AA Intelligence Index 升到 v5.0.2**：指數裡的 Terminal-Bench 4.0 換成 4.1，FrontierCode-AA 2.0 也重新評分。
- **兩個新模型已登記**：InclusionAI 的 Ling-3.2-air（11-23）與 Cognition 的 SWE-2.1（11-24），兩者都有官方證據，也都已出現在現役來源。
- **既有模型新增成績**：Epoch 首次收錄 Qwen4-Max；Gemini 4 Neon 新增 ARC、Scale 與 Epoch 的成績。
- **GLM-5.4 仍沒有 API**：Z.ai 文件寫明要等安全評估後才開放，所以仍不新增身分。

結果已匯入並依 `pnpm data:release` 重建產品，資料更新見 [刷新報告](../refresh/2026-11-26.md)。

## 範圍與基準

- **起始狀態**：起始 commit `1539cc565fc25418bae55fcc94d1f650093a3985`，工作區乾淨。
- **比較基準**：比較對象是 11-23 的擷取與 `data/product/current.json`（`sha256:d5f7b4daae9e06b9518382c7e0623ede5debd0845336eab83dfb8db14b06c66c`）。這個版本已包含 11-24 登記的 Claude Haiku 5.5 與 24 個 AA 名稱。
- **擷取方式**：沿用 11-23 的 URL 清單：廠商頁 62 個，benchmark 主辦方與線索頁 57 個。擷取時間為 2026-11-26 06:50–06:54 UTC，每頁存 SHA-256。內容雜湊改變的有廠商頁 57 個、主辦方頁 43 個（含錯誤頁的動態 token）。
  - 原始檔與清單：`artifacts/research/2026-11-26-benchmark-check/web/{V,L}/`。
  - 逐頁差異：由 agy（Gemini 4 Hydrogen High）比對 11-23 與今天的可見文字，也解析了 Next.js RSC、Mintlify 與 MakerSuite 頁面內嵌的資料，以及大型 JSON/CSV。結果在 `web/discovery-notes.md`，100 個有變動的檔案都有結論。
  - 下文引用的新模型與新列都已用原始檔或來源快照重新核對。新模型的官方頁另存於 `web/evidence/`。
- **無法取得的頁面**：
  - `ai.meta.com/blog/` 回 400，Perplexity WANDR 回 403，LiveBench 舊 bundle 回 404，DeepSeek 的 `news1106` 回 404，四頁 11-23 也取不到。LiveBench 的資料由現役 materializer 直接取得，不受影響。
  - `minimax.io/news` 第一次擷取時 IPv6 連不上，改用 IPv4 重抓成功，清單已記錄。
- **只換建置雜湊的頁面**：其餘頁面只有建置雜湊、nonce、存取日期、按讚數或下載數改變。

## 各廠商新模型

- **Ling-3.2-air（InclusionAI，11-23）：已登記**。
  - Hugging Face 官方 repo [inclusionAI/Ling-3.2-air](https://huggingface.co/inclusionAI/Ling-3.2-air) 建立於 11-23，MIT 授權。模型卡說明它與 Ling-3.0-flash-VL 同架構，並寫明「scores 23 on the Artificial Analysis Intelligence Index v5.0.1」。
  - AA 的變更紀錄與模型目錄同日新增這個模型，指數 23.44（v5.0.2）。AA 指數上出現的名稱，依審核帳規則必須登記或記錄決定，所以今天登記為 `inclusionai-ling-3-2-air`。
- **SWE-2.1（Cognition，11-24）：已登記**。
  - Cognition 部落格 [Introducing SWE-2.1](https://cognition.ai/blog/swe-2-1)（2026.11.24）：以 Kimi K3 為基礎、純強化學習訓練，是 SWE-2 的後繼。
  - FrontierCode 2.0 的變更紀錄「Added SWE-2.1.」新增它 low 到 max 五個檔位（Devin CLI harness）。max 為 41.3%，與官方文章的數字相同。登記為 `cognition-swe-2-1`。
- **GLM-5.4（Z.ai，11-23）：仍不登記**。
  - 智譜文件的模型目錄新增 GLM-5.4 頁。頁面寫明「已向 GLM Coding Plan 全量用户开放」「模型 API 将在完成安全评估后开放」；上下文 1M，可輸入視訊、圖片、文字與檔案。
  - Hugging Face 的 `zai-org` 沒有新 repo。所有現役來源都還沒有 GLM-5.4 的列。
- **GPT-5.6 Cyber**：只出現在 CWE-bench 的新列，今天沒有找到 OpenAI 的官方模型頁，所以沒有登記，這列維持沒有身分。
- **其他**：
  - **MiniMax**：導覽列新增「MiniMax H3 Image」，是圖片模型，不在追蹤範圍。
  - **Fireworks SII（非現役）**：新增騰訊的 Hy4 Flash，現役來源沒有它的列。
  - **AA**：變更紀錄列出 Inkling 2 Small、Nemotron 3.5 Lightning、Muse Glimmer (High) 的效能（速度與價格）資料，三者都已有身分。
  - **Hugging Face**：facebook 的清單出現 SCALE4D 與兩個 MobileMoE 的 ExecuTorch 匯出檔，都不是新的通用文字模型。
- **廠商頁的非模型變化**：
  - **Anthropic**：11-23 公告 Claude Opus 4.5 將於 2027-01-22 從 API 退役。
  - **Google**：Gemini 4 Hydrogen 的 API 文件新增價目表（Standard 每百萬 token 輸入 $1.50／輸出 $7.50）。
  - **OpenAI**：新增兩篇研究文章與一篇資安合作公告，都不是模型發布。
  - **Mistral**：文件改版，沒有新模型。

## 現役來源

詳細列數與差異見 [刷新報告](../refresh/2026-11-26.md#來源變化)。

- **有數值變化**：
  - **AA**：
    - 指數 v5.0.1 → v5.0.2，前沿第 8／9、13／14 名互換。
    - GDPval-AA 167 筆 Elo 重算微調。
    - FrontierCode-AA 2.0 有 21 筆因重新評分而變動。
    - GLM-5.3-Flash 改名為「GLM-5.3-Flash (Max)」。
    - Qwen3 Coder Next 下架，Granite 4.2 30B／8B 不再有指數與 FrontierCode-AA 分數。
  - **Epoch**：`benchmarks.csv` 由 1,940 列增為 1,964 列，新模型 Qwen4-Max (xhigh) 有 13 列，其中 8 列是本站追蹤的 benchmark。Gemini 4 Neon 新增 FrontierMath-Erdos、MirrorCode、SpireClimb，SpireClimb 另有幾個 Gemini 4 模型的列更新，這些都不在追蹤範圍內。
  - **ARC Prize**：新增 Gemini 4 Neon 三個檔位（v2 Semi-Private 最高 93.75%，High 90.83%）。
  - **Scale**：
    - SWE Atlas Overall 新增 Gemini 4 Neon 72.01 與 Gemini 4 Hydrogen 71.98。
    - 其他非現役的 Scale 榜（HLE Diamond、DrugDiscoveryBench、AudioMultiChallenge、Professional Reasoning）也新增了 Gemini 4 系列的列。
  - **FrontierSWE**：新增 Muse Wonder（proximus）40.2%，排第 4。
  - **LiveBench**：新增 Inkling 2 Mini、Inkling 2 Small 的 2.0 成績。
  - **CWE-bench**：新增 `GPT-5.6 Cyber` 與 `MiniMax-M3.1-Flash (max)`。
  - **Vals**：新增 61 列，全為 `EXCLUDED`，其中包括 Vibe Code Bench v1.1.1。
- **只有中繼資料變化**：Zapier、ALE。
- **沒有變化**：DeepSWE、MaxxBench、BioBasicsBench、Surge 九榜、Terminal-Bench、GBENCH 與四個廠商發布來源。
  - GBENCH 的 112 個模型，Agentic Coding 名次與分數都沒有變。
  - Surge 各頁共用的「sudo L7」表中，Qwen 4 Max 由 15.6% 升為 22.8%，但這張表不是本站收錄的榜。
  - BioBasicsBench 頁面出現 11-24 的日期，但文章內容與數值不變，詳見刷新報告。

## 新 benchmark／版本與待查線索

| 線索                                                                                          | 今天的狀態                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AA Terminal-Bench 4.1**（已收錄）                                                           | AA v5.0.2 把指數裡的 Terminal-Bench 換成 4.1（同 66 題，改用新的驗證器），每個模型頁都有 `terminalBench41`。本站的 `terminal-bench-4-1` 目前只取自 Terminal-Bench 官方榜。使用者同日決定把 AA 加為 4.1 的第二來源，見[收錄報告](../refresh/2026-11-26-aa-tb41-frontierphysics.md)；AA 的 4.0 列照常保留（4.0 原本就不計分）。 |
| **AA FrontierPhysics**（已收錄）                                                              | AA 新增的獨立評測：BenchFlow 出題，9 個物理領域共 54 題私有題目，以 deterministic verifier 加三位 GPT-6 Luna 評審評分。目前 VIALS 頁有 19 個模型的分數（最高 Claude Fable 5.2 0.329）。使用者同日決定收錄，見[收錄報告](../refresh/2026-11-26-aa-tb41-frontierphysics.md)。                                                   |
| **Vals Vibe Code Bench v1.1.1**（版本跟隨）                                                   | v1.1（134 個模型）封存，改為 v1.1.1（51 個模型，11-21 更新）。依規則應跟隨新版，但需要修改 materializer 與品質政策，也會讓集合重排，所以另開後續工作處理；今天仍以 v1.1 計分。                                                                                                                                                |
| AA-Robotics-Sim v0.1                                                                          | AA 11-25 發表的研究預覽（模擬人形機器人），不採用。                                                                                                                                                                                                                                                                           |
| Vals Swarm Speed                                                                              | 11-23 新頁，目前只有 2 個模型，materializer 取不到這頁，不採用。                                                                                                                                                                                                                                                              |
| Fireworks SII（非現役）                                                                       | 新增 Enterprise Drift Bench（8090 出題，659 題），APEX Agents: Corporate Law 由 12 增為 26 個模型。它彙整的是其他主辦方的 benchmark，仍不採用。                                                                                                                                                                               |
| BenchLM                                                                                       | Coding 類新增 OpenHarmony Bench v1.2；它是綜合排名網站，不採用。                                                                                                                                                                                                                                                              |
| Terminal-Bench-Science                                                                        | README 的徵稿橫幅由「2.0，12-15 截止」改為「1.0，12-01 截止」。本站用的是 AA 的 v0.1 成績，不受影響。                                                                                                                                                                                                                         |
| SpireClimb、EBR-bench、MedChemBench、RollerCoasterTycoonBench、SEC-bench Pro、CursorBench 4.1 | 不變，見 [11-21 查核](2026-11-21-benchmark-update-check.md#新-benchmark版本與待查線索)。                                                                                                                                                                                                                                      |

## 證據與覆蓋限制

- 原始擷取、清單與差異筆記：`artifacts/research/2026-11-26-benchmark-check/web/`；新模型的官方頁：`web/evidence/`（SHA-256 記在 [JSON](2026-11-26-benchmark-update-check.json) 的 `officialEvidence`）。
- 11-24 到 11-26 的上網搜尋只找到彙整網站的線索（例如 11-24 的「S1 Fast／S1 Pro」），查不到廠商與官方頁，也沒有任何現役來源出現這些名稱，所以沒有後續處理。
- 廠商頁清單沿用固定 URL；不在清單上的廠商公告，只能從現役來源出現的新模型名稱回頭查找。今天現役來源出現的新名稱都已處理或記錄在上文。
