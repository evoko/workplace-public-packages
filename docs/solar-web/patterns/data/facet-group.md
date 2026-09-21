# Facet Group

> SOLAR Web · Figma page `↳ 🟢 Facet Group` (id `5113:9`) · section `patterns/data` · raw data: [`raw/patterns/data/facet-group.json`](../../raw/patterns/data/facet-group.json)

## Component: Facet Group

### Anatomy (default variant)

- **Facet Group** · component · row gap 12 pad 0/12/0/12 HUG/FIXED · 518×44  
  itemSpacing `stack.sm` · padding `stack.sm`, `inset.none`
  - **Tag / Status: Active** · instance of **Tag** (status=neutral, type=closable, invert=false) · row gap 4 pad 0/8/0/12 HUG/FIXED · 113×24  
    fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none`, `inset.xs` · strokeWeight `border.default` · radius `radius.pill`
  - **Tag / Owner: Me** · instance of **Tag** (status=neutral, type=closable, invert=false) · row gap 4 pad 0/8/0/12 HUG/FIXED · 97×24  
    fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none`, `inset.xs` · strokeWeight `border.default` · radius `radius.pill`
  - **Tag / Type: Room** · instance of **Tag** (status=neutral, type=closable, invert=false) · row gap 4 pad 0/8/0/12 HUG/FIXED · 102×24  
    fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none`, `inset.xs` · strokeWeight `border.default` · radius `radius.pill`
  - **Button** · instance of **Button** (size=sm, prio=tertiary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 70×32  
    stroke `color.action.tertiary.border.default` 1px · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`
  - **Button** · instance of **Button** (size=sm, prio=tertiary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
    stroke `color.action.tertiary.border.default` 1px · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role         | Tokens                                                        |
| ------------ | ------------------------------------------------------------- |
| Fills        | `color.surface.feedback.neutral.subtle`                       |
| Strokes      | `color.action.tertiary.border.default`, `color.border.medium` |
| Spacing      | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`, `stack.sm` |
| Radius       | `radius.control`, `radius.pill`                               |
| Border width | `border.default`                                              |

### Composes

- Button
- Tag

### Issues detected

- Component description is empty.

## Documentation card

**Description**

A group of related filter facets (a heading plus its options) within a Filter Panel. Composes checkboxes / ranges under one attribute — not a standalone filter.

**Anatomy**

Group heading · collapse toggle · facet options (Checkbox / Radio / range) · optional search · optional 'show more' + selected count.

**Behaviour**

Collapsible. Long option lists get search and 'show more'. A selected count shows on the heading. Feeds the active-filter set.

**States**

expanded / collapsed; options: default, hover, focus, selected, disabled. Group: loaded, loading, empty, no-results (search).

**Accessibility**

Heading is a button controlling the group (aria-expanded). Options grouped with fieldset + legend. Selected count announced. Keyboard operable; visible focus.

**Rules**

Group options under a clear attribute  
Show the selected count on the heading  
Collapse long groups  
Add search past ~10 options

Mix unrelated facets in one group  
Hide the selected count  
Rely on colour for selected  
Reorder options as they're picked
