# Dropdown

> SOLAR Web · Figma page `↳ 🟢 Dropdown` (id `2202:1223`) · section `components/overlays` · raw data: [`raw/components/overlays/dropdown.json`](../../raw/components/overlays/dropdown.json)

## Component set: Dropdown

Form control that opens a Dropdown Menu of options on click. Single-select. 12 variants: size (md, sm) × state (default, hover, pressed, focus, disabled, error). focus matches Select's focus edge and ring. Select and Dropdown are one control drawn two ways — Select owns its panel, Dropdown opens a Dropdown Menu; pick one per product. Use for ≤10 predictable options — above that use Autocomplete.

### Props

| Prop              | Type    | Options / default                                        |
| ----------------- | ------- | -------------------------------------------------------- |
| `size`            | variant | **md** · sm                                              |
| `state`           | variant | **default** · hover · disabled · error · pressed · focus |
| `hasLabel`        | boolean | default `true`                                           |
| `hasHelper`       | boolean | default `true`                                           |
| `hasLeadingIcon`  | boolean | default `true`                                           |
| `hasTrailingIcon` | boolean | default `true`                                           |
| `mandatory`       | boolean | default `true`                                           |

Default variant: `size=md, state=default` · 12 variants · default size 240×76px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 FIXED/HUG · 240×76  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 48×10  
    itemSpacing `inset.2xs` · prop visible←hasLabel
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←mandatory
  - **Field** · frame · row gap 8 pad 0/12/0/12 FILL/FIXED · 240×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md` · prop visible←hasLeadingIcon
    - **Label** · text `body/md/regular` "Text" · FILL/HUG · 136×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md` · prop visible←hasTrailingIcon
    - **Icon/ChevronDown** · instance of **Icon/ChevronDown** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
  - **Helper text** · text `helper/md` "Helper text" · FILL/HUG · 240×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←hasHelper

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                             |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`                                                                                                     |
| Icon color      | `color.icon.disabled`, `color.icon.primary`                                                                                                                                                                                       |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`, `stack.xs`                                                                                                                                                                     |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Sizes           | `icon.md`, `icon.sm`                                                                                                                                                                                                              |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                                                                                                                                                  |
| Text styles     | `body/md/regular`, `helper/md`, `label/md`                                                                                                                                                                                        |

### Slots and prop-controlled layers

| Layer             | Controlled property | Prop              |
| ----------------- | ------------------- | ----------------- |
| Label             | visible             | `hasLabel`        |
| Label › *         | visible             | `mandatory`       |
| Field › Icon/None | visible             | `hasLeadingIcon`  |
| Field › Icon/None | visible             | `hasTrailingIcon` |
| Helper text       | visible             | `hasHelper`       |

### Composes

- Icon/ChevronDown
- Icon/None

### Variant matrix

