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
- Question inventory datasets: `livebench/reasoning`, `livebench/math`, `livebench/coding`, `livebench/language`, `livebench/data_analysis` and `livebench/instruction_following`. The selector mirrors the official `common.py` release/removal rules and targets public release `2024-11-25`. The bounded connector is READY: it pins every Hub revision and reads only six inventory columns through validated CDN byte ranges.
- Judgment rows: `https://datasets-server.huggingface.co/rows`, fixed dataset `livebench/model_judgment`, config `default`, split `leaderboard`.
- Full dataset artifact: revision-pinned Hub resolver path `data/leaderboard-00000-of-00001.parquet`. The connector manually validates the Hub commit response, linked size/ETag and a single approved Hugging Face CDN redirect before parsing.
- Validated fields: `question_id`, `task`, `model`, `score`, `turn`, `tstamp`, and `category`.
- The rows API allows at most 100 records per request. The connector validates pagination before network access, uses manual redirect handling, enforces HTTPS origin/content type/byte limits, and stores the exact response by SHA-256.
- Current implementation state: the bounded rows CLI remains available for smoke tests. Full ingestion uses the revision-pinned Parquet artifact after the rows API rate-limited a 604-request run. Both paths capture the official Hub commit SHA through a fixed HTTPS origin and bind it to evidence metadata. Alias resolution, aggregation and publication remain gated work.
- First verified local run on 2026-07-11 accepted 100 of 100 rows from 60,372 available rows. Raw artifact SHA-256: `f42c1e187fa6c1c3870d4ce193ccdd6aaecfc06eb83ff288af023f6291fac1f5`.
- First verified full Parquet run on 2026-07-13 accepted 60,372 of 60,372 rows and preserved 195 raw model names. Revision: `9704e5da7bfbefe75ac1482a13de827127295993`; artifact SHA-256: `35ad896970151776145c96b31c5ddb3a2749ea9a1d91e6b7f1a4c4c04735182a`.
- The pinned `model_judgment` artifact contains only coding, instruction-following and language. It is judgment evidence, not a complete benchmark question denominator; reasoning, math and data-analysis must be supplied by their official question inventories.
- Pinned question revisions: reasoning `6fc6498a5dfba553f69f4413feabade1f1a2d384`, math `bb66571c8ccf32d3df9e6f48b920d3770ff4aacb`, coding `a958549fdd8aa57be0a3fafe7b205ffc160ed5f4`, language `3ada32a2e53d5e04e57fa503384cb85ce9116c40`, data-analysis `31b9661ff678df9958e2f7fa228427f4c858c1a1` and instruction-following `0868379c4b5cf62aeacaf8be4f08fced815c81bb`.
- First bounded six-source acquisition on 2026-07-13 decoded 1,436 rows using 42 range requests and 2,816,787 transferred bytes. Release `2024-11-25` contains 1,000 observations across 18 tasks: reasoning 150, math 232, coding 128, language 140, data-analysis 150 and instruction-following 200. Two runs produced identical 180,278-byte derived evidence at SHA-256 `b8a90d2f2308b774fbee982178d433412fd6f349429be2a41def4331b0ee4027`.

## Connector states

`RESEARCHING → READY → ACTIVE → DEGRADED → DISABLED`. A parser may only become ACTIVE after a committed fixture and expected parsed output pass. Schema drift changes ACTIVE to DEGRADED instead of publishing an empty result set.
