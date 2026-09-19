# MUI Target: Mapped Components and Defaults Catalog Implementation Plan (Plan 3b)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A design-system component can be mapped onto one of MUI's own components (`targets.mui.component: "Button"`) with 1:1 parity: MUI's default styling for that component is neutralised property by property from a captured, versioned defaults catalog, the design system's rules are layered on top, MUI's prop unions are narrowed to the design system's values, and `@bwp-web/styles-mui` exports a typed wrapper whose props are exactly the design system's.

**Architecture:** `bwp-ds capture-defaults --target mui` renders every mapped component, in every permutation of its axis values, with `react-dom/server` under an Emotion `CacheProvider`, and records the flattened CSS MUI emitted for the root element and each mapped slot as selector-relative rules (`&`, `&:hover`, `&.Mui-disabled`, `& .MuiButton-startIcon::before`, media-wrapped) into `packages/styles-css/catalogs/mui.json`, together with MUI's prop unions extracted from its `.d.ts` files with the TypeScript compiler API. The generator then emits, per permutation and per catalog rule, a leading `variants` entry that either restates the design system's effective value for each property MUI sets (when a design-system rule of lower specificity provides it) or `revert`s it to the user-agent default (when none does), followed by the design system's own rules exactly as Plan 3 emits them for own components. The augmentation sets every MUI default value of a mapped prop to `false` and the design system's values to `true`, and empties the unions of overridable props the design system does not map. A generated wrapper re-exports the MUI component with design-system prop names and types. Round-trip recomputes the resets from the IR and the catalog and requires the generated prefix to equal them, then verifies the design-system rules as before. Own components (Plan 3) are unchanged.

**Tech Stack:** TypeScript 5.9 (also at runtime, for `.d.ts` extraction), Node 22, `@mui/material` 9.4.x, `@emotion/react`/`@emotion/cache` 11.14, React 19, postcss (already a dependency), Vitest 4, Zod 4, tsup, Turbo.

**Rules for every task:**

- **Never run any git command that writes** (no `git add`, `git commit`, `git tag`, `git stash`, `git checkout`, `git reset`, `git rm`, `git mv`). The user commits at each checkpoint. `git status` and `git diff` are fine.
- Use Node 22: `export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"` (or `nvm use`).
- Never name anything after the current design system. Use `ds`, `bwp`, or a descriptive word. Identifiers derived from the configured prefix (`Bwp…`, `createBwpTheme`) are data, not names.
- Generated output is deterministic: sorted declaration keys, canonical rule order, template formatting, no external formatter at generation time. Never run Prettier over `src/generated/**` or `catalogs/**`.
- Do not work around a denied command. Report it as BLOCKED.
- Never hand-edit a generated file (`src/generated/**`, `design.ir.json`, `src/index.css`, `coverage.md`, `catalogs/*.json`); regenerate it.
- Read the real source files for signatures before editing; Plan 3's code is the base and this plan shows only the regions that change.

---

## Decisions made while writing this plan

| Topic | Decision |
| --- | --- |
| Capture method | (user decision 2026-09-18) The catalog is captured in Node: `react-dom/server` `renderToStaticMarkup` under an Emotion `CacheProvider` emits `<style data-emotion="…">` tags holding the complete flattened CSS of every element MUI rendered, including nested `:hover`, `.Mui-disabled`, `::before`, and `@media` contexts. No browser. Spec 9.1's headless-Chromium capture of computed styles is not needed for the reset generator, which needs the *property set per selector context*; computed-style comparison belongs to Plan 4's rendered-parity harness. |
| Catalog home | (user decision) `packages/styles-css/catalogs/mui.json` (`<sourceRoot>/catalogs/<target>.json`). The content depends on the design system's manifests (which MUI components, which axis permutations, which slots), so it lives next to the source of truth, not in the compiler package as spec 9.1 wrote. The MUI version is recorded inside the file; one file per target. |
| Reset exceptions | (batch 3 review) `content` is reset with `none`, not `revert`: Emotion's development build throws on any unquoted `content` value outside `normal\|none\|initial\|inherit\|unset`, and for a `::before` both compute to no box. The effective-value lookup picks the applicable rule with the highest specificity (IR order breaks ties), because `compareRules` orders by axes count before states count and a 0-axis/2-state rule (specificity 3) precedes a 1-axis rule (specificity 2). Longhands whose design-system parent is atomic (`overflow-x`/`overflow-y` → `overflow`) also consult the parent. Any CSS shorthand not in `SHORTHAND_LONGHANDS` is `DS-E086`, checked against a full `KNOWN_SHORTHANDS` list rather than only the design-system tables. One design-system component per MUI component: a second mapping onto the same `Mui<Component>` is `DS-E085`. The wrapper keeps `tabIndex` and `type` as DOM props even though MUI re-declares them; `href` stays omitted because it changes MUI's root element. |
| MUI import form | (batch 5 review) The wrapper imports MUI's component as a named import from the barrel, `import { Button as MuiButton } from '@mui/material'`, not as a default import from the subpath. Under the package's CJS build, esbuild follows Node's ESM→CJS interop and binds a default import of `@mui/material/Button` to the module object, so every mapped component crashed with "Element type is invalid" for `require()` consumers. The barrel is ESM with `sideEffects: false`, so bundlers still tree-shake it. A `dist` smoke test in `styles-mui` requires the CJS bundle and imports the ESM bundle and renders `Button` through each. |
| Catalog in CI | (batch 5 review) CI runs `bwp-ds capture-defaults --target mui` after the build and includes `packages/styles-css/catalogs` in the generated-files diff, so an edited or stale committed catalog fails CI. `verify` alone cannot see an edited catalog: its round-trip recomputes the resets from the same catalog. |
| Reset keyword | `revert`, not the spec's `unset`. `unset` yields the *initial* value for non-inherited properties (`display: inline` for a button), not the user-agent default; `revert` rolls the cascaded value back to the user-agent origin, which is exactly what the plain CSS target computes on the same element when the design system sets nothing. Supported by every evergreen browser since 2020. |
| Reset algorithm | For each mapped component, each full axis permutation `P`, and each catalog rule `(media, selector, declarations)` captured for `P`: expand shorthands to longhand *names*, drop a vendor-prefixed property whose unprefixed twin is in the same rule, then for every property decide: no design-system rule applies to that element in that selector context → `revert`; a design-system rule applies and its selector specificity is **lower** than the catalog selector's → restate the design system's effective value (the applicable rule with the highest specificity, IR order breaking ties; see "Reset exceptions" for why IR order alone is not the cascade); a design-system rule of equal or higher specificity applies → emit nothing (it is emitted after the resets and wins). Resets are emitted as the leading `variants` entries with `props` = the permutation (MUI prop names), each `style` keyed by the catalog selector verbatim (wrapped in its `@media` when present), so every reset has exactly MUI's specificity and precedes every design-system variant. |
| Resets are derived, not authored | The model carries resets only inside `themeOptions.components.<MuiKey>.variants` plus a `resetCount` per component; round-trip recomputes them from IR and catalog with the same pure function and requires deep equality, then round-trips the remaining variants as Plan 3 does. A stale or edited catalog therefore fails `verify`. |
| Manifest hints | `targets.mui` gains `component` (MUI export name, PascalCase), `axisMap` (design-system axis → MUI prop; must cover every axis; every target must be an overridable union prop of that component), `slotMap` (design-system slot → MUI class key such as `startIcon`; must cover every non-root slot; the key must be rendered as an element), and `defaultProps` (extra MUI props with JSON scalar values; may not touch mapped props or the parity props). The spec's `disableDefaultVariants` is dropped: the catalog knows the default unions, so they are disabled automatically. `ignore` keeps working. `{}` still means "own component". |
| Parity default props | The generator always sets, when the MUI component has the prop, `disableRipple: true`, `disableFocusRipple: true`, `disableTouchRipple: true`, `focusRipple: false`, `disableElevation: true` (ripples add DOM and animation the design system does not have; elevation adds shadows), plus every mapped axis's default value under its MUI prop name, then the manifest's `defaultProps`. A manifest that lists a parity prop is `DS-E085`. The same effective `defaultProps` are used at capture time, so the catalog records what a consumer really gets. |
| Prop unions | For every mapped axis, the MUI overrides interface (`ButtonPropsVariantOverrides`) gets `<mui default>: false` for each default value not among the design system's values and `<ds value>: true` for each design-system value. Every *other* overridable prop of the component (`color` when no axis maps to it) gets all its defaults set to `false`, so the prop's union is `never` and it cannot be passed: what the design system does not define does not exist. |
| Typed wrapper | (user decision) `components/<Pascal>.tsx` for a mapped component is a `forwardRef` wrapper around the MUI component: props are the design system's axis props (exact unions), one boolean per attribute state (`disabled` goes to MUI's `disabled` prop; ARIA states render `aria-*` after the spread), `children` (into the `label` slot's MUI prop when the design system has a `label` slot, else MUI's `children` when the component accepts them), one `ReactNode` prop per other slot under its design-system name (translated to the MUI prop), `className`, and the root element's DOM props minus every MUI own prop name. `sx`, `classes`, `fullWidth`, `loading`, … are type errors. MUI's own component, imported from `@mui/material`, still receives the theme and the narrowed unions. |
| Slot classes | For a mapped component, the class a design-system slot rule targets is MUI's utility class (`MuiButton-startIcon`), taken from the component's `<camel>Classes` export at capture time; `specificityKey` takes the slot's class name instead of deriving it from the theme key. The `classes` constant exported by the wrapper maps design-system slot prop names to those classes. |
| Root element | The manifest's root element must equal the element MUI renders (`button` for `Button`, `div` for `Chip`), recorded at capture; a mismatch is `DS-E085`. |
| Children | If the design system has a `label` slot, it must map (via `slotMap`) to an MUI slot, and `children` fill that MUI prop. Otherwise `children` go to MUI's `children` when the component's props include `children` typed as `ReactNode`; otherwise the wrapper has no `children` prop. |
| Catalog staleness and version | `generate` (and so `verify`) fails with the new `DS-E086` when a mapped component exists and the catalog is missing, lacks the component, lacks a permutation, or recorded a different `axisMap`/`slotMap`/`defaultProps`; and when the catalog's MUI version differs from the `@mui/material` resolved from the target's `outDir` unless `--allow-catalog-mismatch` is passed (then `DS-W004`). When `@mui/material` cannot be resolved from the `outDir` (test roots), `DS-W004` says the version is unverified. Patch versions can move defaults, so the match is exact. |
| Probe facts | (batch 2 review) The rendered root element and whether the root is a ButtonBase depend on the mapping's `defaultProps` (a clickable Chip is a ButtonBase, a plain one is a `div`), so they are captured per design-system component and stored on `components.<name>` (`rootElement`, `buttonBase`), not on `frameworkComponents`; `planMapping(component, hints, framework, probe, diag)` reads them. The ripple parity props applied through `buttonBase` are exactly ButtonBase's own (`disableRipple`, `disableTouchRipple`, `focusRipple`); `disableFocusRipple` and `disableElevation` apply only when declared. A union whose members cannot be read from the types is `DS-E086` at capture; React `console.error` output during a capture render is `DS-E086` too. |
| Capture validation | Every rendered element carrying an Emotion class must be the root or a mapped slot; an MUI element no slot maps (Chip's `label` span) is `DS-E086` at capture with the class name in the message. At-rules other than `@media` (a `@keyframes` from a loading indicator) and shorthands the expansion table does not know are `DS-E086` at generation, naming the offender, so nothing is dropped silently. |
| Effective value lookup | The design system's effective value for `(slot, states, permutation, property)` is the last rule in IR order with that slot, axes contained in the permutation, states contained in the context's states, and the property declared (and not ignored). Context states come from the root compound only: `:hover`, `:active`, `:focus-visible`, `.Mui-focusVisible`, `:disabled`, `.Mui-disabled`, `.Mui-selected`, `.Mui-checked`, `.Mui-expanded`, `[aria-*="true"]`; other fragments (`.MuiButton-loading`, `::-moz-focus-inner`, `> *:nth-of-type(1)`, media) contribute no state. A selector whose subject is not the root or a mapped slot element itself (a pseudo-element, a child of a slot) has no design-system element, so every property in it is `revert`. |
| Property keys | Emotion keys: custom properties (`--variant-containedBg`) verbatim, vendor-prefixed properties PascalCase (`WebkitTapHighlightColor`, `MozAppearance`), everything else camelCase. Resets are never converted back to CSS, so no inverse is needed for them. |
| Plugin contract | `TargetPlugin<Catalog>` gains `loadCatalog?(ctx, diag): Catalog \| null` (read, validate, version-check) and `captureDefaults?(ir, ctx, diag): Promise<CapturedCatalog \| null>`; `reparse` gains the `catalog` parameter; `PluginOutput` carries `catalog`; `PluginContext` gains `allowCatalogMismatch`. `generateOutputs` loads the catalog before `generate` and drops the plugin when loading reported errors. Tailwind ignores all of it. |
| `typescript` at runtime | The compiler's `.d.ts` extraction uses the TypeScript compiler API (AST only, no type checker), so `typescript` moves from `devDependencies` to `dependencies` of the private compiler package. |
| Fixture strategy | Compiler unit tests use a hand-written catalog fixture for a fake `Button` (no MUI needed); one integration test captures the real installed MUI 9.4.0 through `packages/styles-mui`'s dependencies and pins the shape of the result. |
| Demo content | (user decision) A second starter component `button` (axes `variant: filled\|ghost`, `size: sm\|md`; states `hover`, `focus-visible`, `active`, `disabled`; slot `icon` → MUI `startIcon`; root `button`) is added to `packages/styles-css`, mapped to MUI `Button`; the catalog is captured for it and committed; `@bwp-web/styles-mui` then ships `Example` (own) and `Button` (mapped). |
| Package peer range | `framework.range` in the model stays `MUI_RANGE` (`^9.4.0`); the model gains `framework.version` = the catalog's exact version (null without a catalog). The package's `peerDependencies` range is hand-written and documented to move with the catalog. |
| Out of scope | Storybook and rendered parity (Plan 4), Flutter (Plan 5), packaging (Plan 6), `DS-E083` (still no emitter: every property is expressible in Emotion). |

---

## File structure

Compiler (`packages/ds-compiler/`):

| Path | Responsibility |
| --- | --- |
| `package.json` | `typescript` becomes a runtime dependency. |
| `src/paths.ts` | `CATALOGS_DIR = 'catalogs'`. |
| `src/errors.ts` | `DS-E086` (defaults catalog missing, stale, invalid, or mismatched), `DS-W004` (catalog version unverified). |
| `src/targets/plugin.ts` | `PluginContext.allowCatalogMismatch`; `TargetPlugin.loadCatalog?`, `captureDefaults?`; `reparse(files, ir, catalog, ctx, diag)`; `PluginOutput.catalog`; `CapturedCatalog`; `pluginContext(…, options)`. |
| `src/generate.ts` | `GenerateOptions`; `generateOutputs` loads catalogs; `generate(rootDir, ids?, options?)`. |
| `src/verify/index.ts` | `verify(rootDir, options?)`; passes `catalog` to `reparse`. |
| `src/capture.ts` | `captureDefaults(rootDir, id)`: build IR, run the plugin's capture, write `<root>/catalogs/<id>.json`. |
| `src/cli.ts` | `capture-defaults --target <id>`; `--allow-catalog-mismatch` on `generate` and `verify`. |
| `src/targets/hints.ts` | `muiHintsSchema` gains `component`, `axisMap`, `slotMap`, `defaultProps` with cross-field refinements. |
| `src/targets/mui/hints.ts` | `MuiMappingHints`, `muiMapping(component)`. |
| `src/targets/mui/catalog.ts` | Catalog types, `muiCatalogSchema`, `CATALOG_FILE`, `catalogPathFor`, `installedMuiVersion`, `loadMuiCatalog`, `findRender`, `catalogHeaderText`. |
| `src/targets/mui/mapping.ts` | `PARITY_DEFAULT_PROPS`, `MappingPlan`, `planMapping(component, frameworkComponent, diag)`: validates hints against the manifest and the catalog's framework data, computes effective `defaultProps`, children mode, own-prop list. Shared by capture and model. |
| `src/targets/mui/extract-props.ts` | `extractMuiProps(muiDir, component)`: TypeScript AST over `<Component>/<Component>.d.ts` (+ `ButtonBase` when extended): prop names, `OverridableStringUnion` members and overrides interfaces, `@default` values. |
| `src/targets/mui/capture.ts` | `captureMuiDefaults(ir, ctx, diag)`: `createRequire` from the outDir, render each permutation, parse `<style>` CSS with postcss, normalise selectors, validate the DOM, build the catalog JSON. |
| `src/targets/mui/resets.ts` | `SHORTHAND_LONGHANDS`, `parseContext`, `selectorSpecificity`, `effectiveValue`, `computeResets`. |
| `src/targets/mui/names.ts` | `muiPropertyKey` (replaces `camelProperty` for declarations), `muiThemeKeyFor(component)`, `axisPermutations`, `specificityKey(axesCount, states, rootElement, slotClass)`. |
| `src/targets/mui/model.ts` | `MuiComponentModel.kind`/`mapped`/`resetCount`; `defaultProps` on theme entries; nested media keys in variant styles; `componentModel(component, prefix, catalog, diag)`; `buildMuiModel(ir, catalog, ctx, diag)`; `framework.version`. |
| `src/targets/mui/render-ts.ts` | Augmentation: `declare module '@mui/material/<Component>'` blocks with overrides interfaces. |
| `src/targets/mui/render-component.ts` | `renderMappedComponentTsx`; `renderComponentTsx` dispatches on `kind`; `renderTypecheckTsx` adds the mapped probes. |
| `src/targets/mui/generate.ts` | Passes the catalog through. |
| `src/targets/mui/reparse.ts` | Theme-key lookup via model metadata, `defaultProps` check, reset prefix check, slot classes from the model. |
| `src/targets/mui/index.ts` | `loadCatalog`, `captureDefaults`. |
| `src/index.ts` | Exports for the new modules. |
| `schemas/manifest.schema.json` | Regenerated (`npm run schema`). |
| Tests | New: `test/mui-mapped-fixture.ts`, `test/mui-catalog.test.ts`, `test/mui-mapping.test.ts`, `test/mui-extract-props.test.ts`, `test/mui-capture.test.ts`, `test/mui-resets.test.ts`. Updated: `tailwind-fixture.ts` (`allowCatalogMismatch` in `twContext`), `mui-names`, `mui-model`, `mui-generate`, `mui-roundtrip`, `targets-hints`, `errors`, `cli`, `verify`, `tailwind-roundtrip` (reparse signature). |

Package `packages/styles-mui/`: `test/theme.test.ts` and `test/render.test.tsx` gain mapped-component assertions; `README.md` documents mapped components; generated `src/generated/**` gains `components/Button.tsx` and the augmentation blocks.

Repo: `packages/styles-css/src/components/button/{button.manifest.json,button.css}` (new starter component), `packages/styles-css/catalogs/mui.json` (captured), `packages/styles-css/package.json` (`files` gains `catalogs`), `packages/styles-css/.prettierignore` and root `.prettierignore` (`catalogs/`), regenerated `design.ir.json`, `src/index.css`, Tailwind and MUI output, `docs/design-system/coverage.md`; docs `docs/design-system/targets/mui.md`, `errors.md`, `verification.md`, `authoring-guide.md`, `AGENTS.md`, root `README.md`.

---

## Batches

| Batch | Tasks | Milestone |
| --- | --- | --- |
| 1 | 1, 2 | Contract, catalog module, hints, names, error codes; everything still generates as before. |
| 2 | 3, 4 | `.d.ts` extraction and the capture command; a real catalog can be produced. |
| 3 | 5, 6 | Resets and the mapped model, augmentation, wrapper, typecheck probes. |
| 4 | 7 | Round-trip for mapped components; tamper matrix. |
| 5 | 8 | Starter `button`, captured catalog, regenerated output, package tests, docs. |
| 6 | 9 | Final verification. |

Pause after every batch for the user's review and commit.

---

## Task 1: Plugin contract, catalog module, error codes, CLI flags

**Files:**
- Modify: `packages/ds-compiler/package.json` (move `typescript` to `dependencies`)
- Modify: `packages/ds-compiler/src/paths.ts`
- Modify: `packages/ds-compiler/src/errors.ts`
- Modify: `packages/ds-compiler/src/targets/plugin.ts`
- Modify: `packages/ds-compiler/src/generate.ts`
- Modify: `packages/ds-compiler/src/verify/index.ts`
- Modify: `packages/ds-compiler/src/targets/tailwind/index.ts`, `src/targets/mui/index.ts` (reparse signature)
- Create: `packages/ds-compiler/src/targets/mui/framework.ts`
- Create: `packages/ds-compiler/src/targets/mui/catalog.ts`
- Create: `packages/ds-compiler/src/capture.ts`
- Modify: `packages/ds-compiler/src/cli.ts`
- Modify: `packages/ds-compiler/src/index.ts`
- Create: `packages/ds-compiler/test/mui-mapped-fixture.ts` (catalog fixture; component files arrive in Task 2)
- Create: `packages/ds-compiler/test/mui-catalog.test.ts`
- Modify: `packages/ds-compiler/test/tailwind-fixture.ts` (`twContext` gains `allowCatalogMismatch: false`), `test/verify.test.ts`, `test/cli.test.ts`, `test/errors.test.ts`, `test/tailwind-roundtrip.test.ts`, `test/mui-roundtrip.test.ts` (reparse signature)

- [ ] **Step 1: Runtime `typescript`, paths, error codes**

In `packages/ds-compiler/package.json` move `"typescript": "^5.9.2"` from `devDependencies` into `dependencies` (keep the same range; run `npm install` from the repo root afterwards so `package-lock.json` follows). tsup externalises dependencies, so the bundle does not change.

`src/paths.ts`, append:

```ts
/** Committed defaults catalogs, one `<target>.json` per opinionated target, written by `bwp-ds capture-defaults`. */
export const CATALOGS_DIR = 'catalogs';
```

`src/errors.ts`, after `'DS-E085'`:

```ts
  'DS-E086': {
    title: 'Defaults catalog missing, stale, invalid, or mismatched',
    hint: 'Run bwp-ds capture-defaults --target <id> with the framework installed in the target package, then commit catalogs/<id>.json. If the installed framework version differs on purpose, pass --allow-catalog-mismatch to generate and verify.',
  },
```

after `'DS-W003'`:

```ts
  'DS-W004': {
    title: 'Defaults catalog version unverified',
    hint: 'The target framework could not be resolved from the target outDir, or a version mismatch was allowed with --allow-catalog-mismatch. Install the target package dependencies, or re-capture the catalog after a framework upgrade.',
  },
```

`test/errors.test.ts` enumerates the catalog; extend whatever list it asserts (codes, ranges) with `DS-E086` and `DS-W004`, and add one assertion that `DS-W004` is a warning:

```ts
  it('DS-W004 is a warning', () => {
    const diag = new Diagnostics();
    diag.add('DS-W004', 'x');
    expect(diag.warnings).toHaveLength(1);
    expect(diag.errors).toHaveLength(0);
  });
```

- [ ] **Step 2: The plugin contract**

`src/targets/plugin.ts`: replace `PluginContext`, `TargetPlugin`, `PluginOutput`, and `pluginContext` with:

```ts
export interface PluginContext {
  /** Absolute path of the source root (the directory holding ds.config.json). */
  rootDir: string;
  config: DsConfig;
  compilerVersion: string;
  /** Absolute path where this target's files are written. */
  outDir: string;
  /** `--allow-catalog-mismatch`: a catalog captured from another framework version is DS-W004, not DS-E086. */
  allowCatalogMismatch: boolean;
}

/** What `captureDefaults` returns: the catalog file to write, absolute path. */
export interface CapturedCatalog {
  path: string;
  contents: string;
}

export interface TargetPlugin<Catalog = unknown> {
  id: string;
  /**
   * Reads and validates this target's committed defaults catalog. Returns
   * null (without diagnostics) when the target has no catalog or the file
   * is absent; reports DS-E086 (and returns null) for an invalid or
   * mismatched one, DS-W004 for an unverifiable version.
   */
  loadCatalog?(ctx: PluginContext, diag: Diagnostics): Catalog | null;
  /**
   * Renders the framework's default styling for every mapped component and
   * returns the catalog file to write; null after reporting on `diag`.
   * Only opinionated targets implement it.
   */
  captureDefaults?(
    ir: DesignIR,
    ctx: PluginContext,
    diag: Diagnostics,
  ): Promise<CapturedCatalog | null>;
  /**
   * Pure function of its inputs; byte-identical output across machines.
   * Reports coded errors on `diag` (nothing is written when it does) rather
   * than throwing.
   */
  generate(
    ir: DesignIR,
    catalog: Catalog | null,
    ctx: PluginContext,
    diag: Diagnostics,
  ): GeneratedFile[];
  /** Parses generated output back into an IR for round-trip comparison. Reports problems on `diag` and returns null when it cannot produce an IR. */
  reparse(
    files: GeneratedFile[],
    ir: DesignIR,
    catalog: Catalog | null,
    ctx: PluginContext,
    diag: Diagnostics,
  ): DesignIR | null;
  coverage(ir: DesignIR): CoverageEntry[];
  /** True when the manifest maps this component to the target (an entry exists and is not excluded). */
  isMapped(component: ComponentIR): boolean;
  /** Properties the manifest tells this target to ignore for the component. */
  ignoredProperties(component: ComponentIR): ReadonlySet<string>;
}

/** One plugin's generation result, produced by `generateOutputs`. */
export interface PluginOutput {
  plugin: TargetPlugin;
  ctx: PluginContext;
  /** The catalog `generate` received, for `reparse`. */
  catalog: unknown;
  files: GeneratedFile[];
}

export interface PluginContextOptions {
  allowCatalogMismatch?: boolean;
}

export function pluginContext(
  rootDir: string,
  config: DsConfig,
  compilerVersion: string,
  id: string,
  options: PluginContextOptions = {},
): PluginContext {
  return {
    rootDir,
    config,
    compilerVersion,
    outDir: outDirFor(rootDir, config, id),
    allowCatalogMismatch: options.allowCatalogMismatch ?? false,
  };
}
```

`src/targets/tailwind/index.ts`: `reparse: (files, ir, _catalog, ctx, diag) => reparseTailwind(files, ir, ctx, diag),`. `src/targets/mui/index.ts`: `reparse: (files, ir, _catalog, ctx, diag) => reparseMui(files, ir, ctx, diag),` (Task 7 makes the MUI reparser take the catalog).

`test/tailwind-fixture.ts` `twContext`: add `allowCatalogMismatch: false,`. Every test that calls `plugin.reparse(files, ir, ctx, diag)` (`tailwind-roundtrip.test.ts`, `mui-roundtrip.test.ts`) becomes `plugin.reparse(files, ir, null, ctx, diag)`.

- [ ] **Step 3: `generateOutputs` loads catalogs; `generate` and `verify` take options**

`src/generate.ts`:

```ts
export interface GenerateOptions {
  /** A catalog captured from another framework version is a warning, not an error. */
  allowCatalogMismatch?: boolean;
}

/**
 * Runs every plugin's `loadCatalog` (when it has one) and `generate` once.
 * A plugin that reports errors while loading its catalog or generating is
 * left out of the result, so callers never write or compare its output.
 */
export function generateOutputs(
  rootDir: string,
  ir: DesignIR,
  config: DsConfig,
  plugins: readonly TargetPlugin[],
  compilerVersion: string,
  diag: Diagnostics,
  options: GenerateOptions = {},
): PluginOutput[] {
  const outputs: PluginOutput[] = [];
  for (const plugin of plugins) {
    const ctx = pluginContext(rootDir, config, compilerVersion, plugin.id, options);
    const before = diag.errors.length;
    const catalog = plugin.loadCatalog ? plugin.loadCatalog(ctx, diag) : null;
    if (diag.errors.length > before) {
      continue;
    }
    const files = plugin.generate(ir, catalog, ctx, diag);
    if (diag.errors.length === before) {
      outputs.push({ plugin, ctx, catalog, files });
    }
  }
  return outputs;
}

export function generate(
  rootDir: string,
  ids: readonly string[] = targetIds(),
  options: GenerateOptions = {},
): GenerateResult {
```

and pass `options` into the `generateOutputs` call inside `generate`. Update the doc comment of `generate` to say "Nothing is written when the IR has errors, when a catalog fails to load, or when any plugin reports a generation error."

`src/verify/index.ts`: `export function verify(rootDir: string, options: GenerateOptions = {}): VerifyResult`, pass `options` to `generateOutputs`, and in the round-trip loop destructure `catalog` and call `plugin.reparse(files, ir, catalog, ctx, diag)`. Import `GenerateOptions` as a type from `../generate.js`.

- [ ] **Step 4: Framework constants and the catalog module**

Create `src/targets/mui/framework.ts` (moved out of `model.ts` so `catalog.ts` and `model.ts` do not import each other's values):

```ts
export const MUI_PACKAGE = '@mui/material';
/** The MUI range the generated package peer-depends on. Moves with the captured catalog's major.minor. */
export const MUI_RANGE = '^9.4.0';
```

In `src/targets/mui/model.ts` delete the two constants and add `export { MUI_PACKAGE, MUI_RANGE } from './framework.js';` plus `import { MUI_PACKAGE, MUI_RANGE } from './framework.js';` for local use.

Create `src/targets/mui/catalog.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { z } from 'zod';
import type { Diagnostics, SourceLocation } from '../../errors.js';
import { stableStringify } from '../../ir/serialize.js';
import { CATALOGS_DIR } from '../../paths.js';
import type { PluginContext } from '../plugin.js';
import { MUI_PACKAGE } from './framework.js';
import { MUI_ID } from './hints.js';

export const CATALOG_FILE = `${MUI_ID}.json`;
export const CATALOG_AT: SourceLocation = {
  file: `${CATALOGS_DIR}/${CATALOG_FILE}`,
  line: 1,
  column: 1,
};

export function catalogPathFor(rootDir: string): string {
  return join(rootDir, CATALOGS_DIR, CATALOG_FILE);
}

/** One flattened CSS rule MUI emitted, relative to the rendered element: `&` is the root, `& .MuiButton-startIcon` a slot. */
export interface MuiCatalogRule {
  /** `@media` params (`(hover: hover)`), or null at the top level. */
  media: string | null;
  selector: string;
  /** Property (as emitted, kebab-case, vendor prefixes and shorthands intact) to value text. */
  declarations: Record<string, string>;
}

/** The rules captured for one full assignment of the design system's axes. */
export interface MuiCatalogRender {
  axes: Record<string, string>;
  rules: MuiCatalogRule[];
}

export type MuiCatalogScalar = string | number | boolean;

export interface MuiCatalogProp {
  /** `union`: an `OverridableStringUnion` prop; `other`: anything else. */
  kind: 'union' | 'other';
  /** The declared type text, for messages and the children check. */
  type: string;
  /** The `@default` JSDoc value without quotes, or null. */
  default: string | null;
  /** `union` only: MUI's default members and the overrides interface to augment. */
  values?: string[];
  overrides?: string;
}

/** Facts about one MUI component, independent of the design system. */
export interface MuiFrameworkComponent {
  rootElement: string;
  themeKey: string;
  /** `<camel>Classes` keys to class names: `startIcon` → `MuiButton-startIcon`. */
  classes: Record<string, string>;
  /** Every own prop (including ButtonBase's when the component extends it). */
  props: Record<string, MuiCatalogProp>;
}

/** What was rendered for one design-system component. */
export interface MuiCatalogComponent {
  component: string;
  axisMap: Record<string, string>;
  slotMap: Record<string, string>;
  defaultProps: Record<string, MuiCatalogScalar>;
  renders: MuiCatalogRender[];
}

export interface MuiCatalog {
  generated: string;
  framework: { name: typeof MUI_PACKAGE; version: string };
  frameworkComponents: Record<string, MuiFrameworkComponent>;
  /** By design-system component name. */
  components: Record<string, MuiCatalogComponent>;
}

const scalar = z.union([z.string(), z.number(), z.boolean()]);
const stringRecord = z.record(z.string(), z.string());

export const muiCatalogSchema = z.strictObject({
  generated: z.string(),
  framework: z.strictObject({
    name: z.literal(MUI_PACKAGE),
    version: z.string().regex(/^\d+\.\d+\.\d+/),
  }),
  frameworkComponents: z.record(
    z.string(),
    z.strictObject({
      rootElement: z.string(),
      themeKey: z.string(),
      classes: stringRecord,
      props: z.record(
        z.string(),
        z.strictObject({
          kind: z.enum(['union', 'other']),
          type: z.string(),
          default: z.string().nullable(),
          values: z.array(z.string()).optional(),
          overrides: z.string().optional(),
        }),
      ),
    }),
  ),
  components: z.record(
    z.string(),
    z.strictObject({
      component: z.string(),
      axisMap: stringRecord,
      slotMap: stringRecord,
      defaultProps: z.record(z.string(), scalar),
      renders: z.array(
        z.strictObject({
          axes: stringRecord,
          rules: z.array(
            z.strictObject({
              media: z.string().nullable(),
              selector: z.string(),
              declarations: stringRecord,
            }),
          ),
        }),
      ),
    }),
  ),
});

export function catalogHeaderText(
  compilerVersion: string,
  muiVersion: string,
): string {
  return `Captured by @bwp-web/ds-compiler ${compilerVersion} for target mui from ${MUI_PACKAGE} ${muiVersion}. Do not edit; run bwp-ds capture-defaults --target mui.`;
}

/** The `@mui/material` version resolvable from `outDir` (the target package), or null. */
export function installedMuiVersion(outDir: string): string | null {
  try {
    const req = createRequire(join(outDir, 'resolve.cjs'));
    const pkg = JSON.parse(
      readFileSync(req.resolve(`${MUI_PACKAGE}/package.json`), 'utf8'),
    ) as { version?: unknown };
    return typeof pkg.version === 'string' ? pkg.version : null;
  } catch {
    return null;
  }
}

/**
 * Reads `catalogs/mui.json`. Absent file: null, no diagnostic (the model
 * reports DS-E086 only when a mapped component needs it). Invalid JSON or
 * shape: DS-E086 and null. Version differing from the installed
 * `@mui/material`: DS-E086 and null, or DS-W004 with
 * `allowCatalogMismatch`. Unresolvable `@mui/material`: DS-W004.
 */
export function loadMuiCatalog(
  ctx: PluginContext,
  diag: Diagnostics,
): MuiCatalog | null {
  const path = catalogPathFor(ctx.rootDir);
  if (!existsSync(path)) {
    return null;
  }
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    diag.add(
      'DS-E086',
      `mui: ${CATALOG_AT.file} is not valid JSON: ${(err as Error).message}`,
      CATALOG_AT,
    );
    return null;
  }
  const checked = muiCatalogSchema.safeParse(json);
  if (!checked.success) {
    const issues = checked.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    diag.add(
      'DS-E086',
      `mui: ${CATALOG_AT.file} does not match the catalog schema: ${issues}`,
      CATALOG_AT,
    );
    return null;
  }
  const catalog = checked.data as MuiCatalog;
  const installed = installedMuiVersion(ctx.outDir);
  if (installed === null) {
    diag.add(
      'DS-W004',
      `mui: ${MUI_PACKAGE} could not be resolved from ${ctx.outDir}; the catalog's version ${catalog.framework.version} is unverified`,
      CATALOG_AT,
    );
  } else if (installed !== catalog.framework.version) {
    const text = `mui: catalog captured from ${MUI_PACKAGE} ${catalog.framework.version} but ${installed} is installed`;
    if (ctx.allowCatalogMismatch) {
      diag.add('DS-W004', `${text}; accepted by --allow-catalog-mismatch`, CATALOG_AT);
    } else {
      diag.add(
        'DS-E086',
        `${text}; run bwp-ds capture-defaults --target mui`,
        CATALOG_AT,
      );
      return null;
    }
  }
  return catalog;
}

