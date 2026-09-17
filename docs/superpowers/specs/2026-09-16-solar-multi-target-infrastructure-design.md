# Multi-target design system infrastructure

Date: 2026-09-16
Status: approved design, awaiting implementation plans
Branch: `v2-css`

## 1. Purpose

Build the infrastructure that lets a hand-written CSS design system (today
SOLAR, later possibly another) be translated, deterministically and by script, into equivalent design systems for
Tailwind CSS, MUI, and Flutter, and that verifies the translations stay in
parity with the CSS.

The CSS is the single source of truth. Every other target adheres to it.
Translation is algorithmic, never agentic, so results are reproducible. When a
translation is wrong or incomplete, an agent or a person fixes the algorithm,
not the output.

This spec covers the infrastructure only. Authoring the real SOLAR tokens and
components is a separate, later effort that uses this infrastructure.

The infrastructure is design-system agnostic. Nothing in the compiler, the
target plugins, the verifier, the Storybook harness, or the documentation is
named after or hard-codes SOLAR. The design system's name, CSS prefix, and modes
are data in one config file. Replacing SOLAR with another design system means
replacing the CSS source content and the config, not the infrastructure.

## 2. Scope

In scope:

- The CSS source format, its authoring rules, and a sidecar manifest format.
- A compiler that parses CSS plus manifests into a neutral intermediate
  representation (IR).
- Target plugins that generate a Tailwind theme layer, a MUI theme layer, and a
  Flutter theme layer from the IR.
- A defaults catalog mechanism for opinionated frameworks (MUI, Flutter).
- A verification suite proving parity between targets.
- A Storybook that shows every token and component side by side across
  targets, structured so the future components, canvas, and assets packages
  fit into the same Storybook.
- Packaging one publishable package per target.
- Documentation for humans and a dedicated context file for agents.
- Guardrails for agents that author the CSS source from a design file such as
  Figma: a scaffold command, a mandatory lint loop, and a step-by-step
  procedure. Authoring the CSS may be agentic; everything downstream of the CSS
  stays algorithmic.

Out of scope for this spec:

- Figma API integration or a deterministic Figma variables importer. The agent
  reads the design file with whatever tools it has and writes CSS under the
  guardrails in section 12.

- The design content itself (the real SOLAR tokens and components).
- The `components`, `canvas`, and `assets` packages. They stay as they are.
  The Storybook design leaves room for them.
- Generating component implementations. Targets emit theme and style layers
  only; consumers use the framework's own components.
- Tailwind v3 output. Tailwind v4 (CSS-first) is the only Tailwind target.

## 3. Current state

The repo is an npm workspaces monorepo driven by Turbo. Packages `styles`,
`components`, `canvas`, and `assets` have been emptied deliberately (commit
`ed8ecd4`). Their `src/index.ts` files reference a strip-monorepo design doc
that no longer exists on this branch. The Storybook package has its config but
no stories. The V1 system on `main` was a single MUI theme of 2,244 lines with
hand-written stories.

## 4. Decisions

These were settled during design and are not revisited below.

| Topic | Decision |
| --- | --- |
| Source of truth | Hand-written CSS: tokens as custom properties plus component rules, under strict authoring rules enforced by the compiler. |
| Component vocabulary | The design system's own. Targets create variants the framework lacks and disable framework variants the design system does not use. |
| Naming | Infrastructure is named generically (`ds`, `bwp`), never after the current design system. The design system's name lives in `ds.config.json` and is used for display only. |
| Non-visual metadata | A sidecar JSON manifest per component, next to its CSS. |
| Target output shape | Theme and style layer only. No wrapper or standalone components. |
| Framework defaults | Captured, versioned defaults catalog per opinionated target, then reset plus override. |
| Parity | Two layers: IR round-trip (no browser) and rendered computed-style comparison (Playwright). |
| Flutter | Dart package inside this monorepo. Flutter SDK optional; SDK-dependent steps skip with a notice when absent. |
| Storybook | Compare stories generated from manifests. One unified Storybook with fixed top-level sections. Compare harness exported for reuse. |
| Packaging | One npm package per web target plus one Dart package. Lockstep versions. |
| Pipeline | Compiler with a typed, versioned IR; generated output committed with a CI drift check. Token IR shaped after the W3C Design Tokens format. |
| Framework versions | Latest stable at implementation time, pinned: Tailwind 4.3.x, MUI 9.4.x, Flutter 3.47.x. |
| Agentic authoring | Agents may write the CSS source from a design file. Support is documentation, `bwp-ds scaffold`, and a mandatory `bwp-ds lint` loop. No Figma API integration. |

