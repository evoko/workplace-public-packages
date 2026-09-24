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

## Documentation card

**Usage**

Top toolbar for Calendar views. Left: prev/next IconButtons (ghost) + Today button (secondary) + current date-range title. Right: Segmented Control for switching between Day / Week / Month / Agenda + primary Button for creating a new event.

**Anatomy**

Top-level layers of the component: Left · Right. Instances keep their SOLAR component names.

**Specification**

Single component.  
Props: range (text).

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
