# Sparkline

> SOLAR Web · Figma page `↳ 🟢 Sparkline` (id `5113:2`) · section `components/data-visualization` · raw data: [`raw/components/data-visualization/sparkline.json`](../../raw/components/data-visualization/sparkline.json)

## Component set: Sparkline

Tiny inline trend visualization — fits inside a Stat Card or table cell.

Variants:
trend = up (positive, green) | down (negative, red) | flat (neutral, gray)
size = sm (80×24) | md (120×32)

No axis labels, no plot chrome — pure shape conveying direction. Stroke bound to data/delta/positive-500 / negative-500 / neutral. Override path data per instance to plot real values.

### Props

| Prop    | Type    | Options / default    |
| ------- | ------- | -------------------- |
| `trend` | variant | **up** · down · flat |
| `size`  | variant | **sm** · md          |

Default variant: `trend=up, size=sm` · 6 variants · default size 115×32px

### Anatomy (default variant)

- **trend=up, size=sm** · component · FIXED/FIXED · 115×32
  - **Line** · vector · 80×24  
    stroke `color.data.delta.positive-500` 1.5px

### Tokens used

| Role    | Tokens                          |
| ------- | ------------------------------- |
| Strokes | `color.data.delta.positive-500` |

### Variant matrix

| trend | size | size   | fill | stroke | effect | text | icon |
| ----- | ---- | ------ | ---- | ------ | ------ | ---- | ---- |
| up    | sm   | 115×32 |      |        |        |      |      |
| up    | md   | 115×32 |      |        |        |      |      |
| down  | sm   | 115×32 |      |        |        |      |      |
| down  | md   | 115×32 |      |        |        |      |      |
| flat  | sm   | 115×32 |      |        |        |      |      |
| flat  | md   | 115×32 |      |        |        |      |      |

## Documentation card

**Description**

A compact, axis-less trend line for inline contexts — table cells, stat cards, list rows. Conveys shape at a glance, not exact values.

**Anatomy**

Single series line · optional end-point marker · optional min/max dots · no axes or labels.

**Data & Colour**

One data-colour token — usually neutral, or the delta palette for positive/negative trends. Sized to its container; no gridlines.

**States**

Non-interactive by default (Class K). An optional tooltip may appear on hover or focus where space allows.

**Accessibility**

Never the sole source of a value — pair it with the actual number nearby. Provide an aria-label summarising trend + latest value. Line ≥3:1 vs surface.

**Rules**

Pair with the real value  
Keep to one series  
Use delta colours for +/- trends  
Size to the container

Add axes or gridlines  
Rely on it for exact values  
Cram multiple series  
Use in isolation without a label
