# Text Input

> SOLAR Web · Figma page `↳ 🟢 Text Input` (id `235:1009`) · section `components/inputs` · raw data: [`raw/components/inputs/text-input.json`](../../raw/components/inputs/text-input.json)

## Component set: Text Input

Single-line text field for free-form input — label above, helper or error below, optional leading and trailing icons. 12 variants: size (sm 36px, md 44px) × state (default, hover, pressed, filled, disabled, error). NOTE: pressed is the focused state here and is flagged to rename to focus (Class B). Booleans show label, show helper, show leading icon, show trailing icon, show mandatory; label and helper are text props. Validate on blur; a placeholder never replaces the label. For multi-line use Text Area; for numbers use Number Input.

### Props

| Prop                 | Type    | Options / default                                         |
| -------------------- | ------- | --------------------------------------------------------- |
| `size`               | variant | **md** · sm                                               |
| `state`              | variant | **default** · hover · filled · disabled · error · pressed |
| `show label`         | boolean | default `true`                                            |
| `show helper`        | boolean | default `true`                                            |
| `show leading icon`  | boolean | default `true`                                            |
| `show trailing icon` | boolean | default `true`                                            |
| `show mandatory`     | boolean | default `true`                                            |
| `label`              | text    | default `Label`                                           |
| `helper`             | text    | default `Helper text`                                     |

Default variant: `size=md, state=default` · 12 variants · default size 240×76px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 FIXED/HUG · 240×76  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 48×10  
    itemSpacing `inset.2xs` · prop visible←show label
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←show label, characters←label
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←show mandatory
  - **Field** · frame · row gap 8 pad 0/12/0/12 FILL/FIXED · 240×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md` · prop visible←show leading icon
    - **Label** · text `body/md/regular` "Text" · FILL/HUG · 160×10  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md` · prop visible←show trailing icon
  - **Helper text** · text `helper/md` "Helper text" · FILL/HUG · 240×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←show helper, characters←helper

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                             |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                                                                              |
| Icon color      | `color.icon.disabled`, `color.icon.feedback.danger`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`                                                                                                          |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`, `stack.xs`                                                                                                                                                                     |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Sizes           | `icon.md`                                                                                                                                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                                                                                                                                                  |
| Text styles     | `body/md/regular`, `helper/md`, `label/md`                                                                                                                                                                                        |

### Slots and prop-controlled layers

| Layer             | Controlled property | Prop                 |
| ----------------- | ------------------- | -------------------- |
| Label             | visible             | `show label`         |
| Label › Label     | visible             | `show label`         |
| Label › Label     | characters          | `label`              |
| Label › *         | visible             | `show mandatory`     |
| Field › Icon/None | visible             | `show leading icon`  |
| Field › Icon/None | visible             | `show trailing icon` |
| Helper text       | visible             | `show helper`        |
| Helper text       | characters          | `helper`             |

### Composes

- Icon/None

### Variant matrix

| size | state    | size   | fill | stroke | effect | text                                                                                                  | icon                         |
| ---- | -------- | ------ | ---- | ------ | ------ | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| md   | default  | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary`        |
| sm   | default  | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary`        |
| md   | hover    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.secondary`       |
| sm   | hover    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.secondary`       |
| md   | pressed  | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary`         |
| sm   | pressed  | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary`         |
| md   | filled   | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary`         |
| sm   | filled   | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary`         |
| md   | disabled | 240×76 |      |        |        | `color.text.disabled`                                                                                 | `color.icon.disabled`        |
| sm   | disabled | 160×66 |      |        |        | `color.text.disabled`                                                                                 | `color.icon.disabled`        |
| md   | error    | 240×76 |      |        |        | `color.text.feedback.danger`<br>`color.text.primary`                                                  | `color.icon.feedback.danger` |
| sm   | error    | 160×66 |      |        |        | `color.text.feedback.danger`<br>`color.text.primary`                                                  | `color.icon.feedback.danger` |

## Documentation card

**Description**

Single-line text field for free-form user input — names, emails, search, identifiers, short answers. Label sits above; helper text below; mandatory asterisk optional. Validate on blur, not per-keystroke.

**Sizes**

sm (36px) Dense forms, inspector panes, table inline edits.  
md (44px) Default for page-level forms and full-width layouts.

**States (⚠ rename pending)**

default resting.  
hover border lifts to border/feedback/focus/subtle.  
active focused, cursor in field. Flagged to rename to `focus` to match SOLAR state vocab.  
filled has user content.  
disabled opacity/disabled, not-allowed cursor.  
error color/border/feedback/danger/strong + error helper text.

**Content**

Labels: short, sentence case, describe the data ("Email address", "Project name"). Helper text: 1 line, plain language, set expectation ("We'll never share it"). Error: plain language with the fix ("Enter a valid email address"), not the complaint ("Invalid input"). Mandatory: either consistently mark required OR mark optional — pick one.

**Accessibility**

Render as `<input>` with a real `<label for="">`. Placeholder never substitutes for label (WCAG 3.3.2). Error has aria-describedby pointing at the error text. Mandatory uses aria-required. Focus ring via shadow/focus/default. Contrast: text ≥ 4.5:1 against surface.

**Rules**

Do  
• Label every input with a visible `<label>`  
• Validate on blur, not on every keystroke  
• Write errors as 'how to fix', not 'what's wrong'  
• Match type attribute to data (email, tel, url)

Don't  
• Don't use placeholder text as the label  
• Don't show red errors while the user is still typing  
• Don't mix 'required' and 'optional' markers in the same form  
• Don't put destructive cleanup (clear-on-focus) on a text input
