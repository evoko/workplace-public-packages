# MUI Target: Theme and Own Components Implementation Plan (Plan 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An MUI 9 target plugin that turns `design.ir.json` into the committed `@bwp-web/styles-mui` package: a theme that is a strict 1:1 image of the design system (every token as a theme CSS variable, every component as a theme entry), one generated React component per design-system component, TypeScript augmentation that makes the design system's axes the only accepted values, round-trip and coverage verification, docs.

**Architecture:** The plugin lives under `packages/ds-compiler/src/targets/mui/` and follows the Tailwind plugin's shape (names, model, render, reparse, index). Tokens become `createTheme` options: colors per color scheme under `palette.tokens`, everything else under a root `tokens` key, so MUI's `cssVariables` emits them as `--<prefix>-palette-tokens-…` and `--<prefix>-tokens-…`. Each component becomes `theme.components.<Prefix><Name>` with the base rule in `styleOverrides.root` and every other rule as a `variants` entry whose nested selector repeats `&` once per selected axis, so specificity and cascade order match the CSS target exactly. A thin generated React shell per component (`styled` root with `ownerState`, one element per slot, classes `<Prefix><Name>-<slot>`) carries no styles of its own. `theme.ts` is rendered from a JSON model that is also emitted as `theme.model.json`; `reparse` reads the model, synthesizes CSS in the design system's own selector grammar, and runs the compiler's parsers, so round-trip is an exact IR comparison. Components that map onto MUI's own components (`Button`, `Chip`, …) and the browser-defaults catalog are Plan 3b.

**Tech Stack:** TypeScript 5.9, Node 22, `@mui/material` 9.4.x with `@emotion/react` and `@emotion/styled` 11.14, React 19 types (peer `>=18`), tsup (ESM and CJS), Vitest 4, Zod 4, Turbo.

**Rules for every task:**

- **Never run any git command that writes** (no `git add`, `git commit`, `git tag`, `git stash`, `git checkout`, `git reset`). The user commits at each checkpoint. `git status` and `git diff` are fine.
- Use Node 22: `export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"` (or `nvm use`).
- Never name anything after the current design system. Use `ds`, `bwp`, or a descriptive word. Identifiers derived from the configured prefix (`Bwp…`, `createBwpTheme`) are data, not names.
- Generated output is deterministic: sorted declaration keys, canonical rule order, template formatting, no external formatter at generation time. Never run Prettier over `src/generated/`.
- Do not work around a denied command. Report it.
- Never hand-edit a generated file; regenerate it.

---

## Decisions made while writing this plan

| Topic | Decision |
| --- | --- |
| Scope split | The spec's item 3 is split. **This plan (3):** tokens, own components, theme, augmentation, package, round-trip, coverage, docs. **Plan 3b:** components mapped onto MUI's own components (`targets.mui.component`, `axisMap`, `slotMap`, `defaultProps`), `bwp-ds capture-defaults --target mui`, the versioned defaults catalog, the reset-plus-override generator, and type-extracted default prop unions. Reason: the design system has no MUI-mappable component today, and the user asked that every component without an MUI counterpart become its own React component with 1:1 parity, which is fully demonstrable now. |
| 1:1 principle | The generated theme exposes only what the design system defines, and the generated types accept only the design system's values: a component's axis props are exact string unions, slot props are exactly the manifest's slots, states are exactly the manifest's states. MUI's own semantic slots (`palette.primary`, typography variants, `spacing`, `shape`, `shadows`) are left at MUI defaults at runtime because MUI's internals read them; disabling MUI's own prop values (`variant: 'contained'`, `Typography variant="h1"`) belongs with framework-mapped components in Plan 3b, where the catalog knows the default unions. |
| Own vs mapped | `targets.mui: {}` (optionally with `ignore`) means "generate an own component". `targets.mui.component` (Plan 3b) will mean "map onto that MUI component". `{ "excluded": "<reason>" }` opts out. The starter `example` component becomes `mui: {}`. |
| Token exposure | Color tokens: `colorSchemes.<mode>.palette.tokens["<path-with-dashes>"]` per mode, every mode listing every color token (MUI needs the full set per scheme). Every other category: root `tokens.<camelCategory>["<path>"]` (`fontWeight`, `zIndex`, `borderWidth`, …). Keys are the token path joined with `-`, not nested objects, so `color.text` and `color.text.default` cannot collide. All values are **strings** (MUI appends `px` to bare numbers in custom theme keys). Aliases stay aliases: `var(--<prefix>-palette-tokens-neutral-900)`. A non-color token whose value varies by mode is `DS-E084` (MUI has no per-scheme home for it). |
| Variable names | `cssVarPrefix` is the design-system prefix. MUI derives `--<prefix>-palette-tokens-<path>` and `--<prefix>-tokens-<camelCategory>-<path>`. `sourceNameFromMui` inverts both and validates through `parseTokenName`. |
| Modes | `defaultColorScheme` is `defaultMode`; one `colorSchemes` entry per mode. `cssVariables.colorSchemeSelector` is derived from `meta.modeSelector`: `:root[data-x="{mode}"]` or `[data-x="{mode}"]` becomes `data-x`; `.x-{mode}` or `:root.x-{mode}` becomes `.x-%s`; any other form is `DS-E084`. **Modes must be `light` and/or `dark`** (batch 2 review): MUI seeds only those two schemes and `createTheme` throws for any other name, so another mode is `DS-E084`. Seeding a custom scheme from an explicit base mode is a follow-up. |
| Component styling | Theme-centric. The generated React component has no styles of its own: `styled(<rootElement>, { name: '<ThemeKey>', slot: 'Root', overridesResolver: (_p, s) => s.root })` with `ownerState` = the axis values, plus `useThemeProps`. All rules live in `theme.components.<ThemeKey>`. Consumers wrap their app in `ThemeProvider theme={create<Prefix>Theme()}`; without it the component renders unstyled markup. |
| Cascade parity | The base root rule (no axes, no states) is `styleOverrides.root`. Every other rule, in the IR's canonical order, is one `variants` entry `{ props: <axis values or {}>, style: { <key>: <declarations> } }` where `<key>` is `'&'` repeated `1 + axesCount` times, then each state as the design system renders it (`:hover`, `:focus-visible`, `:active`, `:disabled` or `[aria-disabled="true"]`, `[aria-pressed="true"]`, …), then ` .<ThemeKey>-<slot>` for a non-root slot. `&&` doubles the Emotion class, so specificity equals the CSS target's (root class plus one per axis attribute plus one per state plus one for the slot class), and Emotion emits `styleOverrides` before `variants` and variants in array order, so equal-specificity ties resolve exactly as in the CSS target. Slot rules are never `styleOverrides.<slot>`; they are nested from the root so the slot element stays a plain element. `props: {}` matches every instance (MUI checks only the keys present). |
| Declaration values | Property names are camelCased. Every value is a string: token references render as `var(<mui var name>)`, literals through the shared CSS value renderers. Emotion never appends `px` to strings. |
| React shell | `export const <Pascal> = React.forwardRef<React.ComponentRef<'<rootElement>'>, <Pascal>Props>(…)`. Props: one optional prop per axis typed as the exact value union; `disabled?: boolean` when the component has a `disabled` state (rendered as the `disabled` attribute on form-control roots, `aria-disabled` otherwise); one `boolean` prop per ARIA-true state (`pressed`, `selected`, `expanded`, `checked`), rendered as `aria-<state>`; `children` fills the `label` slot if there is one, else the first required non-root slot, else the root; every other non-root slot is a `React.ReactNode` prop named after the slot, rendered in manifest order and omitted when `undefined`. DOM props of the root element are accepted and forwarded, minus the names the component owns. Classes: `<ThemeKey>-root` (merged with `className`) and `<ThemeKey>-<slot>`. Exported alongside: `<camel>Classes` and the `<Pascal>Props`, `<Pascal>OwnerState` types. |
| Prop names | React prop names are the camelCase form of manifest names: axis `icon-position` is the prop `iconPosition`, slot `sub-title` is `subTitle`, and `classes.subTitle` holds `FxMenuItem-sub-title`. The model carries the prop name on each axis and slot (`prop`), `variants[].props` keys are prop names, and `reparse` maps them back to axes. Type names keep PascalCase of the axis (`MenuItemIconPosition`). |
| Inexpressible components | A state outside `hover`, `focus-visible`, `active`, `disabled`, and the four ARIA-true states (i.e. a `data-state` state); an element that is not an HTML or SVG tag; a void element (`img`, `input`, `hr`, …) anywhere, since every slot holds content; an SVG element other than `svg` when the root is not `svg` (flat slots are children of the root); a slot or axis named like a reserved prop (`children`, `className`, `style`, `ref`, `key`, `sx`, `component`, `as`, `ownerState`, `theme`, `classes`); or two names that camelCase to the same prop: each is `DS-E085` at generation. The manifest fixes it or excludes the component. |
| Generated files | Under the target's outDir: `theme.model.json`, `theme.ts`, `augmentation.ts`, `components/<Pascal>.tsx` per component, `components/index.ts`, `index.ts`, and `typecheck.tsx` (a type-level probe with `@ts-expect-error` lines that the package's `tsc --noEmit` compiles and tsup never bundles). The augmentation is a `.ts` module (not `.d.ts`) so tsc emits it into the package's published types; the package entry imports it for its side effect. `theme.model.json` starts with a `"generated"` key holding the header text, since JSON has no comments. TS files start with a `//` header line of the same text. |
| `theme.ts` | `export const <prefix>ThemeOptions = { … } satisfies ThemeOptions;` rendered as a TS object literal from the model's `themeOptions` (insertion order preserved), and `export function create<Prefix>Theme(options: ThemeOptions = {}): Theme` returning `createTheme(deepmerge(<prefix>ThemeOptions, options))`. The package test asserts the literal deep-equals the model, which is what makes the model a faithful proxy for round-trip. |
| Round-trip | `reparse` reads `theme.model.json`: token vars are rewritten to source names and fed through `parseTokenFile` and `resolveTokens` per category; each component's `styleOverrides.root` and `variants` are reconstructed into (slot, axes, states) keys, re-rendered with the design system's `renderRuleSelector`, and fed through `parseComponentCss`; the variant key sequence must equal the canonical form element for element; and each `components` metadata entry (what the React shells are rendered from) must equal `componentModel` rebuilt from the IR (batch 3 review). Everything is reported as `DS-E081`, pointing at `theme.model.json`; the reparser's own checks carry a plain message, parser diagnostics keep their code and title. |
| Plugin contract | `generate(ir, catalog, ctx, diag)` gains a `Diagnostics` parameter so a plugin can report coded errors (`DS-E084`, `DS-E085`) instead of throwing. `bwp-ds generate` writes nothing when any plugin reported an error; drift and round-trip skip a plugin whose generation reported errors. Tailwind ignores the parameter. |
| IR order fields | `ComponentIR` gains `axisOrder` and `slotOrder` (manifest key order, `root` first), because `serializeIR` sorts record keys and generators must produce identical output from the in-memory IR and from `design.ir.json`. The MUI shell renders slots in `slotOrder` and picks the children slot from it; `manifestFromComponent` rebuilds the records in that order. `irVersion` stays 1 (additive). |
| Alias canonical form | (batch 3 review) For a mode-varying token, `alias[mode]` is set whenever the entry in effect for that mode is an alias, including the `:root` entry reused by modes the token does not declare. So `--b: var(--a)` declared only in `:root` and the same alias restated in every mode block produce one IR, which is the only form the MUI output can encode. |
| Shared value renderers | `src/targets/tailwind/values.ts` moves to `src/targets/css-values.ts` (same exports) because MUI renders the same CSS value strings. |
| Package | `@bwp-web/styles-mui` builds like `@bwp-web/components` (tsup ESM+CJS, tsc declarations), peer-depends on `@mui/material ^9.4.0`, `@emotion/react`, `@emotion/styled`, `react`, `react-dom`; typechecks and lints the generated TSX (a generation bug fails `npm run typecheck`); tests assert the model equality, the emitted stylesheet, and a static render of every generated component. Version scripts and `auto-tag.yml` wait for Plan 6. |
| Coverage | Every property in the table is expressible in Emotion, so nothing is `unsupported`; `ignore` yields `partial`. `DS-E083` stays unused until Plan 3b or Flutter. |

---

## File structure

Compiler (`packages/ds-compiler/`):

| Path | Responsibility |
| --- | --- |
| `src/targets/css-values.ts` | Moved from `src/targets/tailwind/values.ts` unchanged: `renderColor`, `formatNumber`, `renderDimension`, `renderFontFamily`, `renderShadow`, `renderTokenValue`. |
| `src/targets/plugin.ts` | `generate` gains `diag: Diagnostics`. |
| `src/targets/hints.ts` | `muiHintsSchema` (`ignore` only, strict) replaces the permissive `mui` entry; shared `ignoreList` schema. |
| `src/targets/mui/hints.ts` | `MUI_ID`, `isMappedForMui`, `ignoredForMui`, `muiExclusion`. |
| `src/targets/mui/names.ts` | `pascalCase`, `camelCase`, `themeKeyFor`, `slotClassName`, `camelCategory`/`kebabCategory`, `muiVarName`, `sourceNameFromMui`, `camelProperty`/`kebabProperty`, `colorSchemeSelectorFor`, `specificityKey`. |
| `src/targets/mui/model.ts` | `MuiModel` types and `buildMuiModel(ir, ctx, diag)`: tokens to theme options, components to `styleOverrides`/`variants`, component metadata for the React shells. |
| `src/targets/mui/render-ts.ts` | `renderTsLiteral`, `renderThemeTs`, `renderAugmentationTs`, `renderModelJson`, `muiHeader`. |
| `src/targets/mui/render-component.ts` | `renderComponentTsx`, `renderComponentsIndex`, `renderIndexTs`, `renderTypecheckTsx`. |
| `src/targets/mui/generate.ts` | `generateMui`: the ordered file list. |
| `src/targets/reparse-support.ts` | `manifestFromComponent`, `verifySelectorOrder`, shared by both reparsers. |
| `src/targets/coverage-entries.ts` | `coverageEntries`, shared coverage for targets where every property is expressible. |
| `src/targets/mui/reparse.ts` | `theme.model.json` back to a `DesignIR`. |
| `src/targets/mui/index.ts` | `muiPlugin` (`generate`, `reparse`, `coverage`, `isMapped`, `ignoredProperties`). |
| `src/targets/index.ts` | Registers `mui`. |
| `src/generate.ts`, `src/verify/drift.ts`, `src/verify/index.ts` | Pass `diag` into `generate`; write nothing / skip on generation errors. |
| `src/errors.ts` | `DS-E084`, `DS-E085`. |
| `src/index.ts` | Exports for the new modules. |
| Tests | `test/mui-fixture.ts`, `test/mui-names.test.ts`, `test/mui-model.test.ts`, `test/mui-generate.test.ts`, `test/mui-roundtrip.test.ts`; updated `tailwind-fixture.ts`, `targets-hints.test.ts`, `tailwind-roundtrip.test.ts`, `coverage.test.ts`, `verify.test.ts`, `cli.test.ts`, `errors.test.ts`. |

Package `packages/styles-mui/`: `package.json`, `README.md`, `.prettierignore`, `tsconfig.json`, `tsconfig.build.json`, `tsup.config.ts`, `eslint.config.js`, `vitest.config.ts`, `src/index.ts` (hand-written), `src/generated/**` (generated, committed), `test/theme.test.ts`, `test/render.test.tsx`.

Repo: `packages/styles-css/ds.config.json` (`targets.mui.outDir`), `packages/styles-css/src/components/example/example.manifest.json` (`mui: {}`), regenerated `design.ir.json` and `docs/design-system/coverage.md`, `.github/workflows/main.yml`, root `README.md`, `AGENTS.md`, `docs/design-system/targets/mui.md`, `verification.md`, `errors.md`, `authoring-guide.md`.

---

## Task 1: Plugin contract `diag`, shared CSS value renderers, MUI hints, names, error codes

**Files:**
- Create: `packages/ds-compiler/src/targets/css-values.ts` (moved from `src/targets/tailwind/values.ts`)
- Delete: `packages/ds-compiler/src/targets/tailwind/values.ts`
- Create: `packages/ds-compiler/src/targets/mui/hints.ts`
- Create: `packages/ds-compiler/src/targets/mui/names.ts`
- Modify: `packages/ds-compiler/src/targets/plugin.ts`, `src/targets/hints.ts`, `src/targets/tailwind/render.ts`, `src/targets/tailwind/reparse.ts`, `src/targets/tailwind/index.ts`, `src/generate.ts`, `src/verify/drift.ts`, `src/verify/index.ts`, `src/errors.ts`, `src/index.ts`
- Modify: `packages/ds-compiler/test/tailwind-fixture.ts`, `test/targets-hints.test.ts`, `test/errors.test.ts`
- Test: `packages/ds-compiler/test/mui-names.test.ts`

- [ ] **Step 1: Write the failing tests**

`test/mui-names.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  camelCase,
  camelCategory,
  camelProperty,
  colorSchemeSelectorFor,
  kebabCategory,
  kebabProperty,
  muiVarName,
  pascalCase,
  slotClassName,
  sourceNameFromMui,
  specificityKey,
  themeKeyFor,
} from '../src/targets/mui/names.js';
import { TOKEN_CATEGORIES } from '../src/tokens/categories.js';

describe('mui names', () => {
  it('cases identifiers', () => {
    expect(pascalCase('example')).toBe('Example');
    expect(pascalCase('date-picker-2')).toBe('DatePicker2');
    expect(camelCase('font-weight')).toBe('fontWeight');
    expect(camelCase('color')).toBe('color');
    expect(themeKeyFor('bwp', 'example')).toBe('BwpExample');
    expect(themeKeyFor('fx', 'date-picker')).toBe('FxDatePicker');
    expect(slotClassName('BwpExample', 'icon')).toBe('BwpExample-icon');
  });

  it('maps every token category to a camel key and back', () => {
    for (const category of TOKEN_CATEGORIES) {
      expect(kebabCategory(camelCategory(category))).toBe(category);
    }
    expect(camelCategory('z-index')).toBe('zIndex');
    expect(kebabCategory('nope')).toBeNull();
  });

  it('maps CSS properties to camelCase and back', () => {
    expect(camelProperty('border-top-left-radius')).toBe('borderTopLeftRadius');
    expect(kebabProperty('borderTopLeftRadius')).toBe('border-top-left-radius');
    expect(camelProperty('color')).toBe('color');
  });

  it('names token variables the way MUI derives them and inverts the mapping', () => {
    const color = { category: 'color' as const, path: ['text', 'default'] };
    const weight = { category: 'font-weight' as const, path: ['semibold'] };
    const space = { category: 'space' as const, path: ['2'] };
    expect(muiVarName('bwp', color)).toBe('--bwp-palette-tokens-text-default');
    expect(muiVarName('bwp', weight)).toBe('--bwp-tokens-fontWeight-semibold');
    expect(muiVarName('bwp', space)).toBe('--bwp-tokens-space-2');
    expect(sourceNameFromMui('--bwp-palette-tokens-text-default', 'bwp')).toBe(
      '--bwp-color-text-default',
    );
    expect(sourceNameFromMui('--bwp-tokens-fontWeight-semibold', 'bwp')).toBe(
      '--bwp-font-weight-semibold',
    );
    expect(sourceNameFromMui('--bwp-tokens-space-2', 'bwp')).toBe('--bwp-space-2');
    expect(sourceNameFromMui('--bwp-tokens-nope-x', 'bwp')).toBeNull();
    expect(sourceNameFromMui('--bwp-palette-primary-main', 'bwp')).toBeNull();
    expect(sourceNameFromMui('--other-tokens-space-2', 'bwp')).toBeNull();
    expect(sourceNameFromMui('--bwp-tokens-space-', 'bwp')).toBeNull();
  });

  it('derives the MUI colorSchemeSelector from the mode selector', () => {
    expect(colorSchemeSelectorFor(':root[data-bwp-theme="{mode}"]')).toBe('data-bwp-theme');
    expect(colorSchemeSelectorFor("[data-theme='{mode}']")).toBe('data-theme');
    expect(colorSchemeSelectorFor('.theme-{mode}')).toBe('.theme-%s');
    expect(colorSchemeSelectorFor(':root.{mode}-mode')).toBe('.%s-mode');
    expect(colorSchemeSelectorFor('html[data-theme="{mode}"]')).toBeNull();
    expect(colorSchemeSelectorFor(':root[data-theme="{mode}"] body')).toBeNull();
    expect(colorSchemeSelectorFor('@media (prefers-color-scheme: {mode})')).toBeNull();
  });

  it('builds the nested selector key that reproduces the CSS target specificity', () => {
    expect(specificityKey(0, [], 'button', 'root', 'FxChip')).toBe('&');
    expect(specificityKey(0, ['hover'], 'button', 'root', 'FxChip')).toBe('&:hover');
    expect(specificityKey(1, [], 'button', 'root', 'FxChip')).toBe('&&');
    expect(specificityKey(2, ['hover', 'disabled'], 'button', 'root', 'FxChip')).toBe(
      '&&&:hover:disabled',
    );
    expect(specificityKey(0, ['disabled'], 'div', 'root', 'FxTag')).toBe(
      '&[aria-disabled="true"]',
    );
    expect(specificityKey(1, ['hover'], 'button', 'icon', 'FxChip')).toBe(
      '&&:hover .FxChip-icon',
    );
    expect(specificityKey(0, [], 'button', 'icon', 'FxChip')).toBe('& .FxChip-icon');
  });
});
```

