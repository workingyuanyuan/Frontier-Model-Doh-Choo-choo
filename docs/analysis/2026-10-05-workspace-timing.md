# Workspace integration timing — 2026-10-05

Issue: https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo/issues/6

## Reproduction

```sh
pnpm install --frozen-lockfile
node scripts/measure-workspace-tests.mjs --iterations 10
```

The harness runs the target test, the complete workspace test file, and full
parallel `pnpm test` ten times each. It retains logs and per-stage wall time,
process CPU, and filesystem operation counters in `artifacts/workspace-timing`.
The GitHub workflow pins Node 24.18.0 and pnpm 11.7.0 and uploads the report.
Each command starts a fresh process. The first run and subsequent runs are
reported separately; the OS filesystem cache is uncontrolled. Linux CPU/iowait
counters describe the whole runner and cannot identify waits inside one test.

## Existing evidence

Successful full CI run [37260159684](https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo/actions/runs/37260159684)
recorded 7,565 ms for the target test. Run
[37257617304](https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo/actions/runs/37257617304)
recorded 13,942 ms. Both exceed the original 5-second limit and passed with the
15-second integration timeout introduced in PR #10. The latter leaves only
1,058 ms of margin, so repeated measurements are required.

## Investigation

Initial local profiling (Windows, Intel Core Ultra 9 285HX, Node 24.19.0) points
to repeated whole-dataset scans during product effort inference. The instrumented
real-snapshot test separates setup, both builds, assertions, and cleanup so the
repeat runs can distinguish setup cost from assembly cost. Final measurements
and the resulting budget decision will be recorded with this change.
