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

## Documentation card

**Usage**

Accordion-style card with clickable header that toggles body visibility.

**Anatomy**

Top-level layers of the first variant: Header. Instances keep their SOLAR component names.

**Specification**

4 variants.  
• expanded — false | true  
• hover — false | true  
Props: Content (slot).

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