In `test/targets-hints.test.ts`, the existing test that keeps `mui` permissive (it passes `mui: { component: 'Chip', anything: true }`) must move that case to `flutter`; then add:

```ts
  it('mui hints are strict: {} or { ignore } or excluded', () => {
    expect(targetsSchema.safeParse({ mui: {} }).success).toBe(true);
    expect(targetsSchema.safeParse({ mui: { ignore: ['opacity'] } }).success).toBe(true);
    expect(targetsSchema.safeParse({ mui: { excluded: 'later' } }).success).toBe(true);
    expect(targetsSchema.safeParse({ mui: { component: 'Button' } }).success).toBe(false);
    expect(targetsSchema.safeParse({ mui: { ignore: ['colour'] } }).success).toBe(false);
    expect(targetsSchema.safeParse({ mui: { ignore: [] } }).success).toBe(false);
    // flutter stays permissive until its plugin lands
    expect(targetsSchema.safeParse({ flutter: { variantWidgets: {} } }).success).toBe(true);
  });
```

In `test/errors.test.ts`, extend the catalog-membership test so the expected list also contains `'DS-E084'` and `'DS-E085'`.

In `test/tailwind-fixture.ts`:

- `TW_CONFIG.targets` becomes `{ tailwind: { outDir: 'out/tailwind' }, mui: { outDir: 'out/mui' } }`.
- `chip` manifest `targets`: `{ tailwind: {}, mui: {} }`, and its `icon` slot becomes `{ element: 'span', optional: true }` (later tasks rely on children going into the root and `icon` being an optional prop).
- `tag` manifest `targets`: `{ tailwind: { ignore: ['opacity'] }, mui: { ignore: ['opacity'] } }`.
- `pill` manifest `targets`: `{ tailwind: { excluded: 'starter content' }, mui: { excluded: 'starter content' } }`.

(No test asserts the absence of these keys; `mui` is not registered until Task 3, so every existing expectation still holds.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/mui-names.test.ts test/targets-hints.test.ts test/errors.test.ts`
Expected: FAIL. `../src/targets/mui/names.js` cannot be resolved; `{ mui: { component: 'Button' } }` is accepted; `DS-E084` missing.

- [ ] **Step 3: Move the value renderers**

Move `src/targets/tailwind/values.ts` to `src/targets/css-values.ts` (contents unchanged, import paths adjusted: `'../ir/types.js'`, `'../tokens/values.js'`), and append one function:

```ts
import type { IRValueLiteral } from '../ir/types.js';

/** CSS text for a component literal (keyword, dimension, number, string, or color). */
export function renderLiteralValue(value: IRValueLiteral): string {
  switch (value.type) {
    case 'dimension':
      return renderDimension(value.value as DimensionValue);
    // Unreachable today: parseLiteralForProperty never yields a color literal
    // (token-required). If added, reconcile the shape with token colors ({ hex }).
    case 'color':
      return renderColor(value.value as string);
    case 'number':
      return formatNumber(value.value as number);
    case 'keyword':
    case 'string':
      return String(value.value);
  }
}
```

Update every importer: `src/targets/tailwind/render.ts` (`renderIRValue` becomes `value.kind === 'token' ? \`var(${varNameFor(ir, value.ref)})\` : renderLiteralValue(value)`), `src/targets/tailwind/names.ts` if it imports `values.js`, `src/targets/tailwind/reparse.ts`, and `test/tailwind-names.test.ts` / `test/tailwind-generate.test.ts` if they import from `values.js`. Run `grep -rn "tailwind/values" src test` and expect no hits afterwards. Delete the old file with `rm src/targets/tailwind/values.ts` (a plain `rm`, not `git rm`).

- [ ] **Step 4: Plugin contract**

`src/targets/plugin.ts`: import `Diagnostics` as a type and change `generate`:

```ts
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
```

Also add:

```ts
/** One plugin's generation result, produced by `generateOutputs`. */
export interface PluginOutput {
  plugin: TargetPlugin;
  ctx: PluginContext;
  files: GeneratedFile[];
}
```

`src/targets/tailwind/index.ts`: leave `generate: (ir, _catalog, ctx) => generateTailwind(ir, ctx)` (a function with fewer parameters is assignable). Callers in `test/tailwind-roundtrip.test.ts` that invoke `tailwindPlugin.generate(...)` directly now pass `new Diagnostics()` as the fourth argument.

- [ ] **Step 5: `generateOutputs` and its callers**

In `src/generate.ts` add and use:

```ts
import type { DsConfig } from './config.js';
import type { Diagnostics } from './errors.js';
import type { DesignIR } from './ir/types.js';
import {
  pluginContext,
  type PluginOutput,
  type TargetPlugin,
} from './targets/plugin.js';

/**
 * Runs every plugin's `generate` once. A plugin that reports errors on `diag`
 * is left out of the result, so callers never write or compare its output.
 */
export function generateOutputs(
  rootDir: string,
  ir: DesignIR,
  config: DsConfig,
  plugins: readonly TargetPlugin[],
  compilerVersion: string,
  diag: Diagnostics,
): PluginOutput[] {
  const outputs: PluginOutput[] = [];
  for (const plugin of plugins) {
    const ctx = pluginContext(rootDir, config, compilerVersion, plugin.id);
    const before = diag.errors.length;
    const files = plugin.generate(ir, null, ctx, diag);
    if (diag.errors.length === before) {
      outputs.push({ plugin, ctx, files });
    }
  }
  return outputs;
}
```

and replace the body of `generate` after the `buildIR` check with:

```ts
  const diag = result.diagnostics;
  const outputs = generateOutputs(
    rootDir,
    result.ir,
    result.config,
    plugins,
    COMPILER_VERSION,
    diag,
  );
  if (diag.hasErrors()) {
    // A plugin reported a generation error: write nothing for any target,
    // so a failed run never leaves a half-updated set of packages.
    return { ir: result.ir, diagnostics: diag, written: [], removed: [] };
  }
  const written: string[] = [];
  const removed: string[] = [];
  for (const { ctx, files } of outputs) {
    mkdirSync(ctx.outDir, { recursive: true });
    const produced = new Set(files.map((f) => f.path));
    for (const file of files) {
      const abs = join(ctx.outDir, file.path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, file.contents);
      written.push(abs);
    }
    for (const rel of listOutputFiles(ctx.outDir)) {
      if (!produced.has(rel)) {
        const abs = join(ctx.outDir, rel);
        unlinkSync(abs);
        removed.push(abs);
      }
    }
    removeEmptySubdirs(ctx.outDir);
  }
  return { ir: result.ir, diagnostics: diag, written, removed };
```

Update the doc comment of `generate`: "Nothing is written when the IR has errors or when any plugin reports a generation error."

`src/verify/drift.ts`: `checkDrift` no longer generates. New signature and loop:

```ts
import type { PluginOutput } from '../targets/plugin.js';

export function checkDrift(
  rootDir: string,
  ir: DesignIR,
  outputs: readonly PluginOutput[],
  diag: Diagnostics,
): void {
  // … the design.ir.json checks stay as they are …
  for (const { plugin, ctx, files } of outputs) {
    // … the per-file and stray-file checks stay as they are, using `files` …
  }
}
```

Remove the now-unused imports (`DsConfig`, `pluginContext`, `TargetPlugin`) and the `config`/`compilerVersion` parameters.

`src/verify/index.ts`: generate once, inside the drift step, and reuse for round-trip:

```ts
  const beforeDrift = diag.errors.length;
  const outputs = generateOutputs(
    rootDir,
    ir,
    config,
    plugins,
    COMPILER_VERSION,
    diag,
  );
  checkDrift(rootDir, ir, outputs, diag);
  steps.drift = failsSince(beforeDrift);

  const beforeRoundtrip = diag.errors.length;
  for (const { plugin, ctx, files } of outputs) {
    const reparsed = plugin.reparse(files, ir, ctx, diag);
    if (!reparsed) {
      continue;
    }
    // … scope and diffIR unchanged …
  }
```

Update the `verify` doc comment: "A plugin whose generation reports errors fails the drift step and is skipped by round-trip; coverage still runs for every plugin."

- [ ] **Step 6: Hints**

`src/targets/hints.ts`: factor the ignore list and add the MUI schema:

```ts
const ignoreList = z
  .array(propertyName)
  .min(1)
  .refine(
    (props) => new Set(props).size === props.length,
    'must not repeat a property',
  )
  .optional();

/** `targets.tailwind` hints. */
export const tailwindHintsSchema = z.strictObject({
  /** Properties the Tailwind output omits for this component (coverage reports `partial`). */
  ignore: ignoreList,
});

/**
 * `targets.mui` hints. `{}` generates an own React component for the
 * component; `ignore` lists properties left out of the MUI output. Mapping
 * onto MUI's own components (`component`, `axisMap`, …) arrives with the
 * defaults catalog in Plan 3b.
 */
export const muiHintsSchema = z.strictObject({
  ignore: ignoreList,
});

/** Until its plugin lands, flutter accepts any object, except a malformed `excluded`. */
const permissiveHints = …unchanged…

export const TARGET_HINT_SCHEMAS: Record<TargetId, z.ZodType> = {
  tailwind: tailwindHintsSchema,
  mui: muiHintsSchema,
  flutter: permissiveHints,
};
```

`src/targets/mui/hints.ts`:

```ts
import type { ComponentIR } from '../../ir/types.js';

export const MUI_ID = 'mui';

interface MuiHints {
  ignore?: string[];
}

/** The manifest's `targets.mui` entry when it maps the component (present and not excluded). */
function mappedHints(component: ComponentIR): MuiHints | null {
  const hints = component.targets[MUI_ID];
  if (hints === undefined || typeof hints.excluded === 'string') {
    return null;
  }
  return hints as MuiHints;
}

export function isMappedForMui(component: ComponentIR): boolean {
  return mappedHints(component) !== null;
}

export function ignoredForMui(component: ComponentIR): ReadonlySet<string> {
  return new Set(mappedHints(component)?.ignore ?? []);
}

/** The exclusion reason, or null when the component is not excluded. */
export function muiExclusion(component: ComponentIR): string | null {
  const hints = component.targets[MUI_ID];
  return hints !== undefined && typeof hints.excluded === 'string'
    ? hints.excluded
    : null;
}
```

Run `npm run schema` afterwards so `schemas/manifest.schema.json` picks up the strict `mui` shape, and confirm `git diff --stat schemas/` shows the change.

- [ ] **Step 7: Names**

`src/targets/mui/names.ts`:

```ts
import { stateSelector } from '../../components/render-selector.js';
import {
  TOKEN_CATEGORIES,
  parseTokenName,
  type TokenCategory,
} from '../../tokens/categories.js';
import { normalizeQuotes } from '../../tokens/parse-tokens.js';

/** `date-picker-2` to `DatePicker2`. */
export function pascalCase(kebab: string): string {
  return kebab
    .split('-')
    .filter((part) => part !== '')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

/** `font-weight` to `fontWeight`. */
export function camelCase(kebab: string): string {
  const pascal = pascalCase(kebab);
  return pascal === '' ? '' : pascal[0].toLowerCase() + pascal.slice(1);
}

/** The theme key and class-name stem of a component: `<Prefix><Name>`, e.g. `BwpExample`. */
export function themeKeyFor(prefix: string, componentName: string): string {
  return pascalCase(prefix) + pascalCase(componentName);
}

/** `BwpExample-icon`: the class each slot element carries. */
export function slotClassName(themeKey: string, slot: string): string {
  return `${themeKey}-${slot}`;
}

const CAMEL_TO_CATEGORY = new Map<string, TokenCategory>(
  TOKEN_CATEGORIES.map((c) => [camelCase(c), c]),
);

export function camelCategory(category: TokenCategory): string {
  return camelCase(category);
}

export function kebabCategory(camel: string): TokenCategory | null {
  return CAMEL_TO_CATEGORY.get(camel) ?? null;
}

export function camelProperty(kebab: string): string {
  return camelCase(kebab);
}

export function kebabProperty(camel: string): string {
  return camel.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
}

/**
 * The theme path MUI turns into a CSS variable: colors live per color scheme
 * under `palette.tokens`, everything else under the root `tokens` key by
 * camelCased category. The token path is joined with `-` as one key so
 * `color.text` and `color.text.default` never collide as object and string.
 */
export function muiVarPath(token: {
  category: TokenCategory;
  path: readonly string[];
}): string[] {
  const key = token.path.join('-');
  return token.category === 'color'
    ? ['palette', 'tokens', key]
    : ['tokens', camelCategory(token.category), key];
}

/** `--<prefix>-palette-tokens-text-default` or `--<prefix>-tokens-fontWeight-semibold`. */
export function muiVarName(
  prefix: string,
  token: { category: TokenCategory; path: readonly string[] },
): string {
  return `--${prefix}-${muiVarPath(token).join('-')}`;
}

/** Inverse of `muiVarName`: the source custom property, or null when the name is not a generated token variable. */
export function sourceNameFromMui(name: string, prefix: string): string | null {
  const lead = `--${prefix}-`;
  if (!name.startsWith(lead)) {
    return null;
  }
  const rest = name.slice(lead.length);
  let source: string;
  if (rest.startsWith('palette-tokens-')) {
    source = `${lead}color-${rest.slice('palette-tokens-'.length)}`;
  } else if (rest.startsWith('tokens-')) {
    const [camel, ...path] = rest.slice('tokens-'.length).split('-');
    const category = kebabCategory(camel);
    if (!category || path.length === 0) {
      return null;
    }
    source = `${lead}${category}-${path.join('-')}`;
  } else {
    return null;
  }
  return parseTokenName(source, prefix) ? source : null;
}

const ATTRIBUTE_SELECTOR = /^(?::root)?\[(data-[a-z][a-z0-9-]*)="\{mode\}"\]$/;
const CLASS_SELECTOR = /^(?::root)?\.([a-z][a-z0-9-]*-)?\{mode\}(-?[a-z0-9-]*)$/;

/**
 * MUI's `cssVariables.colorSchemeSelector` for a design-system mode selector:
 * `:root[data-x="{mode}"]` or `[data-x="{mode}"]` becomes `data-x` (MUI
 * renders `[data-x="<mode>"]`), `.x-{mode}` or `:root.{mode}-y` becomes a
 * `%s` template. Anything else (a tag, a descendant, a media query) is null.
 */
export function colorSchemeSelectorFor(modeSelector: string): string | null {
  const selector = normalizeQuotes(modeSelector.trim());
  const attribute = ATTRIBUTE_SELECTOR.exec(selector);
  if (attribute) {
    return attribute[1];
  }
  const cls = CLASS_SELECTOR.exec(selector);
  if (cls) {
    return `.${cls[1] ?? ''}%s${cls[2]}`;
  }
  return null;
}

/**
 * The nested selector key for a rule inside `styleOverrides.root` or a
 * `variants` entry. `&` is repeated once per selected axis on top of the root
 * class, so the Emotion class stacks to the same specificity the CSS target
 * gets from `.root[data-axis="v"]…`; states render exactly as the design
 * system does (so `disabled` follows the root element), and a non-root slot
 * becomes a descendant class.
 */
export function specificityKey(
  axesCount: number,
  states: readonly string[],
  rootElement: string,
  slot: string,
  themeKey: string,
): string {
  const root = '&'.repeat(1 + axesCount);
  const stateText = states.map((s) => stateSelector(s, rootElement)).join('');
  const slotText = slot === 'root' ? '' : ` .${slotClassName(themeKey, slot)}`;
  return `${root}${stateText}${slotText}`;
}
```

Check `stateSelector` in `src/components/render-selector.ts` before relying on it: it must return `:hover`, `:focus-visible`, `:active`, `:disabled` or `[aria-disabled="true"]` (by root element), `[aria-pressed="true"]` and the other ARIA-true states, and `[data-state="<name>"]` otherwise. If its output for the ARIA states differs from these strings, use whatever it returns and adjust the `specificityKey` test expectations accordingly (the generator and the reparser both go through it, so round-trip stays exact either way).

- [ ] **Step 8: Error codes**

In `src/errors.ts`, after `DS-E083`:

```ts
  'DS-E084': {
    title: 'Configuration not expressible for target',
    hint: 'The target cannot represent this. For MUI, modeSelector must be `:root[data-x="{mode}"]`, `[data-x="{mode}"]`, or `.x-{mode}`, and only color tokens may vary by mode. Change ds.config.json or the token.',
  },
  'DS-E085': {
    title: 'Component not expressible for target',
    hint: 'The MUI target renders each component as a React component: states must be hover, focus-visible, active, disabled, pressed, selected, expanded, or checked; slot elements must be plain HTML tags; slot names must not collide with children, className, style, ref, key, an axis, or a state. Change the manifest, or set targets.mui to { "excluded": "<reason>" }.',
  },
```

- [ ] **Step 9: Exports**

In `src/index.ts`: change the `values` re-export (if any) to `'./targets/css-values.js'` and add:

```ts
export {
  formatNumber,
  renderColor,
  renderDimension,
  renderFontFamily,
  renderLiteralValue,
  renderShadow,
  renderTokenValue,
} from './targets/css-values.js';
export { generateOutputs } from './generate.js';
export type { PluginOutput } from './targets/plugin.js';
export { muiHintsSchema } from './targets/hints.js';
export {
  MUI_ID,
  ignoredForMui,
  isMappedForMui,
  muiExclusion,
} from './targets/mui/hints.js';
export {
  camelCase,
  camelCategory,
  camelProperty,
  colorSchemeSelectorFor,
  kebabCategory,
  kebabProperty,
  muiVarName,
  muiVarPath,
  pascalCase,
  slotClassName,
  sourceNameFromMui,
  specificityKey,
  themeKeyFor,
} from './targets/mui/names.js';
```

- [ ] **Step 10: Run everything**

```bash
npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore
npm run schema
npx vitest run
npm run typecheck
npm run lint
npm run format
npm run build
```

Expected: all green; `git status --short` shows only the files listed above plus `schemas/manifest.schema.json`. The tailwind suites are unchanged in count.

- [ ] **Step 11: Checkpoint**

Report: `src/targets/css-values.ts`, `src/targets/mui/{hints,names}.ts`, `test/mui-names.test.ts` created; `src/targets/tailwind/values.ts` deleted; `plugin.ts`, `hints.ts`, `tailwind/{render,reparse,index}.ts`, `generate.ts`, `verify/{drift,index}.ts`, `errors.ts`, `index.ts`, `schemas/manifest.schema.json`, `test/{tailwind-fixture,targets-hints,errors}.test.ts` modified.

---

## Task 2: The MUI model

**Files:**
- Create: `packages/ds-compiler/src/targets/mui/model.ts`
- Test: `packages/ds-compiler/test/mui-model.test.ts`

The model is the single in-memory description of the MUI output: `themeOptions` (exactly what `theme.ts` will contain) plus per-component metadata for the React shells. `theme.model.json` is its JSON, `reparse` reads it back, and the package test asserts `theme.ts` equals it.

- [ ] **Step 1: Write the failing tests**

