# Split Button

> SOLAR Web · Figma page `↳ 🟢 Split Button` (id `3611:5`) · section `components/buttons` · raw data: [`raw/components/buttons/split-button.json`](../../raw/components/buttons/split-button.json)

## Component set: SplitButton

Primary action + adjacent dropdown of related secondary actions. 24 variants: prio (primary, secondary) × size (sm 36px, md 44px) × state (default, hover, pressed, disabled, focus, loading). Use when one action is clearly dominant but the user may sometimes need a variant (Save / Save as draft / Save and close). For 3+ equal actions use a Button Group; for a pure menu trigger use Dropdown.

### Props

| Prop    | Type    | Options / default                                          |
| ------- | ------- | ---------------------------------------------------------- |
| `prio`  | variant | **primary** · secondary                                    |
| `size`  | variant | sm · **md**                                                |
| `state` | variant | **default** · hover · pressed · disabled · focus · loading |
| `label` | text    | default `Label`                                            |

Default variant: `prio=primary, size=md, state=default` · 24 variants · default size 112×40px

### Anatomy (default variant)

- **prio=primary, size=md, state=default** · component · row gap 0 pad 0/0/0/0 HUG/FIXED · 112×40  
  fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control`
  - **Action** · frame · row gap 8 pad 0/16/0/16 HUG/FILL · 68×40  
    itemSpacing `stack.xs` · padding `inset.md`
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.action.primary.text.default` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←label
  - **Divider** · frame · FIXED/FILL · 1×40  
    fill `color.action.primary.text.default` · opacity 0.30000001192092896
  - **Trigger** · frame · row gap 0 pad 0/0/0/0 FIXED/FILL · 40×40
    - **Icon/ChevronDown** · instance of **Icon/ChevronDown** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.active`, `color.action.primary.bg.default`, `color.action.primary.bg.disabled`, `color.action.primary.bg.hover`, `color.action.primary.text.default`, `color.action.secondary.bg.active`, `color.action.secondary.bg.default`, `color.action.secondary.bg.disabled`, `color.action.secondary.bg.hover` |
| Strokes         | `color.border.disabled`, `color.border.medium`                                                                                                                                                                                                                                                                                  |
| Text color      | `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.action.secondary.text.default`, `color.action.secondary.text.disabled`                                                                                                                                                                        |
| Icon color      | `color.action.primary.icon.active`, `color.action.primary.icon.default`, `color.action.primary.icon.disabled`, `color.action.primary.icon.hover`, `color.action.secondary.icon.active`, `color.action.secondary.icon.default`, `color.action.secondary.icon.disabled`, `color.action.secondary.icon.hover`                      |
| Spacing         | `inset.md`, `stack.xs`                                                                                                                                                                                                                                                                                                          |
| Radius          | `radius.control`                                                                                                                                                                                                                                                                                                                |
| Border width    | `border.default`                                                                                                                                                                                                                                                                                                                |
| Sizes           | `icon.md`                                                                                                                                                                                                                                                                                                                       |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md`                                                                                                                                                                                                                             |
| Effects         | `shadow/control`, `shadow/focus/default`                                                                                                                                                                                                                                                                                        |
| Text styles     | `label/md`                                                                                                                                                                                                                                                                                                                      |

### Slots and prop-controlled layers

| Layer          | Controlled property | Prop    |
| -------------- | ------------------- | ------- |
| Action › Label | characters          | `label` |

### Composes

- Icon/ChevronDown

### Variant matrix

