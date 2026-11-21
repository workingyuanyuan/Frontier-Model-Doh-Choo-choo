# Source change report

Catalog observations and stored score snapshots have separate dates. Snapshot-only sources do not claim discovery of unpublished or unparsed upstream benchmarks.

## agents-last-exam

- Checked: 2026-11-21T08:43:50.731Z
- Stored score snapshot: 2026-11-21T08:43:49.689Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## anthropic-releases

- Checked: 2026-11-21T08:44:13.118Z
- Stored score snapshot: 2026-11-21T08:44:10.715Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## arc-prize

- Checked: 2026-11-21T08:43:44.008Z
- Stored score snapshot: 2026-11-21T08:43:40.883Z
- Scope: snapshot-only

| Finding       | Benchmark | Detail                                                                            |
| ------------- | --------- | --------------------------------------------------------------------------------- |
| profiles-lost | arc-agi-2 | 314 -\> 318; missing 1: \["o3-mini (High)","high",null,null,null,null,null,null\] |

## artificial-analysis

- Checked: 2026-11-21T08:42:40.151Z
- Stored score snapshot: 2026-11-21T08:41:25.915Z
- Scope: live-catalog-and-snapshot

| Finding                           | Benchmark                              | Detail                                                                                                                                        |
| --------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| models-lost                       | aa-briefcase                           | 69 -\> 69; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | aa-briefcase                           | 224 -\> 225; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\]                                                        |
| models-lost                       | aa-lcr                                 | 64 -\> 64; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | aa-lcr                                 | 260 -\> 260; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\]                                                        |
| models-lost                       | aa-omniscience                         | 46 -\> 45; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | aa-omniscience                         | 306 -\> 306; missing 2: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\], \["K-EXAONE 2.0",null,null,null,null,null,null,null\] |
| models-lost                       | artificial-analysis-intelligence-index | 45 -\> 44; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | artificial-analysis-intelligence-index | 144 -\> 145; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,null\]                                                          |
| models-lost                       | critpt                                 | 63 -\> 64; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | critpt                                 | 260 -\> 261; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\]                                                        |
| models-lost                       | frontier-code-2-0                      | 46 -\> 45; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | frontier-code-2-0                      | 145 -\> 146; missing 1: \["K-EXAONE 2.0",null,"reasoning","Artificial Analysis Stirrup",true,null,3,262144\]                                  |
| models-lost                       | gdp-pdf                                | 67 -\> 67; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | gdp-pdf                                | 219 -\> 220; missing 1: \["K-EXAONE 2.0",null,"reasoning","Artificial Analysis GDP.pdf",null,null,5,262144\]                                  |
| models-lost                       | gdpval-aa                              | 63 -\> 63; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | gdpval-aa                              | 210 -\> 211; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\]                                                        |
| models-lost                       | gpqa-diamond                           | 47 -\> 47; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | gpqa-diamond                           | 185 -\> 185; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\]                                                        |
| models-lost                       | hle-diamond                            | 48 -\> 47; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | hle-diamond                            | 166 -\> 166; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,false,null,1,262144\]                                                          |
| models-lost                       | humanitys-last-exam                    | 63 -\> 63; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | humanitys-last-exam                    | 259 -\> 259; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\]                                                        |
| models-lost                       | scicode                                | 58 -\> 58; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | scicode                                | 189 -\> 189; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\]                                                        |
| models-lost                       | tau3-banking                           | 44 -\> 44; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | tau3-banking                           | 128 -\> 128; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\]                                                        |
| models-lost                       | terminal-bench-2-1                     | 46 -\> 46; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | terminal-bench-2-1                     | 136 -\> 136; missing 1: \["K-EXAONE 2.0",null,"reasoning",null,null,null,null,262144\]                                                        |
| models-lost                       | terminal-bench-4-0                     | 67 -\> 67; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | terminal-bench-4-0                     | 219 -\> 220; missing 1: \["K-EXAONE 2.0",null,"reasoning","mini-swe-agent",true,null,3,262144\]                                               |
| models-lost                       | terminal-bench-science                 | 46 -\> 45; missing 1: lg-k-exaone-2-0                                                                                                         |
| profiles-lost                     | terminal-bench-science                 | 156 -\> 156; missing 1: \["K-EXAONE 2.0",null,"reasoning","mini-swe-agent",true,null,3,262144\]                                               |
| unintegrated                      | aa-3d                                  | https://artificialanalysis.ai/evaluations/aa-3d                                                                                               |
| unintegrated                      | aa-analyst-agent                       | https://artificialanalysis.ai/evaluations/aa-analyst-agent                                                                                    |
| unintegrated                      | aa-personalitybench                    | https://artificialanalysis.ai/evaluations/aa-personalitybench                                                                                 |
| unintegrated                      | aime-2025                              | https://artificialanalysis.ai/evaluations/aime-2025                                                                                           |
| unintegrated                      | code2video-aa                          | https://artificialanalysis.ai/evaluations/code2video-aa                                                                                       |
| unintegrated                      | enterprise-ops-gym-aa                  | https://artificialanalysis.ai/evaluations/enterprise-ops-gym-aa                                                                               |
| unintegrated                      | frontiercode                           | https://artificialanalysis.ai/evaluations/frontiercode                                                                                        |
| unintegrated                      | global-mmlu-lite                       | https://artificialanalysis.ai/evaluations/global-mmlu-lite                                                                                    |
| unintegrated                      | harvey-lab-aa                          | https://artificialanalysis.ai/evaluations/harvey-lab-aa                                                                                       |
| unintegrated                      | healthbench                            | https://artificialanalysis.ai/evaluations/healthbench                                                                                         |
| unintegrated                      | itbench-aa                             | https://artificialanalysis.ai/evaluations/itbench-aa                                                                                          |
| unintegrated                      | math-500                               | https://artificialanalysis.ai/evaluations/math-500                                                                                            |
| unintegrated                      | mlcr-aa                                | https://artificialanalysis.ai/evaluations/mlcr-aa                                                                                             |
| unintegrated                      | mmmu-pro                               | https://artificialanalysis.ai/evaluations/mmmu-pro                                                                                            |
| catalog-snapshot-version-mismatch | omniscience                            | Directory v1.1; stored scores (unknown)                                                                                                       |
| unintegrated                      | tau2-bench                             | https://artificialanalysis.ai/evaluations/tau2-bench                                                                                          |
| unintegrated                      | terminalbench-hard                     | https://artificialanalysis.ai/evaluations/terminalbench-hard                                                                                  |
| unintegrated                      | vials-aa                               | https://artificialanalysis.ai/evaluations/vials-aa                                                                                            |

