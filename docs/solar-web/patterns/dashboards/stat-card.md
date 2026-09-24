# Stat Card

> SOLAR Web · Figma page `↳ 🟢 Stat Card` (id `6544:2`) · section `patterns/dashboards` · raw data: [`raw/patterns/dashboards/stat-card.json`](../../raw/patterns/dashboards/stat-card.json)

## Component set: Stat Card

Displays a key metric with label, large value, and optional trend indicator. 12 variants: trend (up, down, neutral) × state (default, hover, disabled) plus ghost=true per trend. ghost is the loading skeleton. Used on dashboards and KPI displays; for the compact tile use Stat Card Small.

### Props

| Prop    | Type    | Options / default              |
| ------- | ------- | ------------------------------ |
| `trend` | variant | **up** · down · neutral        |
| `state` | variant | disabled · hover · **default** |
| `ghost` | variant | **false** · true               |

Default variant: `trend=up, state=default, ghost=false` · 12 variants · default size 240×127px

### Anatomy (default variant)

- **trend=up, state=default, ghost=false** · component · column gap 16 pad 20/20/20/20 FIXED/HUG · 240×127  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.md` · padding `inset.lg` · strokeWeight `border.default` · radius `radius.container`
  - **Title** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 200×16  
    itemSpacing `stack.md`
    - **Title** · text `label/md` "Label" · FILL/HUG · 168×10  
      fill `color.text.secondary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
    - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
  - **Value** · text `title/md` "1,284,958.00" · FILL/HUG · 200×23  
    fill `color.text.primary` · lineHeight `type.line-height.title.md` · fontFamily `type.font-family.inter` · fontSize `type.size.title.md` · fontStyle `type.font-weight.500`
  - **Trend** · frame · row gap 4 pad 0/0/0/0 FILL/HUG · 200×16  
    itemSpacing `stack.2xs`
    - **Trend Badge** · instance of **Trend Badge** (type=incline, size=sm) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 16×16  
      fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · itemSpacing `stack.none` · strokeWeight `border.default` · radius `radius.pill`
    - **TrendValue** · text `body/sm/semibold` "5%" · HUG/HUG · 18×9  
      fill `color.text.feedback.success` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.600`
    - **Period** · text `body/sm/regular` "comparison to another value goes here" · FILL/HUG · 158×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.feedback.success.strong`                                                                                                                                                                                           |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                                                                                            |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                                                                  |
| Icon color      | `color.icon.disabled`, `color.icon.inverse`, `color.icon.primary`, `color.icon.secondary`                                                                                                                                                               |
| Spacing         | `inset.lg`, `stack.2xs`, `stack.md`, `stack.none`                                                                                                                                                                                                       |
| Radius          | `radius.container`, `radius.pill`                                                                                                                                                                                                                       |
| Border width    | `border.default`                                                                                                                                                                                                                                        |
| Sizes           | `icon.sm`                                                                                                                                                                                                                                               |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.font-weight.600`, `type.line-height.body.sm`, `type.line-height.label.md`, `type.line-height.title.md`, `type.size.body.sm`, `type.size.label.md`, `type.size.title.md` |
| Effects         | `shadow/raised`                                                                                                                                                                                                                                         |
| Text styles     | `body/sm/regular`, `body/sm/semibold`, `label/md`, `title/md`                                                                                                                                                                                           |

### Composes

- Icon/More
- Trend Badge

### Variant matrix

| trend   | state    | ghost | size    | fill                 | stroke                | effect          | text                                                                                                     | icon                                           |
| ------- | -------- | ----- | ------- | -------------------- | --------------------- | --------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| up      | default  | false | 240×127 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.text.tertiary` | `color.icon.secondary`<br>`color.icon.inverse` |
| down    | default  | false | 240×127 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.danger`<br>`color.text.tertiary`  | `color.icon.secondary`<br>`color.icon.inverse` |
| neutral | default  | false | 240×127 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.neutral`<br>`color.text.tertiary` | `color.icon.secondary`<br>`color.icon.inverse` |
| up      | disabled | false | 240×127 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.disabled`<br>`color.text.feedback.success`<br>`color.text.tertiary`                          | `color.icon.disabled`<br>`color.icon.inverse`  |
| up      | hover    | false | 240×127 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.feedback.success`<br>`color.text.tertiary`                           | `color.icon.primary`<br>`color.icon.inverse`   |
| down    | hover    | false | 240×127 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.feedback.danger`<br>`color.text.tertiary`                            | `color.icon.primary`<br>`color.icon.inverse`   |
| down    | disabled | false | 240×127 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.disabled`<br>`color.text.feedback.danger`<br>`color.text.tertiary`                           | `color.icon.disabled`<br>`color.icon.inverse`  |
| neutral | hover    | false | 240×127 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.feedback.neutral`<br>`color.text.tertiary`                           | `color.icon.primary`<br>`color.icon.inverse`   |
| neutral | disabled | false | 240×127 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.disabled`<br>`color.text.feedback.neutral`<br>`color.text.tertiary`                          | `color.icon.disabled`<br>`color.icon.inverse`  |
| up      | default  | true  | 240×120 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                                                                          |                                                |
| down    | default  | true  | 240×120 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                                                                          |                                                |
| neutral | default  | true  | 240×120 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                                                                          |                                                |