| prio      | size | state    | size   | fill                                 | stroke                  | effect                 | text                                   | icon                                   |
| --------- | ---- | -------- | ------ | ------------------------------------ | ----------------------- | ---------------------- | -------------------------------------- | -------------------------------------- |
| primary   | md   | default  | 112×40 | `color.action.primary.bg.default`    | `color.border.medium`   | `shadow/control`       | `color.action.primary.text.default`    | `color.action.primary.icon.default`    |
| secondary | md   | default  | 112×40 | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |
| primary   | sm   | default  | 88×32  | `color.action.primary.bg.default`    | `color.border.medium`   | `shadow/control`       | `color.action.primary.text.default`    | `color.action.primary.icon.default`    |
| secondary | sm   | default  | 88×32  | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |
| primary   | md   | hover    | 112×40 | `color.action.primary.bg.hover`      | `color.border.medium`   | `shadow/control`       | `color.action.primary.text.default`    | `color.action.primary.icon.hover`      |
| secondary | md   | hover    | 113×40 | `color.action.secondary.bg.hover`    | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.hover`    |
| primary   | sm   | hover    | 88×32  | `color.action.primary.bg.hover`      | `color.border.medium`   | `shadow/control`       | `color.action.primary.text.default`    | `color.action.primary.icon.hover`      |
| secondary | sm   | hover    | 88×32  | `color.action.secondary.bg.hover`    | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.hover`    |
| primary   | md   | pressed  | 113×40 | `color.action.primary.bg.active`     | `color.border.medium`   |                        | `color.action.primary.text.default`    | `color.action.primary.icon.active`     |
| secondary | md   | pressed  | 112×40 | `color.action.secondary.bg.active`   | `color.border.medium`   |                        | `color.action.secondary.text.default`  | `color.action.secondary.icon.active`   |
| primary   | sm   | pressed  | 88×32  | `color.action.primary.bg.active`     | `color.border.medium`   |                        | `color.action.primary.text.default`    | `color.action.primary.icon.active`     |
| secondary | sm   | pressed  | 88×32  | `color.action.secondary.bg.active`   | `color.border.medium`   |                        | `color.action.secondary.text.default`  | `color.action.secondary.icon.active`   |
| primary   | md   | disabled | 112×40 | `color.action.primary.bg.disabled`   | `color.border.medium`   |                        | `color.action.primary.text.disabled`   | `color.action.primary.icon.disabled`   |
| secondary | md   | disabled | 112×40 | `color.action.secondary.bg.disabled` | `color.border.disabled` |                        | `color.action.secondary.text.disabled` | `color.action.secondary.icon.disabled` |
| primary   | sm   | disabled | 88×32  | `color.action.primary.bg.disabled`   | `color.border.medium`   |                        | `color.action.primary.text.disabled`   | `color.action.primary.icon.disabled`   |
| secondary | sm   | disabled | 88×32  | `color.action.secondary.bg.disabled` | `color.border.disabled` |                        | `color.action.secondary.text.disabled` | `color.action.secondary.icon.disabled` |
| primary   | md   | focus    | 112×40 | `color.action.primary.bg.default`    | `color.border.medium`   | `shadow/focus/default` | `color.action.primary.text.default`    | `color.action.primary.icon.default`    |
| secondary | md   | focus    | 112×40 | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/focus/default` | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |
| primary   | sm   | focus    | 88×32  | `color.action.primary.bg.default`    | `color.border.medium`   | `shadow/focus/default` | `color.action.primary.text.default`    | `color.action.primary.icon.default`    |
| secondary | sm   | focus    | 88×32  | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/focus/default` | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |
| primary   | md   | loading  | 112×40 | `color.action.primary.bg.default`    | `color.border.medium`   | `shadow/control`       | `color.action.primary.text.default`    | `color.action.primary.icon.default`    |
| secondary | md   | loading  | 112×40 | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |
| primary   | sm   | loading  | 88×32  | `color.action.primary.bg.default`    | `color.border.medium`   | `shadow/control`       | `color.action.primary.text.default`    | `color.action.primary.icon.default`    |
| secondary | sm   | loading  | 88×32  | `color.action.secondary.bg.default`  | `color.border.medium`   | `shadow/control`       | `color.action.secondary.text.default`  | `color.action.secondary.icon.default`  |

## Documentation card

**Description**

Primary action + chevron trigger that opens a menu of related secondary actions. Use when one action dominates but alternatives are sometimes needed (Save / Save as / Save and close). For 3+ equal-weight actions use Button Group; for a pure menu trigger use Dropdown. The two halves share the same prio and size.

**Priority & Size**

prio=primary Filled. One per screen region at most.  
prio=secondary Outlined. Use in toolbars and detail headers.  
size=sm (36px) Toolbars, inspector headers.  
size=md (44px) Default for page-level actions.

**Composition**

Left half: the dominant action. Click fires it directly, no menu.  
Right half (chevron): opens a menu listing 2–5 alternative actions.  
The alternatives must be \*variants\* of the dominant action, not unrelated. If the menu actions diverge (Save + Delete + Archive), use a Dropdown or a Context Menu instead.

**Accessibility**

Two `<button>`s in a joined container. The chevron button exposes aria-haspopup="menu" and aria-expanded. Menu items are role="menuitem". Keyboard: Tab into primary; Alt+Down opens menu from primary; ↓/↑ navigate menu; Esc closes. Focus ring wraps whichever half is focused, not the whole control.

**Rules**

Do  
• Keep the menu actions as variants of the primary  
• Share prio and size between the two halves  
• Use aria-haspopup + aria-expanded on the chevron  
• Close the menu on Esc

Don't  
• Don't put unrelated actions in the menu — use Dropdown  
• Don't use for 3+ equal-weight actions — use Button Group  
• Don't use different prio on the two halves  
• Don't auto-open the menu on hover