## 5. Repository layout

```
packages/
  ds-compiler/       @bwp-web/ds-compiler      private. Parser, IR, plugins, verifier, story generator, `bwp-ds` CLI
  styles-css/        @bwp-web/styles-css       SOURCE OF TRUTH. Hand-written CSS + manifests. Ships bundled CSS + IR.
  styles-tailwind/   @bwp-web/styles-tailwind  generated Tailwind v4 theme and component layer
  styles-mui/        @bwp-web/styles-mui       generated MUI theme and type augmentation
  styles-flutter/    bwp_styles (Dart)       generated Dart package; optional example app for web embedding
  storybook/         @bwp-web/storybook        generated compare stories, reusable compare harness, docs pages
  assets/ components/ canvas/ eslint-config/   unchanged by this work
docs/design-system/          human documentation
AGENTS.md            agent context at repo root; CLAUDE.md points to it
```

The old `packages/styles` is deleted. `@bwp-web/styles` is not published under
V2; `@bwp-web/styles-css` is its successor.

### Generated files

- Every generated file lives under a directory named `generated/`.
- Every generated file starts with a header naming the compiler, the compiler
  version, and the source file(s) it was derived from.
- Generated files are committed. `bwp-ds verify` fails if regeneration produces
  a diff (see section 10).
- Nobody edits generated files. AGENTS.md states this as an invariant.

## 6. Source format

### 6.1 Configuration

`packages/styles-css/ds.config.json`:

```json
{
  "name": "SOLAR",
  "prefix": "bwp",
  "modes": ["light", "dark"],
  "defaultMode": "light",
  "rootFontSize": 16,
  "modeSelector": ":root[data-bwp-theme=\"{mode}\"]"
}
```

`name` is the design system's display name, used in Storybook and docs only.
`prefix` drives every CSS custom property and class name. `modes` are the
color-scheme modes; the default mode's values live on `:root`, other modes on
the mode selector. `rootFontSize` converts `rem` to logical pixels for Flutter.

### 6.2 Tokens

Location: `packages/styles-css/src/tokens/<category>.css`, one file per
category.

Rules:

- Only two kinds of rule blocks are allowed: `:root { … }` for the default mode
  and the configured mode selector for each other mode.
- Every declaration is a custom property named
  `--<prefix>-<category>-<path>` where `<category>` is the file's category and
  `<path>` is one or more kebab-case segments.
- Categories (fixed set in v1 of the format): `color`, `space`, `radius`,
  `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`,
  `shadow`, `border-width`, `duration`, `easing`, `opacity`, `z-index`, `size`.
- Values are a literal of the category's type, or a `var(--<prefix>-…)` alias to
  another token. No `calc()`, no fallbacks in `var()`, no mixed content.
- A token defined in the default mode must be defined in every other mode of
  the same file, or in none of them (mode-invariant). Partial coverage is an
  error.
- Aliases may cross categories only where the types match (for example a
  `color` alias to a `color`).

### 6.3 Components

Location: `packages/styles-css/src/components/<name>/<name>.css` and
`<name>.manifest.json`.

Selector grammar:

- Root: `.<prefix>-<name>`.
- Slot: `.<prefix>-<name>__<slot>`. Slots are reached only via a descendant
  combinator from the root: `.bwp-button .bwp-button__icon`.
- Axis selection: `[data-<axis>="<value>"]` attached to the root. Axis and
  value must be declared in the manifest.
- States: attached to the root compound only (slots are not interactive on
  their own), from the allowed set
  `:hover`, `:active`, `:focus-visible`, `:disabled`, `[disabled]`,
  `[aria-disabled="true"]`, `[aria-pressed="true"]`, `[aria-selected="true"]`,
  `[aria-expanded="true"]`, `[aria-checked="true"]`, `[data-state="<value>"]`.
  Each maps to a manifest state name (for example `:disabled`,
  `[disabled]`, and `[aria-disabled="true"]` all map to `disabled`). States
  used must be declared in the manifest.
