# Source Registry

Every connector record stores `source_id`, type, publisher, base/leaderboard/methodology URLs, first-party status, access method, structured endpoint, cadence, terms/robots/license notes, authentication, parser status, last checks and known limitations.

## Initial registry

| Source              | Classification        | Access and status                                                                                         | Publication rule                                                                                  |
| ------------------- | --------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| LiveBench           | benchmark_official    | Official GitHub/Hugging Face public datasets; Apache-2.0 stated in its datasheet; staging connector READY | Eligible only after full pagination, alias resolution and review; stale flag reflects source date |
| Scale Labs          | independent_evaluator | Public leaderboard plus local HTML/Flight snapshots; live access and terms review pending                 | Local rows provisional/manual only until review                                                   |
| Artificial Analysis | independent_evaluator | API/data access and terms research pending                                                                | Disabled by default                                                                               |
| Epoch AI            | independent_evaluator | Public benchmark pages; structured access/license research pending                                        | Disabled by default                                                                               |
| Snorkel             | independent_evaluator | Leaderboard/methodology research pending                                                                  | Disabled by default                                                                               |
| FrontierSWE         | benchmark_official    | Official result format and license research pending                                                       | Disabled by default                                                                               |
| Vals AI             | independent_evaluator | Public result access and terms research pending                                                           | Disabled by default                                                                               |
| Agents' Last Exam   | benchmark_official    | Official leaderboard/data access research pending                                                         | Disabled by default                                                                               |
| DeepSWE             | benchmark_official    | Official leaderboard/data access research pending                                                         | Disabled by default                                                                               |
| Manual Import       | unverified            | Local Zod-validated CSV/JSON with mandatory source URL and evidence                                       | Always provisional until review                                                                   |
| BenchLM             | secondary_aggregator  | Information architecture reference only                                                                   | Never ingest data or scoring                                                                      |

## LiveBench sources

- Repository: https://github.com/LiveBench/LiveBench
- Data organization: https://huggingface.co/livebench
- Dataset card/datasheet: https://github.com/LiveBench/LiveBench/blob/main/docs/DATASHEET.md
- Judgment rows: `https://datasets-server.huggingface.co/rows`, fixed dataset `livebench/model_judgment`, config `default`, split `leaderboard`.
- Validated fields: `question_id`, `task`, `model`, `score`, `turn`, `tstamp`, and `category`.
- The rows API allows at most 100 records per request. The connector validates pagination before network access, uses manual redirect handling, enforces HTTPS origin/content type/byte limits, and stores the exact response by SHA-256.
- Current implementation state: the bounded one-page CLI remains available for smoke tests. Both CLIs capture the official Hub commit SHA through a fixed HTTPS origin and bind it to source-snapshot and ingestion-run metadata. `pnpm ingest:livebench:all` orchestrates the declared dataset sequentially through the tested non-overlapping page plan, rejects a changing total row count and stops on the first failed page. Alias resolution, aggregation and publication remain gated work.
- First verified local run on 2026-07-11 accepted 100 of 100 rows from 60,372 available rows. Raw artifact SHA-256: `f42c1e187fa6c1c3870d4ce193ccdd6aaecfc06eb83ff288af023f6291fac1f5`.

## Connector states

`RESEARCHING → READY → ACTIVE → DEGRADED → DISABLED`. A parser may only become ACTIVE after a committed fixture and expected parsed output pass. Schema drift changes ACTIVE to DEGRADED instead of publishing an empty result set.
