# All-Day Bar

> SOLAR Web · Figma page `↳ 🟢 All-Day Bar` (id `6622:8`) · section `components/calendar` · raw data: [`raw/components/calendar/all-day-bar.json`](../../raw/components/calendar/all-day-bar.json)

## Component set: All-Day Bar

Spanning event bar used in the all-day row at the top of the Week / Day grid, and for multi-day events that span columns in the Month grid. Span variants control the corner radii so consecutive segments can fuse into a single bar across columns.

### Props

| Prop       | Type    | Options / default                 |
| ---------- | ------- | --------------------------------- |
| `style`    | variant | **subtle** · solid                |
| `span`     | variant | **single** · start · middle · end |
| `title`    | text    | default `Conference week`         |
| `time`     | text    | default `All day`                 |
| `showTime` | boolean | default `true`                    |

Default variant: `style=subtle, span=single` · 8 variants · default size 160×22px

### Anatomy (default variant)

- **style=subtle, span=single** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 160×22  
  radius `radius.none`
  - **Stripe** · rectangle · FIXED/FILL · 3×22  
    fill `color.data.category.06.strong` · radius `radius.pill`
  - **Content** · frame · row gap 8 pad 0/12/0/12 FILL/FILL · 157×22  
    itemSpacing `stack.xs` · padding `inset.sm`, `inset.none`
    - **Time** · text `body/sm/medium` "All day" · HUG/HUG · 38×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500` · prop visible←showTime, characters←time
    - **Title** · text `body/sm/medium` "Conference week" · FILL/FIXED · 87×9  
      fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500` · prop characters←title

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.data.category.06.strong`                                                                   |
| Text color      | `color.text.inverse`, `color.text.primary`, `color.text.secondary`                                |
| Spacing         | `inset.none`, `inset.sm`, `stack.xs`                                                              |
| Radius          | `radius.none`, `radius.pill`                                                                      |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm` |
| Text styles     | `body/sm/medium`                                                                                  |

### Slots and prop-controlled layers

| Layer           | Controlled property | Prop       |
| --------------- | ------------------- | ---------- |
| Content › Time  | visible             | `showTime` |
| Content › Time  | characters          | `time`     |
| Content › Title | characters          | `title`    |

### Variant matrix

| style  | span   | size   | fill                            | stroke | effect | text                                           | icon |
| ------ | ------ | ------ | ------------------------------- | ------ | ------ | ---------------------------------------------- | ---- |
| subtle | single | 160×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` |      |
| subtle | start  | 200×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` |      |
| subtle | middle | 240×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` |      |
| subtle | end    | 200×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` |      |
| solid  | single | 160×22 | `color.data.category.06.strong` |        |        | `color.text.inverse`                           |      |
| solid  | start  | 200×22 | `color.data.category.06.strong` |        |        | `color.text.inverse`                           |      |
| solid  | middle | 240×22 | `color.data.category.06.strong` |        |        | `color.text.inverse`                           |      |
| solid  | end    | 200×22 | `color.data.category.06.strong` |        |        | `color.text.inverse`                           |      |

## Documentation card

**Description**

The horizontal lane above the time grid holding all-day and multi-day events in day / week views. Distinct from timed Event Chips.

**Anatomy**

Lane container · all-day event chips (may span days) · overflow '+n more' · optional collapse toggle.

**Behaviour**

Events span across day columns. When the lane overflows it collapses with a '+n more' affordance. Height grows with stacked events up to a cap.

**States**

default (loaded), empty (collapsed / hidden), overflow. Event chips inside carry their own hover / focus / selected states.

**Accessibility**

Expose as a region labelled 'All day'. Multi-day spans announce start–end. Chips are keyboard-focusable; overflow opens a list. Contrast per Event Chip.

**Rules**

Separate all-day from timed events  
Show multi-day spans clearly  
Collapse overflow with '+n more'  
Cap the lane height

Mix all-day into the time grid  
Hide events with no overflow cue  
Rely on colour alone for category  
Let the lane grow unbounded
