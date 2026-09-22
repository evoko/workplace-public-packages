# Licenses

> SOLAR Web · Figma page `↳ 🟢 Licenses` (id `3768:11`) · section `views/org-admin` · raw data: [`raw/views/org-admin/licenses.json`](../../raw/views/org-admin/licenses.json)

## Component set: Licenses

Licenses / billing admin view (Biamp Pro AV). Org subscriptions with per-device & per-location metering, saved payment methods, and usage meters (ProgressBar feedback=warning near limit). Variants: breakpoint=desktop | mobile. Composed from Page Header, Section Nav Item, Tag, Button, ProgressBar.

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×811px

### Anatomy (default variant)

- **breakpoint=desktop** · component · row gap 8 pad 0/0/0/0 FIXED/FIXED · 1368×811  
  itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Space:stack.x-sm`
  - **Left** · frame · column gap 0 pad 12/12/12/12 FIXED/FILL · 221×811  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.sm` · radius `radius.container`, `radius.none`
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
  - **Center** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 1139×811  
    fill `color.surface.base` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`
    - **Page Header** · instance of **Page Header** (type=left-aligned, breakpoint=desktop) · column gap 0 pad 8/24/0/24 FILL/HUG · 1139×97  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.none` · padding `inset.xl`, `inset.xs`, `inset.none` · strokeWeight `border.default`
    - **Payment methods Section** · frame · column gap 12 pad 20/20/20/20 FILL/HUG · 1139×168  
      itemSpacing `stack.sm` · padding `stack.lg`
      - **Section Header** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1099×12
      - **Payment Cards** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 1099×104  
        itemSpacing `stack.md`
    - **Active subscriptions Section** · frame · column gap 12 pad 20/20/20/20 FILL/HUG · 1139×538  
      itemSpacing `stack.sm` · padding `stack.lg`
      - **Section Header** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 1099×12
      - **Subscription List** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 1099×474  
        itemSpacing `stack.sm`

Instance census (tree capped at depth 3): Icon/None ×37, Counter ×17, Tag ×10, Button ×9, Spinner ×9, Section Nav Item ×8, Tab Item ×8, Subscription Row ×5, ProgressBar ×4, Tree Group Header ×3, Breadcrumb Item ×3, Icon/ChevronRight ×2, Payment Method Card ×2, Icon/Users ×1, Icon/Shield ×1, Icon/Licenses ×1, Icon/File ×1, Icon/PanKnob ×1, Icon/Key ×1, Icon/Ethernet ×1, Icon/History ×1, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, StatusIndicator ×1, Tabs ×1, Icon/Subscription ×1, Icon/Plus ×1, Icon/Warning ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.active`, `color.surface.base`, `color.surface.raised`                                                                                                                                                                                                                                                   |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                                                                                                                  |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.danger.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.danger.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.feedback.warning`, `color.icon.primary`, `color.icon.secondary`, `color.neutral.900`                                                       |
| Spacing      | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`, `stack.none`, `stack.sm`, `stack.xs`                                                                                                                                                                                            |
| Radius       | `radius.container`, `radius.control`, `radius.none`                                                                                                                                                                                                                                                                    |
| Border width | `border.default`                                                                                                                                                                                                                                                                                                       |
| Other        | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Space:stack/x-sm}`                                                                                                                                                                                                                                                |

### Composes

- Page Header
- Section Nav Item
- Tree Group Header

### Variant matrix

