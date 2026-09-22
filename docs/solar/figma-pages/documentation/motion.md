# Motion

> Verbatim text of the Figma page `Motion` (id `763:61136`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `e08e65deab41`. Curated chapter: [13-motion.md](../../13-motion.md).

## Slide 1

### Motion

## Motion

#### Motion in SOLAR communicates change and reinforces hierarchy across interactions. It clarifies state transitions, preserves spatial context, and improves usability. Motion is never decorative — it is intentional, restrained, and system-driven.

##### Purpose

Motion exists to:\
Communicate state changes clearly\
Preserve spatial context during transitions\
Reinforce hierarchy and causality\
Maintain consistency across products

##### Scope

Motion includes:\
Duration tokens (instant, fast, normal, slow, slower)\
Easing curves (ease-out, ease-in, ease-both)\
State transitions\
Structural transitions\
Micro-interactions

Motion defines temporal behavior.\
Visual language defines expression.\
Components operate within both.

## Motion Principles

#### Motion in SOLAR communicates change and reinforces hierarchy across interactions. It clarifies state transitions, preserves spatial context, and improves usability. Motion is never decorative — it is intentional, restrained, and system-driven.

##### Motion has purpose

##### Preserve context and continuity

##### Subtle, consistent, and accessible

Animation must communicate state, causality, or hierarchy. Movement should make interactions clearer, not more expressive. If motion does not improve understanding, it should not be implemented.

Transitions maintain spatial and structural relationships. Users should understand what changed and why, without losing orientation or focus.

Motion is predictable and restrained across products. It never blocks task completion and always respects reduced-motion preferences.

## Duration & Easing

#### Consistent duration and easing create a cohesive interaction experience. SOLAR defines standardized motion timing to ensure predictable and harmonious behavior across products.

###### Duration

Motion durations scale by complexity:\
Short (micro feedback)\
Medium (component transitions)\
Long (structural transitions)

Duration reflects distance and complexity — not preference.

###### Easing

Ease-out for entrances\
Ease-in for exits\
Ease-both for state transitions

Easing reinforces natural movement and reduces abrupt changes.

_[image: Screenshot 2026-03-20 at 13.46.32 1]_

_[image: image 3]_

## Transitions

#### Transitions connect interface states and maintain continuity across interactions. They ensure that structural or visual changes feel intentional rather than abrupt.

###### Types of Transitions

Opacity (fade)\
Transform (scale, slide)\
Layout expansion / collapse\
Elevation shifts

Transitions should reflect the nature of the change.

###### Structural Transitions

Navigation expansion\
Sidebar collapse\
Dialog entry and exit\
Page-level transitions

Large structural transitions require proportionally longer duration.

_[image: image 4]_

## State Changes

_[image: image 1]_

#### State changes provide immediate feedback in response to user interaction or system updates. Motion clarifies cause and effect.

###### Interaction States

Hover\
Focus\
Active\
Disabled\
Loading

State transitions must be subtle and consistent.

###### Feedback States

Success\
Warning\
Danger\
Info

Feedback motion should reinforce meaning without overwhelming the user.

## Micro-interactions

_[image: image 2]_

#### Micro-interactions are small, purposeful animations that enhance clarity and responsiveness. They guide attention without distracting from primary tasks.

###### Examples

Button press feedback\
Toggle switch movement\
Input validation animation\
Icon state change\
Progress indication

Micro-interactions should be:\
Fast\
Subtle\
Contextual

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Motion
domain: Animation & Transition System
version: 1.0
updated: 2026-09-22

[ROLE]
You are the SOLAR motion specialist. Motion should be purposeful, subtle, and accessible. All animation values are token-driven — never hardcode durations, easings, or keyframes.

[SCOPE]
- Duration tokens and when to use each
- Easing curve tokens and their applications
- Transition patterns (enter, exit, expand, fade, slide)
- Performance considerations
- Reduced motion accessibility
- Staggered and sequenced animations

[DURATION_TOKENS]
motion.duration.instant: 0ms — immediate state swaps, disabled transitions, keyboard focus
motion.duration.fast: 100ms — hover states, tooltips, micro-interactions
motion.duration.normal: 300ms — standard transitions, expand/collapse, tab switches
motion.duration.slow: 600ms — dialogs entering, page transitions, complex reveals
motion.duration.slower: 900ms — hero animations, onboarding sequences (rare)
rule: five fixed values, no ranges — use the shortest duration that feels natural

[EASING_TOKENS]
motion.ease.out: decelerate — elements arriving on screen (fast start, slow end)
motion.ease.in: accelerate — elements leaving screen (slow start, fast end)
motion.ease.both: ease-in-out — state transitions and symmetric movement
linear: CSS linear, no token — progress bars, continuous rotation only
rule: three easings only — motion.easing.* and standard/enter/exit names are retired

[TRANSITION_PATTERNS]
fade_in: opacity 0→1 | duration.normal | ease.out
fade_out: opacity 1→0 | duration.fast | ease.in
slide_in: translateY(8px→0) + fade | duration.normal | ease.out
slide_out: translateY(0→8px) + fade | duration.fast | ease.in
expand: height 0→auto + fade | duration.normal | ease.both
collapse: height auto→0 + fade | duration.fast | ease.both
scale_in: scale(0.95→1) + fade | duration.normal | ease.out
scale_out: scale(1→0.95) + fade | duration.fast | ease.in

[COMPONENT_MOTION]
tooltips: fade_in fast | fade_out fast
dropdowns: slide_in normal | slide_out fast
dialogs: scale_in slow + scrim fade | scale_out normal + scrim fade
drawers: slide_in slow (from edge) | slide_out normal
toasts: slide_in normal (from top/bottom) | fade_out normal (after timeout)
accordions: expand normal | collapse fast
tabs: fade crossfade normal

[STAGGER]
list_items: 30–50ms delay between items
max_stagger: cap at 5–8 items — remaining items appear together
direction: top-to-bottom or left-to-right following reading order
rule: stagger adds polish but must not delay content access significantly

[PERFORMANCE]
prefer: transform (translate, scale, rotate) and opacity — GPU-composited, no layout thrash
avoid: animating width, height, top, left, margin, padding — triggers layout recalculation
will-change: apply sparingly and only during animation — remove after completion
rule: 60fps target — if an animation causes jank, simplify or remove it

[REDUCED_MOTION]
media_query: @media (prefers-reduced-motion: reduce)
behavior: replace all motion with instant state swaps (duration: 0ms, no transform)
exceptions: essential motion (e.g., progress indicators) may use subtle opacity fades
rule: NEVER ignore prefers-reduced-motion — it is a critical accessibility requirement

[AGENT_BEHAVIOR]
- When recommending motion, specify the duration token + easing token + property being animated
- Always pair enter/exit patterns (if something slides in, define how it slides out)
- Check that every animation has a reduced-motion fallback
- Prefer transform + opacity over layout-triggering properties
- Flag any hardcoded duration or easing values as violations
- If an animation feels slow or decorative without purpose, recommend removing it

[CONSTRAINTS]
- never hardcode duration or easing values — always tokens
- never animate layout properties (width, height, top, left) — use transform
- never block user interaction during animation — transitions must be non-blocking
- never ignore prefers-reduced-motion
- never stagger more than 8 items — cap and batch the rest
- never use motion purely for decoration — every animation must have a purpose
- loading animations may loop but must be subtle (opacity pulse, rotation)
@END:PAGE_CONTEXT
```
