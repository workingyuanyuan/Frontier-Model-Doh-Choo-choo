# Vals AI acquisition validation

- Evidence: captured Vals home `benchmarkView` plus the GPT-5.6 Sol detail response.

## Exact counts

| Check | Count |
|---|---:|
| Structured tasks | 6 |
| Models per structured task | 36 |
| Structured score objects | 216 |
| Reviewed non-matrix Sol rows | 2 |
| Extracted rows | 218 |
| Generated candidates | 218 |
| Canonically unresolved candidates | 84 |

The structured matrix materializes Vals Index, Finance Agent v2, CorpFin v2, SWE-bench, Terminal-Bench 2.1, and Vibe Code Bench. Vals Index is organizer-owned composite evidence and remains `EXCLUDED`; the other 180 matrix constituents are direct Included results. The two retained non-matrix rows are GPT-5.6 Sol ProofBench and GPQA.

## Role boundary

Vals-owned Finance Agent v2, CorpFin v2, Vibe Code Bench, Vals Index, and ProofBench use `ORGANIZER`. Vals reruns of SWE-bench, Terminal-Bench, and GPQA use `INDEPENDENT`.

## Risks and limitations

- The detail response contains server-rendered `0.0%` placeholders; these are not ingested. No additional hidden-style values are promoted beyond the two previously reviewed Sol rows.
- 84 rows retain null canonical identity. Benchmark-specific pages remain necessary before expanding beyond the captured matrix.

## N3a benchmark dimension ruling (2026-08-22)

The user approved 13 new source-neutral benchmark IDs after review of the Vals methodology and each benchmark's task design and examples. These mappings are definitions only; N3 performs acquisition and materialization.

| Vals page slug | Benchmark ID | Primary dimension | Secondary dimensions |
| --- | --- | --- | --- |
| `ioi` | `ioi` | coding | reasoning, math |
| `code-migration` | `code-migration` | coding | agentic, context |
| `skillsbench` | `skillsbench` | agentic | coding, instruction |
| `hlab` | `hlab` | agentic | context, knowledge, instruction |
| `emb` | `emb` | agentic | math, context, instruction |
| `legal_bench` | `legal-bench` | reasoning | knowledge, language |
| `legal_research` | `legal-research` | agentic | knowledge, reasoning, context |
| `medcode` | `medcode` | knowledge | context, instruction |
| `medscribe` | `medscribe` | language | context, instruction, knowledge |
| `tax_eval_v2` | `tax-eval-v2` | knowledge | reasoning, math |
| `public-benefits-bench` | `public-benefits-bench` | agentic | knowledge, language, instruction |
| `cyber` | `cyber` | agentic | coding, reasoning |
| `reverse_eng` | `reverse-eng` | agentic | reasoning, coding, context |

### Not approved for scoring

| Vals page slug | Ruling note |
| --- | --- |
| `mmmu` | Not approved; multimodal benchmark does not fit the current eight-dimension taxonomy. |
| `mgsm` | Not approved. |
| `math500` | Not approved. |
| `terminal-bench-2` | Not approved; superseded by Terminal-Bench 2.1. |
| `sage` | Initially selected, then explicitly withdrawn after methodology review; handwritten-math vision is deferred with the multimodal taxonomy. |
| `case_law_v2` | Not approved. |
| `medqa` | Not approved. |
| `mortgage_tax` | Not approved; native image understanding is deferred with the multimodal taxonomy. |
| `poker_agent` | Not approved. |

The deferred multimodal watchlist therefore includes at least `sage` and `mortgage_tax`. No ninth dimension is introduced by N3a.
