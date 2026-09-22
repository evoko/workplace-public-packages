# Table

> SOLAR Web · Figma page `↳ 🟢 Table` (id `2163:3683`) · section `components/data-display` · raw data: [`raw/components/data-display/table.json`](../../raw/components/data-display/table.json)

## Component set: RowSelect

Checkbox cell for a selectable Table row. 2 variants: title-row (false, true) — true is the header cell that selects all rows and supports the indeterminate state. Internal building block of Row and Table; not for use outside a table.

### Props

| Prop        | Type    | Options / default |
| ----------- | ------- | ----------------- |
| `title-row` | variant | false · **true**  |

Default variant: `title-row=true` · 2 variants · default size 40×40px

### Anatomy (default variant)

- **title-row=true** · component · row gap 12 pad 0/0/0/0 FIXED/FIXED · 40×40  
  fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none` · radius `radius.none`
  - **Checkbox** · instance of **Checkbox** (checked=false, disabled=false, hover=false, mixed=false, focus=false) · FIXED/FIXED · 16×16  
    stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role         | Tokens                          |
| ------------ | ------------------------------- |
| Fills        | `color.surface.background`      |
| Strokes      | `color.border.medium`           |
| Spacing      | `inset.none`, `inset.sm`        |
| Radius       | `radius.control`, `radius.none` |
| Border width | `border.default`                |

### Composes

- Checkbox

### Variant matrix

| title-row | size  | fill                       | stroke | effect | text | icon |
| --------- | ----- | -------------------------- | ------ | ------ | ---- | ---- |
| true      | 40×40 | `color.surface.background` |        |        |      |      |
| false     | 40×40 |                            |        |        |      |      |

## Component set: RowExpand

Expand/collapse cell and connector for expandable Table rows. 6 variants: type (title-row, collapsed, expanded, middle-row, bottom-row, vertical-only) — the chevron cell on the parent row plus the connector segments drawn beside its child rows. Internal building block of Row and Table.

### Props

| Prop   | Type    | Options / default                                                              |
| ------ | ------- | ------------------------------------------------------------------------------ |
| `type` | variant | bottom-row · **title-row** · collapsed · expanded · middle-row · vertical-only |

Default variant: `type=title-row` · 6 variants · default size 16×40px

### Anatomy (default variant)

- **type=title-row** · component · row gap 12 pad 0/0/0/0 FIXED/FIXED · 16×40  
  fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none` · radius `radius.none`

### Tokens used

| Role       | Tokens                     |
| ---------- | -------------------------- |
| Fills      | `color.surface.background` |
| Icon color | `color.icon.primary`       |
| Spacing    | `inset.none`, `inset.sm`   |
| Radius     | `radius.none`              |

### Variant matrix

| type          | size  | fill                       | stroke | effect | text | icon                 |
| ------------- | ----- | -------------------------- | ------ | ------ | ---- | -------------------- |
| title-row     | 16×40 | `color.surface.background` |        |        |      |                      |
| collapsed     | 16×40 |                            |        |        |      | `color.icon.primary` |
| expanded      | 16×40 |                            |        |        |      | `color.icon.primary` |
| bottom-row    | 16×40 |                            |        |        |      |                      |
| middle-row    | 16×40 |                            |        |        |      |                      |
| vertical-only | 16×40 |                            |        |        |      |                      |

## Component set: Row

A Table row. 10 variants: type (title, top, middle, bottom, non-expandable) × state (default, selected). title is the header row; top, middle and bottom are the positions inside an expanded group; non-expandable is a flat row. Booleans show expand and showCheckBox add the RowExpand and RowSelect cells; TitleRowContent and Row Content are slots for Column Items. Hover renders at runtime as a surface/hover overlay.

### Props

| Prop              | Type    | Options / default                                  |
| ----------------- | ------- | -------------------------------------------------- |
| `type`            | variant | top · middle · **title** · bottom · non-expandable |
| `state`           | variant | **default** · selected                             |
| `show expand`     | boolean | default `true`                                     |
| `showCheckBox`    | boolean | default `true`                                     |
| `TitleRowContent` | slot    | default `[object Object]`                          |
| `Row Content`     | slot    | default `[object Object]`                          |

Default variant: `type=title, state=default` · 10 variants · default size 1055×40px

### Anatomy (default variant)

