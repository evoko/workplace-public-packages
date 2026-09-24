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

## Documentation card

**Usage**

Empty cell used to tile the Week and Day time grids. Top + left borders so cells visually compose into a grid. Half-hour rule indicates the 30-minute split. Selected state shows a focus-bound border for click-to-create-event.

**Anatomy**

Top-level layers of the first variant: Half-hour rule. Instances keep their SOLAR component names.

**Specification**

6 variants.  
• state — default | hover | selected  
• density — comfortable | compact

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
