# LiveBench acquisition validation

- Verified: 2026-07-16
- Official application: https://livebench.ai/#/
- Latest declared release: **2026-06-25**
- Structured data: **38 model profiles**, **23 task columns**, **7 categories**.

## Method

The SPA bundle was inspected to identify the release list and the official `table_<release>.csv`, `categories_<release>.json` and cost files. Category scores use LiveBench's arithmetic-mean rule over the tasks named by the category JSON.

## Bounded candidate set

The evidence snapshot covers all 38 rows. Candidate output contains four frontier max profiles and the four category families already mapped by this project: Reasoning, Mathematics, Language and Instruction Following.

## Limitations

Coding, Agentic Coding and Data Analysis are present in the current release but are not emitted until the shared benchmark-dimension mapping reviews their canonical IDs. Cost data is indexed by the application but is outside CandidateResultSchema.