/** The render for exactly these axis values, or null. */
export function findRender(
  component: MuiCatalogComponent,
  axes: Record<string, string>,
): MuiCatalogRender | null {
  const key = stableStringify(axes);
  return component.renders.find((r) => stableStringify(r.axes) === key) ?? null;
}
```

- [ ] **Step 5: `captureDefaults` orchestration and the CLI**

Create `src/capture.ts`:

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildIR } from './build.js';
import type { Diagnostics } from './errors.js';
import { UnknownTargetError } from './generate.js';
import { getTarget, targetIds } from './targets/index.js';
import { pluginContext } from './targets/plugin.js';
import { COMPILER_VERSION } from './version.js';

export interface CaptureResult {
  diagnostics: Diagnostics;
  /** Absolute path of the written catalog, or null when nothing was written. */
  written: string | null;
}

/** The target exists but has no defaults catalog (it is not an opinionated framework). */
export class NoCatalogTargetError extends Error {}

/**
 * Builds the IR (lint must be clean), runs the target's `captureDefaults`,
 * and writes `<rootDir>/catalogs/<id>.json`. Nothing is written when any
 * error was reported.
 */
export async function captureDefaults(
  rootDir: string,
  id: string,
): Promise<CaptureResult> {
  const plugin = getTarget(id);
  if (!plugin) {
    throw new UnknownTargetError(
      `unknown target "${id}"; registered targets: ${targetIds().join(', ') || '(none)'}`,
    );
  }
  if (!plugin.captureDefaults) {
    throw new NoCatalogTargetError(
      `target "${id}" has no defaults catalog; only opinionated targets capture defaults`,
    );
  }
  const result = buildIR(rootDir);
  const diag = result.diagnostics;
  if (!result.ir || !result.config || diag.hasErrors()) {
    return { diagnostics: diag, written: null };
  }
  const ctx = pluginContext(rootDir, result.config, COMPILER_VERSION, id);
  const captured = await plugin.captureDefaults(result.ir, ctx, diag);
  if (!captured || diag.hasErrors()) {
    return { diagnostics: diag, written: null };
  }
  mkdirSync(dirname(captured.path), { recursive: true });
  writeFileSync(captured.path, captured.contents);
  return { diagnostics: diag, written: captured.path };
}
```