- Compound selectors combine the above:
  `.bwp-button[data-variant="outlined"][data-size="sm"]:hover .bwp-button__icon`.
- Forbidden: element selectors, IDs, `!important`, CSS nesting, `@media`
  inside component files, any combinator other than descendant, any selector
  not matching the grammar.

Declaration rules:

- The compiler has a property table (section 8.3). A property not in the table
  is an error.
- Properties typed as color, dimension-of-space, radius, font, shadow, or
  duration must reference a token. Literals are an error for those types.
  Properties typed as keyword or layout (for example `display`, `cursor`,
  `align-items`) accept literals from a per-property allowed list.
- Shorthands are rejected where their longhands are ambiguous to translate
  (`border`, `background`, `font`, `transition`). Their longhands are allowed.
  `padding` and `margin` shorthands are allowed and expanded by the compiler.

### 6.4 Manifest

JSON, validated against `packages/ds-compiler/schemas/manifest.schema.json`
(generated from a Zod schema). Example:

```json
{
  "$schema": "../../../ds-compiler/schemas/manifest.schema.json",
  "name": "button",
  "displayName": "Button",
  "description": "Triggers an action.",
  "axes": {
    "variant": { "values": ["filled", "outlined", "ghost"], "default": "filled" },
    "size": { "values": ["sm", "md", "lg"], "default": "md" }
  },
  "states": ["hover", "active", "focus-visible", "disabled"],
  "slots": {
    "root": { "element": "button" },
    "label": { "element": "span" },
    "icon": { "element": "span", "optional": true }
  },
  "preview": {
    "label": "Button",
    "icon": "plus"
  },
  "targets": {
    "tailwind": {},
    "mui": {
      "component": "Button",
      "axisMap": { "variant": "variant", "size": "size" },
      "slotMap": { "root": "root", "icon": "startIcon" },
      "disableDefaultVariants": ["text", "contained", "outlined"],
      "defaultProps": { "disableRipple": true, "disableElevation": true }
    },
    "flutter": {
      "variantWidgets": {
        "filled": "FilledButton",
        "outlined": "OutlinedButton",
        "ghost": "TextButton"
      },
      "ignore": ["transition-duration", "transition-timing-function"]
    }
  }
}
```

Manifest semantics:

- `axes`, `states`, and `slots` are the authoritative lists; the CSS may use a
  subset but never anything outside them. `root` is always an implicit slot.
- `preview` gives the story generator content to render.
- `targets.<id>` is optional. Absent means "not mapped" and shows as
  `unmapped` in coverage, which fails verification. `{ "excluded": "<reason>" }`
  is an explicit opt-out and shows as `excluded`.
- `targets.<id>.ignore` lists CSS properties that the target intentionally does
  not translate for this component. They show as `partial` in coverage and are
  excluded from round-trip comparison.
- Target-specific keys are defined by each plugin's own Zod schema and merged
  into the manifest schema, so an unknown key is a validation error.
- The manifest says *which* framework component and *how axes and slots map*.
  Knowledge of *how* that framework's theming works lives in the plugin.

## 7. Intermediate representation

Produced by `bwp-ds build`, written to `packages/styles-css/design.ir.json`
(committed, drift-checked) and exported as TypeScript types from the compiler.

```ts
interface DesignIR {
  irVersion: 1;
  meta: {
    prefix: string;
    modes: string[];
    defaultMode: string;
    rootFontSize: number;
    sourceHash: string; // hash of all source files, for cache and drift
  };
  tokens: Record<TokenId, Token>; // TokenId = "color.primary.default"
  components: Record<string, ComponentIR>;
}

interface Token {
  $type: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'number' |
         'duration' | 'cubicBezier' | 'shadow';
  $value: TokenValue | Record<Mode, TokenValue>; // per-mode when it varies
  alias?: TokenId; // set when the source was var(--bwp-…)
  source: SourceLocation;
}

interface ComponentIR {
  name: string;
  displayName: string;
  axes: Record<string, { values: string[]; default: string }>;
  states: string[];
  slots: Record<string, { element: string; optional: boolean }>;
  rules: Rule[];
  targets: ManifestTargets;
}

interface Rule {
  slot: string;                       // "root" | slot name
  axes: Record<string, string>;       // selected axis values, may be empty
  states: string[];                   // sorted, may be empty
  declarations: Record<CssProperty, IRValue>;
  source: SourceLocation;
}

type IRValue =
  | { kind: 'token'; ref: TokenId }
  | { kind: 'literal'; type: 'color' | 'dimension' | 'keyword' | 'number' | 'string'; value: unknown };
```

