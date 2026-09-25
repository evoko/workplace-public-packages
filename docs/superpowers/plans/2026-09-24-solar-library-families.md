# Milestone 4 — the component library, family by family

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to carry this plan out task by task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate every component in SOLAR Web's components section, 128 beyond the four built,
for React (MUI) and Flutter. Each is checked variant by variant against Figma, as in 3b.

**Architecture:** Unchanged from 3b: IR, overlay, two recipes, shells from templates (scaffolded
once until 2026-09-24, generated on every run since: see "Between F5 and F6"), and the oracle and
visual checks. Two things change. The machinery tasks (M) come first and make a component
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
| Shared defaults     | **Zero insets only.** An unbound 0 padding or gap is `inset.none`. Every other decision stays in the component's own overlay. Refined 2026-09-24: a zero gap is the none of its direction's family, `inset.none` horizontal and `stack.none` vertical, as SOLAR binds gaps. |

From the design team (via the owner, 2026-09-24), each applied where it lands:

| Question                         | Decision                                                                                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stepper's 225px padding          | **Figma presentation only.** It makes the stepper look right on the Figma page; the code does not reproduce it. Stepper's progress width follows its step count (F9), and the finding is decided in its overlay, not raised with SOLAR. |
| Components with no description   | **Not a concern.** They belong to pages not in use (the views and the documentation frame), which this plan does not build. The design review now leaves the views out.                       |
| Avatar's colours                 | **Any colour the user picks.** Avatar is not a palette: Figma's `color` × `shade` variants are samples. The API takes a colour, and Avatar's primitives, in Avatar or an Avatar inside another component, are not findings (F1). |
| State values outside the ladder  | **Fine as they are.** `edit`, `today`, `other-month`, `today-column`, `no-results`, `search`, `rename` stay SOLAR's states. The IR already makes a state value that is not a platform state a boolean prop, so Tree Item has `edit` and a Day Cell `today`. |

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
- **Refined 2026-09-24** (F1's sync note): the gap is a rule of its own, `zero-gaps`, whose token
  follows the layout's direction.
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
- [ ] **3. Shells.** Since 2026-09-25 (the pipeline review's item 9), written by hand as files:
      `packages/components/src/<Name>.tsx` and `solar_flutter/lib/src/components/solar_<name>.dart`,
      from the nearest component's, importing the generated tree and slots and holding no design
      value; sample copies Figma draws (a table's rows) opt into `repeats` in the overlay.
- [ ] **4. Story and shell tests.** `npm run solar:codegen` writes the story and checks both shells
      exist. Shell tests: behaviour, accessibility, composition from the recipe. When a check fails,
      `npm run solar:explain -- "<Name>" --variant …` says which recipe entry won and why.
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
  - Avatar: MUI `Avatar`. **Its colour is the caller's, any colour** (design team, 2026-09-24):
    the API takes a colour value (a CSS colour on the web, a `Color` in Flutter), not an enum of
    Figma's `color` × `shade` samples, and the recipe carries no palette. Its primitive-colour
    findings are decided by that, and so are the Avatars' fills inside Agenda Row, Event Row,
    Column Item, Profile Dropdown and Top Bar. How the initials' colour follows (picked with it,
    or derived for 4.5:1 contrast) is asked in the design review's decisions; until SOLAR answers,
    derive it for contrast. The 114 drawn combinations are samples, and the one `sparse` finding is
    Figma's; image content comes from A2;
  - Divider: MUI `Divider`, Flutter `Divider`;
  - Skeleton: MUI `Skeleton`, bespoke in Flutter;
  - ProgressBar: MUI `LinearProgress`, Flutter `LinearProgressIndicator`.
- **Expect:** M2's findings on StatusIndicator's inner path and on `.Tree Indent`'s layout. Figma
  gives Counter hover and pressed states because it is clickable inside a Button; the shell makes it
  interactive only when given `onClick`.

**Started 2026-09-24: a data gap first.** StatusIndicator draws each type differently: the disc
is the root for `success`, a vector for `warning` (a triangle) and `danger`, and a child frame for
the rest. Where a frame has no auto layout, its children sit at positions the fetcher did not
record, so the `!` inside the triangle could not be placed. 13 components in the Components
section have children placed by position: Cursor, Slider, Slider Range, Toggle, StatusIndicator,
Sparkline, Spinner, Time Slot, Radio, ProgressBar, RowExpand, Node End and Donut Chart.

- **The fetcher now records `position`,** `[x, y]` relative to the parent, for any layer its
  parent's auto layout does not place (`docs/solar-web/raw/fetch-rest.mjs`, documented in
  `docs/solar-web/schema.md`). Roots get none.
- **The data arrived with the owner's sync of 2026-09-24** (SOLAR Web `2402690438319512660`):
  291 positions on 31 raw pages, and no other change the fetcher made. Figma itself changed some
  documentation cards (see below), Resource View's paddings, and a few bindings; Foundations and
  Icons did not change. Generated code did not move, beyond its recorded file version.
- **Then, as machinery:** the recipe gives a placed layer `x` and `y` cells, the oracle records
  them, both checks measure them, and both emitters and the shells place such a layer.

**Positions, done 2026-09-24.**

- **Recipe:** a placed layer has `x` and `y` cells (`{ position }`), class `shape`, so they follow
  every axis and raise no finding: positions are the drawing's coordinates, as a glyph's outline
  is, not spacing. M2's rule writes `none` where another variant's auto layout places the layer.
- **Shape or box:** a layer with a glyph (an outline) is a shape; a frame, text, instance,
  ellipse or rectangle is a box. Toggle's thumb is an `ELLIPSE` with no outline, so a box.
  - The MUI recipe draws a placed box `position: absolute` at `left`/`top` in pixels, with
    `position: relative` on its parent unless the parent is placed itself. A placed shape's
    position stays in the composition data with its glyph, for the shell that draws it.
  - An SVG layer of a control (Spinner's) gets no CSS position.
  - Flutter reads positions as lengths (`px:`).
- **Oracle:** a placed box gets `x`, `y`, `width` and `height`, measured from the parent's edge;
  a placed text only `x` and `y`. A shape's position is inside its `glyph`, recorded and not
  measured, as its outline is. Both checks list `x` and `y`, and the web check measures them
  between the layer's and its parent layer's outer edges.
- **`controlDraws`,** a new overlay rule: a layer the base control draws itself, whose box the
  oracle then excuses in every variant.
  - Spinner's track is one. CircularProgress draws the ring as an SVG circle in its own view box,
    so it cannot match Figma's `[0, 0]`, 16×16 ellipse to half a pixel.
  - This is Spinner's one oracle change. Its generated recipes gained the positions (composition
    data on the web, lengths in Flutter), and its drawing is unchanged.
- **`NAMES`,** the components by their names in code, is exported beside `COMPONENTS`, which holds
  addresses. The web check, the Storybook data and two tests read `NAMES`, since their files and
  tables are named after the code name (M6's `inputs/Day Cell` builds as `Date Picker Day Cell`).
  Before this, they would have missed it.
- **Tests:** positions in the recipe (moving by axis, `none` where laid out), the MUI emitter (a
  placed box, a placed shape), Flutter's lengths, the oracle (Toggle's thumb as a box,
  StatusIndicator's `!` in its glyph, Spinner's excused track), `controlDraws`, and the web
  comparison.
- **Checks:** 604 JS tests, both visual checks, 94 Flutter tests, lint, typecheck, format, both
  viewers, and two identical rebuilds.

**What the sync of 2026-09-24 changed, and what followed:**

- **Documentation cards:** 43 pages' Usage text now describes their own component; Nav Item and
  Stepper keep Breadcrumbs' Description. All 45 keep Breadcrumbs' Accessibility section.
  `docs/solar-web/build-docs.mjs` now names the copied section on each page in `issues.md`.
- **Bindings:** Resource View's 44 hard-coded paddings and gaps are bound. Date Picker Open, Insight
  Row, Filter Panel and one shell pattern gained bindings, closing 4 findings in the triage.
- **The zero-gap default** now picks `inset.none` or `stack.none` by the layout's direction, as
  SOLAR binds gaps (the Foundations agent reference: horizontal auto-layout gaps bind to
  `inset.*`). Spinner's vertical root now uses `stack.none`, the one change in generated code
  (the same 0px). A direction the rule names no token for, Date Picker Open's GRID, is left to
  its component: that zero stays open.
- **The design review** (`docs/solar-review-for-design.md`) was rewritten with the sync and the
  design team's notes above:
  - it covers the Components and Patterns sections only, so no view or documentation frame
    finding is listed;
  - it no longer lists Stepper's padding, Avatar's and the logo's colours, or the extra state
    values;
  - its gap suggestions are `inset.*`, since every hard-coded gap is horizontal;
  - StatusIndicator's unknown variable is corrected to a border colour;
  - it asks one new question, how Avatar's initials take their colour.

**Pioneer done 2026-09-24: StatusIndicator.** 21 variants, every one matching Figma on both
platforms; 32 findings, all decided.

- **Overlay** (`spec/overlay/statusindicator.yaml`):
  - bespoke on both platforms;
  - `drawing`, a new rule: every cell of every layer follows every axis, since each type is its
    own drawing from other layers. It turned 86 open findings into 18;
  - the disc sizes (root, container, info's frame) bound to `icon.md`/`icon.sm`, as a feedback
    icon's;
  - the xs dot's 8px allowed, through `allowLiteral` with `values`, a new form that leaves the rest
    to a bind;
  - the marks' boxes allowed as the drawing's coordinates;
  - `help`'s unknown border colour `set` to `color.border.medium`, as every other type's;
  - the `shadow/raised` Figma puts on five of the seven marks `set` to none, since a box shadow
    cannot fall on an outline and SOLAR has no drop-shadow token.
- **Machinery found and fixed on the pioneer:**
  - `drawing`, and `allowLiteral` `values`.
  - **Glyph entries in the MUI recipe.** A layer may be a glyph in one entry and a box in another
    (the container: danger's vector circle, neutral's disc frame), so the emitter decides per entry.
    A glyph's colours are the SVG's `fill` and `stroke` and the stroke outline's `fill`; radius or
    shadow on a glyph is refused, not dropped.
  - **Combined-only recipes.** Both emitters found a component's appearance axes from its
    appearance entries alone; a drawing has only combined ones (size with type).
  - **`Solar<Name>Parts`,** the composition type, now carries numbers and glyphs, exported per
    component, so a shell reads a glyph and a position with its type.
  - **`SolarGlyphView`** (`lib/src/solar_glyph.dart`), a hand-written widget that draws a glyph at its
    size in its fill and stroke colours, and carries the stroke width for the check to read.
    Checkbox and Sparkline will reuse it.
  - **Placed glyphs are measured.** A glyph's position and box are measured as a box's are, so a
    shell that misplaced the `!` fails. Spinner's indicator arc joins its track under
    `controlDraws`.
  - **The web check** reads an SVG element's paint whatever its layer, since a layer can be SVG in
    some variants only.
- **Shells:** each walks Figma's layer tree from the recipe, drawing a layer as a glyph or a box,
  placed at the recipe's `x`/`y` where its parent has no auto layout. Both are decorative unless
  given a `label`, then an image with that name.
- **Both visual checks were proven to compare:** a deliberately wrong colour, and a wrong type,
  fail every variant, naming the layer.
- **For the designers** (review, section 6 and the decisions): the marks' shadow, and the dot's
  size; `help`'s unknown variable is in section 4.
- **Tests:** the IR and both recipes (`test/status-indicator.test.mjs`), the React shell
  (`test/StatusIndicator.test.mjs`), the widget (`solar_statusindicator_test.dart`), the overlay
  forms, and both visual checks.
- **Checks:** 623 JS tests, both visual checks (7 on the web), 99 Flutter tests, lint, typecheck,
  format, both viewers, and two identical rebuilds.

**Batch done 2026-09-24: F1 complete.** The twelve members are built on the pioneer's machinery,
one after another rather than by subagents: each adds a descriptor to the one tree the others build
from, so parallel builds would have read each other's half-written files. Every member matches Figma
on both platforms, and every finding is decided (the triage shows 0 open for all 13).

- **Owner decisions (asked at the start of the batch):**
  - **Timestamp** takes the app's words, formatted in the user's locale, plus the date: `<time
    datetime>` on the web, a tooltip with the absolute time for `combined`. Flutter has no
    machine-readable time, so its widget takes the words (`text`) and the `detail`.
  - **Avatar's initials** keep the caller's colour's hue at Figma's lightness (OKLCH 0.37 or 0.93,
    its 700s and 100s), as vivid as sRGB holds, and move toward black or white just far enough for
    4.5:1 (`internal/ink.ts`, `solar_ink.dart`, identical outputs pinned on both). A grey's ink is
    a grey; `textColor` overrides.
- **Members:**
  - drawn on both platforms (the shared layer helpers): Counter, Kbd, Timestamp, Trend Badge,
    Divider, Node End, RowExpand, Tree Indent (Figma's `.Tree Indent`, `codeName`), Cursor;
  - Avatar: MUI Avatar, drawn in Flutter (CircleAvatar cannot draw the logo's square);
  - Skeleton: MUI Skeleton (always rectangular, its pulse removed under reduced motion), drawn in
    Flutter with the same pulse over `motion.duration.slower`;
  - ProgressBar: MUI LinearProgress and Flutter LinearProgressIndicator, the bar `controlDraws`.
  - **Changed from the plan:** Divider is drawn rather than MUI's or Flutter's Divider, which draw
    their rules as a border and pseudo-elements, and take no label, so neither can be measured
    layer by layer.
- **Machinery found and fixed on the batch** (each with tests):
  - **Shared layer helpers:** `internal/layers.tsx` and `SolarLayers`, with a measuring twin
    (`test/visual/layers.dart`), draw a glyph, a SOLAR icon, a text, an image or a box, placed or
    laid out, translucent where the recipe says; `src/scaffold/drawn.mjs` writes the shells.
    StatusIndicator was re-scaffolded onto them. `slots: 'drawn'` derives a drawn component's slot
    table from the IR (Cursor has 11 layers).
  - **States from the control around** (`solar_states.dart`): `SolarButton` shares its states, and
    Counter follows them, as Figma draws a counter in a button; `SolarPressable` for a drawn
    control. The web does it with selectors, spelled from the element (`button:hover &`), since
    Emotion reads a leading colon as the element's own. Button's cases now hold a real Counter,
    checked against Counter's oracle.
  - **The recipe read cells it used to drop:** a layer the reference variant does not draw
    (Divider's label) is read where it is drawn; a root or placed layer no auto layout sizes has
    its drawn size; an ellipse is a round box (`radius.pill`); a boolean operation's operands are
    no layers; a translucent layer has `opacity`. This is why the triage's finding count rose from
    3,472 to 3,515.
  - **Emitters:** a `HUG` past a fixed base resets to `auto`; a vector's radius is in its outline;
    `controlDraws` layers declare no box; empty rules are dropped; enum values that are no Dart
    identifier are respelled (`top-search` to `topSearch`, `00` to `$00`).
  - **Oracle:** a `set` keeps what it `replaced`, so the oracle excuses exactly the variants that
    draw it (Cursor's shadow); `controlDraws` excuses roundness too; an ellipse's radius is half its
    size.
  - **Checks:** both compare a corner as drawn (no rounder than half its box) and `opacity`; the
    Flutter checks load the bundled fonts, so text is laid out in Inter rather than the test font.
  - **Overlay:** `samples` (an axis of samples, dropped) and `caller` (a colour the caller gives, a
    `color` prop, or a cell derived from it), with a `color` API type in both emitters, Storybook
    and Widgetbook; overlay files drop a leading dot (`tree-indent.yaml`).
- **For the designers** (review, sections 2 and 6, and the decisions, now 20): Cursor's two
  primitives, Trend Badge's xs decline colour, Avatar's missing lg logo, Tree Indent's 39px units,
  sizes with no variable, Node End's halo opacity, drop shadows, Skeleton's pulse, and Avatar's
  initials rule.
- **Checks:** 745 JS tests, both visual checks (19 on the web), 137 Flutter tests, lint, typecheck,
  format, all three Flutter packages analysed and formatted, both viewers built, the personal-data
  scan, and two identical rebuilds.
- **Open for the family review:** whether Cursor belongs in `@bwp-web/canvas` rather than
  components, and whether Tree Indent, Node End and RowExpand, building blocks of later families,
  should be exported publicly.

**F1 reviewed 2026-09-24 (owner):**

- **Cursor is removed from the design-to-code flow.** Its descriptor, overlay, generated files,
  shells, cases and tests are deleted, and `spec/overlay/excluded.yaml` records the decision: the
  triage no longer lists it (131 components, 16 generated), the build refuses a descriptor for it,
  and the design review drops its findings (its two primitives, its shadow). The machinery it was
  the example for stays, with tests of its own: a boolean operation's operands (a synthetic set),
  the oracle's excuse of what a `set` replaced (Button's shadow), and unsized roots (Checkbox,
  Radio, Bar and Scrim have them).
- **Tree Indent, Node End and RowExpand stay public.**

### F2: Buttons

On Button's machinery.

- **Pioneer: FAB.** MUI `Fab`, Flutter `FloatingActionButton` styled by the `ButtonStyle`
  builder; `type` × size. It has 27 axis findings.
- **Members:**
  - BackButton: Button with the arrow icon;
  - SplitButton: two joined press targets. The menu is a slot the caller fills until F6;
  - Link: MUI `Link`, bespoke in Flutter. It uses the `link/*` text styles with their underline.

**F2 done 2026-09-24.** FAB (pioneer), BackButton, SplitButton and Link, every variant matching
Figma on both platforms and every finding decided (the triage shows 0 open for all four).

- **Members and bases:**
  - **FAB:** MUI's Button, not its Fab, which has no loading state; Flutter's FilledButton. Its
    `type` is derived from the label (an extended FAB is one with a label), so it is no prop, and
    no clash with a button's HTML `type`.
  - **BackButton:** MUI Button and FilledButton with SOLAR's ArrowLeft; "Back" by default, the
    arrow alone named "Back".
  - **SplitButton:** drawn on both platforms, its halves two buttons, the whole control taking the
    states of whichever is hovered, pressed or focused; the menu is the caller's until F6.
  - **Link:** MUI's Link on the web, drawn in Flutter and announced as a link.
- **Decisions in the overlays** (and raised in the design review):
  - SOLAR's focus ring where Figma draws none (FAB, Link), for the WCAG floor;
  - FAB keeps its size while loading, where Figma narrows the extended one;
  - SplitButton's chevron half keeps its size where Figma widens it in two variants, and its
    halves keep their room while loading;
  - Link's detached xs label drawn in `link/xs/*`;
  - opacity literals for SplitButton's rule and the disabled Link.
- **Machinery found and fixed on the family** (each with tests):
  - **`derive` in the emitters:** a derived axis keys the recipe (`Solar<Name>RecipeProps`, and a
    field of Flutter's props class) though it is no prop.
  - **`set` adds a state's entry** where the IR keeps none (a focus drawn as at rest), refusing a
    state the component lacks; what it replaced is the resting value.
  - **A component with states and no appearance axis** keys them under `default` on both
    platforms, and the oracle's `set` excuse reaches every variant under it.
  - **The ButtonStyle builder** leaves the foreground unset where a variant has no label (an icon
    FAB), rather than asking the recipe for a colour it does not hold.
  - **The drawn-layer helpers:** a layer drawn as the shell's own element (`render`, `builders`),
    a slot the caller fills (`slots`), and a pressable announced as a link.
  - **The checks:** the web check reaches focus on a control's first focusable part (a group of
    buttons), and the Flutter measure reads a layer a Visibility hides as not drawn.
- **Label conventions:** a label is `children` in React and `child` in Flutter (FAB, BackButton);
  a drawn component takes its words as a String, `label` (SplitButton, Link).
- **Checks:** 776 JS tests, both visual checks (22 on the web), 149 Flutter tests, lint, typecheck,
  format, all three Flutter packages analysed and formatted, both viewers built, the personal-data
  scan, and a rebuild that reproduces the tree.

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

**F3 done 2026-09-24.** Checkbox (pioneer), Radio, Toggle, Slider, Slider Range, DragHandle,
Segmented Control Item and Segmented Control, every variant matching Figma on both platforms. The
triage shows 0 open findings for all but Checkbox, whose compound disabled-and-hover variant stays
3b-1's finding, as planned. The triage matched this plan's picture of the family; the one
question it raised, Slider's `filled` and `error` drawn exactly as its default, the owner answered:
kept as props.

- **Members and bases** (where they differ from the plan, why):
  - **Checkbox:** MUI's Checkbox, its root the box, the tick and dash drawn inside as MUI's icons;
    in Flutter, drawn and pressable, announced as a checkbox. A mixed box is drawn checked, as
    Figma draws it only so. Uncontrolled through `defaultChecked`.
  - **Radio:** MUI's Radio, checked by MUI's RadioGroup; in Flutter **`RawRadio` under a
    `RadioGroup`**, not a bespoke pressable, for the group's arrow keys and semantics, so its
    `checked` is the group's (`flutter.groupDecides`).
  - **Toggle:** MUI's Switch, its root drawn as the track and the recipe's thumb in MUI's thumb
    slot; drawn in Flutter, announced as a switch.
  - **Slider and Slider Range:** MUI's Slider. **In Flutter, drawn over `SolarSliderInput`**, not
    Flutter's Slider and RangeSlider: those paint a track and thumb the check cannot read, and
    take no edged, shadowed handle. The input drags the nearest handle, and gives each the focus,
    the arrow keys and a slider's semantics.
  - **DragHandle:** drawn on both; focusable, announced as a drag handle, pressed while held
    (from the raw pointer in Flutter, so the caller's drag does not cancel it). The drag is the
    caller's.
  - **Segmented Control and its Item:** **a radio group, not MUI's ToggleButtonGroup**, as the
    description says it behaves: each segment a `<label>` around a native radio input of one
    name on the web, a `RawRadio` in Flutter, so the arrow keys move between them. The control is
    drawn, its track holding the caller's segments.
- **Decisions in the overlays** (and raised in the design review):
  - SOLAR's focus ring where Figma draws no focus state (Toggle, Slider Range, Segmented Control
    Item);
  - Checkbox's resting mixed box given the edge every other enabled box has; a disabled checked
    box and a disabled thumb or handle drawn flat, as Figma draws them;
  - an unselected segment keeps a transparent edge, so choosing one does not grow it;
  - a slider fills its container, and its handle is centred on the value, where Figma draws it 2px
    short;
  - Segmented Control's label shown where given, though Figma always hides it;
  - raw sizes carried for the boxes, rings, tracks, thumbs, handles and dots.
- **Machinery found and fixed on the family** (each with tests):
  - **A placed layer steps back by its parent's border.** Figma measures a position from the
    parent's outer edge, and CSS and a Flutter Container from inside the border: Radio's dot sat
    a pixel off. The MUI recipe says each placing layer's border as `--solar-placed-left` and
    `--solar-placed-top`, which its children subtract, and SolarLayers sets a placed child in by
    its parent's border and padding.
  - **A base drawn by no variant reads as its layer is drawn** (Checkbox's tick, only in a checked
    box): its cells are a glyph's where every entry that shows it draws a glyph, so an SVG takes
    no stroke.
  - **`set` adds focus where Figma draws none at all** (it joins the states), and an appearance
    the layer lacks where another layer has it; its excuse no longer reaches a state that holds
    its own value.
  - **`controlDraws` with `cells`** names the only cells the control decides (a slider's fill and
    handle), and **`shownBy`** a layer Figma always hides that a filled slot shows.
  - **The shells:** `drawnFlutter`'s `control` and `values`; `SolarPressable` announced as a
    checkbox or a switch; SolarLayers' and `drawChildren`'s `content`; `SolarSliderInput`; and
    the story template wraps a long export as Prettier does.
  - **The parity test** reads a renamed prop (`checked: checkedProp`), a prop a Flutter group
    decides, and a content slot as the children.
- **Checks:** 858 JS tests, both visual checks (30 on the web), 177 Flutter tests, lint, typecheck,
  format, all three Flutter packages analysed and formatted, both viewers built, the personal-data
  scan, and a rebuild that reproduces the tree.

### F4: Tags and messages

- **Pioneer: Tag.** MUI `Chip`, Flutter `Chip` (`InputChip` when closable). API: `status`,
  `invert`, `indicator`, `icon`, `onClose`, and the label as its child. Figma's `type` follows from
  those (A3); expect most of its 110 axis findings to go with it. It composes StatusIndicator.
- **Members:**
  - Alert and Alert Small: MUI `Alert`, bespoke in Flutter;
  - Banner: composes Button;
  - Toast: MUI `SnackbarContent`, Flutter `SnackBar` content; composes Tag;
  - EmptyState: standalone (M4); composes Button.

**F4 done 2026-09-24.** Tag (pioneer), Alert, Alert Small, Banner, Toast and EmptyState, every
variant matching Figma on both platforms and every finding decided (the triage shows 0 open for
all six). As the plan expected, Tag's 120 axis findings went with its `type`: once derived, each
type's layout followed it. The triage's one new question, Toast's Tag, the owner answered: draw
Figma's overridden look.

- **Members and bases** (where they differ from the plan, why):
  - **Tag:** **drawn on both, not MUI's Chip or Flutter's Chip**, whose paddings, heights and
    label boxes fight Figma's five layouts; it is a label, not a control. Its type follows from
    the words, an icon, `indicator` and `onClose` (the 2026-09-23 decision); its dot is a
    StatusIndicator; the types refuse an inverted tag with a dot, which Figma does not draw.
  - **Alert and Alert Small:** **drawn, not MUI's Alert**, for the same reason, and to announce
    a warning or a danger at once and anything else politely, where MUI's Alert always alerts. One
    template serves both.
  - **Banner:** drawn; SOLAR's icon for its type, the caller's sm Buttons, a text action and a
    close button.
  - **Toast:** drawn; where it appears and for how long is the app's (MUI's Snackbar, Flutter's
    ScaffoldMessenger), so neither base's container is used. Its Tag is a SOLAR Tag in `status`,
    restyled by the toast (owner decision: Figma's look).
  - **EmptyState:** drawn, standalone; its words wrap, centred.
- **Decisions in the overlays** (and raised in the design review): Tag's types by content; the
  Toast's `pill` Tag drawn as a status tag, and restyled; every callout, banner and slider-like
  width filling its container; composed children's sizes left to them; Figma's `style` renamed
  `variant`; icon sizes bound to the ladder.
- **Machinery found and fixed on the family** (each with tests):
  - **A reference no variant draws the layer in** (Figma draws no inverted status Tag): the recipe
    now reads a cell from a variant of the same combination that draws it, so the inverted close
    button's 16px was no longer lost.
  - **`derive` with `props`:** an axis may follow from the shell's props (`indicator`,
    `onClose`) beside its slots; the oracle's `content` names both, and the parity test checks
    both shells take them.
  - **`restyles`**, a parent drawing its composed child's fill and edge, read from the instance,
    written on the child's root, and checked against the parent; and **a `set` on a child's
    `variant.*`**, which the oracle honours (`figmaVariant` keeps Figma's).
  - **Composed children in drawn components:** `render` on the web (in the layer's element),
    `composed` in Flutter, and the Flutter measure recognises a composed child by its keyed root,
    at any depth (Toast, Tag, StatusIndicator). Both checks leave a composed child's box, and
    whatever else the parent's entry holds, to the parent.
  - **The shells' helpers:** SolarLayers' `wraps` and a component slot with no colour;
    `drawnFlutter`'s `builders`, `composed`, `wraps`, `restyle` and derived `values`;
    `drawnReact`'s extra `icons` and `present`; a component with no props (`Record<never, never>`
    on the web, `const` props in Flutter); `place` merging nested blocks.
  - **The parity test** accepts `on<Slot>` for a slot a callback shows (Banner's `onClose`).
- **Checks:** 936 JS tests, both visual checks (36 on the web), 190 Flutter tests, lint,
  typecheck, format, all three Flutter packages analysed and formatted, both viewers built, the
  personal-data scan, and a rebuild that reproduces the tree.

**Sync 2026-09-24, before F5** (SOLAR Web `2402761872194862831`). Text only: no drawing changed
on any page, and no generated file of the 34 built components moved. SOLAR's descriptions now give
the drawn heights and say "the 44×44px WCAG hit area is padded in code (no target-size variable
exists yet)", which settles the design review's first question, and the 36 Breadcrumbs cards now
describe their own components. **Owner decision: pad now**, with one flagged 44 per platform.

- **Web:** `src/scaffold/target.mjs` (`TARGET`, `targetArea`, `targetInput`) gives every control's
  recipe an invisible target at least 44 × 44 around it that takes no room: a pseudo-element, or
  the native input enlarged (Checkbox, Radio, Toggle), and MUI's own thumb area on a slider. A new
  check probes 21px from each control's centre, every way, and requires the control.
- **Flutter:** `SolarTarget` (`lib/src/solar_target.dart`, `solarTargetSize`). Hit testing stops at
  each box, so a control on its own takes the room where the theme pads tap targets (touch
  platforms), drawn centred, a tap in the padding landing on its centre; a part of another
  component (`SolarTarget.inside`) reaches past itself within the component, taking no room.
  SolarPressable's `target`; SolarLayers applies a shell's builders outside a flex child's
  overflow box, so the reach is not cut short. The FilledButton-based buttons are padded by
  Material (48).
- **Design review:** section 3 is down to Link's xs, section 5 is resolved, and decision 1 is now the
  target-size variable.
- **Checks:** 936 JS tests, both visual checks (37 on the web, the target check among them), 194
  Flutter tests, and the rest of the list.

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

**F5 done 2026-09-24.** Text Input (pioneer), Text Area, SearchField, GlobalSearch, Password Input,
Number Input, Inline Input, Token Input, PIN Input and FileUpload, every variant matching Figma on
both platforms. The triage shows 0 open findings for Text Area, Inline Input, Token Input and PIN
Input, and 20 open elsewhere, each a Figma slip the code does not copy (sm paddings and centring,
the error fields' centring, Number Input's md error spacing, FileUpload's 68px filled zone), in the
design review. The triage matched this plan's picture; the owner answered its four questions:
GlobalSearch is a trigger, Inline Input holds its mode, PIN Input takes a `length` of 4 to 6, and
Token Input owns its `string[]`.

- **Members and bases** (where they differ from the plan, why):
  - **Text Input:** MUI's InputBase, as planned, but **not in a FormControl**: the shell knows
    filled from its value and draws its own label and helper, linked by id. Flutter's TextField,
    undecorated, in the drawn field. Its `pressed` is renamed `focus`, and `filled` follows the
    value. Figma's `mandatory` layer is `mandatory` on both, which also makes the input required.
  - **Text Area:** InputBase, multiline, filling the field's fixed height; the caller's Icon
    Buttons pinned in its corners; its count against `maxLength`.
  - **SearchField:** the whole component is the InputBase, a search input named "Search".
  - **GlobalSearch:** **a button drawn as the field** (owner), showing the placeholder or the
    app's `query`, with its `shortcut` in a Kbd.
  - **Password Input:** a native password input with SOLAR's eye as a toggle; Figma's "Forgot
    password?" layer is **a slot of its own**, shown wherever given.
  - **Number Input:** **a text input announced as a spinbutton**, not a native number input, so it
    can be as wide as its digits; the arrow keys and its stepper's buttons step it.
  - **Inline Input:** bespoke; **it holds its mode** (owner), Confirm and Cancel SOLAR Icon Buttons.
  - **Token Input:** **its `string[]`, each a SOLAR Tag** (owner), not the caller's Tags; the rest
    counted by a Counter past `maxVisible`.
  - **PIN Input:** **one native input over the cells** (one-time-code autofill, paste, the numeric
    keyboard), not one per cell; the cell the next digit goes in drawn as Figma's first.
  - **FileUpload:** a real file input on the web; **in Flutter, the app's picker** (Flutter has
    none of its own): `onBrowse`, and the names it gives back.
- **Decisions in the overlays** (and raised in the design review): `filled` (and Token Input's
  `active`) derived from what the field holds; every field filling its container; one focus ring,
  the field's, where Figma rings the whole component; SearchField's hover edge at both sizes and
  its sm icons at `icon.xs`; PIN Input's cells hugging and its sm placeholder `body.md.medium`;
  read-only and disabled tokens without a close button; a Number Input's layout by its stepper;
  Inline Input's padding, edge and radius by its mode; the fields' heights as raw values.
- **Machinery found and fixed on the family** (each with tests):
  - **State blocks in the table's order.** The MUI emitter added a state's block where a layer
    first had the state, so a first layer with only error and disabled put them before a later
    layer's hover, which then won. The blocks now follow the state table, as Flutter's precedence
    already did. Eight built recipes moved (Button, BackButton, DragHandle, FAB, Link, SplitButton,
    Slider, Slider Range); only Button's, Link's and FAB's combined focus blocks changed which rule
    wins, and now agree with Flutter.
  - **A derived state value**: `derive` of a state value the IR makes a boolean prop (`filled`),
    reached in the oracle by content; Flutter's recipe tests it as the prop the widget sets.
  - **Placement from the nearer edge** (`normalize/placement.mjs`, read by the recipe and the
    oracle): a layer placed in a parent that grows keeps its distance from the parent's nearer edge
    (Text Area's buttons, `right` 8), decided once per layer across variants; an instance's place is
    recorded too. Both emitters, both measurers and SolarLayers (an auto layout with children placed
    over it, per-side edges, a caller's control centred in Figma's box) read it. No built
    component's IR or oracle moved.
  - **`set` forms:** a size entry a layer lacks, and an axis finding decided where the set draws
    what its variants draw, a base entry reaching every variant; the oracle excuses a text style a
    set replaced.
  - **`same`**, reading a layer Figma draws anew in some variants as another (Inline Input's
    Confirm and Cancel); the parity test's `shells` table (a label that is a prop, a Flutter name
    for a web prop); a slot that only holds slots is no prop.
  - **The shells' helpers:** `scaffold/field.mjs` (`fieldResets`, `fieldStates`, `fieldFlutter`);
    `targetArea` under an element's content; `SolarField` (`lib/src/solar_field.dart`), holding a
    field's words, focus, states and reveal; SolarLayers' `fields`, `truncates`, a field hugging its
    words in a row that hugs; `keyPrefixOf` lowercasing a leading acronym (`pinInput`).
  - **The checks:** the web check focuses what Tab reaches, a field through its input, and hovers
    the part the recipe's hover names; it measures a composed child's place, and far edges. The
    Flutter harness takes a hidden layer that is not built as not drawn, and measures a field by
    its EditableText; its Button and Icon Button measurers take a component's own buttons.
- **Checks:** 1063 JS tests, both visual checks (47 on the web, the target check among them, with
  five fields' targets), 234 Flutter tests, lint, typecheck, format, all three Flutter packages
  analysed and formatted, both viewers built, the personal-data scan, and a rebuild that
  reproduces the tree.

**Between F5 and F6, 2026-09-24 (owner decision).** Two pieces of the developer loop, for the rest
of the build-out and for the `solar:sync` maintenance after it:

- **Shells are generated.** Every one of the 88 shells was byte for byte its template's output, so
  `solar:codegen` now renders them, and the stories, on every run (`src/shells/index.mjs`, which
  was `src/scaffold/`), each under a header naming its descriptor; CI's rebuild proves them.
  `solar:scaffold` is gone. The owner chose this over splitting the components into generated and
  hand-owned ones by behaviour: a shared helper's fix and a slot Figma adds keep reaching every
  component, and the two platforms' shells cannot drift apart unseen. The price is behaviour
  written in template strings. The opt-out is `owned: true` in a descriptor (no templates; the
  shells are files, without the header). The design spec's "scaffolded once, then owned forever"
  (§5) is superseded, and says so.
- **`solar:explain`** (`bin/solar-explain.mjs`, `src/explain/`): without a variant, a component's
  variants, its excused differences grouped by why, and the last runs' failures; with one, each
  layer and property as Figma's value, the recipe entry that wins and its token's value, where it
  was read from and why, the rules on the cell, the excuse, and what each platform drew in its
  last check. Its lookup is the Flutter recipe's precedence; a test proves it resolves to Figma's
  value in all 21,703 unexcused cells of the 44 components' variants.
- **Found by it:** where two `set` rules decide one finding (a field's width, the base's and sm's),
  the oracle gave every variant the last rule's reason, so md read "As md's, the sm field's 160 a
  sample". Each variant now names the rule that reaches it; eight oracles' reasons changed, no
  excused entry moved.
- **Checks:** 1114 JS tests, both visual checks (47, 234 Flutter tests), lint, typecheck, format,
  the Flutter packages analysed, and a rebuild that reproduces the tree.

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

**F6 done 2026-09-24.** Dropdown Item (pioneer), Dropdown Group Label, Dropdown Menu, Context Menu
Item, Context Menu, Option Row, Options List, ListItem and List, every variant matching Figma on
both platforms, every finding decided (none left open); SplitButton's menu has its default.
53 components.

- **Owner decisions (2026-09-24):**
  - a menu's keyboard moves real focus, and a focused Dropdown Item draws the hover (its
    description's aria-activedescendant read as the look, not the mechanism);
  - a menu is a surface that floats where it is anchored (an element, or a point for Context
    Menu), and draws in place otherwise;
  - SplitButton takes `items` and opens its own Dropdown Menu;
  - List is drawn as Figma draws it, though its description says the opposite of its `in-card`
    variants (the design review asks);
  - rows that touch get no padded 44 × 44 target (a row's box is its target, above WCAG's 24);
  - a menu caps at 300px, one flagged raw value (`MENU_MAX_HEIGHT`, `solarMenuMaxHeight`);
  - Options List's legend is hidden on the page, read by a screen reader.
- **Taken here, open to the owner:** Dropdown Item and Context Menu Item on MUI's MenuItem, ListItem
  on ListItemButton, the rest bespoke; in Flutter all drawn, a menu floated by MenuAnchor through
  `SolarMenuAnchor`. A menu's rows take its size, and a List's rows its compactness, the container
  winning (`SolarMenuScope`, `SolarListScope`, a React context each). ListItem's type follows from
  an `avatar`, as Tag's does; List's `in-card` is renamed `inCard`. A destructive Context Menu
  Item's hover, focus and disabled look are the other rows' (Figma draws none). An Option Row's
  control takes the row's hover. ListItem's `trailing` is an icon.
- **Machinery:**
  - `flutter.states`, a platform state's own Flutter test (the Dropdown Item's hover under focus);
  - a control drawn inside another, inert: `control.drawnIn` (Checkbox's `inStates`), and on the
    web `.SolarStatesScope:hover &` in Checkbox's, Radio's and Toggle's hover;
  - `SolarPressable`'s `role` and `selected`; `content` in both drawn helpers and `before` in the
    React one;
  - `shells/menu.mjs` (`menuReact`, `menuResets`), `internal/float.tsx`, and in Flutter
    `solar_menu.dart` (`SolarMenuList`, `SolarMenuAnchor`, `SolarMenuScope`) and `solar_list.dart`;
  - the web helper marks a drawn icon `<prefix>-drawnIcon`, not `<prefix>-icon`, which a layer
    named `icon` shared: ListItem's icon rule was styling its trailing icon (RowExpand's reset
    moved with it; Tag had the same latent overlap);
  - Toggle merges the caller's `slotProps`.
- **The checks:** a case may mark its root (`data-case-root`) where it holds the component in what
  it always sits in (a MUI MenuList); the Flutter harness measures a slot's keyed children
  (`measureHeld`); the case type lets a child's variant lack a prop.
- **Checks:** 1194 JS tests, both visual checks (56 on the web, 258 Flutter tests), lint, typecheck,
  format, all three Flutter packages analysed and formatted, both viewers built, the personal-data
  scan, and a rebuild that reproduces the tree.

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

**F7 done 2026-09-24.** Select (pioneer), Dropdown, Autocomplete, Autocomplete Open, DatePicker,
Date Picker Open, Date Picker Day Cell, TimePicker and TimePicker Dropdown, every variant matching
Figma on both platforms. Every finding is decided but four left open for SOLAR, Select's and
Dropdown's disabled and error field alignment (a slip, drawn from the start). 62 components,
61 exported: Autocomplete Open is checked as an open Autocomplete. Date Picker Open's 214
no-token findings were mostly its 105 day cells' sizes, which are the Day Cell's own (`set` none),
and its grid's gap, which Figma binds as a grid gap the recipe had not read.

- **Owner decisions (2026-09-24):**
  - Select and Dropdown are one control in two looks;
  - Select's panel is its own, drawn as Figma draws it;
  - a date and a time are typed and picked;
  - the date pickers choose single dates (a Day Cell's range roles are drawn, for later);
  - TimePicker Dropdown is one list of times, not the columns its description names;
  - the week starts on the locale's first day;
  - an Autocomplete's highlighted suggestion draws a row's hover, no look of its own;
  - Autocomplete Open is Autocomplete's open state, no component of its own;
  - `solar_flutter` takes `intl`, so Flutter's weekdays are two letters, as the web writes them;
  - the double calendar's month labels are drawn where Figma places them (the design review asks);
  - a floating double calendar shows one month, as Figma draws double only inline.
- **Taken here, open to the owner:** Select and Dropdown on MUI's Select over InputBase,
  Autocomplete on `useAutocomplete` (its suggestions a Dropdown Menu that keeps the focus in the
  input), the calendar and time list bespoke; in Flutter the pickers are drawn fields under
  `SolarMenuAnchor`, Autocomplete is RawAutocomplete. Values: a date is ISO on the web and a
  `DateTime` in Flutter (`onDateChanged`, as CalendarDatePicker names it, since `onChanged` is a
  field's words), a time `HH:mm` and a `TimeOfDay` (`onTimeChanged`); words are the locale's
  (Intl on the web, MaterialLocalizations in Flutter) and read back on Enter and blur, words that
  are no value leaving it as it was. `error-focused` is error while focused (`states.compound`).
  Dropdown takes Select's focus (Figma draws none). The day cells have no padded target (they
  touch, as rows do). Flutter's Autocomplete shows no panel where nothing matches, as RawAutocomplete does; the web
  writes `noOptionsText`.
- **Machinery:**
  - the overlay's `states.compound` and `composes`; the oracle's `hides` for a composed child's
    hidden layers, checked on both platforms; the descriptor's `checkedAs` and `shells.slots`;
  - a GRID layout's gap from `gridRowGap`, drawn `display: grid` on the web and as the shell's rows
    in Flutter's SolarLayers; a text placed by position keeps its `x` and `y`;
  - `shells/picker.mjs`, `shells/typed.mjs`, and `menuReact`'s generated rows (`rowsFrom`,
    `sizedBy`, `role`, `listRef`); `fieldFlutter`'s `typeParams` and `around`; `drawnFlutter`'s
    `control.focusNode` and `control.target`;
  - the runtime: `internal/calendar.ts`, `internal/clock.ts`, `internal/float.tsx`'s `keepFocus`
    (MUI's Popper), `solar_time.dart`, SolarLayers' per-corner radii, SolarPressable's
    `focusNode`, and SolarTarget's padded intrinsic sizes (a menu sized by them was 8px short per
    padded control).
- **The checks:** both compare a placed layer's `right` and `bottom` too (they were measured and
  never compared); Flutter measures each corner's radius; a case keys a calendar's days
  (`dayProps`, `dayBuilder`) and a time list's rows (`optionProps`, `optionBuilder`) by their
  Figma layers. Tests found and fixed: the double calendar's month titles a month ahead, a day
  never taking the keyboard focus in Flutter, Select's and Dropdown's field reading its label
  twice, and the calendar's first focus on the month's first day where the chosen day was in it.
- **Checks:** 1291 JS tests, both visual checks (65 on the web, 304 Flutter tests), lint, typecheck,
  format, all three Flutter packages analysed and formatted, both viewers built, the personal-data
  scan, and a rebuild that reproduces the tree.

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

**F8 done 2026-09-24.** Tab Item and Tabs (pioneer), Nav Item, Section Nav Item, Section Nav Group
Header, Breadcrumb Item, Breadcrumbs and Tree Item, every variant matching Figma on both platforms,
every finding decided (none left open). 70 components, 69 exported.

- **Owner decisions (2026-09-24):**
  - in Tabs, the arrow keys move the focus and Enter or Space selects (manual activation), as
    SOLAR's description says, since a selected tab is the routed one;
  - a focused tab draws Figma's focus, the selected underline and the ring, on any tab;
  - a focused Nav Item draws SOLAR's focus ring (Figma draws no focus state);
  - Tree Item renames inline (a text field in its label's place), and a keyboard-focused row
    draws edit's edge and ring.
- **Taken here, open to the owner:**
  - Tabs on MUI's Tabs and Tab (its indicator hidden, `variant="standard"`); in Flutter a drawn
    strip (`SolarTabsScope`, `SolarTabList`), not the plan's TabBar, which needs a TabController,
    draws its own label style and ink, and has no arrow keys. The strip does not scroll, since a
    scroll clips the focused ring.
  - Nav Item and Section Nav Item on ButtonBase, links where they have an `href`.
  - Breadcrumbs drawn, not the plan's MUI Breadcrumbs, whose collapse expands in place and whose
    separators are one element for every gap: past five its middle is an ellipsis opening a
    Dropdown Menu, as the description asks.
  - Breadcrumb Item's focus draws SOLAR's ring, as Nav Item's.
  - A Tab Item's Counter follows the tab's state, not its hover.
  - Section Nav Items have no padded target, since they touch, as rows; nor do Tree Item's chevron
    and actions, 16px and 4px apart, where each padded target covered its neighbour's (the widget
    tests found a tap on More calling Add).
  - Tree Item's actions are `onMore` and `onAdd`; its parts are the caller's (`checked`,
    `status`, `tag`, `count`, icons).
- **Machinery:**
  - a `samples` rule that drops Figma's default variant reads the rest against the kept one
    (Breadcrumbs keeps its 5-item trail);
  - Counter's selectors skip a tab around it;
  - `solar_tabs.dart` (`SolarTabsScope`, `SolarTabList`).
- **Checks:** 1383 JS tests, both visual checks (73 on the web, 335 Flutter tests), lint, typecheck,
  format, all three Flutter packages analysed and formatted, both viewers built, the personal-data
  scan, and a rebuild that reproduces the tree.

### F9: Paging and steps

- **Pioneer: PaginationItem.** MUI `PaginationItem`, bespoke in Flutter.
- **Members:**
  - PaginationNav, PaginationEllipsis (standalone) and Pagination (standalone);
  - PageNavButton, and PageNavigator (standalone);
  - Stepper Indicator, Step and Stepper, bespoke on both:
    - Stepper Indicator draws the number, or Figma's tick or error mark;
    - Step composes the indicator, the label and the line;
    - Stepper takes 2–5 `steps` from Figma's `showStep3–5` booleans, with `aria-current="step"` on
      the active one. Expect its unbound widths to follow the step count, not a token. The
      progress bar's 225px right padding is Figma presentation only (design team, 2026-09-24):
      decide it in the overlay as not reproduced, with that reason. Its gaps bound to `inset.*`
      are right, being horizontal.

**F9 done 2026-09-24.** PaginationItem (pioneer), PaginationNav, PaginationEllipsis, Pagination,
PageNavButton, PageNavigator, Stepper Indicator, Step and Stepper, every variant matching Figma on
both platforms, every finding decided (none left open). 79 components, 78 exported.

- **Owner decisions (2026-09-24):**
  - Pagination shows Figma's pages: the first, the last, the current ± 1, three at the near end
    (`1 2 3 … 12`), a one-page gap filled;
  - Stepper takes `steps` (labels) and `activeStep`, statuses following from it (`errorStep` for
    one in error);
  - completed steps are buttons where `onStepClick` is given;
  - Pagination's items keep their own 24 × 24 box as their target (4px apart, 44 × 44 targets
    would cover each other).
- **Taken here, open to the owner:** the pagination parts on ButtonBase (not MUI's
  PaginationItem, as the plan said: the assembly is drawn, its truncation Figma's); PageNavButton
  hugs its words (Figma fixes 112); the first page's previous arrow and button disabled (Figma
  draws them enabled); the line+text stepper's second step active (Figma draws none active); the
  with-label bar spans the stepper from edge to edge, its fill the active step's share; in the no
  label and line types each step's label is read, not drawn; the arrows mirror right to left.
- **Machinery:** an icon that follows one axis (`iconsOf`'s `byAxis`, `reactIcon`, `dartIcon`);
  a `set` child variant on a child with none; both checks take a standalone child in its one
  variant; `drawnFlutter`'s `pressable: true`.
- **Checks:** 1481 JS tests, both visual checks (82 on the web, 379 Flutter tests), lint, typecheck,
  format, all three Flutter packages analysed and formatted, both viewers built, the personal-data
  scan, and a rebuild that reproduces the tree. The widget tests found and fixed: Pagination and
  the with-label Stepper crashing on repeated layers (duplicate keys) past four pages or with two
  steps of one status, and a page item's semantics hiding its button and selected state.

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
- **Owner decisions (2026-09-25):**
  - a pressable card (given `onClick` or `href`) is a stretched main action: its title is the
    button or link, its hit area the whole card, its own controls above it and reachable; hover
    and focus are drawn only when it is pressable;
  - a card's More glyph is a menu the card draws (`moreItems`), a "More actions" button with a
    44 × 44 target opening the F6 Dropdown Menu, as SplitButton's items;
  - `loading` everywhere: Figma's `ghost` (Status Card, the Insight parts) is renamed, a boolean
    independent of status or severity, drawing each component's own skeleton frames, with
    `aria-busy`;
  - Interactive Card takes one `control` (none, checkbox, radio, toggle), not Figma's four
    booleans;
  - Option Card and the create variants of File Card and Image Card are built as Figma draws
    them (create tiles), the contradiction with Option Card's docs in the design review;
  - Launch Card Full Screen is built, with slots;
  - Launch Card takes its actions as a slot, drawn in the Button Group's place; `access` goes;
  - Device Card stays one component, `type` single or batch, each layout from its own layers.

**F10 done 2026-09-25.** Card (pioneer), Container, Split Dropdown, Status Card, Insight Card,
Insight Card Small, Insight Row, Expandable Card, Accordion, Event Row, Option Card, File Card,
Image Card, Action Card, Interactive Card, Device Card, Launch Card and Launch Card Full Screen,
every variant matching Figma on both platforms, every finding decided (none left open). 97
components, 96 exported.

- **Taken here, open to the owner:**
  - a card draws what Figma draws: hover and focus as Figma's look, only where the card is
    pressable, SOLAR's focus ring added; each fills its width (Figma's are samples);
  - loading and disabled Cards, and loading Insight parts, are drawn at the one status Figma draws
    them at (none, info), whatever the status;
  - a loading card stays pressable (Figma draws a loading Insight Card hovered), its action named
    by its title;
  - the status or severity is read, not only seen: the StatusIndicator (and Insight Row's colour
    bar) named by its word (`statusLabel`, `severityLabel`);
  - Expandable Card and Accordion are disclosures, their header the button; the Accordion's
    nested header drawn as Figma nests it, its chevron turned up (Figma's points down);
  - Image Card's Checkbox shows while the keyboard is on the tile as well as the pointer;
    Interactive Card's Radio is a group of its own in Flutter;
  - single-value axes dropped as samples (Event Row's density, Action Card's layout); Action
    Card's done and danger draw the primary action alone; Device Card's health is `tagStatus`;
    Launch Card's two favourites are one; Launch Card Full Screen takes up to three features;
  - Insight Row's fixed 64 hugs its words (76 at their line heights); Event Row's white focus fill
    dropped; Interactive Card's primitive icon ink rebound to color/icon/primary.
- **Machinery:** the overlay's `places` (a layer one variant adds, in its place), `choice` (layers
  the caller picks one of, or the content does; the oracle checks each), `hides` (what a child
  draws, whatever name Figma records hidden); `set` adding a resting appearance, a values-only
  `rename`; both checks measuring a detached or unbuilt child's box, and never a parent's layer
  inside a child; the card shells (`src/shells/card.mjs`); SolarLayers `clips`, an auto layout of
  placed children keeping its gap; a web glyph layer taking a `render`.
- **Checks:** 1639 JS tests, both visual checks (100 on the web, 463 Flutter tests), lint,
  typecheck, format, all three Flutter packages analysed and formatted, both viewers built, the
  personal-data scan, and a rebuild that reproduces the tree. The tests found and fixed: a loading
  Device Card, which still draws its name, named twice in Flutter and given two stretched actions on
  the web; and a disabled card, in Flutter, not announced disabled.

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
- **Owner decisions (2026-09-25):**
  - a Column Item's content decides its type, as a Tag's does: words, an Avatar beside them, or
    one of the caller's SOLAR components (Tag, icon, Text Input, Dropdown, Button, Toggle), no
    `type` prop; a PropertyRow's trailing follows its control the same way;
  - `breakpoint` (desktop, mobile) is a prop the app sets from its own layout, not a width the
    component measures;
  - a Row draws `color.surface.hover`, as its description asks, only where it is pressable (given
    `onClick`/`onPressed`), as a card draws its hover; a plain data row stays still;
  - a sortable header is semantics with no arrow: `sort` sets `aria-sort`, `onSort` makes its words
    a button; no indicator is drawn until SOLAR draws one.

**F11 done 2026-09-25.** Column Item, RowSelect and Row (the pioneer), Table, TableHeader,
TableFooter, PropertyRow and PropertyList, every variant matching Figma on both platforms, every
finding decided (none left open). 105 components, 104 exported.

- **Taken here, open to the owner:**
  - a part takes its table role only inside its parent, where it is valid (Flutter checks them):
    a Table is a table, a Row in it a row, a Column Item or RowSelect in a row a cell or a column
    header; a Row drawn alone is a box;
  - a Table tells its rows whether they draw their select and expand cells (`selectable`,
    `expandable`), both off by default; a top row's expand cell is the button (`aria-expanded`,
    "Show rows"/"Hide rows"), a flat row's expand cell drawn empty, as Figma hides its chevron;
  - a table row is dense: in Flutter a control in a cell is its own target, not padded to 44, SOLAR's
    accepted exception for dense rows (Material's `shrinkWrap`); the web's targets take no room;
  - Table's rows keep Row's own 44 (Figma's Table resizes them to 40); mobile draws Figma's fade,
    the table's full height at its right edge, and no sideways scroll, as Figma gives the columns no
    width to overflow; the fade's 38 in one mobile variant read as the others' 32;
  - TableHeader and TableFooter fill whichever layers the breakpoint draws with the caller's one
    Segmented Control, Dropdown or Pagination; the footer's action is two slots (`button` on
    desktop, `iconButton` on mobile), as Figma draws two components; the toolbar's search is
    Figma's 240 and a PropertyRow's Select its 160, sizes with no variable;
  - a PropertyList is a `<dl>`, a Divider between its rows, its rows' words a `<dt>` and their
    control a `<dd>` inside one; its `inCard` drawn as Figma draws it, as List's is (the description
    says the opposite).
- **Machinery:**
  - gradients: the fetcher records a linear gradient's handles and bound stops, the recipe reads it
    (a stop bound to `color.alpha.transparent` is the colour beside it faded out, so no primitive
    reaches the code), CSS draws `linear-gradient`, Flutter a `LinearGradient` (a recipe with one
    gains a `gradient()`, and `SolarLayerRecipe` takes it), and both checks compare one canonical
    form;
  - constraints: the fetcher records a placed layer's constraint where it is not the left and the
    top, and placement pins the layer to that edge (Table's fade, `RIGHT/TOP`; Text Area's buttons
    now pinned to the field's bottom, as Figma constrains them, one offset for both sizes);
  - `set` may add a hover Figma does not draw, as it may a focus; a placed layer that fills an axis
    spans to its parent's far edge in Flutter, as CSS's 100% does;
  - SolarLayers boxes a composed child at the fixed size its parent's recipe gives it, and lays out
    one it hugs in a row at its intrinsic width; the Flutter check compares a composed child's own
    composed children's boxes, and a case may give itself a larger `surface`;
  - `fetch-rest.mjs --expect-version` rebuilds the mirror from the cache of the version it already
    holds, and writes nothing if Figma has moved on.
- **Checks:** 1,980 JS tests, both visual checks (222 on the web, 704 Flutter tests), lint,
  typecheck, format, all three Flutter packages analysed and formatted, both viewers built, the
  personal-data scan, and a rebuild that reproduces the tree. The checks found and fixed: a
  Flutter Dropdown in a 40px cell padding its target to 44 and overflowing it; a cell in a
  Flutter row with no width to fill; a SearchField boxed by its parent at 240 laid out unbounded.

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
