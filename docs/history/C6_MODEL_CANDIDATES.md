# C6 model catalog candidates — APPROVED 2026-08-18

This list is the C6-3 approval artifact. It is derived from exact unresolved
LiveBench/FrontierCode names and the Artificial Analysis API capture retrieved
on 2026-08-18. The user approved all 13 entries and the existing-entry alias;
they are now written to `data-v2/mappings/models.json`.

## Proposed new catalog entries

| modelId                        | provider    | displayName           | proposed alias                  | release date | Exact evidence                                             |
| ------------------------------ | ----------- | --------------------- | ------------------------------- | ------------ | ---------------------------------------------------------- |
| `anthropic-claude-opus-4-5`    | `anthropic` | Claude Opus 4.5       | `claude-opus-4-5`               | 2025-11-24   | AA `claude-opus-4-5-thinking` / LiveBench dated Claude row |
| `google-gemini-3-5-flash-lite` | `google`    | Gemini 3.5 Flash-Lite | `gemini-3.5-flash-lite`         | 2026-07-21   | AA `gemini-3-5-flash-lite` / LiveBench exact base name     |
| `openai-gpt-5-2-codex`         | `openai`    | GPT-5.2 Codex         | `gpt-5.2-codex`                 | 2025-12-11   | AA `gpt-5-2-codex` / LiveBench exact name                  |
| `openai-gpt-5-4-nano`          | `openai`    | GPT-5.4 nano          | `gpt-5.4-nano`                  | 2026-03-17   | AA `gpt-5-4-nano` / LiveBench exact base name              |
| `xai-grok-4-3`                 | `xai`       | Grok 4.3              | `grok-4.3`                      | 2026-04-30   | AA `grok-4-3` / LiveBench exact name                       |
| `xai-grok-build-0-1`           | `xai`       | Grok Build 0.1        | `grok-build-0.1`                | 2026-06-16   | AA `grok-build-0-1-06-16` / LiveBench exact name           |
| `moonshot-kimi-k2-7-code`      | `moonshot`  | Kimi K2.7 Code        | `kimi-k2.7-code`                | 2026-06-12   | AA `kimi-k2-7-code` / LiveBench exact name                 |
| `meta-muse-spark-1-2`          | `meta`      | Muse Spark 1.2        | `muse-spark-1.2`                | 2026-08-05   | AA `muse-spark-1-2` / LiveBench exact base name            |
| `alibaba-qwen3-6-27b`          | `alibaba`   | Qwen3.6 27B           | `qwen3.6-27b`                   | 2026-04-22   | AA `qwen3-6-27b` / LiveBench exact name                    |
| `alibaba-qwen3-6-plus`         | `alibaba`   | Qwen3.6 Plus          | `qwen3.6-plus`                  | 2026-04-02   | AA `qwen3-6-plus` / LiveBench exact name                   |
| `alibaba-qwen3-7-plus`         | `alibaba`   | Qwen3.7 Plus          | `qwen3.7-plus`, `Qwen 3.7 Plus` | 2026-06-01   | AA `qwen3-7-plus` / FrontierCode `Qwen 3.7 Plus`           |
| `alibaba-qwen3-8-27b`          | `alibaba`   | Qwen3.8 27B           | `qwen3.8-27b`                   | 2026-08-14   | AA `qwen3-8-27b` / LiveBench exact name                    |
| `alibaba-qwen3-8-max`          | `alibaba`   | Qwen3.8 Max           | `qwen3.8-max`                   | 2026-08-03   | AA `qwen3-8-max` / LiveBench exact name                    |

Every proposed entry uses empty `pricing` and `profilePricing`; C6 does not
estimate catalog pricing.

## Proposed alias addition to an existing entry

| Existing modelId             | proposed alias           | Evidence                                                                                                                                    |
| ---------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `deepseek-deepseek-v4-flash` | `DeepSeek V4 Flash 0731` | The existing catalog release date is 2026-07-31; AA names the same release `DeepSeek V4 Flash 0731`, and FrontierCode uses that exact name. |

## Explicitly not proposed

- `Kimi K2.7` is not treated as `Kimi K2.7 Code`; the source name is not exact.
- `Smaug-Agentic`, `Composer 2.5`, `SWE-1.6`, `SWE-1.7`, and
  `Mistral 3.5 Medium` have no exact AA catalog evidence in this capture.
- These names remain null; no identity or release date is inferred.

## Applied effect

Only the 13 new entries and one existing-entry alias addition above were
written. The four source snapshots were refreshed against the approved catalog
and the pending effort-inference tables regenerated. Approval of this catalog
list does not approve the separate C6 cross-source effort-inference tables.
