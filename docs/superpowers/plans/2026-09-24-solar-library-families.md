# Milestone 4 — the component library, family by family

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to carry this plan out task by task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate every component in SOLAR Web's components section, 128 beyond the four built,
for React (MUI) and Flutter. Each is checked variant by variant against Figma, as in 3b.

**Architecture:** Unchanged from 3b: IR, overlay, two recipes, shells scaffolded once, and the
oracle and visual checks. Two things change. The machinery tasks (M) come first and make a component
cheap to add: shared defaults, complete findings, standalone components, and files of its own. Then
the components go by **family**, not one by one. A family's **pioneer** is built with 3b's full
care, and any machinery the family needs is found and fixed on it. The rest of the family is then
built as a **batch** on proven machinery, the members in parallel where M7 allows.

**Tech stack:** Node 22 codegen, React 19 + MUI 9.4, Flutter 3.47.5, Vitest, Playwright 1.63,
Storybook 10.6, Widgetbook 3.25. Chart libraries for F14 (decision below), at their latest stable
versions when that family starts.

Design: [the docs-to-code spec](../specs/2026-09-21-solar-docs-to-code-design.md), whose §10 names
this milestone: "scale out by category behind a readiness gate". `npm run solar:triage` is that gate.
Previous plans: [3b-1, the machinery](2026-09-23-solar-component-machinery.md) and
[3b-2](2026-09-23-solar-components-3b2.md). 3b-2's waves A and B are done; its waves C to F are
**superseded by this plan**, and their decisions are carried over below. Each mechanism named here
is explained in those plans' Done notes.

---

## Why families

3b built four components, one at a time. The slowness was deliberate. Each new kind of component
exposed silent machinery bugs, 16 in waves A and B alone, and none of them showed in a unit test.
Examples: round Icon Buttons would have lost their radius, disabled lg secondary Icon Buttons lost
their border on both platforms, and Flutter buttons reached screen readers unnamed. A batch built on
unfixed machinery carries such a bug into every member. But most of the per-component cost repeats:

- **Half the findings have one answer.** 1,109 of the corpus's 2,144 unbound values are a padding or gap
  left at 0, bound to `inset.none` by hand in every overlay so far (M3).
- **The components fall into families** that share a base control and a shape. The pioneer finds the
  machinery the family needs; the members reuse it.
- **Every component edits the same shared files** today: the emitters' tables, the scaffold
  templates, `COMPONENTS`, the case registries and the package barrels. That stops members from
  being built in parallel (M7).

## What the triage found, 2026-09-24

`npm run solar:triage` (SOLAR Web `2402412754718078809`) builds every component's IR in memory and
reports it. Findings are counted before any overlay:

- **Scope:** 132 components in `components/`: 119 sets and 13 standalone components (Figma drew them
  with no variants). 4 are generated. Patterns and views are out of scope, as the spec gates them
  separately.
- **What builds:** 114 build an IR. The 18 that don't are the 13 standalone components ("has no
  variant axes", M4) and 5 shape failures (Insight Card, PIN Input, Password Input, Tree Item and
  Popover, M5).
- **Findings:** 3,119 in all: 969 axis, 1,109 zero-inset, 255 boundable to an existing token, 780
  with no token (governance gaps), and 6 other.
- **Composition** is at most 3 levels deep. Families are ordered so a composed child is built first.
- **Two sets are both named `Day Cell`:** the calendar's (5 variants) and the date picker's (13).
  The pipeline keys components by Figma name (M6).
- **The recipe skips some values without a word.** Where a variant has a cell its reference variant
  lacks, or the reverse, the recipe records nothing and reports nothing. For example, a layer that
  is an auto-layout frame in one variant and not in another, or a uniform border in one variant and
  per-side borders in another. This happens in 8 components, 50 layer cells and 320 variant cells:
  Checkbox, Tab Item, StatusIndicator, Accordion, Card, RowExpand, `.Tree Indent` and Button Group.
  Button Group is right only because its overlay's `follows` puts the divider in its own entry. The
  visual checks would catch each one later, but a batch needs the findings complete up front (M2).

| Family                    | Members | Don't build | Variants | Findings | axis | 0-inset | token | no token |
| ------------------------- | ------- | ----------- | -------- | -------- | ---- | ------- | ----- | -------- |
| F1 Display primitives     | 13      | 0           | 233      | 174      | 58   | 45      | 9     | 59       |
| F2 Buttons                | 4       | 0           | 75       | 75       | 39   | 19      | 6     | 11       |
| F3 Selection controls     | 8       | 0           | 57       | 66       | 10   | 22      | 8     | 25       |
| F4 Tags and messages      | 6       | 1           | 76       | 142      | 110  | 8       | 16    | 8        |
| F5 Text fields            | 10      | 2           | 118      | 215      | 78   | 84      | 32    | 21       |
| F6 Menus and lists        | 9       | 2           | 44       | 126      | 59   | 32      | 12    | 23       |
| F7 Pickers                | 9       | 1           | 81       | 361      | 19   | 99      | 16    | 227      |
| F8 Navigation             | 8       | 2           | 47       | 56       | 20   | 12      | 17    | 6        |
| F9 Paging and steps       | 9       | 3           | 49       | 122      | 54   | 33      | 13    | 22       |
| F10 Cards                 | 18      | 3           | 106      | 338      | 49   | 162     | 60    | 67       |
| F11 Tables and properties | 8       | 0           | 47       | 197      | 63   | 57      | 13    | 64       |
| F12 Overlays and dialogs  | 8       | 3           | 27       | 114      | 20   | 66      | 5     | 23       |
| F13 Calendar parts        | 8       | 1           | 56       | 175      | 109  | 32      | 5     | 29       |
| F14 Charts                | 10      | 0           | 97       | 854      | 210  | 422     | 38    | 184      |

Three outliers hold a quarter of the findings. Bar Chart has 543, most of them the positions and
sizes of Figma's sample data. Date Picker Open has 276, mostly the calendar grid's cell geometry.
Tag's 110 axis findings are expected to go when `type` follows from content.

