# Phase 3 duplicate benchmark source comparison — 2026-08-22

> Generated from `data-v2/product/current.json` by `scripts/report-duplicate-benchmarks.ts`.
> This report quantifies the approved §4.3.1 cross-source maximum rule; it does not change scoring policy.

## Method

- The comparison key is canonical model × product effort, matching the profile-level selection used by the product.
- Within one source and key, duplicate rows are reduced to that source’s highest normalized 0–100 score.
- “Max − median” is reported only when at least two sources measured the same key. For two sources, the median is their arithmetic midpoint.
- A one-source row remains in the table for coverage disclosure but does not contribute to uplift statistics.

## GPQA Diamond

- Canonical model × effort rows: 104
- Rows with at least two sources: 46
- Rows with all 3 sources: 13
- Mean uplift of max over median (rows with 2+ sources): 0.80 points
- Mean uplift on all-3-source rows only: 0.85 points
- Largest observed uplift: 2.69 points

| Model                           | Effort        |    AA | Epoch |  Vals |   Max | Median | Max − median | Max source |
| ------------------------------- | ------------- | ----: | ----: | ----: | ----: | -----: | -----------: | ---------- |
| `alibaba-qwen3-6-27b`           | default       | 84.24 | 85.86 |     — | 85.86 |  85.05 |         0.81 | Epoch      |
| `alibaba-qwen3-6-27b`           | non-reasoning | 82.93 | 84.85 |     — | 84.85 |  83.89 |         0.96 | Epoch      |
| `alibaba-qwen3-6-plus`          | default       |     — |     — | 87.37 | 87.37 |      — |            — | Vals       |
| `alibaba-qwen3-7-max`           | default       |     — | 90.91 | 90.15 | 90.91 |  90.53 |         0.38 | Epoch      |
| `alibaba-qwen3-7-plus`          | default       | 90.00 | 87.88 |     — | 90.00 |  88.94 |         1.06 | AA         |
| `alibaba-qwen3-7-plus`          | non-reasoning |     — | 81.82 |     — | 81.82 |      — |            — | Epoch      |
| `alibaba-qwen3-8-27b`           | default       | 90.51 |     — | 88.89 | 90.51 |  89.70 |         0.81 | AA         |
| `alibaba-qwen3-8-max`           | default       | 92.73 | 92.68 | 93.69 | 93.69 |  92.73 |         0.96 | Vals       |
| `anthropic-claude-fable-5`      | high          |     — | 83.33 |     — | 83.33 |      — |            — | Epoch      |
| `anthropic-claude-fable-5`      | low           |     — | 78.79 |     — | 78.79 |      — |            — | Epoch      |
| `anthropic-claude-fable-5`      | max           | 92.63 | 85.86 | 93.18 | 93.18 |  92.63 |         0.56 | Vals       |
| `anthropic-claude-opus-4-5`     | default       |     — | 86.05 |     — | 86.05 |      — |            — | Epoch      |
| `anthropic-claude-opus-4-6`     | default       |     — | 90.53 |     — | 90.53 |      — |            — | Epoch      |
| `anthropic-claude-opus-4-6`     | max           |     — | 88.38 |     — | 88.38 |      — |            — | Epoch      |
| `anthropic-claude-opus-4-7`     | max           |     — | 86.36 | 90.15 | 90.15 |  88.26 |         1.89 | Vals       |
| `anthropic-claude-opus-4-7`     | xhigh         |     — | 90.15 |     — | 90.15 |      — |            — | Epoch      |
| `anthropic-claude-opus-4-8`     | low           |     — | 88.38 |     — | 88.38 |      — |            — | Epoch      |
| `anthropic-claude-opus-4-8`     | max           |     — | 91.04 | 92.42 | 92.42 |  91.73 |         0.69 | Vals       |
| `anthropic-claude-opus-4-8`     | non-reasoning |     — | 85.35 |     — | 85.35 |      — |            — | Epoch      |
| `anthropic-claude-opus-5`       | high          | 93.74 |     — |     — | 93.74 |      — |            — | AA         |
| `anthropic-claude-opus-5`       | low           | 88.89 | 87.88 |     — | 88.89 |  88.38 |         0.51 | AA         |
| `anthropic-claude-opus-5`       | max           | 93.23 | 93.88 | 93.43 | 93.88 |  93.43 |         0.44 | Epoch      |
| `anthropic-claude-opus-5`       | medium        | 91.92 |     — |     — | 91.92 |      — |            — | AA         |
| `anthropic-claude-opus-5`       | xhigh         | 93.74 |     — |     — | 93.74 |      — |            — | AA         |
| `anthropic-claude-sonnet-4-6`   | default       |     — | 87.37 | 85.61 | 87.37 |  86.49 |         0.88 | Epoch      |
| `anthropic-claude-sonnet-4-6`   | high          |     — | 83.33 |     — | 83.33 |      — |            — | Epoch      |
| `anthropic-claude-sonnet-4-6`   | medium        |     — | 83.33 |     — | 83.33 |      — |            — | Epoch      |
| `anthropic-claude-sonnet-5`     | max           | 91.11 | 80.30 | 88.89 | 91.11 |  88.89 |         2.22 | AA         |
| `anthropic-claude-sonnet-5`     | non-reasoning | 80.00 |     — |     — | 80.00 |      — |            — | AA         |
| `anthropic-claude-sonnet-5`     | xhigh         |     — | 90.53 |     — | 90.53 |      — |            — | Epoch      |
| `deepseek-deepseek-v4-flash`    | max           | 90.81 | 91.04 |     — | 91.04 |  90.92 |         0.11 | Epoch      |
| `deepseek-deepseek-v4-pro`      | high          |     — | 90.91 |     — | 90.91 |      — |            — | Epoch      |
| `deepseek-deepseek-v4-pro`      | max           | 92.83 | 91.67 | 89.39 | 92.83 |  91.67 |         1.16 | AA         |
| `deepseek-deepseek-v4-pro`      | non-reasoning |     — | 73.23 |     — | 73.23 |      — |            — | Epoch      |
| `google-gemini-3-1-pro-preview` | default       | 94.14 | 94.44 | 95.45 | 95.45 |  94.44 |         1.01 | Vals       |
| `google-gemini-3-5-flash`       | high          |     — | 92.80 | 92.68 | 92.80 |  92.74 |         0.06 | Epoch      |
| `google-gemini-3-5-flash`       | low           |     — | 88.89 |     — | 88.89 |      — |            — | Epoch      |
| `google-gemini-3-5-flash-lite`  | default       | 83.84 | 83.33 | 83.84 | 83.84 |  83.84 |         0.00 | AA         |
| `google-gemini-3-5-flash-lite`  | low           |     — | 75.76 |     — | 75.76 |      — |            — | Epoch      |
| `google-gemini-3-6-flash`       | high          | 92.83 | 94.13 | 93.43 | 94.13 |  93.43 |         0.69 | Epoch      |
| `google-gemini-3-6-flash`       | minimal       |     — | 86.36 |     — | 86.36 |      — |            — | Epoch      |
| `google-gemini-3-7-flash`       | high          | 94.55 | 94.82 | 93.94 | 94.82 |  94.55 |         0.28 | Epoch      |
| `google-gemini-3-7-flash`       | low           | 90.10 |     — |     — | 90.10 |      — |            — | AA         |
| `google-gemini-3-7-flash`       | medium        | 92.12 |     — |     — | 92.12 |      — |            — | AA         |
| `google-gemini-3-pro-preview`   | default       |     — | 92.61 | 91.67 | 92.61 |  92.14 |         0.47 | Epoch      |
| `meta-muse-spark`               | default       |     — | 89.80 | 89.65 | 89.80 |  89.72 |         0.08 | Epoch      |
| `meta-muse-spark-1-1`           | xhigh         |     — |     — | 91.16 | 91.16 |      — |            — | Vals       |
| `meta-muse-spark-1-2`           | xhigh         | 90.40 |     — |     — | 90.40 |      — |            — | AA         |
| `minimax-minimax-m3`            | default       | 92.93 | 90.91 | 92.68 | 92.93 |  92.68 |         0.25 | AA         |
| `moonshot-kimi-k2-6`            | default       |     — | 90.78 | 89.14 | 90.78 |  89.96 |         0.82 | Epoch      |
| `moonshot-kimi-k2-7-code`       | default       | 89.60 | 87.88 |     — | 89.60 |  88.74 |         0.86 | AA         |
| `moonshot-kimi-k3`              | high          |     — | 91.92 |     — | 91.92 |      — |            — | Epoch      |
| `moonshot-kimi-k3`              | low           | 84.24 | 84.85 |     — | 84.85 |  84.55 |         0.30 | Epoch      |
| `moonshot-kimi-k3`              | max           | 93.54 | 93.12 |     — | 93.54 |  93.33 |         0.21 | AA         |
| `nvidia-nemotron-3-ultra`       | default       | 86.67 |     — | 86.11 | 86.67 |  86.39 |         0.28 | AA         |
| `openai-gpt-5-2`                | high          |     — | 88.19 |     — | 88.19 |      — |            — | Epoch      |
| `openai-gpt-5-2`                | low           |     — | 82.70 |     — | 82.70 |      — |            — | Epoch      |
| `openai-gpt-5-2`                | medium        |     — | 87.88 |     — | 87.88 |      — |            — | Epoch      |
| `openai-gpt-5-2`                | non-reasoning |     — | 73.23 |     — | 73.23 |      — |            — | Epoch      |
| `openai-gpt-5-2`                | xhigh         |     — | 91.40 |     — | 91.40 |      — |            — | Epoch      |
| `openai-gpt-5-4`                | high          |     — | 89.90 |     — | 89.90 |      — |            — | Epoch      |
| `openai-gpt-5-4`                | low           |     — | 84.85 |     — | 84.85 |      — |            — | Epoch      |
| `openai-gpt-5-4`                | medium        |     — | 88.89 |     — | 88.89 |      — |            — | Epoch      |
| `openai-gpt-5-4`                | non-reasoning |     — | 74.75 |     — | 74.75 |      — |            — | Epoch      |
| `openai-gpt-5-4`                | xhigh         |     — | 93.30 |     — | 93.30 |      — |            — | Epoch      |
| `openai-gpt-5-4-mini`           | high          |     — | 83.59 |     — | 83.59 |      — |            — | Epoch      |
| `openai-gpt-5-4-mini`           | non-reasoning |     — | 64.14 |     — | 64.14 |      — |            — | Epoch      |
| `openai-gpt-5-4-mini`           | xhigh         |     — | 86.87 | 83.08 | 86.87 |  84.97 |         1.89 | Epoch      |
| `openai-gpt-5-4-nano`           | high          |     — | 78.47 |     — | 78.47 |      — |            — | Epoch      |
| `openai-gpt-5-4-nano`           | low           |     — | 72.22 |     — | 72.22 |      — |            — | Epoch      |
| `openai-gpt-5-4-nano`           | non-reasoning |     — | 55.56 |     — | 55.56 |      — |            — | Epoch      |
| `openai-gpt-5-4-pro`            | xhigh         |     — | 94.60 |     — | 94.60 |      — |            — | Epoch      |
| `openai-gpt-5-5`                | low           |     — | 90.66 |     — | 90.66 |      — |            — | Epoch      |
| `openai-gpt-5-5`                | non-reasoning |     — | 77.27 |     — | 77.27 |      — |            — | Epoch      |
| `openai-gpt-5-5`                | xhigh         |     — | 94.00 | 93.18 | 94.00 |  93.59 |         0.41 | Epoch      |
| `openai-gpt-5-5-pro`            | xhigh         |     — | 93.92 |     — | 93.92 |      — |            — | Epoch      |
| `openai-gpt-5-6-luna`           | high          | 89.19 |     — |     — | 89.19 |      — |            — | AA         |
| `openai-gpt-5-6-luna`           | low           | 83.54 | 82.32 |     — | 83.54 |  82.93 |         0.61 | AA         |
| `openai-gpt-5-6-luna`           | max           | 91.11 | 91.60 | 91.67 | 91.67 |  91.60 |         0.06 | Vals       |
| `openai-gpt-5-6-luna`           | medium        | 85.86 |     — |     — | 85.86 |      — |            — | AA         |
| `openai-gpt-5-6-luna`           | non-reasoning | 64.55 | 63.64 |     — | 64.55 |  64.09 |         0.45 | AA         |
| `openai-gpt-5-6-luna`           | xhigh         | 89.49 |     — |     — | 89.49 |      — |            — | AA         |
| `openai-gpt-5-6-sol`            | high          | 92.83 |     — |     — | 92.83 |      — |            — | AA         |
| `openai-gpt-5-6-sol`            | low           | 89.80 | 89.90 |     — | 89.90 |  89.85 |         0.05 | Epoch      |
| `openai-gpt-5-6-sol`            | max           | 94.14 | 93.50 | 95.20 | 95.20 |  94.14 |         1.06 | Vals       |
| `openai-gpt-5-6-sol`            | medium        | 92.63 |     — |     — | 92.63 |      — |            — | AA         |
| `openai-gpt-5-6-sol`            | non-reasoning | 78.99 | 82.83 |     — | 82.83 |  80.91 |         1.92 | Epoch      |
| `openai-gpt-5-6-sol`            | xhigh         | 93.13 |     — |     — | 93.13 |      — |            — | AA         |
| `openai-gpt-5-6-terra`          | high          | 89.60 |     — |     — | 89.60 |      — |            — | AA         |
| `openai-gpt-5-6-terra`          | low           | 84.34 | 87.37 |     — | 87.37 |  85.86 |         1.52 | Epoch      |
| `openai-gpt-5-6-terra`          | max           | 92.53 | 93.31 |     — | 93.31 |  92.92 |         0.39 | Epoch      |
| `openai-gpt-5-6-terra`          | medium        | 87.17 |     — |     — | 87.17 |      — |            — | AA         |
| `openai-gpt-5-6-terra`          | non-reasoning | 74.65 | 77.27 |     — | 77.27 |  75.96 |         1.31 | Epoch      |
| `openai-gpt-5-6-terra`          | xhigh         | 90.81 |     — | 90.91 | 90.91 |  90.86 |         0.05 | Vals       |
| `thinking-machines-inkling`     | xhigh         | 87.17 | 88.26 |     — | 88.26 |  87.71 |         0.54 | Epoch      |
| `xai-grok-4-3`                  | medium        | 88.99 |     — |     — | 88.99 |      — |            — | AA         |
| `xai-grok-4-3`                  | non-reasoning | 65.76 |     — |     — | 65.76 |      — |            — | AA         |
| `xai-grok-4-5`                  | high          | 93.13 | 93.43 |     — | 93.43 |  93.28 |         0.15 | Epoch      |
| `xai-grok-4-6`                  | high          | 94.95 | 94.00 |     — | 94.95 |  94.48 |         0.47 | AA         |
| `xai-grok-4-6`                  | xhigh         |     — | 93.18 |     — | 93.18 |      — |            — | Epoch      |
| `xiaomi-mimo-v2-5-pro`          | default       | 86.57 |     — | 82.58 | 86.57 |  84.57 |         1.99 | AA         |
| `zai-glm-5-1`                   | default       |     — | 89.90 | 84.52 | 89.90 |  87.21 |         2.69 | Epoch      |
| `zai-glm-5-2`                   | max           | 89.49 | 91.86 | 85.61 | 91.86 |  89.49 |         2.36 | Epoch      |
| `zai-glm-5-2`                   | non-reasoning |     — | 71.21 |     — | 71.21 |      — |            — | Epoch      |