## Component set: Stat Card Small

Compact key metric with label, value, and optional trend indicator. 12 variants: trend (up, down, neutral) × state (default, hover, disabled) plus ghost=true per trend. ghost is the loading skeleton. Use in dense dashboard grids; for the full tile use Stat Card.

### Props

| Prop    | Type    | Options / default              |
| ------- | ------- | ------------------------------ |
| `trend` | variant | **up** · down · neutral        |
| `state` | variant | disabled · hover · **default** |
| `ghost` | variant | **false** · true               |

Default variant: `trend=up, state=default, ghost=false` · 12 variants · default size 318×64px

### Anatomy (default variant)

- **trend=up, state=default, ghost=false** · component · row gap 16 pad 12/12/12/12 FILL/HUG · 318×64  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.md` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Text** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 240×40  
    itemSpacing `stack.md`
    - **Title** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 240×9  
      itemSpacing `stack.md`
      - **Title** · text `label/sm` "Label" · HUG/HUG · 31×9  
        fill `color.text.secondary` · lineHeight `type.line-height.label.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.label.sm` · fontStyle `type.font-weight.500`
    - **Value** · text `title/sm` "1,284,958.00" · FILL/HUG · 240×15  
      fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
  - **Trend** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 38×16  
    itemSpacing `stack.2xs`
    - **Trend Badge** · instance of **Trend Badge** (type=incline, size=sm) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 16×16  
      fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · itemSpacing `stack.none` · strokeWeight `border.default` · radius `radius.pill`
    - **TrendValue** · text `body/sm/semibold` "5%" · HUG/HUG · 18×9  
      fill `color.text.feedback.success` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.600`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.feedback.success.strong`                                                                                                                                                                   |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                                                                    |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`                                                                 |
| Icon color      | `color.icon.inverse`                                                                                                                                                                                                            |
| Spacing         | `inset.sm`, `stack.2xs`, `stack.md`, `stack.none`                                                                                                                                                                               |
| Radius          | `radius.container`, `radius.pill`                                                                                                                                                                                               |
| Border width    | `border.default`                                                                                                                                                                                                                |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.font-weight.600`, `type.line-height.body.sm`, `type.line-height.label.sm`, `type.line-height.title.sm`, `type.size.body.sm`, `type.size.label.sm`, `type.size.title.sm` |
| Effects         | `shadow/raised`                                                                                                                                                                                                                 |
| Text styles     | `body/sm/semibold`, `label/sm`, `title/sm`                                                                                                                                                                                      |

### Composes

- Trend Badge

### Variant matrix

| trend   | state    | ghost | size   | fill                 | stroke                | effect          | text                                                                            | icon                 |
| ------- | -------- | ----- | ------ | -------------------- | --------------------- | --------------- | ------------------------------------------------------------------------------- | -------------------- |
| up      | default  | false | 318×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success` | `color.icon.inverse` |
| down    | default  | false | 318×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.danger`  | `color.icon.inverse` |
| neutral | default  | false | 318×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.neutral` | `color.icon.inverse` |
| up      | disabled | false | 318×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.disabled`<br>`color.text.feedback.success`                          | `color.icon.inverse` |
| up      | hover    | false | 318×64 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.feedback.success`                           | `color.icon.inverse` |
| down    | hover    | false | 318×64 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.feedback.danger`                            | `color.icon.inverse` |
| down    | disabled | false | 318×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.disabled`<br>`color.text.feedback.danger`                           | `color.icon.inverse` |
| neutral | hover    | false | 318×64 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.feedback.neutral`                           | `color.icon.inverse` |
| neutral | disabled | false | 318×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.disabled`<br>`color.text.feedback.neutral`                          | `color.icon.inverse` |
| up      | default  | true  | 318×72 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                                                 |                      |
| down    | default  | true  | 318×72 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                                                 |                      |
| neutral | default  | true  | 318×72 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                                                 |                      |

## Issues detected (page)

- The documentation card's Accessibility section holds the Breadcrumbs page's text; it does not describe this component.

## Documentation card

**Usage**

Displays a key metric with label, large value, and optional trend indicator.

**Anatomy**

Breadcrumbs compose from Breadcrumb Items joined by a separator.  
Breadcrumb Item (4 variants) type: link | current — current is the final, non-interactive item.  
Breadcrumbs (5 variants) items: 2 | 3 | 4 | 5 | multiple — use 'multiple' when the trail exceeds 5 levels.

**States**

default Interactive ancestor link. Subtle text color.  
hover Full emphasis + underline. Touch targets pad to 44px per WCAG.  
disabled Non-interactive ancestor. Use sparingly — prefer omitting the item entirely.

**Truncation**

Switch to items=multiple once the trail exceeds 5 levels. The middle collapses to an ellipsis (…) while the first and last segments stay visible. Clicking the ellipsis opens a menu listing the hidden ancestors so users can jump to any of them without losing the endpoints.

**Accessibility**

Wrap the trail in `<nav aria-label="Breadcrumb">` and render as an ordered list.  
Mark the current item with aria-current="page" — never link it.  
Separators are decorative: aria-hidden="true".  
Keyboard: Tab moves between links, Enter activates. Ellipsis menu: Arrow keys to navigate, Esc to dismiss.
