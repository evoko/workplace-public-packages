# Join or Create Organization

> SOLAR Web · Figma page `↳ 🟢 Join or Create Organization` (id `9441:1818`) · section `views/auth` · raw data: [`raw/views/auth/join-or-create-organization.json`](../../raw/views/auth/join-or-create-organization.json)

## Component set: Auth — Join Organization

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 16 pad 0/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.inverse` · fill `IMAGE` ⚠️ hard-coded · fill `IMAGE` ⚠️ hard-coded · itemSpacing `inset.md` · padding `inset.none`, `inset.xl` · width `breakpoint.lg`
  - **Top Bar** · instance of **Top Bar** (breakpoint=desktop, hasSidebar=true, isLoggedIn=true) · row gap 12 pad 0/16/0/16 FILL/FIXED · 1440×56  
    itemSpacing `inset.sm` · padding `stack.md`
  - **Center Stack** · frame · column gap 20 pad 0/0/0/0 HUG/HUG · 400×227  
    itemSpacing `stack.lg`
    - **Join organization** · text `title/sm` "Join organization" · HUG/HUG · 155×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Ask to join an organization by entering the organization ID. Once sent, the organization will be able to accept your request.** · text `body/md/regular` "Ask to join an organization by entering the organization ID. Once sent, the orga" · FILL/HUG · 400×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Container** · instance of **Container** (type=outlined) · column gap 16 pad 16/16/16/16 FIXED/HUG · 400×142  
      fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
  - **Footer** · frame · column gap 12 pad 0/0/0/0 HUG/HUG · 216×32  
    itemSpacing `stack.sm`
    - **Biamp Logo** · instance of **Biamp Logo** (style=light, size=sm) · FIXED/FIXED · 36×11
    - **© 2025 Biamp Systems LLC. v.1.2-b-fd** · text `body/sm/regular` "© 2025 Biamp Systems LLC. v.1.2-b-fd" · HUG/HUG · 216×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.inverse`, `color.surface.raised`                                                                                                                                                                                                     |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                                               |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.default`, `color.text.feedback.info`, `color.text.inverse`, `color.text.primary`, `color.text.tertiary`, `color.purple.700`                 |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.inverse`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.brand.red`, `color.brand.white` |
| Spacing         | `inset.md`, `inset.none`, `inset.sm`, `inset.xl`, `stack.lg`, `stack.md`, `stack.sm`                                                                                                                                                                |
| Radius          | `radius.dialog`                                                                                                                                                                                                                                     |
| Border width    | `border.default`                                                                                                                                                                                                                                    |
| Sizes           | `breakpoint.lg`                                                                                                                                                                                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm`                       |
| Effects         | `shadow/overlay`                                                                                                                                                                                                                                    |
| Text styles     | `body/md/regular`, `body/sm/regular`, `title/sm`                                                                                                                                                                                                    |

### Composes

- Biamp Logo
- Container
- Top Bar

### Variant matrix

| breakpoint | size     | fill                                                                      | stroke | effect | text                                                                                                                                                                                                                                              | icon                                                                                                                                                                                                                        |
| ---------- | -------- | ------------------------------------------------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.purple.700`<br>`color.text.feedback.info`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                         | `color.icon.tertiary`<br>`color.icon.secondary`<br>`color.icon.inverse`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.purple.700`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`<br>`color.action.tertiary.text.default` | `color.action.secondary.icon.default`<br>`color.icon.tertiary`<br>`color.action.primary.icon.default`<br>`color.action.tertiary.icon.default`<br>`color.brand.white`<br>`color.brand.red`                                   |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.purple.700`, `color.brand.red`, `color.brand.white`.

