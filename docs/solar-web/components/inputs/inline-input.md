# Inline Input

> SOLAR Web · Figma page `↳ 🟢 Inline Input` (id `2966:627`) · section `components/inputs` · raw data: [`raw/components/inputs/inline-input.json`](../../raw/components/inputs/inline-input.json)

## Component set: Inline Input

Inline Input — edit-in-place field that displays a value as text and reveals an editable field on interaction. 6 states: default (read), hover (shows edit affordance), focus (active edit, focus border), filled (edit mode with value), error (validation error), disabled. Edit states expose Confirm (check) and Cancel (close) icon buttons to commit or discard. Set the displayed text via the 'value' property.

### Props

| Prop    | Type    | Options / default                                       |
| ------- | ------- | ------------------------------------------------------- |
| `state` | variant | **default** · hover · focus · filled · error · disabled |
| `value` | text    | default `Current value`                                 |

Default variant: `state=default` · 6 variants · default size 240×40px

### Anatomy (default variant)

- **state=default** · component · row gap 8 pad 0/12/0/12 FIXED/FIXED · 240×40  
  itemSpacing `inset.xs` · padding `inset.sm`
  - **Current value** · text `body/md/regular` "Current value" · FILL/HUG · 216×10  
    fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop characters←value

### Tokens used

| Role            | Tokens                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.hover`                                                        |
| Strokes         | `color.border.feedback.danger.strong`, `color.border.feedback.focus.strong`, `color.border.subtle` |
| Text color      | `color.text.disabled`, `color.text.primary`                                                        |
| Icon color      | `color.action.tertiary.icon.default`                                                               |
| Spacing         | `inset.sm`, `inset.xs`                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.body.md`, `type.size.body.md`  |
| Effects         | `shadow/control`, `shadow/danger`, `shadow/focus/default`                                          |
| Text styles     | `body/md/regular`                                                                                  |

### Slots and prop-controlled layers

| Layer         | Controlled property | Prop    |
| ------------- | ------------------- | ------- |
| Current value | characters          | `value` |

### Variant matrix

| state    | size   | fill                  | stroke                                | effect                 | text                  | icon                                 |
| -------- | ------ | --------------------- | ------------------------------------- | ---------------------- | --------------------- | ------------------------------------ |
| default  | 240×40 |                       |                                       |                        | `color.text.primary`  |                                      |
| hover    | 240×40 | `color.surface.hover` |                                       |                        | `color.text.primary`  | `color.action.tertiary.icon.default` |
| focus    | 240×40 | `color.surface.base`  | `color.border.feedback.focus.strong`  | `shadow/focus/default` | `color.text.primary`  | `color.action.tertiary.icon.default` |
| filled   | 240×40 | `color.surface.base`  | `color.border.subtle`                 | `shadow/control`       | `color.text.primary`  | `color.action.tertiary.icon.default` |
| error    | 240×40 | `color.surface.base`  | `color.border.feedback.danger.strong` | `shadow/danger`        | `color.text.primary`  | `color.action.tertiary.icon.default` |
| disabled | 240×40 |                       |                                       |                        | `color.text.disabled` |                                      |

## Documentation card

**Description**

An editable value that sits inline in text or a table cell — click to edit in place, commit on blur or Enter. Use for lightweight edits without a separate form field.

**Usage**

Use in tables, detail lists, and editable labels. Show an edit affordance on hover. Commit on Enter/blur, cancel on Esc.

**States**

Default · Hover · Focus · Filled  
Disabled — read-only.  
Error — invalid value; inline message.

**Behavior**

Reads as static text until focused, then becomes an editable field. Confirms in place — no separate save button.

**Accessibility**

Editable region has a label; announce edit mode on focus. Enter commits, Esc cancels. Visible focus ring.

**Rules**

- DO: Use for quick in-place edits
- DO: Show an edit affordance on hover
- DO: Commit on Enter / blur
- DO: Allow Esc to cancel

- DON'T: Use for complex multi-field forms
- DON'T: Hide that a value is editable
- DON'T: Lose input on accidental blur
- DON'T: Rely on colour alone for errors
