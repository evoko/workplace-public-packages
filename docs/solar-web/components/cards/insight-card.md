# Insight Card

> SOLAR Web · Figma page `↳ 🟢 Insight Card` (id `5646:4`) · section `components/cards` · raw data: [`raw/components/cards/insight-card.json`](../../raw/components/cards/insight-card.json)

## Component set: Insight Card

Displays alerts, faults, or status information with a severity icon, count, and description. Used on dashboards for monitoring.

### Props

| Prop       | Type    | Options / default                             |
| ---------- | ------- | --------------------------------------------- |
| `severity` | variant | danger · warning · info · **success** · ghost |
| `state`    | variant | **default** · hover · selected                |

Default variant: `severity=success, state=default` · 15 variants · default size 320×68px

### Anatomy (default variant)

- **severity=success, state=default** · component · row gap 16 pad 8/16/8/8 FIXED/HUG · 320×68  
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

| Role            | Tokens                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.base`, `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle` |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                       |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                       |
| Icon color      | `color.icon.inverse`, `color.surface.feedback.danger.strong`, `color.surface.feedback.warning.strong`, `color.neutral.900`         |
| Spacing         | `inset.md`, `inset.xs`, `stack.md`, `stack.none`, `stack.sm`, `stack.xs`                                                           |
| Radius          | `radius.container`, `radius.control`, `radius.pill`                                                                                |
| Border width    | `border.default`                                                                                                                   |
| Sizes           | `icon.md`                                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`          |
| Effects         | `shadow/raised`                                                                                                                    |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                                |

### Composes

- Icon/More
- StatusIndicator

### Variant matrix

| severity | state    | size   | fill                                               | stroke                | effect          | text                                           | icon                                                                                   |
| -------- | -------- | ------ | -------------------------------------------------- | --------------------- | --------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| success  | default  | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.neutral.900`                                            |
| danger   | default  | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`<br>`color.neutral.900`  |
| warning  | default  | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse`<br>`color.neutral.900` |
| info     | default  | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.neutral.900`                                            |
| ghost    | default  | 320×68 | `color.surface.base`                               | `color.border.subtle` | `shadow/raised` |                                                |                                                                                        |
| success  | hover    | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.neutral.900`                                            |
| danger   | hover    | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`<br>`color.neutral.900`  |
| warning  | hover    | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse`<br>`color.neutral.900` |
| info     | hover    | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.neutral.900`                                            |
| ghost    | hover    | 320×68 | `color.surface.base`                               | `color.border.medium` | `shadow/raised` |                                                |                                                                                        |
| success  | selected | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.neutral.900`                                            |
| danger   | selected | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`<br>`color.neutral.900`  |
| warning  | selected | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse`<br>`color.neutral.900` |
| info     | selected | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`<br>`color.neutral.900`                                            |
| ghost    | selected | 320×68 | `color.surface.base`<br>`color.surface.background` | `color.border.subtle` | `shadow/raised` |                                                |                                                                                        |

### Issues detected

- Primitive color bound directly (CLR-002): `color.neutral.900`.

## Component set: Insight Card Small

Displays alerts, faults, or status information with a severity icon, count, and description. Used on dashboards for monitoring.

### Props

| Prop       | Type    | Options / default                             |
| ---------- | ------- | --------------------------------------------- |
| `severity` | variant | danger · warning · info · **success** · ghost |
| `state`    | variant | **default** · hover                           |

Default variant: `severity=success, state=default` · 10 variants · default size 320×56px

### Anatomy (default variant)

- **severity=success, state=default** · component · row gap 12 pad 8/16/8/8 FIXED/HUG · 320×56  
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

| severity | state   | size   | fill                 | stroke                | effect          | text                                           | icon                                                            |
| -------- | ------- | ------ | -------------------- | --------------------- | --------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| success  | default | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`                                            |
| danger   | default | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`  |
| warning  | default | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse` |
| info     | default | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`                                            |
| ghost    | default | 320×56 | `color.surface.base` | `color.border.subtle` | `shadow/raised` |                                                |                                                                 |
| success  | hover   | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`                                            |
| danger   | hover   | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.danger.strong`<br>`color.icon.inverse`  |
| warning  | hover   | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.surface.feedback.warning.strong`<br>`color.icon.inverse` |
| info     | hover   | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse`                                            |
| ghost    | hover   | 320×56 | `color.surface.base` | `color.border.medium` | `shadow/raised` |                                                |                                                                 |

## Issues detected (page)

- Documentation card contains Breadcrumbs boilerplate text; it does not describe this component.

## Documentation card

**Description**

Shows the user's location within a navigational hierarchy — and lets them jump back up the tree. Use for deep page structures where ancestors are meaningful destinations. Not for single-level flows (omit entirely), not for linear progress (use Stepper).

**Anatomy**

Breadcrumbs compose from Breadcrumb Items joined by a separator.  
Breadcrumb Item (4 variants) type: link | current — current is the final, non-interactive item.  
Breadcrumbs (5 variants) items: 2 | 3 | 4 | 5 | multiple — use 'multiple' when the trail exceeds 5 levels.

**States**

default Interactive ancestor link. Subtle text color.  
hover Full emphasis + underline. Touch targets pad to 44px per WCAG.  
disabled Non-interactive ancestor. Use sparingly — prefer omitting the item entirely.

**Truncation**

Switch to items=multiple once the trail exceeds 5 levels. The middle collapses to an ellipsis (…) while the first and last segments stay visible. Clicking the ellipsis opens a menu listing the hidden ancestors so users can jump to any of them without losing the endpoints.

**Accessibility**

Wrap the trail in `<nav aria-label="Breadcrumb">` and render as an ordered list.  
Mark the current item with aria-current="page" — never link it.  
Separators are decorative: aria-hidden="true".  
Keyboard: Tab moves between links, Enter activates. Ellipsis menu: Arrow keys to navigate, Esc to dismiss.
