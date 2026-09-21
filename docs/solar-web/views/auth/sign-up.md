# Auth — Sign Up

> SOLAR Web · Figma page `↳ 🟢 Auth — Sign Up` (id `3768:2`) · section `views/auth` · raw data: [`raw/views/auth/sign-up.json`](../../raw/views/auth/sign-up.json)

## Component set: Auth — Sign Up

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 24/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.background` · padding `inset.none`, `inset.xl` · width `breakpoint.lg`
  - **App Name** · instance of **App Name** (type=horizontal) · column gap 16 pad 0/0/0/0 HUG/HUG · 85×59  
    itemSpacing `inset.md` · padding `inset.none` · radius `radius.control`
  - **Center Stack** · frame · column gap 40 pad 0/0/0/0 FIXED/HUG · 420×285
    - **FormSection** · instance of **FormSection** · column gap 28 pad 20/0/0/0 FIXED/HUG · 420×285  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.2xl` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
  - **Footer** · frame · column gap 12 pad 0/0/0/0 HUG/HUG · 216×32  
    itemSpacing `stack.sm`
    - **Biamp Logo** · instance of **Biamp Logo** (style=dark, size=sm) · FIXED/FIXED · 36×11
    - **© 2025 Biamp Systems LLC. v.1.2-b-fd** · text `body/sm/regular` "© 2025 Biamp Systems LLC. v.1.2-b-fd" · HUG/HUG · 216×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`                                                                                                                                            |
| Strokes         | `color.border.surface`                                                                                                                                                |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.inverse`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.brand.black`, `color.brand.red`, `color.brand.white`                               |
| Spacing         | `inset.md`, `inset.none`, `inset.xl`, `stack.2xl`, `stack.lg`, `stack.none`, `stack.sm`                                                                               |
| Radius          | `radius.control`                                                                                                                                                      |
| Border width    | `border.default`                                                                                                                                                      |
| Sizes           | `breakpoint.lg`                                                                                                                                                       |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.body.sm`, `type.size.body.sm`                                                                     |
| Text styles     | `body/sm/regular`                                                                                                                                                     |

### Composes

- App Name
- Biamp Logo
- FormSection

### Variant matrix

| breakpoint | size     | fill                       | stroke | effect | text                                                                                                                                                                            | icon                                                                                                                                                                                                                                                                                       |
| ---------- | -------- | -------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| desktop    | 1440×800 | `color.surface.background` |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`                         | `color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`#d92323` ⚠️ hard-coded<br>`#4caf50` ⚠️ hard-coded<br>`#ffc107` ⚠️ hard-coded<br>`#03a9f4` ⚠️ hard-coded<br>`#ff3d00` ⚠️ hard-coded<br>`#1976d2` ⚠️ hard-coded<br>`color.brand.black`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.background` |        |        | `color.text.inverse`<br>`color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary` | `color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`#d92323` ⚠️ hard-coded<br>`#4caf50` ⚠️ hard-coded<br>`#ffc107` ⚠️ hard-coded<br>`#03a9f4` ⚠️ hard-coded<br>`#ff3d00` ⚠️ hard-coded<br>`#1976d2` ⚠️ hard-coded<br>`color.brand.white`<br>`color.brand.red` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.brand.black`, `color.brand.red`, `color.brand.white`.
- Hard-coded gap `40px` on layer _Center Stack_

## Documentation card

**Description**

The account-creation screen — collect credentials and start onboarding. For new users; existing users go to Sign In.

**Layout**

Centered auth card: logo · title · form (name · email · password) · primary 'Create account' · 'Sign in' link · legal/consent line. Optional split brand panel.

**Responsive**

Desktop: centered card, optional brand panel beside it. Mobile: full-width, single stacked column.

**States**

default, submitting, field errors (inline validation), server error (Banner), success → verify-email / redirect.

**Accessibility**

One `<form>` with labelled fields; errors linked via aria-describedby and announced. Logical tab order; visible focus; password show/hide.

**Rules**

Validate fields inline  
State password rules up front  
Offer a path to Sign In  
State consent clearly

Hide requirements until submit  
Auto-submit the form  
Bury validation errors  
Ask for more than you need
