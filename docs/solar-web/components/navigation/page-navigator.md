# Page Navigator

> SOLAR Web · Figma page `↳ 🟢 Page Navigator` (id `4533:81`) · section `components/navigation` · raw data: [`raw/components/navigation/page-navigator.json`](../../raw/components/navigation/page-navigator.json)

## Component set: PageNavButton

Prev/next button used inside PageNavigator. 10 variants: direction (prev/next) × state (default, hover, pressed, focus, disabled). Larger visual weight than PaginationNav — built for step-by-step flows (wizards, multi-page detail, onboarding) rather than dense pagination. Disabled at the sequence boundaries. Label + chevron, mirrored by direction.

### Props

| Prop        | Type    | Options / default                                |
| ----------- | ------- | ------------------------------------------------ |
| `direction` | variant | **prev** · next                                  |
| `state`     | variant | **default** · hover · pressed · focus · disabled |

Default variant: `direction=prev, state=default` · 10 variants · default size 112×36px

### Anatomy (default variant)

- **direction=prev, state=default** · component · row gap 8 pad 0/12/0/12 FIXED/FIXED · 112×36  
  fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · itemSpacing `stack.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
  - **Icon/ArrowLeft** · instance of **Icon/ArrowLeft** (solid=false) · FIXED/FIXED · 20×20  
    width `icon.md`
  - **Label** · text `label/md` "Previous" · HUG/HUG · 56×10  
    fill `color.action.secondary.text.default` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.active`, `color.action.secondary.bg.default`, `color.action.secondary.bg.disabled`, `color.action.secondary.bg.hover`         |
| Strokes         | `color.border.disabled`, `color.border.medium`                                                                                                           |
| Text color      | `color.action.secondary.text.default`, `color.action.secondary.text.disabled`                                                                            |
| Icon color      | `color.action.secondary.icon.active`, `color.action.secondary.icon.default`, `color.action.secondary.icon.disabled`, `color.action.secondary.icon.hover` |
| Spacing         | `inset.sm`, `stack.xs`                                                                                                                                   |
| Radius          | `radius.control`                                                                                                                                         |
| Border width    | `border.default`                                                                                                                                         |
| Sizes           | `icon.md`                                                                                                                                                |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md`                                                      |
| Effects         | `shadow/control`, `shadow/focus/default`                                                                                                                 |
| Text styles     | `label/md`                                                                                                                                               |

### Composes

- Icon/ArrowLeft

### Variant matrix

| direction | state    | size   | fill                                 | stroke                  | effect                 | text                                   | icon                                   |
| --------- | -------- | ------ | ------------------------------------ | ----------------------- | ---------------------- | -------------------------------------- | -------------------------------------- |
| prev      | default  | 112×36 | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |
| prev      | hover    | 112×36 | `color.action.secondary.bg.hover`    | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.hover`    |
| prev      | pressed  | 112×36 | `color.action.secondary.bg.active`   | `color.border.medium`   |                        | `color.action.secondary.text.default`  | `color.action.secondary.icon.active`   |
| prev      | focus    | 112×36 | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/focus/default` | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |
| prev      | disabled | 112×36 | `color.action.secondary.bg.disabled` | `color.border.disabled` |                        | `color.action.secondary.text.disabled` | `color.action.secondary.icon.disabled` |
| next      | default  | 112×36 | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |
| next      | hover    | 112×36 | `color.action.secondary.bg.hover`    | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.hover`    |
| next      | pressed  | 112×36 | `color.action.secondary.bg.active`   | `color.border.medium`   |                        | `color.action.secondary.text.default`  | `color.action.secondary.icon.active`   |
| next      | focus    | 112×36 | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/focus/default` | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |
| next      | disabled | 112×36 | `color.action.secondary.bg.disabled` | `color.border.disabled` |                        | `color.action.secondary.text.disabled` | `color.action.secondary.icon.disabled` |

## Component: PageNavigator

Linear prev/next pager for sequential content (wizards, docs, multi-step detail views, onboarding). No page numbers — use Pagination when random access matters. Composes PageNavButton × 2 with an optional step counter between them (e.g., 'Step 2 of 5'). Disabled at the ends of the sequence.

### Props

| Prop            | Type | Options / default |
| --------------- | ---- | ----------------- |
| `pageIndicator` | text | default `1 of 10` |

### Anatomy (default variant)

- **PageNavigator** · component · row gap 16 pad 0/0/0/0 HUG/HUG · 298×36  
  itemSpacing `stack.md`
  - **PrevButton** · instance of **PageNavButton** (direction=prev, state=disabled) · row gap 8 pad 0/12/0/12 FIXED/FIXED · 112×36  
    fill `color.action.secondary.bg.disabled` · stroke `color.border.disabled` 1px · itemSpacing `stack.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
  - **PageIndicator** · text `body/md/medium` "1 of 10" · HUG/HUG · 42×10  
    fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←pageIndicator
  - **NextButton** · instance of **PageNavButton** (direction=next, state=default) · row gap 8 pad 0/12/0/12 FIXED/FIXED · 112×36  
    fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.default`, `color.action.secondary.bg.disabled`                         |
| Strokes         | `color.border.disabled`, `color.border.medium`                                                    |
| Text color      | `color.text.secondary`                                                                            |
| Spacing         | `inset.sm`, `inset.xs`, `stack.md`, `stack.xs`                                                    |
| Radius          | `radius.control`                                                                                  |
| Border width    | `border.default`                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Effects         | `shadow/control`                                                                                  |
| Text styles     | `body/md/medium`                                                                                  |

### Slots and prop-controlled layers

| Layer         | Controlled property | Prop            |
| ------------- | ------------------- | --------------- |
| PageIndicator | characters          | `pageIndicator` |

### Composes

- PageNavButton

## Documentation card

**When to use**

Use Page Navigator when the user is walking a sequence start → end (wizard steps, reading flows, onboarding).  
Use Pagination when the user is scanning or jumping (search results, tables, large lists).  
Use Tabs when views are peer-level and not ordered.

**Rules**

Do  
• Use for ordered, step-by-step flows  
• Disable prev/next at the sequence boundaries  
• Show position (Step 2 of 5) alongside the controls  
• Keep label text consistent ("Previous" / "Next")

Don't  
• Don't use for random-access lists — use Pagination  
• Don't hide the buttons at the boundaries — disable them  
• Don't reword to "Back" unless the flow is truly reversible state  
• Don't use a lone Next with no Previous — reversibility matters
