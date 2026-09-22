# Chart Axis

> SOLAR Web · Figma page `↳ 🟢 Chart Axis` (id `5113:7`) · section `components/data-visualization` · raw data: [`raw/components/data-visualization/chart-axis.json`](../../raw/components/data-visualization/chart-axis.json)

## Component set: Chart Axis

Axis line + tick marks + value labels for use along a chart's plot area.

Variants:
orientation = horizontal (X-axis, sits below plot) | vertical (Y-axis, sits to left of plot)
breakpoint = desktop (5 ticks, longer length) | mobile (4 ticks, shorter length)

Labels are illustrative (0-100). Override per instance with category names (Jan, Feb…) for horizontal or scale values for vertical.

To change tick count, add or remove Tick children inside the Ticks frame.

### Props

| Prop          | Type    | Options / default         |
| ------------- | ------- | ------------------------- |
| `orientation` | variant | **horizontal** · vertical |
| `breakpoint`  | variant | **desktop** · mobile      |

Default variant: `orientation=horizontal, breakpoint=desktop` · 4 variants · default size 600×22px

### Anatomy (default variant)

- **orientation=horizontal, breakpoint=desktop** · component · column gap 4 pad 0/0/0/0 FIXED/HUG · 600×22  
  itemSpacing `inset.2xs`
  - **Axis Line** · frame · FILL/FIXED · 600×1  
    fill `color.border.medium`
  - **Ticks** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 600×17
    - **Tick** · frame · column gap 4 pad 0/0/0/0 HUG/HUG · 8×17  
      itemSpacing `inset.2xs`
      - **Tick Mark** · frame · FIXED/FIXED · 1×4  
        fill `color.border.medium`
      - **0** · text `helper/sm` "0" · HUG/HUG · 8×9  
        fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
    - **Tick** · frame · column gap 4 pad 0/0/0/0 HUG/HUG · 15×17  
      itemSpacing `inset.2xs`
      - **Tick Mark** · frame · FIXED/FIXED · 1×4  
        fill `color.border.medium`
      - **25** · text `helper/sm` "25" · HUG/HUG · 15×9  
        fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
    - **Tick** · frame · column gap 4 pad 0/0/0/0 HUG/HUG · 15×17  
      itemSpacing `inset.2xs`
      - **Tick Mark** · frame · FIXED/FIXED · 1×4  
        fill `color.border.medium`
      - **50** · text `helper/sm` "50" · HUG/HUG · 15×9  
        fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
    - **Tick** · frame · column gap 4 pad 0/0/0/0 HUG/HUG · 14×17  
      itemSpacing `inset.2xs`
      - **Tick Mark** · frame · FIXED/FIXED · 1×4  
        fill `color.border.medium`
      - **75** · text `helper/sm` "75" · HUG/HUG · 14×9  
        fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
    - **Tick** · frame · column gap 4 pad 0/0/0/0 HUG/HUG · 21×17  
      itemSpacing `inset.2xs`
      - **Tick Mark** · frame · FIXED/FIXED · 1×4  
        fill `color.border.medium`
      - **100** · text `helper/sm` "100" · HUG/HUG · 21×9  
        fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Fills           | `color.border.medium`                                                                                 |
| Text color      | `color.text.secondary`                                                                                |
| Spacing         | `inset.2xs`                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.helper.sm`, `type.size.helper.sm` |
| Text styles     | `helper/sm`                                                                                           |

### Variant matrix

| orientation | breakpoint | size    | fill | stroke | effect | text                   | icon |
| ----------- | ---------- | ------- | ---- | ------ | ------ | ---------------------- | ---- |
| horizontal  | desktop    | 600×22  |      |        |        | `color.text.secondary` |      |
| horizontal  | mobile     | 343×22  |      |        |        | `color.text.secondary` |      |
| vertical    | desktop    | 100×280 |      |        |        | `color.text.secondary` |      |
| vertical    | mobile     | 100×220 |      |        |        | `color.text.secondary` |      |

## Component set: Chart Gridlines

Faint reference lines that span a chart's plot area. Overlay on chart bars/lines to aid value reading.

Variants:
orientation = horizontal (horizontal lines, typical Y-axis gridlines) | vertical (vertical lines, typical X-axis gridlines)
breakpoint = desktop (5 lines) | mobile (4 lines)

Lines bind to border/subtle for low visual weight. Position behind chart bars/lines.

### Props

| Prop          | Type    | Options / default         |
| ------------- | ------- | ------------------------- |
| `orientation` | variant | **horizontal** · vertical |
| `breakpoint`  | variant | **desktop** · mobile      |

Default variant: `orientation=horizontal, breakpoint=desktop` · 4 variants · default size 600×280px

### Anatomy (default variant)

- **orientation=horizontal, breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 600×280
  - **Gridline** · frame · FILL/FIXED · 600×1  
    fill `color.border.subtle`
  - **Gridline** · frame · FILL/FIXED · 600×1  
    fill `color.border.subtle`
  - **Gridline** · frame · FILL/FIXED · 600×1  
    fill `color.border.subtle`
  - **Gridline** · frame · FILL/FIXED · 600×1  
    fill `color.border.subtle`
  - **Gridline** · frame · FILL/FIXED · 600×1  
    fill `color.border.subtle`

### Tokens used

| Role  | Tokens                |
| ----- | --------------------- |
| Fills | `color.border.subtle` |

### Variant matrix

| orientation | breakpoint | size    | fill | stroke | effect | text | icon |
| ----------- | ---------- | ------- | ---- | ------ | ------ | ---- | ---- |
| horizontal  | desktop    | 600×280 |      |        |        |      |      |
| horizontal  | mobile     | 343×220 |      |        |        |      |      |
| vertical    | desktop    | 600×280 |      |        |        |      |      |
| vertical    | mobile     | 343×220 |      |        |        |      |      |

## Documentation card

**Description**

The reference frame for a chart — ticks, gridlines and value/category labels along one edge. Pairs with Bar, Line and Donut charts; not a standalone graphic.

**Anatomy**

Axis line · tick marks · tick labels · optional gridlines · optional axis title.

**Orientation & Scale**

Horizontal (category/time) or vertical (value). Linear, log or categorical scale. Gridlines are optional and always sit behind the data.

**States**

Non-interactive (Class K): no hover / pressed / focus. Emphasis via label weight and gridline opacity only.

**Accessibility**

Axis labels carry the data meaning — never rely on position alone. Label text ≥4.5:1; gridlines ≥3:1. Expose scale and units to assistive tech.

**Rules**

Start value axes at zero  
Label units once, on the axis  
Keep gridlines subtle, behind data  
Reduce tick density on small charts

Truncate the value axis  
Rotate labels past 45°  
Make gridlines heavier than data  
Repeat units on every tick
