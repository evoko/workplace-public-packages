# Week View

> SOLAR Web · Figma page `↳ 🟢 Week View` (id `6802:2`) · section `views/calendar` · raw data: [`raw/views/calendar/week-view.json`](../../raw/views/calendar/week-view.json)

## Component: Week View

### Anatomy (default variant)

- **Week View** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1280×641  
  fill `color.surface.base`
  - **Calendar Toolbar** · instance of **Calendar Toolbar** · row gap 16 pad 12/16/12/16 FILL/HUG · 1280×56  
    fill `color.surface.base` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Calendar Body** · frame · column gap 0 pad 12/20/12/20 FILL/HUG · 1280×585  
    padding `inset.lg`, `inset.sm`
    - **Calendar Surface** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 1240×561  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default`
      - **Header Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1240×49  
        stroke `color.border.subtle` mixedpx
      - **All-Day Strip** · frame · row gap 0 pad 4/0/4/0 FILL/FIXED · 1240×28  
        stroke `color.border.subtle` mixedpx
      - **Time Grid Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1240×484

Instance census (tree capped at depth 3): Time Slot ×70, Icon/None ×17, Event Chip ×12, Icon/Repeat ×12, Time Axis Label ×10, Weekday Header ×7, Segmented Control Item ×6, All-Day Bar ×4, Icon Button ×2, Button ×2, Spinner ×2, Counter ×2, Calendar Toolbar ×1, Segmented Control ×1, Icon/Plus ×1

### Tokens used

| Role         | Tokens                             |
| ------------ | ---------------------------------- |
| Fills        | `color.surface.base`               |
| Strokes      | `color.border.subtle`              |
| Spacing      | `inset.lg`, `inset.md`, `inset.sm` |
| Border width | `border.default`                   |
| Effects      | `shadow/raised`                    |

### Composes

- Calendar Toolbar

### Issues detected

- Component description is empty.
- Hard-coded radius `12px` on layer _Calendar Body › Calendar Surface_
- Hard-coded paddingTop `4px` on layer _Calendar Body › Calendar Surface › All-Day Strip_
- Hard-coded paddingBottom `4px` on layer _Calendar Body › Calendar Surface › All-Day Strip_

## Documentation card

**Description**

A 7-day calendar grid with timed events across day columns plus an all-day lane. The default view for a week at a glance.

**Layout**

Day-of-week header · All-Day Bar · time axis (Time Axis Labels) + 7 day columns of Time Slots · Event Chips · now indicator.

**Responsive**

Desktop full week grid; mobile reduces days or switches to Day / Agenda.

**States**

loaded, loading, empty, error; drag-to-create / move where supported.

**Accessibility**

Grid exposes date + time per cell; events focusable with start–end announced; keyboard navigation across days / times. Colour paired with labels.

**Rules**

Show the all-day lane separately  
Mark the current time  
Pair category colour with a label  
Offer Day / Agenda on mobile

Cram 7 columns onto mobile  
Rely on colour alone  
Hide overflowing events  
Lose keyboard access to events
