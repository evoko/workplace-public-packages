# Billing History

> SOLAR Web · Figma page `↳ 🟢 Billing History` (id `5066:22`) · section `views/org-admin` · raw data: [`raw/views/org-admin/billing-history.json`](../../raw/views/org-admin/billing-history.json)

## Component set: Billing History

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×744px

### Anatomy (default variant)

- **breakpoint=desktop** · component · row gap 8 pad 0/0/0/0 FIXED/FIXED · 1368×744  
  itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Space:stack.x-sm`
  - **Left** · frame · column gap 0 pad 12/12/12/12 FIXED/FIXED · 221×744  
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
    - **Section Nav Item** · instance of **Section Nav Item** (state=selected) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      fill `color.surface.active` · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
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
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
    - **Members & Roles** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 1139×744  
      fill `color.surface.base`
      - **Page Header** · instance of **Page Header** (type=left-aligned, breakpoint=desktop) · column gap 0 pad 8/24/0/24 FILL/HUG · 1139×97  
        stroke `color.border.subtle` mixedpx · itemSpacing `stack.none` · padding `inset.xl`, `inset.xs`, `inset.none` · strokeWeight `border.default`
      - **DataTable** · frame · column gap 0 pad 0/20/0/20 FILL/FILL · 1139×591  
        padding `inset.lg` · radius `radius.none`
      - **TableFooter** · frame · row gap 0 pad 8/20/8/20 FILL/HUG · 1139×56  
        stroke `color.border.subtle` mixedpx · padding `inset.lg`, `inset.xs` · strokeWeight `border.default`
  - ~~**Right**~~ (hidden by default) · frame · column gap 0 pad 0/0/0/0 FIXED/FIXED · 336×744  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`, `radius.none`

Instance census (tree capped at depth 3): Column Item ×78, Icon/None ×34, Icon/ChevronDown ×16, Tag ×13, Row ×13, RowSelect ×13, Checkbox ×13, RowExpand ×13, Icon/More ×12, Counter ×10, Section Nav Item ×8, Tab Item ×8, Segmented Control Item ×6, PaginationItem ×4, Tree Group Header ×3, Breadcrumb Item ×3, Icon/ChevronRight ×3, Select ×3, Button ×2, Spinner ×2, Icon Button ×2, PaginationNav ×2, Icon/User ×1, Icon/Shield ×1, Icon/Licenses ×1, Icon/File ×1, Icon/PanKnob ×1, Icon/Key ×1, Icon/Ethernet ×1, Icon/History ×1, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, StatusIndicator ×1, Icon/Download ×1, Icon/Invite ×1, Tabs ×1, SearchField ×1, Icon/Search ×1, Icon/Filter ×1, Segmented Control ×1, Table ×1, Dropdown ×1, Pagination ×1, Icon/ChevronLeft ×1, PaginationEllipsis ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.active`, `color.surface.base`, `color.surface.raised`                                                                                                                                       |
| Strokes      | `color.border.subtle`                                                                                                                                                                                      |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                             |
| Spacing      | `inset.2xs`, `inset.lg`, `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.none`, `stack.xs`                                                                                                        |
| Radius       | `radius.container`, `radius.control`, `radius.none`                                                                                                                                                        |
| Border width | `border.default`                                                                                                                                                                                           |
| Other        | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Space:stack/x-sm}`                                                                                                                                    |

### Composes

- Page Header
- Section Nav Item
- Tree Group Header

### Variant matrix

| breakpoint | size     | fill                 | stroke | effect | text                                                                                                                                                                                                                   | icon                                                                                                                            |
| ---------- | -------- | -------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×744 |                      |        |        | `color.text.tertiary`<br>`color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.feedback.info` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`  |
| mobile     | 377×744  | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default` |

### Issues detected

- Component description is empty.

## Documentation card

**Description**

Read-only record of the org's invoices, payments and receipts. Plan / seat management lives in Licenses; this is the historical ledger.

**Layout**

Page header + date / type filter · Data Table (date · invoice # · amount · status · download) · pagination · total summary.

**Responsive**

Desktop table; mobile stacked invoice rows.

**States**

loaded, loading, empty (no invoices), no-results (filter), error.

**Accessibility**

Table labelled; amount + status as text, not colour; per-row download links labelled. Keyboard-complete; visible focus.

**Rules**

Keep it read-only  
Show status + amount clearly  
Allow invoice download  
Filter by date / type

Put payment editing here  
Show status by colour only  
Hide totals  
Paginate without a count
