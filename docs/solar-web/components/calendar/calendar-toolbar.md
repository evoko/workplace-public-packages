# Calendar Toolbar

> SOLAR Web · Figma page `↳ 🟢 Calendar Toolbar` (id `6622:12`) · section `components/calendar` · raw data: [`raw/components/calendar/calendar-toolbar.json`](../../raw/components/calendar/calendar-toolbar.json)

## Component: Calendar Toolbar

Top toolbar for Calendar views. Left: prev/next IconButtons (ghost) + Today button (secondary) + current date-range title. Right: Segmented Control for switching between Day / Week / Month / Agenda + primary Button for creating a new event.

### Props

| Prop    | Type | Options / default              |
| ------- | ---- | ------------------------------ |
| `range` | text | default `October 5 – 11, 2026` |

### Anatomy (default variant)

- **Calendar Toolbar** · component · row gap 16 pad 12/16/12/16 FIXED/HUG · 1280×56  
  fill `color.surface.base` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Left** · frame · row gap 12 pad 0/0/0/0 HUG/FIXED · 320×32  
    itemSpacing `inset.sm`
    - **Nav** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 84×40  
      itemSpacing `inset.2xs`
      - **Prev** · instance of **Icon Button** (size=md, shape=square, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        fill `color.action.tertiary.bg.default` · strokeWeight `border.default` · radius `radius.control`
      - **Next** · instance of **Icon Button** (size=md, shape=square, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        fill `color.action.tertiary.bg.default` · strokeWeight `border.default` · radius `radius.control`
    - **Today Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
      stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`
    - **Range** · text `title/xs` "October 5 – 11, 2026" · HUG/HUG · 148×12  
      fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500` · prop characters←range
  - **Right** · frame · row gap 12 pad 0/0/0/0 HUG/HUG · 300×32  
    itemSpacing `inset.sm`
    - **View Switcher** · instance of **Segmented Control** (size=sm) · column gap 8 pad 0/0/0/0 HUG/HUG · 188×32  
      itemSpacing `inset.xs`
    - **New Event** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 100×32  
      stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.tertiary.bg.default`, `color.surface.base`                                            |
| Strokes         | `color.action.secondary.border.default`                                                             |
| Text color      | `color.text.primary`                                                                                |
| Spacing         | `inset.2xs`, `inset.md`, `inset.sm`, `inset.xs`                                                     |
| Radius          | `radius.control`                                                                                    |
| Border width    | `border.default`                                                                                    |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.xs`, `type.size.title.xs` |
| Effects         | `shadow/control`                                                                                    |
| Text styles     | `title/xs`                                                                                          |

### Slots and prop-controlled layers

| Layer        | Controlled property | Prop    |
| ------------ | ------------------- | ------- |
| Left › Range | characters          | `range` |

### Composes

- Button
- Icon Button
- Segmented Control

### Issues detected

- Hard-coded gap `16px` on layer _Calendar Toolbar_

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