`test/mui-model.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { buildMuiModel, muiModelSchema } from '../src/targets/mui/model.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

function modelFor(extra: Record<string, string> = {}) {
  const root = twRoot(extra);
  const { ir, config } = twBuild(root);
  const diag = new Diagnostics();
  const model = buildMuiModel(ir, twContext(root, config), diag);
  return { model, diag, ir };
}

describe('mui model', () => {
  it('places color tokens per color scheme and everything else under tokens, all as strings', () => {
    const { model, diag } = modelFor();
    expect(diag.errors).toEqual([]);
    const theme = model!.themeOptions;
    expect(theme.cssVariables).toEqual({
      cssVarPrefix: 'fx',
      colorSchemeSelector: 'data-fx-theme',
    });
    expect(theme.defaultColorScheme).toBe('light');
    expect(Object.keys(theme.colorSchemes)).toEqual(['light', 'dark']);
    expect(theme.colorSchemes.light.palette.tokens).toEqual({
      'neutral-900': '#111111',
      'text-default': 'var(--fx-palette-tokens-neutral-900)',
    });
    expect(theme.colorSchemes.dark.palette.tokens).toEqual({
      'neutral-900': '#111111',
      'text-default': '#ffffff',
    });
    expect(Object.keys(theme.tokens)).toEqual(['fontFamily', 'shadow', 'space']);
    expect(theme.tokens.space).toEqual({ '2': '8px' });
    expect(theme.tokens.fontFamily).toEqual({ body: "'Open Sans', Arial, sans-serif" });
    expect(theme.tokens.shadow).toEqual({
      focus: '0px 0px 0px 2px var(--fx-palette-tokens-neutral-900)',
    });
    expect(model!.framework).toEqual({ name: '@mui/material', range: '^9.4.0' });
    expect(model!.generated).toMatch(
      /^Generated by @bwp-web\/ds-compiler 0\.0\.0-test for target mui from design\.ir\.json \(source hash [0-9a-f]+\)\. Do not edit; run bwp-ds generate\.$/,
    );
  });

  it('turns the base rule into styleOverrides.root and every other rule into an ordered variant', () => {
    const { model } = modelFor();
    const chip = model!.themeOptions.components.FxChip;
    expect(chip.styleOverrides.root).toEqual({
      color: 'var(--fx-palette-tokens-text-default)',
      display: 'inline-flex',
      fontFamily: 'var(--fx-tokens-fontFamily-body)',
      paddingBottom: 'var(--fx-tokens-space-2)',
      paddingLeft: 'var(--fx-tokens-space-2)',
      paddingRight: 'var(--fx-tokens-space-2)',
      paddingTop: 'var(--fx-tokens-space-2)',
    });
    expect(chip.variants).toEqual([
      { props: {}, style: { '&:hover': { boxShadow: 'var(--fx-tokens-shadow-focus)' } } },
      { props: {}, style: { '&:disabled': { opacity: '0.4' } } },
      { props: { tone: 'loud' }, style: { '&&': { minWidth: '44px' } } },
      { props: {}, style: { '& .FxChip-icon': { width: '20px' } } },
    ]);
  });

  it('drops ignored properties and rules left empty by them; uses aria-disabled for a div root', () => {
    const { model } = modelFor();
    const tag = model!.themeOptions.components.FxTag;
    expect(tag).toEqual({
      styleOverrides: { root: { display: 'inline-block' } },
      variants: [],
    });
    expect(model!.components.tag).toEqual({
      name: 'tag',
      exportName: 'Tag',
      themeKey: 'FxTag',
      rootElement: 'div',
      axes: {},
      stateProps: [{ state: 'disabled', prop: 'disabled', attribute: 'aria-disabled' }],
      slots: {},
      childrenSlot: null,
    });
  });

  it('describes the React shell: axes, state props, slots, children slot', () => {
    const { model } = modelFor();
    expect(model!.components.chip).toEqual({
      name: 'chip',
      exportName: 'Chip',
      themeKey: 'FxChip',
      rootElement: 'button',
      axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
      stateProps: [{ state: 'disabled', prop: 'disabled', attribute: 'disabled' }],
      slots: { icon: { element: 'span', optional: true, className: 'FxChip-icon' } },
      childrenSlot: null,
    });
    expect(Object.keys(model!.components)).toEqual(['chip', 'tag']);
    expect(Object.keys(model!.themeOptions.components)).toEqual(['FxChip', 'FxTag']);
  });

  it('routes children into the label slot when there is one', () => {
    const { model } = modelFor({
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
        baseline: false,
        states: ['hover', 'pressed'],
        slots: {
          root: { element: 'article' },
          media: { element: 'div', optional: true },
          label: { element: 'h3' },
          body: { element: 'p' },
        },
        targets: { tailwind: {}, mui: {} },
      }),
      'src/components/card/card.css':
        '.fx-card {\n  display: block;\n}\n.fx-card[aria-pressed="true"] .fx-card__label {\n  display: none;\n}\n',
    });
    const card = model!.components.card;
    expect(card.childrenSlot).toBe('label');
    expect(Object.keys(card.slots)).toEqual(['media', 'label', 'body']);
    expect(card.stateProps).toEqual([{ state: 'pressed', prop: 'pressed', attribute: 'aria-pressed' }]);
    expect(model!.themeOptions.components.FxCard.variants).toEqual([
      { props: {}, style: { '&[aria-pressed="true"] .FxCard-label': { display: 'none' } } },
    ]);
  });

  it('validates against its own schema', () => {
    const { model } = modelFor();
    expect(muiModelSchema.safeParse(JSON.parse(JSON.stringify(model))).success).toBe(true);
    expect(muiModelSchema.safeParse({ ...model, extra: 1 }).success).toBe(false);
  });

  it('rejects a mode selector MUI cannot express (DS-E084 at the config)', () => {
    const config = JSON.parse(
      JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light', 'dark'],
        defaultMode: 'light',
        modeSelector: 'html[data-fx-theme="{mode}"]',
        targets: { tailwind: { outDir: 'out/tailwind' }, mui: { outDir: 'out/mui' } },
        coverageFile: 'out/coverage.md',
      }),
    );
    const { model, diag } = modelFor({
      'ds.config.json': JSON.stringify(config, null, 2),
      'src/tokens/color.css': [
        ':root {',
        '  --fx-color-neutral-900: #111111;',
        '  --fx-color-text-default: var(--fx-color-neutral-900);',
        '}',
        'html[data-fx-theme="dark"] {',
        '  --fx-color-text-default: #ffffff;',
        '}',
        '',
      ].join('\n'),
    });
    expect(model).toBeNull();
    expect(diag.errors.map((d) => [d.code, d.location?.file])).toEqual([
      ['DS-E084', 'ds.config.json'],
    ]);
    expect(diag.errors[0].message).toContain('html[data-fx-theme="{mode}"]');
  });

  it('rejects a non-color token that varies by mode (DS-E084 at the token)', () => {
    const { model, diag } = modelFor({
      'src/tokens/space.css':
        ':root {\n  --fx-space-2: 8px;\n}\n:root[data-fx-theme="dark"] {\n  --fx-space-2: 10px;\n}\n',
    });
    expect(model).toBeNull();
    expect(diag.errors.map((d) => [d.code, d.location?.file])).toEqual([
      ['DS-E084', 'src/tokens/space.css'],
    ]);
    expect(diag.errors[0].message).toContain('--fx-space-2');
  });

  it('rejects components a React shell cannot express (DS-E085), naming the reason', () => {
    const { model, diag } = modelFor({
      'src/components/dot/dot.manifest.json': JSON.stringify({
        name: 'dot',
        displayName: 'Dot',
        baseline: false,
        states: ['busy'],
        slots: { root: { element: 'my-dot' }, style: { element: 'span' } },
        targets: { tailwind: {}, mui: {} },
      }),
      'src/components/dot/dot.css':
        '.fx-dot {\n  display: block;\n}\n.fx-dot[data-state="busy"] {\n  display: none;\n}\n',
    });
    expect(model).toBeNull();
    const messages = diag.errors.map((d) => d.message);
    expect(diag.errors.every((d) => d.code === 'DS-E085')).toBe(true);
    expect(diag.errors.every((d) => d.location?.file === 'src/components/dot/dot.manifest.json')).toBe(true);
    expect(messages.some((m) => m.includes('"my-dot"'))).toBe(true);
    expect(messages.some((m) => m.includes('state "busy"'))).toBe(true);
    expect(messages.some((m) => m.includes('slot "style"'))).toBe(true);
  });

  it('leaves excluded and unmapped components out', () => {
    const { model } = modelFor({
      'src/components/free/free.manifest.json': JSON.stringify({
        name: 'free',
        displayName: 'Free',
        baseline: false,
        targets: { tailwind: {} },
      }),
      'src/components/free/free.css': '.fx-free {\n  display: block;\n}\n',
    });
    expect(model!.components.pill).toBeUndefined();
    expect(model!.components.free).toBeUndefined();
    expect(model!.themeOptions.components.FxPill).toBeUndefined();
  });
});
```

If the manifest schema rejects `my-dot` as a slot element, change that case to an element it does accept but that is not a plain tag (check `slotSchema` in `src/components/manifest.ts`); if every accepted element is a plain tag, drop the `"my-dot"` assertion and the `INTRINSIC` check below, and record that in the plan's decisions.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run test/mui-model.test.ts`
Expected: FAIL, `../src/targets/mui/model.js` cannot be resolved.

- [ ] **Step 3: Create `src/targets/mui/model.ts`**

```ts
import { z } from 'zod';
import { FORM_CONTROL_ELEMENTS } from '../../components/render-selector.js';
import { ARIA_TRUE_STATES, PSEUDO_STATES } from '../../components/states.js';
import type { Diagnostics, SourceLocation } from '../../errors.js';
import type {
  AxisIR,
  ComponentIR,
  DesignIR,
  IRValue,
  Token,
  TokenId,
} from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import { renderLiteralValue, renderTokenValue } from '../css-values.js';
import type { PluginContext } from '../plugin.js';
import { ignoredForMui, isMappedForMui } from './hints.js';
import {
  camelCategory,
  camelProperty,
  colorSchemeSelectorFor,
  muiVarName,
  pascalCase,
  slotClassName,
  specificityKey,
  themeKeyFor,
} from './names.js';

export const MUI_PACKAGE = '@mui/material';
/** The MUI range the generated package peer-depends on. Bump with the catalog in Plan 3b. */
export const MUI_RANGE = '^9.4.0';

/** camelCase property to CSS text. Every value is a string: Emotion appends `px` to bare numbers. */
export type MuiDeclarations = Record<string, string>;

export interface MuiVariant {
  /** Axis name to value; `{}` matches every instance. */
  props: Record<string, string>;
  /** Exactly one nested selector key (see `specificityKey`) to its declarations. */
  style: Record<string, MuiDeclarations>;
}

export interface MuiComponentTheme {
  styleOverrides: { root: MuiDeclarations };
  variants: MuiVariant[];
}

/** Exactly the object `theme.ts` exports; key order is the rendering order. */
export interface MuiThemeOptions {
  cssVariables: { cssVarPrefix: string; colorSchemeSelector: string };
  defaultColorScheme: string;
  colorSchemes: Record<string, { palette: { tokens: Record<string, string> } }>;
  tokens: Record<string, Record<string, string>>;
  components: Record<string, MuiComponentTheme>;
}

export interface MuiAxisModel {
  values: string[];
  default: string;
  /** The React prop name: camelCase of the axis name. */
  prop: string;
}

export interface MuiSlotModel {
  element: string;
  optional: boolean;
  className: string;
  /** The React prop name (and `classes` key): camelCase of the slot name. */
  prop: string;
}

/** A state that needs a prop on the React shell (pseudo-class states need none). */
export interface MuiStateProp {
  state: string;
  prop: string;
  /** `disabled`, `aria-disabled`, or `aria-<state>`. */
  attribute: string;
}

export interface MuiComponentModel {
  name: string;
  exportName: string;
  themeKey: string;
  rootElement: string;
  /** Fresh copies in manifest order, never the IR's objects, so JSON key order is deterministic. */
  axes: Record<string, MuiAxisModel>;
  stateProps: MuiStateProp[];
  /** Non-root slots in manifest order. */
  slots: Record<string, MuiSlotModel>;
  /** The slot that renders `children`, or null when children go straight into the root. */
  childrenSlot: string | null;
}

export interface MuiModel {
  /** The header text; JSON has no comments, so it is the first key. */
  generated: string;
  prefix: string;
  framework: { name: typeof MUI_PACKAGE; range: string };
  themeOptions: MuiThemeOptions;
  /** By design-system component name, sorted. */
  components: Record<string, MuiComponentModel>;
}

const declarations = z.record(z.string(), z.string());

/** Shape check for `theme.model.json` before `reparse` trusts it. */
export const muiModelSchema = z.strictObject({
  generated: z.string(),
  prefix: z.string(),
  framework: z.strictObject({ name: z.literal(MUI_PACKAGE), range: z.string() }),
  themeOptions: z.strictObject({
    cssVariables: z.strictObject({
      cssVarPrefix: z.string(),
      colorSchemeSelector: z.string(),
    }),
    defaultColorScheme: z.string(),
    colorSchemes: z.record(
      z.string(),
      z.strictObject({ palette: z.strictObject({ tokens: declarations }) }),
    ),
    tokens: z.record(z.string(), declarations),
    components: z.record(
      z.string(),
      z.strictObject({
        styleOverrides: z.strictObject({ root: declarations }),
        variants: z.array(
          z.strictObject({
            props: z.record(z.string(), z.string()),
            style: z
              .record(z.string(), declarations)
              .refine((s) => Object.keys(s).length === 1, 'exactly one selector key'),
          }),
        ),
      }),
    ),
  }),
  components: z.record(
    z.string(),
    z.strictObject({
      name: z.string(),
      exportName: z.string(),
      themeKey: z.string(),
      rootElement: z.string(),
      axes: z.record(
        z.string(),
        z.strictObject({ values: z.array(z.string()), default: z.string(), prop: z.string() }),
      ),
      stateProps: z.array(
        z.strictObject({ state: z.string(), prop: z.string(), attribute: z.string() }),
      ),
      slots: z.record(
        z.string(),
        z.strictObject({
          element: z.string(),
          optional: z.boolean(),
          className: z.string(),
          prop: z.string(),
        }),
      ),
      childrenSlot: z.string().nullable(),
    }),
  ),
});

export function muiHeaderText(ir: DesignIR, ctx: PluginContext): string {
  return `Generated by @bwp-web/ds-compiler ${ctx.compilerVersion} for target mui from design.ir.json (source hash ${ir.meta.sourceHash}). Do not edit; run bwp-ds generate.`;
}

/** `var(<mui variable>)` for a token reference, CSS text for a literal. */
export function muiValue(ir: DesignIR, value: IRValue): string {
  if (value.kind === 'token') {
    return `var(${muiVarName(ir.meta.prefix, ir.tokens[value.ref])})`;
  }
  return renderLiteralValue(value);
}

function tokenText(
  token: Token,
  mode: string,
  refName: (id: TokenId) => string,
): string {
  if (token.modeInvariant) {
    return token.alias
      ? `var(${refName(token.alias)})`
      : renderTokenValue(token.$value, token.$type, refName);
  }
  const alias = token.alias?.[mode];
  return alias
    ? `var(${refName(alias)})`
    : renderTokenValue(token.$value[mode], token.$type, refName);
}

const RESERVED_PROPS: ReadonlySet<string> = new Set([
  'children',
  'className',
  'style',
  'ref',
  'key',
]);
/** A plain HTML tag: the React shell types its root as an intrinsic element. */
const INTRINSIC_ELEMENT = /^[a-z][a-z0-9]*$/;

function manifestLocation(component: ComponentIR): SourceLocation {
  return {
    file: `src/components/${component.name}/${component.name}.manifest.json`,
    line: 1,
    column: 1,
  };
}

function ariaAttributeFor(state: string): string | null {
  const entry = Object.entries(ARIA_TRUE_STATES).find(([, s]) => s === state);
  return entry ? entry[0] : null;
}

/** The React-shell description, or null after reporting every DS-E085 for the component. */
function componentModel(
  component: ComponentIR,
  prefix: string,
  diag: Diagnostics,
): MuiComponentModel | null {
  const before = diag.errors.length;
  const at = manifestLocation(component);
  const fail = (message: string): void => {
    diag.add('DS-E085', `mui: ${component.name}: ${message}`, at);
  };
  const rootElement = component.slots.root?.element ?? 'div';
  const themeKey = themeKeyFor(prefix, component.name);
  for (const [slot, def] of Object.entries(component.slots)) {
    if (!INTRINSIC_ELEMENT.test(def.element)) {
      fail(`slot "${slot}" uses element "${def.element}", which is not a plain HTML tag`);
    }
  }
  const axisNames = Object.keys(component.axes);
  for (const axis of axisNames) {
    if (RESERVED_PROPS.has(axis)) {
      fail(`axis "${axis}" collides with a reserved React prop`);
    }
  }
  const stateProps: MuiStateProp[] = [];
  for (const state of component.states) {
    if (state === 'disabled') {
      stateProps.push({
        state,
        prop: 'disabled',
        attribute: FORM_CONTROL_ELEMENTS.has(rootElement) ? 'disabled' : 'aria-disabled',
      });
    } else if (ariaAttributeFor(state)) {
      stateProps.push({ state, prop: state, attribute: ariaAttributeFor(state)! });
    } else if (!Object.hasOwn(PSEUDO_STATES, state)) {
      fail(`state "${state}" cannot be expressed as a React prop or a pseudo-class`);
    }
    if (axisNames.includes(state)) {
      fail(`state "${state}" collides with the axis of the same name`);
    }
  }
  const nonRoot = Object.keys(component.slots).filter((s) => s !== 'root');
  const childrenSlot = nonRoot.includes('label')
    ? 'label'
    : (nonRoot.find((s) => !component.slots[s].optional) ?? null);
  for (const slot of nonRoot) {
    // Applies to the children slot too: a slot named `style` must fail even
    // when children would be routed into it.
    if (
      RESERVED_PROPS.has(slot) ||
      axisNames.includes(slot) ||
      stateProps.some((p) => p.prop === slot)
    ) {
      fail(`slot "${slot}" collides with a reserved prop, an axis, or a state`);
    }
  }
  if (diag.errors.length > before) {
    return null;
  }
  return {
    name: component.name,
    exportName: pascalCase(component.name),
    themeKey,
    rootElement,
    axes: component.axes,
    stateProps,
    slots: Object.fromEntries(
      nonRoot.map((s) => [
        s,
        {
          element: component.slots[s].element,
          optional: component.slots[s].optional,
          className: slotClassName(themeKey, s),
        },
      ]),
    ),
    childrenSlot,
  };
}

/**
 * The base root rule becomes `styleOverrides.root`; every other rule, in the
 * IR's canonical order, becomes one variant keyed by `specificityKey`, so
 * Emotion resolves the cascade exactly as the CSS target does. Ignored
 * properties are dropped, and a rule left empty by that is skipped.
 */
function componentTheme(
  ir: DesignIR,
  component: ComponentIR,
  model: MuiComponentModel,
): MuiComponentTheme {
  const ignored = ignoredForMui(component);
  const axisOrder = Object.keys(component.axes);
  let root: MuiDeclarations = {};
  const variants: MuiVariant[] = [];
  for (const rule of component.rules) {
    const props = Object.keys(rule.declarations)
      .filter((p) => !ignored.has(p))
      .sort(codeUnitCompare);
    if (props.length === 0) {
      continue;
    }
    const decls: MuiDeclarations = Object.fromEntries(
      props.map((p) => [camelProperty(p), muiValue(ir, rule.declarations[p])]),
    );
    const axesCount = Object.keys(rule.axes).length;
    if (rule.slot === 'root' && axesCount === 0 && rule.states.length === 0) {
      root = decls;
      continue;
    }
    const variantProps = Object.fromEntries(
      axisOrder
        .filter((a) => Object.hasOwn(rule.axes, a))
        .map((a) => [a, rule.axes[a]]),
    );
    const key = specificityKey(
      axesCount,
      rule.states,
      model.rootElement,
      rule.slot,
      model.themeKey,
    );
    variants.push({ props: variantProps, style: { [key]: decls } });
  }
  return { styleOverrides: { root }, variants };
}

/**
 * Builds the model, reporting DS-E084 (configuration MUI cannot express) and
 * DS-E085 (component a React shell cannot express) on `diag`. Returns null
 * when it reported anything.
 */
export function buildMuiModel(
  ir: DesignIR,
  ctx: PluginContext,
  diag: Diagnostics,
): MuiModel | null {
  const before = diag.errors.length;
  const prefix = ir.meta.prefix;
  const selector = colorSchemeSelectorFor(ir.meta.modeSelector);
  if (selector === null) {
    diag.add(
      'DS-E084',
      `mui: modeSelector "${ir.meta.modeSelector}" cannot be expressed as an MUI colorSchemeSelector`,
      { file: 'ds.config.json', line: 1, column: 1 },
    );
  }
  const themeOptions: MuiThemeOptions = {
    cssVariables: { cssVarPrefix: prefix, colorSchemeSelector: selector ?? '' },
    defaultColorScheme: ir.meta.defaultMode,
    colorSchemes: Object.fromEntries(
      ir.meta.modes.map((m) => [m, { palette: { tokens: {} as Record<string, string> } }]),
    ),
    tokens: {},
    components: {},
  };
  const refName = (id: TokenId): string => muiVarName(prefix, ir.tokens[id]);
  const byCategory = new Map<string, Record<string, string>>();
  for (const id of Object.keys(ir.tokens).sort(codeUnitCompare)) {
    const token = ir.tokens[id];
    const key = token.path.join('-');
    if (token.category === 'color') {
      for (const mode of ir.meta.modes) {
        themeOptions.colorSchemes[mode].palette.tokens[key] = tokenText(token, mode, refName);
      }
    } else if (!token.modeInvariant) {
      diag.add(
        'DS-E084',
        `mui: "${token.cssName}" varies by mode; MUI can only vary color tokens per color scheme`,
        token.source,
      );
    } else {
      const category = camelCategory(token.category);
      const bucket = byCategory.get(category) ?? {};
      byCategory.set(category, bucket);
      bucket[key] = tokenText(token, ir.meta.defaultMode, refName);
    }
  }
  for (const category of [...byCategory.keys()].sort(codeUnitCompare)) {
    themeOptions.tokens[category] = byCategory.get(category)!;
  }
  const components: Record<string, MuiComponentModel> = {};
  for (const name of Object.keys(ir.components).sort(codeUnitCompare)) {
    const component = ir.components[name];
    if (!isMappedForMui(component)) {
      continue;
    }
    const model = componentModel(component, prefix, diag);
    if (!model) {
      continue;
    }
    themeOptions.components[model.themeKey] = componentTheme(ir, component, model);
    components[name] = model;
  }
  if (diag.errors.length > before) {
    return null;
  }
  return {
    generated: muiHeaderText(ir, ctx),
    prefix,
    framework: { name: MUI_PACKAGE, range: MUI_RANGE },
    themeOptions,
    components,
  };
}
```

The code above is the plan's first cut; the review amendments below are authoritative where they differ:

