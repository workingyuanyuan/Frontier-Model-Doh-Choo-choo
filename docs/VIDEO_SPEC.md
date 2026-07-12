# Video Spec

## Composition

- 1920×1080, 16:9, H.264 MP4.
- 30 fps, 600 frames and a 20-second editorial cut.
- The selected model and Top-N list come from validated composition props.
- Input is one immutable ranking snapshot plus locale, theme and timing config.

## Sequence

1. Intro, frames 0–104: edition, product name and the preview-data disclaimer.
2. Model profile, frames 90–359: rank, identity, score, coverage/confidence and deterministic radar comparison.
3. Ranking, frames 330–489: Top-N list and eight-axis score breakdown.
4. Evidence, frames 465–599: staged/published status, content hash, missing-data policy and closing note.

Short overlaps between adjacent scenes provide cross-fades without leaving uncovered frames.

Radar values interpolate deterministically between model segments. Reduced-motion applies to Web; video timing avoids rapid flashes and keeps every text state readable.

## Themes and locale

Editorial and studio video presets use the same all-light semantic-token intent and radar geometry as Web. Both `zh-TW` and `en` are accepted by the validated input contract. Unknown/missing logos use a project-owned neutral brand mark or text fallback.

The default composition uses fictional, explicitly labeled preview values. A production render must receive a validated immutable published snapshot; preview fixture values are never formal benchmark claims.

## Commands and artifacts

```bash
pnpm video:studio
pnpm video:still
pnpm video:render
```

The current smoke workflow emits `artifacts/llm-bench-weekly.png` and `output/llm-bench-weekly.mp4`. The verified demo render is 1920×1080, H.264, 600 frames, approximately 20.05 seconds and 3.11 MiB. A later publication slice will add the deterministic artifact manifest, ranking CSV, snapshot ID and structured render log.
