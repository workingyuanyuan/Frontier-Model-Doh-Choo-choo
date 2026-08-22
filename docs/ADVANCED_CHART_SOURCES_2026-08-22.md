# Advanced cost chart source measurement — 2026-08-22

## Approved decision

The user approved ARC Prize as the fourth advanced-chart source on 2026-08-22. Production therefore uses
Artificial Analysis, DeepSWE, Frontier Code, and ARC Prize at 1/4 each. Qualifying profiles fall
from 31 to 27, models from 13 to 12, while the five models that have enough points to draw an effort curve are
unchanged. Vals cannot be added to the advanced chart: its one-row-per-model design leaves nine isolated points
and zero connectable effort curves.

Zapier is intentionally absent from every combination in this report. The N2 re-review ruling keeps its data but
defers source adoption and advanced-chart measurement until after the N phase.

## Measured combinations

| Combination                            | Equal weight | Qualifying profiles | Models | Connectable models (2+ profiles) | Actual X range | Actual Y range |
| -------------------------------------- | -----------: | ------------------: | -----: | -------------------------------: | -------------: | -------------: |
| Prior: AA + DeepSWE + Frontier Code    |     1/3 each |                  31 |     13 |                                5 |     0.00–98.88 |    16.93–61.58 |
| Approved: add ARC Prize                |     1/4 each |                  27 |     12 |                                5 |     8.72–95.87 |    13.98–68.79 |
| Add ARC Prize + Vals (diagnostic only) |     1/5 each |                   9 |      9 |                                0 |    43.01–96.69 |    39.36–68.47 |

The X values are the actual blended normalized-cost indices produced by the chart algorithm, not dollar amounts.
Each source first normalizes the logarithm of its task costs against that source's full observed range; the
combination then takes an equal-weight arithmetic mean.

For the approved 27 points, the source-score population standard deviations are AA 7.00, DeepSWE 18.43,
Frontier Code 9.29, and ARC Prize 25.51. The chart intentionally averages raw 0–100 source scores, so ARC Prize
contributes more score dispersion than its nominal 1/4 weight; this is disclosed in the specification rather than
hidden by re-normalizing scores.

## Coverage details

The five connectable models are the same in the three- and four-source combinations:

- Claude Opus 5
- Gemini 3.7 Flash
- GPT-5.6 Luna
- GPT-5.6 Sol
- GPT-5.6 Terra

Adding ARC removes four points in total:

- Claude Sonnet 5 loses its only qualifying point and is the one model removed.
- Claude Opus 5 retains high and max but loses low, medium, and xhigh.

The remaining eleven four-source models retain the same qualifying profile counts. In particular, Gemini 3.7
Flash keeps three effort points, and GPT-5.6 Luna, Sol, and Terra each keep all five.

Adding Vals is not a valid advanced-chart option. Vals publishes one configuration per model rather than an
effort ladder. Exact profile matching therefore leaves only one point for each of nine models and no line that can
show how cost and score move with effort. Its `vals_index` cost remains valid for the default chart under D4; this
limitation applies only to the advanced effort-curve view.

## Source-local pairing contract

| Source              | Score paired with task cost            | Admission rule                                                   |
| ------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| Artificial Analysis | Published Intelligence Index raw score | Same product profile has both index score and measured task cost |
| DeepSWE             | `deepswe-1-1` normalized score         | Same product profile has score and task cost                     |
| Frontier Code       | `frontier-code-1-1` normalized score   | Same product profile has score and task cost                     |
| ARC Prize           | `arc-agi` normalized score             | Same product profile has score and task cost                     |
| Vals diagnostic     | `vals-index` raw score                 | Same product profile has index score and `vals_index` cost       |

No source may borrow another effort profile, use a source-wide average as a replacement score, or fill a missing
cost. A model is "connectable" only when at least two exact profiles pass every source in the combination.

## D5 decision

**Approved: add ARC Prize at 1/4 each.** This yields 27 profiles and 12 models, with the same five connectable
models as the old three-source chart. The rejected alternatives were:

- Keep the prior three sources at 1/3 each: 31 profiles, 13 models, five connectable models.
- Add Vals as a fifth source: nine profiles, nine models, zero connectable models.

Vals remains default-chart-only because it yields zero effort curves. Zapier remains outside this decision until
the post-N source-adoption review.

## Reproduction

From the repository root, after rebuilding `data-v2/product/current.json`:

```powershell
pnpm exec tsx scripts/measure-advanced-cost-sources.ts
```

The script reads only the generated ProductVersion and prints the exact profiles, models, efforts, and X ranges
used for the table above.
