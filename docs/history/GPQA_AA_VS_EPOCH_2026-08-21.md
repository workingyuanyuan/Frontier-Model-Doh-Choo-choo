# GPQA Diamond: Artificial Analysis 與 Epoch AI 的逐模型分數對照

> 產生自 `data-v2/sources/*/candidates.json`（Epoch 快照 2026-08-21）。
> 本文件是 `tasks/claude-code-plan.md` L1 的審核材料，供使用者決定跨來源重複 benchmark 的合併規則。
> 它不修改任何設定。

## 讀法

- 兩個來源都自己重跑 GPQA Diamond，`sourceRole` 都是 `INDEPENDENT`，沒有誰天生優先。
- 每一列是一個「模型 × 思考強度」。同一格若該來源有多筆，取該來源分數最高的一筆（規格 §4.3）。
- 第一欄 ● 表示該模型目前在主畫面（八維齊全），○ 表示只在開發者模式。
- 分數是 normalized（百分制）。

## 現行管線實際上怎麼選（尚未經使用者裁決）

`selectCurrentResults` 的鍵是 `benchmarkId + benchmarkVersion + profileId + metric.id`，
不含 `sourceId`。兩個來源的 harness 不同（AA 為 `null`，Epoch 為 `Epoch AI Inspect`），
在這個分支下**先比分數，分數高者勝**；`sourceRole` 只在分數完全相同時才拿來破平手。

也就是說，目前的預設行為是 **跨來源取最高分**。這不是規格寫出來的決定，是鍵值不含來源
所產生的副作用。

## 1. 兩個來源都有（26 列）

| 主畫面 | 模型                            | 檔位    |    AA | Epoch | Epoch − AA | 現行採用 |
| ------ | ------------------------------- | ------- | ----: | ----: | ---------: | -------- |
| ●      | `alibaba-qwen3-6-27b`           | default | 84.24 | 85.86 |      +1.62 | Epoch    |
| ○      | `alibaba-qwen3-7-plus`          | default | 90.00 | 87.88 |      -2.12 | AA       |
| ●      | `anthropic-claude-fable-5`      | max     | 92.63 | 85.86 |      -6.77 | AA       |
| ●      | `anthropic-claude-opus-5`       | low     | 88.89 | 87.88 |      -1.01 | AA       |
| ●      | `anthropic-claude-opus-5`       | max     | 93.23 | 93.88 |      +0.64 | Epoch    |
| ○      | `anthropic-claude-sonnet-5`     | max     | 91.11 | 80.30 |     -10.81 | AA       |
| ●      | `deepseek-deepseek-v4-flash`    | max     | 90.81 | 91.04 |      +0.23 | Epoch    |
| ●      | `deepseek-deepseek-v4-pro`      | max     | 92.83 | 91.67 |      -1.16 | AA       |
| ●      | `google-gemini-3-1-pro-preview` | default | 94.14 | 94.10 |      -0.04 | AA       |
| ●      | `google-gemini-3-5-flash-lite`  | default | 83.84 | 74.24 |      -9.60 | AA       |
| ●      | `google-gemini-3-6-flash`       | high    | 92.83 | 94.13 |      +1.30 | Epoch    |
| ●      | `google-gemini-3-7-flash`       | high    | 94.55 | 94.82 |      +0.28 | Epoch    |
| ●      | `minimax-minimax-m3`            | default | 92.93 | 90.91 |      -2.02 | AA       |
| ●      | `moonshot-kimi-k2-7-code`       | default | 89.60 | 87.88 |      -1.72 | AA       |
| ●      | `moonshot-kimi-k3`              | low     | 84.24 | 84.85 |      +0.61 | Epoch    |
| ●      | `moonshot-kimi-k3`              | max     | 93.54 | 93.12 |      -0.42 | AA       |
| ●      | `openai-gpt-5-6-luna`           | low     | 83.54 | 82.32 |      -1.21 | AA       |
| ●      | `openai-gpt-5-6-luna`           | max     | 91.11 | 91.60 |      +0.49 | Epoch    |
| ●      | `openai-gpt-5-6-sol`            | low     | 89.80 | 89.90 |      +0.10 | Epoch    |
| ●      | `openai-gpt-5-6-sol`            | max     | 94.14 | 93.50 |      -0.64 | AA       |
| ●      | `openai-gpt-5-6-terra`          | low     | 84.34 | 87.37 |      +3.03 | Epoch    |
| ●      | `openai-gpt-5-6-terra`          | max     | 92.53 | 93.31 |      +0.78 | Epoch    |
| ●      | `thinking-machines-inkling`     | xhigh   | 87.17 | 88.26 |      +1.09 | Epoch    |
| ●      | `xai-grok-4-5`                  | high    | 93.13 | 93.43 |      +0.30 | Epoch    |
| ○      | `xai-grok-4-6`                  | high    | 94.95 | 94.00 |      -0.95 | AA       |
| ●      | `zai-glm-5-2`                   | max     | 89.49 | 91.86 |      +2.36 | Epoch    |

