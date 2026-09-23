# Event Row

> SOLAR Web · Figma page `↳ 🟢 Event Row` (id `7352:2`) · section `components/cards` · raw data: [`raw/components/cards/event-row.json`](../../raw/components/cards/event-row.json)

## Component set: Event Row

Event Row — single row representing one audit event in an activity feed.

Use inside Activity Feed (⊞ Patterns / Data) or composed directly into product pages. Anatomy: leading slot (Avatar for user-initiated, Icon for system/device) · title line · meta line (Product tag + context) · trailing timestamp. Expanded density adds a second meta line for device telemetry (dB, channels, gain, preset bank, latency).

Keywords: activity, feed, event, audit, log, history, notification

### Props

| Prop         | Type          | Options / default                     |
| ------------ | ------------- | ------------------------------------- |
| `density`    | variant       | **default**                           |
| `state`      | variant       | **default** · hover · focus           |
| `Title`      | text          | default `Event name`                  |
| `ProductTag` | text          | default `PRODUCT`                     |
| `MetaText`   | text          | default `Context · Context · Context` |
| `Timestamp`  | text          | default `Just now`                    |
| `Leading`    | instance swap | default `2578:1837`                   |
| `hasMore`    | boolean       | default `true`                        |

Default variant: `density=default, state=default` · 3 variants · default size 520×56px

### Anatomy (default variant)

- **density=default, state=default** · component · row gap 12 pad 12/12/12/12 FILL/HUG · 520×56  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.container`
  - **Leading** · instance of **Avatar** (size=md, type=text, color=neutral, shade=Light) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
    fill `color.neutral.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill` · prop mainComponent←Leading
  - **Content** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 358×27  
    itemSpacing `inset.xs`
    - **Title** · text `body/md/medium` "Event name" · FILL/HUG · 358×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←Title
    - **Meta** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 358×9  
      itemSpacing `stack.xs`
      - **ProductTag** · text `label/sm` "PRODUCT" · HUG/HUG · 58×9  
        fill `color.text.secondary` · lineHeight `type.line-height.label.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.label.sm` · fontStyle `type.font-weight.500` · prop characters←ProductTag
      - **MetaText** · text `body/sm/regular` "Context · Context · Context" · FILL/HUG · 292×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400` · prop characters←MetaText
  - **Timestamp** · text `body/sm/regular` "Just now" · HUG/HUG · 50×9  
    fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400` · prop characters←Timestamp
  - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 20×20  
    height `icon.md` · prop visible←hasMore

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.hover`, `color.neutral.50`                                                                                                                                                               |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                         |
| Text color      | `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.neutral.700`                                                                                                                                      |
| Icon color      | `color.icon.secondary`                                                                                                                                                                                                        |
| Spacing         | `inset.sm`, `inset.xs`, `stack.sm`, `stack.xs`                                                                                                                                                                                |
| Radius          | `radius.container`, `radius.pill`                                                                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                                                                              |
| Sizes           | `icon.md`                                                                                                                                                                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.label.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.label.sm` |
| Text styles     | `body/md/medium`, `body/sm/regular`, `label/sm`                                                                                                                                                                               |

### Slots and prop-controlled layers

| Layer                       | Controlled property | Prop         |
| --------------------------- | ------------------- | ------------ |
| Leading                     | mainComponent       | `Leading`    |
| Content › Title             | characters          | `Title`      |
| Content › Meta › ProductTag | characters          | `ProductTag` |
| Content › Meta › MetaText   | characters          | `MetaText`   |
| Timestamp                   | characters          | `Timestamp`  |
| Icon/More                   | visible             | `hasMore`    |

### Composes

- Avatar
- Icon/More

### Variant matrix

| density | state   | size   | fill                  | stroke                | effect | text                                                                                           | icon                   |
| ------- | ------- | ------ | --------------------- | --------------------- | ------ | ---------------------------------------------------------------------------------------------- | ---------------------- |
| default | default | 520×56 | `color.surface.base`  | `color.border.subtle` |        | `color.neutral.700`<br>`color.text.primary`<br>`color.text.secondary`<br>`color.text.tertiary` | `color.icon.secondary` |
| default | hover   | 520×56 | `color.surface.hover` | `color.border.subtle` |        | `color.neutral.700`<br>`color.text.primary`<br>`color.text.secondary`<br>`color.text.tertiary` | `color.icon.secondary` |
| default | focus   | 520×56 | `color.surface.base`  | `color.border.subtle` |        | `color.neutral.700`<br>`color.text.primary`<br>`color.text.secondary`<br>`color.text.tertiary` | `color.icon.secondary` |

### Issues detected

- Primitive color bound directly (CLR-002): `color.neutral.50`, `color.neutral.700`.

## Documentation card

Single row representing one audit event in an activity feed. Composes into Activity Feed (⊞ Patterns / Data) or any product page that needs an audit / event surface.

**Description**

Single row representing one audit event in an activity feed. Composes Avatar or Icon (leading) → Title → Meta line (ProductTag + free-form context) → Timestamp. Drop into Activity Feed (⊞ Patterns / Data) or any product surface that needs an event log.

**Anatomy**

Leading (32×32) — Avatar instance for user-initiated events (Anatoliy badge-tapped …); Icon-in-square for system / device events (Sensor SN-4B-02 …).  
Content (FILL) — Title line + Meta row. Meta row holds ProductTag (uppercase product label) + MetaText (free-form context).  
Timestamp — right-aligned, relative form (3 min ago, Yesterday · 14:08).  
Expanded density — adds a second meta line for device telemetry (channels, dB, preset bank, latency).

**States**

default Base row, surface/base fill.  
hover surface/hover fill. Render only when the host treats the row as clickable.  
focus Visible 2px ring via shadow/focus/default effect style. Keyboard order follows DOM.

**Properties**

Title TEXT — primary event line (Actor verb target).  
ProductTag TEXT — uppercase product label (WORKPLACE, TESIRA, VOCIA).  
MetaText TEXT — context after the tag (where · when · how).  
Telemetry TEXT — second meta line, expanded density only (channels, dB, preset bank, latency).  
Timestamp TEXT — relative time.  
density VARIANT — default · expanded.  
state VARIANT — default · hover · focus.  
ROW-LEVEL ACTIONS (host attaches; reveal on hover or in a kebab menu)  
View details Open a detail panel/page for this event.  
Filter by Add this actor / product / event type to the active filter.  
Copy permalink Copy a deep link to this event for sharing in a ticket or chat.  
Mute event type Suppress future events of this kind from the feed.  
Acknowledge For broadcast / page events (Vocia override) — record the ack.  
Roll back For config events (Tesira preset recall, channel mute) — revert to prior state.  
Re-trigger For sync / page events — re-run the action.

**Accessibility**

Role When interactive, host applies role=button to the outer row. Non-interactive rows live inside `<ol>` with the date group as the labelled `<section>`.  
Differentiation Shape alone (circle Avatar vs. square Icon) fails WCAG 1.4.1 — add visually-hidden actor-kind prefix ("System event" / "User event by {actor}").  
Timestamp Render as `<time datetime=ISO>`. Show relative form visually; expose absolute datetime to AT.  
Focus state=focus exposes shadow/focus/default ring. Touch target ≥ 44px on mobile if interactive.
