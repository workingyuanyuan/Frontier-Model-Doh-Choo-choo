# Source change report

Catalog observations and stored score snapshots have separate dates. Snapshot-only sources do not claim discovery of unpublished or unparsed upstream benchmarks.

## anthropic-releases

- Checked: 2026-10-30T02:37:29.581Z
- Stored score snapshot: 2026-10-30T02:37:26.506Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## arc-prize

- Checked: 2026-10-30T02:32:57.708Z
- Stored score snapshot: 2026-10-30T02:32:55.176Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## artificial-analysis

- Checked: 2026-10-30T02:37:19.281Z
- Stored score snapshot: 2026-10-30T02:34:02.037Z
- Scope: live-catalog-and-snapshot

| Finding                           | Benchmark             | Detail                                                          |
| --------------------------------- | --------------------- | --------------------------------------------------------------- |
| unintegrated                      | aa-3d                 | https://artificialanalysis.ai/evaluations/aa-3d                 |
| unintegrated                      | aa-analyst-agent      | https://artificialanalysis.ai/evaluations/aa-analyst-agent      |
| unintegrated                      | aa-personalitybench   | https://artificialanalysis.ai/evaluations/aa-personalitybench   |
| unintegrated                      | aime-2025             | https://artificialanalysis.ai/evaluations/aime-2025             |
| unintegrated                      | code2video-aa         | https://artificialanalysis.ai/evaluations/code2video-aa         |
| unintegrated                      | enterprise-ops-gym-aa | https://artificialanalysis.ai/evaluations/enterprise-ops-gym-aa |
| unintegrated                      | frontiercode          | https://artificialanalysis.ai/evaluations/frontiercode          |
| unintegrated                      | global-mmlu-lite      | https://artificialanalysis.ai/evaluations/global-mmlu-lite      |
| unintegrated                      | harvey-lab-aa         | https://artificialanalysis.ai/evaluations/harvey-lab-aa         |
| unintegrated                      | healthbench           | https://artificialanalysis.ai/evaluations/healthbench           |
| unintegrated                      | itbench-aa            | https://artificialanalysis.ai/evaluations/itbench-aa            |
| unintegrated                      | math-500              | https://artificialanalysis.ai/evaluations/math-500              |
| unintegrated                      | mlcr-aa               | https://artificialanalysis.ai/evaluations/mlcr-aa               |
| unintegrated                      | mmmu-pro              | https://artificialanalysis.ai/evaluations/mmmu-pro              |
| catalog-snapshot-version-mismatch | omniscience           | Directory v1.1; stored scores (unknown)                         |
| unintegrated                      | tau2-bench            | https://artificialanalysis.ai/evaluations/tau2-bench            |
| unintegrated                      | terminalbench-hard    | https://artificialanalysis.ai/evaluations/terminalbench-hard    |

