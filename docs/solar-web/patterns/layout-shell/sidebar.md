# Sidebar

> SOLAR Web · Figma page `↳ 🟢 Sidebar` (id `2202:1233`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/sidebar.json`](../../raw/patterns/layout-shell/sidebar.json)

## Component set: Sidebar

Primary app navigation rail: a Menu slot of Nav Items, a collapse toggle and the Biamp logo at the foot. 2 variants: expanded (false, true). Collapsed shows icons only with labels as tooltips; expanded shows icon and label. Props: Menu (slot). Generic primitive only: Sidebar/Workplace and Sidebar/Chatter assemblies live in the product files.

### Props

| Prop       | Type    | Options / default         |
| ---------- | ------- | ------------------------- |
| `expanded` | variant | **false** · true          |
| `Menu`     | slot    | default `[object Object]` |

Default variant: `expanded=false` · 2 variants · default size 64×744px

### Anatomy (default variant)

- **expanded=false** · component · column gap 4 pad 0/0/8/0 FIXED/FIXED · 64×744  
  itemSpacing `stack.2xs` · padding `stack.none`, `inset.none`, `inset.xs` · radius `radius.none`
  - **Menu** · slot · column gap 4 pad 0/0/0/0 HUG/FILL · 40×677  
    itemSpacing `stack.2xs` · prop slotContentId←Menu
    - **Nav Item** · instance of **Nav Item** (selected=true, hover=false, expanded=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
      fill `color.surface.active` · itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
    - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
      itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
    - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
      itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
    - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
      itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
    - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
      itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
    - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
      itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
    - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
      itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
  - **Nav Item** · frame · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
    itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
    - **Icon/PanelOpen** · instance of **Icon/PanelOpen** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`
  - **Biamp Logo** · instance of **Biamp Logo** (style=dark, size=sm) · FIXED/FIXED · 36×11

### Tokens used

| Role       | Tokens                                                          |
| ---------- | --------------------------------------------------------------- |
| Fills      | `color.surface.active`                                          |
| Text color | `color.text.primary`, `color.text.secondary`                    |
| Icon color | `color.icon.primary`, `color.icon.secondary`, `color.brand.red` |
| Spacing    | `inset.none`, `inset.xs`, `stack.2xs`, `stack.none`             |
| Radius     | `radius.control`, `radius.none`                                 |
| Sizes      | `icon.md`                                                       |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop   |
| ----- | ------------------- | ------ |
| Menu  | slotContentId       | `Menu` |

### Composes

- Biamp Logo
- Icon/PanelOpen
- Nav Item

### Variant matrix

| expanded | size    | fill | stroke | effect | text                                           | icon                                                                |
| -------- | ------- | ---- | ------ | ------ | ---------------------------------------------- | ------------------------------------------------------------------- |
| false    | 64×744  |      |        |        |                                                | `color.icon.primary`<br>`color.icon.secondary`<br>`color.brand.red` |
| true     | 198×744 |      |        |        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`<br>`color.icon.secondary`<br>`color.brand.red` |

### Issues detected

- Primitive color bound directly (CLR-002): `color.brand.red`.

## Issues detected (page)

- The documentation card's Accessibility section holds the Breadcrumbs page's text; it does not describe this component.

## Documentation card

**Usage**

Primary app navigation rail: a Menu slot of Nav Items, a collapse toggle and the Biamp logo at the foot. Collapsed shows icons only with labels as tooltips; expanded shows icon and label. Generic primitive only: Sidebar/Workplace and Sidebar/Chatter assemblies live in the product files.

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
