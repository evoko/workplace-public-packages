# Pagination

> SOLAR Web · Figma page `↳ 🟢 Pagination` (id `2163:3713`) · section `components/navigation` · raw data: [`raw/components/navigation/pagination.json`](../../raw/components/navigation/pagination.json)

## Component set: PaginationItem

Numeric page selector used inside Pagination. 10 variants: selected (false/true) × state (default, hover, pressed, focus, disabled). Selected renders in action/tertiary/bg/active treatment; unselected is plain text in action/tertiary chrome. Hit area is 44×44 minimum (WCAG 2.5.5). Use inside the Pagination assembly — not standalone.

### Props

| Prop       | Type    | Options / default                                |
| ---------- | ------- | ------------------------------------------------ |
| `selected` | variant | **false** · true                                 |
| `state`    | variant | **default** · hover · pressed · focus · disabled |
| `page`     | text    | default `1`                                      |

Default variant: `selected=false, state=default` · 10 variants · default size 24×24px

### Anatomy (default variant)

- **selected=false, state=default** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
  radius `radius.container`
  - **Label** · text `label/md` "1" · FILL/FILL · 24×24  
    fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←page

### Tokens used

| Role            | Tokens                                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.active`, `color.action.primary.bg.default`, `color.action.primary.bg.disabled`, `color.action.primary.bg.hover`, `color.surface.active`, `color.surface.hover` |
| Text color      | `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.text.disabled`, `color.text.primary`                                                                  |
| Radius          | `radius.container`                                                                                                                                                                      |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md`                                                                                     |
| Effects         | `shadow/focus/default`                                                                                                                                                                  |
| Text styles     | `label/md`                                                                                                                                                                              |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop   |
| ----- | ------------------- | ------ |
| Label | characters          | `page` |

### Variant matrix

| selected | state    | size  | fill                               | stroke | effect                 | text                                 | icon |
| -------- | -------- | ----- | ---------------------------------- | ------ | ---------------------- | ------------------------------------ | ---- |
| false    | default  | 24×24 |                                    |        |                        | `color.text.primary`                 |      |
| false    | hover    | 24×24 | `color.surface.hover`              |        |                        | `color.text.primary`                 |      |
| false    | pressed  | 24×24 | `color.surface.active`             |        |                        | `color.text.primary`                 |      |
| false    | focus    | 24×24 |                                    |        | `shadow/focus/default` | `color.text.primary`                 |      |
| false    | disabled | 24×24 |                                    |        |                        | `color.text.disabled`                |      |
| true     | default  | 24×24 | `color.action.primary.bg.default`  |        |                        | `color.action.primary.text.default`  |      |
| true     | hover    | 24×24 | `color.action.primary.bg.hover`    |        |                        | `color.action.primary.text.default`  |      |
| true     | pressed  | 24×24 | `color.action.primary.bg.active`   |        |                        | `color.action.primary.text.default`  |      |
| true     | focus    | 24×24 | `color.action.primary.bg.default`  |        | `shadow/focus/default` | `color.action.primary.text.default`  |      |
| true     | disabled | 24×24 | `color.action.primary.bg.disabled` |        |                        | `color.action.primary.text.disabled` |      |

## Component set: PaginationNav

Previous/next arrow used inside Pagination. 10 variants: direction (previous/next) × state (default, hover, pressed, focus, disabled). Chevron icon flips by direction. Disabled when the pager is at the first (previous) or last (next) page. In RTL contexts, mirror via layout direction — do not swap the direction variant.

### Props

| Prop        | Type    | Options / default                                |
| ----------- | ------- | ------------------------------------------------ |
| `direction` | variant | **previous** · next                              |
| `state`     | variant | **default** · hover · pressed · focus · disabled |

Default variant: `direction=previous, state=default` · 10 variants · default size 24×24px

### Anatomy (default variant)

