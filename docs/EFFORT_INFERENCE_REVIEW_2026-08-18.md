# 跨來源檔位推測 — 現行紀錄

> 產生於 2026-08-18，反映 §4.5 改成「每來源一票的眾數」與 DeepSeek 身份修正之後的結果。
> 這是四份來源 validation report 中 `C6 effort inference` 區段的合併易讀版；權威紀錄仍在各來源的 report 內。

合計 69 列，涉及 11 個模型。

## `alibaba-qwen3-8-max`

該模型各來源實際標了什麼：

- **AA**：未標
- **LiveBench**：未標
- **DeepSWE**：xhigh
- **FrontierCode**：_沒有資料_

| 未標的來源 | 推測檔位 | 影響列數 | 依據來源 | 依據列                                         |
| ---------- | -------- | -------: | -------- | ---------------------------------------------- |
| AA         | `xhigh`  |       10 | DeepSWE  | `deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh` |
| LiveBench  | `xhigh`  |        4 | DeepSWE  | `deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh` |

## `deepseek-deepseek-v4-flash`

該模型各來源實際標了什麼：

- **AA**：max
- **LiveBench**：未標
- **DeepSWE**：max
- **FrontierCode**：high

| 未標的來源 | 推測檔位 | 影響列數 | 依據來源 | 依據列                                               |
| ---------- | -------- | -------: | -------- | ---------------------------------------------------- |
| LiveBench  | `max`    |        4 | AA       | `artificial-analysis:aa-briefcase:deepseek-v4-flash` |

## `deepseek-deepseek-v4-pro`

該模型各來源實際標了什麼：

- **AA**：max
- **LiveBench**：未標
- **DeepSWE**：max
- **FrontierCode**：未標

| 未標的來源   | 推測檔位 | 影響列數 | 依據來源 | 依據列                                       |
| ------------ | -------- | -------: | -------- | -------------------------------------------- |
| FrontierCode | `max`    |        1 | AA       | `artificial-analysis:aa-lcr:deepseek-v4-pro` |
| LiveBench    | `max`    |        4 | AA       | `artificial-analysis:aa-lcr:deepseek-v4-pro` |

## `google-gemini-3-1-pro-preview`

該模型各來源實際標了什麼：

- **AA**：未標
- **LiveBench**：high
- **DeepSWE**：high
- **FrontierCode**：_沒有資料_

| 未標的來源 | 推測檔位 | 影響列數 | 依據來源 | 依據列                                                   |
| ---------- | -------- | -------: | -------- | -------------------------------------------------------- |
| AA         | `high`   |       13 | DeepSWE  | `deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high` |

## `google-gemini-3-5-flash-lite`

該模型各來源實際標了什麼：

- **AA**：未標
- **LiveBench**：high
- **DeepSWE**：_沒有資料_
- **FrontierCode**：_沒有資料_

| 未標的來源 | 推測檔位 | 影響列數 | 依據來源  | 依據列                                                                            |
| ---------- | -------- | -------: | --------- | --------------------------------------------------------------------------------- |
| AA         | `high`   |       10 | LiveBench | `livebench-2026-06-25:livebench-instruction-following:gemini-3-5-flash-lite-high` |

## `moonshot-kimi-k3`

該模型各來源實際標了什麼：

- **AA**：low、max
- **LiveBench**：未標
- **DeepSWE**：max
- **FrontierCode**：未標

| 未標的來源   | 推測檔位 | 影響列數 | 依據來源 | 依據列                                     |
| ------------ | -------- | -------: | -------- | ------------------------------------------ |
| FrontierCode | `max`    |        1 | AA       | `artificial-analysis:aa-briefcase:kimi-k3` |
| LiveBench    | `max`    |        4 | AA       | `artificial-analysis:aa-briefcase:kimi-k3` |

## `thinking-machines-inkling`

該模型各來源實際標了什麼：

- **AA**：xhigh
- **LiveBench**：xhigh
- **DeepSWE**：_沒有資料_
- **FrontierCode**：未標

| 未標的來源   | 推測檔位 | 影響列數 | 依據來源 | 依據列                                     |
| ------------ | -------- | -------: | -------- | ------------------------------------------ |
| FrontierCode | `xhigh`  |        1 | AA       | `artificial-analysis:aa-briefcase:inkling` |

## `xai-grok-4-3`

該模型各來源實際標了什麼：

- **AA**：low、medium、non-reasoning
- **LiveBench**：未標
- **DeepSWE**：_沒有資料_
- **FrontierCode**：_沒有資料_

| 未標的來源 | 推測檔位 | 影響列數 | 依據來源 | 依據列                                       |
| ---------- | -------- | -------: | -------- | -------------------------------------------- |
| LiveBench  | `medium` |        4 | AA       | `artificial-analysis:aa-lcr:grok-4-3-medium` |

## `xai-grok-4-5`

該模型各來源實際標了什麼：

- **AA**：high
- **LiveBench**：未標
- **DeepSWE**：high
- **FrontierCode**：high、low、medium

| 未標的來源 | 推測檔位 | 影響列數 | 依據來源 | 依據列                                      |
| ---------- | -------- | -------: | -------- | ------------------------------------------- |
| LiveBench  | `high`   |        4 | AA       | `artificial-analysis:aa-briefcase:grok-4-5` |

## `xai-grok-4-6`

該模型各來源實際標了什麼：

- **AA**：high
- **LiveBench**：未標
- **DeepSWE**：high、low、medium、xhigh
- **FrontierCode**：high

| 未標的來源 | 推測檔位 | 影響列數 | 依據來源 | 依據列                                      |
| ---------- | -------- | -------: | -------- | ------------------------------------------- |
| LiveBench  | `high`   |        4 | AA       | `artificial-analysis:aa-briefcase:grok-4-6` |

## `zai-glm-5-2`

該模型各來源實際標了什麼：

- **AA**：max、non-reasoning
- **LiveBench**：未標
- **DeepSWE**：high、max
- **FrontierCode**：未標

| 未標的來源   | 推測檔位 | 影響列數 | 依據來源 | 依據列                                     |
| ------------ | -------- | -------: | -------- | ------------------------------------------ |
| FrontierCode | `max`    |        1 | AA       | `artificial-analysis:aa-briefcase:glm-5-2` |
| LiveBench    | `max`    |        4 | AA       | `artificial-analysis:aa-briefcase:glm-5-2` |
