# Schedule Strip

> SOLAR Web · Figma page `↳ 🟢 Schedule Strip` (id `6350:2`) · section `patterns/dashboards` · raw data: [`raw/patterns/dashboards/schedule-strip.json`](../../raw/patterns/dashboards/schedule-strip.json)

## Component set: Schedule Entry

One row of a Schedule Strip: playback status, entry name with its recurrence and time, and a Tag. 8 variants: type (playing, paused, scheduled, complete) × state (default, hover). type drives the StatusIndicator and Tag; state is the pointer feedback only. Use inside Schedule Strip, not as a standalone list row; for generic rows use List Item.

### Props

| Prop    | Type    | Options / default                           |
| ------- | ------- | ------------------------------------------- |
| `type`  | variant | paused · **playing** · complete · scheduled |
| `state` | variant | **default** · hover                         |

Default variant: `type=playing, state=default` · 8 variants · default size 348×59px

### Anatomy (default variant)

- **type=playing, state=default** · component · row gap 12 pad 16/16/16/16 FIXED/HUG · 348×59  
  stroke `color.border.surface` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default`
  - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=xs) · FIXED/FIXED · 8×8  
    fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill`
  - **Container** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 207×27  
    itemSpacing `inset.xs`
    - **Morning Music** · text `body/md/medium` "Morning Music" · HUG/HUG · 95×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Mon-Fri · 06:00** · text `body/sm/regular` "Mon-Fri · 06:00" · HUG/HUG · 85×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Tag** · instance of **Tag** (status=success, type=icon+text, invert=false) · row gap 4 pad 0/12/0/8 HUG/FIXED · 77×24  
    fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.2xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle`, `color.surface.hover`                                                                    |
| Strokes         | `color.border.feedback.success.subtle`, `color.border.medium`, `color.border.surface`                                                                                      |
| Text color      | `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.primary`, `color.text.secondary`      |
| Icon color      | `color.icon.feedback.info`, `color.icon.feedback.neutral`, `color.icon.feedback.success`, `color.icon.feedback.warning`                                                    |
| Spacing         | `inset.2xs`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.sm`                                                                                                  |
| Radius          | `radius.pill`                                                                                                                                                              |
| Border width    | `border.default`                                                                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.size.body.md`, `type.size.body.sm` |
| Text styles     | `body/md/medium`, `body/sm/regular`                                                                                                                                        |

### Composes

- StatusIndicator
- Tag

### Variant matrix

| type      | state   | size   | fill                  | stroke                 | effect | text                                                                            | icon                          |
| --------- | ------- | ------ | --------------------- | ---------------------- | ------ | ------------------------------------------------------------------------------- | ----------------------------- |
| playing   | default | 348×59 |                       | `color.border.surface` |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success` | `color.icon.feedback.success` |
| playing   | hover   | 348×59 | `color.surface.hover` |                        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success` | `color.icon.feedback.success` |
| complete  | default | 348×59 |                       | `color.border.surface` |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.neutral` | `color.icon.feedback.neutral` |
| complete  | hover   | 348×59 | `color.surface.hover` |                        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.neutral` | `color.icon.feedback.neutral` |
| scheduled | default | 348×59 |                       | `color.border.surface` |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.info`    | `color.icon.feedback.info`    |
| scheduled | hover   | 348×59 | `color.surface.hover` |                        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.info`    | `color.icon.feedback.info`    |
| paused    | default | 348×59 |                       | `color.border.surface` |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.warning` | `color.icon.feedback.warning` |
| paused    | hover   | 348×59 | `color.surface.hover` |                        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.warning` | `color.icon.feedback.warning` |

## Component set: Schedule Strip

Titled panel that lists a sequence of Schedule Entry rows with an overflow menu in the header. 3 variants: state (default, empty) × ghost (false, true), shipped as the used combinations. default holds entries in the content slot; empty is the no-schedule message; ghost=true is the loading skeleton. Props: content (slot). Keep entries in chronological order; the strip does not sort.

### Props

| Prop      | Type    | Options / default         |
| --------- | ------- | ------------------------- |
| `state`   | variant | empty · **default**       |
| `ghost`   | variant | **false** · true          |
| `content` | slot    | default `[object Object]` |

Default variant: `state=default, ghost=false` · 3 variants · default size 380×343px

### Anatomy (default variant)

- **state=default, ghost=false** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 380×343  
  fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · strokeWeight `border.default` · radius `radius.container`
  - **Container** · frame · row gap 8 pad 16/16/16/16 FILL/HUG · 380×48  
    stroke `color.border.surface` mixedpx · padding `inset.md` · strokeWeight `border.default`
    - **Audio Schedule** · text `label/md` "Audio Schedule" · FILL/HUG · 332×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
    - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
  - **content** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 380×295  
    prop slotContentId←content
    - **Schedule Entry** · instance of **Schedule Entry** (type=playing, state=default) · row gap 12 pad 16/16/16/16 FILL/HUG · 380×59  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default`
    - **Schedule Entry** · instance of **Schedule Entry** (type=scheduled, state=default) · row gap 12 pad 16/16/16/16 FILL/HUG · 380×59  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default`
    - **Schedule Entry** · instance of **Schedule Entry** (type=complete, state=default) · row gap 12 pad 16/16/16/16 FILL/HUG · 380×59  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default`
    - **Schedule Entry** · instance of **Schedule Entry** (type=complete, state=default) · row gap 12 pad 16/16/16/16 FILL/HUG · 380×59  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default`
    - **Schedule Entry** · instance of **Schedule Entry** (type=complete, state=default) · row gap 12 pad 16/16/16/16 FILL/HUG · 380×59  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills           | `color.surface.raised`                                                                                                                                                                                             |
| Strokes         | `color.border.subtle`, `color.border.surface`                                                                                                                                                                      |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary` |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.feedback.info`, `color.icon.feedback.neutral`, `color.icon.feedback.success`, `color.icon.primary`                                                              |
| Spacing         | `inset.md`, `inset.none`, `stack.none`, `stack.sm`                                                                                                                                                                 |
| Radius          | `radius.container`                                                                                                                                                                                                 |
| Border width    | `border.default`                                                                                                                                                                                                   |
| Sizes           | `icon.sm`                                                                                                                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md`                                                                                                                |
| Effects         | `shadow/raised`                                                                                                                                                                                                    |
| Text styles     | `label/md`                                                                                                                                                                                                         |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop      |
| ------- | ------------------- | --------- |
| content | slotContentId       | `content` |

