# Design System

## Visual direction

The four supplied references use a pale gray canvas, high-information white cards, strong model/rank numerals, restrained shadows, colored benchmark strokes and a dominant radar chart. The implementation keeps that hierarchy without copying layout, logos, typography or pixels.

The user selected an all-light baseline. Google-inspired uses clearer elevation and brighter multicolor accents; Apple-inspired uses quieter neutrals, more whitespace and subtle translucent surfaces. Both meet WCAG AA contrast.

## Semantic tokens

`background`, `surface`, `surface-elevated`, `text-primary`, `text-secondary`, `grid`, `axis`, `accent`, `positive`, `negative`, `warning`, `model-brand`, `radar-fill`, `radar-stroke`, `shadow`, `blur`, `radius`, `motion-duration`, `motion-easing`.

Components consume only semantic tokens. Model/provider colors are validated metadata with an accessible fallback, never scattered literals.

## Layout

- Desktop model stage: identity/summary rail plus a dominant radar region, inspired by the 16:9 reference without duplication.
- Mobile: identity, score/quality, radar, evidence and metadata in reading order.
- Breakpoint verification: 320, 768, 1024 and 1440 CSS pixels.
- Real bilingual content is used during layout testing; long model names wrap or truncate with an accessible full label.

## Radar behavior

- Pure shared geometry uses a fixed eight-axis order and 0–100 scale.
- Complete series render a filled polygon; missing axes render explicit N/A markers and broken/dashed segments, never implicit zero.
- Theme switching changes paint only; geometry snapshots must be byte-identical.
- Web supports keyboard-readable legend, SVG title/description, visible focus, reduced motion and an equivalent data table.
- Single-model Web, two-to-five-model comparison, static SVG/PNG and Remotion consume the same validated presentation output, including rings, axes, labels, series geometry and equivalent table rows.
- Animation progress is deterministic and renderer-independent. Reduced-motion Web output selects the final state without changing score or null semantics.

## Motion

Use restrained score counting, staged labels and smooth polygon morphs. No high-frequency flashing. `prefers-reduced-motion` removes nonessential Web animation while preserving state changes.