- Prop names: `propNameFor(name)` (= `camelCase`) in `names.ts`; `axes[a].prop`, `slots[s].prop`, `stateProps[].prop`, and `variants[].props` keys are prop names; collision checks compare prop names.
- Elements are validated against `src/targets/mui/html-elements.ts` (`HTML_ELEMENTS`, the HTML living-standard tags plus `svg`), not a regex.
- `RESERVED_PROPS` also holds `sx`, `component`, `as`, `ownerState`, `theme`, `classes`.
- The axis/state collision check runs only for states that yield a prop (`disabled`, ARIA states).
- Axes and slots are copied into fresh objects in manifest order, read from the IR's `axisOrder` and `slotOrder` (batch 2 review), never from record key order.
- Modes must be `light` and/or `dark`; any other mode is DS-E084 (`mui: mode "<m>" cannot be expressed; MUI color schemes are "light" and "dark"`).
- Void elements (`VOID_ELEMENTS`) are DS-E085 anywhere; SVG elements other than `svg` are DS-E085 unless the root element is `svg`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run test/mui-model.test.ts`
Expected: PASS. If the `card` case fails on rule order, print `ir.components.card.rules.map(ruleDiffKey)` and align the expectation with the compiler's canonical order rather than changing `compareRules`.

- [ ] **Step 5: Exports and gates**

Add to `src/index.ts`:

```ts
export {
  MUI_PACKAGE,
  MUI_RANGE,
  buildMuiModel,
  muiHeaderText,
  muiModelSchema,
  muiValue,
} from './targets/mui/model.js';
export type {
  MuiComponentModel,
  MuiComponentTheme,
  MuiDeclarations,
  MuiModel,
  MuiSlotModel,
  MuiStateProp,
  MuiThemeOptions,
  MuiVariant,
} from './targets/mui/model.js';
```

Run `npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore && npx vitest run && npm run typecheck && npm run lint && npm run format`. Expected: all green.

- [ ] **Step 6: Checkpoint**

Report: `src/targets/mui/model.ts`, `test/mui-model.test.ts` created; `src/index.ts` modified.

---

## Task 3: Rendering `theme.ts`, `augmentation.ts`, the React shells, and `theme.model.json`

**Files:**
- Create: `packages/ds-compiler/src/targets/mui/render-ts.ts`
- Create: `packages/ds-compiler/src/targets/mui/render-component.ts`
- Create: `packages/ds-compiler/src/targets/mui/generate.ts`
- Modify: `packages/ds-compiler/src/index.ts`
- Test: `packages/ds-compiler/test/mui-generate.test.ts`

The plugin is not registered yet (Task 4 does that together with `reparse`), so every existing test keeps passing.

- [ ] **Step 1: Write the failing tests**

`test/mui-generate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { serializeIR } from '../src/ir/serialize.js';
import type { DesignIR } from '../src/ir/types.js';
import { generateMui } from '../src/targets/mui/generate.js';
import { renderTsLiteral } from '../src/targets/mui/render-ts.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

function generated(extra: Record<string, string> = {}) {
  const root = twRoot(extra);
  const { ir, config } = twBuild(root);
  const diag = new Diagnostics();
  const files = generateMui(ir, twContext(root, config), diag);
  const byPath = Object.fromEntries(files.map((f) => [f.path, f.contents]));
  return { files, byPath, diag, ir, ctx: twContext(root, config) };
}

const HEADER =
  /^\/\/ Generated by @bwp-web\/ds-compiler 0\.0\.0-test for target mui from design\.ir\.json \(source hash [0-9a-f]+\)\. Do not edit; run bwp-ds generate\.\n/;

describe('renderTsLiteral', () => {
  it('renders an object literal that evaluates back to the same value', () => {
    const value = {
      'quoted-key': "it's",
      plain: 'back\\slash',
      nested: { list: ['a', { b: '2' }], empty: {}, none: [] },
      n: 3,
      t: true,
    };
    const text = renderTsLiteral(value);
    expect(text.startsWith('{\n  ')).toBe(true);
    expect(text).toContain("'quoted-key': 'it\\'s',");
    expect(text).toContain('plain: ');
    expect(new Function(`return ${text};`)()).toEqual(value);
  });
});

