# Date Picker

> SOLAR Web · Figma page `↳ 🟢 Date Picker` (id `2163:3665`) · section `components/inputs` · raw data: [`raw/components/inputs/date-picker.json`](../../raw/components/inputs/date-picker.json)

## Component set: Day Cell

Single day cell used inside the Date Picker calendar grid. 6 variants by state: default, hover, focus, selected, today, disabled. selected is persistent (the chosen date); today is a visual marker on the current day even when not selected. today × selected compose at runtime — today wins for the marker, selected wins for the fill.

### Props

| Prop         | Type    | Options / default                                                          |
| ------------ | ------- | -------------------------------------------------------------------------- |
| `state`      | variant | **default** · hover · focus · selected · today · disabled · filled · error |
| `range-role` | variant | **none** · start · middle · end · preview-middle · preview-end             |
| `day`        | text    | default `15`                                                               |

Default variant: `state=default, range-role=none` · 13 variants · default size 36×36px

### Anatomy (default variant)

- **state=default, range-role=none** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
  radius `radius.container`
  - **Day** · text `body/md/medium` "15" · HUG/HUG · 15×10  
    fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←day

### Tokens used

| Role            | Tokens                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.surface.feedback.neutral.subtle`, `color.surface.hover`                         |
| Strokes         | `color.action.primary.border.default`, `color.border.feedback.focus.strong`, `color.border.medium`, `color.border.subtle` |
| Text color      | `color.action.primary.bg.default`, `color.action.primary.text.default`, `color.text.primary`, `color.text.tertiary`       |
| Radius          | `radius.container`                                                                                                        |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`                         |
| Effects         | `shadow/focus/default`                                                                                                    |
| Text styles     | `body/md/medium`                                                                                                          |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop  |
| ----- | ------------------- | ----- |
| Day   | characters          | `day` |

### Variant matrix

| state    | range-role     | size  | fill                                    | stroke                                | effect                 | text                                | icon |
| -------- | -------------- | ----- | --------------------------------------- | ------------------------------------- | ---------------------- | ----------------------------------- | ---- |
| default  | none           | 36×36 |                                         |                                       |                        | `color.text.primary`                |      |
| hover    | none           | 36×36 | `color.surface.hover`                   |                                       |                        | `color.text.primary`                |      |
| focus    | none           | 36×36 | `color.surface.hover`                   | `color.border.feedback.focus.strong`  | `shadow/focus/default` | `color.text.primary`                |      |
| selected | none           | 36×36 | `color.action.primary.bg.default`       |                                       |                        | `color.action.primary.text.default` |      |
| today    | none           | 36×36 |                                         | `color.border.medium`                 |                        | `color.action.primary.bg.default`   |      |
| disabled | none           | 36×36 |                                         |                                       |                        | `color.text.tertiary`               |      |
| filled   | none           | 36×36 |                                         |                                       |                        | `color.text.primary`                |      |
| error    | none           | 36×36 |                                         |                                       |                        | `color.text.primary`                |      |
| default  | start          | 36×36 | `color.action.primary.bg.default`       | `color.action.primary.border.default` |                        | `color.action.primary.text.default` |      |
| default  | middle         | 36×36 | `color.surface.feedback.neutral.subtle` |                                       |                        | `color.text.primary`                |      |
| default  | end            | 36×36 | `color.action.primary.bg.default`       | `color.action.primary.border.default` |                        | `color.action.primary.text.default` |      |
| default  | preview-middle | 36×36 | `color.surface.hover`                   |                                       |                        | `color.text.primary`                |      |
| default  | preview-end    | 36×36 | `color.surface.hover`                   | `color.border.subtle`                 |                        | `color.text.primary`                |      |

### Issues detected

- Description says 6 variants; the set has 13.
- State axis uses non-standard value(s): today.

## Component set: DatePicker

Time-of-day selector. 14 variants: size (sm 36px, md 44px) × state (default, hover, focused, filled, disabled, error, error-focused). NOTE: state `focused` / `error-focused` flagged for rename to match SOLAR's locked `focus`. Text input accepts typed times; paired TimePicker Dropdown presents hour/minute columns for click selection. 12h or 24h based on locale.

### Props

