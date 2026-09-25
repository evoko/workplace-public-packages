# Day View

> SOLAR Web · Figma page `↳ 🟢 Day View` (id `6802:3`) · section `views/calendar` · raw data: [`raw/views/calendar/day-view.json`](../../raw/views/calendar/day-view.json)

## Component: Day View

### Anatomy (default variant)

- **Day View** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1024×724  
  fill `color.surface.base`
  - **Calendar Toolbar** · instance of **Calendar Toolbar** · row gap 16 pad 12/16/12/16 FILL/HUG · 1024×56  
    fill `color.surface.base` · itemSpacing `inset.md` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Calendar Body** · frame · row gap 16 pad 12/20/12/20 FILL/HUG · 1024×668  
    itemSpacing `inset.md` · padding `inset.lg`, `inset.sm`
    - **Side Rail** · frame · column gap 16 pad 0/0/0/0 HUG/HUG · 300×561  
      itemSpacing `inset.md`
      - **Date Picker Open** · instance of **Date Picker Open** (inline=false, type=single) · column gap 12 pad 12/12/12/12 HUG/HUG · 300×285  
        fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
      - **Up Next** · frame · column gap 8 pad 16/16/16/16 FIXED/HUG · 300×260  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `inset.xs` · padding `inset.md` · radius `radius.container`
        - **Up Next** · text `title/xs` "Up Next" · HUG/HUG · 59×12  
          fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500`
        - **Agenda Row** · instance of **Agenda Row** (state=selected, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 268×64  
          fill `color.surface.active` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
        - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 268×64  
          fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
        - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 268×64  
          fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
    - **Calendar Surface** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 668×644  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · radius `radius.container`
      - **Header Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 668×36  
        stroke `color.border.subtle` mixedpx
        - **Frame** · frame · FIXED/FIXED · 60×36
        - **Frame** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 608×36  
          stroke `color.border.subtle` mixedpx
          - **Weekday Header** · instance of **Weekday Header** (emphasis=today) · row gap 0 pad 12/12/12/12 FILL/FIXED · 608×36  
            fill `color.surface.base` · stroke `color.border.surface` mixedpx · padding `inset.sm` · strokeWeight `border.none`, `border.default`
      - **All-Day Strip** · frame · row gap 0 pad 4/0/4/0 FILL/HUG · 668×32  
        stroke `color.border.subtle` mixedpx · padding `inset.2xs`
        - **Frame** · frame · row gap 0 pad 4/8/4/8 FIXED/HUG · 60×17  
          padding `inset.xs`, `inset.2xs`
          - **All day** · text `label/sm` "All day" · HUG/HUG · 38×9  
            fill `color.text.secondary` · lineHeight `type.line-height.label.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.label.sm` · fontStyle `type.font-weight.500`
        - **Frame** · frame · column gap 2 pad 0/4/0/4 FILL/HUG · 608×24  
          stroke `color.border.subtle` mixedpx · padding `inset.2xs`
          - **All-Day Bar** · instance of **All-Day Bar** (style=subtle, span=single) · row gap 0 pad 0/0/0/0 FILL/FIXED · 600×22  
            radius `radius.none`
      - **Time Grid Row** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 668×576
        - **Time Axis** · frame · column gap 0 pad 0/0/0/0 FIXED/FILL · 60×576
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=now, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
          - **Time Axis Label** · instance of **Time Axis Label** (emphasis=default, density=comfortable) · row gap 0 pad 0/12/0/12 FILL/FIXED · 60×48  
            fill `color.surface.base` · padding `inset.sm`
        - **Day Col** · frame · FILL/FIXED · 608×576  
          stroke `color.border.subtle` mixedpx
          - **Slot Stack** · frame · column gap 0 pad 0/0/0/0 FIXED/FIXED · 884×576
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
            - **Time Slot** · instance of **Time Slot** (state=default, density=comfortable) · FILL/FIXED · 884×48  
              fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
          - **Event Chip** · instance of **Event Chip** (category=blue, style=solid) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 868×22  
            fill `color.data.category.06.strong` · radius `radius.control`
          - **Event Chip** · instance of **Event Chip** (category=purple, style=subtle) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 868×46  
            radius `radius.none`
          - **Event Chip** · instance of **Event Chip** (category=yellow, style=subtle) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 868×46  
            radius `radius.none`
          - **Event Chip** · instance of **Event Chip** (category=red, style=solid) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 868×94  
            fill `color.data.category.01.strong` · radius `radius.control`
          - **Event Chip** · instance of **Event Chip** (category=blue, style=subtle) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 868×46  
            radius `radius.none`
          - **Event Chip** · instance of **Event Chip** (category=purple, style=tinted) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 868×46  
            fill `color.data.category.07.subtle` · radius `radius.control`
          - **Now Indicator** · rectangle · 884×2  
            fill `color.action.primary.bg.default`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.data.category.01.strong`, `color.data.category.06.strong`, `color.data.category.07.subtle`, `color.surface.active`, `color.surface.base`, `color.surface.raised` |
| Strokes         | `color.border.subtle`, `color.border.surface`                                                                                                                                                              |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                                                               |
| Spacing         | `inset.2xs`, `inset.lg`, `inset.md`, `inset.sm`, `inset.xs`, `stack.md`, `stack.sm`                                                                                                                        |
| Radius          | `radius.container`, `radius.control`, `radius.none`                                                                                                                                                        |
| Border width    | `border.default`, `border.none`                                                                                                                                                                            |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.sm`, `type.line-height.title.xs`, `type.size.label.sm`, `type.size.title.xs`                                                     |
| Effects         | `shadow/overlay`                                                                                                                                                                                           |
| Text styles     | `label/sm`, `title/xs`                                                                                                                                                                                     |

### Composes

- Agenda Row
- All-Day Bar
- Calendar Toolbar
- Date Picker Open
- Event Chip
- Time Axis Label
- Time Slot
- Weekday Header

### Issues detected

- Component description is empty.
- Hard-coded gap `2px` on layer _Calendar Body › Calendar Surface › All-Day Strip › Frame_

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
