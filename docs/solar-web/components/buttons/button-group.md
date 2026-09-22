# Button Group

> SOLAR Web · Figma page `↳ 🟢 Button Group` (id `2163:3661`) · section `components/buttons` · raw data: [`raw/components/buttons/button-group.json`](../../raw/components/buttons/button-group.json)

## Component set: Button Group

Container that assembles 2–5 Buttons into a joined row. 3 variants: orientation (horizontal, vertical) × type (regular, full-width) — built combinations: horizontal/regular, vertical/regular, horizontal/full-width. regular sizes to content; full-width stretches buttons to fill the container width (equal widths). All children must share the same prio and size — mixing breaks the visual grouping. For multi-action toolbars with dividers use a Toolbar pattern; for segmented exclusive selection use Segmented Control.

### Props

| Prop           | Type    | Options / default         |
| -------------- | ------- | ------------------------- |
| `orientation`  | variant | **horizontal** · vertical |
| `type`         | variant | **regular** · full-width  |
| `SecondaryCTA` | boolean | default `true`            |
| `Buttons`      | slot    | default `[object Object]` |
| `TertiaryCTA`  | boolean | default `false`           |

Default variant: `orientation=horizontal, type=regular` · 3 variants · default size 455×64px

### Anatomy (default variant)

- **orientation=horizontal, type=regular** · component · row gap 8 pad 12/12/12/12 FILL/HUG · 455×64  
  itemSpacing `inset.xs` · padding `inset.sm`
  - ~~**Button**~~ (hidden by default) · instance of **Button** (size=md, prio=tertiary, state=default, danger=false) · row gap 8 pad 0/12/0/12 FIXED/FIXED · 138×40  
    stroke `color.action.tertiary.border.default` 1px · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control` · prop visible←TertiaryCTA
  - **Button** · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 FILL/FIXED · 212×40  
    fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control` · prop visible←SecondaryCTA
  - **Button** · instance of **Button** (size=md, prio=primary, state=default, danger=false) · row gap 8 pad 0/12/0/12 FILL/FIXED · 212×40  
    fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role         | Tokens                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.action.primary.bg.default`, `color.action.secondary.bg.default`                                                                        |
| Strokes      | `color.action.primary.border.default`, `color.action.secondary.border.default`, `color.action.tertiary.border.default`, `color.border.subtle` |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.default`                              |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`                              |
| Spacing      | `inset.sm`, `inset.xs`                                                                                                                        |
| Radius       | `radius.control`                                                                                                                              |
| Border width | `border.default`                                                                                                                              |
| Effects      | `shadow/control`                                                                                                                              |

### Slots and prop-controlled layers

| Layer  | Controlled property | Prop           |
| ------ | ------------------- | -------------- |
| Button | visible             | `TertiaryCTA`  |
| Button | visible             | `SecondaryCTA` |

### Composes

- Button

### Variant matrix

| orientation | type       | size    | fill | stroke                | effect | text                                                                                                                 | icon                                                                                                                 |
| ----------- | ---------- | ------- | ---- | --------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| horizontal  | regular    | 455×64  |      |                       |        | `color.action.tertiary.text.default`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |
| vertical    | regular    | 455×112 |      |                       |        | `color.action.primary.text.default`<br>`color.action.secondary.text.default`<br>`color.action.tertiary.text.default` | `color.action.primary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.tertiary.icon.default` |
| horizontal  | full-width | 455×48  |      | `color.border.subtle` |        | `color.action.secondary.text.default`<br>`color.action.primary.text.default`                                         | `color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                         |

## Documentation card

**Description**

Joined row of 2–5 related Buttons treated as a single unit. Shared prio and size; shared border treatment. Use for action clusters that belong together (Save / Save as / Discard). For exclusive selection, use Segmented Control. For unrelated actions on a page, keep Buttons standalone with page spacing.

**Variants**

full=false Fit-to-content. Each button sizes to its own label.  
full=true Fill container. All buttons share equal width stretched across the container.

**Composition**

All children must be Buttons from the SOLAR Button set. All children must share the same prio and size — mixing breaks hierarchy and dividers. Max 5 buttons; beyond that switch to a Dropdown / Split Button / Menu pattern.

**Accessibility**

Render as role="group" with an aria-label describing the cluster. Individual buttons keep their own button role. Tab order follows DOM order; do not skip disabled buttons. Divider between buttons is cosmetic — don't rely on it for semantics.

**Rules**

Do  
• Group 2–5 related actions only  
• Share the same prio across all buttons  
• Use full=true when the group spans a container edge  
• Wrap in role="group" with aria-label

Don't  
• Don't mix prio (primary + secondary) inside a group  
• Don't use for exclusive selection — use Segmented Control  
• Don't exceed 5 buttons — collapse into a menu  
• Don't use for toolbars with dividers and overflow — use Toolbar