`src/cli.ts`: import `captureDefaults, NoCatalogTargetError` from `./capture.js`. Add to the `generate` command `.option('--allow-catalog-mismatch', 'accept a defaults catalog captured from another framework version (DS-W004 instead of DS-E086)', false)` and call `generate(root, targets, { allowCatalogMismatch: opts.allowCatalogMismatch })` (the action's `opts` type gains `allowCatalogMismatch: boolean`). Same option on `verify`, passed as `verify(root, { allowCatalogMismatch: opts.allowCatalogMismatch })`. Add the new command after `verify`:

```ts
program
  .command('capture-defaults')
  .description(
    "Render the target framework's default styling for every mapped component and write catalogs/<id>.json",
  )
  .requiredOption('--target <id>', 'target id (mui)')
  .action(async (opts: { target: string }) => {
    const { root, json } = globals();
    let result;
    try {
      result = await captureDefaults(root, opts.target);
    } catch (err) {
      if (
        err instanceof UnknownTargetError ||
        err instanceof NoCatalogTargetError
      ) {
        commandFailure(err.message, json);
        return;
      }
      throw err;
    }
    printDiagnostics(result.diagnostics, json, {
      wrote: result.written ?? '',
    });
    process.exitCode = result.diagnostics.hasErrors() ? 1 : 0;
  });
```

`src/index.ts`: export `captureDefaults`, `NoCatalogTargetError`, `CaptureResult` from `./capture.js`; `GenerateOptions` from `./generate.js`; `CapturedCatalog`, `PluginContextOptions` from `./targets/plugin.js`; `CATALOGS_DIR` from `./paths.js`; and from `./targets/mui/catalog.js`: `loadMuiCatalog`, `installedMuiVersion`, `catalogPathFor`, `findRender`, `catalogHeaderText`, `muiCatalogSchema`, `CATALOG_FILE`, and the types `MuiCatalog`, `MuiCatalogComponent`, `MuiCatalogRender`, `MuiCatalogRule`, `MuiCatalogProp`, `MuiFrameworkComponent`, `MuiCatalogScalar`.

- [ ] **Step 6: The catalog fixture**

Create `test/mui-mapped-fixture.ts` (Task 2 adds `BTN_FILES` to it):

```ts
import type { MuiCatalog } from '../src/targets/mui/catalog.js';

/** MUI's Button as a fake `@mui/material` 9.4.0 would render it for the `btn` fixture: enough rules to exercise every reset case. */
const BTN_RULES = [
  {
    media: null,
    selector: '&',
    declarations: {
      color: 'inherit',
      'min-width': '64px',
      padding: '6px 16px',
      'text-transform': 'uppercase',
      '-webkit-transition': 'color 250ms',
      transition: 'color 250ms',
      '-webkit-tap-highlight-color': 'transparent',
    },
  },
  {
    media: null,
    selector: '&:hover',
    declarations: { 'text-decoration': 'none' },
  },
  {
    media: null,
    selector: '&.Mui-disabled',
    declarations: { color: 'gray', cursor: 'default', 'pointer-events': 'none' },
  },
  {
    media: '(hover: hover)',
    selector: '&:hover',
    declarations: { '--variant-containedBg': 'blue' },
  },
  {
    media: null,
    selector: '& .MuiButton-startIcon',
    declarations: { display: 'inherit', 'margin-right': '8px' },
  },
  {
    media: null,
    selector: '& .MuiButton-startIcon::before',
    declarations: { content: '"\\200b"' },
  },
];

const other = (type: string, dflt: string | null = null) => ({
  kind: 'other' as const,
  type,
  default: dflt,
});

export const FX_CATALOG: MuiCatalog = {
  generated: 'test catalog',
  framework: { name: '@mui/material', version: '9.4.0' },
  frameworkComponents: {
    Button: {
      rootElement: 'button',
      themeKey: 'MuiButton',
      classes: {
        root: 'MuiButton-root',
        text: 'MuiButton-text',
        startIcon: 'MuiButton-startIcon',
        endIcon: 'MuiButton-endIcon',
        disabled: 'Mui-disabled',
      },
      props: {
        children: other('React.ReactNode'),
        classes: other('Partial<ButtonClasses> | undefined'),
        color: {
          kind: 'union',
          type: "OverridableStringUnion<'inherit' | 'primary', ButtonPropsColorOverrides> | undefined",
          default: 'primary',
          values: ['inherit', 'primary'],
          overrides: 'ButtonPropsColorOverrides',
        },
        disabled: other('boolean | undefined', 'false'),
        disableElevation: other('boolean | undefined', 'false'),
        disableFocusRipple: other('boolean | undefined', 'false'),
        disableRipple: other('boolean | undefined', 'false'),
        disableTouchRipple: other('boolean | undefined', 'false'),
        endIcon: other('React.ReactNode'),
        focusRipple: other('boolean | undefined', 'false'),
        fullWidth: other('boolean | undefined', 'false'),
        href: other('string | undefined'),
        size: {
          kind: 'union',
          type: "OverridableStringUnion<'small' | 'medium' | 'large', ButtonPropsSizeOverrides> | undefined",
          default: 'medium',
          values: ['small', 'medium', 'large'],
          overrides: 'ButtonPropsSizeOverrides',
        },
        startIcon: other('React.ReactNode'),
        sx: other('SxProps<Theme> | undefined'),
        variant: {
          kind: 'union',
          type: "OverridableStringUnion<'text' | 'outlined' | 'contained', ButtonPropsVariantOverrides> | undefined",
          default: 'text',
          values: ['text', 'outlined', 'contained'],
          overrides: 'ButtonPropsVariantOverrides',
        },
      },
    },
  },
  components: {
    btn: {
      component: 'Button',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'startIcon' },
      defaultProps: {
        disableElevation: true,
        disableFocusRipple: true,
        disableRipple: true,
        disableTouchRipple: true,
        focusRipple: false,
        variant: 'quiet',
      },
      renders: [
        { axes: { tone: 'quiet' }, rules: BTN_RULES },
        { axes: { tone: 'loud' }, rules: BTN_RULES },
      ],
    },
  },
};

/** The fixture catalog as the file `bwp-ds` would read. */
export function catalogFile(catalog: MuiCatalog = FX_CATALOG): Record<string, string> {
  return { 'catalogs/mui.json': `${JSON.stringify(catalog, null, 2)}\n` };
}
```

- [ ] **Step 7: Tests for the catalog module, orchestration, and CLI**

Create `test/mui-catalog.test.ts`:

```ts
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import {
  catalogPathFor,
  findRender,
  installedMuiVersion,
  loadMuiCatalog,
  muiCatalogSchema,
} from '../src/targets/mui/catalog.js';
import { FX_CATALOG, catalogFile } from './mui-mapped-fixture.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

/** The real styles-mui output directory: `@mui/material` resolves from here through the workspace install. */
const REAL_OUT_DIR = fileURLToPath(
  new URL('../../styles-mui/src/generated/', import.meta.url),
);

function ctxFor(root: string, allow = false) {
  const { config } = twBuild(root);
  return { ...twContext(root, config), allowCatalogMismatch: allow };
}

describe('mui catalog', () => {
  it('is absent without diagnostics when the file does not exist', () => {
    const root = twRoot();
    const diag = new Diagnostics();
    expect(loadMuiCatalog(ctxFor(root), diag)).toBeNull();
    expect(diag.items).toEqual([]);
    expect(catalogPathFor(root)).toBe(join(root, 'catalogs', 'mui.json'));
  });

  it('accepts the fixture and warns DS-W004 when @mui/material cannot be resolved from the outDir', () => {
    const root = twRoot(catalogFile());
    const diag = new Diagnostics();
    const catalog = loadMuiCatalog(ctxFor(root), diag);
    expect(catalog?.framework.version).toBe('9.4.0');
    expect(diag.errors).toEqual([]);
    expect(diag.warnings.map((w) => w.code)).toEqual(['DS-W004']);
    expect(diag.warnings[0].message).toContain('unverified');
    expect(muiCatalogSchema.safeParse(FX_CATALOG).success).toBe(true);
  });

  it('rejects invalid JSON and a wrong shape with DS-E086', () => {
    const bad = twRoot({ 'catalogs/mui.json': '{ nope' });
    const diag = new Diagnostics();
    expect(loadMuiCatalog(ctxFor(bad), diag)).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].location?.file).toBe('catalogs/mui.json');

    const wrong = twRoot({
      'catalogs/mui.json': JSON.stringify({ ...FX_CATALOG, components: 3 }),
    });
    const diag2 = new Diagnostics();
    expect(loadMuiCatalog(ctxFor(wrong), diag2)).toBeNull();
    expect(diag2.errors[0].message).toContain('does not match the catalog schema');
  });

  it('resolves the installed @mui/material from the real styles-mui outDir', () => {
    expect(installedMuiVersion(REAL_OUT_DIR)).toMatch(/^9\.4\.\d+/);
    expect(installedMuiVersion('/nonexistent/dir')).toBeNull();
  });

  it('fails DS-E086 on a version mismatch unless --allow-catalog-mismatch makes it DS-W004', () => {
    const root = twRoot(
      catalogFile({
        ...FX_CATALOG,
        framework: { name: '@mui/material', version: '0.0.1' },
      }),
    );
    const strict = { ...ctxFor(root), outDir: REAL_OUT_DIR };
    const diag = new Diagnostics();
    expect(loadMuiCatalog(strict, diag)).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toMatch(/captured from @mui\/material 0\.0\.1 but 9\.4\.\d+ is installed/);

    const lenient = { ...ctxFor(root, true), outDir: REAL_OUT_DIR };
    const diag2 = new Diagnostics();
    expect(loadMuiCatalog(lenient, diag2)).not.toBeNull();
    expect(diag2.errors).toEqual([]);
    expect(diag2.warnings.map((w) => w.code)).toEqual(['DS-W004']);
  });

  it('finds a render by exact axes', () => {
    const btn = FX_CATALOG.components.btn;
    expect(findRender(btn, { tone: 'loud' })?.axes).toEqual({ tone: 'loud' });
    expect(findRender(btn, { tone: 'shout' })).toBeNull();
    expect(findRender(btn, {})).toBeNull();
  });
});
```

`test/verify.test.ts`, add to the `generate` describe block:

```ts
  it('generateOutputs hands each plugin its loaded catalog and drops a plugin whose catalog fails to load', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const seen: unknown[] = [];
    const loaded = { version: 'x' };
    const fine: TargetPlugin = {
      id: 'fine',
      loadCatalog: () => loaded,
      generate: (_ir, catalog) => {
        seen.push(catalog);
        return [{ path: 'a.txt', contents: 'a' }];
      },
      reparse: () => null,
      coverage: () => [],
      isMapped: () => false,
      ignoredProperties: () => new Set(),
    };
    let generated = false;
    const broken: TargetPlugin = {
      ...fine,
      id: 'broken',
      loadCatalog: (_ctx, diag) => {
        diag.add('DS-E086', 'broken: no');
        return null;
      },
      generate: () => {
        generated = true;
        return [];
      },
    };
    const diag = new Diagnostics();
    const outputs = generateOutputs(root, ir, config, [fine, broken], '0.0.0-test', diag);
    expect(seen).toEqual([loaded]);
    expect(outputs.map((o) => o.plugin.id)).toEqual(['fine']);
    expect(outputs[0].catalog).toBe(loaded);
    expect(generated).toBe(false);
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
  });

  it('threads allowCatalogMismatch into every plugin context', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const flags: boolean[] = [];
    const probe: TargetPlugin = {
      id: 'probe',
      generate: (_ir, _catalog, ctx) => {
        flags.push(ctx.allowCatalogMismatch);
        return [];
      },
      reparse: () => null,
      coverage: () => [],
      isMapped: () => false,
      ignoredProperties: () => new Set(),
    };
    generateOutputs(root, ir, config, [probe], '0.0.0-test', new Diagnostics());
    generateOutputs(root, ir, config, [probe], '0.0.0-test', new Diagnostics(), {
      allowCatalogMismatch: true,
    });
    expect(flags).toEqual([false, true]);
  });
```

`test/cli.test.ts`, add:

```ts
  it('capture-defaults requires --target and rejects targets without a catalog', () => {
    const root = twRoot();
    expect(run(['capture-defaults', '--root', root]).code).toBe(1);
    const tw = run(['capture-defaults', '--root', root, '--target', 'tailwind']);
    expect(tw.code).toBe(1);
    expect(tw.stderr).toContain('has no defaults catalog');
    const unknown = run(['capture-defaults', '--root', root, '--target', 'nope', '--json']);
    expect(unknown.code).toBe(1);
    expect(JSON.parse(unknown.stdout)).toEqual({
      error: expect.stringContaining('unknown target "nope"'),
    });
  });

  it('generate and verify accept --allow-catalog-mismatch', () => {
    const root = twRoot();
    expect(run(['build', '--root', root]).code).toBe(0);
    expect(run(['generate', '--root', root, '--allow-catalog-mismatch']).code).toBe(0);
    expect(run(['verify', '--root', root, '--allow-catalog-mismatch']).code).toBe(0);
  });
```

(Until Task 4 adds `captureDefaults` to the MUI plugin, `--target mui` also reports "has no defaults catalog"; Task 4 changes that assertion.)

- [ ] **Step 8: Run the compiler suite, typecheck, lint, format**

```bash
cd packages/ds-compiler && npx vitest run && npx tsc --noEmit && npx eslint && npx prettier --check . --ignore-path ../../.gitignore --ignore-path .prettierignore
```

Expected: all green. Then from the repo root `npm run build` (the compiler's bin is what `styles-css` and `styles-mui` scripts use) and `npm run verify` still pass: no catalog exists yet, no component is mapped onto an MUI component, output is byte-identical to before.

---

## Task 2: Manifest hints, mapping plan, names

**Files:**
- Modify: `packages/ds-compiler/src/targets/hints.ts`
- Modify: `packages/ds-compiler/src/targets/mui/hints.ts`
- Modify: `packages/ds-compiler/src/targets/mui/names.ts`
- Create: `packages/ds-compiler/src/targets/mui/mapping.ts`
- Modify: `packages/ds-compiler/src/targets/mui/model.ts`, `src/targets/mui/reparse.ts` (call sites of `specificityKey`, `camelProperty`)
- Modify: `packages/ds-compiler/schemas/manifest.schema.json` (regenerated with `npm run schema`)
- Modify: `packages/ds-compiler/src/index.ts`
- Modify: `packages/ds-compiler/test/mui-mapped-fixture.ts` (add `BTN_FILES`)
- Test: `packages/ds-compiler/test/targets-hints.test.ts`, `test/mui-names.test.ts`, new `test/mui-mapping.test.ts`

- [ ] **Step 1: Hints schema**

`src/targets/hints.ts`: replace `muiHintsSchema` with:

```ts
const muiPropName = z
  .string()
  .regex(/^[a-zA-Z][A-Za-z0-9]*$/, 'must be an MUI prop or class key');
const muiComponentName = z
  .string()
  .regex(
    /^[A-Z][A-Za-z0-9]*$/,
    'must be the PascalCase export name of an MUI component (e.g. Button)',
  );
const dsName = z.string().regex(IDENTIFIER_PATTERN, 'must be kebab-case');
const jsonScalar = z.union([z.string(), z.number(), z.boolean()]);

/**
 * `targets.mui` hints. `{}` generates an own React component. `component`
 * maps the design-system component onto that MUI component: `axisMap`
 * (axis → MUI prop, every axis), `slotMap` (slot → MUI class key such as
 * `startIcon`, every non-root slot), `defaultProps` (extra MUI props). The
 * catalog (`bwp-ds capture-defaults --target mui`) validates the names.
 */
export const muiHintsSchema = z
  .strictObject({
    ignore: ignoreList,
    component: muiComponentName.optional(),
    axisMap: z.record(dsName, muiPropName).optional(),
    slotMap: z.record(dsName, muiPropName).optional(),
    defaultProps: z.record(muiPropName, jsonScalar).optional(),
  })
  .superRefine((hints, ctx) => {
    if (hints.component !== undefined) {
      return;
    }
    for (const key of ['axisMap', 'slotMap', 'defaultProps'] as const) {
      if (hints[key] !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: 'requires "component"',
        });
      }
    }
  });
```

Run `npm run schema` in `packages/ds-compiler` to regenerate `schemas/manifest.schema.json` (do not hand-edit it). Check `git diff --stat schemas/` shows only that file.

`test/targets-hints.test.ts`, add:

```ts
  it('mui hints accept a mapping onto an MUI component and require component for the map keys', () => {
    expect(muiHintsSchema.safeParse({}).success).toBe(true);
    expect(
      muiHintsSchema.safeParse({
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { fullWidth: false, href: '#', tabIndex: 0 },
        ignore: ['opacity'],
      }).success,
    ).toBe(true);
    const orphan = muiHintsSchema.safeParse({ axisMap: { tone: 'variant' } });
    expect(orphan.success).toBe(false);
    expect(JSON.stringify(orphan.error?.issues)).toContain('requires "component"');
    expect(muiHintsSchema.safeParse({ component: 'button' }).success).toBe(false);
    expect(
      muiHintsSchema.safeParse({ component: 'Button', axisMap: { Tone: 'variant' } })
        .success,
    ).toBe(false);
    expect(
      muiHintsSchema.safeParse({ component: 'Button', defaultProps: { x: {} } })
        .success,
    ).toBe(false);
  });
```

(import `muiHintsSchema` from `../src/targets/hints.js` in that test file if it is not already imported.) Also assert the regenerated schema through `parseManifest`: a manifest whose `targets.mui` is `{ "component": "Button", "axisMap": { "tone": "variant" } }` parses, and `{ "axisMap": {} }` is `DS-E020` with a message containing `requires "component"`.

- [ ] **Step 2: Mapping hints accessor**

`src/targets/mui/hints.ts`: extend the private `MuiHints` interface and add the accessor:

```ts
export type MuiScalar = string | number | boolean;

interface MuiHints {
  ignore?: string[];
  component?: string;
  axisMap?: Record<string, string>;
  slotMap?: Record<string, string>;
  defaultProps?: Record<string, MuiScalar>;
}

/** A mapping onto one of MUI's own components, as written in the manifest. */
export interface MuiMappingHints {
  component: string;
  axisMap: Record<string, string>;
  slotMap: Record<string, string>;
  defaultProps: Record<string, MuiScalar>;
}

/** The manifest's mapping, or null for an own component (and for excluded or unmapped ones). */
export function muiMapping(component: ComponentIR): MuiMappingHints | null {
  const hints = mappedHints(component);
  if (!hints || hints.component === undefined) {
    return null;
  }
  return {
    component: hints.component,
    axisMap: hints.axisMap ?? {},
    slotMap: hints.slotMap ?? {},
    defaultProps: hints.defaultProps ?? {},
  };
}
```

- [ ] **Step 3: Names**

`src/targets/mui/names.ts`: add and change:

```ts
import type { ComponentIR } from '../../ir/types.js';

/** MUI's theme key for one of its own components: `Button` → `MuiButton`. */
export function muiThemeKeyFor(component: string): string {
  return `Mui${component}`;
}

/**
 * Every full assignment of axis values: axes in manifest order, values in
 * manifest order, the last axis varying fastest. One empty assignment when
 * the component has no axes.
 */
export function axisPermutations(
  component: Pick<ComponentIR, 'axes' | 'axisOrder'>,
): Record<string, string>[] {
  let out: Record<string, string>[] = [{}];
  for (const axis of component.axisOrder) {
    const next: Record<string, string>[] = [];
    for (const partial of out) {
      for (const value of component.axes[axis].values) {
        next.push({ ...partial, [axis]: value });
      }
    }
    out = next;
  }
  return out;
}

/**
 * The Emotion style key for a CSS property: custom properties stay as they
 * are (`--variant-containedBg`), vendor-prefixed properties are PascalCase
 * (`WebkitTapHighlightColor`, the form Emotion hyphenates back with the
 * leading dash), everything else camelCase (`fontWeight`).
 */
export function muiPropertyKey(prop: string): string {
  if (prop.startsWith('--')) {
    return prop;
  }
  return prop.startsWith('-') ? pascalCase(prop) : camelCase(prop);
}
```

Change `specificityKey` to take the slot's class name instead of deriving it:

```ts
/**
 * The nested selector key for a rule inside `styleOverrides.root` or a
 * `variants` entry. `&` is repeated once per selected axis on top of the root
 * class, so the Emotion class stacks to the same specificity the CSS target
 * gets from `.root[data-axis="v"]…`; states render exactly as the design
 * system does (so `disabled` follows the root element), and a non-root slot
 * becomes a descendant with its class (`BwpExample-icon` for an own
 * component, `MuiButton-startIcon` for a mapped one). `slotClass` is null
 * for the root.
 */
export function specificityKey(
  axesCount: number,
  states: readonly string[],
  rootElement: string,
  slotClass: string | null,
): string {
  const root = '&'.repeat(1 + axesCount);
  const stateText = states.map((s) => stateSelector(s, rootElement)).join('');
  const slotText = slotClass === null ? '' : ` .${slotClass}`;
  return `${root}${stateText}${slotText}`;
}
```

Update the two call sites: in `model.ts` `componentTheme` pass `rule.slot === 'root' ? null : model.slots[rule.slot].className`; in `reparse.ts` pass `parsed.slot === 'root' ? null : slotClassName(themeKey, parsed.slot)` (Task 7 switches the reparser to the model's slot classes). `camelProperty` stays exported but `model.ts` now uses `muiPropertyKey` for declaration keys (identical results for the properties the property table allows; the difference matters only for the reset values in Task 5). `test/mui-names.test.ts`: update the `specificityKey` cases to pass `null` / `'FxChip-icon'`, and add:

```ts
  it('names MUI theme keys, enumerates permutations, and keys properties for Emotion', () => {
    expect(muiThemeKeyFor('Button')).toBe('MuiButton');
    expect(
      axisPermutations({
        axisOrder: ['tone', 'size'],
        axes: {
          tone: { values: ['quiet', 'loud'], default: 'quiet' },
          size: { values: ['sm', 'md'], default: 'md' },
        },
      }),
    ).toEqual([
      { tone: 'quiet', size: 'sm' },
      { tone: 'quiet', size: 'md' },
      { tone: 'loud', size: 'sm' },
      { tone: 'loud', size: 'md' },
    ]);
    expect(axisPermutations({ axisOrder: [], axes: {} })).toEqual([{}]);
    expect(muiPropertyKey('font-weight')).toBe('fontWeight');
    expect(muiPropertyKey('-webkit-tap-highlight-color')).toBe('WebkitTapHighlightColor');
    expect(muiPropertyKey('-moz-appearance')).toBe('MozAppearance');
    expect(muiPropertyKey('--variant-containedBg')).toBe('--variant-containedBg');
  });
```

- [ ] **Step 4: The mapping plan**

Create `src/targets/mui/mapping.ts`. It validates a manifest's mapping against the catalog's framework facts and computes everything both the capture and the model need. Diagnostics are `DS-E085` prefixed `mui: <name>: ` at the manifest location (same convention as `componentModel`).

```ts
import type { Diagnostics, SourceLocation } from '../../errors.js';
import type { ComponentIR } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import type { MuiFrameworkComponent } from './catalog.js';
import type { MuiMappingHints, MuiScalar } from './hints.js';
import { muiThemeKeyFor } from './names.js';

/**
 * Set on every mapped component that has the prop: ripples add DOM and
 * animation the design system does not have; elevation adds shadows.
 */
export const PARITY_DEFAULT_PROPS: Readonly<Record<string, boolean>> = {
  disableElevation: true,
  disableFocusRipple: true,
  disableRipple: true,
  disableTouchRipple: true,
  focusRipple: false,
};

export type ChildrenMode =
  | { kind: 'children' }
  | { kind: 'slot'; slot: string; muiProp: string }
  | { kind: 'none' };

export interface MappingUnion {
  overrides: string;
  /** MUI's default members. */
  defaults: string[];
  /** The design-system values mapped onto this prop, or [] when no axis maps to it. */
  values: string[];
}

export interface MappingPlan {
  component: string;
  themeKey: string;
  rootElement: string;
  /** Axis → MUI prop, in manifest axis order. */
  axisMap: Record<string, string>;
  /** Non-root slot → MUI class key (also the MUI prop that fills it), in manifest slot order. */
  slotMap: Record<string, string>;
  /** Non-root slot → the class MUI puts on that element (`MuiButton-startIcon`). */
  slotClasses: Record<string, string>;
  /** Parity props, axis defaults under their MUI prop names, then the manifest's defaultProps; keys sorted. */
  defaultProps: Record<string, MuiScalar>;
  children: ChildrenMode;
  /** Every own prop name of the MUI component, sorted. */
  ownProps: string[];
  /** Every overridable union prop of the MUI component by prop name, sorted. */
  unions: Record<string, MappingUnion>;
}

export function manifestLocation(component: ComponentIR): SourceLocation {
  return {
    file: `src/components/${component.name}/${component.name}.manifest.json`,
    line: 1,
    column: 1,
  };
}

/** Validates the manifest's mapping against the catalog's facts about the MUI component. Null after reporting every problem. */
export function planMapping(
  component: ComponentIR,
  hints: MuiMappingHints,
  framework: MuiFrameworkComponent,
  diag: Diagnostics,
): MappingPlan | null {
  const before = diag.errors.length;
  const at = manifestLocation(component);
  const fail = (message: string): void => {
    diag.add('DS-E085', `mui: ${component.name}: ${message}`, at);
  };
  const unionProps = Object.keys(framework.props)
    .filter((p) => framework.props[p].kind === 'union')
    .sort(codeUnitCompare);
  const slotKeys = Object.keys(framework.classes)
    .filter((k) => k !== 'root')
    .sort(codeUnitCompare);

  const axisMap: Record<string, string> = {};
  for (const axis of component.axisOrder) {
    const prop = hints.axisMap[axis];
    if (prop === undefined) {
      fail(
        `axis "${axis}" has no axisMap entry; ${hints.component} exposes ${unionProps.join(', ') || 'no overridable props'}`,
      );
      continue;
    }
    if (!unionProps.includes(prop)) {
      fail(
        `axisMap.${axis}: "${prop}" is not an overridable prop of ${hints.component} (${unionProps.join(', ') || 'none'})`,
      );
      continue;
    }
    axisMap[axis] = prop;
  }
  for (const axis of Object.keys(hints.axisMap)) {
    if (!Object.hasOwn(component.axes, axis)) {
      fail(`axisMap.${axis}: the manifest has no axis "${axis}"`);
    }
  }
  const axisTargets = Object.values(axisMap);
  for (const prop of new Set(axisTargets)) {
    if (axisTargets.filter((p) => p === prop).length > 1) {
      fail(`axisMap maps more than one axis onto "${prop}"`);
    }
  }

  const slotMap: Record<string, string> = {};
  const slotClasses: Record<string, string> = {};
  const nonRoot = component.slotOrder.filter((s) => s !== 'root');
  for (const slot of nonRoot) {
    const key = hints.slotMap[slot];
    if (key === undefined) {
      fail(
        `slot "${slot}" has no slotMap entry; ${hints.component} renders ${slotKeys.join(', ') || 'no slots'}`,
      );
      continue;
    }
    if (!slotKeys.includes(key)) {
      fail(
        `slotMap.${slot}: "${key}" is not a slot of ${hints.component} (${slotKeys.join(', ') || 'none'})`,
      );
      continue;
    }
    slotMap[slot] = key;
    slotClasses[slot] = framework.classes[key];
  }
  for (const slot of Object.keys(hints.slotMap)) {
    if (slot === 'root' || !Object.hasOwn(component.slots, slot)) {
      fail(`slotMap.${slot}: the manifest has no slot "${slot}"`);
    }
  }
  const slotTargets = Object.values(slotMap);
  for (const key of new Set(slotTargets)) {
    if (slotTargets.filter((k) => k === key).length > 1) {
      fail(`slotMap maps more than one slot onto "${key}"`);
    }
  }

  const rootElement = component.slots.root?.element ?? 'div';
  if (rootElement !== framework.rootElement) {
    fail(
      `root element is "${rootElement}" but ${hints.component} renders "${framework.rootElement}"`,
    );
  }

  // Other states are checked once, for both kinds, in componentModel.
  if (
    component.states.includes('disabled') &&
    !Object.hasOwn(framework.props, 'disabled')
  ) {
    fail(`state "disabled" needs a disabled prop, which ${hints.component} lacks`);
  }

  for (const [key, value] of Object.entries(hints.defaultProps)) {
    if (Object.hasOwn(PARITY_DEFAULT_PROPS, key)) {
      fail(`defaultProps.${key} is set by the compiler for parity and cannot be overridden`);
    } else if (!Object.hasOwn(framework.props, key)) {
      fail(`defaultProps.${key}: ${hints.component} has no prop "${key}"`);
    } else if (axisTargets.includes(key) || slotTargets.includes(key)) {
      fail(`defaultProps.${key} is already mapped from an axis or a slot`);
    } else if (key === 'children') {
      fail('defaultProps.children is not allowed');
    } else if (typeof value === 'object') {
      fail(`defaultProps.${key} must be a string, number, or boolean`);
    }
  }

  let children: ChildrenMode = { kind: 'none' };
  if (nonRoot.includes('label') && slotMap.label !== undefined) {
    children = { kind: 'slot', slot: 'label', muiProp: slotMap.label };
  } else if (
    Object.hasOwn(framework.props, 'children') &&
    /ReactNode/.test(framework.props.children.type)
  ) {
    children = { kind: 'children' };
  }

  if (diag.errors.length > before) {
    return null;
  }

  const defaultProps: Record<string, MuiScalar> = {};
  for (const [key, value] of Object.entries(PARITY_DEFAULT_PROPS)) {
    if (Object.hasOwn(framework.props, key)) {
      defaultProps[key] = value;
    }
  }
  for (const axis of component.axisOrder) {
    defaultProps[axisMap[axis]] = component.axes[axis].default;
  }
  Object.assign(defaultProps, hints.defaultProps);
  const sortedDefaults = Object.fromEntries(
    Object.keys(defaultProps)
      .sort(codeUnitCompare)
      .map((k) => [k, defaultProps[k]]),
  );

  const unions: Record<string, MappingUnion> = {};
  for (const prop of unionProps) {
    const spec = framework.props[prop];
    const axis = component.axisOrder.find((a) => axisMap[a] === prop);
    unions[prop] = {
      overrides: spec.overrides ?? '',
      defaults: [...(spec.values ?? [])],
      values: axis ? [...component.axes[axis].values] : [],
    };
  }

  return {
    component: hints.component,
    themeKey: muiThemeKeyFor(hints.component),
    rootElement,
    axisMap,
    slotMap,
    slotClasses,
    defaultProps: sortedDefaults,
    children,
    ownProps: Object.keys(framework.props).sort(codeUnitCompare),
    unions,
  };
}
```

Move `manifestLocation` out of `model.ts` into this module and import it there (it is the same function).

- [ ] **Step 5: Fixture component and tests**

Append to `test/mui-mapped-fixture.ts`:

```ts
function manifest(extra: Record<string, unknown>): string {
  return JSON.stringify({ displayName: 'X', baseline: false, ...extra });
}

/** A button-like component mapped onto MUI Button: one axis, two states, one optional slot. */
export const BTN_FILES: Record<string, string> = {
  'src/components/btn/btn.manifest.json': manifest({
    name: 'btn',
    displayName: 'Btn',
    axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
    states: ['hover', 'disabled'],
    slots: {
      root: { element: 'button' },
      icon: { element: 'span', optional: true },
    },
    targets: {
      tailwind: {},
      mui: {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
      },
    },
  }),
  'src/components/btn/btn.css': [
    '.fx-btn {',
    '  display: inline-flex;',
    '  padding: var(--fx-space-2);',
    '  color: var(--fx-color-text-default);',
    '  font-family: var(--fx-font-family-body);',
    '  cursor: pointer;',
    '}',
    '.fx-btn:hover {',
    '  box-shadow: var(--fx-shadow-focus);',
    '}',
    '.fx-btn:disabled {',
    '  cursor: not-allowed;',
    '}',
    '.fx-btn[data-tone="loud"] {',
    '  min-width: 44px;',
    '}',
    '.fx-btn .fx-btn__icon {',
    '  width: 20px;',
    '}',
    '',
  ].join('\n'),
};

/** `btn` with its manifest's `targets.mui` replaced. */
export function btnWithMui(mui: Record<string, unknown>): Record<string, string> {
  const parsed = JSON.parse(BTN_FILES['src/components/btn/btn.manifest.json']) as {
    targets: Record<string, unknown>;
  };
  parsed.targets.mui = mui;
  return {
    ...BTN_FILES,
    'src/components/btn/btn.manifest.json': JSON.stringify(parsed),
  };
}
```

Create `test/mui-mapping.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { muiMapping } from '../src/targets/mui/hints.js';
import { planMapping } from '../src/targets/mui/mapping.js';
import { BTN_FILES, FX_CATALOG, btnWithMui } from './mui-mapped-fixture.js';
import { twBuild, twRoot } from './tailwind-fixture.js';

function plan(files: Record<string, string> = BTN_FILES) {
  const { ir } = twBuild(twRoot(files));
  const component = ir.components.btn;
  const hints = muiMapping(component)!;
  const diag = new Diagnostics();
  const result = planMapping(component, hints, FX_CATALOG.frameworkComponents.Button, diag);
  return { result, diag, component };
}

describe('mui mapping plan', () => {
  it('reads the mapping hints and leaves own components alone', () => {
    const { ir } = twBuild(twRoot(BTN_FILES));
    expect(muiMapping(ir.components.btn)).toEqual({
      component: 'Button',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'startIcon' },
      defaultProps: {},
    });
    expect(muiMapping(ir.components.chip)).toBeNull();
    expect(muiMapping(ir.components.pill)).toBeNull();
  });

  it('plans the btn fixture: parity props, axis default, slot class, children, unions', () => {
    const { result, diag } = plan();
    expect(diag.errors).toEqual([]);
    expect(result).toEqual({
      component: 'Button',
      themeKey: 'MuiButton',
      rootElement: 'button',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'startIcon' },
      slotClasses: { icon: 'MuiButton-startIcon' },
      defaultProps: {
        disableElevation: true,
        disableFocusRipple: true,
        disableRipple: true,
        disableTouchRipple: true,
        focusRipple: false,
        variant: 'quiet',
      },
      children: { kind: 'children' },
      ownProps: [
        'children', 'classes', 'color', 'disableElevation', 'disableFocusRipple',
        'disableRipple', 'disableTouchRipple', 'disabled', 'endIcon', 'focusRipple',
        'fullWidth', 'href', 'size', 'startIcon', 'sx', 'variant',
      ],
      unions: {
        color: { overrides: 'ButtonPropsColorOverrides', defaults: ['inherit', 'primary'], values: [] },
        size: { overrides: 'ButtonPropsSizeOverrides', defaults: ['small', 'medium', 'large'], values: [] },
        variant: { overrides: 'ButtonPropsVariantOverrides', defaults: ['text', 'outlined', 'contained'], values: ['quiet', 'loud'] },
      },
    });
  });

  it('merges manifest defaultProps after the parity props', () => {
    const { result, diag } = plan(
      btnWithMui({ component: 'Button', axisMap: { tone: 'variant' }, slotMap: { icon: 'startIcon' }, defaultProps: { fullWidth: false, href: '#' } }),
    );
    expect(diag.errors).toEqual([]);
    expect(result?.defaultProps).toEqual({
      disableElevation: true, disableFocusRipple: true, disableRipple: true, disableTouchRipple: true,
      focusRipple: false, fullWidth: false, href: '#', variant: 'quiet',
    });
  });

  it.each([
    [{ component: 'Button', slotMap: { icon: 'startIcon' } }, 'axis "tone" has no axisMap entry; Button exposes color, size, variant'],
    [{ component: 'Button', axisMap: { tone: 'fullWidth' }, slotMap: { icon: 'startIcon' } }, 'axisMap.tone: "fullWidth" is not an overridable prop of Button'],
    [{ component: 'Button', axisMap: { tone: 'variant', size: 'size' }, slotMap: { icon: 'startIcon' } }, 'axisMap.size: the manifest has no axis "size"'],
    [{ component: 'Button', axisMap: { tone: 'variant' } }, 'slot "icon" has no slotMap entry; Button renders disabled, endIcon, startIcon, text'],
    [{ component: 'Button', axisMap: { tone: 'variant' }, slotMap: { icon: 'avatar' } }, 'slotMap.icon: "avatar" is not a slot of Button'],
    [{ component: 'Button', axisMap: { tone: 'variant' }, slotMap: { icon: 'startIcon', root: 'root' } }, 'slotMap.root: the manifest has no slot "root"'],
    [{ component: 'Button', axisMap: { tone: 'variant' }, slotMap: { icon: 'startIcon' }, defaultProps: { disableRipple: false } }, 'defaultProps.disableRipple is set by the compiler'],
    [{ component: 'Button', axisMap: { tone: 'variant' }, slotMap: { icon: 'startIcon' }, defaultProps: { nope: true } }, 'defaultProps.nope: Button has no prop "nope"'],
    [{ component: 'Button', axisMap: { tone: 'variant' }, slotMap: { icon: 'startIcon' }, defaultProps: { variant: 'text' } }, 'defaultProps.variant is already mapped'],
  ])('rejects %j with DS-E085', (mui, message) => {
    const { result, diag } = plan(btnWithMui(mui));
    expect(result).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E085']);
    expect(diag.errors[0].message).toContain(message);
    expect(diag.errors[0].location?.file).toBe('src/components/btn/btn.manifest.json');
  });

  it('rejects a root element MUI does not render and a disabled state without a disabled prop', () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as { slots: { root: { element: string } } };
    m.slots.root.element = 'div';
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    files['src/components/btn/btn.css'] = files['src/components/btn/btn.css'].replace('.fx-btn:disabled', '.fx-btn[aria-disabled="true"]');
    const { diag } = plan(files);
    expect(diag.errors.map((e) => e.message)).toEqual([
      'mui: btn: root element is "div" but Button renders "button"',
    ]);

    const framework = {
      ...FX_CATALOG.frameworkComponents.Button,
      props: Object.fromEntries(Object.entries(FX_CATALOG.frameworkComponents.Button.props).filter(([k]) => k !== 'disabled')),
    };
    const { ir } = twBuild(twRoot(BTN_FILES));
    const diag2 = new Diagnostics();
    expect(planMapping(ir.components.btn, muiMapping(ir.components.btn)!, framework, diag2)).toBeNull();
    expect(diag2.errors[0].message).toContain('state "disabled" needs a disabled prop');
  });

  it('routes children into a mapped label slot', () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      slots: Record<string, unknown>;
      targets: { mui: { slotMap: Record<string, string> } };
    };
    m.slots.label = { element: 'span' };
    m.targets.mui.slotMap.label = 'text';
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const { result, diag } = plan(files);
    expect(diag.errors).toEqual([]);
    expect(result?.children).toEqual({ kind: 'slot', slot: 'label', muiProp: 'text' });
    expect(result?.slotClasses).toEqual({ icon: 'MuiButton-startIcon', label: 'MuiButton-text' });
  });
});
```

(The last test abuses the fixture's `text` class key as a slot to exercise the children route; the fixture catalog lists it under `classes`, which is exactly what a real `<camel>Classes` export would do.)

`src/index.ts`: export `muiMapping`, `MuiMappingHints`, `MuiScalar` from `./targets/mui/hints.js`; `planMapping`, `PARITY_DEFAULT_PROPS`, `manifestLocation`, and the types `MappingPlan`, `MappingUnion`, `ChildrenMode` from `./targets/mui/mapping.js`; `muiThemeKeyFor`, `axisPermutations`, `muiPropertyKey` from `./targets/mui/names.js`.

- [ ] **Step 6: Run everything**

```bash
cd packages/ds-compiler && npx vitest run && npx tsc --noEmit && npx eslint && npx prettier --check . --ignore-path ../../.gitignore --ignore-path .prettierignore
```

Expected: green. From the root, `npm run build && npm run verify`: unchanged output (a `btn`-like component exists only in test roots). `git status --short` shows the compiler sources, `schemas/manifest.schema.json`, `package.json`, `package-lock.json`, and the new tests.

---

## Task 3: Extract MUI prop facts from its `.d.ts` files

**Files:**
- Create: `packages/ds-compiler/src/targets/mui/extract-props.ts`
- Modify: `packages/ds-compiler/src/index.ts`
- Test: `packages/ds-compiler/test/mui-extract-props.test.ts`

Context: MUI declares each component's own props as `interface <Component>OwnProps` in `<Component>/<Component>.d.ts`; overridable props are typed `OverridableStringUnion<'a' | 'b', <Component>Props<X>Overrides>`; defaults are `@default 'a'` JSDoc tags; a component that extends `ButtonBase` (Button, IconButton, Chip when clickable is a different story) says `ExtendButtonBase`/`ExtendButtonBaseTypeMap` in the file, and its remaining props live in `ButtonBase/ButtonBase.d.ts` as `ButtonBaseOwnProps`; the root element is the default of the `RootComponent` type parameter on `<Component>TypeMap`. The extraction uses the TypeScript AST only (no program, no type checker), which is fast and needs no `node_modules` resolution.

- [ ] **Step 1: Failing tests**

Create `test/mui-extract-props.test.ts`:

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { extractMuiProps } from '../src/targets/mui/extract-props.js';
import { makeRoot } from './helpers.js';

const REAL_OUT_DIR = fileURLToPath(
  new URL('../../styles-mui/src/generated/', import.meta.url),
);
const MUI_DIR = dirname(
  createRequire(join(REAL_OUT_DIR, 'x.cjs')).resolve('@mui/material/package.json'),
);

describe('extractMuiProps', () => {
  it('reads Button: unions, defaults, ButtonBase props, root element', () => {
    const button = extractMuiProps(MUI_DIR, 'Button')!;
    expect(button.rootElement).toBe('button');
    expect(button.props.variant).toEqual({
      kind: 'union',
      type: expect.stringContaining('OverridableStringUnion'),
      default: 'text',
      values: ['text', 'outlined', 'contained'],
      overrides: 'ButtonPropsVariantOverrides',
    });
    expect(button.props.size.values).toEqual(['small', 'medium', 'large']);
    expect(button.props.color.default).toBe('primary');
    expect(button.props.disabled).toEqual({
      kind: 'other',
      type: 'boolean | undefined',
      default: 'false',
    });
    expect(button.props.startIcon.type).toBe('React.ReactNode');
    // inherited from ButtonBaseOwnProps
    expect(button.props.disableRipple.kind).toBe('other');
    expect(button.props.focusRipple.default).toBe('false');
    expect(Object.keys(button.props)).toEqual([...Object.keys(button.props)].sort());
  });

  it('reads Chip: div root, children typed null', () => {
    const chip = extractMuiProps(MUI_DIR, 'Chip')!;
    expect(chip.rootElement).toBe('div');
    expect(chip.props.children.type).toBe('null | undefined');
    expect(chip.props.variant.values).toEqual(['filled', 'outlined']);
    expect(chip.props.disableRipple).toBeUndefined();
  });

  it('returns null for an unknown component', () => {
    expect(extractMuiProps(MUI_DIR, 'Nope')).toBeNull();
  });

  it('falls back to <Component>Props and reads multi-line @default tags', () => {
    const dir = makeRoot({});
    mkdirSync(join(dir, 'Thing'));
    writeFileSync(
      join(dir, 'Thing', 'Thing.d.ts'),
      [
        "import { OverridableStringUnion } from '@mui/types';",
        'export interface ThingPropsToneOverrides {}',
        'export interface ThingProps {',
        '  /**',
        '   * The tone.',
        "   * @default 'soft'",
        '   */',
        "  tone?: OverridableStringUnion<'soft' | 'loud', ThingPropsToneOverrides>;",
        '  /** @default <Foo /> */',
        '  icon?: React.ReactNode;',
        '  plain: string;',
        '}',
        "export interface ThingTypeMap<AdditionalProps = {}, RootComponent extends React.ElementType = 'span'> {",
        '  props: AdditionalProps & ThingProps;',
        '  defaultComponent: RootComponent;',
        '}',
        '',
      ].join('\n'),
    );
    const thing = extractMuiProps(dir, 'Thing')!;
    expect(thing.rootElement).toBe('span');
    expect(thing.props.tone).toEqual({
      kind: 'union',
      type: "OverridableStringUnion<'soft' | 'loud', ThingPropsToneOverrides>",
      default: 'soft',
      values: ['soft', 'loud'],
      overrides: 'ThingPropsToneOverrides',
    });
    expect(thing.props.icon.default).toBe('<Foo />');
    expect(thing.props.plain).toEqual({ kind: 'other', type: 'string', default: null });
  });
});
```

- [ ] **Step 2: Run to see it fail**

`cd packages/ds-compiler && npx vitest run test/mui-extract-props.test.ts` → fails: module not found.

- [ ] **Step 3: Implement**

Create `src/targets/mui/extract-props.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { codeUnitCompare } from '../../sources.js';
import type { MuiCatalogProp } from './catalog.js';

export interface MuiPropsExtraction {
  /** Own props (including ButtonBase's when extended), sorted by name. */
  props: Record<string, MuiCatalogProp>;
  /** The `RootComponent` default of `<Component>TypeMap`, or null when the file has none. */
  rootElement: string | null;
}

function literalMembers(node: ts.TypeNode): string[] | null {
  const types = ts.isUnionTypeNode(node) ? node.types : [node];
  const out: string[] = [];
  for (const t of types) {
    if (ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal)) {
      out.push(t.literal.text);
    } else {
      return null;
    }
  }
  return out;
}

function overridableUnion(
  type: ts.TypeNode,
  sf: ts.SourceFile,
): { values: string[]; overrides: string } | null {
  let found: { values: string[]; overrides: string } | null = null;
  const visit = (node: ts.Node): void => {
    if (found) {
      return;
    }
    if (
      ts.isTypeReferenceNode(node) &&
      node.typeName.getText(sf) === 'OverridableStringUnion' &&
      node.typeArguments?.length === 2
    ) {
      const values = literalMembers(node.typeArguments[0]);
      if (values) {
        found = { values, overrides: node.typeArguments[1].getText(sf) };
      }
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(type);
  return found;
}

/** The `@default` tag's text, single quotes stripped (`'text'` → `text`), or null. */
function defaultTag(member: ts.PropertySignature): string | null {
  for (const tag of ts.getJSDocTags(member)) {
    if (tag.tagName.text !== 'default') {
      continue;
    }
    const text =
      typeof tag.comment === 'string'
        ? tag.comment
        : (tag.comment ?? []).map((part) => part.text).join('');
    return text.trim().replace(/^'(.*)'$/s, '$1');
  }
  return null;
}

function propsOfInterface(
  sf: ts.SourceFile,
  name: string,
): Record<string, MuiCatalogProp> | null {
  let result: Record<string, MuiCatalogProp> | null = null;
  ts.forEachChild(sf, (node) => {
    if (!ts.isInterfaceDeclaration(node) || node.name.text !== name) {
      return;
    }
    const props: Record<string, MuiCatalogProp> = {};
    for (const member of node.members) {
      if (
        !ts.isPropertySignature(member) ||
        !(ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
      ) {
        continue;
      }
      const type = member.type
        ? member.type.getText(sf).replace(/\s+/g, ' ')
        : 'unknown';
      const union = member.type ? overridableUnion(member.type, sf) : null;
      props[member.name.text] = union
        ? {
            kind: 'union',
            type,
            default: defaultTag(member),
            values: union.values,
            overrides: union.overrides,
          }
        : { kind: 'other', type, default: defaultTag(member) };
    }
    result = props;
  });
  return result;
}

function rootComponentDefault(
  sf: ts.SourceFile,
  component: string,
): string | null {
  let found: string | null = null;
  ts.forEachChild(sf, (node) => {
    if (
      !(ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) ||
      node.name.text !== `${component}TypeMap` ||
      !node.typeParameters
    ) {
      return;
    }
    for (const param of node.typeParameters) {
      if (
        param.name.text === 'RootComponent' &&
        param.default &&
        ts.isLiteralTypeNode(param.default) &&
        ts.isStringLiteral(param.default.literal)
      ) {
        found = param.default.literal.text;
      }
    }
  });
  return found;
}

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
}

/**
 * Reads `<muiDir>/<Component>/<Component>.d.ts` with the TypeScript AST (no
 * type checker): every member of `<Component>OwnProps` (falling back to
 * `<Component>Props`), laid over `ButtonBaseOwnProps` when the file extends
 * ButtonBase, each with its `OverridableStringUnion` members and overrides
 * interface when it has one, and its `@default`. Null when the file or the
 * interface is missing.
 */
export function extractMuiProps(
  muiDir: string,
  component: string,
): MuiPropsExtraction | null {
  const file = join(muiDir, component, `${component}.d.ts`);
  if (!existsSync(file)) {
    return null;
  }
  const sf = parse(file);
  const own =
    propsOfInterface(sf, `${component}OwnProps`) ??
    propsOfInterface(sf, `${component}Props`);
  if (!own) {
    return null;
  }
  let base: Record<string, MuiCatalogProp> = {};
  const baseFile = join(muiDir, 'ButtonBase', 'ButtonBase.d.ts');
  if (
    component !== 'ButtonBase' &&
    /\bExtendButtonBase(?:TypeMap)?\b/.test(sf.text) &&
    existsSync(baseFile)
  ) {
    base = propsOfInterface(parse(baseFile), 'ButtonBaseOwnProps') ?? {};
  }
  const merged = { ...base, ...own };
  return {
    props: Object.fromEntries(
      Object.keys(merged)
        .sort(codeUnitCompare)
        .map((k) => [k, merged[k]]),
    ),
    rootElement: rootComponentDefault(sf, component),
  };
}
```

If the compiler's tsconfig rejects `import ts from 'typescript'`, use `import * as ts from 'typescript';` (both work under `NodeNext` with `esModuleInterop`; the default import is the documented form).

- [ ] **Step 4: Run, then lint and typecheck**

`npx vitest run test/mui-extract-props.test.ts` → 4 passing. `npx tsc --noEmit && npx eslint`.

`src/index.ts`: export `extractMuiProps` and the type `MuiPropsExtraction`.

---

## Task 4: `bwp-ds capture-defaults --target mui`

**Files:**
- Create: `packages/ds-compiler/src/targets/mui/capture.ts`
- Modify: `packages/ds-compiler/src/targets/mui/index.ts` (`loadCatalog`, `captureDefaults`)
- Modify: `packages/ds-compiler/src/index.ts`
- Test: `packages/ds-compiler/test/mui-capture.test.ts` (integration against the installed MUI), `test/cli.test.ts`

Context: the probe on MUI 9.4.0 showed that `renderToStaticMarkup(<CacheProvider value={createCache({ key: 'c' })}><ThemeProvider theme={theme}><Button …/></ThemeProvider></CacheProvider>)` emits `<style data-emotion="c <hash>-<label>">…</style>` tags inline with the complete flattened CSS of each element's final Emotion class (ButtonBase's and Button's styles merged into one class on the root, `c-<hash>-MuiButtonBase-root-MuiButton-root`; the start icon's own class `c-<hash>-MuiButton-startIcon`), plus a `c-global` sheet for the theme variables. The root's DOM classes include `MuiButton-root`, the slot's include `MuiButton-startIcon`. Intermediate classes (Button's styles before the merge) appear as `<style>` tags too but are not referenced by any element and are skipped. Everything is loaded with `createRequire` from the target's `outDir` so React, Emotion, and MUI are the target package's single CJS instances.

- [ ] **Step 1: Failing integration test**

Create `test/mui-capture.test.ts`:

```ts
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { captureMuiDefaults } from '../src/targets/mui/capture.js';
import { installedMuiVersion, type MuiCatalog } from '../src/targets/mui/catalog.js';
import { BTN_FILES } from './mui-mapped-fixture.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

const REAL_OUT_DIR = fileURLToPath(
  new URL('../../styles-mui/src/generated/', import.meta.url),
);

async function capture(files: Record<string, string>) {
  const root = twRoot(files);
  const { ir, config } = twBuild(root);
  const ctx = { ...twContext(root, config), outDir: REAL_OUT_DIR };
  const diag = new Diagnostics();
  const captured = await captureMuiDefaults(ir, ctx, diag);
  const catalog = captured ? (JSON.parse(captured.contents) as MuiCatalog) : null;
  return { root, captured, catalog, diag };
}

describe('captureMuiDefaults (installed @mui/material)', () => {
  it('captures Button for the btn fixture', async () => {
    const { root, captured, catalog, diag } = await capture(BTN_FILES);
    expect(diag.errors).toEqual([]);
    expect(captured?.path).toBe(`${root}/catalogs/mui.json`);
    expect(captured?.contents.endsWith('\n')).toBe(true);
    expect(catalog!.framework).toEqual({
      name: '@mui/material',
      version: installedMuiVersion(REAL_OUT_DIR),
    });
    expect(catalog!.generated).toMatch(/^Captured by @bwp-web\/ds-compiler 0\.0\.0-test for target mui from @mui\/material 9\.4\.\d+\./);

    const button = catalog!.frameworkComponents.Button;
    expect(button.rootElement).toBe('button');
    expect(button.themeKey).toBe('MuiButton');
    expect(button.classes.root).toBe('MuiButton-root');
    expect(button.classes.startIcon).toBe('MuiButton-startIcon');
    expect(button.props.variant.values).toEqual(['text', 'outlined', 'contained']);
    expect(button.props.disableRipple.kind).toBe('other');

    const btn = catalog!.components.btn;
    expect(btn.component).toBe('Button');
    expect(btn.axisMap).toEqual({ tone: 'variant' });
    expect(btn.slotMap).toEqual({ icon: 'startIcon' });
    expect(btn.defaultProps).toEqual({
      disableElevation: true, disableFocusRipple: true, disableRipple: true,
      disableTouchRipple: true, focusRipple: false, variant: 'quiet',
    });
    expect(btn.renders.map((r) => r.axes)).toEqual([{ tone: 'quiet' }, { tone: 'loud' }]);

    const rules = btn.renders[0].rules;
    const find = (selector: string, media: string | null = null) =>
      rules.find((r) => r.selector === selector && r.media === media);
    const base = find('&')!;
    expect(base.declarations['min-width']).toBe('64px');
    expect(base.declarations['text-transform']).toBe('uppercase');
    expect(base.declarations.color).toBe('inherit'); // ButtonBase, merged into the root class
    expect(base.declarations['-webkit-tap-highlight-color']).toBe('transparent');
    expect(find('&:hover')!.declarations['text-decoration']).toBe('none');
    expect(find('&.Mui-disabled')!.declarations['pointer-events']).toBe('none');
    expect(find('&:hover', '(hover: hover)')!.declarations['--variant-containedBg']).toBeDefined();
    expect(find('& .MuiButton-startIcon')!.declarations['margin-right']).toBe('8px');
    expect(find('& .MuiButton-startIcon::before')!.declarations.content).toBe('"\\200b"');
    expect(find('&::-moz-focus-inner')!.declarations['border-style']).toBe('none');
    expect(find('&', 'print')).not.toBeNull();
    for (const rule of rules) {
      expect(rule.selector).toMatch(/^&/);
      expect(rule.selector).not.toMatch(/\bc-[a-z0-9]/);
      expect(JSON.stringify(rule)).not.toContain('TouchRipple');
    }
  });

  it('is deterministic', async () => {
    const a = await capture(BTN_FILES);
    const b = await capture(BTN_FILES);
    expect(a.captured!.contents).toBe(b.captured!.contents);
  });

  it('reports DS-E086 for an MUI element no slot maps', async () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      slots: { root: { element: string } };
      targets: { mui: Record<string, unknown> };
    };
    m.slots.root.element = 'div';
    m.targets.mui = { component: 'Chip', axisMap: { tone: 'variant' }, slotMap: { icon: 'icon' } };
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    files['src/components/btn/btn.css'] = files['src/components/btn/btn.css'].replace('.fx-btn:disabled', '.fx-btn[aria-disabled="true"]');
    const { captured, diag } = await capture(files);
    expect(captured).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain('MuiChip-label');
    expect(diag.errors[0].message).toContain('no slot maps');
    expect(diag.errors[0].location?.file).toBe('src/components/btn/btn.manifest.json');
  });

  it('reports DS-E086 when the MUI component cannot be loaded', async () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as { targets: { mui: Record<string, unknown> } };
    m.targets.mui = { component: 'Nope', axisMap: { tone: 'variant' }, slotMap: { icon: 'startIcon' } };
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const { captured, diag } = await capture(files);
    expect(captured).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain('@mui/material/Nope');
  });

  it('reports DS-E086 when the runtime cannot be resolved from the outDir', async () => {
    const root = twRoot(BTN_FILES);
    const { ir, config } = twBuild(root);
    const diag = new Diagnostics();
    expect(await captureMuiDefaults(ir, twContext(root, config), diag)).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain('cannot load');
  });

  it('captures an empty catalog with the framework version when nothing is mapped', async () => {
    const { catalog, diag } = await capture({});
    expect(diag.errors).toEqual([]);
    expect(catalog!.components).toEqual({});
    expect(catalog!.frameworkComponents).toEqual({});
    expect(catalog!.framework.version).toMatch(/^9\.4\./);
  });
});
```

- [ ] **Step 2: Run to see it fail**

`npx vitest run test/mui-capture.test.ts` → module not found.

- [ ] **Step 3: Implement the capture**

Create `src/targets/mui/capture.ts`:

```ts
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import postcss, { type AtRule, type Rule as CssRule } from 'postcss';
import type { Diagnostics, SourceLocation } from '../../errors.js';
import { stableStringify } from '../../ir/serialize.js';
import type { ComponentIR, DesignIR } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import type { CapturedCatalog, PluginContext } from '../plugin.js';
import {
  CATALOG_AT,
  catalogHeaderText,
  catalogPathFor,
  type MuiCatalog,
  type MuiCatalogComponent,
  type MuiCatalogRender,
  type MuiCatalogRule,
  type MuiFrameworkComponent,
} from './catalog.js';
import { extractMuiProps } from './extract-props.js';
import { MUI_PACKAGE } from './framework.js';
import { muiMapping } from './hints.js';
import { manifestLocation, planMapping, type MappingPlan } from './mapping.js';
import { axisPermutations, camelCase, muiThemeKeyFor } from './names.js';

/** Emotion cache key; every generated class is `c-<hash>[-<label>]`. */
const CACHE_KEY = 'c';
const EMOTION_CLASS = new RegExp(`^${CACHE_KEY}-[a-z0-9]+(?:-[A-Za-z0-9-]+)?$`);
const STYLE_TAG = /<style data-emotion="([^"]*)">([\s\S]*?)<\/style>/g;
const OPEN_TAG = /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s=>]+(?:="[^"]*")?)*)\s*\/?>/g;
const CLASS_ATTR = /\sclass="([^"]*)"/;

