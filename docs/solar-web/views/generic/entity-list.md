# Entity List

> SOLAR Web · Figma page `↳ 🟢 Entity List` (id `3768:5`) · section `views/generic` · raw data: [`raw/views/generic/entity-list.json`](../../raw/views/generic/entity-list.json)

## Component set: Entity List

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 1368×800  
  itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
  - **Page Header** · instance of **Page Header** (type=left-aligned, breakpoint=desktop) · column gap 0 pad 8/24/0/24 FILL/HUG · 1368×99  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.none` · padding `inset.xl`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **DataTable** · instance of **DataTable** (breakpoint=desktop, state=default) · column gap 0 pad 0/0/0/0 FILL/FILL · 1320×701  
    padding `inset.none` · radius `radius.none`

Instance census (tree capped at depth 3): Column Item ×70, Icon/None ×28, Tag ×14, Row ×14, RowSelect ×14, Checkbox ×14, RowExpand ×14, Icon/ChevronDown ×14, Icon/More ×13, Counter ×11, Tab Item ×8, StatusIndicator ×4, PaginationItem ×4, Breadcrumb Item ×3, Icon/ChevronRight ×3, Button ×3, Spinner ×3, Icon Button ×3, Icon/Filter ×2, Segmented Control Item ×2, PaginationNav ×2, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, Tabs ×1, DataTable ×1, TableHeader ×1, SearchField ×1, Icon/Search ×1, Segmented Control ×1, Icon/Columns ×1, Icon/Download ×1, Table ×1, TableFooter ×1, Dropdown ×1, Pagination ×1, Icon/ChevronLeft ×1, PaginationEllipsis ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                                                                                                  |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                                                                                                         |
| Spacing      | `inset.none`, `inset.xl`, `inset.xs`, `stack.none`                                                                                                                                                                                                                                                     |
| Radius       | `radius.container`, `radius.none`                                                                                                                                                                                                                                                                      |
| Border width | `border.default`                                                                                                                                                                                                                                                                                       |

### Composes

- DataTable
- Page Header

### Variant matrix

| breakpoint | size     | fill | stroke | effect | text                                                                                                                                                                                                                                                                                                                     | icon                                                                                                                                                                   |
| ---------- | -------- | ---- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×800 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.feedback.warning`<br>`color.text.feedback.danger` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                         |
| mobile     | 377×800  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.feedback.warning`<br>`color.text.feedback.danger`                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |

### Issues detected

- Component description is empty.

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
