# Milestone 3b-1 — the component machinery, proven on Button

The shared machinery the next ten components need, built and proven on Button before any of them
is generated. Milestone 3a proved the spine on one component; measuring the next six against it
showed four of them fail in today's pipeline and two build wrongly, and none of those failures is
specific to one component.

Design: [the docs-to-code spec](../specs/2026-09-21-solar-docs-to-code-design.md), sections 4.2,
7 (visual parity) and 10. Previous plan:
[3a, the spine](2026-09-22-solar-component-spine.md), whose "Found for 3b" notes this plan
answers.

| Plan     | Covers                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------- |
| **3b-1** | Fetcher fixes, layer naming, boolean state axes, Flutter widget shells, visual parity against Figma — all on Button |
| 3b-2     | Text Input, Checkbox, Tabs and Tab, Icon Button, Button Group, Tag, Card, Dialog, Sparkline           |
| 3c       | The developer loop: Storybook tweak panel, `explain`, `adopt`, `audit`                                |

## What measuring the six found

Run through today's pipeline, 2026-09-23:

| Component  | Result      | Cause                                                                                    |
| ---------- | ----------- | ---------------------------------------------------------------------------------------- |
| Text Input | fails       | `/Field/Label` and `/Label` both become `label`                                          |
| Checkbox   | builds, wrong | its `hover`, `focus` and `disabled` axes become props; 2 layers are added with no contents |
| Card       | fails       | name collision; the loading skeletons are added layers with no contents                  |
| Dialog     | fails       | name collision; 5 added layers (image, title, body, stepper)                              |
| Tabs       | fails       | name collision among its 8 `Tab Item` instances                                          |
| Sparkline  | builds      | its one layer is a `VECTOR` line, which the recipe reads as a frame                      |

And from 3a: 58 of SOLAR Web's 119 sets add layers the fetcher records by path alone; 31 have icons
whose colours the variant digest cannot attribute to a layer; and a paint's opacity looked dropped
when the colour is bound to a variable (it is not; see Task 1).

## Decisions taken (owner, 2026-09-23)

| Question                            | Decision                                                                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| How is 3b split?                    | Two plans: this one, the machinery proven on Button, then 3b-2, the components on top.                                                              |
| Flutter widgets?                    | Hand-owned widget shells, scaffolded once, with the same props as React: `SolarButton`, `SolarTextInput`… The recipe beside them regenerates.       |
| Which composed children come along? | A composed child is a slot unless the parent cannot look like SOLAR without it. By decision: **Tab Item** (as `<Tab>` in `<Tabs>`), **Icon Button**, **Tag** and **Button Group** are all generated components in 3b-2. |

## Notes for whoever executes this

- **The repository owner handles all version control.** No git write commands.
- `docs/` is read-only to the generator. The fetchers under `docs/` are tooling, not the mirror:
  changing them is allowed, and their output arrives with the owner's next `solar:sync`.
- Run npm under Node 22 (`~/.nvm/versions/node/v22.23.2/bin`): the editor terminal's npm 11
  rewrites `package-lock.json`. Flutter is pinned to 3.24.4.
- The corpus guard in `test/recipe.test.mjs` pins which of the 119 sets derive. A task that
  changes that set updates the guard deliberately, in the same change.

---

### Task 1: The fetcher records what 3a found missing

**Files:** modify `docs/solar-web/raw/fetch-rest.mjs`, `docs/solar-web/schema.md`.

Three additions, each written so an unchanged Figma file produces an unchanged raw file apart from
the new fields:

- **Added layers carry their subtree.** `overrides.added` becomes a list of
  `{path, parent, layer}` with the layer in the same shape as the default tree, not a path alone.
- **Icon instances carry their fill.** An `INSTANCE` whose main component is an icon records the
  distinct fills of its vector descendants as `iconFills`, so the colour is tied to the icon that
  draws it rather than guessed from the variant digest.
- ~~**A bound paint keeps its opacity**~~ — dropped after measuring; see below.

Then the owner runs one `npm run solar:sync`. Verify: the Button recipe is byte-identical except
where the new data says otherwise; the count of sets with unresolved added layers drops from 58.

