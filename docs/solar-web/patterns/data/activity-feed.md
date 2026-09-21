# Activity Feed

> SOLAR Web · Figma page `↳ 🟢 Activity Feed` (id `7359:2`) · section `patterns/data` · raw data: [`raw/patterns/data/activity-feed.json`](../../raw/patterns/data/activity-feed.json)

## Component set: Activity Feed

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |

Default variant: `breakpoint=desktop` · 2 variants · default size 640×731px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 8 pad 0/0/0/0 FIXED/HUG · 640×731  
  itemSpacing `inset.xs`
  - **Date Group** · frame · row gap 0 pad 8/8/8/8 FILL/HUG · 640×25  
    fill `color.surface.background` · padding `inset.xs` · radius `radius.control`
    - **Date Text** · text `title/2xs` "TODAY · 2026-05-12" · HUG/HUG · 137×9  
      fill `color.text.secondary` · lineHeight `type.line-height.title.2xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.2xs` · fontStyle `type.font-weight.500`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Date Group** · frame · row gap 0 pad 8/8/8/8 FILL/HUG · 640×25  
    fill `color.surface.background` · padding `inset.xs` · radius `radius.control`
    - **Date Text** · text `title/2xs` "YESTERDAY · 2026-05-11" · HUG/HUG · 168×9  
      fill `color.text.secondary` · lineHeight `type.line-height.title.2xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.2xs` · fontStyle `type.font-weight.500`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Date Group** · frame · row gap 0 pad 8/8/8/8 FILL/HUG · 640×25  
    fill `color.surface.background` · padding `inset.xs` · radius `radius.control`
    - **Date Text** · text `title/2xs` "2026-05-10" · HUG/HUG · 79×9  
      fill `color.text.secondary` · lineHeight `type.line-height.title.2xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.2xs` · fontStyle `type.font-weight.500`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Event Row** · instance of **Event Row** (density=default, state=default) · row gap 12 pad 12/12/12/12 FILL/HUG · 640×56  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`

### Tokens used

| Role            | Tokens                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.base`                                                                           |
| Strokes         | `color.border.subtle`                                                                                                      |
| Text color      | `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.blue.700`, `color.purple.700`, `color.red.700` |
| Icon color      | `color.icon.secondary`                                                                                                     |
| Spacing         | `inset.sm`, `inset.xs`, `stack.sm`                                                                                         |
| Radius          | `radius.container`, `radius.control`                                                                                       |
| Border width    | `border.default`                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.2xs`, `type.size.title.2xs`                      |
| Text styles     | `title/2xs`                                                                                                                |

### Composes

- Event Row

### Variant matrix

| breakpoint | size    | fill | stroke | effect | text                                                                                                                                 | icon                   |
| ---------- | ------- | ---- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| desktop    | 640×731 |      |        |        | `color.text.secondary`<br>`color.blue.700`<br>`color.text.primary`<br>`color.text.tertiary`<br>`color.purple.700`<br>`color.red.700` | `color.icon.secondary` |
| mobile     | 377×731 |      |        |        | `color.text.secondary`<br>`color.blue.700`<br>`color.text.primary`<br>`color.text.tertiary`<br>`color.purple.700`<br>`color.red.700` | `color.icon.secondary` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.blue.700`, `color.purple.700`, `color.red.700`.

## Component set: Activity Feed Filter Row

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |

Default variant: `breakpoint=desktop` · 2 variants · default size 640×64px

### Anatomy (default variant)

- **breakpoint=desktop** · component · row gap 8 pad 12/0/12/0 FIXED/FIXED · 640×64  
  padding `inset.none`, `inset.sm`
  - **SearchField** · instance of **SearchField** (state=default, size=md) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 228×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
  - **Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 404×40  
    itemSpacing `stack.xs`
    - **Select** · instance of **Select** (size=md, state=default) · column gap 8 pad 0/0/0/0 FIXED/HUG · 129×40  
      itemSpacing `stack.xs`
    - **Select** · instance of **Select** (size=md, state=default) · column gap 8 pad 0/0/0/0 FIXED/HUG · 129×40  
      itemSpacing `stack.xs`
    - **Select** · instance of **Select** (size=md, state=default) · column gap 8 pad 0/0/0/0 FIXED/HUG · 129×40  
      itemSpacing `stack.xs`

### Tokens used

| Role         | Tokens                                       |
| ------------ | -------------------------------------------- |
| Fills        | `color.surface.base`                         |
| Strokes      | `color.border.subtle`                        |
| Text color   | `color.text.primary`, `color.text.secondary` |
| Icon color   | `color.icon.primary`, `color.icon.secondary` |
| Spacing      | `inset.none`, `inset.sm`, `stack.xs`         |
| Radius       | `radius.control`                             |
| Border width | `border.default`                             |
| Effects      | `shadow/control`                             |

### Composes

- SearchField
- Select

### Variant matrix

| breakpoint | size    | fill | stroke | effect | text                                           | icon                                           |
| ---------- | ------- | ---- | ------ | ------ | ---------------------------------------------- | ---------------------------------------------- |
| desktop    | 640×64  |      |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.secondary`<br>`color.icon.primary` |
| mobile     | 377×112 |      |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.secondary`<br>`color.icon.primary` |

### Issues detected

- Component description is empty.
- Hard-coded gap `8px` on layer _breakpoint=desktop_

## Documentation card

**Description**

A chronological stream of events (who did what, when) for an entity or workspace. For audit trails and recent-activity views — not a chat.

**Anatomy**

Feed container · activity items (actor avatar · action text · timestamp · optional detail/link) · date grouping · load-more / infinite scroll.

**Behaviour**

Newest first, grouped by day, loaded incrementally. Items may link to the referenced object. Optional filters by type or actor.

**States**

loaded, loading (skeleton items), empty ('No activity yet'), error, loading-more. Real-time items may prepend.

**Accessibility**

An ordered list; each item reads actor + action + time. New real-time items via aria-live=polite. Timestamps use `<time>`. Links keyboard-reachable.

**Rules**

Order newest first, grouped by day  
Write plain 'actor did X' lines  
Link to the referenced object  
Announce new items politely

Use it as a chat  
Rely on icons alone for action type  
Auto-scroll away from the user  
Dump ungrouped walls of items
