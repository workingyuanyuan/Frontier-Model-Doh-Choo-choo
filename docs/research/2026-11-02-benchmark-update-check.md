# 2026-11-02 模型 Benchmark 聯網查核

以commit`a121677e26fdbcf31b27793e4eb67241d244ace4`、產品`sha256:7c2be2ecb3d294acf3326c1d0423788ac1584bd503413ff8c2eecdd2bc84d99b`為匯入前基準，與[11/01紀錄](2026-11-01-benchmark-update-check.md)比較。現役來源用保存的匯入前快照逐欄比較；官方消息用11/01保存的原始回應核對。原始擷取位於`artifacts/research/2026-11-02-benchmark-check/`。

本次由來源刷新、官方探索與獨立抽查三個代理分工，主代理整合並完成release。來源時間、SHA-256及逐欄差異見[JSON](2026-11-02-benchmark-update-check.json)；產品與驗證結果見[刷新報告](../refresh/2026-11-02.md)。

現役來源更新：Vals的17筆Tax Agent／Finance Index／Legal Index／Vals Index成績重算，AA新增DeepSeek V4.1 Flash 1017 Non-reasoning任務成本並調降token單價。17筆Vals列依現行政策均為EXCLUDED；其中Vals Index仍用於外部指標與進階成本圖的分數配對。產品共有9517筆Evidence、860筆成本；預設11項共同測試與九集合的計分結果由獨立代理重算核對。

Epoch原始匯出的15筆MirrorCode撤回屬尚未對應benchmark的資料，實際物化的1466筆Epoch候選均通過對照。現役來源413份artifact全部通過SHA-256、大小與列引用核對。

## 逐來源17筆Vals分數

| 模型名稱                                | Benchmark       |   舊值 |   新值 |
| --------------------------------------- | --------------- | -----: | -----: |
| baseten/nemotron-3.5-super-vl-120b-a12b | finance-index   | 40.797 | 41.036 |
| google/gemini-4-carbon                  | finance-index   |  66.35 | 67.046 |
| mistralai/mistral-large-4-oss           | finance-index   | 56.182 | 56.977 |
| openai/gpt-6.1-terra                    | finance-index   | 52.864 | 53.319 |
| baseten/nemotron-3.5-super-vl-120b-a12b | legal-index     | 55.314 | 55.366 |
| google/gemini-4-carbon                  | legal-index     | 75.828 |  75.93 |
| kimi/kimi-k3.1-pro                      | legal-index     | 67.037 | 67.041 |
| mistralai/mistral-large-4-oss           | legal-index     | 67.679 | 67.838 |
| openai/gpt-6.1-terra                    | legal-index     | 58.638 | 58.757 |
| baseten/nemotron-3.5-super-vl-120b-a12b | tax-agent-bench | 10.551 | 11.554 |
| google/gemini-4-carbon                  | tax-agent-bench |  48.86 | 51.785 |
| mistralai/mistral-large-4-oss           | tax-agent-bench |  27.33 | 30.668 |
| openai/gpt-6.1-terra                    | tax-agent-bench | 15.166 | 17.081 |
| baseten/nemotron-3.5-super-vl-120b-a12b | vals-index      | 29.731 | 29.763 |
| google/gemini-4-carbon                  | vals-index      | 70.355 |  70.45 |
| mistralai/mistral-large-4-oss           | vals-index      | 56.418 | 56.527 |
| openai/gpt-6.1-terra                    | vals-index      | 60.473 | 60.536 |

來源頁標示10/30更新；本次首次比對到的時間為11/02，不將來源日期改寫為觀測日期。AA新增任務成本原值0.4254202455035728美元、token輸入／輸出0.45／1.8→0.30／1.20美元／百萬tokens，均附當前證據；該checkpoint的canonical身分尚未對應。

本次重新擷取 11/01 manifest 的 142 個 URL，另沿 Vals 官方目錄取得 Tax Agent Bench 與 Carbon 模型頁，共 **144 份回應：138 個 200、3 個 403、3 個 404**。逐請求原始 bytes、HTTP status、URL、觀測時間、大小及 SHA-256 分別在 `artifacts/research/2026-11-02-benchmark-check/web/manifest.json`、`vendors/manifest.json`，全部回讀驗證通過。

**實際 raw 比較基準為 11/01** `benchmark-web/manifest.json` 指向的已保存檔案。新增兩頁沒有同頁比較基準，記為首次讀取本頁，不據此推定今天才發生方法變動。10/31 的廠商候選方法筆記只用作研究累積，當前正文都另與 11/01 bytes 核對。

## 現役來源變動

### Vals Tax Agent Bench

