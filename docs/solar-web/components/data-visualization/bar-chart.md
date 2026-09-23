# Bar Chart

> SOLAR Web · Figma page `↳ 🟢 Bar Chart` (id `5113:4`) · section `components/data-visualization` · raw data: [`raw/components/data-visualization/bar-chart.json`](../../raw/components/data-visualization/bar-chart.json)

## Component set: Bar

Building block for charts (Bar Chart, future Column Chart). One rectangle bound to a SOLAR data viz token. Use the `color` variant to pick from category / scale / delta / feedback palettes.

### Props

| Prop    | Type    | Options / default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color` | variant | **category-01-strong** · category-01-subtle · category-02-strong · category-02-subtle · category-03-strong · category-03-subtle · category-04-strong · category-04-subtle · category-05-strong · category-05-subtle · category-06-strong · category-06-subtle · category-07-strong · category-07-subtle · category-08-strong · category-08-subtle · scale-100 · scale-200 · scale-300 · scale-400 · scale-500 · scale-600 · scale-700 · scale-800 · scale-900 · delta-positive-100 · delta-positive-300 · delta-positive-500 · delta-negative-100 · delta-negative-300 · delta-negative-500 · delta-neutral · feedback-success-subtle · feedback-success-medium · feedback-success-strong · feedback-warning-subtle · feedback-warning-medium · feedback-warning-strong · feedback-danger-subtle · feedback-danger-medium · feedback-danger-strong · feedback-info-subtle · feedback-info-medium · feedback-info-strong · feedback-neutral-subtle · feedback-neutral-medium · feedback-neutral-strong |

Default variant: `color=category-01-strong` · 47 variants · default size 32×80px

### Anatomy (default variant)

- **color=category-01-strong** · component · 32×80  
  fill `color.data.category.01.strong` · radius `radius.none`

### Tokens used

| Role   | Tokens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills  | `color.data.category.01.strong`, `color.data.category.01.subtle`, `color.data.category.02.strong`, `color.data.category.02.subtle`, `color.data.category.03.strong`, `color.data.category.03.subtle`, `color.data.category.04.strong`, `color.data.category.04.subtle`, `color.data.category.05.strong`, `color.data.category.05.subtle`, `color.data.category.06.strong`, `color.data.category.06.subtle`, `color.data.category.07.strong`, `color.data.category.07.subtle`, `color.data.category.08.strong`, `color.data.category.08.subtle`, `color.data.delta.negative-100`, `color.data.delta.negative-300`, `color.data.delta.negative-500`, `color.data.delta.neutral`, `color.data.delta.positive-100`, `color.data.delta.positive-300`, `color.data.delta.positive-500`, `color.data.scale.100`, `color.data.scale.200`, `color.data.scale.300`, `color.data.scale.400`, `color.data.scale.500`, `color.data.scale.600`, `color.data.scale.700`, `color.data.scale.800`, `color.data.scale.900`, `color.surface.feedback.danger.medium`, `color.surface.feedback.danger.strong`, `color.surface.feedback.danger.subtle`, `color.surface.feedback.info.medium`, `color.surface.feedback.info.strong`, `color.surface.feedback.info.subtle`, `color.surface.feedback.neutral.medium`, `color.surface.feedback.neutral.strong`, `color.surface.feedback.neutral.subtle`, `color.surface.feedback.success.medium`, `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle`, `color.surface.feedback.warning.medium`, `color.surface.feedback.warning.strong`, `color.surface.feedback.warning.subtle` |
| Radius | `radius.none`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### Variant matrix

| color                   | size  | fill                                    | stroke | effect | text | icon |
| ----------------------- | ----- | --------------------------------------- | ------ | ------ | ---- | ---- |
| category-01-strong      | 32×80 | `color.data.category.01.strong`         |        |        |      |      |
| category-01-subtle      | 32×80 | `color.data.category.01.subtle`         |        |        |      |      |
| category-02-strong      | 32×80 | `color.data.category.02.strong`         |        |        |      |      |
| category-02-subtle      | 32×80 | `color.data.category.02.subtle`         |        |        |      |      |
| category-03-strong      | 32×80 | `color.data.category.03.strong`         |        |        |      |      |
| category-03-subtle      | 32×80 | `color.data.category.03.subtle`         |        |        |      |      |
| category-04-strong      | 32×80 | `color.data.category.04.strong`         |        |        |      |      |
| category-04-subtle      | 32×80 | `color.data.category.04.subtle`         |        |        |      |      |
| category-05-strong      | 32×80 | `color.data.category.05.strong`         |        |        |      |      |
| category-05-subtle      | 32×80 | `color.data.category.05.subtle`         |        |        |      |      |
| category-06-strong      | 32×80 | `color.data.category.06.strong`         |        |        |      |      |
| category-06-subtle      | 32×80 | `color.data.category.06.subtle`         |        |        |      |      |
| category-07-strong      | 32×80 | `color.data.category.07.strong`         |        |        |      |      |
| category-07-subtle      | 32×80 | `color.data.category.07.subtle`         |        |        |      |      |
| category-08-strong      | 32×80 | `color.data.category.08.strong`         |        |        |      |      |
| category-08-subtle      | 32×80 | `color.data.category.08.subtle`         |        |        |      |      |
| scale-100               | 32×80 | `color.data.scale.100`                  |        |        |      |      |
| scale-200               | 32×80 | `color.data.scale.200`                  |        |        |      |      |
| scale-300               | 32×80 | `color.data.scale.300`                  |        |        |      |      |
| scale-400               | 32×80 | `color.data.scale.400`                  |        |        |      |      |
| scale-500               | 32×80 | `color.data.scale.500`                  |        |        |      |      |
| scale-600               | 32×80 | `color.data.scale.600`                  |        |        |      |      |
| scale-700               | 32×80 | `color.data.scale.700`                  |        |        |      |      |
| scale-800               | 32×80 | `color.data.scale.800`                  |        |        |      |      |
| scale-900               | 32×80 | `color.data.scale.900`                  |        |        |      |      |
| delta-positive-100      | 32×80 | `color.data.delta.positive-100`         |        |        |      |      |
| delta-positive-300      | 32×80 | `color.data.delta.positive-300`         |        |        |      |      |
| delta-positive-500      | 32×80 | `color.data.delta.positive-500`         |        |        |      |      |
| delta-negative-100      | 32×80 | `color.data.delta.negative-100`         |        |        |      |      |
| delta-negative-300      | 32×80 | `color.data.delta.negative-300`         |        |        |      |      |
| delta-negative-500      | 32×80 | `color.data.delta.negative-500`         |        |        |      |      |
| delta-neutral           | 32×80 | `color.data.delta.neutral`              |        |        |      |      |
| feedback-success-subtle | 32×80 | `color.surface.feedback.success.subtle` |        |        |      |      |
| feedback-success-medium | 32×80 | `color.surface.feedback.success.medium` |        |        |      |      |
| feedback-success-strong | 32×80 | `color.surface.feedback.success.strong` |        |        |      |      |
| feedback-warning-subtle | 32×80 | `color.surface.feedback.warning.subtle` |        |        |      |      |
| feedback-warning-medium | 32×80 | `color.surface.feedback.warning.medium` |        |        |      |      |
| feedback-warning-strong | 32×80 | `color.surface.feedback.warning.strong` |        |        |      |      |
| feedback-danger-subtle  | 32×80 | `color.surface.feedback.danger.subtle`  |        |        |      |      |
| feedback-danger-medium  | 32×80 | `color.surface.feedback.danger.medium`  |        |        |      |      |
| feedback-danger-strong  | 32×80 | `color.surface.feedback.danger.strong`  |        |        |      |      |
| feedback-info-subtle    | 32×80 | `color.surface.feedback.info.subtle`    |        |        |      |      |
| feedback-info-medium    | 32×80 | `color.surface.feedback.info.medium`    |        |        |      |      |
| feedback-info-strong    | 32×80 | `color.surface.feedback.info.strong`    |        |        |      |      |
| feedback-neutral-subtle | 32×80 | `color.surface.feedback.neutral.subtle` |        |        |      |      |
| feedback-neutral-medium | 32×80 | `color.surface.feedback.neutral.medium` |        |        |      |      |
| feedback-neutral-strong | 32×80 | `color.surface.feedback.neutral.strong` |        |        |      |      |

## Component set: Bar Chart

Compositional bar chart. Bars are instances of the Bar primitive bound to SOLAR data viz tokens.

Variants:
• type: simple (one series) | grouped (two series, side-by-side)
• orientation: vertical | horizontal
• breakpoint: desktop (600w) | mobile (343w)

For axis lines/gridlines, see Chart Axis (pending). For interactive tooltips, see Chart Tooltip (pending).

State coverage for 1.0: loading / empty / error variants pending (Class I).

### Props

| Prop          | Type    | Options / default              |
| ------------- | ------- | ------------------------------ |
| `type`        | variant | **simple** · grouped · stacked |
| `orientation` | variant | **vertical** · horizontal      |
| `breakpoint`  | variant | **desktop** · mobile           |

Default variant: `type=simple, orientation=vertical, breakpoint=desktop` · 12 variants · default size 600×320px

### Anatomy (default variant)

- **type=simple, orientation=vertical, breakpoint=desktop** · component · column gap 12 pad 0/0/0/0 FIXED/FIXED · 600×320  
  itemSpacing `inset.sm`
  - **Plot** · frame · column gap 8 pad 0/0/0/0 FILL/FILL · 600×320  
    itemSpacing `inset.xs`
    - **Bars** · frame · row gap 16 pad 0/0/0/0 FILL/FILL · 600×303  
      itemSpacing `inset.md`
      - **Col-0** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 87×303
        - **color=category-06-strong** · instance of **Bar** (color=category-06-strong) · FIXED/FIXED · 40×146  
          fill `color.data.category.06.strong` · radius `radius.none`
      - **Col-1** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 87×303
        - **color=category-06-strong** · instance of **Bar** (color=category-06-strong) · FIXED/FIXED · 40×190  
          fill `color.data.category.06.strong` · radius `radius.none`
      - **Col-2** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 87×303
        - **color=category-06-strong** · instance of **Bar** (color=category-06-strong) · FIXED/FIXED · 40×110  
          fill `color.data.category.06.strong` · radius `radius.none`
      - **Col-3** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 87×303
        - **color=category-06-strong** · instance of **Bar** (color=category-06-strong) · FIXED/FIXED · 40×220  
          fill `color.data.category.06.strong` · radius `radius.none`
      - **Col-4** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 87×303
        - **color=category-06-strong** · instance of **Bar** (color=category-06-strong) · FIXED/FIXED · 40×163  
          fill `color.data.category.06.strong` · radius `radius.none`
      - **Col-5** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 87×303
        - **color=category-06-strong** · instance of **Bar** (color=category-06-strong) · FIXED/FIXED · 40×134  
          fill `color.data.category.06.strong` · radius `radius.none`
    - **Labels** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 600×9  
      itemSpacing `inset.md`
      - **LabelCell** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 87×9
        - **Jan** · text `helper/sm` "Jan" · HUG/HUG · 20×9  
          fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
      - **LabelCell** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 87×9
        - **Feb** · text `helper/sm` "Feb" · HUG/HUG · 21×9  
          fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
      - **LabelCell** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 87×9
        - **Mar** · text `helper/sm` "Mar" · HUG/HUG · 22×9  
          fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
      - **LabelCell** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 87×9
        - **Apr** · text `helper/sm` "Apr" · HUG/HUG · 20×9  
          fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
      - **LabelCell** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 87×9
        - **May** · text `helper/sm` "May" · HUG/HUG · 24×9  
          fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
      - **LabelCell** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 87×9
        - **Jun** · text `helper/sm` "Jun" · HUG/HUG · 21×9  
          fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Fills           | `color.data.category.06.strong`                                                                       |
| Text color      | `color.text.primary`, `color.text.secondary`                                                          |
| Spacing         | `inset.md`, `inset.sm`, `inset.xs`                                                                    |
| Radius          | `radius.none`                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.helper.sm`, `type.size.helper.sm` |
| Text styles     | `helper/sm`                                                                                           |

