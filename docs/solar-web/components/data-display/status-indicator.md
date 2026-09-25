# Status Indicator

> SOLAR Web · Figma page `↳ 🟢 Status Indicator` (id `2163:3682`) · section `components/data-display` · raw data: [`raw/components/data-display/status-indicator.json`](../../raw/components/data-display/status-indicator.json)

## Component set: StatusIndicator

Feedback icon (20px) used as a leading element in Alert, Toast, Banner, and form validation messages. Each status maps to a distinct shape: success (checkmark circle), warning (triangle), danger (X circle), info (i circle), neutral (dash circle). See also: Badge / Status for small inline dots in tables and lists.

### Props

| Prop   | Type    | Options / default                                                |
| ------ | ------- | ---------------------------------------------------------------- |
| `type` | variant | **success** · info · warning · danger · neutral · help · private |
| `size` | variant | **md** · sm · xs                                                 |

Default variant: `type=success, size=md` · 21 variants · default size 20×20px

### Anatomy (default variant)

- **type=success, size=md** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 20×20  
  fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · itemSpacing `stack.none` · strokeWeight `border.default` · radius `radius.pill`
  - **inner-path** · vector · FIXED/FIXED · 10×7  
    fill `color.icon.inverse` · effect `shadow/raised`

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.feedback.danger.strong`, `color.surface.feedback.info.strong`, `color.surface.feedback.neutral.strong`, `color.surface.feedback.neutral.subtle`, `color.surface.feedback.success.strong`, `color.surface.feedback.warning.strong`, `color.surface.muted` |
| Strokes      | `color.border.feedback.neutral.subtle`, `color.border.medium`                                                                                                                                                                                                           |
| Icon color   | `color.icon.inverse`                                                                                                                                                                                                                                                    |
| Spacing      | `stack.none`                                                                                                                                                                                                                                                            |
| Radius       | `radius.pill`                                                                                                                                                                                                                                                           |
| Border width | `border.default`                                                                                                                                                                                                                                                        |
| Effects      | `shadow/raised`                                                                                                                                                                                                                                                         |

### Variant matrix

| type    | size | size  | fill                                    | stroke                                 | effect | text | icon |
| ------- | ---- | ----- | --------------------------------------- | -------------------------------------- | ------ | ---- | ---- |
| success | md   | 20×20 | `color.surface.feedback.success.strong` | `color.border.medium`                  |        |      |      |
| success | sm   | 16×16 | `color.surface.feedback.success.strong` | `color.border.medium`                  |        |      |      |
| warning | md   | 20×20 |                                         |                                        |        |      |      |
| warning | sm   | 16×16 |                                         |                                        |        |      |      |
| danger  | md   | 20×20 |                                         |                                        |        |      |      |
| danger  | sm   | 16×16 |                                         |                                        |        |      |      |
| info    | md   | 20×20 |                                         |                                        |        |      |      |
| info    | sm   | 16×16 |                                         |                                        |        |      |      |
| neutral | md   | 20×20 |                                         |                                        |        |      |      |
| help    | md   | 20×20 |                                         |                                        |        |      |      |
| private | md   | 20×20 |                                         |                                        |        |      |      |
| neutral | sm   | 16×16 |                                         |                                        |        |      |      |
| help    | sm   | 16×16 |                                         |                                        |        |      |      |
| private | sm   | 16×16 |                                         |                                        |        |      |      |
| success | xs   | 8×8   | `color.surface.feedback.success.strong` | `color.border.medium`                  |        |      |      |
| warning | xs   | 8×8   | `color.surface.feedback.warning.strong` | `color.border.medium`                  |        |      |      |
| danger  | xs   | 8×8   | `color.surface.feedback.danger.strong`  | `color.border.medium`                  |        |      |      |
| info    | xs   | 8×8   | `color.surface.feedback.info.strong`    | `color.border.medium`                  |        |      |      |
| neutral | xs   | 8×8   | `color.surface.feedback.neutral.strong` | `color.border.medium`                  |        |      |      |
| help    | xs   | 8×8   | `color.surface.feedback.neutral.subtle` | `color.border.feedback.neutral.subtle` |        |      |      |
| private | xs   | 8×8   | `color.surface.muted`                   | `color.border.medium`                  |        |      |      |

## Documentation card

**Description**

Feedback icon (20px) used as leading element in Alert, Toast, Banner, and form validation messages. Shape conveys status independent of color.

**Types**

success Task complete, validation passed. Checkmark in circle.  
danger Error, destructive, or blocked. X in circle.  
warning Caution — reversible issue. Triangle with exclamation.  
info Informational or neutral callout. i in circle.  
neutral Idle or unconfigured. Dash in circle.

**Sizes**

md (20px) Single size. Pairs with body text and standard feedback components.

**Labels & Icons**

Shape carries meaning — never communicate status with color alone.  
Pair with a visible label for screen reader users.  
Use feedback tokens: color.icon.feedback.{type}.

**Rules**

- DO: Use as leading element in Alert, Toast, Banner
- DO: Pair shape with a text label
- DO: Use feedback color tokens (color.icon.feedback.{type})
- DO: Keep at 20px for feedback contexts

- DON'T: Replace Badge / Status in dense tables
- DON'T: Convey status with color alone
- DON'T: Scale below 20px — breaks the shape
- DON'T: Substitute emoji or custom icons
