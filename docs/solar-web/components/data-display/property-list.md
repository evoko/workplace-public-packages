# Property List

> SOLAR Web · Figma page `↳ 🟢 Property List` (id `5295:3`) · section `components/data-display` · raw data: [`raw/components/data-display/property-list.json`](../../raw/components/data-display/property-list.json)

## Component set: PropertyRow

One label–value row inside Property List — optional leading icon, label, optional description and a trailing control. 14 variants: in-card (false, true) × trailing (none, action, toggle, select, icon-button, segmented-control, tag). Props: label, description (text), hasDescription, hasLeading + leading (instance swap), hasTrailing. Renders as `<dt>`/`<dd>`; the trailing control carries its own interaction states. For editable fields use Form Row.

### Props

| Prop             | Type          | Options / default                                                           |
| ---------------- | ------------- | --------------------------------------------------------------------------- |
| `in-card`        | variant       | **false** · true                                                            |
| `trailing`       | variant       | **action** · toggle · select · icon-button · segmented-control · none · tag |
| `label`          | text          | default `Label`                                                             |
| `description`    | text          | default `Description text`                                                  |
| `hasDescription` | boolean       | default `true`                                                              |
| `hasLeading`     | boolean       | default `true`                                                              |
| `hasTrailing`    | boolean       | default `true`                                                              |
| `leading`        | instance swap | default `10148:444`                                                         |

Default variant: `in-card=false, trailing=action` · 14 variants · default size 505×64px

### Anatomy (default variant)

