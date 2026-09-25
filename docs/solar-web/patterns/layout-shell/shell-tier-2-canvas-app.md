# Shell Tier 2 · Canvas app

> SOLAR Web · Figma page `↳ 🟢 Shell Tier 2 · Canvas app` (id `6400:5`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/shell-tier-2-canvas-app.json`](../../raw/patterns/layout-shell/shell-tier-2-canvas-app.json)

## Component set: Layout / Canvas

Shell Tier 2: Top Bar over a two-column canvas area (left panel, center canvas), no Sidebar. 2 variants: breakpoint (desktop, mobile). Props: left, center (slots). Use for editor and canvas products such as Designer where the tool panels replace app navigation; mobile stacks the panel above the canvas.

### Props

| Prop         | Type    | Options / default         |
| ------------ | ------- | ------------------------- |
| `breakpoint` | variant | **desktop** · mobile      |
| `left`       | slot    | default `[object Object]` |
| `center`     | slot    | default `[object Object]` |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1440×800  
  fill `color.surface.background` · width `viewport.lg`
  - **Top Bar** · instance of **Top Bar** (breakpoint=desktop, hasSidebar=false, isLoggedIn=true) · row gap 12 pad 0/16/0/16 FILL/FIXED · 1440×56  
    fill `color.surface.background` · itemSpacing `inset.sm` · padding `stack.md`
  - **App Content** · frame · row gap 0 pad 0/8/8/8 FILL/FIXED · 1440×744  
    padding `inset.xs`
    - **Page Content** · frame · row gap 8 pad 0/0/0/0 FILL/FILL · 1424×736  
      itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Spatial(local):stack.xs`
      - **left** · slot · column gap 0 pad 8/8/8/8 FIXED/FILL · 324×736  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.xs` · radius `radius.container` · prop slotContentId←left
        - **Segmented Control** · instance of **Segmented Control** (size=md) · column gap 8 pad 0/0/0/0 FILL/FIXED · 308×40  
          itemSpacing `inset.xs`
      - **center** · slot · column gap 0 pad 0/0/0/0 FILL/FILL · 1092×736  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container` · prop slotContentId←center
        - **Breadcrumbs** · instance of **Breadcrumbs** (items=5) · row gap 12 pad 16/20/16/20 FILL/HUG · 1092×44  
          stroke `color.border.surface` mixedpx · itemSpacing `stack.sm` · padding `inset.lg`, `inset.md` · strokeWeight `border.default`

### Tokens used

| Role         | Tokens                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.background`, `color.surface.raised`                                                                                        |
| Strokes      | `color.border.surface`                                                                                                                    |
| Text color   | `color.text.feedback.info`, `color.text.inverse`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.purple.700` |
| Icon color   | `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`                                                                       |
| Spacing      | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.md`, `stack.none`, `stack.sm`, `stack.xs`                            |
| Radius       | `radius.container`                                                                                                                        |
| Border width | `border.default`                                                                                                                          |
| Sizes        | `viewport.lg`                                                                                                                             |
| Other        | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Spatial(local):stack/xs}`                                                            |

### Slots and prop-controlled layers

| Layer                               | Controlled property | Prop     |
| ----------------------------------- | ------------------- | -------- |
| App Content › Page Content › left   | slotContentId       | `left`   |
| App Content › Page Content › center | slotContentId       | `center` |

### Composes

- Breadcrumbs
- Segmented Control
- Top Bar

### Variant matrix

| breakpoint | size     | fill                       | stroke | effect | text                                                                                                                                                | icon                                                                    |
| ---------- | -------- | -------------------------- | ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.background` |        |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.inverse`<br>`color.purple.700`<br>`color.text.feedback.info`<br>`color.text.secondary` | `color.icon.primary`<br>`color.icon.tertiary`<br>`color.icon.secondary` |
| mobile     | 393×800  | `color.surface.background` |        |        | `color.text.primary`<br>`color.purple.700`<br>`color.text.secondary`<br>`color.text.feedback.info`                                                  | `color.icon.primary`<br>`color.icon.secondary`                          |

### Issues detected

- Primitive color bound directly (CLR-002): `color.purple.700`.

## Documentation card

**Description**

The app shell for a canvas / authoring product (e.g. Designer) — slim chrome around a large editing canvas, with tool rails and an inspector.

**Anatomy**

Top bar (file / actions) · left tool rail · canvas region · right inspector panel · optional bottom status bar.

**Composition**

Maximises canvas area; chrome is minimal and collapsible. Tool rail + inspector are domain surfaces (Spatial / Flow), composed here at the shell level.

**States**

Responsive: desktop (rails visible), compact (rails collapse to icons / drawers). Canvas: loaded, loading, empty.

**Accessibility**

Landmarks for chrome; the canvas exposes its own contract. Keyboard access to tools + inspector with visible focus. Never trap keyboard focus on the canvas.

**Rules**

Maximise the canvas  
Keep chrome collapsible  
Give tools keyboard access  
Reuse domain surfaces

Crowd the canvas with chrome  
Trap keyboard focus on the canvas  
Duplicate inspector patterns  
Hard-code a single product