Normalization:

- Rules are keyed by `(slot, axes, states)`. Two source rules with the same key
  merge; a declaration set twice with different values is an error.
- Colors normalize to `#rrggbbaa`. Dimensions normalize to `{ value, unit }`
  with `unit` in `px | rem | em | %`.
- Cascade order between rule keys is fixed by the compiler, not by source
  order: base, then axis rules, then states in the order `hover`,
  `focus-visible`, `active`, `disabled`, then combinations. Generators emit in
  this order so specificity matches across targets.
- Token entries follow the W3C Design Tokens Community Group format for
  `$type` and `$value` so a future formatter can emit standard token JSON
  without an IR change.

## 8. Compiler

Package `@bwp-web/ds-compiler`, TypeScript, Node 22+, tested with Vitest.
Dependencies: `postcss`, `postcss-selector-parser`, `postcss-value-parser`,
`zod`, `culori` (color normalization), `commander` (CLI).

### 8.1 CLI

```
bwp-ds scaffold tokens <category>   writes a valid token file skeleton for one category
bwp-ds scaffold component <name>    writes a valid manifest + CSS skeleton for one component
bwp-ds lint                         authoring rules only, no output files
bwp-ds build                        CSS + manifests -> design.ir.json
bwp-ds capture-defaults --target    mui | flutter, writes a defaults catalog
bwp-ds generate [--target]          tailwind | mui | flutter | stories | all
bwp-ds verify [--rendered]          drift + roundtrip + coverage (+ rendered)
```

All commands read `ds.config.json` from `packages/styles-css`. Exit code is
non-zero on any error. Output is human-readable by default and JSON with
`--json`.

### 8.2 Plugin contract

```ts
interface TargetPlugin<Catalog = unknown, Hints = unknown> {
  id: 'tailwind' | 'mui' | 'flutter';
  hintsSchema: ZodSchema<Hints>;                 // merged into manifest schema
  captureDefaults?(ctx: Ctx): Promise<Catalog>;  // opinionated targets only
  generate(ir: DesignIR, catalog: Catalog | null, ctx: Ctx): GeneratedFile[];
  reparse(files: GeneratedFile[], ctx: Ctx): DesignIR;  // for round-trip
  coverage(ir: DesignIR): CoverageReport;
}
```

`GeneratedFile` is `{ path, contents }`. `generate` must be a pure function of
its inputs. Keys are emitted sorted, formatting is produced by templates, and
no external formatter runs during generation, so byte-identical output is
guaranteed across machines.

### 8.3 Property handler table

The compiler owns one table of canonical CSS properties. Each entry declares
the value type, the allowed literals if any, and one handler per target.

```ts
{
  'border-radius': {
    type: 'radius',
    tokenRequired: true,
    tailwind: identity,
    mui: (v) => ({ borderRadius: v }),
    flutter: { ElevatedButton: buttonShapeRadius, Card: cardShapeRadius /* … */ }
  }
}
```

A property with no handler for the framework component in use is `unsupported`
for that component. `coverage` reports it; `verify` fails unless the manifest
lists the property under `ignore` for that target.

### 8.4 Errors

Every error carries a stable code (`DS-E001` style), file and line, a
message, and a fix hint. Codes are documented in `docs/design-system/errors.md`. Lint
and build stop at the first file with errors but report all errors in that
file. A warning level exists for advisory rules (for example a root rule that
does not declare a baseline reset) and never fails the build.

## 9. Targets

### 9.1 Defaults catalog

Opinionated frameworks style components before the design system does. Parity requires
knowing exactly what they set so the generator can neutralize it.

