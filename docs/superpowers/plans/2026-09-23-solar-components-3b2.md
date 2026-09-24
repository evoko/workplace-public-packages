# Milestone 3b-2 — the components, on the 3b-1 machinery

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to carry this plan out task by task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate the next SOLAR components for React (MUI) and Flutter, each checked variant by
variant against what Figma draws, on the machinery 3b-1 built and proved on Button.

**Architecture:** Unchanged from 3b-1. A component set under `docs/solar-web/` becomes an IR
(`spec/components/<name>.json`), an overlay holds the decisions about it (`spec/overlay/`), two
emitters write a recipe per platform, a shell per platform is scaffolded once and hand-owned, and
the oracle (`spec/verify/<name>.json`) plus the visual checks prove each variant against Figma.
Wave A adds the machinery the components need and 3b-1 did not; waves B to F add the components,
each wave on the ones before it.

**Tech stack:** Node 22 codegen (`packages/codegen`), React 19 + MUI 9.4 (`@bwp-web/components`),
Flutter 3.47.5 (`solar_flutter`, from Task A7; 3.24.4 before), Vitest, Playwright 1.63,
Storybook 10.6.

Design: [the docs-to-code spec](../specs/2026-09-21-solar-docs-to-code-design.md). Previous plan:
[3b-1, the machinery](2026-09-23-solar-component-machinery.md), whose per-task notes explain every
mechanism named here.

---

## What measuring found, 2026-09-23

Each set run through today's pipeline (IR, then findings by kind), re-measured after the owner's
sync of SOLAR Web version `2402397614979898462`, which changed only Icon Button among these:

| Component         | Variants | IR     | Findings                              | What it needs beyond 3b-1                                          |
| ----------------- | -------- | ------ | ------------------------------------- | ------------------------------------------------------------------ |
| Icon Button       | 108      | builds | 21 axis, 8 unbound                    | icon content slot (A3); Spinner, as Button                         |
| Button Group      | 3        | builds | 15 axis, 9 unbound                    | layout only; composes Button                                       |
| Checkbox          | 12       | builds | 1 compound-state, 10 unbound          | glyph geometry (A1, A4); its own MUI state classes (A5)            |
| StatusIndicator   | 21       | builds | 22 axis, 30 unbound, 2 unknown-token  | glyph geometry (A1, A4); composed by Tag                           |
| Tag               | 45       | builds | 110 axis, 7 unbound                   | `type` follows from content (A3); composes StatusIndicator         |
| Text Input        | 12       | builds | 10 axis, 12 unbound                   | `pressed` renamed `focus` (A2); `filled` from the value; icon slots |
| Tab Item          | 10       | builds | 2 axis, 4 unbound, 1 misbound         | its own MUI state classes (A5); `selected` a prop                  |
| Tabs              | 2        | builds | 16 unbound                            | a strip of Tab Items; keyboard navigation                          |
| Card              | 12       | builds | 1 axis, 21 unbound                    | the loading skeleton; composes Tag and Icon Button                 |
| Sparkline         | 6        | builds | 3 unbound                             | the line is data; its path geometry is Figma's sample              |
| Stepper Indicator | 4        | builds | 8 unbound                             | number or tick by status                                           |
| Step              | 8        | builds | 12 axis, 7 unbound                    | composes Stepper Indicator                                         |
| Stepper           | 4        | builds | 22 axis, 31 unbound                   | 2–5 steps; four drawings by `type`                                 |
| Dialog            | 3        | builds | 13 axis, 28 unbound (since A2)        | portal, focus trap; composes Icon Button, Button Group, Stepper    |

Four machinery facts behind the table:

- **Vector glyphs have no geometry.** Checkbox's tick (10×7) and dash (10×2), StatusIndicator's
  shapes and Sparkline's line are `VECTOR` layers; the fetcher records their paint and size, not
  their path. SOLAR Icons has no tick or dash to use instead.
- **Figma's own notes rename state values.** Text Input's `pressed` "is the focused state here and
  is flagged to rename to focus"; Tab Item's `active` "means the currently-routed tab". (Icon
  Button's `active`, which "duplicates `pressed`", was removed by SOLAR in the 2026-09-23 revision:
  108 variants, and nothing for the overlay to do.)
- **Dialog's image slot is filled `[surface/muted, IMAGE]`**: an image over a placeholder colour.
  The recipe refuses two paints.
- **The emitters' state selectors and the visual checks' measurements are Button's.** MUI's
  Checkbox, InputBase and Tab mark state with other classes (`Mui-checked`, `Mui-focused`,
  `Mui-error`, `Mui-selected`), and every check measures a `<button>` or a `FilledButton`.

## Decisions taken (owner, 2026-09-23)

| Question                                 | Decision                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Tag's `type` axis                        | **Follows from content.** No `type` prop: `icon` gives icon+text (icon-only without a label), `onClose` closable, `indicator` the status dot. |
| Icon Button's `active`                   | **Dropped**, as Figma plans. SOLAR removed it in Figma the same day, so no overlay rule is needed.               |
| Sparkline's API                          | **`data: number[]`**, with the trend (up, down, flat) derived from the first and last values; an optional `trend` overrides it. |
| Dialog's wizard Stepper                  | **Generate Stepper too**, with Step and Stepper Indicator, so the wizard is complete.                           |

