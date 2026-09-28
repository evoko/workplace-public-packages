# Storybook — the review surface

```sh
npm run storybook          # from the repository root: http://localhost:6006
```

A viewer for the components: every variant the checks measure, and each component live. The
Variants are built from what already exists for the visual checks, so nothing there is written by
hand per variant and the gallery cannot drift from what is checked; each Playground is a small
builder written by hand per component, which never touches the checks:

- **Playground**: the component live and two-way under controls generated from its IR
  ([below](#playground)).
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
  an app. The visual checks measure both modes; this is where a person looks at them.

`stories/solar.tsx` builds both stories for any component. A component's story file only names
it, and `npm run solar:codegen` writes it for every component (the shells are hand-written). The
codegen's tables reach the browser through `.storybook/main.ts`, which serves them as the module
`virtual:solar`. Workspace packages resolve to their sources, so it needs no build first. CI builds
it and keeps the result as the `storybook` artifact.

Each component's name in the sidebar follows its approval circle, 🟢 🟡 🔴
([workflows.md, Approve a component](../../../docs/engineering/workflows.md#approve-a-component)),
worked out by `.storybook/main.ts` when Storybook starts or builds and shown by `manager.ts`. A
running `npm run storybook` shows a new approval after a restart. The deployed Storybook's
circles are as of its last deployment: an approval alone (a change to `spec/approvals.yaml` only)
may deploy nothing, since the Vercel project skips a deployment when nothing its root directory
depends on changed and the Turbo cache does not key on the record
([workflows.md, Deploy](../../../docs/engineering/workflows.md#deploy)). The charts (under one
Charts entry) and the components checked as another's state show no circle; `npm run solar:status`
has their colours.

In `storybook dev`, the **workbench bar** above each Playground acts for the web: Inspect opens a
full-screen dialog that sets a look to a SOLAR token as an overlay rule (a click on a part of the
component in its preview chooses the layer),
Report and Send to agent save notes for `/solar-feedback`, and Approve and Undo approval write
`spec/approvals.yaml` for the person pressing them. It is drawn only where the workbench service
answers, from `stories/workbench/` (`Bar.tsx`, `InspectDialog.tsx`, `preview.tsx`, `pending.tsx`,
`client.ts`, `pick.ts`); how to use it:
[workflows.md, Fix a component in the viewer](../../../docs/engineering/workflows.md#fix-a-component-in-the-viewer).

Not here: Figma's own renders beside the components, which the mirror does not store.

## Playground

Each component's Playground is the real component, working as it does in an app, under a control
for every axis and boolean, its words, every SOLAR icon (outline or solid) in an icon slot, a
composed part's show/hide toggle and its words, a content slot's placeholder, the width of the
box it sits in, and the component's own extras (a Text Input's typed `value`, an overlay's
`open`). It is two-way: clicking, typing, choosing and opening change the component and the
controls follow, and a control changes the component. An overlay opens from an "Open" button
beside it. Above it, **Reset** returns every control to its default; below it, the **event log**
shows its last five callbacks by their web names (`onClick`, `onChange: true`), which Storybook's
Actions panel receives too. The controls are args, so a reload or a shared link keeps the
Playground's state. How the controls are derived, the builder interface and the rules for a
builder are shared with Widgetbook:
[architecture.md, The viewers](../../../docs/engineering/architecture.md#the-viewers).

The builders are `stories/playground/<file>.tsx`, one per component, listed by the generated
`registry.generated.ts`. Beside them: the interface (`types.ts`), the viewer-free core
(`core.tsx`), the Storybook adapter (`adapter.tsx`), an overlay's trigger (`overlay.tsx`) and
sample content (`samples.ts`, `dates.ts`, `cards.ts`, `charts.ts`, `tables.tsx`).

The adapter syncs through `useArgs`, called in the story function. `updateArgs` reaches the story
only after a round trip through Storybook's channel, so a controlled input rendered from the args
would be put back to its old words while the tester types. The builder therefore reads a local
copy of the args: `set` writes the copy at once and sends the value, which stays pending until the
args carry it, and a control with nothing pending takes the args' value (the panel changed it, or
Reset; `syncArgs` in `core.tsx`). The Playwright test renders the same builders on a page with no
viewer (`test/visual/playground-page.tsx`, `#<slug>?width=320`).
