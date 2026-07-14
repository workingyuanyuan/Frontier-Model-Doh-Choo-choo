# Video Spec

## Composition

- 1920×1080, 16:9, H.264 MP4.
- 30 fps, 600 frames and a 20-second editorial cut.
- The selected model and Top-N list come from validated composition props.
- Input is one persisted weekly edition and its immutable ranking snapshot plus publication mode, canonical content hash, locale and theme.

## Sequence

1. Intro, frames 0–104: edition, product name and a publication-mode label.
2. Model profile, frames 90–359: rank, identity, score, coverage/confidence and deterministic radar comparison.
3. Ranking, frames 330–489: Top-N list and eight-axis score breakdown.
4. Evidence, frames 465–599: canonical content hash, model/source counts, missing-data policy and closing note.

Short overlaps between adjacent scenes provide cross-fades without leaving uncovered frames.

Radar values interpolate deterministically between model segments. Reduced-motion applies to Web; video timing avoids rapid flashes and keeps every text state readable.

## Themes and locale

Editorial and studio video presets use the same all-light semantic-token intent and radar geometry as Web. Both `zh-TW` and `en` are accepted by the validated input contract. Unknown/missing logos use a project-owned neutral brand mark or text fallback.

The default composition uses fictional, explicitly labeled preview values. The edition CLI resolves only a persisted, activated edition and preserves its PREVIEW/FORMAL mode in props and metadata. PREVIEW output never becomes a formal claim or persisted video job.

## Commands and artifacts

```bash
pnpm video:studio
pnpm video:still
pnpm video:render
pnpm video:edition -- --edition <uuidv7> --locale zh-TW --theme editorial --top 5 --model <canonical-slug> --media poster
pnpm video:edition -- --snapshot <uuidv7> --locale en --theme studio --top 5 --media video
```

The default preview commands retain `artifacts/llm-bench-weekly.png` and `output/llm-bench-weekly.mp4`. Edition renders write an isolated directory under `output/video/<date>/<snapshot>/<locale>-<theme>-topN-model-<slug>-<media>/` containing the JSON props, artifact-v2 metadata, RFC 4180 ranking CSV, PNG/MP4 and structured render log. Metadata binds the canonical database snapshot SHA-256 and a separate serialized-props SHA-256. The real 2026-07-13 PREVIEW poster reproduced byte-for-byte at SHA-256 `a0bc69935eadd21906e9fcaf13fa5705f9643bc7fc72abe6e7b8fe3a1d4ccfb2`; it created no job. PostgreSQL integration tests prove FORMAL job lifecycle persistence and roll all fixtures back.