## Decisions taken (owner, 2026-09-24)

| Question            | Decision                                                                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Charts              | **A chart library, themed by SOLAR, with SOLAR parts.** Bar Chart, Line Chart, Donut Chart and Bar Stack are drawn by a library whose theme is generated from their recipes. Sparkline, Data Legend and Chart Tooltip are generated components checked against Figma. |
| Calendar            | **Styled parts only.** Each part is a component checked against Figma. Date logic and the assembled Month, Week and Day views (patterns and views) are later work, or the apps'.                            |
| Review cadence      | **One pause per family**, after its pioneer and its batch.                                                                                                                                                  |
| Shared defaults     | **Zero insets only.** An unbound 0 padding or gap is `inset.none`. Every other decision stays in the component's own overlay.                                                                               |

Carried over from 3b-2 (owner, 2026-09-23), unchanged: Tag's `type` follows from content (no `type`
prop); Sparkline takes `data: number[]` and derives its trend; the wizard Stepper is generated, with
Step and Stepper Indicator.

Taken by the plan, each open to the owner at review:

| Question                         | Taken                                                                                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| From 3b-2                        | Text Input's `filled` follows from the value. Text Input on MUI is `InputBase` in a `FormControl`. Checkbox in Flutter is bespoke. StatusIndicator is generated. Tabs hide the moving indicator. Stepper, Step and Stepper Indicator are bespoke on both. |
| Counter                          | Generated in F1. Button's counter stays a slot the caller fills, now with `SolarCounter`.                                                                           |
| The two Day Cells                | Named by section where Figma's names clash: `CalendarDayCell` (F13) and `DatePickerDayCell` (F7).                                                                    |
| Date and time pickers            | The fields are Text Input's family. The open pickers are bespoke grids of the generated `DatePickerDayCell` and Dropdown Items, with date arithmetic from the platform (`Intl` / `DateUtils`), not a picker library. MUI X Date Pickers and Flutter's `showDatePicker` draw their own days and cannot take SOLAR's cell. |
| Chart libraries                  | MUI X Charts (the MIT community package) on the web and `fl_chart` in Flutter, the latest stable of each when F14 starts. Confirm licences then.                  |
| Tree Item                        | A bespoke `role="treeitem"` row. The tree itself, Tree Navigation Panel, is a pattern and later work.                                                              |
| Cursor                           | Built in F1 as a glyph component. Whether it belongs in `@bwp-web/canvas` is asked at F1's review.                                                                 |

## Notes for whoever executes this

- **The repository owner handles all version control.** No git write commands, at all, and no git
  worktrees, since creating one is a git write. "Commit" means: stop, report, and let the owner
  review and commit.
- **Pause after each machinery task group (M1 to M7) and after each family.**
- `docs/` is read-only to the generator. A fetcher change reaches the data only through the owner's
  `npm run solar:sync`.
- Run npm under Node 22: `export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$PATH`. Flutter is
  3.47.5 at `~/development/flutter`.
- **Every overlay rule needs a reason, and a finding is decided or left open, never hidden.** How to
  decide one:
  - An axis finding is `follows` (a real interaction), left open (a Figma mistake the code does not
    copy: the oracle excuses it and the design review lists it), or `accept` (known and intended).
  - Unbound values are `bind` (same value, governed token) or `allowLiteral` (no token exists: a
    governance gap).
  - Record each decision in the family's Done note.
- **Never loosen a visual check or edit the oracle to pass.** A difference is fixed in the code or
  excused by a finding.
- **Generated output of what is built stays unchanged** through the machinery tasks, unless the
  task says otherwise and why. `npm run solar:rebuild` then shows no diff in `packages/` outside
  the task's own files.
- The corpus guards (`test/recipe.test.mjs`, `test/components.test.mjs`) and the triage test pin
  which sets derive and build. A task that changes that set updates the guards deliberately, in the
  same change.
- Every task ends with these checks, all green:
  - from the root: `npx vitest run`, `npm run lint`, `npm run typecheck`, `npm run format`,
    `npm run test:visual`;
  - in `packages/solar_flutter`: `flutter analyze` (also in `variants/` and `widgetbook/`),
    `dart format --output=none --set-exit-if-changed lib test variants/lib widgetbook/lib`,
    `flutter test`;
  - `npm run solar:rebuild` run twice leaves the tree unchanged;
  - both viewers build, as CI builds them: `npm run build-storybook -w @bwp-web/components` and,
    from the root, `npm run widgetbook -- build`.

---

## Machinery

### Task M1: The triage

**Done 2026-09-24.** `npm run solar:triage` (`packages/codegen/bin/solar-triage.mjs`, logic in
`src/report/triage.mjs`) prints the survey above as markdown; `-- --json` gives the rows and
`-- --all` adds patterns and views. It is read-only and never part of `solar:codegen`.

For each component it reports:

- whether the IR builds, and the error if not;
- its API, platform states and slots by type;
- what it composes from the catalog, and its composition level;
- the features the machinery must handle (`glyph`, `image`, `text`, per-side borders `sides`);
- its findings by class: axis, zero-inset, boundable, no token, other.

`test/triage.test.mjs` pins its shape and the facts this plan leans on. Re-run it at every family's
start and end: the counts in each Done note come from it.

### Task M2: Say what an absence means, then report what is left

In `src/normalize/recipe.mjs`, the comparison skips a variant when either value is `undefined`
(`expected === undefined || found === undefined`). A layer's absence is a real reason to skip,
since `present` covers it. But where the layer is in both variants and only one has the cell, the
difference is dropped. A cell goes missing for three reasons:

