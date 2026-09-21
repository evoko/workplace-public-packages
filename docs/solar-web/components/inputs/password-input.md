# Password Input

> SOLAR Web · Figma page `↳ 🟢 Password Input` (id `2163:3701`) · section `components/inputs` · raw data: [`raw/components/inputs/password-input.json`](../../raw/components/inputs/password-input.json)

## Component set: Password Input

Masked text field for password entry. 12 variants: size × state (default, hover, active, filled, disabled, error). Inherits Text Input's visual language and adds a trailing reveal/hide affordance (eye icon). Reveal toggle is advisory — the field remains `<input type="password">` for password-manager autofill. Never log or surface entered values; never use for data that shouldn't be masked (use Text Input with inputmode).

### Props

| Prop             | Type    | Options / default                                       |
| ---------------- | ------- | ------------------------------------------------------- |
| `size`           | variant | **md** · sm                                             |
| `state`          | variant | **default** · hover · filled · disabled · error · focus |
| `show label`     | boolean | default `true`                                          |
| `show helper`    | boolean | default `true`                                          |
| `show mandatory` | boolean | default `true`                                          |

Default variant: `size=md, state=default` · 12 variants · default size 240×76px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 FIXED/HUG · 240×76  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 76×10  
    itemSpacing `inset.2xs` · prop visible←show label
    - **Password** · text `body/md/medium` "Password" · HUG/HUG · 64×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop visible←show label
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←show mandatory
  - **Field** · frame · row gap 8 pad 0/16/0/16 FILL/FIXED · 240×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.md`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **•••••••••** · text `body/md/regular` "•••••••••" · FILL/HUG · 184×10  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Icon** · instance of **Icon/Eye** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
  - **Helper text** · text `helper/md` "Helper text" · FILL/HUG · 240×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←show helper

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                             |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                                                                              |
| Icon color      | `color.icon.primary`                                                                                                                                                                                                              |
| Spacing         | `inset.2xs`, `inset.md`, `inset.none`, `inset.xs`, `stack.xs`                                                                                                                                                                     |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Sizes           | `icon.sm`                                                                                                                                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                                                                                                                                                  |
| Text styles     | `body/md/medium`, `body/md/regular`, `helper/md`, `label/md`                                                                                                                                                                      |

### Slots and prop-controlled layers

| Layer            | Controlled property | Prop             |
| ---------------- | ------------------- | ---------------- |
| Label            | visible             | `show label`     |
| Label › Password | visible             | `show label`     |
| Label › \*       | visible             | `show mandatory` |
| Helper text      | visible             | `show helper`    |

### Composes

- Icon/Eye

### Variant matrix

| size | state    | size   | fill | stroke | effect | text                                                                                                  | icon                 |
| ---- | -------- | ------ | ---- | ------ | ------ | ----------------------------------------------------------------------------------------------------- | -------------------- |
| md   | default  | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.primary` |
| sm   | default  | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.primary` |
| md   | hover    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary` |
| sm   | hover    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary` |
| md   | focus    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary` |
| sm   | focus    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary` |
| md   | filled   | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary` |
| sm   | filled   | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary` |
| md   | disabled | 240×76 |      |        |        | `color.text.disabled`                                                                                 | `color.icon.primary` |
| sm   | disabled | 160×66 |      |        |        | `color.text.disabled`                                                                                 | `color.icon.primary` |
| md   | error    | 240×76 |      |        |        | `color.text.feedback.danger`<br>`color.text.primary`                                                  | `color.icon.primary` |
| sm   | error    | 160×66 |      |        |        | `color.text.feedback.danger`<br>`color.text.primary`                                                  | `color.icon.primary` |

## Documentation card

**Description**

Masked text field for password and secret entry. Inherits Text Input structure plus a trailing eye icon that toggles visibility. The reveal is advisory; the underlying field remains type="password" so password managers and browser autofill work correctly. Never for display-only secrets — use a copy-to-clipboard pattern for those.

**Sizes & States**

sm (36px) / md (44px) — same as Text Input.  
States: default, hover, active (flagged for rename to `focus`), filled, disabled, error. Error is plain language ("Password must be 12+ characters") — never echo the entered value, even partially.

**Content**

Label: "Password" or context-specific ("New password", "Confirm password"). Helper text shows live strength feedback OR static rules — don't show both at once. Error: rule-specific ("Must include a number"), never generic ("Invalid"). Minimum length in helper, not error.

**Accessibility**

Render as `<input type="password">` with `<label>`. Reveal toggle uses aria-pressed + aria-label="Show password" / "Hide password". Screen reader announces value change; do NOT remove the masking announcement. Autocomplete: new-password (create) or current-password (login) for password-manager support.

**Rules**

Do  
• Keep type="password" — reveal is visual only  
• Use autocomplete="new-password" / "current-password"  
• Show password-manager-compatible label text  
• Show length requirements in helper, not error

Don't  
• Don't disable paste — password managers paste  
• Don't echo entered values in errors  
• Don't require specific character classes beyond length — length > composition  
• Don't auto-submit on password complete — user hits submit
