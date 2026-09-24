# Time Picker

> SOLAR Web · Figma page `↳ 🟢 Time Picker` (id `2163:3710`) · section `components/inputs` · raw data: [`raw/components/inputs/time-picker.json`](../../raw/components/inputs/time-picker.json)

## Component set: TimePicker

Time-of-day selector. 14 variants: size (sm, md) × state (default, hover, focus, filled, disabled, error, error-focused). The field itself is 32px (sm) / 40px (md); with label and helper the component measures 66 / 76px. Drawn heights are the visible control; the 44×44px WCAG hit area is padded in code (no target-size variable exists yet). NOTE: state error-focused is flagged to fold into error + focus in a breaking cut. Props: value, label, helperText (text), showLabel, showHelper, showRequired. Text input accepts typed times; paired TimePicker Dropdown presents hour/minute columns for click selection. 12h or 24h based on locale.

### Props

| Prop           | Type    | Options / default                                                       |
| -------------- | ------- | ----------------------------------------------------------------------- |
| `size`         | variant | **md** · sm                                                             |
| `state`        | variant | **default** · hover · focus · filled · disabled · error · error-focused |
| `value`        | text    | default `12:00 AM`                                                      |
| `helperText`   | text    | default `Helper text`                                                   |
| `showHelper`   | boolean | default `true`                                                          |
| `label`        | text    | default `Label`                                                         |
| `showLabel`    | boolean | default `true`                                                          |
| `showRequired` | boolean | default `false`                                                         |

Default variant: `size=md, state=default` · 14 variants · default size 114×76px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 HUG/HUG · 114×76  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 36×10  
    itemSpacing `inset.2xs` · prop visible←showLabel
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←label
    - ~~**\***~~ (hidden by default) · text `label/md` "\*" · FIXED/FIXED · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←showRequired
  - **Field** · frame · row gap 8 pad 0/12/0/12 HUG/FIXED · 114×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **Icon/Clock** · instance of **Icon/Clock** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
    - **Value** · text `body/md/regular` "12:00 AM" · FIXED/HUG · 66×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop characters←value
  - **Helper text** · text `helper/md` "Helper text" · FILL/HUG · 114×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←showHelper, characters←helperText

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                             |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`                                                                                                     |
| Icon color      | `color.icon.disabled`, `color.icon.primary`                                                                                                                                                                                       |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`, `stack.xs`                                                                                                                                                                     |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Sizes           | `icon.sm`                                                                                                                                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                                                                                                                                                  |
| Text styles     | `body/md/regular`, `helper/md`, `label/md`                                                                                                                                                                                        |

### Slots and prop-controlled layers

| Layer         | Controlled property | Prop           |
| ------------- | ------------------- | -------------- |
| Label         | visible             | `showLabel`    |
| Label › Label | characters          | `label`        |
| Label › *     | visible             | `showRequired` |
| Field › Value | characters          | `value`        |
| Helper text   | visible             | `showHelper`   |
| Helper text   | characters          | `helperText`   |

### Composes

- Icon/Clock

### Variant matrix

| size | state         | size   | fill | stroke | effect | text                                                 | icon                  |
| ---- | ------------- | ------ | ---- | ------ | ------ | ---------------------------------------------------- | --------------------- |
| md   | default       | 114×76 |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| sm   | default       | 88×66  |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| md   | hover         | 114×76 |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| sm   | hover         | 88×66  |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| md   | focus         | 114×76 |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| sm   | focus         | 88×66  |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| md   | filled        | 114×76 |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| sm   | filled        | 88×66  |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| md   | disabled      | 114×76 |      |        |        | `color.text.primary`<br>`color.text.disabled`        | `color.icon.disabled` |
| sm   | disabled      | 88×66  |      |        |        | `color.text.primary`<br>`color.text.disabled`        | `color.icon.disabled` |
| md   | error         | 114×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.danger` | `color.icon.primary`  |
| sm   | error         | 88×66  |      |        |        | `color.text.primary`<br>`color.text.feedback.danger` | `color.icon.primary`  |
| md   | error-focused | 114×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.danger` | `color.icon.primary`  |
| sm   | error-focused | 88×66  |      |        |        | `color.text.primary`<br>`color.text.feedback.danger` | `color.icon.primary`  |

