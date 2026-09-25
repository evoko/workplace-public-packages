# Slider

> SOLAR Web · Figma page `↳ 🟢 Slider` (id `2163:3706`) · section `components/inputs` · raw data: [`raw/components/inputs/slider.json`](../../raw/components/inputs/slider.json)

## Component set: Slider

Single-thumb slider for selecting one value in a continuous range. 7 variants: state (default, hover, pressed, focus, filled, error, disabled). filled and error are drawn as default — error is announced and carried by the paired helper text, not by the slider itself. The handle does not change on hover or press. Use for approximate values (volume, zoom, opacity); for exact entry pair with Number Input. For ranges use Slider Range.

### Props

| Prop    | Type    | Options / default                                                 |
| ------- | ------- | ----------------------------------------------------------------- |
| `state` | variant | **default** · hover · pressed · disabled · focus · filled · error |

Default variant: `state=default` · 7 variants · default size 320×20px

### Anatomy (default variant)

- **state=default** · component · FIXED/FIXED · 320×20
  - **Track** · rectangle · 320×4  
    fill `color.surface.muted` · radius `radius.pill`
  - **Fill** · rectangle · 160×4  
    fill `color.action.primary.bg.default` · radius `radius.pill`
  - **Handle** · ellipse · 16×16  
    fill `color.surface.base` · stroke `color.action.primary.border.default` 2px · effect `shadow/control` · strokeWeight `border.strong`, `border.default`

### Tokens used

| Role         | Tokens                                                                         |
| ------------ | ------------------------------------------------------------------------------ |
| Fills        | `color.action.primary.bg.default`, `color.surface.base`, `color.surface.muted` |
| Strokes      | `color.action.primary.border.default`                                          |
| Radius       | `radius.pill`                                                                  |
| Border width | `border.default`, `border.strong`                                              |
| Effects      | `shadow/control`, `shadow/focus/default`                                       |

### Variant matrix

| state    | size   | fill | stroke | effect                 | text | icon |
| -------- | ------ | ---- | ------ | ---------------------- | ---- | ---- |
| default  | 320×20 |      |        |                        |      |      |
| hover    | 320×20 |      |        |                        |      |      |
| pressed  | 320×20 |      |        |                        |      |      |
| disabled | 320×20 |      |        |                        |      |      |
| focus    | 320×20 |      |        | `shadow/focus/default` |      |      |
| filled   | 320×20 |      |        |                        |      |      |
| error    | 320×20 |      |        |                        |      |      |

## Component set: Slider Range

Dual-thumb slider for selecting a range between two values. 5 variants: state (default, hover, pressed, focus, disabled). Handles take the hover and pressed look; focus rings the handle with shadow/focus/default. Use for min/max filtering where both endpoints matter. Always show the current range values alongside. For single-value selection use Slider.

### Props

| Prop    | Type    | Options / default                                |
| ------- | ------- | ------------------------------------------------ |
| `state` | variant | **default** · hover · pressed · disabled · focus |

Default variant: `state=default` · 5 variants · default size 320×20px

### Anatomy (default variant)

- **state=default** · component · FIXED/FIXED · 320×20
  - **Track** · rectangle · 320×4  
    fill `color.surface.muted` · radius `radius.pill`
  - **Fill** · rectangle · 160×4  
    fill `color.action.primary.bg.default` · radius `radius.pill`
  - **Handle** · ellipse · 16×16  
    fill `color.surface.base` · stroke `color.action.primary.border.default` 2px · effect `shadow/control` · strokeWeight `border.strong`, `border.default`
  - **Handle** · ellipse · 16×16  
    fill `color.surface.base` · stroke `color.action.primary.border.default` 2px · effect `shadow/control` · strokeWeight `border.strong`, `border.default`

### Tokens used

| Role         | Tokens                                                                         |
| ------------ | ------------------------------------------------------------------------------ |
| Fills        | `color.action.primary.bg.default`, `color.surface.base`, `color.surface.muted` |
| Strokes      | `color.action.primary.border.default`                                          |
| Radius       | `radius.pill`                                                                  |
| Border width | `border.default`, `border.strong`                                              |
| Effects      | `shadow/control`                                                               |

### Variant matrix

| state    | size   | fill | stroke | effect | text | icon |
| -------- | ------ | ---- | ------ | ------ | ---- | ---- |
| default  | 320×20 |      |        |        |      |      |
| hover    | 320×20 |      |        |        |      |      |
| pressed  | 320×20 |      |        |        |      |      |
| disabled | 320×20 |      |        |        |      |      |
| focus    | 320×20 |      |        |        |      |      |

## Documentation card

**Description**

Two primitives: Slider for single-value selection along a continuous range; Slider Range for picking two endpoints of a range. Use when the visual relationship to min/max matters more than precision — volume, opacity, zoom, filter ranges. For exact numeric entry, pair with a Number Input.

**When to use which**

Slider Single value in a range. One thumb.  
Slider Range Range between two values. Two thumbs. Use for min/max filters.

**States**

default resting thumb + track.  
hover thumb grows slightly; cursor changes.  
pressed momentary grab feedback on mouse-down / touch-start.  
disabled opacity/disabled + not-allowed cursor.

**Accessibility**

role="slider" with aria-valuemin / aria-valuemax / aria-valuenow / aria-valuetext (e.g., "12:30 PM" instead of "45000"). Keyboard: ←/→ step by step; Home/End to min/max; Page Up/Down by 10× step. Each thumb has its own focus ring. Slider Range: two sliders grouped; thumbs cannot cross.

**Rules**

Do  
• Show the current value(s) as a label alongside the track  
• Use aria-valuetext for human-readable values  
• Provide keyboard stepping (←/→, Home/End, Page Up/Down)  
• Snap to step — no sub-step values

Don't  
• Don't use for exact numeric entry — pair with Number Input  
• Don't let range thumbs cross in Slider Range  
• Don't hide the current value — slider without a label is guessing  
• Don't use for very long ranges (0–1,000,000) without step