/* Loosely typed views of the CJS modules loaded from the target package. */
type Element = unknown;
interface ReactModule {
  createElement(
    type: unknown,
    props: Record<string, unknown> | null,
    ...children: unknown[]
  ): Element;
}
interface Runtime {
  React: ReactModule;
  renderToStaticMarkup(element: Element): string;
  createCache(options: { key: string }): unknown;
  CacheProvider: unknown;
  ThemeProvider: unknown;
  createTheme(options: Record<string, unknown>): unknown;
  require: NodeJS.Require;
  muiDir: string;
  version: string;
}

function loadRuntime(outDir: string, diag: Diagnostics): Runtime | null {
  const require = createRequire(join(outDir, 'capture.cjs'));
  try {
    const React = require('react') as ReactModule;
    const { renderToStaticMarkup } = require('react-dom/server') as Pick<
      Runtime,
      'renderToStaticMarkup'
    >;
    const cacheModule = require('@emotion/cache') as
      | Runtime['createCache']
      | { default: Runtime['createCache'] };
    const createCache =
      typeof cacheModule === 'function' ? cacheModule : cacheModule.default;
    const { CacheProvider } = require('@emotion/react') as Pick<
      Runtime,
      'CacheProvider'
    >;
    const { ThemeProvider, createTheme } = require(
      `${MUI_PACKAGE}/styles`,
    ) as Pick<Runtime, 'ThemeProvider' | 'createTheme'>;
    const pkgFile = require.resolve(`${MUI_PACKAGE}/package.json`);
    const version = (
      JSON.parse(readFileSync(pkgFile, 'utf8')) as { version: string }
    ).version;
    return {
      React,
      renderToStaticMarkup,
      createCache,
      CacheProvider,
      ThemeProvider,
      createTheme,
      require,
      muiDir: dirname(pkgFile),
      version,
    };
  } catch (err) {
    diag.add(
      'DS-E086',
      `mui: cannot load react, react-dom, @emotion/react, @emotion/cache, and ${MUI_PACKAGE} from ${outDir}: ${(err as Error).message}`,
      CATALOG_AT,
    );
    return null;
  }
}

interface LoadedComponent {
  Component: unknown;
  classes: Record<string, string>;
}

function loadComponent(
  runtime: Runtime,
  component: string,
  at: SourceLocation,
  diag: Diagnostics,
): LoadedComponent | null {
  const specifier = `${MUI_PACKAGE}/${component}`;
  let mod: Record<string, unknown>;
  try {
    mod = runtime.require(specifier) as Record<string, unknown>;
  } catch (err) {
    diag.add(
      'DS-E086',
      `mui: cannot load ${specifier}: ${(err as Error).message}`,
      at,
    );
    return null;
  }
  const Component = mod.default;
  const classes = mod[`${camelCase(component)}Classes`];
  if (
    Component === undefined ||
    classes === null ||
    typeof classes !== 'object' ||
    Object.values(classes as Record<string, unknown>).some(
      (v) => typeof v !== 'string',
    )
  ) {
    diag.add(
      'DS-E086',
      `mui: ${specifier} does not export a default component and ${camelCase(component)}Classes`,
      at,
    );
    return null;
  }
  const sorted = Object.fromEntries(
    Object.keys(classes as Record<string, string>)
      .sort(codeUnitCompare)
      .map((k) => [k, (classes as Record<string, string>)[k]]),
  );
  return { Component, classes: sorted };
}

interface DomElement {
  tag: string;
  classes: string[];
}

/** Every element start tag in the markup, with `<style>` blocks removed first. */
function elementsOf(html: string): DomElement[] {
  const withoutStyles = html.replace(STYLE_TAG, '');
  const out: DomElement[] = [];
  for (const m of withoutStyles.matchAll(OPEN_TAG)) {
    const classAttr = CLASS_ATTR.exec(m[2]);
    out.push({
      tag: m[1].toLowerCase(),
      classes: classAttr ? classAttr[1].split(/\s+/).filter(Boolean) : [],
    });
  }
  return out;
}

function emotionClassOf(el: DomElement): string | null {
  return el.classes.find((c) => EMOTION_CLASS.test(c)) ?? null;
}

interface Rendered {
  rootTag: string;
  rules: MuiCatalogRule[];
}

/**
 * Renders one permutation and turns MUI's emitted CSS into rules relative
 * to the root (`&`) and the mapped slots (`& .<MuiSlotClass>`). Every
 * element carrying an Emotion class must be the root or a mapped slot.
 */
