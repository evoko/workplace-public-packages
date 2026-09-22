# Option Card

> SOLAR Web · Figma page `↳ 🟢 Option Card` (id `9386:2`) · section `components/cards` · raw data: [`raw/components/cards/option-card.json`](../../raw/components/cards/option-card.json)

## Component set: Option Card

Large selectable card that behaves as a rich radio or checkbox — icon, title and description the user picks from a small set. 3 variants: state (default, hover, selected). selected uses border + surface tint, never colour alone; focus and disabled come from the nested control. The whole card is the label and the hit target; group with role=radiogroup and a legend. For dense or long lists use Radio, Checkbox or Option Row.

### Props

| Prop    | Type    | Options / default              |
| ------- | ------- | ------------------------------ |
| `state` | variant | **default** · hover · selected |

Default variant: `state=default` · 3 variants · default size 240×228px

### Anatomy (default variant)

- **state=default** · component · column gap 20 pad 0/0/0/0 FIXED/FIXED · 240×228  
  fill `color.surface.base` · stroke `color.border.medium` 1px · itemSpacing `stack.lg` · strokeWeight `border.default` · radius `radius.container`
  - **Container** · frame · row gap 0 pad 0/0/0/0 FIXED/FIXED · 64×64  
    fill `color.surface.background` · radius `radius.pill`
    - **Icon/Plus** · instance of **Icon/Plus** (solid=false) · FIXED/FIXED · 24×24  
      width `icon.lg`
  - **Label** · text `body/md/medium` "New design" · HUG/HUG · 77×10  
    fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.base`                                                  |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                      |
| Text color      | `color.text.primary`                                                                              |
| Icon color      | `color.icon.primary`, `color.icon.secondary`                                                      |
| Spacing         | `stack.lg`                                                                                        |
| Radius          | `radius.container`, `radius.pill`                                                                 |
| Border width    | `border.default`                                                                                  |
| Sizes           | `icon.lg`                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Effects         | `shadow/raised`                                                                                   |
| Text styles     | `body/md/medium`                                                                                  |

### Composes

- Icon/Plus

### Variant matrix

| state    | size    | fill                 | stroke                | effect          | text                 | icon                   |
| -------- | ------- | -------------------- | --------------------- | --------------- | -------------------- | ---------------------- |
| default  | 240×228 | `color.surface.base` | `color.border.medium` |                 | `color.text.primary` | `color.icon.secondary` |
| hover    | 240×228 | `color.surface.base` | `color.border.subtle` |                 | `color.text.primary` | `color.icon.primary`   |
| selected | 240×228 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary` | `color.icon.primary`   |

## Documentation card

**Description**

A large, selectable card acting as a rich radio or checkbox — title, description and optional icon the user picks from a set. Use Radio/Checkbox for dense lists.

**Anatomy**

Container · optional icon / illustration · title · description · selection indicator (radio / check) · optional badge.

**Variants**

selection=single (radio) / multi (checkbox). With or without icon. Orientation vertical or horizontal.

**States**

default, hover, focus, selected, disabled; error (invalid group). Selected uses border.feedback.focus + surface tint, not colour alone.

**Accessibility**

Native radio/checkbox semantics; the whole card is the label and target. Group with role=radiogroup + a legend. aria-checked reflects selection. Hit area ≥44.

**Rules**

Use for a small set of rich choices  
Show selection with icon + border  
Make the whole card clickable  
Group with a legend

Use for long lists (use Radio)  
Rely on colour for the selected state  
Mix single + multi in one group  
Omit the selection indicator
