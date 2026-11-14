# 2026-11-13 benchmark 聯網查核

## 範圍與基準

- 比較基準是 2026-11-12 的查核（[報告](2026-11-12-benchmark-update-check.md)）及其保存的回應 `artifacts/research/2026-11-12-benchmark-check/web/`。
- 探索由 agy（Gemini 3.8 Flash）分兩路執行：受追蹤廠商（V）、主辦方與待查線索（L）。原始回應與 SHA-256 manifest 保存在 `artifacts/research/2026-11-13-benchmark-check/web/{V,L}/`，V 存 61 份、L 存 55 份。
- 「與 11/12 相同」只在 SHA-256 相符或引文比對成立時才寫。
- 主代理從保存檔重新核對了 Gemini 4 Hydrogen 的發布日期、價格、檔位與 context window，以及 Gemini 4 Carbon／Argon 的限時價格。
- 來源資料的刷新結果見 [資料刷新報告](../refresh/2026-11-13.md)。

## 各廠商新模型

- **Google：Gemini 4 Hydrogen（`gemini-4-hydrogen`）**，Google blog 發布日期為「Nov 12, 2026」。
  - 價格：input US$1.50、output US$7.50 per MTok，「priced flat across its entire 1 million-token context window」。
  - Context window 1,048,576；max output 65,536，long decode 可達 1,048,576。
  - Thinking 檔位：low、medium、high、xhigh。
  - 發布文寫：AA Intelligence Index 在預設 high 為 51（Argon 為 50），xhigh 達 54。
  - DeepMind model card 另有與 Claude Sonnet 5.5、GPT-6.1 Terra 的比較表（MKA、Chartography、HLE-Diamond 等）。
  - [發布文](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)、[API 文件](https://ai.google.dev/gemini-api/docs/models/gemini-4-hydrogen)
- **Google 價格**：Gemini 4 Carbon 與 Argon 的 API 價目現為「$2.00 through November 30, 2026. $4.00 starting December 1, 2026」（output $10.00，12/01 起 $20.00）。這是限時價，AA 已改用。[價目頁](https://ai.google.dev/pricing)
- **Anthropic**：沒有新模型。
  - 11/12 release notes 新增 self-hosted Claude Managed Agents，屬基礎設施，不是模型。
  - 模型總覽與價目頁內容和 11/12 相同。
- **Meta**：沒有新文字模型。Hugging Face `facebook` 新增 `meta-encoder-v1`，是 embedding 模型，不在看板範圍。
- **Thinking Machines**：Hugging Face 新列出 `Inkling-2-Small` 與 `Inkling-2-Small-MXFP8`（createdAt 2026-11-04），模型早已發布。
- **其他廠商**：OpenAI、xAI、DeepSeek、Moonshot、Qwen、Mistral、MiniMax、Zhipu、LG、Agnes 沒有 11/12 以後的新模型。
  - DeepSeek 價目、Qwen blog、Mistral news、Agnes 首頁與 11/12 逐位元組相同。
  - OpenAI 與 xAI 新聞頁仍回 403，改以 API 模型文件核對。
- **未採用的探索說法**：flash 寫 xAI 文件「只列 Grok 3 系列」。這和既有來源的 Grok 4.7 列不符，判定為擷取不完整，不作結論。

## 現役來源

| 來源         | 11/12 以後的變化                                                                                                                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AA           | `/models` 739 個 profile（原 735）。新增 Gemini 4 Hydrogen 四檔，各 9～10 項。新增 3 筆 CritPt。K-EXAONE 2.0 的 slug 由 `k-exaone-2-0-0803` 改為 `k-exaone-2-0`，舊頁 404，新 slug 不在任何評測頁，17 列消失。Carbon 與 Argon 價格與任務成本下降。 |
| FrontierCode | 11/11 changelog：修正作弊掃描器後「All results are rescored」，2.0 共 96 列移動 −0.64～+2.58 分。新增 Gemini 4 Hydrogen 四檔。Gemini 4 Carbon 的 harness 由 devin-cli 改為 antigravity-cli，分數重測。                                             |
| LiveBench    | 2026-11-06 版不變，新增 `gemini-4-hydrogen`（xhigh）7 項。                                                                                                                                                                                         |
| Vals         | 新增 `google/gemini-4-hydrogen`（xhigh）10 項。Vals news 11/12：「Google's Gemini 4 Hydrogen is #1 on Tax Agent Bench」。                                                                                                                          |
| Zapier       | 新增 Gemini 4 Hydrogen（High／Medium／Low）。                                                                                                                                                                                                      |
| FrontierSWE  | 新增 Gemini 4 Hydrogen 一列。                                                                                                                                                                                                                      |
| Epoch        | 新增 3 筆 GPQA Diamond（Claude Fable 5、Fable 5.2、Opus 5.5，皆 max）。                                                                                                                                                                            |
| 其餘         | DeepSWE、MaxxBench、Scale SWE Atlas、ARC Prize、Surge 八榜、BioBasicsBench 與廠商發布來源沒有資料變化。                                                                                                                                            |

## 新 benchmark／版本與待查線索

以下皆為研究候選，採用與計分政策由使用者決定。

- **Scale 其他榜單**：
  - Humanity's Sixth Sense 新增 `Gemini 4 Carbon (high)` 71.1，排第一（createdAt 2026-11-12）。
  - DrugDiscoveryBench 新增 `Gemini 4 Carbon (mini-swe-agent) high` 71.5（第一），以及 `Kimi K3p1 Pro (mini-swe-agent) xhigh` 63.4。
  - HLE-Diamond 與 HiL-Bench 和 11/12 相同。
  - Remote Labor Index 的 Fable 5.2 原始值精度由 41.3 改為 41.25。
- **VIALS-AA**：21 個模型的排名不變（Fable 5.2 Max 67.1% 第一、Gemini 4 Carbon High 64.0%）。AA 方法頁：
  - 「Standalone evaluation (not part of Artificial Analysis Intelligence Index v5.0.1)」；
  - 161 tasks，每題 3 次，Stirrup harness，最多 100 turns。
- **Terminal-Bench-Science**：首頁與 11/12 逐位元組相同，仍沒有含模型列的公開榜單。README 任務數由 91 增為 93，版本仍為 v0.1.0。
- **Epoch 未對應的兩個檔案**：
  - `mirrorcode.csv`：MirrorCode，與 METR 合作的長程程式碼 benchmark，2026 年 8 月推出，30 tasks，每題 3 次。
  - `mystery_game_puzzles.csv`：Mystery Game Puzzles，2026 年 7 月推出，100 題，task version 1.2.1。
  - 兩者都有 Fable 5.2 或 Opus 5.5 等前沿列，目前未整合。
- **沒有變化**：WANDR、Into the Unknown、MaxxBench（仍無 Fable 5.2）與 BioBasicsBench（仍為 403，找不到鏡像）。
- **新榜單**：沒有官方主辦方在 11/12 以後推出、含 Fable 5.2 或 Carbon 的新榜單。

## 證據與覆蓋限制

- **被擋的頁面**：OpenAI 與 xAI 新聞頁、Perplexity WANDR blog、OpenAI BioBasicsBench 頁都回 403。
- **AA API**：`/api/v2/data/llms/models` 回 HTTP 410，看起來已停用，頁面管道照常完成。
- **沒有母體數**：FrontierSWE、Epoch、ARC、Zapier、Vals 的刷新命令不接受母體數，可見總數為 unknown。
- **Vals 只部分解析**：63 頁中 58 頁可解析。
