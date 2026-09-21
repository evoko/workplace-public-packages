# Kbd

> SOLAR Web · Figma page `↳ 🟢 Kbd` (id `5128:2`) · section `components/data-display` · raw data: [`raw/components/data-display/kbd.json`](../../raw/components/data-display/kbd.json)

## Component set: Kbd

Keyboard key label for documenting shortcuts in menus, tooltips, and help content. Variants: default for inline use in text and menus; top-search for keyboard hints inside the global search bar. Pair with a separator (+ or →) for chords: Ctrl + K. Use system-correct modifier symbols per platform (⌘ on macOS, Ctrl on Windows/Linux). One key per Kbd — do not stack multiple keys inside one instance.

### Props

| Prop   | Type    | Options / default        |
| ------ | ------- | ------------------------ |
| `type` | variant | top-search · **default** |

Default variant: `type=default` · 2 variants · default size 28×17px

### Anatomy (default variant)

- **type=default** · component · row gap 0 pad 4/4/4/4 HUG/HUG · 28×17  
  fill `color.surface.feedback.neutral.strong` · stroke `color.border.subtle` 1px · itemSpacing `inset.none` · padding `inset.2xs` · strokeWeight `border.default` · radius `radius.control`
  - **⌘K** · text `body/sm/medium` "⌘K" · HUG/HUG · 20×9  
    fill `color.text.inverse` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.feedback.neutral.medium`, `color.surface.feedback.neutral.strong`                  |
| Strokes         | `color.border.subtle`                                                                             |
| Text color      | `color.text.inverse`                                                                              |
| Spacing         | `inset.2xs`, `inset.none`                                                                         |
| Radius          | `radius.control`                                                                                  |
| Border width    | `border.default`                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm` |
| Text styles     | `body/sm/medium`                                                                                  |

### Variant matrix

| type       | size  | fill                                    | stroke                | effect | text                 | icon |
| ---------- | ----- | --------------------------------------- | --------------------- | ------ | -------------------- | ---- |
| default    | 28×17 | `color.surface.feedback.neutral.strong` | `color.border.subtle` |        | `color.text.inverse` |      |
| top-search | 28×17 | `color.surface.feedback.neutral.medium` | `color.border.subtle` |        | `color.text.inverse` |      |

## Documentation card

**Description**

Keyboard key label for documenting shortcuts. Pair in chords with a separator.

**Variants**

default Inline use in menus, tooltips, and help content.  
top-search Muted style for keyboard hints inside the global search bar.

**Labels & Content**

One key per Kbd. Combine with + for chords: Ctrl + K.  
Use platform-correct modifier symbols: ⌘ Cmd on macOS, Ctrl elsewhere.  
Uppercase letter keys; use symbols for arrows, Enter, Escape.

**Rules**

- DO: One key per Kbd
- DO: Use + or → as the chord separator
- DO: Match platform modifier conventions
- DO: Uppercase letter keys

- DON'T: Stack multiple keys inside one Kbd
- DON'T: Use emoji for keys
- DON'T: Hardcode platform modifiers when both are shown
- DON'T: Use Kbd for mouse or gesture input