- **Layout.** A layer is an auto-layout frame in one variant and not in another, so one variant
  has no `direction`, `align`, `gap` or padding (Checkbox's box, `.Tree Indent`).
- **Size.** Figma records no sizing for the layer in one variant, so it has no `width` or `height`
  (StatusIndicator's shapes).
- **Borders.** One variant has one `borderWidth`, another a width per side (Tab Item, Accordion,
  Button Group).

Reporting the gap alone is not enough. Once a person decides the finding with `follows`, the
variant with no auto-layout would still inherit the base's gap through the lookup. So the recipe
first says what the absence means, as it already says "no stroke paint is no border":

- **Fill in, per layer, only where another variant of the same layer has the cell,** so consistent
  layers are untouched.
  - A missing layout cell is `{ none: true }`: no auto-layout.
  - A missing size is the layer's drawn size, bound as any size is.
  - Where any variant of a layer has per-side widths, every variant's `borderWidth` becomes four
    equal sides.
- **Then report what is left.** Any cell still present in one variant and not the other, where the
  layer is in both, is an axis finding (`describe(undefined)` reads "no value"), never a skip. A
  future cause of absence then fails loudly.
- **The emitters draw a layout `none`.** Today the MUI emitter writes nothing for a `none` gap or
  padding, so a variant would inherit the base's. A `none` gap or padding is `inset.none` (as a
  `none` radius is already `radius.none`), and a `none` direction is no flex layout. Flutter does
  the same.
- **The oracle is unchanged:** it reads Figma, not the recipe.

Measured on a scratch copy before this plan changed, 2026-09-24:

- **Dropped values:** 320 go to 1. The one left is Card's hidden Tag, whose `component` cell the
  hidden-child rule already reads from the variant that draws it.
- **Built components:** Button, Spinner and Icon Button generate identical output. Button Group's
  CSS changes but draws the same: the base says no border per side, not once, and full-width turns
  on only its top.
- **New findings:** 199 axis findings in 7 components (Checkbox 3 to 59, `.Tree Indent` 10 to 80,
  StatusIndicator 22 to 68, RowExpand 0 to 21, Accordion +3, Tab Item +2, Button Group +1 before its
  overlay). They are grouped by cell and position, so each needs only a handful of `follows`
  decisions when its family comes.

Tests:

- synthetic: a layer with auto-layout in one variant and not the other, a layer with sizing in one
  variant only, and a uniform against a per-side border, each filled as above;
- a cell left missing after the fill is an axis finding;
- the emitters' `none` layout, on both platforms;
- the triage's `sides` now holds for Button Group;
- both visual checks still pass for the four built components.

**Done 2026-09-24.** As planned, in `src/normalize/recipe.mjs`:

- `sayWhatAbsenceMeans` runs after every variant's cells are read and before the comparison.
- The comparison reports a one-sided cell on a layer drawn in both variants as an axis finding;
  `describe` reads the absent side as `no value`. A composed child's `component` and `variant.*`
  cells are still exempt: Figma records no variant on a hidden instance, and the hidden-child
  rule reads it from the variant that draws it.
- **Emitters:** a `none` gap or padding is `inset.none` on both platforms, the Flutter recipe
  writing `t:inset.none` so a shell reads it as any length. A `none` direction or alignment
  restates nothing on the web and is `none` in the Flutter recipe. Whether "restate nothing" is
  right is for the first component that draws one (Checkbox, F3) to show in its visual check.
- **Corpus, measured with `npm run solar:triage`:** 1,168 axis findings, up 199, in exactly the
  seven components the prototype named, and no other count moved.
- **Generated output:** Button's, Spinner's and Icon Button's is unchanged. Button Group's moved
  its "no border" from the full-width entry to the base, per side: the base is `none` on all four,
  and full-width sets only its top. It draws the same, and both visual checks pass.
- **Tests:**
  - six synthetic ones in `test/recipe.test.mjs`: layout, sizing, uniform against per-side, the
    `none` written where the cell follows, the unfillable width reported, and agreeing layers left
    alone;
  - one each for the `none` layout in the MUI and Flutter emitter tests;
  - `test/button-group.test.mjs` and the triage's `sides` test moved with it.
- **Checks:** 549 JS tests, both visual checks, 94 Flutter tests, analysis of all three Flutter
  packages, both viewers, and two identical rebuilds.

### Task M3: Shared defaults — zero insets

A new file, `spec/overlay/defaults.yaml`, holds rules that apply to every component. It is parsed
by `src/normalize/overlay.mjs` into the same shape a component overlay has. Its one rule for now:

```yaml
bind:
  zero-insets:
    cells: [paddingTop, paddingRight, paddingBottom, paddingLeft, gap]
    literal: 0
    token: inset.none
    reason: >-
      An inset Figma leaves unbound at 0 is inset.none, the governed token for no inset. Raised
      with SOLAR once, as a whole, not per component.
```

- **Precedence:** a component's own rule on the same cell wins. A default that matches nothing in
  one component is fine, unlike a component's own rule, but the test asserts it matches in the
  corpus.
- **Recorded as a decision:** the IR's `overlay.rules` lists each applied default with
  `from: defaults`, so it stays visible, and the deviations report shows it as decided.
- **Remove the redundant rules:** the padding and gap `bind` rules in `button-group.yaml` and
  `icon-button.yaml` become redundant. Remove them; the generated output is unchanged.
- **Update the triage and the design review.** The triage counts findings after the defaults, so a
  zero inset no longer counts as open. The design review lists zero insets as one question: bind
  them in Figma.

**Done 2026-09-24.** `spec/overlay/defaults.yaml` holds the one rule, `zero-insets`, parsed by
`parseDefaults` and applied by `applyDefaults` in `src/normalize/overlay.mjs`, after the
component's overlay. `buildComponentSpec` takes `defaults`; the stage and the triage load them.

- **One change from the plan's text.** A finding is decided once every raw value Figma left in the
  cell is `0` and none is left in the recipe, not only where the recipe held the `0`. In 426
  findings the `0` is drawn only by variants the recipe compares against a reference, so the
  recipe never holds it. The default answers those as well; whether such a variant should differ
  at all is its axis finding, which stays open. For this, unbound findings now carry their
  `literals`.
- **Precedence:** a cell the component names in `bind`, `set` or `allowLiteral` is left to it,
  which a test proves with an `allowLiteral` on Button's padding.
- **Recorded as decisions:** in the IR's `overlay.rules` (`from: spec/overlay/defaults.yaml`,
  `default: zero-insets`), on each entry (`from: defaults`), and in `spec/deviations.md` as
  "Decided (bind, shared default zero-insets)".