Taken by the plan, each open to the owner at review:

| Question                         | Taken                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Text Input's `filled`            | Follows from the value, not a prop: the shell shows the filled look when the input holds text.                             |
| Text Input on MUI                | `InputBase` inside a `FormControl`, with SOLAR's label above and helper below. Not `TextField`, whose label floats.        |
| Checkbox in Flutter              | A widget of its own on `FocusableActionDetector` and `Semantics`, painting Figma's glyph. Flutter's `Checkbox` paints its own tick and cannot take one. |
| StatusIndicator                  | Generated (wave C). A composed child is a slot unless the parent cannot look like SOLAR without it, and Tag's status dot is SOLAR's shape. |
| Counter                          | Stays a slot the caller fills, as in Button; generating it is later work.                                                 |
| Tabs' indicator                  | MUI's and Flutter's moving indicator is hidden; Tab Item's own `selected` look draws the current tab, as Figma does.       |
| Stepper, Step, Stepper Indicator | Bespoke on both platforms. MUI's Stepper draws its own connectors and icons, and would be overridden more than used.       |

## Notes for whoever executes this

- **The repository owner handles all version control.** No git write commands, at all. "Commit"
  in a step means: stop, report, and let the owner review and commit.
- **Pause after every wave** (A to F) for the owner's review.
- `docs/` is read-only to the generator. A fetcher change (Task A1) reaches the data only through
  the owner's `npm run solar:sync`.
- Run npm under Node 22: `export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$PATH`. Flutter is
  3.47.5 (3.24.4 until Task A7).
- **Every overlay rule needs a reason, and a finding is decided or left open, never hidden.** An
  axis finding is either a real interaction (`follows`), a Figma mistake the code does not copy
  (left open: the oracle excuses it and the design review lists it), or known and intended
  (`accept`). Unbound literals are `bind` (same value, governed token) or `allowLiteral` (no
  token exists: a governance gap). Record each decision in the component's Done note.
- **Never loosen a visual check or edit the oracle to pass.** A difference is fixed in the code
  or excused by a finding.
- The corpus guards (`test/recipe.test.mjs`, `test/components.test.mjs`) pin which sets derive
  and build. A task that changes that set updates the guard deliberately, in the same change.
- Checks every task ends with, all green: `npx vitest run`, `npm run lint`, `npm run typecheck`,
  `npm run format`, `npm run test:visual`, and in `packages/solar_flutter` `flutter analyze`,
  `dart format --output=none --set-exit-if-changed lib test`, `flutter test`; `npm run
  solar:rebuild` twice leaves the tree unchanged.

---

## Wave A — machinery

### Task A1: The fetcher records vector geometry

**Files:** modify `docs/solar-web/raw/fetch-rest.mjs`, `docs/solar-web/schema.md`.

- [ ] Request the file with `geometry=paths` and, for a `VECTOR`, `BOOLEAN_OPERATION`, `LINE`,
      `STAR` or `POLYGON` layer, record `geometry: [{path, windingRule}]` from `fillGeometry` (and
      `strokeGeometry` as `strokeGeometry` when the layer has strokes and no fills), in the layer's
      own coordinates. Diff it per variant like any other property.
- [ ] Prove it offline first, with the harness 3b-1 used (a copy of the fetcher whose Figma client
      serves cached REST responses): unchanged apart from the new field, every other raw file byte
      for byte.
- [ ] Document the field in `schema.md`. Stop for the owner's `npm run solar:sync`; then verify the
      Checkbox tick and dash, StatusIndicator's shapes and Sparkline's line all carry geometry.

**Done 2026-09-23.** The owner's sync (SOLAR Web `2402405917143022507`) brought 137 fill outlines
and the stroke outlines: Checkbox's tick and dash on the 8 variants that add them,
StatusIndicator's marks (differing per type), Sparkline's line and Spinner's ring as
`strokeGeometry`. Paths use Figma's own number format, scientific notation included, which
`svg_path.dart` already parses. Nothing downstream moved: the generated code is unchanged (the
specs changed only their file version), every check passes, and `catalog.json` grew 3%. The same
revision fixed Stepper's 197px step gap (now `inset/md`). Before the sync: `nodes()` in `docs/_shared/figma-rest.mjs`
takes extra query parameters and makes them part of the cache key, so a response cached without
geometry is never served for a request that asks for it; the Web fetcher asks for
`geometry=paths` and records `geometry` and `strokeGeometry` on vector-type layers (not rectangles
or ellipses), diffed per variant. Offline, against the REST responses the owner's last sync cached
(version `2402397614979898462`, which has no geometry): all 146 pages byte for byte as committed.
With `fillGeometry` planted on Checkbox's tick and dash, every variant that adds them records its
shape; planted per variant on StatusIndicator, a variant whose shape differs records it under
`changed`, and one whose shape does not records nothing. `catalog.json` carries each variant's
overrides, so it will grow with the geometry.

### Task A2: An overlay rule for state names, and image paints as content

