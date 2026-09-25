# List

> SOLAR Web · Figma page `↳ 🟢 List` (id `2163:3677`) · section `components/data-display` · raw data: [`raw/components/data-display/list.json`](../../raw/components/data-display/list.json)

## Component set: ListItem

Single row inside a List container. 20 variants: type (icon, avatar) × state (default, hover, focus, selected, disabled) × compact (false, true). Props: hasIcon, hasAvatar, hasHelper, hasTrailing. The trailing element is a 16px icon slot, typically a chevron; for a count or value put a Counter or text in the slot instead — never two trailing elements at once. Provide aria-selected on the selected row. See also: List for the container, Table for column-structured data.

### Props

| Prop          | Type    | Options / default                                 |
| ------------- | ------- | ------------------------------------------------- |
| `type`        | variant | **icon** · avatar                                 |
| `state`       | variant | **default** · hover · focus · selected · disabled |
| `compact`     | variant | **false** · true                                  |
| `hasHelper`   | boolean | default `true`                                    |
| `hasIcon`     | boolean | default `true`                                    |
| `hasAvatar`   | boolean | default `true`                                    |
| `hasTrailing` | boolean | default `true`                                    |

Default variant: `type=icon, state=default, compact=false` · 20 variants · default size 387×59px

### Anatomy (default variant)