| size | state    | size   | fill | stroke | effect | text                                                                         | icon                  |
| ---- | -------- | ------ | ---- | ------ | ------ | ---------------------------------------------------------------------------- | --------------------- |
| md   | default  | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | default  | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| md   | hover    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | hover    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| md   | pressed  | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | pressed  | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| md   | disabled | 240×76 |      |        |        | `color.text.disabled`                                                        | `color.icon.disabled` |
| sm   | disabled | 160×66 |      |        |        | `color.text.disabled`                                                        | `color.icon.disabled` |
| md   | error    | 240×76 |      |        |        | `color.text.feedback.danger`<br>`color.text.primary`                         | `color.icon.primary`  |
| sm   | error    | 160×66 |      |        |        | `color.text.feedback.danger`<br>`color.text.primary`                         | `color.icon.primary`  |
| md   | focus    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |
| sm   | focus    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`  |

## Component set: Dropdown Item

Single row inside a Dropdown Menu. 8 variants: size (md, sm) × state (default, hover, selected, disabled). Optional leading icon (20px), checkbox and description line; rows that hide them are 34px (md). Keyboard focus follows the aria-activedescendant pattern and draws the hover look — no separate ring. Rows under 44px rely on their own box as the target (WCAG 2.2 minimum 24px).

### Props

| Prop            | Type    | Options / default                         |
| --------------- | ------- | ----------------------------------------- |
| `size`          | variant | **md** · sm                               |
| `state`         | variant | **default** · hover · selected · disabled |
| `show helper`   | boolean | default `true`                            |
| `show icon`     | boolean | default `true`                            |
| `show checkbox` | boolean | default `true`                            |

Default variant: `size=md, state=default` · 8 variants · default size 240×51px

### Anatomy (default variant)

- **size=md, state=default** · component · row gap 8 pad 12/12/12/12 FIXED/HUG · 240×51  
  itemSpacing `inset.xs` · padding `inset.sm`
  - **Checkbox** · instance of **Checkbox** (checked=false, disabled=false, hover=false, mixed=false, focus=false) · FIXED/FIXED · 16×16  
    stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.control` · prop visible←show checkbox
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
    height `icon.md` · prop visible←show icon
  - **Content** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 164×27  
    itemSpacing `inset.xs`
    - **Label** · text `body/md/medium` "Option label" · FILL/HUG · 164×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Description** · text `body/sm/regular` "Helper text" · FILL/HUG · 164×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400` · prop visible←show helper

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.active`, `color.surface.hover`                                                                                                                              |
| Strokes         | `color.border.medium`                                                                                                                                                      |
| Text color      | `color.text.disabled`, `color.text.primary`, `color.text.secondary`                                                                                                        |
| Icon color      | `color.icon.disabled`, `color.icon.inverse`, `color.icon.primary`                                                                                                          |
| Spacing         | `inset.sm`, `inset.xs`                                                                                                                                                     |
| Radius          | `radius.control`                                                                                                                                                           |
| Border width    | `border.default`                                                                                                                                                           |
| Sizes           | `icon.md`                                                                                                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.size.body.md`, `type.size.body.sm` |
| Text styles     | `body/md/medium`, `body/sm/regular`                                                                                                                                        |

### Slots and prop-controlled layers

| Layer                 | Controlled property | Prop            |
| --------------------- | ------------------- | --------------- |
| Checkbox              | visible             | `show checkbox` |
| Icon/None             | visible             | `show icon`     |
| Content › Description | visible             | `show helper`   |

### Composes

- Checkbox
- Icon/None

### Variant matrix

| size | state    | size   | fill                   | stroke | effect | text                                           | icon                                         |
| ---- | -------- | ------ | ---------------------- | ------ | ------ | ---------------------------------------------- | -------------------------------------------- |
| md   | default  | 240×51 |                        |        |        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                         |
| sm   | default  | 160×42 |                        |        |        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                         |
| md   | hover    | 240×51 | `color.surface.hover`  |        |        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                         |
| sm   | hover    | 160×42 | `color.surface.hover`  |        |        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`                         |
| md   | selected | 240×51 | `color.surface.active` |        |        | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.icon.primary` |
| sm   | selected | 160×42 | `color.surface.active` |        |        | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.icon.primary` |
| md   | disabled | 240×51 |                        |        |        | `color.text.disabled`                          | `color.icon.disabled`                        |
| sm   | disabled | 160×42 |                        |        |        | `color.text.disabled`                          | `color.icon.disabled`                        |

## Component set: Dropdown Group Label

Non-interactive section header inside a Dropdown Menu. Groups related items (e.g., 'Recent', 'All projects'). Use sparingly — only when a list has 3+ distinct categories. Aligns with the leading edge of its parent Dropdown Menu.

### Props

| Prop   | Type    | Options / default |
| ------ | ------- | ----------------- |
| `size` | variant | sm · **md**       |

Default variant: `size=md` · 2 variants · default size 240×34px

### Anatomy (default variant)