**Files:** modify `src/normalize/overlay.mjs`, `src/normalize/components.mjs`,
`src/normalize/recipe.mjs` and their tests.

- [ ] `states` overlay section: `rename: { pressed: { to: focus, reason } }` renames a state value
      (Text Input). A rule that names a value the set does not have fails the build. (A `drop`
      rule was planned for Icon Button's `active`; SOLAR removed that state itself on 2026-09-23.)
- [ ] An `IMAGE` paint is content, not design: the recipe keeps the other paint as the background
      and records `image: true` on the layer, and the oracle does the same. Dialog's IR builds;
      the recipe corpus guard moves Dialog to "derives".
- [ ] Tests: each rule on a synthetic set and on its real component; a stale rule fails; Dialog
      builds, and its image layer's background is `color.surface.muted`.

**Done 2026-09-23.** `states: { rename: { <value>: { to, reason } } }` in the overlay, applied by
`renameStates` to the resolved variants before the recipe (and by the oracle, so both see one
state name), as `follows` is; the variants keep their Figma names, so provenance still points at
what Figma draws. It refuses a value the axis lacks and a target the axis already has. An `IMAGE`
fill is content: the layer gets an `image` composition cell and the colour beside it is its
background, in the recipe and in the oracle. Dialog now derives and builds (the recipe guard is
down to three sets, the IR guard to six); Avatar, Launch Card and List, which also carry images,
derive as before. Found on the way, and fixed: the `misbound` rule from 3b-1 Task 5 treated any
variable outside the `Color` collection as not a colour, so a primitive colour (Avatar's palette)
was misreported. It now asks whether the variable is a `color.*` token; corpus-wide exactly two
paints are misbound, Spinner's and Tab Item's, the two Figma's own checks flag, and StatusIndicator's
two are unknown variables, as the design review lists them. Generated code unchanged; 467 tests
pass; skipping the rename or painting the image fails them.

### Task A3: Slots — icons shown by a boolean, content slots, and structure that follows from content

**Files:** modify `src/normalize/components.mjs`, `src/normalize/overlay.mjs` and their tests.

- [ ] A slot shown by a boolean whose layer is an `Icon/` instance is an `icon` slot (Text Input's
      `leadingIcon`, `trailingIcon`), not `component`.
- [ ] `slots` overlay section: `content: { <layer>: { name, type, reason } }` declares a layer the
      caller fills though Figma drives it with no prop (Icon Button's icon, Card's content), so it
      becomes a slot rather than a drawn layer.
- [ ] `derive` overlay section: `<axis>: { from: { <value>: { <slot>: shown|hidden, … } }, reason }`
      removes a structural axis from the API and records which slots each value shows (Tag's
      `type`). The shells read it from the generated composition; the oracle keeps each Figma
      variant reachable through the slots, not through the axis.
- [ ] Tests: Text Input's icon slots are icons; Icon Button has an `icon` slot; Tag's API has no
      `type` and each of its five types is reachable by content.

**Done 2026-09-23**, with three rules the plan had not foreseen, all found by the corpus:

- **Figma's own slots are content slots.** A `SLOT` layer carries a `slotContentId` prop reference
  (Tabs' strip, Card's content, Dialog's image and content, and 18 more), so these need no
  overlay rule; Task A3's `content` section was not needed for them.
- **Slots are read from every variant**, the default's first, so a slot only some variants have is
  found (Dialog's image, only in `type=image`; its layer is now named `modalImage`).
- **The layers one prop drives are one slot**, the first in layer order its `layer` and the rest
  `alternates`, whether the layer moves by variant (Tree Item's chevron, Action Card's button,
  Split Dialog's `left`) or two are drawn together (Day Cell's two "more events" chips). Reading
  every variant surfaced these as name clashes; without the rule four sets would have stopped
  building.

And the planned ones: a boolean-shown `Icon/` instance is an `icon` slot and a boolean-shown text
layer a `text` slot (Text Input's icons and `*`, Card's helper); the overlay's `slots: { <layer>:
{ name, type, reason } }` declares a slot Figma records no prop for, several layers may declare one
slot (Tag's icon is `/Icon/Plus` for icon-only and `/Icon/None` for icon+text); `derive: { <axis>:
{ when: [{ value, given }], reason } }` takes an axis out of the API and records, first match
wins, which filled slots give each value, and the oracle reaches such a variant by `content` (the
slots to fill) instead of a prop. Checked on a draft Tag overlay (API `status`, `invert`; all 45
variants reachable) and Icon Button's `icon`. Not yet: the emitters do not read `derived`, so Tag
cannot be emitted until C3 teaches them to resolve the axis from content. The IR guard is unchanged
(113 of 119 build); Button's output unchanged; 475 tests pass; mutations of `derive` and of the
Figma-slot rule fail them.

### Task A4: Glyph layers in both recipes

**Files:** modify `src/normalize/recipe.mjs`, `src/emit/mui-component.mjs`,
`src/emit/flutter-component.mjs`, `src/verify/oracle.mjs` and their tests.

- [ ] A layer with `geometry` gets a `glyph` composition cell: its paths, winding rule and view box
      (its size), per variant where they differ. MUI emits it in the composition data as SVG path
      data; Flutter as `SolarVector` data parsed by `lib/src/svg_path.dart`, the parser the icons
      use (extend it with the commands Figma's geometry needs, each with a test).
- [ ] The oracle records each drawn glyph's path, so the visual checks can assert the shape drawn
      is Figma's (the path data rendered, compared as data, not pixels).
- [ ] Tests: Checkbox's tick and dash reach both recipes; a glyph Flutter's parser cannot read
      fails the build naming the layer.

**Done 2026-09-23.** A layer with geometry gets a `glyph` cell: its box (the layer's size) and
two lists of `{d, evenOdd}`, the fill's outline and the stroke's (Figma's stroke geometry is the
stroke's own outline, so both are filled when drawn, in the fill and the stroke colour). Its class
is a new one, `shape`, which follows every axis, because a drawn shape legitimately changes with
size (Spinner's ring), appearance (StatusIndicator's type) and state (Checkbox's tick appears when
checked); demoting it to `paint` makes Spinner report findings, which a test catches. Every path is
checked by the icons' validator (`checkPathData`, `M L C H V Z`) and names the layer when it
fails. SOLAR Web's 184 geometry paths use only `M L C Z`, so `svg_path.dart` needed no extension.
MUI carries the glyph in the composition data as SVG path data; Flutter as `SolarGlyph` (a new
hand-written class in `lib/src/solar_glyph.dart`, reusing `SolarVectorPath` and drawn by
`SolarVectorPainter`), one entry per distinct drawing, with `Solar<Name>Recipe.glyph(layer, props,
states)`. The oracle records each drawn glyph's path data. Spinner's ring is the first glyph to
ship (its generated files grew); Checkbox's tick and dash are ready for C1. 481 tests and the
Flutter suite pass, including a test that every generated glyph parses and paints.

### Task A5: Emitter tables per base control

**Files:** modify `src/emit/mui-component.mjs`, `src/emit/flutter-component.mjs` and their tests.

- [ ] `STATE_SELECTORS` and `OVERLAPS` become tables per component (keyed like `MUI_SLOTS`), with
      Button's unchanged, so Checkbox (`Mui-checked`, `.MuiCheckbox-indeterminate`), Text Input
      (`Mui-focused`, `Mui-error`), Tab (`Mui-selected`) and bespoke components (a `data-state`
      the shell sets) each say how their states are marked.
- [ ] A boolean prop that selects a look (checked, selected, error) is styled by its class, as
      `disabled` and `loading` are; a check fails if an IR prop state has no selector.
- [ ] Flutter: the style builder is chosen per base (`ButtonStyle` for Button and Icon Button;
      none for bespoke widgets, which read the recipe cell by cell), as Spinner already does.
- [ ] Tests: Button's generated files are byte-identical; a component with a state and no selector
      fails the build.

**Done 2026-09-23**, with one bug found and fixed. `STATE_SELECTORS` and `OVERLAPS` are keyed by
component (Button's entries as before; Spinner has none, so no states); `stateSelectors(component)`
refuses a table that orders the states the fold knows otherwise than `BOOLEAN_STATES`, and a state
the IR styles that the table lacks fails the build on both platforms. A state MUI marks with no
class of its own (Text Input's `filled`) takes one the shell sets, `&.Solar<Name>-<state>`, the
counter's convention. Flutter's precedence is `statePrecedence(component)`, the table reversed.
Flutter's state tests needed no table: `WidgetState`s are the same whatever the control, so
`stateTest` is one rule (a platform state its `WidgetState`, a prop state its prop, `disabled` also
Flutter's own, and loading-aware where there is a `loading` prop, as Button's was). The style
builder is chosen by the Flutter base (`BUILDERS`: `FilledButton` and `IconButton` take a
`ButtonStyle`); a `FLUTTER_STYLE` table for a base with no builder, or a builder with no table,
fails. **The bug:** the README said Flutter "resolves one state at a time and needs no" overlap
restating. It does not: its lookup reads each cell from the strongest state that has one, and a
mouse press is hovered and pressed at once, so a tertiary md or lg Button kept hover's underline
while pressed, and a focused primary under the pointer drew hover's background, border, label and
icon colours. The Flutter emitter now reads the style through `restateOverlaps` too, which added
21 entries to `button.dart`, exactly the ones MUI already restated. The MUI and Spinner output is
byte-identical. 489 tests and the Flutter suite pass, including two Dart tests that fail against the
old recipe.

### Task A6: The visual checks for any component

**Files:** modify `packages/components/test/visual/page.tsx`, `components.spec.mjs`,
`packages/solar_flutter/test/visual/components_visual_test.dart`; create a case module per
component under both `test/visual/cases/`.

- [ ] A registry per platform: for each component, how to render one oracle variant (props, the
      slots filled with probes) and where each oracle layer is measured. The web registry takes
      its selectors from `MUI_SLOTS`, as now; Flutter's names the widgets to read.
- [ ] States the component tracks by prop (checked, selected) are set as props; platform states
      are reached as a user reaches them (web) or forced through the states controller (Flutter).
- [ ] A component in `COMPONENTS` with no registry entry fails the check, so a new component
      cannot go unmeasured.
- [ ] Tests: Button and Spinner pass unchanged; the self-check tests still name a planted break.

**Done 2026-09-23.** A case module per component on both platforms: `packages/components/test/visual/cases/<name>.tsx`
(a `VisualCase`: the oracle, and how to render one variant, its props from the oracle and its slots
filled with probes), registered in `cases/index.ts`; `solar_flutter/test/visual/cases/<name>.dart`
(how to build the widget with a states controller, and how to measure each oracle layer),
registered in `cases/cases.dart`, with the generic loop in `harness.dart`. The web check runs for
every component in `COMPONENTS` and fails when the page renders no cases for one; the Flutter check
reads every oracle under `spec/verify/` and fails when one has no case, naming the file to add.
Both proven by unregistering Spinner. The rest is generic: platform states are reached as before
(web) or forced through the case's states controller (Flutter), prop states are the oracle's props,
where the web layers are is `MUI_SLOTS`, the focus proof is the component's `STATE_SELECTORS` focus
class where it has one, and a layer MUI draws in the root itself is hidden by its colour, not by
name. **Composed children are generic too.** A layer the oracle names as another generated component
(Button's spinner) is measured in its slot, on the web as the slot's first element and in Flutter by
the child's own case (`layersAt`), then checked layer by layer against the child's oracle in the
variant Figma picks. That replaces the hand-written spinner check, which compared the ring's size and
two stroke colours; the whole Spinner is now compared inside Button, and still agrees. The child's
excused entries are left to the child's own check. A new self-check test on each platform plants a
wrong track colour on Button's Spinner and requires `spinner.track.borderColor` to be named. Not
yet: glyphs are recorded in the oracle but not compared; Checkbox (C1) is the first component whose
shell draws Figma's glyph, and adds the comparison.

### Task A7: Review surfaces — Storybook and Widgetbook

Added 2026-09-23 at the owner's request, before wave B, so each wave's review can look at the
components rather than read reports. The design spec's §8 surfaces, as viewers; the §6 tweak panel
(edit, then save an overlay rule), `solar:explain` and `--adopt` stay later work, to be designed
against more components than Button.

**Files:** create `packages/components/.storybook/`, `packages/components/stories/`,
`packages/solar_flutter/widgetbook/`; modify `src/scaffold/index.mjs`, the visual cases (split so
a viewer can build a variant without the measuring), `.github/workflows/solar.yml`,
`packages/solar_flutter/pubspec.yaml`.

- [ ] **Storybook 10.6** for `@bwp-web/components` (React + Vite, workspace packages from source
      as the visual checks resolve them). Per component, from its visual case: a *Playground* whose
      controls are the IR's API, and *Variants*, every oracle variant labelled with Figma's name,
      its platform state forced (the pseudo-states addon for a pseudo-class, the state's class for a
      class selector, from `STATE_SELECTORS`), and the Figma values beside each. Light and Dark by
      `data-theme`, as tokens.css switches them. `npm run storybook`; CI builds it.
- [ ] Every component in `COMPONENTS` has a story file, or a test fails naming it; the scaffolder
      writes one with the shell.
- [ ] **Flutter 3.24.4 to 3.47.5** (owner decision 2026-09-23: Widgetbook 3.25 needs 3.44), the
      local SDK and the CI pin, then every check re-run and whatever the newer analyzer flags fixed.
- [ ] **Widgetbook 3.25** as an app in `packages/solar_flutter/widgetbook/` (web), from the same
      Flutter visual cases: per component a *Playground* with knobs for its props and *Variants*
      with every oracle variant, its platform state forced; Light and Dark. CI builds it.
- [ ] Not built: Figma renders beside the components (the mirror stores none), the tweak panel.

**Done 2026-09-23.** Both viewers, and one SOLAR defect they found on their first run.

- **Storybook 10.6** (`packages/components/.storybook/`, `stories/`; `npm run storybook`). Stories
  are generic (`stories/solar.tsx`): a *Playground* whose controls come from the IR's API, and
  *Variants*, every oracle variant rendered by its visual case, labelled with Figma's name, its
  state forced (the pseudo-states addon for `:hover`/`:active`, the table's class for
  `Mui-focusVisible`; pressed hovered too) and Figma's values folded under it. The codegen's data
  (`COMPONENTS`, each IR's API, `STATE_SELECTORS`) reaches the browser as a Vite module
  (`virtual:solar`) that `main.ts` serves. Storybook reads story files statically, so each
  component's is a three-line literal; the scaffolder now writes it with the shell
  (`scaffoldStory`), and a test fails for a generated component without one. Checked in the built
  and the dev server: 108 Button tiles with hover, pressed, focus and the tertiary underline forced
  as measured, and Dark switching the canvas. CI builds it and keeps the `storybook` artifact.
- **Flutter 3.24.4 to 3.47.5**, which the owner chose so Widgetbook can be current: the CI pin,
  `sdk >=3.13`, `flutter >=3.47`, `flutter_lints` 6. The new formatter's tall style reformatted
  every Dart file, the generated ones through the codegen's own `dart format`; nothing but layout
  changed, and two rebuilds are identical. The newer analyzer flagged 14 infos, all fixed
  (null-aware elements in the Button shell and its template, `flagsCollection`, the 8-bit colour
  getters in `compare.dart`), and one test compared a painter's `Color`s as doubles, now as ARGB.
  The local SDK was replaced in place (the old one moved to `~/development/flutter-3.24.4`).
- **Widgetbook 3.25** (`packages/solar_flutter/widgetbook/`, a web app; `npm run widgetbook`), the
  same two use cases per component, knobs from the values the oracle draws. A Flutter app cannot
  import another package's `test/`, so the variant builders and probes moved into a small shared
  package, `packages/solar_flutter/variants/` (`solar_flutter_variants`), a dev dependency of
  `solar_flutter` that depends on it in turn, which pub allows. Flutter bundles no asset from
  outside the app, so `scripts/widgetbook.mjs` copies `spec/verify/` into a git-ignored
  `assets/verify/` on every run. CI resolves, formats and analyses the three packages and builds the
  app (the `widgetbook` artifact).
- **Changed on the way:** the Flutter visual check presses as the web one does, hovered too
  (`statesFor`), which is the case A5 fixed and now passes in the widget check itself;
  `SpinnerProps` omits MUI's `ref?: Ref<unknown>`, which made spreading a `SpinnerProps` value into
  `<Spinner>` a type error; the web case's counter probe is centred in its slot, as a Counter is.
- **Found:** in Dark, `action/primary/icon/hover` and `icon/active` are white on a white and a
  near-white background, so a primary button's icons vanish on hover. The visual checks run in Light
  only. A scan of all 96 `action/*` colours against WCAG AA found three more, danger hover labels at
  4.07 and 4.13 : 1. All five are in the design review, §10.

491 tests, both visual checks, lint, typecheck, format, both viewer builds and the Flutter suite
(81) pass on 3.47.5.

**Pause for review.**

---

## The component tasks, waves B to F

Every component task below has the same seven steps. Each task lists only what is particular to
it.

- [ ] **1. Build and review.** Add the component to `COMPONENTS` in `src/stages/components.mjs`,
      build its IR, and decide every finding in `spec/overlay/<name>.yaml` as the notes above
      say. Unit tests for the IR: API, states, slots, layer names.
- [ ] **2. Emitter tables.** `MUI_SLOTS`, `MUI_RESETS`, the state tables (A5) and, where the base
      has one, the Flutter style builder. Unit tests for both recipes.
- [ ] **3. Templates.** A React and a Flutter template in `src/scaffold/index.mjs`, functions of
      the IR, holding no design value; scaffold tests as Button's.
- [ ] **4. Shells.** `npm run solar:scaffold <Name>` and `npm run solar:scaffold -- --flutter
      <Name>`. Shell tests: behaviour, accessibility, composition from the recipe.
- [ ] **5. Parity.** The parity suite covers the new component through `COMPONENTS`; make it pass.
- [ ] **6. Visual.** Register it in both visual checks (A6); every variant matches Figma or is
      excused by a named finding.
- [ ] **7. Docs.** The component's section in the components and Flutter READMEs, and its Done
      note here: findings decided and left open, bugs found, counts.

---

## Wave B — buttons

### Task B1: Icon Button

MUI `IconButton`; Flutter `IconButton` styled by the `ButtonStyle` builder. Axes: size (sm 28, md
36, lg 44), shape (square, round), prio (renamed `variant`, as Button), state (108 variants since
SOLAR removed `active`). Overlay: the icon is a content slot (A3); the loading Spinner as in
Button. Check its description's sizes against the drawn ones, as Button's disagree (below). The 44×44 hit
area SOLAR asks for waits on its target-size token, as Button's does (the design review's first question, on control heights). The shell
requires an accessible name (`aria-label` / `semanticLabel`), with no text fallback.

**Done 2026-09-23.** 108 variants, every one matching Figma on both platforms; 10 findings, all
decided, none open. The overlay (`spec/overlay/icon-button.yaml`): base IconButton on both, `prio`
renamed `variant`, the `Icon/None` placeholder declared the `icon` slot, radius following
`[size, shape]` (round is `radius.pill`), shadow and border width following `[size, prio, state]` as
drawn (lg flat as Button's, a focus ring on press at sm and md, primary's border only at sm at rest),
the invisible border colours at md and lg accepted, padding and gap bound to `inset.none`, the icon
bound to `icon.xs`/`sm`/`md` (a new `bind` form, `tokens`, for a value that differs by size), and the
32/40/48 heights allowed as Button's are. Shells: React types require `aria-label` or
`aria-labelledby` (a union type, plus a development warning); Flutter requires `semanticLabel`.
Machinery found and fixed on the way, every one silent before:

- **A partial `follows` key.** A cell following some of the appearance axes (radius by shape, not
  prio) was keyed `shape=round`, which neither emitter's lookup builds, so round would have lost its
  radius. Now written under every full key; the MUI emitter refuses a partial key.
- **A hidden child's variant.** Figma records no variant on a hidden instance, so the loading
  Spinner's size was dropped. Now read from the first variant that draws the child.
- **A weight with no stroke is no border.** Figma keeps a stroke's weight and binding after its paint
  is removed; the recipe read that as a 1px border, the oracle (rightly) as none.
- **Base-equal entries the lookup would miss.** An entry equal to the base was left out even where
  the lookup finds another entry first (lg's borderless rest before the base's 1px), so disabled lg
  secondary lost its border on both platforms. Now written wherever the lookup would differ.
- **MUI's own state styles.** IconButton marks loading disabled and clears the background in its
  disabled rule; `MUI_STATE_RESTATES` restates the recipe's resting value there.
- **The ButtonStyle builder** emits only the properties a component's table names (no text style
  here), and refuses a missing required one.
- **Screen readers, Button too.** `Semantics(label:)` around a Flutter button makes a second node,
  leaving the button unnamed; both shells and templates now use `MergeSemantics`, proven by a test
  that fails on the old wrapper. The Icon Button spinner is excluded from semantics, as Button's is.
- **Checks:** an excused entry on a borderless layer was skipped before it counted as reached; the
  web gap and failure reports are named by slug; the parity suite reads shells by the scaffolder's
  file names.

Button's and Spinner's generated output is unchanged. For the designers (review, section 8): the
disabled tertiary and lg secondary borders, the unbound padding and icon sizes, primary's border
against Button's, the ring on press, and lg's flat look. 512 JS tests, 89 Flutter tests, both
visual checks and both viewers pass.

### Task B2: Button Group

Bespoke on both: a flex row or column of the caller's Buttons. Axes: orientation (horizontal,
vertical), type (regular, full-width, renamed `fullWidth: boolean`; Figma built three of the four
combinations, so vertical full-width is a `sparse` finding). The recipe gives the gap and the
full-width stretch. Figma requires children to share prio and size; in development the shell warns
when they do not, and it never rewrites a child's props.

**Done 2026-09-23.** 3 variants, every one matching Figma on both platforms; 14 findings, 13 decided
and one open by design: the full-width divider's sides are `unrecorded` until the owner's next sync.
The overlay (`spec/overlay/button-group.yaml`): bespoke on both; `type` renamed `fullWidth`, a
boolean (a new `rename` form, `values`); the layout (direction, alignment, gap, padding, each
border side) following `[orientation, type]`; the full-width padding bound to `inset.none`; the
three Figma Buttons styled together as the caller's children (`& > *`), their hidden examples' fixed
widths `set` to fill (a new `set` form, `keyword`) and their heights left to the Button. The plan
changed in two places, both on Figma's evidence: regular's buttons fill too (Figma draws them so,
though its description says they size to content), and the development warning checks size only
(Figma's own groups mix priorities, though its description forbids it); both are in the design
review, section 8. The types refuse the vertical full-width group Figma does not draw
(`ButtonGroupLayout`), and so does a Flutter assert.

Machinery on the way:

- **Per-side borders.** The fetcher recorded only `mixed` where a stroke's sides differ (89 layers
  in SOLAR Web), so the divider could not be drawn. It now records `strokeWeights` (effective at the
  owner's next `npm run solar:sync`); the recipe gives such a layer a cell per side, the oracle a
  width per side, MUI `border{Side}Width`/`Style`, and both checks measure each side. Until the
  sync, a side is drawn where Figma binds it (the top, to `border.default`), marked `inferred`, and
  reported `unrecorded`, which the oracle excuses. Weekday Header, which failed on one side bound
  to two variables, now derives and builds; both corpus guards moved with it.
- **Composed children in any number.** A case marks where a layer is (`data-layer` on the web, a
  keyed subtree in Flutter) when several layers share a selector; a child's box is compared with
  the parent's entry, not the child's own (a Button fills a group, whatever its width alone);
  Button's Flutter measuring is scoped (`layersAt`); builders take the whole oracle; excused entries
  on layers the variant does not draw are not expected.
- **Smaller fixes.** Case ids are `slug:index` (`button-` also matched `button-group-`); an oracle
  keeps one excuse per property; `set` settles a raw-value finding once no raw value is left, and
  the oracle excuses Figma's value there; a recipe with no size axis writes `const size`; the
  Storybook Playground and the Widgetbook tiles start from the resting variant and scale a wide
  widget down.

Button's, Icon Button's and Spinner's generated output is unchanged. For the designers (review,
section 8): the unbound full-width padding, the hidden buttons' leftover widths, and the two
description-versus-drawing questions.

**After the owner's sync, 2026-09-24** (SOLAR Web `2402412754718078809`; Foundations and Icons at the
same versions). The fetcher's `strokeWeights` arrived on 33 files and changed nothing else: every
other difference in the raw data is that one field, and the new SOLAR Web version brought no
content change in anything the pipeline reads. The divider is `[1, 0, 0, 0]`, exactly what the
recipe had inferred from the top's binding, so the generated code is unchanged; the `unrecorded`
finding is gone (Button Group: 13 findings, all decided) and both checks now compare each side of
the divider with Figma's weight. The corpus guards hold (117 derive, 114 build). A synthetic test
keeps the fallback for data without weights covered.

**Pause for review.**

> **Waves C to F are superseded (owner, 2026-09-24)** by
> [Milestone 4, the library family by family](2026-09-24-solar-library-families.md), which builds
> every component in SOLAR Web's components section. Their components and decisions are carried
> into its families: Checkbox is F3's pioneer, StatusIndicator F1's, Tag F4's, Text Input F5's, Tab
> Item and Tabs F8's, Card F10's, the Stepper parts are in F9, Dialog is F12's pioneer and Sparkline
> F14's. The task text below is kept as the record of what was planned.

## Wave C — glyphs and labels

### Task C1: Checkbox

MUI `Checkbox` with `icon`, `checkedIcon` and `indeterminateIcon` drawn from the recipe (the box
and Figma's tick or dash, from A4); Flutter bespoke (see the decisions). API: `checked`, `mixed`,
`disabled` (3b-1 Task 4), plus `onChange`. The compound variant (disabled + hover) stays the finding
3b-1 recorded. Focus draws `shadow.focus.default` with the `border.feedback.focus.strong` stroke.
There is no pressed state. The 16px box's hit area follows the same target-size decision as B1.

### Task C2: StatusIndicator

Bespoke glyph component on both: type (success, info, warning, danger, neutral, help, private) ×
size (md, sm, xs), each type a distinct Figma shape (A4). Its two misbound colours are decided in
its overlay like Spinner's. Decorative by default (`aria-hidden`); a `label` makes it announced.

### Task C3: Tag

MUI `Chip`; Flutter `Chip` (`InputChip` when closable). API from the decisions: `status`, `invert`,
`indicator`, `icon`, `onClose`, and the label as its child; Figma's `type` follows from those
(A3). 110 axis findings: most are expected to disappear once `type` stops being an axis the paint
is read across; review the rest.

**Pause for review.**

## Wave D — text entry and navigation

### Task D1: Text Input

MUI `InputBase` in a `FormControl`, with a SOLAR label above and helper below; Flutter `TextField`
with the label and helper laid out by the shell, not `InputDecoration`'s floating label. Overlay:
`pressed` renamed `focus` (A2); `filled` follows from the value (decision); `error` a prop that
switches the helper to the error look. Slots: label, mandatory marker, leading and trailing icons,
helper. The field's text style is its `fieldLabel` layer.

### Task D2: Tab Item and Tabs

MUI `Tabs` and `Tab`; Flutter `TabBar` and `Tab`, with the moving indicator hidden (decision).
Tab Item: size (sm, md), `selected` and `disabled` props, hover and focus states; its misbound
colour decided in its overlay. Tabs: the strip, a `value` and `onChange`, arrow-key navigation
(`role="tablist"`), 2–7 items. The eight Figma instances are the strip's example content, not
eight layers to style: the overlay makes the strip a content slot (A3).

**Pause for review.**

## Wave E — surfaces and data

### Task E1: Card

MUI `Card`; Flutter bespoke on `Material`. API: `status` (none, danger, warning, success, info),
`disabled`, `loading`, and slots for icon, title, helper, the more menu (an Icon Button), content,
and tag (a Tag). `loading` replaces the content with the skeleton frames Figma draws (the
`skeleton*` layers), with `aria-busy`. Hover is a platform state; the card is interactive only when
given `onClick`.

### Task E2: Sparkline

An SVG `path` on the web and a `CustomPainter` in Flutter. API: `data: number[]` and an optional
`trend` (decision); size (sm 80×24, md 120×32). The recipe supplies the stroke colour per trend, the
stroke width and the box; the path comes from the data, scaled into the box. The oracle's geometry
(A1) is Figma's sample line, so the visual check draws that sample and compares stroke, colour and
box, and a unit test checks the scaling. Decorative unless given a `label`.

**Pause for review.**

## Wave F — the wizard

### Task F1: Stepper Indicator

Bespoke on both: status (completed, active, upcoming, error); the number for active and upcoming,
Figma's tick glyph (A4) for completed, its error mark for error.

### Task F2: Step

Bespoke on both: status × type (round, horizontal), composing Stepper Indicator, with the label
and the connecting line.

### Task F3: Stepper

Bespoke on both: `type` (line, with label, no label, line+text), 2–5 steps (Figma's `showStep3–5`
booleans become the length of a `steps` array), and the active step. `aria-current="step"`
marks the active one. 22 axis and 32 unbound findings: expect most of the unbound ones to be the
progress bar's literal widths, which follow from the step count, not a token.

### Task F4: Dialog

MUI `Dialog` (portal, focus trap, Esc, focus returning to the trigger); Flutter `Dialog` and a
`showSolarDialog` helper. `type`: default, image (the image slot, from A2), wizard (a Stepper in the
header). Slots: title, content, the close Icon Button, and the footer Button Group. `role="dialog"`,
`aria-modal`, labelled by its title.

**Pause for review.**

---

## Done when

- All fourteen components are generated for React and Flutter, with shells, and each is in
  `COMPONENTS`, the parity suite and both visual checks.
- Every variant of each matches Figma on both platforms, or differs only where the overlay or an
  open finding says so, and CI enforces it.
- The IR corpus guard includes Dialog; the recipe corpus guard moves only as each task says.
- Every finding is decided or open, and the open ones are in the design review.
