# 2026-11-14 benchmark 聯網查核

## 範圍與基準

- 比較基準是 2026-11-13 的查核（[報告](2026-11-13-benchmark-update-check.md)）及其保存的回應 `artifacts/research/2026-11-13-benchmark-check/web/`。
- 探索由 agy（Gemini 3.8 Flash）分兩路執行：受追蹤廠商（V）、主辦方與待查線索（L）。原始回應與 SHA-256 manifest 保存在 `artifacts/research/2026-11-14-benchmark-check/web/{V,L}/`，V 存 62 份、L 存 55 份。
- 「與 11/13 相同」只在 SHA-256 相符或引文比對成立時才寫。
- 來源資料的刷新結果見 [資料刷新報告](../refresh/2026-11-14.md)。

## 各廠商新模型

- **沒有新模型**。Anthropic、OpenAI、Google、Meta、xAI、DeepSeek、Moonshot、Qwen、Mistral、MiniMax、Zhipu、Thinking Machines、LG、Agnes 在 11/13 以後都沒有新的文字或推理模型、checkpoint 或 API 模型 ID。
- **Google**：DeepMind 11/13 發布「Opening the datasets behind our AI weather models」，是氣象資料集，不是模型。Gemini 4 Carbon／Argon 的限時價（「$2.00 through November 30, 2026. $4.00 starting December 1, 2026」）不變。
- **DeepSeek**：價目頁新增網路搜尋（US$0.75／千次）與檔案解析（US$0.225／千頁）的工具價格，模型 token 價格不變。
- **Anthropic**：模型總覽、價目與 release notes 的文字和 11/13 相同；最新仍是 Claude Fable 5.2／Mythos 5.2（11/09）。
- **Hugging Face**：13 個追蹤帳號的最新 8 個 repo 名稱與 11/13 完全相同。
- **被擋的頁面**：OpenAI 與 xAI 新聞頁仍回 403，改以 API 模型文件核對，模型 ID 集合與 11/13 相同。

## 現役來源

| 來源      | 11/13 以後的變化                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AA        | `/models` 741 個 profile（原 739）。**model 詳細頁的 AA-Briefcase 欄位只剩 `overall` Elo，不再提供 `rubricPassRate`**；評測頁仍有完整欄位，但只列 28 個 profile。changelog 11/13 新增 Gemini 4 Argon (Medium)、DeepSeek V4 Pro 0813 (High)。GDPval-AA 155 列小數位變動。 |
| MaxxBench | changelog 11/13「New model results」：新增 Claude Haiku 5.5 與 DeepSeek V4.1 Flash 1017（max）。資料頁 props 由 `trials` 改為 `completionData`，原 parser 無法讀取。仍沒有 Fable 5.2。                                                                                   |
| Vals      | 新增兩個 benchmark 頁：Financial Coaching Bench（28 列）與 Vibe Code Bench 1.1（8 列，OpenHands harness），未在採用清單。flash 寫 Vals「無變化」，與刷新結果不符，以刷新結果為準。                                                                                       |
| 其餘      | LiveBench、FrontierCode（資料 JSON 與 11/13 逐位元組相同）、DeepSWE、FrontierSWE、Scale SWE Atlas、Surge 八榜、Epoch、ARC Prize、Zapier、BioBasicsBench 與廠商發布來源沒有資料變化。                                                                                     |

## 新 benchmark／版本與待查線索

以下皆為研究候選，採用與計分政策由使用者決定。

- **Vals 新 benchmark**：Financial Coaching Bench、Vibe Code Bench 1.1。Gemini 4 Carbon 在 VCB 1.1 為 49.733、成本 US$57.92／task。
- **Scale 其他榜單**：39 個榜單沒有新增。HLE-Diamond 的 Fable 5.2 列 `version` 改為 `anthropic/claude-fable-5-2`、`maxScore` 由 77.3324 改為 77.456，分數不變。Humanity's Sixth Sense、DrugDiscoveryBench、HiL-Bench、Remote Labor Index 和 11/13 相同。
- **Terminal-Bench-Science**：首頁與 CITATION 與 11/13 逐位元組相同，仍無含模型列的公開榜單。README 任務數 93→96，版本仍為 v0.1.0。
- **Epoch 未對應檔案**：MirrorCode 的前沿列仍沒有 Fable 5.2 與 Carbon；Mystery Game Puzzles 已含兩者。
- **沒有變化**：WANDR、Into the Unknown（README SHA-256 相符）、BioBasicsBench（仍 403，GitHub 與 Hugging Face 搜尋皆無結果）。
- **新榜單**：沒有官方主辦方在 11/13 以後推出、含 Fable 5.2 或 Carbon 的新榜單。

## 證據與覆蓋限制

- **被擋的頁面**：OpenAI 與 xAI 新聞頁、Perplexity WANDR blog、OpenAI BioBasicsBench 頁都回 403。
- **AA API**：`/api/v2/data/llms/models` 仍回 HTTP 410。
- **沒有母體數**：FrontierSWE、Epoch、ARC、Zapier、Vals 的刷新命令不接受母體數，可見總數為 unknown。
- **Vals 只部分解析**：65 頁中 60 頁可解析。
