# Command Palette

> SOLAR Web · Figma page `↳ 🟢 Command Palette` (id `2202:1252`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/command-palette.json`](../../raw/patterns/layout-shell/command-palette.json)

## Component set: Command Item

One result in the Command Palette: leading icon slot, command label and a Group · Category meta line. 2 variants: state (default, hover). hover doubles as the keyboard-highlighted row. Use only inside Command Palette; for menu rows use Dropdown Item.

### Props

| Prop    | Type    | Options / default   |
| ------- | ------- | ------------------- |
| `state` | variant | hover · **default** |

Default variant: `state=default` · 2 variants · default size 640×56px

### Anatomy (default variant)

- **state=default** · component · row gap 12 pad 12/12/12/12 FILL/FIXED · 640×56  
  itemSpacing `stack.sm` · padding `inset.sm` · radius `radius.control`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm`
  - **Text** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 588×27  
    itemSpacing `stack.xs`
    - **Title** · text `body/md/medium` "Command label" · HUG/HUG · 101×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Meta** · text `body/sm/medium` "Group · Category" · HUG/HUG · 95×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.hover`                                                                                                                              |
| Text color      | `color.text.inverse`, `color.text.primary`, `color.text.secondary`                                                                                 |
| Icon color      | `color.icon.primary`                                                                                                                               |
| Spacing         | `inset.sm`, `stack.sm`, `stack.xs`                                                                                                                 |
| Radius          | `radius.control`                                                                                                                                   |
| Sizes           | `icon.sm`                                                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.size.body.md`, `type.size.body.sm` |
| Text styles     | `body/md/medium`, `body/sm/medium`                                                                                                                 |

### Composes

- Icon/None

### Variant matrix

| state   | size   | fill                  | stroke | effect | text                                                                   | icon                 |
| ------- | ------ | --------------------- | ------ | ------ | ---------------------------------------------------------------------- | -------------------- |
| default | 640×56 |                       |        |        | `color.text.primary`<br>`color.text.secondary`                         | `color.icon.primary` |
| hover   | 640×56 | `color.surface.hover` |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.inverse` | `color.icon.primary` |

## Component: Command Palette

Keyboard-first dialog for finding and running commands: search field with a Kbd shortcut, grouped Command Item results and a footer of key hints (Navigate, Select, Close). Single component. Open with the global shortcut; Arrow keys move, Enter runs, Escape closes. Results filter as the user types and the list announces its count; use Search Results Panel for content search.

### Anatomy (default variant)

- **Command Palette** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 640×606  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`
  - **Search** · frame · row gap 12 pad 16/16/16/16 FILL/HUG · 640×49  
    fill `color.surface.dialog` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default`
    - **Icon** · instance of **Icon/Search** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
    - **Placeholder** · text `body/lg/regular` "Search commands…" · FILL/HUG · 540×12  
      fill `color.text.secondary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.400`
    - **Kbd** · instance of **Kbd** (type=default) · row gap 0 pad 4/4/4/4 HUG/HUG · 28×17  
      fill `color.surface.feedback.neutral.strong` · stroke `color.border.subtle` 1px · itemSpacing `inset.none` · padding `inset.2xs` · strokeWeight `border.default` · radius `radius.control`
  - **Results** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 640×516  
    fill `color.surface.dialog` · itemSpacing `stack.none` · padding `inset.none`
    - **Dropdown Group Label** · instance of **Dropdown Group Label** (size=md) · row gap 8 pad 12/12/12/12 FILL/HUG · 640×34  
      fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
    - **Command Item** · instance of **Command Item** (state=default) · row gap 12 pad 12/12/12/12 FILL/FIXED · 640×56  
      itemSpacing `stack.sm` · padding `inset.sm` · radius `radius.control`
    - **Command Item** · instance of **Command Item** (state=hover) · row gap 12 pad 12/12/12/12 FILL/FIXED · 640×56  
      fill `color.surface.hover` · itemSpacing `stack.sm` · padding `inset.sm` · radius `radius.none`
    - **Command Item** · instance of **Command Item** (state=default) · row gap 12 pad 12/12/12/12 FILL/FIXED · 640×56  
      itemSpacing `stack.sm` · padding `inset.sm` · radius `radius.control`
    - **Command Item** · instance of **Command Item** (state=default) · row gap 12 pad 12/12/12/12 FILL/FIXED · 640×56  
      itemSpacing `stack.sm` · padding `inset.sm` · radius `radius.control`
    - **Command Item** · instance of **Command Item** (state=default) · row gap 12 pad 12/12/12/12 FILL/FIXED · 640×56  
      itemSpacing `stack.sm` · padding `inset.sm` · radius `radius.control`
    - **Dropdown Group Label** · instance of **Dropdown Group Label** (size=md) · row gap 8 pad 12/12/12/12 FILL/HUG · 640×34  
      fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
    - **Command Item** · instance of **Command Item** (state=default) · row gap 12 pad 12/12/12/12 FILL/FIXED · 640×56  
      itemSpacing `stack.sm` · padding `inset.sm` · radius `radius.control`
    - **Command Item** · instance of **Command Item** (state=default) · row gap 12 pad 12/12/12/12 FILL/FIXED · 640×56  
      itemSpacing `stack.sm` · padding `inset.sm` · radius `radius.control`
    - **Command Item** · instance of **Command Item** (state=default) · row gap 12 pad 12/12/12/12 FILL/FIXED · 640×56  
      itemSpacing `stack.sm` · padding `inset.sm` · radius `radius.control`
  - **Footer** · frame · row gap 20 pad 12/16/12/16 FILL/HUG · 640×41  
    fill `color.surface.background` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
    - **Hint** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 106×17  
      itemSpacing `stack.xs`
      - **Kbd** · instance of **Kbd** (type=default) · row gap 0 pad 4/4/4/4 HUG/HUG · 20×17  
        fill `color.surface.feedback.neutral.strong` · stroke `color.border.subtle` 1px · itemSpacing `inset.none` · padding `inset.2xs` · strokeWeight `border.default` · radius `radius.control`
      - **Kbd** · instance of **Kbd** (type=default) · row gap 0 pad 4/4/4/4 HUG/HUG · 20×17  
        fill `color.surface.feedback.neutral.strong` · stroke `color.border.subtle` 1px · itemSpacing `inset.none` · padding `inset.2xs` · strokeWeight `border.default` · radius `radius.control`
      - **Description** · text `body/sm/medium` "Navigate" · HUG/HUG · 50×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
    - **Hint** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 63×17  
      itemSpacing `stack.xs`
      - **Kbd** · instance of **Kbd** (type=default) · row gap 0 pad 4/4/4/4 HUG/HUG · 20×17  
        fill `color.surface.feedback.neutral.strong` · stroke `color.border.subtle` 1px · itemSpacing `inset.none` · padding `inset.2xs` · strokeWeight `border.default` · radius `radius.control`
      - **Description** · text `body/sm/medium` "Select" · HUG/HUG · 35×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
    - **Hint** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 68×17  
      itemSpacing `stack.xs`
      - **Kbd** · instance of **Kbd** (type=default) · row gap 0 pad 4/4/4/4 HUG/HUG · 28×17  
        fill `color.surface.feedback.neutral.strong` · stroke `color.border.subtle` 1px · itemSpacing `inset.none` · padding `inset.2xs` · strokeWeight `border.default` · radius `radius.control`
      - **Description** · text `body/sm/medium` "Close" · HUG/HUG · 32×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.dialog`, `color.surface.feedback.neutral.strong`, `color.surface.hover`                                                         |
| Strokes         | `color.border.subtle`                                                                                                                                                      |
| Text color      | `color.text.secondary`                                                                                                                                                     |
| Spacing         | `inset.2xs`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.none`, `stack.sm`, `stack.xs`                                                            |
| Radius          | `radius.control`, `radius.dialog`, `radius.none`                                                                                                                           |
| Border width    | `border.default`                                                                                                                                                           |
| Sizes           | `icon.sm`                                                                                                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.lg`, `type.line-height.body.sm`, `type.size.body.lg`, `type.size.body.sm` |
| Effects         | `shadow/dialog`                                                                                                                                                            |
| Text styles     | `body/lg/regular`, `body/sm/medium`                                                                                                                                        |

### Composes

- Command Item
- Dropdown Group Label
- Icon/Search
- Kbd

## Documentation card

**Usage**

Single component.

**Anatomy**

Top-level layers of the component: Search · Results · Footer. Instances keep their SOLAR component names.

**Specification**

Single component.

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Keyboard-first dialog for finding and running commands: search field with a Kbd shortcut, grouped Command Item results and a footer of key hints (Navigate, Select, Close). Open with the global shortcut; Arrow keys move, Enter runs, Escape closes. Results filter as the user types and the list announces its count; use Search Results Panel for content search.