### Composes

- Bar

### Variant matrix

| type    | orientation | breakpoint | size    | fill | stroke | effect | text                                           | icon |
| ------- | ----------- | ---------- | ------- | ---- | ------ | ------ | ---------------------------------------------- | ---- |
| simple  | vertical    | desktop    | 600×320 |      |        |        | `color.text.secondary`                         |      |
| simple  | vertical    | mobile     | 343×240 |      |        |        | `color.text.secondary`                         |      |
| simple  | horizontal  | desktop    | 600×320 |      |        |        | `color.text.secondary`                         |      |
| simple  | horizontal  | mobile     | 343×240 |      |        |        | `color.text.secondary`                         |      |
| grouped | vertical    | desktop    | 600×320 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| grouped | vertical    | mobile     | 343×240 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| grouped | horizontal  | desktop    | 600×320 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| grouped | horizontal  | mobile     | 343×240 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| stacked | vertical    | desktop    | 600×320 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| stacked | vertical    | mobile     | 343×240 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| stacked | horizontal  | desktop    | 600×320 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| stacked | horizontal  | mobile     | 343×240 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |

## Component set: Bar Stack

Composite bar of N stacked Bar primitive instances inside a clipping frame with radius/control rounded corners. Use when a single column/row represents a categorical breakdown (e.g., status mix: danger / warning / neutral).

