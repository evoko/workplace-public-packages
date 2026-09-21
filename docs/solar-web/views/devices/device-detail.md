# Device Detail

> SOLAR Web · Figma page `↳ 🟢 Device Detail` (id `5066:13`) · section `views/devices` · raw data: [`raw/views/devices/device-detail.json`](../../raw/views/devices/device-detail.json)

## Component set: Device Detail

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×876px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1368×876  
  itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
  - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1368×174  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Body** · frame · row gap 16 pad 16/0/16/0 FIXED/HUG · 640×702  
    itemSpacing `stack.md` · padding `stack.none`, `stack.md`
    - **Main** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 344×670  
      itemSpacing `stack.md`
      - **Card / Details** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 344×318  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Recent activity** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 344×196  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Description** · instance of **Card** (state=default, status=warning, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 344×124  
        fill `color.surface.feedback.warning.subtle` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Side rail** · frame · column gap 16 pad 0/0/0/0 FIXED/HUG · 280×544  
      itemSpacing `stack.md`
      - **Card / Owner** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 280×96  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Metadata** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 280×84  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Quick actions** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 280×158  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Card / Related** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 280×158  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`

Instance census (tree capped at depth 3): Icon/None ×35, Column Item ×18, Counter ×11, Tag ×9, Row ×9, RowSelect ×9, Checkbox ×9, RowExpand ×9, Icon/ChevronDown ×9, Icon/ChevronRight ×8, Card ×7, Icon/More ×7, Button ×6, Spinner ×6, ListItem ×6, Tab Item ×5, Divider ×4, Breadcrumb Item ×3, Trend Badge ×3, StatusIndicator ×2, PropertyList ×2, List ×2, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, Tabs ×1, Avatar ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.base`, `color.surface.feedback.warning.subtle`                                                                                                                                                                                                                                                        |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                                                                                                                |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.danger`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.inverse`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.purple.700` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.feedback.warning`, `color.icon.primary`, `color.icon.secondary`, `color.neutral.900`                                                                                                   |
| Spacing      | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.md`, `stack.none`                                                                                                                                                                                                                   |
| Radius       | `radius.container`, `radius.none`                                                                                                                                                                                                                                                                                    |
| Border width | `border.default`                                                                                                                                                                                                                                                                                                     |
| Effects      | `shadow/raised`                                                                                                                                                                                                                                                                                                      |

### Composes

- Card
- Page Header

### Variant matrix

| breakpoint | size     | fill | stroke | effect | text                                                                                                                                                                                                                                                                                                                                     | icon                                                                                                                                                                                   |
| ---------- | -------- | ---- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×876 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.danger`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.neutral`<br>`color.text.feedback.warning`<br>`color.text.inverse`<br>`color.text.feedback.success`<br>`color.purple.700` | `color.icon.secondary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.primary`<br>`color.icon.feedback.warning` |
| mobile     | 377×1392 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.danger`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.neutral`<br>`color.text.feedback.warning`<br>`color.action.secondary.text.default`<br>`color.text.inverse`<br>`color.text.feedback.success`<br>`color.purple.700` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.icon.feedback.warning`<br>`color.action.secondary.icon.default`                       |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.purple.700`, `color.neutral.900`.

## Compositions and examples on this page

### Device Detail (instance of Device Detail, 1368×876)

Uses: Icon/None ×35, Column Item ×18, Counter ×11, Tag ×9, Row ×9, RowSelect ×9, Checkbox ×9, RowExpand ×9, Icon/ChevronDown ×9, Icon/ChevronRight ×8, Card ×7, Icon/More ×7, Button ×6, Spinner ×6, ListItem ×6, Tab Item ×5, Divider ×4, Breadcrumb Item ×3, Trend Badge ×3, StatusIndicator ×2, PropertyList ×2, List ×2, Device Detail ×1, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, Tabs ×1, Avatar ×1

- **Device Detail** · instance of **Device Detail** (breakpoint=desktop) · column gap 0 pad 0/0/0/0 FIXED/HUG · 1368×876  
  itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`

> Serial SE9048276 · Cambridge HQ · Conference 12
> Current version v4.10.2. An update to v4.11.0 is available.

## Documentation card

**Description**

The full record for one device — status, config, telemetry and management actions. Reached from Device List (Tesira / Impera-style endpoints).

**Layout**

Header (name · status · key actions) · sections/tabs (Overview · Configuration · Telemetry · Logs) · Property List + charts · Detail Side Panel where used.

**Responsive**

Desktop two-column with tabs; mobile stacked, tabs → segmented / accordion.

**States**

loaded, loading, empty, error, offline (limited actions), updating (firmware / config).

**Accessibility**

Sections are labelled regions; status is text + icon; destructive actions (reboot / reset) confirmed; charts have a table alt. Keyboard-complete.

**Rules**

Lead with status + identity  
Keep to ≤2 primary actions  
Confirm reboot / reset  
Handle offline gracefully

Bury critical status  
Rely on colour for state  
Auto-apply config without confirm  
Stack many primary CTAs
