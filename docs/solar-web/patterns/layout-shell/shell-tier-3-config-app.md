# Shell Tier 3 · Config app (Chatter Config)

> SOLAR Web · Figma page `↳ 🟢 Shell Tier 3 · Config app (Chatter Config)` (id `6400:6`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/shell-tier-3-config-app.json`](../../raw/patterns/layout-shell/shell-tier-3-config-app.json)

## Component set: Layout / Config

Shell Tier 3: Top Bar over a single centered content column, no Sidebar. 2 variants: breakpoint (desktop, mobile). Props: center (slot). Use for configuration apps with one task at a time, such as Chatter Config; the column is constrained by the Layout grid tokens.

### Props

| Prop         | Type    | Options / default         |
| ------------ | ------- | ------------------------- |
| `breakpoint` | variant | **desktop** · mobile      |
| `center`     | slot    | default `[object Object]` |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1440×800  
  fill `color.surface.background` · width `viewport.lg`
  - **Top Bar** · instance of **Top Bar** (breakpoint=desktop, hasSidebar=false, isLoggedIn=true) · row gap 12 pad 0/16/0/16 FILL/FIXED · 1440×56  
    fill `color.surface.background` · itemSpacing `inset.sm` · padding `stack.md`
  - **App Content** · frame · row gap 0 pad 0/8/8/8 FIXED/FIXED · 1440×744  
    padding `inset.xs`
    - **Page Content** · frame · row gap 8 pad 0/0/0/0 FILL/FILL · 1424×736  
      itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Spatial(local):stack.xs`
      - **center** · slot · column gap 0 pad 0/0/0/0 FILL/FILL · 1424×736  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container` · prop slotContentId←center

### Tokens used

| Role       | Tokens                                                                                |
| ---------- | ------------------------------------------------------------------------------------- |
| Fills      | `color.surface.background`, `color.surface.raised`                                    |
| Text color | `color.text.inverse`, `color.text.primary`, `color.text.tertiary`, `color.purple.700` |
| Icon color | `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`                   |
| Spacing    | `inset.none`, `inset.sm`, `inset.xs`, `stack.md`, `stack.none`, `stack.xs`            |
| Radius     | `radius.container`                                                                    |
| Sizes      | `viewport.lg`                                                                         |
| Other      | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Spatial(local):stack/xs}`        |

### Slots and prop-controlled layers

| Layer                               | Controlled property | Prop     |
| ----------------------------------- | ------------------- | -------- |
| App Content › Page Content › center | slotContentId       | `center` |

### Composes

- Top Bar

### Variant matrix

| breakpoint | size     | fill                       | stroke | effect | text                                                                                        | icon                                                                    |
| ---------- | -------- | -------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.background` |        |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.inverse`<br>`color.purple.700` | `color.icon.primary`<br>`color.icon.tertiary`<br>`color.icon.secondary` |
| mobile     | 393×800  | `color.surface.background` |        |        | `color.text.primary`<br>`color.purple.700`                                                  | `color.icon.primary`                                                    |

### Issues detected

- Primitive color bound directly (CLR-002): `color.purple.700`.

## Documentation card

**Shell Tier 3 · Config app**

**Description**

The app shell for a configuration / admin product (e.g. Chatter Config) — dense form- and table-heavy layouts under a standard top bar + sidebar.

**Anatomy**

Top bar · sidebar (config sections) · content (forms, tables, Section Nav) · optional contextual side panel.

**Composition**

Prioritises information density and settings navigation. Uses Section Nav for sub-sections and Data Table / Form patterns in the content region.

**States**

Responsive: desktop (sidebar + content), mobile (drawer nav, stacked forms). Content: loaded, loading, empty, error.

**Accessibility**

Standard banner / navigation / main landmarks. Forms and tables carry their own a11y. Keyboard navigable with a logical tab order through dense content.

**Rules**

Use Section Nav for sub-sections  
Keep dense content scannable  
Reuse Form + Table patterns  
Support keyboard through dense UI

Overload one screen  
Hard-code the product  
Skip landmarks  
Rely on density over hierarchy
