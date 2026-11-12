# 2026-11-12 benchmark 聯網查核

## 範圍與基準

本次以 main `451118af12f9fffd42225176e77fb5131a4d0607`、匯入前產品 `sha256:f94f567f7df8384346ebb41ef473f36636edbf155bc9538ad46ed418864352da` 為比較對象；更新後產品為 `sha256:e813b439b73a8dd7f56e2c4875322446c994e90cfc7e1f626ffb53a5599e8ac4`。比較區間為 11/10 查核之後到 2026-11-12。原始資料與抓取紀錄保存在 `artifacts/research/2026-11-12-benchmark-check/`，結構化摘要見[同名 JSON](2026-11-12-benchmark-update-check.json)。資料更新的影響與審核事項見 [11 月 12 日刷新報告](../refresh/2026-11-12.md)。

分工：

- **來源刷新與語意差異**：Codex（gpt-6.1-sol），21 個刷新命令，結果在 `refresh/`。
- **廠商新模型探索**：agy（Gemini 3.8 Flash）一輪，保存 55 份回應（`web/V/`）。
- **評測主辦方與待追線索**：agy（Gemini 3.8 Flash）一輪，保存 62 份回應（`web/L/`）。
- **獨立抽查**：agy（Gemini 3.8 Flash），未參與匯入，結果在 `spot-check/`。

主代理逐一重算兩份探索 manifest 的 SHA-256：V 的 55 筆中 54 筆相符，缺的 1 筆是 MiniMax 國際站逾時、未產生檔案；L 的 62 筆全部相符。下文採用的探索結論都由主代理在原始檔中重新找到。

## 各廠商新模型

11/10 以後，受追蹤的 14 家廠商都沒有新的文字或推理模型。

- **Anthropic**：最新模型公告仍是 11/09 的 Claude Fable 5.2 與 Mythos 5.2。模型文件把 Amazon Bedrock ID 寫成 `global.anthropic.claude-fable-5-2`（11/10 保存版為 `anthropic.claude-fable-5-2`）；API ID `claude-fable-5-2`、價格 input US$8／output US$40 per MTok 不變。11/10 另有 IPO roadshow 公告，與模型無關。
- **MiniMax**：發布圖像模型 MiniMax H3 Image（`MiniMax-H3-Image`、`MiniMax-H3-Image-Highspeed`），Hugging Face 新增 `MiniMax-H3-Image` 與 `MiniMax-H3-Image-PE` 兩個 repo。屬圖像生成，不在看板範圍。
- **其他廠商**：OpenAI、Google、Meta、xAI、DeepSeek、Moonshot、Qwen、Mistral、Zhipu、Thinking Machines、LG、Agnes 的官方新聞或模型文件沒有 11/10 以後的新模型。Qwen blog 與 Agnes 首頁和 11/10 逐位元組相同。Hugging Face 各組織最新 8 個 repo 的名稱，除 MiniMax 外與 11/10 相同；`facebook` 組織 11/10 未保存，無法比較。

OpenAI 新聞頁與 xAI 新聞頁仍回 403，改以官方 API 模型文件核對。

## 現役來源

| 來源         | 11/10 以後的變化                                                                                                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AA           | `/models` 735 個 profile；新增 Apodex 1.1、Qwen3.8-Flash-Next、Solar Pro 4 成績（皆無 canonical 身分）；GDPval-AA 7 列小幅修訂。11/10 發布新評測 MKA（Multimodal Knowledge Agent），以 MKA Climb WSR 計分，頁面寫 Fable 5.2（Max）57% 第一。 |
| LiveBench    | 2026-11-06 版不變，新增 Gemini 4 Carbon。前端說明 Fable 5.2 只顯示 xhigh：「its max-effort run scored lower overall (84.2 at max against 84.9)」。                                                                                           |
| Epoch        | 新增 Gemini 4 Carbon 四項；ECI 重配 247 列（EXCLUDED）。                                                                                                                                                                                     |
| ARC Prize    | 新增 Gemini 4 Carbon 三檔 ARC-AGI-2。                                                                                                                                                                                                        |
| FrontierCode | 2.0 新增 Inkling 2 Small 六個設定，包含 `none`。                                                                                                                                                                                             |
| Vals         | 新增 Access to Justice（`a2j`），頁面寫「Compare 23 AI models on Access to Justice Benchmark. Updated 11/10/2026」，尚無 Fable 5.2。未核准，全部 EXCLUDED。                                                                                  |
| 其餘         | DeepSWE、MaxxBench、FrontierSWE、Zapier、Surge 八榜、BioBasicsBench 與 OpenAI／Anthropic 發布來源沒有資料變化；Fable 5.2 仍未出現在 Surge 與 MaxxBench。                                                                                     |

## 新 benchmark／版本與待查線索

以下皆為研究候選；採用與計分政策由使用者決定。

- **Scale SWE Atlas v1.1**：11/11 新增 Fable 5.2、Gemini 4 Carbon 與 Qwen 3.8 Max。Overall Fable 5.2 80.5（CI 4.8）第一、Gemini 4 Carbon 71.4；QnA Fable 5.2 83.9、Qwen 3.8 Max 81.5；Refactoring Fable 5.2 80；Test Writing Fable 5.1 78.9 第一、Fable 5.2 77.8。各頁 `createdAt` 為 2026-11-11T21:25 UTC。[榜單](https://scale.com/leaderboard/swe-atlas)
- **Scale 其他榜單**：11/11 新增 HLE-Diamond `claude-fable-5-2` 72.4（CI 2.68）、Humanity's Sixth Sense `Claude Fable 5.2 (max)` 59.5、HiL-Bench `Claude Fable 5.2 (*public set only)` 80，三者皆第一。Remote Labor Index 與 11/10 相同（Fable 5.2 41.3）。[Scale 榜單](https://scale.com/leaderboard)
- **AA MKA**：見上表，新評測，未整合。[評測頁](https://artificialanalysis.ai/evaluations/mka)
- **VIALS-AA**：AA 評測頁有排名，寫 Fable 5.2（Max）67% 第一、Gemini 4 Carbon（High）64%。此頁 11/08 起已在 AA 監測目錄（未整合），不是 11/10 以後才出現；11/10 查核寫「無公開排行榜」並不正確。資料集在 Hugging Face `Handshake-AI-Research/VIALS`。[評測頁](https://artificialanalysis.ai/evaluations/vials-aa)
- **Terminal-Bench-Science**：首頁與 11/10 逐位元組相同，仍無含模型列的公開榜單；README 任務數由 90 增為 91，版本仍是 0.1。
- **WANDR、Into the Unknown、MaxxBench**：README 或頁面與 11/10 逐位元組相同，沒有新榜單或新提交。
- **BioBasicsBench**：OpenAI 頁面仍回 403，GitHub 與 Hugging Face 都找不到鏡像。

## 證據與覆蓋限制

- 403：OpenAI 新聞與 BioBasicsBench 頁、xAI 新聞頁、Perplexity WANDR 部落格。MiniMax 國際站逾時，改用中國站與開發者文件。
- Epoch 與 ARC-AGI-2 的畫面分母仍未取得；Vals ClaimBench 畫面 20 列、parser 25 列；AA API 交叉驗證因無 API key 略過。
- 探索代理把 VIALS-AA 評測頁誤判為 11/10 以後才出現，主代理以監測紀錄更正。其餘採用的探索結論都已在原始檔中找到原文。
