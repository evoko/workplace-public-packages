# Notifications Panel

> SOLAR Web · Figma page `↳ 🟢 Notifications Panel` (id `2202:1259`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/notifications-panel.json`](../../raw/patterns/layout-shell/notifications-panel.json)

## Component set: Notification Item

Single row inside the Notifications Panel. read=false shows a leading unread dot; read=true renders the row with reduced emphasis. Pair with leading avatar (actor), primary text (what happened), Timestamp, and optional action button. Marked as read on click or on panel close (configurable per product).

### Props

| Prop              | Type    | Options / default |
| ----------------- | ------- | ----------------- |
| `read`            | variant | true · **false**  |
| `hasSecondaryCTA` | boolean | default `false`   |
| `hasPrimaryCTA`   | boolean | default `false`   |
| `hasActions`      | boolean | default `false`   |

Default variant: `read=false` · 2 variants · default size 400×98px

### Anatomy (default variant)

- **read=false** · component · row gap 12 pad 16/16/20/16 FIXED/HUG · 400×98  
  fill `color.surface.raised` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.lg` · strokeWeight `border.default`
  - **Tag** · instance of **Tag** (status=success, type=icon-only, invert=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
    fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.none` · padding `inset.none` · strokeWeight `border.default` · radius `radius.pill`
  - **Content** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 332×62  
    itemSpacing `stack.xs`
    - **Container** · frame · row gap 8 pad 0/0/0/0 FILL/FIXED · 332×24  
      itemSpacing `stack.xs` · padding `inset.none`
      - **Label** · text `title/xs` "Label" · HUG/HUG · 40×12  
        fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500`
      - **Timestamp** · instance of **Timestamp** (format=relative, size=sm, emphasis=subtle) · row gap 8 pad 0/0/0/0 FILL/HUG · 268×9  
        itemSpacing `stack.xs`
      - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=xs) · FIXED/FIXED · 8×8  
        fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill`
    - **Container** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 332×30  
      itemSpacing `inset.sm`
      - **Notification description goes here, can be in multiple lines.** · text `body/md/regular` "Notification description goes here, can be in multiple lines." · FILL/HUG · 332×30  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - ~~**Button Group**~~ (hidden by default) · frame · row gap 8 pad 4/0/0/0 FIXED/HUG · 332×32  
      itemSpacing `inset.xs` · padding `inset.none`, `inset.2xs` · prop visible←hasActions
      - ~~**Button**~~ (hidden by default) · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 FIXED/FIXED · 332×32  
        stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasSecondaryCTA
      - ~~**Button**~~ (hidden by default) · instance of **Button** (size=sm, prio=primary, state=default, danger=false) · row gap 8 pad 0/8/0/8 FIXED/FIXED · 162×32  
        fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasPrimaryCTA

### Tokens used

| Role            | Tokens                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle`, `color.surface.raised`                                  |
| Strokes         | `color.action.primary.border.default`, `color.action.secondary.border.default`, `color.border.feedback.success.subtle`, `color.border.medium`, `color.border.subtle`         |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                              |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.icon.feedback.success`                                                                    |
| Spacing         | `inset.2xs`, `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.sm`, `stack.xs`                                                                            |
| Radius          | `radius.control`, `radius.pill`                                                                                                                                              |
| Border width    | `border.default`                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.title.xs`, `type.size.body.md`, `type.size.title.xs` |
| Effects         | `shadow/control`                                                                                                                                                             |
| Text styles     | `body/md/regular`, `title/xs`                                                                                                                                                |

### Slots and prop-controlled layers

| Layer                           | Controlled property | Prop              |
| ------------------------------- | ------------------- | ----------------- |
| Content › Button Group          | visible             | `hasActions`      |
| Content › Button Group › Button | visible             | `hasSecondaryCTA` |
| Content › Button Group › Button | visible             | `hasPrimaryCTA`   |

### Composes

- Button
- StatusIndicator
- Tag
- Timestamp

### Variant matrix

| read  | size   | fill                   | stroke                | effect | text                                                                                                                                                    | icon                                                                                                          |
| ----- | ------ | ---------------------- | --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| false | 400×98 | `color.surface.raised` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.feedback.success`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |
| true  | 400×98 | `color.surface.raised` | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                         | `color.icon.feedback.success`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |

## Component: Notifications Panel

Panel that lists user notifications — system alerts, @mentions, assignment changes. Opens from the topbar bell icon. Groups by date ('Today', 'Earlier this week'). Shows badge count on bell when unread > 0. Draft — not yet consumed by 2+ products. See also: Toast for in-session notifications, Notification Item for per-row structure.

### Props

| Prop                | Type | Options / default         |
| ------------------- | ---- | ------------------------- |
| `Today`             | slot | default `[object Object]` |
| `Earlier this week` | slot | default `[object Object]` |

### Anatomy (default variant)

- **Notifications Panel** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 380×658  
  fill `color.surface.overlay` · stroke `color.border.subtle` 1px · effect `shadow/dialog` · strokeWeight `border.default` · radius `radius.dialog`
  - **Header** · frame · row gap 12 pad 16/20/16/20 FILL/HUG · 380×56  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.sm` · padding `inset.lg`, `inset.md` · strokeWeight `border.default`
    - **Title Group** · frame · row gap 12 pad 0/0/0/0 HUG/HUG · 177×24  
      itemSpacing `stack.sm`
      - **Notifications** · text `body/lg/medium` "Notifications" · HUG/HUG · 94×12  
        fill `color.text.primary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
      - **Tag** · instance of **Tag** (status=success, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 71×24  
        fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
    - **Mark all as read** · text `body/md/medium` "Mark all as read" · HUG/HUG · 101×10  
      fill `color.text.link.default` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
  - **Dropdown Group Label** · instance of **Dropdown Group Label** (size=md) · row gap 8 pad 12/12/12/12 FILL/HUG · 380×34  
    fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
  - **Today** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 380×196  
    prop slotContentId←Today
    - **Notification Item** · instance of **Notification Item** (read=false) · row gap 12 pad 16/16/20/16 FILL/HUG · 380×98  
      fill `color.surface.raised` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.lg` · strokeWeight `border.default`
    - **Notification Item** · instance of **Notification Item** (read=true) · row gap 12 pad 16/16/20/16 FILL/HUG · 380×98  
      fill `color.surface.raised` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.lg` · strokeWeight `border.default`
  - **Dropdown Group Label** · instance of **Dropdown Group Label** (size=md) · row gap 8 pad 12/12/12/12 FILL/HUG · 380×34  
    fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
  - **Earlier this week** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 380×294  
    prop slotContentId←Earlier this week
    - **Notification Item** · instance of **Notification Item** (read=true) · row gap 12 pad 16/16/20/16 FILL/HUG · 380×98  
      fill `color.surface.raised` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.lg` · strokeWeight `border.default`
    - **Notification Item** · instance of **Notification Item** (read=true) · row gap 12 pad 16/16/20/16 FILL/HUG · 380×98  
      fill `color.surface.raised` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.lg` · strokeWeight `border.default`
    - **Notification Item** · instance of **Notification Item** (read=true) · row gap 12 pad 16/16/20/16 FILL/HUG · 380×98  
      fill `color.surface.raised` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.lg` · strokeWeight `border.default`
  - **Footer** · frame · row gap 0 pad 16/20/16/20 FILL/HUG · 380×44  
    padding `inset.lg`, `inset.md`
    - **View all notifications** · text `body/lg/medium` "View all notifications" · HUG/HUG · 152×12  
      fill `color.text.link.default` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.feedback.success.subtle`, `color.surface.overlay`, `color.surface.raised`                               |
| Strokes         | `color.border.feedback.success.subtle`, `color.border.subtle`                                                                                      |
| Text color      | `color.text.link.default`, `color.text.primary`                                                                                                    |
| Spacing         | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.sm`                                                                           |
| Radius          | `radius.dialog`, `radius.pill`                                                                                                                     |
| Border width    | `border.default`                                                                                                                                   |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.lg`, `type.line-height.body.md`, `type.size.body.lg`, `type.size.body.md` |
| Effects         | `shadow/dialog`                                                                                                                                    |
| Text styles     | `body/lg/medium`, `body/md/medium`                                                                                                                 |

### Slots and prop-controlled layers

| Layer             | Controlled property | Prop                |
| ----------------- | ------------------- | ------------------- |
| Today             | slotContentId       | `Today`             |
| Earlier this week | slotContentId       | `Earlier this week` |

### Composes

- Dropdown Group Label
- Notification Item
- Tag

## Documentation card

**Description**

Panel listing user notifications — system alerts, @mentions, assignment changes. Opens from the topbar bell icon. Draft — awaiting 2+ consumer alignment.

**Sub-components**

Notifications Panel Panel container with header, filters, list, empty state.  
Notification Item Per-row entry — read / unread state.

**Grouping**

Group by date: Today, Earlier this week, Earlier.  
Within groups, order newest first.  
Show unread count badge on the topbar bell when > 0.

**Item read state**

read=false Leading unread dot. Full-emphasis text.  
read=true No dot. Secondary-emphasis text, slightly reduced.  
Mark read on click or on panel close (per product).

**Labels & Content**

Actor avatar + primary text + Timestamp.  
Primary text: what happened, in user-readable voice ('Alex assigned you a task').  
Optional action button for 1-click resolution ('View', 'Reply').

**Rules**

- DO: Group by date
- DO: Show unread badge on topbar bell
- DO: Mark read on click or panel close
- DO: Offer 1-click action where possible

- DON'T: Use for transient outcomes (use Toast)
- DON'T: Show > 1 action per item
- DON'T: Auto-clear read items before user dismiss
- DON'T: Mix product-level and system alerts without labels
