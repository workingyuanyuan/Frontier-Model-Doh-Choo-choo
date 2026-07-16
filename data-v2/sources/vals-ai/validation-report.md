# Vals AI acquisition validation

- Verified: 2026-07-16
- Role: independent evaluator
- Live targets: <https://www.vals.ai/home> and <https://www.vals.ai/models/openai_gpt-5.6-sol>
- Evidence: two complete HTML responses, content-addressed in `evidence-index.json`

## Checks

| Check           | Result                                                                                                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source identity | Vals states: “We run all of our own evaluations”.                                                                                                                                                                                                   |
| Freshness       | GPT-5.6 Sol/Terra update is dated 2026-07-09; the Vals Index display was dated 2026-07-13 when checked.                                                                                                                                             |
| Exact rows      | Home exposes the complete currently visible 16-model Vals Index ranked set (75.14% through 55.62%). The dated GPT-5.6 update also exposes SWE-bench Verified 96.20%, Terminal-Bench 2.1 85.77%, ProofBench 77.00%, and GPQA Diamond 95.20% for Sol. |
| Profile         | Model page specifies OpenAI provider, default temperature/top-p, max output 128,000, and `max` reasoning effort.                                                                                                                                    |
| Completeness    | The frontier-selection slice contains every currently visible Vals Index row without padding to 20. The GPT-5.6 benchmark extraction remains a selected mapped subset, so candidates are `PARTIAL_SOURCE`.                                          |
| Scoring safety  | Vals Index is excluded as an external composite. Four direct benchmark percentages are includable.                                                                                                                                                  |

## Risks and limitations

- The model detail page's server-rendered accessible text displayed `0.0%` placeholders for benchmark rows, while the home update card contained the populated values. Score provenance therefore points to the home response; profile provenance points to the model response.
- Some benchmark-specific pages may override provider or parameters. Those pages should be captured before a future `FULL` snapshot.
