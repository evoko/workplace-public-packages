# Organization Selector

> SOLAR Web · Figma page `↳ 🟢 Organization Selector` (id `3768:3`) · section `views/auth` · raw data: [`raw/views/auth/organization-selector.json`](../../raw/views/auth/organization-selector.json)

## Component set: Organization Selector

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |
| `filled`     | variant | False · **True**     |

Default variant: `breakpoint=desktop, filled=True` · 4 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop, filled=True** · component · column gap 0 pad 0/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.inverse` · fill `IMAGE` ⚠️ hard-coded · fill `IMAGE` ⚠️ hard-coded · padding `inset.none`, `inset.xl` · width `breakpoint.lg`
  - **Top Bar** · instance of **Top Bar** (breakpoint=desktop, hasSidebar=true, isLoggedIn=True) · row gap 12 pad 0/16/0/16 FILL/FIXED · 1440×56  
    padding `stack.md`
  - **Center Stack** · frame · column gap 20 pad 0/0/0/0 HUG/HUG · 400×592  
    itemSpacing `stack.lg`
    - **Select organization** · text `title/sm` "Select organization" · HUG/HUG · 174×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Select your organization to access and manage your AV environments from a single, unified workspace.** · text `body/md/regular` "Select your organization to access and manage your AV environments from a single" · FILL/HUG · 400×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Container** · instance of **Container** (type=outlined) · column gap 16 pad 16/16/16/16 FIXED/HUG · 400×507  
      fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
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
| Text color      | `color.text.inverse`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.pink.700`, `color.purple.700`                                                                                               |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.inverse`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.brand.red`, `color.brand.white`                                                      |
| Spacing         | `inset.md`, `inset.none`, `inset.xl`, `stack.lg`, `stack.md`, `stack.sm`                                                                                                                                                      |
| Radius          | `radius.dialog`                                                                                                                                                                                                               |
| Border width    | `border.default`                                                                                                                                                                                                              |
| Sizes           | `breakpoint.lg`                                                                                                                                                                                                               |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm` |
| Effects         | `shadow/overlay`                                                                                                                                                                                                              |
| Text styles     | `body/md/regular`, `body/sm/regular`, `title/sm`                                                                                                                                                                              |

### Composes

- Biamp Logo
- Container
- Top Bar

### Variant matrix

| breakpoint | filled | size     | fill                                                                      | stroke | effect | text                                                                                                                                      | icon                                                                                                                                        |
| ---------- | ------ | -------- | ------------------------------------------------------------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | True   | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.purple.700`<br>`color.pink.700`<br>`color.text.secondary` | `color.icon.tertiary`<br>`color.icon.secondary`<br>`color.icon.inverse`<br>`color.icon.primary`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | True   | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.purple.700`<br>`color.text.tertiary`<br>`color.pink.700`<br>`color.text.primary`<br>`color.text.secondary` | `color.action.secondary.icon.default`<br>`color.icon.primary`<br>`color.icon.secondary`<br>`color.brand.white`<br>`color.brand.red`         |
| desktop    | False  | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.purple.700`<br>`color.pink.700`                           | `color.icon.tertiary`<br>`color.icon.secondary`<br>`color.icon.inverse`<br>`color.icon.primary`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | False  | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.purple.700`<br>`color.text.tertiary`<br>`color.pink.700`<br>`color.text.primary`                           | `color.action.secondary.icon.default`<br>`color.icon.primary`<br>`color.brand.white`<br>`color.brand.red`                                   |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.pink.700`, `color.purple.700`, `color.brand.red`, `color.brand.white`.

## Component: Organization Selector Overlay

### Anatomy (default variant)

- **Organization Selector Overlay** · component · column gap 0 pad 16/16/16/16 FIXED/HUG · 400×548  
  fill `color.surface.overlay` · effect `shadow/dialog` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
  - **content** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 368×516  
    itemSpacing `inset.sm`
    - **ListItem** · instance of **ListItem** (type=avatar, state=default, compact=false) · row gap 12 pad 16/16/16/16 FIXED/HUG · 368×64  
      stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=with-label) · row gap 12 pad 0/0/0/0 FILL/FIXED · 368×20  
      itemSpacing `stack.sm`
    - **List** · instance of **List** (in-card=true) · column gap 0 pad 0/0/0/0 HUG/HUG · 368×324  
      stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=with-label) · row gap 12 pad 0/0/0/0 FILL/FIXED · 368×20  
      itemSpacing `stack.sm`
    - **Button** · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 FILL/FIXED · 368×40  
      fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role         | Tokens                                                         |
| ------------ | -------------------------------------------------------------- |
| Fills        | `color.action.secondary.bg.default`, `color.surface.overlay`   |
| Strokes      | `color.action.secondary.border.default`, `color.border.subtle` |
| Spacing      | `inset.md`, `inset.sm`, `inset.xs`, `stack.sm`                 |
| Radius       | `radius.container`, `radius.control`, `radius.dialog`          |
| Border width | `border.default`                                               |
| Effects      | `shadow/control`, `shadow/dialog`, `shadow/raised`             |

### Composes

- Button
- Divider
- List
- ListItem

### Issues detected

- Component description is empty.

## Issues detected (page)

- Documentation card contains Breadcrumbs boilerplate text; it does not describe this component.

## Documentation card

**Auth — Organization Selector**

**Description**

Shows the user's location within a navigational hierarchy — and lets them jump back up the tree. Use for deep page structures where ancestors are meaningful destinations. Not for single-level flows (omit entirely), not for linear progress (use Stepper).

**Anatomy**

Breadcrumbs compose from Breadcrumb Items joined by a separator.  
Breadcrumb Item (4 variants) type: link | current — current is the final, non-interactive item.  
Breadcrumbs (5 variants) items: 2 | 3 | 4 | 5 | multiple — use 'multiple' when the trail exceeds 5 levels.

**States**

default Interactive ancestor link. Subtle text color.  
hover Full emphasis + underline. Touch targets pad to 44px per WCAG.  
disabled Non-interactive ancestor. Use sparingly — prefer omitting the item entirely.

**Truncation**

Switch to items=multiple once the trail exceeds 5 levels. The middle collapses to an ellipsis (…) while the first and last segments stay visible. Clicking the ellipsis opens a menu listing the hidden ancestors so users can jump to any of them without losing the endpoints.

**Accessibility**

Wrap the trail in `<nav aria-label="Breadcrumb">` and render as an ordered list.  
Mark the current item with aria-current="page" — never link it.  
Separators are decorative: aria-hidden="true".  
Keyboard: Tab moves between links, Enter activates. Ellipsis menu: Arrow keys to navigate, Esc to dismiss.
