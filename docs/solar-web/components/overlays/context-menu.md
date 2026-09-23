# Context Menu

> SOLAR Web · Figma page `↳ 🟢 Context Menu` (id `2202:1219`) · section `components/overlays` · raw data: [`raw/components/overlays/context-menu.json`](../../raw/components/overlays/context-menu.json)

## Component set: Context Menu Item

Single row inside a Context Menu. 5 variants: state (default, hover, focus, disabled) × destructive (false, true), shipped as the used combinations. destructive=true is for irreversible actions like Delete and uses color.text.feedback.danger — reserve it for true destructive actions, not every secondary action. Pair with an optional leading icon and a trailing keyboard shortcut (Kbd). Submenus are not supported — keep to a single nesting level.

### Props

| Prop               | Type    | Options / default                      |
| ------------------ | ------- | -------------------------------------- |
| `state`            | variant | **default** · hover · focus · disabled |
| `destructive`      | variant | **false** · true                       |
| `label`            | text    | default `Action`                       |
| `shortcut`         | text    | default `⌘K`                           |
| `showLeadingIcon`  | boolean | default `true`                         |
| `show shortcut`    | boolean | default `true`                         |
| `showTrailingIcon` | boolean | default `false`                        |

Default variant: `state=default, destructive=false` · 5 variants · default size 200×36px

### Anatomy (default variant)

- **state=default, destructive=false** · component · row gap 12 pad 0/12/0/12 FIXED/FIXED · 200×36  
  itemSpacing `stack.sm` · padding `inset.sm`
  - **LeadingIcon** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    itemSpacing `stack.xs` · height `icon.sm` · prop visible←showLeadingIcon
  - **Label** · text `label/md` "Action" · FILL/HUG · 113×10  
    fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←label
  - **Shortcut** · text `body/md/medium` "⌘K" · HUG/HUG · 23×10  
    fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop visible←show shortcut, characters←shortcut
  - ~~**LeadingIcon**~~ (hidden by default) · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    itemSpacing `stack.xs` · height `icon.sm` · prop visible←showTrailingIcon

### Tokens used

| Role            | Tokens                                                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.hover`                                                                                                                                |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.primary`, `color.text.tertiary`                                                     |
| Icon color      | `color.icon.disabled`, `color.icon.feedback.danger`, `color.icon.primary`                                                                            |
| Spacing         | `inset.sm`, `stack.sm`, `stack.xs`                                                                                                                   |
| Sizes           | `icon.sm`                                                                                                                                            |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.label.md` |
| Text styles     | `body/md/medium`, `label/md`                                                                                                                         |

### Slots and prop-controlled layers

| Layer       | Controlled property | Prop               |
| ----------- | ------------------- | ------------------ |
| LeadingIcon | visible             | `showLeadingIcon`  |
| Label       | characters          | `label`            |
| Shortcut    | visible             | `show shortcut`    |
| Shortcut    | characters          | `shortcut`         |
| LeadingIcon | visible             | `showTrailingIcon` |

### Composes

- Icon/None

### Variant matrix

| state    | destructive | size   | fill                  | stroke | effect | text                                          | icon                         |
| -------- | ----------- | ------ | --------------------- | ------ | ------ | --------------------------------------------- | ---------------------------- |
| default  | false       | 200×36 |                       |        |        | `color.text.primary`<br>`color.text.tertiary` | `color.icon.primary`         |
| hover    | false       | 200×36 | `color.surface.hover` |        |        | `color.text.primary`<br>`color.text.tertiary` | `color.icon.primary`         |
| focus    | false       | 200×36 | `color.surface.hover` |        |        | `color.text.primary`<br>`color.text.tertiary` | `color.icon.primary`         |
| disabled | false       | 200×36 |                       |        |        | `color.text.disabled`                         | `color.icon.disabled`        |
| default  | true        | 200×36 |                       |        |        | `color.text.feedback.danger`                  | `color.icon.feedback.danger` |

## Component: Context Menu

Floating menu triggered by right-click or long-press. Anchored to the pointer position; clamps to viewport edges. Holds Context Menu Items and dividers. Dismisses on outside click, Escape, or item selection. Focus-trapped while open. Use for object-specific actions; for toolbar-triggered actions, use Dropdown Menu.

### Props

| Prop      | Type | Options / default         |
| --------- | ---- | ------------------------- |
| `Content` | slot | default `[object Object]` |

### Anatomy (default variant)

- **Context Menu** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 200×253  
  fill `color.surface.dialog` · stroke `color.border.subtle` 1px · effect `shadow/dialog` · padding `inset.none` · strokeWeight `border.default` · radius `radius.container`
  - **Content** · slot · column gap 0 pad 0/0/0/0 HUG/HUG · 200×253  
    prop slotContentId←Content
    - **Context Menu Item** · instance of **Context Menu Item** (state=default, destructive=false) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 200×36  
      itemSpacing `stack.sm` · padding `inset.sm`
    - **Context Menu Item** · instance of **Context Menu Item** (state=default, destructive=false) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 200×36  
      itemSpacing `stack.sm` · padding `inset.sm`
    - **Context Menu Item** · instance of **Context Menu Item** (state=default, destructive=false) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 200×36  
      itemSpacing `stack.sm` · padding `inset.sm`
    - **Context Menu Item** · instance of **Context Menu Item** (state=default, destructive=false) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 200×36  
      itemSpacing `stack.sm` · padding `inset.sm`
    - **Context Menu Item** · instance of **Context Menu Item** (state=default, destructive=false) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 200×36  
      itemSpacing `stack.sm` · padding `inset.sm`
    - **Context Menu Item** · instance of **Context Menu Item** (state=default, destructive=false) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 200×36  
      itemSpacing `stack.sm` · padding `inset.sm`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 200×1
    - **Context Menu Item** · instance of **Context Menu Item** (state=default, destructive=true) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 200×36  
      itemSpacing `stack.sm` · padding `inset.sm`

### Tokens used

| Role         | Tokens                               |
| ------------ | ------------------------------------ |
| Fills        | `color.surface.dialog`               |
| Strokes      | `color.border.subtle`                |
| Spacing      | `inset.none`, `inset.sm`, `stack.sm` |
| Radius       | `radius.container`                   |
| Border width | `border.default`                     |
| Effects      | `shadow/dialog`                      |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop      |
| ------- | ------------------- | --------- |
| Content | slotContentId       | `Content` |

### Composes

- Context Menu Item
- Divider

## Documentation card

**Description**

A right-click triggered floating menu of actions. Shares the same item anatomy as Dropdown Menu but is activated via contextual interaction rather than a button trigger. Use for canvas object actions, file management, and contextual operations.

**Sub-Components**

Menu Item An individual action row with optional leading icon and keyboard shortcut.  
Menu Divider A thin horizontal line separating groups of related actions.  
Menu Panel The container holding items, with elevation and border.

**States**

default Item is idle and interactive.  
hover Pointer is over the item.  
focus Item has keyboard focus.  
disabled Item is visible but not actionable.  
destructive Irreversible action — label and icon use danger tokens.

**Rules**

- DO: Group related actions with dividers
- DO: Place destructive actions at the bottom
- DO: Include keyboard shortcuts for power users
- DO: Keep to one level of nesting (no sub-menus)

- DON'T: Use for primary navigation — use Sidebar or Tab Bar
- DON'T: Show more than 10 items without grouping
- DON'T: Mix destructive and safe actions in the same group
- DON'T: Disable items without explanation via tooltip