- **type=title, state=default** · component · row gap 0 pad 0/0/0/0 FILL/HUG · 1055×40  
  radius `radius.container`
  - **RowSelect** · instance of **RowSelect** (title-row=true) · row gap 12 pad 0/0/0/0 FIXED/FIXED · 40×40  
    fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none` · radius `radius.none` · prop visible←showCheckBox
  - **RowExpand** · instance of **RowExpand** (type=title-row) · row gap 12 pad 0/0/0/0 FIXED/FIXED · 16×40  
    fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none` · radius `radius.none` · prop visible←show expand
  - **TitleRowContent** · slot · row gap 0 pad 0/0/0/0 FILL/HUG · 999×40  
    prop slotContentId←TitleRowContent
    - **Column Item** · instance of **Column Item** (title=true, type=text) · row gap 12 pad 0/0/0/0 FILL/FIXED · 200×40  
      fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none`
    - **Column Item** · instance of **Column Item** (title=true, type=text) · row gap 12 pad 0/0/0/0 FILL/FIXED · 200×40  
      fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none`
    - **Column Item** · instance of **Column Item** (title=true, type=text) · row gap 12 pad 0/0/0/0 FILL/FIXED · 200×40  
      fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none`
    - **Column Item** · instance of **Column Item** (title=true, type=text) · row gap 12 pad 0/0/0/0 FILL/FIXED · 200×40  
      fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none`
    - **Column Item** · instance of **Column Item** (title=true, type=text) · row gap 12 pad 0/0/0/0 FILL/FIXED · 200×40  
      fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none`

### Tokens used

| Role       | Tokens                                             |
| ---------- | -------------------------------------------------- |
| Fills      | `color.surface.active`, `color.surface.background` |
| Text color | `color.text.primary`, `color.text.secondary`       |
| Icon color | `color.icon.inverse`, `color.icon.primary`         |
| Spacing    | `inset.none`, `inset.sm`                           |
| Radius     | `radius.container`, `radius.none`                  |

### Slots and prop-controlled layers

| Layer           | Controlled property | Prop              |
| --------------- | ------------------- | ----------------- |
| RowSelect       | visible             | `showCheckBox`    |
| RowExpand       | visible             | `show expand`     |
| TitleRowContent | slotContentId       | `TitleRowContent` |

### Composes

- Column Item
- RowExpand
- RowSelect

### Variant matrix

| type           | state    | size    | fill                   | stroke | effect | text                   | icon                                         |
| -------------- | -------- | ------- | ---------------------- | ------ | ------ | ---------------------- | -------------------------------------------- |
| title          | default  | 1055×40 |                        |        |        | `color.text.secondary` |                                              |
| non-expandable | default  | 1055×44 |                        |        |        | `color.text.primary`   | `color.icon.primary`                         |
| top            | default  | 1055×44 |                        |        |        | `color.text.primary`   | `color.icon.primary`                         |
| middle         | default  | 1055×44 |                        |        |        | `color.text.primary`   |                                              |
| bottom         | default  | 1055×44 |                        |        |        | `color.text.primary`   |                                              |
| title          | selected | 1055×40 |                        |        |        | `color.text.secondary` | `color.icon.inverse`                         |
| non-expandable | selected | 1055×44 | `color.surface.active` |        |        | `color.text.primary`   | `color.icon.inverse`<br>`color.icon.primary` |
| top            | selected | 1055×44 | `color.surface.active` |        |        | `color.text.primary`   | `color.icon.inverse`<br>`color.icon.primary` |
| middle         | selected | 1055×44 | `color.surface.active` |        |        | `color.text.primary`   | `color.icon.inverse`                         |
| bottom         | selected | 1055×44 | `color.surface.active` |        |        | `color.text.primary`   | `color.icon.inverse`                         |

## Component set: Column Item

A single Table cell. 9 variants: title (false, true) × type (text, status, input, select, icon, button, toggle, user) — title=true is the sortable column header. Pick the type that matches the cell content so padding and alignment stay consistent; numeric text right-aligns. Building block of Row.

### Props

| Prop    | Type    | Options / default                                                  |
| ------- | ------- | ------------------------------------------------------------------ |
| `title` | variant | false · **true**                                                   |
| `type`  | variant | status · **text** · input · select · icon · button · toggle · user |

Default variant: `title=true, type=text` · 9 variants · default size 176×40px

### Anatomy (default variant)

- **title=true, type=text** · component · row gap 12 pad 0/0/0/0 FILL/FIXED · 176×40  
  fill `color.surface.background` · itemSpacing `inset.sm` · padding `inset.none`
  - **Separator** · rectangle · FIXED/FIXED · 1×26  
    fill `color.surface.muted`
  - **Label** · text `label/md` "Label" · FILL/HUG · 163×10  
    fill `color.text.secondary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.muted`                                                                                                                                                                               |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.neutral.700` |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.tertiary`                                                                                                                                              |
| Spacing         | `inset.none`, `inset.sm`                                                                                                                                                                                                        |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md`                                                                                                                             |
| Text styles     | `label/md`                                                                                                                                                                                                                      |

### Variant matrix

