# Checkbox

> SOLAR Web · Figma page `↳ 🟢 Checkbox` (id `2163:3699`) · section `components/inputs` · raw data: [`raw/components/inputs/checkbox.json`](../../raw/components/inputs/checkbox.json)

## Component set: Checkbox

Multi-select box. 12 variants: checked × disabled × hover × mixed × focus, shipped as the used combinations. mixed renders an indeterminate dash — use it on a parent box when some, but not all, children are checked; it keeps the border/medium edge at rest like a checked box. focus combines shadow/focus/default with a border/feedback/focus/strong stroke. No pressed state. Pair with a label or use Option Row. For a single persistent on/off setting use Toggle.

### Props

| Prop       | Type    | Options / default |
| ---------- | ------- | ----------------- |
| `checked`  | variant | **false** · true  |
| `disabled` | variant | **false** · true  |
| `hover`    | variant | **false** · true  |
| `mixed`    | variant | **false** · true  |
| `focus`    | variant | **false** · true  |

Default variant: `checked=false, disabled=false, hover=false, mixed=false, focus=false` · 12 variants · default size 16×16px

### Anatomy (default variant)

- **checked=false, disabled=false, hover=false, mixed=false, focus=false** · component · 16×16  
  stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role         | Tokens                                                                                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.action.primary.bg.default`, `color.action.primary.bg.disabled`, `color.action.primary.bg.hover`, `color.action.secondary.bg.disabled`, `color.action.secondary.bg.hover`, `color.surface.base` |
| Strokes      | `color.border.feedback.focus.strong`, `color.border.medium`, `color.border.subtle`                                                                                                                    |
| Radius       | `radius.control`                                                                                                                                                                                      |
| Border width | `border.default`                                                                                                                                                                                      |
| Effects      | `shadow/focus/default`                                                                                                                                                                                |

### Variant matrix

| checked | disabled | hover | mixed | focus | size  | fill                                 | stroke                               | effect                 | text | icon |
| ------- | -------- | ----- | ----- | ----- | ----- | ------------------------------------ | ------------------------------------ | ---------------------- | ---- | ---- |
| false   | false    | false | false | false | 16×16 |                                      | `color.border.medium`                |                        |      |      |
| false   | false    | true  | false | false | 16×16 | `color.action.secondary.bg.hover`    | `color.border.medium`                |                        |      |      |
| false   | true     | false | false | false | 16×16 | `color.action.secondary.bg.disabled` | `color.border.subtle`                |                        |      |      |
| true    | false    | false | false | false | 16×16 | `color.action.primary.bg.default`    | `color.border.medium`                |                        |      |      |
| true    | false    | true  | false | false | 16×16 | `color.action.primary.bg.hover`      | `color.border.medium`                |                        |      |      |
| true    | true     | false | false | false | 16×16 | `color.action.primary.bg.disabled`   |                                      |                        |      |      |
| true    | false    | false | true  | false | 16×16 | `color.action.primary.bg.default`    | `color.border.medium`                |                        |      |      |
| true    | false    | true  | true  | false | 16×16 | `color.action.primary.bg.hover`      | `color.border.medium`                |                        |      |      |
| true    | true     | false | true  | false | 16×16 | `color.action.primary.bg.disabled`   |                                      |                        |      |      |
| false   | false    | false | false | true  | 16×16 | `color.surface.base`                 | `color.border.feedback.focus.strong` | `shadow/focus/default` |      |      |
| true    | false    | false | false | true  | 16×16 | `color.action.primary.bg.default`    | `color.border.feedback.focus.strong` | `shadow/focus/default` |      |      |
| true    | false    | false | true  | true  | 16×16 | `color.action.primary.bg.default`    | `color.border.feedback.focus.strong` | `shadow/focus/default` |      |      |

## Documentation card

**Description**

Multi-select box for independent choices. Use when the user can pick zero, one, or many from a set (terms, filter facets, select-all-rows). For a single on/off setting, use Toggle. For exclusive one-of-many, use Radio. Commit on click.

**States**

checked=false / checked=true — the two base states.  
mixed=true — indeterminate dash, used on a parent when some children are checked.  
hover=true — transient background on the hit area.  
focus=true — the shared shadow/focus/default effect style plus a border/feedback/focus/strong stroke, so the ring reads at 16px.  
disabled=true — locked value, not-allowed cursor.  
There is no pressed state. 12 variants in total.

**Content**

Pair with a visible label to the right ("I agree to the terms"). The full label is the click target — users should not have to hit the 16px box. Max label width stays within a comfortable reading measure (<75ch). Group related checkboxes with a fieldset + legend pattern.

**Accessibility**

Render as `<input type="checkbox">`. Label via `<label for="">` — clicking the label toggles. aria-checked reflects true/false/mixed. Keyboard: Space toggles; Tab moves focus. Focus ring wraps the full label + box so it's visible even when the box is tiny.

**Rules**

Do  
• Make the full label clickable — not just the box  
• Use mixed on parents when some children are checked  
• Group related checkboxes in a fieldset  
• Commit on click, no confirm step

Don't  
• Don't use for single on/off — that's Toggle  
• Don't use for exclusive choice — that's Radio  
• Don't make the 16px box the only click target  
• Don't rely on color alone for checked state — show the tick