| Source catalog entry                                                                                                            | Capture registered | Integration       | Benchmark ID                           | Review note                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AA-3D](https://artificialanalysis.ai/evaluations/aa-3d)                                                                        | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [AA-AnalystAgent](https://artificialanalysis.ai/evaluations/aa-analyst-agent)                                                   | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [AA-Briefcase v1.1](https://artificialanalysis.ai/evaluations/aa-briefcase)                                                     | yes                | scored            | aa-briefcase                           |                                                                                                                                                                                                                                                                                                      |
| [AA-PersonalityBench](https://artificialanalysis.ai/evaluations/aa-personalitybench)                                            | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [AIME 2025](https://artificialanalysis.ai/evaluations/aime-2025)                                                                | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [APEX-Agents-AA](https://artificialanalysis.ai/evaluations/apex-agents-aa)                                                      | yes                | scored            | apex-agents                            |                                                                                                                                                                                                                                                                                                      |
| [Artificial Analysis Intelligence Index v5.0](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index) | yes                | reviewed-deferred | artificial-analysis-intelligence-index | Composite retained separately; excluded from capability scoring by existing policy.                                                                                                                                                                                                                  |
| [AA-LCR v1.1](https://artificialanalysis.ai/evaluations/artificial-analysis-long-context-reasoning)                             | yes                | scored            | aa-lcr                                 |                                                                                                                                                                                                                                                                                                      |
| [AutomationBench-AA](https://artificialanalysis.ai/evaluations/automationbench-aa)                                              | yes                | reviewed-deferred | —                                      | 2026-10-29 user decision: not scored. AA's headline (automationBenchPartialScore) is the average share of objectives completed, while Zapier's organizer leaderboard (automationbench) scores strict task completion; the metrics differ.                                                            |
| [Code2Video-AA](https://artificialanalysis.ai/evaluations/code2video-aa)                                                        | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [CritPt](https://artificialanalysis.ai/evaluations/critpt)                                                                      | yes                | scored            | critpt                                 |                                                                                                                                                                                                                                                                                                      |
| [CritPt v2](https://artificialanalysis.ai/evaluations/critpt-v2)                                                                | yes                | scored            | critpt-v2                              | 2026-10-28 user decision: AA Intelligence Index v5 additions are scored. Field critptAgentic (Full Set, default leaderboard tab) -\> critpt-v2; the Index's Hard Subset (critptAgenticHard) is not materialized; critpt (v1) is kept as evidence and excluded from scoring (superseded, 2026-10-28). |
| [EnterpriseOps-Gym-AA](https://artificialanalysis.ai/evaluations/enterprise-ops-gym-aa)                                         | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [FrontierCode 1.1](https://artificialanalysis.ai/evaluations/frontiercode)                                                      | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [FrontierCode 2.0](https://artificialanalysis.ai/evaluations/frontiercode-2-0)                                                  | yes                | scored            | frontier-code-2-0                      | 2026-10-28 user decision: AA Intelligence Index v5 additions are scored. Field frontierCode20 -\> frontier-code-2-0, shared with the Cognition organizer source; the organizer row wins every overlapping profile.                                                                                   |
| [GDP.pdf](https://artificialanalysis.ai/evaluations/gdp-pdf)                                                                    | yes                | scored            | gdp-pdf                                |                                                                                                                                                                                                                                                                                                      |
| [GDPval-AA v2.1](https://artificialanalysis.ai/evaluations/gdpval-aa)                                                           | yes                | scored            | gdpval-aa                              |                                                                                                                                                                                                                                                                                                      |
| [Global-MMLU-Lite](https://artificialanalysis.ai/evaluations/global-mmlu-lite)                                                  | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [GPQA Diamond](https://artificialanalysis.ai/evaluations/gpqa-diamond)                                                          | yes                | scored            | gpqa-diamond                           |                                                                                                                                                                                                                                                                                                      |
| [Harvey LAB-AA v1.1](https://artificialanalysis.ai/evaluations/harvey-lab-aa)                                                   | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [HealthBench](https://artificialanalysis.ai/evaluations/healthbench)                                                            | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [HLE-Diamond](https://artificialanalysis.ai/evaluations/hle-diamond)                                                            | yes                | scored            | hle-diamond                            | 2026-10-28 user decision: AA Intelligence Index v5 additions are scored. Field hleDiamond -\> hle-diamond; humanitys-last-exam is kept as evidence and excluded from scoring (superseded, 2026-10-28).                                                                                               |
| [Humanity's Last Exam](https://artificialanalysis.ai/evaluations/humanitys-last-exam)                                           | yes                | scored            | humanitys-last-exam                    |                                                                                                                                                                                                                                                                                                      |
| [IFBench](https://artificialanalysis.ai/evaluations/ifbench)                                                                    | yes                | scored            | ifbench                                |                                                                                                                                                                                                                                                                                                      |
| [ITBench-AA](https://artificialanalysis.ai/evaluations/itbench-aa)                                                              | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [LiveCodeBench](https://artificialanalysis.ai/evaluations/livecodebench)                                                        | yes                | scored            | livecodebench                          |                                                                                                                                                                                                                                                                                                      |
| [MATH-500](https://artificialanalysis.ai/evaluations/math-500)                                                                  | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [MLCR-AA](https://artificialanalysis.ai/evaluations/mlcr-aa)                                                                    | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [MMLU-Pro](https://artificialanalysis.ai/evaluations/mmlu-pro)                                                                  | yes                | scored            | mmlu-pro                               |                                                                                                                                                                                                                                                                                                      |
| [MMMU-Pro](https://artificialanalysis.ai/evaluations/mmmu-pro)                                                                  | yes                | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [AA-Omniscience v1.1](https://artificialanalysis.ai/evaluations/omniscience)                                                    | yes                | scored            | aa-omniscience                         |                                                                                                                                                                                                                                                                                                      |
| [SciCode](https://artificialanalysis.ai/evaluations/scicode)                                                                    | yes                | scored            | scicode                                |                                                                                                                                                                                                                                                                                                      |
| [𝜏²-Bench Telecom](https://artificialanalysis.ai/evaluations/tau2-bench)                                                        | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |
| [𝜏³-Banking](https://artificialanalysis.ai/evaluations/tau3-banking)                                                            | yes                | scored            | tau3-banking                           |                                                                                                                                                                                                                                                                                                      |
| [Terminal-Bench-Science 0.1](https://artificialanalysis.ai/evaluations/terminal-bench-science)                                  | yes                | scored            | terminal-bench-science                 | 2026-10-28 user decision: AA Intelligence Index v5 additions are scored. Field terminalBenchScience -\> terminal-bench-science (v0.1, mini-swe-agent, 3 repeats).                                                                                                                                    |
| [Terminal-Bench 2.1](https://artificialanalysis.ai/evaluations/terminalbench-2-1)                                               | yes                | scored            | terminal-bench-2-1                     |                                                                                                                                                                                                                                                                                                      |
| [Terminal-Bench 4.0](https://artificialanalysis.ai/evaluations/terminalbench-4-0)                                               | yes                | scored            | terminal-bench-4-0                     | 2026-10-29 user decision: Terminal-Bench 4.0 is scored. Field terminalBench40 -\> terminal-bench-4-0 (66 tasks, mini-swe-agent, pass@1 over 3 repeats), shared with Vals terminal-bench-4; separate from terminal-bench-2-1.                                                                         |
| [Terminal-Bench Hard](https://artificialanalysis.ai/evaluations/terminalbench-hard)                                             | no                 | unintegrated      | —                                      |                                                                                                                                                                                                                                                                                                      |

## deepswe

- Checked: 2026-10-30T02:37:25.133Z
- Stored score snapshot: 2026-10-30T02:37:24.788Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## epoch-ai

- Checked: 2026-10-30T02:32:53.691Z
- Stored score snapshot: 2026-10-30T02:32:50.201Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## frontier-code

- Checked: 2026-10-30T02:37:32.002Z
- Stored score snapshot: 2026-10-30T02:37:31.636Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## frontier-swe

- Checked: 2026-10-30T02:33:37.185Z
- Stored score snapshot: 2026-10-30T02:33:33.667Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## google-releases

- Checked: 2026-10-29T01:01:13.946Z
- Stored score snapshot: 2026-10-04T04:31:00.008Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## livebench

- Checked: 2026-10-30T02:37:23.545Z
- Stored score snapshot: 2026-10-30T02:37:22.251Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## openai-releases

- Checked: 2026-10-30T02:37:29.581Z
- Stored score snapshot: 2026-10-04T04:31:17.114Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## surge-chartography

- Checked: 2026-10-30T02:37:33.474Z
- Stored score snapshot: 2026-10-30T02:37:33.215Z
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
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-complex-constraints

- Checked: 2026-10-30T02:37:35.160Z
- Stored score snapshot: 2026-10-30T02:37:34.912Z
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
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-corecraft

- Checked: 2026-10-30T02:37:36.788Z
- Stored score snapshot: 2026-10-30T02:37:36.552Z
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
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-dayjob-finance

- Checked: 2026-10-30T02:37:40.507Z
- Stored score snapshot: 2026-10-30T02:37:40.183Z
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
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-dayjob-healthcare

- Checked: 2026-10-30T02:37:42.429Z
- Stored score snapshot: 2026-10-30T02:37:42.113Z
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
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-dayjob-tax

- Checked: 2026-10-30T02:37:44.297Z
- Stored score snapshot: 2026-10-30T02:37:44.042Z
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
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-gdp-xlsx

- Checked: 2026-10-30T02:37:45.925Z
- Stored score snapshot: 2026-10-30T02:37:45.710Z
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
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## surge-riemann

- Checked: 2026-10-30T02:37:38.604Z
- Stored score snapshot: 2026-10-30T02:37:38.263Z
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
| [View DAYJOB: Tax benchmark](https://surgehq.ai/benchmarks/dayjob-tax)                                      | yes                | scored            | dayjob-tax                |                                                                                  |
| [View EnterpriseBench: CoreCraft Agents benchmark](https://surgehq.ai/benchmarks/enterprisebench-corecraft) | yes                | scored            | enterprisebench-corecraft |                                                                                  |
| [View GDP.pdf benchmark](https://surgehq.ai/benchmarks/gdp-pdf)                                             | no                 | unintegrated      | —                         |                                                                                  |
| [View GDP.xlsx benchmark](https://surgehq.ai/benchmarks/gdp-xlsx)                                           | yes                | scored            | gdp-xlsx                  |                                                                                  |
| [View HANDBOOK.md Agents benchmark](https://surgehq.ai/benchmarks/handbook)                                 | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Hemingway-bench benchmark](https://surgehq.ai/benchmarks/hemingway-bench)                             | no                 | reviewed-deferred | —                         | User decision: prioritize current frontier model coverage; defer this benchmark. |
| [View Riemann-bench benchmark](https://surgehq.ai/benchmarks/riemann-bench)                                 | yes                | scored            | riemann-bench             |                                                                                  |
| [View sudo L7 benchmark](https://surgehq.ai/benchmarks/sudo-l7)                                             | no                 | unintegrated      | —                         |                                                                                  |

## vals-ai

- Checked: 2026-10-30T02:33:30.623Z
- Stored score snapshot: 2026-10-30T02:33:03.218Z
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
| captured-not-scored | voice-code-bench         | https://www.vals.ai/benchmarks/voice-code-bench         |

| Source catalog entry                                                                | Capture registered | Integration         | Benchmark ID             | Review note                                                                         |
| ----------------------------------------------------------------------------------- | ------------------ | ------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
| [AIME](https://www.vals.ai/benchmarks/aime)                                         | yes                | captured-not-scored | aime                     |                                                                                     |
| [BioMysteryBench](https://www.vals.ai/benchmarks/biomysterybench)                   | yes                | captured-not-scored | biomysterybench          |                                                                                     |
| [CaseLaw v2](https://www.vals.ai/benchmarks/case_law_v2)                            | yes                | captured-not-scored | case-law-v2              |                                                                                     |
| [ClaimBench](https://www.vals.ai/benchmarks/claimbench)                             | yes                | captured-not-scored | claimbench               |                                                                                     |
| [Code Migration](https://www.vals.ai/benchmarks/code-migration)                     | yes                | scored              | code-migration           |                                                                                     |
| [Code Migration v1.1](https://www.vals.ai/benchmarks/code-migration-v1-1)           | yes                | captured-not-scored | code-migration-v1-1      |                                                                                     |
| [CorpFin v2](https://www.vals.ai/benchmarks/corp_fin_v2)                            | yes                | scored              | corpfin                  |                                                                                     |
| [CUA-bench](https://www.vals.ai/benchmarks/cua_bench)                               | yes                | captured-not-scored | cua-bench                |                                                                                     |
| [CyberBench v1.1](https://www.vals.ai/benchmarks/cyber)                             | yes                | scored              | cyber                    |                                                                                     |
| [CyberOffense](https://www.vals.ai/benchmarks/cyber_offense)                        | yes                | unintegrated        | —                        |                                                                                     |
| [Excel Modeling Benchmark](https://www.vals.ai/benchmarks/emb)                      | yes                | scored              | emb                      |                                                                                     |
| [Excel Modeling Benchmark v1.1](https://www.vals.ai/benchmarks/emb-v1-1)            | yes                | captured-not-scored | emb-v1-1                 |                                                                                     |
| [Finance Agent v2](https://www.vals.ai/benchmarks/fabv2)                            | yes                | scored              | finance-agent-v2         |                                                                                     |
| [Finance Agent v2.1](https://www.vals.ai/benchmarks/fabv2-1)                        | yes                | captured-not-scored | fabv2-1                  |                                                                                     |
| [Vals Finance Index](https://www.vals.ai/benchmarks/finance_index)                  | yes                | reviewed-deferred   | finance-index            | Composite retained separately; excluded from capability scoring by existing policy. |
| [GPQA Diamond](https://www.vals.ai/benchmarks/gpqa)                                 | yes                | scored              | gpqa-diamond             |                                                                                     |
| [HLAB-Vals-1.1](https://www.vals.ai/benchmarks/hlab)                                | yes                | scored              | hlab                     |                                                                                     |
| [Harvey's Legal Agent Benchmark v1](https://www.vals.ai/benchmarks/hlab-v1)         | yes                | captured-not-scored | hlab-v1                  |                                                                                     |
| [Immigration Bench](https://www.vals.ai/benchmarks/immigration)                     | yes                | captured-not-scored | immigration              |                                                                                     |
| [Vals Inference Provider Index](https://www.vals.ai/benchmarks/inference_provider)  | yes                | unintegrated        | —                        |                                                                                     |
| [IOI v2](https://www.vals.ai/benchmarks/ioi)                                        | yes                | scored              | ioi                      |                                                                                     |
| [LiveCodeBench](https://www.vals.ai/benchmarks/lcb)                                 | yes                | scored              | livecodebench            |                                                                                     |
| [LegalBench](https://www.vals.ai/benchmarks/legal_bench)                            | yes                | scored              | legal-bench              |                                                                                     |
| [Vals Legal Index](https://www.vals.ai/benchmarks/legal_index)                      | yes                | reviewed-deferred   | legal-index              | Composite retained separately; excluded from capability scoring by existing policy. |
| [Legal Research Bench](https://www.vals.ai/benchmarks/legal_research)               | yes                | scored              | legal-research           |                                                                                     |
| [MATH 500](https://www.vals.ai/benchmarks/math500)                                  | yes                | captured-not-scored | math500                  |                                                                                     |
| [MedCode](https://www.vals.ai/benchmarks/medcode)                                   | yes                | scored              | medcode                  |                                                                                     |
| [MedQA](https://www.vals.ai/benchmarks/medqa)                                       | yes                | captured-not-scored | medqa                    |                                                                                     |
| [MedScribe](https://www.vals.ai/benchmarks/medscribe)                               | yes                | scored              | medscribe                |                                                                                     |
| [SAFE-Teen](https://www.vals.ai/benchmarks/mental-health)                           | yes                | unintegrated        | —                        |                                                                                     |
| [MGSM](https://www.vals.ai/benchmarks/mgsm)                                         | yes                | captured-not-scored | mgsm                     |                                                                                     |
| [MMLU Pro](https://www.vals.ai/benchmarks/mmlu_pro)                                 | yes                | scored              | mmlu-pro                 |                                                                                     |
| [MMMU Pro](https://www.vals.ai/benchmarks/mmmu)                                     | yes                | captured-not-scored | mmmu                     |                                                                                     |
| [MortgageTax](https://www.vals.ai/benchmarks/mortgage_tax)                          | yes                | captured-not-scored | mortgage-tax             |                                                                                     |
| [MysteryMechanism](https://www.vals.ai/benchmarks/mysterymechanism)                 | yes                | captured-not-scored | mysterymechanism         |                                                                                     |
| [Poker Agent](https://www.vals.ai/benchmarks/poker_agent)                           | yes                | captured-not-scored | poker-agent              |                                                                                     |
| [ProgramBench](https://www.vals.ai/benchmarks/programbench)                         | yes                | scored              | programbench             |                                                                                     |
| [ProofBench v1.1](https://www.vals.ai/benchmarks/proof_bench)                       | yes                | scored              | proofbench               |                                                                                     |
| [Public Benefits Bench v1.1](https://www.vals.ai/benchmarks/public-benefits-bench)  | yes                | scored              | public-benefits-bench    |                                                                                     |
| [Public Benefits Bench v1](https://www.vals.ai/benchmarks/public-benefits-bench-v1) | yes                | captured-not-scored | public-benefits-bench-v1 |                                                                                     |
| [Robo-bench](https://www.vals.ai/benchmarks/robo_bench)                             | yes                | captured-not-scored | robo-bench               |                                                                                     |
| [Vals RSI Index](https://www.vals.ai/benchmarks/rsi_index)                          | yes                | unintegrated        | —                        |                                                                                     |
| [SAGE](https://www.vals.ai/benchmarks/sage)                                         | yes                | captured-not-scored | sage                     |                                                                                     |
| [Vals Science Index](https://www.vals.ai/benchmarks/science_index)                  | yes                | captured-not-scored | science-index            |                                                                                     |
| [SkillsBench](https://www.vals.ai/benchmarks/skillsbench)                           | yes                | scored              | skillsbench              |                                                                                     |
| [SRE Bench](https://www.vals.ai/benchmarks/srebench)                                | yes                | captured-not-scored | srebench                 |                                                                                     |
| [SWE-bench Verified](https://www.vals.ai/benchmarks/swebench)                       | yes                | scored              | swe-bench                |                                                                                     |
| [SWE-bench Multimodal](https://www.vals.ai/benchmarks/swebench-multimodal)          | yes                | captured-not-scored | swebench-multimodal      |                                                                                     |
| [Tax Agent Bench](https://www.vals.ai/benchmarks/tax_agent_bench)                   | yes                | captured-not-scored | tax-agent-bench          |                                                                                     |
| [TaxEval v2](https://www.vals.ai/benchmarks/tax_eval_v2)                            | yes                | scored              | tax-eval-v2              |                                                                                     |
| [Terminal-Bench 2.0](https://www.vals.ai/benchmarks/terminal-bench-2)               | yes                | captured-not-scored | terminal-bench-2         |                                                                                     |
| [Terminal-Bench 2.1](https://www.vals.ai/benchmarks/terminal-bench-2-1)             | yes                | scored              | terminal-bench-2-1       |                                                                                     |
| [Terminal-Bench 4.0](https://www.vals.ai/benchmarks/terminal-bench-4)               | yes                | scored              | terminal-bench-4-0       |                                                                                     |
| [Terminal-Bench-Science](https://www.vals.ai/benchmarks/terminal-bench-science)     | yes                | captured-not-scored | terminal-bench-science   |                                                                                     |
| [Time Horizon Index: KSP](https://www.vals.ai/benchmarks/time_horizon_index)        | yes                | reviewed-deferred   | time-horizon-index       | Composite retained separately; excluded from capability scoring by existing policy. |
| [Vals Index](https://www.vals.ai/benchmarks/vals_index)                             | yes                | reviewed-deferred   | vals-index               | Composite retained separately; excluded from capability scoring by existing policy. |
| [Vals Multimodal Index](https://www.vals.ai/benchmarks/vals_multimodal_index)       | yes                | reviewed-deferred   | vals-multimodal-index    | Composite retained separately; excluded from capability scoring by existing policy. |
| [Vals Router Index](https://www.vals.ai/benchmarks/vals_router_index)               | yes                | unintegrated        | —                        |                                                                                     |
| [Vibe Code Bench 1-100](https://www.vals.ai/benchmarks/vcb-1-100)                   | yes                | captured-not-scored | vcb-1-100                |                                                                                     |
| [Vibe Code Bench v1.1](https://www.vals.ai/benchmarks/vibe-code)                    | yes                | scored              | vibe-code-bench          |                                                                                     |
| [VoiceCodeBench](https://www.vals.ai/benchmarks/voice-code-bench)                   | yes                | captured-not-scored | voice-code-bench         |                                                                                     |
| [Vals Web Search Index](https://www.vals.ai/benchmarks/web_search)                  | yes                | reviewed-deferred   | web-search               | Composite retained separately; excluded from capability scoring by existing policy. |

## xai-releases

- Checked: 2026-10-29T01:01:13.946Z
- Stored score snapshot: 2026-10-04T04:31:01.893Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |

## zapier-automationbench

- Checked: 2026-10-30T02:33:01.627Z
- Stored score snapshot: 2026-10-30T02:32:58.979Z
- Scope: snapshot-only

| Finding | Benchmark | Detail                                           |
| ------- | --------- | ------------------------------------------------ |
| None    | —         | No differences detected within the stated scope. |
