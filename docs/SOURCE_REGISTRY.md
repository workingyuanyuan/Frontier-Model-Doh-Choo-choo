# Source Registry

Every connector record stores `source_id`, type, publisher, base/leaderboard/methodology URLs, first-party status, access method, structured endpoint, cadence, terms/robots/license notes, authentication, parser status, last checks and known limitations.

## Initial registry

| Source              | Classification        | Access and status                                                                                 | Publication rule                                                         |
| ------------------- | --------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| LiveBench           | benchmark_official    | Official GitHub/Hugging Face public datasets; Apache-2.0 stated in its datasheet; first connector | Eligible after parser/config validation; stale flag reflects source date |
| Scale Labs          | independent_evaluator | Public leaderboard plus local HTML/Flight snapshots; live access and terms review pending         | Local rows provisional/manual only until review                          |
| Artificial Analysis | independent_evaluator | API/data access and terms research pending                                                        | Disabled by default                                                      |
| Epoch AI            | independent_evaluator | Public benchmark pages; structured access/license research pending                                | Disabled by default                                                      |
| Snorkel             | independent_evaluator | Leaderboard/methodology research pending                                                          | Disabled by default                                                      |
| FrontierSWE         | benchmark_official    | Official result format and license research pending                                               | Disabled by default                                                      |
| Vals AI             | independent_evaluator | Public result access and terms research pending                                                   | Disabled by default                                                      |
| Agents' Last Exam   | benchmark_official    | Official leaderboard/data access research pending                                                 | Disabled by default                                                      |
| DeepSWE             | benchmark_official    | Official leaderboard/data access research pending                                                 | Disabled by default                                                      |
| Manual Import       | unverified            | Local Zod-validated CSV/JSON with mandatory source URL and evidence                               | Always provisional until review                                          |
| BenchLM             | secondary_aggregator  | Information architecture reference only                                                           | Never ingest data or scoring                                             |

## LiveBench sources

- Repository: https://github.com/LiveBench/LiveBench
- Data organization: https://huggingface.co/livebench
- Dataset card/datasheet: https://github.com/LiveBench/LiveBench/blob/main/docs/DATASHEET.md
- The connector must pin the Hugging Face revision/ETag, retain attribution, and store the exact downloaded artifact.

## Connector states

`RESEARCHING → READY → ACTIVE → DEGRADED → DISABLED`. A parser may only become ACTIVE after a committed fixture and expected parsed output pass. Schema drift changes ACTIVE to DEGRADED instead of publishing an empty result set.
