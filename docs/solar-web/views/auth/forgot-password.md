# Forgot Password

> SOLAR Web · Figma page `↳ 🟢 Forgot Password` (id `5066:3`) · section `views/auth` · raw data: [`raw/views/auth/forgot-password.json`](../../raw/views/auth/forgot-password.json)

## Component set: Auth — Forgot Password

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 16 pad 24/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.inverse` · fill `IMAGE` ⚠️ hard-coded · fill `IMAGE` ⚠️ hard-coded · itemSpacing `inset.md` · padding `inset.none`, `inset.xl` · width `breakpoint.lg`
  - **App Name** · instance of **App Name** (type=horizontal) · column gap 16 pad 0/0/0/0 HUG/HUG · 85×59  
    itemSpacing `inset.md` · padding `inset.none` · radius `radius.control`
  - **Center Stack** · frame · column gap 20 pad 0/0/0/0 HUG/HUG · 400×267  
    itemSpacing `stack.lg`
    - **Welcome to App Name** · text `title/sm` "Welcome to App Name" · HUG/HUG · 207×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Manage every space effortlessly with intuitive tools for seamless operations and extraordinary experiences.** · text `body/md/regular` "Manage every space effortlessly with intuitive tools for seamless operations and" · HUG/HUG · 346×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Container** · instance of **Container** (type=outlined) · column gap 16 pad 16/16/16/16 FIXED/HUG · 400×146  
      fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
    - **Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 254×16  
      itemSpacing `inset.xs`
      - **Icon/HelpCircle** · instance of **Icon/HelpCircle** (solid=false) · FIXED/FIXED · 16×16  
        height `icon.sm`
      - **We'll find the right Sign-in method for you.** · text `body/sm/regular` "We'll find the right Sign-in method for you." · HUG/HUG · 230×9  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Footer** · frame · column gap 12 pad 0/0/0/0 HUG/HUG · 216×32  
    itemSpacing `stack.sm`
    - **Biamp Logo** · instance of **Biamp Logo** (style=light, size=sm) · FIXED/FIXED · 36×11
    - **© 2025 Biamp Systems LLC. v.1.2-b-fd** · text `body/sm/regular` "© 2025 Biamp Systems LLC. v.1.2-b-fd" · HUG/HUG · 216×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.inverse`, `color.surface.raised`                                                                                                                                                                               |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                         |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.inverse`, `color.text.primary`, `color.text.tertiary`                                                     |
| Icon color      | `color.action.primary.icon.default`, `color.icon.tertiary`, `color.brand.red`, `color.brand.white`                                                                                                                            |
| Spacing         | `inset.md`, `inset.none`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`, `stack.sm`                                                                                                                                          |
| Radius          | `radius.control`, `radius.dialog`                                                                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                                                                              |
| Sizes           | `breakpoint.lg`, `icon.sm`                                                                                                                                                                                                    |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm` |
| Effects         | `shadow/overlay`                                                                                                                                                                                                              |
| Text styles     | `body/md/regular`, `body/sm/regular`, `title/sm`                                                                                                                                                                              |

### Composes

- App Name
- Biamp Logo
- Container
- Icon/HelpCircle

### Variant matrix

| breakpoint | size     | fill                                                                      | stroke | effect | text                                                                                                                                                                                | icon                                                                                                     |
| ---------- | -------- | ------------------------------------------------------------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.tertiary`<br>`color.action.primary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.tertiary`<br>`color.action.primary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.brand.red`, `color.brand.white`.

## Documentation card

**Description**

The screen to request a password-reset link by email. Entry point to the reset flow; pairs with Reset Password.

**Layout**

Auth card: title · one-line explanation · email field · primary 'Send reset link' · 'Back to Sign In'.

**Responsive**

Desktop centered card; mobile full-width stacked.

**States**

default, submitting, success ('Check your email' — shown the same whether or not the account exists), error.

**Accessibility**

Labelled email field; success / error via aria-live. Never reveal whether an account exists. Keyboard-complete; visible focus.

**Rules**

Confirm send neutrally  
Keep it to email only  
Offer back to Sign In  
Rate-limit quietly

Reveal if the account exists  
Ask for extra info  
Move focus away from errors  
Dead-end on success
