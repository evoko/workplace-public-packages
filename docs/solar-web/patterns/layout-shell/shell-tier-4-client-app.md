# Shell Tier 4 · Client app (Chatter)

> SOLAR Web · Figma page `↳ 🟢 Shell Tier 4 · Client app (Chatter)` (id `6400:7`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/shell-tier-4-client-app.json`](../../raw/patterns/layout-shell/shell-tier-4-client-app.json)

## Component set: Layout

Shell Tier 4: Top Bar, Sidebar and a Page Shell with left, center and right slots, sized for a client app. 2 variants: breakpoint (desktop, mobile). Props: left, center, right (slots), hasLeft, hasRight (booleans). Use for end-user client apps such as Chatter; differs from Layout / Workplace in its Page Shell density. Name is under review.

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

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1440×800  
  fill `color.surface.background` · width `viewport.lg`
  - **Top Bar** · instance of **Top Bar** (breakpoint=desktop, hasSidebar=true, isLoggedIn=true) · row gap 12 pad 0/16/0/16 FIXED/FIXED · 1440×56  
    fill `color.surface.background` · itemSpacing `inset.sm` · padding `stack.md`
  - **App Content** · frame · row gap 0 pad 0/8/8/0 FILL/FIXED · 1440×744  
    padding `inset.xs`
    - **Sidebar** · instance of **Sidebar** (expanded=false) · column gap 4 pad 0/0/8/0 FIXED/FILL · 64×736  
      itemSpacing `stack.2xs` · padding `stack.none`, `inset.none`, `inset.xs` · radius `radius.none`
    - **Page Shell** · frame · row gap 8 pad 0/0/0/0 FILL/FILL · 1368×736  
      itemSpacing `stack.xs` · padding `stack.none`
      - **left** · slot · column gap 0 pad 0/0/0/0 FIXED/FILL · 221×736  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container` · prop visible←hasLeft, slotContentId←left
      - **center** · slot · column gap 8 pad 0/0/0/0 FILL/FILL · 795×736  
        itemSpacing `inset.xs` · prop slotContentId←center
        - **Container** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 795×364  
          fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`
        - **Container** · frame · row gap 8 pad 0/0/0/0 FILL/FILL · 795×364  
          itemSpacing `inset.xs`
          - **Container** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 394×364  
            fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`
          - **Container** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 394×364  
            fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`
      - **right** · slot · column gap 0 pad 0/0/0/0 HUG/FILL · 336×736  
        fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container` · prop visible←hasRight, slotContentId←right

### Tokens used

| Role       | Tokens                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Fills      | `color.surface.background`, `color.surface.raised`                                                                            |
| Text color | `color.text.inverse`, `color.text.primary`, `color.text.tertiary`, `color.purple.700`                                         |
| Icon color | `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.brand.red` |
| Spacing    | `inset.none`, `inset.sm`, `inset.xs`, `stack.2xs`, `stack.md`, `stack.none`, `stack.xs`                                       |
| Radius     | `radius.container`, `radius.none`                                                                                             |
| Sizes      | `viewport.lg`                                                                                                                 |

### Slots and prop-controlled layers

| Layer                             | Controlled property | Prop       |
| --------------------------------- | ------------------- | ---------- |
| App Content › Page Shell › left   | visible             | `hasLeft`  |
| App Content › Page Shell › left   | slotContentId       | `left`     |
| App Content › Page Shell › center | slotContentId       | `center`   |
| App Content › Page Shell › right  | visible             | `hasRight` |
| App Content › Page Shell › right  | slotContentId       | `right`    |

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

**Shell Tier 4 · Client app**

**Description**

The app shell for a focused client / end-user product (e.g. Chatter) — the lightest tier: a simple top bar and a single content region.

**Anatomy**

Top bar (brand · minimal actions) · content region · optional bottom nav on mobile.

**Composition**

Minimal chrome for a task-focused experience. No heavy sidebar; navigation is shallow. Composes Top Bar + Page Shell primitives.

**States**

Responsive: desktop (top bar + content), mobile (top bar + optional bottom nav). Content: loaded, loading, empty.

**Accessibility**

banner + main landmarks; bottom nav is a navigation landmark. Skip-to-content link. Keyboard operable with visible focus.

**Rules**

Keep chrome minimal  
Use shallow navigation  
Compose from Top Bar + Page Shell  
Provide skip-to-content

Add a heavy sidebar  
Deep-nest navigation  
Hard-code branding  
Omit landmarks
