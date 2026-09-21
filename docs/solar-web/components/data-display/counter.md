# Counter

> SOLAR Web · Figma page `↳ 🟢 Counter` (id `2966:592`) · section `components/data-display` · raw data: [`raw/components/data-display/counter.json`](../../raw/components/data-display/counter.json)

## Component set: Counter

Numeric badge showing count or quantity. Use for notification counts, inbox unread counts, and cart items. Types: regular (neutral), danger (urgent or new), inverted (for dark surfaces and inside primary buttons). Pair with buttons, tabs, and nav items. Hide at count=0; cap long counts at 99+. Note: state=active is legacy — migrate to `pressed` per SOLAR state vocabulary.

### Props

| Prop    | Type    | Options / default                        |
| ------- | ------- | ---------------------------------------- |
| `type`  | variant | **regular** · danger · inverted · idle   |
| `state` | variant | **default** · hover · disabled · pressed |

Default variant: `type=regular, state=default` · 16 variants · default size 25×20px

### Anatomy (default variant)

- **type=regular, state=default** · component · row gap 0 pad 0/8/0/8 HUG/FIXED · 25×20  
  fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · padding `inset.xs` · strokeWeight `border.default` · radius `radius.pill`
  - **0** · text `body/sm/semibold` "0" · HUG/HUG · 9×9  
    fill `color.action.primary.text.default` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.600`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.active`, `color.action.primary.bg.danger.active`, `color.action.primary.bg.danger.default`, `color.action.primary.bg.danger.disabled`, `color.action.primary.bg.danger.hover`, `color.action.primary.bg.default`, `color.action.primary.bg.disabled`, `color.action.primary.bg.hover`, `color.action.secondary.bg.active`, `color.action.secondary.bg.default`, `color.action.secondary.bg.disabled`, `color.action.secondary.bg.hover`                                                                        |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Text color      | `color.action.primary.text.active`, `color.action.primary.text.danger.active`, `color.action.primary.text.danger.default`, `color.action.primary.text.danger.disabled`, `color.action.primary.text.danger.hover`, `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.action.primary.text.hover`, `color.action.secondary.text.active`, `color.action.secondary.text.default`, `color.action.secondary.text.disabled`, `color.action.secondary.text.hover`, `color.text.secondary`, `color.text.tertiary` |
| Spacing         | `inset.xs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Radius          | `radius.pill`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Border width    | `border.default`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Typography vars | `type.font-family.inter`, `type.font-weight.600`, `type.line-height.body.sm`, `type.size.body.sm`                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Text styles     | `body/sm/semibold`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### Variant matrix

| type     | state    | size  | fill                                      | stroke                | effect | text                                        | icon |
| -------- | -------- | ----- | ----------------------------------------- | --------------------- | ------ | ------------------------------------------- | ---- |
| regular  | default  | 25×20 | `color.action.primary.bg.default`         | `color.border.medium` |        | `color.action.primary.text.default`         |      |
| regular  | hover    | 25×20 | `color.action.primary.bg.hover`           | `color.border.medium` |        | `color.action.primary.text.hover`           |      |
| regular  | pressed  | 25×20 | `color.action.primary.bg.active`          | `color.border.medium` |        | `color.action.primary.text.active`          |      |
| regular  | disabled | 25×20 | `color.action.primary.bg.disabled`        | `color.border.medium` |        | `color.action.primary.text.disabled`        |      |
| idle     | default  | 25×20 | `color.action.secondary.bg.default`       | `color.border.subtle` |        | `color.text.tertiary`                       |      |
| idle     | hover    | 25×20 | `color.action.secondary.bg.default`       | `color.border.subtle` |        | `color.text.secondary`                      |      |
| idle     | pressed  | 25×20 | `color.action.secondary.bg.default`       | `color.border.subtle` |        | `color.text.tertiary`                       |      |
| idle     | disabled | 25×20 | `color.action.primary.bg.disabled`        | `color.border.medium` |        | `color.action.primary.text.disabled`        |      |
| danger   | default  | 25×20 | `color.action.primary.bg.danger.default`  | `color.border.medium` |        | `color.action.primary.text.danger.default`  |      |
| danger   | hover    | 25×20 | `color.action.primary.bg.danger.hover`    | `color.border.medium` |        | `color.action.primary.text.danger.hover`    |      |
| danger   | pressed  | 25×20 | `color.action.primary.bg.danger.active`   | `color.border.medium` |        | `color.action.primary.text.danger.active`   |      |
| danger   | disabled | 25×20 | `color.action.primary.bg.danger.disabled` | `color.border.medium` |        | `color.action.primary.text.danger.disabled` |      |
| inverted | default  | 25×20 | `color.action.secondary.bg.default`       | `color.border.medium` |        | `color.action.secondary.text.default`       |      |
| inverted | hover    | 25×20 | `color.action.secondary.bg.hover`         | `color.border.medium` |        | `color.action.secondary.text.hover`         |      |
| inverted | pressed  | 25×20 | `color.action.secondary.bg.active`        | `color.border.medium` |        | `color.action.secondary.text.active`        |      |
| inverted | disabled | 25×20 | `color.action.secondary.bg.disabled`      | `color.border.medium` |        | `color.action.secondary.text.disabled`      |      |

## Documentation card

**Description**

Numeric badge showing count or quantity. Pair with buttons, tabs, nav items, and inbox rows.

**Types**

regular Neutral count. Default for most contexts.  
danger Urgent or unread. For counts demanding attention.  
inverted On dark surfaces and inside primary buttons.

**States**

default, hover, disabled. Note: variant uses legacy `active` — will migrate to `pressed` per SOLAR state vocabulary on next revision.

**Labels & Content**

Whole numbers only. Cap at 99+ or 999+ for long counts.  
Hide counter entirely when count is 0 — never show a literal '0'.  
Use danger only for counts that demand action — not for every unread count.

**Rules**

- DO: Use danger only for true urgency (unread, overdue)
- DO: Hide at count = 0
- DO: Cap overflow as 99+
- DO: Place adjacent to anchor (button, tab)

- DON'T: Show a literal '0'
- DON'T: Use danger type for every notification
- DON'T: Float counter away from its anchor
- DON'T: Use decimals or non-integer values
