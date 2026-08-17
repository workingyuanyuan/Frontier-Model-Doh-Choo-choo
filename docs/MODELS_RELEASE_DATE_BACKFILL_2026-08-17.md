# `models.json` releaseDate 回填對照表

> 產生於 2026-08-17（task C5-5）。來源：Artificial Analysis `/api/v2/data/llms/models` 的 `release_date`。
> **這張表需要使用者核對。** 代理不認定回填值正確。

依規格 §5.1，`releaseDate` 缺漏**不影響**模型上榜資格；回填是資料品質工作。

## 回填結果

| modelId                           | 顯示名稱               | 原值       | AA 值      | 處置                    |
| --------------------------------- | ---------------------- | ---------- | ---------- | ----------------------- |
| `anthropic-claude-opus-5`         | Claude Opus 5          | 2026-07-24 | 2026-07-24 | already set             |
| `openai-gpt-5-4-mini`             | GPT-5.4 mini           | 2026-03-17 | 2026-03-17 | already set             |
| `openai-gpt-5-6-luna`             | GPT-5.6 Luna           | 2026-07-09 | 2026-07-09 | already set             |
| `openai-gpt-5-6-sol`              | GPT-5.6 Sol            | 2026-07-09 | 2026-07-09 | already set             |
| `openai-gpt-5-6-terra`            | GPT-5.6 Terra          | 2026-07-09 | 2026-07-09 | already set             |
| `alibaba-qwen3-7-max`             | Qwen 3.7 Max           | (null)     | 2026-05-19 | backfilled              |
| `anthropic-claude-fable-5`        | Claude Fable 5         | (null)     | 2026-06-09 | backfilled              |
| `anthropic-claude-opus-4-6`       | Claude Opus 4.6        | (null)     | 2026-02-05 | backfilled              |
| `anthropic-claude-opus-4-7`       | Claude Opus 4.7        | (null)     | 2026-04-16 | backfilled              |
| `anthropic-claude-opus-4-8`       | Claude Opus 4.8        | (null)     | 2026-05-28 | backfilled              |
| `anthropic-claude-sonnet-4-6`     | Claude Sonnet 4.6      | (null)     | 2026-02-17 | backfilled              |
| `anthropic-claude-sonnet-5`       | Claude Sonnet 5        | (null)     | 2026-06-30 | backfilled              |
| `deepseek-deepseek-v4-flash`      | DeepSeek V4 Flash      | (null)     | 2026-07-31 | backfilled              |
| `deepseek-deepseek-v4-pro`        | DeepSeek V4 Pro        | (null)     | 2026-08-13 | backfilled              |
| `google-gemini-3-1-pro-preview`   | Gemini 3.1 Pro Preview | (null)     | 2026-02-19 | backfilled              |
| `google-gemini-3-5-flash`         | Gemini 3.5 Flash       | (null)     | 2026-05-19 | backfilled              |
| `google-gemini-3-6-flash`         | Gemini 3.6 Flash       | (null)     | 2026-07-21 | backfilled              |
| `meta-muse-spark`                 | Muse Spark             | (null)     | 2026-04-08 | backfilled              |
| `meta-muse-spark-1-1`             | Muse Spark 1.1         | (null)     | 2026-07-09 | backfilled              |
| `minimax-minimax-m3`              | MiniMax M3             | (null)     | 2026-06-01 | backfilled              |
| `moonshot-kimi-k2-6`              | Kimi K2.6              | (null)     | 2026-04-20 | backfilled              |
| `moonshot-kimi-k3`                | Kimi K3                | (null)     | 2026-07-16 | backfilled              |
| `openai-gpt-5-2`                  | GPT-5.2                | (null)     | 2025-12-11 | backfilled              |
| `openai-gpt-5-3-codex`            | GPT-5.3 Codex          | (null)     | 2026-02-05 | backfilled              |
| `openai-gpt-5-4`                  | GPT-5.4                | (null)     | 2026-03-05 | backfilled              |
| `openai-gpt-5-4-pro`              | GPT-5.4 Pro            | (null)     | 2026-03-05 | backfilled              |
| `openai-gpt-5-5`                  | GPT-5.5                | (null)     | 2026-04-23 | backfilled              |
| `openai-gpt-5-5-pro`              | GPT-5.5 Pro            | (null)     | 2026-04-23 | backfilled              |
| `xai-grok-4-5`                    | Grok 4.5               | (null)     | 2026-07-08 | backfilled              |
| `xiaomi-mimo-v2-5-pro`            | MiMo V2.5 Pro          | (null)     | 2026-04-22 | backfilled              |
| `zai-glm-5-1`                     | GLM-5.1                | (null)     | 2026-04-07 | backfilled              |
| `zai-glm-5-2`                     | GLM-5.2                | (null)     | 2026-06-16 | backfilled              |
| `anthropic-claude-mythos-preview` | Claude Mythos Preview  | (null)     | -          | no AA match - left null |
| `deepseek-deepseek-v4`            | DeepSeek V4            | (null)     | -          | no AA match - left null |
| `google-gemini-3-pro-preview`     | Gemini 3 Pro Preview   | (null)     | -          | no AA match - left null |
| `nvidia-nemotron-3-ultra`         | Nemotron 3 Ultra       | (null)     | -          | no AA match - left null |
| `openai-gpt-5-2-pro`              | GPT-5.2 Pro            | (null)     | -          | no AA match - left null |
| `thinking-machines-inkling`       | Inkling                | (null)     | -          | no AA match - left null |

## 新增的 catalog 條目

這兩個模型出現在 Artificial Analysis 與 Frontier Code 的資料中，但 catalog 沒有對應條目，因此它們的成績原本會整批被丟棄。它們不是 alias 缺漏，是 catalog 缺項。

| modelId                   | 顯示名稱         | releaseDate |
| ------------------------- | ---------------- | ----------- |
| `google-gemini-3-7-flash` | Gemini 3.7 Flash | 2026-08-13  |
| `xai-grok-4-6`            | Grok 4.6         | 2026-08-12  |

## 沒有 AA 對應、維持 null 的條目

不做模糊匹配。

- `anthropic-claude-mythos-preview`（Claude Mythos Preview）
- `deepseek-deepseek-v4`（DeepSeek V4）
- `google-gemini-3-pro-preview`（Gemini 3 Pro Preview）
- `nvidia-nemotron-3-ultra`（Nemotron 3 Ultra）
- `openai-gpt-5-2-pro`（GPT-5.2 Pro）
- `thinking-machines-inkling`（Inkling）
