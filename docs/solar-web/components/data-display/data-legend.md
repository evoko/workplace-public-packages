# Data Legend

> SOLAR Web · Figma page `↳ 🟢 Data Legend` (id `5113:6`) · section `components/data-display` · raw data: [`raw/components/data-display/data-legend.json`](../../raw/components/data-display/data-legend.json)

## Component set: Data Legend

Series identifier — swatch + label pairs naming each data series in a chart.

Variants:
direction = horizontal (row, gap 16) | vertical (column, gap 8)
items = 2 | 3 | 4 (number of series)

Each item: 10×10 swatch (radius/control, bound to data/category token) + label (label/sm bound to text/primary).

Defaults use category-06 / 02 / 04 / 07 (blue/orange/green/purple — colorblind-friendly mix). Override per instance via swatch fill swap.

### Props

| Prop        | Type    | Options / default         |
| ----------- | ------- | ------------------------- |
| `direction` | variant | **horizontal** · vertical |
| `items`     | variant | **2** · 3 · 4             |

Default variant: `direction=horizontal, items=2` · 6 variants · default size 330×9px

### Anatomy (default variant)

- **direction=horizontal, items=2** · component · row gap 16 pad 0/0/0/0 FILL/FILL · 330×9  
  itemSpacing `stack.md`
  - **Item** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 81×9  
    itemSpacing `stack.2xs`
    - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=xs) · FIXED/FIXED · 8×8  
      fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill`
    - **Active users** · text `label/sm` "Active users" · HUG/HUG · 69×9  
      fill `color.text.primary` · lineHeight `type.line-height.label.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.label.sm` · fontStyle `type.font-weight.500`
  - **Item** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 89×9  
    itemSpacing `stack.2xs`
    - **StatusIndicator** · instance of **StatusIndicator** (type=warning, size=xs) · FIXED/FIXED · 8×8  
      fill `color.surface.feedback.warning.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill`
    - **New sign-ups** · text `label/sm` "New sign-ups" · HUG/HUG · 77×9  
      fill `color.text.primary` · lineHeight `type.line-height.label.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.label.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.feedback.success.strong`, `color.surface.feedback.warning.strong`                    |
| Strokes         | `color.border.medium`                                                                               |
| Text color      | `color.text.primary`                                                                                |
| Spacing         | `stack.2xs`, `stack.md`                                                                             |
| Radius          | `radius.pill`                                                                                       |
| Border width    | `border.default`                                                                                    |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.sm`, `type.size.label.sm` |
| Text styles     | `label/sm`                                                                                          |

### Composes

- StatusIndicator

### Variant matrix

| direction  | items | size   | fill | stroke | effect | text                 | icon |
| ---------- | ----- | ------ | ---- | ------ | ------ | -------------------- | ---- |
| horizontal | 2     | 330×9  |      |        |        | `color.text.primary` |      |
| horizontal | 3     | 330×9  |      |        |        | `color.text.primary` |      |
| horizontal | 4     | 330×9  |      |        |        | `color.text.primary` |      |
| vertical   | 2     | 330×60 |      |        |        | `color.text.primary` |      |
| vertical   | 3     | 330×60 |      |        |        | `color.text.primary` |      |
| vertical   | 4     | 330×60 |      |        |        | `color.text.primary` |      |

## Documentation card

**Description**

Maps series / category colours to their labels for a chart. Pairs with Bar, Line and Donut charts; not a standalone key for non-chart colour.

**Anatomy**

Rows or inline items of colour swatch + label · optional value / percentage · optional interactive toggle.

**Layout & Variants**

orientation horizontal / vertical. Inline (below or beside the chart) or as a side panel. Swatch shape matches the series mark (dot, line, square).

**States**

default; the interactive variant adds hover / focus / selected + toggled-off (series hidden). Non-interactive by default (Class K).

**Accessibility**

The label is each series' accessible name — colour is never alone. If toggling series, expose items as buttons with aria-pressed. Swatch ≥3:1; text ≥4.5:1.

**Rules**

Match swatch shape to the series mark  
Keep labels short  
Place near the chart  
Pair colour with a label

Rely on colour alone  
Detach the legend from its chart  
Reorder items on toggle  
Use for non-chart colour keys
