# Spinner

> SOLAR Web · Figma page `↳ 🟢 Spinner` (id `2163:3681`) · section `components/feedback` · raw data: [`raw/components/feedback/spinner.json`](../../raw/components/feedback/spinner.json)

## Component set: Spinner

Circular indeterminate loading indicator. 6 variants: size (sm, md, lg) × style (default, inverse) — inverse is for dark and inverse surfaces. Non-interactive. Pair with visually-hidden text or aria-busy on the region it covers; for known progress use Progress Bar, for layout placeholders use Skeleton.

### Props

| Prop    | Type    | Options / default     |
| ------- | ------- | --------------------- |
| `size`  | variant | **sm** · md · lg      |
| `style` | variant | **default** · inverse |

Default variant: `size=sm, style=default` · 6 variants · default size 16×16px

### Anatomy (default variant)

- **size=sm, style=default** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 16×16
  - **SpinnerRing** · frame · FIXED/FIXED · 16×16
    - **Track** · ellipse · 16×16  
      stroke `color.border.subtle` 2px · strokeWeight `border.strong`
    - **Indicator** · vector · 7×5  
      stroke `border.strong` 2px · strokeWeight `border.strong`

### Tokens used

| Role         | Tokens                                 |
| ------------ | -------------------------------------- |
| Strokes      | `color.border.subtle`, `border.strong` |
| Border width | `border.strong`                        |

### Variant matrix

| size | style   | size  | fill | stroke | effect | text | icon |
| ---- | ------- | ----- | ---- | ------ | ------ | ---- | ---- |
| sm   | default | 16×16 |      |        |        |      |      |
| md   | default | 24×24 |      |        |        |      |      |
| lg   | default | 32×32 |      |        |        |      |      |
| sm   | inverse | 16×16 |      |        |        |      |      |
| md   | inverse | 24×24 |      |        |        |      |      |
| lg   | inverse | 32×32 |      |        |        |      |      |

### Issues detected

- Non-color variable bound as a color: `border.strong`.

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
