# FrontierSWE V2 匯入驗證（2026-10-01）

FrontierSWE V2 已加入來源名單，以 mean@5 百分比分數供手動 profiles 的共同 benchmark 比較。資料範圍由 benchmark mapping 的 `comparisonOnly: true` 管理。

## 產品與資料

- 工作目錄：`C:/Users/YYuan/Workspace/Coding/Frontier-Model-Doh-Choo-choo`。
- 起始 commit：`838da8e59a0968a586f4d521628d3854521bdc6c`；工作目錄起始為乾淨狀態。
- 舊 versionId：`sha256:5d9050c1117ae2751f4d4b91dbf730f5400ee79578ad4a567ae34f30f40ffede`。
- 新 versionId：`sha256:e61cff5ba049d50ed5158607b9817e1fc7c67edd4f784832ccb21a1d9e334a99`。
- 來源核驗時間：2026-10-01T03:28:35.622Z。
- benchmark：`frontier-swe-v2` / version `2`；metric `mean-at-5`，0–100 百分比分數。
- 完整擷取 18 筆模型／harness 組合；模型清單與 coverage matrix 相符，伺服器渲染的 10 列顯示值均核對通過。
- 15 筆精確對應現有模型並納入產品；DeepSeek V4 Flash Vision Exp、GLM-5.3、GPT-5.6 的原始列保存在來源快照，canonical identity 為 null。
- Frontier 模型：66 → 66；profiles：196 → 196；evidence：3034 → 3049；成本：624 → 624。
- 原始 bytes 與 SHA-256 索引：[來源驗證報告](../../data/sources/frontier-swe/validation-report.md)、[evidence index](../../data/sources/frontier-swe/evidence-index.json)。

## 預設集合與分數比對

使用 2026-10-01 參考日期與現行 display-set-policy 重產集合，21 個預設集合與更新前完全一致。逐集合、逐 profile 的維度、總分、名次及證據 ID 深度比對相等；主畫面模型進出為 0，分數及名次最大變動為 0。原有 profiles、evidence、frontier 與 costs 亦深度相等。各集合內容雜湊與逐模型差異清單見 [驗證 JSON](2026-10-01-frontier-swe-v2.json)。

| 集合            | Profile 列數 | 分數／名次比較 |
| --------------- | -----------: | -------------- |
| free-sources-21 |          130 | 完全相等       |
| free-sources-19 |          131 | 完全相等       |
| free-sources-17 |          135 | 完全相等       |
| free-sources-16 |          132 | 完全相等       |
| free-sources-14 |          155 | 完全相等       |
| free-sources-12 |          187 | 完全相等       |
| all-sources-11  |          192 | 完全相等       |
| free-sources-11 |          193 | 完全相等       |
| all-sources-10  |          193 | 完全相等       |
| free-sources-10 |          194 | 完全相等       |
| all-sources-9   |          194 | 完全相等       |
| free-sources-9  |          194 | 完全相等       |
| all-sources-8   |          195 | 完全相等       |
| all-sources-7   |          196 | 完全相等       |
| free-sources-7  |          193 | 完全相等       |
| all-sources-6   |          195 | 完全相等       |
| free-sources-6  |          193 | 完全相等       |
| all-sources-5   |          195 | 完全相等       |
| free-sources-5  |          194 | 完全相等       |
| all-sources-4   |          195 | 完全相等       |
| all-sources-3   |          196 | 完全相等       |

## Effort 歸屬

FrontierSWE 頁面未公開 reasoning effort；來源列保留 null，產品依既有跨來源政策指定 profile。推測依據如下：