[官方目錄](https://www.vals.ai/benchmarks)、[Mistral OSS 模型頁](https://www.vals.ai/models/mistralai_mistral-large-4-oss) 與 11/01 原文相比，出現：

| 項目                        | 11/01 保存值 | 11/02 當前值 |
| --------------------------- | -----------: | -----------: |
| Carbon Vals Index           |       70.36% |       70.45% |
| Mistral OSS Tax Agent Bench |       27.33% |       30.67% |
| Mistral OSS Finance Index   |       56.18% |       56.98% |
| Mistral OSS Legal Index     |       67.68% |       67.84% |
| Mistral OSS Vals Index      |       56.42% |       56.53% |

來源頁面標示更新日 **10/30**；這是本次相較 11/01 raw 首次觀察到的數值差異，不能當作 11/02 發布日期。

[Tax Agent Bench 當前原榜](https://www.vals.ai/benchmarks/tax_agent_bench) 明示：

| 模型                |   成績 | 每任務成本 | 每任務 tokens | 時間   |
| ------------------- | -----: | ---------: | ------------: | ------ |
| Gemini 4 Carbon     | 51.78% |      $6.34 |         2.82M | 34m46s |
| Mistral Large 4 OSS | 30.67% |      $0.50 |         1.31M | 17m03s |

[Carbon 模型頁](https://www.vals.ai/models/google_gemini-4-carbon) 的當前表格也是 51.78%，舊 10/28 launch-note 仍引用 48.86%；當前表格與歷史公告必須分開。兩個模型身分仍是先前 checkpoint、high effort；沒有新模型身分證據。

當前 Tax 方法：193 題私有 test set、五個 shared tools、三小時限制；final answer 由 GPT-5.4 依專家 rubric 評分並核對引用有效性，主 Accuracy 包含引用有效性調整。新增兩個 supplementary captures 無同頁 baseline，因此不宣稱方法今天改版。完整逐列匯入與差異由正式 Vals 刷新程序裁定。

### Epoch MirrorCode 移除列

[官方 run CSV](https://epoch.ai/data/benchmarks.csv) **1808 → 1793 列**，15 個 MirrorCode runs 被移除；**無新增列，所有存續列逐欄相同**。[官方 ZIP](https://epoch.ai/data/benchmark_data.zip) 的 `mirrorcode.csv` **30 → 15 列**，同一組移除。

移除模型包含 Astra、Sol6.1、Fable5.1、Sonnet5.5、Haiku5.5、Muse Wonder、Kimi K3、DeepSeek Pro0813 等。詳見 `epoch-run-diff.json`，保留完整原列、run ID、版本與時間。來源未發布可裁定原因的公告，本次不推測移除動機；這15筆屬未對應的MirrorCode資料；正式adapter已核對現行Epoch候選未流失。

ZIP 另外十個成員改變，逐欄只有 **Country 清單順序**，成績不變。ECI 成員與其餘 ZIP 成員均逐位元相同。逐成員 SHA-256、列數及差異欄位見 `epoch-zip-diff.json`。ECI 網頁僅把日期更新到 11/02。

### AA 推論表現 metadata

[AA High Mistral OSS](https://artificialanalysis.ai/models/mistral-large-4) 的輸出速度 **161.3 t/s → N/A**；[Preview](https://artificialanalysis.ai/models/mistral-large-4-preview) **127.0 → 166.5 t/s**、TTFT **1.72 → 1.47s**；[Carbon](https://artificialanalysis.ai/models/gemini-4-carbon) **84.6 → 92.1 t/s**、TTFT **118.58 → 140.41s**。模型概述與速度排名隨此改變。

首頁把既有的 **K2 Horizon 375B A23B** 改列第二快，並非本次新增模型列。AA changelog 與 intelligence 方法頁正文相同，沒有由這些頁面驗證到新模型或新計分方法。

## 目錄與官方模型發布

| 當前目錄         | 11/01 路徑數 | 本次路徑數 | 路徑新增／移除 |
| ---------------- | -----------: | ---------: | -------------- |
| AA evaluations   |           38 |         38 | 0／0           |
| Vals benchmarks  |           62 |         62 | 0／0           |
| Surge benchmarks |           13 |         13 | 0／0           |
| Scale 子榜       |           20 |         20 | 0／0           |

逐連結與原頁 SHA-256 見 `catalog-diff.json`。這僅涵蓋當前四個目錄；不是對各網站所有頁面的無更新保證。

16 個 HF 組織各最近八 repo 的 **ID 與 createdAt 全部相同**；下載數、按讚數與社群計數變化不作 checkpoint 發布依據。逐組明細見 `artifacts/research/2026-11-02-benchmark-check/vendors/hf-semantic-comparison.json`。

本次成功取得的廠商公告、release notes、模型卡及這 16 個 HF 目錄中，**沒有驗證到新的官方模型發布**。OpenAI changelog、Anthropic model-card 目錄、Google Carbon 公告、Qwen blog、DeepSeek 更新、Moonshot／Kimi、Mistral 公告與模型卡、Z.ai release notes 均有今天回應可核對。Anthropic newsroom 的標頭日期更新為 11/02，內文沒有新模型文章。

## 待查項目的重新觀察

| 項目                      | 本次證據與狀態                                                                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GPT-6 Rosalind            | [changelog](https://developers.openai.com/api/docs/changelog) 正文與 11/01 相同；Help 403、model-page 404。仍是「已定位」，完整 benchmark／方法／成本未取得。                                            |
| FrontierMemory v1.1       | [changelog](https://frontiermemory.com/changelog/) 逐位元相同，首頁與 blog 正文相同；仍是 10/29 的 750 trajectories、三次重跑版本。「已讀方法」，無今日改版證據。                                        |
| NVIDIA 1017 NVFP4         | [官方卡](https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4) 逐位元相同。量化 checkpoint 與 base 1017 分開，已讀方法。                                                                         |
| Mistral Preview／OSS      | 兩篇公告與 OSS README 相同，HF revision 仍 `f12dabdc0c1e99e7f7924461a6f308859b05af4d`。舊 Preview／10/29 OSS 的 source scoped alias 需求持續，不能因這次速度更新合併身分。                               |
| Immigration、CyberOffense | [Immigration](https://www.vals.ai/benchmarks/immigration)、[CyberOffense](https://www.vals.ai/benchmarks/cyber_offense) 可見正文相同，已有的 metric／工具／分類與來源採用問題仍待政策裁決。              |
| DualChem                  | [原文章](https://scale.com/blog/dualchem-evaluating-ai-models-dual-use-chemistry-risks) 與 PDF 逐位元相同；landing 404。600 題、33 模型、拒答分母及工具條件仍保留，不轉為一般能力分數。                  |
| SII 新 DAYJOB 三項        | [SII API](https://fireworks.ai/specialized-intelligence-index/api/index.json) 與三個榜頁逐位元相同，Accounting／Data Science／Law 沒有新增公開原主辦方頁面；整份 API 的相同也涵蓋既有六個 DAYJOB board。 |
| AA-PersonalityBench       | 文章與方法頁可見正文相同，評測頁 41 models；只輪換隨機範例。是既有 10/19 評測，沒有本次新推出證據。                                                                                                      |
| DeepSeek Cyber            | [官方首頁](https://www.deepseek.com/en/)、API updates、HF 最新八 repo 的已擷取內容仍沒有該 checkpoint；第三方 LLMGateway 本文相同。官方身分維持未驗證，不能模糊歸入 1017。                               |
| xAI watermarking          | [release notes](https://docs.x.ai/developers/release-notes) 與 [watermarking 文件](https://docs.x.ai/developers/advanced-api-usage/watermarking) 相同，仍是 11/07 生效的既有 API 行為公告。              |

## 廠商補充分數候選

`artifacts/research/2026-11-02-benchmark-check/vendors/supplemental-candidates.json` 保存七組既有候選的 exact URL、今天 SHA-256、score、version、effort、harness、attempts、fallback、cost unit 與後續條件，統一標為 **method-read／已讀方法**。沒有宣稱完成主辦方全部重疊列核對或已整合。

- **Mistral OSS**：FrontierCode2.0 19.7%、TB4 41%、Finch73.3%、BrowseComp84.5%、B3 attack resistance97.1%。需逐項補版本／effort／環境與 paired task costs；API token 單價不是任務成本。既有 Preview、OSS 及 specialized cyber variant 分開。
- **NVIDIA 1017 NVFP4**：GPQA92.93%、AA-LCR80.19%、SciCode57.32%、IFBench76.47%、MMMU-Pro78.73%、TB2.1 81.11%；既有 max／patched-vLLM／GB300／repeat 設定已讀，TB harness 與 paired costs 缺口持續。不能轉用到 base1017。
- **Kimi K3.1 Pro、Anthropic Opus5.5／Sonnet5.5／Fable5.1 卡、DeepSeek1017**：今天正文或 PDF bytes 與 11/01 相同。既有 TB4 harness／fallback、CursorBench3.2.0與4.0版本差異、模型 effort 與成本核對條件仍保留。

本次新增的 Vals Tax 當前逐列核對屬主辦方現役來源，交由正式 adapter 匯入，不混列為廠商自報候選。

## 覆蓋限制

xAI news 今天 **403**，11/01 曾為 200；本次不能稱已讀該頁，使用可取得的 release notes／HF 作有界補查。OpenAI news 與 Rosalind Help 也是 403，Rosalind／Terra Pro 模型頁與 DualChem landing 是 404。MiniMax news 只有前端 shell，Meta blog 仍受舊目錄涵蓋限制。

DeepMind 伺服器忽略 identity header 回傳 gzip；原始壓縮 bytes 保留，**解壓後正文與 11/01 相同**，沒有把二進位差異當內容改版。PDF 本次重新下載與核對雜湊，未對相同 PDF 宣稱新視覺方法查核。

完整來源與產品驗證由主流程完成，紀錄見刷新報告。
