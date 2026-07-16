# DeepSWE acquisition validation

- Verified: 2026-07-16
- Official source: https://deepswe.datacurve.ai/
- Structured source: https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json
- Method: official JSON, checked against server-rendered Best leaderboard.
- Completeness: **42 configuration rows**, **14 distinct models**, and **14/14 visible Best rows**.

## Selection

The evidence snapshot is complete. Candidate output is intentionally bounded to the single highest Pass@1 profile for each visible model, matching the site's Best view. Other effort levels remain recoverable from the evidence artifact.

## Limitations

CandidateResultSchema does not carry confidence intervals, mean task cost, output tokens or agent steps. Those fields remain in the evidence artifact.