function renderPermutation(
  runtime: Runtime,
  loaded: LoadedComponent,
  component: ComponentIR,
  plan: MappingPlan,
  permutation: Record<string, string>,
  at: SourceLocation,
  diag: Diagnostics,
): Rendered | null {
  const { React } = runtime;
  const theme = runtime.createTheme({
    cssVariables: true,
    components: { [plan.themeKey]: { defaultProps: plan.defaultProps } },
  });
  const props: Record<string, unknown> = {};
  for (const axis of component.axisOrder) {
    props[plan.axisMap[axis]] = permutation[axis];
  }
  for (const [slot, muiKey] of Object.entries(plan.slotMap)) {
    if (plan.children.kind === 'slot' && plan.children.slot === slot) {
      props[muiKey] = 'x';
    } else {
      props[muiKey] = React.createElement('i', { 'data-slot': slot }, 'x');
    }
  }
  const children = plan.children.kind === 'children' ? ['x'] : [];
  const cache = runtime.createCache({ key: CACHE_KEY });
  const html = runtime.renderToStaticMarkup(
    React.createElement(
      runtime.CacheProvider,
      { value: cache },
      React.createElement(
        runtime.ThemeProvider,
        { theme },
        React.createElement(loaded.Component, props, ...children),
      ),
    ),
  );

  const elements = elementsOf(html);
  const rootClassName = loaded.classes.root;
  const root = elements.find((el) => el.classes.includes(rootClassName));
  if (!root) {
    diag.add(
      'DS-E086',
      `mui: ${component.name}: ${plan.component} rendered no element with class "${rootClassName}"`,
      at,
    );
    return null;
  }
  const rootEmotion = emotionClassOf(root);
  /** Emotion class → selector prefix that stands for it. */
  const prefixes = new Map<string, string>();
  if (rootEmotion) {
    prefixes.set(rootEmotion, '&');
  }
  const accounted = new Set<DomElement>([root]);
  for (const [slot, muiClass] of Object.entries(plan.slotClasses)) {
    const el = elements.find(
      (e) => e !== root && e.classes.includes(muiClass),
    );
    if (!el) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: ${plan.component} rendered no element with class "${muiClass}" for slot "${slot}"`,
        at,
      );
      continue;
    }
    accounted.add(el);
    const emotion = emotionClassOf(el);
    if (emotion) {
      prefixes.set(emotion, `& .${muiClass}`);
    }
  }
  for (const el of elements) {
    if (accounted.has(el) || emotionClassOf(el) === null) {
      continue;
    }
    const muiClasses = el.classes.filter((c) => /^Mui[A-Z]/.test(c));
    const key = muiClasses
      .map((c) => c.split('-')[1])
      .find((k) => k !== undefined && k !== 'root');
    diag.add(
      'DS-E086',
      `mui: ${component.name}: ${plan.component} renders an element <${el.tag} class="${muiClasses.join(' ')}"> that no slot maps; add a slot mapped to "${key ?? '?'}" or exclude the component`,
      at,
    );
  }
  if (diag.errors.length > 0 && !root) {
    return null;
  }

  const merged = new Map<string, MuiCatalogRule>();
  const add = (media: string | null, selector: string, rule: CssRule): void => {
    const id = `${media ?? ''}|${selector}`;
    const entry = merged.get(id) ?? { media, selector, declarations: {} };
    rule.each((node) => {
      if (node.type === 'decl') {
        entry.declarations[node.prop] = node.value;
      }
    });
    merged.set(id, entry);
  };
  const handleRule = (rule: CssRule, media: string | null): void => {
    for (const raw of rule.selectors) {
      const m = /^\.([^\s.:[>+~]+)([\s\S]*)$/.exec(raw.trim());
      const prefix = m ? prefixes.get(m[1]) : undefined;
      if (!m || prefix === undefined) {
        // An intermediate Emotion class no element carries, or a selector
        // that does not start with an element we know: not applied.
        continue;
      }
      const rest = m[2].replaceAll(`.${m[1]}`, '&');
      add(media, `${prefix}${rest}`, rule);
    }
  };
  for (const styleTag of html.matchAll(STYLE_TAG)) {
    if (styleTag[1].startsWith(`${CACHE_KEY}-global`)) {
      continue;
    }
    const sheet = postcss.parse(styleTag[2]);
    sheet.each((node) => {
      if (node.type === 'rule') {
        handleRule(node, null);
      } else if (node.type === 'atrule' && node.name === 'media') {
        (node as AtRule).each((child) => {
          if (child.type === 'rule') {
            handleRule(child, node.params);
          }
        });
      } else if (node.type === 'atrule') {
        diag.add(
          'DS-E086',
          `mui: ${component.name}: ${plan.component} emits @${node.name}, which the catalog cannot represent`,
          at,
        );
      }
    });
  }
  return { rootTag: root.tag, rules: [...merged.values()] };
}

/**
 * Renders every mapped component in every axis permutation with the
 * target package's own React, Emotion, and MUI, and records what MUI
 * styled. Returns the catalog file for `<rootDir>/catalogs/mui.json`, or
 * null after reporting DS-E086.
 */
export async function captureMuiDefaults(
  ir: DesignIR,
  ctx: PluginContext,
  diag: Diagnostics,
): Promise<CapturedCatalog | null> {
  const before = diag.errors.length;
  const runtime = loadRuntime(ctx.outDir, diag);
  if (!runtime) {
    return null;
  }
  const frameworkComponents: Record<string, MuiFrameworkComponent> = {};
  const components: Record<string, MuiCatalogComponent> = {};
  for (const name of Object.keys(ir.components).sort(codeUnitCompare)) {
    const component = ir.components[name];
    const hints = muiMapping(component);
    if (!hints) {
      continue;
    }
    const at = manifestLocation(component);
    const loaded = loadComponent(runtime, hints.component, at, diag);
    const extracted = extractMuiProps(runtime.muiDir, hints.component);
    if (!loaded || !extracted) {
      if (!extracted) {
        diag.add(
          'DS-E086',
          `mui: ${name}: cannot read the props of ${hints.component} from ${runtime.muiDir}/${hints.component}/${hints.component}.d.ts`,
          at,
        );
      }
      continue;
    }
    const framework: MuiFrameworkComponent = frameworkComponents[
      hints.component
    ] ?? {
      rootElement: extracted.rootElement ?? '',
      themeKey: muiThemeKeyFor(hints.component),
      classes: loaded.classes,
      props: extracted.props,
    };
    // The type default is the plan's root element; when the types have none,
    // a bare render tells us what MUI puts in the DOM.
    if (framework.rootElement === '') {
      const probe = renderPermutation(
        runtime,
        loaded,
        { ...component, axisOrder: [], slotOrder: ['root'], slots: { root: component.slots.root } },
        {
          component: hints.component,
          themeKey: framework.themeKey,
          rootElement: '',
          axisMap: {},
          slotMap: {},
          slotClasses: {},
          defaultProps: {},
          children: { kind: 'none' },
          ownProps: [],
          unions: {},
        },
        {},
        at,
        new Diagnostics(),
      );
      framework.rootElement = probe?.rootTag ?? 'div';
    }
    const plan = planMapping(component, hints, framework, diag);
    if (!plan) {
      continue;
    }
    const renders: MuiCatalogRender[] = [];
    for (const permutation of axisPermutations(component)) {
      const rendered = renderPermutation(
        runtime,
        loaded,
        component,
        plan,
        permutation,
        at,
        diag,
      );
      if (!rendered) {
        continue;
      }
      if (rendered.rootTag !== framework.rootElement) {
        diag.add(
          'DS-E086',
          `mui: ${name}: ${hints.component} renders <${rendered.rootTag}> but its types say <${framework.rootElement}>`,
          at,
        );
      }
      renders.push({ axes: permutation, rules: rendered.rules });
    }
    frameworkComponents[hints.component] = framework;
    components[name] = {
      component: hints.component,
      axisMap: plan.axisMap,
      slotMap: plan.slotMap,
      defaultProps: plan.defaultProps,
      renders,
    };
  }
  if (diag.errors.length > before) {
    return null;
  }
  const catalog: MuiCatalog = {
    generated: catalogHeaderText(ctx.compilerVersion, runtime.version),
    framework: { name: MUI_PACKAGE, version: runtime.version },
    frameworkComponents,
    components,
  };
  return {
    path: catalogPathFor(ctx.rootDir),
    contents: `${stableStringify(catalog)}\n`,
  };
}
```

Notes for the implementer:

- `stableStringify` sorts object keys (so `declarations` and `axes` are alphabetical) and keeps array order (`renders`, `rules`): that is the determinism the test pins.
- The `renderPermutation` "unmapped element" check must run before the root-null early return is reached in the normal flow; keep the order as written (root missing → return null; slots; unmapped elements; rules).
- Keep the `diag.errors.length > 0 && !root` line out if the linter flags it as unreachable; it is there only to make the intent explicit and can be deleted.
- Do not import `react` or `@mui/material` types into the compiler; the loose interfaces above are deliberate.

- [ ] **Step 4: Wire the plugin and the CLI**

`src/targets/mui/index.ts`:

```ts
import { captureMuiDefaults } from './capture.js';
import { loadMuiCatalog, type MuiCatalog } from './catalog.js';

export const muiPlugin: TargetPlugin<MuiCatalog> = {
  id: MUI_ID,
  loadCatalog: loadMuiCatalog,
  captureDefaults: captureMuiDefaults,
  generate: (ir, _catalog, ctx, diag) => generateMui(ir, ctx, diag),
  reparse: (files, ir, _catalog, ctx, diag) => reparseMui(files, ir, ctx, diag),
  …
};
```

(`TARGETS` is `Record<string, TargetPlugin>`; if the generic parameter makes the assignment fail, keep `TargetPlugin<null>` off and type `muiPlugin` as `TargetPlugin<MuiCatalog>` while casting once in `targets/index.ts`, or leave `muiPlugin: TargetPlugin` and cast `catalog as MuiCatalog | null` inside `generate`/`reparse` in Task 6/7. Prefer whichever compiles without `any`.)

`test/cli.test.ts`: in the `capture-defaults` test, change the `--target mui` expectation: on a temp root it now exits 1 with `stderr` containing `DS-E086` and `cannot load` (the temp outDir has no `node_modules`). Add a positive CLI run against a temp root whose `outDir` is the real one: write a `ds.config.json` with `targets.mui.outDir` set to the absolute `REAL_OUT_DIR`? `outDir` must be a relative POSIX path, so instead compute the relative path from the temp root to `packages/styles-mui/src/generated` with `node:path` `relative` and `split(sep).join('/')`, put it in the config, and expect exit 0, `stdout` containing `wrote`, and `catalogs/mui.json` to exist under the temp root. Skip the positive run if the relative path would need a drive change (Windows); this repo's CI is Linux.

`src/index.ts`: export `captureMuiDefaults`.

- [ ] **Step 5: Run**

`npx vitest run` (whole compiler suite), `npx tsc --noEmit`, `npx eslint`, `npx prettier --check …`. Then from the root: `npm run build`, `npm run verify` (still no catalog and no mapped component in the repo: output unchanged), and

```bash
npm run ds -- capture-defaults --target mui --json
```

Expected: exit 0; the JSON has `"wrote": "<abs>/packages/styles-css/catalogs/mui.json"`; the file has `components: {}` and `frameworkComponents: {}` with the installed version. Then **delete that file** (`rm packages/styles-css/catalogs/mui.json && rmdir packages/styles-css/catalogs`): the committed catalog arrives in Task 8 together with the mapped starter component. Confirm `git status --short` shows no `catalogs/` entry.

---

## Task 5: Reset computation

**Files:**
- Create: `packages/ds-compiler/src/targets/mui/values.ts` (`muiValue` moves here from `model.ts`, which re-exports it)
- Create: `packages/ds-compiler/src/targets/mui/resets.ts`
- Modify: `packages/ds-compiler/src/index.ts`
- Test: `packages/ds-compiler/test/mui-resets.test.ts`

Context: see the "Reset algorithm" and "Effective value lookup" decisions. The catalog stores what MUI emitted; this module decides, per permutation and catalog rule, which properties to `revert` and which to restate with the design system's effective value. Rule order in `ComponentIR.rules` is the cascade (slot, then fewer axes first, then fewer states first), so "the last applicable rule" is the winning declaration; its specificity is `1 + axes + states (+1 for a non-root slot)`, matching the CSS target's `.root[data-a="v"]:hover .root__slot`.

- [ ] **Step 1: Move `muiValue`**

Create `src/targets/mui/values.ts` with the `muiValue` function exactly as it is in `model.ts` (imports `renderLiteralValue` from `../css-values.js`, `muiVarName` from `./names.js`, types from `../../ir/types.js`). In `model.ts` delete the function and add `export { muiValue } from './values.js';` plus a local import. Tests keep importing it from `model.js`.

- [ ] **Step 2: Failing tests**

Create `test/mui-resets.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { muiMapping } from '../src/targets/mui/hints.js';
import { manifestLocation, planMapping } from '../src/targets/mui/mapping.js';
import {
  computeResets,
  parseContext,
  SHORTHAND_LONGHANDS,
} from '../src/targets/mui/resets.js';
import { BTN_FILES, FX_CATALOG } from './mui-mapped-fixture.js';
import { twBuild, twRoot } from './tailwind-fixture.js';

const SLOTS = { 'MuiButton-startIcon': 'icon' };

describe('parseContext', () => {
  it.each([
    ['&', { slot: 'root', states: [], specificity: 1 }],
    ['&:hover', { slot: 'root', states: ['hover'], specificity: 2 }],
    ['&.Mui-disabled', { slot: 'root', states: ['disabled'], specificity: 2 }],
    ['&.Mui-focusVisible:active', { slot: 'root', states: ['focus-visible', 'active'], specificity: 3 }],
    ['&[aria-pressed="true"]', { slot: 'root', states: ['pressed'], specificity: 2 }],
    ['&.MuiButton-loading', { slot: 'root', states: [], specificity: 2 }],
    ['&::-moz-focus-inner', { slot: null, states: [], specificity: 1 }],
    ['& .MuiButton-startIcon', { slot: 'icon', states: [], specificity: 2 }],
    ['&:hover .MuiButton-startIcon', { slot: 'icon', states: ['hover'], specificity: 3 }],
    ['& .MuiButton-startIcon:hover', { slot: 'icon', states: [], specificity: 3 }],
    ['& .MuiButton-startIcon::before', { slot: null, states: [], specificity: 2 }],
    ['& > *:nth-of-type(1)', { slot: null, states: [], specificity: 2 }],
    ['& .MuiOther-thing', { slot: null, states: [], specificity: 2 }],
    ['& .MuiButton-startIcon > svg', { slot: null, states: [], specificity: 2 }],
  ])('%s', (selector, expected) => {
    expect(parseContext(selector, SLOTS)).toEqual(expected);
  });
});

function resetsFor(files = BTN_FILES, catalog = FX_CATALOG) {
  const { ir } = twBuild(twRoot(files));
  const component = ir.components.btn;
  const plan = planMapping(component, muiMapping(component)!, catalog.frameworkComponents.Button, catalog.components.btn, new Diagnostics())!;
  const diag = new Diagnostics();
  const resets = computeResets(ir, component, plan, catalog.components.btn, diag, manifestLocation(component));
  return { resets, diag, ir };
}

describe('computeResets', () => {
  it('knows the shorthands MUI emits', () => {
    expect(SHORTHAND_LONGHANDS.border).toHaveLength(12);
    expect(SHORTHAND_LONGHANDS.transition).toEqual([
      'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay',
    ]);
    expect(SHORTHAND_LONGHANDS.padding).toEqual(['padding-top', 'padding-right', 'padding-bottom', 'padding-left']);
  });

  it('reverts what the design system never sets, restates lower-specificity values, skips the rest', () => {
    const { resets, diag } = resetsFor();
    expect(diag.errors).toEqual([]);
    expect(resets).toEqual([
      {
        props: { variant: 'quiet' },
        style: {
          '&': {
            WebkitTapHighlightColor: 'revert',
            minWidth: 'revert',
            textTransform: 'revert',
            transitionDelay: 'revert',
            transitionDuration: 'revert',
            transitionProperty: 'revert',
            transitionTimingFunction: 'revert',
          },
        },
      },
      {
        props: { variant: 'quiet' },
        style: {
          '&:hover': {
            textDecorationColor: 'revert',
            textDecorationLine: 'revert',
            textDecorationStyle: 'revert',
            textDecorationThickness: 'revert',
          },
        },
      },
      {
        props: { variant: 'quiet' },
        style: {
          '&.Mui-disabled': {
            color: 'var(--fx-palette-tokens-text-default)',
            pointerEvents: 'revert',
          },
        },
      },
      {
        props: { variant: 'quiet' },
        style: { '@media (hover: hover)': { '&:hover': { '--variant-containedBg': 'revert' } } },
      },
      {
        props: { variant: 'quiet' },
        style: { '& .MuiButton-startIcon': { display: 'revert', marginRight: 'revert' } },
      },
      {
        props: { variant: 'quiet' },
        style: { '& .MuiButton-startIcon::before': { content: 'revert' } },
      },
      {
        props: { variant: 'loud' },
        style: {
          '&': {
            WebkitTapHighlightColor: 'revert',
            textTransform: 'revert',
            transitionDelay: 'revert',
            transitionDuration: 'revert',
            transitionProperty: 'revert',
            transitionTimingFunction: 'revert',
          },
        },
      },
      {
        props: { variant: 'loud' },
        style: {
          '&:hover': {
            textDecorationColor: 'revert',
            textDecorationLine: 'revert',
            textDecorationStyle: 'revert',
            textDecorationThickness: 'revert',
          },
        },
      },
      {
        props: { variant: 'loud' },
        style: {
          '&.Mui-disabled': {
            color: 'var(--fx-palette-tokens-text-default)',
            pointerEvents: 'revert',
          },
        },
      },
      {
        props: { variant: 'loud' },
        style: { '@media (hover: hover)': { '&:hover': { '--variant-containedBg': 'revert' } } },
      },
      {
        props: { variant: 'loud' },
        style: { '& .MuiButton-startIcon': { display: 'revert', marginRight: 'revert' } },
      },
      {
        props: { variant: 'loud' },
        style: { '& .MuiButton-startIcon::before': { content: 'revert' } },
      },
    ]);
  });

  it('restates a base value that MUI overrides in a state, and reverts a property the design system sets only elsewhere', () => {
    // text-decoration-line in the base rule: MUI's `&:hover { text-decoration: none }` must restate it.
    // box-shadow only in :hover: MUI's base `box-shadow` must revert (the DS hover variant wins later).
    const files = {
      ...BTN_FILES,
      'src/components/btn/btn.css': BTN_FILES['src/components/btn/btn.css'].replace(
        '  cursor: pointer;\n',
        '  cursor: pointer;\n  text-decoration-line: underline;\n',
      ),
    };
    const catalog = structuredClone(FX_CATALOG);
    catalog.components.btn.renders[0].rules[0].declarations['box-shadow'] = 'none';
    const { resets, diag } = resetsFor(files, catalog);
    expect(diag.errors).toEqual([]);
    expect(resets[0].style['&']).toMatchObject({ boxShadow: 'revert' });
    expect(resets[1].style['&:hover']).toEqual({
      textDecorationColor: 'revert',
      textDecorationLine: 'underline',
      textDecorationStyle: 'revert',
      textDecorationThickness: 'revert',
    });
  });

  it('drops legacy flexbox spellings when the standard property is present', () => {
    const catalog = structuredClone(FX_CATALOG);
    const base = catalog.components.btn.renders[0].rules[0].declarations;
    base['-ms-flex-align'] = 'center';
    base['-webkit-box-align'] = 'center';
    base['align-items'] = 'center';
    base['-ms-flex-pack'] = 'center';
    const { resets } = resetsFor(BTN_FILES, catalog);
    const keys = Object.keys(resets![0].style['&']);
    expect(keys).toContain('alignItems');
    expect(keys).not.toContain('MsFlexAlign');
    expect(keys).not.toContain('WebkitBoxAlign');
    // no standard twin in the rule: kept and reverted under its PascalCase key
    expect(keys).toContain('MsFlexPack');
  });

  it('honours ignore: an ignored property is never restated', () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as { targets: { mui: Record<string, unknown> } };
    m.targets.mui.ignore = ['color'];
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const { resets } = resetsFor(files);
    expect(resets[0].style['&']).toMatchObject({ color: 'revert' });
    expect(resets[2].style['&.Mui-disabled']).toEqual({ color: 'revert', pointerEvents: 'revert' });
  });

  it('reports a missing permutation and an unexpandable shorthand as DS-E086', () => {
    const missing = structuredClone(FX_CATALOG);
    missing.components.btn.renders = missing.components.btn.renders.slice(0, 1);
    const a = resetsFor(BTN_FILES, missing);
    expect(a.resets).toBeNull();
    expect(a.diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(a.diag.errors[0].message).toContain('no render for tone=loud');

    const shorthand = structuredClone(FX_CATALOG);
    shorthand.components.btn.renders[0].rules[0].declarations.animation = 'spin 1s';
    const b = resetsFor(BTN_FILES, shorthand);
    expect(b.resets).toBeNull();
    expect(b.diag.errors[0].message).toContain('shorthand "animation"');
  });

  it('skips a catalog rule that leaves nothing to reset', () => {
    const catalog = structuredClone(FX_CATALOG);
    catalog.components.btn.renders[0].rules.push({ media: null, selector: '&', declarations: { color: 'red' } });
    const { resets } = resetsFor(BTN_FILES, catalog);
    // the appended rule merges into nothing new for quiet: color is provided at equal specificity
    expect(resets!.filter((r) => r.props.variant === 'quiet')).toHaveLength(6);
  });
});
```

- [ ] **Step 3: Run to see it fail**

`npx vitest run test/mui-resets.test.ts` → module not found.

- [ ] **Step 4: Implement**

Create `src/targets/mui/resets.ts`:

```ts
import {
  FORBIDDEN_SHORTHANDS,
  expandShorthand,
} from '../../components/properties.js';
import {
  PSEUDO_STATES,
  sortStates,
  stateForAttribute,
} from '../../components/states.js';
import type { Diagnostics, SourceLocation } from '../../errors.js';
import type { ComponentIR, DesignIR } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import { findRender, type MuiCatalogComponent, type MuiCatalogRule } from './catalog.js';
import { ignoredForMui } from './hints.js';
import type { MappingPlan } from './mapping.js';
import type { MuiDeclarations, MuiVariant } from './model.js';
import { axisPermutations, muiPropertyKey } from './names.js';
import { muiValue } from './values.js';

const SIDES = ['top', 'right', 'bottom', 'left'] as const;
const CORNERS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const;

/** Shorthands MUI is known to emit, to the longhands they set. A shorthand outside this table is DS-E086 at generation. */
export const SHORTHAND_LONGHANDS: Readonly<Record<string, readonly string[]>> = {
  padding: SIDES.map((s) => `padding-${s}`),
  margin: SIDES.map((s) => `margin-${s}`),
  inset: [...SIDES],
  gap: ['row-gap', 'column-gap'],
  border: SIDES.flatMap((s) => [`border-${s}-width`, `border-${s}-style`, `border-${s}-color`]),
  ...Object.fromEntries(
    SIDES.map((s) => [`border-${s}`, [`border-${s}-width`, `border-${s}-style`, `border-${s}-color`]]),
  ),
  'border-width': SIDES.map((s) => `border-${s}-width`),
  'border-style': SIDES.map((s) => `border-${s}-style`),
  'border-color': SIDES.map((s) => `border-${s}-color`),
  'border-radius': CORNERS.map((c) => `border-${c}-radius`),
  outline: ['outline-width', 'outline-style', 'outline-color'],
  transition: ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay'],
  background: [
    'background-color', 'background-image', 'background-position', 'background-size',
    'background-repeat', 'background-attachment', 'background-origin', 'background-clip',
  ],
  font: ['font-style', 'font-variant', 'font-weight', 'font-stretch', 'font-size', 'line-height', 'font-family'],
  flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
  'flex-flow': ['flex-direction', 'flex-wrap'],
  'text-decoration': ['text-decoration-line', 'text-decoration-style', 'text-decoration-color', 'text-decoration-thickness'],
  'place-items': ['align-items', 'justify-items'],
  'place-content': ['align-content', 'justify-content'],
};

const VENDOR = /^-(?:webkit|moz|ms|o)-(.+)$/;
/**
 * Legacy flexbox spellings Emotion's prefixer emits next to the standard
 * property; dropped when the standard property is in the same rule, like a
 * same-name vendor twin. (Seen in the real Button capture: `-ms-flex-align`,
 * `-webkit-box-align` beside `align-items`; `-ms-flex-pack`,
 * `-webkit-box-pack` beside `justify-content`.)
 */
const LEGACY_TWINS: Readonly<Record<string, string>> = {
  '-webkit-box-align': 'align-items',
  '-ms-flex-align': 'align-items',
  '-webkit-box-pack': 'justify-content',
  '-ms-flex-pack': 'justify-content',
  '-webkit-box-orient': 'flex-direction',
  '-webkit-box-direction': 'flex-direction',
  '-ms-flex-direction': 'flex-direction',
  '-ms-flex-wrap': 'flex-wrap',
  '-ms-flex-preferred-size': 'flex-basis',
  '-ms-flex-positive': 'flex-grow',
  '-ms-flex-negative': 'flex-shrink',
  '-ms-flex-item-align': 'align-self',
  '-ms-flex-line-pack': 'align-content',
  '-webkit-box-flex': 'flex-grow',
  '-ms-flex': 'flex',
  '-webkit-box-ordinal-group': 'order',
  '-ms-flex-order': 'order',
};
const COMBINATOR = /\s*[>+~]\s*|\s+/;
const TOKEN = /::?[a-zA-Z-]+(?:\([^)]*\))?|\.[A-Za-z0-9_-]+|\[[^\]]*\]|&|\*/g;
const ATTRIBUTE = /^\[([a-z-]+)(?:="([^"]*)")?\]$/;
/** MUI state classes to design-system states. */
const CLASS_STATES: Readonly<Record<string, string>> = {
  'Mui-disabled': 'disabled',
  'Mui-focusVisible': 'focus-visible',
  'Mui-active': 'active',
  'Mui-selected': 'selected',
  'Mui-checked': 'checked',
  'Mui-expanded': 'expanded',
};

export interface ResetContext {
  /** `root`, a design-system slot, or null when the subject is not a design-system element (pseudo-element, descendant of a slot, unknown class). */
  slot: string | null;
  /** States implied by the root compound, canonical order. */
  states: string[];
  /** Classes, attributes, and pseudo-classes across all compounds, `&` counting one; pseudo-elements and `*` count nothing. */
  specificity: number;
}

/**
 * Reads a catalog selector (`&`, `&:hover .MuiButton-startIcon::before`, …).
 * States come from the root compound only; the second compound names a slot
 * when it starts with a mapped slot class; anything deeper, a pseudo-element,
 * or an unknown class has no design-system element.
 */
export function parseContext(
  selector: string,
  slotByClass: Readonly<Record<string, string>>,
): ResetContext {
  const compounds = selector.trim().split(COMBINATOR).filter((c) => c !== '');
  const tokensOf = (compound: string): string[] => compound.match(TOKEN) ?? [];
  let specificity = 0;
  let pseudoElement = false;
  const states: string[] = [];
  const count = (token: string): void => {
    if (token.startsWith('::')) {
      pseudoElement = true;
    } else if (token !== '*') {
      specificity += 1;
    }
  };
  for (const token of tokensOf(compounds[0] ?? '&')) {
    count(token);
    if (token.startsWith('::') || token === '&' || token === '*') {
      continue;
    }
    if (token.startsWith(':')) {
      const state = PSEUDO_STATES[token.slice(1)];
      if (state) {
        states.push(state);
      }
    } else if (token.startsWith('.')) {
      const state = CLASS_STATES[token.slice(1)];
      if (state) {
        states.push(state);
      }
    } else {
      const attr = ATTRIBUTE.exec(token);
      const state = attr ? stateForAttribute(attr[1], attr[2]) : null;
      if (state) {
        states.push(state);
      }
    }
  }
  let slot: string | null = 'root';
  if (compounds.length >= 2) {
    const second = tokensOf(compounds[1]);
    const cls = second[0]?.startsWith('.') ? second[0].slice(1) : null;
    slot = cls !== null && Object.hasOwn(slotByClass, cls) ? slotByClass[cls] : null;
    for (const compound of compounds.slice(1)) {
      tokensOf(compound).forEach(count);
    }
    if (compounds.length > 2) {
      slot = null;
    }
  }
  if (pseudoElement) {
    slot = null;
  }
  return { slot, states: sortStates(states), specificity };
}

interface Provided {
  value: string;
  specificity: number;
}

/**
 * The design system's winning declaration for `property` on the context's
 * element in the context's states for this permutation: the last rule in
 * cascade order whose slot matches, whose axes are all in the permutation,
 * whose states are all in the context, and which declares the property
 * (unless ignored). Null when no rule applies or the context has no element.
 */
export function effectiveValue(
  ir: DesignIR,
  component: ComponentIR,
  ignored: ReadonlySet<string>,
  context: ResetContext,
  permutation: Readonly<Record<string, string>>,
  property: string,
): Provided | null {
  if (context.slot === null || ignored.has(property)) {
    return null;
  }
  let found: Provided | null = null;
  for (const rule of component.rules) {
    if (
      rule.slot !== context.slot ||
      !Object.entries(rule.axes).every(([a, v]) => permutation[a] === v) ||
      !rule.states.every((s) => context.states.includes(s)) ||
      !Object.hasOwn(rule.declarations, property)
    ) {
      continue;
    }
    found = {
      value: muiValue(ir, rule.declarations[property]),
      specificity:
        1 + Object.keys(rule.axes).length + rule.states.length + (rule.slot === 'root' ? 0 : 1),
    };
  }
  return found;
}

/** The longhands a catalog rule sets: shorthands expanded, Emotion's vendor twins dropped. Reports unexpandable shorthands. */
function longhandsOf(
  rule: MuiCatalogRule,
  name: string,
  at: SourceLocation,
  diag: Diagnostics,
): string[] {
  const present = new Set(Object.keys(rule.declarations));
  const out = new Set<string>();
  for (const prop of Object.keys(rule.declarations)) {
    const vendor = VENDOR.exec(prop);
    if (vendor && present.has(vendor[1])) {
      continue;
    }
    const legacy = LEGACY_TWINS[prop];
    if (legacy !== undefined && present.has(legacy)) {
      continue;
    }
    if (Object.hasOwn(SHORTHAND_LONGHANDS, prop)) {
      SHORTHAND_LONGHANDS[prop].forEach((p) => out.add(p));
      continue;
    }
    if (FORBIDDEN_SHORTHANDS.has(prop) || expandShorthand(prop, '0') !== null) {
      diag.add(
        'DS-E086',
        `mui: ${name}: the catalog sets the shorthand "${prop}", which the reset generator cannot expand; add it to SHORTHAND_LONGHANDS in packages/ds-compiler/src/targets/mui/resets.ts and re-run bwp-ds generate`,
        at,
      );
      continue;
    }
    out.add(prop);
  }
  return [...out];
}

function describeAxes(axes: Readonly<Record<string, string>>): string {
  const parts = Object.keys(axes).sort(codeUnitCompare).map((a) => `${a}=${axes[a]}`);
  return parts.length === 0 ? 'the component' : parts.join(', ');
}

/**
 * The leading `variants` entries for a mapped component: for every axis
 * permutation and every catalog rule, one entry keyed by the rule's selector
 * (wrapped in its `@media` when present) whose declarations `revert` each
 * property the design system does not set on that element in that context
 * and restate the design system's effective value where a lower-specificity
 * rule provides it. Properties provided at equal or higher specificity are
 * left to the design-system variants that follow. Null after reporting
 * DS-E086 (missing permutation, unexpandable shorthand).
 */
export function computeResets(
  ir: DesignIR,
  component: ComponentIR,
  plan: MappingPlan,
  catalogComponent: MuiCatalogComponent,
  diag: Diagnostics,
  at: SourceLocation,
): MuiVariant[] | null {
  const before = diag.errors.length;
  const ignored = ignoredForMui(component);
  const slotByClass = Object.fromEntries(
    Object.entries(plan.slotClasses).map(([slot, cls]) => [cls, slot]),
  );
  const out: MuiVariant[] = [];
  for (const permutation of axisPermutations(component)) {
    const render = findRender(catalogComponent, permutation);
    if (!render) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: the catalog has no render for ${describeAxes(permutation)}; run bwp-ds capture-defaults --target mui`,
        at,
      );
      continue;
    }
    const props = Object.fromEntries(
      component.axisOrder.map((a) => [plan.axisMap[a], permutation[a]]),
    );
    for (const rule of render.rules) {
      const context = parseContext(rule.selector, slotByClass);
      const decls: MuiDeclarations = {};
      for (const property of longhandsOf(rule, component.name, at, diag)) {
        const lookup = property.startsWith('--')
          ? null
          : property.replace(VENDOR, '$1');
        const provided =
          lookup === null
            ? null
            : effectiveValue(ir, component, ignored, context, permutation, lookup);
        if (provided === null) {
          decls[muiPropertyKey(property)] = 'revert';
        } else if (provided.specificity < context.specificity) {
          decls[muiPropertyKey(property)] = provided.value;
        }
      }
      const keys = Object.keys(decls).sort(codeUnitCompare);
      if (keys.length === 0) {
        continue;
      }
      const sorted = Object.fromEntries(keys.map((k) => [k, decls[k]]));
      const style =
        rule.media === null
          ? { [rule.selector]: sorted }
          : { [`@media ${rule.media}`]: { [rule.selector]: sorted } };
      out.push({ props, style });
    }
  }
  return diag.errors.length > before ? null : out;
}
```

`MuiVariant.style` must accept the nested media form; Task 6 widens the type to `Record<string, MuiDeclarations | Record<string, MuiDeclarations>>`. Do that widening now in `model.ts` (type only) so this file compiles; Task 6 updates the schema and the renderers.

- [ ] **Step 5: Run**

`npx vitest run test/mui-resets.test.ts` → all pass; whole suite, `tsc`, `eslint`, `prettier --check` green. `src/index.ts`: export `computeResets`, `parseContext`, `effectiveValue`, `SHORTHAND_LONGHANDS`, type `ResetContext`; and `muiValue` from `./targets/mui/values.js` (keep the existing export line pointing at `model.js` or change it, but do not export the same name twice).

---

## Task 6: Mapped components in the model, augmentation, wrapper, type probes

**Files:**
- Modify: `packages/ds-compiler/src/targets/mui/model.ts`
- Modify: `packages/ds-compiler/src/targets/mui/render-ts.ts`
- Modify: `packages/ds-compiler/src/targets/mui/render-component.ts`
- Modify: `packages/ds-compiler/src/targets/mui/generate.ts`, `src/targets/mui/index.ts`
- Test: `packages/ds-compiler/test/mui-model.test.ts`, `test/mui-generate.test.ts`

- [ ] **Step 1: Model types and schema**

`src/targets/mui/model.ts`: extend the types (imports: `MuiCatalog` from `./catalog.js`; `MuiScalar`, `muiMapping` from `./hints.js`; `ChildrenMode`, `MappingUnion`, `manifestLocation`, `planMapping` from `./mapping.js`; `computeResets` from `./resets.js`; `axisPermutations` not needed here).

```ts
export type MuiDeclarations = Record<string, string>;
/** One selector key to declarations, or one `@media …` key to exactly one selector key. */
export type MuiVariantStyle = Record<string, MuiDeclarations | Record<string, MuiDeclarations>>;