| breakpoint | size     | fill                 | stroke | effect | text                                                                                                                                                                                                                                                                                                                                     | icon                                                                                                                                                                                                                                   |
| ---------- | -------- | -------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×811 |                      |        |        | `color.text.tertiary`<br>`color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.feedback.info`<br>`color.action.secondary.text.danger.default`<br>`color.text.feedback.neutral`<br>`color.text.feedback.warning` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.danger.default`<br>`color.neutral.900`<br>`color.icon.feedback.warning` |
| mobile     | 390×1228 | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.feedback.warning`<br>`color.action.secondary.text.default`                                                 | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.icon.feedback.warning`<br>`color.action.secondary.icon.default`                                                                       |

### Issues detected

- Primitive color bound directly (CLR-002): `color.neutral.900`.

## Component set: Subscription Row

Local (unpublished) row for the Licenses view. Variants: breakpoint=desktop|mobile × status=active|unsubscribed. Override Service Name / Meta / Usage Label / Price text, the Plan Tag, the ProgressBar value+feedback, and the action Button per instance. show-limit-tag toggles the 'Approaching limit' warning tag.

### Props

| Prop             | Type    | Options / default         |
| ---------------- | ------- | ------------------------- |
| `breakpoint`     | variant | **desktop** · mobile      |
| `status`         | variant | **active** · unsubscribed |
| `show-limit-tag` | boolean | default `false`           |

Default variant: `breakpoint=desktop, status=active` · 4 variants · default size 1099×80px

### Anatomy (default variant)

- **breakpoint=desktop, status=active** · component · row gap 20 pad 20/20/20/20 FIXED/FIXED · 1099×80  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.lg` · padding `inset.lg` · strokeWeight `border.default` · radius `radius.container`
  - **Info** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 559×42  
    itemSpacing `stack.xs`
    - **Title Row** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 274×24  
      itemSpacing `stack.xs`
      - **Service Name** · text `body/md/semibold` "Management & Monitoring Plus" · HUG/HUG · 203×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.600`
      - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 63×24  
        fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
    - ~~**Tag**~~ (hidden by default) · instance of **Tag** (status=warning, type=icon+text, invert=false) · row gap 4 pad 0/12/0/8 HUG/FIXED · 133×24  
      fill `color.surface.feedback.warning.subtle` · stroke `color.border.feedback.warning.subtle` 1px · itemSpacing `inset.2xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill` · prop visible←show-limit-tag
    - **Meta** · text `body/md/regular` "Per-device meter · renews MM / YY" · HUG/HUG · 225×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Meter** · frame · column gap 8 pad 0/0/0/0 FIXED/HUG · 210×23  
    itemSpacing `stack.xs`
    - **Usage Label** · text `body/sm/semibold` "12 / 25 devices" · HUG/HUG · 84×9  
      fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.600`
    - **ProgressBar** · instance of **ProgressBar** (feedback=neutral) · FIXED/FIXED · 200×6  
      fill `color.surface.muted` · itemSpacing `inset.xs`
  - **Price** · text `helper/md` "$0.00 / device · monthly" · FIXED/HUG · 150×30  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400`
  - **Button** · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
    fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.default`, `color.surface.background`, `color.surface.base`, `color.surface.feedback.neutral.subtle`, `color.surface.feedback.warning.subtle`, `color.surface.muted`                                  |
