# Tabs

> SOLAR Web · Figma page `↳ 🟢 Tabs` (id `2163:3714`) · section `components/navigation` · raw data: [`raw/components/navigation/tabs.json`](../../raw/components/navigation/tabs.json)

## Component set: Tab Item

Single tab inside a Tabs strip. 10 variants: size (sm 32px, md 40px) × state (default, hover, selected, focus, disabled). selected is the currently routed tab (aria-selected, persistent), not a press flash. Drawn heights are the visible control; the 44×44px WCAG hit area is padded in code (no target-size variable exists yet). Props: label (text), show leading icon, show trailing icon, show counter (Badge). Use only inside Tabs.

### Props

| Prop                 | Type    | Options / default                                 |
| -------------------- | ------- | ------------------------------------------------- |
| `size`               | variant | sm · **md**                                       |
| `state`              | variant | **default** · hover · disabled · selected · focus |
| `label`              | text    | default `Tab`                                     |
| `show leading icon`  | boolean | default `true`                                    |
| `show trailing icon` | boolean | default `true`                                    |
| `show counter`       | boolean | default `true`                                    |

Default variant: `size=md, state=default` · 10 variants · default size 138×40px

### Anatomy (default variant)

- **size=md, state=default** · component · row gap 8 pad 12/16/12/16 HUG/FIXED · 138×40  
  itemSpacing `stack.xs` · padding `inset.md`, `inset.sm`
  - **LeadingIcon** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm` · prop visible←show leading icon
  - **Label** · text `body/md/medium` "Tab" · HUG/HUG · 25×10  
    fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←label
  - **TrailingIcon** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm` · prop visible←show trailing icon
  - **Counter** · instance of **Counter** (type=idle, state=default) · row gap 0 pad 0/8/0/8 HUG/FIXED · 25×20  
    fill `color.action.secondary.bg.default` · stroke `color.border.subtle` 1px · padding `inset.xs` · strokeWeight `border.default` · radius `radius.pill` · prop visible←show counter

### Tokens used

| Role            | Tokens                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.default`                                                                                             |
| Strokes         | `color.border.strong`, `color.border.subtle`                                                                                    |
| Text color      | `color.action.primary.text.default`, `color.text.disabled`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color      | `color.icon.disabled`, `color.icon.primary`, `color.icon.secondary`                                                             |
| Spacing         | `inset.md`, `inset.sm`, `inset.xs`, `stack.xs`                                                                                  |
| Radius          | `radius.pill`                                                                                                                   |
| Border width    | `border.default`                                                                                                                |
| Sizes           | `icon.sm`                                                                                                                       |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`                               |
| Effects         | `shadow/focus/default`                                                                                                          |
| Text styles     | `body/md/medium`                                                                                                                |

### Slots and prop-controlled layers

| Layer        | Controlled property | Prop                 |
| ------------ | ------------------- | -------------------- |
| LeadingIcon  | visible             | `show leading icon`  |
| Label        | characters          | `label`              |
| TrailingIcon | visible             | `show trailing icon` |
| Counter      | visible             | `show counter`       |

### Composes

- Counter
- Icon/None

### Variant matrix

| size | state    | size   | fill | stroke                | effect                 | text                                                         | icon                   |
| ---- | -------- | ------ | ---- | --------------------- | ---------------------- | ------------------------------------------------------------ | ---------------------- |
| md   | default  | 138×40 |      |                       |                        | `color.text.secondary`<br>`color.text.tertiary`              | `color.icon.secondary` |
| sm   | default  | 118×32 |      |                       |                        | `color.text.secondary`<br>`color.text.tertiary`              | `color.icon.secondary` |
| md   | hover    | 138×40 |      |                       |                        | `color.text.primary`<br>`color.text.tertiary`                | `color.icon.primary`   |
| sm   | hover    | 118×32 |      |                       |                        | `color.text.primary`<br>`color.text.tertiary`                | `color.icon.primary`   |
| md   | selected | 138×40 |      | `color.border.strong` |                        | `color.text.primary`<br>`color.action.primary.text.default`  | `color.icon.primary`   |
| sm   | selected | 118×32 |      | `color.border.strong` |                        | `color.text.primary`<br>`color.action.primary.text.default`  | `color.icon.primary`   |
| md   | focus    | 138×40 |      | `color.border.strong` | `shadow/focus/default` | `color.text.primary`<br>`color.action.primary.text.default`  | `color.icon.primary`   |
| sm   | focus    | 118×32 |      | `color.border.strong` | `shadow/focus/default` | `color.text.primary`<br>`color.action.primary.text.default`  | `color.icon.primary`   |
| md   | disabled | 138×40 |      |                       |                        | `color.text.disabled`<br>`color.action.primary.text.default` | `color.icon.disabled`  |
| sm   | disabled | 118×32 |      |                       |                        | `color.text.disabled`<br>`color.action.primary.text.default` | `color.icon.disabled`  |

## Component set: Tabs

