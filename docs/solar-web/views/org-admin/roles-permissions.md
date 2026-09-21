# Roles & Permissions

> SOLAR Web · Figma page `↳ 🟢 Roles & Permissions` (id `8001:29187`) · section `views/org-admin` · raw data: [`raw/views/org-admin/roles-permissions.json`](../../raw/views/org-admin/roles-permissions.json)

## Component set: Roles & Permissions

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |
| `step`       | variant | **01** · 02          |

Default variant: `breakpoint=desktop, step=01` · 3 variants · default size 1368×744px

### Anatomy (default variant)

- **breakpoint=desktop, step=01** · component · row gap 8 pad 0/0/0/0 FIXED/FIXED · 1368×744  
  itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Space:stack.x-sm`
  - **Left** · frame · column gap 0 pad 12/12/12/12 FIXED/FILL · 221×744  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.sm` · radius `radius.container`
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=selected) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      fill `color.surface.active` · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
  - **Center** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 1139×744  
    fill `color.surface.base` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`
    - **Page Header** · instance of **Page Header** (type=left-aligned, breakpoint=desktop) · column gap 0 pad 8/24/0/24 FILL/HUG · 1139×97  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.none` · padding `inset.xl`, `inset.xs`, `inset.none` · strokeWeight `border.default`
    - **Org Admin Body** · frame · row gap 16 pad 20/20/0/20 FILL/FILL · 1139×599  
      itemSpacing `stack.md` · padding `inset.lg`
      - **Role List** · instance of **List** (in-card=true) · column gap 0 pad 0/0/0/0 FIXED/HUG · 300×296  
        stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **Capability Matrix** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 783×501  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.container`
    - **Scope Footer** · frame · row gap 8 pad 12/20/12/20 FILL/HUG · 1139×48  
      itemSpacing `stack.xs` · padding `inset.lg`, `inset.sm`
      - **Scope:** · text `helper/md` "Scope:" · HUG/HUG · 45×10  
        fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400`
      - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 77×24  
        fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
      - **· per-Location / per-Zone scoping is a separate axis (deferred to v1.1)** · text `helper/md` "· per-Location / per-Zone scoping is a separate axis (deferred to v1.1)" · HUG/HUG · 437×10  
        fill `color.text.tertiary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400`

Instance census (tree capped at depth 3): Checkbox ×31, Icon/None ×26, Counter ×16, Section Nav Item ×8, Tab Item ×8, ListItem ×7, Divider ×4, Tree Group Header ×3, Breadcrumb Item ×3, Icon/ChevronRight ×3, Tag ×2, Button ×2, Spinner ×2, Icon/Users ×1, Icon/Shield ×1, Icon/Licenses ×1, Icon/File ×1, Icon/PanKnob ×1, Icon/Key ×1, Icon/Ethernet ×1, Icon/History ×1, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, StatusIndicator ×1, Tabs ×1, List ×1, Icon/Plus ×1

### Tokens used

| Role            | Tokens                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.active`, `color.surface.base`, `color.surface.feedback.neutral.subtle`, `color.surface.raised`                                                                                                 |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                                                  |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.inverse`, `color.icon.primary`, `color.icon.secondary`                          |
| Spacing         | `inset.2xs`, `inset.lg`, `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.md`, `stack.none`, `stack.xs`                                                                                               |
| Radius          | `radius.container`, `radius.control`, `radius.pill`                                                                                                                                                           |
| Border width    | `border.default`                                                                                                                                                                                              |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.helper.md`, `type.size.helper.md`                                                                                                         |
| Effects         | `shadow/raised`                                                                                                                                                                                               |
| Text styles     | `helper/md`                                                                                                                                                                                                   |
| Other           | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Space:stack/x-sm}`                                                                                                                                       |

### Composes

- List
- Page Header
- Section Nav Item
- Tag
- Tree Group Header

### Variant matrix

| breakpoint | step | size     | fill                 | stroke | effect | text                                                                                                                                                                                                                      | icon                                                                                                                                                                                           |
| ---------- | ---- | -------- | -------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 01   | 1368×744 |                      |        |        | `color.text.tertiary`<br>`color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.feedback.neutral` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.inverse`                                         |
| mobile     | 01   | 377×744  | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`                                                                           | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`                                                                                                         |
| mobile     | 02   | 377×2280 | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.neutral`<br>`color.action.secondary.text.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.icon.inverse`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |

### Issues detected

- Component description is empty.

## Documentation card

**Description**

Define roles and the permissions attached to them across the org. Governance; assignment to people happens in Members.

**Layout**

Role list / Section Nav · permission matrix (Table of permission × allow) · Save; optional custom-role create.

**Responsive**

Desktop: roles + matrix side by side. Mobile: role list drilling into a permission list.

**States**

loaded, editing, saving, saved, error; system roles read-only; conflict / escalation warnings.

**Accessibility**

Permission matrix as a labelled table; toggles announce state; read-only system roles marked. Keyboard-complete; visible focus.

**Rules**

Mark system roles read-only  
Group permissions logically  
Warn on privilege escalation  
Confirm before save

Allow lockout (removing all admins)  
Hide inherited permissions  
Rely on colour for allow / deny  
Auto-apply without save
