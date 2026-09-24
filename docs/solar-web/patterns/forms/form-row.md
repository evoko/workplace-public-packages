# Form Row

> SOLAR Web · Figma page `↳ 🟢 Form Row` (id `2202:1227`) · section `patterns/forms` · raw data: [`raw/patterns/forms/form-row.json`](../../raw/patterns/forms/form-row.json)

## Component set: FormRow

FormRow arranges 2, 3, or 4 form controls (TextInput, Select, etc.) in a single horizontal row with equal-width columns and a consistent gap (stack/md). Slots default to TextInput; swap per column for any other control. Collapses to stacked controls under ~640px viewport. Draft — authored by Claude.

### Props

| Prop      | Type    | Options / default |
| --------- | ------- | ----------------- |
| `columns` | variant | **2** · 3 · 4     |

Default variant: `columns=2` · 3 variants · default size 640×76px

### Anatomy (default variant)

- **columns=2** · component · row gap 16 pad 0/0/0/0 FILL/HUG · 640×76  
  itemSpacing `stack.md`
  - **Text Input** · instance of **Text Input** (size=md, state=default) · column gap 8 pad 0/0/0/0 FILL/HUG · 312×76  
    itemSpacing `stack.xs`
  - **Text Input** · instance of **Text Input** (size=md, state=default) · column gap 8 pad 0/0/0/0 FILL/HUG · 312×76  
    itemSpacing `stack.xs`

### Tokens used

| Role       | Tokens                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Text color | `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color | `color.icon.tertiary`                                                                           |
| Spacing    | `stack.md`, `stack.xs`                                                                          |

### Composes

- Text Input

### Variant matrix

| columns | size   | fill | stroke | effect | text                                                                                                  | icon                  |
| ------- | ------ | ---- | ------ | ------ | ----------------------------------------------------------------------------------------------------- | --------------------- |
| 2       | 640×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary` |
| 3       | 640×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary` |
| 4       | 640×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary` |

## Issues detected (page)

- The documentation card's Accessibility section holds the Breadcrumbs page's text; it does not describe this component.

## Documentation card

**FormRow**

**Usage**

FormRow arranges 2, 3, or 4 form controls (TextInput, Select, etc.) in a single horizontal row with equal-width columns and a consistent gap (stack/md). Slots default to TextInput; swap per column for any other control. Collapses to stacked controls under ~640px viewport. Draft — authored by Claude.

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
