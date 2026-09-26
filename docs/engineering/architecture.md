# Architecture

How the repository turns Biamp's SOLAR Figma files into a React library and a Flutter library,
and why it is built this way. Read this before changing the generator, an overlay, a shell or a
check. The mechanism in detail is in [the codegen README](../../packages/codegen/README.md); the
decisions and their reasons are in [decisions.md](decisions.md); how to do a task is in
[workflows.md](workflows.md).

## What it produces

Three Figma files are the source: **SOLAR Foundations** (variables, text and effect styles, and
the guideline pages), **SOLAR Web** (the components) and **SOLAR Icons**. From them the repository
generates:

| Target          | Tokens | Icons | Components                              |
| --------------- | ------ | ----- | --------------------------------------- |
| React, on MUI 9 | yes    | yes   | yes (`@bwp-web/components`)             |
| Flutter         | yes    | yes   | yes (`solar_flutter`)                   |
| CSS             | yes    | yes   | no (`@bwp-web/styles/tokens.css`, SVGs) |
| Tailwind 4      | yes    | no    | no (`@bwp-web/styles/tailwind.css`)     |

Components exist for MUI and Flutter only: a third implementation would be more surface to keep
faithful for little gain.

The goal is that **each library matches Figma, visually and functionally, on its own**. Matching
each other is not a goal: each library is native to its platform and faithful to Figma.

## The pipeline

```
Figma files
  │  npm run solar:sync (REST; needs a Figma token; deliberate, never in CI)
  ▼
docs/                      the mirror of Figma: raw JSON, generated docs, the token capture
  │  npm run solar:codegen (no network; the only reader of docs/ is the normalizer)
  ▼
normalize ◄── spec/overlay/*.yaml      the hand-written decisions, each with a reason
  ▼
spec/tokens.json   spec/icons.json   spec/components/<name>.json   spec/verify/<name>.json
  │                                   (the contracts)               (the oracle)
  ▼
independent emitters → CSS · MUI theme · Tailwind · Dart tokens
                     → React icons · SVG files · Dart vectors
                     → MUI recipe · Flutter recipe (+ the layer tree and slot names)
                     → Storybook stories, registries, barrels
  ▼
hand-written shells: packages/components/src/<Name>.tsx, solar_flutter/lib/src/components/solar_<name>.dart
  ▼
checks: parity suites (targets agree with the spec), visual checks (each platform against the oracle)
```

`docs/` has two kinds of content: what is fetched or generated from Figma (never hand-edited) and
a few hand-written guides (this folder, the curated Foundations chapters, the READMEs).
[docs/README.md](../README.md) maps every input and output.

## Invariants

These hold everywhere. The rest of the design follows from them.

1. **`docs/` is read-only to the generator.** It mirrors Figma, defects included. Only the
   fetchers and doc builders in `docs/` (run by `solar:sync`, `solar:rebuild` and their parts) and
   `solar:tokens` write there. Every generator write goes through
   `writeGenerated` (`packages/codegen/src/util/write.mjs`), which refuses a path under `docs/`,
   and CI checks `docs/` is unchanged after `solar:codegen`.
2. **A code problem never changes the mirror.** If the fix belongs in Figma, the generator
   records a deviation or a finding, and the design review asks the designers.
3. **Generated files are never hand-edited to keep a change.** They carry a header saying so,
   and CI regenerates everything and fails on any difference.
4. **Emitters read only the spec**, never `docs/`. That keeps the targets in step.
5. **No raw literal without a recorded reason.** Every style value is a token, or an exception an
   overlay allows and `spec/deviations.md` reports.
6. **Builds are pure functions of what is committed.** Running any builder twice gives no diff;
   generated files record the source's fetch date and Figma file version (`sourceFetchedOn`,
   `fileVersion`), never the build date.
7. **Nothing is written until everything is built.** Every stage builds before any emits, and
   outputs are held (`deferWrites`, `commitGenerated`) until every stage has emitted, so a stage
   that throws rewrites nothing. Output the run did not write is pruned.

## Tokens and icons

`docs/solar/tokens/figma-variables.json` is the token source of truth, a deliberate Plugin API
capture (the REST variables endpoint needs an Enterprise scope). `solar:tokens` derives
`css-contract.json`, `reference.css` and `grammar.json` from it; `solar:codegen` turns the
contract into `spec/tokens.json` (DTCG) and four independent emitters. Each emitter returns a
manifest of what it wrote, and the parity suite checks all four against each other **and** the
spec, in every mode, then re-reads the real files. Modes: Light/Dark for colour, Desktop/Mobile
for type; Mobile type switches below `viewport.sm` on both platforms.

