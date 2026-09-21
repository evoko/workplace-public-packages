# Sidebar Locations

> SOLAR Web · Figma page `↳ 🟢 Sidebar Locations` (id `10395:7`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/sidebar-locations.json`](../../raw/patterns/layout-shell/sidebar-locations.json)

## Component set: Sidebar Locations

Location tree sidebar composing SearchField, Counter and Tree Navigation Panel; states: empty, filled, search, no-results, rename. Migrated from Chatter Config 2026-09-01.

### Props

| Prop      | Type    | Options / default                                 |
| --------- | ------- | ------------------------------------------------- |
| `state`   | variant | **empty** · filled · search · no-results · rename |
| `hasHelp` | boolean | default `true`                                    |
| `hasAdd`  | boolean | default `true`                                    |

Default variant: `state=empty` · 5 variants · default size 324×744px

### Anatomy (default variant)

- **state=empty** · component · column gap 12 pad 16/16/16/16 FIXED/FIXED · 324×744  
  fill `color.surface.raised` · itemSpacing `stack.sm` · padding `inset.md` · radius `radius.container`
  - **Org Title** · frame · row gap 12 pad 0/0/0/0 FILL/FIXED · 292×20  
    itemSpacing `inset.sm`
    - **Title** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 240×15  
      itemSpacing `inset.xs`
      - **Org Name** · text `title/sm` "Acme University" · HUG/HUG · 149×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Actions** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 40×16  
      itemSpacing `inset.xs`
      - **Icon/HelpCircle** · instance of **Icon/HelpCircle** (solid=false) · FIXED/FIXED · 16×16  
        prop visible←hasHelp
      - **Icon/Plus** · instance of **Icon/Plus** (solid=false) · FIXED/FIXED · 16×16  
        prop visible←hasAdd
  - **SearchField** · instance of **SearchField** (state=default, size=md) · row gap 12 pad 0/12/0/12 FILL/FIXED · 292×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
  - **EmptyState** · instance of **EmptyState** · column gap 16 pad 12/12/12/12 FILL/FILL · 292×628  
    itemSpacing `stack.md` · padding `inset.sm`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.raised`                                                                                                                                                                         |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                |
| Text color      | `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.action.secondary.text.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                                                                                                  |
| Spacing         | `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.md`, `stack.sm`                                                                                                                                             |
| Radius          | `radius.container`, `radius.control`                                                                                                                                                                                 |
| Border width    | `border.default`                                                                                                                                                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.sm`, `type.size.title.sm`                                                                                                                  |
| Effects         | `shadow/control`                                                                                                                                                                                                     |
| Text styles     | `title/sm`                                                                                                                                                                                                           |

### Slots and prop-controlled layers

| Layer                                 | Controlled property | Prop      |
| ------------------------------------- | ------------------- | --------- |
| Org Title › Actions › Icon/HelpCircle | visible             | `hasHelp` |
| Org Title › Actions › Icon/Plus       | visible             | `hasAdd`  |

### Composes

- EmptyState
- Icon/HelpCircle
- Icon/Plus
- SearchField

### Variant matrix

| state      | size    | fill                   | stroke | effect | text                                                                                                                                                                                    | icon                                                                                    |
| ---------- | ------- | ---------------------- | ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| empty      | 324×744 | `color.surface.raised` |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                                          | `color.icon.primary`<br>`color.icon.secondary`<br>`color.action.secondary.icon.default` |
| filled     | 324×744 | `color.surface.raised` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`                          | `color.icon.primary`<br>`color.icon.secondary`                                          |
| search     | 324×744 | `color.surface.raised` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`                          | `color.icon.primary`<br>`color.icon.secondary`                                          |
| no-results | 324×744 | `color.surface.raised` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.text.secondary`<br>`color.action.secondary.text.default`                                                          | `color.icon.primary`<br>`color.action.secondary.icon.default`                           |
| rename     | 324×744 | `color.surface.raised` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`<br>`color.text.tertiary` | `color.icon.primary`<br>`color.icon.secondary`                                          |

### Issues detected

- State axis uses non-standard value(s): search, no-results, rename.

## Compositions and examples on this page

### Legend — Location Type Icons (frame, 560×294)

Uses: Icon/Map ×1, Icon/Building ×1, Icon/Section ×1, Icon/Floor ×1, Icon/Area ×1, Icon/Room ×1, Icon/Desk ×1, Icon/Parking ×1, Icon/Car ×1

- **Legend — Location Type Icons** · frame · column gap 12 pad 16/16/16/16 FIXED/HUG · 560×294  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Title** · text `label/md` "Location type icons" · HUG/HUG · 126×10  
    fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
  - **Row** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 528×16  
    itemSpacing `inset.sm`
    - **Icon/Map** · instance of **Icon/Map** (solid=false) · FIXED/FIXED · 16×16
    - **Type** · text `body/md/regular` "Campus" · FIXED/HUG · 130×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Description** · text `body/sm/regular` "Top-level site — e.g. Cambridge Campus" · FILL/HUG · 358×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Row** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 528×16  
    itemSpacing `inset.sm`
    - **Icon/Building** · instance of **Icon/Building** (solid=false) · FIXED/FIXED · 16×16
    - **Type** · text `body/md/regular` "Building" · FIXED/HUG · 130×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Description** · text `body/sm/regular` "A building on a campus — e.g. Vesta Science Center" · FILL/HUG · 358×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Row** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 528×16  
    itemSpacing `inset.sm`
    - **Icon/Section** · instance of **Icon/Section** (solid=false) · FIXED/FIXED · 16×16
    - **Type** · text `body/md/regular` "Section" · FIXED/HUG · 130×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Description** · text `body/sm/regular` "A section within a building — e.g. West Research Wing" · FILL/HUG · 358×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Row** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 528×16  
    itemSpacing `inset.sm`
    - **Icon/Floor** · instance of **Icon/Floor** (solid=false) · FIXED/FIXED · 16×16
    - **Type** · text `body/md/regular` "Floor / level" · FIXED/HUG · 130×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Description** · text `body/sm/regular` "A storey of a building — e.g. Level 1" · FILL/HUG · 358×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Row** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 528×16  
    itemSpacing `inset.sm`
    - **Icon/Area** · instance of **Icon/Area** (solid=false) · FIXED/FIXED · 16×16
    - **Type** · text `body/md/regular` "Area" · FIXED/HUG · 130×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Description** · text `body/sm/regular` "An open, unenclosed area — e.g. Collaboration Zone" · FILL/HUG · 358×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Row** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 528×16  
    itemSpacing `inset.sm`
    - **Icon/Room** · instance of **Icon/Room** (solid=false) · FIXED/FIXED · 16×16
    - **Type** · text `body/md/regular` "Room" · FIXED/HUG · 130×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Description** · text `body/sm/regular` "An enclosed room — e.g. Auditorium 100" · FILL/HUG · 358×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Row** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 528×16  
    itemSpacing `inset.sm`
    - **Icon/Desk** · instance of **Icon/Desk** (solid=false) · FIXED/FIXED · 16×16
    - **Type** · text `body/md/regular` "Desk / workstation" · FIXED/HUG · 130×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Description** · text `body/sm/regular` "An individual work point — e.g. Bench Station 1" · FILL/HUG · 358×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Row** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 528×16  
    itemSpacing `inset.sm`
    - **Icon/Parking** · instance of **Icon/Parking** (solid=false) · FIXED/FIXED · 16×16
    - **Type** · text `body/md/regular` "Parking" · FIXED/HUG · 130×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Description** · text `body/sm/regular` "A garage or lot— e.g. Vesta Underground Garage" · FILL/HUG · 358×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Row** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 528×16  
    itemSpacing `inset.sm`
    - **Icon/Car** · instance of **Icon/Car** (solid=false) · FIXED/FIXED · 16×16
    - **Type** · text `body/md/regular` "Parking spot" · FIXED/HUG · 130×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Description** · text `body/sm/regular` "Parking space or spot — e.g. G-01" · FILL/HUG · 358×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

> A building on a campus — e.g. Vesta Science Center
> A section within a building — e.g. West Research Wing
> An open, unenclosed area — e.g. Collaboration Zone
> An individual work point — e.g. Bench Station 1
> A garage or lot— e.g. Vesta Underground Garage

## Documentation card

**Description**

Location tree sidebar: organization header with count and quick actions, search, and a Tree Navigation Panel of campuses, buildings, floors and spaces. Covers empty, filled, searching, no-results and inline-rename states.

**Anatomy**

324×744 panel on surface/raised with radius/container and inset/md padding. Org Title row (title/sm name, Counter, HelpCircle + Plus icons), SearchField (md, hasFilter), then Tree Navigation Panel or Empty State depending on state.

**States**

empty No locations yet; Empty State with create guidance  
filled Full location tree with item count  
search SearchField focused with a query, tree filtered  
no-results Focused query with no matches; Empty State  
rename One tree item in inline edit (caret shown)

**Usage**

Keep the org name to one line; the Counter reflects total locations.  
Plus creates a location; HelpCircle opens location help.  
Use the no-results state for unmatched queries, never a blank panel.

**Rules**

- DO: Scope the tree to the active organization
- DO: Keep hierarchy: campus → building → floor → space
- DO: Preserve selection when search clears

DON’T Mix devices into the location tree  
DON’T Hide the search below the fold  
DON’T Use for app navigation (use Sidebar)
