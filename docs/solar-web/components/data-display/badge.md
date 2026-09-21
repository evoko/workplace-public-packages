# Badge

> SOLAR Web · Figma page `↳ 🟢 Badge` (id `2163:3659`) · section `components/data-display` · raw data: [`raw/components/data-display/badge.json`](../../raw/components/data-display/badge.json)

## Component set: Trend Badge

Inline trend indicator showing directional change: incline, decline, or neutral. Used in stat cards, table cells, and dashboard metrics.

### Props

| Prop   | Type    | Options / default               |
| ------ | ------- | ------------------------------- |
| `type` | variant | **incline** · decline · neutral |
| `size` | variant | **md** · sm · xs                |

Default variant: `type=incline, size=md` · 9 variants · default size 20×20px

### Anatomy (default variant)

- **type=incline, size=md** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 20×20  
  fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · itemSpacing `stack.none` · strokeWeight `border.default` · radius `radius.pill`
  - **Icon** · vector · FIXED/FIXED · 8×8  
    fill `color.icon.inverse`

### Tokens used

| Role         | Tokens                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills        | `color.icon.feedback.danger`, `color.surface.feedback.danger.strong`, `color.surface.feedback.neutral.strong`, `color.surface.feedback.success.strong` |
| Strokes      | `color.border.medium`                                                                                                                                  |
| Icon color   | `color.icon.inverse`                                                                                                                                   |
| Spacing      | `stack.none`                                                                                                                                           |
| Radius       | `radius.pill`                                                                                                                                          |
| Border width | `border.default`                                                                                                                                       |

### Variant matrix

| type    | size | size  | fill                                    | stroke                | effect | text | icon |
| ------- | ---- | ----- | --------------------------------------- | --------------------- | ------ | ---- | ---- |
| incline | md   | 20×20 | `color.surface.feedback.success.strong` | `color.border.medium` |        |      |      |
| decline | md   | 20×20 | `color.surface.feedback.danger.strong`  | `color.border.medium` |        |      |      |
| neutral | md   | 20×20 | `color.surface.feedback.neutral.strong` | `color.border.medium` |        |      |      |
| incline | sm   | 16×16 | `color.surface.feedback.success.strong` | `color.border.medium` |        |      |      |
| decline | sm   | 16×16 | `color.surface.feedback.danger.strong`  | `color.border.medium` |        |      |      |
| neutral | sm   | 16×16 | `color.surface.feedback.neutral.strong` | `color.border.medium` |        |      |      |
| incline | xs   | 8×8   | `color.surface.feedback.success.strong` | `color.border.medium` |        |      |      |
| decline | xs   | 8×8   | `color.icon.feedback.danger`            | `color.border.medium` |        |      |      |
| neutral | xs   | 8×8   | `color.surface.feedback.neutral.strong` | `color.border.medium` |        |      |      |

## Documentation card

**Description**

Communicates status, category, or a count at a glance. Use for labelling items with semantic meaning — success, warning, danger, info, or neutral. Not for actions (use Button) or navigation (use Link).

**Sub-components**

badge-dot 6×6 status indicator. Used inside badge pill or standalone.  
badge-value Numeric counter pill (20px). Shows selected + danger states.  
badge-trend Directional indicator (20×20). Incline, Decline, or Neutral.  
badge-group Full-width banner. Badge + message text + chevron action.

**Status**

Each status maps to a feedback color pair — tinted background + saturated text/border.  
success (green), warning (orange), danger (red), info (turquoise), offline/neutral (gray).

**Types**

pill Default. Dot + label in a rounded pill. Read-only.  
tag Label + close icon. Removable by user.  
icon Icon-only badge (24×24). Compact action trigger.  
user Avatar + label. Identifies a person with status context.

**Content**

Labels should be 1–2 words: "Active", "Pending", "3 errors". Use sentence case.  
Font is Inter Semi Bold 12px across all badge types.  
Badge-value uses a centered number; keep it short (max 3 digits, then "99+").

**Rules**

- DO: Use semantic status colors consistently
- DO: Keep label text under 2 words
- DO: Use badge-group for actionable status banners
- DO: Pair badge-dot with text labels for accessibility

- DON'T: Use badge as a button — it's non-interactive (except tag)
- DON'T: Mix status colors in one badge
- DON'T: Use color as the sole indicator — always include text
- DON'T: Exceed "99+" in badge-value counters
