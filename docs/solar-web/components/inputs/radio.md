# Radio

> SOLAR Web · Figma page `↳ 🟢 Radio` (id `2163:3702`) · section `components/inputs` · raw data: [`raw/components/inputs/radio.json`](../../raw/components/inputs/radio.json)

## Component set: Radio

Single-select from a group of 2–5 options. 8 variants: state (default, hover, focus, disabled) × checked (true, false). Used only as part of a group — a solo radio is a bug, and one option is always selected. disabled uses border/disabled on a surface/muted fill so it reads as unavailable. focus combines shadow/focus/default with a border/feedback/focus/strong stroke. No pressed state. Pair with a label, or use Option Row. For 6+ options use Select; for a yes/no setting use Toggle.

### Props

| Prop      | Type    | Options / default                      |
| --------- | ------- | -------------------------------------- |
| `state`   | variant | disabled · **default** · hover · focus |
| `checked` | variant | **true** · false                       |

Default variant: `state=default, checked=true` · 8 variants · default size 18×18px

### Anatomy (default variant)

- **state=default, checked=true** · component · 18×18  
  stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`
  - **Icon** · vector · 10×10  
    fill `color.icon.primary`

### Tokens used

| Role         | Tokens                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.background`, `color.surface.base`, `color.surface.muted`                                     |
| Strokes      | `color.border.disabled`, `color.border.feedback.focus.strong`, `color.border.medium`, `color.border.subtle` |
| Icon color   | `color.icon.primary`                                                                                        |
| Radius       | `radius.pill`                                                                                               |
| Border width | `border.default`                                                                                            |
| Effects      | `shadow/focus/default`                                                                                      |

### Variant matrix

| state    | checked | size  | fill                       | stroke                               | effect                 | text | icon |
| -------- | ------- | ----- | -------------------------- | ------------------------------------ | ---------------------- | ---- | ---- |
| default  | true    | 18×18 |                            | `color.border.subtle`                |                        |      |      |
| hover    | true    | 18×18 |                            | `color.border.medium`                |                        |      |      |
| disabled | true    | 18×18 |                            | `color.border.medium`                |                        |      |      |
| default  | false   | 18×18 |                            | `color.border.medium`                |                        |      |      |
| hover    | false   | 18×18 | `color.surface.background` | `color.border.medium`                |                        |      |      |
| disabled | false   | 18×18 | `color.surface.muted`      | `color.border.disabled`              |                        |      |      |
| focus    | true    | 18×18 | `color.surface.base`       | `color.border.feedback.focus.strong` | `shadow/focus/default` |      |      |
| focus    | false   | 18×18 | `color.surface.base`       | `color.border.feedback.focus.strong` | `shadow/focus/default` |      |      |

## Documentation card

**Description**

Exclusive single-select from a group of 2–5 options. Always used as part of a radio group — a lone radio is a bug. One option always selected. Use when all options benefit from being visible simultaneously. For 6+ options use Select; for yes/no use Toggle; for multi-select use Checkbox.

**States**

state=default / hover / focus / disabled × checked=true / false  
Hover highlights the radio and label; it does not change selection.  
Focus combines the shared shadow/focus/default effect style with a border/feedback/focus/strong stroke on the control itself — not a ring around the whole row.  
Disabled locks the selection and greys the entire row.  
There is no pressed state. 8 variants in total.

**Content**

Pair with a label to the right of every radio. The full label is the click target. Optional helper text per option sits below the label, at a lighter color weight. Keep label grammar parallel across the group ("Standard / Express / Priority", not "Standard / Express shipping / Use priority").

**Accessibility**

Render as `<input type="radio">` with shared name= across the group. Wrap in fieldset + legend to label the group. Keyboard: Tab enters the group; ↑/↓ or ←/→ moves between radios (selection follows focus); Space/Enter confirms. aria-checked reflects state.

**Behavior**

Clicking any unselected radio selects it and deselects the previous choice. Selection cannot be cleared — one option must always be active. Pre-select the most common or safest default.

**Grouping**

Wrap radio options in a fieldset with a legend. Stack vertically for scannability.  
Horizontal layout only for 2–3 very short options ("Yes / No", "On / Off").

**Rules**

Do  
• Use fieldset + legend to label the group  
• Always pre-select a sensible default  
• Keep group sizes small — 2–5 options  
• Pair each radio with a clickable label

Don't  
• Don't use a solo radio — it's meaningless  
• Don't skip a default — radios always have one selected  
• Don't use for > ~6 options — use Select instead  
• Don't mix radios and checkboxes in the same group
