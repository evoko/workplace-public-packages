# Card

> SOLAR Web · Figma page `↳ 🟢 Card` (id `2163:3662`) · section `components/cards` · raw data: [`raw/components/cards/card.json`](../../raw/components/cards/card.json)

## Component set: Card

ROLE: primitive (the surface primitive for the card family).

Renders the raised surface, border, radius, shadow, and slot structure. All card-family compositions bind to Card, not to raw tokens.

ANATOMY
Vertical auto-layout frame with slots governed by visibility booleans. Body is the only required slot. (Current build exposes Title + Content slot + optional Tag; 4-slot Media/Header/Body/Footer expansion is queued — see Open Items.)

VARIANT PROPERTIES
• state — default, hover, disabled (pressed / focus / selected queued)
• status — none, danger, warning, success, info (semantic border override via color.border.feedback.{type}.strong)
• loading — false, true (true renders the skeleton placeholder state)

BOOLEANS
• title (text prop) • show tag • Content (slot)
• clickable (queued: gates interaction-state visibility and the focus ring)

TOKENS BOUND (current)
surface/base, border/subtle, radius/container, border/default weight, effect style shadow/control, padding inset/lg.

TAXONOMY NOTE (2026-04-21)
Taxonomy contract specifies surface/raised, shadow/raised, padding inset/md. Current bindings preserve the prior ground-truth build and are out of sync; re-point requires owner call — do not silently migrate consumers.

PICKING RULES
• Need a raised surface that holds arbitrary content → Card.
• Need the whole surface clickable with icon+title+description+CTA anatomy → Action Card.
• Need a semantic grouping inside a larger surface → Container.
• Need a KPI: label + number + optional unit + optional trend → Stat Value (inside any surface).
• Need dashboard widget chrome with overflow + time range + loading/empty/error → Widget Card.
• Need the canonical dashboard KPI tile → Metric Tile.

HOVER / PRESSED RENDER CONTRACT
Hover and pressed render at runtime as an alpha overlay via ::before, not a fill swap. Figma approximates the composited appearance; the code contract is the overlay. This composes cleanly over Media slot images and status=danger|warning|success border overrides.

IS NOT
• Not a layout region — that's Container.
• Not a dashboard widget — that's Widget Card.
• Not the content inside — that's Stat Value.
• Not a whole-surface link — Action Card sets clickable=true and pins Body anatomy.
• Card never renders a numeric KPI, overflow menu, Time Range Selector, or sparkline directly.

### Props

| Prop        | Type    | Options / default                            |
| ----------- | ------- | -------------------------------------------- |
| `state`     | variant | **default** · hover · disabled               |
| `status`    | variant | **none** · danger · warning · success · info |
| `loading`   | variant | **false** · true                             |
| `Content`   | slot    | default `[object Object]`                    |
| `title`     | text    | default `Label`                              |
| `hasTag`    | boolean | default `true`                               |
| `hasMore`   | boolean | default `true`                               |
| `hasHelper` | boolean | default `false`                              |
| `hasIcon`   | boolean | default `false`                              |

Default variant: `state=default, status=none, loading=false` · 12 variants · default size 320×150px

### Anatomy (default variant)

