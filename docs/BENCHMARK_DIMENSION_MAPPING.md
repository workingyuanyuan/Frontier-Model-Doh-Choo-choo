# Benchmark to Capability Mapping

> Mapping version: `benchmark-dimensions-v1`
> Last reviewed: 2026-07-16
> Purpose: capability semantics only. Source availability, freshness, weights and acquisition state belong elsewhere.

Each Benchmark has exactly one primary scoring dimension in v1. Secondary dimensions describe capabilities required by the task but do not receive duplicated score weight.

## Reasoning

| Benchmark | Secondary relationships | Why it maps here | Limits and common mistakes |
|---|---|---|---|
| ARC-AGI-1／2／3 | Context | Tests induction of latent transformation rules from demonstrations. | Do not treat version scores as interchangeable; visual grid induction is narrower than general reasoning. |
| SimpleBench | Knowledge, Language | Uses adversarial questions requiring commonsense, spatial, temporal and social inference. | Some items depend on world knowledge, but the primary failure mode is reasoning over deceptively simple premises. |
| Chess Puzzles／Chess Text | Knowledge | Requires multi-step planning and spatial state reasoning. | Chess expertise affects results; do not use game-arena social or poker scores as the same metric. |
| LiveBench Reasoning | Knowledge, Context | Directly evaluates reasoning tasks in the current LiveBench release. | Keep release and task composition explicit. |
| CritPt | Math | Evaluates scientific critical-point reasoning. | Do not merge with GPQA or generic science QA merely because domains overlap. |
| GPQA Diamond | Knowledge | Graduate-level questions require scientific knowledge plus non-trivial inference. | Primary mapping is Reasoning to avoid double counting it in Knowledge; record the strong knowledge relationship. |
| DROP | Language, Context | Requires discrete reasoning over passages. | Reading comprehension alone is not the measured endpoint. |
| BBH | Knowledge, Language | Broad collection of hard reasoning tasks. | Task mixture is heterogeneous; preserve the exact subset/version. |
| GraphWalks | Context | Measures graph traversal and stateful multi-step reasoning. | Tool-assisted and bare-model configurations must remain separate. |

## Math

| Benchmark | Secondary relationships | Why it maps here | Limits and common mistakes |
|---|---|---|---|
| FrontierMath | Reasoning, Knowledge | Measures advanced mathematical problem solving beyond routine calculation. | Tiers and v1/v2 are separate Benchmark versions. |
| AIME | Reasoning | Competition mathematics with exact-answer evaluation. | Preserve year, pass@k and tool settings. |
| MATH Level 5／MATH-500 | Reasoning | Tests difficult algebra, geometry, number theory and related formal work. | Level 5 and MATH-500 are not interchangeable datasets. |
| LiveBench Mathematics | Reasoning | Current competition and formal mathematics tasks. | Preserve the LiveBench release. |
| HMMT | Reasoning | Competition mathematics requiring multi-step solution construction. | Preserve year and tool use. |
| IMOAnswerBench | Reasoning, Language | Evaluates olympiad-style mathematical answers. | Grader and proof/answer format materially affect comparability. |
| ProofBench | Reasoning, Coding | Measures formally verifiable proof construction. | Keep proof assistant/tool configuration explicit. |
| GSM8K | Reasoning | Grade-school word problems with arithmetic reasoning. | Often saturated for frontier models; retain only when still used by a current source. |

## Knowledge

| Benchmark | Secondary relationships | Why it maps here | Limits and common mistakes |
|---|---|---|---|
| SimpleQA Verified | Language | Measures short-form factuality and parametric knowledge. | Do not merge with original SimpleQA; precision/recall/F1 variants must remain explicit. |
| AA-Omniscience | Reasoning | Measures factual accuracy, breadth and non-hallucination. | Keep accuracy and hallucination components identifiable. |
| Humanity's Last Exam | Reasoning | Broad expert-level academic knowledge. | Final 2,500, text-only and preview are distinct. |
| MMLU-Pro | Reasoning | Broad disciplinary knowledge with harder questions than MMLU. | MMLU and MMLU-Pro are separate datasets. |
| SuperGPQA | Reasoning | Broad professional and academic knowledge. | Do not collapse with GPQA Diamond. |
| SimpleQA | Language | Short factual answers from parametric knowledge. | Original labels differ from SimpleQA Verified. |

## Language

| Benchmark | Secondary relationships | Why it maps here | Limits and common mistakes |
|---|---|---|---|
| LiveBench Language | Instruction | Measures language understanding and generation tasks. | Preserve release and task composition. |
| Lech Mazur Writing | Instruction | Pairwise evaluation of creative story-writing quality. | Current pairwise graph must not be merged with archived absolute ratings. |
| WMT24++ | Knowledge | Measures translation quality across languages. | Preserve language pairs and metric. |
| Multi-IF／Global-MMLU-Lite language slices | Instruction, Knowledge | Measures multilingual generation or understanding. | Only language-focused results belong here; broad aggregate scores do not. |
| SAGE | Instruction, Knowledge | Evaluates generated educational responses and explanations. | It is not a pure factual knowledge test. |

## Instruction