| Strokes         | `color.action.secondary.border.default`, `color.border.feedback.warning.subtle`, `color.border.medium`, `color.border.subtle`                                                                                                   |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.neutral`, `color.text.feedback.warning`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                   |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.feedback.warning`                                                                                                                                                            |
| Spacing         | `inset.2xs`, `inset.lg`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.xs`                                                                                                                                           |
| Radius          | `radius.container`, `radius.control`, `radius.pill`                                                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                                                                                |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.600`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.helper.md`, `type.size.body.md`, `type.size.body.sm`, `type.size.helper.md` |
| Effects         | `shadow/control`                                                                                                                                                                                                                |
| Text styles     | `body/md/regular`, `body/md/semibold`, `body/sm/semibold`, `helper/md`                                                                                                                                                          |

### Slots and prop-controlled layers

| Layer      | Controlled property | Prop             |
| ---------- | ------------------- | ---------------- |
| Info › Tag | visible             | `show-limit-tag` |

### Composes

- Button
- ProgressBar
- Tag

### Variant matrix

| breakpoint | status       | size    | fill                       | stroke                | effect | text                                                                                                                                                                                             | icon                                                                   |
| ---------- | ------------ | ------- | -------------------------- | --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| desktop    | active       | 1099×80 | `color.surface.base`       | `color.border.subtle` |        | `color.text.primary`<br>`color.text.feedback.neutral`<br>`color.text.feedback.warning`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.feedback.warning`<br>`color.action.secondary.icon.default` |
| desktop    | unsubscribed | 1099×80 | `color.surface.background` |                       |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                          | `color.action.secondary.icon.default`                                  |
| mobile     | active       | 358×161 | `color.surface.base`       | `color.border.subtle` |        | `color.text.primary`<br>`color.text.feedback.neutral`<br>`color.text.feedback.warning`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.feedback.warning`<br>`color.action.secondary.icon.default` |
| mobile     | unsubscribed | 358×134 | `color.surface.muted`      |                       |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                          | `color.action.secondary.icon.default`                                  |

## Component set: Payment Method Card

Local component for the Licenses view. type=method shows a saved payment method (card glyph, status Tag, masked number, expiry/contact). type=add is the dashed CTA tile for adding a method. Editable text via Card label, Card meta, and Action label properties.

### Props

| Prop               | Type    | Options / default                                |
| ------------------ | ------- | ------------------------------------------------ |
| `type`             | variant | **method** · add                                 |
| `Card label`       | text    | default `Card ending •••• 0000`                  |
| `Card meta`        | text    | default `Expires MM / YY · billing contact name` |
| `Action label`     | text    | default `Add payment method`                     |
| `showSetAsDefault` | boolean | default `false`                                  |

Default variant: `type=method` · 2 variants · default size 542×104px

### Anatomy (default variant)

- **type=method** · component · row gap 8 pad 20/20/20/20 FIXED/HUG · 542×104  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.xs` · padding `inset.lg` · strokeWeight `border.default` · radius `radius.container`
  - **Information** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 430×64  
    itemSpacing `inset.xs`
    - **Card Header** · frame · row gap 8 pad 0/0/4/0 FILL/HUG · 430×28  
      itemSpacing `inset.xs` · padding `stack.2xs`
      - **Icon/Subscription** · instance of **Icon/Subscription** (solid=false) · FIXED/FIXED · 24×24  
        width `icon.lg`
      - **Tag** · instance of **Tag** (status=info, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 64×24  
        fill `color.surface.feedback.info.subtle` · stroke `color.border.feedback.info.subtle` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
    - **Card ending •••• 0000** · text `body/md/medium` "Card ending •••• 0000" · HUG/HUG · 149×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←Card label
    - **Expires MM / YY · billing contact name** · text `helper/md` "Expires MM / YY · billing contact name" · HUG/HUG · 244×10  
      fill `color.text.tertiary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop characters←Card meta
  - ~~**Button**~~ (hidden by default) · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 92×32  
    stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←showSetAsDefault
  - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=true) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
    stroke `color.action.secondary.border.danger.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role            | Tokens                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.feedback.info.subtle`                                                                                                                                        |
| Strokes         | `color.action.secondary.border.danger.default`, `color.action.secondary.border.default`, `color.border.feedback.info.subtle`, `color.border.medium`, `color.border.subtle`                        |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.danger.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.primary`, `color.text.tertiary` |
| Icon color      | `color.action.secondary.icon.danger.default`, `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                                 |
| Spacing         | `inset.2xs`, `inset.lg`, `inset.none`, `inset.sm`, `inset.xs`, `stack.2xs`, `stack.xs`                                                                                                            |
| Radius          | `radius.container`, `radius.control`, `radius.pill`                                                                                                                                               |
| Border width    | `border.default`                                                                                                                                                                                  |
| Sizes           | `icon.lg`                                                                                                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.size.body.md`, `type.size.helper.md`                    |
| Effects         | `shadow/control`                                                                                                                                                                                  |
| Text styles     | `body/md/medium`, `helper/md`                                                                                                                                                                     |

### Slots and prop-controlled layers

| Layer                                                | Controlled property | Prop               |
| ---------------------------------------------------- | ------------------- | ------------------ |
| Information › Card ending •••• 0000                  | characters          | `Card label`       |
| Information › Expires MM / YY · billing contact name | characters          | `Card meta`        |
| Button                                               | visible             | `showSetAsDefault` |

### Composes

- Button
- Icon/Subscription
- Tag

### Variant matrix

| type   | size    | fill                 | stroke                | effect | text                                                                                                                                                                                                        | icon                                                                                                            |
| ------ | ------- | -------------------- | --------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| method | 542×104 | `color.surface.base` | `color.border.subtle` |        | `color.text.feedback.info`<br>`color.text.primary`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.danger.default` | `color.icon.secondary`<br>`color.action.secondary.icon.default`<br>`color.action.secondary.icon.danger.default` |
| add    | 542×104 |                      | `color.border.medium` |        | `color.text.primary`                                                                                                                                                                                        | `color.icon.primary`                                                                                            |

## Documentation card

**Description**

View and manage the org's license / subscription pools — seats used vs available, assignment and channel subscriptions. Billing detail lives in Billing History.

**Layout**

Summary cards (pools · seats used) · assignment table (product · seats · assignees) · manage / assign actions.

**Responsive**

Desktop: summary + table. Mobile: stacked pool cards + condensed assignment list.

**States**

loaded, loading, empty (no licenses), over-allocation warning, error.

**Accessibility**

Usage exposed as text, not only bars; tables labelled; assign / unassign confirmed. Keyboard-complete; visible focus.

**Rules**

Show used vs available clearly  
Warn near / over the limit  
Confirm reassignment  
Link to billing

Show usage by bar only  
Hide the limit  
Over-assign silently  
Conflate licenses with payment