- **Rules removed:** 16 hand-written zero-inset `bind` rules, 2 in Button, 5 in Spinner, 5 in Icon
  Button and 4 in Button Group, which left Spinner's and Button Group's `bind` sections empty.
  Generated code and oracles are unchanged. Only the specs' reasons and rule lists, and the
  report's wording, moved.
- **Corpus, with `npm run solar:triage`,** which now applies the defaults and each built
  component's overlay and counts decided findings apart:
  - the default decides 1,098 findings in 91 components;
  - open zero insets fall from 1,109 to 6, each a cell that also holds a `2`, which its
    component must decide;
  - the four built components have 3, 0, 0 and 0 open findings.
- **Design review:** the four per-component "padding is 0" fixes became one item in section 2,
  and the counts in "At a glance" moved with them.
- **Checks:** 557 JS tests (8 new for the defaults), both visual checks, 94 Flutter tests, and
  two identical rebuilds.

### Task M4: Standalone components

13 components Figma drew with no variants:

- navigation: PageNavigator, PaginationEllipsis, Pagination, Section Nav Group Header;
- inputs: Autocomplete Open, Options List;
- feedback and dialogs: EmptyState, Drawer, Scrim;
- overlays: Context Menu;
- cards: Split Dropdown, Launch Card Full Screen;
- calendar: Calendar Toolbar.

`resolveVariants` refuses them ("has no variant axes"). Build them as one variant:

- **The IR:** no axes, an API of their component props alone (booleans, text, slots), and the
  recipe in `base`.
- **The oracle:** one variant.
- **The emitters:** both handle an empty `api` and `states`. Button Group proved `states: []`; this
  adds no axes.
- **Loading them:** `loadComponent` reads `page.components` when the catalog entry's `kind` is
  `component`. The triage's adapter moves into `src/normalize/components.mjs`.
- **Measured on a scratch copy, 2026-09-24:**
  - Two one-line changes let all 13 build an IR and an oracle of one variant: `axesOf` accepts no
    axes, and `parseVariantName` accepts the empty name.
  - Scrim went through both emitters once it had a slot table, which every component gets in its
    step 2.
  - Drawer stopped only at its unbound 0 gap, which M3 settles.
  - With no axes they have no axis findings, only unbound ones.
  - A made-up axis to get them through was rejected: it would leak a meaningless prop into the
    API.
- **Tests:** Drawer's IR (title and content slots, `hasCTA`), a synthetic one-variant set, and both
  corpus guards moved to include them.

**Done 2026-09-24.** As measured:

- **Loading:** `componentOf(entry)` in `src/normalize/components.mjs` reads one catalog entry's
  raw data. A standalone component becomes the set of its one variant: `standalone: true`, named
  `''`, its tree as the default variant's. `loadComponent` and the triage both go through it, and
  the triage's own adapter is gone.
- **Resolving:** `axesOf` accepts no axes for a standalone component only (a real set with none
  still fails), and `parseVariantName` reads `''` as no props.
- **Two Flutter emitter fixes,** found by writing all 13 recipes to a scratch file and running
  `flutter analyze`:
  - an empty props class wrote `({ })`, which Dart refuses; it is now `const Solar<Name>Props();`;
  - the combination key was `final` where it is constant. Pagination, whose recipe names no
    colour, also left the colour switch's `final c` unused.

  The MUI recipes of all 13, with stand-in slot tables, typecheck. Both scratch outputs were
  removed.
- **Naming:** `camel` lower-cases a leading acronym whole. Drawer's `hasCTA` slot was `cTA`, and is
  now `cta`; `TertiaryCTA` stays `tertiaryCTA`. No icon, logo or built component name changed.
- **Corpus:** all 13 build an IR and a one-variant oracle, with no axis findings. `npm run
  solar:triage` now gives 127 of 132 building; the 5 left are M5's. Both corpus guards, the
  standalone ones and the sets, pin it.
- **Generated output of the four built components:** unchanged.
- **Tests:** a standalone set resolving and a set without axes refused; `camel`'s acronyms; all 13
  building with oracles; Drawer's slots (`title`, `content`, `cta` for its Button Group); the recipe
  guard; and the MUI and Flutter recipes of Scrim.
- **Checks:** 566 JS tests, both visual checks, 94 Flutter tests, lint, typecheck, format, and two
  identical rebuilds.

### Task M5: The four shapes that do not build

Each is a small rule of its own, with a synthetic test:

- **A layer the namer cannot name is named by the overlay.** A new overlay rule, `layerNames`, maps
  a Figma layer path to its IR name, with a reason. `namesOf` applies it before deriving names,
  and a path that no longer exists fails the build. When `namesOf` cannot name a layer, its error
  says to add one. Three sets need it; the overlay decides each name rather than a guess from the
  glyphs, since these names become code and must stay stable across syncs:
  - **PIN Input and Password Input:** `/Cells/Field/|` and `/Field/•••••••••` have no letter or digit
    to name them by. They are a drawn caret and a drawn mask.
  - **Tree Item:** `/Label` and `/|Label` both reduce to `label`. The second is a text layer only
    one variant adds, whose text is `|Label` in `text.tertiary`: the label being renamed, with a
    caret drawn into its text. The overlay names it, and the review asks SOLAR whether rename mode
    is meant to be a variant.
- **Popover: a radius per corner.** `/Content`'s radius binds `radius.container` and `radius.none` to
  different corners. Give it a cell per corner, as 3b-2 Task B2 gave borders a cell per side:
  `radiusTopLeft` and the others, with the MUI and Flutter emitters and the oracle to match. The
  fetcher may need to record per-corner radii, as it records `strokeWeights`. Check the raw data
  first; if a fetcher change is needed, it lands through the owner's sync.
