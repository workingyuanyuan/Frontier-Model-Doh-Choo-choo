# 模型發布頁補充來源研究

研究日期：2026-10-04（Asia/Taipei）。目標是定位值得優先查核的官方發布頁與評測附件。表內 benchmark 是頁面可研究的項目；可補入的確切模型／檔位／分數數量，需逐列比對目前產品與主辦方證據後確定。

## 優先候選

| 優先序 | 模型／官方連結                                                                                                                                                                 | 已確認的參考價值                                                                                                                             | 後續查核重點                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 高     | [Grok 4.7](https://x.ai/news/grok-4-7)                                                                                                                                         | DeepSWE v1.1、CursorBench 4.0、Terminal-Bench 4.0、AA Briefcase、EEBench、Harvey Legal Agent、HealthBench Professional；有跨模型比較及成本圖 | DeepSWE 的星號明示 high，與主表 xhigh 不同；成本圖要取得精確座標與單位                                                                        |
| 高     | [MiMo-V2.6 Pro／Flash](https://mimo.mi.com/docs/en-US/news/latest/v2-6)                                                                                                        | DeepSWE v1.1、AA 指數及多種 agent 評測；正文提供 Pro／Flash 訓練前後 DeepSWE 結果                                                            | 區分最終發布 checkpoint 與訓練中結果；追查圖表、技術報告中的框架與設定                                                                        |
| 高     | [Muse Spark 1.3](https://research.meta.ai/blog/introducing-muse-spark-1-3) ＋ [評測方法 PDF](https://research.meta.ai/static/muse-spark-1-3-multimodal-evaluation-methodology) | 涵蓋 GDPval-AA、JobBench、OSWorld 2.0、DeepSearchQA、AutomationBench 與 coding；方法文件區分模型 effort 與資料取得方式                       | Meta 說明會從自測、主榜與廠商自報選取可比較的最高值；逐列識別原始來源。OSWorld 存在 08.08／06.24 版本與 partial／binary metric 差異           |
| 高     | [Kimi K3](https://www.kimi.com/en/blog/kimi-k3)                                                                                                                                | DeepSWE、FrontierSWE、Terminal-Bench 2.1、SWE-Marathon、PostTrainBench、GDPval-AA v2 等，附逐項來源註腳                                      | DeepSWE 自測使用 Kimi Code；註腳另報 mini-SWE-agent 主榜值 67.3。不同框架數值需保留各自 provenance；Fable 比較列帶 fallback                   |
| 高     | [GLM-5.3](https://z.ai/blog/glm-5.3)                                                                                                                                           | 搜尋索引可讀完整跨模型表：DeepSWE v1.1、AutomationBench v1.0.6、FrontierSWE、Terminal-Bench、CyberGym、HLE 等                                | 直接頁面讀取未取得正文，需以渲染頁／官方附件保存證據並逐列核對；表中 Fable 有 fallback 標記                                                   |
| 高     | [GLM-5.3-Flash](https://autoclaw.z.ai/blog/model/glm-5.3-flash/)                                                                                                               | 可直接讀取 DeepSWE v1.1、AutomationBench v1.0.6、Terminal-Bench 2.1、HLE with Tools、Chartography with Tools 等數值表                        | 補查 effort、harness 與官方主榜交集；索引與頁面所示發布日期相差一天，保存觀測日期與兩者差異                                                   |
| 高     | [DeepSeek 官方更新紀錄](https://api-docs.deepseek.com/updates/) ／ [V4.1 Flash 發布頁](https://api-docs.deepseek.com/news/news260910/)                                         | 更新紀錄可直接讀到 V4.1 Flash、V4 Pro 正式版與 V4 Flash 各自的 DeepSWE、AutomationBench、Terminal-Bench 等數值                               | V4.1 發布頁直接讀取失敗，使用已讀到的官方更新紀錄定位。舊 API alias 已轉向 V4.1，需核對 checkpoint；AutomationBench Public 與其他版本分開驗證 |
| 中高   | [GPT-5.6 家族正式發布頁](https://openai.com/index/gpt-5-6/)                                                                                                                    | Sol／Terra／Luna 的 DeepSWE v1.1、Terminal-Bench 2.1 與 AA Coding Index；適合補歷代成本曲線與跨模型比較                                      | 取得互動圖表原始值、effort、版本和 cost 單位；辨識文章內的價格更新時間                                                                        |

## 延伸候選與核對入口

| 模型／官方連結                                                                                                                                                                            | 用途與查核條件                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Qwen3.8-Max 官方公告](https://www.alibabacloud.com/en/press-room/alibaba-unveils-qwen3-8-max) ＋ [0902 更新公告](https://docs.qwencloud.com/changelog/model-updates/qwen3.8-max-upgrade) | 已確認發布與 checkpoint 更新；先將初版、0902、open weights 分清楚，再找精確 benchmark 表。更新公告明示 API alias 於 9 月 5 日切至 0902                      |
| [Qwen3.8-Omni-Flash](https://qwen.ai/blog?id=qwen3.8-omni-flash)                                                                                                                          | 搜尋索引包含 DeepSWE 1.1 與跨模型多模態評測。直接頁面未取得正文，索引標有 draft；需確認正式發布狀態與渲染證據後評估                                         |
| [MiniMax M3](https://www.minimax.io/blog/minimax-m3)                                                                                                                                      | SWE-bench、Terminal-Bench 2.1、SWE Atlas、NL2Repo、LiveSQLBench 等。註腳清楚區分引用官方分數和內部執行，適合追溯來源；逐項核對 harness 與 attempts          |
| [Claude Opus 5](https://www.anthropic.com/news/claude-opus-5)                                                                                                                             | 有 Frontier-Bench v0.1、CursorBench 3.2 的成本／effort 曲線。內部 Frontier-Bench 平均五次，Opus 5／Fable 5 有 Opus 4.8 fallback；版本與混合模型設定須分清楚 |
| [Gemini 4 Argon 英文原始公告](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/)                                                                    | 可與先前提供的繁中頁共同核對：DeepSWE v1.1、AutomationBench、Vals、Harvey、LVBench、CWE-bench v1。屬同一發布來源的語言版本，使用同一來源血緣                |
| [Step 5 Preview 官方入口](https://platform.stepfun.com/)                                                                                                                                  | 本地 AA 清單已出現此模型，官方索引可確認產品存在；目前只定位入口，下一階段需沿官方連結取得發布頁與 benchmark 原始表                                         |

## 跨來源可比性的研究結果

供應商發布頁的確值得作為資料探索與補充入口，但採用判斷需落到每個 benchmark／配置。以下是已讀到的具體方法差異：

- Kimi K3 的 [DeepSWE 註腳](https://www.kimi.com/en/blog/kimi-k3) 明示自家 Kimi Code 與主榜 mini-SWE-agent；模型相同仍可能因 harness 產生不同值。
- [GLM-5.2 發布頁](https://z.ai/blog/glm-5.2) 的官方搜尋索引明示 FrontierSWE 由 Proximal、PostTrainBench 由其主辦方、SWE-Marathon 由 Abundant AI 執行。這類逐項註腳可支持「主辦方執行」；實際採用仍須保存頁面證據。
- [Meta 方法 PDF](https://research.meta.ai/static/muse-spark-1-3-multimodal-evaluation-methodology) 混用自測與引用；相同數值可能來自轉載。交叉比對時保存原始執行者與發布者，避免將轉載視為獨立重複驗證。
- [MiniMax 方法註腳](https://www.minimax.io/blog/minimax-m3) 將同一張比較表中的官方榜單成績與內部 API 實測分開說明，可作逐列來源分類依據。

因此將「定位官方頁」「取得設定」「對照重疊列」「確認可補缺口」分成可追蹤狀態。分數一致是數值核對結果，執行者、資料版本及環境則各自需要證據。

## 專案缺口與後續研究排序

本地 `data/product/current.json` 與來源候選盤點確認 GPT-6 Luna 缺少 DeepSWE。發布頁擷取目前定位 GPT-6.1 Sol 與 Claude Opus 5.5 兩篇文章；來源變更監測對這兩個來源屬快照比較。

下一階段先以使用者提供的 GPT-6 Sol／Luna 頁面查核 Luna 缺口，再依當期前沿模型缺項與上述高優先候選安排逐 benchmark 驗證。模型身分須涵蓋正式型號、日期 checkpoint、effort 及 fallback；同篇文章的競品列也可成為補缺候選。成本圖同步取得同配置的任務美元成本。

日常資料收集的主動探索步驟已寫入 [操作手冊](../OPERATIONS.md#主動尋找補充來源)。本研究表的狀態為候選定位與方法初查；逐列採用結論由後續 source evidence／cross-check 記錄承接。
