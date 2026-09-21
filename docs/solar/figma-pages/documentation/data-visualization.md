# Data Visualization

> Verbatim text of the Figma page `Data Visualization` (id `763:55486`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `43e7bb7b6566`. Curated chapter: [10-data-visualization.md](../../10-data-visualization.md).

## Slide 1

### Visual Language Data Visualization

## Data Visualization

#### Data visualization in SOLAR translates complex information into clear, scannable visual formats. Charts, graphs, and indicators follow consistent rules to ensure readability and accuracy across all Biamp products.

Biamp products surface system status, network health, audio levels, and device metrics. These data points must be presented in ways that support quick decision-making without overwhelming users. SOLAR's data visualization guidelines prioritize legibility, semantic color usage, and accessible encoding over visual richness.

##### Accuracy Over Aesthetics

##### Semantic Color Only

##### Readable At A Glance

##### Accessible Encoding

Visualizations must represent data truthfully. Never truncate axes, distort proportions, or use effects that misrepresent scale.

Chart colors are drawn from SOLAR's token system. Data categories use the designated palette, and status indicators use feedback tokens (success, warning, danger).

Every visualization should answer one clear question. If a chart requires extensive explanation to interpret, it needs to be simplified or split.

Color must never be the only way to distinguish data. Use pattern fills, labels, shapes, or position as secondary encoding for users with color vision deficiency.

## Chart Types

#### SOLAR supports a defined set of chart types. Each type is suited to a specific data relationship. Choosing the wrong chart type obscures the data it's meant to clarify.

Select chart types based on the relationship you need to communicate: comparison, composition, distribution, or trend. If the data doesn't clearly fit one of these categories, consider whether a visualization is the right format at all — a well-structured table may be more effective.

##### Chart Types

Bar chart — Comparing discrete categories. Use horizontal bars when category labels are long. Always start the value axis at zero.\
Line chart — Showing trends over time. Use when the x-axis represents a continuous time scale. Limit to 4–5 lines before the chart becomes unreadable.\
Area chart — Showing volume or cumulative values over time. Use sparingly — stacked areas can be hard to read. Prefer line charts for precision.\
Donut chart — Showing part-to-whole relationships with a small number of segments (2–5). Never use for comparisons between categories. Avoid pie charts — donuts are preferred for their readability.\
Sparkline — Showing inline trends within tables or cards. No axis labels, no grid — just the shape of the trend. Used for context, not precision.\
Status indicator — Showing current state (good, warning, critical) through a single color-coded element. Always paired with a text label.

## Data Visualization Color

#### Chart colors follow a dedicated data palette derived from SOLAR's color primitives. The palette is designed for sufficient contrast between adjacent categories and against both light and dark backgrounds.

The data palette is separate from the action and feedback token groups. It provides a sequential set of distinct hues for categorical data. For status-related data, use feedback tokens (success, warning, danger) directly. Never mix the data palette with feedback tokens in the same chart — use one system per visualization.

##### Color Rules

Categorical data — Use the data palette in order. Do not skip colors or rearrange the sequence, as the order is optimized for maximum contrast between adjacent values.\
Status data — Use feedback tokens: green for healthy/success, orange for warning, red for danger/critical. Always reinforce with text or icon labels.\
Sequential data — Use a single hue with varying lightness for data that progresses from low to high (e.g. intensity, volume, load).\
Single metric — Reserve the full palette for multi-series charts.\
Background and grid — Chart backgrounds use surface/base. Grid lines use a low-contrast neutral to avoid competing with data.

_[image: image 1]_

## Axes, Labels & Grid

#### Clear labeling is what makes a chart readable. Every axis, data point, and legend must follow SOLAR's typographic and spatial rules.

Axes provide the reference frame for all data in a chart. Without clear, consistently formatted labels, even simple data becomes ambiguous. SOLAR defines strict rules for axis formatting, label placement, and grid usage to ensure charts are self-explanatory without relying on external descriptions.

##### Rules

Always label both axes. Include unit labels (ms, dB, %, count) directly on the axis. Never rely on the chart title alone to communicate units.\
Start value axes at zero unless there is a strong, documented reason not to. Truncated axes distort perception of differences between values.\
Use SOLAR's type scale. Axis labels use the smallest body text size. Data labels use the same size or one step larger. Chart titles use the H4 heading style.\
Grid lines are minimal. Use horizontal grid lines only, in a low-contrast neutral color. Vertical grid lines are rarely needed and add visual noise. Never use both.\
Legends are positioned consistently. Place legends below the chart for horizontal layouts, to the right for vertical layouts. Never place legends inside the chart area where they overlap data.

## Responsive & Threshold Behavior

#### Charts must adapt to different container sizes without losing readability. SOLAR defines how visualizations respond to space constraints and how threshold indicators communicate status.

Not every chart renders well at every size. Rather than scaling charts uniformly, SOLAR defines breakpoints at which charts simplify — reducing label density, hiding grid lines, or switching to a more compact format. Threshold lines and status zones provide contextual meaning to raw data by indicating when values are within, approaching, or beyond acceptable ranges.

##### Rules

Simplify, don't shrink. When a chart container narrows, reduce the number of visible data labels and grid lines rather than scaling everything down. Legibility always wins.\
Switch formats at breakpoints. A bar chart at full width may become a horizontal bar or a compact list below a defined container width. Define these transitions per chart type.\
Threshold lines are always labeled. A horizontal line indicating a warning or critical threshold must include a text label and use the corresponding feedback color token.\
Status zones use feedback surface tokens. Shaded regions behind data (e.g. "safe range" in green, "danger zone" in red) use surface.feedback.{type} with reduced opacity so data remains readable on top.

## Data Visualization Do's and Don'ts

#### Trustworthy data presentation is essential for Biamp's professional audience. These guidelines prevent common mistakes that undermine clarity and confidence in SOLAR products.

Biamp users make operational decisions based on the data they see. A misleading chart or an unclear indicator can have real consequences. Every visualization must prioritize honesty, clarity, and efficient reading over visual appeal.

##### Do: Use Semantic Color For Status

Status-related data always uses feedback tokens (success, warning, danger). Users already associate these colors with system states across the rest of the UI.

##### Do: Label Everything

Every axis, data series, and threshold line must be labeled. If a user has to guess what a line represents, the chart has failed.

##### Don't: Use 3D Effects Or Gradients

3D effects, gradients, and drop shadows on chart elements distort data perception. All chart elements must be flat and precisely rendered.

##### Don't: Exceed 5 Categories Without Grouping

Beyond 5 categories, a chart becomes unreadable. Group smaller values into an "Other" category or split into multiple charts. Donut charts should never exceed 5 segments.

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Data Visualization
domain: Visual Language > Charts & Data Display
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR data visualization specialist. Charts, graphs, and data displays must be accessible, consistent, truthful, and use the dedicated data viz token palette — never UI semantic colors.

[SCOPE]
- Chart type selection guidelines
- Data visualization color palette (categorical, sequential, diverging)
- Axis, label, and annotation conventions
- Accessibility in data displays
- Responsive behavior for charts
- Interaction patterns (tooltips, drill-down)

[CHART_TYPES]
bar/column: comparing discrete categories — default choice for most comparisons
line: showing trends over continuous time series
area: line chart with filled region — emphasizing volume or cumulative totals
pie/donut: part-to-whole with ≤ 6 segments — use sparingly
scatter: correlation between two variables
table: precise values, sortable/filterable — use when exact numbers matter more than shape
sparkline: inline mini-chart for contextual trend indicators
rule: choose the simplest chart type that accurately communicates the data

[DATA_VIZ_PALETTE]
categorical: 6–8 distinct hues for nominal data — optimized for max distinguishability
sequential: single-hue ramp (light → dark) for ordered/quantitative data
diverging: two-hue ramp with neutral midpoint for data with a meaningful center
colorblind_safe: all palettes tested for deuteranopia, protanopia, tritanopia
tokens: dataviz.color.categorical.{1–8}, dataviz.color.sequential.{100–900}, dataviz.color.diverging.{neg|neutral|pos}
rule: NEVER reuse UI semantic colors (action, feedback, surface) for data encoding

[AXIS_AND_LABELS]
y_axis: start at zero for bar charts — truncated axes are misleading
x_axis: label every major tick or use smart label intervals for dense data
axis_labels: use type token caption or body/sm — never smaller than 12px
grid_lines: subtle (color.border.subtle) — horizontal only for most charts
units: always display units (%, $, ms) on axis or in tooltip
legend: positioned above or to the right — never overlapping data

[ANNOTATIONS]
reference_lines: use for targets, thresholds, averages — labeled with value
data_labels: inline on bars/points when space permits — avoid clutter
tooltips: show on hover/tap — include series name, value, and unit
empty_state: clear message + action when no data is available

[ACCESSIBILITY]
text_alternative: every chart must have a text summary or data table fallback
pattern_fills: use shape markers or pattern fills in addition to color for series differentiation
contrast: data elements must meet ≥ 3:1 contrast against background
keyboard: charts with interactive elements must be keyboard navigable
screen_reader: provide aria-label or aria-describedby summarizing the chart's key insight
rule: never rely on color alone to distinguish data series

[RESPONSIVE]
desktop: full chart with all labels, legend, and annotations
tablet: may simplify legend placement or reduce label density
mobile: consider switching horizontal bar → vertical stack, or simplify to summary + sparkline
scrollable: allow horizontal scroll for wide time series on small screens
rule: charts must remain readable and not truncate critical data at any breakpoint

[INTERACTION]
tooltip: appears on hover (desktop) or tap (mobile) — shows precise values
drill_down: optional click-to-expand for hierarchical data
filter: external controls (dropdowns, toggles) to refine visible data
zoom: optional for dense time series — pinch/scroll zoom with reset
animation: data entrance animations respect prefers-reduced-motion

[AGENT_BEHAVIOR]
- When recommending a chart type, justify why it's the best fit for the data shape
- Always specify data viz palette tokens — never UI colors
- If a chart lacks a text alternative, flag it as a critical accessibility violation
- Verify y-axis starts at zero for bar charts
- Check that all data series are distinguishable without color (shape/pattern markers)
- For responsive contexts, recommend simplified alternatives for mobile

[CONSTRAINTS]
- never use 3D charts or decorative embellishments (gradients, shadows on bars)
- never truncate y-axis on bar charts (misleading proportions)
- never use more than 6 segments in pie/donut charts
- never rely on color alone to differentiate data series
- never use UI semantic colors for data encoding
- charts must have a text summary fallback for screen readers
- animations must respect prefers-reduced-motion
@END:PAGE_CONTEXT
```
