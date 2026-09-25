# Storybook — the review surface

```sh
npm run storybook          # from the repository root: http://localhost:6006
```

A viewer for the generated components, to look at what the checks measure. Every story is built
from what already exists for the visual checks, so nothing here is written by hand per variant
and the gallery cannot drift from what is checked:

- **Playground**: one component with controls for its props, taken from the IR's API
  (`spec/components/<name>.json`). Hover it, press it, tab to it to see its states.
- **Variants**: every variant Figma draws (`spec/verify/<name>.json`), labelled with Figma's name,
  rendered by the component's visual case (`test/visual/cases/<name>.tsx`) with its slots filled by
  the same probes. Its platform state is forced: a pseudo-class through the pseudo-states addon, a
  class MUI sets (Button's `Mui-focusVisible`) put on the control, as the component's
  `STATE_SELECTORS` says; a pressed control is hovered too. Under each, a badge where the oracle
  excuses a difference there, for the mode showing: how many, and how many are still open findings
  (amber) or all decided (grey), each excused cell listed with its decision's reason, those only
  Dark has marked; a red line where the last web check failed it (`test/visual/.out/`, when it
  has run); and **Figma values**: what the oracle says that variant looks like. Widgetbook's tiles
  carry the same badge.
- **Light and Dark** from the toolbar: `data-theme` on the page, which tokens.css switches, as in
  an app. The visual checks measure both modes; this is where a person looks at them. (It found SOLAR's first Dark defect this way: `docs/solar-review-for-design.md`, section 8, action colours.)

`stories/solar.tsx` builds both stories for any component. A component's story file only names it,
and `npm run solar:codegen` writes it for every component (the shells are hand-written). The codegen's tables reach the browser through `.storybook/main.ts`, which
serves them as the module `virtual:solar`. Workspace packages resolve to their sources, so it needs
no build first. CI builds it and keeps the result as the `storybook` artifact.

Not here: the tweak panel of the design spec (edit a value, save an overlay rule), or Figma's own
renders beside the components, which the mirror does not store.
