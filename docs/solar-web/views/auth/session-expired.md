# Session Expired

> SOLAR Web · Figma page `↳ 🟢 Session Expired` (id `5066:7`) · section `views/auth` · raw data: [`raw/views/auth/session-expired.json`](../../raw/views/auth/session-expired.json)

## Component set: Auth — Session Expired

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **default** · mobile |

Default variant: `breakpoint=default` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=default** · component · column gap 0 pad 24/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.inverse` · fill `IMAGE` ⚠️ hard-coded · fill `IMAGE` ⚠️ hard-coded · padding `inset.none`, `inset.xl` · width `breakpoint.lg`
  - **App Name** · instance of **App Name** (type=horizontal) · column gap 16 pad 0/0/0/0 HUG/HUG · 85×59  
    itemSpacing `inset.md` · padding `inset.none` · radius `radius.control`
  - **Center Stack** · frame · column gap 20 pad 0/0/0/0 HUG/HUG · 400×271  
    itemSpacing `stack.lg`
    - **Your session has expired** · text `title/sm` "Your session has expired" · HUG/HUG · 224×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **For your security, you've been signed out due to inactivity. Sign in again to continue where you left off.** · text `body/md/regular` "For your security, you've been signed out due to inactivity. Sign in again to co" · HUG/HUG · 336×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Container** · instance of **Container** (type=outlined) · column gap 16 pad 16/16/16/16 FIXED/HUG · 400×150  
      fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
    - **Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 182×16  
      itemSpacing `inset.xs`
      - **Icon/HelpCircle** · instance of **Icon/HelpCircle** (solid=false) · FIXED/FIXED · 16×16  
        height `icon.sm`
      - **Need help? Contact support.** · text `body/sm/regular` "Need help? Contact support." · HUG/HUG · 158×9  
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
| default    | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.tertiary`<br>`color.action.primary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.tertiary`<br>`color.action.primary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.brand.red`, `color.brand.white`.

## Documentation card

**Description**

The interstitial shown when a session times out — informs the user and routes them to re-authenticate, preserving context where possible.

**Layout**

Centered card / dialog: icon · 'Session expired' title · plain explanation · primary 'Sign in again' · optional 'return to where you were' note.

**Responsive**

Desktop centered card / dialog; mobile full-width.

**States**

default (expired), re-auth in progress, error. May render as a modal over the last screen.

**Accessibility**

If modal, role=alertdialog with trapped, announced focus. One clear primary action. Keyboard-complete; visible focus.

**Rules**

Explain why plainly  
Preserve context  
Give one clear action  
Announce as an alert

Blame the user  
Dump them to a blank login  
Lose unsaved context silently  
Auto-redirect without notice
