# Section Nav

> SOLAR Web · Figma page `↳ 🟢 Section Nav` (id `8041:127`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/section-nav.json`](../../raw/patterns/layout-shell/section-nav.json)

## Component: Section Nav

Vertical in-page navigation: Section Nav Group Headers with their Section Nav Items in one slot. Single component. Props: Items (slot). Use at the left of a long settings or detail page to jump between sections; it is a nav landmark and the active item carries aria-current. For app-level navigation use Sidebar.

### Props

| Prop    | Type | Options / default         |
| ------- | ---- | ------------------------- |
| `Items` | slot | default `[object Object]` |

### Anatomy (default variant)

- **Section Nav** · component · column gap 16 pad 12/12/12/12 FIXED/HUG · 221×416  
  fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.sm` · strokeWeight `border.default`
  - **Items** · slot · column gap 4 pad 0/0/0/0 FILL/HUG · 197×392  
    fill `color.surface.base` · itemSpacing `inset.2xs` · prop slotContentId←Items
    - **Section Nav Group Header** · instance of **Section Nav Group Header** · row gap 0 pad 0/8/0/8 FILL/FIXED · 197×32  
      padding `inset.xs`
    - **Section Nav Item** · instance of **Section Nav Item** (state=selected) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      fill `color.surface.active` · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FIXED/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Group Header** · instance of **Section Nav Group Header** · row gap 0 pad 0/8/0/8 FILL/FIXED · 197×32  
      padding `inset.xs`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FIXED/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FIXED/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Group Header** · instance of **Section Nav Group Header** · row gap 0 pad 0/8/0/8 FILL/FIXED · 197×32  
      padding `inset.xs`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FIXED/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FIXED/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FIXED/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FIXED/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`

### Tokens used

| Role         | Tokens                                                        |
| ------------ | ------------------------------------------------------------- |
| Fills        | `color.surface.active`, `color.surface.base`                  |
| Strokes      | `color.border.subtle`                                         |
| Spacing      | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`, `stack.md` |
| Radius       | `radius.control`                                              |
| Border width | `border.default`                                              |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop    |
| ----- | ------------------- | ------- |
| Items | slotContentId       | `Items` |

### Composes

- Section Nav Group Header
- Section Nav Item

## Documentation card

**Description**

A vertical rail of Section Nav Items for switching between sub-sections of a page (e.g. Settings). A composition; the item primitive is Section Nav Item.

**Anatomy**

Rail container · optional group headings · Section Nav Items · optional footer action.

**Layout**

Fixed-width rail beside content on desktop; full-width list or top segmented control on mobile. Groups separated by headings, not heavy dividers.

**States**

One item selected (aria-current). Pattern follows content: loaded, empty. Items carry their own states.

**Accessibility**

Wrap in `<nav aria-label>`. Mark the current section with aria-current=page. Fully keyboard navigable with visible focus. Flat and single-level — distinct from Tree.

**Rules**

Keep it flat / single-level  
Group with headings  
Mark current with aria-current  
Collapse to a full-width list on mobile

Use for hierarchical trees (use Tree)  
Exceed ~7 items without grouping  
Rely on colour for selected  
Mix with primary app nav
