# Text Area

> SOLAR Web · Figma page `↳ 🟢 Text Area` (id `2163:3709`) · section `components/inputs` · raw data: [`raw/components/inputs/text-area.json`](../../raw/components/inputs/text-area.json)

## Component set: Text Area

Multi-line text field for long-form input. 12 variants: size (sm, md) × state (default, hover, focus, filled, disabled, error). focus carries shadow/focus/default; error carries the danger border and shadow/danger and pairs with helper text. Resize handle bottom-right. Use when expected input exceeds ~2 lines (descriptions, notes, feedback). For rich formatting switch to a rich-text editor component.

### Props

| Prop              | Type    | Options / default                                       |
| ----------------- | ------- | ------------------------------------------------------- |
| `size`            | variant | **md** · sm                                             |
| `state`           | variant | **default** · hover · filled · disabled · error · focus |
| `hasLabel`        | boolean | default `true`                                          |
| `hasHelper`       | boolean | default `true`                                          |
| `mandatory`       | boolean | default `true`                                          |
| `hasCharCount`    | boolean | default `true`                                          |
| `label`           | text    | default `Label`                                         |
| `helper`          | text    | default `Helper text`                                   |
| `character count` | text    | default `0/500`                                         |
| `hasCTA`          | boolean | default `true`                                          |
| `hasAttachment`   | boolean | default `true`                                          |
| `hasFooter`       | boolean | default `true`                                          |

Default variant: `size=md, state=default` · 12 variants · default size 280×156px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 FIXED/HUG · 280×156  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 48×10  
    itemSpacing `inset.2xs` · prop visible←hasLabel
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←label
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←mandatory
  - **Field** · frame · column gap 0 pad 12/12/12/12 FILL/FIXED · 280×120  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Enter text...** · text `body/md/regular` "Enter text..." · FILL/FILL · 256×96  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Icon Button** · instance of **Icon Button** (size=sm, shape=square, prio=primary, state=disabled) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
      fill `color.action.primary.bg.disabled` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasCTA
    - **Icon Button** · instance of **Icon Button** (size=sm, shape=square, prio=secondary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
      fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasAttachment
  - **Footer** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 280×10  
    prop visible←hasFooter
    - **Helper text** · text `helper/md` "Helper text" · FILL/HUG · 241×10  
      fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←hasHelper, characters←helper
    - **CharCount** · text `body/md/regular` "0/500" · HUG/HUG · 39×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop visible←hasCharCount, characters←character count

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.disabled`, `color.action.secondary.bg.default`, `color.surface.base`                                                                                                                                     |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                                                                      |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                                                                              |
| Icon color      | `color.action.primary.icon.default`, `color.action.primary.icon.disabled`, `color.action.secondary.icon.default`, `color.action.secondary.icon.disabled`                                                                          |
| Spacing         | `inset.2xs`, `inset.sm`, `stack.xs`                                                                                                                                                                                               |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`, `shadow/focus/default`                                                                                                                                                                                          |
| Text styles     | `body/md/regular`, `helper/md`, `label/md`                                                                                                                                                                                        |

### Slots and prop-controlled layers

| Layer                | Controlled property | Prop              |
| -------------------- | ------------------- | ----------------- |
| Label                | visible             | `hasLabel`        |
| Label › Label        | characters          | `label`           |
| Label › *            | visible             | `mandatory`       |
| Field › Icon Button  | visible             | `hasCTA`          |
| Field › Icon Button  | visible             | `hasAttachment`   |
| Footer               | visible             | `hasFooter`       |
| Footer › Helper text | visible             | `hasHelper`       |
| Footer › Helper text | characters          | `helper`          |
| Footer › CharCount   | visible             | `hasCharCount`    |
| Footer › CharCount   | characters          | `character count` |

### Composes

- Icon Button

### Variant matrix

| size | state    | size    | fill | stroke | effect                 | text                                                                                                  | icon                                                                           |
| ---- | -------- | ------- | ---- | ------ | ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| md   | default  | 280×156 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.action.primary.icon.disabled`<br>`color.action.secondary.icon.default`  |
| sm   | default  | 200×134 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.action.primary.icon.disabled`<br>`color.action.secondary.icon.default`  |
| md   | hover    | 280×156 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.action.primary.icon.disabled`<br>`color.action.secondary.icon.default`  |
| sm   | hover    | 200×134 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.action.primary.icon.disabled`<br>`color.action.secondary.icon.default`  |
| md   | filled   | 280×156 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`   |
| sm   | filled   | 200×134 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`   |
| md   | disabled | 280×156 |      |        |                        | `color.text.disabled`                                                                                 | `color.action.primary.icon.disabled`<br>`color.action.secondary.icon.disabled` |
| sm   | disabled | 200×134 |      |        |                        | `color.text.disabled`                                                                                 | `color.action.primary.icon.disabled`<br>`color.action.secondary.icon.disabled` |
| md   | error    | 280×156 |      |        |                        | `color.text.feedback.danger`<br>`color.text.primary`                                                  | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`   |
| sm   | error    | 200×134 |      |        |                        | `color.text.feedback.danger`<br>`color.text.primary`                                                  | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`   |
| md   | focus    | 280×156 |      |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`   |
| sm   | focus    | 200×134 |      |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`   |

## Documentation card

**Usage**

Multi-line text field for long-form input. Resize handle bottom-right. Use when expected input exceeds ~2 lines (descriptions, notes, feedback). For rich formatting switch to a rich-text editor component.

**Usage**

Use when input may exceed one line. Show a character counter where limits apply. Allow resize where space permits.

**States**

Default · Hover · Focus · Filled  
Disabled — muted, non-editable.  
Error — invalid value; message + aria-invalid.

**Sizes**

sm Dense forms.  
md Default. Comfortable multi-line entry.

**Accessibility**

Programmatic label; error sets aria-invalid and links a message. Announce character-limit state politely. Visible focus ring.

**Rules**

- DO: Use when expected input exceeds ~2 lines (descriptions, notes, feedback).

- DON'T: detach the instance or override its tokens locally — request a change through governance instead.
