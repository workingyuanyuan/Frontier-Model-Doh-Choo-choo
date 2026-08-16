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
