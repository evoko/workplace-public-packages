# Number Input

> SOLAR Web · Figma page `↳ 🟢 Number Input` (id `2202:1229`) · section `components/inputs` · raw data: [`raw/components/inputs/number-input.json`](../../raw/components/inputs/number-input.json)

## Component set: Number Input

Numeric input with stepper controls. 20 variants: size (sm, md) × state (default, hover, focus, disabled, error) × stepper (inline, side). inline places steppers inside the field trailing; side places them outside (larger hit area, preferred for touch). inputmode="numeric" for mobile keyboards. Validate on blur. Constrain via min / max / step; do not accept characters the field does not allow.

### Props

| Prop        | Type    | Options / default                              |
| ----------- | ------- | ---------------------------------------------- |
| `size`      | variant | **md** · sm                                    |
| `state`     | variant | **default** · hover · disabled · error · focus |
| `stepper`   | variant | **inline** · side                              |
| `mandatory` | boolean | default `true`                                 |
| `hasHelper` | boolean | default `true`                                 |
| `hasLabel`  | boolean | default `true`                                 |

Default variant: `size=md, state=default, stepper=inline` · 20 variants · default size 98×76px

### Anatomy (default variant)

- **size=md, state=default, stepper=inline** · component · column gap 8 pad 0/0/0/0 HUG/HUG · 98×76  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 48×10  
    itemSpacing `inset.2xs` · prop visible←hasLabel
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←mandatory
  - **Field** · frame · row gap 12 pad 0/12/0/12 HUG/FIXED · 98×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **Decrement** · instance of **Icon/Minus** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md` · radius `radius.control`
    - **0** · text `body/md/medium` "0" · HUG/HUG · 10×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Increment** · instance of **Icon/Plus** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md` · radius `radius.control`
  - **Helper text** · text `helper/md` "Helper text" · FILL/HUG · 98×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←hasHelper

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                             |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`                                                                                                     |
| Icon color      | `color.icon.disabled`, `color.icon.primary`                                                                                                                                                                                       |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `stack.xs`                                                                                                                                                                                 |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Sizes           | `icon.md`                                                                                                                                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`, `shadow/focus/default`                                                                                                                                                                                          |
| Text styles     | `body/md/medium`, `helper/md`, `label/md`                                                                                                                                                                                         |

### Slots and prop-controlled layers

| Layer       | Controlled property | Prop        |
| ----------- | ------------------- | ----------- |
| Label       | visible             | `hasLabel`  |
| Label › *   | visible             | `mandatory` |
| Helper text | visible             | `hasHelper` |

### Composes

- Icon/Minus
- Icon/Plus

### Variant matrix

| size | state    | stepper | size  | fill | stroke | effect                 | text                                                                         | icon                  |
| ---- | -------- | ------- | ----- | ---- | ------ | ---------------------- | ---------------------------------------------------------------------------- | --------------------- |
| md   | default  | inline  | 98×76 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | default  | inline  | 72×66 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| md   | default  | side    | 88×76 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | default  | side    | 68×66 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| md   | focus    | inline  | 98×76 |      |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | focus    | inline  | 72×66 |      |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| md   | focus    | side    | 88×76 |      |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | focus    | side    | 68×66 |      |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| md   | hover    | inline  | 98×76 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | hover    | inline  | 72×66 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| md   | hover    | side    | 88×76 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | hover    | side    | 68×66 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| md   | disabled | inline  | 98×76 |      |        |                        | `color.text.disabled`                                                        | `color.icon.disabled` |
| sm   | disabled | inline  | 72×66 |      |        |                        | `color.text.disabled`                                                        | `color.icon.disabled` |
| md   | disabled | side    | 88×76 |      |        |                        | `color.text.disabled`                                                        | `color.icon.disabled` |
| sm   | disabled | side    | 68×66 |      |        |                        | `color.text.disabled`                                                        | `color.icon.disabled` |
| md   | error    | inline  | 98×76 |      |        |                        | `color.text.feedback.danger`<br>`color.text.primary`                         | `color.icon.primary`  |
| sm   | error    | inline  | 72×66 |      |        |                        | `color.text.feedback.danger`<br>`color.text.primary`                         | `color.icon.primary`  |
| md   | error    | side    | 88×76 |      |        |                        | `color.text.feedback.danger`<br>`color.text.primary`                         | `color.icon.primary`  |
| sm   | error    | side    | 68×66 |      |        |                        | `color.text.feedback.danger`<br>`color.text.primary`                         | `color.icon.primary`  |

## Documentation card

**Description**

Numeric-only input with stepper controls for increment/decrement. Use for quantities, ages, counts, technical parameters. For monetary values with currency formatting, pair with a currency prefix. For ranges, use Slider or paired min/max Number Inputs.

**Variants**

size=sm (36px) / size=md (44px)  
stepper=inline Steppers inside the field trailing edge.  
stepper=side Steppers outside the field (+ and − buttons). Larger hit area; preferred for touch contexts.  
state: default, hover, disabled, error.

**Content**

Label: units matter ("Quantity", "Temperature (°F)"). Helper text: show min / max / step ("1 – 100") so the constraint is visible. Error: include the allowed range ("Enter a number between 1 and 100"), not a bare "Invalid".

**Accessibility**

Render as `<input type="number">` with inputmode="numeric". aria-valuemin / aria-valuemax / aria-valuenow when constrained. Steppers are `<button>` with aria-label ("Increment" / "Decrement"). Keyboard: ↑ / ↓ step by step; Page Up / Page Down by 10× step; Home / End jump to min / max.

**Rules**

Do  
• Match inputmode to the expected keyboard  
• Show min/max/step in helper text  
• Provide keyboard ↑/↓ stepping  
• Prefer stepper=side for touch

Don't  
• Don't accept characters that will be rejected — block them  
• Don't silently clamp — show an error when out of range  
• Don't remove type="number" for currency — prefix the currency  
• Don't put negative numbers where positive makes no sense