## SWE-bench

- Canonical model × effort rows: 39
- Rows with at least two sources: 11
- Rows with all 2 sources: 11
- Mean uplift of max over median (rows with 2+ sources): 1.29 points
- Largest observed uplift: 4.24 points

| Model                           | Effort  | Epoch |  Vals |   Max | Median | Max − median | Max source |
| ------------------------------- | ------- | ----: | ----: | ----: | -----: | -----------: | ---------- |
| `alibaba-qwen3-6-27b`           | default |     — | 70.00 | 70.00 |      — |            — | Vals       |
| `alibaba-qwen3-6-plus`          | default |     — | 73.40 | 73.40 |      — |            — | Vals       |
| `alibaba-qwen3-7-max`           | default | 77.27 | 68.80 | 77.27 |  73.04 |         4.24 | Epoch      |
| `alibaba-qwen3-8-27b`           | xhigh   |     — | 86.00 | 86.00 |      — |            — | Vals       |
| `alibaba-qwen3-8-max`           | default |     — | 85.60 | 85.60 |      — |            — | Vals       |
| `anthropic-claude-fable-5`      | max     |     — | 95.00 | 95.00 |      — |            — | Vals       |
| `anthropic-claude-opus-4-5`     | default | 76.65 |     — | 76.65 |      — |            — | Epoch      |
| `anthropic-claude-opus-4-6`     | default | 78.72 |     — | 78.72 |      — |            — | Epoch      |
| `anthropic-claude-opus-4-7`     | max     | 83.47 | 82.00 | 83.47 |  82.74 |         0.74 | Epoch      |
| `anthropic-claude-opus-4-8`     | max     |     — | 88.60 | 88.60 |      — |            — | Vals       |
| `anthropic-claude-opus-5`       | default |     — | 97.00 | 97.00 |      — |            — | Vals       |
| `anthropic-claude-sonnet-4-6`   | default | 75.21 | 77.40 | 77.40 |  76.30 |         1.10 | Vals       |
| `anthropic-claude-sonnet-5`     | max     |     — | 79.60 | 79.60 |      — |            — | Vals       |
| `deepseek-deepseek-v4-pro`      | max     | 77.64 | 77.40 | 77.64 |  77.52 |         0.12 | Epoch      |
| `google-gemini-3-1-pro-preview` | default | 75.62 | 78.80 | 78.80 |  77.21 |         1.59 | Vals       |
| `google-gemini-3-5-flash`       | high    | 79.34 | 78.80 | 79.34 |  79.07 |         0.27 | Epoch      |
| `google-gemini-3-5-flash-lite`  | high    |     — | 75.00 | 75.00 |      — |            — | Vals       |
| `google-gemini-3-6-flash`       | high    |     — | 79.60 | 79.60 |      — |            — | Vals       |
| `google-gemini-3-7-flash`       | high    |     — | 80.80 | 80.80 |      — |            — | Vals       |
| `google-gemini-3-pro-preview`   | default | 72.93 | 76.40 | 76.40 |  74.67 |         1.73 | Vals       |
| `meta-muse-spark`               | default |     — | 74.40 | 74.40 |      — |            — | Vals       |
| `meta-muse-spark-1-1`           | xhigh   |     — | 82.00 | 82.00 |      — |            — | Vals       |
| `meta-muse-spark-1-2`           | xhigh   |     — | 86.60 | 86.60 |      — |            — | Vals       |
| `minimax-minimax-m3`            | default |     — | 75.00 | 75.00 |      — |            — | Vals       |
| `moonshot-kimi-k2-6`            | default | 76.65 | 76.20 | 76.65 |  76.43 |         0.23 | Epoch      |
| `nvidia-nemotron-3-ultra`       | default |     — | 69.00 | 69.00 |      — |            — | Vals       |
| `openai-gpt-5-2`                | high    | 73.76 |     — | 73.76 |      — |            — | Epoch      |
| `openai-gpt-5-2-codex`          | high    |     — | 72.40 | 72.40 |      — |            — | Vals       |
| `openai-gpt-5-3-codex`          | high    | 74.79 |     — | 74.79 |      — |            — | Epoch      |
| `openai-gpt-5-3-codex`          | xhigh   |     — | 78.00 | 78.00 |      — |            — | Vals       |
| `openai-gpt-5-4`                | high    | 76.86 |     — | 76.86 |      — |            — | Epoch      |
| `openai-gpt-5-4-mini`           | xhigh   |     — | 73.00 | 73.00 |      — |            — | Vals       |
| `openai-gpt-5-5`                | xhigh   | 80.58 | 82.60 | 82.60 |  81.59 |         1.01 | Vals       |
| `openai-gpt-5-6-luna`           | max     |     — | 93.00 | 93.00 |      — |            — | Vals       |
| `openai-gpt-5-6-sol`            | max     |     — | 96.20 | 96.20 |      — |            — | Vals       |
| `openai-gpt-5-6-terra`          | max     |     — | 95.40 | 95.40 |      — |            — | Vals       |
| `xiaomi-mimo-v2-5-pro`          | default |     — | 74.00 | 74.00 |      — |            — | Vals       |
| `zai-glm-5-1`                   | default | 74.17 | 76.40 | 76.40 |  75.28 |         1.12 | Vals       |
| `zai-glm-5-2`                   | max     | 78.70 | 82.80 | 82.80 |  80.75 |         2.05 | Vals       |

