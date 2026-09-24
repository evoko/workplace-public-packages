# Insight Card

> SOLAR Web · Figma page `↳ 🟢 Insight Card` (id `5646:4`) · section `components/cards` · raw data: [`raw/components/cards/insight-card.json`](../../raw/components/cards/insight-card.json)

## Component set: Insight Card

Displays alerts, faults, or status information with a severity icon, count, and description. 15 variants: severity (danger, warning, info, success) × state (default, hover, selected) plus ghost=true placeholders. ghost is the loading skeleton. Used on dashboards for monitoring; for a single-line version use Insight Row.

### Props

| Prop       | Type    | Options / default                     |
| ---------- | ------- | ------------------------------------- |
| `severity` | variant | danger · warning · info · **success** |
| `state`    | variant | **default** · hover · selected        |
| `ghost`    | variant | **false** · true                      |

Default variant: `severity=success, state=default, ghost=false` · 15 variants · default size 320×68px

### Anatomy (default variant)

- **severity=success, state=default, ghost=false** · component · row gap 16 pad 8/16/8/8 FIXED/HUG · 320×68  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.md` · padding `inset.xs`, `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Icon** · frame · row gap 12 pad 0/0/0/0 FIXED/FIXED · 52×52  
    fill `color.surface.feedback.success.subtle` · itemSpacing `stack.sm` · radius `radius.control`
    - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=md) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 20×20  
      fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · itemSpacing `stack.none` · strokeWeight `border.default` · radius `radius.pill`
  - **Content** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 192×28  
    itemSpacing `stack.xs`
    - **Count** · text `body/md/medium` "Label" · FILL/HUG · 192×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Description** · text `body/md/regular` "Description goes here" · FILL/HUG · 192×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 20×20  
    height `icon.md`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.base`, `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle`                                                                                            |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                                                                  |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                                                                                  |
| Icon color      | `color.icon.feedback.danger`, `color.icon.feedback.info`, `color.icon.feedback.success`, `color.icon.feedback.warning`, `color.icon.inverse`, `color.surface.feedback.danger.strong`, `color.surface.feedback.warning.strong` |
| Spacing         | `inset.md`, `inset.xs`, `stack.md`, `stack.none`, `stack.sm`, `stack.xs`                                                                                                                                                      |
| Radius          | `radius.container`, `radius.control`, `radius.pill`                                                                                                                                                                           |
| Border width    | `border.default`                                                                                                                                                                                                              |
| Sizes           | `icon.md`                                                                                                                                                                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`                                                                                                     |
| Effects         | `shadow/raised`                                                                                                                                                                                                               |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                                                                                                                           |

### Composes

- Icon/More
- StatusIndicator

### Variant matrix

| severity | state    | ghost | size   | fill                                               | stroke                | effect          | text                                           | icon                                                                                             |
| -------- | -------- | ----- | ------ | -------------------------------------------------- | --------------------- | --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| success  | default  | false | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.icon.feedback.success`                                            |
| danger   | default  | false | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`<br>`color.icon.feedback.danger`   |
| warning  | default  | false | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse`<br>`color.icon.feedback.warning` |
| info     | default  | false | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.icon.feedback.info`                                               |
| info     | default  | true  | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` |                                                |                                                                                                  |
| success  | hover    | false | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.icon.feedback.success`                                            |
| danger   | hover    | false | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`<br>`color.icon.feedback.danger`   |
| warning  | hover    | false | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse`<br>`color.icon.feedback.warning` |
| info     | hover    | false | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.icon.feedback.info`                                               |
| info     | hover    | true  | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` |                                                |                                                                                                  |
| success  | selected | false | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.icon.feedback.success`                                            |
| danger   | selected | false | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`<br>`color.icon.feedback.danger`   |
| warning  | selected | false | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse`<br>`color.icon.feedback.warning` |
| info     | selected | false | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.icon.feedback.info`                                               |
| info     | selected | true  | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` |                                                |                                                                                                  |

## Component set: Insight Card Small

Compact alert or fault tile with a severity icon, count, and description. 10 variants: severity (danger, warning, info, success) × state (default, hover) plus ghost=true placeholders. ghost is the loading skeleton. Use in dense dashboard grids; for the full card use Insight Card.

### Props

| Prop       | Type    | Options / default                     |
| ---------- | ------- | ------------------------------------- |
| `severity` | variant | danger · warning · info · **success** |
| `state`    | variant | **default** · hover                   |
| `ghost`    | variant | **false** · true                      |

Default variant: `severity=success, state=default, ghost=false` · 10 variants · default size 320×56px

### Anatomy (default variant)

- **severity=success, state=default, ghost=false** · component · row gap 12 pad 8/16/8/8 FIXED/HUG · 320×56  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.sm` · padding `inset.xs`, `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Icon** · frame · row gap 12 pad 0/0/0/0 FIXED/FIXED · 40×40  
    fill `color.surface.feedback.success.subtle` · itemSpacing `stack.sm` · radius `radius.control`
    - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=md) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 20×20  
      fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · itemSpacing `stack.none` · strokeWeight `border.default` · radius `radius.pill`
  - **Content** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 244×28  
    itemSpacing `stack.xs`
    - **Count** · text `body/md/medium` "Label" · FILL/HUG · 244×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Description** · text `body/md/regular` "Description goes here" · FILL/HUG · 244×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle`                    |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                              |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                              |
| Icon color      | `color.icon.inverse`, `color.surface.feedback.danger.strong`, `color.surface.feedback.warning.strong`                     |
| Spacing         | `inset.md`, `inset.xs`, `stack.none`, `stack.sm`, `stack.xs`                                                              |
| Radius          | `radius.container`, `radius.control`, `radius.pill`                                                                       |
| Border width    | `border.default`                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Effects         | `shadow/raised`                                                                                                           |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                       |

### Composes

- StatusIndicator

### Variant matrix

| severity | state   | ghost | size   | fill                 | stroke                | effect          | text                                           | icon                                                            |
| -------- | ------- | ----- | ------ | -------------------- | --------------------- | --------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| success  | default | false | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`                                            |
| danger   | default | false | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`  |
| warning  | default | false | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse` |
| info     | default | false | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`                                            |
| info     | default | true  | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                |                                                                 |
| success  | hover   | false | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`                                            |
| danger   | hover   | false | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`  |
| warning  | hover   | false | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse` |
| info     | hover   | false | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`                                            |
| info     | hover   | true  | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` |                                                |                                                                 |

## Documentation card

**Usage**

Displays alerts, faults, or status information with a severity icon, count, and description.

**Anatomy**

Top-level layers of the first variant: Icon · Content · Icon/More. Instances keep their SOLAR component names.

**Specification**

15 variants.  
• severity — danger | warning | info | success  
• state — default | hover | selected  
• ghost — false | true

**Related**

Used on dashboards for monitoring; for a single-line version use Insight Row.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
