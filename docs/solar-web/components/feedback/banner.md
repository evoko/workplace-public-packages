# Banner

> SOLAR Web · Figma page `↳ 🟠 Banner` (id `2797:1322`) · section `components/feedback` · raw data: [`raw/components/feedback/banner.json`](../../raw/components/feedback/banner.json)

## Component set: Banner

Banner — a bold, full-width notification for page- or app-wide messages. High-priority alternative to Alert. Single line with truncation; offer at most one action (a Button or the text action) plus an optional close icon. The close icon and text action are drawn without a container — implement each with a ≥44×44px touch area (see Accessibility).

### Props

| Prop                    | Type    | Options / default                                                  |
| ----------------------- | ------- | ------------------------------------------------------------------ |
| `type`                  | variant | **neutral** · info · success · warning · danger                    |
| `Show Action`           | boolean | default `true`                                                     |
| `Description`           | text    | default `Lorem ipsum dolor sit amet, consectetur adipiscing elit.` |
| `Action`                | text    | default `Action`                                                   |
| `Show Close`            | boolean | default `true`                                                     |
| `Show Primary Button`   | boolean | default `false`                                                    |
| `Show Secondary Button` | boolean | default `false`                                                    |

Default variant: `type=neutral` · 5 variants · default size 458×44px

### Anatomy (default variant)

- **type=neutral** · component · row gap 12 pad 12/12/12/12 FIXED/FIXED · 458×44  
  fill `color.surface.feedback.neutral.medium` · itemSpacing `inset.sm` · padding `inset.sm`
  - **Icon/Info** · instance of **Icon/Info** (solid=false) · FIXED/FIXED · 20×20  
    width `icon.md`
  - **message** · text `body/md/medium` "Lorem ipsum dolor sit amet, consectetur adipiscing elit." · FILL/HUG · 322×10  
    fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←Description
  - **action group** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 36×9  
    itemSpacing `inset.xs`
    - ~~**Button**~~ (hidden by default) · instance of **Button** (size=sm, prio=primary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
      fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←Show Primary Button
    - ~~**Button**~~ (hidden by default) · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
      stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←Show Secondary Button
    - **Label** · text `link/sm/default` "Action" · HUG/HUG · 36×9  
      fill `color.action.secondary.text.default` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500` · prop visible←Show Action, characters←Action
  - **Icon/Close** · instance of **Icon/Close** (solid=false) · FIXED/FIXED · 20×20  
    width `icon.md` · prop visible←Show Close

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills           | `color.action.primary.bg.default`, `color.surface.feedback.danger.medium`, `color.surface.feedback.info.medium`, `color.surface.feedback.neutral.medium`, `color.surface.feedback.success.medium`, `color.surface.feedback.warning.medium` |
| Strokes         | `color.action.primary.border.default`, `color.action.secondary.border.default`                                                                                                                                                             |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.primary`                                                                                                                                           |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.icon.primary`                                                                                                                                           |
| Spacing         | `inset.sm`, `inset.xs`                                                                                                                                                                                                                     |
| Radius          | `radius.control`                                                                                                                                                                                                                           |
| Border width    | `border.default`                                                                                                                                                                                                                           |
| Sizes           | `icon.md`                                                                                                                                                                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.size.body.md`, `type.size.body.sm`                                                                                         |
| Effects         | `shadow/control`                                                                                                                                                                                                                           |
| Text styles     | `body/md/medium`, `link/sm/default`                                                                                                                                                                                                        |

### Slots and prop-controlled layers

| Layer                 | Controlled property | Prop                    |
| --------------------- | ------------------- | ----------------------- |
| message               | characters          | `Description`           |
| action group › Button | visible             | `Show Primary Button`   |
| action group › Button | visible             | `Show Secondary Button` |
| action group › Label  | visible             | `Show Action`           |
| action group › Label  | characters          | `Action`                |
| Icon/Close            | visible             | `Show Close`            |

### Composes

- Button
- Icon/Close
- Icon/Info

### Variant matrix

| type    | size   | fill                                    | stroke | effect | text                                                                                                 | icon                                                                                                 |
| ------- | ------ | --------------------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| neutral | 458×44 | `color.surface.feedback.neutral.medium` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.primary`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.default` |
| info    | 458×44 | `color.surface.feedback.info.medium`    |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.primary`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.default` |
| success | 458×44 | `color.surface.feedback.success.medium` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.primary`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.default` |
| warning | 458×44 | `color.surface.feedback.warning.medium` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.primary`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.default` |
| danger  | 458×44 | `color.surface.feedback.danger.medium`  |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.primary`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.default` |

## Documentation card

**Description**

Bold full-width notification for top-of-page or top-of-app messages. High-priority alternative to Alert for announcements, outages, or global states.

**Variants**

neutral Neutral announcement.  
info Feature release, maintenance notice.  
success Global confirmation (rare — usually Toast fits better).  
warning Degraded service or approaching limit.  
danger Outage, billing issue, blocked state.  
All types use the feedback 'medium' surface with text/primary + icon/primary.

**Labels & Content**

Single line with truncation at narrow widths.  
At most one action: a primary or secondary Button, or the text action.  
Optional close icon — use when the message can be dismissed.  
Write as a statement, not a question: 'Scheduled maintenance Friday 10pm PT'.

**Rules**

- DO: Pin to the top of the page or app shell
- DO: Use for global or page-wide states
- DO: Keep to a single line
- DO: Offer exactly one action at most

- DON'T: Stack multiple banners
- DON'T: Use for inline form validation
- DON'T: Hide critical banners behind a collapse
- DON'T: Use success banners for transient outcomes

**Accessibility**

role="status" for info/success/neutral; role="alert" for warning/danger (announced immediately).  
Touch area: the close icon (20px) and the text action are drawn bare — each needs a ≥44×44px hit area, centred on the element and spanning the full 44px banner height.  
Close is a `<button>` with aria-label="Dismiss"; the text action is a `<button>` or `<a>` by behaviour. Both show a :focus-visible ring (shadow.focus.default) around the touch area.  
On dismiss, move focus to the next logical element.  
Keyboard: Tab reaches the action, then Close; Enter/Space activates.  
Type is never conveyed by colour alone — each type carries its own icon.
