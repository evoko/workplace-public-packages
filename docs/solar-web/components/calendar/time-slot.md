# Time Slot

> SOLAR Web · Figma page `↳ 🟢 Time Slot` (id `6622:6`) · section `components/calendar` · raw data: [`raw/components/calendar/time-slot.json`](../../raw/components/calendar/time-slot.json)

## Component set: Time Slot

Empty cell used to tile the Week and Day time grids. Top + left borders so cells visually compose into a grid. Half-hour rule indicates the 30-minute split. Selected state shows a focus-bound border for click-to-create-event.

### Props

| Prop      | Type    | Options / default              |
| --------- | ------- | ------------------------------ |
| `state`   | variant | **default** · hover · selected |
| `density` | variant | **comfortable** · compact      |

Default variant: `state=default, density=comfortable` · 6 variants · default size 160×48px

### Anatomy (default variant)

- **state=default, density=comfortable** · component · FIXED/FIXED · 160×48  
  fill `color.surface.base` · stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
  - **Half-hour rule** · line · 160×0  
    stroke `color.border.subtle` 1px

### Tokens used

| Role         | Tokens                                                                            |
| ------------ | --------------------------------------------------------------------------------- |
| Fills        | `color.surface.base`, `color.surface.feedback.info.subtle`, `color.surface.hover` |
| Strokes      | `color.border.feedback.focus.strong`, `color.border.subtle`                       |
| Border width | `border.default`                                                                  |

### Variant matrix

| state    | density     | size   | fill                                 | stroke                               | effect | text | icon |
| -------- | ----------- | ------ | ------------------------------------ | ------------------------------------ | ------ | ---- | ---- |
| default  | comfortable | 160×48 | `color.surface.base`                 | `color.border.subtle`                |        |      |      |
| hover    | comfortable | 160×48 | `color.surface.hover`                | `color.border.subtle`                |        |      |      |
| selected | comfortable | 160×48 | `color.surface.feedback.info.subtle` | `color.border.feedback.focus.strong` |        |      |      |
| default  | compact     | 160×32 | `color.surface.base`                 | `color.border.subtle`                |        |      |      |
| hover    | compact     | 160×32 | `color.surface.hover`                | `color.border.subtle`                |        |      |      |
| selected | compact     | 160×32 | `color.surface.feedback.info.subtle` | `color.border.feedback.focus.strong` |        |      |      |

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
