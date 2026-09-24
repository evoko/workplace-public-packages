# Divider

> SOLAR Web · Figma page `↳ 🟢 Divider` (id `2202:1220`) · section `components/cards` · raw data: [`raw/components/cards/divider.json`](../../raw/components/cards/divider.json)

## Component set: Divider

Visual separator between content sections. Horizontal (full-width, inset, or with centered label) and vertical orientations. Mirrors Tailwind UI divider patterns.

### Props

| Prop          | Type    | Options / default             |
| ------------- | ------- | ----------------------------- |
| `orientation` | variant | **horizontal** · vertical     |
| `type`        | variant | **full** · inset · with-label |

Default variant: `orientation=horizontal, type=full` · 4 variants · default size 320×1px

### Anatomy (default variant)

- **orientation=horizontal, type=full** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 320×1
  - **Rule** · rectangle · FILL/FIXED · 320×1  
    fill `color.border.subtle`

### Tokens used

| Role       | Tokens                |
| ---------- | --------------------- |
| Fills      | `color.border.subtle` |
| Text color | `color.text.tertiary` |

### Variant matrix

| orientation | type       | size   | fill | stroke | effect | text                  | icon |
| ----------- | ---------- | ------ | ---- | ------ | ------ | --------------------- | ---- |
| horizontal  | full       | 320×1  |      |        |        |                       |      |
| horizontal  | inset      | 320×1  |      |        |        |                       |      |
| horizontal  | with-label | 320×20 |      |        |        | `color.text.tertiary` |      |
| vertical    | full       | 1×32   |      |        |        |                       |      |

## Issues detected (page)

- The documentation card's Accessibility section holds the Breadcrumbs page's text; it does not describe this component.

## Documentation card

**Usage**

Visual separator between content sections. Horizontal (full-width, inset, or with centered label) and vertical orientations. Mirrors Tailwind UI divider patterns.

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
