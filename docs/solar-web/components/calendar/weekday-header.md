# Weekday Header

> SOLAR Web · Figma page `↳ 🟢 Weekday Header` (id `6622:4`) · section `components/calendar` · raw data: [`raw/components/calendar/weekday-header.json`](../../raw/components/calendar/weekday-header.json)

## Component set: Weekday Header

Column header used at the top of the Month grid and the Week / Day grid. Today emphasis bolds the weekday and tints it with text/feedback/info.

### Props

| Prop       | Type    | Options / default   |
| ---------- | ------- | ------------------- |
| `emphasis` | variant | **default** · today |
| `label`    | text    | default `Mon`       |

Default variant: `emphasis=default` · 2 variants · default size 160×36px

### Anatomy (default variant)

- **emphasis=default** · component · row gap 0 pad 12/12/12/12 FIXED/FIXED · 160×36  
  fill `color.surface.base` · stroke `color.border.surface` mixedpx · padding `inset.sm` · strokeWeight `border.none`, `border.default`
  - **Weekday** · text `label/sm` "Mon" · HUG/HUG · 25×9  
    fill `color.text.secondary` · lineHeight `type.line-height.label.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.label.sm` · fontStyle `type.font-weight.500` · prop characters←label

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                |
| Strokes         | `color.border.surface`                                                                              |
| Text color      | `color.text.feedback.info`, `color.text.secondary`                                                  |
| Spacing         | `inset.sm`                                                                                          |
| Border width    | `border.default`, `border.none`                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.sm`, `type.size.label.sm` |
| Text styles     | `label/sm`                                                                                          |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop    |
| ------- | ------------------- | ------- |
| Weekday | characters          | `label` |

### Variant matrix

| emphasis | size   | fill                 | stroke                 | effect | text                       | icon |
| -------- | ------ | -------------------- | ---------------------- | ------ | -------------------------- | ---- |
| default  | 160×36 | `color.surface.base` | `color.border.surface` |        | `color.text.secondary`     |      |
| today    | 160×36 | `color.surface.base` | `color.border.surface` |        | `color.text.feedback.info` |      |

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
