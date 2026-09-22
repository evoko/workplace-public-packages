# Time Range Selector

> SOLAR Web · Figma page `↳ 🟢 Time Range Selector` (id `5113:14`) · section `patterns/dashboards` · raw data: [`raw/patterns/dashboards/time-range-selector.json`](../../raw/patterns/dashboards/time-range-selector.json)

## Component set: Time Range Selector

### Props

| Prop    | Type    | Options / default   |
| ------- | ------- | ------------------- |
| `state` | variant | hover · **default** |

Default variant: `state=default` · 2 variants · default size 268×40px

### Anatomy (default variant)

- **state=default** · component · row gap 12 pad 0/12/0/12 FILL/FIXED · 268×40  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
  - **Icon/Clock** · instance of **Icon/Clock** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm`
  - **Last 7 days** · text `body/md/medium` "Last 7 days" · HUG/HUG · 73×10  
    fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
  - **May 11 – May 18** · text `body/md/regular` "May 11 – May 18" · HUG/HUG · 103×10  
    fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Icon/ChevronDown** · instance of **Icon/ChevronDown** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm`

### Tokens used

| Role            | Tokens                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                      |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                              |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                              |
| Icon color      | `color.icon.primary`                                                                                                      |
| Spacing         | `inset.none`, `inset.sm`                                                                                                  |
| Radius          | `radius.control`                                                                                                          |
| Border width    | `border.default`                                                                                                          |
| Sizes           | `icon.sm`                                                                                                                 |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Effects         | `shadow/control`                                                                                                          |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                       |

### Composes

- Icon/ChevronDown
- Icon/Clock

### Variant matrix

| state   | size   | fill                 | stroke                | effect           | text                                           | icon                 |
| ------- | ------ | -------------------- | --------------------- | ---------------- | ---------------------------------------------- | -------------------- |
| default | 268×40 | `color.surface.base` | `color.border.subtle` | `shadow/control` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary` |
| hover   | 268×40 | `color.surface.base` | `color.border.medium` | `shadow/control` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary` |

### Issues detected

- Component description is empty.

## Component: Time Range

Base Dialog overlay container. Responsive — adapts to content width. Uses real Button, IconButton, and Divider component instances.

### Anatomy (default variant)

- **Time Range** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 824×571  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`
  - **Header** · frame · column gap 8 pad 8/8/8/8 FILL/HUG · 824×56  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default`
    - **Text** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 808×40
      - **Icon** · frame · row gap 8 pad 0/0/0/0 FIXED/FIXED · 36×36  
        itemSpacing `stack.xs`
      - **Title** · text `title/sm` "Time Range" · FILL/HUG · 732×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Icon Button** · instance of **Icon Button** (size=md, shape=round, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        fill `color.action.tertiary.bg.default` · strokeWeight `border.default` · radius `radius.pill`
  - **Container** · frame · row gap 0 pad 0/0/0/0 HUG/HUG · 824×515
    - **Tree** · frame · column gap 0 pad 12/8/12/8 FIXED/FILL · 200×515  
      fill `color.surface.background` · stroke `color.border.subtle` mixedpx · itemSpacing `inset.none` · padding `inset.xs`, `inset.sm`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=true, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        fill `color.surface.active` · itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Container** · frame · column gap 0 pad 0/0/0/0 HUG/HUG · 624×515
      - **Container** · frame · column gap 24 pad 24/24/24/24 FILL/HUG · 624×142  
        stroke `color.border.subtle` mixedpx · itemSpacing `inset.xl` · padding `inset.xl`
      - **Date Picker Open** · instance of **Date Picker Open** (inline=true, type=double) · row gap 24 pad 24/24/24/24 HUG/HUG · 624×309  
        padding `inset.xl` · strokeWeight `border.default` · radius `radius.none`
      - **Button Group** · instance of **Button Group** (orientation=horizontal, type=regular) · row gap 8 pad 12/12/12/12 FILL/HUG · 624×64  
        stroke `color.border.subtle` mixedpx · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default`

Instance census (tree capped at depth 3): Day Cell ×70, Icon/None ×23, StatusIndicator ×16, Counter ×11, Tree Item ×8, .Tree Indent ×8, Icon/ChevronRight ×8, Checkbox ×8, Tag ×8, Button ×3, Spinner ×3, DatePicker ×2, Icon/Calendar ×2, TimePicker ×2, Icon/Clock ×2, Icon/Empty ×1, Icon Button ×1, Icon/More ×1, Icon/Plus ×1, Date Picker Open ×1, Icon/ArrowLeft ×1, Icon/ArrowRight ×1, Button Group ×1

### Tokens used

| Role            | Tokens                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.tertiary.bg.default`, `color.surface.active`, `color.surface.background`, `color.surface.dialog` |
| Strokes         | `color.border.subtle`                                                                                          |
| Text color      | `color.text.primary`                                                                                           |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.xs`                                      |
| Radius          | `radius.control`, `radius.dialog`, `radius.none`, `radius.pill`                                                |
| Border width    | `border.default`                                                                                               |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.sm`, `type.size.title.sm`            |
| Effects         | `shadow/dialog`                                                                                                |
| Text styles     | `title/sm`                                                                                                     |

### Composes

- Button Group
- Date Picker Open
- Icon Button
- Tree Item

## Documentation card

**Description**

A control for choosing the time window of a dashboard or report — presets plus a custom range. Drives the data shown; not a single date field.

**Anatomy**

Preset options (Today · 7d · 30d …) · custom-range trigger · Date Picker popover · optional comparison toggle · applied-range label.

**Behaviour**

Presets apply instantly; custom opens a range Date Picker. Selection updates all bound widgets. Optional 'compare to previous period'.

**States**

default, open (popover), custom-active; loading while data refreshes; disabled. The applied range is always visible on the trigger.

**Accessibility**

Presets form a radio group; the custom trigger opens a labelled popover. Announce the applied range. Keyboard: arrows across presets + full Date Picker a11y.

**Rules**

Offer sensible presets  
Show the applied range on the trigger  
Apply to all bound widgets  
Support keyboard + Date Picker a11y

Hide which range is active  
Make custom the only option  
Reset on every interaction  
Rely on colour for the active preset