- **state=default, status=none, loading=false** · component · column gap 12 pad 16/16/16/16 FIXED/HUG · 320×150  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Title** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 288×20  
    itemSpacing `stack.xs`
    - ~~**Icon/None**~~ (hidden by default) · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm` · prop visible←hasIcon
    - **Title** · text `body/md/medium` "Label" · FILL/HUG · 260×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←title
    - ~~**Helper**~~ (hidden by default) · text `body/md/medium` "Helper" · FIXED/FIXED · 43×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop visible←hasHelper
    - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md` · prop visible←hasMore
  - **Content** · slot · column gap 8 pad 0/0/0/0 FILL/HUG · 288×50  
    itemSpacing `stack.xs` · prop slotContentId←Content
    - **Description** · text `body/md/regular` "Content goes here. Replace this with any content — text, lists, form fields, or " · FILL/HUG · 288×50  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 55×24  
    fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill` · prop visible←hasTag

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills           | `color.surface.base`, `color.surface.feedback.danger.subtle`, `color.surface.feedback.info.subtle`, `color.surface.feedback.neutral.subtle`, `color.surface.feedback.success.subtle`, `color.surface.feedback.warning.subtle`                    |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                                                                                     |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.inverse`, `color.text.primary`, `color.text.secondary` |
| Icon color      | `color.icon.disabled`, `color.icon.feedback.danger`, `color.icon.feedback.info`, `color.icon.feedback.success`, `color.icon.feedback.warning`, `color.icon.primary`                                                                              |
| Spacing         | `inset.2xs`, `inset.md`, `inset.none`, `inset.sm`, `stack.xs`                                                                                                                                                                                    |
| Radius          | `radius.container`, `radius.pill`                                                                                                                                                                                                                |
| Border width    | `border.default`                                                                                                                                                                                                                                 |
| Sizes           | `icon.md`, `icon.sm`                                                                                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`                                                                                                                        |
| Effects         | `shadow/raised`                                                                                                                                                                                                                                  |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                                                                                                                                              |

### Slots and prop-controlled layers

| Layer             | Controlled property | Prop        |
| ----------------- | ------------------- | ----------- |
| Title › Icon/None | visible             | `hasIcon`   |
| Title › Title     | characters          | `title`     |
| Title › Helper    | visible             | `hasHelper` |
| Title › Icon/More | visible             | `hasMore`   |
| Content           | slotContentId       | `Content`   |
| Tag               | visible             | `hasTag`    |

### Composes

- Icon/More
- Icon/None
- Tag

### Variant matrix

| state    | status  | loading | size    | fill                                    | stroke                | effect          | text                                                                            | icon                                          |
| -------- | ------- | ------- | ------- | --------------------------------------- | --------------------- | --------------- | ------------------------------------------------------------------------------- | --------------------------------------------- |
| default  | none    | false   | 320×150 | `color.surface.base`                    | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.neutral` | `color.icon.primary`                          |
| default  | danger  | false   | 320×150 | `color.surface.feedback.danger.subtle`  | `color.border.subtle` | `shadow/raised` | `color.text.feedback.danger`<br>`color.text.secondary`<br>`color.text.inverse`  | `color.icon.feedback.danger`                  |
| default  | warning | false   | 320×150 | `color.surface.feedback.warning.subtle` | `color.border.subtle` | `shadow/raised` | `color.text.feedback.warning`<br>`color.text.secondary`<br>`color.text.inverse` | `color.icon.feedback.warning`                 |
| default  | success | false   | 320×150 | `color.surface.feedback.success.subtle` | `color.border.subtle` | `shadow/raised` | `color.text.feedback.success`<br>`color.text.secondary`<br>`color.text.inverse` | `color.icon.feedback.success`                 |
| hover    | none    | false   | 320×150 | `color.surface.base`                    | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.neutral` | `color.icon.primary`                          |
| hover    | danger  | false   | 320×150 | `color.surface.feedback.danger.subtle`  | `color.border.medium` | `shadow/raised` | `color.text.feedback.danger`<br>`color.text.secondary`<br>`color.text.inverse`  | `color.icon.feedback.danger`                  |
| hover    | warning | false   | 320×150 | `color.surface.feedback.warning.subtle` | `color.border.medium` | `shadow/raised` | `color.text.feedback.warning`<br>`color.text.secondary`<br>`color.text.inverse` | `color.icon.feedback.warning`                 |
| hover    | success | false   | 320×150 | `color.surface.feedback.success.subtle` | `color.border.medium` | `shadow/raised` | `color.text.feedback.success`<br>`color.text.secondary`<br>`color.text.inverse` | `color.icon.feedback.success`                 |
| disabled | none    | false   | 320×150 | `color.surface.base`                    | `color.border.subtle` | `shadow/raised` | `color.text.disabled`<br>`color.text.feedback.neutral`                          | `color.icon.disabled`<br>`color.icon.primary` |
| default  | none    | true    | 320×156 | `color.surface.base`                    | `color.border.subtle` | `shadow/raised` |                                                                                 |                                               |
| hover    | info    | false   | 320×150 | `color.surface.feedback.info.subtle`    | `color.border.medium` | `shadow/raised` | `color.text.feedback.info`<br>`color.text.secondary`<br>`color.text.inverse`    | `color.icon.feedback.info`                    |
| default  | info    | false   | 320×150 | `color.surface.feedback.info.subtle`    | `color.border.subtle` | `shadow/raised` | `color.text.feedback.info`<br>`color.text.secondary`<br>`color.text.inverse`    | `color.icon.feedback.info`                    |

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