export interface MuiVariant {
  /** Prop name to value (`ownerState` matching); `{}` matches every instance. Design-system prop names for own components, MUI prop names for mapped ones. */
  props: Record<string, string>;
  style: MuiVariantStyle;
}

export interface MuiComponentTheme {
  /** Mapped components only: parity props, axis defaults, manifest defaultProps. */
  defaultProps?: Record<string, MuiScalar>;
  styleOverrides: { root: MuiDeclarations };
  /** Mapped components: `resetCount` reset entries first, then the design system's rules. */
  variants: MuiVariant[];
}

export interface MuiMappedModel {
  component: string;
  axisMap: Record<string, string>;
  slotMap: Record<string, string>;
  defaultProps: Record<string, MuiScalar>;
  children: ChildrenMode;
  ownProps: string[];
  unions: Record<string, MappingUnion>;
  resetCount: number;
}

export interface MuiComponentModel {
  name: string;
  exportName: string;
  /** `<Prefix><Name>` for an own component, `Mui<Component>` for a mapped one. */
  themeKey: string;
  rootElement: string;
  axes: Record<string, MuiAxisModel>;
  stateProps: MuiStateProp[];
  /** Non-root slots in manifest order; `className` is the own-component class or MUI's slot class. */
  slots: Record<string, MuiSlotModel>;
  /** The slot that renders `children`, or null. For a mapped component, null also when children go to MUI's children (see `mapped.children`). */
  childrenSlot: string | null;
  kind: 'own' | 'mapped';
  mapped: MuiMappedModel | null;
}

export interface MuiModel {
  generated: string;
  prefix: string;
  framework: { name: typeof MUI_PACKAGE; range: string; version: string | null };
  themeOptions: MuiThemeOptions;
  components: Record<string, MuiComponentModel>;
}
```

Schema (`muiModelSchema`): `framework` gains `version: z.string().nullable()`; the component theme entry gains `defaultProps: z.record(z.string(), scalar).optional()` **before** `styleOverrides` (keep object key order = render order); `variants[].style` becomes:

```ts
const declarations = z.record(z.string(), z.string());
const variantStyle = z
  .record(z.string(), z.union([declarations, z.record(z.string(), declarations)]))
  .refine((style) => {
    const keys = Object.keys(style);
    if (keys.length !== 1) {
      return false;
    }
    const value = style[keys[0]];
    const nested = Object.values(value).some((v) => typeof v === 'object');
    if (keys[0].startsWith('@media ')) {
      return nested && Object.keys(value).length === 1;
    }
    return !nested;
  }, 'exactly one selector key, or one @media key holding exactly one selector key');
```

and the component metadata entry gains:

```ts
      kind: z.enum(['own', 'mapped']),
      mapped: z
        .strictObject({
          component: z.string(),
          axisMap: z.record(z.string(), z.string()),
          slotMap: z.record(z.string(), z.string()),
          defaultProps: z.record(z.string(), scalar),
          children: z.union([
            z.strictObject({ kind: z.literal('children') }),
            z.strictObject({ kind: z.literal('slot'), slot: z.string(), muiProp: z.string() }),
            z.strictObject({ kind: z.literal('none') }),
          ]),
          ownProps: z.array(z.string()),
          unions: z.record(
            z.string(),
            z.strictObject({ overrides: z.string(), defaults: z.array(z.string()), values: z.array(z.string()) }),
          ),
          resetCount: z.number().int().nonnegative(),
        })
        .nullable(),
```

with `const scalar = z.union([z.string(), z.number(), z.boolean()]);`.

- [ ] **Step 2: `componentModel` for both kinds**

Replace `componentModel(component, prefix, diag)` with `componentModel(ir, component, catalog, diag)`:

```ts
/** The React-shell or wrapper description, or null after reporting every DS-E085/DS-E086 for the component. */
export function componentModel(
  ir: DesignIR,
  component: ComponentIR,
  catalog: MuiCatalog | null,
  diag: Diagnostics,
): MuiComponentModel | null {
  const before = diag.errors.length;
  const prefix = ir.meta.prefix;
  const at = manifestLocation(component);
  const fail = (message: string): void => {
    diag.add('DS-E085', `mui: ${component.name}: ${message}`, at);
  };
  const hints = muiMapping(component);
  let plan: MappingPlan | null = null;
  let catalogEntry: MuiCatalogComponent | null = null;
  if (hints) {
    if (!catalog) {
      diag.add(
        'DS-E086',
        `mui: ${component.name} is mapped onto ${hints.component} but ${CATALOG_AT.file} is missing; run bwp-ds capture-defaults --target mui`,
        at,
      );
      return null;
    }
    const framework = catalog.frameworkComponents[hints.component];
    if (!framework) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: the catalog has no entry for ${hints.component}; run bwp-ds capture-defaults --target mui`,
        at,
      );
      return null;
    }
    const entry = catalog.components[component.name];
    if (!entry || entry.component !== hints.component) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: the catalog entry is ${entry ? 'stale (the mapping changed)' : 'missing'}; run bwp-ds capture-defaults --target mui`,
        at,
      );
      return null;
    }
    // The probe facts (rendered root element, ButtonBase root) were captured
    // for this mapping's defaultProps and live on the component's entry.
    plan = planMapping(component, hints, framework, entry, diag);
    if (!plan) {
      return null;
    }
    const recorded = { axisMap: entry.axisMap, slotMap: entry.slotMap, defaultProps: entry.defaultProps };
    const planned = { axisMap: plan.axisMap, slotMap: plan.slotMap, defaultProps: plan.defaultProps };
    if (stableStringify(recorded) !== stableStringify(planned)) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: the catalog entry is stale (the mapping changed); run bwp-ds capture-defaults --target mui`,
        at,
      );
      return null;
    }
    catalogEntry = entry;
  }
  const rootElement = component.slots.root?.element ?? 'div';
  const themeKey = plan ? plan.themeKey : themeKeyFor(prefix, component.name);
  // … slot element checks (HTML/SVG/void) exactly as before …
  // … axis reserved-prop check as before …
  const stateProps: MuiStateProp[] = [];
  for (const state of component.states) {
    if (state === 'disabled') {
      stateProps.push({
        state,
        prop: propNameFor(state),
        // A mapped component hands `disabled` to MUI's prop; an own shell renders the attribute.
        attribute: plan || FORM_CONTROL_ELEMENTS.has(rootElement) ? 'disabled' : 'aria-disabled',
      });
    } else if (ariaAttributeFor(state)) {
      stateProps.push({ state, prop: propNameFor(state), attribute: ariaAttributeFor(state)! });
    } else if (!Object.hasOwn(PSEUDO_STATES, state)) {
      fail(`state "${state}" cannot be expressed as a React prop or a pseudo-class`);
    }
  }
  const nonRoot = component.slotOrder.filter((s) => s !== 'root');
  const childrenSlot = plan
    ? plan.children.kind === 'slot'
      ? plan.children.slot
      : null
    : nonRoot.includes('label')
      ? 'label'
      : (nonRoot.find((s) => !component.slots[s].optional) ?? null);
  // … slot reserved-prop check and the unified prop-uniqueness pass as before …
  if (diag.errors.length > before) {
    return null;
  }
  const model: MuiComponentModel = {
    name: component.name,
    exportName: pascalCase(component.name),
    themeKey,
    rootElement,
    axes: /* as before */,
    stateProps,
    slots: Object.fromEntries(
      nonRoot.map((s) => [
        s,
        {
          element: component.slots[s].element,
          optional: component.slots[s].optional,
          className: plan ? plan.slotClasses[s] : slotClassName(themeKey, s),
          prop: propNameFor(s),
        },
      ]),
    ),
    childrenSlot,
    kind: plan ? 'mapped' : 'own',
    mapped: null,
  };
  if (plan && catalogEntry) {
    const resets = computeResets(ir, component, plan, catalogEntry, diag, at);
    if (!resets) {
      return null;
    }
    model.mapped = {
      component: plan.component,
      axisMap: plan.axisMap,
      slotMap: plan.slotMap,
      defaultProps: plan.defaultProps,
      children: plan.children,
      ownProps: plan.ownProps,
      unions: plan.unions,
      resetCount: resets.length,
    };
  }
  return model;
}
```

Import `CATALOG_AT` and `MuiCatalogComponent` from `./catalog.js`, `stableStringify` from `../../ir/serialize.js`. The resets are computed twice (here for the count, in `componentTheme` for the entries); both calls are pure and cheap. If you prefer, return them from `componentModel` through a second return value used by `componentTheme`; the model JSON must not change either way.

`componentTheme(ir, component, model, diag)`:

- variant `props` keys: `model.mapped ? model.mapped.axisMap[a] : propNameFor(a)`.
- `specificityKey(axesCount, rule.states, model.rootElement, rule.slot === 'root' ? null : model.slots[rule.slot].className)`.
- For a mapped model: `const plan = …` is not needed; recompute `resets = computeResets(ir, component, planFromModel, catalogEntry, …)`. To avoid re-planning, have `componentModel` return `{ model, resets }` internally (an exported `buildComponentModel` returning both, with `componentModel` as the thin public wrapper that returns `model`). Then `componentTheme` receives `resets` and returns `{ defaultProps: model.mapped.defaultProps, styleOverrides: { root }, variants: [...resets, ...dsVariants] }` for mapped, and `{ styleOverrides: { root }, variants }` for own (no `defaultProps` key at all).

`buildMuiModel(ir, catalog, ctx, diag)`: new signature; `framework: { name: MUI_PACKAGE, range: MUI_RANGE, version: catalog?.framework.version ?? null }`; `themeOptions.components[model.themeKey] = …` as before (theme keys `MuiButton` and `BwpExample` coexist; `components` metadata is still keyed by design-system name).

- [ ] **Step 3: Augmentation for mapped components**

`render-ts.ts` `renderAugmentationTs`: after the closing `}` of `declare module '@mui/material/styles'`, for each distinct `mapped.component` (sorted), emit one block. Collect first:

```ts
/** MUI component → overrides interface → member → enabled. */
const overrides = new Map<string, Map<string, Map<string, boolean>>>();
for (const c of components) {
  if (!c.mapped) continue;
  const byInterface = overrides.get(c.mapped.component) ?? new Map();
  overrides.set(c.mapped.component, byInterface);
  for (const union of Object.values(c.mapped.unions)) {
    const members = byInterface.get(union.overrides) ?? new Map<string, boolean>();
    byInterface.set(union.overrides, members);
    for (const d of union.defaults) if (!members.has(d)) members.set(d, false);
    for (const v of union.values) members.set(v, true);
  }
}
```

then render, sorted at every level with `codeUnitCompare`:

```ts
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    inherit: false;
    primary: false;
  }
  interface ButtonPropsSizeOverrides {
    large: false;
    medium: false;
    small: false;
  }
  interface ButtonPropsVariantOverrides {
    contained: false;
    loud: true;
    outlined: false;
    quiet: true;
    text: false;
  }
}
```

Precede the first such block with the comment line `// Mapped components: MUI's default values are disabled, the design system's enabled; a prop no axis maps to accepts nothing.`. Members are rendered with `renderKey` (quoted when not an identifier, e.g. `'2xl': true;`). The `ComponentsPropsList`, `ComponentNameToClassKey`, and `Components` blocks list **own** components only (MUI already declares `MuiButton`); the `import type { <Pascal>Props }` lines likewise only for own components.

- [ ] **Step 4: The wrapper renderer and dispatch**

`render-component.ts`: rename the existing body of `renderComponentTsx` to `renderOwnComponentTsx` and add:

