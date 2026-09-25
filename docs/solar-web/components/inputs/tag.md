# Tag

> SOLAR Web · Figma page `↳ 🟢 Tag` (id `2966:583`) · section `components/inputs` · raw data: [`raw/components/inputs/tag.json`](../../raw/components/inputs/tag.json)

## Component set: Tag

Compact label for status, category, or user-entered content. 45 variants: type (status, icon-only, icon+text, closable, text-only) × status (success, neutral, warning, danger, info) × invert (false, true). type=status shows a status dot for read-only state (Active, Pending); on an inverted tag the dot is omitted, since it would match the fill. type=closable is for user-entered tokens with ×; type=icon-only for pure glyph tags. Keep text to 1–3 words.

### Props

| Prop     | Type    | Options / default                                         |
| -------- | ------- | --------------------------------------------------------- |
| `status` | variant | **success** · neutral · warning · danger · info           |
| `type`   | variant | **status** · icon-only · icon+text · closable · text-only |
| `invert` | variant | **false** · true                                          |

Default variant: `status=success, type=status, invert=false` · 45 variants · default size 67×24px

### Anatomy (default variant)

- **status=success, type=status, invert=false** · component · row gap 8 pad 0/12/0/8 HUG/FIXED · 67×24  
  fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
  - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=xs) · FIXED/FIXED · 8×8  
    fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill`
  - **Label** · text `label/sm` "Label" · HUG/HUG · 31×9  
    fill `color.text.feedback.success` · lineHeight `type.line-height.label.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.label.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.feedback.danger.strong`, `color.surface.feedback.danger.subtle`, `color.surface.feedback.info.strong`, `color.surface.feedback.info.subtle`, `color.surface.feedback.neutral.strong`, `color.surface.feedback.neutral.subtle`, `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle`, `color.surface.feedback.warning.strong`, `color.surface.feedback.warning.subtle` |
| Strokes         | `color.border.feedback.danger.subtle`, `color.border.feedback.info.subtle`, `color.border.feedback.success.subtle`, `color.border.feedback.warning.subtle`, `color.border.medium`                                                                                                                                                                                                                                |
| Text color      | `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.inverse`                                                                                                                                                                                                                                      |
| Icon color      | `color.icon.feedback.danger`, `color.icon.feedback.info`, `color.icon.feedback.neutral`, `color.icon.feedback.success`, `color.icon.feedback.warning`, `color.icon.inverse`                                                                                                                                                                                                                                      |
| Spacing         | `inset.none`, `inset.sm`, `inset.xs`                                                                                                                                                                                                                                                                                                                                                                             |
| Radius          | `radius.pill`                                                                                                                                                                                                                                                                                                                                                                                                    |
| Border width    | `border.default`                                                                                                                                                                                                                                                                                                                                                                                                 |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.sm`, `type.size.label.sm`                                                                                                                                                                                                                                                                                                              |
| Text styles     | `label/sm`                                                                                                                                                                                                                                                                                                                                                                                                       |

### Composes

- StatusIndicator

### Variant matrix