Icons become `spec/icons.json`, geometry only. **An icon never carries a colour**: it inherits
(`currentColor`, the widget's colour) and is tinted with a `color.icon.*` token where it is used.
**A logo always carries its own colours** and its types refuse a tint. The icon parity suite
extracts the geometry back out of the TSX, SVG and Dart and compares it with the spec.

## Components

### The IR

A SOLAR Web component set becomes `spec/components/<name>.json`: its public API (axes as props),
its states, its slots, its layers by name, its **recipe** in token names, and its provenance (the
Figma node). Four steps build it (details in the codegen README):

1. **Resolve** each variant into a map of layer path to properties, each value beside the
   variable it binds.
2. **Derive the recipe** by SOLAR's model: **geometry follows size, paint follows appearance and
   state.** Each cell is read from the variant that holds every other axis at its default. Every
   variant that disagrees is recorded as a **finding** naming the variants, never averaged away:
   it is either a Figma slip or a real interaction between axes, and only a person can say which.
3. **Build the API.** Figma's `state` axis is demoted: hover, pressed and focus become **platform
   states** (never props); disabled, loading and SOLAR's own states (`today`, `edit`…) stay props.
4. **Apply the overlay**, then the shared defaults.

### Overlays: where judgement lives

`spec/overlay/<address>.yaml` holds every design-to-code decision about one component: the stock
control to wrap, renames, a cell that follows more axes than the model says, a raw value bound to
the token of the same value, an allowed literal (a governance gap), an accepted finding. Three
rules make it trustworthy: **every rule has a reason**; **a rule that no longer matches the IR
fails the build**, so a Figma change cannot leave a stale decision behind; and **order does not
matter**. `spec/overlay/defaults.yaml` holds the two decisions that hold for every component (an
unbound zero padding or gap is `inset.none` or `stack.none`); `excluded.yaml` names components
left out (Cursor); `mui-theme.yaml` names the stock MUI components styled from recipes. Every
rule kind is in [spec/overlay/README.md](../../spec/overlay/README.md).

A finding is decided or left open, never hidden. An open finding is a Figma defect the code does
not copy: the oracle excuses it and [the design review](../solar-review-for-design.md) asks the
designers. `spec/deviations.md` reports every place code and Figma differ, for SOLAR governance.

### Recipes, shells and the rendering model

Two emitters turn the IR into a **recipe** per platform: style data for MUI's `sx` keyed by
classes (`packages/styles/src/generated/mui/components/<name>.ts`), and Dart token names with a
state resolver (`packages/solar_flutter/lib/src/generated/components/<name>.dart`). Beside each
recipe the generator writes the IR's props types, **layer tree** (`solar<Name>Tree`,
`Solar<Name>Recipe.tree`) and **slot names** (`solar<Name>Slots`).

The **shell** is the component itself: props, slots, behaviour, accessibility. It is a file
written by hand, TSX by a React engineer and Dart by a Flutter engineer, that imports the
generated tree, slots and recipe and holds no design value. Only its story is generated. A design
change reaches it through the recipe; a prop, slot or icon Figma adds fails the component-parity
test until the shell reaches it.

Most SOLAR components have no native equivalent, so the system is a **layer-tree renderer** that
borrows platform behaviour where it helps. A drawn component (`slots: 'drawn'` in its
descriptor, most of them) hands its generated tree to a shared runtime, `internal/layers.tsx`
(`drawChildren`) on the web and `SolarLayers` in Flutter, which draws Figma's layers from the
recipe. The rest wrap a stock control for its behaviour: MUI's `ButtonBase`, `InputBase`, `Tab`,
`MenuItem`, `Select`, `Slider`, `Switch` and others; Flutter's `FilledButton`, `TextField`,
`RawRadio`. The overlay's `base` records which, and why.

States resolve the same way on both platforms. Each component's state table
(`STATE_SELECTORS`) orders its states from weakest to strongest (Button: hover, pressed, focus,
loading, disabled); CSS applies them by the cascade, the later rule winning, and Flutter reads each
cell from the strongest state that has one (`statePrecedence`, the same list reversed), and `restateOverlaps` restates in each
later state what an earlier overlapping one sets (a pressed button is hovered too).

