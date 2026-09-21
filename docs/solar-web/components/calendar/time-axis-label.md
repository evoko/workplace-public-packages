# Time Axis Label

> SOLAR Web · Figma page `↳ 🟢 Time Axis Label` (id `6622:7`) · section `components/calendar` · raw data: [`raw/components/calendar/time-axis-label.json`](../../raw/components/calendar/time-axis-label.json)

## Component set: Time Axis Label

Hour marker on the left rail of the Week or Day time grid. Sits between rows so the label aligns to the top of each hour Time Slot. Now emphasis bolds and tints the marker with text/feedback/info to indicate the current hour.

### Props

| Prop       | Type    | Options / default         |
| ---------- | ------- | ------------------------- |
| `emphasis` | variant | **default** · now         |
| `density`  | variant | **comfortable** · compact |
| `label`    | text    | default `9 AM`            |

Default variant: `emphasis=default, density=comfortable` · 4 variants · default size 56×48px

### Anatomy (default variant)

- **emphasis=default, density=comfortable** · component · row gap 0 pad 0/12/0/12 FIXED/FIXED · 56×48  
  fill `color.surface.base` · padding `inset.sm`
  - **Hour** · text "9 AM" · HUG/HUG · 25×7  
    fill `color.text.tertiary` · lineHeight `type.line-height.caption.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.caption.xs` · prop characters←label

### Tokens used

| Role            | Tokens                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                            |
| Text color      | `color.text.feedback.info`, `color.text.tertiary`                               |
| Spacing         | `inset.sm`                                                                      |
| Typography vars | `type.font-family.inter`, `type.line-height.caption.xs`, `type.size.caption.xs` |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop    |
| ----- | ------------------- | ------- |
| Hour  | characters          | `label` |

### Variant matrix

| emphasis | density     | size  | fill                 | stroke | effect | text                       | icon |
| -------- | ----------- | ----- | -------------------- | ------ | ------ | -------------------------- | ---- |
| default  | comfortable | 56×48 | `color.surface.base` |        |        | `color.text.tertiary`      |      |
| now      | comfortable | 56×48 | `color.surface.base` |        |        | `color.text.feedback.info` |      |
| default  | compact     | 56×32 | `color.surface.base` |        |        | `color.text.tertiary`      |      |
| now      | compact     | 56×32 | `color.surface.base` |        |        | `color.text.feedback.info` |      |

## Documentation card

**Description**

The hour / time markers running down the time axis of a day or week calendar. Aligns rows to Time Slots. Non-interactive.

**Anatomy**

Time text (e.g. 09:00) · optional AM/PM · alignment to the slot gridline.

**Format & Scale**

12h or 24h per locale. One label per hour, or per configured interval. Uses text.secondary, right-aligned to the axis edge.

**States**

Non-interactive (Class K). The current hour may be emphasised (text.primary) alongside the Now indicator.

**Accessibility**

Labels are the accessible time reference for slots — expose via aria on the grid. Text ≥4.5:1. Respect the locale's time format and 24h setting.

**Rules**

Match the locale time format  
Align to the slot gridline  
One label per interval  
Emphasise the current hour subtly

Mix 12h and 24h  
Crowd sub-hour labels  
Use it as an interactive control  
Hard-code AM/PM
