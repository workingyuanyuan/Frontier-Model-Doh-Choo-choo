# 2026-11-21 benchmark 聯網查核

今天 16 個現役來源的成績或成本有變化。結果已匯入，依 `pnpm data:release` 重建產品，資料更新見 [刷新報告](../refresh/2026-11-21.md)。

本次重點：

- **新模型 Inkling 2 Mini**：Thinking Machines 於 11-20 發布，已依官方公告登記身分。
- **Scale SWE Atlas 改了模型標籤格式**：已修正 parser，各列的檔位從推測值改為來源明示值。
- **新 benchmark 線索**：Vals 的 RollerCoasterTycoonBench、OpenAI 的 MedChemBench、Epoch 的 SpireClimb 三項只列為線索，沒有收錄。

## 範圍與基準

- **起始狀態**：起始 commit `96c7ac2018e9a2b312403323058f02d1c0208be4`，工作區乾淨。
- **比較基準**：比較對象是 11-19 的擷取與 `data/product/current.json`（`sha256:33be42322e75773597c19754201a36e463c8701cb79b561835b172b1616b104b`）。
- **擷取方式**：沿用 11-19 的 URL 清單，含廠商頁 62 個與 benchmark 主辦方及線索頁 55 個。擷取時間為 2026-11-21 08:39 UTC，每頁存 SHA-256；與 11-19 相比，內容雜湊改變的有廠商頁 59 個、主辦方頁 42 個。
  - 原始檔與清單：`artifacts/research/2026-11-21-benchmark-check/web/{V,L}/`。
  - 逐頁差異：由 agy（Gemini 4 Hydrogen High）比對 11-19 與今天的可見文字，結果在 `web/discovery-notes.md`。其中的新模型與新 benchmark 都已用原始檔或官方頁面重新核對。
- **無法取得的頁面**：`ai.meta.com/blog/` 回 400，Perplexity WANDR 回 403，LiveBench 的舊 bundle 回 503。這三頁 11-19 也同樣取不到。
- **只換建置雜湊的頁面**：Anthropic、Google、Claude 文件等頁面的變動只是建置雜湊或 nonce，沒有可見內容改變。

## 各廠商新模型