**Done 2026-09-23, synced by the owner the same day**, and the sync wrote exactly what the harness
predicted: every raw page byte for byte, `solar:rebuild` deterministic. Verified before any sync with an offline harness: a
copy of the fetcher whose Figma client serves the REST responses cached by the last sync. Run
unchanged, it reproduced all 146 committed raw pages byte for byte, and the docs built from them
matched the committed docs, so the comparison is faithful. With the change:

- **Added layers** carry `{path, parent, layer}`; the sets with unresolved added layers go from
  58 to 0.
- **Icon instances** carry `iconFills`, diffed per variant (525 new per-variant icon colours).
  The sets whose icon colours cannot be attributed go from 31 to 0 (Task 2); the 15 the harness
  first left were not two-tone icons but the digest fallback reading icons inside composed
  children.
- **Bound-paint opacity was dropped from the task after measuring it.** For a bound colour REST
  reports the variable's own alpha as the paint's opacity: in all 1742 cases it equalled the
  token's alpha, and not one differed. Writing it would have drawn secondary's 20% border at 4%.
  3a's note that opacity was being lost was wrong; nothing was. `schema.md` says so.

Button, rebuilt from the new data, draws exactly what it draws today (MUI styles identical apart
from key order, which the selectors' specificity makes irrelevant); its icon colour now comes from
the icon layer. Newly visible data brings one new unresolved variable (`6a3634305bfe…`, a radius on
two pattern pages, Column Chooser and Search Results Panel) and makes Dialog stop deriving, on its
image layer's two stacked paints — the 3b-2 shape. Task 2's reader changes were needed before the
sync, because `solar:sync` runs codegen straight after the fetch; they are in and accept both the
old and the new raw shape.

### Task 2: The resolver and recipe read the new data

**Files:** modify `src/normalize/component-layers.mjs`, `src/normalize/recipe.mjs` and their
tests.

An added layer resolves like any other, under its recorded parent. An icon's colour is a paint cell
on the icon layer itself, replacing the root-level `iconColor` read from the variant digest. The
emitters follow: MUI styles each icon slot from its own cell, and Flutter, whose `ButtonStyle` has
one `iconColor` and one `iconSize`, reads the leading icon and refuses a recipe where the trailing
one differs. (Opacity was dropped with Task 1.)

Tests: Button's recipe is unchanged; an added layer resolves under its parent; an icon's colour
sits on the icon layer; the corpus guard's `unattributed` count falls to what the new data leaves.

**Done 2026-09-23.** Both old-data paths were removed once the owner's sync landed, rather than
kept as fallbacks: no pre-sync data is left and the fetcher cannot write it, and the digest fallback
misfired on the new data. The digest also lists icons inside composed children, so a set whose own
icons had no colour to record (Split Dialog's `Icon/Empty` placeholder) looked like old data and
got a finding for its Buttons' colours; left in, it would also have given Alert a root icon colour
that tints its StatusIndicator. Now codegen refuses a path-only added layer, and a multi-colour
icon is a finding on that icon layer (none in SOLAR Web today). Across the corpus: 115 of 119 sets
derive (the guard adds Dialog, on its image layer's two stacked paints), no set has an
unattributed icon colour, and no recipe has a root `iconColor`. Button's generated MUI, Flutter and
IR are identical to the sync's output. 405 tests, lint, typecheck and 56 Flutter tests pass; the
new Flutter guard's test fails with the guard disabled.

### Task 3: Layer names that cannot collide

**Files:** modify `src/normalize/components.mjs` and its test.

A layer is named by its slot, then by its own name; when two layers would share a name, each is
qualified by its parent's (`fieldLabel` and `label`), and repeated siblings keep their position
(`tabItem`, `tabItem2`…). Stable: renaming never depends on the order other layers were seen.

Tests: Text Input, Card, Dialog and Tabs build; Button's names are unchanged; qualifying is
deterministic.

### Task 4: States drawn as boolean axes

**Files:** modify `src/normalize/recipe.mjs`, `src/normalize/components.mjs` and their tests.

Checkbox draws its states as separate `false/true` axes. An axis named for a platform state
(`hover`, `focus`, `pressed`, `active`) is folded into one state dimension whose value is the axis
that is true, or `default`; `disabled`, `loading`, `selected` and `error` become boolean props, as
Figma's `state` values already do; `checked` and `mixed` stay appearance. A variant with two
platform states true at once (Checkbox's `disabled` and `hover` together) is recorded as a
`compound-state` finding rather than inventing a state.

Tests: Checkbox's API is `checked`, `mixed`, `disabled`; its states are `default`, `hover`, `focus`;
its compound variant is one finding; Button, whose `state` axis is already one axis, is unchanged.

### Task 5: Flutter widget shells

**Files:** add a Dart template to `src/scaffold/`, `solar:scaffold --flutter`; create
`packages/solar_flutter/lib/src/components/solar_button.dart`; extend the parity suite.

`SolarButton` is scaffolded once and hand-owned, like `Button.tsx`: the same props (`variant`,
`size`, `danger`, `disabled`, `loading`, the icon slots and the counter), a `FilledButton` styled by
`SolarButtonRecipe.style`, the spinner while loading, and a semantics label for an icon-only button.

Tests: a widget test renders each variant; the parity suite compares the React shell's props with
the Dart widget's constructor, not with the generated props class alone.

### Task 6: The oracle — what Figma says each variant looks like

**Files:** create `src/verify/oracle.mjs` and its test; write `spec/verify/button.json`.

For every variant, straight from the resolved Figma layers and independently of the recipe and the
emitters: per layer, the background, text colour, border colour and width, radius, padding, font
size, line height and box size, resolved to Light values through the token spec. The overlay turns
into expectations: a `follows` or `bind` expects Figma, an `allowLiteral` expects the literal, an
`accept` expects the recipe's value and says so. A finding still open expects the recipe's value and
lists the variants where Figma differs, so the report shows the gap instead of failing on it.

Tests: Button's 108 variants are all present; the secondary `sm` background is expected as the
recipe's, listed as an open finding; nothing in the oracle is read from the recipe.

### Task 7: Web visual parity

**Files:** add `@playwright/test` 1.63 (dev); create `packages/components/test/visual/`.

Playwright renders the real `Button` for every variant with `tokens.css` and `fonts.css` loaded,
reaches each state the way a user would — hover, mouse down, keyboard focus — and reads
`getComputedStyle` for each layer. Every value is compared with the oracle, colours after resolving
both to sRGB.

Tests: all 108 variants match; a deliberate break in the recipe fails it, naming the variant and
property.

### Task 8: Flutter visual parity

**Files:** create `packages/solar_flutter/test/visual/`, reading `spec/verify/button.json`.

A widget test per variant pumps `SolarButton`, forces the state with a `WidgetStatesController`,
and reads the painted decoration, text style and size. Native widget tests, not Flutter web, as
the spec says. Compared with the same oracle.

### Task 9: CI and documentation

**Files:** modify `.github/workflows/solar.yml`, the codegen, components and Flutter READMEs,
`docs/README.md`, `CLAUDE.md`.

The web visual job installs Playwright's Chromium; the Flutter job runs the new tests; both fail on
a mismatch the oracle does not excuse. The docs say what the oracle is, and why it is Figma rather
than the other platform.

---

## Done when

- Text Input, Card, Dialog and Tabs build, and Checkbox's states are states.
- The fetcher records added layers and icon colours, and Button is unchanged by it.
- `SolarButton` exists as a Flutter widget with the React component's props.
- Every one of Button's 108 variants matches Figma on both platforms, or differs only where the
  overlay or an open finding says so, and CI enforces it.

## 3b-2, scoped here, planned after this one

Ten components on the machinery above, each with its overlay, its emitter tables, its React and
Flutter shells, and API and visual parity:

| Component    | MUI base   | Flutter base          | The hard part                                   |
| ------------ | ---------- | --------------------- | ----------------------------------------------- |
| Text Input   | TextField  | TextField             | states `filled` and `error`, label and helper   |
| Checkbox     | Checkbox   | Checkbox              | indeterminate (`mixed`), boolean state axes     |
| Tabs and Tab | Tabs, Tab  | TabBar, Tab           | keyboard navigation; the look lives in Tab Item |
| Icon Button  | IconButton | IconButton            | square and round, 3 × 3 × 7 variants            |
| Button Group | —          | —                     | orientation, full width; lays out Buttons       |
| Tag          | Chip       | Chip                  | 45 variants                                     |
| Card         | Card       | Card                  | bespoke layout, the loading skeleton            |
| Dialog       | Dialog     | Dialog                | portal and focus trap; composes Icon Button and Button Group |
| Sparkline    | —          | CustomPainter         | draws a line from data; no stock control        |
