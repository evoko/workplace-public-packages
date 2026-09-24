# Weekday Header

> SOLAR Web · Figma page `↳ 🟢 Weekday Header` (id `6622:4`) · section `components/calendar` · raw data: [`raw/components/calendar/weekday-header.json`](../../raw/components/calendar/weekday-header.json)

## Component set: Weekday Header

Column header used at the top of the Month grid and the Week / Day grid. Today emphasis bolds the weekday and tints it with text/feedback/info.

### Props

| Prop       | Type    | Options / default   |
| ---------- | ------- | ------------------- |
| `emphasis` | variant | **default** · today |
| `label`    | text    | default `Mon`       |

Default variant: `emphasis=default` · 2 variants · default size 160×36px

### Anatomy (default variant)

- **emphasis=default** · component · row gap 0 pad 12/12/12/12 FIXED/FIXED · 160×36  
  fill `color.surface.base` · stroke `color.border.surface` mixedpx · padding `inset.sm` · strokeWeight `border.none`, `border.default`
  - **Weekday** · text `label/sm` "Mon" · HUG/HUG · 25×9  
    fill `color.text.secondary` · lineHeight `type.line-height.label.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.label.sm` · fontStyle `type.font-weight.500` · prop characters←label

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                |
| Strokes         | `color.border.surface`                                                                              |
| Text color      | `color.text.feedback.info`, `color.text.secondary`                                                  |
| Spacing         | `inset.sm`                                                                                          |
| Border width    | `border.default`, `border.none`                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.sm`, `type.size.label.sm` |
| Text styles     | `label/sm`                                                                                          |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop    |
| ------- | ------------------- | ------- |
| Weekday | characters          | `label` |

### Variant matrix

| emphasis | size   | fill                 | stroke                 | effect | text                       | icon |
| -------- | ------ | -------------------- | ---------------------- | ------ | -------------------------- | ---- |
| default  | 160×36 | `color.surface.base` | `color.border.surface` |        | `color.text.secondary`     |      |
| today    | 160×36 | `color.surface.base` | `color.border.surface` |        | `color.text.feedback.info` |      |

## Documentation card

**Usage**

Column header used at the top of the Month grid and the Week / Day grid. Today emphasis bolds the weekday and tints it with text/feedback/info.

**Anatomy**

Top-level layers of the first variant: Weekday. Instances keep their SOLAR component names.

**Specification**

2 variants.  
• emphasis — default | today  
Props: label (text).

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