Five chart components (Bar Chart, Line Chart, Donut Chart, Chart Axis, Chart Gridlines) are
**library components**: they build an IR and an oracle but no recipe or shell. MUI X Charts and
`fl_chart` draw them in a chart theme generated from their IRs (`solarChartTheme`,
`SolarChartTheme`), and hand-written wrappers (`BarChart`, `SolarBarChart`…) put SOLAR's Chart
Tooltip and Data Legend around them.

### Two libraries, one contract

What the two platforms share, and what they do not, is decided at three levels.

1. **The contract: shared.** One IR per component: axes, states, slots, layer tree, recipe. One
   overlay changes both libraries; one oracle, one deviations report, one `solar:explain`. The
   parity suite asserts that every IR recipe entry is in both recipes with the same token or
   allowed literal, that both style every state in the same order, and that neither holds a
   colour literal.
2. **The rendering model: shared as a model.** Both platforms draw Figma's layer tree through
   their own runtime. It is a model each implements in its own language, not a convention one
   imposes on the other.
3. **API, behaviour and theming: platform-native.** The platforms share concepts, never
   spellings. Every IR axis, boolean, state and slot must be **reachable** on each platform; how
   is that platform's business. Each descriptor's `api` table (`{ react: {…}, flutter: {…} }`,
   resolved by `packages/codegen/src/shells/api.mjs`) declares where a platform reaches an IR name
   by another member (`disabled: { not: 'enabled' }`, `value: 'controller'`,
   `checked: { group: 'RadioGroup' }`), and the parity suite proves reachability through it.

The rules for anyone writing or reviewing a component:

1. **Ask Figma, not the other platform.** A visual or functional question is answered by the
   oracle and the platform's own check. "Does it match Flutter?" is never a reason to change the
   web, or the reverse.
2. **Share the IR; declare the mapping.** A concept one platform cannot reach is a bug; a
   different spelling is not.
3. **Behaviour follows the platform.** In Flutter a pressable is disabled by a null `onPressed`,
   a field's value lives in a controller, a group decides its members. On the web a control is
   disabled by `disabled`, a field's value is `value` or `defaultValue`. Do not add a prop to one
   platform because the other has it.
4. **Theming follows the platform.** The recipe is the source of every value. On the web a SOLAR
   component reads its props through the MUI theme (`useSolarProps`:
   `components.Solar<Name>.defaultProps` and `styleOverrides.root`), and stock MUI components
   under the SOLAR theme take recipes where `mui-theme.yaml` says so. In Flutter a component
   theme is a `ThemeExtension` merged over the recipe (`SolarButtonThemeData` and the other
   button themes).
