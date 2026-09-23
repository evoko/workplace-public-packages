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
Flutter 3.24.4 (`solar_flutter`), Vitest, Playwright 1.63.

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
| StatusIndicator   | 21       | builds | 22 axis, 30 unbound, 2 misbound       | glyph geometry (A1, A4); composed by Tag                           |
| Tag               | 45       | builds | 110 axis, 7 unbound                   | `type` follows from content (A3); composes StatusIndicator         |
| Text Input        | 12       | builds | 10 axis, 12 unbound                   | `pressed` renamed `focus` (A2); `filled` from the value; icon slots |
| Tab Item          | 10       | builds | 2 axis, 4 unbound, 1 misbound         | its own MUI state classes (A5); `selected` a prop                  |
| Tabs              | 2        | builds | 16 unbound                            | a strip of Tab Items; keyboard navigation                          |
| Card              | 12       | builds | 1 axis, 21 unbound                    | the loading skeleton; composes Tag and Icon Button                 |
| Sparkline         | 6        | builds | 3 unbound                             | the line is data; its path geometry is Figma's sample              |
| Stepper Indicator | 4        | builds | 8 unbound                             | number or tick by status                                           |
| Step              | 8        | builds | 12 axis, 7 unbound                    | composes Stepper Indicator                                         |
| Stepper           | 4        | builds | 22 axis, 32 unbound                   | 2–5 steps; four drawings by `type`                                 |
| Dialog            | 3        | fails  | —                                     | an image fill beside a colour (A2); portal, focus trap; composes Icon Button, Button Group, Stepper |

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
  3.24.4.
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

### Task B2: Button Group

Bespoke on both: a flex row or column of the caller's Buttons. Axes: orientation (horizontal,
vertical), type (regular, full-width, renamed `fullWidth: boolean`; Figma built three of the four
combinations, so vertical full-width is a `sparse` finding). The recipe gives the gap and the
full-width stretch. Figma requires children to share prio and size; in development the shell warns
when they do not, and it never rewrites a child's props.

**Pause for review.**

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
