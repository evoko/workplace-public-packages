# Auth — Sign In

> SOLAR Web · Figma page `↳ 🟢 Auth — Sign In` (id `2966:641`) · section `views/auth` · raw data: [`raw/views/auth/sign-in.json`](../../raw/views/auth/sign-in.json)

## Component set: Auth — Sign In / Email

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 16 pad 24/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.inverse` · fill `IMAGE` ⚠️ hard-coded · itemSpacing `inset.md` · padding `inset.none`, `inset.xl` · width `breakpoint.lg`
  - **App Name** · instance of **App Name** (type=horizontal) · column gap 16 pad 0/0/0/0 HUG/HUG · 85×59  
    itemSpacing `inset.md` · padding `inset.none` · radius `radius.control`
  - **Center Stack** · frame · column gap 20 pad 0/0/0/0 HUG/HUG · 400×388  
    itemSpacing `stack.lg`
    - **Welcome to App Name** · text `title/sm` "Welcome to App Name" · HUG/HUG · 207×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Manage every space effortlessly with intuitive tools for seamless operations and extraordinary experiences.** · text `body/md/regular` "Manage every space effortlessly with intuitive tools for seamless operations and" · HUG/HUG · 346×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Container** · instance of **Container** (type=outlined) · column gap 16 pad 16/16/16/16 FIXED/HUG · 400×274  
      fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
    - **Bottom** · frame · column gap 12 pad 0/0/0/0 HUG/HUG · 336×9  
      itemSpacing `inset.sm`
      - **Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 336×9  
        itemSpacing `inset.xs`
        - **Don’t have an account yet? Sign up** · text `body/sm/regular` "Don’t have an account yet? Sign up" · FIXED/HUG · 336×9  
          fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400,Primitives:type.font-weight.500` · textRangeFills `color.text.inverse,Color:text.tertiary`
  - **Footer** · frame · column gap 12 pad 0/0/0/0 HUG/HUG · 216×32  
    itemSpacing `stack.sm`
    - **Biamp Logo** · instance of **Biamp Logo** (style=light, size=sm) · FIXED/FIXED · 36×11
    - **© 2025 Biamp Systems LLC. v.1.2-b-fd** · text `body/sm/regular` "© 2025 Biamp Systems LLC. v.1.2-b-fd" · HUG/HUG · 216×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.inverse`, `color.surface.raised`                                                                                                                                                                                                         |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                                                   |
| Text color      | `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.action.secondary.text.default`, `color.action.secondary.text.disabled`, `color.text.feedback.info`, `color.text.inverse`, `color.text.primary`, `color.text.tertiary` |
| Icon color      | `color.action.primary.icon.default`, `color.action.primary.icon.disabled`, `color.action.secondary.icon.default`, `color.icon.tertiary`, `color.brand.red`, `color.brand.white`                                                                         |
| Spacing         | `inset.md`, `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`, `stack.sm`                                                                                                                                                        |
| Radius          | `radius.control`, `radius.dialog`                                                                                                                                                                                                                       |
| Border width    | `border.default`                                                                                                                                                                                                                                        |
| Sizes           | `breakpoint.lg`                                                                                                                                                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm`                           |
| Effects         | `shadow/overlay`                                                                                                                                                                                                                                        |
| Text styles     | `body/md/regular`, `body/sm/regular`, `title/sm`                                                                                                                                                                                                        |
| Other           | `textRangeFills={Color:text/inverse}`, `textRangeFills={Color:text/tertiary}`                                                                                                                                                                           |

### Composes

- App Name
- Biamp Logo
- Container

### Variant matrix