Horizontal tab strip that switches between 2–7 peer views under the same context. 2 variants: size (sm 32px, md 40px). Tabs is a slot for Tab Item instances. role=tablist; arrow keys move focus and aria-selected marks the current tab. For ordered flows use Stepper or Page Navigator; for 2–5 inline view toggles inside a form use Segmented Control.

### Props

| Prop   | Type    | Options / default         |
| ------ | ------- | ------------------------- |
| `size` | variant | md · **sm**               |
| `Tabs` | slot    | default `[object Object]` |

Default variant: `size=sm` · 2 variants · default size 456×32px

### Anatomy (default variant)

- **size=sm** · component · row gap 0 pad 0/0/0/0 FILL/HUG · 456×32  
  stroke `color.border.subtle` mixedpx · padding `inset.none` · strokeWeight `border.default`
  - **Tabs** · slot · row gap 0 pad 0/0/0/0 HUG/HUG · 360×32  
    prop slotContentId←Tabs
    - **Tab Item** · instance of **Tab Item** (size=sm, state=selected) · row gap 8 pad 8/12/8/12 HUG/FIXED · 45×32  
      stroke `color.border.strong` mixedpx · itemSpacing `stack.xs` · padding `inset.sm`, `inset.xs` · strokeWeight `border.strong`
    - **Tab Item** · instance of **Tab Item** (size=sm, state=default) · row gap 8 pad 8/12/8/12 HUG/FIXED · 45×32  
      itemSpacing `stack.xs` · padding `inset.sm`, `inset.xs`
    - **Tab Item** · instance of **Tab Item** (size=sm, state=default) · row gap 8 pad 8/12/8/12 HUG/FIXED · 45×32  
      itemSpacing `stack.xs` · padding `inset.sm`, `inset.xs`
    - **Tab Item** · instance of **Tab Item** (size=sm, state=default) · row gap 8 pad 8/12/8/12 HUG/FIXED · 45×32  
      itemSpacing `stack.xs` · padding `inset.sm`, `inset.xs`
    - **Tab Item** · instance of **Tab Item** (size=sm, state=default) · row gap 8 pad 8/12/8/12 HUG/FIXED · 45×32  
      itemSpacing `stack.xs` · padding `inset.sm`, `inset.xs`
    - **Tab Item** · instance of **Tab Item** (size=sm, state=default) · row gap 8 pad 8/12/8/12 HUG/FIXED · 45×32  
      itemSpacing `stack.xs` · padding `inset.sm`, `inset.xs`
    - **Tab Item** · instance of **Tab Item** (size=sm, state=default) · row gap 8 pad 8/12/8/12 HUG/FIXED · 45×32  
      itemSpacing `stack.xs` · padding `inset.sm`, `inset.xs`
    - **Tab Item** · instance of **Tab Item** (size=sm, state=default) · row gap 8 pad 8/12/8/12 HUG/FIXED · 45×32  
      itemSpacing `stack.xs` · padding `inset.sm`, `inset.xs`

### Tokens used

| Role         | Tokens                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| Strokes      | `color.border.strong`, `color.border.subtle`                                                             |
| Text color   | `color.action.primary.text.default`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.icon.primary`, `color.icon.secondary`                                                             |
| Spacing      | `inset.none`, `inset.sm`, `inset.xs`, `stack.xs`                                                         |
| Border width | `border.default`, `border.strong`                                                                        |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop   |
| ----- | ------------------- | ------ |
| Tabs  | slotContentId       | `Tabs` |

### Composes

- Tab Item

### Variant matrix

| size | size   | fill | stroke                | effect | text                                                                                                           | icon                                           |
| ---- | ------ | ---- | --------------------- | ------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| sm   | 456×32 |      | `color.border.subtle` |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.text.secondary`<br>`color.text.tertiary` | `color.icon.primary`<br>`color.icon.secondary` |
| md   | 456×40 |      | `color.border.subtle` |        | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.text.secondary`<br>`color.text.tertiary` | `color.icon.primary`<br>`color.icon.secondary` |

## Documentation card

**Sizes**

sm (36px) Dense contexts: side panels, inspector tabs, nested tab strips.  
md (44px) Default. Page-level primary tabs and main content tabs.

**States (⚠ rename pending)**

default resting, label in color/text/secondary.  
hover hover lift, text shifts to primary.  
active currently-routed tab (persistent) — NOT the mouse-down flash. Flagged to rename to `selected` for clarity.  
focused focus ring via shadow/focus/default. Flagged to rename to `focus` to match SOLAR's locked state vocabulary.  
disabled tab unavailable; skip on Tab key.

**Content**

Labels: noun phrase or section name, title case, 1–2 words preferred. Optional leading icon for recognition in icon-heavy products. Optional trailing counter Badge to show quantity (Comments 12). Don't overload with both trailing icon AND counter on the same tab.

**Rules**

Do  
• Use for 2–7 peer views under the same context  
• Make the active tab unambiguous via underline or fill  
• Keep label grammar parallel across tabs  
• Pair with aria-selected and keyboard arrow nav

Don't  
• Don't use for ordered flows — use Page Navigator  
• Don't load long-running content on tab switch without a skeleton  
• Don't nest Tabs more than 2 levels deep  
• Don't put destructive actions inside a tab label
