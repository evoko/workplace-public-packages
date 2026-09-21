# Day View

> SOLAR Web · Figma page `↳ 🟢 Day View` (id `6802:3`) · section `views/calendar` · raw data: [`raw/views/calendar/day-view.json`](../../raw/views/calendar/day-view.json)

## Component: Day View

### Anatomy (default variant)

- **Day View** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1024×724  
  fill `color.surface.base`
  - **Calendar Toolbar** · instance of **Calendar Toolbar** · row gap 16 pad 12/16/12/16 FILL/HUG · 1024×56  
    fill `color.surface.base` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Calendar Body** · frame · row gap 16 pad 12/20/12/20 FILL/HUG · 1024×668  
    padding `inset.lg`, `inset.sm`
    - **Side Rail** · frame · column gap 16 pad 0/0/0/0 HUG/HUG · 300×561
      - **Date Picker Open** · instance of **Date Picker Open** (inline=false, type=single) · column gap 12 pad 12/12/12/12 HUG/HUG · 300×285  
        fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
      - **Up Next** · frame · column gap 8 pad 16/16/16/16 FIXED/HUG · 300×260  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · padding `inset.md` · radius `radius.container`
    - **Calendar Surface** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 668×644  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · radius `radius.container`
      - **Header Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 668×36  
        stroke `color.border.subtle` mixedpx
      - **All-Day Strip** · frame · row gap 0 pad 4/0/4/0 FILL/HUG · 668×32  
        stroke `color.border.subtle` mixedpx
      - **Time Grid Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 668×576

Instance census (tree capped at depth 3): Day Cell ×35, Icon/None ×17, Time Axis Label ×12, Time Slot ×12, Segmented Control Item ×6, Event Chip ×6, Icon/Repeat ×6, Agenda Row ×3, Avatar ×3, Icon Button ×2, Button ×2, Spinner ×2, Counter ×2, Calendar Toolbar ×1, Segmented Control ×1, Icon/Plus ×1, Date Picker Open ×1, Icon/ArrowLeft ×1, Icon/ArrowRight ×1, Weekday Header ×1, All-Day Bar ×1

### Tokens used

| Role         | Tokens                                         |
| ------------ | ---------------------------------------------- |
| Fills        | `color.surface.base`, `color.surface.raised`   |
| Strokes      | `color.border.subtle`                          |
| Spacing      | `inset.lg`, `inset.md`, `inset.sm`, `stack.sm` |
| Radius       | `radius.container`                             |
| Border width | `border.default`                               |
| Effects      | `shadow/overlay`                               |

### Composes

- Calendar Toolbar
- Date Picker Open

### Issues detected

- Component description is empty.
- Hard-coded gap `16px` on layer _Calendar Body_
- Hard-coded gap `16px` on layer _Calendar Body › Side Rail_
- Hard-coded gap `8px` on layer _Calendar Body › Side Rail › Up Next_
- Hard-coded paddingTop `4px` on layer _Calendar Body › Calendar Surface › All-Day Strip_
- Hard-coded paddingBottom `4px` on layer _Calendar Body › Calendar Surface › All-Day Strip_

## Documentation card

**Description**

A single-day timeline of timed events with an all-day lane — the most detailed calendar view. For focusing on one day's schedule.

**Layout**

Date header · All-Day Bar · time axis + a single day column of Time Slots · Event Chips · now indicator.

**Responsive**

Single column on desktop and mobile; spacing scales.

**States**

loaded, loading, empty, error; drag-to-create / move where supported.

**Accessibility**

Time cells + events labelled with times; events keyboard-focusable; now indicator announced. Colour paired with a label.

**Rules**

Mark the current time  
Show all-day separately  
Handle overlapping events  
Pair colour with a label

Rely on colour alone  
Hide overlaps  
Lose keyboard access  
Omit the all-day lane
