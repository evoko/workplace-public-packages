# Widget Card

> SOLAR Web · Figma page `↳ 🟢 Widget Card` (id `5113:12`) · section `patterns/dashboards` · raw data: [`raw/patterns/dashboards/widget-card.json`](../../raw/patterns/dashboards/widget-card.json)

## Component set: Widget Card

ROLE: composition of Card.

Dashboard widget chrome. A Card composition with opinionated header (Title + optional overflow menu + optional control slot for Time Range Selector), body slot, and first-class loading / error / empty states.

ANATOMY
Outer COMPONENT wraps an inner Surface FRAME that carries all card tokens (surface/base, border/subtle, radius/container, border/default weight, shadow/raised effect style, padding inset/lg). Inside Surface: WidgetHeader (Title + Trailing(Control + Overflow)) → Body → Footer.

VARIANT PROPERTIES
• state — default, loading, error, empty

BOOLEANS
• show overflow (default true) • show control (default false) • show footer (default false)
• title (text prop)

PADDING OVERRIDE
Bound to inset/lg vs Card's nominal inset/md. Applied via --solar-card-padding in code, not a fork.

COMPOSITION CONTRACT
Widget Card may not override: surface/\*, border/\*, radius/\*, border/default weight, shadow/raised, focus ring. May override: padding (inset.lg), Header content (fixed WidgetHeader), state vocabulary (loading|error|empty).

STATE DELEGATIONS
• loading → Skeleton (rectangular, md)
• empty → EmptyState (size=sm)
• error → inline error block (message + Button instance)

BUILD NOTE (2026-04-21)
Outer COMPONENT uses an inner Surface FRAME because Figma's Plugin API silently drops scalar bindings (padding/radius/strokeWeight/itemSpacing) when applied directly to a COMPONENT root node. The Surface FRAME holds all card tokens; the COMPONENT wrapper provides the variant axis. Taxonomy intent (Widget Card as a Card INSTANCE) is blocked on Card exposing a content-accepting slot — flagged on the handoff.

IS NOT
• Not a Card variant.
• Not a layout grid.
• Not an entity card.
• Does not own the Time Range Selector — accepts one as an instance swap into the Control slot.

### Props

| Prop          | Type    | Options / default                     |
| ------------- | ------- | ------------------------------------- |
| `state`       | variant | **default** · loading · error · empty |
| `action`      | variant | **more** · link                       |
| `show footer` | boolean | default `true`                        |
| `footer`      | slot    | default `[object Object]`             |
| `body`        | slot    | default `[object Object]`             |
| `hasStatus`   | boolean | default `false`                       |
| `title`       | text    | default `Title`                       |

Default variant: `state=default, action=more` · 8 variants · default size 360×99px

### Anatomy (default variant)

- **state=default, action=more** · component · column gap 16 pad 16/16/16/16 FIXED/HUG · 360×99  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Header** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 328×16
    - **Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 33×12  
      itemSpacing `stack.xs`
      - ~~**Trend Badge**~~ (hidden by default) · instance of **Trend Badge** (type=incline, size=xs) · FIXED/FIXED · 8×8  
        fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill` · prop visible←hasStatus
      - **Title** · text `title/xs` "Title" · HUG/HUG · 33×12  
        fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500` · prop characters←title
    - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
  - **body** · slot · column gap 8 pad 0/0/0/0 FILL/HUG · 328×10  
    itemSpacing `stack.xs` · prop slotContentId←body
    - **Body slot** · text `body/md/regular` "Body slot" · HUG/HUG · 60×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **footer** · slot · row gap 8 pad 0/0/0/0 FILL/HUG · 328×9  
    itemSpacing `stack.xs` · prop visible←show footer, slotContentId←footer
    - **Footer slot** · text `body/sm/regular` "Footer slot" · HUG/HUG · 59×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.feedback.success.strong`                                                                                                                                                                 |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                                                                  |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.default`, `color.text.primary`, `color.text.secondary`                                                                |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.primary`                                                                                                                                                                   |
| Spacing         | `inset.md`, `stack.md`, `stack.xs`                                                                                                                                                                                            |
| Radius          | `radius.container`, `radius.pill`                                                                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                                                                              |
| Sizes           | `icon.sm`                                                                                                                                                                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.xs`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.xs` |
| Effects         | `shadow/raised`                                                                                                                                                                                                               |
| Text styles     | `body/md/regular`, `body/sm/regular`, `title/xs`                                                                                                                                                                              |

### Slots and prop-controlled layers

| Layer                            | Controlled property | Prop          |
| -------------------------------- | ------------------- | ------------- |
| Header › Container › Trend Badge | visible             | `hasStatus`   |
| Header › Container › Title       | characters          | `title`       |
| body                             | slotContentId       | `body`        |
| footer                           | visible             | `show footer` |
| footer                           | slotContentId       | `footer`      |

### Composes

- Icon/More
- Trend Badge

### Variant matrix

| state   | action | size    | fill                 | stroke                | effect          | text                                                                                                                                                                   | icon                                                          |
| ------- | ------ | ------- | -------------------- | --------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| default | more   | 360×99  | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`                                                                                                                         | `color.icon.primary`                                          |
| loading | more   | 360×160 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                                                                                                                                        |                                                               |
| error   | more   | 360×160 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                         | `color.icon.primary`<br>`color.action.secondary.icon.default` |
| empty   | more   | 360×160 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                         | `color.icon.primary`<br>`color.action.secondary.icon.default` |
| default | link   | 360×103 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.action.tertiary.text.default`<br>`color.text.secondary`                                                                                 | `color.icon.primary`                                          |
| loading | link   | 360×160 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                                                                                                                                        |                                                               |
| error   | link   | 360×160 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.action.tertiary.text.default`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.primary`<br>`color.action.secondary.icon.default` |
| empty   | link   | 360×160 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.action.tertiary.text.default`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.primary`<br>`color.action.secondary.icon.default` |

### Issues detected

- Hard-coded gap `12px` on layer _Header_

## Compositions and examples on this page

### Icon/None (instance of Icon/None, 16×16)

Uses: Icon/None ×1

- ~~**Icon/None**~~ (hidden by default) · instance of **Icon/None** (solid=false) · 16×16  
  height `icon.sm`

### Spinner (instance of Spinner, 16×16)

Uses: Spinner ×1

- ~~**Spinner**~~ (hidden by default) · instance of **Spinner** (size=sm, style=default) · column gap 0 pad 0/0/0/0 HUG/HUG · 16×16

### Counter (instance of Counter, 25×20)

Uses: Counter ×1

- ~~**Counter**~~ (hidden by default) · instance of **Counter** (type=regular, state=default) · row gap 0 pad 0/8/0/8 HUG/FIXED · 25×20  
  fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · padding `inset.xs` · strokeWeight `border.default` · radius `radius.pill`

### Icon/More (instance of Icon/More, 16×16)

Uses: Icon/More ×1

- **Icon/More** · instance of **Icon/More** (solid=false) · 16×16  
  height `icon.sm`

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