- `bwp-ds capture-defaults --target mui` creates the default theme with
  `createTheme()`, serializes it, then renders every manifest-mapped MUI
  component in each of its default variants, sizes, and states in headless
  Chromium (Playwright, already a repo dependency) and records computed styles
  for the root and each mapped slot. Output:
  `packages/ds-compiler/catalogs/mui@<version>.json`.
- `bwp-ds capture-defaults --target flutter` runs
  `packages/styles-flutter/tool/capture_defaults.dart` when the Flutter SDK is
  present, dumping `ThemeData` and the resolved component theme properties for
  each mapped widget into `catalogs/flutter@<version>.json`. Without the SDK the
  command prints a notice and exits zero; the committed catalog is used.
- Catalogs are committed. Upgrading a framework means re-capturing and
  reviewing the diff. The generator refuses to run if the installed framework
  version does not match the catalog version, unless `--allow-catalog-mismatch`
  is passed.

Generation for an opinionated target then emits, per component and slot:

1. A reset for every property the catalog shows the framework sets and the
   IR does not define. The reset value is `unset` (restores the user-agent
   default, matching what the plain CSS target gets on the same element).
2. Overrides for every property the IR defines.

The authoring guide recommends declaring an explicit baseline on each root
(for example `appearance`, `border`, `background`, `font`) so parity rests on
the spec rather than on user-agent defaults. The compiler warns when a root
rule omits the baseline set.

### 9.2 Tailwind (`@bwp-web/styles-tailwind`)

Tailwind 4.3.x, CSS-first. Output under `src/generated/`:

- `theme.css`: an `@theme` block mapping tokens into Tailwind
  namespaces (`color` to `--color-<prefix>-*`, `space` to `--spacing-<prefix>-*`,
  `radius` to `--radius-<prefix>-*`, `font-*` to `--font-*`, `shadow` to
  `--shadow-<prefix>-*`, and so on) with per-mode values via the mode selector.
- `components.css`: `@layer components { .bwp-button { … } }` with values
  referencing the theme variables.
- `index.css`: imports both.

The package's hand-written `src/index.css` imports `generated/index.css`.
Consumers add `@import "@bwp-web/styles-tailwind"` after `@import "tailwindcss"`.
This target is close to an identity transform; it is built first to prove the
pipeline end to end. `reparse` runs the compiler's own CSS parser on the
output.

### 9.3 MUI (`@bwp-web/styles-mui`)

MUI 9.4.x with the Emotion styled engine. Output under `src/generated/`:

- `theme.ts` exporting `createBwpTheme(options?)`, built with `createTheme`
  using `cssVariables: true` and `colorSchemes` derived from token modes.
  Palette, typography, spacing, shape, and shadows come from tokens. Per
  component: `defaultProps` (default axis values plus manifest
  `defaultProps`), `styleOverrides` for base and slot rules, `variants` entries
  for each axis value and combination (MUI 9 moved variant-keyed overrides into
  `variants`, which this design already uses), and the catalog-driven reset.
- `augmentation.d.ts` adding the design system's axis values to the component's prop
  overrides interface and setting `disableDefaultVariants` entries to `false`.
- `theme.model.json`: the structured model the TypeScript was rendered from.

`reparse` reads `theme.model.json`, not the TypeScript. A Vitest test
evaluates `theme.ts` and asserts it deep-equals the model, so the model is a
faithful proxy.

### 9.4 Flutter (`bwp_styles`)

Flutter 3.47.x stable, Material 3. Output under `lib/src/generated/`:

- `tokens.dart`: `BwpColors`, `BwpSpace`, `BwpRadius`, `BwpText`, and
  so on, as classes with `light` and `dark` constant instances where values vary
  by mode and plain constants where they do not. `rem` becomes logical pixels
  using `rootFontSize`.
- `theme.dart`: `BwpTheme.light()` and `BwpTheme.dark()` returning
  `ThemeData(useMaterial3: true, …)` with component themes for each mapped
  widget. States use `WidgetStateProperty.resolveWith`. Manifest
  `variantWidgets` routes each variant to a Flutter widget theme. Axes
  Flutter has no native concept of (such as size) become named `ButtonStyle`
  constants, for example `BwpButtonStyles.sm`, that consumers pass as
  `style:`.
