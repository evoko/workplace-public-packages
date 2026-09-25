# Breadcrumbs

> SOLAR Web · Figma page `↳ 🟢 Breadcrumbs` (id `2163:3712`) · section `components/navigation` · raw data: [`raw/components/navigation/breadcrumbs.json`](../../raw/components/navigation/breadcrumbs.json)

## Component set: Breadcrumb Item

One segment of a breadcrumb trail.

Variants (5):
• type — link | current (current is the terminal, non-interactive item)
• state — default | hover | focus | disabled (type=link only; focus carries shadow/focus/default)

Use inside the Breadcrumbs wrapper — not standalone.

### Props

| Prop    | Type    | Options / default                      |
| ------- | ------- | -------------------------------------- |
| `type`  | variant | **link** · current                     |
| `state` | variant | **default** · hover · disabled · focus |

Default variant: `type=link, state=default` · 5 variants · default size 36×10px

### Anatomy (default variant)

- **type=link, state=default** · component · row gap 0 pad 0/0/0/0 HUG/HUG · 36×10  
  itemSpacing `inset.none` · padding `inset.none`
  - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
    fill `color.text.secondary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Text color      | `color.text.disabled`, `color.text.primary`, `color.text.secondary`                                 |
| Spacing         | `inset.none`                                                                                        |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md` |
| Effects         | `shadow/focus/default`                                                                              |
| Text styles     | `label/md`                                                                                          |

### Variant matrix

| type    | state    | size  | fill | stroke | effect                 | text                   | icon |
| ------- | -------- | ----- | ---- | ------ | ---------------------- | ---------------------- | ---- |
| link    | default  | 36×10 |      |        |                        | `color.text.secondary` |      |
| link    | hover    | 36×10 |      |        |                        | `color.text.primary`   |      |
| link    | disabled | 36×10 |      |        |                        | `color.text.disabled`  |      |
| current | default  | 36×10 |      |        |                        | `color.text.primary`   |      |
| link    | focus    | 36×10 |      |        | `shadow/focus/default` | `color.text.primary`   |      |

## Component set: Breadcrumbs

Shows the user’s location in a navigational hierarchy and allows quick jumps to ancestors.

Variants (5):
• items — 2 | 3 | 4 | 5 | multiple (use multiple when the trail exceeds 5 levels — the middle collapses to an ellipsis; compose the ellipsis with a Dropdown Menu listing the hidden pages)

Accessibility: wrap in `<nav aria-label="Breadcrumb">`. The final item uses aria-current="page" and is not a link. Separators are aria-hidden. Breadcrumb Item carries a focus state.

Use for deep page trees, not for linear progress (see Stepper) or single-level flows (omit entirely).

### Props

| Prop    | Type    | Options / default            |
| ------- | ------- | ---------------------------- |
| `items` | variant | 2 · 3 · 4 · 5 · **multiple** |

Default variant: `items=multiple` · 5 variants · default size 156×12px

### Anatomy (default variant)

- **items=multiple** · component · row gap 12 pad 0/0/0/0 HUG/HUG · 156×12  
  itemSpacing `stack.sm`
  - **item-1** · instance of **Breadcrumb Item** (type=link, state=default) · row gap 0 pad 0/0/0/0 HUG/HUG · 36×10  
    itemSpacing `inset.none` · padding `inset.none`
  - **Icon/ChevronRight** · instance of **Icon/ChevronRight** (solid=false) · FIXED/FIXED · 12×12  
    height `icon.xs`
  - **item-2** · instance of **Breadcrumb Item** (type=link, state=default) · row gap 0 pad 0/0/0/0 HUG/HUG · 12×10  
    itemSpacing `inset.none` · padding `inset.none`
  - **Icon/ChevronRight** · instance of **Icon/ChevronRight** (solid=false) · FIXED/FIXED · 12×12  
    height `icon.xs`
  - **current** · instance of **Breadcrumb Item** (type=current, state=default) · row gap 0 pad 0/0/0/0 HUG/HUG · 36×10  
    itemSpacing `inset.none` · padding `inset.none`

### Tokens used

| Role       | Tokens                                       |
| ---------- | -------------------------------------------- |
| Text color | `color.text.primary`, `color.text.secondary` |
| Icon color | `color.icon.secondary`                       |
| Spacing    | `inset.none`, `stack.sm`                     |
| Sizes      | `icon.xs`                                    |

### Composes

- Breadcrumb Item
- Icon/ChevronRight

### Variant matrix

| items    | size   | fill | stroke | effect | text                                           | icon                   |
| -------- | ------ | ---- | ------ | ------ | ---------------------------------------------- | ---------------------- |
| multiple | 156×12 |      |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.secondary` |
| 2        | 108×12 |      |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.secondary` |
| 3        | 180×12 |      |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.secondary` |
| 4        | 252×12 |      |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.secondary` |
| 5        | 324×12 |      |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.secondary` |

## Documentation card

**Usage**

Shows the user’s location in a navigational hierarchy and allows quick jumps to ancestors. Use for deep page trees, not for linear progress (see Stepper) or single-level flows (omit entirely).

**Accessibility**

Wrap the trail in `<nav aria-label="Breadcrumb">` and render as an ordered list.  
Mark the current item with aria-current="page" — never link it.  
Separators are decorative: aria-hidden="true".  
Keyboard: Tab moves between links, Enter activates. Ellipsis menu: Arrow keys to navigate, Esc to dismiss.

**Rules**

- DO: Mirror your site's real hierarchy
- DO: Use 'multiple' for deep paths — keep first + last visible
- DO: Make every non-current item a real link
- DO: Keep labels short and match the destination page title

- DON'T: Link the current page
- DON'T: Use Breadcrumbs as primary navigation
- DON'T: Mix Breadcrumbs in some views and omit in others
- DON'T: Insert the app name or a Home icon mid-trail
