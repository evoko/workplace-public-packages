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

### Task M2: A cell one variant has and another lacks is reported

In `src/normalize/recipe.mjs`, the comparison skips a variant when either value is `undefined`
(`expected === undefined || found === undefined`). A layer's absence is a real reason to skip,
since `present` covers it. But where the layer is in both variants and only one has the cell, the
difference is dropped. Report it as an axis finding, with `describe(undefined)` read as "no value".
Examples: Checkbox's box is an auto-layout frame in some variants only, and Tab Item's border has
per-side widths in some variants and one width in others.

- A synthetic test: two variants, one with `gap` and one without, on the same layer. It gives one
  axis finding naming both.
- The corpus: about 50 new findings in the 8 components the triage names. Button Group's are
  already decided by its `follows`; Button's, Icon Button's and Spinner's generated output is
  unchanged.
- **Also check the paired cells.** A variant with per-side widths has no `borderWidth`, and the
  base's `borderWidth: none` must not be read as that variant agreeing with it.

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
- **Tests:** Drawer's IR (title and content slots, `hasCTA`), a synthetic one-variant set, and both
  corpus guards moved to include them.

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

### Task M6: Components named alike

`COMPONENTS`, `loadComponent`, the IR's file name and the code names all key on Figma's name, and
two sets are called `Day Cell`. Let a component be addressed as `<section>/<name>`
(`calendar/Day Cell`, `inputs/Day Cell`) where the name alone is ambiguous. An ambiguous bare
name is an error that names both. The overlay's `component` line takes the same address, and a
`codeName` rule, with a reason, gives the code name (`CalendarDayCell`, `DatePickerDayCell`), from which the file names
follow. The triage resolves `composes` through the same address, so Date Picker Open composes the
date picker's Day Cell, not the calendar's.

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