| title | type   | size   | fill                       | stroke | effect | text                                                                         | icon                                  |
| ----- | ------ | ------ | -------------------------- | ------ | ------ | ---------------------------------------------------------------------------- | ------------------------------------- |
| true  | text   | 176×40 | `color.surface.background` |        |        | `color.text.secondary`                                                       |                                       |
| false | status | 176×40 |                            |        |        | `color.text.feedback.success`                                                |                                       |
| false | text   | 176×40 |                            |        |        | `color.text.primary`                                                         |                                       |
| false | user   | 176×40 |                            |        |        | `color.neutral.700`<br>`color.text.primary`                                  |                                       |
| false | icon   | 176×40 |                            |        |        |                                                                              | `color.action.secondary.icon.default` |
| false | input  | 176×40 |                            |        |        | `color.text.feedback.info`<br>`color.text.tertiary`                          | `color.icon.tertiary`                 |
| false | select | 176×40 |                            |        |        | `color.text.primary`                                                         | `color.icon.primary`                  |
| false | button | 176×40 |                            |        |        | `color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.secondary.icon.default` |
| false | toggle | 176×40 |                            |        |        |                                                                              |                                       |

### Issues detected

- Primitive color bound directly (CLR-002): `color.neutral.700`.

## Component set: Table

Data table chassis — header row plus a Rows slot of Row instances. 6 variants: breakpoint (desktop, mobile) × expandable (false, true) × selectable (false, true); 6 of the 8 combinations are built. mobile collapses rows to a card-style list. Compose with TableHeader above and TableFooter below; for the full toolbar + pagination assembly use the Data Table pattern.

### Props

| Prop         | Type    | Options / default         |
| ------------ | ------- | ------------------------- |
| `breakpoint` | variant | **desktop** · mobile      |
| `expandable` | variant | false · **true**          |
| `selectable` | variant | false · **true**          |
| `Rows`       | slot    | default `[object Object]` |

Default variant: `breakpoint=desktop, expandable=true, selectable=true` · 6 variants · default size 1020×640px

### Anatomy (default variant)

- **breakpoint=desktop, expandable=true, selectable=true** · component · column gap 0 pad 0/0/0/0 FILL/HUG · 1020×640  
  stroke `color.border.subtle` mixedpx · padding `stack.none` · strokeWeight `border.default`
  - **Row** · instance of **Row** (type=title, state=default) · row gap 0 pad 0/0/0/0 FILL/HUG · 1020×40  
    radius `radius.container`
  - **Rows** · slot · column gap 0 pad 0/0/0/0 FILL/FIXED · 1020×600  
    itemSpacing `stack.none` · prop slotContentId←Rows
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=middle, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=middle, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=middle, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=bottom, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40
    - **Row** · instance of **Row** (type=top, state=default) · row gap 0 pad 0/0/0/0 FILL/FIXED · 1020×40

### Tokens used

| Role         | Tokens                                       |
| ------------ | -------------------------------------------- |
| Strokes      | `color.border.subtle`                        |
| Text color   | `color.text.primary`, `color.text.secondary` |
| Icon color   | `color.icon.primary`                         |
| Spacing      | `stack.none`                                 |
| Radius       | `radius.container`                           |
| Border width | `border.default`                             |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop   |
| ----- | ------------------- | ------ |
| Rows  | slotContentId       | `Rows` |

### Composes

- Row

### Variant matrix

| breakpoint | expandable | selectable | size     | fill | stroke                | effect | text                                           | icon                 |
| ---------- | ---------- | ---------- | -------- | ---- | --------------------- | ------ | ---------------------------------------------- | -------------------- |
| desktop    | true       | true       | 1020×640 |      | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| mobile     | true       | true       | 361×640  |      | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| desktop    | false      | true       | 1020×640 |      | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| mobile     | false      | true       | 361×640  |      | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| desktop    | false      | false      | 1020×640 |      | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| mobile     | false      | false      | 361×640  |      | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |

## Component set: TableFooter

Footer strip for Table — row count and pagination on the left, an optional action on the right. 2 variants: breakpoint (desktop, mobile). showButton toggles the trailing Button. Part of the Data Table pattern; sits directly under Table.

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |
| `showButton` | boolean | default `true`       |

Default variant: `breakpoint=desktop` · 2 variants · default size 1020×56px

### Anatomy (default variant)

