---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/states-interaction: b7503e047c18
---

# 08 · States & Interaction

> Source: Figma page "Visual Language › States & Interaction" (overview, state
> definitions, state expression through tokens, state ladder by component type, focus
> & accessibility, do's and don'ts) and its `@SOLAR:PAGE_CONTEXT`.

## Model

Every interactive element in SOLAR progresses through one defined set of states,
expressed through color, shadow, opacity, and cursor changes, **never through layout
shifts**.

| Principle                        | Meaning                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Predictable state ladder**     | default → hover → active → focus → disabled, the same everywhere                                                 |
| **Token-expressed**              | `color.action.{intent}.{property}.{state}`; switching theme updates every state automatically                    |
| **Consistent across components** | A button, a toggle, a text input and a card action follow the same rules; no component invents its own behaviour |
| **Accessible by default**        | Focus states are always visible and meet contrast; disabled is conveyed visually and via ARIA                    |

## State definitions

| State                | Trigger                                   | Expression                                                                                  |
| -------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Default**          | Resting, available                        | Base tokens                                                                                 |
| **Hover**            | Pointer over (desktop only)               | Subtle bg shift, border change, or underline                                                |
| **Active / pressed** | Being clicked or tapped (momentary)       | Most pronounced change: darker bg, slight inset                                             |
| **Focus**            | Keyboard or programmatic focus            | Visible high-contrast focus ring. Mandatory. Instant, no delay                              |
| **Disabled**         | Not available                             | Subdued appearance, no pointer events, `aria-disabled` / `disabled`, removed from tab order |
| **Selected / on**    | Toggled or chosen (toggles, tabs, radios) | Distinct indicator; still responds to hover, focus, active                                  |
| **Error**            | Validation failure                        | Danger border + text + icon + message                                                       |
| **Loading**          | Awaiting response                         | Skeleton, spinner, or shimmer replacement                                                   |
| **Read-only**        | Visible, not editable                     | No interactive affordance, no state changes                                                 |

States are mutually exclusive within one interaction flow (not hovered and active at
once) but layer with persistent conditions: selected + hovered, focused + active.

## State tokens

- `color.action.{intent}.{property}.{state}` where intent ∈ `primary | secondary |
tertiary | primary-danger`, property ∈ `bg | text | icon | border`, state ∈ `default |
hover | active | disabled`. Full resolution table in [05-color.md](05-color.md#action).
- `color.surface.hover` / `color.surface.active` for hoverable static surfaces (cards,
  rows): alpha/black-05 and alpha/black-10 in Light, white equivalents in Dark.
- `shadow/control` on inputs in their default state; `shadow/focus/default` and
  `shadow/focus/danger` for focus rings; `shadow/danger` / `shadow/warning` for
  validation outlines.
- `color.border.feedback.focus.strong` (blue/500 | blue/400) for the focus border.
- Validation states on inputs use `color.border.feedback.{danger,warning,success}.strong`.
- Disabled opacity: the page context names `opacity.disabled` (≈ 0.38) for non-action
  elements. There is **no opacity variable in the Figma inventory yet**; action
  components use their explicit `disabled` color tokens instead. Never reduce disabled
  opacity below 0.38.
- Motion: the page names `motion/hover` and `motion/focus`; these semantic motion tokens
  are a planned workstream. Today use `motion.duration.fast` (100 ms) and
  `motion.ease.out` for state transitions. See [13-motion.md](13-motion.md).

Every state change traces to a token swap; no hard-coded overrides.

## State combinations

| Combination         | Result                                                                |
| ------------------- | --------------------------------------------------------------------- |
| focus + hover       | Focus ring visible on top of the hover treatment                      |
| focus + selected    | Focus ring + selected indicator                                       |
| disabled + selected | Reduced emphasis but selected indicator preserved                     |
| error + focus       | Error styling + focus ring in the error color (`shadow/focus/danger`) |

**Focus always stacks on top**; it is never suppressed by another state.

## Pointer vs touch

- Pointer: default → hover → active → default.
- Touch: default → active → default (hover is skipped).
- Never rely on hover as the only way to reveal information or functionality.
- Touch feedback must be perceivable within 100 ms.

## Transition timing

| Transition | Timing                                           |
| ---------- | ------------------------------------------------ |
| hover in   | Instant or ≤ 100 ms (`motion.duration.fast`)     |
| hover out  | ~150 ms ease-out (slight delay prevents flicker) |
| focus      | Instant                                          |
| disabled   | Instant (never animate into or out of disabled)  |
| loading    | `motion.duration.normal` for skeleton fade-in    |

## Cursor mapping

| Context     | Cursor                                    |
| ----------- | ----------------------------------------- |
| Interactive | `pointer`; static: `default`              |
| Disabled    | `not-allowed`                             |
| Loading     | `wait` or `progress`                      |
| Text input  | `text`                                    |
| Drag        | `grab` / `grabbing`                       |
| Resize      | `col-resize`, `row-resize`, `nwse-resize` |

## State ladder by component type

| Type                 | Components                   | States                                                                                                            |
| -------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Action components    | Button, Link, IconButton     | Full ladder: default, hover, active, focus, disabled. Expressed mainly through bg and text color                  |
| Input components     | TextField, Select, TextArea  | default, hover, focus, disabled + validation (danger, warning, success). Border color and `shadow/control` change |
| Selection components | Toggle, Checkbox, Radio, Tab | Full ladder + selected/unselected; selected persists while hover, focus, active layer on top                      |
| Static containers    | Card, Pane, Table row        | May support hover to indicate clickability via subtle background shifts; not the full ladder                      |

## Focus and accessibility

- **Focus ring style**: 2 px offset ring in the system focus color; sufficient contrast
  against any surface it appears on.
- **Focus order follows DOM order**; never positive `tabindex`.
- **Focus trapping in dialogs**: Tab from the last element returns to the first; Escape
  closes and returns focus to the trigger.
- **Disabled elements are not focusable.**
- Use `:focus-visible` so rings show on keyboard navigation; never remove focus
  indicators. If the browser default does not match SOLAR, replace it, do not delete it.

## Do and don't

| Do                                                                         | Don't                                                                                       |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Use tokens for every state; a hover hex that works in Light breaks in Dark | Use color alone for states; pair with border, shadow, underline or icon change              |
| Keep focus rings visible                                                   | Animate layout on state change (size, position, reflow); use color, shadow, opacity, border |

Minimum for every interactive element: default, hover, active, focus, disabled. A
component missing disabled or error is incomplete.
