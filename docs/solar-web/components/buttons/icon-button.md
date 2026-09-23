# Icon Button

> SOLAR Web · Figma page `↳ 🟢 Icon Button` (id `2163:3670`) · section `components/buttons` · raw data: [`raw/components/buttons/icon-button.json`](../../raw/components/buttons/icon-button.json)

## Component set: Icon Button

Icon-only action button. 108 variants: size (sm 28px, md 36px, lg 44px) × shape (square, round) × prio (primary, secondary, tertiary) × state (default, hover, pressed, focus, loading, disabled). Mirrors the Button priority/size/state system using SOLAR action tokens; the duplicate state=active was removed on 2026-09-23 — use pressed. Always expand the hit area to 44×44 via invisible padding when the visible size is smaller (WCAG 2.5.5). An icon-only control must carry an aria-label — the icon alone is not a name.

### Props

| Prop    | Type    | Options / default                                          |
| ------- | ------- | ---------------------------------------------------------- |
| `size`  | variant | lg · md · **sm**                                           |
| `shape` | variant | **square** · round                                         |
| `prio`  | variant | **primary** · secondary · tertiary                         |
| `state` | variant | **default** · hover · pressed · disabled · focus · loading |

Default variant: `size=sm, shape=square, prio=primary, state=default` · 108 variants · default size 32×32px

### Anatomy (default variant)

