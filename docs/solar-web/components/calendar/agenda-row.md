# Agenda Row

> SOLAR Web · Figma page `↳ 🟢 Agenda Row` (id `6622:11`) · section `components/calendar` · raw data: [`raw/components/calendar/agenda-row.json`](../../raw/components/calendar/agenda-row.json)

## Component set: Agenda Row

List-style row used in the Agenda view and as a denser alternative to Day Cell. Comfortable density shows start time, end time, title, and a metadata line; compact collapses to a single time range and title only. Category dot color is bound to data/category and should match the source event.

### Props

| Prop      | Type    | Options / default              |
| --------- | ------- | ------------------------------ |
| `state`   | variant | **default** · hover · selected |
| `density` | variant | **comfortable** · compact      |
| `title`   | text    | default `Team standup`         |

Default variant: `state=default, density=comfortable` · 6 variants · default size 560×64px

### Anatomy (default variant)

- **state=default, density=comfortable** · component · row gap 16 pad 16/16/16/16 FIXED/FIXED · 560×64  
  fill `color.surface.base` · stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default`
  - **Time** · frame · column gap 8 pad 0/0/0/0 FIXED/HUG · 36×27  
    itemSpacing `stack.xs`
    - **Start** · text `body/md/semibold` "9:00" · HUG/HUG · 31×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.600`
    - **End** · text `body/sm/regular` "10:00" · HUG/HUG · 31×9  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Dot** · ellipse · FIXED/FIXED · 8×8  
    fill `color.data.category.06.strong`
  - **Body** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 404×27  
    itemSpacing `stack.xs`
    - **Title** · text `body/md/semibold` "Team standup" · FILL/FIXED · 404×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.600` · prop characters←title
    - **Meta** · text `body/sm/regular` "Conference room A · 6 attendees" · FILL/FIXED · 404×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
  - **Attendee** · instance of **Avatar** (size=md, type=text, color=purple, shade=Light) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
    fill `color.purple.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.data.category.06.strong`, `color.surface.active`, `color.surface.base`, `color.surface.hover`, `color.purple.50`                                                    |
| Strokes         | `color.border.subtle`                                                                                                                                                      |
| Text color      | `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.purple.700`                                                                                    |
| Spacing         | `inset.md`, `stack.md`, `stack.xs`                                                                                                                                         |
| Radius          | `radius.pill`                                                                                                                                                              |
| Border width    | `border.default`                                                                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.600`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.size.body.md`, `type.size.body.sm` |
| Text styles     | `body/md/semibold`, `body/sm/regular`                                                                                                                                      |

### Slots and prop-controlled layers

| Layer        | Controlled property | Prop    |
| ------------ | ------------------- | ------- |
| Body › Title | characters          | `title` |

### Composes

- Avatar

### Variant matrix

| state    | density     | size   | fill                   | stroke                | effect | text                                                                                          | icon |
| -------- | ----------- | ------ | ---------------------- | --------------------- | ------ | --------------------------------------------------------------------------------------------- | ---- |
| default  | comfortable | 560×64 | `color.surface.base`   | `color.border.subtle` |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.secondary`<br>`color.purple.700` |      |
| hover    | comfortable | 560×64 | `color.surface.hover`  | `color.border.subtle` |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.secondary`<br>`color.purple.700` |      |
| selected | comfortable | 560×64 | `color.surface.active` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.secondary`<br>`color.purple.700` |      |
| default  | compact     | 560×32 | `color.surface.base`   | `color.border.subtle` |        | `color.text.primary`                                                                          |      |
| hover    | compact     | 560×32 | `color.surface.hover`  | `color.border.subtle` |        | `color.text.primary`                                                                          |      |
| selected | compact     | 560×32 | `color.surface.active` | `color.border.subtle` |        | `color.text.primary`                                                                          |      |

### Issues detected

- Primitive color bound directly (CLR-002): `color.purple.50`, `color.purple.700`.

## Documentation card

**Description**

A single event row in the list-style Agenda view — time, title and meta on one line. For linear day / upcoming lists; use Event Chip in grid views.

**Anatomy**

Time / range · category colour dot · title · optional location / attendees meta · optional trailing action.

**Variants**

timed / all-day; with / without meta; density comfortable or compact.

**States**

default, hover, focus, selected, disabled; plus past (de-emphasised) and now (emphasised).

**Accessibility**

The row is one focusable item; the title is its label, time + meta are supporting. Category = dot + text, not colour alone. Hit area ≥44; text ≥4.5:1.

**Rules**

Lead with the time  
Pair category colour with a label  
Keep one row per event  
De-emphasise past events

Rely on colour alone for category  
Wrap to many lines  
Bury the title  
Use in grid views (use Event Chip)