5. **Names.** SOLAR's word where SOLAR's description names the thing (`helper`, `mandatory`,
   `prio`, `iconLeading`); otherwise MUI's word on the web and Flutter's in Flutter (a Flutter
   field's `enabled`). The one exception: Figma's `style` is `variant` in code on both platforms,
   since React reserves `style`. The IR keeps one name: a platform's own spelling of it goes in
   the descriptor's `api` table (above), never in an overlay `rename`, which changes the name on
   both platforms. The web's class names are in
   [Class names on the web](#class-names-on-the-web).
6. **Accessibility is per platform and non-negotiable on both.** Every control has a 44 × 44
   target (`size.target.min`): on the web one that takes no room; in Flutter, as Material's, one
   that a control on its own takes where the theme pads tap targets (`SolarTarget`). Where
   targets would overlap, a control's own box is its target
   ([the list](../../packages/components/README.md#what-every-component-shares)). Every control
   has an accessible name, a role and its states, each through its platform's own mechanism,
   checked by that platform's tests.

A Flutter widget keeps Figma's size on every axis Figma does not fill, even in a stretching
parent, and sits at the start of any extra room (`SolarOwnSize`).

### Class names on the web

A slot's layer carries `Solar<Name>-<slot>` (public, stable across syncs); every other layer
`Solar<Name>--<layer>` (internal, named after Figma's layer, not a contract). State classes a
shell sets are `Solar<Name>-<state>`. The table is `packages/codegen/src/util/classes.mjs`, shared
by the recipes and the visual check.

## How correctness is proved

Agreement between targets is not correctness, so there are two kinds of check.

- **Parity suites** (`packages/codegen/test/`): tokens across four targets, icons across three,
  component recipes and APIs across two, each against the spec as the oracle.
- **The oracle and the visual checks.** `spec/verify/<name>.json` is what Figma draws for every
  variant, in Light and in Dark, built from the resolved Figma layers **independently of the
  recipe** (a test scrambles the recipe and proves the oracle does not move). The web check
  (`npm run test:visual`, Playwright in Chromium) and the Flutter check (widget tests under
  `flutter test`) render every variant as the real component, reach each state the way a user
  does (pointer over, pointer down, keyboard focus), read back what is drawn and fail on any
  difference the oracle does not excuse. An excused difference, an open finding or an overlay
  decision, goes to a gap report instead. Each check has self-tests that inject a wrong colour and
  require a failure naming it.

`npm run solar:explain -- "<Name>" --variant …` answers "why does this cell draw this?" for both
platforms at once: Figma's value, the recipe entry that wins and where it sits, its token, the
rules and reasons on it, the excuse, and what each platform drew in its last check. A test proves
its lookup resolves to Figma's value in every unexcused cell.

Storybook (`npm run storybook`) and Widgetbook (`npm run widgetbook`) show every Figma variant
with its state forced, in Light and Dark, built from the visual checks' own cases and oracles, and
badge each variant with its excused differences. They are viewers, not checks.

## CI and deployment

The Storybook is deployed by Vercel from `packages/storybook`
([workflows.md, Deploy](workflows.md#deploy)); nothing in CI deploys.

`.github/workflows/solar.yml` runs on every pull request and on pushes to `main` and the
`v<number>` branches, and needs no Figma token: all of its jobs work from data that is committed
here. It pins Flutter (`FLUTTER_VERSION`), because `dart format` output changes between versions
and the codegen job diffs the formatted Dart; to upgrade it, see
[workflows.md, Set up a machine](workflows.md#set-up-a-machine).

| Job                                        | Checks                                                                                                                                                                | Fixing a failure                                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Generated docs and tokens are up to date   | `solar:docs` and `solar:tokens` reproduce the tree; Prettier on docs, scripts, YAML                                                                                   | Run those two commands locally, and Prettier on a formatting failure; the owner commits the result                              |
| No unreviewed personal data or credentials | `scripts/check-personal-data.mjs`: credentials, e-mail addresses and phone numbers in every tracked and untracked file, against `scripts/personal-data-baseline.json` | Redact in the extractor, or accept the finding with a written reason ([how](../README.md#personal-data-in-a-public-repository)) |
| Generated code is up to date               | `solar:codegen` writes nothing to `docs/` and reproduces the tree; `npx vitest run`                                                                                   | Run `npm run solar:codegen` locally; the owner commits the result                                                               |
| Dart package analyzes and tests            | `dart format`, `flutter analyze` (three packages), `flutter test` with the Flutter visual checks; keeps the reports; builds Widgetbook                                | Run the same three in `packages/solar_flutter`; the reports are in `packages/solar_flutter/build/visual/`                       |
| Web components draw what Figma draws       | `npm run test:visual`; keeps the gap reports; builds Storybook                                                                                                        | Run `npm run test:visual` locally; the reports are in `packages/components/test/visual/.out/`                                   |

`.github/workflows/main.yml` runs lint, typecheck, format, build, `smoke:install` (the packed
packages installed into a clean React 18 app and rendered on the server) and the tests.

## Out of scope, by design

- **`@bwp-web/canvas`**: an empty skeleton; it needs the SOLAR Spatial library, not extracted.
- **Patterns and views** in SOLAR Web: fetched and documented, not generated.
- **Behaviour Figma cannot describe**: keyboard navigation, focus management, controlled state
  and date arithmetic are engineered per platform in the shells.
- **Component motion**: the fetchers extract none; only the Foundations motion tokens exist.
- **Components in CSS or Tailwind.**

## What must not change

These are what make the pipeline trustworthy; everything else may be made cheaper around them.

- The finding model: geometry follows size, paint follows appearance and state, every
  disagreeing variant recorded, never averaged.
- The oracle's independence from the recipe, and the test that proves it.
- A reason on every overlay rule, and a stale rule failing the build.
- `docs/` read-only to the generator, the write guard, and CI's rebuild determinism.
- `solar:explain`, and its test that the lookup resolves to Figma's value in every unexcused cell.
- Visual checks that reach states the way a user does, on both platforms, in both modes, against
  Figma, never loosened to pass.
- Sharing the IR and the rendering model between the platforms, not API spellings or mechanisms.