| Prop           | Type    | Options / default                                                       |
| -------------- | ------- | ----------------------------------------------------------------------- |
| `size`         | variant | **md** · sm                                                             |
| `state`        | variant | **default** · hover · focus · filled · disabled · error · error-focused |
| `value`        | text    | default `2026-05-11`                                                    |
| `helperText`   | text    | default `Helper text`                                                   |
| `showHelper`   | boolean | default `true`                                                          |
| `label`        | text    | default `Select Date`                                                   |
| `showLabel`    | boolean | default `true`                                                          |
| `showRequired` | boolean | default `false`                                                         |

Default variant: `size=md, state=default` · 14 variants · default size 123×76px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 HUG/HUG · 123×76  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 75×10  
    itemSpacing `inset.2xs` · prop visible←showLabel
    - **Label** · text `label/md` "Select Date" · HUG/HUG · 75×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←label
    - ~~**\***~~ (hidden by default) · text `label/md` "\*" · FIXED/FIXED · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←showRequired
  - **Field** · frame · row gap 8 pad 0/12/0/12 HUG/FIXED · 123×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **Icon/Calendar** · instance of **Icon/Calendar** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
    - **Value** · text `body/md/regular` "2026-05-11" · HUG/HUG · 75×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop characters←value
  - **Helper text** · text `helper/md` "Helper text" · FILL/HUG · 123×10  
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
| Label › \*    | visible             | `showRequired` |
| Field › Value | characters          | `value`        |
| Helper text   | visible             | `showHelper`   |
| Helper text   | characters          | `helperText`   |

### Composes

- Icon/Calendar

### Variant matrix

| size | state         | size   | fill | stroke | effect | text                                                 | icon                  |
| ---- | ------------- | ------ | ---- | ------ | ------ | ---------------------------------------------------- | --------------------- |
| md   | default       | 123×76 |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| sm   | default       | 97×66  |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| md   | hover         | 123×76 |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| sm   | hover         | 97×66  |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| md   | focus         | 123×76 |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| sm   | focus         | 97×66  |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| md   | filled        | 123×76 |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| sm   | filled        | 97×66  |      |        |        | `color.text.primary`<br>`color.text.secondary`       | `color.icon.primary`  |
| md   | disabled      | 123×76 |      |        |        | `color.text.primary`<br>`color.text.disabled`        | `color.icon.disabled` |
| sm   | disabled      | 97×66  |      |        |        | `color.text.primary`<br>`color.text.disabled`        | `color.icon.disabled` |
| md   | error         | 123×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.danger` | `color.icon.primary`  |
| sm   | error         | 97×66  |      |        |        | `color.text.primary`<br>`color.text.feedback.danger` | `color.icon.primary`  |
| md   | error-focused | 123×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.danger` | `color.icon.primary`  |
| sm   | error-focused | 97×66  |      |        |        | `color.text.primary`<br>`color.text.feedback.danger` | `color.icon.primary`  |

## Component set: Date Picker Open

### Props

| Prop     | Type    | Options / default    |
| -------- | ------- | -------------------- |
| `inline` | variant | true · **false**     |
| `type`   | variant | **single** · double  |
| `month`  | text    | default `April 2026` |

Default variant: `inline=false, type=single` · 3 variants · default size 300×285px

### Anatomy (default variant)

