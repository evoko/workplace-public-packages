# App Shell

> SOLAR Web · Figma page `↳ 🟢 App Shell` (id `135:1529`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/app-shell.json`](../../raw/patterns/layout-shell/app-shell.json)

## Component set: AppShell

App-level chrome scaffold: Top Bar + Sidebar + Page Content slot.

Variants: breakpoint=desktop / mobile.

Slot contract: the content area accepts any Page Layout pattern (e.g., Page Layout / Three Column, Page Layout / Single Column). Layouts compose INTO App Shell — do not absorb layout choices as App Shell variants. This keeps chrome and content layout as separate concerns.

### Props

| Prop         | Type    | Options / default         |
| ------------ | ------- | ------------------------- |
| `breakpoint` | variant | **desktop** · mobile      |
| `Left`       | slot    | default `[object Object]` |
| `Center`     | slot    | default `[object Object]` |
| `Right`      | slot    | default `[object Object]` |
| `hasLeft`    | boolean | default `true`            |
| `hasRight`   | boolean | default `true`            |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1440×800  
  fill `color.surface.background` · width `viewport.lg`
  - **Top Bar** · instance of **Top Bar** (breakpoint=desktop, hasSidebar=true, isLoggedIn=true) · row gap 12 pad 0/16/0/16 FILL/FIXED · 1440×56  
    fill `color.surface.background` · padding `stack.md`
  - **App Content** · frame · row gap 0 pad 0/8/0/0 FILL/FIXED · 1440×744  
    padding `inset.xs`
    - **Sidebar** · instance of **Sidebar** (expanded=false) · column gap 4 pad 0/0/8/0 FIXED/FILL · 64×744  
      itemSpacing `stack.2xs` · padding `stack.none`, `inset.none`, `inset.xs` · radius `radius.none`
    - **Page Content** · frame · row gap 8 pad 0/0/0/0 FILL/FILL · 1368×744  
      itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Space:stack.x-sm`
      - **Left** · slot · column gap 0 pad 0/0/0/0 FIXED/FILL · 221×744  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`, `radius.none` · prop visible←hasLeft, slotContentId←Left
      - **Center** · slot · column gap 0 pad 0/0/0/0 FILL/FILL · 795×744  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none` · prop slotContentId←Center
      - **Right** · slot · column gap 0 pad 0/0/0/0 FIXED/FILL · 336×744  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`, `radius.none` · prop visible←hasRight, slotContentId←Right

### Tokens used

| Role       | Tokens                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Fills      | `color.surface.background`, `color.surface.raised`                                                                            |
| Text color | `color.text.inverse`, `color.text.primary`, `color.text.tertiary`, `color.purple.700`                                         |
| Icon color | `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.brand.red` |
| Spacing    | `inset.none`, `inset.xs`, `stack.2xs`, `stack.md`, `stack.none`, `stack.xs`                                                   |
| Radius     | `radius.container`, `radius.none`                                                                                             |
| Sizes      | `viewport.lg`                                                                                                                 |
| Other      | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Space:stack/x-sm}`                                                       |

### Slots and prop-controlled layers

| Layer                               | Controlled property | Prop       |
| ----------------------------------- | ------------------- | ---------- |
| App Content › Page Content › Left   | visible             | `hasLeft`  |
| App Content › Page Content › Left   | slotContentId       | `Left`     |
| App Content › Page Content › Center | slotContentId       | `Center`   |
| App Content › Page Content › Right  | visible             | `hasRight` |
| App Content › Page Content › Right  | slotContentId       | `Right`    |

### Composes

- Sidebar
- Top Bar

### Variant matrix

| breakpoint | size     | fill                       | stroke | effect | text                                                                                        | icon                                                                                         |
| ---------- | -------- | -------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| desktop    | 1440×800 | `color.surface.background` |        |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.inverse`<br>`color.purple.700` | `color.icon.tertiary`<br>`color.icon.secondary`<br>`color.icon.primary`<br>`color.brand.red` |
| mobile     | 393×800  | `color.surface.background` |        |        | `color.text.primary`<br>`color.purple.700`                                                  | `color.action.secondary.icon.default`                                                        |

### Issues detected

- Primitive color bound directly (CLR-002): `color.purple.700`, `color.brand.red`.

## Issues detected (page)

- The documentation card's Accessibility section holds the Breadcrumbs page's text; it does not describe this component.

## Documentation card

**AppShell**

**Usage**

App-level chrome scaffold: Top Bar + Sidebar + Page Content slot. Slot contract: the content area accepts any Page Layout pattern (e.g., Page Layout / Three Column, Page Layout / Single Column). This keeps chrome and content layout as separate concerns.

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
