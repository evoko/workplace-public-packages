# Option Row

> SOLAR Web · Figma page `↳ 🟢 Option Row` (id `10090:2`) · section `components/inputs` · raw data: [`raw/components/inputs/option-row.json`](../../raw/components/inputs/option-row.json)

## Component set: Option Row

A selection control paired with a label and optional supporting text. 3 variants: control (checkbox, radio, toggle). checkbox for independent on/off within a set, radio for exactly one of a mutually exclusive set, toggle for a setting that applies immediately. A row carries one control — never two at once. Only three variants, because interaction state and selection live on the nested control instance: set hover, focus, disabled, checked and mixed there rather than multiplying them across this set. hasSupportingText hides the second line. The whole row is the click target, and the control aligns to the first line of the label so supporting text that wraps never pulls it out of line. Row width is fixed so long text wraps instead of stretching the row. radio rows must share a group. For the large tappable treatment with an icon use Option Card.

### Props

| Prop                | Type    | Options / default             |
| ------------------- | ------- | ----------------------------- |
| `control`           | variant | **checkbox** · radio · toggle |
| `hasSupportingText` | boolean | default `true`                |

Default variant: `control=checkbox` · 3 variants · default size 320×51px

### Anatomy (default variant)

- **control=checkbox** · component · row gap 8 pad 12/0/12/0 FIXED/HUG · 320×51  
  itemSpacing `inset.xs` · padding `inset.sm`
  - **Control** · instance of **Checkbox** (checked=false, disabled=false, hover=false, mixed=false, focus=false) · FIXED/FIXED · 16×16  
    stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.control`
  - **Text** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 296×27  
    itemSpacing `stack.xs`
    - **Label** · text `label/md` "Option label" · FILL/HUG · 296×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
    - **Description** · text `body/sm/regular` "Supporting description for this option" · FILL/HUG · 296×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400` · prop visible←hasSupportingText

### Tokens used

| Role            | Tokens                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strokes         | `color.border.medium`                                                                                                                                                        |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                                 |
| Spacing         | `inset.sm`, `inset.xs`, `stack.xs`                                                                                                                                           |
| Radius          | `radius.control`                                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.sm`, `type.line-height.label.md`, `type.size.body.sm`, `type.size.label.md` |
| Text styles     | `body/sm/regular`, `label/md`                                                                                                                                                |

### Slots and prop-controlled layers

| Layer              | Controlled property | Prop                |
| ------------------ | ------------------- | ------------------- |
| Text › Description | visible             | `hasSupportingText` |

### Composes

- Checkbox

### Variant matrix

| control  | size   | fill | stroke | effect | text                                           | icon |
| -------- | ------ | ---- | ------ | ------ | ---------------------------------------------- | ---- |
| checkbox | 320×51 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| radio    | 320×51 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| toggle   | 320×51 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |

## Component: Options List

Vertical stack of Option Rows that share one question — the fieldset around a group of checkboxes, radios or toggles. Single variant; Content is a slot for Option Row instances. Keep one control type per list and wrap it in fieldset + legend. Above five mutually exclusive options use Select.

### Props

| Prop      | Type | Options / default         |
| --------- | ---- | ------------------------- |
| `Content` | slot | default `[object Object]` |

### Anatomy (default variant)

- **Options List** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 320×102
  - **Content** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 320×102  
    prop slotContentId←Content
    - **Option Row** · instance of **Option Row** (control=checkbox) · row gap 8 pad 12/0/12/0 FILL/HUG · 320×51  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Option Row** · instance of **Option Row** (control=checkbox) · row gap 8 pad 12/0/12/0 FILL/HUG · 320×51  
      itemSpacing `inset.xs` · padding `inset.sm`

### Tokens used

| Role    | Tokens                 |
| ------- | ---------------------- |
| Spacing | `inset.sm`, `inset.xs` |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop      |
| ------- | ------------------- | --------- |
| Content | slotContentId       | `Content` |

### Composes

- Option Row

## Documentation card

**Description**

A selection control paired with a label and optional supporting text. Variant picks the control — Checkbox for independent on/off within a set, Radio button for exactly one of a mutually exclusive set, Toggle for a setting that applies immediately. A row carries one control, never two at once. The control is a nested instance of the real Checkbox, Radio or Toggle component, so fixes to those primitives flow straight through.

**Variants & states**

Variant=Checkbox / Radio button / Toggle · hasSupportingText=true / false  
Three variants only. Interaction state and selection live on the nested control instance, not on this set: select the Control layer and set hover, focus, disabled, checked or mixed there. That keeps this component at three variants instead of multiplying five states across three control types.  
hasSupportingText hides the second line of text.

**Content**

Label is required — an Option Row without a label is a bug. Supporting text is optional; switch it off with hasSupportingText.  
Label uses label/md on text/primary; supporting text uses body/sm/regular on text/secondary.  
Row width is fixed at 320 so long supporting text wraps instead of stretching the row. The control aligns to the label's first line, so supporting text that runs to two lines never pulls it out of line.  
Keep label grammar parallel across a group.

**Accessibility**

Render the control as `<input type="checkbox">`, `<input type="radio">` or a switch. The visible label is the `<label>`, so the whole row is the click target; wire supporting text with aria-describedby.  
Radio button rows share one name= and sit inside fieldset + legend. Checkbox rows need the fieldset too whenever they read as one question.  
mixed on a Checkbox control maps to aria-checked="mixed" — a display state, never a third submitted value.

**Behavior**

Commit on click — there is no separate save step. Clicking anywhere in the row activates it, including the supporting text.  
Checkbox rows toggle independently of each other. Radio button rows are exclusive: selecting one clears the previous choice, and a selected radio cannot be cleared by clicking it again. Toggle applies immediately, with no confirm step.  
One Variant value drives a whole group — a group never mixes control types.

**Grouping**

Stack rows vertically for scannability and keep one question per group. Wrap the set in fieldset + legend.  
Use Checkbox when any number of options may be on, Radio button when exactly one must be, and Toggle for independent settings that take effect at once.  
Above 5 mutually-exclusive options use Select instead. For the large tappable treatment with an icon use Option Card.

**Rules**

Do  
• Give every row a label  
• Keep one Variant per group  
• Set state on the nested Control layer  
• Use supporting text for consequence, not decoration

Don't  
• Don't use a solo radio — it's meaningless  
• Don't add state variants to this set — they belong on the control  
• Don't set mixed on a Radio button or Toggle
