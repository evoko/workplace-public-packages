# Device List

> SOLAR Web · Figma page `↳ 🟢 Device List` (id `6133:3`) · section `views/devices` · raw data: [`raw/views/devices/device-list.json`](../../raw/views/devices/device-list.json)

## Component set: Devices List

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×744px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 1368×744  
  fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
  - **Page Header** · instance of **Page Header** (type=left-aligned, breakpoint=desktop) · column gap 0 pad 8/24/0/24 FIXED/HUG · 1368×111  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.none` · padding `inset.xl`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **DataTable** · instance of **DataTable** (breakpoint=desktop, state=default) · column gap 0 pad 0/0/0/0 FIXED/HUG · 1280×752  
    padding `inset.none` · radius `radius.none`

Instance census (tree capped at depth 3): Column Item ×91, Tag ×37, Icon/None ×31, Row ×13, RowSelect ×13, Checkbox ×13, RowExpand ×13, Icon/ChevronDown ×13, Counter ×11, Tab Item ×8, StatusIndicator ×4, PaginationItem ×4, Breadcrumb Item ×3, Icon/ChevronRight ×3, Button ×3, Spinner ×3, Icon Button ×3, Segmented Control Item ×2, PaginationNav ×2, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, Tabs ×1, DataTable ×1, TableHeader ×1, SearchField ×1, Icon/Search ×1, Icon/Filter ×1, Segmented Control ×1, Table ×1, TableFooter ×1, Dropdown ×1, Pagination ×1, Icon/ChevronLeft ×1, PaginationEllipsis ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.base`, `color.surface.raised`                                                                                                                                                                                                                            |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                                                                   |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.neutral.900`                                                                                     |
| Spacing      | `inset.none`, `inset.xl`, `inset.xs`, `stack.none`                                                                                                                                                                                                                      |
| Radius       | `radius.container`, `radius.none`                                                                                                                                                                                                                                       |
| Border width | `border.default`                                                                                                                                                                                                                                                        |

### Composes

- DataTable
- Page Header

### Variant matrix

| breakpoint | size     | fill                   | stroke | effect | text                                                                                                                                                                                                                                                                                    | icon                                                                                                                                                                                          |
| ---------- | -------- | ---------------------- | ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×744 | `color.surface.raised` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`<br>`color.text.feedback.danger`<br>`color.text.feedback.warning` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.neutral.900`                                         |
| mobile     | 377×744  | `color.surface.base`   |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`                                                                                                           | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.neutral.900`<br>`color.action.primary.icon.default` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.900`.

## Documentation card

**Description**

The inventory of devices / endpoints with status, type and quick actions — the entry point to device management. Detail lives in Device Detail.

**Layout**

Page header + Add device · Filter Panel / search · Data Table (name · type · status · location · last seen) · row actions.

**Responsive**

Desktop table; mobile device cards.

**States**

loaded, loading, empty (onboard prompt), no-results, error; row status (online / offline / warning).

**Accessibility**

Table labelled; status as text + icon, not colour; bulk actions announced; row → detail keyboard-reachable.

**Rules**

Show status + last seen  
Support filter / search  
Link rows to detail  
Offer bulk actions

Show status by colour only  
Hide offline devices silently  
Bulk-act without confirm  
Overload the row
