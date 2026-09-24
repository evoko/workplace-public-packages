# Interactive Card

> SOLAR Web · Figma page `↳ 🟢 Interactive Card` (id `10395:2`) · section `components/cards` · raw data: [`raw/components/cards/interactive-card.json`](../../raw/components/cards/interactive-card.json)

## Component set: Interactive Card

Selectable, draggable list-row card with drag handle, selection control and hover actions. selected/drag variants + visibility booleans. Migrated from Chatter Config 2026-09-01.

### Props

| Prop              | Type    | Options / default |
| ----------------- | ------- | ----------------- |
| `selected`        | variant | **false** · true  |
| `drag`            | variant | **false** · true  |
| `showDragHandle`  | boolean | default `true`    |
| `showToggle`      | boolean | default `true`    |
| `showRadioButton` | boolean | default `true`    |
| `showCheckbox`    | boolean | default `true`    |
| `showIcon`        | boolean | default `false`   |
| `showActions`     | boolean | default `false`   |
| `hasDescription`  | boolean | default `true`    |

Default variant: `selected=false, drag=false` · 3 variants · default size 423×65px

### Anatomy (default variant)

- **selected=false, drag=false** · component · row gap 16 pad 16/20/16/16 FIXED/HUG · 423×65  
  fill `color.surface.background` · stroke `color.border.subtle` 1px · itemSpacing `stack.md` · padding `inset.md`, `inset.lg` · strokeWeight `border.default` · radius `radius.dialog`
  - **DragHandle** · instance of **DragHandle** (size=sm, state=default) · row gap 4 pad 8/8/8/8 HUG/HUG · 26×33  
    itemSpacing `stack.2xs` · padding `inset.xs` · radius `radius.control` · prop visible←showDragHandle
  - **Toggle** · instance of **Toggle** (selected=false, state=default) · FIXED/FIXED · 32×18  
    fill `color.surface.muted` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill` · prop visible←showToggle
  - **Radio** · instance of **Radio** (state=default, checked=false) · FIXED/FIXED · 18×18  
    stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill` · prop visible←showRadioButton
  - **Checkbox** · instance of **Checkbox** (checked=false, disabled=false, hover=false, mixed=false, focus=false) · FIXED/FIXED · 16×16  
    stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.control` · prop visible←showCheckbox
  - **Text** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 231×32  
    itemSpacing `stack.sm`
    - **Text+icon** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 231×10  
      itemSpacing `inset.xs`
      - ~~**Icon/None**~~ (hidden by default) · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
        prop visible←showIcon
      - **Headline** · text `body/md/semibold` "Headline" · HUG/HUG · 58×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.600`
    - **Description** · text `body/md/regular` "Descriptive text." · FILL/HUG · 231×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop visible←hasDescription
  - ~~**Actions**~~ (hidden by default) · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 112×32  
    itemSpacing `inset.xs` · prop visible←showActions
    - **Icon Button** · instance of **Icon Button** (size=sm, shape=square, prio=secondary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
      fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control`
    - **Icon Button** · instance of **Icon Button** (size=sm, shape=square, prio=secondary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
      fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control`
    - **Icon Button** · instance of **Icon Button** (size=sm, shape=square, prio=secondary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
      fill `color.action.secondary.bg.default` · stroke `color.border.feedback.danger.subtle` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role            | Tokens                                                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.default`, `color.surface.background`, `color.surface.feedback.info.subtle`, `color.surface.muted`                         |
| Strokes         | `color.border.feedback.danger.subtle`, `color.border.feedback.focus.strong`, `color.border.medium`, `color.border.subtle`                            |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                         |
| Icon color      | `color.action.secondary.icon.danger.default`, `color.action.secondary.icon.default`, `color.icon.inverse`, `color.icon.primary`, `color.neutral.900` |
| Spacing         | `inset.lg`, `inset.md`, `inset.xs`, `stack.2xs`, `stack.md`, `stack.sm`                                                                              |
| Radius          | `radius.control`, `radius.dialog`, `radius.pill`                                                                                                     |
| Border width    | `border.default`                                                                                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.600`, `type.line-height.body.md`, `type.size.body.md`                            |
| Effects         | `shadow/control`, `shadow/focus/default`                                                                                                             |
| Text styles     | `body/md/regular`, `body/md/semibold`                                                                                                                |

### Slots and prop-controlled layers

| Layer                        | Controlled property | Prop              |
| ---------------------------- | ------------------- | ----------------- |
| DragHandle                   | visible             | `showDragHandle`  |
| Toggle                       | visible             | `showToggle`      |
| Radio                        | visible             | `showRadioButton` |
| Checkbox                     | visible             | `showCheckbox`    |
| Text › Text+icon › Icon/None | visible             | `showIcon`        |
| Text › Description           | visible             | `hasDescription`  |
| Actions                      | visible             | `showActions`     |

### Composes

- Checkbox
- DragHandle
- Icon Button
- Icon/None
- Radio
- Toggle

### Variant matrix

| selected | drag  | size   | fill                                 | stroke                               | effect                 | text                                           | icon                                                                                                                                                         |
| -------- | ----- | ------ | ------------------------------------ | ------------------------------------ | ---------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| false    | false | 423×65 | `color.surface.background`           | `color.border.subtle`                |                        | `color.text.primary`<br>`color.text.secondary` | `color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.secondary.icon.danger.default`                                                 |
| true     | false | 423×65 | `color.surface.feedback.info.subtle` | `color.border.subtle`                |                        | `color.text.primary`                           | `color.icon.primary`<br>`color.icon.inverse`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.secondary.icon.danger.default` |
| false    | true  | 423×65 | `color.surface.background`           | `color.border.feedback.focus.strong` | `shadow/focus/default` | `color.text.primary`<br>`color.text.secondary` | `color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.secondary.icon.danger.default`                                                 |

### Issues detected

- Primitive color bound directly (CLR-002): `color.neutral.900`.

## Documentation card

**Usage**

Migrated from Chatter Config 2026-09-01.

**Anatomy**

DragHandle, Toggle, Radio and Checkbox instances (show one per use case via the boolean props), Text block (Headline body/md/semibold + Description body/md/regular), hidden Actions row of three sm Icon Buttons (play, edit, delete — delete carries danger styling).

**Variants & props**

selected (2) false · true — info-subtle surface, controls in checked state  
drag (2) false · true — focus-subtle border, border/strong, shadow/overlay  
Booleans: showDragHandle · showToggle · showRadioButton · showCheckbox · showIcon · showActions

**Usage**

Show exactly one selection control per list — hide the others with the booleans.  
Use drag=true only for the row being dragged.  
Reveal Actions on hover or selection, not by default.

**Rules**

- DO: Use it as described under Usage; bind every colour, spacing and radius to a SOLAR token.

- DON'T: detach the instance or override its tokens locally — request a change through governance instead.
