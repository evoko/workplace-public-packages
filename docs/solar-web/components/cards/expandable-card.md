# Expandable Card

> SOLAR Web · Figma page `↳ 🟢 Expandable Card` (id `5646:5`) · section `components/cards` · raw data: [`raw/components/cards/expandable-card.json`](../../raw/components/cards/expandable-card.json)

## Component set: Expandable Card

Accordion-style card with clickable header that toggles body visibility.

### Props

| Prop       | Type    | Options / default         |
| ---------- | ------- | ------------------------- |
| `expanded` | variant | **false** · true          |
| `hover`    | variant | **false** · true          |
| `Content`  | slot    | default `[object Object]` |

Default variant: `expanded=false, hover=false` · 4 variants · default size 320×48px

### Anatomy (default variant)

- **expanded=false, hover=false** · component · row gap 12 pad 16/16/16/16 FIXED/HUG · 320×48  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Header** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 288×16  
    itemSpacing `stack.sm`
    - **Title** · text `body/lg/medium` "Label" · FILL/HUG · 260×12  
      fill `color.text.primary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
    - **Icon/ChevronDown** · instance of **Icon/ChevronDown** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                              |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                      |
| Text color      | `color.text.primary`, `color.text.secondary`                                                      |
| Icon color      | `color.icon.primary`                                                                              |
| Spacing         | `inset.md`, `stack.sm`                                                                            |
| Radius          | `radius.container`                                                                                |
| Border width    | `border.default`                                                                                  |
| Sizes           | `icon.sm`                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.lg`, `type.size.body.lg` |
| Effects         | `shadow/raised`                                                                                   |
| Text styles     | `body/lg/medium`                                                                                  |

### Composes

- Icon/ChevronDown

### Variant matrix

| expanded | hover | size   | fill                 | stroke                | effect          | text                                           | icon                 |
| -------- | ----- | ------ | -------------------- | --------------------- | --------------- | ---------------------------------------------- | -------------------- |
| false    | false | 320×48 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`                           | `color.icon.primary` |
| true     | false | 320×70 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary` |
| false    | true  | 320×48 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`                           | `color.icon.primary` |
| true     | true  | 320×70 | `color.surface.base` | `color.border.medium` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary` |

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
