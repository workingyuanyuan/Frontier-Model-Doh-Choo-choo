# Video Spec

## Composition

- 1920×1080, 16:9, H.264 MP4.
- Default 60 fps; configurable 30 fps fallback.
- Top-N configurable and presented from rank N to rank 1.
- Input is one immutable ranking snapshot plus locale, theme and timing config.

## Sequence

1. Intro: edition, data cutoff, product name, source/method note.
2. Model segments: rank, model/provider fallback identity, overall score, eight values, radar, coverage/confidence and deltas.
3. Top 3: stronger hierarchy without changing radar scale or score presentation.
4. Final: Top 3 summary, next update, website and methodology/source note.

Radar values interpolate deterministically between model segments. Reduced-motion applies to Web; video timing avoids rapid flashes and keeps every text state readable.

## Themes and locale

Google-inspired and Apple-inspired video presets use the same light semantic tokens as Web. Both `zh-TW` and `en` must render without clipped names or labels. Unknown/missing logos use a text monogram.

## Commands and artifacts

```text
pnpm video:preview
pnpm video:render --edition YYYY-MM-DD --theme apple --locale zh-TW
pnpm video:render --edition latest --theme google --locale en
```

Each successful render emits MP4, poster PNG, metadata JSON, ranking CSV, snapshot ID and structured render log. A smoke composition renders in CI; one complete demo render is required for delivery.
