# Device Card

> SOLAR Web · Figma page `↳ 🟢 Device Card` (id `10395:4`) · section `components/cards` · raw data: [`raw/components/cards/device-card.json`](../../raw/components/cards/device-card.json)

## Component set: Device Card

Device row card: icon tile, name/details, status Tag; batch type adds firmware Dropdown strip; loading swaps in skeleton. state/type variants + hasButton. Migrated from Chatter Config 2026-09-01.

### Props

| Prop        | Type    | Options / default     |
| ----------- | ------- | --------------------- |
| `state`     | variant | **default** · loading |
| `type`      | variant | **single** · batch    |
| `hasButton` | boolean | default `false`       |

Default variant: `state=default, type=single` · 4 variants · default size 560×68px

### Anatomy (default variant)

- **state=default, type=single** · component · row gap 16 pad 8/16/8/8 FIXED/HUG · 560×68  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · itemSpacing `stack.md` · padding `inset.xs`, `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Icon** · frame · row gap 0 pad 0/0/0/0 FIXED/FIXED · 52×52  
    fill `color.surface.background` · radius `radius.control`
    - **Icon/Device** · instance of **Icon/Device** (solid=false) · FIXED/FIXED · 20×20
  - **Content** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 382×28  
    itemSpacing `stack.xs`
    - **Name** · text `body/md/medium` "Cambridge Qt X" · FILL/HUG · 382×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Description** · text `body/md/regular` "Sound masking · PL5432109 · Auditorium 100" · FILL/HUG · 382×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Tag** · instance of **Tag** (status=success, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 70×24  
    fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
  - ~~**Button**~~ (hidden by default) · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 92×32  
    stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasButton

### Tokens used

| Role            | Tokens                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.base`, `color.surface.feedback.success.subtle`                                                               |
| Strokes         | `color.action.secondary.border.default`, `color.border.feedback.success.subtle`, `color.border.subtle`                                                  |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary` |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.primary`                                                                                             |
| Spacing         | `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.md`, `stack.xs`                                                                                |
| Radius          | `radius.container`, `radius.control`, `radius.pill`                                                                                                     |
| Border width    | `border.default`                                                                                                                                        |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`                               |
| Effects         | `shadow/control`                                                                                                                                        |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                                                     |

### Slots and prop-controlled layers

| Layer  | Controlled property | Prop        |
| ------ | ------------------- | ----------- |
| Button | visible             | `hasButton` |

### Composes

- Button
- Icon/Device
- Tag

### Variant matrix

| state   | type   | size    | fill                 | stroke                | effect | text                                                                                                                                                            | icon                                                          |
| ------- | ------ | ------- | -------------------- | --------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| default | single | 560×68  | `color.surface.base` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.icon.primary`<br>`color.action.secondary.icon.default` |
| loading | single | 560×68  | `color.surface.base` | `color.border.subtle` |        | `color.text.primary`                                                                                                                                            | `color.icon.primary`                                          |
| default | batch  | 560×120 | `color.surface.base` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`                                                                                 | `color.icon.primary`                                          |
| loading | batch  | 560×56  | `color.surface.base` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.secondary`                                                                                                                  | `color.icon.primary`                                          |

## Documentation card

**Usage**

Migrated from Chatter Config 2026-09-01.

**Anatomy**

surface/base card with radius/container and border/subtle. Icon tile (surface/background, SOLAR Icons Device/Progress glyph), name body/md/medium + details body/md/regular, status Tag, hidden ‘Try again’ Button (hasButton), and for type=batch a surface/background strip with a md Dropdown.

**Variants & props**

state (2) default · loading — loading shows the Progress glyph and a skeleton line  
type (2) single · batch — batch groups devices and adds the firmware strip  
hasButton (bool) reveals the Try again action

**Usage**

Use the status Tag for device health, not free text.  
Show hasButton only on failure states.  
Keep detail lines to model · serial · location.

**Rules**

- DO: Use it as described under Usage; bind every colour, spacing and radius to a SOLAR token.

- DON'T: detach the instance or override its tokens locally — request a change through governance instead.