- **type=icon, state=default, compact=false** · component · row gap 12 pad 16/12/16/16 FILL/HUG · 387×59  
  itemSpacing `inset.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
    height `icon.md` · prop visible←hasIcon
  - **Body** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 299×27  
    itemSpacing `stack.xs`
    - **Label** · text `label/md` "List item label" · HUG/HUG · 89×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
    - **Supporting** · text `body/sm/regular` "Helper Text" · HUG/HUG · 63×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400` · prop visible←hasHelper
  - **Icon** · instance of **Icon/ChevronRight** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm` · prop visible←hasTrailing

### Tokens used

| Role            | Tokens                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.hover`                                                                                                                                                        |
| Text color      | `color.text.disabled`, `color.text.primary`, `color.text.secondary`                                                                                                          |
| Icon color      | `color.icon.disabled`, `color.icon.primary`                                                                                                                                  |
| Spacing         | `inset.md`, `inset.sm`, `stack.xs`                                                                                                                                           |
| Border width    | `border.default`                                                                                                                                                             |
| Sizes           | `icon.md`, `icon.sm`                                                                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.sm`, `type.line-height.label.md`, `type.size.body.sm`, `type.size.label.md` |
| Effects         | `shadow/focus/default`                                                                                                                                                       |
| Text styles     | `body/sm/regular`, `label/md`                                                                                                                                                |

### Slots and prop-controlled layers

| Layer             | Controlled property | Prop          |
| ----------------- | ------------------- | ------------- |
| Icon/None         | visible             | `hasIcon`     |
| Body › Supporting | visible             | `hasHelper`   |
| Icon              | visible             | `hasTrailing` |

### Composes

- Icon/ChevronRight
- Icon/None

### Variant matrix

| type   | state    | compact | size   | fill                  | stroke | effect                 | text                                           | icon                                          |
| ------ | -------- | ------- | ------ | --------------------- | ------ | ---------------------- | ---------------------------------------------- | --------------------------------------------- |
| icon   | default  | false   | 387×59 |                       |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| icon   | default  | true    | 387×51 |                       |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| icon   | hover    | false   | 387×59 | `color.surface.hover` |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| icon   | hover    | true    | 387×51 | `color.surface.hover` |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| icon   | focus    | false   | 387×59 |                       |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| icon   | focus    | true    | 387×51 |                       |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| icon   | selected | false   | 387×59 | `color.surface.hover` |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| icon   | selected | true    | 387×51 | `color.surface.hover` |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| icon   | disabled | false   | 387×59 |                       |        |                        | `color.text.disabled`                          | `color.icon.disabled`<br>`color.icon.primary` |
| icon   | disabled | true    | 387×51 |                       |        |                        | `color.text.disabled`                          | `color.icon.disabled`<br>`color.icon.primary` |
| avatar | default  | false   | 387×64 |                       |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| avatar | default  | true    | 387×56 |                       |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| avatar | hover    | false   | 387×64 | `color.surface.hover` |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| avatar | hover    | true    | 387×56 | `color.surface.hover` |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| avatar | focus    | false   | 387×64 |                       |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| avatar | focus    | true    | 387×56 |                       |        | `shadow/focus/default` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| avatar | selected | false   | 387×64 | `color.surface.hover` |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| avatar | selected | true    | 387×56 | `color.surface.hover` |        |                        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                          |
| avatar | disabled | false   | 387×64 |                       |        |                        | `color.text.disabled`                          | `color.icon.primary`                          |
| avatar | disabled | true    | 387×56 |                       |        |                        | `color.text.disabled`                          | `color.icon.primary`                          |

## Component set: List

Container that stacks ListItem rows with optional dividers. 2 variants: in-card (false, true). in-card=true is the standalone list — its own edge, corners and padded rows; in-card=false drops the edge and uses compact rows for placement inside a Card or panel that already provides the surface. Items is a slot for ListItem instances. Use for navigation, settings and entity pickers; for column-structured data use Table.

### Props

| Prop      | Type    | Options / default         |
| --------- | ------- | ------------------------- |
| `in-card` | variant | false · **true**          |
| `Items`   | slot    | default `[object Object]` |

Default variant: `in-card=true` · 2 variants · default size 387×299px

### Anatomy (default variant)

- **in-card=true** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 387×299  
  stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
  - **Items** · slot · column gap 0 pad 0/0/0/0 HUG/HUG · 387×299  
    prop slotContentId←Items
    - **ListItem** · instance of **ListItem** (type=icon, state=default, compact=false) · row gap 12 pad 16/12/16/16 FIXED/HUG · 387×59  
      itemSpacing `inset.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 387×1
    - **ListItem** · instance of **ListItem** (type=icon, state=default, compact=false) · row gap 12 pad 16/12/16/16 FIXED/HUG · 387×59  
      itemSpacing `inset.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 387×1
    - **ListItem** · instance of **ListItem** (type=icon, state=default, compact=false) · row gap 12 pad 16/12/16/16 FIXED/HUG · 387×59  
      itemSpacing `inset.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 387×1
    - **ListItem** · instance of **ListItem** (type=icon, state=default, compact=false) · row gap 12 pad 16/12/16/16 FIXED/HUG · 387×59  
      itemSpacing `inset.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 387×1
    - **ListItem** · instance of **ListItem** (type=icon, state=default, compact=false) · row gap 12 pad 16/12/16/16 FIXED/HUG · 387×59  
      itemSpacing `inset.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`

### Tokens used

| Role         | Tokens                                       |
| ------------ | -------------------------------------------- |
| Strokes      | `color.border.subtle`                        |
| Text color   | `color.text.primary`, `color.text.secondary` |
| Icon color   | `color.icon.primary`                         |
| Spacing      | `inset.md`, `inset.sm`                       |
| Radius       | `radius.container`                           |
| Border width | `border.default`                             |
| Effects      | `shadow/raised`                              |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop    |
| ----- | ------------------- | ------- |
| Items | slotContentId       | `Items` |

### Composes

- Divider
- ListItem

### Variant matrix

| in-card | size    | fill | stroke                | effect          | text                                           | icon                 |
| ------- | ------- | ---- | --------------------- | --------------- | ---------------------------------------------- | -------------------- |
| true    | 387×299 |      | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary` |
| false   | 368×259 |      |                       | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary` |

## Documentation card

**Description**

Container (List) that stacks rows (ListItem) with optional dividers. Use for navigation, settings, dropdown option lists, and entity pickers.

**Dividers**

true Long scannable lists — settings, device rows, audit logs.  
false Dense menus and dropdown option lists where selection-state backgrounds already separate rows.

**ListItem States**

default Unselected, resting.  
hover Pointer over.  
focus Keyboard focus — 2px focus ring.  
selected Current selection. Persistent highlight.  
disabled Not interactive. 60% opacity, no hover.

**Sizes**

ListItem currently ships at size=sm (36px) only.  
md (44px) and lg (52px) planned — waiting on 2+ consumer demand.

**Labels & Content**

Primary label: 1 line, truncates with ellipsis.  
Leading icon: 20px, optional.  
Trailing: counter, timestamp, chevron, or kebab menu — never two at once.

**Rules**

- DO: Use dividers=true for lists over ~8 items
- DO: Provide aria-selected on the selected row
- DO: Show focus state for keyboard navigation
- DO: Pair leading icons at 20px

- DON'T: Mix divider styles inside one list
- DON'T: Stack two trailing elements (counter + chevron)
- DON'T: Use List for column-structured data (use Table)
- DON'T: Omit the selected state from interactive lists