- **breakpoint=desktop** · component · row gap 0 pad 8/0/8/0 FILL/HUG · 1020×56  
  padding `stack.none`, `inset.xs`
  - **Container** · frame · row gap 242 pad 0/0/0/0 FILL/HUG · 1020×40
    - **Container** · frame · row gap 12 pad 0/0/0/0 HUG/HUG · 168×40  
      itemSpacing `inset.sm`
      - **Dropdown** · instance of **Dropdown** (size=md, state=default) · column gap 8 pad 0/0/0/0 HUG/HUG · 65×40  
        itemSpacing `stack.xs`
      - **rows per page** · text `body/md/regular` "rows per page" · HUG/HUG · 91×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Pagination** · instance of **Pagination** · row gap 8 pad 0/0/0/0 HUG/HUG · 216×24  
      itemSpacing `stack.xs`
    - **Button** · instance of **Button** (size=md, prio=primary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 143×40  
      fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control` · prop visible←showButton

### Tokens used

| Role            | Tokens                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Fills           | `color.action.primary.bg.default`                                                                                        |
| Strokes         | `color.action.primary.border.default`                                                                                    |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.primary`, `color.text.secondary` |
| Icon color      | `color.action.primary.icon.default`, `color.icon.primary`                                                                |
| Spacing         | `inset.sm`, `inset.xs`, `stack.none`, `stack.xs`                                                                         |
| Radius          | `radius.control`                                                                                                         |
| Border width    | `border.default`                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.body.md`, `type.size.body.md`                        |
| Effects         | `shadow/control`                                                                                                         |
| Text styles     | `body/md/regular`                                                                                                        |

### Slots and prop-controlled layers

| Layer              | Controlled property | Prop         |
| ------------------ | ------------------- | ------------ |
| Container › Button | visible             | `showButton` |

### Composes

- Button
- Dropdown
- Pagination

### Variant matrix

| breakpoint | size    | fill | stroke | effect | text                                                                                                                           | icon                                                        |
| ---------- | ------- | ---- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| desktop    | 1020×56 |      |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.primary`<br>`color.action.primary.icon.default` |
| mobile     | 377×56  |      |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.text.secondary`                                          | `color.icon.primary`<br>`color.action.primary.icon.default` |

### Issues detected

- Hard-coded gap `242px` on layer _Container_

## Component set: TableHeader

Toolbar strip above Table — title and count, search, and an Actions slot for filters and bulk actions. 2 variants: breakpoint (desktop, mobile); mobile stacks the actions under the title. Part of the Data Table pattern; for a page-level title use Page Header.

### Props

| Prop         | Type    | Options / default         |
| ------------ | ------- | ------------------------- |
| `breakpoint` | variant | **desktop** · mobile      |
| `Actions`    | slot    | default `[object Object]` |

Default variant: `breakpoint=desktop` · 2 variants · default size 1020×56px

### Anatomy (default variant)

- **breakpoint=desktop** · component · row gap 0 pad 8/0/8/0 FILL/HUG · 1020×56  
  padding `stack.none`, `inset.xs` · strokeWeight `border.default`
  - **Container** · frame · row gap 692 pad 0/0/0/0 FILL/HUG · 1020×40
    - **SearchField** · instance of **SearchField** (state=default, size=md) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 240×40  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **Segmented Control** · instance of **Segmented Control** (size=md) · column gap 8 pad 0/0/0/0 HUG/HUG · 128×40  
      itemSpacing `inset.xs`
    - **Actions** · slot · row gap 8 pad 0/0/0/0 FIXED/HUG · 240×40  
      itemSpacing `stack.xs` · prop slotContentId←Actions
      - **Icon Button** · instance of **Icon Button** (size=md, shape=square, prio=secondary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control`
      - **Icon Button** · instance of **Icon Button** (size=md, shape=square, prio=secondary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control`
      - **Icon Button** · instance of **Icon Button** (size=md, shape=square, prio=secondary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role         | Tokens                                                                              |
| ------------ | ----------------------------------------------------------------------------------- |
| Fills        | `color.action.secondary.bg.default`, `color.surface.base`                           |
| Strokes      | `color.border.medium`, `color.border.subtle`                                        |
| Text color   | `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`            |
| Icon color   | `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary` |
| Spacing      | `inset.none`, `inset.sm`, `inset.xs`, `stack.none`, `stack.xs`                      |
| Radius       | `radius.control`                                                                    |
| Border width | `border.default`                                                                    |
| Effects      | `shadow/control`                                                                    |

### Slots and prop-controlled layers

| Layer               | Controlled property | Prop      |
| ------------------- | ------------------- | --------- |
| Container › Actions | slotContentId       | `Actions` |

### Composes

- Icon Button
- SearchField
- Segmented Control

### Variant matrix

| breakpoint | size    | fill | stroke | effect | text                                                                         | icon                                                                                    |
| ---------- | ------- | ---- | ------ | ------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| desktop    | 1020×56 |      |        |        | `color.text.secondary`<br>`color.text.feedback.info`<br>`color.text.primary` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default` |
| mobile     | 377×56  |      |        |        | `color.text.feedback.info`<br>`color.text.primary`<br>`color.text.secondary` | `color.icon.primary`<br>`color.icon.secondary`<br>`color.action.secondary.icon.default` |

### Issues detected

- Hard-coded gap `692px` on layer _Container_

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
