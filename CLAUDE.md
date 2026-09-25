# Working in workplace-public-packages (V2 / SOLAR)

This branch (`v2-SOLAR`) holds the V2 generation of the `@bwp-web/*` packages, built on
Biamp's **SOLAR** design system. V1 lives on the `v1` branch and shares nothing with V2
except package names.

## Design system: read before touching UI, tokens or styles

The SOLAR Foundations reference is in [docs/solar/](docs/solar/README.md). SOLAR names
`CLAUDE.md` as the agent instruction layer, so treat the rules below as hard.
[docs/README.md](docs/README.md) maps the whole pipeline: inputs, scripts, outputs, and
what is not built yet (Button, Icon Button, Button Group, FAB, BackButton, SplitButton, Link,
Spinner, F1's display primitives, from StatusIndicator to Tree Indent, F3's selection controls,
from Checkbox to Segmented Control, F4's tags and messages, from Tag to EmptyState, F5's text
fields, from Text Input to FileUpload, F6's menus and lists, from Dropdown Item to List, F7's
pickers, from Select to TimePicker Dropdown, F8's navigation, from Tab Item to Tree Item, F9's
paging and steps, from PaginationItem to Stepper, F10's cards, from Card to Launch Card Full
Screen, F11's tables and properties, from Column Item to PropertyList, F12's overlays and dialogs,
from Dialog to Coachmark, F13's calendar parts, from Event Chip to Calendar Toolbar, and F14's
charts, from Sparkline to Bar Stack, with Bar Chart, Line Chart and Donut Chart drawn by MUI X
Charts and fl_chart in a chart theme generated from their IRs (`library` descriptors), are the
components so far; Cursor is left out by decision, `spec/overlay/excluded.yaml`).
CI ([.github/workflows/solar.yml](.github/workflows/solar.yml)) rebuilds every generated file
and fails if the result differs from what is committed, and scans for credentials and
unreviewed personal data. `npm run solar:sync` does the whole chain — fetch, docs, derived tokens, code — and
`npm run solar:rebuild` does the same without the fetch, which is what to run after editing a
builder. Commit the output. Builders must stay pure functions of `raw/`:
never write a build timestamp into a generated file.

