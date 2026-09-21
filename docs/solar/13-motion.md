---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/motion: b8f0cb82f962
    primitives/motion: 0f555e5b7217
---

# 13 · Motion

> Source: Figma pages "Motion" (about, principles, duration & easing, transitions, state
> changes, micro-interactions), "Primitives › Motion" (duration, easing, reduced motion)
> and the Motion page's `@SOLAR:PAGE_CONTEXT`. Values verified against the Primitives
> collection.

## Position

Motion communicates change and reinforces hierarchy across interactions. It clarifies
state transitions, preserves spatial context, and improves usability. Motion is never
decorative; it is intentional, restrained, and system-driven.

| Principle                              | Meaning                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Motion has purpose**                 | Animation communicates state, causality, or hierarchy. If it does not improve understanding, do not implement it      |
| **Preserve context and continuity**    | Transitions maintain spatial and structural relationships; users understand what changed and why without losing focus |
| **Subtle, consistent, and accessible** | Predictable and restrained; never blocks task completion; always respects reduced-motion preferences                  |

Motion defines temporal behaviour; visual language defines expression; components
operate within both.

## Duration tokens

Figma: Primitives › `motion/duration/*`. Documentation: `motion.duration.*`. CSS:
`--solar-motion-duration-*`.

| Token     | ms  | Use for                                                                                  |
| --------- | --- | ---------------------------------------------------------------------------------------- |
| `instant` | 0   | Reduced-motion fallback; disabled transitions; immediate state swaps                     |
| `fast`    | 100 | Micro-interactions: hover state, focus ring, button press, color change, tooltips        |
| `normal`  | 300 | **Default.** Dropdown open, tab switch, panel expand, toast in/out, standard transitions |
| `slow`    | 600 | Larger surface changes: dialog enter, drawer slide, page transition, complex reveals     |
| `slower`  | 900 | Choreographed multi-step sequences, onboarding, hero moments. Use sparingly              |

Duration reflects distance and complexity, not preference. Use the shortest duration
that feels natural. (The page context quotes looser ranges such as 100–150 ms and
200–300 ms; the tokens are the exact values above.)

## Easing tokens

Figma: Primitives › `motion/ease/*`. Documentation: `motion.easing.*` (grammar slide)
or `motion.ease.*` (Figma path). CSS: `--solar-motion-ease-*`.

| Token       | CSS           | Use for                                                                                     |
| ----------- | ------------- | ------------------------------------------------------------------------------------------- |
| `ease-out`  | `ease-out`    | **Default.** Entering or settling: dropdown open, hover, button press. Fast start, slow end |
| `ease-in`   | `ease-in`     | Leaving the screen: dismissing toasts, closing drawers. Slow start, fast end                |
| `ease-both` | `ease-in-out` | Staying on screen but transforming: size change, layout reflow, state transitions           |

The page context additionally lists `motion.easing.standard`, `enter`, `exit` and
`linear` (for progress bars and continuous rotation). A Web-specific semantic motion
layer (`motion/duration/hover`, `motion/duration/expand`, `motion/ease/enter`,
`motion/ease/exit`, …) is a **planned next workstream and not yet defined**. Until it
lands, reference the primitives directly and follow the per-token guidance.

## Transition patterns

| Pattern   | Properties                 | Duration | Easing    |
| --------- | -------------------------- | -------- | --------- |
| fade in   | opacity 0 → 1              | normal   | ease-out  |
| fade out  | opacity 1 → 0              | fast     | ease-in   |
| slide in  | translateY(8px → 0) + fade | normal   | ease-out  |
| slide out | translateY(0 → 8px) + fade | fast     | ease-in   |
| expand    | height 0 → auto + fade     | normal   | ease-both |
| collapse  | height auto → 0 + fade     | fast     | ease-both |
| scale in  | scale(0.95 → 1) + fade     | normal   | ease-out  |
| scale out | scale(1 → 0.95) + fade     | fast     | ease-in   |

Component defaults:

| Component | Enter                            | Exit                             |
| --------- | -------------------------------- | -------------------------------- |
| Tooltip   | fade in, fast                    | fade out, fast                   |
| Dropdown  | slide in, normal                 | slide out, fast                  |
| Dialog    | scale in, slow + scrim fade      | scale out, normal + scrim fade   |
| Drawer    | slide in from edge, slow         | slide out, normal                |
| Toast     | slide in from top/bottom, normal | fade out, normal (after timeout) |
| Accordion | expand, normal                   | collapse, fast                   |
| Tabs      | crossfade, normal                | —                                |

Types of transition: opacity (fade), transform (scale, slide), layout expansion or
collapse, elevation shifts. Large structural transitions (navigation expansion, sidebar
collapse, dialog entry/exit, page-level) need proportionally longer durations.

Stagger: 30–50 ms between list items, capped at 5–8 items (the rest appear together),
following reading order; must not delay content access significantly.

## State changes and micro-interactions

Interaction states (hover, focus, active, disabled, loading) transition subtly and
consistently; feedback states (success, warning, danger, info) reinforce meaning without
overwhelming. Micro-interactions (button press, toggle movement, input validation, icon
state change, progress indication) are fast, subtle, and contextual. Focus and disabled
transitions are instant.

## Performance

- Prefer `transform` (translate, scale, rotate) and `opacity`: GPU-composited.
- Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding`.
- Apply `will-change` sparingly and only during animation.
- Target 60 fps; if an animation janks, simplify or remove it.
- Transitions never block user interaction.

## Reduced motion contract

All motion honours `prefers-reduced-motion: reduce`. State changes still happen; they
happen instantly.

| Class of motion               | Behaviour under reduced motion                                          | Examples                                                     |
| ----------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| Functional state change       | Keep, collapsed to 0 ms via `motion.duration.instant`                   | Hover ring, dropdown opens, tab switch, checkbox, focus ring |
| Decorative motion             | **Remove entirely** (ship as absent, not instant)                       | Spinner pulses, hero parallax, count-ups, ambient floats     |
| Position change (slide / pan) | Replace with an opacity-only fade at instant duration; do not translate | Toast slide-in, drawer slide, page transition, sheet enter   |
| Size or layout change         | Snap to final size; no tween                                            | Accordion expand, expandable card, panel resize              |

Implementation baseline:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0ms !important;
    transition-delay: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

Decorative loops additionally set `animation: none` on the component; transforms need an
explicit `transition: none` per component. Essential motion (progress indicators) may
keep a subtle opacity fade. QA tests every motion-using component twice, normal and
reduced, with screenshot diffs (Toast, Drawer, Dropdown, Tooltip, Spinner, all dialogs).

## Agent behaviour (from the page context)

- Specify duration token + easing token + animated property for every recommendation.
- Always pair enter and exit patterns.
- Check that every animation has a reduced-motion fallback.
- Flag hard-coded durations or easings as violations; recommend removing motion that is
  slow or purely decorative.
- Never stagger more than 8 items; loading animations may loop but must be subtle.
