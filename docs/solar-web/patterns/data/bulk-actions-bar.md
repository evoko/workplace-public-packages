# Bulk Actions Bar

> SOLAR Web · Figma page `↳ 🟢 Bulk Actions Bar` (id `3614:2`) · section `patterns/data` · raw data: [`raw/patterns/data/bulk-actions-bar.json`](../../raw/patterns/data/bulk-actions-bar.json)

## Component: Bulk Actions Bar

### Props

| Prop      | Type | Options / default         |
| --------- | ---- | ------------------------- |
| `Actions` | slot | default `[object Object]` |

### Anatomy (default variant)

- **Bulk Actions Bar** · component · row gap 0 pad 0/4/0/4 HUG/FIXED · 533×48  
  fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · padding `inset.2xs`, `inset.none` · strokeWeight `border.default` · radius `radius.container`
  - **Selected** · frame · row gap 0 pad 0/0/0/0 HUG/FILL · 196×48
    - **Icon/DragHandle** · instance of **Icon/DragHandle** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`
    - **Divider** · instance of **Divider** (orientation=vertical, type=full) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 1×36
    - **Cointainer** · frame · row gap 12 pad 0/16/0/16 HUG/FILL · 174×48  
      itemSpacing `inset.sm` · padding `inset.md`
      - **Checkbox** · instance of **Checkbox** (checked=true, disabled=false, hover=false, mixed=false, focus=false) · column gap 16 pad 0/0/0/0 FIXED/FIXED · 16×16  
        fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · itemSpacing `stack.md` · strokeWeight `border.default` · radius `radius.control`
      - **Count** · text `body/md/medium` "5 selected" · HUG/HUG · 67×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
      - **Link** · instance of **Link** (size=sm, state=default) · row gap 8 pad 0/0/0/0 HUG/HUG · 35×10  
        itemSpacing `stack.xs`
    - **Divider** · instance of **Divider** (orientation=vertical, type=full) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 1×36
  - **Actions** · slot · row gap 0 pad 0/0/0/0 HUG/HUG · 329×40  
    prop slotContentId←Actions
    - **Button** · instance of **Button** (size=md, prio=tertiary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
      stroke `color.action.tertiary.border.default` 1px · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Button** · instance of **Button** (size=md, prio=tertiary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
      stroke `color.action.tertiary.border.default` 1px · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Button** · instance of **Button** (size=md, prio=tertiary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 89×40  
      stroke `color.action.tertiary.border.default` 1px · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Button** · instance of **Button** (size=md, prio=tertiary, state=default, danger=true) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
      stroke `color.action.tertiary.border.default` 1px · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.surface.raised`                                         |
| Strokes         | `color.action.tertiary.border.default`, `color.border.medium`, `color.border.subtle`              |
| Text color      | `color.text.primary`                                                                              |
| Spacing         | `inset.2xs`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.md`, `stack.xs`             |
| Radius          | `radius.container`, `radius.control`                                                              |
| Border width    | `border.default`                                                                                  |
| Sizes           | `icon.md`                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Effects         | `shadow/overlay`                                                                                  |
| Text styles     | `body/md/medium`                                                                                  |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop      |
| ------- | ------------------- | --------- |
| Actions | slotContentId       | `Actions` |

### Composes

- Button
- Checkbox
- Divider
- Icon/DragHandle
- Link

### Issues detected

- Component description is empty.

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
