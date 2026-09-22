# Year View

> SOLAR Web · Figma page `↳ 🟢 Year View` (id `6802:6`) · section `views/calendar` · raw data: [`raw/views/calendar/year-view.json`](../../raw/views/calendar/year-view.json)

## Component: Year View

### Anatomy (default variant)

- **Year View** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1280×679  
  fill `color.surface.base`
  - **Calendar Toolbar** · instance of **Calendar Toolbar** · row gap 16 pad 12/16/12/16 FILL/HUG · 1280×56  
    fill `color.surface.base` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Calendar Body** · frame · column gap 0 pad 12/20/12/20 FILL/HUG · 1280×623  
    padding `inset.lg`, `inset.sm`
    - **Year Grid** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 1240×599  
      itemSpacing `inset.md`
      - **Mini Month Row** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 1240×189  
        itemSpacing `inset.md`
      - **Mini Month Row** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 1240×189  
        itemSpacing `inset.md`
      - **Mini Month Row** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 1240×189  
        itemSpacing `inset.md`

Instance census (tree capped at depth 3): Icon/None ×17, Segmented Control Item ×6, Icon Button ×2, Button ×2, Spinner ×2, Counter ×2, Calendar Toolbar ×1, Segmented Control ×1, Icon/Plus ×1

### Tokens used

| Role         | Tokens                             |
| ------------ | ---------------------------------- |
| Fills        | `color.surface.base`               |
| Spacing      | `inset.lg`, `inset.md`, `inset.sm` |
| Border width | `border.default`                   |

### Composes

- Calendar Toolbar

### Issues detected

- Component description is empty.

## Documentation card

**Description**

A 12-month overview grid — a mini-calendar per month with event-density indicators. For long-range navigation, not event detail.

**Layout**

12 month mini-grids · day cells with density dots / heat · header (year · nav) · click a day or month to drill in.

**Responsive**

Desktop 3–4 month columns; mobile fewer columns with vertical scroll.

**States**

loaded, loading, empty, error; today highlighted.

**Accessibility**

Each day is a labelled button with date + event count; density conveyed by number + shade, not colour alone; keyboard grid navigation.

**Rules**

Use for long-range navigation  
Drill into month / day  
Show today  
Convey density by number + shade

Show event detail here  
Rely on heat colour alone  
Lose keyboard navigation  
Cram 12 months on mobile
