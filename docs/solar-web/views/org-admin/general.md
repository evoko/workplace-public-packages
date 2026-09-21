# General

> SOLAR Web · Figma page `↳ 🟢 General` (id `5066:23`) · section `views/org-admin` · raw data: [`raw/views/org-admin/general.json`](../../raw/views/org-admin/general.json)

## Component set: General

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×700px

### Anatomy (default variant)

- **breakpoint=desktop** · component · row gap 8 pad 0/0/0/0 FIXED/HUG · 1368×700  
  itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Space:stack.x-sm`
  - **Left** · frame · column gap 0 pad 12/12/12/12 FIXED/FILL · 221×700  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.sm` · radius `radius.container`, `radius.none`
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
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=selected) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      fill `color.surface.active` · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
  - **Center** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 1139×700  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
    - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1139×105  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
    - **Form** · frame · column gap 24 pad 8/20/24/20 FILL/HUG · 1139×595
      - **FormSection** · instance of **FormSection** · column gap 20 pad 20/0/20/0 FILL/HUG · 640×378  
        stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
      - **FormSection** · instance of **FormSection** · column gap 20 pad 20/0/20/0 FILL/HUG · 640×161  
        stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
  - ~~**Right**~~ (hidden by default) · frame · column gap 0 pad 0/0/0/0 FIXED/FIXED · 336×744  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`, `radius.none`

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.active`, `color.surface.base`, `color.surface.raised`                                                                                                                                                                                     |
| Strokes      | `color.border.subtle`, `color.border.surface`                                                                                                                                                                                                            |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.danger.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.danger.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.neutral.900` |
| Spacing      | `inset.2xs`, `inset.lg`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.none`, `stack.xs`                                                                                                                                                      |
| Radius       | `radius.container`, `radius.control`, `radius.none`                                                                                                                                                                                                      |
| Border width | `border.default`                                                                                                                                                                                                                                         |
| Other        | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Space:stack/x-sm}`                                                                                                                                                                                  |

### Composes

- FormSection
- Page Header
- Section Nav Item
- Tree Group Header

### Variant matrix

| breakpoint | size     | fill                 | stroke | effect | text                                                                                                                                                                                                                                                                   | icon                                                                                                                                                                                                                           |
| ---------- | -------- | -------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| desktop    | 1368×700 |                      |        |        | `color.text.tertiary`<br>`color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.feedback.info`<br>`color.action.secondary.text.danger.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.tertiary`<br>`color.action.secondary.icon.danger.default` |
| mobile     | 377×692  | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.text.feedback.info`<br>`color.action.secondary.text.danger.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.icon.tertiary`<br>`color.action.secondary.icon.danger.default`                       |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.900`.
- Hard-coded gap `24px` on layer _Center › Form_
- Hard-coded paddingTop `8px` on layer _Center › Form_
- Hard-coded paddingRight `20px` on layer _Center › Form_
- Hard-coded paddingBottom `24px` on layer _Center › Form_
- Hard-coded paddingLeft `20px` on layer _Center › Form_

## Documentation card

**Description**

The org's general settings — name, logo, locale and defaults. The first, most common admin settings page.

**Layout**

Section Nav (Settings) + content: Form Rows for org name, logo upload, timezone / locale and defaults, with Save.

**Responsive**

Desktop: nav + panel. Mobile: stacked form.

**States**

loaded, editing, saving, saved, error; inline validation.

**Accessibility**

Fields labelled; logo upload has a text alternative; announce the save result. Keyboard-complete; visible focus.

**Rules**

Group basic org identity  
Validate inline  
Give clear save feedback  
Preview the logo

Mix billing / security here  
Auto-save silently  
Hide current values  
Block save on optional fields