- **size=sm, shape=square, prio=primary, state=default** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
  fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 12×12  
    height `icon.xs`

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.action.primary.bg.active`, `color.action.primary.bg.default`, `color.action.primary.bg.disabled`, `color.action.primary.bg.hover`, `color.action.secondary.bg.active`, `color.action.secondary.bg.default`, `color.action.secondary.bg.hover`, `color.action.tertiary.bg.active`, `color.action.tertiary.bg.default`, `color.action.tertiary.bg.hover`                                                                                                    |
| Strokes      | `color.border.disabled`, `color.border.medium`                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Icon color   | `color.action.primary.icon.active`, `color.action.primary.icon.default`, `color.action.primary.icon.disabled`, `color.action.primary.icon.hover`, `color.action.secondary.icon.active`, `color.action.secondary.icon.default`, `color.action.secondary.icon.disabled`, `color.action.secondary.icon.hover`, `color.action.tertiary.icon.active`, `color.action.tertiary.icon.default`, `color.action.tertiary.icon.disabled`, `color.action.tertiary.icon.hover` |
| Radius       | `radius.control`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Border width | `border.default`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Sizes        | `icon.xs`                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Effects      | `shadow/control`, `shadow/focus/default`                                                                                                                                                                                                                                                                                                                                                                                                                         |

### Composes

- Icon/None

### Variant matrix

| size | shape  | prio      | state    | size  | fill                                | stroke                  | effect                 | text | icon                                   |
| ---- | ------ | --------- | -------- | ----- | ----------------------------------- | ----------------------- | ---------------------- | ---- | -------------------------------------- |
| sm   | square | primary   | default  | 32×32 | `color.action.primary.bg.default`   | `color.border.medium`   | `shadow/control`       |      | `color.action.primary.icon.default`    |
| sm   | square | primary   | hover    | 32×32 | `color.action.primary.bg.hover`     |                         |                        |      | `color.action.primary.icon.hover`      |
| sm   | square | primary   | pressed  | 32×32 | `color.action.primary.bg.active`    |                         | `shadow/focus/default` |      | `color.action.primary.icon.active`     |
| sm   | square | primary   | disabled | 32×32 | `color.action.primary.bg.disabled`  |                         |                        |      | `color.action.primary.icon.disabled`   |
| sm   | square | primary   | focus    | 32×32 | `color.action.primary.bg.default`   | `color.border.medium`   | `shadow/focus/default` |      | `color.action.primary.icon.default`    |
| sm   | square | primary   | loading  | 32×32 | `color.action.primary.bg.default`   | `color.border.medium`   | `shadow/control`       |      | `color.action.primary.icon.default`    |
| sm   | round  | primary   | default  | 32×32 | `color.action.primary.bg.default`   | `color.border.medium`   | `shadow/control`       |      | `color.action.primary.icon.default`    |
| sm   | round  | primary   | hover    | 32×32 | `color.action.primary.bg.hover`     |                         |                        |      | `color.action.primary.icon.hover`      |
| sm   | round  | primary   | pressed  | 32×32 | `color.action.primary.bg.active`    |                         | `shadow/focus/default` |      | `color.action.primary.icon.active`     |
| sm   | round  | primary   | disabled | 32×32 | `color.action.primary.bg.disabled`  |                         |                        |      | `color.action.primary.icon.disabled`   |
| sm   | round  | primary   | focus    | 32×32 | `color.action.primary.bg.default`   | `color.border.medium`   | `shadow/focus/default` |      | `color.action.primary.icon.default`    |
| sm   | round  | primary   | loading  | 32×32 | `color.action.primary.bg.default`   | `color.border.medium`   | `shadow/control`       |      | `color.action.primary.icon.default`    |
| md   | square | primary   | default  | 40×40 | `color.action.primary.bg.default`   |                         | `shadow/control`       |      | `color.action.primary.icon.default`    |
| md   | square | primary   | hover    | 40×40 | `color.action.primary.bg.hover`     |                         |                        |      | `color.action.primary.icon.hover`      |
| md   | square | primary   | pressed  | 40×40 | `color.action.primary.bg.active`    |                         | `shadow/focus/default` |      | `color.action.primary.icon.active`     |
| md   | square | primary   | disabled | 40×40 | `color.action.primary.bg.disabled`  |                         |                        |      | `color.action.primary.icon.disabled`   |
| md   | square | primary   | focus    | 40×40 | `color.action.primary.bg.default`   |                         | `shadow/focus/default` |      | `color.action.primary.icon.default`    |
| md   | square | primary   | loading  | 40×40 | `color.action.primary.bg.default`   |                         | `shadow/control`       |      | `color.action.primary.icon.default`    |
| md   | round  | primary   | default  | 40×40 | `color.action.primary.bg.default`   |                         | `shadow/control`       |      | `color.action.primary.icon.default`    |
| md   | round  | primary   | hover    | 40×40 | `color.action.primary.bg.hover`     |                         |                        |      | `color.action.primary.icon.hover`      |
| md   | round  | primary   | pressed  | 40×40 | `color.action.primary.bg.active`    |                         | `shadow/focus/default` |      | `color.action.primary.icon.active`     |
| md   | round  | primary   | disabled | 40×40 | `color.action.primary.bg.disabled`  |                         |                        |      | `color.action.primary.icon.disabled`   |
| md   | round  | primary   | focus    | 40×40 | `color.action.primary.bg.default`   |                         | `shadow/focus/default` |      | `color.action.primary.icon.default`    |
| md   | round  | primary   | loading  | 40×40 | `color.action.primary.bg.default`   |                         | `shadow/control`       |      | `color.action.primary.icon.default`    |
| lg   | square | primary   | default  | 48×48 | `color.action.primary.bg.default`   |                         |                        |      | `color.action.primary.icon.default`    |
| lg   | square | primary   | hover    | 48×48 | `color.action.primary.bg.hover`     |                         |                        |      | `color.action.primary.icon.hover`      |
| lg   | square | primary   | pressed  | 48×48 | `color.action.primary.bg.active`    |                         |                        |      | `color.action.primary.icon.active`     |
| lg   | square | primary   | disabled | 48×48 | `color.action.primary.bg.disabled`  |                         |                        |      | `color.action.primary.icon.disabled`   |
| lg   | square | primary   | focus    | 48×48 | `color.action.primary.bg.default`   |                         | `shadow/focus/default` |      | `color.action.primary.icon.default`    |
| lg   | square | primary   | loading  | 48×48 | `color.action.primary.bg.default`   |                         |                        |      | `color.action.primary.icon.default`    |
| lg   | round  | primary   | default  | 48×48 | `color.action.primary.bg.default`   |                         |                        |      | `color.action.primary.icon.default`    |
| lg   | round  | primary   | hover    | 48×48 | `color.action.primary.bg.hover`     |                         |                        |      | `color.action.primary.icon.hover`      |
| lg   | round  | primary   | pressed  | 48×48 | `color.action.primary.bg.active`    |                         |                        |      | `color.action.primary.icon.active`     |
| lg   | round  | primary   | disabled | 48×48 | `color.action.primary.bg.disabled`  |                         |                        |      | `color.action.primary.icon.disabled`   |
| lg   | round  | primary   | focus    | 48×48 | `color.action.primary.bg.default`   |                         | `shadow/focus/default` |      | `color.action.primary.icon.default`    |
| lg   | round  | primary   | loading  | 48×48 | `color.action.primary.bg.default`   |                         |                        |      | `color.action.primary.icon.default`    |
| sm   | square | secondary | default  | 32×32 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/control`       |      | `color.action.secondary.icon.default`  |
| sm   | square | secondary | hover    | 32×32 | `color.action.secondary.bg.hover`   | `color.border.medium`   |                        |      | `color.action.secondary.icon.hover`    |
| sm   | square | secondary | pressed  | 32×32 | `color.action.secondary.bg.active`  | `color.border.medium`   | `shadow/focus/default` |      | `color.action.secondary.icon.active`   |
| sm   | square | secondary | disabled | 32×32 |                                     | `color.border.disabled` |                        |      | `color.action.secondary.icon.disabled` |
| sm   | square | secondary | focus    | 32×32 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/focus/default` |      | `color.action.secondary.icon.default`  |
| sm   | square | secondary | loading  | 32×32 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/control`       |      | `color.action.secondary.icon.default`  |
| sm   | round  | secondary | default  | 32×32 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/control`       |      | `color.action.secondary.icon.default`  |
| sm   | round  | secondary | hover    | 32×32 | `color.action.secondary.bg.hover`   | `color.border.medium`   |                        |      | `color.action.secondary.icon.hover`    |
| sm   | round  | secondary | pressed  | 32×32 | `color.action.secondary.bg.active`  | `color.border.medium`   | `shadow/focus/default` |      | `color.action.secondary.icon.active`   |
| sm   | round  | secondary | disabled | 32×32 |                                     | `color.border.disabled` |                        |      | `color.action.secondary.icon.disabled` |
| sm   | round  | secondary | focus    | 32×32 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/focus/default` |      | `color.action.secondary.icon.default`  |
| sm   | round  | secondary | loading  | 32×32 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/control`       |      | `color.action.secondary.icon.default`  |
| md   | square | secondary | default  | 40×40 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/control`       |      | `color.action.secondary.icon.default`  |
| md   | square | secondary | hover    | 40×40 | `color.action.secondary.bg.hover`   | `color.border.medium`   |                        |      | `color.action.secondary.icon.hover`    |
| md   | square | secondary | pressed  | 40×40 | `color.action.secondary.bg.active`  | `color.border.medium`   | `shadow/focus/default` |      | `color.action.secondary.icon.active`   |
| md   | square | secondary | disabled | 40×40 |                                     | `color.border.disabled` |                        |      | `color.action.secondary.icon.disabled` |
| md   | square | secondary | focus    | 40×40 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/focus/default` |      | `color.action.secondary.icon.default`  |
| md   | square | secondary | loading  | 40×40 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/control`       |      | `color.action.secondary.icon.default`  |
| md   | round  | secondary | default  | 40×40 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/control`       |      | `color.action.secondary.icon.default`  |
| md   | round  | secondary | hover    | 40×40 | `color.action.secondary.bg.hover`   | `color.border.medium`   |                        |      | `color.action.secondary.icon.hover`    |
| md   | round  | secondary | pressed  | 40×40 | `color.action.secondary.bg.active`  | `color.border.medium`   | `shadow/focus/default` |      | `color.action.secondary.icon.active`   |
| md   | round  | secondary | disabled | 40×40 |                                     | `color.border.disabled` |                        |      | `color.action.secondary.icon.disabled` |
| md   | round  | secondary | focus    | 40×40 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/focus/default` |      | `color.action.secondary.icon.default`  |
| md   | round  | secondary | loading  | 40×40 | `color.action.secondary.bg.default` | `color.border.medium`   | `shadow/control`       |      | `color.action.secondary.icon.default`  |
| lg   | square | secondary | default  | 48×48 | `color.action.secondary.bg.default` |                         |                        |      | `color.action.secondary.icon.default`  |
| lg   | square | secondary | hover    | 48×48 | `color.action.secondary.bg.hover`   |                         |                        |      | `color.action.secondary.icon.hover`    |
| lg   | square | secondary | pressed  | 48×48 | `color.action.secondary.bg.active`  |                         |                        |      | `color.action.secondary.icon.active`   |
| lg   | square | secondary | disabled | 48×48 |                                     | `color.border.disabled` |                        |      | `color.action.secondary.icon.disabled` |
| lg   | square | secondary | focus    | 48×48 | `color.action.secondary.bg.default` |                         | `shadow/focus/default` |      | `color.action.secondary.icon.default`  |
| lg   | square | secondary | loading  | 48×48 | `color.action.secondary.bg.default` |                         |                        |      | `color.action.secondary.icon.default`  |
| lg   | round  | secondary | default  | 48×48 | `color.action.secondary.bg.default` |                         |                        |      | `color.action.secondary.icon.default`  |
| lg   | round  | secondary | hover    | 48×48 | `color.action.secondary.bg.hover`   |                         |                        |      | `color.action.secondary.icon.hover`    |
| lg   | round  | secondary | pressed  | 48×48 | `color.action.secondary.bg.active`  |                         |                        |      | `color.action.secondary.icon.active`   |
| lg   | round  | secondary | disabled | 48×48 |                                     | `color.border.disabled` |                        |      | `color.action.secondary.icon.disabled` |
| lg   | round  | secondary | focus    | 48×48 | `color.action.secondary.bg.default` |                         | `shadow/focus/default` |      | `color.action.secondary.icon.default`  |
| lg   | round  | secondary | loading  | 48×48 | `color.action.secondary.bg.default` |                         |                        |      | `color.action.secondary.icon.default`  |
| sm   | square | tertiary  | default  | 32×32 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| sm   | square | tertiary  | hover    | 32×32 | `color.action.tertiary.bg.hover`    |                         |                        |      | `color.action.tertiary.icon.hover`     |
| sm   | square | tertiary  | pressed  | 32×32 | `color.action.tertiary.bg.active`   |                         |                        |      | `color.action.tertiary.icon.active`    |
| sm   | square | tertiary  | disabled | 32×32 |                                     | `color.border.disabled` |                        |      | `color.action.tertiary.icon.disabled`  |
| sm   | square | tertiary  | focus    | 32×32 | `color.action.tertiary.bg.default`  |                         | `shadow/focus/default` |      | `color.action.tertiary.icon.default`   |
| sm   | square | tertiary  | loading  | 32×32 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| sm   | round  | tertiary  | default  | 32×32 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| sm   | round  | tertiary  | hover    | 32×32 | `color.action.tertiary.bg.hover`    |                         |                        |      | `color.action.tertiary.icon.hover`     |
| sm   | round  | tertiary  | pressed  | 32×32 | `color.action.tertiary.bg.active`   |                         |                        |      | `color.action.tertiary.icon.active`    |
| sm   | round  | tertiary  | disabled | 32×32 |                                     | `color.border.disabled` |                        |      | `color.action.tertiary.icon.disabled`  |
| sm   | round  | tertiary  | focus    | 32×32 | `color.action.tertiary.bg.default`  |                         | `shadow/focus/default` |      | `color.action.tertiary.icon.default`   |
| sm   | round  | tertiary  | loading  | 32×32 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| md   | square | tertiary  | default  | 40×40 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| md   | square | tertiary  | hover    | 40×40 | `color.action.tertiary.bg.hover`    |                         |                        |      | `color.action.tertiary.icon.hover`     |
| md   | square | tertiary  | pressed  | 40×40 | `color.action.tertiary.bg.active`   |                         |                        |      | `color.action.tertiary.icon.active`    |
| md   | square | tertiary  | disabled | 40×40 |                                     | `color.border.disabled` |                        |      | `color.action.tertiary.icon.disabled`  |
| md   | square | tertiary  | focus    | 40×40 | `color.action.tertiary.bg.default`  |                         | `shadow/focus/default` |      | `color.action.tertiary.icon.default`   |
| md   | square | tertiary  | loading  | 40×40 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| md   | round  | tertiary  | default  | 40×40 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| md   | round  | tertiary  | hover    | 40×40 | `color.action.tertiary.bg.hover`    |                         |                        |      | `color.action.tertiary.icon.hover`     |
| md   | round  | tertiary  | pressed  | 40×40 | `color.action.tertiary.bg.active`   |                         |                        |      | `color.action.tertiary.icon.active`    |
| md   | round  | tertiary  | disabled | 40×40 |                                     | `color.border.disabled` |                        |      | `color.action.tertiary.icon.disabled`  |
| md   | round  | tertiary  | focus    | 40×40 | `color.action.tertiary.bg.default`  |                         | `shadow/focus/default` |      | `color.action.tertiary.icon.default`   |
| md   | round  | tertiary  | loading  | 40×40 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| lg   | square | tertiary  | default  | 48×48 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| lg   | square | tertiary  | hover    | 48×48 | `color.action.tertiary.bg.hover`    |                         |                        |      | `color.action.tertiary.icon.hover`     |
| lg   | square | tertiary  | pressed  | 48×48 | `color.action.tertiary.bg.active`   |                         |                        |      | `color.action.tertiary.icon.active`    |
| lg   | square | tertiary  | disabled | 48×48 |                                     | `color.border.disabled` |                        |      | `color.action.tertiary.icon.disabled`  |
| lg   | square | tertiary  | focus    | 48×48 | `color.action.tertiary.bg.default`  |                         | `shadow/focus/default` |      | `color.action.tertiary.icon.default`   |
| lg   | square | tertiary  | loading  | 48×48 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| lg   | round  | tertiary  | default  | 48×48 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |
| lg   | round  | tertiary  | hover    | 48×48 | `color.action.tertiary.bg.hover`    |                         |                        |      | `color.action.tertiary.icon.hover`     |
| lg   | round  | tertiary  | pressed  | 48×48 | `color.action.tertiary.bg.active`   |                         |                        |      | `color.action.tertiary.icon.active`    |
| lg   | round  | tertiary  | disabled | 48×48 |                                     | `color.border.disabled` |                        |      | `color.action.tertiary.icon.disabled`  |
| lg   | round  | tertiary  | focus    | 48×48 | `color.action.tertiary.bg.default`  |                         | `shadow/focus/default` |      | `color.action.tertiary.icon.default`   |
| lg   | round  | tertiary  | loading  | 48×48 | `color.action.tertiary.bg.default`  |                         |                        |      | `color.action.tertiary.icon.default`   |