| Source catalog entry                                                                                                              | Capture registered | Integration       | Benchmark ID                           | Review note                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AA-3D](https://artificialanalysis.ai/evaluations/aa-3d)                                                                          | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [AA-AnalystAgent](https://artificialanalysis.ai/evaluations/aa-analyst-agent)                                                     | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [AA-Briefcase v1.1](https://artificialanalysis.ai/evaluations/aa-briefcase)                                                       | yes                | scored            | aa-briefcase                           |                                                                                                                                                                                                                                                                                                      |
| [AA-PersonalityBench](https://artificialanalysis.ai/evaluations/aa-personalitybench)                                              | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [AIME 2025](https://artificialanalysis.ai/evaluations/aime-2025)                                                                  | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [APEX-Agents-AA](https://artificialanalysis.ai/evaluations/apex-agents-aa)                                                        | yes                | scored            | apex-agents                            |                                                                                                                                                                                                                                                                                                      |
| [Artificial Analysis Intelligence Index v5.0.1](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index) | yes                | reviewed-deferred | artificial-analysis-intelligence-index | Composite retained separately; excluded from capability scoring by existing policy.                                                                                                                                                                                                                  |
| [AA-LCR v1.1](https://artificialanalysis.ai/evaluations/artificial-analysis-long-context-reasoning)                               | yes                | scored            | aa-lcr                                 |                                                                                                                                                                                                                                                                                                      |
| [AutomationBench-AA](https://artificialanalysis.ai/evaluations/automationbench-aa)                                                | yes                | reviewed-deferred | —                                      | 2026-10-29 user decision: not scored. AA's headline (automationBenchPartialScore) is the average share of objectives completed, while Zapier's organizer leaderboard (automationbench) scores strict task completion; the metrics differ.                                                            |
| [Code2Video-AA](https://artificialanalysis.ai/evaluations/code2video-aa)                                                          | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [CritPt](https://artificialanalysis.ai/evaluations/critpt)                                                                        | yes                | scored            | critpt                                 |                                                                                                                                                                                                                                                                                                      |
| [CritPt v2](https://artificialanalysis.ai/evaluations/critpt-v2)                                                                  | yes                | scored            | critpt-v2                              | 2026-10-28 user decision: AA Intelligence Index v5 additions are scored. Field critptAgentic (Full Set, default leaderboard tab) -\> critpt-v2; the Index's Hard Subset (critptAgenticHard) is not materialized; critpt (v1) is kept as evidence and excluded from scoring (superseded, 2026-10-28). |
| [EnterpriseOps-Gym-AA](https://artificialanalysis.ai/evaluations/enterprise-ops-gym-aa)                                           | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [FrontierCode 1.1](https://artificialanalysis.ai/evaluations/frontiercode)                                                        | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [FrontierCode-AA 2.0](https://artificialanalysis.ai/evaluations/frontiercode-2-0)                                                 | yes                | scored            | frontier-code-2-0                      | 2026-10-28 user decision: AA Intelligence Index v5 additions are scored. Field frontierCode20 -\> frontier-code-2-0, shared with the Cognition organizer source; the organizer row wins every overlapping profile.                                                                                   |
| [GDP.pdf](https://artificialanalysis.ai/evaluations/gdp-pdf)                                                                      | yes                | scored            | gdp-pdf                                |                                                                                                                                                                                                                                                                                                      |
| [GDPval-AA v2.1](https://artificialanalysis.ai/evaluations/gdpval-aa)                                                             | yes                | scored            | gdpval-aa                              |                                                                                                                                                                                                                                                                                                      |
| [Global-MMLU-Lite](https://artificialanalysis.ai/evaluations/global-mmlu-lite)                                                    | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [GPQA Diamond](https://artificialanalysis.ai/evaluations/gpqa-diamond)                                                            | yes                | scored            | gpqa-diamond                           |                                                                                                                                                                                                                                                                                                      |
| [Harvey LAB-AA v1.1](https://artificialanalysis.ai/evaluations/harvey-lab-aa)                                                     | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [HealthBench](https://artificialanalysis.ai/evaluations/healthbench)                                                              | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [HLE-Diamond](https://artificialanalysis.ai/evaluations/hle-diamond)                                                              | yes                | scored            | hle-diamond                            | 2026-10-28 user decision: AA Intelligence Index v5 additions are scored. Field hleDiamond -\> hle-diamond; humanitys-last-exam is kept as evidence and excluded from scoring (superseded, 2026-10-28).                                                                                               |
| [Humanity's Last Exam](https://artificialanalysis.ai/evaluations/humanitys-last-exam)                                             | yes                | scored            | humanitys-last-exam                    |                                                                                                                                                                                                                                                                                                      |
| [IFBench](https://artificialanalysis.ai/evaluations/ifbench)                                                                      | yes                | scored            | ifbench                                |                                                                                                                                                                                                                                                                                                      |
| [ITBench-AA](https://artificialanalysis.ai/evaluations/itbench-aa)                                                                | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [LiveCodeBench](https://artificialanalysis.ai/evaluations/livecodebench)                                                          | yes                | scored            | livecodebench                          |                                                                                                                                                                                                                                                                                                      |
| [MATH-500](https://artificialanalysis.ai/evaluations/math-500)                                                                    | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [MKA](https://artificialanalysis.ai/evaluations/mka)                                                                              | yes                | scored            | mka                                    | 2026-11-12 user decision: score MKA Climb WSR as mka; primary comprehension, secondary agentic, knowledge and reasoning. Unknown version remains null.                                                                                                                                               |
| [MLCR-AA](https://artificialanalysis.ai/evaluations/mlcr-aa)                                                                      | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [MMLU-Pro](https://artificialanalysis.ai/evaluations/mmlu-pro)                                                                    | yes                | scored            | mmlu-pro                               |                                                                                                                                                                                                                                                                                                      |
| [MMMU-Pro](https://artificialanalysis.ai/evaluations/mmmu-pro)                                                                    | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [AA-Omniscience v1.1](https://artificialanalysis.ai/evaluations/omniscience)                                                      | yes                | scored            | aa-omniscience                         |                                                                                                                                                                                                                                                                                                      |
| [SciCode](https://artificialanalysis.ai/evaluations/scicode)                                                                      | yes                | scored            | scicode                                |                                                                                                                                                                                                                                                                                                      |
| [𝜏²-Bench Telecom](https://artificialanalysis.ai/evaluations/tau2-bench)                                                          | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [𝜏³-Banking](https://artificialanalysis.ai/evaluations/tau3-banking)                                                              | yes                | scored            | tau3-banking                           |                                                                                                                                                                                                                                                                                                      |
| [Terminal-Bench-Science 0.1](https://artificialanalysis.ai/evaluations/terminal-bench-science)                                    | yes                | scored            | terminal-bench-science                 | 2026-10-28 user decision: AA Intelligence Index v5 additions are scored. Field terminalBenchScience -\> terminal-bench-science (v0.1, mini-swe-agent, 3 repeats).                                                                                                                                    |
| [Terminal-Bench 2.1](https://artificialanalysis.ai/evaluations/terminalbench-2-1)                                                 | yes                | scored            | terminal-bench-2-1                     |                                                                                                                                                                                                                                                                                                      |
| [Terminal-Bench 4.0](https://artificialanalysis.ai/evaluations/terminalbench-4-0)                                                 | yes                | scored            | terminal-bench-4-0                     | 2026-10-29 user decision: Terminal-Bench 4.0 is scored. Field terminalBench40 -\> terminal-bench-4-0 (66 tasks, mini-swe-agent, pass@1 over 3 repeats), shared with Vals terminal-bench-4; separate from terminal-bench-2-1.                                                                         |
| [Terminal-Bench Hard](https://artificialanalysis.ai/evaluations/terminalbench-hard)                                               | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [VIALS-AA](https://artificialanalysis.ai/evaluations/vials-aa)                                                                    | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |

## biobasicsbench

- Checked: 2026-11-19T02:19:21.933Z
- Stored score snapshot: 2026-11-09T01:51:32.016Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## cwe-bench

- Checked: 2026-11-21T08:42:51.915Z
- Stored score snapshot: 2026-11-21T08:42:50.819Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## deepswe

- Checked: 2026-11-21T08:43:14.974Z
- Stored score snapshot: 2026-11-21T08:43:14.531Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## epoch-ai

- Checked: 2026-11-21T08:43:39.426Z
- Stored score snapshot: 2026-11-21T08:43:37.362Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## frontier-code

- Checked: 2026-11-21T08:43:21.294Z
- Stored score snapshot: 2026-11-21T08:43:20.816Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## frontier-swe

- Checked: 2026-11-21T08:43:26.197Z
- Stored score snapshot: 2026-11-21T08:43:22.510Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## gbench

- Checked: 2026-11-21T12:40:56.254Z
- Stored score snapshot: 2026-11-21T12:40:54.066Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## google-releases

- Checked: 2026-11-19T02:19:21.933Z
- Stored score snapshot: 2026-10-04T04:31:00.008Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## livebench

- Checked: 2026-11-21T08:43:13.235Z
- Stored score snapshot: 2026-11-21T08:43:11.494Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## maxxbench

- Checked: 2026-11-21T08:46:34.599Z
- Stored score snapshot: 2026-11-21T08:46:32.497Z
- Scope: snapshot-only

| Finding       | Benchmark | Detail                                                                         |
| ------------- | --------- | ------------------------------------------------------------------------------ |
| profiles-lost | maxxbench | 17 -\> 21; missing 1: \["DeepSeek V4 Flash","max",null,null,null,null,2,null\] |

## openai-releases

- Checked: 2026-11-21T08:44:13.118Z
- Stored score snapshot: 2026-10-04T04:31:17.114Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## scale-swe-atlas

- Checked: 2026-11-21T08:42:43.733Z
- Stored score snapshot: 2026-11-21T08:42:42.735Z
- Scope: snapshot-only

| Finding       | Benchmark | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| models-lost   | swe-atlas | 24 -\> 0; missing 24: alibaba-qwen3-8-max, anthropic-claude-fable-5-1, anthropic-claude-fable-5-2, anthropic-claude-opus-5-5, anthropic-claude-sonnet-5-5, google-gemini-3-8-flash, google-gemini-4-argon, google-gemini-4-carbon, meta-muse-ember, meta-muse-spark-open, meta-muse-wonder, minimax-minimax-m3, moonshot-kimi-k3, moonshot-kimi-k3-1-pro, nvidia-nemotron-3-ultra, openai-gpt-6-1-sol, openai-gpt-6-1-terra, openai-gpt-6-2-astra, openai-gpt-6-2-sol, openai-gpt-6-astra, openai-gpt-6-luna, reflection-beam-1-0, thinking-machines-inkling-2-small, xai-grok-4-7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| profiles-lost | swe-atlas | 31 -\> 31; missing 31: \["Beam 1.0",null,null,null,null,null,null,null\], \["DeepSeek V4.1 Flash",null,null,null,null,null,null,null\], \["Fable 5.1",null,null,null,null,null,null,null\], \["Fable 5.2",null,null,null,null,null,null,null\], \["GLM 5.3 Flash",null,null,null,null,null,null,null\], \["GLM 5.3",null,null,null,null,null,null,null\], \["GPT-6 Astra",null,null,null,null,null,null,null\], \["GPT-6 Luna",null,null,null,null,null,null,null\], \["GPT-6.1 Sol",null,null,null,null,null,null,null\], \["GPT-6.1 Terra",null,null,null,null,null,null,null\], \["GPT-6.2 Astra",null,null,null,null,null,null,null\], \["GPT-6.2 Sol",null,null,null,null,null,null,null\], \["Gemini 3.8 Flash",null,null,null,null,null,null,null\], \["Gemini 4 Argon",null,null,null,null,null,null,null\], \["Gemini 4 Carbon",null,null,null,null,null,null,null\], \["Grok 4.7",null,null,null,null,null,null,null\], \["Haiku 5.5",null,null,null,null,null,null,null\], \["Inkling 2 Small",null,null,null,null,null,null,null\], \["Kimi K3",null,null,null,null,null,null,null\], \["Kimi K3.1 Pro",null,null,null,null,null,null,null\], \["MiniMax M3",null,null,null,null,null,null,null\], \["Mistral Large 4",null,null,null,null,null,null,null\], \["Muse Ember 1.0",null,null,null,null,null,null,null\], \["Muse Spark Open",null,null,null,null,null,null,null\], \["Muse Wonder 1.0",null,null,null,null,null,null,null\], \["Nemotron 3 Ultra",null,null,null,null,null,null,null\], \["Nemotron 3.5 Super VL",null,null,null,null,null,null,null\], \["Opus 5.5",null,null,null,null,null,null,null\], \["Qwen 3.8 Max",null,null,null,null,null,null,null\], \["Sonnet 5.5",null,null,null,null,null,null,null\], \["gpt-oss-120b",null,null,null,null,null,null,null\] |

## surge-chartography

- Checked: 2026-11-21T08:42:45.210Z
- Stored score snapshot: 2026-11-21T08:42:44.905Z
- Scope: live-catalog-and-snapshot

| Finding      | Benchmark | Detail                                |
| ------------ | --------- | ------------------------------------- |
| unintegrated | gdp-pdf   | https://surgehq.ai/benchmarks/gdp-pdf |
| unintegrated | sudo-l7   | https://surgehq.ai/benchmarks/sudo-l7 |

| Source catalog entry                                                                                        | Capture registered | Integration       | Benchmark ID              | Review note                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| [View Antidote: Everyday Edition benchmark](https://surgehq.ai/benchmarks/antidote)                         | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Chartography benchmark](https://surgehq.ai/benchmarks/chartography)                                   | yes                | scored            | chartography              |                                                                                  |
| [View ComplexConstraints benchmark](https://surgehq.ai/benchmarks/complex-constraints)                      | no                 | scored            | complex-constraints       |                                                                                  |
| [View DAYJOB: Finance benchmark](https://surgehq.ai/benchmarks/dayjob-finance)                              | yes                | scored            | dayjob-finance            |                                                                                  |
| [View DAYJOB: Healthcare benchmark](https://surgehq.ai/benchmarks/dayjob-healthcare)                        | yes                | scored            | dayjob-healthcare         |                                                                                  |
| [View DAYJOB: Law benchmark](https://surgehq.ai/benchmarks/dayjob-law)                                      | yes                | scored            | dayjob-law                |                                                                                  |
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-complex-constraints

- Checked: 2026-11-21T08:42:47.111Z
- Stored score snapshot: 2026-11-21T08:42:46.832Z
- Scope: live-catalog-and-snapshot

| Finding      | Benchmark | Detail                                |
| ------------ | --------- | ------------------------------------- |
| unintegrated | gdp-pdf   | https://surgehq.ai/benchmarks/gdp-pdf |
| unintegrated | sudo-l7   | https://surgehq.ai/benchmarks/sudo-l7 |

| Source catalog entry                                                                                        | Capture registered | Integration       | Benchmark ID              | Review note                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| [View Antidote: Everyday Edition benchmark](https://surgehq.ai/benchmarks/antidote)                         | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Chartography benchmark](https://surgehq.ai/benchmarks/chartography)                                   | yes                | scored            | chartography              |                                                                                  |
| [View ComplexConstraints benchmark](https://surgehq.ai/benchmarks/complex-constraints)                      | no                 | scored            | complex-constraints       |                                                                                  |
| [View DAYJOB: Finance benchmark](https://surgehq.ai/benchmarks/dayjob-finance)                              | yes                | scored            | dayjob-finance            |                                                                                  |
| [View DAYJOB: Healthcare benchmark](https://surgehq.ai/benchmarks/dayjob-healthcare)                        | yes                | scored            | dayjob-healthcare         |                                                                                  |
| [View DAYJOB: Law benchmark](https://surgehq.ai/benchmarks/dayjob-law)                                      | yes                | scored            | dayjob-law                |                                                                                  |
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-corecraft

- Checked: 2026-11-21T08:43:27.599Z
- Stored score snapshot: 2026-11-21T08:43:27.343Z
- Scope: live-catalog-and-snapshot

| Finding      | Benchmark | Detail                                |
| ------------ | --------- | ------------------------------------- |
| unintegrated | gdp-pdf   | https://surgehq.ai/benchmarks/gdp-pdf |
| unintegrated | sudo-l7   | https://surgehq.ai/benchmarks/sudo-l7 |

| Source catalog entry                                                                                        | Capture registered | Integration       | Benchmark ID              | Review note                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| [View Antidote: Everyday Edition benchmark](https://surgehq.ai/benchmarks/antidote)                         | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Chartography benchmark](https://surgehq.ai/benchmarks/chartography)                                   | yes                | scored            | chartography              |                                                                                  |
| [View ComplexConstraints benchmark](https://surgehq.ai/benchmarks/complex-constraints)                      | no                 | scored            | complex-constraints       |                                                                                  |
| [View DAYJOB: Finance benchmark](https://surgehq.ai/benchmarks/dayjob-finance)                              | yes                | scored            | dayjob-finance            |                                                                                  |
| [View DAYJOB: Healthcare benchmark](https://surgehq.ai/benchmarks/dayjob-healthcare)                        | yes                | scored            | dayjob-healthcare         |                                                                                  |
| [View DAYJOB: Law benchmark](https://surgehq.ai/benchmarks/dayjob-law)                                      | yes                | scored            | dayjob-law                |                                                                                  |
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-dayjob-finance

- Checked: 2026-11-21T08:43:30.758Z
- Stored score snapshot: 2026-11-21T08:43:30.512Z
- Scope: live-catalog-and-snapshot

| Finding      | Benchmark | Detail                                |
| ------------ | --------- | ------------------------------------- |
| unintegrated | gdp-pdf   | https://surgehq.ai/benchmarks/gdp-pdf |
| unintegrated | sudo-l7   | https://surgehq.ai/benchmarks/sudo-l7 |

| Source catalog entry                                                                                        | Capture registered | Integration       | Benchmark ID              | Review note                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| [View Antidote: Everyday Edition benchmark](https://surgehq.ai/benchmarks/antidote)                         | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Chartography benchmark](https://surgehq.ai/benchmarks/chartography)                                   | yes                | scored            | chartography              |                                                                                  |
| [View ComplexConstraints benchmark](https://surgehq.ai/benchmarks/complex-constraints)                      | no                 | scored            | complex-constraints       |                                                                                  |
| [View DAYJOB: Finance benchmark](https://surgehq.ai/benchmarks/dayjob-finance)                              | yes                | scored            | dayjob-finance            |                                                                                  |
| [View DAYJOB: Healthcare benchmark](https://surgehq.ai/benchmarks/dayjob-healthcare)                        | yes                | scored            | dayjob-healthcare         |                                                                                  |
| [View DAYJOB: Law benchmark](https://surgehq.ai/benchmarks/dayjob-law)                                      | yes                | scored            | dayjob-law                |                                                                                  |
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-dayjob-healthcare

- Checked: 2026-11-21T08:43:32.590Z
- Stored score snapshot: 2026-11-21T08:43:32.111Z
- Scope: live-catalog-and-snapshot

| Finding      | Benchmark | Detail                                |
| ------------ | --------- | ------------------------------------- |
| unintegrated | gdp-pdf   | https://surgehq.ai/benchmarks/gdp-pdf |
| unintegrated | sudo-l7   | https://surgehq.ai/benchmarks/sudo-l7 |

| Source catalog entry                                                                                        | Capture registered | Integration       | Benchmark ID              | Review note                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| [View Antidote: Everyday Edition benchmark](https://surgehq.ai/benchmarks/antidote)                         | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Chartography benchmark](https://surgehq.ai/benchmarks/chartography)                                   | yes                | scored            | chartography              |                                                                                  |
| [View ComplexConstraints benchmark](https://surgehq.ai/benchmarks/complex-constraints)                      | no                 | scored            | complex-constraints       |                                                                                  |
| [View DAYJOB: Finance benchmark](https://surgehq.ai/benchmarks/dayjob-finance)                              | yes                | scored            | dayjob-finance            |                                                                                  |
| [View DAYJOB: Healthcare benchmark](https://surgehq.ai/benchmarks/dayjob-healthcare)                        | yes                | scored            | dayjob-healthcare         |                                                                                  |
| [View DAYJOB: Law benchmark](https://surgehq.ai/benchmarks/dayjob-law)                                      | yes                | scored            | dayjob-law                |                                                                                  |
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-dayjob-law

- Checked: 2026-11-21T08:42:49.174Z
- Stored score snapshot: 2026-11-21T08:42:48.873Z
- Scope: live-catalog-and-snapshot

| Finding      | Benchmark | Detail                                |
| ------------ | --------- | ------------------------------------- |
| unintegrated | gdp-pdf   | https://surgehq.ai/benchmarks/gdp-pdf |
| unintegrated | sudo-l7   | https://surgehq.ai/benchmarks/sudo-l7 |

| Source catalog entry                                                                                        | Capture registered | Integration       | Benchmark ID              | Review note                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| [View Antidote: Everyday Edition benchmark](https://surgehq.ai/benchmarks/antidote)                         | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Chartography benchmark](https://surgehq.ai/benchmarks/chartography)                                   | yes                | scored            | chartography              |                                                                                  |
| [View ComplexConstraints benchmark](https://surgehq.ai/benchmarks/complex-constraints)                      | no                 | scored            | complex-constraints       |                                                                                  |
| [View DAYJOB: Finance benchmark](https://surgehq.ai/benchmarks/dayjob-finance)                              | yes                | scored            | dayjob-finance            |                                                                                  |
| [View DAYJOB: Healthcare benchmark](https://surgehq.ai/benchmarks/dayjob-healthcare)                        | yes                | scored            | dayjob-healthcare         |                                                                                  |
| [View DAYJOB: Law benchmark](https://surgehq.ai/benchmarks/dayjob-law)                                      | yes                | scored            | dayjob-law                |                                                                                  |
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-dayjob-tax

- Checked: 2026-11-21T08:43:34.164Z
- Stored score snapshot: 2026-11-21T08:43:33.933Z
- Scope: live-catalog-and-snapshot

| Finding      | Benchmark | Detail                                |
| ------------ | --------- | ------------------------------------- |
| unintegrated | gdp-pdf   | https://surgehq.ai/benchmarks/gdp-pdf |
| unintegrated | sudo-l7   | https://surgehq.ai/benchmarks/sudo-l7 |

| Source catalog entry                                                                                        | Capture registered | Integration       | Benchmark ID              | Review note                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| [View Antidote: Everyday Edition benchmark](https://surgehq.ai/benchmarks/antidote)                         | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Chartography benchmark](https://surgehq.ai/benchmarks/chartography)                                   | yes                | scored            | chartography              |                                                                                  |
| [View ComplexConstraints benchmark](https://surgehq.ai/benchmarks/complex-constraints)                      | no                 | scored            | complex-constraints       |                                                                                  |
| [View DAYJOB: Finance benchmark](https://surgehq.ai/benchmarks/dayjob-finance)                              | yes                | scored            | dayjob-finance            |                                                                                  |
| [View DAYJOB: Healthcare benchmark](https://surgehq.ai/benchmarks/dayjob-healthcare)                        | yes                | scored            | dayjob-healthcare         |                                                                                  |
| [View DAYJOB: Law benchmark](https://surgehq.ai/benchmarks/dayjob-law)                                      | yes                | scored            | dayjob-law                |                                                                                  |
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-gdp-xlsx

- Checked: 2026-11-21T08:43:35.915Z
- Stored score snapshot: 2026-11-21T08:43:35.682Z
- Scope: live-catalog-and-snapshot

| Finding      | Benchmark | Detail                                |
| ------------ | --------- | ------------------------------------- |
| unintegrated | gdp-pdf   | https://surgehq.ai/benchmarks/gdp-pdf |
| unintegrated | sudo-l7   | https://surgehq.ai/benchmarks/sudo-l7 |

| Source catalog entry                                                                                        | Capture registered | Integration       | Benchmark ID              | Review note                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| [View Antidote: Everyday Edition benchmark](https://surgehq.ai/benchmarks/antidote)                         | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Chartography benchmark](https://surgehq.ai/benchmarks/chartography)                                   | yes                | scored            | chartography              |                                                                                  |
| [View ComplexConstraints benchmark](https://surgehq.ai/benchmarks/complex-constraints)                      | no                 | scored            | complex-constraints       |                                                                                  |
| [View DAYJOB: Finance benchmark](https://surgehq.ai/benchmarks/dayjob-finance)                              | yes                | scored            | dayjob-finance            |                                                                                  |
| [View DAYJOB: Healthcare benchmark](https://surgehq.ai/benchmarks/dayjob-healthcare)                        | yes                | scored            | dayjob-healthcare         |                                                                                  |
| [View DAYJOB: Law benchmark](https://surgehq.ai/benchmarks/dayjob-law)                                      | yes                | scored            | dayjob-law                |                                                                                  |
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-riemann

- Checked: 2026-11-21T08:43:29.212Z
- Stored score snapshot: 2026-11-21T08:43:28.993Z
- Scope: live-catalog-and-snapshot

| Finding      | Benchmark | Detail                                |
| ------------ | --------- | ------------------------------------- |
| unintegrated | gdp-pdf   | https://surgehq.ai/benchmarks/gdp-pdf |
| unintegrated | sudo-l7   | https://surgehq.ai/benchmarks/sudo-l7 |

| Source catalog entry                                                                                        | Capture registered | Integration       | Benchmark ID              | Review note                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| [View Antidote: Everyday Edition benchmark](https://surgehq.ai/benchmarks/antidote)                         | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Chartography benchmark](https://surgehq.ai/benchmarks/chartography)                                   | yes                | scored            | chartography              |                                                                                  |
| [View ComplexConstraints benchmark](https://surgehq.ai/benchmarks/complex-constraints)                      | no                 | scored            | complex-constraints       |                                                                                  |
| [View DAYJOB: Finance benchmark](https://surgehq.ai/benchmarks/dayjob-finance)                              | yes                | scored            | dayjob-finance            |                                                                                  |
| [View DAYJOB: Healthcare benchmark](https://surgehq.ai/benchmarks/dayjob-healthcare)                        | yes                | scored            | dayjob-healthcare         |                                                                                  |
| [View DAYJOB: Law benchmark](https://surgehq.ai/benchmarks/dayjob-law)                                      | yes                | scored            | dayjob-law                |                                                                                  |
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## terminal-bench

- Checked: 2026-11-21T08:42:55.759Z
- Stored score snapshot: 2026-11-21T08:42:53.069Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## vals-ai

- Checked: 2026-11-21T08:52:52.923Z
- Stored score snapshot: 2026-11-21T08:52:43.955Z
- Scope: live-catalog-and-snapshot

| Finding             | Benchmark                | Detail                                                  |
| ------------------- | ------------------------ | ------------------------------------------------------- |
| captured-not-scored | aime                     | https://www.vals.ai/benchmarks/aime                     |
| captured-not-scored | biomysterybench          | https://www.vals.ai/benchmarks/biomysterybench          |
| captured-not-scored | case_law_v2              | https://www.vals.ai/benchmarks/case_law_v2              |
| captured-not-scored | claimbench               | https://www.vals.ai/benchmarks/claimbench               |
| captured-not-scored | code-migration-v1-1      | https://www.vals.ai/benchmarks/code-migration-v1-1      |
| captured-not-scored | cua_bench                | https://www.vals.ai/benchmarks/cua_bench                |
| unintegrated        | cyber_offense            | https://www.vals.ai/benchmarks/cyber_offense            |
| captured-not-scored | emb-v1-1                 | https://www.vals.ai/benchmarks/emb-v1-1                 |
| captured-not-scored | fabv2-1                  | https://www.vals.ai/benchmarks/fabv2-1                  |
| captured-not-scored | financial-coaching-bench | https://www.vals.ai/benchmarks/financial-coaching-bench |
| captured-not-scored | hlab-v1                  | https://www.vals.ai/benchmarks/hlab-v1                  |
| captured-not-scored | immigration              | https://www.vals.ai/benchmarks/immigration              |
| unintegrated        | inference_provider       | https://www.vals.ai/benchmarks/inference_provider       |
| captured-not-scored | math500                  | https://www.vals.ai/benchmarks/math500                  |
| captured-not-scored | medqa                    | https://www.vals.ai/benchmarks/medqa                    |
| unintegrated        | mental-health            | https://www.vals.ai/benchmarks/mental-health            |
| captured-not-scored | mgsm                     | https://www.vals.ai/benchmarks/mgsm                     |
| captured-not-scored | mmmu                     | https://www.vals.ai/benchmarks/mmmu                     |
| captured-not-scored | mortgage_tax             | https://www.vals.ai/benchmarks/mortgage_tax             |
| captured-not-scored | mysterymechanism         | https://www.vals.ai/benchmarks/mysterymechanism         |
| captured-not-scored | poker_agent              | https://www.vals.ai/benchmarks/poker_agent              |
| captured-not-scored | public-benefits-bench-v1 | https://www.vals.ai/benchmarks/public-benefits-bench-v1 |
| captured-not-scored | rctbench                 | https://www.vals.ai/benchmarks/rctbench                 |
| captured-not-scored | robo_bench               | https://www.vals.ai/benchmarks/robo_bench               |
| unintegrated        | rsi_index                | https://www.vals.ai/benchmarks/rsi_index                |
| captured-not-scored | sage                     | https://www.vals.ai/benchmarks/sage                     |
| captured-not-scored | science_index            | https://www.vals.ai/benchmarks/science_index            |
| captured-not-scored | srebench                 | https://www.vals.ai/benchmarks/srebench                 |
| captured-not-scored | swebench-multimodal      | https://www.vals.ai/benchmarks/swebench-multimodal      |
| captured-not-scored | tax_agent_bench          | https://www.vals.ai/benchmarks/tax_agent_bench          |
| captured-not-scored | terminal-bench-2         | https://www.vals.ai/benchmarks/terminal-bench-2         |
| captured-not-scored | terminal-bench-science   | https://www.vals.ai/benchmarks/terminal-bench-science   |
| unintegrated        | vals_router_index        | https://www.vals.ai/benchmarks/vals_router_index        |
| captured-not-scored | vcb-1-100                | https://www.vals.ai/benchmarks/vcb-1-100                |
| captured-not-scored | vcb-1-100-v1-1           | https://www.vals.ai/benchmarks/vcb-1-100-v1-1           |
| captured-not-scored | voice-code-bench         | https://www.vals.ai/benchmarks/voice-code-bench         |

| Source catalog entry                                                                | Capture registered | Integration         | Benchmark ID             | Review note                                                                                                                    |
| ----------------------------------------------------------------------------------- | ------------------ | ------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| [Access to Justice Benchmark](https://www.vals.ai/benchmarks/a2j)                   | yes                | scored              | a2j                      | 2026-11-12 user decision: score Access to Justice source accuracy as a2j; primary knowledge, secondary reasoning and language. |
| [AIME](https://www.vals.ai/benchmarks/aime)                                         | yes                | captured-not-scored | aime                     |                                                                                                                                |
| [Autoform-Hard](https://www.vals.ai/benchmarks/autoform_hard)                       | yes                | scored              | autoform-hard            |                                                                                                                                |
| [BioMysteryBench](https://www.vals.ai/benchmarks/biomysterybench)                   | yes                | captured-not-scored | biomysterybench          |                                                                                                                                |
| [CaseLaw v2](https://www.vals.ai/benchmarks/case_law_v2)                            | yes                | captured-not-scored | case-law-v2              |                                                                                                                                |
| [ClaimBench](https://www.vals.ai/benchmarks/claimbench)                             | yes                | captured-not-scored | claimbench               |                                                                                                                                |
| [Code Migration](https://www.vals.ai/benchmarks/code-migration)                     | yes                | scored              | code-migration           |                                                                                                                                |
| [Code Migration v1.1](https://www.vals.ai/benchmarks/code-migration-v1-1)           | yes                | captured-not-scored | code-migration-v1-1      |                                                                                                                                |
| [CorpFin v2](https://www.vals.ai/benchmarks/corp_fin_v2)                            | yes                | scored              | corpfin                  |                                                                                                                                |
| [CUA-bench](https://www.vals.ai/benchmarks/cua_bench)                               | yes                | captured-not-scored | cua-bench                |                                                                                                                                |
| [CyberBench v1.1](https://www.vals.ai/benchmarks/cyber)                             | yes                | scored              | cyber                    |                                                                                                                                |
| [CyberOffense](https://www.vals.ai/benchmarks/cyber_offense)                        | yes                | unintegrated        | —                        |                                                                                                                                |
| [Excel Modeling Benchmark](https://www.vals.ai/benchmarks/emb)                      | yes                | scored              | emb                      |                                                                                                                                |
| [Excel Modeling Benchmark v1.1](https://www.vals.ai/benchmarks/emb-v1-1)            | yes                | captured-not-scored | emb-v1-1                 |                                                                                                                                |
| [Finance Agent v2](https://www.vals.ai/benchmarks/fabv2)                            | yes                | scored              | finance-agent-v2         |                                                                                                                                |
| [Finance Agent v2.1](https://www.vals.ai/benchmarks/fabv2-1)                        | yes                | captured-not-scored | fabv2-1                  |                                                                                                                                |
| [Vals Finance Index](https://www.vals.ai/benchmarks/finance_index)                  | yes                | reviewed-deferred   | finance-index            | Composite retained separately; excluded from capability scoring by existing policy.                                            |
| [Financial Coaching Bench](https://www.vals.ai/benchmarks/financial-coaching-bench) | yes                | captured-not-scored | financial-coaching-bench |                                                                                                                                |
| [GPQA Diamond](https://www.vals.ai/benchmarks/gpqa)                                 | yes                | scored              | gpqa-diamond             |                                                                                                                                |
| [HLAB-Vals-1.1](https://www.vals.ai/benchmarks/hlab)                                | yes                | scored              | hlab                     |                                                                                                                                |
| [Harvey's Legal Agent Benchmark v1](https://www.vals.ai/benchmarks/hlab-v1)         | yes                | captured-not-scored | hlab-v1                  |                                                                                                                                |
| [Immigration Bench](https://www.vals.ai/benchmarks/immigration)                     | yes                | captured-not-scored | immigration              |                                                                                                                                |
| [Vals Inference Provider Index](https://www.vals.ai/benchmarks/inference_provider)  | yes                | unintegrated        | —                        |                                                                                                                                |
| [IOI v2](https://www.vals.ai/benchmarks/ioi)                                        | yes                | scored              | ioi                      |                                                                                                                                |
| [LiveCodeBench](https://www.vals.ai/benchmarks/lcb)                                 | yes                | scored              | livecodebench            |                                                                                                                                |
| [LegalBench](https://www.vals.ai/benchmarks/legal_bench)                            | yes                | scored              | legal-bench              |                                                                                                                                |
| [Vals Legal Index](https://www.vals.ai/benchmarks/legal_index)                      | yes                | reviewed-deferred   | legal-index              | Composite retained separately; excluded from capability scoring by existing policy.                                            |
| [Legal Research Bench](https://www.vals.ai/benchmarks/legal_research)               | yes                | scored              | legal-research           |                                                                                                                                |
| [MATH 500](https://www.vals.ai/benchmarks/math500)                                  | yes                | captured-not-scored | math500                  |                                                                                                                                |
| [MedCode](https://www.vals.ai/benchmarks/medcode)                                   | yes                | scored              | medcode                  |                                                                                                                                |
| [MedQA](https://www.vals.ai/benchmarks/medqa)                                       | yes                | captured-not-scored | medqa                    |                                                                                                                                |
| [MedScribe](https://www.vals.ai/benchmarks/medscribe)                               | yes                | scored              | medscribe                |                                                                                                                                |
| [SAFE-Teen](https://www.vals.ai/benchmarks/mental-health)                           | yes                | unintegrated        | —                        |                                                                                                                                |
| [MGSM](https://www.vals.ai/benchmarks/mgsm)                                         | yes                | captured-not-scored | mgsm                     |                                                                                                                                |
| [MMLU Pro](https://www.vals.ai/benchmarks/mmlu_pro)                                 | yes                | scored              | mmlu-pro                 |                                                                                                                                |
| [MMMU Pro](https://www.vals.ai/benchmarks/mmmu)                                     | yes                | captured-not-scored | mmmu                     |                                                                                                                                |
| [MortgageTax](https://www.vals.ai/benchmarks/mortgage_tax)                          | yes                | captured-not-scored | mortgage-tax             |                                                                                                                                |
| [MysteryMechanism](https://www.vals.ai/benchmarks/mysterymechanism)                 | yes                | captured-not-scored | mysterymechanism         |                                                                                                                                |
| [Poker Agent](https://www.vals.ai/benchmarks/poker_agent)                           | yes                | captured-not-scored | poker-agent              |                                                                                                                                |
| [ProgramBench](https://www.vals.ai/benchmarks/programbench)                         | yes                | scored              | programbench             |                                                                                                                                |
| [ProofBench v1.1](https://www.vals.ai/benchmarks/proof_bench)                       | yes                | scored              | proofbench               |                                                                                                                                |
| [Public Benefits Bench v1.1](https://www.vals.ai/benchmarks/public-benefits-bench)  | yes                | scored              | public-benefits-bench    |                                                                                                                                |
| [Public Benefits Bench v1](https://www.vals.ai/benchmarks/public-benefits-bench-v1) | yes                | captured-not-scored | public-benefits-bench-v1 |                                                                                                                                |
| [RollerCoasterTycoonBench](https://www.vals.ai/benchmarks/rctbench)                 | yes                | captured-not-scored | rctbench                 |                                                                                                                                |
| [Robo-bench](https://www.vals.ai/benchmarks/robo_bench)                             | yes                | captured-not-scored | robo-bench               |                                                                                                                                |
| [Vals RSI Index](https://www.vals.ai/benchmarks/rsi_index)                          | yes                | unintegrated        | —                        |                                                                                                                                |
| [SAGE](https://www.vals.ai/benchmarks/sage)                                         | yes                | captured-not-scored | sage                     |                                                                                                                                |
| [Vals Science Index](https://www.vals.ai/benchmarks/science_index)                  | yes                | captured-not-scored | science-index            |                                                                                                                                |
| [SkillsBench](https://www.vals.ai/benchmarks/skillsbench)                           | yes                | scored              | skillsbench              |                                                                                                                                |
| [SRE Bench](https://www.vals.ai/benchmarks/srebench)                                | yes                | captured-not-scored | srebench                 |                                                                                                                                |
| [SWE-bench Verified](https://www.vals.ai/benchmarks/swebench)                       | yes                | scored              | swe-bench                |                                                                                                                                |
| [SWE-bench Multimodal](https://www.vals.ai/benchmarks/swebench-multimodal)          | yes                | captured-not-scored | swebench-multimodal      |                                                                                                                                |
| [Tax Agent Bench](https://www.vals.ai/benchmarks/tax_agent_bench)                   | yes                | captured-not-scored | tax-agent-bench          |                                                                                                                                |
| [TaxEval v2](https://www.vals.ai/benchmarks/tax_eval_v2)                            | yes                | scored              | tax-eval-v2              |                                                                                                                                |
| [Terminal-Bench 2.0](https://www.vals.ai/benchmarks/terminal-bench-2)               | yes                | captured-not-scored | terminal-bench-2         |                                                                                                                                |
| [Terminal-Bench 2.1](https://www.vals.ai/benchmarks/terminal-bench-2-1)             | yes                | scored              | terminal-bench-2-1       |                                                                                                                                |
| [Terminal-Bench 4.0](https://www.vals.ai/benchmarks/terminal-bench-4)               | yes                | scored              | terminal-bench-4-0       |                                                                                                                                |
| [Terminal-Bench-Science](https://www.vals.ai/benchmarks/terminal-bench-science)     | yes                | captured-not-scored | terminal-bench-science   |                                                                                                                                |
| [Time Horizon Index: KSP](https://www.vals.ai/benchmarks/time_horizon_index)        | yes                | reviewed-deferred   | time-horizon-index       | Composite retained separately; excluded from capability scoring by existing policy.                                            |
| [Vals Index](https://www.vals.ai/benchmarks/vals_index)                             | yes                | reviewed-deferred   | vals-index               | Composite retained separately; excluded from capability scoring by existing policy.                                            |
| [Vals Multimodal Index](https://www.vals.ai/benchmarks/vals_multimodal_index)       | yes                | reviewed-deferred   | vals-multimodal-index    | Composite retained separately; excluded from capability scoring by existing policy.                                            |
| [Vals Router Index](https://www.vals.ai/benchmarks/vals_router_index)               | yes                | unintegrated        | —                        |                                                                                                                                |
| [Vibe Code Bench 1-100](https://www.vals.ai/benchmarks/vcb-1-100)                   | yes                | captured-not-scored | vcb-1-100                |                                                                                                                                |
| [Vibe Code Bench 1-100 v1.1](https://www.vals.ai/benchmarks/vcb-1-100-v1-1)         | yes                | captured-not-scored | vcb-1-100-v1-1           |                                                                                                                                |
| [Vibe Code Bench v1.1](https://www.vals.ai/benchmarks/vibe-code)                    | yes                | scored              | vibe-code-bench          |                                                                                                                                |
| [VoiceCodeBench](https://www.vals.ai/benchmarks/voice-code-bench)                   | yes                | captured-not-scored | voice-code-bench         |                                                                                                                                |
| [Vals Web Search Index](https://www.vals.ai/benchmarks/web_search)                  | yes                | reviewed-deferred   | web-search               | Composite retained separately; excluded from capability scoring by existing policy.                                            |

## xai-releases

- Checked: 2026-11-19T02:19:21.933Z
- Stored score snapshot: 2026-10-04T04:31:01.893Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## zapier-automationbench

- Checked: 2026-11-21T08:43:48.449Z
- Stored score snapshot: 2026-11-21T08:43:45.282Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |
