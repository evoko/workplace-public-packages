# Agent guide

Read this before touching anything in this repository. It tells you what the
project is, what must never change, where things live, which commands to run,
and how to do the common tasks without guessing.

## What this repository is

A monorepo that turns one hand-written CSS design system into equivalent theme
layers for Tailwind CSS, MUI, and Flutter, and verifies that they stay in
parity. The design system in use today is called SOLAR. The infrastructure is
design-system agnostic: its name, CSS prefix, and color modes live in
`packages/styles-css/ds.config.json`, and nothing in the code is named after it.

Full design: `docs/superpowers/specs/2026-09-16-solar-multi-target-infrastructure-design.md`.

## Invariants

1. **The CSS in `packages/styles-css/src` is the single source of truth.**
   Every other representation (the IR, Tailwind, MUI, Flutter) is derived from
   it by the compiler. Fix the source or the compiler, never the derived output.
2. **Never edit generated files:** anything under
   `packages/styles-tailwind/src/generated/`, `packages/styles-mui/src/generated/`,
   `packages/storybook/src/generated/` (and any future `generated/` directory),
   `packages/styles-css/design.ir.json`,
   `packages/styles-css/src/index.css`, `packages/styles-css/catalogs/*.json`,
   and `docs/design-system/coverage.md`. `bwp-ds build` regenerates
   `design.ir.json` and `src/index.css`; `bwp-ds generate` regenerates each
   target's `src/generated/`; `bwp-ds capture-defaults --target mui`
   regenerates `catalogs/mui.json`; `bwp-ds verify` regenerates
   `coverage.md` and checks the rest for drift, but for the catalog it only
   checks the recorded MUI version and that every mapped component and
   permutation is present — it does not re-run capture and diff, so a
   catalog that is stale in a way that still matches that shape would pass
   `verify` alone. CI closes that gap itself: it runs
   `bwp-ds capture-defaults --target mui` before `bwp-ds verify` and then
   diffs the working tree, so a catalog that does not match a fresh capture
   fails CI the same way any other generated-file drift does.
3. **Everything downstream of the CSS is algorithmic.** If a translation is
   wrong, change the compiler's handler table or a target plugin, not the
   output. Do not "fix" generated code by hand and do not ask a model to
   rewrite it.
4. **Run `bwp-ds lint` after every edit to the CSS source, and `bwp-ds build`
   before you report completion.** A lint error is a hard stop; fix it before
   the next file.
5. **Never run a git command that writes** (`add`, `commit`, `tag`, `branch`,
   `reset`). The maintainers handle version control. Report which files you
   changed instead.
6. **Do not name anything after the current design system.** Use `ds`, `bwp`,
   or a descriptive word. The design system's display name comes from
   `ds.config.json`.
7. **If a command is denied or blocked, stop and report it.** Do not reach the
   same effect through another tool or a script. The maintainers decide.

## Package map

| Path                                                        | Package                          | Role                                                                                                                                                                       |
| ----------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ds-compiler`                                      | `@bwp-web/ds-compiler` (private) | Parser, IR, `bwp-ds` CLI: lint, build, scaffold, generate, verify. Tailwind, MUI, and the compare-story targets implemented; Flutter comes later.                          |
| `packages/styles-css`                                       | `@bwp-web/styles-css`            | The CSS source of truth, `ds.config.json`, the compiled `design.ir.json`, and `catalogs/mui.json` (MUI's captured defaults for components mapped onto its own components). |
| `packages/styles-tailwind`                                  | `@bwp-web/styles-tailwind`       | Generated Tailwind v4 theme and component layer. Only `src/generated/` is generated; everything else in the package is hand-written.                                       |
| `packages/styles-mui`                                       | `@bwp-web/styles-mui`            | Generated MUI theme, augmentation, and React components. Only `src/generated/` is generated; everything else in the package is hand-written.                               |
| `packages/storybook`                                        | `@bwp-web/storybook` (private)   | Generated compare stories, the compare harness, Introduction; `npm run storybook` to browse. Only `src/generated/` is generated.                                           |
| `packages/assets`, `packages/components`, `packages/canvas` | published, currently empty       | Untouched by the design-system work.                                                                                                                                       |
| `docs/design-system/`                                       |                                  | Human documentation. Start with `authoring-guide.md`.                                                                                                                      |

## Commands

Run from the repo root with Node 22 (`nvm use` reads `.nvmrc`).
`npm run ds -- <command>` targets `packages/styles-css`.

| Command                                                                                              | What it does                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run ds -- lint`                                                                                 | Checks every authoring rule. Exit 1 on any error.                                                                                                                                                                   |
| `npm run ds -- build`                                                                                | Lint, then always regenerate `src/index.css`, and write `design.ir.json` only when there are no errors. Nothing is written if `ds.config.json` cannot be read (`DS-E001`).                                          |
| `npm run ds -- scaffold tokens <category>`                                                           | Creates a token file with the right structure and `TODO` markers you must fill in before lint passes, and updates `src/index.css`.                                                                                  |
| `npm run ds -- scaffold component <name> --axis a=v1,v2 [--axis b=w1,w2 ...] --state s1,s2 --slot x` | Creates a manifest and CSS skeleton with `TODO` markers you must fill in before lint passes, and updates `src/index.css`. The first axis value is the default. Duplicate axis names, values, or slots are rejected. |
| `npm run ds -- lint --json`                                                                          | Same diagnostics as JSON, for tooling.                                                                                                                                                                              |
| `npm run ds -- generate [--target <id>]`                                                             | Writes each target's files from the IR. Deletes files in the output directory the generator did not produce.                                                                                                        |
| `npm run ds -- generate --target stories`                                                            | Regenerates only `packages/storybook/src/generated/`: the compare stories and their config. Same drift rules as any other target; never hand-edit the result.                                                       |
| `npm run ds -- capture-defaults --target mui`                                                        | Renders every component mapped onto an MUI component and writes `packages/styles-css/catalogs/mui.json`. Needs `packages/styles-mui`'s dependencies installed. Deterministic; commit the result.                    |
| `npm run verify`                                                                                     | `bwp-ds verify`: lint, drift, round-trip, coverage; writes `docs/design-system/coverage.md`. Exit 1 on any error.                                                                                                   |
| `npm run verify:rendered`                                                                            | `bwp-ds verify --rendered`: the four steps above, then the browser comparison of every compare story (`DS-E087` on failure). Needs Chromium; see the recipe below.                                                  |
| `npm run storybook:test`                                                                             | The browser comparison on its own, through Turbo so the target packages are rebuilt first. About 10 s for 18 stories.                                                                                               |
| `npm run test`                                                                                       | Compiler unit tests.                                                                                                                                                                                                |
| `npm run lint`, `npm run typecheck`, `npm run format`                                                | Repo-wide checks; CI runs them.                                                                                                                                                                                     |

Repeat `--axis` once per axis. `--state` and `--slot` each take one
comma-separated list.

Every diagnostic has the form
`<file>:<line>:<col> <severity> <code> <title>: <message>` followed by a
`hint:` line. Codes are listed in `docs/design-system/errors.md`.

With `--json`, `lint` and `build` print one object
`{ "diagnostics": [...], "summary": "<n> errors, <m> warnings", "wrote"?: path, "entry"?: path }`.
`scaffold` prints `{ "wrote": [paths] }` on success or `{ "error": "<message>" }`
on failure, except when `ds.config.json` cannot be loaded, in which case it
prints the `diagnostics` object like `lint` does. Exit code 1 on any error.
`verify` adds `steps` (`lint`, `drift`, `roundtrip`, `coverage`, `rendered`,
each `pass`, `fail`, or `skipped`) and `coverageFile`; `generate` adds
`wrote` and `removed`.

## Authoring procedure (design file to CSS)

Follow these steps in order. Do not skip, reorder, or merge them.

1. Read `docs/design-system/authoring-guide.md` and
   `docs/design-system/figma-mapping.md`.
2. Inventory the design file. List variables and styles grouped by the token
   categories in the authoring guide. List components with their variants,
   sizes, states, and parts.
3. For each token category you need: run `scaffold tokens <category>` if the
   file does not exist, then fill in values. Name tokens by the rules in the
   mapping guide, never by the design-file name verbatim. Record every
   design-name to token mapping in `packages/styles-css/src/tokens/MAPPING.md`.
4. Run `lint`. Fix every error. Run `build`.
5. For each component: run `scaffold component <name>` with the axes, states,
   and slots you found, then fill in values. Every color, spacing, radius,
   font, shadow, border width, duration, and easing must be a `var()` token
   reference. If the design uses a value that has no token, add the token
   first. Never write the literal.
6. Fill the `targets` section of each manifest using
   `docs/design-system/targets/*.md`, or set `{ "excluded": "<reason>" }`.
7. Run `lint`, fix, `build`, then `npm run ds -- generate` and `npm run verify`.
   Commit the regenerated files with your change.
8. Report using the template below.

### Report template

```
Tokens added: <count> across <categories>
Components added: <names>
Mappings recorded in MAPPING.md: yes/no
Targets excluded: <component>.<target>: <reason>
Design values with no clear home: <list, or none>
Ambiguities resolved (and how): <list, or none>
Lint: 0 errors, <n> warnings   Build: design.ir.json written
```

### Never do

- Write a literal color, spacing, radius, font, shadow, border width,
  duration, or easing in a component. Use a token.
- Invent a token category. The set is fixed in the authoring guide.
- Put a state or axis on a slot selector. They go on the root compound.
- Edit anything under `generated/`, `design.ir.json`, or `src/index.css`.
- Skip `lint` between files.
- Resolve an ambiguity silently. Put it in the report.
- Use the `disabled` state on a root whose element is not a form control
  (`button`, `input`, `select`, `textarea`). `:disabled` never matches a `div`;
  set `slots.root.element` in the manifest instead.

## Recipes

### Add a token

1. Open `packages/styles-css/src/tokens/<category>.css` (or scaffold it).
2. Add `--bwp-<category>-<path>: <value>;` inside `:root`. If the value differs
   per mode, add the same name inside every mode block.
3. `npm run ds -- lint`, then `npm run ds -- build`.

Adding or removing a source file (not editing one) changes `src/index.css`.
`lint` reports `DS-E070` until you run `npm run ds -- build`; that is the fix,
never edit `src/index.css`. Prefer scaffolding, which regenerates the entry
file for you.

### Add a component

1. `npm run ds -- scaffold component <name> --axis ... --state ... --slot ...`
2. `scaffold component` always writes `slots.root.element: "div"` and always
   writes the `disabled` state as `:disabled`. Lint does not check that the
   two agree. If the root is not a form control, change one by hand: set
   `slots.root.element` to the real element (`button`, `input`, `select`,
   `textarea`), or rewrite the selector as `[aria-disabled="true"]`.
3. Fill `<name>.css`. The base rule `.bwp-<name>` styles the default axis
   values; other values get `[data-<axis>="<value>"]` rules; states get
   pseudo-class or attribute rules on the root; slots get
   `.bwp-<name> .bwp-<name>__<slot>` rules.
4. Fill `<name>.manifest.json`: `displayName`, `description`, `preview`,
   `targets`.
5. `npm run ds -- lint`, then `npm run ds -- build`. The build regenerates
   `src/index.css`; do not edit it. `npm run ds -- generate`, then
   `npm run verify`. The manifest needs a `targets.tailwind` entry (`{}` or an
   exclusion) as well as `targets.mui` (`{}` for an own React component,
   `{ "component": ..., "axisMap": ..., "slotMap": ... }` to map it onto one
   of MUI's own components instead, or an exclusion) or verify fails with
   `DS-E082`.

### Map a component onto an MUI component

Use this instead of `mui: {}` when the design system's component is really a
themed MUI component (`Button`, `Chip`, …), not a new one.

1. In the manifest's `targets.mui`, replace `{}` with `{ "component":
"<MUI export name>", "axisMap": { "<axis>": "<mui prop>", … }, "slotMap":
{ "<slot>": "<mui slot key>", … } }`. Every axis and every non-root slot
   needs an entry. Add `defaultProps` only for MUI props no axis or slot
   already covers. `slots.root.element` must equal the element MUI actually
   renders (`button` for `Button`).
2. `npm run ds -- capture-defaults --target mui`. This renders the component
   through `packages/styles-mui`'s installed MUI and writes
   `packages/styles-css/catalogs/mui.json`; commit it.
3. `npm run ds -- generate`, then `npm run verify`.
4. Read the diagnostic if verify fails: `DS-E086` at the manifest names an
   MUI element that no slot maps to (add a `slotMap` entry for it, or exclude
   the component) or a stale/mismatched catalog (re-run `capture-defaults`).
   `DS-E085` names the axis, slot, root element, or default prop that does
   not fit the MUI component (fix the manifest hint it names).
5. See `docs/design-system/targets/mui.md#mapped-components` for what the
   generator emits (resets, parity `defaultProps`, the typed wrapper, and the
   augmentation of MUI's own component) and the starter `button` component
   for a worked example.

### Check rendered parity locally

Proves in a real browser that the css, Tailwind, and MUI targets compute the
same styles for every axis combination, state, and color mode.

1. Once per machine: `npx playwright install chromium`.
2. `npm run verify:rendered` from the repo root, never
   `npm run test:rendered` inside `packages/storybook`
   (`docs/design-system/storybook.md` says why). The browser step runs only
   after lint, drift, round-trip, and coverage pass.
3. Read the failure lines. Each is
   `component | row | mode | target | element | property: css <expected> vs <target> <actual>`,
   so it names the component, the axis values and state, the mode, the
   target, the element (`root` or a slot), and the property.
4. Fix the target plugin under `packages/ds-compiler/src/targets/<id>/` or
   the harness under `packages/storybook/src/harness/`, then regenerate.
   Never edit the generated stories.
5. `docs/design-system/storybook.md` explains the grids, the tolerances, and
   the `ignore` escape hatch.

### Support a new CSS property

1. Add an entry to `PROPERTY_TABLE` in
   `packages/ds-compiler/src/components/properties.ts`. Choose `token(...)` for
   design values, `keyword([...])` for enumerations, `free(...)` for free-form
   literals.
2. Add a test case in `packages/ds-compiler/test/properties.test.ts`.
3. Document it in the properties section of the authoring guide.
4. Later plans add a handler per target; until then the property is
   `unsupported` for generation and coverage reports it.

### Add a state or axis to a component

Add it to the manifest first (`states` or `axes`), then use it in the CSS.
Using it in CSS first fails with `DS-E031` or `DS-E033`.

### Change the compiler

The compiler is TypeScript under `packages/ds-compiler/src`. Every module has a
test file under `test/`. Add or update the test first, run
`npx vitest run` from the package, then implement. Errors get a stable code in
`src/errors.ts` and an entry in `docs/design-system/errors.md`. A generation
bug that makes `packages/styles-mui` fail `typecheck` or `lint` is fixed in
the renderer under `packages/ds-compiler/src/targets/mui/`, then regenerated.

## Error code index

See `docs/design-system/errors.md`. Ranges: `DS-E00x` config, `DS-E01x`
tokens, `DS-E02x` manifests, `DS-E03x` selectors, `DS-E04x` declarations,
`DS-E05x` scaffolding leftovers, `DS-E06x` file layout and CSS syntax,
`DS-E07x` generated files, `DS-E08x` generated output, verification, and
target expressibility, `DS-W00x` warnings.