| 廠商              | 模型                                                                  | 證據                                                                                                                                                                                                          | 處理                                                                                                                                                                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thinking Machines | **Inkling 2 Mini**                                                    | [官方公告](https://thinkingmachines.ai/news/inkling-2-mini/)（Nov 20, 2026，SHA-256 `a6ea0b1a…`）；Hugging Face 有 `thinkingmachines/Inkling-2-Mini`。公告寫明它是 26.4B 總參數、3.4B 活躍參數的 looped MoE。 | **已登記** `thinking-machines-inkling-2-mini`。Vals 的 [Inkling 2 Mini 模型頁](https://www.vals.ai/models/thinkingmachines_inkling-2-mini) 選用內部代號 `thinkingmachines/inkling-mini-1117`，頁上的 Vals Index `46.46%` 與公告的「46.5%」一致，因此列為精確 alias。AA Intelligence Index `20`，不在前沿。 |
| Thinking Machines | `TML-d24-varloop-research`                                            | Hugging Face 新 repo（11-18 建立），公告中稱之為研究用的 variable-loop 變體。                                                                                                                                 | 不登記：沒有出現在任何現役來源。                                                                                                                                                                                                                                                                           |
| StepFun           | Step 5 Preview                                                        | MaxxBench 11-19 新增評測（DeepSWE `67.7%`、MaxxBench `42.7%`）；AA 匯入前就有這個模型（Intelligence Index `28.5`）。                                                                                          | 不登記：這次沒有查官方公告，也不在前沿範圍。                                                                                                                                                                                                                                                               |
| decision（Vals）  | `decision/bison-1`、`decision/groundhog-1`                            | Vals ClaimBench 與 RollerCoasterTycoonBench 的新列。                                                                                                                                                          | 不登記：是 decision 模型，不是對話或推理語言模型。                                                                                                                                                                                                                                                         |
| Anthropic         | Claude Opus 5.5 (CVP)                                                 | Vals 新聞「Inkling 2 Mini ties Claude Opus 5.5 (CVP) on CyberBench」。CVP 是 Anthropic 的 Cyber Verification Program。                                                                                        | 視為廠商的模型設定，不對應（依既有決定）。                                                                                                                                                                                                                                                                 |
| OpenAI            | `gpt-5.6-sol-parallel-advanced`／`-fast`                              | Vals 新列。                                                                                                                                                                                                   | 視為模型設定，不對應。                                                                                                                                                                                                                                                                                     |
| 其他              | GPT-Live-1.1（語音）、Agnes Sys1（決策模型）、Genie 4 API（世界模型） | OpenAI 模型文件、Agnes 價格頁、Google 部落格。                                                                                                                                                                | 不在範圍內。                                                                                                                                                                                                                                                                                               |

## 現役來源

詳細列數與差異見 [刷新報告](../refresh/2026-11-21.md#來源變化)。

- **有變化**：AA、LiveBench、MaxxBench、Scale SWE Atlas、FrontierSWE、Surge 八榜（Chartography、ComplexConstraints、CoreCraft、Finance、Healthcare、Tax、Law、GDP.xlsx）、Epoch、ARC Prize、Vals。
- **Scale SWE Atlas 標籤改版**：Overall 的模型標籤由 `Opus 5.5` 改為 `Claude Opus 5.5 (Claude Code) max`。分數、名次與 `createdAt` 都不變。parser 改為拆出模型名稱、harness 與檔位，並補上 5 個 GPT 名稱的精確 alias（例如 `GPT 6.2 Sol`）。
- **MaxxBench 版面改版**：列上的按鈕標籤改為「View … model report」。parser 同時接受新舊標籤，身分、檔位與分數的核對不變。MaxxBench 也把 `DeepSeek V4 Flash` 改名為 `DeepSeek V4 Flash 0731`，模型目錄已有這個 alias。
- **沒有變化**：DeepSWE、FrontierCode、Surge Riemann、Zapier、ALE、BioBasicsBench、CWE-bench、Terminal-Bench 與四個廠商發布來源。

## 新 benchmark／版本與待查線索

| 線索                                            | 證據                                                                                                                       | 判斷                                                                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Vals **RollerCoasterTycoonBench**（`rctbench`） | Vals 新聞（11-19）「Introducing RollerCoasterTycoonBench: Can Decision Models Manage a Theme Park?」；Games 類，9 個模型。 | 已收進 Vals 候選但不計分（尚未核准）。受測對象是 decision 模型，與本站比較的語言模型不同，不建議收錄。           |
| OpenAI **MedChemBench**                         | OpenAI 新聞（11-20）「MedChemBench: Benchmarking AI for medicinal chemistry」。                                            | 廠商發表的新 benchmark。要等有主辦方榜單或跨模型的成績才評估。                                                   |
| Epoch **SpireClimb**                            | `benchmarks.csv` 新增 Slay the Spire 1／2 兩項，目前只有 Kimi K3.1 Pro（`0.0`）。                                          | 只有一個模型，觀察。                                                                                             |
| BenchLM BenchAlign v6.0                         | BenchLM 首頁：權重改為 6 個核心類別。                                                                                      | 綜合排名網站，不是主辦方來源，不採用。                                                                           |
| 先前的線索                                      | SEC-bench Pro、CursorBench 4.1                                                                                             | 狀態不變，見 [11-19 查核](2026-11-19-benchmark-update-check.md#後續gemini-4-neon-公告圖表的逐項查證2026-11-21)。 |

## 證據與覆蓋限制

- 原始擷取、清單與差異筆記：`artifacts/research/2026-11-21-benchmark-check/web/`；Inkling 2 Mini 的公告與 Vals 模型頁另存於 `web/inkling/`。
- 逐欄差異、來源時間與 SHA-256 見 [JSON](2026-11-21-benchmark-update-check.json)。
- 廠商頁清單沿用固定 URL；不在清單上的廠商公告，只能從現役來源出現的新模型名稱回頭查找。