Variants:
segments = 2 | 3 | 4
orientation = vertical | horizontal

Usage: instance the desired segments+orientation variant, then per-instance swap each segment's Bar variant to recolor (e.g., to data/category for qualitative breakdown, data/scale for sequential, data/delta for change). Override each segment's size on the primary axis per your data proportions.

Defaults use feedback palette (danger/warning/neutral) matching the legacy Bar Chart pattern.

### Props

| Prop          | Type    | Options / default         |
| ------------- | ------- | ------------------------- |
| `segments`    | variant | **2** · 3 · 4             |
| `orientation` | variant | **vertical** · horizontal |

Default variant: `segments=2, orientation=vertical` · 6 variants · default size 32×80px

### Anatomy (default variant)

- **segments=2, orientation=vertical** · component · column gap 4 pad 0/0/0/0 FIXED/FIXED · 32×80  
  itemSpacing `inset.2xs` · radius `radius.control`
  - **color=feedback-warning-medium** · instance of **Bar** (color=feedback-warning-medium) · FILL/FIXED · 32×32  
    fill `color.surface.feedback.warning.medium` · radius `radius.none`
  - **color=feedback-neutral-subtle** · instance of **Bar** (color=feedback-neutral-subtle) · FILL/FIXED · 32×48  
    fill `color.surface.feedback.neutral.subtle` · radius `radius.none`