| Model             | Target candidate                                          | Raw effort | Product effort | Basis source        | Basis candidate                                                              |
| ----------------- | --------------------------------------------------------- | ---------- | -------------- | ------------------- | ---------------------------------------------------------------------------- |
| Claude Fable 5    | `frontier-swe:frontier-swe-v2:claude-fable-5-proximus`    | —          | `max`          | arc-prize           | arc-prize:arc-agi-2:anthropic-claude-fable-5-max:arc-agi-2-v2-semi-private   |
| Claude Fable 5.1  | `frontier-swe:frontier-swe-v2:claude-fable-5-1-proximus`  | —          | `max`          | arc-prize           | arc-prize:arc-agi-2:anthropic-claude-fable-5-1-max:arc-agi-2-v2-semi-private |
| Claude Opus 5     | `frontier-swe:frontier-swe-v2:claude-opus-5-proximus`     | —          | `max`          | arc-prize           | arc-prize:arc-agi-2:anthropic-claude-opus-5-max:arc-agi-2-v2-semi-private    |
| Claude Opus 5.5   | `frontier-swe:frontier-swe-v2:claude-opus-5-5-proximus`   | —          | `max`          | arc-prize           | arc-prize:arc-agi-2:anthropic-claude-opus-5-5-max:arc-agi-2-v2-semi-private  |
| Claude Sonnet 5.5 | `frontier-swe:frontier-swe-v2:claude-sonnet-5-5-proximus` | —          | `max`          | artificial-analysis | artificial-analysis:aa-briefcase:claude-sonnet-5-5                           |
| Gemini 3.7 Flash  | `frontier-swe:frontier-swe-v2:gemini-3-7-flash-proximus`  | —          | `high`         | arc-prize           | arc-prize:arc-agi-2:google-gemini-3-7-flash-high:arc-agi-2-v2-semi-private   |
| Gemini 3.8 Flash  | `frontier-swe:frontier-swe-v2:gemini-3-8-flash-proximus`  | —          | `high`         | arc-prize           | arc-prize:arc-agi-2:google-gemini-3-8-flash-high:arc-agi-2-v2-semi-private   |
| Gemini 4 Argon    | `frontier-swe:frontier-swe-v2:gemini-4-argon-proximus`    | —          | `high`         | artificial-analysis | artificial-analysis:aa-briefcase:gemini-4-argon                              |
| GPT-6 Astra       | `frontier-swe:frontier-swe-v2:gpt-6-astra-proximus`       | —          | `max`          | arc-prize           | arc-prize:arc-agi-2:openai-gpt-6-astra-max:arc-agi-2-v2-semi-private         |
| Grok 4.6          | `frontier-swe:frontier-swe-v2:grok-4-6-proximus`          | —          | `high`         | arc-prize           | arc-prize:arc-agi-2:xai-grok-4-6-high:arc-agi-2-v2-semi-private              |
| Grok 4.7          | `frontier-swe:frontier-swe-v2:grok-4-7-proximus`          | —          | `xhigh`        | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-7                                    |
| Inkling           | `frontier-swe:frontier-swe-v2:inkling-proximus`           | —          | `xhigh`        | artificial-analysis | artificial-analysis:aa-briefcase:inkling                                     |
| Kimi K3           | `frontier-swe:frontier-swe-v2:kimi-k3-proximus`           | —          | `max`          | arc-prize           | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private           |
| Muse Spark 1.2    | `frontier-swe:frontier-swe-v2:muse-spark-1-2-proximus`    | —          | `xhigh`        | deepswe             | deepswe-1-1:mini-swe-agent-muse-spark-1-2-xhigh                              |
| Qwen3.8-Max       | `frontier-swe:frontier-swe-v2:qwen3-8-max-proximus`       | —          | `xhigh`        | deepswe             | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh                                 |

## 驗證

- lint、typecheck、format 通過。
- 434 個單元測試通過（acquisition 208、benchmark-data 104、bench 122）。
- production build 通過。
- 桌面與手機 E2E：52 通過、4 依測試條件跳過。
- 新增實際 UI 測試：手動選 GPT-6 Astra max 與 Gemini 3.8 Flash high，顯示 FrontierSWE V2 分數與官方連結；切換 Astra low 後依共同 benchmark 交集移除該列，Default 恢復預設模式。
- 桌面與手機頁尾 versionId 皆核對為 `sha256:e61cff5ba049d50ed5158607b9817e1fc7c67edd4f784832ccb21a1d9e334a99`。

## 可抽查資料

在官方 Leaderboard 找到下列模型，核對 Score 欄。完整候選列可在 All 模式查看。

| 網址                                        | 頁面位置／模型                       | 欄位           | 期望值 |
| ------------------------------------------- | ------------------------------------ | -------------- | ------ |
| [FrontierSWE](https://www.frontierswe.com/) | Leaderboard / GPT-6 Astra            | Score (mean@5) | 65.5%  |
| [FrontierSWE](https://www.frontierswe.com/) | Leaderboard / Claude Opus 5.5        | Score (mean@5) | 62.3%  |
| [FrontierSWE](https://www.frontierswe.com/) | Leaderboard（All）/ Gemini 3.8 Flash | Score (mean@5) | 19.6%  |
