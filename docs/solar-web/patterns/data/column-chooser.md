# Column Chooser

> SOLAR Web · Figma page `↳ 🟢 Column Chooser` (id `5113:10`) · section `patterns/data` · raw data: [`raw/patterns/data/column-chooser.json`](../../raw/patterns/data/column-chooser.json)

## Component set: Column Chooser

Panel for showing, hiding and reordering DataTable columns: title with a Counter, search, a draggable ColumnRow list and a footer Button. 3 variants: state (default, loading, empty). loading shows the skeleton list; empty is the no-match message after search. Props: List (slot). Changes apply live; the footer resets to the table default.

### Props

| Prop    | Type    | Options / default             |
| ------- | ------- | ----------------------------- |
| `state` | variant | **default** · loading · empty |
| `List`  | slot    | default `[object Object]`     |

Default variant: `state=default` · 3 variants · default size 320×720px

### Anatomy (default variant)

- **state=default** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 320×720  
  fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
  - **Header** · frame · row gap 12 pad 8/16/8/16 FILL/FIXED · 320×52  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.xs` · strokeWeight `border.default`
    - **TitleGroup** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 212×20  
      itemSpacing `stack.xs`
      - **Title** · text `body/lg/medium` "Columns" · HUG/HUG · 66×12  
        fill `color.text.primary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
      - **SummaryCounter** · instance of **Counter** (type=regular, state=default) · row gap 0 pad 0/8/0/8 HUG/FIXED · 24×20  
        fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · padding `inset.xs` · strokeWeight `border.default` · radius `radius.pill`
    - **ClearAll** · instance of **Button** (size=sm, prio=tertiary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×36  
      stroke `color.action.tertiary.border.default` 1px · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`
  - **content** · frame · column gap 0 pad 12/12/0/12 FILL/FILL · 320×620  
    padding `inset.sm`
    - **SearchField** · instance of **SearchField** (state=default, size=md) · row gap 12 pad 0/12/0/12 FILL/FIXED · 296×40  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **List** · slot · column gap 0 pad 0/0/0/0 HUG/HUG · 296×440  
      prop slotContentId←List
      - **ColumnRow** · instance of **ColumnRow** (selected=true, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
      - **ColumnRow** · instance of **ColumnRow** (selected=true, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
      - **ColumnRow** · instance of **ColumnRow** (selected=true, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
      - **ColumnRow** · instance of **ColumnRow** (selected=true, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
      - **ColumnRow** · instance of **ColumnRow** (selected=true, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
      - **ColumnRow** · instance of **ColumnRow** (selected=false, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
      - **ColumnRow** · instance of **ColumnRow** (selected=false, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
      - **ColumnRow** · instance of **ColumnRow** (selected=false, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
      - **ColumnRow** · instance of **ColumnRow** (selected=false, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
      - **ColumnRow** · instance of **ColumnRow** (selected=false, hover=false) · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
        itemSpacing `inset.xs`
  - **Button** · instance of **Button** (size=lg, prio=primary, state=default, danger=false) · row gap 12 pad 0/20/0/20 FILL/FIXED · 320×48  
    fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 0px · padding `inset.lg` · strokeWeight `border.none` · radius `radius.none`

### Tokens used

| Role            | Tokens                                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.surface.base`, `color.surface.raised`                                                                                |
| Strokes         | `color.action.primary.border.default`, `color.action.tertiary.border.default`, `color.border.medium`, `color.border.subtle`                                    |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.default`, `color.text.primary`, `color.text.secondary` |
| Icon color      | `color.action.primary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.inverse`, `color.icon.secondary`, `color.icon.tertiary`                 |
| Spacing         | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.sm`, `stack.xs`                                                                           |
| Radius          | `radius.container`, `radius.control`, `radius.none`, `radius.pill`                                                                                             |
| Border width    | `border.default`, `border.none`                                                                                                                                |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.lg`, `type.size.body.lg`                                                              |
| Effects         | `shadow/control`, `shadow/raised`                                                                                                                              |
| Text styles     | `body/lg/medium`                                                                                                                                               |

### Slots and prop-controlled layers

| Layer          | Controlled property | Prop   |
| -------------- | ------------------- | ------ |
| content › List | slotContentId       | `List` |

### Composes

- Button
- ColumnRow
- Counter
- SearchField

### Variant matrix

| state   | size    | fill                   | stroke                | effect          | text                                                                                                                                                                   | icon                                                                                                                                                   |
| ------- | ------- | ---------------------- | --------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| default | 320×720 | `color.surface.raised` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.tertiary.text.default`<br>`color.text.secondary`<br>`color.action.secondary.text.default` | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.tertiary`<br>`color.icon.inverse`<br>`color.action.primary.icon.default` |
| loading | 320×720 | `color.surface.raised` | `color.border.subtle` | `shadow/raised` | `color.action.primary.text.default`<br>`color.action.secondary.text.default`                                                                                           | `color.action.primary.icon.default`                                                                                                                    |
| empty   | 320×720 | `color.surface.raised` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.tertiary.text.default`<br>`color.text.secondary`<br>`color.action.secondary.text.default` | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.action.primary.icon.default`                                                  |

## Component set: ColumnRow

One column entry inside Column Chooser: drag handle, Checkbox and the column label. 4 variants: selected (true, false) × hover (false, true). selected mirrors the checkbox; hover is pointer feedback only. Reorder by dragging the handle or with Alt+Arrow when the row has focus; the checkbox owns the visible/hidden state.

### Props

| Prop       | Type    | Options / default |
| ---------- | ------- | ----------------- |
| `selected` | variant | **true** · false  |
| `hover`    | variant | **false** · true  |

Default variant: `selected=true, hover=false` · 4 variants · default size 296×44px

### Anatomy (default variant)

- **selected=true, hover=false** · component · row gap 8 pad 0/0/0/0 FIXED/FIXED · 296×44  
  itemSpacing `inset.xs`
  - **Icon/DragHandle** · instance of **Icon/DragHandle** (solid=false) · FIXED/FIXED · 20×20  
    height `icon.md`
  - **Checkbox** · instance of **Checkbox** (checked=true, disabled=false, hover=false, mixed=false, focus=false) · column gap 16 pad 0/0/0/0 FIXED/FIXED · 16×16  
    fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · itemSpacing `stack.md` · strokeWeight `border.default` · radius `radius.control`
  - **Column Label** · text `body/md/medium` "Column Label" · FILL/HUG · 244×10  
    fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.surface.hover`                                          |
| Strokes         | `color.border.medium`                                                                             |
| Text color      | `color.text.primary`, `color.text.secondary`                                                      |
| Icon color      | `color.icon.inverse`, `color.icon.tertiary`                                                       |
| Spacing         | `inset.xs`, `stack.md`                                                                            |
| Radius          | `radius.control`                                                                                  |
| Border width    | `border.default`                                                                                  |
| Sizes           | `icon.md`                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Text styles     | `body/md/medium`                                                                                  |

### Composes

- Checkbox
- Icon/DragHandle

### Variant matrix

| selected | hover | size   | fill                  | stroke | effect | text                   | icon                                          |
| -------- | ----- | ------ | --------------------- | ------ | ------ | ---------------------- | --------------------------------------------- |
| true     | false | 296×44 |                       |        |        | `color.text.primary`   | `color.icon.tertiary`<br>`color.icon.inverse` |
| true     | true  | 296×44 | `color.surface.hover` |        |        | `color.text.primary`   | `color.icon.tertiary`<br>`color.icon.inverse` |
| false    | false | 296×44 |                       |        |        | `color.text.secondary` | `color.icon.tertiary`                         |
| false    | true  | 296×44 | `color.surface.hover` |        |        | `color.text.secondary` | `color.icon.tertiary`                         |

## Issues detected (page)

- The documentation card's Accessibility section holds the Breadcrumbs page's text; it does not describe this component.

## Documentation card

**Usage**

Panel for showing, hiding and reordering DataTable columns: title with a Counter, search, a draggable ColumnRow list and a footer Button. Changes apply live; the footer resets to the table default.

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
