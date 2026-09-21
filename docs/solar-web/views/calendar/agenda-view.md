# Agenda View

> SOLAR Web · Figma page `↳ 🟢 Agenda View` (id `6802:4`) · section `views/calendar` · raw data: [`raw/views/calendar/agenda-view.json`](../../raw/views/calendar/agenda-view.json)

## Component: Agenda View

### Anatomy (default variant)

- **Agenda View** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1024×828  
  fill `color.surface.base`
  - **Calendar Toolbar** · instance of **Calendar Toolbar** · row gap 16 pad 12/16/12/16 FILL/HUG · 1024×56  
    fill `color.surface.base` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Calendar Body** · frame · column gap 16 pad 12/20/12/20 FILL/HUG · 1024×772  
    itemSpacing `stack.md` · padding `inset.lg`, `inset.sm`
    - **Agenda List** · frame · column gap 0 pad 0/0/0/0 FIXED/HUG · 800×356  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`
      - **Frame 1** · frame · row gap 8 pad 12/16/12/16 FILL/HUG · 800×36  
        stroke `color.border.subtle` mixedpx · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
        - **Today · Friday, April 17** · text `title/xs` "Today · Friday, April 17" · HUG/HUG · 161×12  
          fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500`
      - **Rows** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 800×320  
        padding `inset.none`
        - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 800×64  
          fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
        - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 800×64  
          fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
        - **Agenda Row** · instance of **Agenda Row** (state=selected, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 800×64  
          fill `color.surface.active` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
        - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 800×64  
          fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
        - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 800×64  
          fill `color.surface.base` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
    - **Agenda List** · frame · column gap 16 pad 20/20/20/20 FIXED/HUG · 800×376  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · padding `inset.lg` · radius `radius.container`
      - **Date Section** · frame · column gap 4 pad 0/0/0/0 FILL/HUG · 760×336
        - **Yesterday · Thursday, April 16** · text `title/xs` "Yesterday · Thursday, April 16" · HUG/HUG · 213×12  
          fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500`
        - **Rows** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 760×320  
          padding `inset.none`
          - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 760×64  
            fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
          - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 760×64  
            fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
          - **Agenda Row** · instance of **Agenda Row** (state=selected, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 760×64  
            fill `color.surface.active` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
          - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 760×64  
            fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
          - **Agenda Row** · instance of **Agenda Row** (state=default, density=comfortable) · row gap 16 pad 16/16/16/16 FILL/FIXED · 760×64  
            fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.active`, `color.surface.base`                                                        |
| Strokes         | `color.border.subtle`                                                                               |
| Text color      | `color.text.primary`                                                                                |
| Spacing         | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `stack.md`, `stack.none`                          |
| Radius          | `radius.container`                                                                                  |
| Border width    | `border.default`                                                                                    |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.xs`, `type.size.title.xs` |
| Text styles     | `title/xs`                                                                                          |

### Composes

- Agenda Row
- Calendar Toolbar

### Issues detected

- Component description is empty.
- Hard-coded gap `8px` on layer _Calendar Body › Agenda List › Frame 1_
- Hard-coded gap `16px` on layer _Calendar Body › Agenda List_
- Hard-coded gap `4px` on layer _Calendar Body › Agenda List › Date Section_

## Documentation card

**Description**

A chronological list of upcoming events (Agenda Rows) rather than a grid — best for scanning what's next. A good default on mobile.

**Layout**

Date-group headers · Agenda Rows (time · title · meta) · load-more / infinite scroll; per-range empty state.

**Responsive**

Desktop list; mobile full-width — the primary mobile calendar view.

**States**

loaded, loading, empty ('Nothing scheduled'), error, loading-more.

**Accessibility**

Ordered list grouped by day; each row reads time + title; keyboard-reachable. Colour paired with a label.

**Rules**

Group by day  
Lead with the time  
Show empty ranges clearly  
Prefer on mobile

Use grid semantics for a list  
Rely on colour alone  
Hide the date grouping  
Bury the title
