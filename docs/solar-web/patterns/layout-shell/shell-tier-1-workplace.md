# Shell Tier 1 · Workplace

> SOLAR Web · Figma page `↳ 🟢 Shell Tier 1 · Workplace` (id `6400:4`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/shell-tier-1-workplace.json`](../../raw/patterns/layout-shell/shell-tier-1-workplace.json)

## Component set: Layout / Workplace

Shell Tier 1: Top Bar, Sidebar and a three-column page area (left, center, right). 2 variants: breakpoint (desktop, mobile). Props: left, center, right (slots), hasLeft, hasRight (booleans). Use for products with full navigation, such as Workplace; mobile collapses the sidebar and stacks the columns. App-branded sidebars stay in the product file.

### Props

| Prop         | Type    | Options / default         |
| ------------ | ------- | ------------------------- |
| `breakpoint` | variant | mobile · **desktop**      |
| `left`       | slot    | default `[object Object]` |
| `center`     | slot    | default `[object Object]` |
| `right`      | slot    | default `[object Object]` |
| `hasLeft`    | boolean | default `true`            |
| `hasRight`   | boolean | default `true`            |

Default variant: `breakpoint=desktop` · 2 variants · default size 1440×800px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 1440×800  
  fill `color.surface.background` · width `viewport.lg`
  - **Top Bar** · instance of **Top Bar** (breakpoint=desktop, hasSidebar=true, isLoggedIn=True) · row gap 12 pad 0/16/0/16 FIXED/FIXED · 1440×56  
    fill `color.surface.background` · padding `stack.md`
  - **App Content** · frame · row gap 0 pad 0/8/8/0 FILL/FIXED · 1440×744  
    padding `inset.xs`
    - **Sidebar** · instance of **Sidebar** (expanded=False) · column gap 4 pad 0/0/8/0 FIXED/FILL · 64×736  
      itemSpacing `stack.2xs` · padding `stack.none`, `inset.none`, `inset.xs` · radius `radius.none`
    - **Page Content** · frame · row gap 8 pad 0/0/0/0 FILL/FILL · 1368×736  
      itemSpacing `stack.xs`
      - **left** · slot · column gap 0 pad 0/0/0/0 FIXED/FILL · 221×736  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container` · prop visible←hasLeft, slotContentId←left
      - **center** · slot · column gap 0 pad 0/0/0/0 FILL/FILL · 795×736  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container` · prop slotContentId←center
      - **right** · slot · column gap 0 pad 0/0/0/0 FIXED/FILL · 336×736  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container` · prop visible←hasRight, slotContentId←right

### Tokens used

| Role       | Tokens                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Fills      | `color.surface.background`, `color.surface.raised`                                                                            |
| Text color | `color.text.inverse`, `color.text.primary`, `color.text.tertiary`, `color.purple.700`                                         |
| Icon color | `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.brand.red` |
| Spacing    | `inset.none`, `inset.xs`, `stack.2xs`, `stack.md`, `stack.none`, `stack.xs`                                                   |
| Radius     | `radius.container`, `radius.none`                                                                                             |
| Sizes      | `viewport.lg`                                                                                                                 |

### Slots and prop-controlled layers

| Layer                               | Controlled property | Prop       |
| ----------------------------------- | ------------------- | ---------- |
| App Content › Page Content › left   | visible             | `hasLeft`  |
| App Content › Page Content › left   | slotContentId       | `left`     |
| App Content › Page Content › center | slotContentId       | `center`   |
| App Content › Page Content › right  | visible             | `hasRight` |
| App Content › Page Content › right  | slotContentId       | `right`    |

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

## Documentation card

**Description**

The top-level app shell for a full workspace product (e.g. Workplace) — global top bar, primary sidebar and content region. The richest shell tier.

**Anatomy**

Top Bar (brand · global search · account) · primary Sidebar (product nav) · content region · optional secondary panel.

**Composition**

Assembled from SOLAR Web primitives (Top Bar, Sidebar, Page Header). App-branded assemblies live in the product file — this documents the generic tier-1 arrangement.

**States**

Responsive: desktop (sidebar expanded), tablet (rail), mobile (drawer nav). Loading and empty are handled by the content region.

**Accessibility**

Landmarks: banner (top bar), navigation (sidebar), main (content). Skip-to-content link. Focus order top bar → nav → main. Sidebar toggle is keyboard-operable.

**Rules**

Compose from SOLAR primitives  
Use landmark roles  
Provide skip-to-content  
Collapse nav responsively

Hard-code product branding in the library  
Nest multiple main landmarks  
Trap focus in the shell  
Break the responsive tiers