- **size=md** · component · row gap 8 pad 12/12/12/12 FIXED/HUG · 240×34  
  fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
  - **Group Label** · text `body/md/medium` "Group Label" · HUG/HUG · 78×10  
    fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`                                                                        |
| Text color      | `color.text.secondary`                                                                            |
| Spacing         | `inset.sm`, `inset.xs`                                                                            |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Text styles     | `body/md/medium`                                                                                  |

### Variant matrix

| size | size   | fill                       | stroke | effect | text                   | icon |
| ---- | ------ | -------------------------- | ------ | ------ | ---------------------- | ---- |
| md   | 240×34 | `color.surface.background` |        |        | `color.text.secondary` |      |
| sm   | 160×25 | `color.surface.background` |        |        | `color.text.secondary` |      |

## Component set: Dropdown Menu

Floating container for Dropdown Items and Dropdown Group Labels. Appears on Dropdown trigger click, anchored to the trigger's bottom edge. Caps height at ~300px with internal scroll. Dismisses on outside click, Escape, or selection. Sizes match trigger size. Focus-trapped while open.

### Props

| Prop      | Type    | Options / default         |
| --------- | ------- | ------------------------- |
| `size`    | variant | sm · **md**               |
| `Content` | slot    | default `[object Object]` |

Default variant: `size=md` · 2 variants · default size 240×238px

### Anatomy (default variant)

- **size=md** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 240×238  
  fill `color.surface.overlay` · stroke `color.border.medium` 1px · effect `shadow/overlay` · padding `inset.none` · strokeWeight `border.default` · radius `radius.container`
  - **Content** · slot · column gap 0 pad 0/0/0/0 HUG/HUG · 240×238  
    itemSpacing `inset.none` · prop slotContentId←Content
    - **Dropdown Group Label** · instance of **Dropdown Group Label** (size=md) · row gap 8 pad 12/12/12/12 FIXED/HUG · 240×34  
      fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FIXED/HUG · 240×34  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FIXED/HUG · 240×34  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FIXED/HUG · 240×34  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FIXED/HUG · 240×34  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FIXED/HUG · 240×34  
      itemSpacing `inset.xs` · padding `inset.sm`
    - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FIXED/HUG · 240×34  
      itemSpacing `inset.xs` · padding `inset.sm`

### Tokens used

| Role         | Tokens                                              |
| ------------ | --------------------------------------------------- |
| Fills        | `color.surface.background`, `color.surface.overlay` |
| Strokes      | `color.border.medium`                               |
| Text color   | `color.text.primary`, `color.text.secondary`        |
| Icon color   | `color.icon.primary`                                |
| Spacing      | `inset.none`, `inset.sm`, `inset.xs`                |
| Radius       | `radius.container`                                  |
| Border width | `border.default`                                    |
| Effects      | `shadow/overlay`                                    |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop      |
| ------- | ------------------- | --------- |
| Content | slotContentId       | `Content` |

### Composes

- Dropdown Group Label
- Dropdown Item

### Variant matrix

| size | size    | fill                    | stroke                | effect           | text                                           | icon                 |
| ---- | ------- | ----------------------- | --------------------- | ---------------- | ---------------------------------------------- | -------------------- |
| md   | 240×238 | `color.surface.overlay` | `color.border.medium` | `shadow/overlay` | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| sm   | 160×217 | `color.surface.overlay` | `color.border.medium` | `shadow/overlay` | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |

## Documentation card

**Description**

Form control that opens a list of options on click. Single-select. Use for ≤10 predictable options — use a Combobox above that count.

**Sub-components**

Dropdown The trigger button + selected value.  
Dropdown Menu Floating container for items.  
Dropdown Item Single option row.  
Dropdown Group Label Non-interactive section header.

**Sizes**

md Default for forms and standalone use.  
sm Dense tables, inline filters, toolbars.

**States**

default, hover, disabled.  
Note: current variants use `state=active` (legacy) — migrate to `pressed` per SOLAR state vocabulary.  
`state=error` should migrate to feedback.danger border conventions.

**Labels & Content**

Placeholder: 'Select...' — never empty.  
Selected value: truncate with ellipsis; never wrap.  
Provide aria-label or paired label text for every Dropdown.

**Rules**

- DO: Use for ≤10 predictable options
- DO: Provide a paired label
- DO: Close on selection, outside click, Escape
- DO: Anchor menu to trigger's bottom edge

- DON'T: Use with >10 options (use Combobox)
- DON'T: Open without keyboard focus trap
- DON'T: Hide required-field errors — use error state
- DON'T: Nest Dropdowns inside other Dropdowns
