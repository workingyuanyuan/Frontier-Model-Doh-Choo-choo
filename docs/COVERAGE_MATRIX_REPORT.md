# Coverage Matrix Report

- **Reference Date**: `2026-08-20`
- **Qualification Window**: 12 months
- **Active Sources (4)**: `artificial-analysis`, `deepswe`, `frontier-code`, `livebench`
- **Qualified Canonical Base Models**: 53
- **Active Benchmarks**: 18

> [!NOTE]
> This report is Gate 2 review material (`docs/REFACTOR_SPEC_V2.md` §5.3, `tasks/claude-code-plan.md` D3).
> It details the empirical coverage tradeoff between retained benchmark count and complete qualified base-model count to inform manual configuration of `data-v2/mappings/display-set.json`.
> It does not modify `display-set.json`.
> Coverage is unioned across a canonical base model's product profiles, as required by the §5.3 model bitmask. D2 main-screen eligibility is stricter: one profile must pass the selected matrix and have all eight rendered dimensions. Complete-model counts here are therefore review upper bounds, not predicted main-screen row counts.

## 1. Tradeoff Curve

For each retained benchmark count $N$ from 1 to the active benchmark count, the table below lists the combination that maximizes the number of complete qualified base models. Deterministic tie-breaking favors higher covered dimension count, then lexicographically earlier benchmark ID lists.

