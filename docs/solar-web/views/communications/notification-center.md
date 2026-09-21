# Notification Center

> SOLAR Web · Figma page `↳ 🟢 Notification Center` (id `3772:2`) · section `views/communications` · raw data: [`raw/views/communications/notification-center.json`](../../raw/views/communications/notification-center.json)

## Component set: Notification Center

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×680px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/32/0 FIXED/HUG · 1368×680
  - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1368×134  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Content** · frame · column gap 24 pad 0/0/0/0 FIXED/HUG · 640×514
    - **Filter Tabs** · frame · row gap 4 pad 0/0/0/0 FILL/HUG · 640×40  
      stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
      - **Tab Item** · instance of **Tab Item** (size=md, state=selected) · row gap 8 pad 12/16/12/16 HUG/FIXED · 49×40  
        stroke `color.border.strong` mixedpx · itemSpacing `stack.xs` · padding `inset.md`, `inset.sm` · strokeWeight `border.strong`
      - **Tab Item** · instance of **Tab Item** (size=md, state=default) · row gap 8 pad 12/16/12/16 HUG/FIXED · 112×40  
        itemSpacing `stack.xs` · padding `inset.md`, `inset.sm`
      - **Tab Item** · instance of **Tab Item** (size=md, state=default) · row gap 8 pad 12/16/12/16 HUG/FIXED · 71×40  
        itemSpacing `stack.xs` · padding `inset.md`, `inset.sm`
      - **Tab Item** · instance of **Tab Item** (size=md, state=default) · row gap 8 pad 12/16/12/16 HUG/FIXED · 122×40  
        itemSpacing `stack.xs` · padding `inset.md`, `inset.sm`
    - **Group · Today** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 640×252
      - **Today** · text `title/2xs` "Today" · HUG/HUG · 45×9  
        fill `color.text.tertiary` · lineHeight `type.line-height.title.2xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.2xs` · fontStyle `type.font-weight.500`
      - **List** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 640×235  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.container`
    - **Group · Earlier this week** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 640×174
      - **Earlier this week** · text `title/2xs` "Earlier this week" · HUG/HUG · 132×9  
        fill `color.text.tertiary` · lineHeight `type.line-height.title.2xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.2xs` · fontStyle `type.font-weight.500`
      - **List** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 640×157  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.container`

Instance census (tree capped at depth 3): Icon/None ×48, Counter ×24, Button ×12, Spinner ×12, Tab Item ×12, Tag ×6, Notification Item ×5, Timestamp ×5, StatusIndicator ×4, Breadcrumb Item ×3, Icon/ChevronRight ×2, Icon/Notification ×2, Page Header ×1, Breadcrumbs ×1, Tabs ×1, Icon/Warning ×1, Icon/Key ×1, Icon/Calendar ×1, Icon/CloudDownload ×1

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills           | `color.surface.base`                                                                                                                                                                                                                                                                                                                       |
| Strokes         | `color.border.strong`, `color.border.subtle`                                                                                                                                                                                                                                                                                               |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                                                                                                                                                             |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.feedback.danger`, `color.icon.feedback.info`, `color.icon.feedback.neutral`, `color.icon.feedback.success`, `color.icon.feedback.warning`, `color.icon.primary`, `color.icon.secondary`, `color.neutral.900` |
| Spacing         | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.xs`                                                                                                                                                                                                                                                       |
| Radius          | `radius.container`                                                                                                                                                                                                                                                                                                                         |
| Border width    | `border.default`, `border.strong`                                                                                                                                                                                                                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.2xs`, `type.size.title.2xs`                                                                                                                                                                                                                                      |
| Text styles     | `title/2xs`                                                                                                                                                                                                                                                                                                                                |

### Composes

- Page Header
- Tab Item

### Variant matrix

| breakpoint | size     | fill | stroke | effect | text                                                                                                                                                                                     | icon                                                                                                                                                                                                                                                                                                                                    |
| ---------- | -------- | ---- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×680 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary` | `color.icon.secondary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.primary`<br>`color.icon.feedback.danger`<br>`color.icon.feedback.warning`<br>`color.icon.feedback.info`<br>`color.icon.feedback.success`<br>`color.icon.feedback.neutral`                  |
| mobile     | 377×744  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.secondary.text.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.icon.feedback.danger`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.feedback.warning`<br>`color.icon.feedback.info`<br>`color.icon.feedback.success`<br>`color.icon.feedback.neutral` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.900`.
- Hard-coded paddingBottom `32px` on layer _breakpoint=desktop_
- Hard-coded gap `24px` on layer _Content_
- Hard-coded gap `4px` on layer _Content › Filter Tabs_
- Hard-coded gap `8px` on layer _Content › Group · Today_
- Hard-coded gap `8px` on layer _Content › Group · Earlier this week_

## Documentation card

**Description**

The hub of a user's in-app notifications — grouped, filterable, with read / unread state and actions. Broadcast news lives in What's New.

**Layout**

Popover or full page: tabs / filter (All · Unread · Mentions) · notification list (icon · text · time · actions) · mark-all-read · empty state.

**Responsive**

Desktop: popover from the top bar or a full page. Mobile: full-screen list.

**States**

loaded, loading, empty ('You're all caught up'), unread badge, error, loading-more.

**Accessibility**

Unread count in an aria-live region; items are list entries with labelled actions; mark-read announced. Keyboard-complete; focus not trapped.

**Rules**

Group + let users filter  
Show clear read / unread  
Provide mark-all-read  
Deep-link to the source

Mix broadcasts with personal alerts  
Auto-clear unseen items  
Rely on colour for unread  
Trap focus in the popover
