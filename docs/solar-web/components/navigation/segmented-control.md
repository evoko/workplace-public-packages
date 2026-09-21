# Segmented Control

> SOLAR Web · Figma page `↳ 🟢 Segmented Control` (id `2163:3704`) · section `components/navigation` · raw data: [`raw/components/navigation/segmented-control.json`](../../raw/components/navigation/segmented-control.json)

## Component set: Segmented Control Item

Single segment inside Segmented Control. 4 variants: selected (false/true) × state (default, hover). Selection is persistent — a click commits, not previews. Optional leading/trailing icons via boolean instance-swap. Only default and hover states are defined here; pressed/focus/disabled are handled by the parent assembly treating the segment as a radio.

### Props

| Prop                 | Type    | Options / default   |
| -------------------- | ------- | ------------------- |
| `selected`           | variant | false · **true**    |
| `state`              | variant | **default** · hover |
| `size`               | variant | **md** · sm         |
| `show icon-leading`  | boolean | default `true`      |
| `show icon-trailing` | boolean | default `true`      |

Default variant: `selected=true, state=default, size=md` · 8 variants · default size 108×32px

### Anatomy (default variant)

- **selected=true, state=default, size=md** · component · row gap 8 pad 0/12/0/12 HUG/FIXED · 108×32  
  fill `color.surface.overlay` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    itemSpacing `stack.xs` · height `icon.sm` · prop visible←show icon-leading
  - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
    fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    itemSpacing `stack.xs` · height `icon.sm` · prop visible←show icon-trailing

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.overlay`                                                                             |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                        |
| Text color      | `color.text.primary`, `color.text.secondary`                                                        |
| Icon color      | `color.icon.primary`, `color.icon.secondary`                                                        |
| Spacing         | `inset.sm`, `inset.xs`, `stack.xs`                                                                  |
| Radius          | `radius.control`                                                                                    |
| Border width    | `border.default`                                                                                    |
| Sizes           | `icon.sm`                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                    |
| Text styles     | `label/md`                                                                                          |

### Slots and prop-controlled layers

| Layer     | Controlled property | Prop                 |
| --------- | ------------------- | -------------------- |
| Icon/None | visible             | `show icon-leading`  |
| Icon/None | visible             | `show icon-trailing` |

### Composes

- Icon/None

### Variant matrix

| selected | state   | size | size   | fill                    | stroke                | effect           | text                   | icon                   |
| -------- | ------- | ---- | ------ | ----------------------- | --------------------- | ---------------- | ---------------------- | ---------------------- |
| true     | default | md   | 108×32 | `color.surface.overlay` | `color.border.subtle` | `shadow/control` | `color.text.primary`   | `color.icon.primary`   |
| true     | hover   | md   | 108×32 | `color.surface.overlay` | `color.border.medium` | `shadow/control` | `color.text.primary`   | `color.icon.primary`   |
| false    | default | md   | 108×32 |                         |                       |                  | `color.text.secondary` | `color.icon.secondary` |
| false    | hover   | md   | 108×32 |                         |                       |                  | `color.text.primary`   | `color.icon.primary`   |
| true     | default | sm   | 87×24  | `color.surface.overlay` | `color.border.subtle` | `shadow/control` | `color.text.primary`   | `color.icon.primary`   |
| true     | hover   | sm   | 87×24  | `color.surface.overlay` | `color.border.medium` | `shadow/control` | `color.text.primary`   | `color.icon.primary`   |
| false    | default | sm   | 87×24  |                         |                       |                  | `color.text.secondary` | `color.icon.secondary` |
| false    | hover   | sm   | 87×24  |                         |                       |                  | `color.text.primary`   | `color.icon.primary`   |

### Issues detected

- Description says 4 variants; the set has 8.

## Component set: Segmented Control

### Props

| Prop             | Type    | Options / default         |
| ---------------- | ------- | ------------------------- |
| `size`           | variant | **md** · sm               |
| `show helper`    | boolean | default `false`           |
| `show mandatory` | boolean | default `true`            |
| `label`          | text    | default `Label`           |
| `helper`         | text    | default `Helper text`     |
| `Track`          | slot    | default `[object Object]` |

Default variant: `size=md` · 2 variants · default size 368×40px

### Anatomy (default variant)

- **size=md** · component · column gap 8 pad 0/0/0/0 HUG/HUG · 368×40
  - ~~**Label**~~ (hidden by default) · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 48×10
    - ~~**Label**~~ (hidden by default) · text `label/md` "Label" · FIXED/FIXED · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←label
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←show mandatory
  - **Track** · slot · row gap 0 pad 4/4/4/4 FILL/HUG · 368×40  
    fill `color.surface.background` · itemSpacing `inset.none` · padding `inset.2xs` · radius `radius.container` · prop slotContentId←Track
    - **Segmented Control Item** · instance of **Segmented Control Item** (selected=true, state=default, size=md) · row gap 8 pad 0/12/0/12 HUG/FIXED · 60×32  
      fill `color.surface.overlay` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Segmented Control Item** · instance of **Segmented Control Item** (selected=false, state=default, size=md) · row gap 8 pad 0/12/0/12 HUG/FIXED · 60×32  
      itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Segmented Control Item** · instance of **Segmented Control Item** (selected=false, state=default, size=md) · row gap 8 pad 0/12/0/12 HUG/FIXED · 60×32  
      itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Segmented Control Item** · instance of **Segmented Control Item** (selected=false, state=default, size=md) · row gap 8 pad 0/12/0/12 HUG/FIXED · 60×32  
      itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Segmented Control Item** · instance of **Segmented Control Item** (selected=false, state=default, size=md) · row gap 8 pad 0/12/0/12 HUG/FIXED · 60×32  
      itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Segmented Control Item** · instance of **Segmented Control Item** (selected=false, state=default, size=md) · row gap 8 pad 0/12/0/12 HUG/FIXED · 60×32  
      itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
  - ~~**Helper text**~~ (hidden by default) · text `helper/md` "Helper text" · FIXED/FIXED · 71×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←show helper, characters←helper

### Tokens used

| Role            | Tokens                                                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.overlay`                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                            |
| Text color      | `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`                                                                                                         |
| Icon color      | `color.icon.primary`, `color.icon.secondary`                                                                                                                                     |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`                                                                                                                                |
| Radius          | `radius.container`, `radius.control`                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                                 |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                                                                                                 |
| Text styles     | `helper/md`, `label/md`                                                                                                                                                          |

### Slots and prop-controlled layers

| Layer         | Controlled property | Prop             |
| ------------- | ------------------- | ---------------- |
| Label › Label | characters          | `label`          |
| Label › \*    | visible             | `show mandatory` |
| Track         | slotContentId       | `Track`          |
| Helper text   | visible             | `show helper`    |
| Helper text   | characters          | `helper`         |

### Composes

- Segmented Control Item

### Variant matrix

| size | size   | fill | stroke | effect | text                                                                         | icon                                           |
| ---- | ------ | ---- | ------ | ------ | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| md   | 368×40 |      |        |        | `color.text.feedback.info`<br>`color.text.primary`<br>`color.text.secondary` | `color.icon.primary`<br>`color.icon.secondary` |
| sm   | 290×32 |      |        |        | `color.text.feedback.info`<br>`color.text.primary`<br>`color.text.secondary` | `color.icon.primary`<br>`color.icon.secondary` |

### Issues detected

- Component description is empty.
- Hard-coded gap `8px` on layer _size=md_
- Hard-coded gap `4px` on layer _Label_

## Documentation card

**When to use**

Use Segmented Control for 2–5 mutually exclusive views that share real-estate and benefit from being visible at once.  
For 6+ options or peer navigation that shares URL-space, use Tabs.  
For pure on/off, use Toggle.  
For multi-select filtering, use Chip group.

**Labels & Icons**

Labels: 1–2 words, title case. Parallel grammar across segments ("List / Grid", not "List / Grid view"). Icons optional, leading only for simple cases — leading + trailing on the same segment is overloaded. Keep segment widths equal by default.

**Rules**

Do  
• Keep options to 2–5 — more, use Tabs  
• Use parallel, scannable labels  
• Commit on click, don't require a confirm  
• Make the selected segment unambiguous at a glance

Don't  
• Don't use for multi-select — switch to Chip group  
• Don't stack vertically — Segmented Control is inline-only  
• Don't overload with leading + trailing icons  
• Don't use for on/off — that's Toggle
