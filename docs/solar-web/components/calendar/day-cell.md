# Day Cell

> SOLAR Web · Figma page `↳ 🟢 Day Cell` (id `6622:3`) · section `components/calendar` · raw data: [`raw/components/calendar/day-cell.json`](../../raw/components/calendar/day-cell.json)

## Component set: Day Cell

Month-grid day cell. Holds the date number and a stack of Event Chip instances. Comfortable density shows up to 3 chips at md size; compact uses 2 chips at sm size. Today emphasis shows a filled pill around the date.

### Props

| Prop            | Type    | Options / default                                           |
| --------------- | ------- | ----------------------------------------------------------- |
| `state`         | variant | **default** · other-month · selected · today · today-column |
| `hasEvent01`    | boolean | default `true`                                              |
| `hasEvent02`    | boolean | default `true`                                              |
| `hasMoreEvents` | boolean | default `true`                                              |

Default variant: `state=default` · 5 variants · default size 160×120px

### Anatomy (default variant)

- **state=default** · component · column gap 8 pad 8/8/8/8 FIXED/FIXED · 160×120  
  fill `color.surface.base` · stroke `color.border.surface` mixedpx · itemSpacing `stack.xs` · padding `inset.xs` · strokeWeight `border.default`
  - **Day Num Row** · frame · row gap 0 pad 0/2/0/2 FILL/HUG · 144×24
    - **Day Num Pill** · frame · row gap 0 pad 0/6/0/6 FIXED/FIXED · 24×24  
      radius `radius.pill`
      - **Day Num** · text `body/sm/medium` "15" · HUG/HUG · 13×9  
        fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
  - **Events** · frame · column gap 4 pad 0/0/0/0 FILL/HUG · 144×74  
    itemSpacing `inset.2xs`
    - **Event Chip** · instance of **Event Chip** (category=blue, style=subtle) · row gap 0 pad 0/0/0/0 FILL/FIXED · 144×22  
      radius `radius.none` · prop visible←hasEvent01
    - **Event Chip** · instance of **Event Chip** (category=green, style=subtle) · row gap 0 pad 0/0/0/0 FILL/FIXED · 144×22  
      radius `radius.none` · prop visible←hasEvent02
    - **Event** · instance of **Event Chip** (category=yellow, style=subtle) · row gap 0 pad 0/0/0/0 FILL/FIXED · 144×22  
      radius `radius.none` · prop visible←hasMoreEvents

### Tokens used

| Role            | Tokens                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.active`, `color.surface.background`, `color.surface.base`, `color.surface.feedback.info.subtle` |
| Strokes         | `color.border.surface`                                                                                         |
| Text color      | `color.text.inverse`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                      |
| Icon color      | `color.icon.primary`                                                                                           |
| Spacing         | `inset.2xs`, `inset.xs`, `stack.xs`                                                                            |
| Radius          | `radius.none`, `radius.pill`                                                                                   |
| Border width    | `border.default`                                                                                               |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm`              |
| Text styles     | `body/sm/medium`                                                                                               |

### Slots and prop-controlled layers

| Layer               | Controlled property | Prop            |
| ------------------- | ------------------- | --------------- |
| Events › Event Chip | visible             | `hasEvent01`    |
| Events › Event Chip | visible             | `hasEvent02`    |
| Events › Event      | visible             | `hasMoreEvents` |

### Composes

- Event Chip

### Variant matrix

| state        | size    | fill                                 | stroke                 | effect | text                                                                    | icon                 |
| ------------ | ------- | ------------------------------------ | ---------------------- | ------ | ----------------------------------------------------------------------- | -------------------- |
| default      | 160×120 | `color.surface.base`                 | `color.border.surface` |        | `color.text.primary`<br>`color.text.secondary`                          | `color.icon.primary` |
| today        | 160×120 | `color.surface.base`                 | `color.border.surface` |        | `color.text.inverse`<br>`color.text.secondary`<br>`color.text.primary`  | `color.icon.primary` |
| today-column | 160×120 | `color.surface.feedback.info.subtle` | `color.border.surface` |        | `color.text.primary`<br>`color.text.secondary`                          | `color.icon.primary` |
| selected     | 160×120 | `color.surface.active`               | `color.border.surface` |        | `color.text.primary`<br>`color.text.secondary`                          | `color.icon.primary` |
| other-month  | 160×120 | `color.surface.background`           | `color.border.surface` |        | `color.text.tertiary`<br>`color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |

### Issues detected

- State axis uses non-standard value(s): other-month, today, today-column.
- Hard-coded paddingRight `2px` on layer _Day Num Row_
- Hard-coded paddingLeft `2px` on layer _Day Num Row_
- Hard-coded paddingRight `6px` on layer _Day Num Row › Day Num Pill_
- Hard-coded paddingLeft `6px` on layer _Day Num Row › Day Num Pill_

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
