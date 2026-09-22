# States & Interaction

> Verbatim text of the Figma page `States & Interaction` (id `1054:14458`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `f0eabdf31897`. Curated chapter: [08-states-interaction.md](../../08-states-interaction.md).

## Slide 1

### Visual Language States & Interaction

## States & Interaction

#### Interactive states communicate how elements respond to user input. In SOLAR, states follow a consistent model across all interactive components, ensuring predictable behavior and a unified visual language.

Every interactive element in SOLAR progresses through a defined set of states. These states are expressed through color, shadow, opacity, and cursor changes — never through layout shifts or structural changes. A consistent state model reduces ambiguity for users and simplifies implementation for development teams.

##### Predictable State Ladder

##### Subtle Depth Cues

##### Consistent Across Components

##### Accessible By Default

Every interactive element follows the same state progression: default, hover, active, focus, disabled. Users learn this model once and it applies everywhere.

States are expressed through semantic tokens such as color.action.{intent}.{property}.{state}. Switching themes or modes updates all states automatically.

A button, a toggle, a text input, and a card action all follow the same state rules. No component invents its own state behavior.

Focus states are always visible and meet WCAG contrast requirements. Disabled states are communicated through both visual cues and ARIA attributes.

## State Definitions

#### SOLAR defines a core set of interaction states that apply to all interactive elements. Each state has a clear trigger, visual expression, and purpose.

States are mutually exclusive within a single interaction flow — an element cannot be simultaneously hovered and active. However, states can layer with persistent conditions: a selected element can also be hovered, and a focused element can also be active.

##### State list

Default — The resting state of an interactive element. No user input is occurring. The element is available for interaction.\
Hover — The cursor is positioned over the element. Visual feedback confirms the element is interactive. Applies only to pointer-based input.\
Active / Pressed — The element is being clicked or tapped. This state is momentary and typically the most visually pronounced change.\
Focus — The element has received keyboard or programmatic focus. A visible focus ring must always be present. This state is critical for accessibility.\
Disabled — The element is not available for interaction. Visual appearance is subdued and the element does not respond to any input. Must include aria-disabled or equivalent.\
Selected / On — The element is in a toggled or chosen state. Applies to toggles, checkboxes, radio buttons, tabs, and segmented controls. Selected elements still respond to hover, focus, and active states.

_[image: image 1]_

## State Expression Through Tokens

#### States in SOLAR are expressed through the semantic token grammar. Each interactive component references state-specific tokens rather than hardcoded values.

The token pattern color.action.{intent}.{property}.{state} defines how states resolve to visual values. Intent describes the purpose (primary, secondary, tertiary, primary-danger), property describes what changes (bg, text, icon, border), and state describes the interaction condition (default, hover, focus, active, disabled).

This grammar ensures that adding a new theme or mode automatically updates every state across every component — no manual overrides required.

##### Token examples

color.action.primary.bg.default — Primary button resting fill\
color.action.primary.bg.hover — Primary button hovered fill\
color.action.primary.bg.active — Primary button pressed fill\
color.action.primary.bg.disabled — Primary button disabled fill\
color.action.primary.text.default — Primary button label color\
color.action.primary-danger.bg.hover — Destructive button hovered fill

##### Non-color state tokens:

shadow/control — Subtle shadow applied to input elements in their default state\
color.\*.disabled — Explicit disabled colours for text, icon, border and action tokens (alpha/black-20 light · alpha/white-20 dark); there is no opacity token\
motion.duration.fast + motion.ease.both — Hover and pressed state transitions\
motion.duration.instant — Focus ring appearance; keyboard focus is never delayed

_[image: image 2]_

## State Ladder by Component Type

#### Different component types support different subsets of the state model. Not every state applies to every element.

Action components (buttons, links) support the full state ladder. Input components (text fields, selects) add value-related states. Selection components (toggles, checkboxes) add on/off states that persist independently from interaction states.

##### Action Components

##### Input Components

##### Selection Components

##### Static containers

Button, Link, IconButton. Full state ladder: default, hover, active, focus, disabled. States are expressed primarily through bg and text color changes.

TextField, Select, TextArea. Support default, hover, focus, disabled, plus validation states: danger, warning, success. Border color and shadow/control change on state.

Toggle, Checkbox, Radio, Tab. Support the full action ladder plus selected/unselected. Selected state persists while hover, focus, and active layer on top.

Card, Pane, Table row. May support hover to indicate clickability, but do not follow the full state ladder. Use subtle background shifts rather than strong color changes.

## Focus & Accessibility

#### Focus states are the most important interaction state in SOLAR. They ensure that keyboard and assistive technology users can navigate and operate every interface.

Every interactive element must display a visible focus indicator when navigated to via keyboard. SOLAR uses a consistent focus ring style across all components. Focus indicators must never be removed or hidden, even when a mouse-based :focus event fires. Use :focus-visible to show focus rings only on keyboard navigation where

##### Rules

Focus ring style. All interactive elements use a 2px offset ring using the system focus color token. The ring must have sufficient contrast against any background surface it appears on.

Focus order follows DOM order. Tab order must match the visual reading order. Never use positive tabindex values to override natural flow.

Focus trapping in dialogs. When a dialog is active, focus must be trapped within the dialog surface. Pressing Tab from the last focusable element returns to the first. Pressing Escape closes the dialog and returns focus to the trigger element.

Disabled elements are not focusable. Elements with disabled or aria-disabled must be removed from the tab order. Users should not be able to focus on elements they cannot interact with.

_[image: text-input 1]_

## States Do's and Don'ts

#### Consistent state behavior helps users build confidence in the interface. These guidelines address common mistakes when implementing interactive states in SOLAR products.

States should be clearly perceptible but never disruptive. Changes between states should feel immediate and smooth, using the motion tokens defined in SOLAR Fundamentals. Every state change must be perceivable by both sighted users and users of assistive technologies.

##### Do: Use tokens for every state

Always reference state-specific tokens. Hardcoding a hover color that looks right in light mode will break in dark mode. Let the token grammar handle resolution.

##### Do: Keep focus rings visible

Never remove or visually suppress focus indicators. If the default browser ring doesn't match SOLAR's visual language, replace it with a custom ring — don't remove it.

##### Don't: Use color alone for states

Color changes must be reinforced by a secondary cue such as a border change, shadow shift, underline, or icon update. Users with color vision deficiency rely on non-color indicators.

##### Don't: Animate layout on state change

State changes should never cause the element to shift size, move position, or reflow surrounding content. Use color, shadow, opacity, and border — not padding, margin, or scale.

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: States & Interaction
domain: Visual Language > Interactive State System
version: 1.0
updated: 2026-09-22

[ROLE]
You are the SOLAR interaction states specialist. Every interactive element must clearly communicate its current state through visual treatment. States are expressed through tokens — never ad-hoc styling.

[SCOPE]
- Interactive state definitions and visual treatments
- State token architecture
- How states combine and layer
- Touch vs. pointer state differences
- State transitions and motion

[STATES]
default: resting appearance — base tokens applied
hover: cursor over (desktop only) — subtle bg shift, border change, or underline
pressed: being clicked or tapped — darker bg or inset (the variant value is pressed, never active)
focus: keyboard focus — visible high-contrast focus ring, mandatory
disabled: non-interactive — disabled colour tokens, no pointer events, aria-disabled
selected: toggled on or currently active tab/item — distinct from hover
error: validation failure — error color border + text + icon + message
loading: awaiting response — skeleton, spinner, or shimmer replacement
read-only: visible but not editable — no interactive affordance, no state changes

[STATE_TOKENS]
color.action.{variant}.bg.{state}: background per variant per state
color.action.{variant}.text.{state}: text color per variant per state
color.action.{variant}.border.{state}: border per state
color.action.{variant}.icon.{state}: icon color (often = text)
disabled colour: color.text.disabled, color.icon.disabled, color.border.disabled, color.action.{prio}.*.disabled — alpha/black-20 light · alpha/white-20 dark; there is no opacity.disabled token
shadow.focus.{variant}: focus ring shadow (default, danger)
rule: every state change traces to a token swap — no hardcoded overrides

[STATE_COMBINATIONS]
focus + hover: focus ring visible on top of hover treatment
focus + selected: focus ring + selected indicator
disabled + selected: reduced opacity but selected indicator preserved
error + focus: error styling + focus ring with error color
rule: focus state ALWAYS stacks on top — never suppressed by other states

[POINTER_VS_TOUCH]
pointer (desktop): default → hover → pressed → default
touch (mobile): default → pressed → default (hover is skipped)
rule: never rely on hover as the only way to reveal information
touch_feedback: pressed state must be visually perceivable within 100ms

[TRANSITION_TOKENS]
state_transition: motion.duration.fast (100ms) + motion.ease.both
hover_in: instantaneous or ≤100ms
hover_out: motion.duration.fast + motion.ease.out
focus: instantaneous (no delay on keyboard focus)
disabled: instantaneous (no animation into/out of disabled)
loading: motion.duration.normal for skeleton fade-in

[CURSOR_MAPPING]
default: pointer for interactive, default for static
disabled: not-allowed
loading: wait or progress
text_input: text
drag: grab / grabbing
resize: col-resize, row-resize, nwse-resize

[AGENT_BEHAVIOR]
- When reviewing any interactive element, verify ALL applicable states are defined
- States must be visually distinct from each other — a user should never confuse hover with selected
- Always check that focus state is present and meets contrast requirements
- Flag any component missing disabled or error state as incomplete
- Verify state transitions use correct motion tokens
- For touch interfaces, confirm hover is not the only discovery mechanism

[CONSTRAINTS]
- never suppress or remove focus state indicators
- never dim a disabled element with opacity — swap to the disabled colour tokens so contrast stays predictable
- never use color alone to distinguish states — pair with border, shadow, or icon changes
- never animate into disabled state (instant transition)
- hover state must not be required for functionality (touch devices skip it)
- every interactive element must define at minimum: default, hover, pressed, focus, disabled
@END:PAGE_CONTEXT
```