- **Insight Card: two colour paints on one layer.** `.background` is filled
  `[surface/base, surface/background]`. Read what Figma draws: the top paint, when it is opaque and
  visible. Otherwise report a finding and take the top paint.

Both corpus guards move: after M4 and M5, all 132 build, or the plan says which don't and why.

**Done 2026-09-24.** All 132 components in the Components section now build: the triage reports
none left.

- **`layerNames`**, a new overlay rule (`src/normalize/overlay.mjs`), gives a layer its name by
  Figma path, with a reason. `namesOf` treats it as the layer's own word, as a slot's name is, so
  names are still qualified where they clash.
  - A path the component lacks fails, and so does a slot's layer, whose name is the slot's.
  - The two naming errors now say to add such a rule.
  - Three overlays use it: `spec/overlay/pin-input.yaml` (`/Cells/Field/|`, the caret a focused
    cell draws, is `caret`), `password-input.yaml` (the nine bullets are `maskedValue`), and
    `tree-item.yaml` (`/|Label`, added only in `state=edit`, is the rename input,
    `renameInput`). Each holds that rule alone; the rest waits for its family.
  - The plan's guess that Tree Item's `|` was a caret glyph was wrong: it is a second text layer
    whose text starts with a drawn caret.
- **Stacked paints** (`src/normalize/paints.mjs`, `drawnPaint`), read the same way by the recipe
  and the oracle:
  - A stack is its top paint (Figma lists paints bottom first, and the fetcher drops hidden ones)
    where that paint is an opaque colour, which `names.opaque` knows from the contract in every
    mode.
  - What the top paint covers is a new finding kind, `covered`. Insight Card's selected card
    draws `surface/background` over `surface/base` in 5 variants, and SOLAR is asked to remove the
    covered paint.
  - A translucent top still fails the build.
- **Corners of their own.** No fetcher change was needed: it already records
  `rectangleCornerRadii` as `radius: [tl, tr, br, bl]`.
  - Where corners differ in value or binding, the recipe gives a cell per corner,
    `radiusTopLeft` and the rest. Where another variant of the layer has corners, one radius is
    read as that radius on every corner, as M2 does for borders.
  - The MUI recipe writes `border<Corner>Radius`, and a `none` corner is `radius.none`.
  - The oracle holds a radius per corner.
  - Both checks list the four corners, and the web check measures them (`border<Corner>Radius`).
    Flutter's cases measure what their component draws, and fail on any property they lack.
  - Popover's square corner follows `placement`, as its arrow does. That is 6 axis findings,
    which Popover's family decides with `follows`.
- **Corpus guards:** both now expect every set to derive and build, the IR guard with each set's
  overlay and the defaults. The triage builds 132 of 132.
- **Generated output and oracles of the four built components:** unchanged.
- **Tests:**
  - `test/paints.test.mjs`: one paint, an opaque top, a translucent top refused;
  - corners in the recipe (per corner, agreeing corners as one, one radius spread where another
    variant has corners), the MUI emitter, Popover's oracle and the web comparison;
  - Insight Card's `covered` finding;
  - `layerNames` parsing, a missing path, a slot's layer, and PIN Input with and without its
    overlay;
  - the triage building everything.
- **Checks:** 582 JS tests, both visual checks, 94 Flutter tests, Flutter analyze and format,
  lint, typecheck, format, and two identical rebuilds.

### Task M6: Components named alike

`COMPONENTS`, `loadComponent`, the IR's file name and the code names all key on Figma's name, and
two sets are called `Day Cell`. Let a component be addressed as `<section>/<name>`
(`calendar/Day Cell`, `inputs/Day Cell`) where the name alone is ambiguous. An ambiguous bare
name is an error that names both. The overlay's `component` line takes the same address, and a
`codeName` rule, with a reason, gives the code name (`CalendarDayCell`, `DatePickerDayCell`), from which the file names
follow. The triage resolves `composes` through the same address, so Date Picker Open composes the
date picker's Day Cell, not the calendar's.

**Done 2026-09-24.**

- **Addresses:** a component is addressed by its Figma name, or by `<section>/<name>` where two
  share it (`findEntry`, `addressOf` in `src/normalize/components.mjs`).
  - A bare `Day Cell` is an error naming `inputs/Day Cell` and `calendar/Day Cell`.
  - The whole address is matched against `section/name`, not split, since some view pages have a
    `/` in their Figma names.
  - `COMPONENTS`, `loadComponent` and `loadOverlay` take addresses, so a Day Cell's overlay is
    `spec/overlay/calendar-day-cell.yaml` or `inputs-day-cell.yaml`.
- **`codeName`:** a new overlay rule renames the component before the recipe is derived, so its
  files, classes and findings' tokens follow the new name, and `provenance.figmaName` keeps
  Figma's.
  - The overlay's `component` line may be the Figma name, the address or the code name; another
    component's fails.
  - The two overlays give `Calendar Day Cell` and `Date Picker Day Cell`, the names the plan took.
- **The stage** refuses two components generated under one name (`assertDistinct`), since their
  files would overwrite each other.
- **The triage** names rows by address and resolves a composed child's name within the composer's
  section where two share it. Date Picker Open now composes `inputs/Day Cell` and sits at level
  1, not 2, and the plan's one ordering warning (F7 needing F13's Day Cell) is gone.
- **Generated output of the four built components:** unchanged.
- **Tests:** addresses and the ambiguous bare name, both Day Cells under their code names, the
  duplicate guard, `codeName` parsing and addressing, and the triage's resolution.
- **Checks:** 587 JS tests, both visual checks, 94 Flutter tests, lint, typecheck, format, and two
  identical rebuilds.

### Task M7: A component in files of its own

Today a component's per-component entries sit in files shared by every component:

- the MUI emitter's tables: `MUI_SLOTS`, `MUI_RESETS`, `STATE_SELECTORS`, `OVERLAPS`,
  `MUI_STATE_RESTATES`;
