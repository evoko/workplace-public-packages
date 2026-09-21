# Action Card

> SOLAR Web · Figma page `↳ 🟢 Action Card` (id `2966:609`) · section `components/cards` · raw data: [`raw/components/cards/action-card.json`](../../raw/components/cards/action-card.json)

## Component set: Action Card

ROLE: composition of Card.

The single interactive composition of Card. Whole-surface click affordance for onboarding checklists, empty-state CTAs, and feature promos.

ANATOMY
Card surface + fixed Body anatomy: leading Icon (instance swap, 24px) → Title → Description → CTA row (Button Group instance swap).

VARIANT PROPERTIES
• status — default, done (controls CTA-row vs done-indicator swap)
• state — default, hover (pressed / focus queued)

BOOLEANS
• Show CTA • Show Primary CTA • Show Secondary CTA • Show Icon • Content (slot)
Queued: show description, show status-message.

COMPOSITION CONTRACT
Action Card is (taxonomy-intent) a Card instance with clickable=true pinned. Current build is a detached copy of Card, not a Card instance — graduation to a true Card instance requires owner call (see Open Items). Inherits Card's focus ring (shadow/focus/default) and hover/pressed overlay — does not redefine them. Downstream consumers instance Action Card, not Card + manual content.

IS NOT
• Not a generic clickable Card wrapper — if a consumer needs a bespoke clickable body (Device Card, Billing Card), use Card with clickable=true directly.
• Action Card is specifically the icon-title-description-CTA pattern.
• Not a Button-in-a-Card — the surface itself is the control.
• Not a list-row — that's List.

### Props

| Prop               | Type          | Options / default           |
| ------------------ | ------------- | --------------------------- |
| `status`           | variant       | **default** · done · danger |
| `state`            | variant       | hover · **default**         |
| `layout`           | variant       | **vertical**                |
| `showCTA`          | boolean       | default `true`              |
| `showPrimaryCTA`   | boolean       | default `true`              |
| `showSecondaryCTA` | boolean       | default `true`              |
| `showIcon`         | boolean       | default `true`              |
| `content`          | slot          | default `[object Object]`   |
| `icon`             | instance swap | default `10148:444`         |

Default variant: `status=default, state=default, layout=vertical` · 6 variants · default size 300×166px

### Anatomy (default variant)

- **status=default, state=default, layout=vertical** · component · column gap 16 pad 16/16/16/16 FIXED/HUG · 300×166  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Title** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 268×20  
    itemSpacing `stack.xs`
    - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md` · prop visible←showIcon, mainComponent←icon
    - **Title** · text `body/lg/semibold` "Label" · FILL/HUG · 212×12  
      fill `color.text.primary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.600`
    - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`
  - **content** · slot · column gap 16 pad 0/0/0/0 FILL/HUG · 268×50  
    itemSpacing `stack.md` · prop slotContentId←content
    - **Description** · text `body/md/regular` "Description text that explains why this action matters and what the user will ac" · FILL/HUG · 268×50  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **CTA** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 268×32  
    itemSpacing `stack.xs` · prop visible←showCTA
    - **Button** · instance of **Button** (size=sm, prio=primary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
      fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←showPrimaryCTA
    - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
      stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←showSecondaryCTA

### Tokens used

| Role            | Tokens                                                                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.surface.base`, `color.surface.feedback.danger.subtle`                                                                                                    |
| Strokes         | `color.action.primary.border.default`, `color.action.secondary.border.default`, `color.border.medium`, `color.border.subtle`                                                                       |
| Text color      | `color.action.primary.text.danger.default`, `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.danger`, `color.text.primary`, `color.text.secondary` |
| Icon color      | `color.action.primary.icon.danger.default`, `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.icon.feedback.danger`, `color.icon.primary`, `color.icon.secondary` |
| Spacing         | `inset.md`, `inset.xs`, `stack.md`, `stack.xs`                                                                                                                                                     |
| Radius          | `radius.container`, `radius.control`                                                                                                                                                               |
| Border width    | `border.default`                                                                                                                                                                                   |
| Sizes           | `icon.md`                                                                                                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.600`, `type.line-height.body.lg`, `type.line-height.body.md`, `type.size.body.lg`, `type.size.body.md`                         |
| Effects         | `shadow/control`, `shadow/raised`                                                                                                                                                                  |
| Text styles     | `body/lg/semibold`, `body/md/regular`                                                                                                                                                              |

### Slots and prop-controlled layers

| Layer             | Controlled property | Prop               |
| ----------------- | ------------------- | ------------------ |
| Title › Icon/None | visible             | `showIcon`         |
| Title › Icon/None | mainComponent       | `icon`             |
| content           | slotContentId       | `content`          |
| CTA               | visible             | `showCTA`          |
| CTA › Button      | visible             | `showPrimaryCTA`   |
| CTA › Button      | visible             | `showSecondaryCTA` |

### Composes

- Button
- Icon/More
- Icon/None

### Variant matrix

| status  | state   | layout   | size    | fill                                   | stroke                | effect           | text                                                                                                                                          | icon                                                                                                 |
| ------- | ------- | -------- | ------- | -------------------------------------- | --------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| default | default | vertical | 300×166 | `color.surface.base`                   | `color.border.subtle` | `shadow/control` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`                | `color.icon.primary`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.default` |
| done    | default | vertical | 300×166 | `color.surface.base`                   | `color.border.subtle` | `shadow/control` | `color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                        | `color.icon.secondary`<br>`color.action.secondary.icon.default`                                      |
| danger  | default | vertical | 300×166 | `color.surface.feedback.danger.subtle` | `color.border.subtle` | `shadow/control` | `color.text.feedback.danger`<br>`color.text.secondary`<br>`color.action.primary.text.danger.default`<br>`color.action.secondary.text.default` | `color.icon.feedback.danger`<br>`color.icon.secondary`<br>`color.action.primary.icon.danger.default` |
| default | hover   | vertical | 300×166 | `color.surface.base`                   | `color.border.subtle` | `shadow/control` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`                | `color.icon.primary`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.default` |
| done    | hover   | vertical | 300×166 | `color.surface.base`                   | `color.border.medium` | `shadow/control` | `color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                        | `color.icon.secondary`<br>`color.action.secondary.icon.default`                                      |
| danger  | hover   | vertical | 300×166 | `color.surface.feedback.danger.subtle` | `color.border.medium` | `shadow/raised`  | `color.text.feedback.danger`<br>`color.text.secondary`<br>`color.action.primary.text.danger.default`<br>`color.action.secondary.text.default` | `color.icon.feedback.danger`<br>`color.icon.secondary`<br>`color.action.primary.icon.danger.default` |

### Issues detected

- Axis `status`: description lists [default, done], set has [default, done, danger].

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