```ts
export function renderComponentTsx(model: MuiModel, c: MuiComponentModel): string {
  return c.mapped ? renderMappedComponentTsx(model, c) : renderOwnComponentTsx(model, c);
}

/**
 * A mapped component is MUI's component with the design system's props:
 * axis props (exact unions) under their design-system names, forwarded to
 * the MUI props they map to; `disabled` to MUI's prop; ARIA states as
 * attributes after the spread; slots under their design-system names,
 * forwarded to MUI's slot props; children per the mapping's children mode.
 * Every MUI own prop is removed from the accepted DOM props, so MUI-only
 * props (`sx`, `fullWidth`, …) are type errors.
 */
export function renderMappedComponentTsx(model: MuiModel, c: MuiComponentModel): string {
  const m = c.mapped!;
  const P = c.exportName;
  const Mui = `Mui${m.component}`;
  const classes = classesName(c);
  const axisNames = Object.keys(c.axes);
  const slotNames = Object.keys(c.slots);
  const slotProps = slotNames.filter((s) => s !== c.childrenSlot);
  const hasChildren = m.children.kind !== 'none';
  const owned = [
    ...new Set([
      'children',
      ...axisNames.map((a) => c.axes[a].prop),
      ...c.stateProps.map((p) => p.prop),
      ...c.stateProps.map((p) => p.attribute),
      ...slotProps.map((s) => c.slots[s].prop),
      ...m.ownProps,
    ]),
  ].sort(codeUnitCompare);

  const lines: string[] = [
    muiHeader(model),
    '',
    "import * as React from 'react';",
    `import ${Mui} from '@mui/material/${m.component}';`,
    "import '../augmentation.js';",
    '',
  ];
  for (const axis of axisNames) {
    lines.push(`export type ${P}${pascalCase(axis)} = ${union(c.axes[axis].values)};`);
  }
  if (axisNames.length > 0) {
    lines.push('');
  }
  lines.push(
    `export interface ${P}Props`,
    `  extends Omit<React.ComponentPropsWithoutRef<'${c.rootElement}'>, ${union(owned)}> {`,
  );
  for (const axis of axisNames) {
    lines.push(
      `  /** Axis \`${axis}\`; default \`${c.axes[axis].default}\`. MUI prop \`${m.axisMap[axis]}\`. */`,
      `  ${c.axes[axis].prop}?: ${P}${pascalCase(axis)};`,
    );
  }
  for (const state of c.stateProps) {
    lines.push(
      state.state === 'disabled'
        ? "  /** State `disabled`; MUI's `disabled` prop. */"
        : `  /** State \`${state.state}\`; rendered as the \`${state.attribute}\` attribute. */`,
      `  ${state.prop}?: boolean;`,
    );
  }
  if (hasChildren) {
    lines.push(
      m.children.kind === 'slot'
        ? `  /** Slot \`${m.children.slot}\`; MUI prop \`${m.children.muiProp}\`. */`
        : '  /** Content of the root element. */',
      '  children?: React.ReactNode;',
    );
  }
  for (const slot of slotProps) {
    lines.push(
      `  /** Slot \`${slot}\`${c.slots[slot].optional ? ' (optional)' : ''}; MUI slot \`${m.slotMap[slot]}\`. */`,
      `  ${c.slots[slot].prop}?: React.ReactNode;`,
    );
  }
  lines.push('}', '', `export const ${classes} = {`, `  root: '${m.component === '' ? '' : `Mui${m.component}-root`}',`);
  for (const slot of slotNames) {
    lines.push(`  ${c.slots[slot].prop}: '${c.slots[slot].className}',`);
  }
  lines.push(
    '} as const;',
    '',
    `/** MUI's \`${m.component}\` with the design system's props; \`theme.components.${c.themeKey}\` carries the styles. */`,
    `export const ${P} = React.forwardRef<React.ComponentRef<'${c.rootElement}'>, ${P}Props>(`,
    `  function ${P}(props, ref) {`,
  );
  const destructured = [
    ...axisNames.map((a) => `${c.axes[a].prop} = ${quoteTs(c.axes[a].default)}`),
    ...c.stateProps.map((p) => `${p.prop} = false`),
    ...(hasChildren ? ['children'] : []),
    ...slotProps.map((s) => c.slots[s].prop),
    '...other',
  ];
  lines.push(`    const { ${destructured.join(', ')} } = props;`, '    return (', `      <${Mui}`, '        ref={ref}');
  for (const axis of axisNames) {
    lines.push(`        ${m.axisMap[axis]}={${c.axes[axis].prop}}`);
  }
  for (const state of c.stateProps) {
    if (state.state === 'disabled') {
      lines.push(`        disabled={${state.prop}}`);
    }
  }
  for (const slot of slotProps) {
    lines.push(`        ${m.slotMap[slot]}={${c.slots[slot].prop}}`);
  }
  if (m.children.kind === 'slot') {
    lines.push(`        ${m.children.muiProp}={children}`);
  }
  lines.push('        {...other}');
  for (const state of c.stateProps) {
    if (state.state !== 'disabled') {
      lines.push(`        ${state.attribute}={${state.prop} ? true : undefined}`);
    }
  }
  if (m.children.kind === 'children') {
    lines.push('      >', '        {children}', `      </${Mui}>`);
  } else {
    lines.push('      />');
  }
  lines.push('    );', '  },', ');', '');
  return lines.join('\n');
}
```

(Write `root: 'Mui<Component>-root'` directly; the ternary above is only there to show the value is derived from the MUI component name, not the theme key.)

`renderTypecheckTsx`: import each distinct mapped MUI component once (`import MuiButton from '@mui/material/Button';`, sorted, before the components import). For a mapped component, after the accepted usage and the per-axis `__not_a_value__` probe, add:

```ts
// per axis whose union has a default outside the design-system values (first such default, sorted):
// @ts-expect-error tone rejects MUI's default "text"
export const btnRejectedToneDefault = <Btn tone="text" />;
// the first ownProp (sorted) that the wrapper does not accept:
// @ts-expect-error MUI-only props are rejected on the wrapper
export const btnRejectedMuiProp = <Btn classes={undefined} />;
// per mapped axis with such a default:
// @ts-expect-error the augmentation narrows MUI's own Button: "text" is disabled
export const btnMuiRejectedVariant = <MuiButton variant="text" />;
export const btnMuiAccepted = <MuiButton variant="loud" />;
// per unmapped union prop with at least one default:
// @ts-expect-error color has no design-system values, so it accepts nothing
export const btnMuiRejectedColor = <MuiButton color="primary" />;
```

The wrapper "accepts" exactly: axis props, state props, `children` (when it has them), slot props, and DOM props; so the rejected MUI prop is the first of `m.ownProps` not in `{ ...axis targets, ...slot targets, 'disabled', 'children' }`. The accepted usage keeps the own-component shape (`content` as children) only when `hasChildren`.

`generate.ts`: `generateMui(ir, catalog, ctx, diag)` → `buildMuiModel(ir, catalog, ctx, diag)`. `index.ts`: `generate: (ir, catalog, ctx, diag) => generateMui(ir, catalog, ctx, diag)`.

- [ ] **Step 5: Tests**

`test/mui-model.test.ts` (update existing calls to `buildMuiModel(ir, null, ctx, diag)` and `componentModel(ir, component, null, diag)`), add:

```ts
describe('mui model: mapped components', () => {
  function mapped(files = BTN_FILES, catalog: MuiCatalog | null = FX_CATALOG) {
    const root = twRoot(files);
    const { ir, config } = twBuild(root);
    const diag = new Diagnostics();
    const model = buildMuiModel(ir, catalog, twContext(root, config), diag);
    return { model, diag, ir };
  }

  it('builds a MuiButton theme entry: defaultProps, base rule, resets, then design-system variants', () => {
    const { model, diag } = mapped();
    expect(diag.errors).toEqual([]);
    expect(model!.framework).toEqual({ name: '@mui/material', range: '^9.4.0', version: '9.4.0' });
    const entry = model!.themeOptions.components.MuiButton;
    expect(Object.keys(entry)).toEqual(['defaultProps', 'styleOverrides', 'variants']);
    expect(entry.defaultProps).toEqual({
      disableElevation: true, disableFocusRipple: true, disableRipple: true,
      disableTouchRipple: true, focusRipple: false, variant: 'quiet',
    });
    expect(entry.styleOverrides.root).toEqual({
      color: 'var(--fx-palette-tokens-text-default)',
      cursor: 'pointer',
      display: 'inline-flex',
      fontFamily: 'var(--fx-tokens-fontFamily-body)',
      paddingBottom: 'var(--fx-tokens-space-2)',
      paddingLeft: 'var(--fx-tokens-space-2)',
      paddingRight: 'var(--fx-tokens-space-2)',
      paddingTop: 'var(--fx-tokens-space-2)',
    });
    const meta = model!.components.btn;
    expect(meta.kind).toBe('mapped');
    expect(meta.themeKey).toBe('MuiButton');
    expect(meta.slots.icon.className).toBe('MuiButton-startIcon');
    expect(meta.stateProps).toEqual([{ state: 'disabled', prop: 'disabled', attribute: 'disabled' }]);
    expect(meta.mapped!.resetCount).toBe(12);
    expect(entry.variants.slice(0, 12).every((v) => 'variant' in v.props)).toBe(true);
    expect(entry.variants.slice(12)).toEqual([
      { props: {}, style: { '&:hover': { boxShadow: 'var(--fx-tokens-shadow-focus)' } } },
      { props: {}, style: { '&:disabled': { cursor: 'not-allowed' } } },
      { props: { variant: 'loud' }, style: { '&&': { minWidth: '44px' } } },
      { props: {}, style: { '& .MuiButton-startIcon': { width: '20px' } } },
    ]);
    expect(muiModelSchema.safeParse(JSON.parse(JSON.stringify(model))).success).toBe(true);
    // own components are untouched
    expect(model!.themeOptions.components.FxChip.defaultProps).toBeUndefined();
    expect(model!.components.chip.kind).toBe('own');
    expect(model!.components.chip.mapped).toBeNull();
  });

  it.each([
    ['missing catalog', null, 'catalogs/mui.json is missing'],
    ['missing framework component', { ...FX_CATALOG, frameworkComponents: {} }, 'no entry for Button'],
    ['missing component entry', { ...FX_CATALOG, components: {} }, 'catalog entry is missing'],
    [
      'stale mapping',
      { ...FX_CATALOG, components: { btn: { ...FX_CATALOG.components.btn, slotMap: { icon: 'endIcon' } } } },
      'stale (the mapping changed)',
    ],
    [
      'missing permutation',
      { ...FX_CATALOG, components: { btn: { ...FX_CATALOG.components.btn, renders: FX_CATALOG.components.btn.renders.slice(1) } } },
      'no render for tone=quiet',
    ],
  ])('reports DS-E086 for a %s', (_label, catalog, message) => {
    const { model, diag } = mapped(BTN_FILES, catalog as MuiCatalog | null);
    expect(model).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain(message);
  });

  it('routes children through a mapped label slot', () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      slots: Record<string, unknown>;
      targets: { mui: { slotMap: Record<string, string> } };
    };
    m.slots.label = { element: 'span' };
    m.targets.mui.slotMap.label = 'label';
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const catalog = structuredClone(FX_CATALOG);
    catalog.components.btn.slotMap = { icon: 'startIcon', label: 'label' };
    const { model, diag } = mapped(files, catalog);
    expect(diag.errors).toEqual([]);
    expect(model!.components.btn.childrenSlot).toBe('label');
    expect(model!.components.btn.mapped!.children).toEqual({ kind: 'slot', slot: 'label', muiProp: 'label' });
    expect(model!.components.btn.slots.label.className).toBe('MuiButton-label');
  });
});
```

`test/mui-generate.test.ts` (update `generateMui(ir, null, ctx, diag)` in the helper and add a `generatedMapped()` helper that passes `FX_CATALOG` with `BTN_FILES`):

```ts
describe('generateMui: mapped components', () => {
  it('emits a wrapper around MUI Button with design-system props only', () => {
    const { byPath, diag } = generatedMapped();
    expect(diag.errors).toEqual([]);
    const tsx = byPath['components/Btn.tsx'];
    expect(tsx).toContain("import MuiButton from '@mui/material/Button';");
    expect(tsx).toContain("import '../augmentation.js';");
    expect(tsx).toContain("export type BtnTone = 'quiet' | 'loud';");
    expect(tsx).toMatch(/extends Omit<React\.ComponentPropsWithoutRef<'button'>, [^>]*'sx'[^>]*> \{/);
    expect(tsx).toContain("'fullWidth'");
    expect(tsx).toContain('  tone?: BtnTone;');
    expect(tsx).toContain('  disabled?: boolean;');
    expect(tsx).toContain('  children?: React.ReactNode;');
    expect(tsx).toContain('  icon?: React.ReactNode;');
    expect(tsx).toContain("  root: 'MuiButton-root',");
    expect(tsx).toContain("  icon: 'MuiButton-startIcon',");
    expect(tsx).toContain("const { tone = 'quiet', disabled = false, children, icon, ...other } = props;");
    expect(tsx).toContain('        variant={tone}');
    expect(tsx).toContain('        disabled={disabled}');
    expect(tsx).toContain('        startIcon={icon}');
    expect(tsx).toContain('        {...other}');
    expect(tsx).toContain('        {children}');
    expect(tsx).not.toContain('styled(');
    expect(tsx).not.toContain('ownerState');
  });

  it('augments the MUI component: defaults disabled, design-system values enabled, unmapped unions emptied', () => {
    const { byPath } = generatedMapped();
    const aug = byPath['augmentation.ts'];
    expect(aug).toContain("declare module '@mui/material/Button' {");
    expect(aug).toContain('  interface ButtonPropsVariantOverrides {\n    contained: false;\n    loud: true;\n    outlined: false;\n    quiet: true;\n    text: false;\n  }');
    expect(aug).toContain('  interface ButtonPropsSizeOverrides {\n    large: false;\n    medium: false;\n    small: false;\n  }');
    expect(aug).toContain('  interface ButtonPropsColorOverrides {\n    inherit: false;\n    primary: false;\n  }');
    // mapped components are not listed in the styles augmentation
    expect(aug).not.toContain('MuiButton: BtnProps');
    expect(aug).not.toContain('MuiButton?: {');
    expect(aug).toContain('FxChip: ChipProps;');
  });

  it('probes the mapped type contract', () => {
    const { byPath } = generatedMapped();
    const probe = byPath['typecheck.tsx'];
    expect(probe).toContain("import MuiButton from '@mui/material/Button';");
    expect(probe).toContain('export const btnAccepted = (\n  <Btn tone="loud" disabled icon="icon">\n    content\n  </Btn>\n);');
    expect(probe).toContain('// @ts-expect-error tone rejects MUI\'s default "text"\nexport const btnRejectedToneDefault = <Btn tone="text" />;');
    expect(probe).toContain('// @ts-expect-error MUI-only props are rejected on the wrapper\nexport const btnRejectedMuiProp = <Btn classes={undefined} />;');
    expect(probe).toContain('export const btnMuiRejectedVariant = <MuiButton variant="text" />;');
    expect(probe).toContain('export const btnMuiAccepted = <MuiButton variant="loud" />;');
    expect(probe).toContain('export const btnMuiRejectedColor = <MuiButton color="primary" />;');
    expect(probe).toContain('export const btnMuiRejectedSize = <MuiButton size="large" />;');
  });

  it('renders theme.ts with the MuiButton entry and keeps the model deep-equal', () => {
    const { byPath } = generatedMapped();
    const theme = byPath['theme.ts'];
    const model = JSON.parse(byPath['theme.model.json']) as { themeOptions: unknown };
    const literal = theme.slice(theme.indexOf('= {') + 2, theme.indexOf(' satisfies ThemeOptions;'));
    expect(new Function(`return ${literal};`)()).toEqual(model.themeOptions);
    expect(theme).toContain("'@media (hover: hover)': {");
    expect(theme).toContain("'--variant-containedBg': 'revert',");
    expect(theme).toContain('WebkitTapHighlightColor: \'revert\',');
  });
});
```

(`btnMuiRejectedSize` follows from "per unmapped union prop with at least one default": `size` and `color` are both unmapped in the fixture; the probe names them `btnMuiRejected<PascalProp>`.) Extend the first `generateMui` test's expected file list assertion so the mapped run includes `components/Btn.tsx` in sorted position (`Btn` before `Chip`).

- [ ] **Step 6: Run**

Whole compiler suite, `tsc`, `eslint`, `prettier --check`. From the root: `npm run build && npm run verify` (unchanged repo output; no catalog, no mapped component). Also compile the fixture's generated output against real MUI once by hand, as the Plan 3 reviewer did: write the `generatedMapped()` files into a scratch directory inside `packages/styles-mui/src/probe-tmp/` with a `tsconfig.json` extending the package's, run `npx tsc -p` there, confirm zero errors including every `@ts-expect-error` line being satisfied, then delete the directory (`rm` each file, `rmdir`). This is the real proof that the wrapper, augmentation, and probes agree with MUI 9.4's types; record the result in the execution log.

---

## Task 7: Round-trip for mapped components

**Files:**
- Modify: `packages/ds-compiler/src/targets/mui/reparse.ts`
- Modify: `packages/ds-compiler/src/targets/mui/index.ts`
- Test: `packages/ds-compiler/test/mui-roundtrip.test.ts`, `test/verify.test.ts`

- [ ] **Step 1: Failing tests**

`test/mui-roundtrip.test.ts`: change `reparse(files, ir, ctx)` to take and pass a catalog (`muiPlugin.reparse(files, ir, catalog, ctx, diag)`, `null` for the existing own-component tests), add a `generatedMapped()` helper (`twRoot({ ...BTN_FILES, ...catalogFile() })`, `muiPlugin.generate(ir, FX_CATALOG, ctx, new Diagnostics())`), and add:

```ts
describe('mui round-trip: mapped components', () => {
  it('reparses the btn fixture to the source IR, resets excluded', () => {
    const { ir, ctx, files } = generatedMapped();
    const { diag, reparsed } = reparse(files, ir, FX_CATALOG, ctx);
    expect(diag.errors).toEqual([]);
    expect(reparsed).not.toBeNull();
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
    expect(reparsed!.components.btn.rules).toHaveLength(ir.components.btn.rules.length);
  });

  const MUI = (m: MuiModel) => m.themeOptions.components.MuiButton;

  it.each<[string, (m: MuiModel) => void, string]>([
    ['a dropped reset', (m) => { MUI(m).variants.splice(0, 1); }, 'the leading 12 variants are not the resets'],
    ['an edited reset value', (m) => { (MUI(m).variants[0].style['&'] as Record<string, string>).minWidth = 'unset'; }, 'the leading 12 variants are not the resets'],
    ['reordered resets', (m) => { const v = MUI(m).variants; [v[0], v[1]] = [v[1], v[0]]; }, 'the leading 12 variants are not the resets'],
    ['a missing parity default prop', (m) => { delete MUI(m).defaultProps!.disableRipple; }, 'defaultProps differ from the mapping'],
    ['a design-system variant pointing at another MUI slot', (m) => { const v = MUI(m).variants[15]; v.style = { '& .MuiButton-endIcon': v.style['& .MuiButton-startIcon'] }; }, 'not in the generated form'],
    ['a media key outside the reset prefix', (m) => { const v = MUI(m).variants[12]; v.style = { '@media print': v.style }; }, 'nested (media) key outside the reset prefix'],
    ['tampered metadata', (m) => { m.components.btn.mapped!.resetCount = 3; }, 'component metadata differs from the IR (mapped)'],
    ['a wrong framework version', (m) => { m.framework.version = '9.9.9'; }, 'framework.version is "9.9.9", expected "9.4.0"'],
    ['defaultProps on an own component', (m) => { m.themeOptions.components.FxChip.defaultProps = { disableRipple: true }; }, 'an own component has no defaultProps'],
  ])('rejects %s with DS-E081', (_label, mutate, message) => {
    const { ir, ctx, files } = generatedMapped();
    const { diag, reparsed } = reparse(tamper(files, mutate), ir, FX_CATALOG, ctx);
    expect(reparsed).toBeNull();
    expect(diag.errors.map((e) => e.code)).toContain('DS-E081');
    expect(diag.errors.map((e) => e.message).join('\n')).toContain(message);
  });

  it('fails when the catalog it is given differs from the one used to generate', () => {
    const { ir, ctx, files } = generatedMapped();
    const other = structuredClone(FX_CATALOG);
    other.components.btn.renders[0].rules[0].declarations['letter-spacing'] = '1px';
    const { diag, reparsed } = reparse(files, ir, other, ctx);
    expect(reparsed).toBeNull();
    expect(diag.errors[0].message).toContain('the leading 12 variants are not the resets');
  });
});
```

(Index 12 is the first design-system variant after 12 resets, index 15 the icon slot rule; adjust only if the fixture changes.)

`test/verify.test.ts`, add:

```ts
describe('verify with a mapped component', () => {
  it('passes end to end with the fixture catalog and writes the wrapper', () => {
    const root = twRoot({ ...BTN_FILES, ...catalogFile() });
    build(root);
    const gen = generate(root);
    expect(gen.diagnostics.errors).toEqual([]);
    expect(gen.written.some((p) => p.endsWith('components/Btn.tsx'))).toBe(true);
    const result = verify(root);
    expect(result.steps).toEqual({ lint: 'pass', drift: 'pass', roundtrip: 'pass', coverage: 'pass' });
    expect(result.diagnostics.errors).toEqual([]);
    // the catalog's version cannot be checked from a temp outDir
    expect(result.diagnostics.warnings.map((w) => w.code)).toEqual(['DS-W004']);
    expect(readFileSync(result.coverageFile!, 'utf8')).toContain('| `btn` | supported | supported |');
  });

  it('fails drift with DS-E086 and writes nothing when the catalog is stale', () => {
    const stale = structuredClone(FX_CATALOG);
    stale.components.btn.renders = stale.components.btn.renders.slice(0, 1);
    const root = twRoot({ ...BTN_FILES, ...catalogFile(stale) });
    build(root);
    const gen = generate(root);
    expect(gen.written).toEqual([]);
    expect(gen.diagnostics.errors.map((e) => e.code)).toEqual(['DS-E086']);
    const result = verify(root);
    expect(result.steps.drift).toBe('fail');
    expect(result.diagnostics.errors.some((e) => e.code === 'DS-E086' && e.message.includes('no render for tone=loud'))).toBe(true);
  });
});
```

- [ ] **Step 2: Implement**

`src/targets/mui/reparse.ts`:

- Signature `reparseMui(files, ir, catalog: MuiCatalog | null, ctx, diag)`; `checkMeta(model, catalog, config, diag)` adds:

```ts
  if (model.framework.range !== MUI_RANGE) {
    fail(`framework.range is "${model.framework.range}", expected "${MUI_RANGE}"`);
  }
  const expectedVersion = catalog?.framework.version ?? null;
  if (model.framework.version !== expectedVersion) {
    fail(
      `framework.version is ${JSON.stringify(model.framework.version)}, expected ${JSON.stringify(expectedVersion)}`,
    );
  }
```

- `reparseComponents(model, ir, catalog, tokens, config, diag)`: the theme-key lookup uses the model's metadata, `new Map(Object.values(model.components).map((c) => [c.themeKey, c.name]))`; a theme key with no metadata, or metadata naming a component the IR lacks, is `generated theme entry "${themeKey}" matches no component`. The metadata check calls `componentModel(ir, component, catalog, new Diagnostics())`. After it, with `meta = model.components[name]` (now known equal to the rebuild):

```ts
    const slotByClass: Record<string, string> = Object.fromEntries(
      Object.entries(meta.slots).map(([slot, s]) => [s.className, slot]),
    );
    const entry = model.themeOptions.components[themeKey];
    let variants = entry.variants;
    if (meta.mapped) {
      if (stableStringify(entry.defaultProps ?? null) !== stableStringify(meta.mapped.defaultProps)) {
        diag.add('DS-E081', `mui: ${name}: defaultProps differ from the mapping`, AT);
        continue;
      }
      const hints = muiMapping(component);
      const framework = catalog?.frameworkComponents[meta.mapped.component];
      const catalogEntry = catalog?.components[name];
      const plan = hints && framework && catalogEntry ? planMapping(component, hints, framework, catalogEntry, new Diagnostics()) : null;
      const expected = plan && catalogEntry ? computeResets(ir, component, plan, catalogEntry, new Diagnostics(), AT) : null;
      if (!expected) {
        diag.add('DS-E081', `mui: ${name}: the resets cannot be recomputed from the catalog`, AT);
        continue;
      }
      const prefix = entry.variants.slice(0, expected.length);
      if (stableStringify(prefix) !== stableStringify(expected)) {
        diag.add(
          'DS-E081',
          `mui: ${name}: the leading ${expected.length} variants are not the resets computed from the catalog`,
          AT,
        );
        continue;
      }
      variants = entry.variants.slice(expected.length);
    } else if (entry.defaultProps !== undefined) {
      diag.add('DS-E081', `mui: ${name}: an own component has no defaultProps`, AT);
      continue;
    }
```

  then iterate `variants` (not `entry.variants`) with the index offset for messages (`variants[${i + offset}]`). Inside the loop: the style value must be flat (`Object.values(style).every((v) => typeof v === 'string')`), else `DS-E081 … has a nested (media) key outside the reset prefix`; the variant `props` map back through `meta.mapped.axisMap` (find the axis whose MUI prop equals the key) for mapped components and `propNameFor` for own ones; `parseKey(key, slotByClass)` replaces the `themeKey`/`slots` parameters:

```ts
const KEY = /^(&+)((?::[a-z-]+|\[[^\]]+\])*)( \.([A-Za-z0-9_-]+))?$/;

function parseKey(key: string, slotByClass: Record<string, string>): ParsedKey | null {
  const m = KEY.exec(key);
  if (!m) return null;
  let slot = 'root';
  if (m[3] !== undefined) {
    const found = slotByClass[m[4]];
    if (found === undefined) return null;
    slot = found;
  }
  // states as before
}
```

  and the canonical key is `specificityKey(Object.keys(axes).length, parsed.states, rootElement, parsed.slot === 'root' ? null : meta.slots[parsed.slot].className)`.

- `src/targets/mui/index.ts`: `reparse: (files, ir, catalog, ctx, diag) => reparseMui(files, ir, catalog, ctx, diag)`.

- [ ] **Step 3: Run**

Whole suite, `tsc`, `eslint`, `prettier --check`. Root `npm run build && npm run verify` unchanged.

---

## Task 8: Starter `button`, captured catalog, regenerated output, package tests, docs

**Files:**
- Create: `packages/styles-css/src/components/button/button.manifest.json`, `button.css` (via scaffold, then filled)
- Create: `packages/styles-css/catalogs/mui.json` (captured)
- Modify: `packages/styles-css/package.json` (`files` gains `"catalogs"`), `packages/styles-css/.prettierignore` (add `catalogs/`), root `.prettierignore` (add `packages/styles-css/catalogs/`)
- Regenerated: `packages/styles-css/design.ir.json`, `packages/styles-css/src/index.css`, `packages/styles-tailwind/src/generated/*`, `packages/styles-mui/src/generated/**` (new `components/Button.tsx`), `docs/design-system/coverage.md`
- Modify: `packages/styles-mui/test/theme.test.ts`, `test/render.test.tsx`, `packages/styles-mui/README.md`
- Modify: `docs/design-system/targets/mui.md`, `errors.md`, `verification.md`, `authoring-guide.md`, `AGENTS.md`, root `README.md`

- [ ] **Step 1: Scaffold and fill the starter component**

```bash
npm run ds -- scaffold component button --axis variant=filled,ghost --axis size=md,sm --state hover,focus-visible,active,disabled --slot icon --root-element button
```

Replace the scaffolded `packages/styles-css/src/components/button/button.manifest.json` with:

```json
{
  "$schema": "../../../../ds-compiler/schemas/manifest.schema.json",
  "name": "button",
  "displayName": "Button",
  "description": "Starter component mapped onto MUI Button. Replace it with real components.",
  "axes": {
    "variant": { "values": ["filled", "ghost"], "default": "filled" },
    "size": { "values": ["sm", "md"], "default": "md" }
  },
  "states": ["hover", "focus-visible", "active", "disabled"],
  "slots": {
    "root": { "element": "button" },
    "icon": { "element": "span", "optional": true }
  },
  "preview": { "label": "Button", "icon": "plus" },
  "targets": {
    "tailwind": {},
    "mui": {
      "component": "Button",
      "axisMap": { "variant": "variant", "size": "size" },
      "slotMap": { "icon": "startIcon" }
    },
    "flutter": {
      "excluded": "starter component; the real design system replaces it"
    }
  }
}
```

and `button.css` with:

```css
/* Starter component mapped onto MUI Button. Replace with real components; keep
   the selector grammar from docs/design-system/authoring-guide.md#components. */
.bwp-button {
  appearance: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--bwp-space-2);
  min-height: var(--bwp-size-control-md);
  padding: var(--bwp-space-2) var(--bwp-space-4);
  border-style: solid;
  border-width: var(--bwp-border-width-1);
  border-color: transparent;
  border-radius: var(--bwp-radius-md);
  background-color: var(--bwp-color-accent-default);
  color: var(--bwp-color-text-inverse);
  font-family: var(--bwp-font-family-body);
  font-size: var(--bwp-font-size-md);
  font-weight: var(--bwp-font-weight-semibold);
  line-height: var(--bwp-line-height-tight);
  letter-spacing: var(--bwp-letter-spacing-tight);
  text-transform: none;
  cursor: pointer;
  transition-property: background-color, border-color, color;
  transition-duration: var(--bwp-duration-fast);
  transition-timing-function: var(--bwp-easing-standard);
}

.bwp-button:hover {
  background-color: var(--bwp-color-accent-hover);
}

.bwp-button:focus-visible {
  outline-style: none;
  box-shadow: var(--bwp-shadow-focus);
}

.bwp-button:active {
  background-color: var(--bwp-color-accent-hover);
}

.bwp-button:disabled {
  cursor: not-allowed;
  opacity: var(--bwp-opacity-disabled);
}

.bwp-button[data-variant='ghost'] {
  border-color: var(--bwp-color-border-default);
  background-color: transparent;
  color: var(--bwp-color-text-default);
}

.bwp-button[data-variant='ghost']:hover {
  background-color: var(--bwp-color-surface-raised);
}

.bwp-button[data-variant='ghost']:active {
  background-color: var(--bwp-color-surface-raised);
}

.bwp-button[data-size='sm'] {
  min-height: var(--bwp-size-control-sm);
  padding: var(--bwp-space-1) var(--bwp-space-3);
  font-size: var(--bwp-font-size-sm);
}

.bwp-button .bwp-button__icon {
  display: inline-flex;
  width: var(--bwp-size-icon-md);
  height: var(--bwp-size-icon-md);
}
```

Every token referenced exists already (the `example` component uses the same ones). Run `npm run ds -- lint` (0 errors; `DS-W001` must not appear because the baseline properties are declared), then `npm run ds -- build`.

- [ ] **Step 2: Capture, generate, verify**

```bash
npm run ds -- capture-defaults --target mui
npm run ds -- generate
npm run verify
```

Expected: `capture-defaults` writes `packages/styles-css/catalogs/mui.json` with `framework.version` `9.4.0` (whatever `npm ls @mui/material` reports), `frameworkComponents.Button`, `components.button` with 4 renders (`filled`/`ghost` × `sm`/`md`); `generate` writes `components/Button.tsx` plus the rest; `verify` prints all four `pass` with no `DS-W004` (MUI resolves from `packages/styles-mui`). `coverage.md` gains a `button` row. Run `capture-defaults` a second time and confirm `git status --short` does not change: the catalog is deterministic.

Add `"catalogs"` to `files` in `packages/styles-css/package.json`; add `catalogs/` to `packages/styles-css/.prettierignore` (create the file if the package has none, mirroring `packages/styles-mui/.prettierignore`) and `packages/styles-css/catalogs/` to the root `.prettierignore`.

- [ ] **Step 3: Package build, typecheck, lint, tests**

`npm run build -w @bwp-web/styles-mui && npm run typecheck -w @bwp-web/styles-mui && npm run lint -w @bwp-web/styles-mui` must pass: this compiles the generated wrapper, the augmentation blocks, and `typecheck.tsx` (with the `MuiButton` probes) against real MUI. If `tsc` fails here, the fix is in the renderer (Task 6), then regenerate; never edit `src/generated/`.

`packages/styles-mui/test/theme.test.ts`, add (types: extend the local `Model` interface with `defaultProps?: Record<string, unknown>` and `variants: { props: Record<string, string>; style: Record<string, unknown> }[]`, and `components[name].kind`/`mapped: { resetCount: number } | null`):

```ts
  it('themes MUI Button with parity defaults, resets first, then the design system', () => {
    const entry = model.themeOptions.components.MuiButton;
    expect(entry.defaultProps).toMatchObject({
      disableElevation: true, disableFocusRipple: true, disableRipple: true,
      disableTouchRipple: true, focusRipple: false, size: 'md', variant: 'filled',
    });
    const resetCount = model.components.button.mapped!.resetCount;
    expect(resetCount).toBeGreaterThan(0);
    const resets = entry.variants.slice(0, resetCount);
    expect(resets.every((v) => 'variant' in v.props && 'size' in v.props)).toBe(true);
    expect(JSON.stringify(resets)).toContain('"minWidth":"revert"');
    expect(JSON.stringify(resets)).toContain('"WebkitTapHighlightColor":"revert"');
    const theme = generated.createBwpTheme();
    expect(theme.components?.MuiButton?.defaultProps).toEqual(entry.defaultProps);
  });
```

`test/render.test.tsx`, add:

```tsx
  it('renders Button through MUI with the ripple removed and MUI defaults neutralised', () => {
    const theme = generated.createBwpTheme();
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <generated.Button variant="ghost" size="sm" icon={<i>+</i>} disabled>
          Go
        </generated.Button>
      </ThemeProvider>,
    );
    const dom = html.replace(/<style[\s\S]*?<\/style>/g, '');
    expect(dom).toMatch(/<button[^>]*class="[^"]*MuiButton-root[^"]*"/);
    expect(dom).toContain('MuiButton-startIcon');
    expect(dom).toContain('disabled=""');
    expect(dom).not.toContain('MuiTouchRipple');
    const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
    expect(css).toContain('min-width:revert');
    expect(css).toContain('text-transform:none'); // the design system's base value, restated over MUI's uppercase
    expect(css).toContain('padding-top:var(--bwp-tokens-space-1)'); // size="sm"
    expect(css).toContain('background-color:transparent'); // variant="ghost"
    expect(generated.buttonClasses).toEqual({ root: 'MuiButton-root', icon: 'MuiButton-startIcon' });
  });
```

(MUI's uppercase `text-transform` is overridden at `&` by `styleOverrides.root`'s `textTransform: 'none'`; the reset generator therefore emits nothing for it and the expectation is on the design system's own declaration. Where the renderer prints the value differently, e.g. `text-transform:none;` with a semicolon, match the actual text but keep the assertions' intent.)

`npm run test -w @bwp-web/styles-mui` → green.

- [ ] **Step 4: Docs**

`docs/design-system/targets/mui.md`: update the status paragraph (mapped components are here; Flutter and Storybook later) and add, after "Components", a section **"Mapped components"** covering: the manifest hints (`component`, `axisMap`, `slotMap`, `defaultProps`, with the `button` manifest as the example); what the generator emits for `theme.components.Mui<Component>` (`defaultProps` = parity props + axis defaults + manifest props, `styleOverrides.root`, resets first then rules, with a short before/after of one reset entry); the defaults catalog (`catalogs/mui.json`, captured by `bwp-ds capture-defaults --target mui` from the target package's installed MUI, committed, exact version match, `DS-E086`, `--allow-catalog-mismatch`, `DS-W004`); the reset rule in one paragraph (`revert` when the design system sets nothing on that element in that context; restatement when a lower-specificity rule provides it; nothing when an equal or higher one does; why `revert` and not `unset`); the typed wrapper (`import { Button } from '@bwp-web/styles-mui'`: axis props under design-system names, `disabled`, ARIA states, slots under design-system names, `children`, DOM props; MUI-only props are type errors); the augmentation of MUI's own component (`ButtonPropsVariantOverrides` etc., unmapped unions emptied, so `<MuiButton variant="contained">` fails to type-check app-wide); known limits (an MUI element no slot maps is refused at capture; `.Mui-focusVisible` is treated as `:focus-visible`; MUI utility classes such as `MuiButton-sizeSm` still appear on the DOM but carry no styles). Update "Manifest hints" and "Round-trip" (resets recomputed and compared, then stripped) and "Regenerating" (`capture-defaults` after adding or changing a mapped component or upgrading MUI).

`docs/design-system/errors.md`: rows for `DS-E086` and `DS-W004` in the appropriate tables; extend the `DS-E085` row's cause with "or a mapping onto an MUI component whose axes, slots, root element, or default props do not fit that component".

`docs/design-system/verification.md`: a row for `bwp-ds capture-defaults --target mui` (needs the target package's `node_modules`); extend the `bwp-ds verify` row (drift fails when the catalog is missing, stale, or from another MUI version); mention `--allow-catalog-mismatch`.

`docs/design-system/authoring-guide.md`: the `targets` row of the manifest table gains the mapping hints with a pointer to `targets/mui.md`.

`AGENTS.md`: invariant 2 lists `packages/styles-css/catalogs/*.json` (regenerated by `bwp-ds capture-defaults`); the commands table gains `npm run ds -- capture-defaults --target mui`; the package map row for `styles-css` mentions the catalog; a recipe **"Map a component onto an MUI component"** (write the manifest hints, `capture-defaults`, `generate`, `verify`; when `DS-E086` says an element is unmapped, add the slot or exclude; `DS-E085` names the axis or slot to fix); the "Add a component" recipe's last step mentions the choice between `mui: {}` and `mui: { component: … }`.

Root `README.md` and `packages/styles-mui/README.md`: mention mapped components and the `Button` wrapper (`import { Button, Example, createBwpTheme } from '@bwp-web/styles-mui'`), that MUI's own `Button` is narrowed by the augmentation, and that the peer range moves with the catalog.

- [ ] **Step 5: Gates**

From the root: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`, `npm run test`, `npm run verify`, then

```bash
git diff --exit-code -- packages/styles-css/design.ir.json packages/styles-css/src/index.css packages/styles-tailwind/src/generated packages/styles-mui/src/generated docs/design-system/coverage.md; echo "exit $?"
```

is expected to exit **1** here (these files changed in this task and are not committed yet); what matters is that `npm run verify` passes and that a second `npm run ds -- generate` changes nothing further (`git status --short` identical before and after). Report the full `git status --short`.

---

## Task 9: Final verification

**Files:** none new.

- [ ] **Step 1: Clean install and full pipeline**

```bash
npm run clean
npm ci
npm run build
npm run lint
npm run typecheck
npm run format
npm run test
npm run verify
git diff --exit-code -- packages/styles-css/design.ir.json packages/styles-css/src/index.css packages/styles-tailwind/src/generated packages/styles-mui/src/generated docs/design-system/coverage.md && echo "generated files current"
```

Expected: every command exits 0, `verify` prints four `pass` and no `DS-W004`, the last line prints `generated files current`.

- [ ] **Step 2: The catalog is deterministic and guarded**

```bash
npm run ds -- capture-defaults --target mui && git status --short
```

Expected: exit 0 and an empty status (byte-identical catalog). Then corrupt the catalog's version without git: copy the file to the scratchpad, `sed -i '' 's/"version": "9.4.0"/"version": "9.3.0"/' packages/styles-css/catalogs/mui.json` (use the real version string), run `npm run verify ; echo "exit $?"` → exit 1, `drift: fail`, one `DS-E086` at `catalogs/mui.json` saying `captured from @mui/material 9.3.0 but 9.4.0 is installed`. Then `npm run verify -- --allow-catalog-mismatch` (the root script is `bwp-ds verify --root packages/styles-css`, so npm forwards the flag) and expect exit 0 with one `DS-W004`. Restore the file from the scratchpad copy (`cp`), confirm `git status --short` is clean. (`sed -i ''` is the macOS form; on Linux use `sed -i`.)

- [ ] **Step 3: A stale catalog is caught**

Copy `packages/styles-css/src/components/button/button.manifest.json` to the scratchpad. Edit the manifest so `axes.size.values` is `["sm", "md", "lg"]`, add a `.bwp-button[data-size='lg'] { min-height: var(--bwp-size-control-md); }` rule to `button.css` (copy that file too), run `npm run ds -- build && npm run ds -- generate ; echo "exit $?"` → `generate` exits 1 with `DS-E086 … button: the catalog has no render for size=lg, variant=filled; run bwp-ds capture-defaults --target mui` and writes nothing (`git status --short` shows only the two source files and `design.ir.json`). Run `npm run ds -- capture-defaults --target mui && npm run ds -- generate && npm run verify` → all pass, the catalog has 6 renders, `Button.tsx` has `'sm' | 'md' | 'lg'`. Restore both source files from the scratchpad copies, then `npm run ds -- build && npm run ds -- capture-defaults --target mui && npm run ds -- generate && npm run verify`, and confirm `git status --short` is clean.

- [ ] **Step 4: The type contract holds for the mapped component**

Copy `packages/styles-mui/src/generated/typecheck.tsx` to `packages/styles-mui/test/probe.tsx`, fix the relative import (`./components/index.js` → `../src/generated/components/index.js`), remove the `// @ts-expect-error` line above `buttonMuiRejectedVariant` and the one above `buttonRejectedMuiProp`, run `npm run typecheck -w @bwp-web/styles-mui` → exactly two errors on the lines below the removed comments (MUI's own `Button` rejects `variant="text"`; the wrapper rejects the MUI-only prop). Delete `test/probe.tsx` with `rm`; typecheck passes again.

- [ ] **Step 5: Consumer install**

`npm pack -w packages/styles-mui` into the scratchpad, create a consumer project there with `@mui/material`, `@emotion/react`, `@emotion/styled`, `react`, `react-dom`, `typescript`, `@types/react`, install the tarball, and type-check a file that renders `<Button variant="ghost" size="sm" icon={<span />}>x</Button>` and has `// @ts-expect-error` lines for `<Button variant="contained" />`, `<Button fullWidth />`, and `<MuiButton variant="text" />` (importing `Button` from `@mui/material/Button` as `MuiButton`). Expected: zero errors. Then run a Node script that imports the package (ESM) and `require`s it (CJS), calls `createBwpTheme()`, and checks `theme.components.MuiButton.defaultProps.disableRipple === true`. Delete the consumer directory with `rm` per file and `rmdir` (or leave it in the scratchpad; it is outside the repo).

- [ ] **Step 6: Final report**

List every created, modified, and deleted path grouped by package; test counts (`ds-compiler`, `styles-mui`); the four `verify` steps; confirm no git write command and no `rm -rf` was run. Note for Plan 4: the compare harness mounts `Button` from `@bwp-web/styles-mui` next to the CSS `.bwp-button` with the same axis and state permutations, and computed-style equality there is the end-to-end proof of the reset algorithm; the catalog's rules double as the list of properties worth asserting on. Note for Plan 6: the `peerDependencies` range of `@bwp-web/styles-mui` and `MUI_RANGE` must move together with the catalog version.

---

## Follow-ups recorded while writing this plan

- **`DS-E083` still has no emitter.** Mapped components express every property through Emotion too.
- **`.Mui-focusVisible` is treated as `:focus-visible`.** MUI's ButtonBase sets the class from `element.matches(':focus-visible')`, so they coincide; a component with its own focus logic could differ. Plan 4's harness will show it.
- **Slots that render only with a callback.** Chip's `deleteIcon` renders only when `onDelete` is set; `defaultProps` accepts scalars only, so such a slot cannot be captured yet. Allow a marker default (`"onDelete": true` meaning "a no-op function") if a design-system component needs it.
- **`href` and `component` change the root element.** The wrapper omits `component`; `href` is omitted too because it is an MUI own prop (`ButtonOwnProps.href`). A link-styled button therefore needs its own design-system component.
- **Custom palette entries widen MUI's `color` variants.** MUI builds one `color` variant per palette entry; a consumer who merges extra palette colours into `createBwpTheme(options)` gets variants the catalog never saw. They only match `color="<that>"`, which the emptied union forbids at the type level.
- **Catalog growth.** Renders are per full permutation; a component with 3 axes × 4 values captures 64 renders. Acceptable for now; de-duplicate identical rule sets by hash if the file becomes unwieldy.
- **Capture reads the target package's installed MUI.** A repo with several MUI targets would need one catalog per target `outDir`; today there is one.
- **The wrapper passes explicit axis defaults**, so a consumer's `theme.components.MuiButton.defaultProps.variant` override does not affect `Button` from this package (it does affect MUI's own `Button`). Documented in the target doc; revisit if a consumer needs theme-level defaults for the wrapper.
- **`revert` inside cascade layers.** If a consumer wraps MUI's styles in `@layer`, `revert` rolls back to the user-agent origin regardless; behaviour is the same, but worth a Plan 4 assertion.
- **Global augmentation opt-in split** (from Plan 3) now also covers the MUI component override interfaces.
- **Export name collisions with MUI.** `components/Button.tsx` exports `ButtonProps` and `buttonClasses`, names `@mui/material` also exports (with different meanings). A consumer re-exporting both barrels collides. By design (design-system names); document if it bites.
- **Catalog values carry MUI's default `--mui-*` prefix** (`var(--mui-shape-borderRadius)`) because capture uses `createTheme({ cssVariables: true })` without the design-system prefix; only property names drive resets today. Plan 4's rendered-parity harness must not compare catalog values against emitted CSS.
- **Starter `button` focus ring** is `box-shadow` with `outline-style: none`, invisible in forced-colors mode; a real design system should add an `outline` ring or a `@media (forced-colors: active)` fallback.
- **Capture renders axis permutations only, never state props.** Styles MUI applies through a prop matcher rather than a selector (`fullWidth`, `disabled` as a prop) are invisible to the catalog; Button and Chip emit identical root CSS with and without `disabled`, so it is harmless today. Render each attribute state as an extra permutation if a mapped component needs it.
- **Components whose props are a type alias** (`TextFieldProps`) are not extractable by the AST reader; the capture says so. Compound components are unlikely mapping targets anyway.
- **A slot's own-class rules and root-nested rules for the same slot collapse onto one catalog key** in source order rather than specificity order. Not triggered by Button or Chip in 9.4.0.

---

## Execution log

Read this section first when resuming. It records how the plan is being executed
and where it stands. Update the status table after every milestone.

### Process

- Skill: `superpowers:subagent-driven-development`. Tasks are batched; each batch
  gets one implementer subagent (sonnet), then one spec-compliance reviewer
  (sonnet), then one code-quality reviewer (opus) that probes by running,
  including compiling generated output against the real MUI in a scratch
  directory and, for the capture, inspecting the real catalog.
  Reviewer findings go back to the same implementer via SendMessage; the same
  reviewer re-verifies.
- Subagents read only the plan's line range for their tasks plus the header,
  decisions, and file-structure sections, and read the real source files for
  signatures.
- **No git write commands, ever.** The user commits. Read-only `git status` and
  `git diff` are fine.
- **Pause after every milestone** (a batch that passed both reviews). Report the
  changed files and test counts, then wait for the user to say continue.
- **A denied command is reported as BLOCKED**, never worked around.
- The plan text is amended whenever a review decision changes later tasks.

### Status

| Batch | Tasks | State |
| --- | --- | --- |
| 1 | 1-2 contract, catalog module, error codes, CLI flags, hints, mapping plan, names | done, reviewed, committed by user |
| 2 | 3-4 `.d.ts` extraction, `capture-defaults` | done, reviewed, committed by user |
| 3 | 5-6 resets, mapped model, augmentation, wrapper, type probes | done, reviewed, committed by user |
| 4 | 7 round-trip for mapped components | done, reviewed, committed by user |
| 5 | 8 starter `button`, catalog, regenerated output, package tests, docs | done, reviewed, awaiting user commit |
| 6 | 9 final verification | pending |

Test suite at the start of Plan 3b: compiler 29 files / 355 tests; `styles-mui` 2 files / 10 tests; 34 Turbo tasks. After batch 1: compiler 31 files / 400 tests. After batch 2: compiler 34 files / 433 tests. After batch 3: compiler 36 files / 477 tests. After batch 4: compiler 36 files / 491 tests. After batch 5: compiler 36 files / 491 tests; `styles-mui` 3 files / 19 tests; 34 Turbo tasks.

### Decisions made during execution

- Batch 5 review (packed tarball installed in a fresh consumer, CJS and ESM;
  a property-by-property cascade audit of the real `MuiButton` theme across
  all four permutations plus `disabled`: 441 triples, no MUI default wins):
  the wrapper imports MUI's component as a named barrel import because the
  CJS bundle's default import resolved to the module object (see "MUI import
  form"); `test/dist.test.ts` renders `Button` through both bundles and the
  package's Turbo `test` task depends on its own `build`; CI captures the
  catalog and diffs it (see "Catalog in CI"); the vacuous static-render
  ripple assertion was replaced by cascade assertions (`.Mui-disabled`
  colour restatement, `:focus-visible` shadow); docs corrected (resets are
  per permutation and selector context; `defaultProps` also rejects
  overridable union props; `DS-E086` covers capture-time causes); the
  starter's `transition-property` includes `box-shadow`. The compiler's
  unused `componentModel` wrapper was removed (Task 8 tidy-up). Noted: the
  barrel import makes a plain-Node CJS `require` load all of MUI (~839
  modules, ~300 ms cold); bundlers tree-shake it.
- Batch 4 review (a 23-row tamper matrix against the fixture and a freshly
  captured real catalog; every corruption rejected, every legitimate catalog
  variation accepted, including zero resets): `buildComponentModel` is
  exported and the reparser calls it once for both the metadata compare and
  the reset prefix, removing a duplicate reset computation and an unreachable
  branch; the metadata-mismatch message names the differing `mapped` sub-key
  (`mapped.resetCount: 14 vs 12`); `parseKey` looks the slot up by whole class
  name (MUI slot classes are camelCase). Value-level corruptions of legal CSS
  (`cursor: wait`, `44px` → `45px`) are caught by the IR diff in `verify`, not
  by the reparser, by design. Deferred to Task 8's tidy-up: `componentModel`
  is now an unused two-line wrapper; a comment in `mapping.ts` refers to it.
- Batch 3 review (real capture of the fixture, generated output compiled with
  tsc against MUI 9.4.0 and rendered under a development Emotion build, the
  final cascade checked property by property): every MUI-set property in every
  captured context ends in the design system's value or `revert`. Fixes:
  `content` resets emit `none` (Emotion's dev build throws on `content: revert`);
  a render smoke test (`test/mui-generate-render.test.ts`) now exercises the
  generated theme through real MUI so an Emotion-rejected value fails CI; a
  second design-system component mapped onto the same MUI component is
  `DS-E085`; `effectiveValue` picks the highest specificity (IR order is not
  monotone: `compareRules` orders axes count before states count); a full
  `KNOWN_SHORTHANDS` list guards unexpandable shorthands and `overflow`
  expands with a `DS_PARENT` lookup back to the atomic design-system
  property; `parseContext` tokenises before splitting compounds and handles
  `:not/:is/:has/:where`; the wrapper keeps `tabIndex` and `type` as DOM
  props; `disabled` is emitted after the spread. The typecheck probe for a
  rejected MUI default uses the lexicographically last default outside the
  design-system values (the model carries all defaults, not MUI's single
  current one). `theme.model.json` of the committed `Example` gained the
  additive `framework.version`, `kind`, `mapped` fields (regenerated). Two
  separate processes produce byte-identical catalog and generated output.
  Deferred: the four `loadRuntime`/`loadComponent` re-exports in
  `src/index.ts` are unnecessary; unknown-shorthand `DS-E086` repeats per
  permutation; the render smoke test covers the raw MUI component, the
  wrapper itself is rendered by the package tests in Task 8.
- Batch 2 review (probed against the installed MUI 9.4.0 with Button, Chip,
  Typography, Alert, MenuItem, TextField; two-process determinism; a sweep of
  all 133 MUI `.d.ts` files): unions declared through an alias or a template
  literal (`Typography.variant`, `Typography.color`) are resolved with a lazily
  created TypeScript program and checker when the AST fast path finds a
  non-literal member, and only when the `OverridableStringUnion` is the prop's
  own top-level type (`variantMapping`, `iconMapping` are not unions). The
  rendered root element and whether the root is a ButtonBase are probe facts
  captured per design-system component (they depend on the mapping's
  `defaultProps`) and stored on `components.<name>`; `planMapping` takes them
  as its `probe` argument. The ripple parity props applied through
  `buttonBase` are ButtonBase's own three; `disableFocusRipple` is Button's.
  A component that throws during render, a union whose members cannot be read,
  a React `console.error` during render, an at-rule nested in `@media`, and a
  permutation that renders a different root element than the probe are all
  `DS-E086`. Root-nested descendants naming an own-but-unmapped class
  (`MuiChip-avatar`) are dropped as unreachable. The CSS parsing is the pure
  `rulesFromMarkup`, unit-tested with synthetic markup. Diagnostics found in
  every permutation are reported once per component. `@emotion/cache` is a
  declared devDependency of `styles-mui`. `test/cli.test.ts` sets a 30 s
  file-scoped timeout (its tests spawn `tsx` subprocesses; the end-to-end
  test measured 5.6 s). Deferred: React de-duplicates its own warnings per
  process, so the console guard is defence in depth; components whose props
  are a type alias (`TextField`) cannot be extracted; only axis permutations
  are rendered, never state props.
- Batch 1 review (probed by running: real `@mui/material` resolution from the
  `styles-mui` outDir, corrupt and mismatched catalogs, CLI flags, planner
  edge cases): a `slotMap` target must be an element slot, meaning a key of
  the component's `<camel>Classes` export **and** a prop whose type is
  `ReactNode`/`ReactElement` (a state class like `disabled` or a variant class
  like `text` is `DS-E085`); `defaultProps` additionally rejects any
  overridable union prop (its union is emptied by the augmentation), the
  reserved props `sx`, `classes`, `className`, `style`, `ref`, `key`,
  `component`, `slots`, `slotProps`, and a scalar the declared type does not
  admit (word match on `string`/`number`/`boolean`, or the quoted literal for
  string-literal unions such as `type: 'button'`). `loadCatalog` is wired on
  `muiPlugin` already (a corrupt `catalogs/mui.json` fails `generate` and
  `verify`'s drift step with one `DS-E086`). Catalog read errors are reported
  apart from JSON errors; root-level schema issues print `(root)`.
  `errors.md` gained `DS-E086`/`DS-W004` rows and a test that every
  `ERROR_CATALOG` code is documented. Plan test literals fixed: the
  "requires component" assertion cannot use `JSON.stringify` (escaped
  quotes); `BTN_RULES` needs an explicit `MuiCatalogRule[]` annotation. The
  fixture's fake Button gained `label`, `tabIndex`, and `type` props so later
  tasks can exercise the children-slot route; Task 6's test was amended.
  Deferred: a shared home for `manifestLocation` (`model.ts` depends on
  `mapping.ts` for it; `verify/index.ts` builds the same path inline);
  freezing the shared fixture; the clean-path catalog test pins the fixture
  version to the installed `9.4.0` (bump the fixture on an MUI upgrade); an
  MUI element whose class key has no matching prop (`expandIconWrapper`)
  cannot be a slot target.
