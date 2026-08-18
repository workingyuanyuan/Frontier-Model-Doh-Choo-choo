# 跨來源檔位推測 — 待使用者審核

> 產生於 2026-08-18。依規格 §4.5，每一筆推測都必須列出依據並由使用者放行。
> 這份是四個來源 validation report 中 `C6 effort inference` 區段的合併易讀版；權威紀錄仍在各來源的 report 內。

**怎麼看**：「該模型各來源實際標了什麼」那一行是判斷依據。若某來源標了具名檔位，而另一個來源沒標，推測就把前者的最高檔位填給後者。

合計 77 列，涉及 11 個模型。

---

## 優先審這 6 個

推測涉及 11 個模型，但只有 6 個目前四來源齊全、會實際顯示在主畫面上。其餘 5 個推測錯了也不會影響現在看到的東西，可以之後再看。

| 模型                            | 會顯示 | 推測                            | 我的信心                                                                |
| ------------------------------- | ------ | ------------------------------- | ----------------------------------------------------------------------- |
| `zai-glm-5-2`                   | ★      | LiveBench、FrontierCode → `max` | 高：AA 與 DeepSWE 都有 max                                              |
| `moonshot-kimi-k3`              | ★      | LiveBench、FrontierCode → `max` | 高：AA 與 DeepSWE 都有 max                                              |
| `xai-grok-4-5`                  | ★      | LiveBench → `high`              | 高：AA 與 DeepSWE 都只有 high                                           |
| `deepseek-deepseek-v4-flash`    | ★      | LiveBench → `max`               | 高：AA 與 DeepSWE 都有 max                                              |
| `deepseek-deepseek-v4-pro`      | ★      | LiveBench、FrontierCode → `max` | 中：依據列是 `deepseek-v4-pro-0424`，請確認那個日期變體算不算同一個模型 |
| `xai-grok-4-6`                  | ★      | LiveBench → `xhigh`             | **低：見下方說明**                                                      |
| `alibaba-qwen3-8-max`           |        | AA、LiveBench → `xhigh`         | 中：14 列全靠 DeepSWE 一筆                                              |
| `google-gemini-3-1-pro-preview` |        | AA → `high`                     | 高：LiveBench 與 DeepSWE 都是 high                                      |
| `google-gemini-3-5-flash-lite`  |        | AA → `high`                     | 中：只有 LiveBench 一個依據                                             |
| `thinking-machines-inkling`     |        | FrontierCode → `xhigh`          | 高：AA 與 LiveBench 都是 xhigh                                          |
| `xai-grok-4-3`                  |        | LiveBench → `medium`            | 中：AA 只有 low／medium                                                 |

### 我認為最可疑的一筆：`xai-grok-4-6`

```
AA           high
DeepSWE      high、low、medium、xhigh
FrontierCode high
LiveBench    未標  →  推測成 xhigh
```

規則取「其他來源出現過的最高具名檔位」，DeepSWE 有掃四個檔位所以最高是 `xhigh`，於是 LiveBench 拿到 `xhigh`。但**另外兩個有標的來源都只跑 high**。如果 LiveBench 實際上也是跑 high，這筆就把它記錯了一階。

這正好暴露規則 A 的邊界：當某個來源掃過完整階梯、其他來源只跑一檔時，「取最高」會被那個掃階梯的來源帶偏。若你覺得這個推測不對，可以改成「取其他來源的**眾數**」或「只在其他來源一致時才推測」——但那是規則變更，我不自己改。

---

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

- **AA**：max、non-reasoning
- **LiveBench**：未標
- **DeepSWE**：max
- **FrontierCode**：high

| 未標的來源 | 推測檔位 | 影響列數 | 依據來源 | 依據列                                               |
| ---------- | -------- | -------: | -------- | ---------------------------------------------------- |
| LiveBench  | `max`    |        8 | AA       | `artificial-analysis:aa-briefcase:deepseek-v4-flash` |

## `deepseek-deepseek-v4-pro`

該模型各來源實際標了什麼：

- **AA**：high、max、non-reasoning
- **LiveBench**：未標
- **DeepSWE**：max
- **FrontierCode**：未標

| 未標的來源   | 推測檔位 | 影響列數 | 依據來源 | 依據列                                                  |
| ------------ | -------- | -------: | -------- | ------------------------------------------------------- |
| LiveBench    | `max`    |        8 | AA       | `artificial-analysis:aa-briefcase:deepseek-v4-pro-0424` |
| FrontierCode | `max`    |        1 | AA       | `artificial-analysis:aa-briefcase:deepseek-v4-pro-0424` |

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
| LiveBench    | `max`    |        4 | AA       | `artificial-analysis:aa-briefcase:kimi-k3` |
| FrontierCode | `max`    |        1 | AA       | `artificial-analysis:aa-briefcase:kimi-k3` |

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
| LiveBench  | `xhigh`  |        4 | DeepSWE  | `deepswe-1-1:mini-swe-agent-grok-4-6-xhigh` |

## `zai-glm-5-2`

該模型各來源實際標了什麼：

- **AA**：max、non-reasoning
- **LiveBench**：未標
- **DeepSWE**：high、max
- **FrontierCode**：未標

| 未標的來源   | 推測檔位 | 影響列數 | 依據來源 | 依據列                                     |
| ------------ | -------- | -------: | -------- | ------------------------------------------ |
| LiveBench    | `max`    |        4 | AA       | `artificial-analysis:aa-briefcase:glm-5-2` |
| FrontierCode | `max`    |        1 | AA       | `artificial-analysis:aa-briefcase:glm-5-2` |
