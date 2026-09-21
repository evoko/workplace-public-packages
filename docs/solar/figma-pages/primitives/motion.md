# Motion

> Verbatim text of the Figma page `Motion` (id `1026:12195`, section primitives, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `0f555e5b7217`. Curated chapter: [13-motion.md](../../13-motion.md).

## Duration

Duration tokens define the timing values used for transitions and animations across interface components. They ensure consistent motion pacing for state changes, entrances, and exits throughout the system. Duration values should be applied through semantic motion tokens such as fade, slide, and expand transitions rather than directly using raw millisecond values.

**Token**

**Value**

****MAJOR****

**0**

****MAJOR****

**100**

****MAJOR****

**300**

****MAJOR****

**600**

****MAJOR****

**900**

## Easing

Easing tokens define the acceleration curves used for transitions and animations across interface components. They control how motion feels — whether elements accelerate, decelerate, or both — ensuring interactions feel natural and consistent throughout the system. Easing values should be applied through semantic motion tokens rather than directly using raw cubic-bezier values.

**Token**

**Value**

****MAJOR****

**ease-in**

****MAJOR****

**ease-out**

****MAJOR****

**ease-both**

## Motion / Duration

Duration tokens control how long an interface change takes. They ship from the SOLAR Foundations library — a Web-specific semantic layer (e.g., motion/duration/hover, motion/duration/expand) is a planned next workstream and not yet defined.

Until that layer lands, reference the primitives directly and follow the per-row guidance below.

**Token**

**Value**

**Use for…**

****MAJOR****

**0ms**

**Reduced-motion fallback. Resolve to this when honoring prefers-reduced-motion.**

****MAJOR****

**100ms**

**Micro-interactions: hover state, focus ring, button press, color change.**

****MAJOR****

**300ms**

**Default. Dropdown open, tab switch, panel expand, toast in/out.**

****MAJOR****

**600ms**

**Larger surface changes: dialog enter, drawer slide, page transition.**

****MAJOR****

**900ms**

**Choreographed, multi-step sequences and onboarding moments. Use sparingly.**

## Motion / Easing

Easing tokens control the rate of change across the duration. SOLAR Web defaults to ease-out for most UI transitions: motion accelerates quickly and settles naturally.

A semantic layer for direction-specific easings (e.g., motion/ease/enter ↔ out, motion/ease/exit ↔ in) is a planned next workstream.

**Token**

**CSS**

**Use for…**

****MAJOR****

**ease-out**

**Default. Element entering or settling — dropdown open, hover, button press.**

****MAJOR****

**ease-in**

**Element leaving the screen — dismissing toasts, closing drawers.**

****MAJOR****

**ease-both**

**Element staying on screen but transforming — size change, layout reflow.**

## Motion / Reduced motion

All motion must honor prefers-reduced-motion: reduce. When the user requests reduced motion, every duration resolves to motion/duration/instant (0ms) and decorative motion is removed entirely. State changes still happen — they just happen instantly.

This page documents the contract every component is expected to meet. Verify it during a11y review before any motion-using component graduates to 🟢.

**Class of motion**

**Behavior under prefers-reduced-motion**

**Examples**

**Functional state change**

**Keep — but collapse to 0ms via motion/duration/instant. The user must still see the state has changed.**

**Hover ring appears, dropdown opens, tab switches, checkbox checks, focus ring shows.**

**Decorative motion**

**Remove. Don't ship as instant; ship as absent.**

**Loading spinner pulses, hero parallax, count-up animations, ambient floats.**

**Position change (slide / pan)**

**Replace with opacity-only fade at instant duration. Don't translate.**

**Toast slide-in, drawer slide, page transition, sheet enter.**

**Size or layout change**

**Snap to final size. No tween.**

**Accordion expand, expandable card, panel resize.**

**Implementation**

**@media (prefers-reduced-motion: reduce) { \* { transition-duration: 0ms !important; transition-delay: 0ms !important; scroll-behavior: auto !important; } }. Decorative loops: set animation: none on the component (don't ship as instant — ship as absent). Transforms still need explicit transition: none per component.**

**Universal media-query baseline + per-component opt-outs for transforms and decorative animations.**

**Verification**

**QA tests every motion-using component twice — once normal, once with prefers-reduced-motion: reduce. Screenshot diff both.**

**Toast, Drawer, Dropdown, Tooltip, Spinner, all dialogs.**

## Swatches bound to variables

Containers on this page whose fill is bound to a Figma variable, with their labels. Variable ids are local to the Foundations file; names come from [../../tokens/figma-variables.json](../../tokens/figma-variables.json).

| Labels                                | Rendered  | Variable id          |
| ------------------------------------- | --------- | -------------------- |
| Token                                 | `#f5f5f5` | `VariableID:27:723`  |
| Value                                 | `#f5f5f5` | `VariableID:27:723`  |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| Token                                 | `#f5f5f5` | `VariableID:27:723`  |
| Value                                 | `#f5f5f5` | `VariableID:27:723`  |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| Token                                 | `#f5f5f5` | `VariableID:27:723`  |
| Value                                 | `#f5f5f5` | `VariableID:27:723`  |
| Use for…                              | `#f5f5f5` | `VariableID:27:723`  |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| Token                                 | `#f5f5f5` | `VariableID:27:723`  |
| CSS                                   | `#f5f5f5` | `VariableID:27:723`  |
| Use for…                              | `#f5f5f5` | `VariableID:27:723`  |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| MAJOR                                 | `#00b600` | `VariableID:34:3281` |
| Class of motion                       | `#f5f5f5` | `VariableID:27:723`  |
| Behavior under prefers-reduced-motion | `#f5f5f5` | `VariableID:27:723`  |
| Examples                              | `#f5f5f5` | `VariableID:27:723`  |
