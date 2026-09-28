# Inspect dialog: design

**Status:** agreed with the owner on 2026-09-27; not yet planned or built. It replaces the
workbench bar's in-place Inspect panel
([workflows.md, Fix a component in the viewer](../../engineering/workflows.md#fix-a-component-in-the-viewer)).

## Why

The in-place panel is hard to read (owner, 2026-09-27, with screenshots of both viewers): every cell
of a layer has its own Scope and Set to pair, so a layer shows dozens of identical dropdowns; the
cell's name and token, the part that matters, is the smallest text; the component is pushed off
screen, so the effect of a change cannot be seen; nothing links a layer's name to the part of the
component it is; a scope reads as jargon (`selected=false · default`) with no sense of how far it
reaches; a value is a token name with no swatch or size, and nothing says whether it is Figma's or a
rule's; the variant is one long string.

## What a developer gets

The bar keeps Inspect, Report and Approve. **Inspect opens a full-screen dialog**, the same in both
viewers; it closes with its close button or Escape. While an edit is pending, opening Inspect shows
it.

SOLAR's Dialog has a fixed size and no full-screen form, so the dialog is each viewer's own
full-screen layer (the page's surface token, a Scrim behind), drawn with SOLAR components: Tree Item
for the layers, Segmented Control for each variant axis, Select for a token, Button, Text Area.

### The top row

The component's name, the close button, and **one Segmented Control per variant axis** (the state
among them), at the variant in view. Choosing a value selects the variant whose axes all match the
choices; a value no drawn variant pairs with the others is disabled. The preview redraws at once;
the properties are read again.

### Three columns

| Layers                                                                                                                                                              | Preview                                                                                                                                                                                                                 | Properties of the selected layer                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The component's layers as a tree, nested as Figma nests them (Tree Items); a layer hidden in this variant greyed and marked; a mark on a layer an overlay rule sets | The component drawn large in the chosen variant, its state forced, as the Variants page draws it; the selected layer outlined; clicking a part of the component selects its layer (the nearest layer under the pointer) | One row per cell: its name, its token (or `none`, a keyword, a raw value), its value as a person reads it (a colour swatch, a size, a text style's size, line height and weight), and where it comes from: **Figma**, **rule** or **defaults**. No controls |

Web and Flutter both outline and point: the web finds a layer by its class (`Solar<Name>-<slot>`,
`Solar<Name>--<layer>`, the root by the component's element), Flutter by its key
(`<prefix>.<layer>`, [solar_layers.dart](../../../packages/solar_flutter/lib/src/solar_layers.dart)).
Storybook's separate Point button goes.

### Editing one cell

Choosing a row opens an **editor panel** under the columns, for that cell alone:

- **Change to**: a Select of the tokens the cell may take (the same kind as its token, semantic
  only), each with its swatch or size; `none`, `FILL` and `HUG` where the cell allows them. A cell
  that offers nothing says why (a raw value the overlay allows: use Report).
- **Apply to**: the scopes in plain words, each with the number of variants a change there would
  actually alter, counted per cell (the variants that draw the layer and read that entry, other
  states falling back to it included: "md · primary, at rest (3)", "every primary (9)", "every
  variant (9)"), the narrowest chosen. A scope
  a narrower entry overrides in the variant in view is disabled with the reason ("the size md entry
  wins here"), instead of the service refusing it after the choice.
- **Why it is this now**: one line, e.g. "Figma draws radius.control" or "the rule's reason: pill
  shaped per brand".

Choosing a token starts the preview regeneration, as today.

### While an edit is pending

A **strip along the dialog's foot**: the cell, before → after, the reason field (the old reason under
it where a rule is replaced; the rules that borrow it), Keep and Undo; the preview redraws as it
would ship once the regeneration is done. After Keep's checks fail, their failures are listed in the
strip with Send to agent, Keep and Undo. The rest of the dialog stays readable and is not editable:
one pending edit at a time.

### Report and Approve

Report stays in the bar, and is also offered in the dialog, where its note carries the layer and
variant in view. Approve and Undo approval stay in the bar alone: they are about the whole component.

### Revised after the first build (2026-09-27)

A review of the first build against the owner's complaint ("what connects to what, how a change
affects it") settled these, which override the sections above where they differ:

- **Axes are Selects**, on both viewers: SOLAR's Segmented Control cannot disable a segment and takes
  2 to 5 (Button's state axis has 6).
- **The preview is drawn large**, scaled to fit its pane; the outline follows the scaling.
- **The editor sits in the properties column, under the chosen row**, titled "<layer> · <cell>";
  over the table a heading "<layer>: properties".
- **Apply to comes first**, then **Filter tokens**, then **Change to**: the scope is the decision.
  Apply to reads "<plain scope>: changes <count> of <total> variants", the scope holding today's value
  marked "(set here now)", an overridden one disabled "a narrower rule (<plain scope>) decides this
  variant". Scopes are named in plain words ("every md", "primary · at rest").
- **Filter tokens** (a SOLAR SearchField) starts at the current token's family, matches name and
  value, keeps `none` and the keywords, says "<shown> of <all>", and resets on another cell, layer or
  variant and after a set. Change to lists at most 12 tokens, then "…and N more: filter to narrow", so
  every token is reachable in both viewers (Flutter's SolarSelect menu does not scroll, and Select is
  🔴, so it is not changed; open work). The current token is marked.
- **The why line** names the rule's scope: "a rule at <plain scope> sets X: <reason>".
- **The strip** reads "<layer> · <cell>, for <plain scope> (<count> variants): <was> → <new>".
- **Origin** shows as a Tag; property rows are whole-row targets at least `size.target.min` tall.
- **Read-only states say why** ("One edit at a time: Keep or Undo the pending edit below first"); the
  preview shows "Regenerating…" while the service works.
- **A layer the new variant does not draw**: choosing that variant selects the root.
- **Where a viewer cannot locate a layer** (Flutter's 9 Material-based components), the preview names
  the selected layer instead of outlining it; the web locates every layer by its recipe `selector`.

### Revised again: draft, then save (owner, 2026-09-28)

Choosing a token wrote the rule and regenerated at once, and the viewers' reload under the open
dialog lost the reason being typed. So:

- **Choosing a scope and a token makes a draft in the dialog;** nothing is sent. The strip shows the
  draft (before → after), the reason, **Save** and **Discard**.
- **Save** sends one request with the scope, the value and the reason. Only then does the service
  write the rule with its reason, regenerate, check the approvals and run the checks.
- **After a save the app reloads** so it is rebuilt from the new files: Storybook reloads the page,
  Widgetbook hot-restarts. The service remembers where the person was, and the dialog reopens there,
  showing the saved result.
- **Failing checks** leave the edit pending with Undo, Keep again and Send to agent, as before; that
  is the only pending state. No rule is written without its reason, so the placeholder reason and
  `solar:codegen --pending` go.
- The change is not shown before it is saved (a web-only restyled preview was offered and set aside,
  so both viewers stay alike).

## What the service adds to an inspection

Read from the build; nothing new is written.

- **`axes`**: each variant axis and its values, and each variant's value on each axis.
- **Per layer, `parent`**: the layer it sits in, for the tree.
- **Per cell**: `value` (the token's value as text, as the token list shows it), `origin` (`figma`,
  `rule` or `defaults`, from the IR entry's `from`) and `reason` (the rule's, where one sets it).
- **Per scope**: `count` (how many variants that draw the layer a `set` there would change, for this cell) and `wins` (null, or the narrower
  entry that overrides it in the variant in view, as the recipe lookup finds it).

## Parity

The shared scenarios (`bar-scenarios.json`) gain the dialog's steps and facts: open and close it,
choose an axis value, select a layer (from the tree, and by pointing), select a cell, choose Apply to
and Change to; the facts shown (a cell's value and origin, a scope's count, a disabled scope's
reason, the pending before → after). Both dialogs pass every scenario, as both bars do. Pointing
becomes a shared action; `platformActions` loses `Point`.

## Tests

- The service's additions, unit-tested over real components (a tree for a nested component; counts
  that sum; `wins` for Button's primary background; origins for a Figma value, a rule and a default).
- The scenarios, run by both viewers' drivers.
- Outlining and pointing, per platform: the outline sits on the selected layer's box; a click on a
  part selects its layer (web Playwright; Flutter widget test, by the layer's key).

## Out of scope

- Editing more than one cell before Keep.
- A side-by-side before/after preview (the preview is the regenerated component).
- Grouping the viewers' sidebars.
