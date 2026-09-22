# Select

> SOLAR Web · Figma page `↳ 🟢 Select` (id `5295:2`) · section `components/inputs` · raw data: [`raw/components/inputs/select.json`](../../raw/components/inputs/select.json)

## Component set: Select

Dropdown selector for picking one option from a predefined list. 12 variants: size (sm 36px, md 44px) × state (default, hover, focus, open, disabled, error). Trailing chevron rotates when open. Use when options are < ~7 — beyond that, switch to Autocomplete for typeahead, or a multi-select pattern. SelectOpen (sibling component) is the expanded panel.

### Props

| Prop                 | Type    | Options / default                                     |
| -------------------- | ------- | ----------------------------------------------------- |
| `size`               | variant | **md** · sm                                           |
| `state`              | variant | **default** · hover · open · disabled · error · focus |
| `show label`         | boolean | default `true`                                        |
| `show helper`        | boolean | default `true`                                        |
| `show mandatory`     | boolean | default `true`                                        |
| `show trailing icon` | boolean | default `true`                                        |
| `label`              | text    | default `Label`                                       |
| `helper`             | text    | default `Helper text`                                 |

Default variant: `size=md, state=default` · 12 variants · default size 240×76px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 FIXED/HUG · 240×76  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 FILL/HUG · 240×10  
    itemSpacing `stack.2xs` · padding `inset.none` · prop visible←show label
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←label
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←show mandatory
  - **Field** · frame · row gap 12 pad 0/12/0/12 FILL/FIXED · 240×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **Placeholder** · text `body/md/regular` "Placeholder" · FILL/HUG · 188×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Icon/ChevronDown** · instance of **Icon/ChevronDown** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm` · prop visible←show trailing icon
  - **Helper text** · text `helper/md` "Helper text" · HUG/HUG · 71×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←show helper, characters←helper

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                             |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`                                                                                                     |
| Icon color      | `color.icon.disabled`, `color.icon.primary`                                                                                                                                                                                       |
| Spacing         | `inset.none`, `inset.sm`, `stack.2xs`, `stack.xs`                                                                                                                                                                                 |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Sizes           | `icon.sm`                                                                                                                                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`, `shadow/focus/default`                                                                                                                                                                                          |
| Text styles     | `body/md/regular`, `helper/md`, `label/md`                                                                                                                                                                                        |

### Slots and prop-controlled layers

| Layer                    | Controlled property | Prop                 |
| ------------------------ | ------------------- | -------------------- |
| Label                    | visible             | `show label`         |
| Label › Label            | characters          | `label`              |
| Label › *                | visible             | `show mandatory`     |
| Field › Icon/ChevronDown | visible             | `show trailing icon` |
| Helper text              | visible             | `show helper`        |
| Helper text              | characters          | `helper`             |

### Composes

- Icon/ChevronDown

### Variant matrix

| size | state    | size   | fill | stroke | effect                 | text                                                                               | icon                                          |
| ---- | -------- | ------ | ---- | ------ | ---------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| md   | default  | 240×76 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`       | `color.icon.primary`                          |
| md   | hover    | 240×76 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`       | `color.icon.primary`                          |
| md   | open     | 240×58 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.disabled`        | `color.icon.primary`<br>`color.icon.disabled` |
| md   | disabled | 240×76 |      |        |                        | `color.text.disabled`                                                              | `color.icon.disabled`                         |
| md   | error    | 240×76 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.danger` | `color.icon.primary`                          |
| sm   | default  | 200×66 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`       | `color.icon.primary`                          |
| sm   | hover    | 200×66 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`       | `color.icon.primary`                          |
| sm   | open     | 200×49 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`                                 | `color.icon.primary`                          |
| sm   | disabled | 200×66 |      |        |                        | `color.text.disabled`                                                              | `color.icon.disabled`                         |
| sm   | error    | 200×66 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.danger` | `color.icon.primary`                          |
| md   | focus    | 240×76 |      |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`       | `color.icon.primary`                          |
| sm   | focus    | 200×66 |      |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`       | `color.icon.primary`                          |

## Documentation card

**Description**

A control for choosing one option from a predefined list. Use for known, mutually-exclusive choices. For free text use Text Input; for large or searchable sets use Autocomplete.

**Usage**

Use for 4+ known options. For 2–3 visible options prefer Radio or Segmented Control. Provide a sensible default or a placeholder.

**States**

Default · Hover · Open · Focus  
Disabled — muted.  
Error — no/invalid selection; message + aria-invalid.

**Sizes**

sm (36px) Dense forms.  
md (44px) Default. Meets the 44px touch target.

**Accessibility**

role=combobox/listbox with aria-expanded. Full keyboard support: arrows, type-ahead, Enter, Esc. Selected option is announced.

**Rules**

- DO: Use for known, exclusive choices
- DO: Provide a default or placeholder
- DO: Support keyboard + type-ahead
- DO: Surface errors inline

- DON'T: Use for free text
- DON'T: Use for 2–3 options (prefer Radio)
- DON'T: Rely on colour alone for errors
- DON'T: Nest complex content in options