| Benchmark | Secondary relationships | Why it maps here | Limits and common mistakes |
|---|---|---|---|
| IFBench | Language | Measures generalization to precise, verifiable output constraints. | Preserve official versus independent implementation. |
| IFEval | Language | Evaluates explicit instruction constraints. | Do not merge with IFBench. |
| LiveBench Instruction Following | Language | Current LiveBench instruction tasks. | Preserve release and grader configuration. |
| Senior SWE-Bench Tasteful Solve Rate | Coding | Measures whether a valid code change also follows maintainability and task-quality expectations. | It is a Senior SWE-Bench metric, not a Lech Mazur writing metric. |
| MultiChallenge | Reasoning, Language | Measures multi-turn instruction adherence. | Preserve the conversation and judge configuration. |

## Coding

| Benchmark | Secondary relationships | Why it maps here | Limits and common mistakes |
|---|---|---|---|
| SWE-bench family | Agentic, Context | Measures repository-level software issue resolution. | Dataset variant, agent, harness, patch verifier and attempt count are part of the Profile. |
| SWE-Bench Pro／SWE-Rebench | Agentic, Context | More difficult or independently reconstructed software engineering tasks. | Do not merge with SWE-bench Verified. |
| SciCode | Reasoning, Knowledge | Scientific code generation and problem solving. | Official historical and independent current runs have different source roles. |
| FrontierSWE | Agentic, Context | Ultra-long-horizon coding tasks scored with model+harness. | Rank/dominance is not a percentage accuracy. |
| Terminal-Bench | Agentic | Terminal-based task completion using an agent harness. | Versions 1.0, 2.0 and 2.1 are separate. |
| DeepSWE | Agentic, Context | Repository-level software engineering with long-running agents. | Preserve version and harness. |
| AlgoTune | Reasoning | Optimizes algorithm implementations against task-specific objectives. | Use the documented AlgoTune score; retain trajectories and effort. |
| LiveCodeBench | Reasoning | Current code-generation and execution evaluation. | Preserve release/version and pass@k. |
| ProgramBench | Agentic, Context | Rebuilds programs from specifications or observations. | Very low scores are valid; do not rescale by current cohort. |
| IOI | Math, Reasoning | Competitive programming problem solving. | Preserve inference budget and pass metric. |
| Code Migration | Context | Reimplements programs across languages. | Migration direction and test suite matter. |

## Agentic

| Benchmark | Secondary relationships | Why it maps here | Limits and common mistakes |
|---|---|---|---|
| OSWorld family | Context, Reasoning | Measures agents operating real computer environments. | OSWorld, Verified and 2.0 have different task sets and denominators. |
| GDPval／GDPval-AA | Knowledge, Coding, Context | Measures completion of economically valuable knowledge-work tasks. | Organizer and AA implementations are different result sources; preserve harness and version. |
| APEX-Agents | Knowledge, Coding | Measures professional agent performance across occupations. | APEX, APEX-Agents and APEX-SWE are distinct. |
| AA-Briefcase | Knowledge, Context | Long-horizon knowledge-work projects with many linked tasks and files. | Preserve judge version and tool environment. |
| AutomationBench | Instruction, Context | Measures workflow automation through APIs and tools. | API mode and restricted-tool modes are different Profiles. |
| Agents' Last Exam | Reasoning, Knowledge, Context | Measures long-horizon research and tool-using agents. | Preserve best-per-task versus fixed-agent aggregation. |
| τ²／τ³-Bench | Instruction, Context | Measures multi-turn tool use and policy-following in service environments. | Domain and version such as Telecom or Banking are distinct. |
| Toolathlon／Tool-Decathlon | Reasoning, Context | Measures selection and use of many tools. | Tool availability and execution budget are Profile fields. |
| MCP Atlas／MCP Mark | Coding, Context | Measures agents using MCP tools and environments. | Preserve verified versus vendor-run status. |

## Context

| Benchmark | Secondary relationships | Why it maps here | Limits and common mistakes |
|---|---|---|---|
| AA-LCR | Reasoning | Measures long-context retrieval and reasoning. | Preserve context length, variant and structured result row; page summaries may differ. |
| CL-bench | Language, Reasoning | Measures context learning and information tracking. | Do not infer a long-context score from a model's advertised window alone. |
| MRCR v2 | Reasoning | Multi-round coreference and retrieval across long inputs. | Preserve context length and scoring method. |
| LongBench v2／MMLongBench | Language, Reasoning | Measures long-document understanding and retrieval. | Versions and context buckets must remain explicit. |
| DeepResearch Bench family | Agentic, Knowledge | Requires integrating sources into long-form research outputs. | Original and DRB II have different tasks and rubrics. |
| Fiction.liveBench | Language, Reasoning | Tests recall and integration across long fictional narratives. | It is unrelated to LiveBench and Lech Mazur Writing. |
| GDP.pdf／GDPval document tasks | Agentic, Knowledge | Measures work over complex documents and files. | Preserve whether the score is a task subset or a standalone Benchmark. |
| RULER 1M | Reasoning | Measures retrieval and tracking across very long contexts. | Synthetic retrieval does not represent all long-context work. |

## Mapping rules for future additions

1. Read the Benchmark paper, methodology or official task description before mapping.
2. Map the measured endpoint, not every capability needed to obtain the answer.
3. Assign exactly one primary v1 scoring dimension.
4. Record secondary relationships instead of duplicating full score weight.
5. Preserve version, task set, metric, grader and agent/harness distinctions.
6. Do not add a deprecated or superseded Benchmark merely because historical model scores are abundant.
