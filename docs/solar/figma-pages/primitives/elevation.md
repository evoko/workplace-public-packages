# Elevation

> Verbatim text of the Figma page `Elevation` (id `1627:10994`, section primitives, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `04848690d0f9`. Curated chapter: [07-layering-elevation.md](../../07-layering-elevation.md).

## Elevation / Surfaces

Surface tokens define the substrate fill that sits beneath elevated content. They control the canvas color a card, dialog, popover, or panel rests on, ensuring consistent figure–ground separation in both light and dark modes.

Pair a surface token with a shadow/\* effect style to lift the surface off the page.

Scope: this page documents elevational surfaces only. Non-elevational surface tokens — surface/base, surface/background, surface/inverse, surface/scrim, surface/hover, surface/active, surface/muted, and the surface/feedback/\* family — are documented on the Color page.

**Token**

**Light mode**

**Dark mode**

****surface/raised****

****mono/white****

****neutral/800****

****surface/overlay****

****mono/white****

****neutral/800****

****surface/dialog****

****mono/white****

****neutral/800****

## Elevation / Shadows

Shadow effect styles express the elevation ladder. Control surfaces sit just off the page; raised, overlay, and dialog progress upward as the surface gains autonomy. Focus and feedback shadows are non-elevational — they reinforce a state on top of an already-elevated surface.

All shadow color is variable-bound and adapts to mode automatically.

**Effect**

**Layers**

**Color reference**

****shadow/control****

**y:1 / blur:1**

****shadow/subtle****

****shadow/raised****

**y:1 / blur:2**

****shadow/subtle****

****shadow/overlay****

**y:2 / blur:12**

****shadow/subtle****

****shadow/strong****

**y:4 / blur:5**

****shadow/strong****

****shadow/dialog****

**y:12 / blur:26 + spread:2**

**shadow/subtle + shadow/strong**

****shadow/focus/default****

**spread:2**

****shadow/feedback/focus****

****shadow/focus/danger****

**spread:2**

****shadow/feedback/danger****

****shadow/danger****

**y:1 / blur:1 + spread:2**

**shadow/subtle + shadow/feedback/danger**

****shadow/warning****

**y:1 / blur:1 + spread:2**

**shadow/subtle + shadow/feedback/warning**

## Elevation / Accessibility

Elevation visuals must remain perceivable across both modes and for users with reduced contrast sensitivity. Shadows are decorative — they convey hierarchy but never carry the only signal. Every elevated surface still meets WCAG AA contrast for its intended content, and every focus state ships a non-color cue (a 2px ring) on top of the color shift.

When running an a11y review on a component that uses elevation, walk the table below.

**Concern**

**Rule**

**Why**

**Surface contrast**

**Body text on surface/raised + surface/overlay + surface/dialog must meet AA (4.5:1) in both modes — verified against color/text/primary.**

**Elevated surfaces use mode-paired primitives; verify after every primitive rebind.**

**Focus ring**

**Focus is signalled by shadow/focus/\* + the 2px ring (non-color cue). Color alone is never the focus signal.**

**WCAG 2.4.7 + 1.4.11. Users with color-vision deficiency rely on the geometric cue.**

**Danger emphasis**

**shadow/danger and shadow/focus/danger reinforce — they don't replace — the danger surface or border. Remove either and the state still reads.**

**WCAG 1.4.1 (don't rely on color alone).**

**Dialog backdrop**

**shadow/dialog must pair with surface/scrim. Bare shadow on a busy page collapses figure–ground separation.**

**Modal content needs a calm backdrop to be reliably readable.**

**Dark-mode shadow alpha**

**shadow/subtle and shadow/strong shift alpha in dark mode (5%→50%, 20%→70%). Verify shadows still read after a mode swap.**

**Dark surfaces eat low-alpha shadows; the alpha shift restores the lift cue.**

**Stacking**

**Tooltip > Toast > Dialog > Overlay > Dropdown > Sticky > Base. Encoded in the z-index ladder (CLAUDE.md §6); never override. Drawer content sits at --solar-z-dialog; backdrop at --solar-z-overlay.**

**Mis-stacked elevation traps focus under an opaque scrim — keyboard users get stuck. Tooltip outranks Toast so a tooltip on a notification stays readable.**

**Reduced motion**

**If a component uses both shadow and motion to enter (e.g., toast slide + lift), prefers-reduced-motion replaces the slide; the shadow stays.**

**Elevation cue is information; the slide is decoration.**

## Swatches bound to variables

Containers on this page whose fill is bound to a Figma variable, with their labels. Variable ids are local to the Foundations file; names come from [../../tokens/figma-variables.json](../../tokens/figma-variables.json).

| Labels                 | Rendered  | Variable id          |
| ---------------------- | --------- | -------------------- |
| Token                  | `#f5f5f5` | `VariableID:27:723`  |
| Light mode             | `#f5f5f5` | `VariableID:27:723`  |
| Dark mode              | `#f5f5f5` | `VariableID:27:723`  |
| surface/raised         | `#00b600` | `VariableID:34:3281` |
| mono/white             | `#00b600` | `VariableID:34:3281` |
| neutral/800            | `#00b600` | `VariableID:34:3281` |
| surface/overlay        | `#00b600` | `VariableID:34:3281` |
| mono/white             | `#00b600` | `VariableID:34:3281` |
| neutral/800            | `#00b600` | `VariableID:34:3281` |
| surface/dialog         | `#00b600` | `VariableID:34:3281` |
| mono/white             | `#00b600` | `VariableID:34:3281` |
| neutral/800            | `#00b600` | `VariableID:34:3281` |
| Effect                 | `#f5f5f5` | `VariableID:27:723`  |
| Layers                 | `#f5f5f5` | `VariableID:27:723`  |
| Color reference        | `#f5f5f5` | `VariableID:27:723`  |
| shadow/control         | `#00b600` | `VariableID:34:3281` |
| shadow/subtle          | `#00b600` | `VariableID:34:3281` |
| shadow/raised          | `#00b600` | `VariableID:34:3281` |
| shadow/subtle          | `#00b600` | `VariableID:34:3281` |
| shadow/overlay         | `#00b600` | `VariableID:34:3281` |
| shadow/subtle          | `#00b600` | `VariableID:34:3281` |
| shadow/strong          | `#00b600` | `VariableID:34:3281` |
| shadow/strong          | `#00b600` | `VariableID:34:3281` |
| shadow/dialog          | `#00b600` | `VariableID:34:3281` |
| shadow/focus/default   | `#00b600` | `VariableID:34:3281` |
| shadow/feedback/focus  | `#00b600` | `VariableID:34:3281` |
| shadow/focus/danger    | `#00b600` | `VariableID:34:3281` |
| shadow/feedback/danger | `#00b600` | `VariableID:34:3281` |
| shadow/danger          | `#00b600` | `VariableID:34:3281` |
| shadow/warning         | `#00b600` | `VariableID:34:3281` |
| Concern                | `#f5f5f5` | `VariableID:27:723`  |
| Rule                   | `#f5f5f5` | `VariableID:27:723`  |
| Why                    | `#f5f5f5` | `VariableID:27:723`  |
