# Toggle

> SOLAR Web · Figma page `↳ 🟢 Toggle` (id `2163:3711`) · section `components/inputs` · raw data: [`raw/components/inputs/toggle.json`](../../raw/components/inputs/toggle.json)

## Component set: Toggle

Binary on/off switch. 6 variants: selected (false, true) × state (default, hover, disabled). Commits on click — no confirm. Represents persistent state, not a transient action (use Button for the latter). The on/off affordance reads via position AND color so the state is not carried by color alone (WCAG 1.4.1). For two labeled states, use Segmented Control.

### Props

| Prop       | Type    | Options / default              |
| ---------- | ------- | ------------------------------ |
| `selected` | variant | **false** · true               |
| `state`    | variant | **default** · hover · disabled |

Default variant: `selected=false, state=default` · 6 variants · default size 32×18px

### Anatomy (default variant)

- **selected=false, state=default** · component · FIXED/FIXED · 32×18  
  fill `color.surface.muted` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`
  - **Thumb** · ellipse · 12×12  
    fill `color.action.primary.icon.default` · stroke `color.border.subtle` 1px · effect `shadow/control` · strokeWeight `border.default`

### Tokens used

| Role         | Tokens                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills        | `color.action.primary.bg.default`, `color.action.primary.bg.disabled`, `color.action.primary.bg.hover`, `color.action.primary.icon.default`, `color.surface.muted` |
| Strokes      | `color.border.medium`, `color.border.subtle`                                                                                                                       |
| Radius       | `radius.pill`                                                                                                                                                      |
| Border width | `border.default`                                                                                                                                                   |
| Effects      | `shadow/control`                                                                                                                                                   |

### Variant matrix

| selected | state    | size  | fill                               | stroke                | effect | text | icon |
| -------- | -------- | ----- | ---------------------------------- | --------------------- | ------ | ---- | ---- |
| false    | default  | 32×18 | `color.surface.muted`              | `color.border.subtle` |        |      |      |
| false    | hover    | 32×18 | `color.surface.muted`              | `color.border.medium` |        |      |      |
| false    | disabled | 32×18 | `color.surface.muted`              | `color.border.subtle` |        |      |      |
| true     | default  | 32×18 | `color.action.primary.bg.default`  | `color.border.subtle` |        |      |      |
| true     | hover    | 32×18 | `color.action.primary.bg.hover`    | `color.border.medium` |        |      |      |
| true     | disabled | 32×18 | `color.action.primary.bg.disabled` | `color.border.subtle` |        |      |      |

## Documentation card

**Description**

Binary on/off switch for settings, feature flags, and persistent preferences. Commits immediately on click — no confirm step. Use for settings where on and off both make sense as end-states. For two visible labeled options (List/Grid) use Segmented Control; for actions that trigger a side effect use Button.

**States**

selected=false off. Track in surface/muted, thumb at left.  
selected=true on. Track in action/primary/bg/default, thumb at right.  
hover (either selected) track bg shifts; thumb stays.  
disabled (either) opacity/disabled + not-allowed cursor.

**Content**

Always pair with an adjacent label describing what toggling enables ("Email notifications"). Label sits to the left of the track in a form row; state change should be the only delta on click. Don't use 'on'/'off' words next to the toggle — the thumb position carries that.

**Accessibility**

Render as role="switch" with aria-checked (true/false). Labelled-by the text to its left. Keyboard: Space / Enter toggles. Focus ring via shadow/focus/default. State is conveyed by BOTH position and color so users with color-vision differences can parse it.

**Rules**

Do  
• Use for settings with clear on/off end-states  
• Commit on click — don't wait for a Save  
• Label the toggle with what it controls, not its state  
• Use role="switch" with aria-checked

Don't  
• Don't use for actions — those are Buttons  
• Don't rely on color alone — position must also communicate state  
• Don't use for exclusive selection between two labeled options — use Segmented Control  
• Don't hide the label — every toggle needs one
