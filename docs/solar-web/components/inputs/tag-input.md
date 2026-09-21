# Tag Input

> SOLAR Web · Figma page `↳ 🟢 Tag Input` (id `8815:2`) · section `components/inputs` · raw data: [`raw/components/inputs/tag-input.json`](../../raw/components/inputs/tag-input.json)

## Component set: Token Input

Multi-value (token) input. Collects discrete entries as removable Token chips with an optional overflow Counter. Class B form input. Variants: size (md, sm) × state (default, hover, focus, filled, disabled, error, readonly). Properties: label, helper, show label, show helper, show mandatory. Built from SOLAR Web primitives; chips = local .Token; counter = Counter.

### Props

| Prop             | Type    | Options / default                                                           |
| ---------------- | ------- | --------------------------------------------------------------------------- |
| `size`           | variant | **md** · sm                                                                 |
| `state`          | variant | **default** · hover · focus · filled · disabled · error · readonly · active |
| `label`          | text    | default `Label`                                                             |
| `helper`         | text    | default `Helper text`                                                       |
| `show label`     | boolean | default `true`                                                              |
| `show helper`    | boolean | default `true`                                                              |
| `show mandatory` | boolean | default `true`                                                              |
| `Tags`           | slot    | default `[object Object]`                                                   |

Default variant: `size=md, state=default` · 16 variants · default size 240×76px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 FIXED/HUG · 240×76  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 FILL/HUG · 240×10  
    itemSpacing `inset.2xs` · prop visible←show label
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←label
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←show mandatory
  - **Field** · frame · row gap 8 pad 8/12/8/12 FILL/HUG · 240×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.xs` · strokeWeight `border.default` · radius `radius.control`
    - **Tags** · frame · row gap 4 pad 0/0/0/0 FILL/HUG · 216×24  
      itemSpacing `inset.2xs` · counterAxisSpacing `stack.2xs`
      - **Add items…** · text `body/md/regular` "Add items…" · FILL/HUG · 216×10  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Helper text** · text `helper/md` "Helper text" · FILL/HUG · 240×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←show helper, characters←helper

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                             |
| Text color      | `color.action.primary.text.default`, `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`          |
| Icon color      | `color.icon.feedback.neutral`                                                                                                                                                                                                     |
| Spacing         | `inset.2xs`, `inset.sm`, `inset.xs`, `stack.2xs`, `stack.xs`                                                                                                                                                                      |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                                                                                                                                                  |
| Text styles     | `body/md/regular`, `helper/md`, `label/md`                                                                                                                                                                                        |

### Slots and prop-controlled layers

| Layer         | Controlled property | Prop             |
| ------------- | ------------------- | ---------------- |
| Label         | visible             | `show label`     |
| Label › Label | characters          | `label`          |
| Label › \*    | visible             | `show mandatory` |
| Helper text   | visible             | `show helper`    |
| Helper text   | characters          | `helper`         |

### Variant matrix

| size | state    | size   | fill | stroke | effect | text                                                                                                                                                 | icon                          |
| ---- | -------- | ------ | ---- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| md   | default  | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary`                                                |                               |
| sm   | default  | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary`                                                |                               |
| md   | hover    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary`                                                |                               |
| sm   | hover    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary`                                                |                               |
| md   | active   | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                                                                         |                               |
| sm   | active   | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                                                                         |                               |
| md   | focus    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.secondary`                                        | `color.icon.feedback.neutral` |
| sm   | focus    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.secondary`                                        | `color.icon.feedback.neutral` |
| md   | filled   | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.action.primary.text.default`<br>`color.text.secondary` | `color.icon.feedback.neutral` |
| sm   | filled   | 160×94 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.action.primary.text.default`<br>`color.text.secondary` | `color.icon.feedback.neutral` |
| md   | disabled | 240×76 |      |        |        | `color.text.disabled`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`                                                                 | `color.icon.feedback.neutral` |
| sm   | disabled | 160×66 |      |        |        | `color.text.disabled`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`                                                                 | `color.icon.feedback.neutral` |
| md   | error    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.feedback.danger`                                  | `color.icon.feedback.neutral` |
| sm   | error    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.feedback.danger`                                  | `color.icon.feedback.neutral` |
| md   | readonly | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.secondary`                                        | `color.icon.feedback.neutral` |
| sm   | readonly | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.secondary`                                        | `color.icon.feedback.neutral` |

## Documentation card

**Description**

A field for entering multiple values as removable chips (tokens) — recipients, labels, keywords. Type and confirm to add; remove via the chip or backspace. For a single free value use Text Input.

**Usage**

Confirm a token on Enter or comma. Show chips inline; allow removal via the chip or backspace. Optionally suggest matches, like Autocomplete.

**States**

Default · Hover · Focus · Filled · Adding  
Disabled / Read-only — chips shown, not editable.  
Error — invalid token; message + aria-invalid.

**Sizes**

sm (36px) Dense forms.  
md (44px) Default. Meets the 44px touch target.

**Accessibility**

Labelled field; each chip’s remove is a labelled button. Announce added/removed tokens. Backspace removes the last chip; keyboard reaches every chip.

**Rules**

- DO: Confirm tokens on Enter / comma
- DO: Make each chip removable
- DO: Announce add / remove
- DO: Validate tokens with a message

- DON'T: Use for a single value (use Text Input)
- DON'T: Trap focus among chips
- DON'T: Rely on colour alone for errors
- DON'T: Lose typed text on blur
