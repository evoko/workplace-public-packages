---
solar:
  reviewed: 2026-09-22
  figmaVersion: '2402047167094879156'
  sources:
    documentation/data-visualization: 52f3b4622300
---

# 10 · Data Visualization

> Source: Figma page "Visual Language › Data Visualization" (overview, chart types,
> color, axes/labels/grid, responsive & threshold behaviour, do's and don'ts) and its
> `@SOLAR:PAGE_CONTEXT`. Data color tokens verified against the Color collection.

## Position

Biamp products surface system status, network health, audio levels, and device
metrics. Visualizations must support quick operational decisions without overwhelming
users. SOLAR prioritizes legibility, semantic color usage, and accessible encoding over
visual richness.

| Principle                    | Meaning                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Accuracy over aesthetics** | Represent data truthfully: never truncate axes, distort proportions, or use effects that misrepresent scale  |
| **Semantic color only**      | Data categories use the dedicated data palette; status indicators use feedback tokens                        |
| **Readable at a glance**     | Every visualization answers one clear question; if it needs extensive explanation, simplify or split         |
| **Accessible encoding**      | Color is never the only differentiator; use pattern fills, labels, shapes, or position as secondary encoding |

## Chart types

| Type             | Use for                                                              | Constraints                                                                 |
| ---------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Bar chart        | Comparing discrete categories (default choice)                       | Horizontal bars for long labels; value axis always starts at zero           |
| Line chart       | Trends over continuous time                                          | Limit to 4–5 lines                                                          |
| Area chart       | Volume or cumulative values over time                                | Use sparingly; stacked areas are hard to read; prefer lines for precision   |
| Donut chart      | Part-to-whole with 2–5 segments                                      | Never for category comparison; never more than 5 segments; avoid pie charts |
| Scatter          | Correlation between two variables                                    | —                                                                           |
| Table            | Precise, sortable, filterable values                                 | Use when exact numbers matter more than shape                               |
| Sparkline        | Inline trend inside tables or cards                                  | No axis labels, no grid; context, not precision                             |
| Status indicator | Current state (good / warning / critical) as one color-coded element | Always paired with a text label                                             |

Choose the simplest chart type that accurately communicates the data. If the data does
not fit comparison, composition, distribution, or trend, a table may be better.

## Color

The data palette is separate from action and feedback tokens. **Never mix the data
palette and feedback tokens in one chart**; use one system per visualization.

| Data type    | Tokens                                                                       | Rule                                                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categorical  | `color.data.category.01…08.{strong,subtle}`                                  | Use in order; do not skip or rearrange (order is optimized for adjacent contrast). `strong` for lines, bars, points; `subtle` for backgrounds, ranges, de-emphasized fills |
| Sequential   | `color.data.scale.100…900` (purple ramp, inverted in Dark)                   | Single hue, lighter = lower, darker = higher                                                                                                                               |
| Delta        | `color.data.delta.{negative-100,-300,-500,neutral,positive-100,-300,-500}`   | Directional change; red negative, green positive, neutral/300 for no change                                                                                                |
| Status       | `color.surface.feedback.*`, `color.text.feedback.*`, `color.icon.feedback.*` | Green healthy, orange warning, red danger; always reinforced with text or icon                                                                                             |
| Audio meters | `color.meter.{nominal,warning,peak}` (green/500, yellow/400, red/500)        | Level meters in SOLAR Audio                                                                                                                                                |

Category order and hue: 01 red, 02 orange, 03 yellow, 04 green, 05 turquoise, 06 blue,
07 purple, 08 pink. Full Light/Dark resolution in [05-color.md](05-color.md#data).

Chart backgrounds use `color.surface.base`; grid lines use a low-contrast neutral
(`color.border.subtle`). Reserve the full palette for multi-series charts.

## Axes, labels, grid

- Label both axes and put units (ms, dB, %, count) directly on the axis, never only in
  the title.
- Start value axes at zero unless there is a strong, documented reason.
- Use the SOLAR type scale: axis labels at the smallest body size (never below 12 px
  per the page context, i.e. `body/sm`); data labels the same or one step larger; chart
  titles use the H4-equivalent title style (`title/sm`).
- Horizontal grid lines only, low contrast; vertical grid lines add noise; never both.
- Legends below the chart for horizontal layouts, to the right for vertical; never
  inside the plot area. Above or right per the page context; never overlapping data.
- Reference lines (targets, thresholds, averages) are labeled with their value.
- Tooltips on hover (desktop) or tap (mobile) show series name, value, and unit.
- Empty state: clear message plus an action.

## Responsive and threshold behaviour

- **Simplify, don't shrink.** Reduce label density and grid lines as the container
  narrows; legibility always wins.
- **Switch formats at breakpoints.** A full-width bar chart may become a horizontal bar
  or a compact list below a defined width; define the transition per chart type.
  Mobile may switch to summary + sparkline; wide time series may scroll horizontally.
- **Threshold lines are always labeled** and use the matching feedback color token.
- **Status zones** behind data use `color.surface.feedback.{type}` at reduced opacity
  (or the `subtle-alpha` tones) so data stays readable on top.
- Charts must never truncate critical data at any breakpoint.

## Accessibility

- Every chart has a text summary or data-table fallback, and an `aria-label` or
  `aria-describedby` summarizing the key insight.
- Series are distinguishable without color (shape markers or pattern fills).
- Data elements meet ≥ 3:1 contrast against the background.
- Interactive charts are keyboard navigable.
- Data entrance animations respect `prefers-reduced-motion`.

## Do and don't

| Do                                       | Don't                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| Use feedback tokens for status data      | Use 3D effects, gradients, or drop shadows on chart elements                |
| Label every axis, series, and threshold  | Exceed 5 categories without grouping into "Other" or splitting the chart    |
| Justify the chart type by the data shape | Reuse UI semantic colors (action, surface) for data encoding, or vice versa |

The `dataviz.color.categorical.{1–8}` / `dataviz.color.sequential.*` /
`dataviz.color.diverging.*` family does not exist. The variables are
`color.data.category.NN.{strong,subtle}`, `color.data.scale.*` and `color.data.delta.*`
(Figma `data/category/NN/{strong|subtle}`, `data/scale/*`, `data/delta/*`). The diverging
role is carried by `color.data.delta.*`, signed around `neutral`.