`npm run solar:codegen` ([packages/codegen](packages/codegen/README.md)) turns the data under
`docs/` into code in two stages. Tokens: `spec/tokens.json`, then CSS, an MUI theme and a
Tailwind 4 stylesheet in `@bwp-web/styles`, each behind its own entry (`tokens.css`, `/mui`,
`tailwind.css`) so an app loads only its own, and Dart in `solar_flutter`. Icons: `spec/icons.json` from
`docs/solar-icons/`, then 340 React components and 685 standalone SVG files in `@bwp-web/assets`,
and `SolarVector` constants in `solar_flutter`. **It must never write to `docs/`**, which is the
Figma mirror; a write guard enforces this and CI re-checks it. When generated styling is wrong,
fix the normalizer in `packages/codegen/src/normalize/` for a systemic rule, the single
emitter in `src/emit/` for a target-specific one, or the component's descriptor in
`src/components/<name>.mjs` (its MUI and Flutter tables) for one component.
Never edit a generated file to keep a change, and never edit `docs/` to make code look right. Run the command and commit its output after
touching that package. Decisions about one component go in its hand-written overlay,
`spec/overlay/<component>.yaml`: every rule needs a `reason`, and a rule that no
longer matches the IR fails the build. Every rule kind, with a real example, is in
[spec/overlay/README.md](spec/overlay/README.md); a rule may name several layers by a pattern
(`dayGridDayCell*.base.width`) and give another rule's reason (`reason: { as: … }`) rather than
repeat it, and `npm run solar:overlay:audit` lists what the overlays decide more than once. A decision that holds for every component (an unbound `0`
inset is `inset.none`) goes in `spec/overlay/defaults.yaml` instead, once; a component's own rule
on the same cell wins. Sibling copies of one layer that Figma draws as sample content (a month's
Day Cells) are read as their first by an opt-in `repeats` rule, never automatically. A component's
shells (`packages/components/src/<Name>.tsx` and `solar_flutter`'s
`lib/src/components/solar_<name>.dart`) are files written by hand, TSX by a React engineer and Dart
by a Flutter engineer (owner decision 2026-09-25); only its story is generated. What the IR decides
still reaches them: the props types, the layer tree (`solar<Name>Tree`, `Solar<Name>Recipe.tree`)
and the slot names are generated beside the recipe and imported, and the component-parity test fails
a shell that leaves an IR prop, slot or icon unreached or copies the tree. Its look is the generated
recipe, never values in the shell. Every variant is checked on both platforms, in Light and in Dark, against
what Figma draws: `spec/verify/<name>.json` (the oracle, generated beside the IR, never from the
recipe) and the visual checks (`npm run test:visual` for React in Chromium, `flutter test` for the
widgets). A difference fails unless the oracle excuses it with an open finding or an overlay
decision; never loosen a check or edit the oracle to make one pass. To look at the components,
`npm run storybook` (React) and `npm run widgetbook` (Flutter) show every Figma variant with its
state forced, in Light and Dark, built from the same cases and oracles; they are viewers, not
checks. Which components come next, and what each needs, is `npm run solar:triage`; the active plan is [milestone 4, family by family](docs/superpowers/plans/2026-09-24-solar-library-families.md). Why a component draws what it draws, cell by cell (Figma's value, the recipe entry
and token that win, the rule and reason behind them, the excuse, what each platform drew in its
last check), is `npm run solar:explain -- "<Name>" [--variant …]`; start there when a check
fails. `--propose <layer>.<cell>` prints the overlay rule that decides a cell, ready to paste, its
reason left as `TODO(reason)`, which the build refuses until a person writes it. The tweak panel the
design spec describes (edit a value in the viewer, save an overlay rule) is **not built yet**.
On the web a slot's layer carries `Solar<Name>-<slot>`, public, and every other layer
`Solar<Name>--<layer>`, internal (`packages/codegen/src/util/classes.mjs`); a descriptor may name a
layer's class by the layer, and the codegen writes the right one. `npm run smoke:install` packs the
published packages and installs them into a clean app (CI runs it after the build). Each platform
reaches the IR its own way (docs/superpowers/specs/2026-09-25-two-libraries-one-contract.md): a
descriptor's `api` table declares where a prop or slot is not reached by its own name
(`src/shells/api.mjs`), and the parity test checks reachability, not identical spelling. The stock
MUI components the SOLAR theme styles from recipes are decided in `spec/overlay/mui-theme.yaml`.
Names follow rule 5 of that spec: SOLAR's word where SOLAR's description names the thing (`helper`,
`mandatory`, a Button's `prio`), otherwise MUI's on the web and Flutter's in Flutter (a Flutter
field's `enabled`, a button's null `onPressed`). The one exception is Figma's `style`, which is
`variant` in code because React reserves `style`.

- Start with [docs/solar/18-agent-reference.md](docs/solar/18-agent-reference.md): the
  ten foundational rules, verified token grammar, banned segments, spatial and type
  scales, z-index ladder, and the pre-submission checklist.
