# Invite Acceptance

> SOLAR Web · Figma page `↳ 🟢 Invite Acceptance` (id `5066:2`) · section `views/auth` · raw data: [`raw/views/auth/invite-acceptance.json`](../../raw/views/auth/invite-acceptance.json)

## Component set: Auth — Invite Acceptance

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
    - **You're invited to App Name** · text `title/sm` "You're invited to App Name" · HUG/HUG · 244×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Acme Industries invited you as Editor. Confirm your email to accept and create your account.** · text `body/md/regular` "Acme Industries invited you as Editor. Confirm your email to accept and create y" · HUG/HUG · 344×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Container** · instance of **Container** (type=outlined) · column gap 16 pad 16/16/16/16 FIXED/HUG · 400×150  
      fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
    - **Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 216×16  
      itemSpacing `inset.xs`
      - **Icon/HelpCircle** · instance of **Icon/HelpCircle** (solid=false) · FIXED/FIXED · 16×16  
        height `icon.sm`
      - **Already a member? Sign in instead.** · text `body/sm/regular` "Already a member? Sign in instead." · HUG/HUG · 192×9  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400,Primitives:type.font-weight.500`
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
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.disabled`, `color.text.inverse`, `color.text.tertiary`                                                                                |
| Icon color      | `color.action.primary.icon.default`, `color.icon.disabled`, `color.icon.tertiary`, `color.brand.red`, `color.brand.white`                                                                                                     |
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

| breakpoint | size     | fill                                                                      | stroke | effect | text                                                                                                                                                   | icon                                                                                                                              |
| ---------- | -------- | ------------------------------------------------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| default    | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.disabled`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.disabled`<br>`color.action.primary.icon.default`<br>`color.icon.tertiary`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.disabled`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.disabled`<br>`color.action.primary.icon.default`<br>`color.icon.tertiary`<br>`color.brand.white`<br>`color.brand.red` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.brand.red`, `color.brand.white`.

## Documentation card

**Auth — Invite Acceptance**

**Usage**

View template. Its written description is scheduled with the other view pages; until then this card documents the structure below. Compose it from the listed primitives and patterns — do not detach.

**Anatomy**

Top-level layers of the first variant: App Name · Center Stack · Footer. Instances keep their SOLAR component names.

**Specification**

2 variants.  
• breakpoint — default | mobile

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
