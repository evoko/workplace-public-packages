# Dialog

> SOLAR Web · Figma page `↳ 🟢 Dialog` (id `2229:5930`) · section `components/dialogs` · raw data: [`raw/components/dialogs/dialog.json`](../../raw/components/dialogs/dialog.json)

## Component set: Dialog

### Props

| Prop               | Type    | Options / default            |
| ------------------ | ------- | ---------------------------- |
| `type`             | variant | wizard · image · **default** |
| `image`            | slot    | default `[object Object]`    |
| `show modal-image` | boolean | default `true`               |
| `content`          | slot    | default `[object Object]`    |
| `title`            | text    | default `Dialog Title`       |

Default variant: `type=default` · 3 variants · default size 480×464px

### Anatomy (default variant)

- **type=default** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 480×464  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`
  - **Header** · frame · column gap 8 pad 8/8/8/8 FILL/HUG · 480×56  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default`
    - **Text** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 464×40
      - **Icon** · frame · row gap 8 pad 0/0/0/0 FIXED/FIXED · 36×36  
        itemSpacing `stack.xs`
        - **Icon/Empty** · instance of **Icon/Empty** (solid=false) · FIXED/FIXED · 12×12  
          height `icon.xs`
      - **Title** · text `title/sm` "Dialog Title" · FILL/HUG · 388×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500` · prop characters←title
      - **Icon Button** · instance of **Icon Button** (size=md, shape=round, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        strokeWeight `border.default` · radius `radius.pill`
  - **content** · slot · column gap 16 pad 20/20/20/20 FILL/FILL · 480×360  
    itemSpacing `stack.md` · padding `inset.lg` · prop slotContentId←content
  - **Button Group** · instance of **Button Group** (orientation=horizontal, type=full-width) · row gap 0 pad 0/0/0/0 FILL/HUG · 480×48  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.none` · strokeWeight `border.default`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills           | `color.surface.dialog`                                                                                                                                                                                       |
| Strokes         | `color.border.subtle`                                                                                                                                                                                        |
| Text color      | `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.action.secondary.text.danger.disabled`, `color.action.secondary.text.default`, `color.text.primary`, `color.text.tertiary` |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.secondary.icon.disabled`, `color.action.tertiary.icon.default`                                                     |
| Spacing         | `inset.lg`, `inset.none`, `inset.xs`, `stack.md`, `stack.xs`                                                                                                                                                 |
| Radius          | `radius.dialog`, `radius.pill`                                                                                                                                                                               |
| Border width    | `border.default`                                                                                                                                                                                             |
| Sizes           | `icon.xs`                                                                                                                                                                                                    |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.sm`, `type.size.title.sm`                                                                                                          |
| Effects         | `shadow/dialog`                                                                                                                                                                                              |
| Text styles     | `title/sm`                                                                                                                                                                                                   |

### Slots and prop-controlled layers

| Layer                 | Controlled property | Prop      |
| --------------------- | ------------------- | --------- |
| Header › Text › Title | characters          | `title`   |
| content               | slotContentId       | `content` |

### Composes

- Button Group
- Icon Button
- Icon/Empty

### Variant matrix

| type    | size    | fill                   | stroke | effect          | text                                                                                                                                                                                                                   | icon                                                                                                                  |
| ------- | ------- | ---------------------- | ------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| default | 480×464 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                                                                                                   | `color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`  |
| image   | 480×452 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                                                                                                   | `color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`  |
| wizard  | 480×464 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.tertiary`<br>`color.action.secondary.text.danger.disabled`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.tertiary.icon.default`<br>`color.action.secondary.icon.disabled`<br>`color.action.primary.icon.default` |

### Issues detected

- Component description is empty.

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
