# Workspace integration timing — 2026-10-05

Issue: [#6](https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo/issues/6)

## Finding and fix

The current 15-second timeout was reproduced on the baseline: the first full-suite CI run failed at 15,789 ms (the callback completed its recorded stages in 15,841 ms). The ten target-only and ten workspace-file runs passed. This is a current concurrent integration-test failure, not just the historical five-second failure.

Build work dominates. Baseline CI stage medians under full-suite load were 142 ms setup, 10,069 ms baseline build, 3,293 ms added build, 182 ms assertions, and 9 ms cleanup. Host iowait was small (see below); the long first build is consistent with CPU contention while other package tests run. Process CPU can exceed wall time because V8 also uses helper threads; CPU and wall time cannot be subtracted to measure I/O waits.

A three-build local V8 CPU profile of the compiled baseline identified the repeated full-candidate filter in `decideProductEffort` and its caller as a hotspot (approximately 754 ms of sampled time). Each policy projection now constructs an invocation-local evidence index by canonical model ID. The existing decision function still performs its source, ID, inclusion, effort, and voting checks. Candidate order is retained, and each call rebuilds the index from current inputs.

The inference-only control reduced local target median from 2,381 ms to 1,811 ms on the same machine (24%). Its CI run passed all 30 commands. A local full-suite repetition also exposed `UNKNOWN: unknown error, open .../data/mappings/frontier-set.json` in the shared repository fixture. The final workspace tests use private temporary mappings and source inputs for all four tests. The exact cause of the Windows open error was not isolated; removing writes to the shared checkout eliminates that interaction from these tests.

## Reproduction and controls

```sh
pnpm install --frozen-lockfile
node scripts/measure-workspace-tests.mjs --iterations 10
```

Optional `--output DIRECTORY` keeps separate reports. Each report includes the source SHA, data fingerprint, runner hardware, command and test-stage timings, exit status, process CPU, filesystem operation counters, and Linux host CPU/iowait deltas. Raw logs and JSON are uploaded by the timing workflow; run links below identify their artifacts (14-day retention). The tables here retain the per-run measurements.

All three modes launch fresh processes in sequence. Run 1 is the first process in its mode; runs 2–10 are subsequent processes, with reused OS/build caches. These are **not controlled OS cold/warm-cache experiments**: even the input fingerprint reads files before testing. `pnpm test` runs Node script tests then Turbo, with three package test tasks eligible to overlap; Vitest 4.1.11 runs files concurrently using its default worker limit (`max(availableParallelism - 1, 1)`). Tests within this workspace file run sequentially. Turbo test caching is disabled; prerequisite build caching remains enabled and is recorded in the logs.

The final private fixture is prepared once in `beforeAll`. Its duration is recorded separately as `fixtureSetupMs`; the target-stage total excludes it, while command wall time includes fixture preparation and final removal. The five target stages still include the independent baseline copy, both real snapshot builds, comparisons, and baseline cleanup. The fixture hook uses the existing default hook budget.

The data tree has 171 files / 38,228,871 bytes. Every report has fingerprint `b2af7467d0a78d3623360ffca08c545b83eeb622aab1826475212bc754ee196a` (the harness path/length/content tree algorithm). CI pins Node 24.18.0 and pnpm 11.7.0 on ubuntu24, image 20260927.320.1, four logical CPUs and approximately 16 GB RAM. Hosted CPU models differ between jobs and are listed below; cross-job timing differences are observations, not a controlled CPU comparison. Local runs use Node 24.19.0, pnpm 11.7.0, Windows 10.0.26200, Intel Core Ultra 9 285HX, 24 logical CPUs, and 136,836,136,960 bytes RAM.

## Measurements

### CI baseline

Source SHA: `0c610f68d616200d251286ee1b6668a0a732d4e4`. CPU: Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz.

[Run and downloadable logs](https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo/actions/runs/37262463760).

All durations below are milliseconds. Each cell is **target stages / whole command**; `F` marks a failed command.

| Run | Target only | Workspace file |      Full suite |
| --- | ----------: | -------------: | --------------: |
| 1   | 4693 / 5900 |   4468 / 11734 | 15841 / 30150 F |
| 2   | 4364 / 5484 |   4413 / 11636 |   14383 / 28922 |
| 3   | 4255 / 5347 |   4503 / 11754 |   13444 / 28486 |
| 4   | 4427 / 5549 |   4232 / 11112 |   13674 / 28583 |
| 5   | 4365 / 5479 |   4450 / 11797 |   13127 / 28661 |
| 6   | 4391 / 5514 |   4524 / 11322 |   14239 / 27999 |
| 7   | 4444 / 5545 |   4280 / 11402 |   13496 / 28934 |
| 8   | 4373 / 5477 |   4305 / 11252 |   13954 / 28965 |
| 9   | 4438 / 5561 |   4528 / 11588 |   13354 / 29105 |
| 10  | 4428 / 5543 |   4396 / 11338 |   13675 / 28302 |

| Mode           | Target median | Target max | Command median | Command max | Failed commands |
| -------------- | ------------: | ---------: | -------------: | ----------: | --------------: |
| target         |          4409 |       4693 |           5528 |        5900 |            0/10 |
| workspace-file |          4431 |       4528 |          11495 |       11797 |            0/10 |
| full-suite     |         13675 |      15841 |          28791 |       30150 |            1/10 |

Full-suite stage medians (wall / process user+system CPU ms):

| Stage          |  Wall |  CPU |
| -------------- | ----: | ---: |
| setup          |   142 |   67 |
| baseline-build | 10069 | 5035 |
| added-build    |  3293 | 3415 |
| assertions     |   182 |  202 |
| cleanup        |     9 |   13 |

Full-suite host iowait share: median 0.000%, maximum 0.018%. These counters cover the entire runner, not the test alone.

### CI inference-only control

Source SHA: `7e64bdba21a93e83c333648adafe9ab2738b8c8d`. CPU: AMD EPYC 7763 64-Core Processor.

[Run and downloadable logs](https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo/actions/runs/37262885960).

All durations below are milliseconds. Each cell is **target stages / whole command**; `F` marks a failed command.

| Run | Target only | Workspace file |    Full suite |
| --- | ----------: | -------------: | ------------: |
| 1   | 3249 / 4401 |    3314 / 8691 | 12712 / 26924 |
| 2   | 3255 / 4403 |    3241 / 8611 | 12237 / 25619 |
| 3   | 3460 / 4629 |    3201 / 8494 | 12132 / 25796 |
| 4   | 3184 / 4330 |    3292 / 8650 | 12174 / 25665 |
| 5   | 3372 / 4538 |    3301 / 8713 | 12179 / 25570 |
| 6   | 3306 / 4547 |    3183 / 8523 | 12647 / 25809 |
| 7   | 3338 / 4474 |    3279 / 8685 | 11877 / 25743 |
| 8   | 3290 / 4439 |    3318 / 8735 | 11515 / 25574 |
| 9   | 3303 / 4462 |    3275 / 8678 | 12319 / 25479 |
| 10  | 3260 / 4404 |    3259 / 8661 | 12046 / 25764 |

| Mode           | Target median | Target max | Command median | Command max | Failed commands |
| -------------- | ------------: | ---------: | -------------: | ----------: | --------------: |
| target         |          3297 |       3460 |           4451 |        4629 |            0/10 |
| workspace-file |          3277 |       3318 |           8670 |        8735 |            0/10 |
| full-suite     |         12176 |      12712 |          25704 |       26924 |            0/10 |

Full-suite stage medians (wall / process user+system CPU ms):

| Stage          | Wall |  CPU |
| -------------- | ---: | ---: |
| setup          |  223 |   86 |
| baseline-build | 8071 | 3859 |
| added-build    | 3591 | 2866 |
| assertions     |  195 |  211 |
| cleanup        |   14 |   17 |

Full-suite host iowait share: median 0.000%, maximum 0.010%. These counters cover the entire runner, not the test alone.

### CI final

Source SHA: `8b2d5828497ef7c13aeedf5c35c93535be922096`. CPU: INTEL(R) XEON(R) PLATINUM 8573C.

[Run and downloadable logs](https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo/actions/runs/37263317881).

All durations below are milliseconds. Each cell is **target stages / whole command**; `F` marks a failed command.

| Run | Target only | Workspace file |   Full suite |
| --- | ----------: | -------------: | -----------: |
| 1   | 2676 / 3727 |    2634 / 6868 | 7632 / 23687 |
| 2   | 2771 / 3799 |    2502 / 6676 | 9117 / 22448 |
| 3   | 2577 / 3626 |    2558 / 6741 | 9061 / 22403 |
| 4   | 2584 / 3580 |    2559 / 6758 | 9100 / 22357 |
| 5   | 2539 / 3551 |    2580 / 6760 | 9278 / 22458 |
| 6   | 2528 / 3510 |    2507 / 6729 | 9134 / 22395 |
| 7   | 2520 / 3533 |    2531 / 6756 | 9087 / 22172 |
| 8   | 2547 / 3558 |    2558 / 6757 | 9386 / 22429 |
| 9   | 2733 / 3721 |    2521 / 6697 | 8965 / 22205 |
| 10  | 2577 / 3665 |    2552 / 6731 | 9227 / 21947 |

| Mode           | Target median | Target max | Command median | Command max | Failed commands |
| -------------- | ------------: | ---------: | -------------: | ----------: | --------------: |
| target         |          2577 |       2771 |           3603 |        3799 |            0/10 |
| workspace-file |          2555 |       2634 |           6749 |        6868 |            0/10 |
| full-suite     |          9108 |       9386 |          22399 |       23687 |            0/10 |

Full-suite stage medians (wall / process user+system CPU ms):

| Stage          | Wall |  CPU |
| -------------- | ---: | ---: |
| setup          |  118 |   49 |
| baseline-build | 6181 | 2869 |
| added-build    | 2733 | 2164 |
| assertions     |  148 |  171 |
| cleanup        |   12 |   10 |

Full-suite host iowait share: median 0.251%, maximum 0.362%. These counters cover the entire runner, not the test alone.

Full-suite private fixture setup: median 129 ms, maximum 197 ms.

### Local baseline

Source SHA: `5fb7639880b56088ba083d68deaf69264123c213`. CPU: Intel(R) Core(TM) Ultra 9 285HX.

All durations below are milliseconds. Each cell is **target stages / whole command**; `F` marks a failed command.

| Run | Target only | Workspace file |   Full suite |
| --- | ----------: | -------------: | -----------: |
| 1   | 2379 / 4767 |    2371 / 7405 | 3502 / 13412 |
| 2   | 2333 / 4004 |    2457 / 7448 | 2963 / 14666 |
| 3   | 2342 / 4023 |    2464 / 7305 | 3036 / 13602 |
| 4   | 2361 / 4032 |    2321 / 7176 | 3534 / 16690 |
| 5   | 2363 / 4028 |    2341 / 7181 | 3322 / 16195 |
| 6   | 2455 / 4146 |    2375 / 7354 | 3515 / 16470 |
| 7   | 2384 / 4042 |    2420 / 7258 | 3836 / 17084 |
| 8   | 2398 / 4079 |    2335 / 7194 | 3387 / 16816 |
| 9   | 2422 / 4100 |    2328 / 7117 | 3741 / 15904 |
| 10  | 2384 / 4071 |    2348 / 7182 | 4020 / 15670 |

| Mode           | Target median | Target max | Command median | Command max | Failed commands |
| -------------- | ------------: | ---------: | -------------: | ----------: | --------------: |
| target         |          2381 |       2455 |           4057 |        4767 |            0/10 |
| workspace-file |          2360 |       2464 |           7226 |        7448 |            0/10 |
| full-suite     |          3508 |       4020 |          16049 |       17084 |            0/10 |

Full-suite stage medians (wall / process user+system CPU ms):

| Stage          | Wall |  CPU |
| -------------- | ---: | ---: |
| setup          |  706 |  250 |
| baseline-build | 1312 | 1750 |
| added-build    | 1398 | 1664 |
| assertions     |   61 |   78 |
| cleanup        |   10 |   24 |

### Local final

Source SHA: `4b21bfbec92de5248c7be2fd52e4c7d4bae8629f`. CPU: Intel(R) Core(TM) Ultra 9 285HX.

All durations below are milliseconds. Each cell is **target stages / whole command**; `F` marks a failed command.

| Run | Target only | Workspace file |   Full suite |
| --- | ----------: | -------------: | -----------: |
| 1   | 1857 / 3780 |    1847 / 6790 | 3215 / 15820 |
| 2   | 1815 / 3685 |    1822 / 6873 | 2333 / 15698 |
| 3   | 1837 / 3683 |    1805 / 6602 | 2344 / 16510 |
| 4   | 1845 / 3712 |    1799 / 6695 | 2399 / 16765 |
| 5   | 1830 / 3683 |    1811 / 6607 | 2442 / 17215 |
| 6   | 1872 / 3770 |    1820 / 6694 | 2394 / 16608 |
| 7   | 1816 / 3664 |    1820 / 6294 | 2290 / 15557 |
| 8   | 1829 / 3732 |    1915 / 6351 | 2242 / 15998 |
| 9   | 1784 / 3640 |    1850 / 6369 | 2301 / 15832 |
| 10  | 1853 / 3716 |    1830 / 6689 | 2224 / 15646 |

| Mode           | Target median | Target max | Command median | Command max | Failed commands |
| -------------- | ------------: | ---------: | -------------: | ----------: | --------------: |
| target         |          1834 |       1872 |           3699 |        3780 |            0/10 |
| workspace-file |          1821 |       1915 |           6648 |        6873 |            0/10 |
| full-suite     |          2338 |       3215 |          15915 |       17215 |            0/10 |

Full-suite stage medians (wall / process user+system CPU ms):

| Stage          | Wall |  CPU |
| -------------- | ---: | ---: |
| setup          |  201 |  172 |
| baseline-build | 1006 | 1500 |
| added-build    | 1055 | 1374 |
| assertions     |   67 |   78 |
| cleanup        |   12 |   47 |

Full-suite private fixture setup: median 741 ms, maximum 998 ms.

## Budget and regression checks

The target retains its 15,000 ms budget. The repeated final CI full-suite maximum was 9,386 ms; the linked full quality run recorded 11,141 ms for the same final implementation. Using that more conservative observation leaves 3,859 ms (34.6% above 11,141 ms) of headroom. All ten final full-suite repetitions passed. The timeout is not raised, so a regression that exceeds the existing budget still fails. The repeat workflow remains available for changed data, dependencies, or runner performance; these ten observations are not a percentile guarantee.

The regression tests compare projections against full-list effort decisions across multiple models, direct/default/inferred efforts, null identities, repeated IDs, excluded evidence, comparison-only evidence, matched and unmatched costs, and source edits between invocations. The real FrontierSWE comparison continues to check presets, defaultPresetId, costs, frontier, existing evidence/profiles, and added comparison evidence.

The full product produced before and after the inference change with `generatedAt=2026-10-01T00:00:00.000Z` had identical JSON SHA-256: `7f12a1ae35301bc04758be817e1ab985e63d14a7cd3fdd6b88422c27515d4704`.

[Full quality CI for the final implementation](https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo/actions/runs/37263317890) covers formatting, lint, types, tests, production build, and browser/accessibility gates.