## 2. 只有 Artificial Analysis 有（26 列）

| 主畫面 | 模型                        | 檔位          |    AA | Epoch | Epoch − AA | 現行採用 |
| ------ | --------------------------- | ------------- | ----: | ----: | ---------: | -------- |
| ●      | `alibaba-qwen3-6-27b`       | non-reasoning | 82.93 |     — |          — | AA       |
| ●      | `alibaba-qwen3-8-27b`       | default       | 90.51 |     — |          — | AA       |
| ●      | `alibaba-qwen3-8-max`       | default       | 92.73 |     — |          — | AA       |
| ●      | `anthropic-claude-opus-5`   | medium        | 91.92 |     — |          — | AA       |
| ●      | `anthropic-claude-opus-5`   | high          | 93.74 |     — |          — | AA       |
| ●      | `anthropic-claude-opus-5`   | xhigh         | 93.74 |     — |          — | AA       |
| ○      | `anthropic-claude-sonnet-5` | non-reasoning | 80.00 |     — |          — | AA       |
| ●      | `google-gemini-3-7-flash`   | low           | 90.10 |     — |          — | AA       |
| ●      | `google-gemini-3-7-flash`   | medium        | 92.12 |     — |          — | AA       |
| ●      | `meta-muse-spark-1-2`       | xhigh         | 90.40 |     — |          — | AA       |
| ○      | `nvidia-nemotron-3-ultra`   | default       | 86.67 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-luna`       | non-reasoning | 64.55 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-luna`       | medium        | 85.86 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-luna`       | high          | 89.19 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-luna`       | xhigh         | 89.49 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-sol`        | non-reasoning | 78.99 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-sol`        | medium        | 92.63 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-sol`        | high          | 92.83 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-sol`        | xhigh         | 93.13 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-terra`      | non-reasoning | 74.65 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-terra`      | medium        | 87.17 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-terra`      | high          | 89.60 |     — |          — | AA       |
| ●      | `openai-gpt-5-6-terra`      | xhigh         | 90.81 |     — |          — | AA       |
| ○      | `xai-grok-4-3`              | non-reasoning | 65.76 |     — |          — | AA       |
| ○      | `xai-grok-4-3`              | medium        | 88.99 |     — |          — | AA       |
| ○      | `xiaomi-mimo-v2-5-pro`      | default       | 86.57 |     — |          — | AA       |

## 3. 只有 Epoch 有（59 列）

這些列是加入 Epoch 之後 `gpqa-diamond` 覆蓋率上升的來源。

| 主畫面 | 模型                            | 檔位    |  AA | Epoch | Epoch − AA | 現行採用 |
| ------ | ------------------------------- | ------- | --: | ----: | ---------: | -------- |
| ○      | `alibaba-qwen3-7-max`           | default |   — | 90.91 |          — | Epoch    |
| ●      | `alibaba-qwen3-8-max`           | xhigh   |   — | 92.68 |          — | Epoch    |
| ●      | `anthropic-claude-fable-5`      | low     |   — | 78.79 |          — | Epoch    |
| ●      | `anthropic-claude-fable-5`      | high    |   — | 83.33 |          — | Epoch    |
| ○      | `anthropic-claude-opus-4-5`     | default |   — | 86.05 |          — | Epoch    |
| ○      | `anthropic-claude-opus-4-6`     | default |   — | 90.53 |          — | Epoch    |
| ○      | `anthropic-claude-opus-4-6`     | max     |   — | 88.38 |          — | Epoch    |
| ○      | `anthropic-claude-opus-4-7`     | xhigh   |   — | 90.15 |          — | Epoch    |
| ○      | `anthropic-claude-opus-4-7`     | max     |   — | 86.36 |          — | Epoch    |
| ○      | `anthropic-claude-opus-4-8`     | default |   — | 85.35 |          — | Epoch    |
| ○      | `anthropic-claude-opus-4-8`     | low     |   — | 88.38 |          — | Epoch    |
| ○      | `anthropic-claude-opus-4-8`     | max     |   — | 91.04 |          — | Epoch    |
| ●      | `anthropic-claude-opus-5`       | default |   — | 92.93 |          — | Epoch    |
| ○      | `anthropic-claude-sonnet-4-6`   | default |   — | 87.37 |          — | Epoch    |
| ○      | `anthropic-claude-sonnet-4-6`   | medium  |   — | 83.33 |          — | Epoch    |
| ○      | `anthropic-claude-sonnet-4-6`   | high    |   — | 83.33 |          — | Epoch    |
| ○      | `anthropic-claude-sonnet-4-6`   | max     |   — | 78.79 |          — | Epoch    |
| ○      | `anthropic-claude-sonnet-5`     | xhigh   |   — | 90.53 |          — | Epoch    |
| ●      | `deepseek-deepseek-v4-pro`      | default |   — | 73.23 |          — | Epoch    |
| ●      | `deepseek-deepseek-v4-pro`      | high    |   — | 90.91 |          — | Epoch    |
| ●      | `google-gemini-3-1-pro-preview` | high    |   — | 94.44 |          — | Epoch    |
| ○      | `google-gemini-3-5-flash`       | default |   — | 86.36 |          — | Epoch    |
| ○      | `google-gemini-3-5-flash`       | low     |   — | 88.89 |          — | Epoch    |
| ○      | `google-gemini-3-5-flash`       | high    |   — | 92.80 |          — | Epoch    |
| ●      | `google-gemini-3-5-flash-lite`  | low     |   — | 75.76 |          — | Epoch    |
| ●      | `google-gemini-3-5-flash-lite`  | high    |   — | 83.33 |          — | Epoch    |
| ●      | `google-gemini-3-6-flash`       | default |   — | 85.86 |          — | Epoch    |
| ●      | `google-gemini-3-6-flash`       | low     |   — | 86.36 |          — | Epoch    |
| ○      | `google-gemini-3-pro-preview`   | default |   — | 92.61 |          — | Epoch    |
| ○      | `meta-muse-spark`               | default |   — | 89.80 |          — | Epoch    |
| ○      | `moonshot-kimi-k2-6`            | default |   — | 90.78 |          — | Epoch    |
| ●      | `moonshot-kimi-k3`              | high    |   — | 91.92 |          — | Epoch    |
| ○      | `openai-gpt-5-2`                | default |   — | 73.23 |          — | Epoch    |
| ○      | `openai-gpt-5-2`                | low     |   — | 82.70 |          — | Epoch    |
| ○      | `openai-gpt-5-2`                | medium  |   — | 87.88 |          — | Epoch    |
| ○      | `openai-gpt-5-2`                | high    |   — | 88.19 |          — | Epoch    |
| ○      | `openai-gpt-5-2`                | xhigh   |   — | 91.40 |          — | Epoch    |
| ○      | `openai-gpt-5-4`                | default |   — | 74.75 |          — | Epoch    |
| ○      | `openai-gpt-5-4`                | low     |   — | 84.85 |          — | Epoch    |
| ○      | `openai-gpt-5-4`                | medium  |   — | 88.89 |          — | Epoch    |
| ○      | `openai-gpt-5-4`                | high    |   — | 89.90 |          — | Epoch    |
| ○      | `openai-gpt-5-4`                | xhigh   |   — | 93.30 |          — | Epoch    |
| ○      | `openai-gpt-5-4-mini`           | default |   — | 64.14 |          — | Epoch    |
| ○      | `openai-gpt-5-4-mini`           | high    |   — | 83.59 |          — | Epoch    |
| ○      | `openai-gpt-5-4-mini`           | xhigh   |   — | 86.87 |          — | Epoch    |
| ○      | `openai-gpt-5-4-nano`           | default |   — | 55.56 |          — | Epoch    |
| ○      | `openai-gpt-5-4-nano`           | low     |   — | 72.22 |          — | Epoch    |
| ○      | `openai-gpt-5-4-nano`           | high    |   — | 78.47 |          — | Epoch    |
| ○      | `openai-gpt-5-4-pro`            | xhigh   |   — | 94.60 |          — | Epoch    |
| ○      | `openai-gpt-5-5`                | default |   — | 77.27 |          — | Epoch    |
| ○      | `openai-gpt-5-5`                | low     |   — | 90.66 |          — | Epoch    |
| ○      | `openai-gpt-5-5`                | xhigh   |   — | 94.00 |          — | Epoch    |
| ○      | `openai-gpt-5-5-pro`            | xhigh   |   — | 93.92 |          — | Epoch    |
| ●      | `openai-gpt-5-6-luna`           | default |   — | 63.64 |          — | Epoch    |
| ●      | `openai-gpt-5-6-sol`            | default |   — | 82.83 |          — | Epoch    |
| ●      | `openai-gpt-5-6-terra`          | default |   — | 77.27 |          — | Epoch    |
| ○      | `xai-grok-4-6`                  | xhigh   |   — | 93.18 |          — | Epoch    |
| ○      | `zai-glm-5-1`                   | default |   — | 89.90 |          — | Epoch    |
| ●      | `zai-glm-5-2`                   | default |   — | 71.21 |          — | Epoch    |
