# Search Results Panel

> SOLAR Web · Figma page `↳ 🟢 Search Results Panel` (id `2966:624`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/search-results-panel.json`](../../raw/patterns/layout-shell/search-results-panel.json)

## Component set: SearchResultsPanel

### Props

| Prop    | Type    | Options / default                        |
| ------- | ------- | ---------------------------------------- |
| `state` | variant | no results · empty · ghost · **default** |

Default variant: `state=default` · 4 variants · default size 400×470px

### Anatomy (default variant)

- **state=default** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 400×470  
  fill `color.surface.overlay` · effect `shadow/dialog` · strokeWeight `border.default` · radius `radius.dialog`
  - **SearchHeader** · frame · column gap 12 pad 12/12/12/12 FILL/HUG · 400×100  
    fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default`
    - **GlobalSearch** · instance of **GlobalSearch** (state=focus, size=md) · row gap 12 pad 0/12/0/12 FILL/FIXED · 376×40  
      fill `color.surface.base` · stroke `color.border.feedback.focus.strong` 1px · effect `shadow/focus/default` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **FilterChips** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 306×24  
      itemSpacing `stack.2xs`
      - **Tag** · instance of **Tag** (status=info, type=closable, invert=false) · row gap 4 pad 0/8/0/12 HUG/FIXED · 50×24  
        fill `color.surface.feedback.info.subtle` · stroke `color.border.feedback.info.subtle` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none`, `inset.xs` · strokeWeight `border.default` · radius `radius.pill`
      - **Tag** · instance of **Tag** (status=neutral, type=closable, invert=false) · row gap 4 pad 0/8/0/12 HUG/FIXED · 124×24  
        fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none`, `inset.xs` · strokeWeight `border.default` · radius `radius.pill`
      - **Tag** · instance of **Tag** (status=neutral, type=closable, invert=false) · row gap 4 pad 0/8/0/12 HUG/FIXED · 124×24  
        fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none`, `inset.xs` · strokeWeight `border.default` · radius `radius.pill`
  - **ResultsBody** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 400×370  
    padding `stack.none`
    - **Dropdown Group Label** · frame · row gap 8 pad 0/12/0/12 FILL/FIXED · 400×32  
      fill `color.surface.background` · padding `inset.sm`, `inset.none`
      - **Category Name** · text `body/sm/medium` "Category Name" · HUG/HUG · 88×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
      - **Link** · instance of **Link** (size=sm, state=default) · row gap 8 pad 0/0/0/0 HUG/HUG · 37×9  
        itemSpacing `stack.xs`
    - **ResultRow** · instance of **ResultRow** · row gap 12 pad 12/16/12/16 FILL/HUG · 400×51  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **ResultRow** · instance of **ResultRow** · row gap 12 pad 12/16/12/16 FILL/HUG · 400×51  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **ResultRow** · instance of **ResultRow** · row gap 12 pad 12/16/12/16 FILL/HUG · 400×51  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **Dropdown Group Label** · frame · row gap 8 pad 0/12/0/12 FILL/FIXED · 400×32  
      fill `color.surface.background` · padding `inset.sm`, `inset.none`
      - **Category Name** · text `body/sm/medium` "Category Name" · HUG/HUG · 88×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
      - **Link** · instance of **Link** (size=sm, state=default) · row gap 8 pad 0/0/0/0 HUG/HUG · 37×9  
        itemSpacing `stack.xs`
    - **ResultRow** · instance of **ResultRow** · row gap 12 pad 12/16/12/16 FILL/HUG · 400×51  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **ResultRow** · instance of **ResultRow** · row gap 12 pad 12/16/12/16 FILL/HUG · 400×51  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **ResultRow** · instance of **ResultRow** · row gap 12 pad 12/16/12/16 FILL/HUG · 400×51  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.base`, `color.surface.feedback.info.subtle`, `color.surface.feedback.neutral.subtle`, `color.surface.overlay`                                                                                                    |
| Strokes         | `color.border.feedback.focus.strong`, `color.border.feedback.info.subtle`, `color.border.medium`, `color.border.subtle`                                                                                                                                     |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.inverse`, `color.text.link.default`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.feedback.info`, `color.icon.feedback.neutral`, `color.icon.link.default`, `color.icon.primary`, `color.icon.tertiary`                                                                                    |
| Spacing         | `inset.2xs`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.2xs`, `stack.none`, `stack.sm`, `stack.xs`                                                                                                                                            |
| Radius          | `radius.control`, `radius.dialog`, `radius.pill`                                                                                                                                                                                                            |
| Border width    | `border.default`                                                                                                                                                                                                                                            |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm`                                                                                                                                                           |
| Effects         | `shadow/dialog`, `shadow/focus/default`                                                                                                                                                                                                                     |
| Text styles     | `body/sm/medium`                                                                                                                                                                                                                                            |

### Composes

- GlobalSearch
- Link
- ResultRow
- Tag

### Variant matrix

| state      | size    | fill                    | stroke | effect          | text                                                                                                                                                                                 | icon                                                                                                                                      |
| ---------- | ------- | ----------------------- | ------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| default    | 400×470 | `color.surface.overlay` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.inverse`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral`<br>`color.text.secondary`<br>`color.text.link.default`                   | `color.icon.primary`<br>`color.icon.feedback.info`<br>`color.icon.feedback.neutral`<br>`color.icon.link.default`<br>`color.icon.tertiary` |
| no results | 400×300 | `color.surface.overlay` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.inverse`<br>`color.text.feedback.info`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.primary`<br>`color.action.secondary.icon.default`                                                                             |
| ghost      | 400×396 | `color.surface.overlay` |        | `shadow/dialog` |                                                                                                                                                                                      |                                                                                                                                           |
| empty      | 400×308 | `color.surface.overlay` |        | `shadow/dialog` | `color.text.tertiary`<br>`color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                              | `color.icon.primary`<br>`color.action.secondary.icon.default`                                                                             |

### Issues detected

- Component description is empty.
- State axis uses non-standard value(s): no results, ghost.
- Hard-coded gap `8px` on layer _ResultsBody › Dropdown Group Label_
- Hard-coded gap `8px` on layer _ResultsBody › Dropdown Group Label_

## Component: ResultRow

### Anatomy (default variant)

- **ResultRow** · component · row gap 12 pad 12/16/12/16 FIXED/HUG · 400×51  
  stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Icon/File** · instance of **Icon/File** (solid=false) · FIXED/FIXED · 20×20  
    height `icon.md`
  - **Text** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 336×27  
    itemSpacing `stack.xs`
    - **Result title** · text `body/md/medium` "Result title" · FILL/HUG · 336×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Helper text** · text `helper/sm` "Helper text" · FILL/HUG · 336×9  
      fill `color.text.secondary` · lineHeight `type.line-height.helper.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Strokes         | `color.border.subtle`                                                                                                                                                          |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                                   |
| Spacing         | `inset.md`, `inset.sm`, `stack.sm`, `stack.xs`                                                                                                                                 |
| Border width    | `border.default`                                                                                                                                                               |
| Sizes           | `icon.md`                                                                                                                                                                      |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.sm`, `type.size.body.md`, `type.size.helper.sm` |
| Text styles     | `body/md/medium`, `helper/sm`                                                                                                                                                  |

### Composes

- Icon/File

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