| $N$ | Complete Models |                                Covered Dimensions                                 | Chosen Benchmark IDs                                                                                                                                                                                                                                                                                                             | Matching Model Count & Details               |
| --: | --------------: | :-------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
|   1 |          **41** |                        3/8 (reasoning, knowledge, context)                        | `livebench-reasoning`                                                                                                                                                                                                                                                                                                            | [41 models](#scale-n--1-41-complete-models)  |
|   2 |          **41** |            5/8 (reasoning, knowledge, language, instruction, context)             | `livebench-instruction-following`, `livebench-reasoning`                                                                                                                                                                                                                                                                         | [41 models](#scale-n--2-41-complete-models)  |
|   3 |          **41** |         6/8 (reasoning, math, knowledge, language, instruction, context)          | `livebench-instruction-following`, `livebench-mathematics`, `livebench-reasoning`                                                                                                                                                                                                                                                | [41 models](#scale-n--3-41-complete-models)  |
|   4 |          **41** |         6/8 (reasoning, math, knowledge, language, instruction, context)          | `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`                                                                                                                                                                                                                          | [41 models](#scale-n--4-41-complete-models)  |
|   5 |          **30** |                 5/8 (reasoning, math, knowledge, coding, context)                 | `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `scicode`                                                                                                                                                                                                                                                                  | [30 models](#scale-n--5-30-complete-models)  |
|   6 |          **30** |                 5/8 (reasoning, math, knowledge, coding, context)                 | `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `scicode`                                                                                                                                                                                                                                           | [30 models](#scale-n--6-30-complete-models)  |
|   7 |          **27** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      | `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `scicode`, `tau3-banking`                                                                                                                                                                                                                           | [27 models](#scale-n--7-27-complete-models)  |
|   8 |          **27** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      | `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `scicode`, `tau3-banking`, `terminal-bench-2-1`                                                                                                                                                                                                     | [27 models](#scale-n--8-27-complete-models)  |
|   9 |          **26** |     7/8 (reasoning, math, knowledge, language, instruction, coding, context)      | `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `scicode`                                                                                                                                                         | [26 models](#scale-n--9-26-complete-models)  |
|  10 |          **26** |     7/8 (reasoning, math, knowledge, language, instruction, coding, context)      | `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`                                                                                                                                  | [26 models](#scale-n--10-26-complete-models) |
|  11 |          **24** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`                                                                                                                  | [24 models](#scale-n--11-24-complete-models) |
|  12 |          **24** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`                                                                                            | [24 models](#scale-n--12-24-complete-models) |
|  13 |          **18** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`                                                                            | [18 models](#scale-n--13-18-complete-models) |
|  14 |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `critpt`, `deepswe-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`                                                             | [14 models](#scale-n--14-14-complete-models) |
|  15 |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`                                        | [11 models](#scale-n--15-11-complete-models) |
|  16 |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`                           | [9 models](#scale-n--16-9-complete-models)   |
|  17 |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `apex-agents`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`            | [2 models](#scale-n--17-2-complete-models)   |
|  18 |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `apex-agents`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `ifbench`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1` | [1 models](#scale-n--18-1-complete-models)   |

## 2. Tradeoff Combination Model Details

Complete qualified base-model lists for each optimal combination in the tradeoff curve.

### Scale N = 1 (41 complete models)

- **Chosen Benchmarks (1)**: `livebench-reasoning`
- **Covered Dimensions (3/8)**: reasoning, knowledge, context
- **Complete Models (41)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-6-plus` (Qwen3.6 Plus)
  - `alibaba-qwen3-7-max` (Qwen 3.7 Max)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-5` (Claude Opus 4.5)
  - `anthropic-claude-opus-4-6` (Claude Opus 4.6)
  - `anthropic-claude-opus-4-7` (Claude Opus 4.7)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash` (Gemini 3.5 Flash)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-1` (Muse Spark 1.1)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-6` (Kimi K2.6)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-2` (GPT-5.2)
  - `openai-gpt-5-2-codex` (GPT-5.2 Codex)
  - `openai-gpt-5-4` (GPT-5.4)
  - `openai-gpt-5-4-mini` (GPT-5.4 mini)
  - `openai-gpt-5-4-nano` (GPT-5.4 nano)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `xai-grok-build-0-1` (Grok Build 0.1)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 2 (41 complete models)

- **Chosen Benchmarks (2)**: `livebench-instruction-following`, `livebench-reasoning`
- **Covered Dimensions (5/8)**: reasoning, knowledge, language, instruction, context
- **Complete Models (41)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-6-plus` (Qwen3.6 Plus)
  - `alibaba-qwen3-7-max` (Qwen 3.7 Max)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-5` (Claude Opus 4.5)
  - `anthropic-claude-opus-4-6` (Claude Opus 4.6)
  - `anthropic-claude-opus-4-7` (Claude Opus 4.7)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash` (Gemini 3.5 Flash)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-1` (Muse Spark 1.1)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-6` (Kimi K2.6)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-2` (GPT-5.2)
  - `openai-gpt-5-2-codex` (GPT-5.2 Codex)
  - `openai-gpt-5-4` (GPT-5.4)
  - `openai-gpt-5-4-mini` (GPT-5.4 mini)
  - `openai-gpt-5-4-nano` (GPT-5.4 nano)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `xai-grok-build-0-1` (Grok Build 0.1)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 3 (41 complete models)

- **Chosen Benchmarks (3)**: `livebench-instruction-following`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Complete Models (41)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-6-plus` (Qwen3.6 Plus)
  - `alibaba-qwen3-7-max` (Qwen 3.7 Max)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-5` (Claude Opus 4.5)
  - `anthropic-claude-opus-4-6` (Claude Opus 4.6)
  - `anthropic-claude-opus-4-7` (Claude Opus 4.7)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash` (Gemini 3.5 Flash)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-1` (Muse Spark 1.1)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-6` (Kimi K2.6)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-2` (GPT-5.2)
  - `openai-gpt-5-2-codex` (GPT-5.2 Codex)
  - `openai-gpt-5-4` (GPT-5.4)
  - `openai-gpt-5-4-mini` (GPT-5.4 mini)
  - `openai-gpt-5-4-nano` (GPT-5.4 nano)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `xai-grok-build-0-1` (Grok Build 0.1)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 4 (41 complete models)

- **Chosen Benchmarks (4)**: `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Complete Models (41)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-6-plus` (Qwen3.6 Plus)
  - `alibaba-qwen3-7-max` (Qwen 3.7 Max)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-5` (Claude Opus 4.5)
  - `anthropic-claude-opus-4-6` (Claude Opus 4.6)
  - `anthropic-claude-opus-4-7` (Claude Opus 4.7)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash` (Gemini 3.5 Flash)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-1` (Muse Spark 1.1)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-6` (Kimi K2.6)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-2` (GPT-5.2)
  - `openai-gpt-5-2-codex` (GPT-5.2 Codex)
  - `openai-gpt-5-4` (GPT-5.4)
  - `openai-gpt-5-4-mini` (GPT-5.4 mini)
  - `openai-gpt-5-4-nano` (GPT-5.4 nano)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `xai-grok-build-0-1` (Grok Build 0.1)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 5 (30 complete models)

- **Chosen Benchmarks (5)**: `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `scicode`
- **Covered Dimensions (5/8)**: reasoning, math, knowledge, coding, context
- **Complete Models (30)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-7-plus` (Qwen3.7 Plus)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash` (Gemini 3.5 Flash)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `nvidia-nemotron-3-ultra` (Nemotron 3 Ultra)
  - `openai-gpt-5-3-codex` (GPT-5.3 Codex)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `xiaomi-mimo-v2-5-pro` (MiMo V2.5 Pro)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 6 (30 complete models)

- **Chosen Benchmarks (6)**: `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `scicode`
- **Covered Dimensions (5/8)**: reasoning, math, knowledge, coding, context
- **Complete Models (30)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-7-plus` (Qwen3.7 Plus)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash` (Gemini 3.5 Flash)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `nvidia-nemotron-3-ultra` (Nemotron 3 Ultra)
  - `openai-gpt-5-3-codex` (GPT-5.3 Codex)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `xiaomi-mimo-v2-5-pro` (MiMo V2.5 Pro)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 7 (27 complete models)

- **Chosen Benchmarks (7)**: `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `scicode`, `tau3-banking`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Complete Models (27)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-7-plus` (Qwen3.7 Plus)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `nvidia-nemotron-3-ultra` (Nemotron 3 Ultra)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `xiaomi-mimo-v2-5-pro` (MiMo V2.5 Pro)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 8 (27 complete models)

- **Chosen Benchmarks (8)**: `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `scicode`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Complete Models (27)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-7-plus` (Qwen3.7 Plus)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `nvidia-nemotron-3-ultra` (Nemotron 3 Ultra)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `xiaomi-mimo-v2-5-pro` (MiMo V2.5 Pro)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 9 (26 complete models)

- **Chosen Benchmarks (9)**: `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `scicode`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, language, instruction, coding, context
- **Complete Models (26)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash` (Gemini 3.5 Flash)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 10 (26 complete models)

- **Chosen Benchmarks (10)**: `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, language, instruction, coding, context
- **Complete Models (26)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash` (Gemini 3.5 Flash)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 11 (24 complete models)

- **Chosen Benchmarks (11)**: `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (24)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 12 (24 complete models)

- **Chosen Benchmarks (12)**: `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (24)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-8-27b` (Qwen3.8 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k2-7-code` (Kimi K2.7 Code)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-3` (Grok 4.3)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 13 (18 complete models)

- **Chosen Benchmarks (13)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `critpt`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (18)**:
  - `alibaba-qwen3-6-27b` (Qwen3.6 27B)
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-5-flash-lite` (Gemini 3.5 Flash-Lite)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `minimax-minimax-m3` (MiniMax M3)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `thinking-machines-inkling` (Inkling)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 14 (14 complete models)

- **Chosen Benchmarks (14)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `critpt`, `deepswe-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (14)**:
  - `alibaba-qwen3-8-max` (Qwen3.8 Max)
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `google-gemini-3-1-pro-preview` (Gemini 3.1 Pro Preview)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `meta-muse-spark-1-2` (Muse Spark 1.2)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 15 (11 complete models)

- **Chosen Benchmarks (15)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (11)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 16 (9 complete models)

- **Chosen Benchmarks (16)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (9)**:
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `xai-grok-4-5` (Grok 4.5)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 17 (2 complete models)

- **Chosen Benchmarks (17)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `apex-agents`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (2)**:
  - `moonshot-kimi-k3` (Kimi K3)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 18 (1 complete models)

- **Chosen Benchmarks (18)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `apex-agents`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `ifbench`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (1)**:
  - `zai-glm-5-2` (GLM-5.2)

## 3. Qualified Model × Active Benchmark Presence Matrix

Presence indicates that the qualified base model has an eligible current result with non-null normalized score for the benchmark in an active whitelisted source.

| Model                    | Model ID                          | Total | `aa-briefcase` | `aa-lcr` | `aa-omniscience` | `apex-agents` | `critpt` | `deepswe-1-1` | `frontier-code-1-1` | `gdpval-aa` | `gpqa-diamond` | `humanitys-last-exam` | `ifbench` | `livebench-instruction-following` | `livebench-language` | `livebench-mathematics` | `livebench-reasoning` | `scicode` | `tau3-banking` | `terminal-bench-2-1` |
| ------------------------ | --------------------------------- | ----: | :------------: | :------: | :--------------: | :-----------: | :------: | :-----------: | :-----------------: | :---------: | :------------: | :-------------------: | :-------: | :-------------------------------: | :------------------: | :---------------------: | :-------------------: | :-------: | :------------: | :------------------: |
| Qwen3.6 27B              | `alibaba-qwen3-6-27b`             | 15/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       -       |          -          |      ✓      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Qwen3.6 Plus             | `alibaba-qwen3-6-plus`            |  4/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| Qwen 3.7 Max             | `alibaba-qwen3-7-max`             |  4/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| Qwen3.7 Plus             | `alibaba-qwen3-7-plus`            | 12/18 |       -        |    ✓     |        ✓         |       ✓       |    ✓     |       -       |          ✓          |      ✓      |       ✓        |           ✓           |     ✓     |                 -                 |          -           |            -            |           -           |     ✓     |       ✓        |          ✓           |
| Qwen3.8 27B              | `alibaba-qwen3-8-27b`             | 12/18 |       -        |    ✓     |        ✓         |       -       |    ✓     |       -       |          -          |      -      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Qwen3.8 Max              | `alibaba-qwen3-8-max`             | 14/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          -          |      -      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Claude Fable 5           | `anthropic-claude-fable-5`        | 16/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      -      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Claude Mythos Preview    | `anthropic-claude-mythos-preview` |  0/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 -                 |          -           |            -            |           -           |     -     |       -        |          -           |
| Claude Opus 4.5          | `anthropic-claude-opus-4-5`       |  4/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| Claude Opus 4.6          | `anthropic-claude-opus-4-6`       |  5/18 |       -        |    -     |        -         |       -       |    -     |       -       |          ✓          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| Claude Opus 4.7          | `anthropic-claude-opus-4-7`       |  5/18 |       -        |    -     |        -         |       -       |    -     |       -       |          ✓          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| Claude Opus 4.8          | `anthropic-claude-opus-4-8`       |  6/18 |       -        |    -     |        -         |       -       |    -     |       ✓       |          ✓          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| Claude Opus 5            | `anthropic-claude-opus-5`         | 16/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Claude Sonnet 4.6        | `anthropic-claude-sonnet-4-6`     | 13/18 |       -        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      -      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       -        |          -           |
| Claude Sonnet 5          | `anthropic-claude-sonnet-5`       | 16/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| DeepSeek V4              | `deepseek-deepseek-v4`            |  0/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 -                 |          -           |            -            |           -           |     -     |       -        |          -           |
| DeepSeek V4 Flash        | `deepseek-deepseek-v4-flash`      | 16/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| DeepSeek V4 Pro          | `deepseek-deepseek-v4-pro`        | 14/18 |       -        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      -      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Gemini 3.1 Pro Preview   | `google-gemini-3-1-pro-preview`   | 17/18 |       ✓        |    ✓     |        ✓         |       ✓       |    ✓     |       ✓       |          -          |      ✓      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Gemini 3.5 Flash         | `google-gemini-3-5-flash`         | 13/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          -          |      -      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       -        |          -           |
| Gemini 3.5 Flash-Lite    | `google-gemini-3-5-flash-lite`    | 13/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       -       |          -          |      -      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Gemini 3.6 Flash         | `google-gemini-3-6-flash`         | 16/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Gemini 3.7 Flash         | `google-gemini-3-7-flash`         | 16/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Gemini 3 Pro Preview     | `google-gemini-3-pro-preview`     |  0/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 -                 |          -           |            -            |           -           |     -     |       -        |          -           |
| Muse Spark               | `meta-muse-spark`                 |  0/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 -                 |          -           |            -            |           -           |     -     |       -        |          -           |
| Muse Spark 1.1           | `meta-muse-spark-1-1`             |  5/18 |       -        |    -     |        -         |       -       |    -     |       ✓       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| Muse Spark 1.2           | `meta-muse-spark-1-2`             | 14/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          -          |      -      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| MiniMax M3               | `minimax-minimax-m3`              | 15/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       -       |          ✓          |      -      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Kimi K2.6                | `moonshot-kimi-k2-6`              |  4/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| Kimi K2.7 Code           | `moonshot-kimi-k2-7-code`         | 15/18 |       -        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          -          |      ✓      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Kimi K3                  | `moonshot-kimi-k3`                | 17/18 |       ✓        |    ✓     |        ✓         |       ✓       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Nemotron 3 Ultra         | `nvidia-nemotron-3-ultra`         | 10/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       -       |          -          |      -      |       ✓        |           ✓           |     ✓     |                 -                 |          -           |            -            |           -           |     ✓     |       ✓        |          ✓           |
| GPT-5.2                  | `openai-gpt-5-2`                  |  4/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| GPT-5.2 Codex            | `openai-gpt-5-2-codex`            |  4/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| GPT-5.2 Pro              | `openai-gpt-5-2-pro`              |  0/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 -                 |          -           |            -            |           -           |     -     |       -        |          -           |
| GPT-5.3 Codex            | `openai-gpt-5-3-codex`            |  8/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       -       |          -          |      -      |       ✓        |           ✓           |     ✓     |                 -                 |          -           |            -            |           -           |     ✓     |       -        |          -           |
| GPT-5.4                  | `openai-gpt-5-4`                  |  5/18 |       -        |    -     |        -         |       -       |    -     |       ✓       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| GPT-5.4 mini             | `openai-gpt-5-4-mini`             |  5/18 |       -        |    -     |        -         |       -       |    -     |       -       |          ✓          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| GPT-5.4 nano             | `openai-gpt-5-4-nano`             |  4/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| GPT-5.4 Pro              | `openai-gpt-5-4-pro`              |  0/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 -                 |          -           |            -            |           -           |     -     |       -        |          -           |
| GPT-5.5                  | `openai-gpt-5-5`                  |  6/18 |       -        |    -     |        -         |       -       |    -     |       ✓       |          ✓          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| GPT-5.5 Pro              | `openai-gpt-5-5-pro`              |  1/18 |       -        |    -     |        -         |       -       |    ✓     |       -       |          -          |      -      |       -        |           -           |     -     |                 -                 |          -           |            -            |           -           |     -     |       -        |          -           |
| GPT-5.6 Luna             | `openai-gpt-5-6-luna`             | 16/18 |       -        |    ✓     |        ✓         |       ✓       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| GPT-5.6 Sol              | `openai-gpt-5-6-sol`              | 17/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| GPT-5.6 Terra            | `openai-gpt-5-6-terra`            | 17/18 |       -        |    ✓     |        ✓         |       ✓       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Inkling                  | `thinking-machines-inkling`       | 14/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       -       |          ✓          |      -      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Grok 4.3                 | `xai-grok-4-3`                    | 14/18 |       -        |    ✓     |        ✓         |       -       |    ✓     |       -       |          -          |      ✓      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Grok 4.5                 | `xai-grok-4-5`                    | 16/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Grok 4.6                 | `xai-grok-4-6`                    | 15/18 |       ✓        |    ✓     |        ✓         |       -       |    ✓     |       ✓       |          ✓          |      -      |       ✓        |           ✓           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| Grok Build 0.1           | `xai-grok-build-0-1`              |  4/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 ✓                 |          ✓           |            ✓            |           ✓           |     -     |       -        |          -           |
| MiMo V2.5 Pro            | `xiaomi-mimo-v2-5-pro`            | 12/18 |       ✓        |    ✓     |        ✓         |       ✓       |    ✓     |       -       |          -          |      ✓      |       ✓        |           ✓           |     ✓     |                 -                 |          -           |            -            |           -           |     ✓     |       ✓        |          ✓           |
| GLM-5.1                  | `zai-glm-5-1`                     |  0/18 |       -        |    -     |        -         |       -       |    -     |       -       |          -          |      -      |       -        |           -           |     -     |                 -                 |          -           |            -            |           -           |     -     |       -        |          -           |
| GLM-5.2                  | `zai-glm-5-2`                     | 18/18 |       ✓        |    ✓     |        ✓         |       ✓       |    ✓     |       ✓       |          ✓          |      ✓      |       ✓        |           ✓           |     ✓     |                 ✓                 |          ✓           |            ✓            |           ✓           |     ✓     |       ✓        |          ✓           |
| **Total Models Covered** | —                                 |     — |     **22**     |  **30**  |      **30**      |     **7**     |  **31**  |    **24**     |       **23**        |   **17**    |     **30**     |        **30**         |  **15**   |              **41**               |        **41**        |         **41**          |        **41**         |  **30**   |     **27**     |        **27**        |
