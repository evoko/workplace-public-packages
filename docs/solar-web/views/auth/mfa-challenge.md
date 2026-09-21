# MFA Challenge

> SOLAR Web · Figma page `↳ 🟢 MFA Challenge` (id `5066:5`) · section `views/auth` · raw data: [`raw/views/auth/mfa-challenge.json`](../../raw/views/auth/mfa-challenge.json)

## Component set: Auth — MFA Challenge

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 24/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.inverse` · fill `IMAGE` ⚠️ hard-coded · fill `IMAGE` ⚠️ hard-coded · padding `inset.none`, `inset.xl` · width `breakpoint.lg`
  - **App Name** · instance of **App Name** (type=horizontal) · column gap 16 pad 0/0/0/0 HUG/HUG · 85×59  
    itemSpacing `inset.md` · padding `inset.none` · radius `radius.control`
  - **Center Stack** · frame · column gap 20 pad 0/0/0/0 HUG/HUG · 319×275  
    itemSpacing `stack.lg`
    - **Verify it's you** · text `title/sm` "Verify it's you" · HUG/HUG · 121×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Enter the 6-digit code from your authenticator app or from your trusted device.** · text `body/md/regular` "Enter the 6-digit code from your authenticator app or from your trusted device." · HUG/HUG · 319×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Container** · instance of **Container** (type=outlined) · column gap 16 pad 16/16/16/16 HUG/HUG · 292×154  
      fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
    - **Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 214×16  
      itemSpacing `inset.xs`
      - **Icon/HelpCircle** · instance of **Icon/HelpCircle** (solid=false) · FIXED/FIXED · 16×16  
        height `icon.sm`
      - **Try a different verification method.** · text "Try a different verification method." · HUG/HUG · 190×9  
        fill `color.text.tertiary` · lineHeight `line-height.body.xs` · fontFamily `type.font-family.inter` · fontSize `size.body.xs` · fontStyle `type.font-weight.400,Primitives:type.font-weight.500` · textRangeFills `color.text.tertiary`
  - **Footer** · frame · column gap 12 pad 0/0/0/0 HUG/HUG · 216×32  
    itemSpacing `stack.sm`
    - **Biamp Logo** · instance of **Biamp Logo** (style=light, size=sm) · FIXED/FIXED · 36×11
    - **© 2025 Biamp Systems LLC. v.1.2-b-fd** · text `body/sm/regular` "© 2025 Biamp Systems LLC. v.1.2-b-fd" · HUG/HUG · 216×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.inverse`, `color.surface.raised`                                                                                                                                                                                                                      |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                                                                |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.inverse`, `color.text.primary`, `color.text.tertiary`                                                                                            |
| Icon color      | `color.action.primary.icon.default`, `color.icon.tertiary`, `color.brand.red`, `color.brand.white`                                                                                                                                                                   |
| Spacing         | `inset.md`, `inset.none`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`, `stack.sm`                                                                                                                                                                                 |
| Radius          | `radius.control`, `radius.dialog`                                                                                                                                                                                                                                    |
| Border width    | `border.default`                                                                                                                                                                                                                                                     |
| Sizes           | `breakpoint.lg`, `icon.sm`                                                                                                                                                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `line-height.body.xs`, `size.body.xs`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm` |
| Effects         | `shadow/overlay`                                                                                                                                                                                                                                                     |
| Text styles     | `body/md/regular`, `body/sm/regular`, `title/sm`                                                                                                                                                                                                                     |
| Other           | `textRangeFills={Color:text/tertiary}`                                                                                                                                                                                                                               |

### Composes

- App Name
- Biamp Logo
- Container
- Icon/HelpCircle

### Variant matrix

| breakpoint | size     | fill                                                                      | stroke | effect | text                                                                                                                                                                                | icon                                                                                                     |
| ---------- | -------- | ------------------------------------------------------------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.primary.icon.default`<br>`color.icon.tertiary`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.primary.icon.default`<br>`color.icon.tertiary`<br>`color.brand.white`<br>`color.brand.red` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.brand.red`, `color.brand.white`.
- Bound to a LOCAL duplicate of a Foundations token (should bind the library variable): `Type(local):line-height/body/xs`, `Type(local):size/body/xs`.

## Documentation card

**Description**

The second-factor verification step during sign-in — code entry (authenticator / SMS) or passkey. Gates access after the password.

**Layout**

Auth card: title · active-method indicator · code / PIN input · primary 'Verify' · resend / try another method · trust-this-device option.

**Responsive**

Desktop centered card; mobile full-width with large code inputs.

**States**

default, verifying, wrong code (error + attempts left), expired / resend, locked out, success.

**Accessibility**

Code input labelled; autocomplete=one-time-code. Announce errors + attempts left via aria-live. Support paste + autofill; keyboard-complete.

**Rules**

Support paste + autofill of codes  
Show attempts remaining  
Offer an alternate method  
Allow trusted-device

Block paste  
Hide the active method  
Lock out with no recovery  
Rely on colour for errors
