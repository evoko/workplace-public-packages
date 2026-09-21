# Alert

> SOLAR Web · Figma page `↳ 🟢 Alert` (id `2202:1217`) · section `components/feedback` · raw data: [`raw/components/feedback/alert.json`](../../raw/components/feedback/alert.json)

## Component set: Alert

Alert — callout message with semantic variants (default/info/success/warning/danger) and style options (filled/outlined). Toggle title, action button, and close button via boolean properties.

### Props

| Prop               | Type    | Options / default                                                  |
| ------------------ | ------- | ------------------------------------------------------------------ |
| `Variant`          | variant | default · info · **success** · warning · danger                    |
| `Style`            | variant | **filled** · outlined                                              |
| `Show title`       | boolean | default `true`                                                     |
| `Show action`      | boolean | default `true`                                                     |
| `Action`           | text    | default `Action`                                                   |
| `Description`      | text    | default `Lorem ipsum dolor sit amet, consectetur adipiscing elit.` |
| `Label`            | text    | default `Label`                                                    |
| `Show description` | boolean | default `true`                                                     |

Default variant: `Variant=success, Style=filled` · 10 variants · default size 466×74px

### Anatomy (default variant)

- **Variant=success, Style=filled** · component · row gap 12 pad 16/16/16/16 FIXED/HUG · 466×74  
  fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · effect `shadow/dialog` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=md) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 20×20  
    fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · itemSpacing `stack.none` · strokeWeight `border.default` · radius `radius.pill`
  - **content** · frame · column gap 12 pad 4/0/4/0 FILL/HUG · 348×42  
    itemSpacing `inset.sm` · padding `stack.2xs`
    - **title** · text `body/lg/medium` "Label" · FILL/HUG · 348×12  
      fill `color.text.feedback.success` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500` · prop visible←Show title, characters←Label
    - **description** · text `body/md/regular` "Lorem ipsum dolor sit amet, consectetur adipiscing elit." · FILL/HUG · 348×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop visible←Show description, characters←Description
  - **action-label** · text `body/md/medium` "Action" · HUG/HUG · 42×10  
    fill `color.text.feedback.success` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop visible←Show action, characters←Action

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.feedback.danger.subtle`, `color.surface.feedback.info.subtle`, `color.surface.feedback.neutral.subtle`, `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle`, `color.surface.feedback.warning.subtle` |
| Strokes         | `color.border.feedback.danger.subtle`, `color.border.feedback.info.subtle`, `color.border.feedback.success.subtle`, `color.border.feedback.warning.subtle`, `color.border.medium`, `color.border.subtle`                                                               |
| Text color      | `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.primary`                                                                                                                           |
| Icon color      | `color.icon.inverse`, `color.surface.feedback.danger.strong`, `color.surface.feedback.warning.strong`                                                                                                                                                                  |
| Spacing         | `inset.md`, `inset.sm`, `stack.2xs`, `stack.none`                                                                                                                                                                                                                      |
| Radius          | `radius.container`, `radius.pill`                                                                                                                                                                                                                                      |
| Border width    | `border.default`                                                                                                                                                                                                                                                       |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.lg`, `type.line-height.body.md`, `type.size.body.lg`, `type.size.body.md`                                                                                             |
| Effects         | `shadow/dialog`                                                                                                                                                                                                                                                        |
| Text styles     | `body/lg/medium`, `body/md/medium`, `body/md/regular`                                                                                                                                                                                                                  |

### Slots and prop-controlled layers

| Layer                 | Controlled property | Prop               |
| --------------------- | ------------------- | ------------------ |
| content › title       | visible             | `Show title`       |
| content › title       | characters          | `Label`            |
| content › description | visible             | `Show description` |
| content › description | characters          | `Description`      |
| action-label          | visible             | `Show action`      |
| action-label          | characters          | `Action`           |

### Composes

- StatusIndicator

### Variant matrix

| Variant | Style    | size   | fill                                    | stroke                                 | effect          | text                                                  | icon                                                            |
| ------- | -------- | ------ | --------------------------------------- | -------------------------------------- | --------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| success | filled   | 466×74 | `color.surface.feedback.success.subtle` | `color.border.feedback.success.subtle` | `shadow/dialog` | `color.text.feedback.success`<br>`color.text.primary` | `color.icon.inverse`                                            |
| success | outlined | 466×74 | `color.surface.base`                    | `color.border.subtle`                  | `shadow/dialog` | `color.text.feedback.success`<br>`color.text.primary` | `color.icon.inverse`                                            |
| warning | filled   | 466×74 | `color.surface.feedback.warning.subtle` | `color.border.feedback.warning.subtle` | `shadow/dialog` | `color.text.feedback.warning`<br>`color.text.primary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse` |
| warning | outlined | 466×74 | `color.surface.base`                    | `color.border.subtle`                  | `shadow/dialog` | `color.text.feedback.warning`<br>`color.text.primary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse` |
| danger  | filled   | 466×74 | `color.surface.feedback.danger.subtle`  | `color.border.feedback.danger.subtle`  | `shadow/dialog` | `color.text.feedback.danger`<br>`color.text.primary`  | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`  |
| danger  | outlined | 466×74 | `color.surface.base`                    | `color.border.subtle`                  | `shadow/dialog` | `color.text.feedback.danger`<br>`color.text.primary`  | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`  |
| info    | filled   | 466×74 | `color.surface.feedback.info.subtle`    | `color.border.feedback.info.subtle`    | `shadow/dialog` | `color.text.feedback.info`<br>`color.text.primary`    | `color.icon.inverse`                                            |
| info    | outlined | 466×74 | `color.surface.base`                    | `color.border.subtle`                  | `shadow/dialog` | `color.text.feedback.info`<br>`color.text.primary`    | `color.icon.inverse`                                            |
| default | filled   | 466×74 | `color.surface.feedback.neutral.subtle` | `color.border.subtle`                  | `shadow/dialog` | `color.text.primary`                                  | `color.icon.inverse`                                            |
| default | outlined | 466×74 | `color.surface.base`                    | `color.border.subtle`                  | `shadow/dialog` | `color.text.primary`                                  | `color.icon.inverse`                                            |

## Component set: Alert Small

Alert — callout message with semantic variants (default/info/success/warning/danger) and style options (filled/outlined). Toggle title, action button, and close button via boolean properties.

### Props

| Prop               | Type    | Options / default                                                  |
| ------------------ | ------- | ------------------------------------------------------------------ |
| `Variant`          | variant | default · info · **success** · warning · danger                    |
| `Style`            | variant | **filled** · outlined                                              |
| `Show title`       | boolean | default `true`                                                     |
| `Show action`      | boolean | default `true`                                                     |
| `Action`           | text    | default `Action`                                                   |
| `Description`      | text    | default `Lorem ipsum dolor sit amet, consectetur adipiscing elit.` |
| `Label`            | text    | default `Label`                                                    |
| `Show description` | boolean | default `true`                                                     |

Default variant: `Variant=success, Style=filled` · 10 variants · default size 466×60px

### Anatomy (default variant)

- **Variant=success, Style=filled** · component · row gap 12 pad 12/12/12/12 FIXED/HUG · 466×60  
  fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=sm) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 16×16  
    fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · itemSpacing `stack.none` · strokeWeight `border.default` · radius `radius.pill`
  - **content** · frame · column gap 8 pad 4/0/4/0 FILL/HUG · 360×36  
    itemSpacing `inset.xs` · padding `stack.2xs`
    - **title** · text `body/md/medium` "Label" · FILL/HUG · 360×10  
      fill `color.text.feedback.success` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop visible←Show title, characters←Label
    - **description** · text `body/md/regular` "Lorem ipsum dolor sit amet, consectetur adipiscing elit." · FILL/HUG · 360×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop visible←Show description, characters←Description
  - **action-label** · text `body/md/medium` "Action" · HUG/HUG · 42×10  
    fill `color.text.feedback.success` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop visible←Show action, characters←Action

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.feedback.danger.subtle`, `color.surface.feedback.info.subtle`, `color.surface.feedback.neutral.subtle`, `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle`, `color.surface.feedback.warning.subtle` |
| Strokes         | `color.border.feedback.danger.subtle`, `color.border.feedback.info.subtle`, `color.border.feedback.success.subtle`, `color.border.feedback.warning.subtle`, `color.border.medium`, `color.border.subtle`                                                               |
| Text color      | `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.primary`                                                                                                                           |
| Icon color      | `color.icon.inverse`, `color.surface.feedback.danger.strong`, `color.surface.feedback.warning.strong`                                                                                                                                                                  |
| Spacing         | `inset.sm`, `inset.xs`, `stack.2xs`, `stack.none`                                                                                                                                                                                                                      |
| Radius          | `radius.container`, `radius.pill`                                                                                                                                                                                                                                      |
| Border width    | `border.default`                                                                                                                                                                                                                                                       |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`                                                                                                                                              |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                                                                                                                                                                    |

### Slots and prop-controlled layers

| Layer                 | Controlled property | Prop               |
| --------------------- | ------------------- | ------------------ |
| content › title       | visible             | `Show title`       |
| content › title       | characters          | `Label`            |
| content › description | visible             | `Show description` |
| content › description | characters          | `Description`      |
| action-label          | visible             | `Show action`      |
| action-label          | characters          | `Action`           |

### Composes

- StatusIndicator

### Variant matrix

| Variant | Style    | size   | fill                                    | stroke                                 | effect | text                                                  | icon                                                            |
| ------- | -------- | ------ | --------------------------------------- | -------------------------------------- | ------ | ----------------------------------------------------- | --------------------------------------------------------------- |
| success | filled   | 466×60 | `color.surface.feedback.success.subtle` | `color.border.feedback.success.subtle` |        | `color.text.feedback.success`<br>`color.text.primary` | `color.icon.inverse`                                            |
| success | outlined | 466×60 | `color.surface.base`                    | `color.border.subtle`                  |        | `color.text.feedback.success`<br>`color.text.primary` | `color.icon.inverse`                                            |
| warning | filled   | 466×60 | `color.surface.feedback.warning.subtle` | `color.border.feedback.warning.subtle` |        | `color.text.feedback.warning`<br>`color.text.primary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse` |
| warning | outlined | 466×60 | `color.surface.base`                    | `color.border.subtle`                  |        | `color.text.feedback.warning`<br>`color.text.primary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse` |
| danger  | filled   | 466×60 | `color.surface.feedback.danger.subtle`  | `color.border.feedback.danger.subtle`  |        | `color.text.feedback.danger`<br>`color.text.primary`  | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`  |
| danger  | outlined | 466×60 | `color.surface.base`                    | `color.border.subtle`                  |        | `color.text.feedback.danger`<br>`color.text.primary`  | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`  |
| info    | filled   | 466×60 | `color.surface.feedback.info.subtle`    | `color.border.feedback.info.subtle`    |        | `color.text.feedback.info`<br>`color.text.primary`    | `color.icon.inverse`                                            |
| info    | outlined | 466×60 | `color.surface.base`                    | `color.border.subtle`                  |        | `color.text.feedback.info`<br>`color.text.primary`    | `color.icon.inverse`                                            |
| default | filled   | 466×60 | `color.surface.feedback.neutral.subtle` | `color.border.subtle`                  |        | `color.text.primary`                                  | `color.icon.inverse`                                            |
| default | outlined | 466×60 | `color.surface.base`                    | `color.border.subtle`                  |        | `color.text.primary`                                  | `color.icon.inverse`                                            |

## Documentation card

**Description**

Inline callout message for page-level or section-level context. Lower priority than Banner; higher persistence than Toast.

**Variants**

default Neutral informational callout.  
info Informational — blue.  
success Confirmation — green.  
warning Caution — amber.  
danger Error or critical — red.

**Style**

filled Solid feedback background. For prominent callouts inside pages.  
outlined Subtle border with white surface. For secondary or dense contexts.

**Labels & Content**

Title optional — use when the callout has a clear heading.  
One sentence body explaining the situation.  
Optional action button for resolution; close button to dismiss.  
Announce via aria-live=polite (assertive for danger).

**Rules**

- DO: Inline near the element it concerns
- DO: Pair with StatusIndicator icon
- DO: Use danger filled for blocking errors
- DO: Offer a clear resolution action

- DON'T: Use as a page-top notification (use Banner)
- DON'T: Use for transient outcomes (use Toast)
- DON'T: Hide critical errors behind outlined style
- DON'T: Stack multiple alerts without dividers
