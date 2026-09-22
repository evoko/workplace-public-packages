# File Upload

> SOLAR Web · Figma page `↳ 🟢 File Upload` (id `2202:1225`) · section `components/inputs` · raw data: [`raw/components/inputs/file-upload.json`](../../raw/components/inputs/file-upload.json)

## Component set: FileUpload

File upload control with drag-and-drop + click-to-select. 6 variants by state: default, hover, focus, filled, error, disabled. default shows drop affordance + CTA; hover highlights the drop zone; focus shows the focus ring; filled shows the selected file(s) with a remove control; error surfaces size/format rejection; disabled locks the control. Helper text communicates limits ("Max 10MB, .jpg .png"). Pair with a real `<input type="file">` for accessibility; the drop zone is visual sugar on top.

### Props

| Prop         | Type    | Options / default                                       |
| ------------ | ------- | ------------------------------------------------------- |
| `state`      | variant | hover · error · disabled · filled · **default** · focus |
| `helperText` | text    | default `Max 10MB, .jpg .png`                           |
| `showHelper` | boolean | default `true`                                          |
| `mandatory`  | boolean | default `true`                                          |

Default variant: `state=default` · 6 variants · default size 400×107px

### Anatomy (default variant)

- **state=default** · component · column gap 12 pad 0/0/0/0 FILL/HUG · 400×107  
  itemSpacing `stack.sm`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 92×10  
    itemSpacing `inset.2xs`
    - **Upload a file** · text `body/md/medium` "Upload a file" · HUG/HUG · 80×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←mandatory
  - **Field** · frame · row gap 12 pad 12/12/12/16 FILL/HUG · 400×64  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default` · radius `radius.control`
    - **Icon/File** · instance of **Icon/File** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`
    - **FileName** · text `body/md/regular` "Select a file…" · FILL/HUG · 248×10  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Button** · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
      fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
  - **HelperText** · text `helper/sm` "Max 10MB, .jpg .png" · HUG/HUG · 111×9  
    fill `color.text.tertiary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400` · prop visible←showHelper, characters←helperText

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.default`, `color.surface.base`                                                                                                                                                                                                                              |
| Strokes         | `color.action.secondary.border.default`, `color.border.subtle`                                                                                                                                                                                                                         |
| Text color      | `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.action.secondary.text.default`, `color.action.secondary.text.disabled`, `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.tertiary` |
| Icon color      | `color.action.secondary.icon.danger.default`, `color.action.secondary.icon.default`, `color.action.secondary.icon.disabled`, `color.icon.disabled`, `color.icon.feedback.danger`, `color.icon.primary`, `color.icon.tertiary`                                                          |
| Spacing         | `inset.2xs`, `inset.md`, `inset.sm`, `inset.xs`, `stack.sm`                                                                                                                                                                                                                            |
| Radius          | `radius.control`                                                                                                                                                                                                                                                                       |
| Border width    | `border.default`                                                                                                                                                                                                                                                                       |
| Sizes           | `icon.md`                                                                                                                                                                                                                                                                              |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.sm`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.sm`, `type.size.label.md`                                                      |
| Effects         | `shadow/control`, `shadow/focus/default`                                                                                                                                                                                                                                               |
| Text styles     | `body/md/medium`, `body/md/regular`, `helper/sm`, `label/md`                                                                                                                                                                                                                           |

### Slots and prop-controlled layers

| Layer      | Controlled property | Prop         |
| ---------- | ------------------- | ------------ |
| Label › *  | visible             | `mandatory`  |
| HelperText | visible             | `showHelper` |
| HelperText | characters          | `helperText` |

### Composes

- Button
- Icon/File

### Variant matrix

| state    | size    | fill | stroke | effect                 | text                                                                                                                                                               | icon                                                                                                          |
| -------- | ------- | ---- | ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| default  | 400×107 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`        | `color.icon.tertiary`<br>`color.action.secondary.icon.default`                                                |
| hover    | 400×107 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`        | `color.icon.tertiary`<br>`color.action.secondary.icon.default`                                                |
| error    | 400×107 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.feedback.danger`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.feedback.danger`<br>`color.action.secondary.icon.default`                                         |
| disabled | 400×107 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.disabled`<br>`color.action.secondary.text.disabled`<br>`color.action.primary.text.disabled`      | `color.icon.disabled`<br>`color.action.secondary.icon.disabled`                                               |
| filled   | 400×111 |      |        |                        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`                                                                                        | `color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.secondary.icon.danger.default` |
| focus    | 400×107 |      |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`        | `color.icon.tertiary`<br>`color.action.secondary.icon.default`                                                |

## Documentation card

**Description**

File upload control combining a visible drop zone, a click-to-select CTA, and a real `<input type="file">` for accessibility. 5 states cover the full lifecycle: idle, hover, filled, error, disabled. The drop zone is visual sugar — every interaction must also be reachable via the underlying file input and keyboard.

**States**

idle resting. Shows drop affordance, CTA, and helper text (limits).  
hover drop zone highlighted while dragging a file over.  
filled one or more files selected — show names, sizes, remove ×.  
error rejection (size, format, count) — surface plain-language reason.  
disabled locked, not-allowed cursor.

**Content**

Label: what's being uploaded ("Project files", "Profile photo"). Helper text states limits up front ("Max 10MB, JPG or PNG"). CTA: active verb ("Choose a file", "Drop files here or browse"). Filled state shows file name + size + a remove × per file. Error: specific ("File too large — 10MB max"), not generic.

**Accessibility**

Render a real `<input type="file">` — the drop zone wraps it. Keyboard: Tab focuses the input; Enter/Space opens the native file picker. aria-describedby points at the helper text. Error announced via aria-live="polite". Multiple files: exposed via `<input multiple>`. Every uploaded file's remove × gets aria-label ("Remove {filename}").

**Rules**

Do  
• Always expose a real `<input type="file">`  
• State size and format limits before the user uploads  
• Announce errors and acceptance via aria-live  
• Show filename + size in the filled state with a remove ×

Don't  
• Don't rely on drag-and-drop alone — keyboard users can't  
• Don't wait until upload to validate size/format — validate on select  
• Don't lose user selections when an error fires — keep valid files  
• Don't use for paste-from-clipboard images — that's a different control
