# FAB

> SOLAR Web · Figma page `↳ 🟢 FAB` (id `2966:581`) · section `components/buttons` · raw data: [`raw/components/buttons/fab.json`](../../raw/components/buttons/fab.json)

## Component set: FAB

Floating Action Button — the single most important action on a screen, elevated above content. 20 variants: type (icon / extended) × size (sm 44px / md 56px) × state (default, hover, pressed, focus, disabled). Fixed position (usually bottom-right). Uses action/primary tokens + shadow/raised. extended type adds a label alongside the icon for discoverability. Strict rule: one FAB per screen.

### Props

| Prop    | Type    | Options / default                                          |
| ------- | ------- | ---------------------------------------------------------- |
| `type`  | variant | **icon** · extended                                        |
| `size`  | variant | **sm** · md                                                |
| `state` | variant | **default** · hover · pressed · focus · disabled · loading |
| `label` | text    | default `Label`                                            |

Default variant: `type=icon, size=sm, state=default` · 24 variants · default size 44×44px

### Anatomy (default variant)

- **type=icon, size=sm, state=default** · component · row gap 0 pad 12/12/12/12 FIXED/FIXED · 44×44  
  fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/overlay` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
    height `icon.md`

### Tokens used

| Role         | Tokens                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills        | `color.action.primary.bg.active`, `color.action.primary.bg.default`, `color.action.primary.bg.disabled`, `color.action.primary.bg.hover`         |
| Strokes      | `color.border.medium`                                                                                                                            |
| Text color   | `color.action.primary.text.default`, `color.action.primary.text.disabled`                                                                        |
| Icon color   | `color.action.primary.icon.active`, `color.action.primary.icon.default`, `color.action.primary.icon.disabled`, `color.action.primary.icon.hover` |
| Spacing      | `inset.sm`                                                                                                                                       |
| Radius       | `radius.pill`                                                                                                                                    |
| Border width | `border.default`                                                                                                                                 |
| Sizes        | `icon.md`                                                                                                                                        |
| Effects      | `shadow/overlay`                                                                                                                                 |

### Composes

- Icon/None

### Variant matrix

| type     | size | state    | size   | fill                               | stroke                | effect           | text                                 | icon                                 |
| -------- | ---- | -------- | ------ | ---------------------------------- | --------------------- | ---------------- | ------------------------------------ | ------------------------------------ |
| icon     | sm   | default  | 44×44  | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.default`  |
| icon     | sm   | hover    | 44×44  | `color.action.primary.bg.hover`    | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.hover`    |
| icon     | sm   | pressed  | 44×44  | `color.action.primary.bg.active`   | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.active`   |
| icon     | sm   | disabled | 44×44  | `color.action.primary.bg.disabled` | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.disabled` |
| icon     | sm   | focus    | 44×44  | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.default`  |
| icon     | sm   | loading  | 44×44  | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.default`  |
| icon     | md   | default  | 56×56  | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.default`  |
| icon     | md   | hover    | 56×56  | `color.action.primary.bg.hover`    | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.hover`    |
| icon     | md   | pressed  | 56×56  | `color.action.primary.bg.active`   | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.active`   |
| icon     | md   | disabled | 56×56  | `color.action.primary.bg.disabled` | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.disabled` |
| icon     | md   | focus    | 56×56  | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.default`  |
| icon     | md   | loading  | 56×56  | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` |                                      |                                      |
| extended | sm   | default  | 91×44  | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.default`  | `color.action.primary.icon.default`  |
| extended | sm   | hover    | 91×44  | `color.action.primary.bg.hover`    | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.default`  | `color.action.primary.icon.hover`    |
| extended | sm   | pressed  | 91×44  | `color.action.primary.bg.active`   | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.default`  | `color.action.primary.icon.active`   |
| extended | sm   | disabled | 91×44  | `color.action.primary.bg.disabled` | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.disabled` | `color.action.primary.icon.disabled` |
| extended | sm   | focus    | 91×44  | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.default`  | `color.action.primary.icon.default`  |
| extended | sm   | loading  | 84×44  | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` |                                      | `color.action.primary.icon.default`  |
| extended | md   | default  | 112×56 | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.default`  | `color.action.primary.icon.default`  |
| extended | md   | hover    | 112×56 | `color.action.primary.bg.hover`    | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.default`  | `color.action.primary.icon.hover`    |
| extended | md   | pressed  | 112×56 | `color.action.primary.bg.active`   | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.default`  | `color.action.primary.icon.active`   |
| extended | md   | disabled | 112×56 | `color.action.primary.bg.disabled` | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.disabled` | `color.action.primary.icon.disabled` |
| extended | md   | focus    | 112×56 | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` | `color.action.primary.text.default`  | `color.action.primary.icon.default`  |
| extended | md   | loading  | 104×56 | `color.action.primary.bg.default`  | `color.border.medium` | `shadow/overlay` |                                      |                                      |

### Issues detected

- Description says 20 variants; the set has 24.

## Documentation card

**Description**

Floating Action Button: the single most important action on a screen, elevated above content via shadow/raised. Fixed to the content area (usually bottom-right). Use sparingly — one FAB per screen, max. Most dense B2B screens do NOT need a FAB; a primary Button in the page header works fine. Use when the primary action must remain reachable while the user scrolls.

**Type**

icon Circular, icon-only. Use when the action is universally recognizable (plus / add, compose, scan).  
extended Pill, icon + label. Use when the icon would be ambiguous — label clarifies ("New project", "Compose").

**Sizes**

sm (44px) Inside constrained content areas (inspector panes, narrow columns).  
md (56px) Default. Full-screen primary action on mobile + desktop.  
Hit area ≥ 44×44 (WCAG 2.5.5) — sm meets this exactly; don't go smaller.

**Accessibility**

icon type needs aria-label matching the action verb; extended type gets its name from the visible label. shadow/raised provides visual separation. Keyboard: reachable via Tab, Enter/Space activates. Focus ring via shadow/focus/default. Don't obstruct scrolling content — move above toast / snackbar stacks.

**Rules**

Do  
• One FAB per screen — the single primary action  
• Use extended when the icon could be ambiguous  
• Provide aria-label on icon type  
• Move above toast stacks when they appear

Don't  
• Don't use FAB where a primary Button in the page header is fine  
• Don't stack multiple FABs — pick one  
• Don't use for secondary / tertiary actions  
• Don't hide content under the FAB — leave bottom padding