## Documentation card

**Description**

Square or round icon-only button for toolbar-density actions (close, more, edit, bookmark). Mirrors Button's priority/size/state system. Use when the space won't fit a labeled Button and the icon is unambiguous. If the icon is ambiguous, add a tooltip AND an aria-label — the tooltip is not an accessible name.

**Priority**

primary Filled, high-emphasis. One per toolbar at most.  
secondary Outlined default for toolbar clusters and row actions.  
tertiary Chromeless, used inside dense contexts (table rows, inspector headers).

**Sizes & Shape**

sm (28px) Ultra-dense: row actions, inline chips.  
md (36px) Toolbars, inspector headers. Pad to 44×44 for touch.  
lg (44px) Default for prominent surfaces.  
shape=square for toolbars and row actions; shape=round for floating affordances (avatar menu, overflow on card).

**Accessibility**

Every Icon Button needs an aria-label matching the action verb ("Close dialog", "Edit row"). Icon alone is not a name. Hit area ≥ 44×44 (WCAG 2.5.5) — use invisible padding on sm/md. Focus ring via shadow/focus/default effect style. Pair with Tooltip for discoverability, never as the only label.

**Labels & Icons**

Use SOLAR Icons library; icon size tracks button size (icon/size/sm for 28px, icon/size/md for 36px, icon/size/lg for 44px). Prefer recognizable glyphs — ambiguous icons need a tooltip AND a visible label nearby. Don't invent glyphs for domain-specific actions — use a labeled Button instead.

**Rules**

Do  
• Provide aria-label for every Icon Button  
• Pad hit area to 44×44 on sm / md visuals  
• Use tooltip + aria-label, not tooltip alone  
• Match icon weight to the neighboring text size

Don't  
• Don't use for ambiguous actions — use a labeled Button  
• Don't mix shape variants in the same toolbar  
• Don't use primary prio for destructive actions — add danger state  
• Don't rely on color alone for state differences
