# Activity Log

> SOLAR Web · Figma page `↳ 🟢 Activity Log` (id `3768:12`) · section `views/communications` · raw data: [`raw/views/communications/activity-log.json`](../../raw/views/communications/activity-log.json)

## Component set: Activity Log

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |

Default variant: `breakpoint=desktop` · 2 variants · default size 1400×929px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1400×929  
  itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
  - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1400×134  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Activity Feed Filter Row** · instance of **Activity Feed Filter Row** (breakpoint=desktop) · row gap 8 pad 12/0/12/0 FIXED/FIXED · 640×64  
    padding `inset.none`, `inset.sm`
  - **Activity Feed** · instance of **Activity Feed** (breakpoint=desktop) · column gap 8 pad 0/0/0/0 FIXED/HUG · 640×731  
    itemSpacing `inset.xs`

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                                 |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.blue.700`, `color.purple.700`, `color.red.700` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                                        |
| Spacing      | `inset.lg`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.none`                                                                                                                                                            |
| Radius       | `radius.container`, `radius.none`                                                                                                                                                                                                     |
| Border width | `border.default`                                                                                                                                                                                                                      |

### Composes

- Activity Feed
- Activity Feed Filter Row
- Page Header

### Variant matrix

| breakpoint | size     | fill | stroke | effect | text                                                                                                                                                                                                                                                  | icon                                                                                                                           |
| ---------- | -------- | ---- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| desktop    | 1400×929 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.blue.700`<br>`color.purple.700`<br>`color.red.700` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |
| mobile     | 377×922  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.blue.700`<br>`color.purple.700`<br>`color.red.700`                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`                                         |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.blue.700`, `color.purple.700`, `color.red.700`.

## Documentation card

**Description**

A product-activity stream for an entity or workspace (updates, changes, comments). User-facing recent activity; security events live in Audit Log.

**Layout**

Activity Feed pattern: items grouped by day (actor · action · time · link) · filters · load-more.

**Responsive**

Desktop feed column; mobile full-width.

**States**

loaded, loading (skeleton), empty, error, loading-more.

**Accessibility**

Ordered list; new items via aria-live=polite; timestamps `<time>`; links keyboard-reachable.

**Rules**

Order newest first, grouped by day  
Link to referenced objects  
Write plain 'actor did X' lines  
Filter by type

Use it as a chat  
Use icons alone for action type  
Mix in security events  
Dump ungrouped items