### Composes

- Icon/More
- Schedule Entry

### Variant matrix

| state   | ghost | size    | fill                   | stroke                | effect          | text                                                                                                                                           | icon                                                                                                                 |
| ------- | ----- | ------- | ---------------------- | --------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| default | false | 380×343 | `color.surface.raised` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.text.feedback.info`<br>`color.text.feedback.neutral` | `color.icon.primary`<br>`color.icon.feedback.success`<br>`color.icon.feedback.info`<br>`color.icon.feedback.neutral` |
| default | true  | 380×343 | `color.surface.raised` | `color.border.subtle` | `shadow/raised` |                                                                                                                                                |                                                                                                                      |
| empty   | false | 380×343 | `color.surface.raised` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                 | `color.icon.primary`<br>`color.action.secondary.icon.default`                                                        |

### Issues detected

- Hard-coded gap `8px` on layer _Container_

## Documentation card

**Description**

A compact horizontal timeline of upcoming events / bookings for a resource or day — a dashboard widget. For an at-a-glance schedule; use Calendar views for full scheduling.

**Anatomy**

Time axis · event blocks (proportional to duration) · now indicator · optional free/gap slots · overflow affordance.

**Behaviour**

Events are laid out proportionally along the strip; the current time is marked. Overflow scrolls or collapses. Selecting a block opens its detail.

**States**

loaded, loading (skeleton), empty ('Nothing scheduled'), error. Blocks: default, hover, focus, selected.

**Accessibility**

Expose as a list of events with start–end times, not just visual blocks. Announce the now indicator. Blocks keyboard-focusable; colour paired with a label. Text ≥4.5:1.

**Rules**

Scale blocks to duration  
Mark the current time  
Pair colour with a label  
Link blocks to detail

Use for full scheduling (use Calendar)  
Rely on colour alone  
Hide overflow with no cue  
Cram unreadable labels
