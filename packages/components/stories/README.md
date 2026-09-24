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
  `STATE_SELECTORS` says; a pressed control is hovered too. Under each, **Figma values**: what the
  oracle says that variant looks like.
- **Light and Dark** from the toolbar: `data-theme` on the page, which tokens.css switches, as in
  an app. The visual checks measure Light only, so Dark is where this surface sees what they
  cannot. (It found SOLAR's first Dark defect this way: `docs/solar-review-for-design.md`, section 10.)

`stories/solar.tsx` builds both stories for any component. A component's story file only names it,
and `npm run solar:scaffold <Name>` writes it with the shell; a codegen test fails for a generated
component without one. The codegen's tables reach the browser through `.storybook/main.ts`, which
serves them as the module `virtual:solar`. Workspace packages resolve to their sources, so it needs
no build first. CI builds it and keeps the result as the `storybook` artifact.

Not here: the tweak panel of the design spec (edit a value, save an overlay rule), or Figma's own
renders beside the components, which the mirror does not store.