| status  | type      | invert | size  | fill                                    | stroke                                 | effect | text                          | icon                          |
| ------- | --------- | ------ | ----- | --------------------------------------- | -------------------------------------- | ------ | ----------------------------- | ----------------------------- |
| success | status    | false  | 67×24 | `color.surface.feedback.success.subtle` | `color.border.feedback.success.subtle` |        | `color.text.feedback.success` |                               |
| success | icon-only | false  | 24×24 | `color.surface.feedback.success.subtle` | `color.border.feedback.success.subtle` |        |                               | `color.icon.feedback.success` |
| success | icon+text | false  | 67×24 | `color.surface.feedback.success.subtle` | `color.border.feedback.success.subtle` |        | `color.text.feedback.success` | `color.icon.feedback.success` |
| success | closable  | false  | 67×24 | `color.surface.feedback.success.subtle` | `color.border.feedback.success.subtle` |        | `color.text.feedback.success` | `color.icon.feedback.success` |
| success | text-only | false  | 55×24 | `color.surface.feedback.success.subtle` | `color.border.feedback.success.subtle` |        | `color.text.feedback.success` |                               |
| success | icon-only | true   | 24×24 | `color.surface.feedback.success.strong` | `color.border.medium`                  |        |                               | `color.icon.inverse`          |
| success | icon+text | true   | 67×24 | `color.surface.feedback.success.strong` | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| success | closable  | true   | 67×24 | `color.surface.feedback.success.strong` | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| success | text-only | true   | 55×24 | `color.surface.feedback.success.strong` | `color.border.medium`                  |        | `color.text.inverse`          |                               |
| warning | status    | false  | 67×24 | `color.surface.feedback.warning.subtle` | `color.border.feedback.warning.subtle` |        | `color.text.feedback.warning` |                               |
| warning | icon-only | false  | 24×24 | `color.surface.feedback.warning.subtle` | `color.border.feedback.warning.subtle` |        |                               | `color.icon.feedback.warning` |
| warning | icon+text | false  | 67×24 | `color.surface.feedback.warning.subtle` | `color.border.feedback.warning.subtle` |        | `color.text.feedback.warning` | `color.icon.feedback.warning` |
| warning | closable  | false  | 67×24 | `color.surface.feedback.warning.subtle` | `color.border.feedback.warning.subtle` |        | `color.text.feedback.warning` | `color.icon.feedback.warning` |
| warning | text-only | false  | 55×24 | `color.surface.feedback.warning.subtle` | `color.border.feedback.warning.subtle` |        | `color.text.feedback.warning` |                               |
| warning | icon-only | true   | 24×24 | `color.surface.feedback.warning.strong` | `color.border.medium`                  |        |                               | `color.icon.inverse`          |
| warning | icon+text | true   | 67×24 | `color.surface.feedback.warning.strong` | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| warning | closable  | true   | 67×24 | `color.surface.feedback.warning.strong` | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| warning | text-only | true   | 55×24 | `color.surface.feedback.warning.strong` | `color.border.medium`                  |        | `color.text.inverse`          |                               |
| danger  | status    | false  | 67×24 | `color.surface.feedback.danger.subtle`  | `color.border.feedback.danger.subtle`  |        | `color.text.feedback.danger`  |                               |
| danger  | icon-only | false  | 24×24 | `color.surface.feedback.danger.subtle`  | `color.border.feedback.danger.subtle`  |        |                               | `color.icon.feedback.danger`  |
| danger  | icon+text | false  | 67×24 | `color.surface.feedback.danger.subtle`  | `color.border.feedback.danger.subtle`  |        | `color.text.feedback.danger`  | `color.icon.feedback.danger`  |
| danger  | closable  | false  | 67×24 | `color.surface.feedback.danger.subtle`  | `color.border.feedback.danger.subtle`  |        | `color.text.feedback.danger`  | `color.icon.feedback.danger`  |
| danger  | text-only | false  | 55×24 | `color.surface.feedback.danger.subtle`  | `color.border.feedback.danger.subtle`  |        | `color.text.feedback.danger`  |                               |
| danger  | icon-only | true   | 24×24 | `color.surface.feedback.danger.strong`  | `color.border.medium`                  |        |                               | `color.icon.inverse`          |
| danger  | icon+text | true   | 67×24 | `color.surface.feedback.danger.strong`  | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| danger  | closable  | true   | 67×24 | `color.surface.feedback.danger.strong`  | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| danger  | text-only | true   | 55×24 | `color.surface.feedback.danger.strong`  | `color.border.medium`                  |        | `color.text.inverse`          |                               |
| info    | status    | false  | 67×24 | `color.surface.feedback.info.subtle`    | `color.border.feedback.info.subtle`    |        | `color.text.feedback.info`    |                               |
| info    | icon-only | false  | 24×24 | `color.surface.feedback.info.subtle`    | `color.border.feedback.info.subtle`    |        |                               | `color.icon.feedback.info`    |
| info    | icon+text | false  | 67×24 | `color.surface.feedback.info.subtle`    | `color.border.feedback.info.subtle`    |        | `color.text.feedback.info`    | `color.icon.feedback.info`    |
| info    | closable  | false  | 67×24 | `color.surface.feedback.info.subtle`    | `color.border.feedback.info.subtle`    |        | `color.text.feedback.info`    | `color.icon.feedback.info`    |
| info    | text-only | false  | 55×24 | `color.surface.feedback.info.subtle`    | `color.border.feedback.info.subtle`    |        | `color.text.feedback.info`    |                               |
| info    | icon-only | true   | 24×24 | `color.surface.feedback.info.strong`    | `color.border.medium`                  |        |                               | `color.icon.inverse`          |
| info    | icon+text | true   | 67×24 | `color.surface.feedback.info.strong`    | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| info    | closable  | true   | 67×24 | `color.surface.feedback.info.strong`    | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| info    | text-only | true   | 55×24 | `color.surface.feedback.info.strong`    | `color.border.medium`                  |        | `color.text.inverse`          |                               |
| neutral | status    | false  | 67×24 | `color.surface.feedback.neutral.subtle` | `color.border.medium`                  |        | `color.text.feedback.neutral` |                               |
| neutral | icon-only | false  | 24×24 | `color.surface.feedback.neutral.subtle` | `color.border.medium`                  |        |                               | `color.icon.feedback.neutral` |
| neutral | icon+text | false  | 67×24 | `color.surface.feedback.neutral.subtle` | `color.border.medium`                  |        | `color.text.feedback.neutral` | `color.icon.feedback.neutral` |
| neutral | closable  | false  | 67×24 | `color.surface.feedback.neutral.subtle` | `color.border.medium`                  |        | `color.text.feedback.neutral` | `color.icon.feedback.neutral` |
| neutral | text-only | false  | 55×24 | `color.surface.feedback.neutral.subtle` | `color.border.medium`                  |        | `color.text.feedback.neutral` |                               |
| neutral | icon-only | true   | 24×24 | `color.surface.feedback.neutral.strong` | `color.border.medium`                  |        |                               | `color.icon.inverse`          |
| neutral | icon+text | true   | 67×24 | `color.surface.feedback.neutral.strong` | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| neutral | closable  | true   | 67×24 | `color.surface.feedback.neutral.strong` | `color.border.medium`                  |        | `color.text.inverse`          | `color.icon.inverse`          |
| neutral | text-only | true   | 55×24 | `color.surface.feedback.neutral.strong` | `color.border.medium`                  |        | `color.text.inverse`          |                               |

## Documentation card

**Usage**

Compact label for status, category, or user-entered content. Keep text to 1–3 words.

**Status**

Neutral · Info · Success · Warning · Danger — colour-coded meaning, always paired with text (never colour alone).

**Type**

Status · Text-only · Icon+text · Icon-only · Closable. Invert for use on strong or coloured surfaces.

**Usage**

Use for categories, states, and metadata. Keep labels to 1–2 words. Make closable only when removal is meaningful.

**Accessibility**

Convey status with text or an icon, never colour alone. A closable tag’s remove control is a labelled, keyboard-reachable button.

**Rules**

- DO: Keep text to 1–3 words.

- DON'T: detach the instance or override its tokens locally — request a change through governance instead.
