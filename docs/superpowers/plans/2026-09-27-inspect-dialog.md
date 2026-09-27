# Inspect Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the workbench bar's in-place Inspect panel with a full-screen Inspect dialog, the
same in Storybook and Widgetbook: variant axes, a layer tree, the component drawn large with the
selected layer outlined (and pointable), a read-only property table, one editor for the chosen cell
with plain-worded scopes and their reach, and the pending edit in a strip.

**Architecture:** The service's inspection gains what the dialog shows (`axes`, each layer's
`parent`, each cell's `value`/`origin`/`reason`, each scope's `count`/`wins`), read from the build.
Each viewer draws the dialog from SOLAR components inside its own full-screen layer, draws the
preview with the renderer its Variants page already uses, and finds a layer by its web class or its
Flutter key. The shared `bar-scenarios.json` gains the dialog's steps first; both viewers pass it.

**Tech Stack:** Node 22 (vitest), React 19 on MUI 9 with SOLAR components (Playwright), Flutter
3.47.5 with Widgetbook 3.25 (widget tests).

**Spec:** [docs/superpowers/specs/2026-09-27-inspect-dialog-design.md](../specs/2026-09-27-inspect-dialog-design.md).
The workbench as it stands: [architecture.md, The workbench](../../engineering/architecture.md#the-workbench),
[workflows.md, Fix a component in the viewer](../../engineering/workflows.md#fix-a-component-in-the-viewer).

---

## Rules for every task (CLAUDE.md; hard)

- **No git write commands** (no `add`, `commit`, `stash`, `checkout`, `reset`, worktrees): the
  owner stages and commits. Where a step would commit, skip it.
- `export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$PATH`; `node -v` must print `v22.23.2`.
- Never edit `spec/approvals.yaml`, `spec/verify/`, generated files, or `docs/solar*/`.
- Every style value a SOLAR semantic token (CSS variable or the generated Dart token); no px, hex,
  ms literals.
- Never start the workbench service against the repository, and never call its Keep, Approve, Undo
  approval, Report or Send; call Set only in a smoke run that undoes it (Task 7).
- The two viewers behave alike: `packages/codegen/src/workbench/bar-scenarios.json` is the
  contract, and both drivers must pass every scenario.
- Stop for the owner's review after each batch (after Tasks 1, 5 and 7).

## File structure

| File                                                                                      | Responsibility                                                                  |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `packages/codegen/src/workbench/inspect.mjs` (modify)                                     | the inspection's new fields                                                     |
| `packages/codegen/src/workbench/reach.mjs` (create)                                       | a scope's reach (`count`) and what overrides it (`wins`): pure, over the IR     |
| `packages/codegen/test/workbench-inspect.test.mjs`, `workbench-reach.test.mjs`            | their tests                                                                     |
| `packages/codegen/src/workbench/bar-scenarios.json` (modify)                              | the dialog's scenarios and vocabulary                                           |
| `packages/components/stories/workbench/InspectDialog.tsx` (create)                        | the web dialog                                                                  |
| `packages/components/stories/workbench/preview.tsx` (create)                              | one variant drawn large, the selected layer outlined, a click → a layer         |
| `packages/components/stories/workbench/Bar.tsx`, `client.ts` (modify)                     | open the dialog; the in-place panel and Point removed; the new inspection types |
| `packages/components/stories/solar.tsx` (modify)                                          | export the one-variant renderer the Variants tiles use                          |
| `packages/solar_flutter/widgetbook/lib/workbench/inspect_dialog.dart` (create)            | the Flutter dialog                                                              |
| `packages/solar_flutter/widgetbook/lib/workbench/preview.dart` (create)                   | one variant drawn large, outline by the layer's key, a tap → a layer            |
| `packages/solar_flutter/widgetbook/lib/workbench/{bar,models,client}.dart` (modify)       | as the web's                                                                    |
| `packages/solar_flutter/widgetbook/lib/main.dart`, `lib/playground/adapter.dart` (modify) | give the dialog the oracle and the variant renderer                             |
| the scenario drivers and per-platform tests                                               | the new step kinds; outline and pointing                                        |

## The inspection's new fields (both clients use exactly these)

```
Inspection += {
  axes: [{ name: string, values: string[] }],            // Figma's axis names, values in order drawn
  variants: [{ index, name, parts: { [axis]: value } }], // parts added
  layers: [{ …, parent: string | null }],                // the nearest layer the variant draws
                                                         // that it sits in; null for the root
  layers[].cells: [{ …,
    value: string,                    // the current entry as a person reads it: a token's value
                                      // text, a literal, a keyword, 'none'
    origin: 'figma' | 'rule' | 'defaults',
    reason: string | null,            // the rule's or the default's reason, where one sets it
    scopes: [{ label, key, count: number, wins: string | null }], // count: the variants that draw
                                      // the layer a set at the scope would change
  }],
}
```

`wins` is the recipe position (`size md`, `appearance prio=primary, danger=false · default`, …) of the
entry that overrides the scope in the variant in view, or null. A scope with `wins` is shown
disabled with the reason "the <wins> entry wins here".

---

# Batch 1: the service

### Task 1: axes, parents, values, origins, reach

**Files:**

- Create: `packages/codegen/src/workbench/reach.mjs`
- Modify: `packages/codegen/src/workbench/inspect.mjs`
- Test: `packages/codegen/test/workbench-reach.test.mjs`, extend `packages/codegen/test/workbench-inspect.test.mjs`

- [x] **Steps 1–5: tests, `reach.mjs`, `inspect.mjs`, the suite and the timing** (built)

  - The lookup's precedence is one list, `lookupOrder(spec, variant)` in `explain/index.mjs`: each
    state that holds, highest first (combined, then appearance), then the resting look (combined,
    appearance), size, base, each with its `at` and IR `path`. `lookupCell` walks it, so nothing
    else restates the precedence (no fixed rank: a higher state's appearance entry beats a lower
    state's combined one).
  - `reach.mjs`: `winsOver(spec, layer, cell, variant, path)` is the `at` of the first position
    before `path` in the variant's order holding an entry for the cell, or null.
    `reachOf(spec, oracle)` reads every variant's order once and gives `count(layer, cell, path)`:
    how many variants that draw the layer a set at `path` would change (the `winsOver` rule in
    each), and `winsOver(layer, cell, index, path)`.
  - `inspect.mjs`: `axes`, variant `parts`, `parent` (the nearest layer the variant draws),
    `value` (`valueText` of a token; a literal, keyword, position, gradient, `none`; else
    `entryText`), `origin`, `reason`, and per scope `count` and `wins`.
  - Tests (`workbench-reach.test.mjs`, `workbench-inspect.test.mjs`): measured counts (Button md
    primary at rest, root background: 9, 3, 9, 3; Text Input's field border at base: 4; Accordion's
    title drawn in 3 of 6); the order for a hover variant; and a round trip over Button, Text Input,
    Dropdown, Option Card, Calendar Day Cell and Accordion that sets every offered scope to `none`,
    builds it, and proves each `wins` (null: the set is drawn; else the named entry still is) and
    each `count` (the drawn variants that then draw the set).
  - Timing: a Button inspection after the build takes about 5 ms.

- [x] **Step 6: The session and server tests still pass, and the contract note**

Run: `cd packages/codegen && npx vitest run test/workbench-session.test.mjs test/workbench-server.test.mjs test/workbench-scenarios.test.mjs`
Expected: PASS (the new fields are additive). Update the Inspection line of the HTTP contract in
[docs/engineering/architecture.md, The workbench](../../engineering/architecture.md#the-workbench)
with the fields above (prettier --write it).

- [ ] **Step 7: Stop for the owner's review of Batch 1.**

---

# Batch 2: the dialog in both viewers

### Task 2: the dialog's scenarios first

**Files:**

- Modify: `packages/codegen/src/workbench/bar-scenarios.json` (vocabulary and scenarios)
- Modify: `packages/codegen/test/workbench-scenarios.test.mjs`
- Modify: both drivers, `packages/components/test/visual/workbench-scenarios.spec.mjs` and
  `packages/solar_flutter/widgetbook/test/workbench_scenarios_test.dart` (the new kinds, which fail
  until Tasks 3 and 4 draw the dialog)

- [ ] **Step 1: Read the file's `about` and `vocabulary`, and the drivers**, so the new kinds follow
      the existing rules (exhaustive offered controls, serial events, unknown kinds fail).

- [ ] **Step 2: Extend the vocabulary, minimally**

  - Actions: `Close` (the dialog's close button), each axis's Segmented Control named by the axis
    (`Axis <name>`, e.g. `Axis state`), `Layer <name>` (a tree item), `Cell <name>` (a property
    row), `Apply to` (the scope choice), `Change to` (the token Select; replaces the in-panel
    `Set to`), and the existing `Keep`, `Undo`, `Reason`, `Report`, `Send to agent`, `Agent note`.
    Remove `Scope`, `Set to`, `Variant`, `Layer` and `Point` from the vocabulary (the panel's).
  - Steps: `{ "press": "Inspect" }` opens the dialog; `{ "choose": { "select": "Axis state",
"option": "hover" } }`; `{ "press": "Layer label" }`; `{ "press": "Cell radius" }`;
    `{ "choose": { "select": "Apply to", "option": "every variant" } }`; `{ "choose": { "select":
"Change to", "option": "radius.full" } }`; `{ "press": "Close" }`; `{ "point": "label" }` (click
    or tap the part of the preview that is the layer, found by its class or key).
  - Expectations: `shows` facts now include a cell's value and origin ("radius.pill", "rule"), a
    scope's count ("(4)"), a disabled scope's reason ("wins here"), the pending before → after, and
    `outlined: "<layer>"` (the preview's outline is on that layer's box: both drivers can assert it,
    the web by the outline element's box against the layer element's, Flutter by the outline's rect
    against the keyed widget's).
  - The fake: `inspection` fixtures gain `axes`, `parts`, `parent`, `value`, `origin`, `reason`,
    `count`, `wins`; each driver renders the preview for the scenario's component from its own
    oracle (Button's), so the fixture's layer names must be Button's real ones.

- [ ] **Step 3: Rewrite the Inspect scenarios** (replace the in-panel ones; keep the ids of the
      rest). At least:

  1. Inspect opens the dialog: the axes, the layer tree (root, label, …, hidden ones marked), the
     preview, root's property table with values and origins; Close ends it; the bar's other
     actions are unchanged.
  2. Choosing an axis value reads the matching variant (`reads` has `/component … variant=<i>`),
     and a value no drawn variant pairs with the others is disabled.
  3. Choosing a layer in the tree shows its cells and outlines it; pointing at a part selects its
     layer.
  4. Choosing a cell opens its editor: Change to lists its tokens with values; Apply to lists the
     scopes with counts, the narrowest chosen, a `wins` scope disabled with its reason; a cell with
     a note or nothing to offer says so and offers no Change to.
  5. Change to sends the exact `/set` body (component, variant, layer, cell, scope = the chosen
     Apply to, value, revision).
  6. A pending edit shows the strip (before → after, reason, old reason, borrowers), Keep sends the
     reason, Undo undoes; the rest of the dialog is not editable while it is pending.
  7. After Keep's checks fail: the strip lists the failures with Send to agent, Keep and Undo.
  8. Report from inside the dialog carries the layer and variant in view.
  9. Opening Inspect while an edit is pending shows it.
  10. A component that stops being editable while the dialog is open (a `changed` event with a 🟢
      status): the dialog closes.

  Keep every existing non-Inspect scenario, adjusting only the controls lists (the bar no longer has
  Variant, Layer, Scope, Set to or Point).

- [ ] **Step 4: Extend both drivers with the new kinds and run them: the Inspect scenarios must FAIL
      on both viewers** (the dialog does not exist yet); every other scenario must still pass.

Run: `cd packages/codegen && npx vitest run test/workbench-scenarios.test.mjs` (PASS),
`cd packages/components && npx playwright test workbench-scenarios.spec.mjs` and
`cd packages/solar_flutter/widgetbook && flutter test test/workbench_scenarios_test.dart`
Expected: only the Inspect scenarios fail, on both.

### Task 3: the web dialog

**Files:**

- Create: `packages/components/stories/workbench/InspectDialog.tsx`, `preview.tsx`
- Modify: `packages/components/stories/workbench/Bar.tsx`, `client.ts`, `pick.ts` (reused by the
  preview), `packages/components/stories/solar.tsx` (export the one-variant renderer),
  `packages/components/stories/playground/adapter.tsx` if the dialog needs the case
- Test: `packages/components/test/visual/workbench-dialog.spec.mjs` (outline and pointing), the
  scenarios

- [ ] **Step 1: Export the one-variant renderer.** In `stories/solar.tsx`, the Variants page draws
      each oracle variant through its case (`caseOf(component)`, the `Tile`'s stage). Export a
      `VariantStage({ component, index, mode })` that draws that one variant with its state forced, as
      the tile does, without the tile's captions. The Variants page uses it too, so the two cannot
      differ.

- [ ] **Step 2: `preview.tsx`.** `Preview({ component, index, layer, classes, onPoint })`: the
      `VariantStage` inside a large stage (the page's surface token, `inset.lg` padding, centred); an
      outline drawn over the selected layer's element (found by `classes[layer]`, the root by the
      stage's first element), re-measured on resize and after the regeneration (a `ResizeObserver`
      and a `MutationObserver` on the stage); the outline a `border` in `--solar-color-border-focus`
      (or the nearest semantic focus token that exists — check tokens.css), no literal widths (use
      `--solar-border-strong` or the existing border-width token). A click on the stage selects
      `layerAt(target, stage, classes)` (pick.ts) and never reaches the component.

- [ ] **Step 3: `InspectDialog.tsx`.** A full-screen layer rendered in a portal over the page
      (`position: fixed; inset: 0`, the surface token as its background, a SOLAR Scrim behind), focus
      trapped inside and Escape closing it, `role="dialog"`, `aria-modal`, labelled by its title. Its
      parts, top to bottom:

  - the header: the component's name (a SOLAR text style), a SOLAR `SegmentedControl` per axis
    (`inspection.axes`; the value in view from `variants[variant].parts`; a value that pairs with
    no drawn variant given the other choices disabled), and a SOLAR `IconButton` Close;
  - three columns (CSS grid, the gaps `--solar-inset-md`): the layer tree (SOLAR `TreeItem`s built
    from each layer's `parent`, a hidden layer greyed with "hidden here", a mark on a layer any of
    whose cells has `origin: 'rule'`), the `Preview`, and the property table (a plain table styled
    with tokens: cell, token, value with a swatch for a colour, origin; each row a button that
    selects the cell);
  - the editor, under the columns, for the selected cell: `Change to` (SOLAR `Select` of
    `choices` with swatches, then `keywords`, then `none`; or the cell's note), `Apply to` (SOLAR
    `Select` of `scopes`, each `label (count)`, the narrowest chosen, a `wins` scope disabled with
    "the <wins> entry wins here"), and "Why it is this now" (`origin` and `reason`);
  - the pending strip along the foot when `status.pending` is this component's: before → after, the
    reason `TextArea` (the old reason and borrowers under it), Keep and Undo; after failing checks
    the failure list with Send to agent — reuse the bar's existing pending and Send blocks (move
    them into shared components rather than copying);
  - a Report button in the header opening the bar's Report section with the dialog's layer and
    variant.

  Choosing an axis value finds the variant whose `parts` all match and re-reads the inspection
  (`client.inspect(component, index)`); choosing Change to calls `client.set` as the panel did.
  While an edit is pending or an action runs, everything but the strip is disabled.

- [ ] **Step 4: `Bar.tsx`.** Inspect opens the dialog (the bar's in-place panel, its per-cell rows
      and Point are removed). The dialog closes when the component stops being inspectable (the
      existing `canInspect` rule). Update `client.ts`'s `Inspection` type with the new fields.

- [ ] **Step 5: `workbench-dialog.spec.mjs`.** Against the scenario page with Button: the outline's
      box equals the selected layer's box (±1 px of rounding, measured with `boundingBox`); clicking
      Button's label in the preview selects `label`; the dialog traps focus and Escape closes it.

- [ ] **Step 6: Run everything web**

Run: `cd packages/components && npx playwright test workbench-scenarios.spec.mjs workbench.spec.mjs workbench-dialog.spec.mjs playground.spec.mjs`, `npm run typecheck`, `npm run lint`.
Expected: PASS, the Inspect scenarios included.

### Task 4: the Flutter dialog

**Files:**

- Create: `packages/solar_flutter/widgetbook/lib/workbench/inspect_dialog.dart`, `preview.dart`
- Modify: `lib/workbench/{bar,models,client}.dart`, `lib/main.dart` (the oracles and the variant
  renderer reach the playground), `lib/playground/adapter.dart`
- Test: `test/workbench_dialog_test.dart` (outline and pointing), the scenarios

- [ ] **Step 1: The one-variant renderer.** `lib/main.dart`'s `Variants` draws each oracle variant
      through `solar_flutter_variants` with its state forced. Extract `VariantStage(component, oracle,
index)` that draws one, used by `Variants` too, and make the oracles reachable from the
      Playground (pass them into `solarPlayground`, or an `InheritedWidget` above the use cases).

- [ ] **Step 2: `preview.dart`.** `WorkbenchPreview(component, oracle, index, layer, onPoint)`:
      the `VariantStage` in a large stage; the outline painted in an overlay over the render box of the
      widget keyed `<prefix>.<layer>` (read the prefix convention in
      `packages/solar_flutter/lib/src/solar_layers.dart`: `Key('$keyPrefix.$name')`; find the element
      under the stage whose key matches, take its `RenderBox` bounds relative to the stage), repainted
      after layout (a post-frame callback); a tap on the stage hit-tests, walks the hit path for the
      nearest keyed layer and calls `onPoint(layer)`, absorbing the tap so the component never sees it.
      Colours and widths from the generated tokens (`SolarTheme` colours, `SolarBorder`).

- [ ] **Step 3: `inspect_dialog.dart`.** A full-screen route (`showGeneralDialog` or a
      `PageRoute` with the Scrim), the same parts and behaviour as the web's (Task 3, Step 3) from
      SOLAR widgets: `SolarSegmentedControl` per axis, `SolarTreeItem`s, a `Table` of rows as
      pressables, `SolarSelect` for Change to and Apply to, the shared pending and Send blocks, a
      `SolarIconButton` Close; Escape closes it (`Shortcuts`/`Actions`).

- [ ] **Step 4: `bar.dart`.** Inspect opens the dialog; the in-place panel and its rows are removed;
      `models.dart` gains the new fields.

- [ ] **Step 5: `workbench_dialog_test.dart`.** Button: the outline's rect equals the keyed label's
      rect; a tap on the label in the preview selects `label`; Escape closes the dialog.

- [ ] **Step 6: Run everything Flutter**

Run: `cd packages/solar_flutter/widgetbook && dart format lib test && flutter analyze && flutter test`,
and `node scripts/widgetbook.mjs build` from the root.
Expected: PASS, the Inspect scenarios included.

### Task 5: Batch 2 review, then stop

- [ ] **Step 1:** a reviewer compares the two dialogs against the spec and each other (behaviour,
      not looks), and checks tokens-only styling, focus, Escape, disabled states, the preview's outline
      after a regeneration, and that no in-place panel code is left.
- [ ] **Step 2:** fix what it finds; both drivers pass every scenario.
- [ ] **Step 3: Stop for the owner's review of Batch 2.**

---

# Batch 3: docs, Verify, smoke

### Task 6: the docs

- [ ] [workflows.md, Fix a component in the viewer](../../engineering/workflows.md#fix-a-component-in-the-viewer):
      rewrite its Inspect part for the dialog (axes, tree, preview with outline and pointing on both
      viewers, the property table's origins, Apply to with its reach and why a scope is disabled, the
      pending strip).
- [ ] [architecture.md, The workbench](../../engineering/architecture.md#the-workbench): the
      Inspection's fields (Task 1), the dialog as each viewer's own full-screen layer of SOLAR
      components, the preview's renderer shared with the Variants pages.
- [ ] decisions.md: the owner's decision (2026-09-27): a full-screen Inspect dialog replaces the
      in-place panel, and why; Taken rows: SOLAR's Dialog has no full-screen form, so each viewer draws
      its own layer from SOLAR components; `wins` disables a scope before the choice; pointing on both.
- [ ] open-work.md: remove "pointing at a layer is the web's alone".
- [ ] the viewers' READMEs (one line each), `packages/components/test/visual/README.md`
      (`workbench-dialog.spec.mjs`), the Widgetbook README (`workbench_dialog_test.dart`).
- [ ] decisions-to-review.md: new entries for this plan's own calls.
- [ ] Prettier on every changed file; the personal-data check; the links resolve.

### Task 7: Verify and the smoke run, then stop

- [ ] **Step 1:** the whole Verify block
      ([workflows.md, Verify](../../engineering/workflows.md#verify-before-saying-a-task-is-done)).
- [ ] **Step 2: Smoke in both viewers** (`npm run storybook`, `npm run widgetbook`): open a 🟡
      component's Inspect, change an axis, select a layer in the tree and by pointing (the outline
      follows), choose a cell, see the counts, Change to a token (the preview redraws as it would ship),
      press **Undo**; `git status --porcelain` on the generated paths is then empty. Never press Keep,
      Approve, Report or Send.
- [ ] **Step 3: Stop for the owner's review of Batch 3.** Delete this plan and its spec after the
      owner commits.
