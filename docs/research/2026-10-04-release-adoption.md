# 模型發布頁採用查核

核驗日：2026-10-04。供應商資料保留 VENDOR 角色，主辦方資料優先；每個分數保留自己的模型、effort、版本與證據。原始頁與方法附件保存在 `data/research/release-evidence-index.json`。

## 採用來源

| 來源                                                                                                    | 接入內容                                                                       | 查核                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenAI                                                                                                  | GPT-6.1 Sol、GPT-6 Sol/Luna、GPT-6 Astra、GPT-5.6 家族的逐 effort 圖表         | 每頁独立 capture 與時間，分數和美元任務成本配對；歷史衝突逐列排除。詳見 [OpenAI](openai-release-expansion.md)                                                                 |
| Anthropic                                                                                               | Opus 5.5、Sonnet 5.5 的 FrontierCode 1.1 Main、CursorBench 4.0                 | Fable/Mythos 5.1 與 Opus 5 的其他圖表亦完成研究。詳見 [Anthropic](anthropic-release-expansion.md)                                                                             |
| [xAI Grok 4.7](https://x.ai/news/grok-4-7)                                                              | CursorBench 4.0 的 43 組分數／USD task 成本，及 Grok 4.7 high 的 DeepSWE 71.0% | 16 組 CursorBench 數值與保存的主辦方快照相符；Muse minimal 與 low 同時存在，minimal 保留排除，避免產品映射合併。DeepSWE 星號指定 high                                         |
| [Google Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) | DeepSWE v1.1 77.9%                                                             | [方法 PDF](https://deepmind.google/models/evals-methodology/gemini-4-argon) 明示自測 mini-swe-agent；highest thinking 未提供字面 effort，原始欄位保持空值，由產品既有規則推定 |

## Google 逐項結論

[Gemini 3.8 Flash/Cyber](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/) 原圖和[方法文件](https://deepmind.google/models/evals-methodology/gemini-3-8-flash)確認 DeepSWE 73.7、Finance Agent v2 61.4、Harvey 10.0、Terminal-Bench 2.1 89.4、4.0 19.1。DeepSWE high 自测与当前主榜 high 73.825503 有差異，保存主榜。Finance 與 Harvey 能對應現有 Vals 值；Terminal-Bench 需區分 harness 與主榜來源。OSWorld 是 08.08 patch 前 partial score、三次取最大，不能與新版本直接混用。

Argon AutomationBench 51.3 與現有主榜 51.29 四捨五入相符；方法明示 private set、主辦方來源。Vals、Riemann、Chartography、FrontierSWE 引用主辦方，保留原始上游。PostTrainBench 45.3 使用 OpenCode、H100、10 小時；OSWorld 69.2 僅 offline subset；CWE-bench v1 68 與 Flash Cyber v0 47.2 分版本。這些項目列入擴充研究，需建立對應版本及設定後採用。

## 其他推出頁

| 頁面                                                             | 查核結論／採用條件                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [GLM-5.3](https://z.ai/blog/glm-5.3)                             | 已讀渲染表及註腳，保存頁面與 JS。DeepSWE 66.9 自跑 mini-swe-agent、6h、400K，未明示該列 effort；AutomationBench 48.2 為 v1.0.6、PR13 修正，未明示 public/private。FrontierSWE 78.1 由 Proximal 執行、max、1M，是 8/14 dominance；需回主辦方確認當期版本。PostTrain/SWE-Marathon 修改檢查器，不直接併入標準榜 |
| [GLM-5.3 Flash](https://autoclaw.z.ai/blog/model/glm-5.3-flash/) | DeepSWE 63.4、AutomationBench 48.8 的字面 effort、harness 與子集未公布；保留研究候選。Chartography 78.0 為 with tools，與目前無工具值分開                                                                                                                                                                    |
| [Kimi K3](https://www.kimi.com/en/blog/kimi-k3)                  | 全部 K3 max；DeepSWE 自測 Kimi Code，另引 mini-SWE-agent 67.3，當前主榜已為 68.5144，保存來源日期差異。AutomationBench 明示 600 題 public，不能對應專案 private。SWE-Marathon 為 H20 校準，PostTrain 使用 H20；保留設定差異                                                                                  |
| [DeepSeek 更新紀錄](https://api-docs.deepseek.com/updates/)      | V4.1 Flash DeepSWE 74.2、AutomationBench 54.8；該段沒有逐項 effort／子集。V4 Flash 0731 使用 DeepSeek Harness minimal/max；V4 Pro 0813 AutomationBench Public 31.8 與 GLM 比較表 43.2 不同。API alias 已換到 V4.1，依日期 checkpoint 保留身份                                                                |

MiMo、Meta、Qwen、MiniMax、Step 的逐頁研究與精確候選見 [其他供應商](other-vendor-release-evidence.md)。

Meta Muse Spark 1.3 的原圖與方法文件已保存於 `data/research/meta-release-evidence-index.json`。DeepSWE v1.1 自測 max／mini-swe-agent 75.4% 設定可辨識，但比較列 GPT-5.6 Sol max 73.0、Opus 5 max 74.0、Muse 1.2 xhigh 55.0，與主辦方快照 72.6667、73.6486、54.8673 的差距均超過一位小數精度。尚無證據證明這三列刻意取整數，暫不採用。MiniMax M3 的 SWE-Bench Pro 59.0% 明示 Claude Code 與官方評測邏輯對齊，仍需確認版本／資料集及主辦方重疊列。

## 重建

OpenAI 使用 `data/sources/openai-releases/reviewed-capture-index.json` 管理多頁。`materialize:vendor-releases` 接收 `--openai-capture-index <path>`；離線 snapshots 與 costs 均重建所有已保存頁面。

Google／xAI：`pnpm exec tsx packages/acquisition/src/refresh-google-release.ts`、`pnpm exec tsx packages/acquisition/src/refresh-xai-release.ts` 從保存並驗 hash 的證據重建。新增來源納入 `sources.json`。最後執行 `pnpm data:build-current`，使前端與 Quality vs. Cost 使用同一產品資料。