describe('generateMui', () => {
  it('emits the model, the theme, the augmentation, one shell per component, and the indexes, each with a header', () => {
    const { files, byPath, diag } = generated();
    expect(diag.errors).toEqual([]);
    expect(files.map((f) => f.path)).toEqual([
      'theme.model.json',
      'theme.ts',
      'augmentation.ts',
      'components/Chip.tsx',
      'components/Tag.tsx',
      'components/index.ts',
      'index.ts',
      'typecheck.tsx',
    ]);
    for (const path of Object.keys(byPath).filter((p) => p !== 'theme.model.json')) {
      expect(byPath[path], path).toMatch(HEADER);
    }
    const model = JSON.parse(byPath['theme.model.json']) as { generated: string };
    expect(Object.keys(model)[0]).toBe('generated');
    expect(model.generated.startsWith('Generated by @bwp-web/ds-compiler')).toBe(true);
    expect(byPath['theme.model.json'].endsWith('\n')).toBe(true);
  });

  it('renders theme.ts from the model so the two are deep-equal', () => {
    const { byPath } = generated();
    const theme = byPath['theme.ts'];
    expect(theme).toContain("import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';");
    expect(theme).toContain("import './augmentation.js';");
    expect(theme).toContain('export const fxThemeOptions = {');
    expect(theme).toContain('} satisfies ThemeOptions;');
    expect(theme).toContain('export function createFxTheme(options: ThemeOptions = {}): Theme {');
    expect(theme).toContain('return createTheme(fxThemeOptions, options);');
    const literal = theme.slice(
      theme.indexOf('export const fxThemeOptions = ') + 'export const fxThemeOptions = '.length,
      theme.indexOf(' satisfies ThemeOptions;'),
    );
    const model = JSON.parse(byPath['theme.model.json']) as { themeOptions: unknown };
    expect(new Function(`return ${literal};`)()).toEqual(model.themeOptions);
  });

  it('augments MUI with exact token keys and the component theme entries', () => {
    const { byPath } = generated();
    const aug = byPath['augmentation.ts'];
    expect(aug).toContain("import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';");
    expect(aug).toContain("import type { ChipProps } from './components/Chip.js';");
    expect(aug).toContain("type ColorTokenKey = 'neutral-900' | 'text-default';");
    expect(aug).toContain("  fontFamily: Record<'body', string>;");
    expect(aug).toContain("  space: Record<'2', string>;");
    expect(aug).toContain("  fontFamily?: Partial<Record<'body', string>>;");
    expect(aug).toContain("declare module '@mui/material/styles' {");
    expect(aug).toContain('  interface CssThemeVariables {\n    enabled: true;\n  }');
    expect(aug).toContain('  interface Palette {\n    tokens: Record<ColorTokenKey, string>;\n  }');
    expect(aug).toContain('  interface PaletteOptions {\n    tokens?: Partial<Record<ColorTokenKey, string>>;\n  }');
    expect(aug).toContain('  interface Theme {\n    tokens: DsTokens;\n  }');
    expect(aug).toContain('  interface ThemeOptions {\n    tokens?: DsTokenOptions;\n  }');
    expect(aug).toContain('  interface ThemeVars {\n    tokens: DsTokens;\n  }');
    expect(aug).toContain('  interface ComponentsPropsList {\n    FxChip: ChipProps;\n    FxTag: TagProps;\n  }');
    expect(aug).toContain("  interface ComponentNameToClassKey {\n    FxChip: 'root' | 'icon';\n    FxTag: 'root';\n  }");
    expect(aug).toContain('  interface Components<Theme = unknown> {');
    expect(aug).toContain("    FxChip?: {\n      defaultProps?: ComponentsProps['FxChip'];\n      styleOverrides?: ComponentsOverrides<Theme>['FxChip'];\n      variants?: ComponentsVariants<Theme>['FxChip'];\n    };");
    expect(aug).not.toContain('ColorSchemeOverrides'); // MUI modes are light/dark only
    expect(aug.trimEnd().endsWith('export {};')).toBe(true);
  });

  it('rejects modes other than light and dark (DS-E084) and emits nothing', () => {
    const config = {
      name: 'Fictional',
      prefix: 'fx',
      modes: ['day', 'night'],
      defaultMode: 'day',
      targets: { tailwind: { outDir: 'out/tailwind' }, mui: { outDir: 'out/mui' } },
      coverageFile: 'out/coverage.md',
    };
    const { byPath, diag } = generated({
      'ds.config.json': JSON.stringify(config, null, 2),
      'src/tokens/color.css': [
        ':root {',
        '  --fx-color-neutral-900: #111111;',
        '  --fx-color-text-default: var(--fx-color-neutral-900);',
        '}',
        ':root[data-fx-theme="night"] {',
        '  --fx-color-text-default: #ffffff;',
        '}',
        '',
      ].join('\n'),
    });
    expect(Object.keys(byPath)).toEqual([]);
    expect(diag.errors.map((d) => d.code)).toEqual(['DS-E084', 'DS-E084']);
    expect(diag.errors[0].message).toContain('"day"');
  });

  it('renders a button-rooted shell with exact prop unions, a disabled attribute, and an optional icon slot', () => {
    const { byPath } = generated();
    const chip = byPath['components/Chip.tsx'];
    expect(chip).toContain("import * as React from 'react';");
    expect(chip).toContain("import { styled, useThemeProps } from '@mui/material/styles';");
    expect(chip).toContain("export type ChipTone = 'quiet' | 'loud';");
    expect(chip).toContain('export interface ChipOwnerState {\n  tone: ChipTone;\n}');
    expect(chip).toContain("extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children' | 'disabled' | 'icon' | 'tone'>");
    expect(chip).toContain('  tone?: ChipTone;');
    expect(chip).toContain('  disabled?: boolean;');
    expect(chip).toContain('  children?: React.ReactNode;');
    expect(chip).toContain('  icon?: React.ReactNode;');
    expect(chip).toContain("export const chipClasses = {\n  root: 'FxChip-root',\n  icon: 'FxChip-icon',\n} as const;");
    expect(chip).toContain("const ChipRoot = styled('button', {\n  name: 'FxChip',\n  slot: 'Root',\n  overridesResolver: (_props, styles) => styles.root,\n})<{ ownerState: ChipOwnerState }>({});");
    expect(chip).toContain("export const Chip = React.forwardRef<React.ComponentRef<'button'>, ChipProps>(");
    expect(chip).toContain('function Chip(inProps, ref) {');
    expect(chip).toContain("const props = useThemeProps({ props: inProps, name: 'FxChip' });");
    expect(chip).toContain("const { tone = 'quiet', disabled = false, children, icon, className, ...other } = props;");
    expect(chip).toContain('const ownerState: ChipOwnerState = { tone };');
    expect(chip).toContain('disabled={disabled}');
    expect(chip).not.toContain('aria-disabled');
    expect(chip).toContain('{children}');
    expect(chip).toContain('{icon === undefined ? null : <span className={chipClasses.icon}>{icon}</span>}');
    expect(chip.trimEnd().endsWith(');')).toBe(true);
  });

  it('renders a div-rooted shell with aria-disabled and an empty owner state', () => {
    const { byPath } = generated();
    const tag = byPath['components/Tag.tsx'];
    expect(tag).toContain("const TagRoot = styled('div', {");
    expect(tag).toContain('export type TagOwnerState = Record<never, never>;');
    expect(tag).toContain('aria-disabled={disabled ? true : undefined}');
    expect(tag).not.toContain('disabled={disabled}');
    expect(tag).toContain("extends Omit<React.ComponentPropsWithoutRef<'div'>, 'aria-disabled' | 'children' | 'disabled'>");
    expect(tag).not.toContain('opacity');
  });

  it('routes children into the label slot and renders the other slots in manifest order', () => {
    const { byPath } = generated({
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
        baseline: false,
        states: ['pressed'],
        slots: {
          root: { element: 'article' },
          media: { element: 'div', optional: true },
          label: { element: 'h3' },
          body: { element: 'p' },
        },
        targets: { tailwind: {}, mui: {} },
      }),
      'src/components/card/card.css': '.fx-card {\n  display: block;\n}\n',
    });
    const card = byPath['components/Card.tsx'];
    expect(card).toContain("Omit<React.ComponentPropsWithoutRef<'article'>, 'aria-pressed' | 'body' | 'children' | 'media' | 'pressed'>");
    // state attributes come after the DOM-prop spread so the component's props win
    expect(card).toContain('        {...other}\n        aria-pressed={pressed ? true : undefined}\n      >');
    expect(card).toContain(
      [
        '        {media === undefined ? null : <div className={cardClasses.media}>{media}</div>}',
        '        <h3 className={cardClasses.label}>{children}</h3>',
        '        {body === undefined ? null : <p className={cardClasses.body}>{body}</p>}',
      ].join('\n'),
    );
  });

  it('camelCases kebab-case axis and slot names as props', () => {
    const { byPath } = generated({
      'src/components/menu-item/menu-item.manifest.json': JSON.stringify({
        name: 'menu-item',
        displayName: 'Menu item',
        baseline: false,
        axes: { 'icon-position': { values: ['start', 'end'], default: 'start' } },
        slots: { root: { element: 'li' }, 'sub-title': { element: 'span', optional: true } },
        targets: { tailwind: {}, mui: {} },
      }),
      'src/components/menu-item/menu-item.css':
        '.fx-menu-item {\n  display: flex;\n}\n.fx-menu-item[data-icon-position="end"] .fx-menu-item__sub-title {\n  display: none;\n}\n',
    });
    const tsx = byPath['components/MenuItem.tsx'];
    expect(tsx).toContain("export type MenuItemIconPosition = 'start' | 'end';");
    expect(tsx).toContain('  iconPosition?: MenuItemIconPosition;');
    expect(tsx).toContain('  subTitle?: React.ReactNode;');
    expect(tsx).toContain("  subTitle: 'FxMenuItem-sub-title',");
    expect(tsx).toContain("const { iconPosition = 'start', children, subTitle, className, ...other } = props;");
    expect(tsx).toContain('{subTitle === undefined ? null : <span className={menuItemClasses.subTitle}>{subTitle}</span>}');
    expect(byPath['theme.ts']).toContain("iconPosition: 'end',");
    expect(byPath['typecheck.tsx']).toContain('<MenuItem iconPosition="end" subTitle="sub-title">');
  });

  it('indexes the components and the theme', () => {
    const { byPath } = generated();
    expect(byPath['components/index.ts']).toContain("export * from './Chip.js';\nexport * from './Tag.js';\n");
    expect(byPath['index.ts']).toContain("import './augmentation.js';\nexport * from './components/index.js';\nexport { createFxTheme, fxThemeOptions } from './theme.js';\n");
  });

  it('emits a type-level probe that accepts the design system values and rejects others', () => {
    const { byPath } = generated();
    const probe = byPath['typecheck.tsx'];
    expect(probe).toContain("import { Chip, Tag } from './components/index.js';");
    expect(probe).not.toContain("from 'react'");
    expect(probe).toContain('export const chipAccepted = (\n  <Chip tone="loud" disabled icon="icon">\n    content\n  </Chip>\n);');
    expect(probe).toContain('// @ts-expect-error tone accepts only the design system values\nexport const chipRejectedTone = <Chip tone="__not_a_value__" />;');
    expect(probe).toContain('// @ts-expect-error unknown props are rejected\nexport const chipRejectedProp = <Chip notAProp="x" />;');
    expect(probe).toContain('export const tagAccepted = (\n  <Tag disabled>\n    content\n  </Tag>\n);');
    expect(probe).not.toContain('tagRejectedTone');
  });

  it('is byte-identical from the in-memory IR and from the serialized IR', () => {
    const { files, ir, ctx } = generated();
    const fromDisk = generateMui(JSON.parse(serializeIR(ir)) as DesignIR, ctx, new Diagnostics());
    expect(fromDisk).toEqual(files);
  });

  it('emits nothing and reports when the model cannot be built', () => {
    const { files, diag } = generated({
      'src/tokens/space.css':
        ':root {\n  --fx-space-2: 8px;\n}\n:root[data-fx-theme="dark"] {\n  --fx-space-2: 10px;\n}\n',
    });
    expect(files).toEqual([]);
    expect(diag.errors.map((d) => d.code)).toEqual(['DS-E084']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run test/mui-generate.test.ts`
Expected: FAIL, modules cannot be resolved.

- [ ] **Step 3: Create `src/targets/mui/render-ts.ts`**

```ts
import { codeUnitCompare } from '../../sources.js';
import type { MuiModel } from './model.js';
import { camelCase, pascalCase } from './names.js';

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function quoteTs(text: string): string {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

function renderKey(key: string): string {
  return IDENTIFIER.test(key) ? key : quoteTs(key);
}

/**
 * A TypeScript object literal for JSON-compatible data, two-space indented,
 * trailing commas, keys in insertion order (the model's order is the cascade
 * order, so it must survive). Evaluating the text yields the input again.
 */
export function renderTsLiteral(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);
  if (typeof value === 'string') {
    return quoteTs(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    const items = value.map((v) => `${inner}${renderTsLiteral(v, indent + 1)},`);
    return `[\n${items.join('\n')}\n${pad}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return '{}';
    }
    const lines = entries.map(
      ([k, v]) => `${inner}${renderKey(k)}: ${renderTsLiteral(v, indent + 1)},`,
    );
    return `{\n${lines.join('\n')}\n${pad}}`;
  }
  throw new Error(`cannot render a ${typeof value} as a TypeScript literal`);
}

export function muiHeader(model: MuiModel): string {
  return `// ${model.generated}`;
}

export function themeOptionsName(model: MuiModel): string {
  return `${camelCase(model.prefix)}ThemeOptions`;
}

export function themeFactoryName(model: MuiModel): string {
  return `create${pascalCase(model.prefix)}Theme`;
}

/** `theme.model.json`: the model as pretty JSON, `generated` first. */
export function renderModelJson(model: MuiModel): string {
  return `${JSON.stringify(model, null, 2)}\n`;
}

export function renderThemeTs(model: MuiModel): string {
  const options = themeOptionsName(model);
  return [
    muiHeader(model),
    '',
    "import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';",
    "import './augmentation.js';",
    '',
    '/** Theme options rendered from theme.model.json; the package test asserts the two are deep-equal. */',
    `export const ${options} = ${renderTsLiteral(model.themeOptions)} satisfies ThemeOptions;`,
    '',
    "/** The design system's MUI theme. `options` are deep-merged on top after the theme is created. */",
    `export function ${themeFactoryName(model)}(options: ThemeOptions = {}): Theme {`,
    `  return createTheme(${options}, options);`,
    '}',
    '',
  ].join('\n');
}

function union(keys: readonly string[]): string {
  return keys.length === 0 ? 'never' : keys.map(quoteTs).join(' | ');
}

export function renderAugmentationTs(model: MuiModel): string {
  const { themeOptions } = model;
  const components = Object.values(model.components);
  const colorKeys = Object.keys(
    themeOptions.colorSchemes[themeOptions.defaultColorScheme]?.palette.tokens ?? {},
  ).sort(codeUnitCompare);
  const categories = Object.keys(themeOptions.tokens);

  const lines: string[] = [muiHeader(model), ''];
  if (components.length > 0) {
    lines.push(
      "import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';",
    );
    for (const c of components) {
      lines.push(`import type { ${c.exportName}Props } from './components/${c.exportName}.js';`);
    }
    lines.push('');
  }
  lines.push(`type ColorTokenKey = ${union(colorKeys)};`);
  if (categories.length === 0) {
    lines.push('type DsTokens = Record<never, never>;', 'type DsTokenOptions = Record<never, never>;');
  } else {
    lines.push('type DsTokens = {');
    for (const category of categories) {
      const keys = Object.keys(themeOptions.tokens[category]).sort(codeUnitCompare);
      lines.push(`  ${category}: Record<${union(keys)}, string>;`);
    }
    lines.push('};', 'type DsTokenOptions = {');
    for (const category of categories) {
      const keys = Object.keys(themeOptions.tokens[category]).sort(codeUnitCompare);
      lines.push(`  ${category}?: Partial<Record<${union(keys)}, string>>;`);
    }
    lines.push('};');
  }
  lines.push(
    '',
    "declare module '@mui/material/styles' {",
    // MUI types `theme.vars`, `generateStyleSheets`, and `getColorSchemeSelector`
    // only when this flag is on; the generated theme always uses cssVariables.
    '  interface CssThemeVariables {',
    '    enabled: true;',
    '  }',
    '  interface Palette {',
    '    tokens: Record<ColorTokenKey, string>;',
    '  }',
    '  interface PaletteOptions {',
    '    tokens?: Partial<Record<ColorTokenKey, string>>;',
    '  }',
    '  interface Theme {',
    '    tokens: DsTokens;',
    '  }',
    '  interface ThemeOptions {',
    '    tokens?: DsTokenOptions;',
    '  }',
    '  interface ThemeVars {',
    '    tokens: DsTokens;',
    '  }',
  );
  if (components.length > 0) {
    lines.push('  interface ComponentsPropsList {');
    for (const c of components) {
      lines.push(`    ${c.themeKey}: ${c.exportName}Props;`);
    }
    lines.push('  }', '  interface ComponentNameToClassKey {');
    for (const c of components) {
      lines.push(`    ${c.themeKey}: ${union(['root', ...Object.values(c.slots).map((s) => s.prop)])};`);
    }
    lines.push('  }', '  interface Components<Theme = unknown> {');
    for (const c of components) {
      lines.push(
        `    ${c.themeKey}?: {`,
        `      defaultProps?: ComponentsProps['${c.themeKey}'];`,
        `      styleOverrides?: ComponentsOverrides<Theme>['${c.themeKey}'];`,
        `      variants?: ComponentsVariants<Theme>['${c.themeKey}'];`,
        '    };',
      );
    }
    lines.push('  }');
  }
  lines.push('}', '', 'export {};', '');
  return lines.join('\n');
}
```

(Modes are `light`/`dark` only, so no `ColorSchemeOverrides` augmentation is emitted.)

- [ ] **Step 4: Create `src/targets/mui/render-component.ts`**

```ts
import { codeUnitCompare } from '../../sources.js';
import type { MuiComponentModel, MuiModel } from './model.js';
import { camelCase, pascalCase } from './names.js';
import { muiHeader, quoteTs, themeFactoryName, themeOptionsName } from './render-ts.js';

function union(values: readonly string[]): string {
  return values.map(quoteTs).join(' | ');
}

/** `Chip` to `chipClasses`. */
function classesName(c: MuiComponentModel): string {
  return `${camelCase(c.exportName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''))}Classes`;
}

function attributeJsx(prop: string, attribute: string): string {
  return attribute === 'disabled'
    ? `${attribute}={${prop}}`
    : `${attribute}={${prop} ? true : undefined}`;
}

/**
 * One React component per design-system component. The shell carries no
 * styles: `styled` looks them up in `theme.components.<ThemeKey>` through
 * `overridesResolver` and matches `variants` against `ownerState`.
 */
export function renderComponentTsx(model: MuiModel, c: MuiComponentModel): string {
  const P = c.exportName;
  const classes = classesName(c);
  const axisNames = Object.keys(c.axes);
  const axisProps = axisNames.map((a) => c.axes[a].prop);
  const slotNames = Object.keys(c.slots);
  const slotProps = slotNames.filter((s) => s !== c.childrenSlot);
  // React prop names are the camelCase form of the manifest names (`icon-position` -> `iconPosition`).
  const owned = [
    ...new Set([
      'children',
      ...axisProps,
      ...c.stateProps.map((p) => p.prop),
      // the attribute the state renders is owned too, so a caller cannot pass it directly
      ...c.stateProps.map((p) => p.attribute),
      ...slotProps.map((s) => c.slots[s].prop),
    ]),
  ].sort(codeUnitCompare);

  const lines: string[] = [
    muiHeader(model),
    '',
    "import * as React from 'react';",
    "import { styled, useThemeProps } from '@mui/material/styles';",
    '',
  ];
  for (const axis of axisNames) {
    lines.push(`export type ${P}${pascalCase(axis)} = ${union(c.axes[axis].values)};`);
  }
  if (axisNames.length > 0) {
    lines.push('', `export interface ${P}OwnerState {`);
    for (const axis of axisNames) {
      lines.push(`  ${c.axes[axis].prop}: ${P}${pascalCase(axis)};`);
    }
    lines.push('}');
  } else {
    lines.push(`export type ${P}OwnerState = Record<never, never>;`);
  }
  lines.push(
    '',
    `export interface ${P}Props`,
    `  extends Omit<React.ComponentPropsWithoutRef<'${c.rootElement}'>, ${union(owned)}> {`,
  );
  for (const axis of axisNames) {
    lines.push(
      `  /** Axis \`${axis}\`; default \`${c.axes[axis].default}\`. */`,
      `  ${c.axes[axis].prop}?: ${P}${pascalCase(axis)};`,
    );
  }
  for (const state of c.stateProps) {
    lines.push(
      `  /** State \`${state.state}\`; rendered as the \`${state.attribute}\` attribute. */`,
      `  ${state.prop}?: boolean;`,
    );
  }
  lines.push(
    c.childrenSlot ? `  /** Slot \`${c.childrenSlot}\`. */` : '  /** Content of the root element. */',
    '  children?: React.ReactNode;',
  );
  for (const slot of slotProps) {
    lines.push(
      `  /** Slot \`${slot}\`${c.slots[slot].optional ? ' (optional)' : ''}. */`,
      `  ${c.slots[slot].prop}?: React.ReactNode;`,
    );
  }
  // classes are keyed by prop name so `classes.subTitle` is valid member access
  lines.push('}', '', `export const ${classes} = {`, `  root: '${c.themeKey}-root',`);
  for (const slot of slotNames) {
    lines.push(`  ${c.slots[slot].prop}: '${c.slots[slot].className}',`);
  }
  lines.push(
    '} as const;',
    '',
    `const ${P}Root = styled('${c.rootElement}', {`,
    `  name: '${c.themeKey}',`,
    "  slot: 'Root',",
    '  overridesResolver: (_props, styles) => styles.root,',
    `})<{ ownerState: ${P}OwnerState }>({});`,
    '',
    `export const ${P} = React.forwardRef<React.ComponentRef<'${c.rootElement}'>, ${P}Props>(`,
    `  function ${P}(inProps, ref) {`,
    `    const props = useThemeProps({ props: inProps, name: '${c.themeKey}' });`,
  );
  const destructured = [
    ...axisNames.map((a) => `${c.axes[a].prop} = ${quoteTs(c.axes[a].default)}`),
    ...c.stateProps.map((p) => `${p.prop} = false`),
    'children',
    ...slotProps.map((s) => c.slots[s].prop),
    'className',
    '...other',
  ];
  lines.push(
    `    const { ${destructured.join(', ')} } = props;`,
    `    const ownerState: ${P}OwnerState = ${axisProps.length === 0 ? '{}' : `{ ${axisProps.join(', ')} }`};`,
    '    return (',
    `      <${P}Root`,
    '        ref={ref}',
    '        ownerState={ownerState}',
    `        className={className ? \`\${${classes}.root} \${className}\` : ${classes}.root}`,
  );
  // DOM props first, then the state attributes, so the component's props always win.
  lines.push('        {...other}');
  for (const state of c.stateProps) {
    lines.push(`        ${attributeJsx(state.prop, state.attribute)}`);
  }
  lines.push('      >');
  if (c.childrenSlot === null) {
    lines.push('        {children}');
  }
  for (const slot of slotNames) {
    const { element, prop } = c.slots[slot];
    if (slot === c.childrenSlot) {
      lines.push(`        <${element} className={${classes}.${prop}}>{children}</${element}>`);
    } else {
      lines.push(
        `        {${prop} === undefined ? null : <${element} className={${classes}.${prop}}>{${prop}}</${element}>}`,
      );
    }
  }
  lines.push(`      </${P}Root>`, '    );', '  },', ');', '');
  return lines.join('\n');
}

export function renderComponentsIndex(model: MuiModel): string {
  const names = Object.values(model.components)
    .map((c) => c.exportName)
    .sort(codeUnitCompare);
  const body = names.length === 0 ? ['export {};'] : names.map((n) => `export * from './${n}.js';`);
  return [muiHeader(model), '', ...body, ''].join('\n');
}

export function renderIndexTs(model: MuiModel): string {
  return [
    muiHeader(model),
    '',
    "import './augmentation.js';",
    "export * from './components/index.js';",
    `export { ${themeFactoryName(model)}, ${themeOptionsName(model)} } from './theme.js';`,
    '',
  ].join('\n');
}

/** `Chip` to `chip` (the variable stem used by the probe). */
function variableStem(exportName: string): string {
  return exportName[0].toLowerCase() + exportName.slice(1);
}

/**
 * `typecheck.tsx`: compiled by the package's `tsc --noEmit`, never bundled.
 * One accepted usage per component with every axis at a non-default value,
 * every state prop, and every slot; one `@ts-expect-error` per axis with a
 * value outside the manifest; one for an unknown prop. This is how the 1:1
 * typing is verified, not just asserted.
 */
export function renderTypecheckTsx(model: MuiModel): string {
  const components = Object.values(model.components).sort((a, b) =>
    codeUnitCompare(a.exportName, b.exportName),
  );
  const lines: string[] = [
    muiHeader(model),
    '',
    '/* Type-level parity check. Each component accepts exactly the design',
    "   system's axis values, states, and slots; anything else is a type error. */",
  ];
  if (components.length === 0) {
    lines.push('', 'export {};', '');
    return lines.join('\n');
  }
  lines.push(
    `import { ${components.map((c) => c.exportName).join(', ')} } from './components/index.js';`,
    '',
  );
  for (const c of components) {
    const stem = variableStem(c.exportName);
    const attrs = [
      ...Object.entries(c.axes).map(([, def]) => {
        const value = def.values.find((v) => v !== def.default) ?? def.default;
        return `${def.prop}="${value}"`;
      }),
      ...c.stateProps.map((p) => p.prop),
      ...Object.keys(c.slots)
        .filter((s) => s !== c.childrenSlot)
        .map((s) => `${c.slots[s].prop}="${s}"`),
    ];
    const open = attrs.length > 0 ? `<${c.exportName} ${attrs.join(' ')}>` : `<${c.exportName}>`;
    lines.push(
      `export const ${stem}Accepted = (`,
      `  ${open}`,
      '    content',
      `  </${c.exportName}>`,
      ');',
    );
    for (const axis of Object.keys(c.axes)) {
      lines.push(
        `// @ts-expect-error ${axis} accepts only the design system values`,
        `export const ${stem}Rejected${pascalCase(axis)} = <${c.exportName} ${c.axes[axis].prop}="__not_a_value__" />;`,
      );
    }
    lines.push(
      '// @ts-expect-error unknown props are rejected',
      `export const ${stem}RejectedProp = <${c.exportName} notAProp="x" />;`,
      '',
    );
  }
  return lines.join('\n');
}
```

The accepted usage for `chip` renders exactly `<Chip tone="loud" disabled icon="icon">` (axis at a non-default value, the state prop as a boolean attribute, the optional slot as a string), which is what the test asserts.

`classesName` turns `DatePicker` into `datePickerClasses` (kebab the PascalCase, then camelCase it). A component without axes gets `const ownerState: TagOwnerState = {};`.

- [ ] **Step 5: Create `src/targets/mui/generate.ts`**

```ts
import type { Diagnostics } from '../../errors.js';
import type { DesignIR } from '../../ir/types.js';
import type { GeneratedFile, PluginContext } from '../plugin.js';
import { buildMuiModel } from './model.js';
import {
  renderComponentTsx,
  renderComponentsIndex,
  renderIndexTs,
} from './render-component.js';
import {
  renderAugmentationTs,
  renderModelJson,
  renderThemeTs,
} from './render-ts.js';

/** Every file of the MUI target, in a fixed order. Empty (after reporting) when the model cannot be built. */
export function generateMui(
  ir: DesignIR,
  ctx: PluginContext,
  diag: Diagnostics,
): GeneratedFile[] {
  const model = buildMuiModel(ir, ctx, diag);
  if (!model) {
    return [];
  }
  return [
    { path: 'theme.model.json', contents: renderModelJson(model) },
    { path: 'theme.ts', contents: renderThemeTs(model) },
    { path: 'augmentation.ts', contents: renderAugmentationTs(model) },
    ...Object.values(model.components).map((c) => ({
      path: `components/${c.exportName}.tsx`,
      contents: renderComponentTsx(model, c),
    })),
    { path: 'components/index.ts', contents: renderComponentsIndex(model) },
    { path: 'index.ts', contents: renderIndexTs(model) },
    { path: 'typecheck.tsx', contents: renderTypecheckTsx(model) },
  ];
}
```

(import `renderTypecheckTsx` from `./render-component.js` too.)

- [ ] **Step 6: Run the tests**

Run: `npx vitest run test/mui-generate.test.ts`
Expected: PASS (12 tests). Where an assertion fails only on whitespace of the emitted TSX, fix the renderer to match the test (the test text is the contract that Task 5's `tsc`, `eslint`, and Prettier-free formatting are built around).

- [ ] **Step 7: Exports and gates**

Add to `src/index.ts`:

```ts
export { generateMui } from './targets/mui/generate.js';
export {
  muiHeader,
  quoteTs,
  renderAugmentationTs,
  renderModelJson,
  renderThemeTs,
  renderTsLiteral,
  themeFactoryName,
  themeOptionsName,
} from './targets/mui/render-ts.js';
export {
  renderComponentTsx,
  renderComponentsIndex,
  renderIndexTs,
  renderTypecheckTsx,
} from './targets/mui/render-component.js';
```

Run `npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore && npx vitest run && npm run typecheck && npm run lint && npm run format`. Expected: all green.

- [ ] **Step 8: Checkpoint**

Report: `src/targets/mui/{render-ts,render-component,generate}.ts`, `test/mui-generate.test.ts` created; `src/index.ts` modified.

---

## Task 4: Round-trip `reparse`, the plugin object, registration

**Files:**
- Create: `packages/ds-compiler/src/targets/reparse-support.ts` (shared `manifestFromComponent`, `verifySelectorOrder`)
- Create: `packages/ds-compiler/src/targets/coverage-entries.ts` (shared `coverageEntries`)
- Create: `packages/ds-compiler/src/targets/mui/reparse.ts`
- Create: `packages/ds-compiler/src/targets/mui/index.ts`
- Modify: `packages/ds-compiler/src/targets/index.ts`, `src/targets/tailwind/reparse.ts`, `src/targets/tailwind/index.ts`, `src/index.ts`
- Modify: `packages/ds-compiler/test/tailwind-roundtrip.test.ts`, `test/verify.test.ts`, `test/cli.test.ts`
- Test: `packages/ds-compiler/test/mui-roundtrip.test.ts`

Registering the plugin changes what `generate`, `verify`, and coverage do on the shared fixture, so this task also updates those expectations.

- [ ] **Step 1: Write the failing tests**

`test/mui-roundtrip.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildIR } from '../src/build.js';
import { Diagnostics } from '../src/errors.js';
import { TARGETS, targetIds } from '../src/targets/index.js';
import { muiPlugin } from '../src/targets/mui/index.js';
import type { MuiModel } from '../src/targets/mui/model.js';
import type { GeneratedFile } from '../src/targets/plugin.js';
import { diffIR } from '../src/verify/ir-diff.js';
import { FIXTURE_MINI } from './helpers.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

function scopeFor(ir: ReturnType<typeof twBuild>['ir']) {
  return {
    components: Object.keys(ir.components).filter((n) => muiPlugin.isMapped(ir.components[n])),
    ignored: (name: string) => muiPlugin.ignoredProperties(ir.components[name]),
  };
}

function generated(extra: Record<string, string> = {}) {
  const root = twRoot(extra);
  const { ir, config } = twBuild(root);
  const ctx = twContext(root, config);
  const files = muiPlugin.generate(ir, null, ctx, new Diagnostics());
  return { ir, ctx, files };
}

/** Re-serializes the model after `mutate` edited it in place. */
function tamper(files: GeneratedFile[], mutate: (model: MuiModel) => void): GeneratedFile[] {
  return files.map((f) => {
    if (f.path !== 'theme.model.json') {
      return f;
    }
    const model = JSON.parse(f.contents) as MuiModel;
    mutate(model);
    return { path: f.path, contents: `${JSON.stringify(model, null, 2)}\n` };
  });
}

function reparse(files: GeneratedFile[], ir: ReturnType<typeof twBuild>['ir'], ctx: ReturnType<typeof twContext>) {
  const diag = new Diagnostics();
  const reparsed = muiPlugin.reparse(files, ir, ctx, diag);
  return { diag, reparsed };
}

describe('mui round-trip', () => {
  it('is registered next to tailwind', () => {
    expect(targetIds()).toEqual(['mui', 'tailwind']);
    expect(TARGETS.mui).toBe(muiPlugin);
    expect(muiPlugin.id).toBe('mui');
  });

  it('reparses its own output to the source IR on the small fixture', () => {
    const { ir, ctx, files } = generated();
    const { diag, reparsed } = reparse(files, ir, ctx);
    expect(diag.items).toEqual([]);
    expect(reparsed).not.toBeNull();
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
    expect(reparsed!.tokens['color.text.default']).toMatchObject({
      modeInvariant: false,
      alias: { light: 'color.neutral.900' },
    });
    expect(reparsed!.tokens['shadow.focus'].$value).toEqual(ir.tokens['shadow.focus'].$value);
    expect(reparsed!.components.pill).toBeUndefined();
    // tag ignores opacity, so its theme entry never mentions it (chip legitimately uses opacity on :disabled)
    const model = JSON.parse(files[0].contents) as MuiModel;
    expect(JSON.stringify(model.themeOptions.components.FxTag)).not.toContain('opacity');
  });

  it('reparses the mini fixture (no mapped components) without differences', () => {
    const result = buildIR(FIXTURE_MINI);
    const ir = result.ir!;
    const ctx = {
      rootDir: FIXTURE_MINI,
      config: result.config!,
      compilerVersion: '0.0.0-test',
      outDir: `${FIXTURE_MINI}out`,
    };
    const { diag, reparsed } = reparse(muiPlugin.generate(ir, null, ctx, new Diagnostics()), ir, ctx);
    expect(diag.items).toEqual([]);
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
  });

  it('round-trips a component with two axes, three slots, five states, and combinations', () => {
    const { ir, ctx, files } = generated({
      'src/components/menu/menu.manifest.json': JSON.stringify({
        name: 'menu',
        displayName: 'Menu',
        baseline: false,
        axes: {
          tone: { values: ['quiet', 'loud'], default: 'quiet' },
          size: { values: ['sm', 'md'], default: 'md' },
        },
        states: ['hover', 'focus-visible', 'active', 'disabled', 'expanded'],
        slots: {
          root: { element: 'button' },
          label: { element: 'span' },
          icon: { element: 'span', optional: true },
          badge: { element: 'span', optional: true },
        },
        targets: { tailwind: {}, mui: {} },
      }),
      'src/components/menu/menu.css': [
        '.fx-menu {\n  display: inline-flex;\n  color: var(--fx-color-text-default);\n}',
        '.fx-menu:hover {\n  color: var(--fx-color-neutral-900);\n}',
        '.fx-menu:focus-visible {\n  box-shadow: var(--fx-shadow-focus);\n}',
        '.fx-menu:active:disabled {\n  opacity: 0.2;\n}',
        '.fx-menu[aria-expanded="true"] {\n  min-width: 44px;\n}',
        '.fx-menu[data-tone="loud"] {\n  padding: var(--fx-space-2);\n}',
        '.fx-menu[data-tone="loud"]:hover {\n  min-width: 48px;\n}',
        '.fx-menu[data-size="sm"][data-tone="loud"]:disabled .fx-menu__badge {\n  display: none;\n}',
        '.fx-menu .fx-menu__icon {\n  width: 20px;\n}',
        '.fx-menu[data-size="sm"] .fx-menu__icon {\n  width: 16px;\n}',
        '.fx-menu:hover .fx-menu__label {\n  opacity: 0.9;\n}',
        '',
      ].join('\n'),
    });
    const { diag, reparsed } = reparse(files, ir, ctx);
    expect(diag.items).toEqual([]);
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
    const model = JSON.parse(files[0].contents) as MuiModel;
    const keys = model.themeOptions.components.FxMenu.variants.map((v) => Object.keys(v.style)[0]);
    expect(keys).toContain('&&&:disabled .FxMenu-badge');
    expect(keys).toContain('&&:hover');
    expect(keys).toContain('&:active:disabled');
  });

  describe('tamper matrix', () => {
    it('rejects reordered variants', () => {
      const { ir, ctx, files } = generated();
      const swapped = tamper(files, (m) => {
        const v = m.themeOptions.components.FxChip.variants;
        [v[0], v[1]] = [v[1], v[0]];
      });
      const { diag, reparsed } = reparse(swapped, ir, ctx);
      expect(reparsed).toBeNull();
      expect(diag.errors.map((d) => d.code)).toEqual(['DS-E081']);
      expect(diag.errors[0].message).toContain('canonical');
      expect(diag.errors[0].location).toEqual({ file: 'theme.model.json', line: 1, column: 1 });
    });

    it('rejects a selector key with the wrong specificity', () => {
      const { ir, ctx, files } = generated();
      const flat = tamper(files, (m) => {
        const v = m.themeOptions.components.FxChip.variants[2];
        v.style = { '&': v.style['&&'] };
      });
      const { diag, reparsed } = reparse(flat, ir, ctx);
      expect(reparsed).toBeNull();
      expect(diag.errors[0].message).toContain('"&"');
      expect(diag.errors[0].message).toContain('"&&"');
    });

    it('rejects the wrong disabled form for the root element', () => {
      const { ir, ctx, files } = generated();
      const wrong = tamper(files, (m) => {
        const v = m.themeOptions.components.FxChip.variants[1];
        v.style = { '&[aria-disabled="true"]': v.style['&:disabled'] };
      });
      const { diag } = reparse(wrong, ir, ctx);
      expect(diag.errors.map((d) => d.code)).toEqual(['DS-E081']);
    });

    it('surfaces a changed value and a dropped rule as IR differences', () => {
      const { ir, ctx, files } = generated();
      const changed = tamper(files, (m) => {
        const chip = m.themeOptions.components.FxChip;
        chip.styleOverrides.root.display = 'flex';
        chip.variants.pop(); // the icon rule
      });
      const { diag, reparsed } = reparse(changed, ir, ctx);
      expect(diag.items).toEqual([]);
      const diffs = diffIR(ir, reparsed!, scopeFor(ir));
      // ruleDiffKey order: "icon" sorts before "root"
      expect(diffs.map((d) => d.id)).toEqual(['chip icon', 'chip root display']);
    });

    it('rejects a theme entry for an excluded component and for an unknown one', () => {
      const { ir, ctx, files } = generated();
      const extra = tamper(files, (m) => {
        m.themeOptions.components.FxPill = { styleOverrides: { root: { display: 'block' } }, variants: [] };
        m.components.pill = { ...m.components.tag, name: 'pill', exportName: 'Pill', themeKey: 'FxPill' };
        m.themeOptions.components.FxNope = { styleOverrides: { root: {} }, variants: [] };
        m.components.nope = { ...m.components.tag, name: 'nope', exportName: 'Nope', themeKey: 'FxNope' };
      });
      const { diag, reparsed } = reparse(extra, ir, ctx);
      expect(reparsed).toBeNull();
      const messages = diag.errors.map((d) => d.message);
      expect(messages.some((m) => m.includes('"pill"') && m.includes('excluded'))).toBe(true);
      expect(messages.some((m) => m.includes('FxNope'))).toBe(true);
    });

    it('rejects an unknown token variable, a token in the wrong section, and a foreign property', () => {
      const { ir, ctx, files } = generated();
      const bad = tamper(files, (m) => {
        m.themeOptions.components.FxChip.styleOverrides.root.color = 'var(--fx-palette-primary-main)';
      });
      const badErrors = reparse(bad, ir, ctx).diag.errors;
      expect(badErrors.length).toBeGreaterThan(0);
      expect(badErrors.every((d) => d.code === 'DS-E081')).toBe(true);
      expect(badErrors[0].message).toContain('--fx-palette-primary-main');

      const misplaced = tamper(files, (m) => {
        m.themeOptions.tokens.color = { 'x-y': '#000000' };
      });
      expect(reparse(misplaced, ir, ctx).diag.errors[0].message).toContain('palette.tokens');

      const foreign = tamper(files, (m) => {
        m.themeOptions.components.FxChip.styleOverrides.root.colour = 'red';
      });
      expect(reparse(foreign, ir, ctx).diag.errors[0].message).toContain('colour');
    });

    it('rejects a model that fails the schema, non-JSON, a wrong selector, and a wrong prefix', () => {
      const { ir, ctx, files } = generated();
      const schema = tamper(files, (m) => {
        (m as unknown as Record<string, unknown>).surprise = 1;
      });
      expect(reparse(schema, ir, ctx).diag.errors[0].message).toContain('schema');

      const broken = files.map((f) => (f.path === 'theme.model.json' ? { ...f, contents: '{' } : f));
      expect(reparse(broken, ir, ctx).diag.errors[0].message).toContain('valid JSON');

      const selector = tamper(files, (m) => {
        m.themeOptions.cssVariables.colorSchemeSelector = 'class';
      });
      expect(reparse(selector, ir, ctx).diag.errors[0].message).toContain('colorSchemeSelector');

      const prefix = tamper(files, (m) => {
        m.themeOptions.cssVariables.cssVarPrefix = 'zz';
      });
      expect(reparse(prefix, ir, ctx).diag.errors[0].message).toContain('cssVarPrefix');
    });

    it('surfaces an added token as present only in the generated output', () => {
      const { ir, ctx, files } = generated();
      const added = tamper(files, (m) => {
        m.themeOptions.tokens.space['3'] = '12px';
        for (const scheme of Object.values(m.themeOptions.colorSchemes)) {
          scheme.palette.tokens['neutral-100'] = '#eeeeee';
        }
      });
      const { diag, reparsed } = reparse(added, ir, ctx);
      expect(diag.items).toEqual([]);
      expect(diffIR(ir, reparsed!, scopeFor(ir)).map((d) => d.id)).toEqual([
        'color.neutral.100',
        'space.3',
      ]);
    });
  });

  it('reports coverage per component', () => {
    const { ir } = generated();
    expect(muiPlugin.coverage(ir)).toEqual([
      { component: 'chip', target: 'mui', status: 'supported' },
      { component: 'pill', target: 'mui', status: 'excluded', reason: 'starter content' },
      { component: 'tag', target: 'mui', status: 'partial', ignored: ['opacity'] },
    ]);
  });
});
```

Update existing tests:

- `test/tailwind-roundtrip.test.ts`: the registration assertion becomes `expect(Object.keys(TARGETS).sort()).toEqual(['mui', 'tailwind'])`.
- `test/targets-hints.test.ts`: the pre-existing `registers the tailwind plugin` test (which asserted `getTarget('mui')` is null) becomes `registers the tailwind and mui plugins`, with `flutter` still unresolved.
- `test/verify.test.ts`:
  - `writes the tailwind files …` becomes `writes every target's files …`: with `out = join(root, 'out')`, expect `result.written.map((p) => p.slice(out.length + 1).split(sep).join('/'))` (import `sep` from `node:path`) to equal
    ```ts
    [
      'mui/theme.model.json',
      'mui/theme.ts',
      'mui/augmentation.ts',
      'mui/components/Chip.tsx',
      'mui/components/Tag.tsx',
      'mui/components/index.ts',
      'mui/index.ts',
      'mui/typecheck.tsx',
      'tailwind/components.css',
      'tailwind/index.css',
      'tailwind/theme.css',
    ]
    ```
    and `result.removed` to equal `[join(out, 'tailwind', 'stale.css')]` (the stale file stays where the test wrote it, under `out/tailwind`).
  - `dedupes repeated target ids`: unchanged (3 files for `['tailwind', 'tailwind']`).
  - `passes on a built and generated root …`: the coverage assertion becomes `'| `chip` | supported | supported |'`.
  - `fails coverage for an unmapped component …`: there are now two `DS-E082` errors, in coverage order (`mui` before `tailwind`):
    ```ts
    const unmapped = result.diagnostics.errors.filter((d) => d.code === 'DS-E082');
    expect(unmapped.map((d) => d.message)).toEqual([
      'dot has no targets.mui entry in its manifest',
      'dot has no targets.tailwind entry in its manifest',
    ]);
    expect(unmapped[0].location).toEqual({ file: 'src/components/dot/dot.manifest.json', line: 1, column: 1 });
    expect(readFileSync(result.coverageFile!, 'utf8')).toContain('| `dot` | **unmapped** | **unmapped** |');
    ```
  - Add to `describe('generate')`:
    ```ts
    it('writes nothing for any target when one plugin reports a generation error', () => {
      const root = twRoot({
        'src/tokens/space.css':
          ':root {\n  --fx-space-2: 8px;\n}\n:root[data-fx-theme="dark"] {\n  --fx-space-2: 10px;\n}\n',
      });
      build(root);
      const result = generate(root);
      expect(result.ir).not.toBeNull();
      expect(result.diagnostics.errors.map((d) => d.code)).toEqual(['DS-E084']);
      expect(result.written).toEqual([]);
      expect(existsSync(join(root, 'out'))).toBe(false);
    });
    ```
  - Add to `describe('verify')`:
    ```ts
    it('fails drift when a plugin cannot generate, and still runs the other steps', () => {
      const root = ready();
      writeFileSync(
        join(root, 'src/tokens/space.css'),
        ':root {\n  --fx-space-2: 8px;\n}\n:root[data-fx-theme="dark"] {\n  --fx-space-2: 10px;\n}\n',
      );
      build(root);
      // the Tailwind theme gains a mode override for the token, so bring it up to date
      generate(root, ['tailwind']);
      const result = verify(root);
      expect(result.steps).toEqual({ lint: 'pass', drift: 'fail', roundtrip: 'pass', coverage: 'pass' });
      expect(result.diagnostics.errors.map((d) => d.code)).toEqual(['DS-E084']);
    });
    ```
- `test/cli.test.ts`: in `generate and verify work end to end …`, the untargeted `generate --json` now writes 11 files (`toHaveLength(11)`); the `--target tailwind` run stays at 3. Add a test:
  ```ts
  it('generate exits 1 and writes nothing when a plugin reports a generation error', () => {
    const root = twRoot({
      'src/tokens/space.css':
        ':root {\n  --fx-space-2: 8px;\n}\n:root[data-fx-theme="dark"] {\n  --fx-space-2: 10px;\n}\n',
    });
    expect(run(['build', '--root', root]).code).toBe(0);
    const r = run(['generate', '--root', root]);
    expect(r.code).toBe(1);
    expect(r.stderr).toContain('DS-E084');
    expect(existsSync(join(root, 'out'))).toBe(false);
  });
  ```
  (import `existsSync` from `node:fs`).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run test/mui-roundtrip.test.ts test/verify.test.ts test/cli.test.ts test/tailwind-roundtrip.test.ts`
Expected: FAIL. `../src/targets/mui/index.js` cannot be resolved; `targetIds()` is `['tailwind']`; the verify expectations still see one target.

- [ ] **Step 3: Shared reparse support and coverage entries**

`src/targets/reparse-support.ts` (moved out of `src/targets/tailwind/reparse.ts`; the Tailwind reparser imports both and keeps `export { manifestFromComponent }` so `src/index.ts` is unchanged):

```ts
import type { Manifest } from '../components/manifest.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import type { ComponentIR } from '../ir/types.js';

/** A manifest equivalent to a component IR, for re-parsing generated output. Baseline warnings are irrelevant here. */
export function manifestFromComponent(c: ComponentIR): Manifest {
  return {
    name: c.name,
    displayName: c.displayName,
    description: c.description,
    axes: c.axes,
    states: c.states,
    slots: c.slots,
    preview: c.preview,
    baseline: false,
    targets: c.targets,
  };
}

export interface OriginalSelector {
  selector: string;
  location: SourceLocation;
}

/**
 * `originals` (the order rules appeared in the generated output) must equal
 * `rendered` (the canonical cascade order `parseComponentCss` recomputes)
 * element for element. A literal duplicate is `duplicate rule`; a count
 * mismatch is `expected <n> rules, found <m>`; a per-index mismatch names the
 * original and the canonical form at that position.
 */
export function verifySelectorOrder(
  originals: readonly OriginalSelector[],
  rendered: readonly string[],
  fallback: SourceLocation,
  diag: Diagnostics,
): void {
  const seen = new Set<string>();
  for (const o of originals) {
    if (seen.has(o.selector)) {
      diag.add('DS-E030', `duplicate rule "${o.selector}"`, o.location);
      return;
    }
    seen.add(o.selector);
  }
  if (originals.length !== rendered.length) {
    diag.add(
      'DS-E030',
      `expected ${rendered.length} rules, found ${originals.length}`,
      originals[0]?.location ?? fallback,
    );
    return;
  }
  for (let i = 0; i < originals.length; i += 1) {
    if (originals[i].selector !== rendered[i]) {
      diag.add(
        'DS-E030',
        `selector "${originals[i].selector}" is not the canonical form "${rendered[i]}"`,
        originals[i].location,
      );
      return;
    }
  }
}
```

In `src/targets/tailwind/reparse.ts`, delete the local `manifestFromComponent` and `verifySelectors`, import from `../reparse-support.js`, add `export { manifestFromComponent } from '../reparse-support.js';`, and call `verifySelectorOrder(group.originals, rendered, { file: 'components.css', line: 1, column: 1 }, diag)`.

`src/targets/coverage-entries.ts`:

```ts
import type { ComponentIR, DesignIR } from '../ir/types.js';
import type { CoverageEntry } from './plugin.js';

export interface CoverageHooks {
  exclusion(component: ComponentIR): string | null;
  isMapped(component: ComponentIR): boolean;
  ignored(component: ComponentIR): ReadonlySet<string>;
}

/** Coverage for a target whose every property is expressible: supported, partial (ignored), unmapped, or excluded. */
export function coverageEntries(
  id: string,
  ir: DesignIR,
  hooks: CoverageHooks,
): CoverageEntry[] {
  return Object.keys(ir.components)
    .sort()
    .map((name) => {
      const component = ir.components[name];
      const excluded = hooks.exclusion(component);
      if (excluded !== null) {
        return { component: name, target: id, status: 'excluded' as const, reason: excluded };
      }
      if (!hooks.isMapped(component)) {
        return { component: name, target: id, status: 'unmapped' as const };
      }
      const ignored = [...hooks.ignored(component)].sort();
      if (ignored.length > 0) {
        return { component: name, target: id, status: 'partial' as const, ignored };
      }
      return { component: name, target: id, status: 'supported' as const };
    });
}
```

`src/targets/tailwind/index.ts` uses it: `coverage: (ir) => coverageEntries(TAILWIND_ID, ir, { exclusion: tailwindExclusion, isMapped: isMappedForTailwind, ignored: ignoredForTailwind })` and drops its local `coverage` function.

- [ ] **Step 4: Create `src/targets/mui/reparse.ts`**

```ts
import { renderRuleSelector } from '../../components/render-selector.js';
import { parseComponentCss } from '../../components/parse-component.js';
import { PSEUDO_STATES, stateForAttribute } from '../../components/states.js';
import { modeSelectorFor, type DsConfig } from '../../config.js';
import { Diagnostics, formatDiagnostic, type SourceLocation } from '../../errors.js';
import type { ComponentIR, DesignIR, Token, TokenId } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import { parseTokenName, type TokenCategory } from '../../tokens/categories.js';
import { parseTokenFile, type RawToken } from '../../tokens/parse-tokens.js';
import { resolveTokens } from '../../tokens/resolve-tokens.js';
import type { GeneratedFile, PluginContext } from '../plugin.js';
import { manifestFromComponent, verifySelectorOrder } from '../reparse-support.js';
import { isMappedForMui } from './hints.js';
import { MUI_PACKAGE, muiModelSchema, type MuiModel } from './model.js';
import {
  colorSchemeSelectorFor,
  kebabCategory,
  kebabProperty,
  propNameFor,
  sourceNameFromMui,
  specificityKey,
  themeKeyFor,
} from './names.js';

const MODEL_FILE = 'theme.model.json';
const AT: SourceLocation = { file: MODEL_FILE, line: 1, column: 1 };
const VAR_REF = /var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g;
const KEY = /^(&+)((?::[a-z-]+|\[[^\]]+\])*)( \.([A-Za-z0-9]+)-([a-z0-9-]+))?$/;
const STATE_TOKEN = /:[a-z-]+|\[[^\]]+\]/g;
const ATTRIBUTE = /^\[([a-z-]+)(?:="([^"]*)")?\]$/;

function rewriteVars(value: string, prefix: string, onUnknown: (name: string) => void): string {
  return value.replace(VAR_REF, (whole: string, name: string) => {
    const src = sourceNameFromMui(name, prefix);
    if (!src) {
      onUnknown(name);
      return whole;
    }
    return `var(${src})`;
  });
}

function checkMeta(model: MuiModel, config: DsConfig, diag: Diagnostics): void {
  const { themeOptions } = model;
  const fail = (message: string): void => {
    diag.add('DS-E010', message, AT);
  };
  if (model.framework.name !== MUI_PACKAGE) {
    fail(`framework.name is "${model.framework.name}", expected "${MUI_PACKAGE}"`);
  }
  if (model.prefix !== config.prefix) {
    fail(`prefix is "${model.prefix}", expected "${config.prefix}"`);
  }
  if (themeOptions.cssVariables.cssVarPrefix !== config.prefix) {
    fail(`cssVariables.cssVarPrefix is "${themeOptions.cssVariables.cssVarPrefix}", expected "${config.prefix}"`);
  }
  const selector = colorSchemeSelectorFor(config.modeSelector);
  if (themeOptions.cssVariables.colorSchemeSelector !== selector) {
    fail(`cssVariables.colorSchemeSelector is "${themeOptions.cssVariables.colorSchemeSelector}", expected "${selector}"`);
  }
  if (themeOptions.defaultColorScheme !== config.defaultMode) {
    fail(`defaultColorScheme is "${themeOptions.defaultColorScheme}", expected "${config.defaultMode}"`);
  }
  const schemes = Object.keys(themeOptions.colorSchemes);
  if (schemes.join(',') !== config.modes.join(',')) {
    fail(`colorSchemes are ${schemes.join(', ')}, expected ${config.modes.join(', ')}`);
  }
}

/**
 * Token variables back to source declarations: colors from each scheme's
 * `palette.tokens` (declared only in `:root` when every scheme agrees, so a
 * mode-invariant token stays invariant), everything else from `tokens`. Each
 * category becomes one synthetic token file for the compiler's own parser.
 */
function reparseTokens(model: MuiModel, config: DsConfig, diag: Diagnostics): Record<TokenId, Token> | null {
  const prefix = config.prefix;
  const byCategory = new Map<TokenCategory, Map<string, string[]>>();
  const push = (category: TokenCategory, mode: string, line: string): void => {
    const byMode = byCategory.get(category) ?? new Map<string, string[]>();
    byCategory.set(category, byMode);
    const lines = byMode.get(mode) ?? [];
    byMode.set(mode, lines);
    lines.push(line);
  };
  const rewrite = (value: string, where: string): string =>
    rewriteVars(value, prefix, (name) =>
      diag.add('DS-E013', `${where} references "${name}", which is not a generated token variable`, AT),
    );

  const colorKeys = new Set<string>();
  for (const scheme of Object.values(model.themeOptions.colorSchemes)) {
    for (const key of Object.keys(scheme.palette.tokens)) {
      colorKeys.add(key);
    }
  }
  for (const key of [...colorKeys].sort(codeUnitCompare)) {
    const name = `--${prefix}-color-${key}`;
    if (!parseTokenName(name, prefix)) {
      diag.add('DS-E011', `palette.tokens key "${key}" is not a token path`, AT);
      continue;
    }
    const values = config.modes.map((m) => model.themeOptions.colorSchemes[m]?.palette.tokens[key]);
    if (values.some((v) => v === undefined)) {
      diag.add('DS-E015', `palette.tokens key "${key}" is missing from a color scheme`, AT);
      continue;
    }
    const where = `palette.tokens.${key}`;
    if (values.every((v) => v === values[0])) {
      push('color', config.defaultMode, `  ${name}: ${rewrite(values[0]!, where)};`);
    } else {
      config.modes.forEach((m, i) => push('color', m, `  ${name}: ${rewrite(values[i]!, where)};`));
    }
  }
  for (const [camel, entries] of Object.entries(model.themeOptions.tokens)) {
    const category = kebabCategory(camel);
    if (!category) {
      diag.add('DS-E011', `tokens.${camel} is not a token category`, AT);
      continue;
    }
    if (category === 'color') {
      diag.add('DS-E011', 'tokens.color is not allowed; color tokens live under palette.tokens', AT);
      continue;
    }
    for (const key of Object.keys(entries).sort(codeUnitCompare)) {
      const name = `--${prefix}-${category}-${key}`;
      if (!parseTokenName(name, prefix)) {
        diag.add('DS-E011', `tokens.${camel} key "${key}" is not a token path`, AT);
        continue;
      }
      push(category, config.defaultMode, `  ${name}: ${rewrite(entries[key], `tokens.${camel}.${key}`)};`);
    }
  }
  if (diag.hasErrors()) {
    return null;
  }
  const raws: RawToken[] = [];
  const otherModes = config.modes.filter((m) => m !== config.defaultMode);
  for (const [category, byMode] of [...byCategory].sort((a, b) => codeUnitCompare(a[0], b[0]))) {
    const lines: string[] = [];
    for (const mode of [config.defaultMode, ...otherModes]) {
      const decls = byMode.get(mode);
      if (!decls) {
        continue;
      }
      lines.push(mode === config.defaultMode ? ':root {' : `${modeSelectorFor(config, mode)} {`, ...decls, '}');
    }
    raws.push(...parseTokenFile(`src/tokens/${category}.css`, `${lines.join('\n')}\n`, config, diag));
  }
  const tokens = resolveTokens(raws, config, diag);
  return diag.hasErrors() ? null : tokens;
}

interface ParsedKey {
  slot: string;
  states: string[];
}

/** Splits a variant key into slot and states; null when it is not in the generated form. Specificity is checked by the caller. */
function parseKey(key: string, themeKey: string, slots: readonly string[]): ParsedKey | null {
  const m = KEY.exec(key);
  if (!m) {
    return null;
  }
  let slot = 'root';
  if (m[3] !== undefined) {
    if (m[4] !== themeKey || m[5] === 'root' || !slots.includes(m[5])) {
      return null;
    }
    slot = m[5];
  }
  const states: string[] = [];
  for (const token of m[2].match(STATE_TOKEN) ?? []) {
    if (token.startsWith(':')) {
      const state = PSEUDO_STATES[token.slice(1)];
      if (!state) {
        return null;
      }
      states.push(state);
      continue;
    }
    const attr = ATTRIBUTE.exec(token);
    const state = attr ? stateForAttribute(attr[1], attr[2]) : null;
    if (!state) {
      return null;
    }
    states.push(state);
  }
  return { slot, states };
}

function reparseComponents(
  model: MuiModel,
  ir: DesignIR,
  tokens: Record<TokenId, Token>,
  config: DsConfig,
  diag: Diagnostics,
): Record<string, ComponentIR> | null {
  const prefix = config.prefix;
  const byThemeKey = new Map(Object.keys(ir.components).map((n) => [themeKeyFor(prefix, n), n]));
  const themeKeys = Object.keys(model.themeOptions.components);
  const metaKeys = Object.values(model.components).map((c) => c.themeKey);
  if (themeKeys.join(',') !== metaKeys.join(',')) {
    diag.add('DS-E030', `components (${metaKeys.join(', ')}) and themeOptions.components (${themeKeys.join(', ')}) disagree`, AT);
  }
  const out: Record<string, ComponentIR> = {};
  for (const themeKey of themeKeys) {
    const name = byThemeKey.get(themeKey);
    if (!name) {
      diag.add('DS-E030', `generated theme entry "${themeKey}" matches no component`, AT);
      continue;
    }
    const component = ir.components[name];
    if (!isMappedForMui(component)) {
      diag.add('DS-E030', `generated theme entry for component "${name}", which is excluded or unmapped for mui`, AT);
      continue;
    }
    const before = diag.errors.length;
    const rootElement = component.slots.root?.element ?? 'div';
    const target = { name, rootElement };
    const slots = Object.keys(component.slots);
    const entry = model.themeOptions.components[themeKey];
    const originals: { selector: string; location: SourceLocation }[] = [];
    const texts: string[] = [];
    const emit = (slot: string, axes: Record<string, string>, states: string[], decls: Record<string, string>, where: string): void => {
      const selector = renderRuleSelector(prefix, target, { slot, axes, states });
      const body = Object.keys(decls)
        .sort(codeUnitCompare)
        .map((p) => `  ${kebabProperty(p)}: ${rewriteVars(decls[p], prefix, (v) => diag.add('DS-E043', `${where} references "${v}", which is not a generated token variable`, AT))};`);
      originals.push({ selector, location: AT });
      texts.push(`${selector} {\n${body.join('\n')}\n}`);
    };
    if (Object.keys(entry.styleOverrides.root).length > 0) {
      emit('root', {}, [], entry.styleOverrides.root, `${themeKey}.styleOverrides.root`);
    }
    entry.variants.forEach((variant, i) => {
      const where = `${themeKey}.variants[${i}]`;
      const keys = Object.keys(variant.style);
      if (keys.length !== 1) {
        diag.add('DS-E030', `${where} must have exactly one selector key`, AT);
        return;
      }
      const axes: Record<string, string> = {};
      for (const [prop, value] of Object.entries(variant.props)) {
        // variant props are the camelCase prop names; map them back to manifest axes
        const axis = Object.keys(component.axes).find((a) => propNameFor(a) === prop);
        const def = axis ? component.axes[axis] : undefined;
        if (!axis || !def || !def.values.includes(value)) {
          diag.add('DS-E030', `${where} selects unknown axis prop ${prop}="${value}"`, AT);
          return;
        }
        axes[axis] = value;
      }
      const key = keys[0];
      const parsed = parseKey(key, themeKey, slots);
      if (!parsed) {
        diag.add('DS-E030', `${where} has a selector key "${key}" that is not in the generated form`, AT);
        return;
      }
      const canonical = specificityKey(Object.keys(axes).length, parsed.states, rootElement, parsed.slot, themeKey);
      if (canonical !== key) {
        diag.add('DS-E030', `${where} selector key "${key}" is not the canonical form "${canonical}"`, AT);
        return;
      }
      emit(parsed.slot, axes, parsed.states, variant.style[key], where);
    });
    if (diag.errors.length > before) {
      continue;
    }
    const parsed = parseComponentCss(MODEL_FILE, `${texts.join('\n\n')}\n`, manifestFromComponent(component), tokens, config, diag);
    if (!parsed) {
      continue;
    }
    out[name] = parsed;
    if (diag.errors.length > before) {
      continue;
    }
    const rendered = parsed.rules.map((r) => renderRuleSelector(prefix, target, r));
    verifySelectorOrder(originals, rendered, AT, diag);
  }
  return diag.hasErrors() ? null : out;
}

/**
 * Turns `theme.model.json` back into an IR with the compiler's own parsers:
 * token variables are rewritten to source names and parsed per category;
 * each component's `styleOverrides.root` and `variants` are reconstructed
 * into rules in the design system's selector grammar, parsed, and their order
 * and selector keys compared with the canonical form. Every problem is
 * reported as DS-E081 at `theme.model.json`.
 */
export function reparseMui(files: GeneratedFile[], ir: DesignIR, ctx: PluginContext, diag: Diagnostics): DesignIR | null {
  const file = files.find((f) => f.path === MODEL_FILE);
  if (!file) {
    diag.add('DS-E081', `mui output lacks ${MODEL_FILE}`, AT);
    return null;
  }
  let json: unknown;
  try {
    json = JSON.parse(file.contents);
  } catch (err) {
    diag.add('DS-E081', `mui: ${MODEL_FILE} is not valid JSON: ${(err as Error).message}`, AT);
    return null;
  }
  const checked = muiModelSchema.safeParse(json);
  if (!checked.success) {
    const issues = checked.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    diag.add('DS-E081', `mui: ${MODEL_FILE} does not match the model schema: ${issues}`, AT);
    return null;
  }
  const model = checked.data as MuiModel;
  const inner = new Diagnostics();
  checkMeta(model, ctx.config, inner);
  const tokens = inner.hasErrors() ? null : reparseTokens(model, ctx.config, inner);
  const components = tokens ? reparseComponents(model, ir, tokens, ctx.config, inner) : null;
  for (const d of inner.errors) {
    // Inner locations point at synthetic CSS; the model file is the real place.
    const text = formatDiagnostic({ ...d, location: undefined }).split('\n')[0];
    diag.add('DS-E081', `mui: ${text}`, AT);
  }
  if (!tokens || !components) {
    return null;
  }
  return { irVersion: ir.irVersion, meta: { ...ir.meta }, tokens, components };
}
```

The Zod inference for `muiModelSchema` produces the same shape as `MuiModel` except `framework.name` is the literal; the `as MuiModel` cast is safe. If tsc disagrees about a field, align the schema, not the cast.

- [ ] **Step 5: Plugin object and registration**

`src/targets/mui/index.ts`:

```ts
import { coverageEntries } from '../coverage-entries.js';
import type { TargetPlugin } from '../plugin.js';
import { generateMui } from './generate.js';
import { MUI_ID, ignoredForMui, isMappedForMui, muiExclusion } from './hints.js';
import { reparseMui } from './reparse.js';

/** Every property in the table is expressible in Emotion, so nothing is ever `unsupported`. */
export const muiPlugin: TargetPlugin<null> = {
  id: MUI_ID,
  generate: (ir, _catalog, ctx, diag) => generateMui(ir, ctx, diag),
  reparse: reparseMui,
  coverage: (ir) =>
    coverageEntries(MUI_ID, ir, {
      exclusion: muiExclusion,
      isMapped: isMappedForMui,
      ignored: ignoredForMui,
    }),
  isMapped: isMappedForMui,
  ignoredProperties: ignoredForMui,
};
```

`src/targets/index.ts`:

```ts
import { muiPlugin } from './mui/index.js';
import type { TargetPlugin } from './plugin.js';
import { tailwindPlugin } from './tailwind/index.js';

/** Implemented target plugins by id; `targetIds()` sorts them, which is the order they run in. */
export const TARGETS: Readonly<Record<string, TargetPlugin>> = {
  mui: muiPlugin,
  tailwind: tailwindPlugin,
};
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run`
Expected: PASS. If the `menu` round-trip case reports a difference, print the `diffIR` result: a `rule … missing` usually means `parseKey` rejected a state token, a `declaration … differs` means a value renderer disagrees with the source parser (fix the renderer in `css-values.ts`, never the test).

- [ ] **Step 7: Exports and gates**

Add to `src/index.ts`:

```ts
export { muiPlugin } from './targets/mui/index.js';
export { reparseMui } from './targets/mui/reparse.js';
export { coverageEntries } from './targets/coverage-entries.js';
export type { CoverageHooks } from './targets/coverage-entries.js';
export { verifySelectorOrder } from './targets/reparse-support.js';
export type { OriginalSelector } from './targets/reparse-support.js';
```

(`manifestFromComponent` stays exported from `./targets/tailwind/reparse.js`.)

Run `npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore && npx vitest run && npm run typecheck && npm run lint && npm run format && npm run build && node dist/cli.js verify --root ../styles-css; echo "exit $?"`.

Expected: gates green. The last command exits 1 for now: the real design system's `example` is still `excluded` for `mui` (coverage passes) but `packages/styles-css/ds.config.json` has no `targets.mui`, so drift reports `../styles-mui/src/generated/*.ts` as missing (`DS-E080`). Task 5 wires the package. Confirm nothing was written under `packages/` (`git status --short` shows only compiler files).

- [ ] **Step 8: Checkpoint**

Report: `src/targets/{reparse-support,coverage-entries}.ts`, `src/targets/mui/{reparse,index}.ts`, `test/mui-roundtrip.test.ts` created; `src/targets/index.ts`, `src/targets/tailwind/{reparse,index}.ts`, `src/index.ts`, `test/{tailwind-roundtrip,verify,cli}.test.ts` modified; test count.

---

## Task 5: The `styles-mui` package, repo wiring, generated output, and docs

**Files:**
- Modify: `packages/styles-css/ds.config.json`, `packages/styles-css/src/components/example/example.manifest.json`
- Create: `packages/styles-mui/package.json`, `README.md`, `.prettierignore`, `tsconfig.json`, `tsconfig.build.json`, `tsup.config.ts`, `eslint.config.js`, `vitest.config.ts`, `src/index.ts`, `test/theme.test.ts`, `test/render.test.tsx`
- Generate: `packages/styles-mui/src/generated/**`, `packages/styles-css/design.ir.json` (source hash changes), `docs/design-system/coverage.md`
- Modify: `.github/workflows/main.yml`, root `README.md`, `AGENTS.md`, `docs/design-system/targets/mui.md`, `verification.md`, `errors.md`, `authoring-guide.md`

- [ ] **Step 1: Point the source root at the target package and map the starter component**

`packages/styles-css/ds.config.json`:

```json
{
  "name": "SOLAR",
  "prefix": "bwp",
  "modes": ["light", "dark"],
  "defaultMode": "light",
  "rootFontSize": 16,
  "targets": {
    "tailwind": { "outDir": "../styles-tailwind/src/generated" },
    "mui": { "outDir": "../styles-mui/src/generated" }
  },
  "coverageFile": "../../docs/design-system/coverage.md"
}
```

In `packages/styles-css/src/components/example/example.manifest.json`, replace the `mui` entry with `"mui": {}` (keep `flutter` excluded).

- [ ] **Step 2: Create `packages/styles-mui/package.json`**

```json
{
  "name": "@bwp-web/styles-mui",
  "version": "2.0.0-alpha.0",
  "description": "Generated MUI theme and React components for the design system",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.cjs"
      }
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist"
  ],
  "sideEffects": false,
  "publishConfig": {
    "access": "public",
    "tag": "alpha"
  },
  "scripts": {
    "generate": "bwp-ds generate --root ../styles-css --target mui",
    "build": "tsup && tsc -p tsconfig.build.json",
    "prepublishOnly": "npm run build",
    "build:types": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint",
    "test": "vitest run",
    "format": "prettier --check . --ignore-path ../../.gitignore --ignore-path .prettierignore",
    "clean": "rm -rf dist node_modules .turbo"
  },
  "peerDependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@mui/material": "^9.4.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    "@bwp-web/ds-compiler": "*",
    "@bwp-web/eslint-config": "*",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@mui/material": "^9.4.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "eslint": "^9.39.2",
    "prettier": "^3.8.3",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "tsup": "^8.5.1",
    "typescript": "^5.9.2",
    "vitest": "^4.1.4"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/evoko/workplace-public-packages.git",
    "directory": "packages/styles-mui"
  }
}
```

`"prepublishOnly": "npm run build"` (batch 4 review): `dist/` is gitignored and `files` is `["dist"]`, so a publish from a clean checkout must build first, as `@bwp-web/components` does. `bwp-ds verify` in CI guards that the generated source is current. The `@mui/material` range must equal `MUI_RANGE` in `src/targets/mui/model.ts`; the package test asserts it.

- [ ] **Step 3: Create the package's supporting files**

`packages/styles-mui/.prettierignore`:

```
src/generated
dist
```

`packages/styles-mui/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src", "test"],
  "exclude": ["node_modules", "dist"]
}
```

`packages/styles-mui/tsconfig.build.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "src/generated/typecheck.tsx"]
}
```

`packages/styles-mui/tsup.config.ts`:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // declarations come from tsc (see the build script)
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', /^@mui\//, /^@emotion\//],
  jsx: 'automatic',
});
```

`packages/styles-mui/eslint.config.js`:

```js
import baseConfig from '@bwp-web/eslint-config/base';
import reactConfig from '@bwp-web/eslint-config/react';

/** @type {import('typescript-eslint').Config} */
export default [...baseConfig, ...reactConfig];
```

`packages/styles-mui/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
```

`packages/styles-mui/src/index.ts`:

```ts
/* Entry point of @bwp-web/styles-mui. Everything under generated/ is written
   by `bwp-ds generate --target mui`; do not edit it. */
export * from './generated/index.js';
```

`packages/styles-mui/test/theme.test.ts` (reads the prefix from the model so it keeps working when the design system's prefix changes):

```ts
import { readFileSync } from 'node:fs';
import type { Theme, ThemeOptions } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import * as generated from '../src/index.js';

interface Model {
  prefix: string;
  framework: { name: string; range: string };
  themeOptions: {
    cssVariables: { cssVarPrefix: string; colorSchemeSelector: string };
    defaultColorScheme: string;
    colorSchemes: Record<string, { palette: { tokens: Record<string, string> } }>;
    tokens: Record<string, Record<string, string>>;
    components: Record<string, unknown>;
  };
  components: Record<string, { themeKey: string }>;
}

const model = JSON.parse(
  readFileSync(new URL('../src/generated/theme.model.json', import.meta.url), 'utf8'),
) as Model;
const pascal = (s: string): string => s[0].toUpperCase() + s.slice(1);
const exportsByName = generated as unknown as Record<string, unknown>;
const themeOptions = exportsByName[`${model.prefix}ThemeOptions`] as ThemeOptions;
const createDsTheme = exportsByName[`create${pascal(model.prefix)}Theme`] as (
  options?: ThemeOptions,
) => Theme;

/** Every custom property declared by the theme's stylesheets, last writer wins. */
function declaredVars(theme: Theme): Record<string, string> {
  const out: Record<string, string> = {};
  for (const sheet of theme.generateStyleSheets()) {
    for (const decls of Object.values(sheet)) {
      for (const [name, value] of Object.entries(decls as Record<string, string>)) {
        out[name] = String(value);
      }
    }
  }
  return out;
}

describe('@bwp-web/styles-mui theme', () => {
  it('exports theme options that are deep-equal to theme.model.json', () => {
    expect(themeOptions).toBeDefined();
    expect(JSON.parse(JSON.stringify(themeOptions))).toEqual(model.themeOptions);
  });

  it('peer-depends on the MUI range the model was generated for', () => {
    const pkg = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { peerDependencies: Record<string, string> };
    expect(pkg.peerDependencies[model.framework.name]).toBe(model.framework.range);
  });

  it('creates a theme with every component entry and every token variable, values verbatim', () => {
    const theme = createDsTheme();
    for (const { themeKey } of Object.values(model.components)) {
      expect(theme.components?.[themeKey as keyof typeof theme.components]).toBeDefined();
    }
    const vars = declaredVars(theme);
    const prefix = model.themeOptions.cssVariables.cssVarPrefix;
    for (const [category, entries] of Object.entries(model.themeOptions.tokens)) {
      for (const [key, value] of Object.entries(entries)) {
        // a bare number would have gained "px"; the model only holds strings
        expect(vars[`--${prefix}-tokens-${category}-${key}`]).toBe(value);
      }
    }
    for (const key of Object.keys(
      model.themeOptions.colorSchemes[model.themeOptions.defaultColorScheme].palette.tokens,
    )) {
      expect(vars[`--${prefix}-palette-tokens-${key}`]).toBeDefined();
    }
  });

  it('switches color schemes with the design system mode selector', () => {
    const theme = createDsTheme();
    const selectors = theme.generateStyleSheets().flatMap((sheet) => Object.keys(sheet));
    for (const mode of Object.keys(model.themeOptions.colorSchemes)) {
      if (mode === model.themeOptions.defaultColorScheme) {
        continue;
      }
      expect(selectors).toContain(theme.getColorSchemeSelector(mode));
    }
  });

  it('deep-merges consumer options on top', () => {
    const theme = createDsTheme({
      components: { MuiButton: { defaultProps: { disableRipple: true } } },
    });
    expect(theme.components?.MuiButton?.defaultProps?.disableRipple).toBe(true);
    for (const { themeKey } of Object.values(model.components)) {
      expect(theme.components?.[themeKey as keyof typeof theme.components]).toBeDefined();
    }
  });
});
```

`packages/styles-mui/test/render.test.tsx`:

```tsx
import { readFileSync } from 'node:fs';
import { ThemeProvider, type Theme, type ThemeOptions } from '@mui/material/styles';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import * as generated from '../src/index.js';

interface ComponentModel {
  name: string;
  exportName: string;
  themeKey: string;
  rootElement: string;
  stateProps: { prop: string; attribute: string }[];
  slots: Record<string, { className: string }>;
  childrenSlot: string | null;
}

interface Model {
  prefix: string;
  themeOptions: {
    components: Record<string, { styleOverrides: { root: Record<string, string> } }>;
  };
  components: Record<string, ComponentModel>;
}

const model = JSON.parse(
  readFileSync(new URL('../src/generated/theme.model.json', import.meta.url), 'utf8'),
) as Model;
const pascal = (s: string): string => s[0].toUpperCase() + s.slice(1);
const exportsByName = generated as unknown as Record<string, unknown>;
const createDsTheme = exportsByName[`create${pascal(model.prefix)}Theme`] as (
  options?: ThemeOptions,
) => Theme;
const kebab = (camel: string): string => camel.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function render(c: ComponentModel, props: Record<string, unknown>): string {
  const Component = exportsByName[c.exportName] as React.ComponentType<Record<string, unknown>>;
  return renderToStaticMarkup(
    <ThemeProvider theme={createDsTheme()}>
      <Component {...props}>content</Component>
    </ThemeProvider>,
  );
}

describe('generated components', () => {
  const components = Object.values(model.components);

  it('exports one React component per mapped design-system component', () => {
    expect(components.length).toBeGreaterThan(0);
    for (const c of components) {
      expect(typeof exportsByName[c.exportName], c.exportName).toBe('object'); // forwardRef exotic component
    }
  });

  for (const c of components) {
    describe(c.name, () => {
      it('renders the root element, the root class, every slot, and the children', () => {
        const slotProps = Object.fromEntries(
          Object.keys(c.slots)
            .filter((s) => s !== c.childrenSlot)
            .map((s) => [s, `slot-${s}`]),
        );
        const html = render(c, slotProps);
        expect(html).toContain(`<${c.rootElement} `);
        expect(html).toContain(`${c.themeKey}-root`);
        expect(html).toContain('content');
        for (const [slot, { className }] of Object.entries(c.slots)) {
          expect(html).toContain(className);
          if (slot !== c.childrenSlot) {
            expect(html).toContain(`slot-${slot}`);
          }
        }
      });

      it('applies the theme styles through Emotion', () => {
        const html = render(c, {});
        const root = model.themeOptions.components[c.themeKey].styleOverrides.root;
        const [property, value] = Object.entries(root)[0] ?? [];
        if (property) {
          expect(html).toContain(`${kebab(property)}:${value}`);
        }
        expect(html).toContain('<style');
      });

      it('renders state props as attributes', () => {
        for (const { prop, attribute } of c.stateProps) {
          const html = render(c, { [prop]: true });
          expect(html).toContain(attribute === 'disabled' ? 'disabled=""' : `${attribute}="true"`);
        }
      });

      it('forwards a className and DOM props to the root', () => {
        const html = render(c, { className: 'extra', 'data-testid': 'x' });
        expect(html).toContain(`${c.themeKey}-root extra`);
        expect(html).toContain('data-testid="x"');
      });
    });
  }
});
```

If Emotion does not inline `<style>` tags under `renderToStaticMarkup` in this setup, wrap the render in `@emotion/react`'s `CacheProvider` with `createCache({ key: 'css' })` and read the styles from `cache.inserted` instead; keep the assertions on the declaration text.

`packages/styles-mui/README.md`:

````markdown
# @bwp-web/styles-mui

The design system as an MUI theme plus one React component per design-system
component. Generated from `@bwp-web/styles-css` by the compiler; only
`src/generated/` is generated, everything else in the package is hand-written.

## Install

```bash
npm install @mui/material @emotion/react @emotion/styled @bwp-web/styles-mui
```

## Use

```tsx
import { ThemeProvider } from '@mui/material/styles';
import { createBwpTheme, Example } from '@bwp-web/styles-mui';

const theme = createBwpTheme();

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <Example tone="accent" size="sm" icon={<PlusIcon />}>
        Save
      </Example>
    </ThemeProvider>
  );
}
```

Each component's props are exactly the design system's axes (typed as the
manifest's values), one boolean per state that needs an attribute
(`disabled`, `pressed`, …), one `ReactNode` per slot, and the root element's
DOM props. Hover, focus, and active states come from the browser.

Set the color mode on the root element: `<html data-bwp-theme="dark">`. The
theme's CSS variables switch with it; no re-render is needed.

Tokens are theme CSS variables: `theme.vars.palette.tokens['accent-default']`
for colors (per color scheme) and `theme.vars.tokens.space['2']`,
`theme.vars.tokens.fontWeight.semibold`, … for everything else. Component rules
reference them, so `sx` and `styled` can too.

`createBwpTheme(options)` deep-merges `options` on top of the generated theme.
MUI's own components keep MUI's defaults; the design system's components are
fully specified by the theme.

## What is inside

| File | Content |
| --- | --- |
| `src/generated/theme.ts` | `bwpThemeOptions` and `createBwpTheme()`. |
| `src/generated/theme.model.json` | The model the TypeScript was rendered from; `bwp-ds verify` round-trips it. |
| `src/generated/augmentation.ts` | Module augmentation: token keys, component theme entries. |
| `src/generated/components/*.tsx` | One component per design-system component. |
| `src/generated/typecheck.tsx` | Type-level probe compiled by `tsc`, never shipped. |

## Regenerate

From the repository root: `npm run ds -- generate --target mui`, then
`npm run verify`. CI fails when the committed output differs from a fresh
generation.
````

- [ ] **Step 4: Root wiring**

`.github/workflows/main.yml`: extend the diff to

```yaml
      - name: Check generated files are up to date
        run: git diff --exit-code -- packages/styles-css/design.ir.json packages/styles-css/src/index.css packages/styles-tailwind/src/generated packages/styles-mui/src/generated docs/design-system/coverage.md
```

Root `README.md`: after the `styles-tailwind` row add

```markdown
| [`@bwp-web/styles-mui`](./packages/styles-mui) | Generated MUI theme and React components | [docs](./packages/styles-mui/README.md) |
```

- [ ] **Step 5: Install, build, generate, verify**

From the repo root (Node 22):

```bash
npm install
npm run build -w @bwp-web/ds-compiler
npm run ds -- build
npm run ds -- generate
npm run verify
npm run typecheck -w @bwp-web/styles-mui
npm run lint -w @bwp-web/styles-mui
npm run build -w @bwp-web/styles-mui
npm run test -w @bwp-web/styles-mui
npm run build
npm run lint
npm run typecheck
npm run format
npm run test
npm run verify
ls packages/styles-mui/src/generated packages/styles-mui/src/generated/components
```

Expected: `npm install` prints no `EBADENGINE` (a peer notice about `@mui/material-pigment-css` is MUI's optional peer and can be ignored). `ds build` rewrites `design.ir.json` (config and manifest changed). `ds generate` reports 3 Tailwind files (unchanged) plus `theme.model.json`, `theme.ts`, `augmentation.ts`, `components/Example.tsx`, `components/index.ts`, `index.ts`, `typecheck.tsx`. `verify` prints `0 errors` and all four steps `pass`. The package `typecheck` and `lint` pass on the generated code: **if either fails, fix the renderer in `packages/ds-compiler/src/targets/mui/` and regenerate; never edit the output.** The package tests pass. Every root gate is green.

Inspect `packages/styles-mui/src/generated/theme.ts`: `export const bwpThemeOptions = {`, `cssVarPrefix: 'bwp'`, `colorSchemeSelector: 'data-bwp-theme'`, `'accent-default':` under both `light` and `dark`, `fontWeight: {` with `semibold:`, `BwpExample: {` with `styleOverrides` whose root has `appearance: 'none'` and `variants` starting with `{ props: {}, style: { '&:hover': {` and containing `{ props: { tone: 'accent' }, style: { '&&': {` and `{ props: { tone: 'accent' }, style: { '&&:hover': {` and `{ props: {}, style: { '& .BwpExample-icon': {`. Inspect `components/Example.tsx`: `export type ExampleTone = 'neutral' | 'accent';`, `export type ExampleSize = 'sm' | 'md';`, `<span className={exampleClasses.label}>{children}</span>`, `disabled={disabled}`. Inspect `docs/design-system/coverage.md`: `| Component | mui | tailwind |` and `| \`example\` | supported | supported |`.

- [ ] **Step 6: Documentation**

Replace `docs/design-system/targets/mui.md` with:

````markdown
# Target: MUI

Status: generated. `bwp-ds generate --target mui` writes
`packages/styles-mui/src/generated/`, and `bwp-ds verify` checks drift,
round-trip, and coverage for it. Components that map onto MUI's own components
(`Button`, `Chip`, …) and the browser-defaults catalog are the next plan;
today every mapped component becomes its own React component.

## What is emitted

MUI 9.4.x with Emotion. Every file starts with a header naming the compiler
version and the IR's source hash (`theme.model.json` carries it as its first
key).

- `theme.model.json`: the model everything else is rendered from. The package
  test asserts `theme.ts` deep-equals it, so verifying the model verifies the
  theme.
- `theme.ts`: `<prefix>ThemeOptions` (a `createTheme` options object) and
  `create<Prefix>Theme(options?)`, which deep-merges `options` on top.
- `augmentation.ts`: module augmentation of `@mui/material/styles`: exact token
  keys on `Palette`, `Theme`, `ThemeOptions`, and `ThemeVars`; one
  `Components` entry per design-system component.
- `components/<Pascal>.tsx`: one React component per design-system component.
- `typecheck.tsx`: a type-level probe compiled by the package's `tsc`, never
  bundled. It accepts each component with the design system's values and has
  a `@ts-expect-error` line per axis with a value outside the manifest.

## Tokens

| Category | Theme path | CSS variable |
| --- | --- | --- |
| `color` | `colorSchemes.<mode>.palette.tokens["<path>"]` | `--<prefix>-palette-tokens-<path>` |
| everything else | `tokens.<camelCategory>["<path>"]` | `--<prefix>-tokens-<camelCategory>-<path>` |

`<path>` is the token path joined with `-`: `--bwp-color-text-default` becomes
`palette.tokens["text-default"]` and `--bwp-palette-tokens-text-default`;
`--bwp-font-weight-semibold` becomes `tokens.fontWeight.semibold` and
`--bwp-tokens-fontWeight-semibold`. Every value is a string (MUI appends `px`
to bare numbers). Aliases stay `var()` references. A non-color token whose
value varies by mode is `DS-E084`: MUI has no per-scheme home for it.

`cssVarPrefix` is the design-system prefix. `colorSchemeSelector` is derived
from `modeSelector`: `:root[data-bwp-theme="{mode}"]` becomes
`data-bwp-theme`, so `<html data-bwp-theme="dark">` switches both the CSS
package and the MUI theme. A class-form selector (`.x-{mode}`) works too;
anything else is `DS-E084`.

MUI's own semantic slots (`palette.primary`, typography variants, `spacing`,
`shape`, `shadows`) keep MUI's defaults: MUI's internals read them, and the
design system's components do not. Narrowing MUI's own prop unions belongs
with framework-mapped components.

## Components

Each mapped component `<name>` becomes `theme.components.<Prefix><Name>` and a
React component `<Name>`:

- The base root rule is `styleOverrides.root`.
- Every other rule, in the compiler's cascade order, is one `variants` entry
  `{ props: { <axis>: <value>, … }, style: { <key>: { … } } }`. `<key>`
  repeats `&` once per selected axis (`&&` for one axis), then the states as
  the design system renders them (`:hover`, `:disabled` or
  `[aria-disabled="true"]`, `[aria-pressed="true"]`, …), then
  ` .<Prefix><Name>-<slot>` for a slot. `&&` doubles the Emotion class, so the
  specificity equals the CSS target's, and Emotion emits `styleOverrides`
  before `variants` in array order, so ties resolve identically.
- The component is a thin shell: a `styled(<root element>)` root registered
  under the theme key with `ownerState` = the axis values, one plain element
  per slot with class `<Prefix><Name>-<slot>`, `useThemeProps` for
  `defaultProps`. It has no styles of its own; wrap the app in
  `ThemeProvider`.
- Props: one optional prop per axis, typed as the manifest's values; a
  `boolean` per state that needs an attribute (`disabled` renders the
  `disabled` attribute on form controls and `aria-disabled` elsewhere;
  `pressed`, `selected`, `expanded`, `checked` render `aria-*`); `children`
  fill the `label` slot if there is one, else the first required slot, else
  the root; every other slot is a `ReactNode` prop; the root element's DOM
  props are forwarded.

A component whose states, elements, or slot names a React shell cannot express
is `DS-E085`; the manifest fixes it or excludes the component.

## Manifest hints

`targets.mui` accepts `{}` (generate an own component) or
`{ "ignore": ["<property>", …] }`. Ignored properties are left out of the
theme and of the round-trip comparison, and coverage reports `partial`.
`{ "excluded": "<reason>" }` opts out.

## Round-trip

`reparse` reads `theme.model.json`, rewrites the token variables to source
names, and feeds each category through the compiler's token parser; it
reconstructs every `styleOverrides.root` and `variants` entry into a rule in
the design system's selector grammar, parses those with the component parser,
and checks that the variant order and every selector key equal the canonical
form. Any difference is `DS-E081` at `theme.model.json` and points at a
generator or reparser bug, never at the output.

## Regenerating

`npm run ds -- generate --target mui` from the repo root, then
`npm run verify`. Never edit files under `src/generated/`; a generation bug
that makes the package's `tsc` or `eslint` fail is fixed in
`packages/ds-compiler/src/targets/mui/`.
````

`docs/design-system/verification.md`: in the CI generated-files row, add `packages/styles-mui/src/generated` next to `packages/styles-tailwind/src/generated` as guarded by `DS-E080`.

`docs/design-system/errors.md`: in the "Generated output and verification" table add

```markdown
| DS-E084 | A configuration the target cannot express: for MUI, a `modeSelector` that is not an attribute or class form, or a non-color token whose value varies by mode | Change `ds.config.json` or the token. |
| DS-E085 | A component the MUI target cannot render as a React component: a state outside the pseudo-class and ARIA sets, a slot element that is not a plain HTML tag, or a slot named like a reserved prop, axis, or state | Change the manifest, or set `targets.mui` to `{ "excluded": "<reason>" }`. |
```

`docs/design-system/ir.md`: in the `ComponentIR` shape, add `axisOrder: string[]` and `slotOrder: string[]` with one sentence: "Manifest key order for axes and slots (`root` first). `design.ir.json` sorts object keys, so generators that need authored order (the MUI shells render slots in `slotOrder`) read these instead of the record keys."

`docs/design-system/authoring-guide.md`: in the manifest table's `targets` row, extend the hints clause to "(`tailwind` and `mui`: `{ "ignore": [<property>…] }`, validated against the property table; `mui: {}` generates a React component for the component)".

`AGENTS.md`:

- Invariant 2: add `packages/styles-mui/src/generated/` to the list.
- Package map: add `| \`packages/styles-mui\` | \`@bwp-web/styles-mui\` | Generated MUI theme, augmentation, and React components. Only \`src/generated/\` is generated; everything else in the package is hand-written. |`.
- "Add a component" recipe: the manifest needs `targets.mui` (`{}` for an own React component, or an exclusion) as well as `targets.tailwind`.
- "Change the compiler" or the recipes: add "A generation bug that makes `packages/styles-mui` fail `typecheck` or `lint` is fixed in the renderer under `packages/ds-compiler/src/targets/mui/`, then regenerated."
- Error code index: `DS-E084`, `DS-E085` fall under the existing `DS-E08x` entry; extend its label to "generated output, verification, and target expressibility".

- [ ] **Step 7: Format and final checks**

```bash
npx prettier --write AGENTS.md README.md docs/design-system packages/styles-css/ds.config.json packages/styles-css/src/components/example/example.manifest.json
npx prettier --write packages/styles-mui --ignore-path .gitignore --ignore-path packages/styles-mui/.prettierignore
npx prettier --check AGENTS.md README.md docs/design-system
npm run ds -- build
npm run ds -- generate
npm run format
npm run verify
npm run build
npm run test
git diff --exit-code -- packages/styles-css/design.ir.json packages/styles-css/src/index.css packages/styles-tailwind/src/generated packages/styles-mui/src/generated docs/design-system/coverage.md; echo "diff exit $?"
```

Never run Prettier over `packages/styles-mui/src/generated` or `docs/design-system/coverage.md`; the root `.prettierignore` and the package `.prettierignore` cover the paths above. The `ds build` and `ds generate` after formatting pick up any byte change Prettier made to `ds.config.json` or the manifest. Expected: all green; the final diff exits 1 only because the generated files are new or regenerated once, and running `npm run build && npm run verify` again changes nothing further (repeat the diff and confirm identical output).

- [ ] **Step 8: Checkpoint**

Report: `packages/styles-mui/**` created (list the hand-written files and the generated ones separately), `ds.config.json`, `example.manifest.json`, `design.ir.json`, `coverage.md`, `main.yml`, `README.md`, `AGENTS.md`, the four docs modified; `npm ls @mui/material` version; package test count; root test count.

---

## Task 6: Final verification

**Files:** none new.

- [ ] **Step 1: Clean install and full pipeline from scratch**

From the repo root (Node 22):

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

Expected: every command exits 0; `verify` prints all four steps `pass`; the last line prints `generated files current`.

- [ ] **Step 2: Drift is caught and repaired by the documented commands**

```bash
printf '\n// stray\n' >> packages/styles-mui/src/generated/theme.ts
npm run verify ; echo "exit $?"
npm run ds -- generate --target mui
npm run verify
```

Expected: the first `verify` exits 1 with one `DS-E080` naming `../styles-mui/src/generated/theme.ts`; `generate` rewrites it; the second `verify` passes and `git status --short` shows no change under `packages/styles-mui`.

- [ ] **Step 3: The type-level contract holds**

Edit a copy, not the repo: copy `packages/styles-mui/src/generated/typecheck.tsx` to `packages/styles-mui/test/probe.tsx`, remove one `// @ts-expect-error` line, run `npm run typecheck -w @bwp-web/styles-mui`, and expect a type error on the line below the removed comment (the axis value is rejected). Delete `test/probe.tsx` with `rm` and confirm `npm run typecheck -w @bwp-web/styles-mui` passes again.

- [ ] **Step 4: An inexpressible component is caught**

```bash
npm run ds -- scaffold component demo --axis tone=quiet,loud --state hover,busy --slot icon --root-element button
```

Edit the scaffolded manifest so `targets` is `{ "tailwind": {}, "mui": {} }` and fill every `TODO` in both files with valid content (for example `display: block;` in each CSS rule; the `busy` state is written as `[data-state="busy"]` in the CSS). Then:

```bash
npm run ds -- lint
npm run ds -- generate ; echo "exit $?"
npm run verify ; echo "exit $?"
```

Expected: lint passes (perhaps with `DS-W001`); `generate` exits 1 with `DS-E085 … demo: state "busy" cannot be expressed …` and writes nothing (`git status --short` shows no change under `packages/styles-tailwind` or `packages/styles-mui`); `verify` exits 1 with the same `DS-E085` under `drift: fail`. Remove the component with `rm` and `rmdir` (not `rm -rf`), run `npm run ds -- build`, `npm run ds -- generate`, `npm run verify`, and confirm `git status --short` is clean apart from this plan's intended changes.

- [ ] **Step 5: The published shape**

```bash
npm pack --dry-run -w packages/styles-mui
```

Expected: `README.md`, `package.json`, and `dist/**` only (`index.js`, `index.cjs`, their maps, `index.d.ts`, `index.d.ts.map`, and `generated/**/*.d.ts` including `generated/augmentation.d.ts`, but no `typecheck.d.ts`). No `src/`, `test/`, or config files.

- [ ] **Step 6: Final report**

List every created, modified, and deleted path grouped by package, the test counts (`ds-compiler`, `styles-mui`), the four `verify` steps, and confirm no git write command was run. Note for Plan 3b: mapped components add `targets.mui.component`, `axisMap`, `slotMap`, `defaultProps` to `muiHintsSchema`; the model gains a `mapped` kind per component whose theme entry targets `Mui<Component>`; `capture-defaults` produces `packages/ds-compiler/catalogs/mui@<version>.json` (computed styles per permutation and state, `<component>Classes` keys, type-extracted default prop unions); the generator adds `unset` resets and effective-value restatements for framework-set properties; the augmentation sets MUI's default values to `false` on the mapped props' overrides interfaces. Note for Plan 4: the compare harness can mount `<Prefix><Name>` from this package next to the CSS target with the same axis and state permutations.

---

## Follow-ups recorded while writing this plan

- **`DS-E083` still has no emitter.** The MUI own-component path expresses every property; Plan 3b's mapped components or the Flutter plugin will be the first to report an unsupported property.
- **`assertUniqueNames` (Tailwind) still throws** a plain `Error`; with the `diag` parameter on `generate` it can become a coded diagnostic. Not changed here to keep the Tailwind plugin untouched.
- **Own components emit no `data-<axis>` attributes.** Styling goes through `ownerState`, so the DOM carries the axis only as computed styles. If Plan 4's harness wants to select by axis in the DOM, add `data-*` attributes in the shell (they would not change the styles).
- **`sideEffects: false`** on the package relies on the augmentation being type-only. If a future generated file has runtime side effects, drop the flag.
- **Global type augmentation.** Importing `@bwp-web/styles-mui` enables MUI's `CssThemeVariables` flag and makes the token keys required on `Palette`/`Theme` for the whole app (documented). A consumer that also creates non-CSS-variable MUI themes gets types that lie about `theme.vars`. If that ever matters, split the flag and the token interfaces into an opt-in `@bwp-web/styles-mui/augmentation` entry and keep only the `Components` entries global.
- **Published source maps are dangling** (`dist/**/*.map` ship without `src/`), the same as `@bwp-web/components`. Fix both in Plan 6.
- **Every color scheme lists every color token**, so the dark block restates unchanged colors; the CSS package overrides only varying ones. Same computed values; noted as a divergence, not a defect.
- **Modes other than `light`/`dark`** are `DS-E084` for MUI. MUI can host a custom scheme if it is seeded from a base palette (`{ ...createTheme({ palette: { mode: 'light' } }).palette, tokens }` works); doing so needs a config hint naming the base mode per custom mode.
- **Void slot elements** (`img` for an avatar, `hr` for a divider) are `DS-E085`; supporting them means a slot whose prop maps to attributes rather than children.
- **Custom (`data-state`) states** are `DS-E085` for MUI. Supporting them as a single `state?: '<a>' | '<b>'` prop is a small follow-up once a component needs it.
- **Theme-key collisions** need no check: PascalCase of a kebab-case name is injective (`ex-ample` gives `BwpExAmple`, `example` gives `BwpExample`), so two components can never share a theme key or class stem.

---

## Execution log

Read this section first when resuming. It records how the plan is being executed
and where it stands. Update the status table after every milestone.

### Process

- Skill: `superpowers:subagent-driven-development`. Tasks are batched; each batch
  gets one implementer subagent (sonnet), then one spec-compliance reviewer
  (sonnet), then one code-quality reviewer (opus) that probes by running.
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
| 1 | 1-2 contract `diag`, shared value renderers, hints, names, error codes, model | done, reviewed, committed by user |
| 2 | 3 renderers (`theme.ts`, `augmentation.ts`, shells, `typecheck.tsx`, model JSON) | done, reviewed, committed by user |
| 3 | 4 `reparse`, plugin object, registration, coverage | done, reviewed, committed by user (root `verify` fails with six DS-E080 until Task 5 wires the package) |
| 4 | 5 `styles-mui` package, wiring, generated output, docs | done, reviewed, awaiting user commit |
| 5 | 6 final verification | pending |

Test suite at the start of Plan 3: 25 files, 289 tests (end of Plan 2). After batch 1: 27 files, 317 tests. After batch 2: 28 files, 334 tests (`design.ir.json` regenerated for the new `axisOrder`/`slotOrder` fields). After batch 3: 29 files, 355 tests. After batch 4: compiler 29 files / 355 tests plus `styles-mui` 2 files / 10 tests; 34 Turbo tasks.

### Decisions made during execution

- Batch 4 review (tarball installed in a fresh consumer project: types travel
  through `dist`, ESM and CJS load, all 74 token variables and every rule
  render; fresh-checkout CI sequence green): `prepublishOnly` added; the global
  augmentation is kept and documented (see follow-ups); stale "MUI comes
  later" rows fixed; wording fixes in the README, `targets/mui.md`,
  `errors.md`, and the generated `theme.ts` docstring.
- Batch 4 implementation: the augmentation also sets MUI's
  `CssThemeVariables { enabled: true }`, without which MUI 9.4's `Theme` type
  lacks `vars`, `generateStyleSheets`, and `getColorSchemeSelector` and the
  package's own `tsc` fails. `getColorSchemeSelector(mode)` returns the
  selector with a trailing ` &` for nesting, so the package test strips it
  before matching stylesheet keys.
- Batch 3 review (tamper matrix against the MUI round-trip: 13 of 15
  corruptions caught, the two misses being equivalent notations): the alias
  mode-map is canonicalised in `resolveTokens` so a `:root`-only alias and a
  restated one yield one IR; `reparseMui` verifies `components` metadata by
  rebuilding it from the IR; the reparser's own checks report plain DS-E081
  messages without a borrowed inner code.
- Batch 2 review (generated output compiled against MUI 9.4 and React 19 with
  tsc and eslint, rendered with Emotion; all clean): modes are limited to
  `light`/`dark` (DS-E084 otherwise); `ComponentIR` gained `axisOrder` and
  `slotOrder` so output no longer depends on IR key order; void elements and
  misplaced SVG elements are DS-E085; state attributes are emitted after the
  DOM-prop spread and omitted from the accepted DOM props; `typecheck.tsx`
  drops the unused React import. Renderers stay plain multi-line, with no
  column-width heuristics.

- Batch 1 review: `bwp-ds generate` exits from `diagnostics.hasErrors()`, not
  from the presence of an IR (a plugin error with an IR present previously
  exited 0 while writing nothing). React prop names are the camelCase of
  manifest names, carried on the model as `prop`; elements are validated
  against the HTML tag list; MUI-injected prop names are reserved; axes and
  slots are copied so the model's JSON is provenance-independent;
  `sourceNameFromMui` rejects colors under `tokens`. Shadow values render
  with explicit `px` units, as the shared renderers always did. SVG child
  elements are accepted alongside `svg`; a unified uniqueness pass over axis,
  state, and slot prop names catches two names that camelCase to the same
  prop (`a-1b` and `a1b`).
