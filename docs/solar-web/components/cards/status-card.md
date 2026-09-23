# Status Card

> SOLAR Web · Figma page `↳ 🟢 Status Card` (id `5646:3`) · section `components/cards` · raw data: [`raw/components/cards/status-card.json`](../../raw/components/cards/status-card.json)

## Component set: Status Card

Compact card that reports the status of one thing — a device, service or job — with a feedback-coloured indicator, title and value. 16 variants: status (success, neutral, danger, warning) × state (default, hover, disabled) plus ghost=true per status. ghost is the skeleton placeholder while data loads. Status is conveyed by icon + label, not colour alone. For KPI numbers use Stat Card; for an actionable alert use Insight Card.

### Props

| Prop     | Type    | Options / default                        |
| -------- | ------- | ---------------------------------------- |
| `status` | variant | **success** · neutral · danger · warning |
| `state`  | variant | **default** · hover · disabled           |
| `ghost`  | variant | **false** · true                         |

Default variant: `status=success, state=default, ghost=false` · 16 variants · default size 240×84px

### Anatomy (default variant)

- **status=success, state=default, ghost=false** · component · column gap 12 pad 16/16/16/16 FIXED/HUG · 240×84  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Title** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 208×20  
    itemSpacing `stack.md`
    - **Title** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
    - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`
  - **Trend** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 41×20  
    itemSpacing `stack.xs`
    - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=md) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 20×20  
      fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · itemSpacing `stack.none` · strokeWeight `border.default` · radius `radius.pill`
    - **TrendValue** · text `title/sm` "5" · HUG/HUG · 13×15  
      fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills           | `color.surface.base`, `color.surface.feedback.success.strong`                                                                                          |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                           |
| Text color      | `color.text.primary`                                                                                                                                   |
| Icon color      | `color.icon.disabled`, `color.icon.inverse`, `color.icon.primary`, `color.surface.feedback.danger.strong`, `color.surface.feedback.warning.strong`     |
| Spacing         | `inset.md`, `stack.md`, `stack.none`, `stack.sm`, `stack.xs`                                                                                           |
| Radius          | `radius.container`, `radius.pill`                                                                                                                      |
| Border width    | `border.default`                                                                                                                                       |
| Sizes           | `icon.md`                                                                                                                                              |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.line-height.title.sm`, `type.size.label.md`, `type.size.title.sm` |
| Effects         | `shadow/raised`                                                                                                                                        |
| Text styles     | `label/md`, `title/sm`                                                                                                                                 |

### Composes

- Icon/More
- StatusIndicator

### Variant matrix

| status  | state    | ghost | size   | fill                 | stroke                | effect          | text                 | icon                                                                                     |
| ------- | -------- | ----- | ------ | -------------------- | --------------------- | --------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| success | default  | false | 240×84 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary` | `color.icon.primary`<br>`color.icon.inverse`                                             |
| warning | default  | false | 240×84 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary` | `color.icon.primary`<br>`color.surface.feedback.warning.strong`<br>`color.icon.inverse`  |
| danger  | default  | false | 240×84 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary` | `color.icon.primary`<br>`color.surface.feedback.danger.strong`<br>`color.icon.inverse`   |
| neutral | default  | false | 240×84 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary` | `color.icon.primary`<br>`color.icon.inverse`                                             |
| success | hover    | false | 240×84 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary` | `color.icon.primary`<br>`color.icon.inverse`                                             |
| warning | hover    | false | 240×84 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary` | `color.icon.primary`<br>`color.surface.feedback.warning.strong`<br>`color.icon.inverse`  |
| danger  | hover    | false | 240×84 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary` | `color.icon.primary`<br>`color.surface.feedback.danger.strong`<br>`color.icon.inverse`   |
| neutral | hover    | false | 240×84 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary` | `color.icon.primary`<br>`color.icon.inverse`                                             |
| success | disabled | false | 240×84 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary` | `color.icon.disabled`<br>`color.icon.inverse`                                            |
| warning | disabled | false | 240×84 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary` | `color.icon.disabled`<br>`color.surface.feedback.warning.strong`<br>`color.icon.inverse` |
| danger  | disabled | false | 240×84 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary` | `color.icon.disabled`<br>`color.surface.feedback.danger.strong`<br>`color.icon.inverse`  |
| neutral | disabled | false | 240×84 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary` | `color.icon.disabled`<br>`color.icon.inverse`                                            |
| success | default  | true  | 240×80 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                      |                                                                                          |
| warning | default  | true  | 240×80 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                      |                                                                                          |
| danger  | default  | true  | 240×80 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                      |                                                                                          |
| neutral | default  | true  | 240×80 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                      |                                                                                          |

## Issues detected (page)

- Documentation card contains Breadcrumbs boilerplate text; it does not describe this component.

## Documentation card

**Description**

Shows the user's location within a navigational hierarchy — and lets them jump back up the tree. Use for deep page structures where ancestors are meaningful destinations. Not for single-level flows (omit entirely), not for linear progress (use Stepper).

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