- **in-card=false, trailing=action** · component · row gap 16 pad 12/0/12/0 FIXED/HUG · 505×64  
  itemSpacing `stack.md` · padding `inset.sm`
  - **Leading** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 24×24  
    width `icon.lg` · prop visible←hasLeading, mainComponent←leading
  - **Text** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 369×32  
    itemSpacing `inset.sm` · padding `inset.none`
    - **Label** · text `body/md/medium` "Label" · FILL/HUG · 369×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←label
    - **Description** · text `body/md/regular` "Description text" · FILL/HUG · 369×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop visible←hasDescription, characters←description
  - **Trailing** · frame · row gap 0 pad 0/0/0/0 HUG/HUG · 80×40  
    prop visible←hasTrailing
    - **Button** · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
      fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role            | Tokens                                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.default`                                                                                                                                                 |
| Strokes         | `color.action.secondary.border.default`                                                                                                                                             |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.primary`, `color.text.secondary` |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                                                                 |
| Spacing         | `inset.none`, `inset.sm`, `inset.xs`, `stack.md`                                                                                                                                    |
| Radius          | `radius.control`                                                                                                                                                                    |
| Border width    | `border.default`                                                                                                                                                                    |
| Sizes           | `icon.lg`                                                                                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`                                                           |
| Effects         | `shadow/control`                                                                                                                                                                    |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                                                                                 |

### Slots and prop-controlled layers

| Layer              | Controlled property | Prop             |
| ------------------ | ------------------- | ---------------- |
| Leading            | visible             | `hasLeading`     |
| Leading            | mainComponent       | `leading`        |
| Text › Label       | characters          | `label`          |
| Text › Description | visible             | `hasDescription` |
| Text › Description | characters          | `description`    |
| Trailing           | visible             | `hasTrailing`    |

### Composes

- Button
- Icon/None

### Variant matrix

| in-card | trailing          | size   | fill | stroke | effect | text                                                                                                                           | icon                                                          |
| ------- | ----------------- | ------ | ---- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| false   | action            | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.primary`<br>`color.action.secondary.icon.default` |
| true    | action            | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.primary`<br>`color.action.secondary.icon.default` |
| false   | toggle            | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`                                                                                 | `color.icon.primary`                                          |
| true    | toggle            | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`                                                                                 | `color.icon.primary`                                          |
| false   | select            | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.info`                                                   | `color.icon.primary`                                          |
| true    | select            | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.info`                                                   | `color.icon.primary`                                          |
| false   | icon-button       | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`                                                                                 | `color.icon.primary`<br>`color.action.secondary.icon.default` |
| true    | icon-button       | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`                                                                                 | `color.icon.primary`<br>`color.action.secondary.icon.default` |
| false   | segmented-control | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.info`                                                   | `color.icon.primary`<br>`color.icon.secondary`                |
| true    | segmented-control | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.info`                                                   | `color.icon.primary`<br>`color.icon.secondary`                |
| false   | none              | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`                                                                                 | `color.icon.primary`                                          |
| true    | none              | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`                                                                                 | `color.icon.primary`                                          |
| false   | tag               | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.neutral`                                                | `color.icon.primary`                                          |
| true    | tag               | 505×64 |      |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.neutral`                                                | `color.icon.primary`                                          |

## Component set: PropertyList

Container for the read-only key–value pairs of an entity, built from PropertyRow instances. 2 variants: in-card (false, true) — true removes the outer chrome for placement inside Card or Detail Side Panel. items is a slot. Renders as a description list (`<dl>`) so label and value stay programmatically paired. For editable fields use Form Section; for tabular data use Table.

### Props

| Prop      | Type    | Options / default         |
| --------- | ------- | ------------------------- |
| `in-card` | variant | false · **true**          |
| `items`   | slot    | default `[object Object]` |

Default variant: `in-card=true` · 2 variants · default size 560×259px

### Anatomy (default variant)

- **in-card=true** · component · column gap 0 pad 0/0/0/0 FILL/HUG · 560×259  
  fill `color.surface.raised` · stroke `color.border.subtle` 1px · padding `inset.none` · radius `radius.container`
  - **items** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 560×259  
    prop slotContentId←items
    - **PropertyRow** · instance of **PropertyRow** (in-card=true, trailing=action) · row gap 16 pad 12/16/12/16 FILL/HUG · 560×64  
      itemSpacing `stack.md` · padding `inset.md`, `inset.sm`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 560×1
    - **PropertyRow** · instance of **PropertyRow** (in-card=true, trailing=toggle) · row gap 16 pad 12/16/12/16 FILL/HUG · 560×64  
      itemSpacing `stack.md` · padding `inset.md`, `inset.sm`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 560×1
    - **PropertyRow** · instance of **PropertyRow** (in-card=true, trailing=select) · row gap 16 pad 12/16/12/16 FILL/HUG · 560×64  
      itemSpacing `stack.md` · padding `inset.md`, `inset.sm`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 560×1
    - **PropertyRow** · instance of **PropertyRow** (in-card=true, trailing=icon-button) · row gap 16 pad 12/16/12/16 FILL/HUG · 560×64  
      itemSpacing `stack.md` · padding `inset.md`, `inset.sm`

### Tokens used

| Role       | Tokens                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills      | `color.surface.raised`                                                                                                                               |
| Strokes    | `color.border.subtle`                                                                                                                                |
| Text color | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary` |
| Icon color | `color.action.secondary.icon.default`, `color.icon.primary`                                                                                          |
| Spacing    | `inset.md`, `inset.none`, `inset.sm`, `stack.md`                                                                                                     |
| Radius     | `radius.container`                                                                                                                                   |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop    |
| ----- | ------------------- | ------- |
| items | slotContentId       | `items` |

### Composes

- Divider
- PropertyRow

### Variant matrix

| in-card | size    | fill                   | stroke                | effect | text                                                                                                                                                         | icon                                                          |
| ------- | ------- | ---------------------- | --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| true    | 560×259 | `color.surface.raised` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.feedback.info` | `color.icon.primary`<br>`color.action.secondary.icon.default` |
| false   | 560×259 |                        |                       |        | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.feedback.info` | `color.icon.primary`<br>`color.action.secondary.icon.default` |

## Documentation card

**Description**

Displays key–value pairs for an entity — labels beside values. For read-only detail summaries; use a form when the fields are editable.

**Anatomy**

Rows of label + value · optional group headings · spacing or dividers between rows.

**Layout**

Two-column (label / value) on wide, stacked on narrow. Labels use text.secondary, values text.primary. Right-align numeric values.

**States**

default (loaded), loading (skeleton rows), empty. Values may truncate with a tooltip. Non-interactive unless a value is a link or action.

**Accessibility**

Render as a description list (`<dl>`/`<dt>`/`<dd>`) so label↔value stays programmatic. Text ≥4.5:1. Never convey status by value colour alone.

**Rules**

Use for read-only detail  
Group related properties  
Keep labels terse  
Right-align numeric values

Use for editing (use a form)  
Bury key facts  
Colour-code without a label  
Wrap values unpredictably
