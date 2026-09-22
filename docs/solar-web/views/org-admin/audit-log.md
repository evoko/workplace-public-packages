# Audit Log

> SOLAR Web · Figma page `↳ 🟢 Audit Log` (id `8366:10824`) · section `views/org-admin` · raw data: [`raw/views/org-admin/audit-log.json`](../../raw/views/org-admin/audit-log.json)

## Component set: Audit Log

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×948px

### Anatomy (default variant)

- **breakpoint=desktop** · component · row gap 8 pad 0/0/0/0 FIXED/HUG · 1368×948  
  itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Space:stack.x-sm`
  - **Left** · frame · column gap 0 pad 12/12/12/12 FIXED/FILL · 221×948  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.sm` · radius `radius.container`, `radius.none`
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=selected) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      fill `color.surface.active` · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
  - **Members & Roles** · frame · column gap 0 pad 0/0/0/0 FIXED/HUG · 1139×948  
    fill `color.surface.base`
    - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1139×105  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
    - **Feed** · frame · column gap 16 pad 8/0/24/0 FIXED/HUG · 640×843  
      itemSpacing `inset.md` · padding `stack.none`, `inset.xs`, `inset.xl`
      - **Activity Feed Filter Row** · instance of **Activity Feed Filter Row** (breakpoint=desktop) · row gap 8 pad 12/0/12/0 FILL/FIXED · 640×64  
        padding `inset.none`, `inset.sm`
      - **Activity Feed** · instance of **Activity Feed** (breakpoint=desktop) · column gap 8 pad 0/0/0/0 FILL/HUG · 640×731  
        itemSpacing `inset.xs`
  - ~~**Right**~~ (hidden by default) · frame · column gap 0 pad 0/0/0/0 FIXED/FIXED · 336×744  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`, `radius.none`

Instance census (tree capped at depth 3): Icon/None ×18, Counter ×10, Event Row ×10, Avatar ×10, Icon/More ×10, Section Nav Item ×8, Tab Item ×8, Tree Group Header ×3, Breadcrumb Item ×3, Select ×3, Icon/ChevronDown ×3, Icon/ChevronRight ×2, Button ×2, Spinner ×2, Icon/User ×1, Icon/Shield ×1, Icon/Licenses ×1, Icon/File ×1, Icon/PanKnob ×1, Icon/Key ×1, Icon/Ethernet ×1, Icon/History ×1, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, Tag ×1, StatusIndicator ×1, Icon/Download ×1, Icon/Invite ×1, Tabs ×1, Activity Feed Filter Row ×1, SearchField ×1, Icon/Search ×1, Icon/Filter ×1, Activity Feed ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.active`, `color.surface.base`, `color.surface.raised`                                                                                                                                                                  |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                                 |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.blue.700`, `color.purple.700`, `color.red.700` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                                        |
| Spacing      | `inset.2xs`, `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.none`, `stack.xs`                                                                                                           |
| Radius       | `radius.container`, `radius.control`, `radius.none`                                                                                                                                                                                   |
| Border width | `border.default`                                                                                                                                                                                                                      |
| Other        | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Space:stack/x-sm}`                                                                                                                                                               |

### Composes

- Activity Feed
- Activity Feed Filter Row
- Page Header
- Section Nav Item
- Tree Group Header

### Variant matrix

| breakpoint | size     | fill                 | stroke | effect | text                                                                                                                                                                                                                                                  | icon                                                                                                                           |
| ---------- | -------- | -------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| desktop    | 1368×948 |                      |        |        | `color.text.tertiary`<br>`color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.blue.700`<br>`color.purple.700`<br>`color.red.700` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |
| mobile     | 377×973  | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.blue.700`<br>`color.purple.700`<br>`color.red.700`                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`                                         |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.blue.700`, `color.purple.700`, `color.red.700`.

## Documentation card

**Description**

An immutable, searchable record of security-relevant actions (who did what, when, from where). For compliance / forensics; product activity lives in Activity Log.

**Layout**

Filter bar (actor · action · date · resource) · Data Table (timestamp · actor · action · target · IP) · detail drawer · export.

**Responsive**

Desktop table; mobile condensed rows → detail drawer.

**States**

loaded, loading, empty, no-results (filter), error; export in progress.

**Accessibility**

Table labelled; timestamps use `<time>`; filters + detail keyboard-reachable; announce result counts.

**Rules**

Keep entries immutable  
Support rich filtering  
Show actor + target + time  
Allow export

Allow editing / deletion  
Truncate critical detail  
Show severity by colour only  
Mix in product activity
