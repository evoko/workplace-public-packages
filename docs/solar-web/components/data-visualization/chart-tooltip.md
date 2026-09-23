# Chart Tooltip

> SOLAR Web · Figma page `↳ 🟢 Chart Tooltip` (id `5113:8`) · section `components/data-visualization` · raw data: [`raw/components/data-visualization/chart-tooltip.json`](../../raw/components/data-visualization/chart-tooltip.json)

## Component set: Chart Tooltip

Value-on-hover overlay for chart data points. Shows category title + one or more value rows.

Variants:
series = single (one value, compact) | multi (3 labeled rows, distributed)

Container: surface/raised bg, border/subtle stroke, radius/control, shadow/overlay effect, padding 8×12.

For multi, override each row's swatch color (instance swap), label, and value per chart's data series.

Accessibility: when implemented in code, the tooltip must satisfy WCAG 1.4.13 — dismissible (Esc), hoverable (without disappearing), persistent (stays until intent is clear).

### Props

| Prop     | Type    | Options / default  |
| -------- | ------- | ------------------ |
| `series` | variant | **single** · multi |

Default variant: `series=single` · 2 variants · default size 77×50px

### Anatomy (default variant)

- **series=single** · component · column gap 8 pad 12/12/12/12 HUG/HUG · 77×50  
  fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.xs` · padding `inset.sm` · radius `radius.control`
  - **Date** · text `body/sm/semibold` "Jan 2026" · HUG/HUG · 53×9  
    fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.600`
  - **Frame** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 45×9  
    itemSpacing `inset.2xs`
    - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=xs) · FIXED/FIXED · 8×8  
      fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill`
    - **Value** · text `body/sm/medium` "60.4k" · HUG/HUG · 33×9  
      fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.feedback.success.strong`, `color.surface.raised`                                                           |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                              |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                              |
| Spacing         | `inset.2xs`, `inset.sm`, `stack.xs`                                                                                       |
| Radius          | `radius.control`, `radius.pill`                                                                                           |
| Border width    | `border.default`                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.font-weight.600`, `type.line-height.body.sm`, `type.size.body.sm` |
| Effects         | `shadow/overlay`                                                                                                          |
| Text styles     | `body/sm/medium`, `body/sm/semibold`                                                                                      |

### Composes

- StatusIndicator

### Variant matrix

| series | size   | fill                   | stroke                | effect           | text                                           | icon |
| ------ | ------ | ---------------------- | --------------------- | ---------------- | ---------------------------------------------- | ---- |
| single | 77×50  | `color.surface.raised` | `color.border.subtle` | `shadow/overlay` | `color.text.primary`                           |      |
| multi  | 156×84 | `color.surface.raised` | `color.border.subtle` | `shadow/overlay` | `color.text.primary`<br>`color.text.secondary` |      |

## Documentation card

**Description**

A floating readout of exact values for the hovered or focused data point. Appears on interaction with a chart; it is not a persistent label.

**Anatomy**

Overlay container (surface + shadow/overlay) · series swatch · point label · value(s) · optional delta.

**Placement**

Tracks the focused point and flips to stay in the viewport. Offset from the datum so it never hides the point it describes.

**States**

default (visible) and hidden. Fades with motion.duration.fast. Non-blocking — pointer-events: none over the plot.

**Accessibility**

Mirror hover with keyboard focus on data points and announce the value via aria-live. Text ≥4.5:1 on surface.overlay; swatch ≥3:1.

**Rules**

Show exact values  
Include series name + swatch  
Keep it to the focused point  
Dismiss on blur

Cover the data point  
Rely on hover only (support keyboard)  
Cram multiple series unreadably  
Persist after focus leaves
