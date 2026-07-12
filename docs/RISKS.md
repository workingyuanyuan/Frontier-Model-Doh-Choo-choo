# Risks

| Risk                             | Impact                                | Mitigation                                                                                                                                      |
| -------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Source HTML/schema drift         | Silent empty or wrong results         | Fixture contract tests must fail on missing required fields; keep raw snapshots and parser versions.                                            |
| Legal/redistribution uncertainty | Connector or public display must stop | Record terms/license status per source; default unknown sources to manual/provisional and link to facts only.                                   |
| Model alias collisions           | Different effort/snapshot rows merge  | Exact verified aliases only; fuzzy matches become review suggestions.                                                                           |
| Sparse dimensions                | Inflated overall scores               | Never fill missing with zero; publish coverage/confidence and enforce eligibility gates.                                                        |
| Metric incompatibility           | Invalid aggregation                   | Version transforms by benchmark metric; separate rank, Elo, pass@k and differing configs.                                                       |
| Source outage                    | Weekly edition disappears             | Append-only raw/snapshots, partial failure isolation and transactional publish preserve last edition.                                           |
| Non-deterministic video          | Historical output cannot reproduce    | Render solely from immutable snapshot, pinned fonts/assets/config and seeded animation timing.                                                  |
| Logo/trademark misuse            | Legal/brand risk                      | Use official licensed assets only; otherwise text/monogram fallback with source record.                                                         |
| SSRF or malicious source data    | Internal access/XSS                   | Registry-controlled HTTPS hosts, redirect rejection, size/time limits, schema validation and React escaping.                                    |
| Windows media/tooling variance   | Local render failure                  | Use Remotion-managed renderer and document Docker/FFmpeg fallback; smoke-test on the actual host.                                               |
| Moderate transitive advisories   | Dev-server or CSS stringify exposure  | Block high/critical advisories in CI. Do not expose Drizzle tooling or process untrusted CSS; review upstream Next/Drizzle fixes by 2026-08-01. |