- **inline=false, type=single** · component · column gap 12 pad 12/12/12/12 HUG/HUG · 300×285  
  fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **MonthHeader** · frame · row gap 0 pad 0/0/0/0 FILL/FIXED · 276×32
    - **Icon/ArrowLeft** · instance of **Icon/ArrowLeft** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`
    - **MonthLabel** · text `body/md/medium` "April 2026" · FILL/HUG · 236×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←month
    - **Icon/ArrowRight** · instance of **Icon/ArrowRight** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`
  - **WeekdayRow** · frame · row gap 4 pad 0/0/0/0 FILL/HUG · 276×9  
    itemSpacing `inset.2xs`
    - **Weekday** · text `body/sm/medium` "Mo" · FILL/HUG · 36×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
    - **Weekday** · text `body/sm/medium` "Tu" · FILL/HUG · 36×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
    - **Weekday** · text `body/sm/medium` "We" · FILL/HUG · 36×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
    - **Weekday** · text `body/sm/medium` "Th" · FILL/HUG · 36×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
    - **Weekday** · text `body/sm/medium` "Fr" · FILL/HUG · 36×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
    - **Weekday** · text `body/sm/medium` "Sa" · FILL/HUG · 36×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
    - **Weekday** · text `body/sm/medium` "Su" · FILL/HUG · 36×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
  - **DayGrid** · frame · grid gap 0 pad 0/0/0/0 HUG/HUG · 276×196  
    gridRowGap `inset.2xs` · gridColumnGap `inset.2xs`
    - **Day Cell** · instance of **Day Cell** (state=disabled, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=disabled, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=today, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=selected, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      fill `color.action.primary.bg.default` · radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=default, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=disabled, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=disabled, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`
    - **Day Cell** · instance of **Day Cell** (state=disabled, range-role=none) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 36×36  
      radius `radius.container`

### Tokens used

| Role            | Tokens                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.surface.raised`                                                                                          |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                       |
| Text color      | `color.action.primary.bg.default`, `color.action.primary.text.default`, `color.text.primary`, `color.text.tertiary`                                |
| Icon color      | `color.action.tertiary.icon.default`                                                                                                               |
| Spacing         | `inset.2xs`, `inset.sm`, `stack.sm`                                                                                                                |
| Radius          | `radius.container`                                                                                                                                 |
| Border width    | `border.default`                                                                                                                                   |
| Sizes           | `icon.md`                                                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.size.body.md`, `type.size.body.sm` |
| Effects         | `shadow/overlay`                                                                                                                                   |
| Text styles     | `body/md/medium`, `body/sm/medium`                                                                                                                 |
| Other           | `gridColumnGap={Spatial:inset/2xs}`, `gridRowGap={Spatial:inset/2xs}`                                                                              |

### Slots and prop-controlled layers

| Layer                    | Controlled property | Prop    |
| ------------------------ | ------------------- | ------- |
| MonthHeader › MonthLabel | characters          | `month` |

### Composes

- Day Cell
- Icon/ArrowLeft
- Icon/ArrowRight

### Variant matrix

| inline | type   | size    | fill                   | stroke                | effect           | text                                                                                                                      | icon                                 |
| ------ | ------ | ------- | ---------------------- | --------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| false  | single | 300×285 | `color.surface.raised` | `color.border.subtle` | `shadow/overlay` | `color.text.primary`<br>`color.text.tertiary`<br>`color.action.primary.bg.default`<br>`color.action.primary.text.default` | `color.action.tertiary.icon.default` |
| true   | single | 300×285 |                        |                       |                  | `color.text.primary`<br>`color.text.tertiary`<br>`color.action.primary.bg.default`<br>`color.action.primary.text.default` | `color.action.tertiary.icon.default` |
| true   | double | 588×285 |                        |                       |                  | `color.text.primary`<br>`color.text.tertiary`<br>`color.action.primary.bg.default`<br>`color.action.primary.text.default` | `color.action.tertiary.icon.default` |

### Issues detected

- Component description is empty.

## Documentation card

**Description**

Calendar-driven date entry. The trigger is a text input that parses typed dates ("2026-04-21" or locale format); the calendar panel opens on focus for mouse pick. Type or click — both paths must work. For date ranges, compose two pickers with a connecting range highlight.

**Anatomy**

Date Picker Open  
┌ Month header (prev ◀ / Apr 2026 / ▶ next)  
┌ Weekday row (Mo Tu We Th Fr Sa Su)  
└ 6 × 7 Day Cell grid  
Day Cell states: default, hover, focus, selected, today, disabled.

**States (Day Cell)**

default resting day in the month.  
hover transient highlight.  
focus keyboard focus via shadow/focus/default.  
selected the chosen date, persistent.  
today today's date — marker, not selection.  
disabled outside min/max range or otherwise unselectable.

**Accessibility**

Trigger: `<input type="text">` (accepts typing) with a companion button opening the calendar — never rely on click-only. Calendar: role="dialog" with aria-label. Grid: role="grid" with rows/cells. Keyboard: ←/→/↑/↓ move day; Page Up/Down month; Shift+Page Up/Down year; Enter selects; Esc closes.

**Rules**

Do  
• Accept typed dates as well as calendar picks  
• Announce today's date and the current selection  
• Disable dates outside min/max — don't hide them  
• Flip panel position if it would clip the viewport

Don't  
• Don't force calendar-only — typing is faster for known dates  
• Don't confuse today with selected — today is a marker  
• Don't use relative dates in labels — show the absolute date  
• Don't require a specific format the input can't parse
