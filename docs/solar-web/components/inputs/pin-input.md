# PIN Input

> SOLAR Web · Figma page `↳ 🟢 PIN Input` (id `6164:6823`) · section `components/inputs` · raw data: [`raw/components/inputs/pin-input.json`](../../raw/components/inputs/pin-input.json)

## Component set: PIN Input

### Props

| Prop        | Type    | Options / default                                       |
| ----------- | ------- | ------------------------------------------------------- |
| `size`      | variant | **md** · sm                                             |
| `state`     | variant | **default** · hover · focus · filled · disabled · error |
| `hasHelper` | boolean | default `true`                                          |
| `mandatory` | boolean | default `true`                                          |
| `hasLabel`  | boolean | default `true`                                          |

Default variant: `size=md, state=default` · 12 variants · default size 236×84px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 FILL/HUG · 236×84  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 48×10  
    itemSpacing `inset.2xs` · prop visible←hasLabel
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←mandatory
  - **Cells** · frame · row gap 4 pad 0/0/0/0 HUG/FIXED · 236×48  
    itemSpacing `stack.2xs`
    - **Field** · frame · row gap 8 pad 0/12/0/12 FIXED/FIXED · 36×40  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
      - **0** · text `body/lg/medium` "0" · HUG/HUG · 11×12  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
    - **Field** · frame · row gap 8 pad 0/12/0/12 FIXED/FIXED · 36×40  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
      - **0** · text `body/lg/medium` "0" · HUG/HUG · 11×12  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
    - **Field** · frame · row gap 8 pad 0/12/0/12 FIXED/FIXED · 36×40  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
      - **0** · text `body/lg/medium` "0" · HUG/HUG · 11×12  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
    - **Field** · frame · row gap 8 pad 0/12/0/12 FIXED/FIXED · 36×40  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
      - **0** · text `body/lg/medium` "0" · HUG/HUG · 11×12  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
    - **Field** · frame · row gap 8 pad 0/12/0/12 FIXED/FIXED · 36×40  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
      - **0** · text `body/lg/medium` "0" · HUG/HUG · 11×12  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
    - **Field** · frame · row gap 8 pad 0/12/0/12 FIXED/FIXED · 36×40  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
      - **0** · text `body/lg/medium` "0" · HUG/HUG · 11×12  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
  - **Helper text** · text `helper/md` "Helper text" · HUG/HUG · 71×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←hasHelper

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                             |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                                                                              |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`, `stack.2xs`, `stack.xs`                                                                                                                                                        |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.lg`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.lg`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                                                                                                                                                  |
| Text styles     | `body/lg/medium`, `helper/md`, `label/md`                                                                                                                                                                                         |

### Slots and prop-controlled layers

| Layer       | Controlled property | Prop        |
| ----------- | ------------------- | ----------- |
| Label       | visible             | `hasLabel`  |
| Label › *   | visible             | `mandatory` |
| Helper text | visible             | `hasHelper` |

### Variant matrix

| size | state    | size   | fill | stroke | effect | text                                                                                                  | icon |
| ---- | -------- | ------ | ---- | ------ | ------ | ----------------------------------------------------------------------------------------------------- | ---- |
| md   | default  | 236×84 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` |      |
| sm   | default  | 188×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` |      |
| md   | hover    | 236×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` |      |
| sm   | hover    | 188×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` |      |
| md   | focus    | 236×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` |      |
| sm   | focus    | 188×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` |      |
| md   | filled   | 236×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          |      |
| sm   | filled   | 188×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          |      |
| md   | disabled | 236×76 |      |        |        | `color.text.disabled`                                                                                 |      |
| sm   | disabled | 188×66 |      |        |        | `color.text.disabled`                                                                                 |      |
| md   | error    | 236×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.danger`                    |      |
| sm   | error    | 188×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.danger`                    |      |

### Issues detected

- Component description is empty.

## Documentation card

**Description**

Short, fixed-length numeric entry (4–6 digits) for one-time codes, two-factor auth, and quick verification flows. Each digit lives in its own cell so the active position is always obvious. Auto-advance forward; backspace returns to the previous cell; pasting a full code distributes across all cells in one action.

**Sizes**

sm Compact density — confirmation drawers, dense step views.  
md Default for standing verification screens and full-width challenge flows.

**States**

default All cells empty.  
hover Cell-1 hovered, others idle.  
focus Cell-1 focused, focus ring + caret.  
filled Every cell holds a digit; ready to submit.  
disabled Input not accepting any entry.  
error Wrong/expired code; helper uses text/feedback/danger.

**Content**

Label: name the action ("Verification code"). Helper text: state where the code came from ("We sent a 6-digit code to ••@biamp.com"). Error: state the fix ("Code is incorrect or expired — request a new one"), not the complaint. Always use the mandatory asterisk — a one-time code is, by definition, required.

**Accessibility**

Render the group with role="group" and aria-label naming the field; each cell is an `<input inputmode="numeric" autocomplete="one-time-code" aria-label="Digit n of 6">`. Tab moves into and out of the group; Left/Right arrows move between cells; Backspace deletes and moves back; pasting a code distributes across cells. Error helper sits in aria-live="polite" and is referenced by aria-describedby on the group. Focus ring via shadow/focus/default — meets WCAG 3:1 non-text contrast.

**Rules**

Do  
• Use only for short, fixed-length numeric codes  
• Auto-advance forward; backspace returns to previous cell  
• Accept paste and distribute digits across all cells  
• Render with inputmode='numeric' and autocomplete='one-time-code'

Don't  
• Use for passwords, free-form text, or codes longer than ~8 digits  
• Omit the label — visible focus alone is not enough for screen readers  
• Validate per-keystroke; only on full entry or on submit  
• Place inside dense table rows — use Text Input instead

**Description**

A set of single-character cells for short codes — OTP, MFA, or PINs. Auto-advances between cells and accepts a pasted full code.

**Usage**

Use for fixed-length numeric or alphanumeric codes. Auto-focus the first cell, auto-advance on entry, and accept a pasted code.

**States**

Default · Hover · Focus · Filled  
Disabled — muted.  
Error — wrong/expired code; message + aria-invalid.

**Sizes**

sm (36px) Compact dialogs.  
md (44px) Default. Meets the 44px touch target.

**Accessibility**

Grouped under one label describing the code and its length. Announce position and errors. Backspace moves to the previous cell; paste fills all.

**Rules**

- DO: Auto-advance and accept paste
- DO: Label the group and its length
- DO: Support backspace navigation
- DO: Surface expiry / invalid errors

- DON'T: Block pasting the code
- DON'T: Trap focus in one cell
- DON'T: Rely on colour alone for errors
- DON'T: Use for long free-form text
