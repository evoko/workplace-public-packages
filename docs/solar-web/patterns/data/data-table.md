# Data Table

> SOLAR Web · Figma page `↳ 🟢 Data Table` (id `2202:1254`) · section `patterns/data` · raw data: [`raw/patterns/data/data-table.json`](../../raw/patterns/data/data-table.json)

## Component set: DataTable

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |
| `state`      | variant | **default** · empty  |

Default variant: `breakpoint=desktop, state=default` · 4 variants · default size 1280×752px

### Anatomy (default variant)

- **breakpoint=desktop, state=default** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1280×752  
  padding `inset.none` · radius `radius.none`
  - **TableHeader** · instance of **TableHeader** (breakpoint=desktop) · row gap 0 pad 8/0/8/0 FILL/HUG · 1280×56  
    padding `stack.none`, `inset.xs` · strokeWeight `border.default`
  - **Table** · instance of **Table** (breakpoint=desktop, expandable=true, selectable=true) · column gap 0 pad 0/0/0/0 FILL/HUG · 1280×640  
    stroke `color.border.subtle` mixedpx · padding `stack.none` · strokeWeight `border.default`
  - **TableFooter** · instance of **TableFooter** (breakpoint=desktop) · row gap 0 pad 8/0/8/0 FILL/HUG · 1280×56  
    padding `stack.none`, `inset.xs`

Instance census (tree capped at depth 3): Column Item ×80, Row ×16, RowSelect ×16, Checkbox ×16, RowExpand ×16, Icon/ChevronRight ×11, Icon/None ×8, PaginationItem ×4, Icon Button ×3, Icon/Filter ×2, Segmented Control Item ×2, Icon/ChevronDown ×2, PaginationNav ×2, TableHeader ×1, SearchField ×1, Icon/Search ×1, Segmented Control ×1, Icon/Columns ×1, Icon/Download ×1, Table ×1, TableFooter ×1, Dropdown ×1, Pagination ×1, Icon/ChevronLeft ×1, PaginationEllipsis ×1, Button ×1, Spinner ×1, Counter ×1

### Tokens used

| Role         | Tokens                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strokes      | `color.border.subtle`                                                                                                                                |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.neutral.900`        |
| Spacing      | `inset.none`, `inset.xs`, `stack.none`                                                                                                               |
| Radius       | `radius.none`                                                                                                                                        |
| Border width | `border.default`                                                                                                                                     |

### Composes

- Table
- TableFooter
- TableHeader

### Variant matrix

| breakpoint | state   | size     | fill | stroke | effect | text                                                                                                                                                         | icon                                                                                                                                                  |
| ---------- | ------- | -------- | ---- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | default | 1280×752 |      |        |        | `color.text.secondary`<br>`color.text.feedback.info`<br>`color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.neutral.900`<br>`color.action.primary.icon.default` |
| desktop    | empty   | 1280×752 |      |        |        | `color.text.secondary`<br>`color.text.feedback.info`<br>`color.text.primary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.neutral.900`<br>`color.action.primary.icon.default` |
| mobile     | default | 377×752  |      |        |        | `color.text.feedback.info`<br>`color.text.primary`<br>`color.text.secondary`<br>`color.action.primary.text.default`                                          | `color.icon.primary`<br>`color.icon.secondary`<br>`color.action.secondary.icon.default`<br>`color.neutral.900`<br>`color.action.primary.icon.default` |
| mobile     | empty   | 377×752  |      |        |        | `color.text.feedback.info`<br>`color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.primary`<br>`color.icon.secondary`<br>`color.action.secondary.icon.default`<br>`color.neutral.900`<br>`color.action.primary.icon.default` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.900`.

## Issues detected (page)

- Documentation card contains Breadcrumbs boilerplate text; it does not describe this component.

## Documentation card

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
