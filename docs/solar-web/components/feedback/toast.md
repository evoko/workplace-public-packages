# Toast

> SOLAR Web · Figma page `↳ 🟢 Toast` (id `2202:1247`) · section `components/feedback` · raw data: [`raw/components/feedback/toast.json`](../../raw/components/feedback/toast.json)

## Component set: Toast

Transient notification for background operation results. Appears top-right or bottom-right and auto-dismisses after 4–7s (danger longer). 5 variants: status (neutral, success, warning, danger, info); each carries a standard status Tag of its own status. Props: show Action, show Chevron. Use for async outcomes (“File saved”, “Connection lost”); never for critical errors that need confirmation — use Dialog. See also: Alert for inline callouts, Banner for page-level messages.

### Props

| Prop           | Type    | Options / default                               |
| -------------- | ------- | ----------------------------------------------- |
| `status`       | variant | neutral · **success** · warning · danger · info |
| `show Action`  | boolean | default `true`                                  |
| `show Chevron` | boolean | default `true`                                  |

Default variant: `status=success` · 5 variants · default size 264×32px

### Anatomy (default variant)

- **status=success** · component · row gap 8 pad 4/12/4/4 HUG/HUG · 264×32  
  fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.xs` · padding `inset.2xs`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
  - **Tag** · instance of **Tag** (status=success, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 67×24  
    fill `color.surface.overlay` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
  - **Message goes here** · text `body/sm/medium` "Message goes here" · HUG/HUG · 109×9  
    fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
  - **Action** · text `body/sm/medium` "Action" · HUG/HUG · 36×9  
    fill `color.text.feedback.success` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500` · prop visible←show Action
  - **Icon/ChevronRight** · instance of **Icon/ChevronRight** (solid=false) · FIXED/FIXED · 12×12  
    height `icon.xs` · prop visible←show Chevron

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.feedback.danger.subtle`, `color.surface.feedback.info.subtle`, `color.surface.feedback.neutral.subtle`, `color.surface.feedback.success.subtle`, `color.surface.feedback.warning.subtle`, `color.surface.overlay` |
| Strokes         | `color.border.feedback.danger.subtle`, `color.border.feedback.info.subtle`, `color.border.feedback.success.subtle`, `color.border.feedback.warning.subtle`, `color.border.subtle`                                                |
| Text color      | `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.primary`                                                      |
| Icon color      | `color.icon.feedback.danger`, `color.icon.feedback.info`, `color.icon.feedback.neutral`, `color.icon.feedback.success`, `color.icon.feedback.warning`                                                                            |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`                                                                                                                                                                                |
| Radius          | `radius.pill`                                                                                                                                                                                                                    |
| Border width    | `border.default`                                                                                                                                                                                                                 |
| Sizes           | `icon.xs`                                                                                                                                                                                                                        |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm`                                                                                                                                |
| Effects         | `shadow/raised`                                                                                                                                                                                                                  |
| Text styles     | `body/sm/medium`                                                                                                                                                                                                                 |

### Slots and prop-controlled layers

| Layer             | Controlled property | Prop           |
| ----------------- | ------------------- | -------------- |
| Action            | visible             | `show Action`  |
| Icon/ChevronRight | visible             | `show Chevron` |

### Composes

- Icon/ChevronRight
- Tag

### Variant matrix

| status  | size   | fill                                    | stroke                                 | effect          | text                                                  | icon                          |
| ------- | ------ | --------------------------------------- | -------------------------------------- | --------------- | ----------------------------------------------------- | ----------------------------- |
| success | 264×32 | `color.surface.feedback.success.subtle` | `color.border.feedback.success.subtle` | `shadow/raised` | `color.text.feedback.success`<br>`color.text.primary` | `color.icon.feedback.success` |
| warning | 264×32 | `color.surface.feedback.warning.subtle` | `color.border.feedback.warning.subtle` | `shadow/raised` | `color.text.feedback.warning`<br>`color.text.primary` | `color.icon.feedback.warning` |
| danger  | 264×32 | `color.surface.feedback.danger.subtle`  | `color.border.feedback.danger.subtle`  | `shadow/raised` | `color.text.feedback.danger`<br>`color.text.primary`  | `color.icon.feedback.danger`  |
| info    | 264×32 | `color.surface.feedback.info.subtle`    | `color.border.feedback.info.subtle`    | `shadow/raised` | `color.text.feedback.info`<br>`color.text.primary`    | `color.icon.feedback.info`    |
| neutral | 264×32 | `color.surface.feedback.neutral.subtle` | `color.border.subtle`                  | `shadow/raised` | `color.text.feedback.neutral`<br>`color.text.primary` | `color.icon.feedback.neutral` |

## Documentation card

**Description**

Transient notification for background operation results. Auto-dismisses after 4–7 seconds. Use for async outcomes — never for critical errors requiring confirmation.

**Statuses**

neutral Informational, low urgency.  
info Tip, update, or non-blocking hint.  
success Operation completed ('File saved').  
warning Caution or partial success.  
danger Operation failed. Stays longer (7s+) or until dismissed.

**Timing**

Default dismiss at 4s for neutral/success/info.  
Warning 6s. Danger 7s+ or manual dismiss.  
Pause on hover/focus — resume on leave.

**Labels & Content**

Lead with the outcome: 'Presentation saved' not 'Success'.  
One sentence. Add one optional action ('Undo', 'View').  
Never stack multiple actions.

**Rules**

- DO: Use for async background results
- DO: Pair with StatusIndicator icon
- DO: Pause dismiss timer on hover
- DO: Stack newer toasts on top

- DON'T: Use for confirmations (use Dialog)
- DON'T: Pack multiple actions
- DON'T: Show more than 3 toasts at once
- DON'T: Keep success toasts on screen > 5s