## Component set: Auth — Create Organization

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 16 pad 0/0/24/0 FIXED/FIXED · 1440×800  
  fill `color.surface.inverse` · fill `IMAGE` ⚠️ hard-coded · fill `IMAGE` ⚠️ hard-coded · itemSpacing `inset.md` · padding `inset.none`, `inset.xl` · width `breakpoint.lg`
  - **Top Bar** · instance of **Top Bar** (breakpoint=desktop, hasSidebar=true, isLoggedIn=true) · row gap 12 pad 0/16/0/16 FILL/FIXED · 1440×56  
    itemSpacing `inset.sm` · padding `stack.md`
  - **Center Stack** · frame · column gap 20 pad 0/0/0/0 HUG/HUG · 400×325  
    itemSpacing `stack.lg`
    - **Create organization** · text `title/sm` "Create organization" · HUG/HUG · 178×15  
      fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Set up your organization to start managing your spaces.  Your data region can't be changed later.** · text `body/md/regular` "Set up your organization to start managing your spaces.  Your data region can't " · FIXED/HUG · 392×30  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Container** · instance of **Container** (type=outlined) · column gap 16 pad 16/16/16/16 FIXED/HUG · 400×240  
      fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/overlay` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.dialog`
  - **Footer** · frame · column gap 12 pad 0/0/0/0 HUG/HUG · 216×32  
    itemSpacing `stack.sm`
    - **Biamp Logo** · instance of **Biamp Logo** (style=light, size=sm) · FIXED/FIXED · 36×11
    - **© 2025 Biamp Systems LLC. v.1.2-b-fd** · text `body/sm/regular` "© 2025 Biamp Systems LLC. v.1.2-b-fd" · HUG/HUG · 216×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.inverse`, `color.surface.raised`                                                                                                                                                                                                     |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                                               |
| Text color      | `text.primary`, `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.default`, `color.text.feedback.info`, `color.text.inverse`, `color.text.primary`, `color.text.tertiary`, `color.purple.700` |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.inverse`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.brand.red`, `color.brand.white` |
| Spacing         | `inset.md`, `inset.none`, `inset.sm`, `inset.xl`, `stack.lg`, `stack.md`, `stack.sm`                                                                                                                                                                |
| Radius          | `radius.dialog`                                                                                                                                                                                                                                     |
| Border width    | `border.default`                                                                                                                                                                                                                                    |
| Sizes           | `breakpoint.lg`                                                                                                                                                                                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm`                       |
| Effects         | `shadow/overlay`                                                                                                                                                                                                                                    |
| Text styles     | `body/md/regular`, `body/sm/regular`, `title/sm`                                                                                                                                                                                                    |

### Composes

- Biamp Logo
- Container
- Top Bar

### Variant matrix

| breakpoint | size     | fill                                                                      | stroke | effect | text                                                                                                                                                                                                                                                                               | icon                                                                                                                                                                                                                        |
| ---------- | -------- | ------------------------------------------------------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.purple.700`<br>`color.text.feedback.info`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                                                          | `color.icon.tertiary`<br>`color.icon.secondary`<br>`color.icon.inverse`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.brand.white`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.inverse`<br>`IMAGE` ⚠️ hard-coded<br>`IMAGE` ⚠️ hard-coded |        |        | `color.text.inverse`<br>`color.purple.700`<br>`color.text.tertiary`<br>`color.text.primary`<br>`color.text.feedback.info`<br>`text.primary` (Color(local))<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`<br>`color.action.tertiary.text.default` | `color.action.secondary.icon.default`<br>`color.icon.primary`<br>`color.icon.tertiary`<br>`color.action.primary.icon.default`<br>`color.action.tertiary.icon.default`<br>`color.brand.white`<br>`color.brand.red`           |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.purple.700`, `color.brand.red`, `color.brand.white`.
- Bound to a LOCAL duplicate of a Foundations token (should bind the library variable): `Color(local):text/primary`.

## Documentation card

**Description**

The post-signup step to join an existing organization (invite / code) or create a new one. Routes the user into a workspace.

**Layout**

Two Option Cards (Join / Create) or tabs: Join (invite list / code) · Create (org name + details). Primary 'Continue'.

**Responsive**

Desktop: option cards side by side. Mobile: stacked.

**States**

default, validating code, no-invites (create only), submitting, error, success → workspace.

**Accessibility**

Options as a radiogroup; the whole card selectable. Labelled fields; errors linked. Keyboard-navigable; visible focus.

**Rules**

Make Join vs Create obvious  
Validate invite codes inline  
Handle the no-invites case  
Explain what an org is

Force create when an invite exists  
Hide either path  
Rely on colour for the selected option  
Over-ask on create