- **direction=previous, state=default** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
  radius `radius.container`
  - **Icon** · instance of **Icon/ChevronLeft** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm`

### Tokens used

| Role       | Tokens                                        |
| ---------- | --------------------------------------------- |
| Fills      | `color.surface.active`, `color.surface.hover` |
| Icon color | `color.icon.disabled`, `color.icon.primary`   |
| Radius     | `radius.container`                            |
| Sizes      | `icon.sm`                                     |
| Effects    | `shadow/focus/default`                        |

### Composes

- Icon/ChevronLeft

### Variant matrix

| direction | state    | size  | fill                   | stroke | effect                 | text | icon                  |
| --------- | -------- | ----- | ---------------------- | ------ | ---------------------- | ---- | --------------------- |
| previous  | default  | 24×24 |                        |        |                        |      | `color.icon.primary`  |
| previous  | hover    | 24×24 | `color.surface.hover`  |        |                        |      | `color.icon.primary`  |
| previous  | pressed  | 24×24 | `color.surface.active` |        |                        |      | `color.icon.primary`  |
| previous  | focus    | 24×24 |                        |        | `shadow/focus/default` |      | `color.icon.primary`  |
| previous  | disabled | 24×24 |                        |        |                        |      | `color.icon.disabled` |
| next      | default  | 24×24 |                        |        |                        |      | `color.icon.primary`  |
| next      | hover    | 24×24 | `color.surface.hover`  |        |                        |      | `color.icon.primary`  |
| next      | pressed  | 24×24 | `color.surface.active` |        |                        |      | `color.icon.primary`  |
| next      | focus    | 24×24 |                        |        | `shadow/focus/default` |      | `color.icon.primary`  |
| next      | disabled | 24×24 |                        |        |                        |      | `color.icon.disabled` |

## Component: PaginationEllipsis

Static placeholder for omitted page numbers inside Pagination. Non-interactive, no hit area, no focus. Use between the first-page cluster and last-page cluster when the total page count exceeds what the assembly can show without crowding.

### Anatomy (default variant)

- **PaginationEllipsis** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
  radius `radius.control`
  - **Label** · text `label/md` "..." · FILL/FILL · 24×24  
    fill `color.text.secondary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Text color      | `color.text.secondary`                                                                              |
| Radius          | `radius.control`                                                                                    |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md` |
| Text styles     | `label/md`                                                                                          |

## Component: Pagination

Composed page selector — previous arrow, page items with ellipsis gaps, next arrow. Shows the first page, the last page, the current page ± 1, and three pages at the end the current page is near (1 2 3 … 12). The previous arrow is disabled on the first page and the next arrow on the last. Items are 24px squares, above WCAG 2.2's 24px minimum target. Use where the total page count is known and random access matters; for linear step-through use Page Navigator.

### Anatomy (default variant)

- **Pagination** · component · row gap 8 pad 0/0/0/0 HUG/HUG · 216×24  
  itemSpacing `stack.xs`
  - **Previous** · instance of **PaginationNav** (direction=previous, state=disabled) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
    radius `radius.container`
  - **Page1** · instance of **PaginationItem** (selected=true, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
    fill `color.action.primary.bg.default` · radius `radius.container`
  - **Page2** · instance of **PaginationItem** (selected=false, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
    radius `radius.container`
  - **Page3** · instance of **PaginationItem** (selected=false, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
    radius `radius.container`
  - **PaginationEllipsis** · instance of **PaginationEllipsis** · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
    radius `radius.control`
  - **Page12** · instance of **PaginationItem** (selected=false, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
    radius `radius.container`
  - **Next** · instance of **PaginationNav** (direction=next, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
    radius `radius.container`

### Tokens used

| Role    | Tokens                               |
| ------- | ------------------------------------ |
| Fills   | `color.action.primary.bg.default`    |
| Spacing | `stack.xs`                           |
| Radius  | `radius.container`, `radius.control` |

### Composes

- PaginationEllipsis
- PaginationItem
- PaginationNav

## Documentation card

**Truncation**

Show first 2–3 pages, current ± 1, and last 1–2 pages; fill the two gaps with Ellipsis. Never truncate below 7 total slots — below that, render every page and skip ellipsis. Ellipsis is static text, never a 'jump' trigger.

**Accessibility**

Render as `<nav aria-label="Pagination">` wrapping a `<ul>`. Current page: aria-current="page". Disabled Nav: aria-disabled="true". Keyboard: Tab through items, Enter/Space activates. Hit area 44×44 (WCAG 2.5.5).

**Rules**

Do  
• Always wrap in `<nav aria-label="Pagination">`  
• Mark the current page with aria-current="page"  
• Disable prev/next at the boundaries rather than hiding them  
• Keep hit area 44×44 even when the visible button is smaller

Don't  
• Don't use for wizards or linear flows — use Page Navigator  
• Don't render 1 / 1 pagination — hide when there's a single page  
• Don't put ellipsis as the only gap filler on <7 pages  
• Don't make Ellipsis clickable