- `<file>.flutter.json` beside each Dart file: the model the Dart was rendered
  from.

Dart is formatted by construction from templates. `dart format
--set-exit-if-changed` runs as an SDK-present check that the templates already
produce formatted code; it never rewrites output, so drift checks do not depend
on the SDK. `reparse` reads the `.flutter.json` models. When the SDK is
present, `dart test` runs generated tests asserting the Dart constants equal
the models, and `flutter build web` on `example/` produces the embed used by
Storybook.

## 10. Verification

`bwp-ds verify` runs these in order and reports all failures:

| Step | What it does | Needs |
| --- | --- | --- |
| `lint` | Authoring rules on CSS and manifests. | Node |
| `drift` | Regenerates every target and the IR into a temp directory and diffs against committed files. | Node |
| `roundtrip` | For each target, `reparse(generated)` and diff against the source IR, restricted to that target's coverage. Reports mismatches per component, slot, selector, and property with source location. | Node |
| `coverage` | Components by targets matrix: `supported`, `partial` (lists ignored properties), `unmapped`, `excluded` (with reason). Any `unmapped` fails. Writes `docs/design-system/coverage.md`. | Node |
| `rendered` (with `--rendered`) | Runs the generated compare stories' play functions via Vitest browser mode and Playwright. For each row, reads a fixed list of computed properties for root and slots in each column and compares to the CSS column. Colors exact after normalization, dimensions within 0.5px. States driven by real interactions (`userEvent.hover`, `tab`) and attributes (`disabled`). | Node, Chromium |
| `flutter` (with `--rendered`, SDK present) | `dart analyze`, `dart format --set-exit-if-changed`, `dart test`. Skips with a notice otherwise. | Flutter SDK |

Flutter parity is property-level, never pixel-level. Flutter web screenshots in
Storybook are for people, not for assertions.

## 11. Storybook

One Storybook, `@bwp-web/storybook`, with fixed top-level sections enforced by
a title-prefix lint:

| Section | Content | Source |
| --- | --- | --- |
| Introduction | What the design system is (name from config), how to read the compare views, links to docs. | hand-written MDX |
| Foundations | One compare story per token category: swatch or sample per mode, with the CSS variable, Tailwind utility, MUI theme path, and Dart constant. | generated |
| Styles | One compare story per component. | generated |
| Components | Stories for `@bwp-web/components`, colocated in that package. | future, hand-written |
| Canvas | Stories for `@bwp-web/canvas`, colocated. | future, hand-written |
| Assets | Icons, images, fonts from `@bwp-web/assets`, colocated. | future |

`main.ts` keeps globbing colocated `*.stories.*` files per package and adds
`src/generated/**`.

### Compare harness (exported for reuse)

The storybook package exports:

- `CompareGrid`: columns are targets, rows are every axis combination times
  every state. Each cell is isolated (Shadow DOM or scoped container with its
  own stylesheet) so no target's CSS bleeds into another. Tailwind is imported
  without preflight. MUI renders inside its own `ThemeProvider` without
  `CssBaseline`.
- Globals: `dsMode` (light or dark) and `dsTargets` (which columns to
  show), both in the toolbar.
- `parityPlay`: a play-function helper implementing the rendered comparison,
  parameterized by the property list and tolerances.

Generated compare stories use these. Later, hand-written stories in the
components package can use the same grid to compare, say, a CSS and a MUI
rendering of a complex component.

### Cells

- CSS: raw HTML built from the manifest's slots and `preview`, with
  `@bwp-web/styles-css` loaded.
- Tailwind: the same HTML with the Tailwind build (Vite plugin) importing
  `@bwp-web/styles-tailwind`.
- MUI: the manifest's MUI component with props derived from `axisMap`.
- Flutter: an iframe of the Flutter web example build served from the
  Storybook static directory, with route parameters for component, axes,
  state, and mode. When the build is absent the cell shows a placeholder.

## 12. Agentic authoring from design files

The CSS source is the one layer an agent may author, typically by reading a
Figma file and writing tokens and components. The design accepts that this
step is not deterministic and compensates with three guardrails so the agent's
behavior is predictable and its mistakes are caught before they reach the IR.

### 12.1 Scaffold command

