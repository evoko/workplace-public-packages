# Accordion

> SOLAR Web · Figma page `↳ 🟢 Accordion` (id `2163:3671`) · section `components/cards` · raw data: [`raw/components/cards/accordion.json`](../../raw/components/cards/accordion.json)

## Component set: Accordion

Accordion item — a single collapsible section used within an accordion group. Supports 3 sizes (lg/md/sm), 5 states (default/hover/focus/disabled/skeleton), 2 chevron alignments (start/end), flush mode, and expanded/collapsed states. Based on IBM Carbon v11 Accordion, adapted for SOLAR design system.

### Props

| Prop       | Type    | Options / default              |
| ---------- | ------- | ------------------------------ |
| `state`    | variant | **default** · hover · disabled |
| `expanded` | variant | **false** · true               |
| `content`  | slot    | default `[object Object]`      |

Default variant: `state=default, expanded=false` · 6 variants · default size 400×48px

### Anatomy (default variant)

- **state=default, expanded=false** · component · row gap 8 pad 16/16/16/16 FIXED/HUG · 400×48  
  stroke `color.border.subtle` mixedpx · itemSpacing `inset.xs` · padding `inset.md` · strokeWeight `border.default`
  - **title** · text `body/md/medium` "Label" · FILL/HUG · 344×10  
    fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
  - **Icon/ChevronDown** · instance of **Icon/ChevronDown** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.hover`                                                                             |
| Strokes         | `color.border.subtle`                                                                             |
| Text color      | `color.text.disabled`, `color.text.primary`, `color.text.secondary`                               |
| Icon color      | `color.icon.disabled`, `color.icon.primary`                                                       |
| Spacing         | `inset.md`, `inset.xs`                                                                            |
| Border width    | `border.default`                                                                                  |
| Sizes           | `icon.sm`                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Text styles     | `body/md/medium`                                                                                  |

### Composes

- Icon/ChevronDown

### Variant matrix

| state    | expanded | size    | fill                  | stroke                | effect | text                                           | icon                  |
| -------- | -------- | ------- | --------------------- | --------------------- | ------ | ---------------------------------------------- | --------------------- |
| default  | false    | 400×48  |                       | `color.border.subtle` |        | `color.text.primary`                           | `color.icon.primary`  |
| hover    | false    | 400×48  | `color.surface.hover` | `color.border.subtle` |        | `color.text.primary`                           | `color.icon.primary`  |
| disabled | false    | 400×48  |                       | `color.border.subtle` |        | `color.text.disabled`                          | `color.icon.primary`  |
| default  | true     | 400×114 |                       |                       |        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`  |
| hover    | true     | 400×114 |                       |                       |        | `color.text.primary`<br>`color.text.secondary` | `color.icon.primary`  |
| disabled | true     | 400×114 |                       |                       |        | `color.text.disabled`                          | `color.icon.disabled` |

## Documentation card

**Usage**

Accordion item — a single collapsible section used within an accordion group. Supports 3 sizes (lg/md/sm), 5 states (default/hover/focus/disabled/skeleton), 2 chevron alignments (start/end), flush mode, and expanded/collapsed states. Based on IBM Carbon v11 Accordion, adapted for SOLAR design system.

**Anatomy**

Top-level layers of the first variant: title · Icon/ChevronDown. Instances keep their SOLAR component names.

**Specification**

6 variants.  
• state — default | hover | disabled  
• expanded — false | true  
Props: content (slot).

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
