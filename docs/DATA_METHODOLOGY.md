# Data Methodology

## Evidence lifecycle

1. Fetch only a source-registry URL over HTTPS with redirect, timeout and size limits.
2. Save exact bytes, retrieval time, headers, final URL, SHA-256 and connector/parser version.
3. Parse into source-shaped rows; never discard unknown fields from the raw artifact.
4. Validate types, units, ranges, dates and required evaluation configuration.
5. Resolve benchmark, model variant and alias. Ambiguous matches enter review.
6. Detect duplicate and conflicting canonical result keys.
7. Publish only reviewed rows in one transaction; rejected rows remain auditable.

## Canonical identity

- A model entry identifies provider, family, product version/snapshot, hosted/open-weight form and lifecycle state.
- An effort or reasoning setting is a distinct model variant when it changes evaluation behavior.
- Aliases are scoped to source. Safe normalization is limited to Unicode normalization, trim, case-folding and whitespace collapse.
- String similarity may suggest candidates but can never permanently merge identities.

## Result identity

A canonical result is unique by model variant, benchmark version, metric, evaluation configuration and evaluation date/snapshot. The configuration hash includes harness, prompt/shot setting, tool/network access, attempt count and relevant effort parameters.

## Duplicate and precedence policy

- Exact source duplicates collapse by raw fingerprint while retaining all evidence locators.
- Conflicting values for the same canonical key block automatic publication.
- Precedence is benchmark official, independent evaluator, vendor reported, secondary aggregator, unverified.
- A lower-tier row never replaces a higher-tier published row automatically.

## Quality flags

`VERIFIED`, `PROVISIONAL`, `VENDOR_REPORTED`, `STALE`, `LOW_COVERAGE`, `SOURCE_UNAVAILABLE`, `MANUAL_REVIEW_REQUIRED`, `CONFLICTING`, `PARSER_FAILED`.

## Reference data policy

`reference-table-data/` contains 2026-07 Scale Labs HTML/Next Flight snapshots, JavaScript chunks and derived Markdown tables. It is preserved as research, seed and parser fixtures. Until live-source, terms and row-level provenance checks pass, imports from it remain `PROVISIONAL` and cannot enter the verified ranking.