`bwp-ds scaffold` writes files that already satisfy every authoring rule, so the
agent fills in values instead of inventing structure.

- `bwp-ds scaffold tokens <category>` writes
  `src/tokens/<category>.css` with a `:root` block and one block per
  additional mode, each containing a commented example declaration in the
  correct naming form and a `/* TODO */` marker. It refuses to overwrite an
  existing file.
- `bwp-ds scaffold component <name> [--axis variant=filled,outlined]
  [--axis size=sm,md] [--state hover,focus-visible,disabled] [--slot icon]`
  writes `<name>.manifest.json` with the given axes, states, and slots filled
  in and every target left as `{ "excluded": "TODO" }`, plus `<name>.css`
  containing one empty rule per root, axis value, state, and slot in the
  compiler's cascade order, each with a `/* TODO */` comment listing the
  baseline properties expected there.
- `bwp-ds lint` treats a remaining `TODO` marker as an error with its own code,
  so a scaffold cannot be left half-filled without failing.

### 12.2 Lint loop

`bwp-ds lint` is the mandatory gate. The procedure in AGENTS.md requires the
agent to run it after every file it writes or edits, and to fix every error
before touching the next file. Each error's fix hint names the exact rule and
the allowed form, so the agent does not have to guess. `bwp-ds build` follows
once lint passes, and `bwp-ds verify` before the agent reports completion.

### 12.3 Authoring procedure and mapping guide

AGENTS.md carries a numbered procedure the agent follows in order:

1. Read `docs/design-system/authoring-guide.md` and `docs/design-system/figma-mapping.md`.
2. Inventory the design file: list variables and styles by category, list
   components with their variants, sizes, and states.
3. For each token category, scaffold, then fill values. Name tokens by the
   naming rules, never by the Figma name verbatim. Record every Figma name to
   token mapping in `packages/styles-css/src/tokens/MAPPING.md`, one
   table per category.
4. Lint. Fix. Build.
5. For each component, scaffold with the discovered axes, states, and slots,
   then fill values. Every color, spacing, radius, font, and shadow must be a
   token reference; if the design uses a value with no token, add the token
   first, do not write a literal.
6. Fill the `targets` section of the manifest using the per-target mapping
   tables in `docs/design-system/targets/*.md`, or set an explicit `excluded` reason.
7. Lint. Fix. Build. Verify.
8. Report what was mapped, what was excluded and why, and any design value
   that had no clear home, using the report template in AGENTS.md.

`docs/design-system/figma-mapping.md` gives the deterministic parts of the mapping so
the agent applies them rather than choosing:

- Figma variable collection and mode names to token categories and modes.
- Figma naming (`Color/Primary/Default`) to token naming
  (`--bwp-color-primary-default`), including the rules for casing,
  separators, and numeric scales.
- Figma component property types to manifest concepts: variant properties
  become axes, boolean properties become optional slots or states, instance
  swap properties become slots, and interactive-component states become
  states.
- Figma text styles to `font-*`, `line-height`, and `letter-spacing` tokens,
  and effect styles to `shadow` tokens.
- What the agent must never do: write literals where tokens are required,
  create a category outside the fixed set, edit anything under `generated/`,
  skip lint, or resolve an ambiguity silently. Ambiguities go into the report.

### 12.4 Predictability by construction

The compiler rules already make many mistakes impossible: unknown properties,
unknown categories, unknown axes or states, and literal colors fail at lint
time with a fix hint. The scaffold removes structural choices. The procedure
removes ordering choices. The mapping guide removes naming choices. What
remains for the agent is reading values off the design and deciding which
token a value belongs to, and that decision is written down in `MAPPING.md`
where a reviewer can check it.

## 13. Documentation

- `AGENTS.md` (root): purpose, invariants (CSS is the source of truth; never
  edit `generated/`; run `bwp-ds lint` after every edit and `bwp-ds verify`
  before finishing), package map, command reference, the authoring procedure
  from section 12.3 with its report template, recipes for adding a token, a
  component, a property handler, a target hint, and a new target, the error
  code index, and links into `docs/design-system/`. `CLAUDE.md` contains one line
  pointing to it.
- `docs/design-system/authoring-guide.md`: CSS rules and manifest reference, with
  examples of valid and invalid input and the error each invalid case raises.
