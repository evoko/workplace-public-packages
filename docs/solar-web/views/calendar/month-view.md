# Month View

> SOLAR Web · Figma page `↳ 🟢 Month View` (id `6664:3`) · section `views/calendar` · raw data: [`raw/views/calendar/month-view.json`](../../raw/views/calendar/month-view.json)

## Component: Month View

Composed Month View pattern. Wires up Calendar Toolbar (top), Weekday Header row (7 cells with today emphasis on the current weekday), and a 5-week × 7-day grid of Day Cell instances. Demonstrates: default emphasis, today (filled inverse pill), today-column (light info bg running down the today column), other-month (dimmed), plus all three Event Chip styles (subtle/tinted/solid) across the data/category palette. Use as a copy-detach starting point for any Calendar / Scheduling view — instance the component into a VIEWS page, then detach to populate with real events.

### Anatomy (default variant)

- **Month View** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1280×700
  - **Calendar Toolbar** · instance of **Calendar Toolbar** · row gap 16 pad 12/16/12/16 FILL/HUG · 1280×56  
    fill `color.surface.base` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Calendar Body** · frame · column gap 0 pad 4/20/4/20 FILL/HUG · 1280×644  
    padding `inset.lg`, `inset.2xs`
    - **Calendar Surface** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 1240×636  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.dialog`
      - **Weekday Header Row** · frame · row gap 0 pad 0/0/0/0 FILL/FIXED · 1240×36
      - **Day Grid** · frame · grid gap 0 pad 0/0/0/0 FILL/HUG · 1240×600

Instance census (tree capped at depth 3): Event Chip ×105, Icon/Repeat ×105, Day Cell ×35, Icon/None ×13, Weekday Header ×7, Segmented Control Item ×4, Icon Button ×2, Button ×2, Spinner ×2, Counter ×2, Calendar Toolbar ×1, Segmented Control ×1, Icon/Plus ×1

### Tokens used

| Role         | Tokens                                          |
| ------------ | ----------------------------------------------- |
| Fills        | `color.surface.base`                            |
| Strokes      | `color.border.subtle`                           |
| Spacing      | `inset.2xs`, `inset.lg`, `inset.md`, `inset.sm` |
| Radius       | `radius.dialog`                                 |
| Border width | `border.default`                                |
| Effects      | `shadow/raised`                                 |

### Composes

- Calendar Toolbar

## Documentation card

**Usage**

Composed Month View pattern. Wires up Calendar Toolbar (top), Weekday Header row (7 cells with today emphasis on the current weekday), and a 5-week × 7-day grid of Day Cell instances. Demonstrates: default emphasis, today (filled inverse pill), today-column (light info bg running down the today column), other-month (dimmed), plus all three Event Chip styles (subtle/tinted/solid) across the data/category palette. Use as a copy-detach starting point for any Calendar / Scheduling view — instance the component into a VIEWS page, then detach to populate with real events.

**Anatomy**

Top-level layers of the component: Calendar Toolbar · Calendar Body. Instances keep their SOLAR component names.

**Specification**

Single component.

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
