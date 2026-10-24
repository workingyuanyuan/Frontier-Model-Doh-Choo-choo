# Workspace build CPU — 2026-10-24

`buildWorkspaceProduct` uses 40.1% less process CPU in fresh-process measurements:
the median of seven calls fell from 1,244 ms to 745 ms. Median wall time fell
from 899 ms to 514 ms. Each call used the real workspace inputs, a fixed
`generatedAt`, and `writeFrontier: false`.

## Profile and changes

V8 `node --cpu-prof` profiles covered seven sequential builds per implementation.
The table gives average inclusive main-thread sampled milliseconds per build;
rows overlap and exclude V8 helper-thread CPU. Baseline source is HEAD
`bfb874a`; the final profile includes the legacy mapping validation checks.

| Hotspot                                             | Before | After |
| --------------------------------------------------- | -----: | ----: |
| Cost profile projection                             |    268 |    27 |
| Frontier computation                                |     79 |     9 |
| Cohort generation, included in frontier computation |     38 |     5 |
| Current-result selection across all callers         |     44 |     8 |
| JSON parsing in workspace and coverage loaders      |     69 |    41 |
| Canonical product JSON serialization                |     84 |    78 |

The changes preserve selection and validation semantics:

- Cost matching groups candidates by the exact source ID, canonical model ID,
  and raw name tuple. Each group is stably sorted by candidate ID once.
  The effort match, first-row fallback, duplicate-ID decision lookup, and
  cost schema validation use the existing logic. This removes a complete
  candidate scan and sort for every cost record.
- Frontier computation accepts the current build's validated, identity-resolved,
  profiled candidates and mappings. Standalone generation retains its loader.
  Workspace builds also retain the loader's legacy benchmark and frontier
  configuration validation. Reuse is confined to one invocation.
- All nine AA cohorts share one current-result selection from the same ordered
  candidates. Eligibility still selects separately for each source. Product
  scoring retains its own candidate-ID ordering and selection.
- Current-result sorting uses the identity keys already stored in the selection
  map, with the same `localeCompare` ordering, instead of rebuilding keys for
  every comparison.

## Measurements

Environment: Linux x86-64, Intel Core Ultra 9 285HX, 24 logical CPUs,
Node 24.18.0, pnpm 11.7.0, Vitest 4.1.12. OS caches were reused; these are not
storage cold-cache measurements. CPU means process user plus system CPU.

Seven fresh-process before/after pairs alternated implementations. The baseline
was reconstructed from HEAD's three changed implementation files into a private
copy of `dist/`, using TypeScript transpilation and the same dependencies.
Every process built once, with timing starting after module imports.

The repeated-process profile control gave CPU medians of 1,015 ms before and
521 ms after. The fresh-process result above is the primary comparison because
it includes first-build JIT and allocation costs.

The target test ran in three fresh Vitest processes per implementation, including
its normal artifact writes into private fixtures. Stage medians in milliseconds:

| Stage          | Before wall / CPU | After wall / CPU |
| -------------- | ----------------: | ---------------: |
| Setup          |           43 / 33 |          42 / 33 |
| Baseline build |       981 / 1,418 |      613 / 1,003 |
| Added build    |       819 / 1,049 |        501 / 776 |
| Assertions     |           54 / 74 |          53 / 70 |
| Cleanup        |             4 / 7 |            3 / 5 |

The median sum of target stages fell from 1,925 ms to 1,218 ms. Fixture setup,
reported separately by the existing instrumentation, is outside those totals.

For contention, `taskset -c 0-3 pnpm exec turbo run test --continue=always`
ran all three package tasks. There was one baseline run and three after runs.
`--continue=always` let benchmark tests complete despite acquisition subprocess
failures also observed before the change.

| Target measurement               |        Before |         After |
| -------------------------------- | ------------: | ------------: |
| Baseline-build median wall / CPU | 1,401 / 1,483 | 1,111 / 1,043 |
| Added-build median wall / CPU    | 1,028 / 1,184 |     559 / 761 |
| Total stage wall median          |         2,546 |         1,949 |
| Total stage wall maximum         |         2,546 |         2,001 |

Both build stages together use about 32% less CPU under this contention.
The three whole-product tests have a 15,000 ms timeout. Applying the historical
CI slowdown ratio conservatively to the new local maximum gives
`15,800 / 2,546 * 2,001 ≈ 12,418 ms`, leaving about 2.6 seconds. This is an
estimate, not a new CI measurement. A final four-CPU run with the 15-second
timeouts passed all 170 benchmark-data tests; its target stages totaled 1,980 ms.

### CI measurement

The workspace-timing job for PR #22 ran ten repetitions per mode on a hosted
four-vCPU runner ([run](https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo/actions/runs/40082294689)).
Target-stage totals in milliseconds, compared with run 40078256372 on the
pre-change implementation (PR #21):

| Mode           | Before median | Before max | After median | After max |
| -------------- | ------------: | ---------: | -----------: | --------: |
| target         |         3,813 |      3,858 |        2,299 |     2,489 |
| workspace-file |         3,828 |      3,872 |        2,298 |     2,321 |
| full-suite     |        14,588 |     15,307 |       10,508 |    11,453 |

The full-suite maximum leaves 3.5 seconds (24%) under the 15-second timeout.
All 30 commands passed.

## Output and verification

All measured products at `generatedAt=2026-10-01T00:00:00.000Z` had identical
`JSON.stringify(product)` SHA-256:
`ef4ba3058b1e0b1e81d149fc9e2c0fc8594c2d3ff0177937136a96b4ece7213e`.
Standalone frontier generation and workspace generation were each run in a
private input copy. Both frontier JSON files matched the committed files byte
for byte.

- Benchmark-data build, root typecheck, lint, and changed-file formatting passed.
- Benchmark-data: 170/170 tests passed. Bench: 178/178 passed. Acquisition:
  504 passed, three failed with `spawnSync ... EPERM`, as on the baseline.
- Root `pnpm test` failed in the script-test phase on both implementations:
  release-state's git subprocess is denied with `EPERM`, and the static-server
  child exits before listening. Turbo package tests were therefore run directly
  with `--continue=always` for the contention measurements.
- `pnpm data:verify-fresh` cannot start the `tsx` CLI's IPC server in this
  environment (`listen EPERM`). The same CLI entrypoint ran successfully with
  `node --import tsx packages/benchmark-data/src/cli.ts verify-fresh .`.
  It reproduced committed product version
  `sha256:100255688c97bdec89a58120082835aef60f3d59ef8bb9e0e6e1043332da1bae`
  and verified both frontier artifacts.

Commands used `pnpm_config_verify_deps_before_run=false` because pnpm's automatic
dependency check otherwise attempts to open an inaccessible store SQLite file.