| breakpoint | size     | fill                                             | stroke | effect | text                                                                                                                                                                                                                                                                  | icon                                                                                                                                                                                                                                                                                                                 |
| ---------- | -------- | ------------------------------------------------ | ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.disabled`<br>`color.action.secondary.text.disabled` | `#ff5722` ⚠️ hard-coded<br>`#4caf50` ⚠️ hard-coded<br>`#ffc107` ⚠️ hard-coded<br>`#03a9f4` ⚠️ hard-coded<br>`color.action.secondary.icon.default`<br>`#ff3d00` ⚠️ hard-coded<br>`#1976d2` ⚠️ hard-coded<br>`color.icon.tertiary`<br>`color.action.primary.icon.disabled`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.primary`<br>`color.text.feedback.info`                                                                                   | `#ff5722` ⚠️ hard-coded<br>`#4caf50` ⚠️ hard-coded<br>`#ffc107` ⚠️ hard-coded<br>`#03a9f4` ⚠️ hard-coded<br>`color.action.secondary.icon.default`<br>`#ff3d00` ⚠️ hard-coded<br>`#1976d2` ⚠️ hard-coded<br>`color.icon.tertiary`<br>`color.action.primary.icon.default`<br>`color.brand.white`<br>`color.brand.red`  |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.brand.red`, `color.brand.white`.

## Component set: Auth — Sign In / Email + Password

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 16 pad 24/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.inverse` · fill `IMAGE` ⚠️ hard-coded · itemSpacing `inset.md` · padding `inset.none`, `inset.xl`
  - **App Name** · instance of **App Name** (type=horizontal) · column gap 16 pad 0/0/0/0 HUG/HUG · 85×59  
    itemSpacing `inset.md` · padding `inset.none` · radius `radius.control`
  - **Center Stack** · frame · column gap 20 pad 0/0/0/0 HUG/HUG · 400×386  
    itemSpacing `stack.lg`
    - **Welcome to App Name** · text `title/sm` "Welcome to App Name" · HUG/HUG · 207×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Manage every space effortlessly with intuitive tools for seamless operations and extraordinary experiences.** · text `body/md/regular` "Manage every space effortlessly with intuitive tools for seamless operations and" · HUG/HUG · 346×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Container** · instance of **Container** (type=outlined) · column gap 16 pad 16/16/16/16 FIXED/HUG · 400×272  
      fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
    - **Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 336×9  
      itemSpacing `inset.xs`
      - **Don’t have an account yet? Sign up** · text `body/sm/regular` "Don’t have an account yet? Sign up" · FIXED/HUG · 336×9  
        fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400,Primitives:type.font-weight.500` · textRangeFills `color.text.inverse,Color:text.tertiary`
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
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.default`, `color.text.feedback.info`, `color.text.inverse`, `color.text.primary`, `color.text.tertiary`               |
| Icon color      | `color.action.primary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.brand.red`, `color.brand.white`                                                                                       |
| Spacing         | `inset.md`, `inset.none`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`, `stack.sm`                                                                                                                                          |
| Radius          | `radius.control`, `radius.dialog`                                                                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                                                                              |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm` |
| Effects         | `shadow/overlay`                                                                                                                                                                                                              |
| Text styles     | `body/md/regular`, `body/sm/regular`, `title/sm`                                                                                                                                                                              |
| Other           | `textRangeFills={Color:text/inverse}`, `textRangeFills={Color:text/tertiary}`                                                                                                                                                 |

### Composes

- App Name
- Biamp Logo
- Container

### Variant matrix

| breakpoint | size     | fill                                             | stroke | effect | text                                                                                                                                                                                                                        | icon                                                                                                                                            |
| ---------- | -------- | ------------------------------------------------ | ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`<br>`color.action.tertiary.text.default` | `color.icon.primary`<br>`color.action.primary.icon.default`<br>`color.action.tertiary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`<br>`color.action.tertiary.text.default` | `color.icon.primary`<br>`color.action.primary.icon.default`<br>`color.action.tertiary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.brand.red`, `color.brand.white`.

## Documentation card

**Auth — Sign In / Email**

**Usage**

View template. Its written description is scheduled with the other view pages; until then this card documents the structure below. Compose it from the listed primitives and patterns — do not detach.

**Anatomy**

Top-level layers of the first variant: App Name · Center Stack · Footer. Instances keep their SOLAR component names.

**Specification**

2 variants.  
• breakpoint — mobile | desktop

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
