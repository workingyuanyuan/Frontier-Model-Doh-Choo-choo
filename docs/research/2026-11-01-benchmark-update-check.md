# 2026-11-01 模型 Benchmark 聯網查核

本次以 `fa31255`（PR #31 合併後）、產品 `sha256:109e74ccd710f69cfa565134ff91365bee68805bd605d9778e3c261879799f4b` 為基準，和 [10/31 查核](2026-10-31-benchmark-update-check.md)比較。分工如下：

- **來源刷新與語意差異**：Codex（gpt-6.1-sol）執行。
- **上游消息探索**：agy（Gemini 4 Argon）執行，142 份原始回應與 SHA-256 保存在 `artifacts/research/2026-11-01-benchmark-check/benchmark-web/`。
- **核對與整合**：主代理負責。

逐來源雜湊見[同名 JSON](2026-11-01-benchmark-update-check.json)。

**結論：現役來源沒有實質變化，產品內容不變**；release 重建的產品只有 `generatedAt` 不同，版本因此更新為 `sha256:7c2be2ec…d99b`。 刷新只改了 metadata，所以 `data/sources` 維持 10/31 的已提交快照。但因為本次已重新物化過現役來源，仍依 [AGENTS.md](../../AGENTS.md) 執行 `pnpm data:release`，並寫了[刷新報告](../refresh/2026-11-01.md)，附 21 個來源的獨立抽查。上游只有三項與計分無關的小更新：Surge 部落格改標題、xAI 新增浮水印文件、Epoch 匯出的 metadata。

## 現役來源

18 個線上刷新命令與離線的 `materialize:effort-reports` 都 exit 0。渲染計數與 10/31 相同：

| 來源         | 計數                                         |
| ------------ | -------------------------------------------- |
| AA           | `/models` 719                                |
| LiveBench    | 2.0 為 32；1.0 Include finetunes 為 65       |
| DeepSWE      | 28                                           |
| FrontierCode | 2.0 Best 26、All 101；Top 10 10/10；hidden 0 |
| Surge 八榜   | 42／44／50／44／38／38／16／20               |

語意差異涵蓋全部 21 個來源的 candidates、costs 與 manifest 語意欄位，結果 **21/21 `contentChanged: false`**：

- 沒有新增或移除模型、profile。
- 分數、成本、benchmark、版本、指標、harness 都沒有變動。
- 未解析名稱也沒有增減。

工作區的實際變更只有 metadata，已存成 `refresh/metadata-only.diff` 後還原：

- 擷取時間 `retrievedAt`、`observedAt`。
- Cursor 證據的 artifact 雜湊，即 anthropic-releases／openai-releases 的 `cross-checks.json`；分數與比對結果相同。
- `artificial-analysis/evidence-index.json` 中過時的 `materializedEvaluationProfiles` 219→220，10/31 的產品已是 220 個 profile。

全來源監測沒有新增注意項，從 74 降為 66：10/31 那 8 則 Carbon／ECI 覆蓋流失的通知，在今天的穩定比較中已不再出現。413 份證據的 SHA-256 與列引用都通過。Vals 仍有五頁無法解析：cyber_offense、inference_provider、mental-health、rsi_index、vals_router_index。

## 上游消息

| 項目                                                                                    | 內容                                                                                                                                                             | 影響                                        |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [Surge Antidote 文章](https://surgehq.ai/blog/introducing-antidote)                     | 標題改為 “Antidote Leaderboard: Optimizing for Long-Term You”，顯示日期 10/22 → 10/31。Antidote 榜 10/31 就已在 Surge 目錄中；它是專家評分的 Elo，不是現役來源。 | 無；追蹤的八個 Surge 榜與目錄頁逐位元相同。 |
| [xAI Output Watermarking](https://docs.x.ai/developers/advanced-api-usage/watermarking) | 新文件：自 2026-11-07 起，grok-4.7／4.6／4.5／4.3／4.20 系列 API 回應預設加入隱形浮水印（回應標頭 `x-watermark: true`）。                                        | 無；不是新模型。                            |
| Epoch `benchmark_data.zip`                                                              | 檔案雜湊改變，原因是 README 的 BibTeX month 由 10 改為 11，以及 `model_metadata.csv` 清除 "API access" 字串；各 benchmark 成績 CSV（含 ECI）逐位元相同。         | 無；刷新的語意差異也確認 Epoch 不變。       |

所有追蹤廠商都沒有新模型或 checkpoint，涵蓋 OpenAI、Anthropic、Google、Meta、xAI、DeepSeek、Moonshot、Qwen、Mistral、MiniMax、Zhipu。16 個 HF 組織的最近八個 repo（`id`、`createdAt`）都和 10/31 相同，其中 13 個只有下載數與按讚數不同。

## 10/31 待查線索

除了 OpenAI 的兩頁，以下各項今天的原始回應都已保存；「相同」指與 10/31 manifest 的 SHA-256 或可見文字相同。

| 線索                                     | 今日狀態                                                                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| GPT-6 Rosalind                           | changelog 可見文字相同；Help 頁仍 403，模型頁仍 404。方法、benchmark 與成本仍缺。                                                |
| NVIDIA DeepSeek 1017 NVFP4               | 模型卡逐位元相同。                                                                                                               |
| FrontierMemory v1.1                      | changelog 逐位元相同；首頁與部落格的可見文字相同。                                                                               |
| DataCenterBench                          | 逐位元相同。                                                                                                                     |
| AA-PersonalityBench                      | 文章與方法頁逐位元相同；評測頁只輪換隨機範例，41 個模型不變。                                                                    |
| Vals Immigration、CyberOffense           | 兩頁都逐位元相同；仍未核准計分。                                                                                                 |
| Scale DualChem                           | 文章與 PDF 逐位元相同；論文 landing page 仍 404。                                                                                |
| SII DAYJOB Accounting／Data Science／Law | API 與三榜頁逐位元相同。                                                                                                         |
| DeepSeek V4.1 Flash Cyber                | 官方頁仍未提及；第三方頁只改了側欄價格。維持未驗證。                                                                             |
| 廠商補充分數候選                         | Mistral、Anthropic 三張卡、DeepSeek 1017、Gemini 4 Argon 卡與安全報告逐位元相同；Mistral 公告、Kimi、Carbon 公告的可見文字相同。 |

上述新 benchmark 的計分政策仍由使用者決定，本次沒有新增需要裁決的項目。

## 證據與覆蓋限制

- `artifacts/research/2026-11-01-benchmark-check/`：
  - `refresh/`：各來源 log、`summary.md`、`semantic-diff.json`、`metadata-only.diff`、`independent-unresolved.md`、`monitoring-diff.json`。
  - `rendered/`：渲染計數。
  - `benchmark-web/`：`agy-discovery.md`、`manifest.json` 與 `raw/` 下 142 份回應（137 份 200、2 份 403、3 份 404）。
- agy 的「與 10/31 相同」結論以 10/31 的 `web/manifest.json` 為比較基準。主代理抽核了 3 份雜湊（Vals Immigration、DualChem PDF、FrontierMemory changelog），都和 10/31 manifest 相符；其餘結論未逐一重算。
- 受阻頁面：OpenAI news 與 GPT-6 Rosalind Help 頁回 403；DualChem landing page、`gpt-6-rosalind` 與 `gpt-6.1-terra-pro` 模型頁回 404。Meta 部落格要用 curl 的 User-Agent 才能取得；MiniMax news 只回傳前端殼頁。
- HF 只比較各組織最近八個 repo；公告探索限定官方目錄與相關連結，不把範圍外的未知狀態當作「沒有更新」。