- the Flutter emitter's tables: `BUILDERS`, `FLUTTER_STYLE`;
- the React and Flutter templates in `src/scaffold/index.mjs`;
- `COMPONENTS`;
- the web case registry (`test/visual/cases/index.ts`) and the Flutter ones (`variants/.../builders.dart`,
  `test/visual/cases/cases.dart`);
- both package barrels (`packages/components/src/index.ts`, `solar_flutter.dart`).

Move them so a component is its own files:

- `packages/codegen/src/components/<slug>.mjs` exports the component's descriptor: its address,
  its MUI and Flutter tables, and its two templates. The emitters and the scaffolder read the
  descriptors. `COMPONENTS` becomes the sorted list of descriptors found, so adding one edits no
  list.
- The registries and barrels are written from that list: the scaffolder adds a component's lines
  when it creates the shells, and a check fails when a line is missing. Alternatively, generate
  them. Choose whichever keeps them hand-readable, and say which in the Done note.
- The four built components move first, with **no change** to any generated file, shell or test
  result. That is the task's acceptance test.

After M7, a family member touches only its own files:

- its descriptor and overlay;
- its two shells and its story;
- its tests;
- its web case and Flutter builder and case.

So members can be built in parallel, and the coordinator adds nothing but review.

**Done 2026-09-24.** A component is now its own files, and adding one edits no list.

- **Descriptors:** `packages/codegen/src/components/<name>.mjs`, one per component
  (`button.mjs`, `button-group.mjs`, `icon-button.mjs`, `spinner.mjs`).
  - Each holds the component's `name` (and `address` where that differs), its MUI tables
    (`slots`, `resets`, `svgLayers`, `states`, `overlaps`, `restates`), its Flutter tables
    (`style`, `shared`) and its two shell templates.
  - `src/components/index.mjs` finds them by listing the directory, so `COMPONENTS` is the
    descriptors found.
  - The emitters keep their exported names (`MUI_SLOTS`, `STATE_SELECTORS`, `FLUTTER_STYLE`,
    `TEMPLATES`…) as views built from the descriptors, so no caller changed.
  - The templates moved verbatim, and the helpers they share are in `src/scaffold/helpers.mjs`.
    The scaffolder went from 903 lines to 126.
- **The registries and barrels are generated,** the choice the plan left open, by
  `src/emit/registries.mjs` on every `solar:codegen`:
  - `packages/components/src/components.generated.ts`, which the hand-owned `index.ts` re-exports;
  - `solar_flutter`'s `lib/src/components/components.dart`, which `solar_flutter.dart` exports;
  - the web cases' `test/visual/cases/registry.generated.ts`, which `cases/index.ts` re-exports;
  - the Flutter cases' `test/visual/cases/cases.dart`;
  - the variant builders' `variants/lib/src/registry.dart`, and their library.

  Generated because the scaffolder's line-by-line edits of the barrels would race when members
  are built in parallel. The generated lists are sorted and hand-readable, and CI's rebuild check
  holds them to the component list. A file they name that does not exist fails the typecheck or
  `flutter analyze`. The scaffolder no longer edits either barrel.
- **The stage** checks each descriptor's name is the name its component builds under.
- **Acceptance:**
  - The four components' React, Flutter and story templates, MUI recipes and Flutter recipes,
    rendered before and after into a scratch directory, are byte for byte identical.
  - The one generated change is order: the two recipe barrels (`mui/components/index.ts`,
    `generated/components/components.dart`) list components sorted, not in the old `COMPONENTS`
    order.
- **Tests:** `test/descriptors.test.mjs` (every file found, sorted, and read by the emitters and
  the scaffolder), `test/registries.test.mjs` (the lists, their order, and that what is committed
  is what the stage writes), and the scaffold tests, which now prove the barrels are left alone.
- **Checks:** 592 JS tests, both visual checks, 94 Flutter tests, analysis of all three Flutter
  packages, Dart format, lint, typecheck, format, both viewers, and two identical rebuilds.

After M7, a family member is these files, and nothing shared:

- `src/components/<name>.mjs`;
- `spec/overlay/<address>.yaml`;
- its two shells, its story, and its tests;
- its web case, and its Flutter builder and case.

**Pause for review** after M2 to M7, before F1.

---

## How a family runs

1. **Triage.** Re-run `npm run solar:triage` for the family's members. Note in the Done note what
   changed since this plan.