## Component set: TimePicker Dropdown

Expanded panel for TimePicker. Hour column + minute column (optionally + AM/PM) presented as scrollable lists. 2 size variants (sm, md) matching the trigger field. Use Content slot for either scrollable columns or a clock face depending on product needs.

### Props

| Prop      | Type    | Options / default         |
| --------- | ------- | ------------------------- |
| `size`    | variant | sm · **md**               |
| `Content` | slot    | default `[object Object]` |

Default variant: `size=md` · 2 variants · default size 136×204px

### Anatomy (default variant)

- **size=md** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 136×204  
  fill `color.surface.overlay` · stroke `color.border.medium` 1px · effect `shadow/control` · padding `inset.none` · strokeWeight `border.default` · radius `radius.container`
  - **Content** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 136×204  
    itemSpacing `inset.none` · prop slotContentId←Content
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=selected) · row gap 8 pad 12/12/12/12 FILL/HUG · 136×34  
      fill `color.surface.active` · itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FILL/HUG · 136×34  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FILL/HUG · 136×34  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FILL/HUG · 136×34  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FILL/HUG · 136×34  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FILL/HUG · 136×34  
      itemSpacing `inset.xs` · padding `inset.sm`

### Tokens used

| Role         | Tokens                                          |
| ------------ | ----------------------------------------------- |
| Fills        | `color.surface.active`, `color.surface.overlay` |
| Strokes      | `color.border.medium`                           |
| Text color   | `color.text.primary`                            |
| Icon color   | `color.icon.inverse`, `color.icon.primary`      |
| Spacing      | `inset.none`, `inset.sm`, `inset.xs`            |
| Radius       | `radius.container`                              |
| Border width | `border.default`                                |
| Effects      | `shadow/control`                                |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop      |
| ------- | ------------------- | --------- |
| Content | slotContentId       | `Content` |

### Composes

- Dropdown Item

### Variant matrix

| size | size    | fill                    | stroke                | effect           | text                 | icon                                         |
| ---- | ------- | ----------------------- | --------------------- | ---------------- | -------------------- | -------------------------------------------- |
| md   | 136×204 | `color.surface.overlay` | `color.border.medium` | `shadow/control` | `color.text.primary` | `color.icon.inverse`<br>`color.icon.primary` |
| sm   | 136×192 | `color.surface.overlay` | `color.border.medium` | `shadow/control` | `color.text.primary` | `color.icon.inverse`<br>`color.icon.primary` |

## Documentation card

**Description**

Time-of-day selector. Trigger is a text input that parses typed times ("9:30 AM" / "21:30"); the dropdown panel opens with hour/minute columns for click picking. 12-hour or 24-hour format follows the user's locale. For date + time together, compose Date Picker + Time Picker side by side.

**Sizes & States**

size=sm (36px) / size=md (44px)  
States: default, hover, focused (flagged rename → focus), filled, disabled, error, error-focused (flagged rename → error+focus).

**Content**

Label: what time is being set ("Start time", "Meeting at"). Format: locale-driven; don't force 24h for a US audience or 12h for a European one. Helper text: timezone if relevant ("America/Los\_Angeles"). Error: plain language with the valid range.

**Accessibility**

Trigger: `<input type="text">` (also supports type="time"). Dropdown columns are role="listbox" with role="option" rows. Keyboard: type to filter; ↑/↓ changes values; Tab moves between columns; Enter confirms; Esc closes. Announce the full time on change via aria-live.

**Rules**

Do  
• Accept typed times as well as clicks  
• Follow locale for 12h vs 24h display  
• Show timezone in helper when it's not obvious  
• Keyboard-navigate hour/minute columns

Don't  
• Don't force one format globally — follow locale  
• Don't use seconds precision unless the domain needs it  
• Don't pair hours with a second entry for minutes — one field  
• Don't accept ambiguous formats without a visible parse
