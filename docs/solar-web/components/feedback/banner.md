# Banner

> SOLAR Web · Figma page `↳ 🟢 Banner` (id `2797:1322`) · section `components/feedback` · raw data: [`raw/components/feedback/banner.json`](../../raw/components/feedback/banner.json)

## Component set: Banner

Banner — a bold, full-width notification for top-of-page messages. High-priority alternative to the subtle alert component. Single line with truncation, optional action link and close button. Inspired by Atlassian Design System.

### Props

| Prop              | Type    | Options / default                                                  |
| ----------------- | ------- | ------------------------------------------------------------------ |
| `Variant`         | variant | **default** · info · success · warning · danger                    |
| `Show Action`     | boolean | default `true`                                                     |
| `Description`     | text    | default `Lorem ipsum dolor sit amet, consectetur adipiscing elit.` |
| `Action`          | text    | default `Action`                                                   |
| `Show Buttons`    | boolean | default `true`                                                     |
| `Show Icon/Close` | boolean | default `true`                                                     |

Default variant: `Variant=default` · 5 variants · default size 458×44px

### Anatomy (default variant)

- **Variant=default** · component · row gap 12 pad 12/12/12/12 FIXED/FIXED · 458×44  
  fill `color.surface.feedback.neutral.medium` · itemSpacing `inset.sm` · padding `inset.sm`
  - **icon** · frame · FIXED/FIXED · 20×20
    - **Union** · boolean_operation · 5×10  
      fill `color.icon.primary`
      - **Icon** · vector · 5×6  
        fill `color.icon.primary`
      - **Icon** · vector · 2×2  
        fill `color.icon.primary`
    - **Icon** · vector · 18×18  
      fill `color.icon.primary`
  - **message** · text `body/md/regular` "Lorem ipsum dolor sit amet, consectetur adipiscing elit." · FILL/HUG · 172×10  
    fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop characters←Description
  - **action group** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 218×32  
    itemSpacing `inset.xs`
    - **Button** · instance of **Button** (size=sm, prio=primary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
      fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←Show Buttons
    - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
      stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←Show Buttons
    - **action** · text `body/md/medium` "Action" · HUG/HUG · 42×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop visible←Show Action, characters←Action
    - **Icon/Close** · instance of **Icon/Close** (solid=false) · FIXED/FIXED · 24×24  
      width `icon.lg` · prop visible←Show Icon/Close

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.surface.feedback.danger.strong`, `color.surface.feedback.neutral.medium`, `color.surface.feedback.success.medium`, `color.surface.feedback.warning.medium`, `color.alpha.turquoise-50` |
| Strokes         | `color.action.primary.border.default`, `color.action.secondary.border.default`                                                                                                                                                   |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.primary`                                                                                                                                 |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.icon.primary`, `color.surface.inverse`                                                                                                        |
| Spacing         | `inset.sm`, `inset.xs`                                                                                                                                                                                                           |
| Radius          | `radius.control`                                                                                                                                                                                                                 |
| Border width    | `border.default`                                                                                                                                                                                                                 |
| Sizes           | `icon.lg`                                                                                                                                                                                                                        |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`                                                                                                        |
| Effects         | `shadow/control`                                                                                                                                                                                                                 |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                                                                                                                              |

### Slots and prop-controlled layers

| Layer                     | Controlled property | Prop              |
| ------------------------- | ------------------- | ----------------- |
| message                   | characters          | `Description`     |
| action group › Button     | visible             | `Show Buttons`    |
| action group › Button     | visible             | `Show Buttons`    |
| action group › action     | visible             | `Show Action`     |
| action group › action     | characters          | `Action`          |
| action group › Icon/Close | visible             | `Show Icon/Close` |

### Composes

- Button
- Icon/Close

### Variant matrix

| Variant | size   | fill                                    | stroke | effect | text                                                                                                 | icon                                                                                                    |
| ------- | ------ | --------------------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| default | 458×44 | `color.surface.feedback.neutral.medium` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.icon.primary`    |
| info    | 458×44 | `color.alpha.turquoise-50`              |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.surface.inverse` |
| success | 458×44 | `color.surface.feedback.success.medium` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.icon.primary`    |
| warning | 458×44 | `color.surface.feedback.warning.medium` |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.icon.primary`    |
| danger  | 458×44 | `color.surface.feedback.danger.strong`  |        |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.icon.primary`    |

### Issues detected

- Primitive color bound directly (CLR-002): `color.alpha.turquoise-50`.

## Documentation card

**Description**

Bold full-width notification for top-of-page or top-of-app messages. High-priority alternative to Alert for announcements, outages, or global states.

**Variants**

default Neutral announcement.  
info Feature release, maintenance notice.  
success Global confirmation (rare — usually Toast fits better).  
warning Degraded service or approaching limit.  
danger Outage, billing issue, blocked state.

**Labels & Content**

Single line with truncation at narrow widths.  
One optional action link (right-aligned).  
One optional close button.  
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
