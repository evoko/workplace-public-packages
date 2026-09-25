# Line Chart

> SOLAR Web · Figma page `↳ 🟢 Line Chart` (id `5113:3`) · section `components/data-visualization` · raw data: [`raw/components/data-visualization/line-chart.json`](../../raw/components/data-visualization/line-chart.json)

## Component set: Line Chart

Time series visualization with one or two series.

Variants:
series = single | multi (two lines with legend)
breakpoint = desktop (600×240, 6 points) | mobile (343×200, 4 points)

Lines are VECTOR polylines bound to data/category-06 (Series A) and category-02 (Series B). Override path data per instance to plot real values.

Optional area-fill and point markers deferred to v1.1.

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `series`     | variant | **single** · multi   |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `series=single, breakpoint=desktop` · 4 variants · default size 600×240px

### Anatomy (default variant)

- **series=single, breakpoint=desktop** · component · column gap 12 pad 0/0/0/0 FIXED/FIXED · 600×240  
  itemSpacing `inset.sm`
  - **Plot** · frame · FILL/FIXED · 600×204
    - **Line A** · vector · 600×204  
      stroke `color.data.category.06.strong` 2px
  - **Frame** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 600×9  
    itemSpacing `inset.md`
    - **Jan** · text `helper/sm` "Jan" · HUG/HUG · 20×9  
      fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
    - **Feb** · text `helper/sm` "Feb" · HUG/HUG · 21×9  
      fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
    - **Mar** · text `helper/sm` "Mar" · HUG/HUG · 22×9  
      fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
    - **Apr** · text `helper/sm` "Apr" · HUG/HUG · 20×9  
      fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
    - **May** · text `helper/sm` "May" · HUG/HUG · 24×9  
      fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`
    - **Jun** · text `helper/sm` "Jun" · HUG/HUG · 21×9  
      fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Strokes         | `color.data.category.06.strong`                                                                       |
| Text color      | `color.text.primary`, `color.text.secondary`                                                          |
| Spacing         | `inset.md`, `inset.sm`                                                                                |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.helper.sm`, `type.size.helper.sm` |
| Text styles     | `helper/sm`                                                                                           |

### Variant matrix

| series | breakpoint | size    | fill | stroke | effect | text                                           | icon |
| ------ | ---------- | ------- | ---- | ------ | ------ | ---------------------------------------------- | ---- |
| single | desktop    | 600×240 |      |        |        | `color.text.secondary`                         |      |
| single | mobile     | 343×200 |      |        |        | `color.text.secondary`                         |      |
| multi  | desktop    | 600×240 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| multi  | mobile     | 343×200 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |

## Documentation card

**Description**

Plots one or more continuous series over an ordered axis to show trend and change over time. For continuous data; use Bar Chart for discrete categories.

**Anatomy**

Plot area · one or more series lines · axis (see Chart Axis) · optional points, area fill, legend and tooltip.

**Data & Colour**

One data-colour token per series (categorical 01–08). Keep to ~5 series; beyond that use small multiples. Area fill uses the subtle tint of the series token.

**States**

default (loaded), loading, empty, error, no-data. Points and tooltip appear on hover or keyboard focus.

**Accessibility**

Distinguish series by colour plus label or marker, never colour alone. Provide a data-table alternative. Line ≥3:1 vs surface; labels ≥4.5:1.

**Rules**

Start the value axis at zero  
Label series directly where possible  
Limit to ~5 series  
Offer a table fallback

Rely on colour alone  
Overplot dozens of series  
Break the time axis  
Smooth away real variation
