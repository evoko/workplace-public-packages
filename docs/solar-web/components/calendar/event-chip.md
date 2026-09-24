# Event Chip

> SOLAR Web · Figma page `↳ 🟢 Event Chip` (id `6622:5`) · section `components/calendar` · raw data: [`raw/components/calendar/event-chip.json`](../../raw/components/calendar/event-chip.json)

## Component set: Event Chip

Event chip used in Day Cell, Week/Day grid, and Agenda Row. Subtle = neutral surface with a colored category stripe; solid = full category fill with inverse text. Both densities (md, sm) support all 8 category colors.

### Props

| Prop            | Type    | Options / default                                                    |
| --------------- | ------- | -------------------------------------------------------------------- |
| `category`      | variant | **red** · orange · yellow · green · turquoise · blue · purple · pink |
| `style`         | variant | **subtle** · solid · tinted                                          |
| `title`         | text    | default `Event title`                                                |
| `time`          | text    | default `9:00`                                                       |
| `showTime`      | boolean | default `true`                                                       |
| `showRepeating` | boolean | default `false`                                                      |

Default variant: `category=red, style=subtle` · 24 variants · default size 160×22px

### Anatomy (default variant)

- **category=red, style=subtle** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 160×22  
  radius `radius.none`
  - **Stripe** · rectangle · FIXED/FILL · 3×22  
    fill `color.data.category.01.strong` · radius `radius.pill`
  - **Content** · frame · row gap 4 pad 0/8/0/8 FILL/FILL · 157×22  
    itemSpacing `stack.2xs` · padding `inset.xs`, `inset.none`
    - **Time** · text `body/sm/medium` "9:00" · FIXED/HUG · 36×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500` · prop visible←showTime, characters←time
    - ~~**Icon/Repeat**~~ (hidden by default) · instance of **Icon/Repeat** (solid=false) · FIXED/FIXED · 12×12  
      itemSpacing `stack.xs` · height `icon.xs` · prop visible←showRepeating
    - **Title** · text `body/sm/medium` "Event title" · FILL/FIXED · 101×9  
      fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500` · prop characters←title

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.data.category.01.strong`, `color.data.category.01.subtle`, `color.data.category.02.strong`, `color.data.category.02.subtle`, `color.data.category.03.strong`, `color.data.category.03.subtle`, `color.data.category.04.strong`, `color.data.category.04.subtle`, `color.data.category.05.strong`, `color.data.category.05.subtle`, `color.data.category.06.strong`, `color.data.category.06.subtle`, `color.data.category.07.strong`, `color.data.category.07.subtle`, `color.data.category.08.strong`, `color.data.category.08.subtle` |
| Text color      | `color.text.inverse`, `color.text.primary`, `color.text.secondary`                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Icon color      | `color.icon.inverse`, `color.icon.primary`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Spacing         | `inset.none`, `inset.xs`, `stack.2xs`, `stack.xs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Radius          | `radius.none`, `radius.pill`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Sizes           | `icon.xs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm`                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Text styles     | `body/sm/medium`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### Slots and prop-controlled layers

| Layer                 | Controlled property | Prop            |
| --------------------- | ------------------- | --------------- |
| Content › Time        | visible             | `showTime`      |
| Content › Time        | characters          | `time`          |
| Content › Icon/Repeat | visible             | `showRepeating` |
| Content › Title       | characters          | `title`         |

### Composes

- Icon/Repeat

### Variant matrix

| category  | style  | size   | fill                            | stroke | effect | text                                           | icon                 |
| --------- | ------ | ------ | ------------------------------- | ------ | ------ | ---------------------------------------------- | -------------------- |
| red       | subtle | 160×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| red       | tinted | 160×22 | `color.data.category.01.subtle` |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| red       | solid  | 160×22 | `color.data.category.01.strong` |        |        | `color.text.inverse`                           | `color.icon.inverse` |
| orange    | subtle | 160×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| orange    | tinted | 160×22 | `color.data.category.02.subtle` |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| orange    | solid  | 160×22 | `color.data.category.02.strong` |        |        | `color.text.inverse`                           | `color.icon.inverse` |
| yellow    | subtle | 160×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| yellow    | tinted | 160×22 | `color.data.category.03.subtle` |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| yellow    | solid  | 160×22 | `color.data.category.03.strong` |        |        | `color.text.inverse`                           | `color.icon.inverse` |
| green     | subtle | 160×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| green     | tinted | 160×22 | `color.data.category.04.subtle` |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| green     | solid  | 160×22 | `color.data.category.04.strong` |        |        | `color.text.inverse`                           | `color.icon.inverse` |
| turquoise | subtle | 160×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| turquoise | tinted | 160×22 | `color.data.category.05.subtle` |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| turquoise | solid  | 160×22 | `color.data.category.05.strong` |        |        | `color.text.inverse`                           | `color.icon.inverse` |
| blue      | subtle | 160×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| blue      | tinted | 160×22 | `color.data.category.06.subtle` |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| blue      | solid  | 160×22 | `color.data.category.06.strong` |        |        | `color.text.inverse`                           | `color.icon.inverse` |
| purple    | subtle | 160×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| purple    | tinted | 160×22 | `color.data.category.07.subtle` |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| purple    | solid  | 160×22 | `color.data.category.07.strong` |        |        | `color.text.inverse`                           | `color.icon.inverse` |
| pink      | subtle | 160×22 |                                 |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| pink      | tinted | 160×22 | `color.data.category.08.subtle` |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.primary` |
| pink      | solid  | 160×22 | `color.data.category.08.strong` |        |        | `color.text.inverse`                           | `color.icon.inverse` |

## Documentation card

**Usage**

Event chip used in Day Cell, Week/Day grid, and Agenda Row. Subtle = neutral surface with a colored category stripe; solid = full category fill with inverse text. Both densities (md, sm) support all 8 category colors.

**Anatomy**

Top-level layers of the first variant: Stripe · Content. Instances keep their SOLAR component names.

**Specification**

24 variants.  
• category — red | orange | yellow | green | turquoise | blue | purple | pink  
• style — subtle | solid | tinted  
Props: title (text), time (text), showTime (boolean), showRepeating (boolean).

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