## Terminal-Bench 2.1

- Canonical model × effort rows: 62
- Rows with at least two sources: 19
- Rows with all 2 sources: 19
- Mean uplift of max over median (rows with 2+ sources): 4.24 points
- Largest observed uplift: 14.23 points

| Model                           | Effort        |    AA |  Vals |   Max | Median | Max − median | Max source |
| ------------------------------- | ------------- | ----: | ----: | ----: | -----: | -----------: | ---------- |
| `alibaba-qwen3-6-27b`           | default       | 60.67 |     — | 60.67 |      — |            — | AA         |
| `alibaba-qwen3-6-27b`           | non-reasoning | 51.31 |     — | 51.31 |      — |            — | AA         |
| `alibaba-qwen3-6-plus`          | default       |     — | 53.18 | 53.18 |      — |            — | Vals       |
| `alibaba-qwen3-7-max`           | default       |     — | 61.05 | 61.05 |      — |            — | Vals       |
| `alibaba-qwen3-7-plus`          | default       | 61.05 | 52.81 | 61.05 |  56.93 |         4.12 | AA         |
| `alibaba-qwen3-8-27b`           | default       | 79.78 | 58.43 | 79.78 |  69.10 |        10.67 | AA         |
| `alibaba-qwen3-8-max`           | default       | 81.27 | 67.42 | 81.27 |  74.34 |         6.93 | AA         |
| `anthropic-claude-fable-5`      | max           | 84.64 | 80.52 | 84.64 |  82.58 |         2.06 | AA         |
| `anthropic-claude-opus-4-7`     | high          |     — | 68.54 | 68.54 |      — |            — | Vals       |
| `anthropic-claude-opus-4-8`     | max           |     — | 71.91 | 71.91 |      — |            — | Vals       |
| `anthropic-claude-opus-5`       | high          | 87.64 | 84.64 | 87.64 |  86.14 |         1.50 | AA         |
| `anthropic-claude-opus-5`       | low           | 76.40 |     — | 76.40 |      — |            — | AA         |
| `anthropic-claude-opus-5`       | max           | 89.14 |     — | 89.14 |      — |            — | AA         |
| `anthropic-claude-opus-5`       | medium        | 86.14 |     — | 86.14 |      — |            — | AA         |
| `anthropic-claude-opus-5`       | xhigh         | 88.01 |     — | 88.01 |      — |            — | AA         |
| `anthropic-claude-sonnet-4-6`   | max           |     — | 57.30 | 57.30 |      — |            — | Vals       |
| `anthropic-claude-sonnet-5`     | max           | 80.52 | 74.53 | 80.52 |  77.53 |         3.00 | AA         |
| `anthropic-claude-sonnet-5`     | non-reasoning | 75.28 |     — | 75.28 |      — |            — | AA         |
| `deepseek-deepseek-v4-flash`    | max           | 78.65 |     — | 78.65 |      — |            — | AA         |
| `deepseek-deepseek-v4-pro`      | max           | 78.65 | 50.19 | 78.65 |  64.42 |        14.23 | AA         |
| `google-gemini-3-1-pro-preview` | default       | 73.78 | 70.79 | 73.78 |  72.28 |         1.50 | AA         |
| `google-gemini-3-5-flash`       | high          |     — | 74.16 | 74.16 |      — |            — | Vals       |
| `google-gemini-3-5-flash-lite`  | default       | 53.56 | 50.19 | 53.56 |  51.87 |         1.69 | AA         |
| `google-gemini-3-6-flash`       | high          | 77.53 | 73.78 | 77.53 |  75.66 |         1.87 | AA         |
| `google-gemini-3-7-flash`       | high          | 85.77 | 77.53 | 85.77 |  81.65 |         4.12 | AA         |
| `google-gemini-3-7-flash`       | low           | 79.78 |     — | 79.78 |      — |            — | AA         |
| `google-gemini-3-7-flash`       | medium        | 78.28 |     — | 78.28 |      — |            — | AA         |
| `meta-muse-spark-1-1`           | xhigh         |     — | 69.29 | 69.29 |      — |            — | Vals       |
| `meta-muse-spark-1-2`           | xhigh         | 80.15 | 69.66 | 80.15 |  74.91 |         5.24 | AA         |
| `minimax-minimax-m3`            | default       | 65.17 | 53.56 | 65.17 |  59.36 |         5.81 | AA         |
| `moonshot-kimi-k2-6`            | default       |     — | 53.56 | 53.56 |      — |            — | Vals       |
| `moonshot-kimi-k2-7-code`       | default       | 67.42 |     — | 67.42 |      — |            — | AA         |
| `moonshot-kimi-k3`              | low           | 82.40 |     — | 82.40 |      — |            — | AA         |
| `moonshot-kimi-k3`              | max           | 85.02 |     — | 85.02 |      — |            — | AA         |
| `nvidia-nemotron-3-ultra`       | default       | 53.93 | 50.94 | 53.93 |  52.43 |         1.50 | AA         |
| `openai-gpt-5-4-mini`           | high          |     — | 54.68 | 54.68 |      — |            — | Vals       |
| `openai-gpt-5-5`                | high          |     — | 76.40 | 76.40 |      — |            — | Vals       |
| `openai-gpt-5-6-luna`           | high          | 69.66 |     — | 69.66 |      — |            — | AA         |
| `openai-gpt-5-6-luna`           | low           | 43.45 |     — | 43.45 |      — |            — | AA         |
| `openai-gpt-5-6-luna`           | max           | 80.90 | 79.03 | 80.90 |  79.96 |         0.94 | AA         |
| `openai-gpt-5-6-luna`           | medium        | 53.18 |     — | 53.18 |      — |            — | AA         |
| `openai-gpt-5-6-luna`           | non-reasoning | 38.95 |     — | 38.95 |      — |            — | AA         |
| `openai-gpt-5-6-luna`           | xhigh         | 77.90 |     — | 77.90 |      — |            — | AA         |
| `openai-gpt-5-6-sol`            | high          | 87.27 |     — | 87.27 |      — |            — | AA         |
| `openai-gpt-5-6-sol`            | low           | 76.78 |     — | 76.78 |      — |            — | AA         |
| `openai-gpt-5-6-sol`            | max           | 88.01 | 85.77 | 88.01 |  86.89 |         1.12 | AA         |
| `openai-gpt-5-6-sol`            | medium        | 86.14 |     — | 86.14 |      — |            — | AA         |
| `openai-gpt-5-6-sol`            | non-reasoning | 74.16 |     — | 74.16 |      — |            — | AA         |
| `openai-gpt-5-6-sol`            | xhigh         | 89.51 |     — | 89.51 |      — |            — | AA         |
| `openai-gpt-5-6-terra`          | high          | 75.66 |     — | 75.66 |      — |            — | AA         |
| `openai-gpt-5-6-terra`          | low           | 62.55 |     — | 62.55 |      — |            — | AA         |
| `openai-gpt-5-6-terra`          | max           | 88.01 | 77.53 | 88.01 |  82.77 |         5.24 | AA         |
| `openai-gpt-5-6-terra`          | medium        | 72.28 |     — | 72.28 |      — |            — | AA         |
| `openai-gpt-5-6-terra`          | non-reasoning | 56.18 |     — | 56.18 |      — |            — | AA         |
| `openai-gpt-5-6-terra`          | xhigh         | 80.15 |     — | 80.15 |      — |            — | AA         |
| `thinking-machines-inkling`     | xhigh         | 55.06 |     — | 55.06 |      — |            — | AA         |
| `xai-grok-4-3`                  | non-reasoning | 34.08 |     — | 34.08 |      — |            — | AA         |
| `xai-grok-4-5`                  | high          | 81.65 |     — | 81.65 |      — |            — | AA         |
| `xai-grok-4-6`                  | high          | 88.39 |     — | 88.39 |      — |            — | AA         |
| `xiaomi-mimo-v2-5-pro`          | default       | 65.17 | 57.30 | 65.17 |  61.24 |         3.93 | AA         |
| `zai-glm-5-1`                   | default       |     — | 56.93 | 56.93 |      — |            — | Vals       |
| `zai-glm-5-2`                   | max           | 77.90 | 67.79 | 77.90 |  72.85 |         5.06 | AA         |
