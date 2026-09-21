# Timestamp

> SOLAR Web · Figma page `↳ 🟢 Timestamp` (id `2966:593`) · section `components/data-display` · raw data: [`raw/components/data-display/timestamp.json`](../../raw/components/data-display/timestamp.json)

## Component set: Timestamp

Renders a point in time as relative ('2 hours ago'), absolute ('Apr 18, 2026, 14:32'), or combined. Use relative for recent events in activity feeds; absolute for records, logs, and audit trails where exact time matters; combined when both are needed (absolute in tooltip, relative in label). Size sm for dense tables; md for card metadata. Emphasis subtle for secondary metadata. Respect user locale and timezone — never hardcode format.

### Props

| Prop       | Type    | Options / default                  |
| ---------- | ------- | ---------------------------------- |
| `format`   | variant | **relative** · absolute · combined |
| `size`     | variant | **sm** · md                        |
| `emphasis` | variant | **default** · subtle               |

Default variant: `format=relative, size=sm, emphasis=default` · 12 variants · default size 55×9px

### Anatomy (default variant)

- **format=relative, size=sm, emphasis=default** · component · row gap 8 pad 0/0/0/0 HUG/HUG · 55×9  
  itemSpacing `stack.xs`
  - **Value** · text `body/sm/medium` "2 min ago" · HUG/HUG · 55×9  
    fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Text color      | `color.text.secondary`, `color.text.tertiary`                                                     |
| Spacing         | `stack.xs`                                                                                        |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm` |
| Text styles     | `body/sm/medium`                                                                                  |

### Variant matrix

| format   | size | emphasis | size  | fill | stroke | effect | text                   | icon |
| -------- | ---- | -------- | ----- | ---- | ------ | ------ | ---------------------- | ---- |
| relative | sm   | default  | 55×9  |      |        |        | `color.text.secondary` |      |
| absolute | sm   | default  | 32×9  |      |        |        | `color.text.secondary` |      |
| combined | sm   | default  | 71×9  |      |        |        | `color.text.secondary` |      |
| relative | sm   | subtle   | 55×9  |      |        |        | `color.text.tertiary`  |      |
| absolute | sm   | subtle   | 32×9  |      |        |        | `color.text.tertiary`  |      |
| combined | sm   | subtle   | 71×9  |      |        |        | `color.text.tertiary`  |      |
| relative | md   | default  | 63×10 |      |        |        | `color.text.secondary` |      |
| absolute | md   | default  | 37×10 |      |        |        | `color.text.secondary` |      |
| combined | md   | default  | 82×10 |      |        |        | `color.text.secondary` |      |
| relative | md   | subtle   | 63×10 |      |        |        | `color.text.tertiary`  |      |
| absolute | md   | subtle   | 37×10 |      |        |        | `color.text.tertiary`  |      |
| combined | md   | subtle   | 82×10 |      |        |        | `color.text.tertiary`  |      |

## Documentation card

**Description**

Point in time displayed as relative, absolute, or combined. Pair with activity feeds, records, logs, and audit trails.

**Formats**

relative '2 hours ago'. For recent activity feeds and live data.  
absolute 'Apr 18, 2026, 14:32'. For records, logs, audits.  
combined Shows both — absolute in tooltip, relative in label.

**Sizes**

sm Dense tables, audit log rows.  
md Card metadata, thread headers, default for activity feeds.

**Emphasis**

default Primary timestamp — top of a thread or row.  
subtle Secondary metadata — 'Last edited' under a title.

**Labels & Content**

Always expose full absolute timestamp in the title attribute or tooltip.  
Use ISO 8601 for machine-readable output.  
Respect user locale and timezone — never hardcode the format.

**Rules**

- DO: Use relative for feeds, absolute for records
- DO: Expose full date/time in tooltip or title
- DO: Use the user's locale and timezone
- DO: Update relative timestamps in real time

- DON'T: Use relative for legal, financial, or audit records
- DON'T: Hardcode 'MM/DD/YYYY' or any single locale format
- DON'T: Show 'N days ago' past 30 days — switch to absolute
- DON'T: Assume server timezone matches user timezone
