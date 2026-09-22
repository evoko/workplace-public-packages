# Tree Navigation Panel

> SOLAR Web · Figma page `↳ 🟢 Tree Navigation Panel` (id `2966:623`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/tree-navigation-panel.json`](../../raw/patterns/layout-shell/tree-navigation-panel.json)

## Component: Tree Navigation Panel

Side panel that holds a hierarchy of Tree Items for browsing nested locations, folders or devices. Single component. Props: Tree Items (slot). Items expand and collapse in place; Arrow keys move and open nodes, the selected item carries aria-selected. For a flat section list use Section Nav.

### Props

| Prop         | Type | Options / default         |
| ------------ | ---- | ------------------------- |
| `Tree Items` | slot | default `[object Object]` |

### Anatomy (default variant)

- **Tree Navigation Panel** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 256×756  
  itemSpacing `inset.none` · padding `inset.none` · radius `radius.none`
  - **Tree Items** · slot · column gap 0 pad 0/8/0/8 FIXED/FIXED · 256×756  
    itemSpacing `stack.none` · padding `inset.xs`, `inset.none` · radius `radius.none` · prop slotContentId←Tree Items
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=true, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item/02/false/false/true** · row gap 4 pad 0/8/0/16 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.md`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item/03/false/true/false** · row gap 4 pad 0/8/0/20 FILL/FIXED · 240×32  
      fill `color.surface.active` · itemSpacing `inset.2xs` · padding `inset.lg`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item/02/false/false/false** · row gap 4 pad 0/8/0/16 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.md`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item/02/false/false/false** · row gap 4 pad 0/8/0/16 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.md`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item/02/false/false/false** · row gap 4 pad 0/8/0/16 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.md`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item/02/false/false/false** · row gap 4 pad 0/8/0/16 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.md`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 240×32  
      itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`

Instance census (tree capped at depth 3): StatusIndicator ×48, Icon/None ×42, Checkbox ×24, Tag ×24, Counter ×24, Icon/ChevronRight ×22, Tree Item ×18, .Tree Indent ×18, Tree Item/02/false/false/false ×4, Icon/ChevronDown ×2, Tree Item/02/false/false/true ×1, Tree Item/03/false/true/false ×1

### Tokens used

| Role    | Tokens                                                                      |
| ------- | --------------------------------------------------------------------------- |
| Fills   | `color.surface.active`                                                      |
| Spacing | `inset.2xs`, `inset.lg`, `inset.md`, `inset.none`, `inset.xs`, `stack.none` |
| Radius  | `radius.control`, `radius.none`                                             |

### Slots and prop-controlled layers

| Layer      | Controlled property | Prop         |
| ---------- | ------------------- | ------------ |
| Tree Items | slotContentId       | `Tree Items` |

### Composes

- Tree Item
- Tree Item/02/false/false/false
- Tree Item/02/false/false/true
- Tree Item/03/false/true/false

## Documentation card

**Description**

A hierarchical, expandable navigation panel for nested structures (folders, org trees, device groups). Use when items have parent–child depth; use Section Nav for flat lists.

**Anatomy**

Panel container · Tree Items (chevron · icon · label · optional count) · nesting indentation · optional search / filter.

**Behaviour**

Nodes expand and collapse; selection marks the active node. Deep trees support search and keyboard traversal. Indentation encodes depth.

**States**

Item: default, hover, focus, selected, disabled × collapsed / expanded. Panel: loaded, loading, empty.

**Accessibility**

role=tree with role=treeitem; aria-expanded, aria-selected, aria-level. Arrow-key traversal (↑↓←→), Enter/Space to activate. Visible focus.

**Rules**

Use for real hierarchy  
Show depth by indentation  
Support keyboard tree traversal  
Offer search on deep trees

Use for flat lists (use Section Nav)  
Nest beyond ~4 visible levels  
Rely on colour for selection  
Hide the expand affordance
