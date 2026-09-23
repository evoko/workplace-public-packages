# Insight Row

> SOLAR Web · Figma page `↳ 🟢 Insight Row` (id `6902:3`) · section `components/cards` · raw data: [`raw/components/cards/insight-row.json`](../../raw/components/cards/insight-row.json)

## Component set: Insight Row

Single-line insight for a feed or panel — severity icon, title, meta and an optional action. 10 variants: severity (success, danger, warning, info) × state (default, hover) plus ghost=true placeholders. ghost is the empty placeholder row. Props: Title, Meta (text), showAction + action (instance swap). Stack rows in a List; for the same content as a standalone card use Insight Card.

### Props

| Prop         | Type          | Options / default                     |
| ------------ | ------------- | ------------------------------------- |
| `severity`   | variant       | **success** · danger · warning · info |
| `state`      | variant       | **default** · hover                   |
| `ghost`      | variant       | **false** · true                      |
| `Title`      | text          | default `Title`                       |
| `Meta`       | text          | default `Detail · Detail · Detail`    |
| `showAction` | boolean       | default `true`                        |
| `action`     | instance swap | default `2087:2569`                   |

Default variant: `severity=success, state=default, ghost=false` · 10 variants · default size 480×64px

### Anatomy (default variant)

- **severity=success, state=default, ghost=false** · component · row gap 0 pad 4/4/4/4 FIXED/FIXED · 480×64  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · padding `inset.2xs` · strokeWeight `border.default` · radius `radius.container`
  - **Severity Bar** · rectangle · FIXED/FILL · 4×56  
    fill `color.surface.feedback.success.strong` · radius `radius.pill`
  - **Content** · frame · row gap 16 pad 12/16/12/16 FILL/FILL · 468×56  
    itemSpacing `stack.md` · padding `inset.md`, `inset.sm`
    - **Body** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 356×27  
      itemSpacing `stack.xs`
      - **Title** · text `body/md/medium` "Title" · FILL/HUG · 356×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←Title
      - **Meta** · text `body/sm/regular` "Detail · Detail · Detail" · FILL/HUG · 356×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400` · prop characters←Meta
    - **Action** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
      stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←showAction, mainComponent←action

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.feedback.success.strong`                                                                                                              |
| Strokes         | `color.action.secondary.border.default`, `color.border.medium`, `color.border.subtle`                                                                                      |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.primary`, `color.text.secondary`                                                   |
| Icon color      | `color.action.secondary.icon.default`                                                                                                                                      |
| Spacing         | `inset.2xs`, `inset.md`, `inset.sm`, `inset.xs`, `stack.md`, `stack.xs`                                                                                                    |
| Radius          | `radius.container`, `radius.control`, `radius.pill`                                                                                                                        |
| Border width    | `border.default`                                                                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.size.body.md`, `type.size.body.sm` |
| Effects         | `shadow/control`, `shadow/raised`                                                                                                                                          |
| Text styles     | `body/md/medium`, `body/sm/regular`                                                                                                                                        |

### Slots and prop-controlled layers

| Layer                  | Controlled property | Prop         |
| ---------------------- | ------------------- | ------------ |
| Content › Body › Title | characters          | `Title`      |
| Content › Body › Meta  | characters          | `Meta`       |
| Content › Action       | visible             | `showAction` |
| Content › Action       | mainComponent       | `action`     |

### Composes

- Button

### Variant matrix

| severity | state   | ghost | size   | fill                 | stroke                | effect          | text                                                                                                                           | icon                                  |
| -------- | ------- | ----- | ------ | -------------------- | --------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| success  | default | false | 480×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.secondary.icon.default` |
| danger   | default | false | 480×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.secondary.icon.default` |
| warning  | default | false | 480×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.secondary.icon.default` |
| info     | default | false | 480×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.secondary.icon.default` |
| info     | default | true  | 480×64 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.action.secondary.text.default`<br>`color.action.primary.text.default`                                                   | `color.action.secondary.icon.default` |
| success  | hover   | false | 480×64 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.secondary.icon.default` |
| danger   | hover   | false | 480×64 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.secondary.icon.default` |
| warning  | hover   | false | 480×64 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.secondary.icon.default` |
| info     | hover   | false | 480×64 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.secondary.icon.default` |
| info     | hover   | true  | 480×64 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.action.secondary.text.default`<br>`color.action.primary.text.default`                                                   | `color.action.secondary.icon.default` |

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
