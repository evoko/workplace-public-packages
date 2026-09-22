# Entity Detail

> SOLAR Web · Figma page `↳ 🟢 Entity Detail` (id `3768:6`) · section `views/generic` · raw data: [`raw/views/generic/entity-detail.json`](../../raw/views/generic/entity-detail.json)

## Component set: Entity List

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×896px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1368×896  
  itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
  - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1368×148  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Body** · frame · row gap 16 pad 16/0/16/0 FIXED/HUG · 640×748  
    itemSpacing `stack.md` · padding `stack.none`, `stack.md`
    - **Main** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 344×716  
      itemSpacing `stack.md`
      - **Card / Details** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 344×248  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Description** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 344×124  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Recent activity** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 344×312  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Side rail** · frame · column gap 16 pad 0/0/0/0 FIXED/HUG · 280×536  
      itemSpacing `stack.md`
      - **Card / Owner** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 280×86  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Metadata** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 280×158  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Quick actions** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 280×86  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Related** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 280×158  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`

Instance census (tree capped at depth 3): Icon/None ×42, Icon/More ×17, Counter ×13, Avatar ×11, Event Row ×10, Icon/ChevronRight ×8, Tag ×8, Tab Item ×8, Card ×7, Divider ×6, ListItem ×6, Button ×5, Spinner ×5, Breadcrumb Item ×3, PropertyRow ×3, PropertyList ×2, List ×2, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, StatusIndicator ×1, Tabs ×1, Activity Feed ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.base`                                                                                                                                                                                                                                                 |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                                                                |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.blue.700`, `color.purple.700`, `color.red.700` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                                                                       |
| Spacing      | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.md`, `stack.none`                                                                                                                                                                   |
| Radius       | `radius.container`, `radius.none`                                                                                                                                                                                                                                    |
| Border width | `border.default`                                                                                                                                                                                                                                                     |
| Effects      | `shadow/raised`                                                                                                                                                                                                                                                      |

### Composes

- Card
- Page Header

### Variant matrix

| breakpoint | size     | fill | stroke | effect | text                                                                                                                                                                                                                                                                                   | icon                                                                                                                            |
| ---------- | -------- | ---- | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×896 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.neutral`<br>`color.blue.700`<br>`color.purple.700`<br>`color.red.700` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`  |
| mobile     | 377×1444 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.neutral`<br>`color.blue.700`<br>`color.purple.700`<br>`color.red.700`<br>`color.action.secondary.text.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.blue.700`, `color.purple.700`, `color.red.700`.

## Documentation card

**Description**

A generic detail template for any single record (project, order, asset) — header, key facts, sections and actions. Other detail views specialize this base.

**Layout**

Header (title · status · ≤2 primary actions · overflow) · Property List / key facts · tabbed sections · Detail Side Panel where used.

**Responsive**

Desktop two-column with tabs; mobile stacked, tabs → accordion / segmented.

**States**

loaded, loading, empty, error, not-found; editing where applicable.

**Accessibility**

Header is the page title; sections labelled; status is text + icon; destructive actions confirmed. Keyboard-complete; visible focus.

**Rules**

Lead with identity + status  
Cap primary actions at ~2  
Group facts vs activity  
Confirm destructive actions

Stack many primary buttons  
Bury status  
Rely on colour for state  
Mix unrelated records