### Tokens used

| Role    | Tokens                                                                           |
| ------- | -------------------------------------------------------------------------------- |
| Fills   | `color.surface.feedback.neutral.subtle`, `color.surface.feedback.warning.medium` |
| Spacing | `inset.2xs`                                                                      |
| Radius  | `radius.control`, `radius.none`                                                  |

### Composes

- Bar

### Variant matrix

| segments | orientation | size  | fill | stroke | effect | text | icon |
| -------- | ----------- | ----- | ---- | ------ | ------ | ---- | ---- |
| 2        | vertical    | 32×80 |      |        |        |      |      |
| 2        | horizontal  | 80×32 |      |        |        |      |      |
| 3        | vertical    | 32×80 |      |        |        |      |      |
| 3        | horizontal  | 80×32 |      |        |        |      |      |
| 4        | vertical    | 32×80 |      |        |        |      |      |
| 4        | horizontal  | 80×32 |      |        |        |      |      |

## Documentation card

**Description**

A single data bar for bar & column charts, filled with a data-colour token. Composes into chart patterns — not a progress indicator (use Progress Bar).

**Anatomy**

Token-coloured bar fill · optional value label · shared baseline aligned to the chart axis.

**Data & Colour**

47 data colours: categorical 01–08 (subtle/strong), sequential scale 100–900, delta positive/negative/neutral, feedback tints. Choose by data meaning, not decoration.

**States**

Non-interactive (Class K): no hover / pressed / focus. Emphasis via colour strength — subtle / medium / strong.

**Accessibility**

Colour is never the sole encoding — pair with axis/value labels or a legend. Data-colour tokens meet ≥3:1 vs surface. Expose series + value via aria-label.

**Rules**

Align bars to a shared baseline  
Order by value or logical sequence  
Pair colour with labels or a legend  
Use the scale palette for ordered data

Rely on colour alone  
Use for progress (use Progress Bar)  
Mix categorical + sequential in one series  
Start the value axis anywhere but zero