2. **Pioneer.** Build the pioneer with the seven steps below and 3b's full care. Fix any machinery
   it needs, as a machinery change with tests, before any member starts. Anything the pioneer
   decides that members will repeat (a base control's state classes, a slot shape) goes into
   machinery or a family note, not into each overlay.
3. **Batch.** Build the members with the same seven steps, in composition order, one subagent per
   member where they are independent:
   - Each subagent writes only its member's files (M7) and runs that member's unit tests.
   - The coordinator reviews each member's overlay decisions against the pioneer's.
   - The coordinator then runs the full list of checks once for the batch. The visual checks and
     Flutter tests share a server and build directories, so subagents do not run them.
   - A member that finds a new machinery bug stops. The coordinator fixes the bug and re-checks
     the members already done.
4. **Design review.** Add the family's open findings and governance gaps to
   `docs/solar-review-for-design.md`, in its existing style.
5. **Done note and pause.** The Done note lists findings decided and left open, machinery found,
   and counts. Then pause for the owner.

The seven steps, per component (from 3b-2, with M7's files):

- [ ] **1. Build and review.** Add the component's descriptor, build its IR, and decide every finding
      in `spec/overlay/<name>.yaml`. Unit tests for the IR: API, states, slots, layer names.
- [ ] **2. Emitter tables.** In the descriptor: MUI slots, resets and state tables, and the Flutter
      style builder where the base has one. Unit tests for both recipes.
- [ ] **3. Templates.** A React and a Flutter template in the descriptor, functions of the IR, holding
      no design value.
- [ ] **4. Shells.** `npm run solar:scaffold <Name>` and `npm run solar:scaffold -- --flutter <Name>`.
      Shell tests: behaviour, accessibility, composition from the recipe.
- [ ] **5. Parity.** The parity suite covers it through `COMPONENTS`; make it pass.
- [ ] **6. Visual.** Its web case and Flutter builder and case. Every variant matches Figma or is excused
      by a named finding.
- [ ] **7. Docs.** Its entry in the components and Flutter READMEs, and its line in the family's Done
      note.

---

## The families

Listed in build order: a family composes only families before it, or itself. The pioneer is the
first member, chosen because it exercises the machinery the rest will need.

### F1: Display primitives

Non-interactive, level 0, and composed by most later families.

- **Pioneer: StatusIndicator.** A glyph component (type × size, a distinct Figma shape per type,
  A4), bespoke on both platforms. Its two unknown-token colours are decided like Spinner's
  misbound one. Decorative by default (`aria-hidden`); a `label` makes it announced.
- **Members:**
  - bespoke on both: Counter, Kbd, Timestamp, Trend Badge (glyph), Node End, RowExpand (glyph),
    `.Tree Indent` (depth), Cursor (glyph);
  - Avatar: MUI `Avatar`. 114 of Figma's combinations are drawn, and the one `sparse` finding is
    Figma's; image content comes from A2;
  - Divider: MUI `Divider`, Flutter `Divider`;
  - Skeleton: MUI `Skeleton`, bespoke in Flutter;
  - ProgressBar: MUI `LinearProgress`, Flutter `LinearProgressIndicator`.
- **Expect:** M2's findings on StatusIndicator's inner path and on `.Tree Indent`'s layout. Figma
  gives Counter hover and pressed states because it is clickable inside a Button; the shell makes it
  interactive only when given `onClick`.

### F2: Buttons

On Button's machinery.

- **Pioneer: FAB.** MUI `Fab`, Flutter `FloatingActionButton` styled by the `ButtonStyle`
  builder; `type` × size. It has 27 axis findings.
- **Members:**
  - BackButton: Button with the arrow icon;
  - SplitButton: two joined press targets. The menu is a slot the caller fills until F6;
  - Link: MUI `Link`, bespoke in Flutter. It uses the `link/*` text styles with their underline.

### F3: Selection controls

- **Pioneer: Checkbox.** MUI `Checkbox` with icons drawn from the recipe (the box and Figma's tick
  or dash, A4); Flutter bespoke on `FocusableActionDetector` and `Semantics`. API: `checked`,
  `mixed`, `disabled`, `onChange`. The compound disabled+hover variant stays 3b-1's finding. Focus
  draws `shadow.focus.default`; there is no pressed state.
- **Members:**
  - Radio: MUI `Radio`, bespoke in Flutter;
  - Toggle: MUI `Switch`, bespoke in Flutter;
  - Slider and Slider Range: MUI `Slider`, Flutter `Slider` and `RangeSlider`;
  - DragHandle: bespoke;
  - Segmented Control Item and Segmented Control: MUI `ToggleButton` and `ToggleButtonGroup`,
    bespoke in Flutter.
- **Target size:** the hit area of the 16px box follows the target-size decision the design review
  asks about.

### F4: Tags and messages

- **Pioneer: Tag.** MUI `Chip`, Flutter `Chip` (`InputChip` when closable). API: `status`,
  `invert`, `indicator`, `icon`, `onClose`, and the label as its child. Figma's `type` follows from
  those (A3); expect most of its 110 axis findings to go with it. It composes StatusIndicator.
- **Members:**
  - Alert and Alert Small: MUI `Alert`, bespoke in Flutter;
  - Banner: composes Button;
  - Toast: MUI `SnackbarContent`, Flutter `SnackBar` content; composes Tag;
  - EmptyState: standalone (M4); composes Button.

### F5: Text fields

- **Pioneer: Text Input.** MUI `InputBase` in a `FormControl`, with SOLAR's label above and helper
  below. Flutter `TextField` with the label and helper laid out by the shell. Overlay: `pressed`
  renamed `focus` (A2); `filled` follows the value; `error` is a prop. Slots: label, mandatory
  marker, leading and trailing icons, helper.
- **Members:**
  - Text Area: composes Icon Button;
  - SearchField;
  - GlobalSearch: composes Kbd;
  - Inline Input: 19 axis and 14 boundable findings;
  - Number Input: its stepper buttons;
  - Token Input: its tokens are the caller's Tags;
  - Password Input and PIN Input: after M5;
  - FileUpload: composes Button.

### F6: Menus and lists

The anchored popup comes from MUI `Menu`/`Popover` and Flutter `MenuAnchor`; SOLAR styles the
surface and the rows.

- **Pioneer: Dropdown Item.** MUI `MenuItem`; composes Checkbox.
- **Members:**
  - Dropdown Group Label: `ListSubheader`;
  - Dropdown Menu;
  - Context Menu Item, and Context Menu (standalone; composes Divider);
  - Option Row, and Options List (standalone);
  - ListItem: MUI `ListItemButton`, 45 axis findings;
  - List.
- **When done:** SplitButton's menu slot gets its default.

### F7: Pickers

- **Pioneer: Select.** MUI `Select` on F5's `InputBase`, with F6's Dropdown Menu as its menu.
  Flutter uses F5's field and a `MenuAnchor`.
- **Members:**
  - Dropdown;
  - Autocomplete (MUI `Autocomplete`), and Autocomplete Open (standalone);
  - DatePicker, Date Picker Open, and `DatePickerDayCell` (M6);
  - TimePicker, and TimePicker Dropdown.
- **The open pickers** are bespoke grids (decision above). Date Picker Open's 214 no-token findings
  are expected to be mostly its grid's cell geometry. Decide them as layout that follows from the
  day count, not as tokens, as Stepper's widths follow from its step count.

### F8: Navigation

- **Pioneer: Tab Item and Tabs.** MUI `Tabs` and `Tab`, Flutter `TabBar` and `Tab`, with the moving
  indicator hidden.
  - Tab Item: size, and `selected` and `disabled` props; its misbound colour is decided in its
    overlay; M2's side findings.
  - Tabs: `value`, `onChange`, and arrow keys (`role="tablist"`). The eight Figma instances are
    example content, so the strip is a content slot (A3).
- **Members:**
  - Nav Item, Section Nav Item, and Section Nav Group Header (standalone);
  - Breadcrumb Item and Breadcrumbs: MUI `Breadcrumbs`;
  - Tree Item: after M5; composes `.Tree Indent`, Checkbox, Counter, StatusIndicator and Tag.

### F9: Paging and steps

- **Pioneer: PaginationItem.** MUI `PaginationItem`, bespoke in Flutter.
- **Members:**
  - PaginationNav, PaginationEllipsis (standalone) and Pagination (standalone);
  - PageNavButton, and PageNavigator (standalone);
  - Stepper Indicator, Step and Stepper, bespoke on both:
    - Stepper Indicator draws the number, or Figma's tick or error mark;
    - Step composes the indicator, the label and the line;
    - Stepper takes 2–5 `steps` from Figma's `showStep3–5` booleans, with `aria-current="step"` on
      the active one. Expect its unbound widths to follow the step count, not a token.

### F10: Cards

- **Pioneer: Card.** MUI `Card`, Flutter bespoke on `Material`.
  - API: `status`, `disabled`, `loading`, plus slots for icon, title, helper, the more menu (an
    Icon Button), content and tag (a Tag).
  - `loading` shows Figma's skeleton frames, with `aria-busy`.
  - It is interactive only when given `onClick`.
  - M2's findings.
- **Members:**
  - Container;
  - Accordion (MUI `Accordion`, Flutter `ExpansionTile` restyled) and Expandable Card;
  - Option Card, File Card and Status Card;
  - Insight Card (after M5), Insight Card Small and Insight Row;
  - Image Card, and Interactive Card (composes Checkbox, DragHandle, Icon Button, Radio, Toggle);
  - Action Card and Device Card;
  - Launch Card, and Launch Card Full Screen (standalone);
  - Split Dropdown (standalone);
  - Event Row (composes Avatar).

### F11: Tables and properties

- **Pioneer: Row.** Composes Column Item, RowExpand and RowSelect. Semantic table markup (MUI
  `TableRow`) on the web; bespoke in Flutter.
- **Members:**
  - Column Item, and RowSelect (composes Checkbox);
  - Table;
  - TableHeader: composes Icon Button, SearchField and Segmented Control;
  - TableFooter: composes Button, Dropdown and Pagination;
  - PropertyRow and PropertyList.
- **Sorting, selection state and pagination logic** are the caller's. The components draw them.

### F12: Overlays and dialogs

- **Pioneer: Dialog.** MUI `Dialog` (portal, focus trap, Esc, focus returning to the trigger);
  Flutter `Dialog` and a `showSolarDialog` helper.
  - `type`: default, image (the image slot, A2), wizard (a Stepper in the header).
  - Slots: title, content, the close Icon Button, and the footer Button Group.
  - `role="dialog"`, `aria-modal`, labelled by its title.
- **Members:**
  - ConfirmationDialog and Split Dialog: the latter composes Text Input;
  - Drawer (standalone): MUI `Drawer`, and a Flutter end drawer or sheet;
  - Scrim (standalone): MUI `Backdrop`, Flutter `ModalBarrier`;
  - Tooltip: MUI `Tooltip`, Flutter `Tooltip` with its theme;
  - Popover: after M5; MUI `Popover`, Flutter `OverlayPortal`;
  - Coachmark: composes Button Group and Node End.

### F13: Calendar parts

Styled parts only (decision): each is a component checked against Figma, with no date logic.

- **Pioneer: `CalendarDayCell`** (M6). Composes Event Chip, so Event Chip is built first, as the
  pioneer's own first step.
- **Members:**
  - Weekday Header, Time Slot and Time Axis Label;
  - All-Day Bar and Event Chip: 64 axis findings on `category` × `style`, which are real
    interactions to review;
  - Agenda Row: composes Avatar;
  - Calendar Toolbar (standalone): composes Button, Icon Button and Segmented Control.

### F14: Charts

A library draws the plots, and the SOLAR parts are generated (decision).

- **Pioneer: Sparkline.** An SVG `path` on the web, a `CustomPainter` in Flutter.
  - API: `data: number[]` and an optional `trend`; size sm 80×24 or md 120×32.
  - The recipe gives the stroke colour per trend, the stroke width and the box. The data gives
    the path, scaled into the box.
  - The visual check draws Figma's sample line (A1's geometry) and compares stroke, colour and
    box. A unit test checks the scaling.
- **Members, generated and checked:**
  - Data Legend: composes StatusIndicator;
  - Chart Tooltip: composes StatusIndicator;
  - Bar: 47 colour variants, the series palette.
- **Members, as a library theme:** Bar Chart, Bar Stack, Line Chart, Donut Chart, Chart Axis and
  Chart Gridlines.
  - Each IR is built. Only the cells a theme can carry are emitted as a generated theme per
    platform: series colours from Bar, stroke widths, axis and label typography, gridline stroke,
    and the tooltip from Chart Tooltip.
  - The plot geometry is Figma's sample, not design, so its findings are `accept`ed by one rule
    per set, with that reason.
  - The check is a unit test that the theme carries each recipe value, plus a Storybook and
    Widgetbook story drawing Figma's sample data for the eye. The per-variant visual check does
    not apply to a library's plot; say so in the Done note.

---

## Done when

- All 132 components in `components/` build an IR, or the plan names each one that does not and why.
- Every family is generated for React and Flutter, with shells, in `COMPONENTS`, the parity suite
  and both visual checks. F14's library charts are themes with their own checks, as above.
- Every variant matches Figma on both platforms, or differs only where an overlay or an open finding
  says so, and CI enforces it.
- Every finding is decided or open, and the open ones are in the design review.
- The triage's findings column holds only open findings, each named in the design review.