- `docs/design-system/figma-mapping.md`: the mapping guide from section 12.3.
- `docs/design-system/ir.md`: the IR schema and normalization rules.
- `docs/design-system/targets/tailwind.md`, `mui.md`, `flutter.md`: how each plugin
  maps the IR, what the defaults catalog captured and why each reset exists,
  known limitations.
- `docs/design-system/verification.md`: each verify step, how to read its report,
  how to go from a report line to the handler that produced it.
- `docs/design-system/errors.md`: every error code with cause and fix.
- `docs/design-system/coverage.md`: generated by `bwp-ds verify`.
- Package READMEs: install and usage per target, hand-written.

## 14. Build, CI, and packaging

- Turbo tasks: `ds:build` (styles-css), `ds:generate` (target packages,
  depends on build), `ds:verify` (root, depends on generate), existing
  `build`, `lint`, `typecheck`, `format`.
- Root scripts: `npm run ds -- <command>` proxies to the CLI;
  `npm run verify` runs `bwp-ds verify`.
- CI (`main.yml`): install, lint, typecheck, format, `bwp-ds verify`, then
  `bwp-ds verify --rendered` with Playwright browsers installed. A separate
  optional job installs Flutter 3.47.x and runs the Flutter steps.
- `auto-tag.yml`: package list becomes `assets canvas components styles-css
  styles-tailwind styles-mui`. The Dart package is tagged `bwp_styles@<v>` by
  the same workflow watching `pubspec.yaml`.
- Versioning: `styles-css`, `styles-tailwind`, `styles-mui`, and `bwp_styles`
  share one version. A version bump script updates all four.
- Publishing: npm packages as today, `--access public` with dist-tags per the
  root README. `bwp_styles` to pub.dev with `dart pub publish`.

## 15. Fixtures and starting content

- Compiler tests use a self-contained mini design system under
  `packages/ds-compiler/test/fixtures/`, including deliberately invalid
  inputs for every error code.
- `packages/styles-css/src` starts with one skeleton token file per category
  and one `example` component exercising two axes, several states, and a slot,
  so the whole pipeline and the Storybook are demonstrable from day one. Design
  system authors replace this content.

## 16. Implementation order

Each item becomes its own implementation plan and cycle.

1. Compiler foundation: package, config, CSS and manifest parser, IR, `lint`,
   `build`, `scaffold`, error codes, fixtures, `AGENTS.md` with the authoring
   procedure, `authoring-guide.md` and `figma-mapping.md`, docs skeleton,
   `styles-css` package with starting content produced by `scaffold`.
2. Tailwind plugin, `styles-tailwind` package, `drift`, `roundtrip`, and
   `coverage` verification. Proves the pipeline end to end.
3. MUI plugin with `capture-defaults`, the reset-plus-override generator,
   augmentation output, `styles-mui` package.
4. Storybook: sections, compare harness, story generator, `rendered`
   verification.
5. Flutter plugin, `bwp_styles` package, SDK-optional steps, example app for
   web embedding, Flutter column in Storybook.
6. Packaging and CI: turbo tasks, workflows, version script, package READMEs,
   final documentation pass.

## 17. Risks and mitigations

- **An agent authoring from Figma maps a value to the wrong token or invents
  structure.** Structure comes from `bwp-ds scaffold`, naming from the mapping
  guide, and every mapping is recorded in `MAPPING.md` for review. Lint
  rejects literals where tokens are required and any leftover `TODO`.

- **Framework upgrades move defaults.** The versioned catalog and the version
  match check make this a reviewed diff, not a silent drift.
- **MUI or Flutter cannot express a design-system construct.** Coverage marks it
  `unsupported`; the manifest must either `ignore` it with intent or the
  plugin gains a handler. Nothing is dropped silently.
- **Rendered parity flakiness.** Only computed styles are compared, never
  pixels; tolerances are explicit; interactions are deterministic.
- **Local Flutter SDK is 3.24.4, behind the pinned 3.47.x.** Plan 5 begins
  with an SDK upgrade. Until then, SDK-dependent steps skip.
- **The stubs in `packages/*/src/index.ts` reference a missing spec.** Plan 1
  updates those comments to point at this document.
