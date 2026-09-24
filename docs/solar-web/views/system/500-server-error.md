# 500 Server Error

> SOLAR Web · Figma page `↳ 🟢 500 Server Error` (id `5066:18`) · section `views/system` · raw data: [`raw/views/system/500-server-error.json`](../../raw/views/system/500-server-error.json)

## Component set: 500 Server Error

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 24/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.inverse` · fill `IMAGE` ⚠️ hard-coded · padding `inset.none`, `inset.xl` · width `breakpoint.lg`
  - **App Name** · instance of **App Name** (type=horizontal) · column gap 16 pad 0/0/0/0 HUG/HUG · 85×59  
    itemSpacing `inset.md` · padding `inset.none` · radius `radius.control`
  - **Center Stack** · frame · column gap 20 pad 0/0/0/0 HUG/HUG · 223×245  
    itemSpacing `stack.lg`
    - **icons8-broken-robot 1** · frame · FIXED/FIXED · 96×96
      - **Vector** · vector · 83×79  
        fill `color.icon.inverse`
    - **Error 500** · text `title/sm` "Error 500" · HUG/HUG · 86×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Something went wrong on our end. Please try again in a moment.** · text `body/md/regular` "Something went wrong on our end. Please try again in a moment." · HUG/HUG · 223×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Button** · instance of **Button** (size=md, prio=tertiary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 84×44  
      stroke `color.action.tertiary.border.default` 1px · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
  - **Footer** · frame · column gap 12 pad 0/0/0/0 HUG/HUG · 216×32  
    itemSpacing `stack.sm`
    - **Biamp Logo** · instance of **Biamp Logo** (style=light, size=sm) · FIXED/FIXED · 36×11
    - **© 2025 Biamp Systems LLC. v.1.2-b-fd** · text `body/sm/regular` "© 2025 Biamp Systems LLC. v.1.2-b-fd" · HUG/HUG · 216×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.inverse`                                                                                                                                                                                                       |
| Strokes         | `color.action.tertiary.border.default`                                                                                                                                                                                        |
| Text color      | `color.action.primary.text.default`, `color.action.tertiary.text.default`, `color.text.inverse`, `color.text.tertiary`                                                                                                        |
| Icon color      | `color.action.tertiary.icon.default`, `color.icon.inverse`, `color.brand.red`, `color.brand.white`                                                                                                                            |
| Spacing         | `inset.md`, `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.sm`                                                                                                                                          |
| Radius          | `radius.control`                                                                                                                                                                                                              |
| Border width    | `border.default`                                                                                                                                                                                                              |
| Sizes           | `breakpoint.lg`                                                                                                                                                                                                               |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm` |
| Text styles     | `body/md/regular`, `body/sm/regular`, `title/sm`                                                                                                                                                                              |

### Composes

- App Name
- Biamp Logo
- Button

### Variant matrix

| breakpoint | size     | fill                                             | stroke | effect | text                                                                                                                         | icon                                                                             |
| ---------- | -------- | ------------------------------------------------ | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.action.tertiary.text.default`<br>`color.action.primary.text.default` | `color.action.tertiary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.action.tertiary.text.default`<br>`color.action.primary.text.default` | `color.action.tertiary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.brand.red`, `color.brand.white`.

## Documentation card

**Usage**

View template. Its written description is scheduled with the other view pages; until then this card documents the structure below. Compose it from the listed primitives and patterns — do not detach.

**Anatomy**

Top-level layers of the first variant: App Name · Center Stack · Footer. Instances keep their SOLAR component names.

**Specification**

2 variants.  
• breakpoint — desktop | mobile

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
