# Resource View

> SOLAR Web · Figma page `↳ 🟢 Resource View` (id `6802:5`) · section `views/calendar` · raw data: [`raw/views/calendar/resource-view.json`](../../raw/views/calendar/resource-view.json)

## Component: Resource View

### Anatomy (default variant)

- **Resource View** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 1280×744  
  fill `color.surface.base`
  - **Calendar Toolbar** · instance of **Calendar Toolbar** · row gap 16 pad 12/16/12/16 FILL/HUG · 1280×56  
    fill `color.surface.base` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Calendar Body** · frame · column gap 0 pad 20/20/20/20 FILL/HUG · 1280×401  
    padding `inset.lg`
    - **Calendar Surface** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 1240×361  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · radius `radius.container`
      - **Header Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1240×25  
        fill `color.surface.background` · stroke `color.border.subtle` mixedpx
      - **Resource Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1240×56  
        stroke `color.border.subtle` mixedpx
      - **Resource Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1240×56  
        stroke `color.border.subtle` mixedpx
      - **Resource Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1240×56  
        stroke `color.border.subtle` mixedpx
      - **Resource Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1240×56  
        stroke `color.border.subtle` mixedpx
      - **Resource Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1240×56  
        stroke `color.border.subtle` mixedpx
      - **Resource Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1240×56  
        stroke `color.border.subtle` mixedpx
      - **Now Indicator** · rectangle · FIXED/FIXED · 2×336  
        fill `color.action.primary.bg.default`

Instance census (tree capped at depth 3): Icon/None ×17, Event Chip ×12, Icon/Repeat ×12, Segmented Control Item ×6, Avatar ×6, Icon Button ×2, Button ×2, Spinner ×2, Counter ×2, Calendar Toolbar ×1, Segmented Control ×1, Icon/Plus ×1

### Tokens used

| Role         | Tokens                                                                              |
| ------------ | ----------------------------------------------------------------------------------- |
| Fills        | `color.action.primary.bg.default`, `color.surface.background`, `color.surface.base` |
| Strokes      | `color.border.subtle`                                                               |
| Spacing      | `inset.lg`, `inset.md`, `inset.sm`                                                  |
| Radius       | `radius.container`                                                                  |
| Border width | `border.default`                                                                    |

### Composes

- Calendar Toolbar

### Issues detected

- Component description is empty.

## Documentation card

**Description**

A calendar laid out by resource (rooms, people, devices) with their bookings — for scheduling across many resources at once.

**Layout**

Resource headers (columns or rows) · time axis · booking blocks per resource · now indicator · filter by resource.

**Responsive**

Desktop multi-resource grid; mobile narrows to a single resource or switches view.

**States**

loaded, loading, empty (no resources / bookings), error; conflict highlighting.

**Accessibility**

Resource + time exposed per block; blocks focusable with resource + time announced; conflicts not colour-only. Keyboard navigation.

**Rules**

Label each resource clearly  
Mark conflicts explicitly  
Pair colour with a label  
Filter to relevant resources

Overflow many resources on mobile  
Show conflicts by colour only  
Lose keyboard access  
Leave resource types unlabelled