- Every value comes from [docs/solar/tokens/figma-variables.json](docs/solar/tokens/figma-variables.json).
  It is the token source of truth (265 primitives, 287 color, 38 spatial, 41 type
  variables; 60 text styles; 9 effect styles). Derived from it: `css-contract.json`
  (resolved CSS names and values), `reference.css`, and `grammar.json` (validation
  regexes and banned names). Regenerate with `npm run solar:tokens`; their shapes are in
  [docs/solar/tokens/README.md](docs/solar/tokens/README.md#shape-of-the-derived-files). The
  contract also carries SOLAR Web's `Layout` collection (`layout.*`, `--solar-layout-*`) from
  `docs/solar-web/tokens/layout-variables.json`. Both captures are deliberate Plugin API runs
  (`docs/solar/tokens/capture-variables.js`), never part of `solar:sync`. Text-style decoration
  and case (the underline of `link/*`) come from `docs/solar/raw/text-styles.json`, which
  `solar:sync` does read over REST, because the older captures lack them.
- SOLAR Web components, patterns and views are documented in [docs/solar-web/](docs/solar-web/README.md):
  `raw/` holds per-page JSON extracted from Figma, `catalog.json` and `token-usage.json`
  are generated from it, and the per-page markdown is generated by `build-docs.mjs`.
  Field-level schema: [docs/solar-web/schema.md](docs/solar-web/schema.md).
- The verbatim text of every Foundations Figma page is generated into
  [docs/solar/figma-pages/](docs/solar/figma-pages/INDEX.md) (with every `@SOLAR:PAGE_CONTEXT`
  block in `page-context.json`). It is raw material for checking the curated chapters, not
  the reference. `npm run solar:sync` refreshes both Figma files (needs a Figma token; never
  automated); the curated chapters and the token JSON are never rewritten by it.
- SOLAR Icons are in [docs/solar-icons/](docs/solar-icons/README.md): `svg/outline/` and
  `svg/solid/` hold the verbatim Figma exports, `catalog.json` maps Figma names to file stems
  and component names. Generated from them: `spec/icons.json` and the three icon targets
  ([packages/assets](packages/assets/README.md), the raw SVG files, `solar_flutter`).
- **An icon never carries a colour, and must never be given one.** It inherits — `currentColor`
  on the web, the widget's colour in Flutter — so tint it at the point of use with a
  `color.icon.*` token (`color: var(--solar-color-icon-primary)`), never with a `fill` on the
  icon. Size it from the `icon.xs`…`icon.2xl` ladder, never a px literal.
- **A logo always carries its own colours and is never tintable.** `LogoBiamp`, `LogoOs` and
  `SolarLogo` take no `color` or `fill`, and the types refuse one; a recoloured brand mark is a
  brand violation, not a styling choice.
- Each curated chapter carries front matter naming its Figma source pages and their content
  hashes. [docs/solar/review-status.md](docs/solar/review-status.md) (generated) says which
  chapters are behind Figma. To bring one up to date: read the changed page under
  `figma-pages/`, reconcile the chapter (variables still win), then run
  `node docs/solar/build-docs.mjs --mark-reviewed <chapter-file>`. Never edit the hashes by hand.
- Every color, spacing, radius, border, shadow, duration, easing, z-index and text
  style must trace to a SOLAR token. No hex, px, rem, ms or `box-shadow` literals in
  components.
- Docs use dot separators (`color.text.primary`), Figma uses slashes, CSS uses
  `--solar-` plus hyphens (`--solar-color-text-primary`). Never mix them in one context.
- Semantic tokens only; primitives never appear in component code. Light/Dark and
  Desktop/Mobile are handled by token reassignment, never by component logic.
- WCAG 2.1 AA is the floor: 4.5:1 text, 3:1 non-text, 44 × 44 px targets, visible
  `:focus-visible` rings, `prefers-reduced-motion` honoured.
- If a token you need does not exist, flag it as a governance gap (⚠️) and stop; never
  invent a name. Known source conflicts are in
  [docs/solar/source-discrepancies.md](docs/solar/source-discrepancies.md); the
  variables win.

## Repository conventions

- Monorepo: npm workspaces + Turbo. `npm run build`, `lint`, `typecheck`, `format` from
  the root. Each package builds ESM + CJS with tsup and emits types with tsc.
- Packages: `@bwp-web/styles` (tokens and theme, generated), `@bwp-web/assets` (the 340 SOLAR
  icons, the logos and the app icons, generated), `@bwp-web/canvas` (interactive canvas),
  `@bwp-web/components` (SOLAR components for React, on MUI; Button, Icon Button, Button Group,
  FAB, BackButton, SplitButton, Link, Spinner, the F1 display primitives, the F3 selection
  controls, the F4 tags and messages, the F5 text fields, the F6 menus and lists, the F7
  pickers, the F8 navigation, the F9 paging and steps, the F10 cards, the F11 tables and
  properties, the F12 overlays and dialogs, the F13 calendar parts and the F14 charts so far; the
  charts on `@mui/x-charts`), all at
  `2.0.0-alpha.0`; canvas is still an empty skeleton. Plus
  `@bwp-web/codegen` (private build tool) and `solar_flutter` (a Dart package, outside the npm
  workspace, formatted by `dart format` and pinned to the Flutter version in `solar.yml`).
- Node 22, pinned in `.nvmrc` and in every workflow. The packages' `engines` says `>=20`,
  which is what consumers need, not what builds the repo.
- The user handles all git operations. Do not run git write commands.
