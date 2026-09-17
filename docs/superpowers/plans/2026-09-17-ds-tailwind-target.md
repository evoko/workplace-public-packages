# Tailwind Target and Verification Implementation Plan (Plan 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the pipeline end to end: a target-plugin contract in the compiler, a Tailwind CSS v4 plugin that turns `design.ir.json` into a committed `@bwp-web/styles-tailwind` package, and `bwp-ds generate` plus `bwp-ds verify` (drift, round-trip, coverage) wired into the repo and CI.

**Architecture:** Plugins live under `packages/ds-compiler/src/targets/<id>/` and implement `generate`, `reparse`, and `coverage` against the IR; a registry lists implemented plugins and a separate hints module lets the manifest schema validate `targets.<id>` without importing plugin code. The Tailwind plugin is near-identity: tokens become `@theme static` variables in Tailwind namespaces (`--color-<prefix>-…`, `--spacing-<prefix>-…`, …) with a mode override block, and component rules become `@layer components` rules whose values reference those variables; `reparse` rewrites the generated names back to source form and runs the compiler's own parsers, so round-trip is an exact IR comparison. `verify` runs lint, drift (regenerate and byte-compare), round-trip, and coverage, writing `coverage.md`.

**Tech Stack:** TypeScript 5.9, Node 22, Tailwind CSS 4.3.x (`tailwindcss`, `@tailwindcss/postcss`), PostCSS 8, Zod 4, Vitest 4, commander 15, Turbo.

**Rules for every task:**

- **Never run any git command that writes** (no `git add`, `git commit`, `git tag`, `git stash`, `git checkout`, `git reset`). The user commits at each checkpoint. `git status` and `git diff` are fine.
- Use Node 22: `export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"` (or `nvm use`).
- Never name anything after the current design system. Use `ds`, `bwp`, or a descriptive word.
- Generated output is deterministic: sorted keys, template formatting, no external formatter at generation time.
- Do not work around a denied command. Report it.

---

## Decisions made while writing this plan

| Topic | Decision |
| --- | --- |
| Theme emission | `@theme static { … }` so every token becomes a CSS variable whether or not a utility uses it. Default-mode values live in `@theme`; each non-default mode gets one plain rule using the configured mode selector that overrides only the tokens that vary. |
| Variable names | Categories with a Tailwind namespace: `--<ns>-<prefix>-<path>` (`color` to `color`, `space` to `spacing`, `radius` to `radius`, `font-family` to `font`, `font-size` to `text`, `font-weight` to `font-weight`, `line-height` to `leading`, `letter-spacing` to `tracking`, `shadow` to `shadow`, `easing` to `ease`). The rest (`border-width`, `duration`, `opacity`, `z-index`, `size`) keep the source name `--<prefix>-<category>-<path>`. |
| Aliases | When a token's source used `var()`, the generated value is `var(<tailwind name of the alias>)`, per mode. Round-trip therefore recovers `alias` too. |
| `disabled` rendering | `:disabled` when the component's root element is a form control (`button`, `input`, `select`, `textarea`, `fieldset`, `option`, `optgroup`), otherwise `[aria-disabled="true"]`. Shared by the generator and the scaffold, which gains `--root-element`. Lint warns `DS-W003` when source CSS uses `:disabled` or `[disabled]` on a non-form root. |
| Round-trip | `reparse` rewrites generated variable names back to source names, unwraps `@theme` and `@layer components`, groups component rules by root class, and runs `parseTokenFile`, `resolveTokens`, and `parseComponentCss`. The diff strips `source` locations and compares tokens and rules structurally. |
| Where output goes | `ds.config.json` gains `targets.<id>.outDir` (relative to the source root, default `../styles-<id>/src/generated`) and `coverageFile` (default `coverage.md` in the source root). The `styles-css` config sets `../styles-tailwind/src/generated` and `../../docs/design-system/coverage.md`. |
| IR | `meta.modeSelector` is added so generators need only the IR. `irVersion` stays 1 (additive field). |
| Unmapped components | A component whose manifest has no `targets.<id>` entry is `unmapped`: nothing is generated for it and `verify` fails with `DS-E082`. `{}` maps it; `{ "excluded": "<reason>" }` leaves it out on purpose. |
| Hints | `targets.tailwind` accepts `{ "ignore": [<property>…] }`; ignored properties are omitted from the output and from the round-trip comparison, and coverage reports `partial`. `mui` and `flutter` stay permissive records until their plugins land. |
| Packaging in this plan | `@bwp-web/styles-tailwind` ships `src/` only (consumers compile with their own Tailwind). Its `build` compiles a probe stylesheet with `@tailwindcss/postcss` and asserts the expected utilities and component rules exist. Version scripts and `auto-tag.yml` changes wait for Plan 6. |

## File structure

Compiler (`packages/ds-compiler/`):

| Path | Responsibility |
| --- | --- |
| `src/version.ts` | `COMPILER_VERSION` read from `package.json` (shared by the CLI and generated-file headers). |
| `src/targets/plugin.ts` | `TargetPlugin`, `GeneratedFile`, `PluginContext`, `CoverageEntry`, `CoverageStatus` types; `outDirFor`, `pluginContext`. |
| `src/targets/hints.ts` | `TARGET_IDS`, `tailwindHintsSchema`, `TARGET_HINT_SCHEMAS`, `targetsSchema` used by the manifest. Imports nothing from plugins. |
| `src/targets/index.ts` | `TARGETS` registry (implemented plugins) and `getTarget`. |
| `src/targets/tailwind/names.ts` | Tailwind variable naming and its inverse. |
| `src/targets/tailwind/render.ts` | Value rendering, `theme.css`, `components.css`, `index.css`, header. |
| `src/targets/tailwind/reparse.ts` | Generated CSS back to a `DesignIR`. |
| `src/targets/tailwind/index.ts` | The plugin object. |
| `src/components/render-selector.ts` | Canonical selector text for a rule; `stateSelector`; `FORM_CONTROL_ELEMENTS`. |
| `src/verify/ir-diff.ts` | Structural IR comparison. |
| `src/verify/coverage.ts` | Coverage report and its Markdown rendering. |
| `src/verify/drift.ts` | Regenerate and byte-compare against committed files. |
| `src/verify/index.ts` | `verify(rootDir)` orchestration. |
| `src/generate.ts` | `generate(rootDir, targetIds)` writes plugin output. |
| Modified: `src/config.ts`, `src/ir/types.ts`, `src/build.ts`, `src/errors.ts`, `src/cli.ts`, `src/index.ts`, `src/components/manifest.ts`, `src/components/parse-component.ts`, `src/scaffold/component.ts`, `scripts/emit-manifest-schema.ts` output. | |

Package `packages/styles-tailwind/`: `package.json`, `README.md`, `.prettierignore`, `postcss.config.js`, `src/index.css` (hand-written, imports generated), `src/generated/{theme,components,index}.css` (generated, committed), `probe/index.css`, `scripts/assert-probe.mjs`.

Repo: `turbo.json`, root `package.json` (`verify` script), `.github/workflows/main.yml`, `packages/styles-css/ds.config.json`, docs under `docs/design-system/`, `AGENTS.md`, root `README.md`, generated `docs/design-system/coverage.md`.

---

## Task 1: Plugin contract, hint schemas, registry skeleton, config and IR additions

**Files:**
- Create: `packages/ds-compiler/src/version.ts`
- Create: `packages/ds-compiler/src/targets/plugin.ts`
- Create: `packages/ds-compiler/src/targets/hints.ts`
- Create: `packages/ds-compiler/src/targets/index.ts`
- Modify: `packages/ds-compiler/src/config.ts`
- Modify: `packages/ds-compiler/src/ir/types.ts`
- Modify: `packages/ds-compiler/src/build.ts`
- Modify: `packages/ds-compiler/src/components/manifest.ts`
- Modify: `packages/ds-compiler/src/scaffold/component.ts` (`KNOWN_TARGETS` from hints)
- Modify: `packages/ds-compiler/src/cli.ts` (use `COMPILER_VERSION`)
- Regenerate: `packages/ds-compiler/schemas/manifest.schema.json`
- Test: `packages/ds-compiler/test/targets-hints.test.ts`, `test/config.test.ts`, `test/manifest.test.ts`, `test/build.test.ts`

- [ ] **Step 1: Write the failing tests**

`test/targets-hints.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseManifest } from '../src/components/manifest.js';
import { Diagnostics } from '../src/errors.js';
import {
  TARGET_HINT_SCHEMAS,
  TARGET_IDS,
  tailwindHintsSchema,
} from '../src/targets/hints.js';
import { TARGETS, getTarget } from '../src/targets/index.js';
import { outDirFor } from '../src/targets/plugin.js';
import type { DsConfig } from '../src/config.js';

const config: DsConfig = {
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light'],
  defaultMode: 'light',
  rootFontSize: 16,
  modeSelector: ':root[data-fx-theme="{mode}"]',
  targets: {},
  coverageFile: 'coverage.md',
};

describe('target hints', () => {
  it('lists the three known target ids', () => {
    expect([...TARGET_IDS]).toEqual(['tailwind', 'mui', 'flutter']);
    expect(Object.keys(TARGET_HINT_SCHEMAS)).toEqual(['tailwind', 'mui', 'flutter']);
  });

  it('tailwind hints accept an ignore list of known properties only', () => {
    expect(tailwindHintsSchema.safeParse({}).success).toBe(true);
    expect(tailwindHintsSchema.safeParse({ ignore: ['opacity'] }).success).toBe(true);
    expect(tailwindHintsSchema.safeParse({ ignore: ['not-a-property'] }).success).toBe(false);
    expect(tailwindHintsSchema.safeParse({ other: 1 }).success).toBe(false);
  });

  it('the manifest validates tailwind hints and keeps mui/flutter permissive', () => {
    const base = { name: 'chip', displayName: 'Chip' };
    const ok = new Diagnostics();
    parseManifest(
      {
        ...base,
        targets: {
          tailwind: { ignore: ['opacity'] },
          mui: { component: 'Chip', anything: true },
          flutter: { excluded: 'later' },
          other: { whatever: 1 },
        },
      },
      'chip.manifest.json',
      'chip',
      ok,
    );
    expect(ok.items).toEqual([]);

    const bad = new Diagnostics();
    parseManifest(
      { ...base, targets: { tailwind: { ignore: ['nope'] } } },
      'chip.manifest.json',
      'chip',
      bad,
    );
    expect(bad.items.map((d) => d.code)).toEqual(['DS-E020']);
    expect(bad.items[0].message).toContain('targets.tailwind.ignore');

    for (const target of ['tailwind', 'mui', 'other']) {
      const malformed = new Diagnostics();
      parseManifest(
        { ...base, targets: { [target]: { excluded: '' } } },
        'chip.manifest.json',
        'chip',
        malformed,
      );
      expect(malformed.items.map((d) => d.code)).toEqual(['DS-E020']);
    }
  });
});

describe('target registry', () => {
  it('has no implemented plugins until the tailwind plugin lands (Task 4 replaces this test)', () => {
    expect(Object.keys(TARGETS)).toEqual([]);
    expect(getTarget('tailwind')).toBeNull();
  });
});

describe('outDirFor', () => {
  it('defaults to a sibling styles-<id> package and honours config overrides', () => {
    expect(outDirFor('/repo/packages/styles-css', config, 'tailwind')).toBe(
      '/repo/packages/styles-tailwind/src/generated',
    );
    const custom: DsConfig = {
      ...config,
      targets: { tailwind: { outDir: 'out/tw' } },
    };
    expect(outDirFor('/repo/packages/styles-css', custom, 'tailwind')).toBe(
      '/repo/packages/styles-css/out/tw',
    );
  });
});
```

Add to `test/config.test.ts` (inside the existing `describe`):

```ts
  it('accepts targets and coverageFile and defaults them', () => {
    const root = makeRoot({
      'ds.config.json': JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        targets: { tailwind: { outDir: '../tw/src/generated' } },
        coverageFile: '../../docs/coverage.md',
      }),
    });
    const diag = new Diagnostics();
    const config = loadConfig(root, diag);
    expect(diag.items).toEqual([]);
    expect(config?.targets).toEqual({ tailwind: { outDir: '../tw/src/generated' } });
    expect(config?.coverageFile).toBe('../../docs/coverage.md');

    const bare = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const c2 = loadConfig(bare, new Diagnostics());
    expect(c2?.targets).toEqual({});
    expect(c2?.coverageFile).toBe('coverage.md');
  });

  it('rejects unknown keys inside a target entry', () => {
    const root = makeRoot({
      'ds.config.json': JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        targets: { tailwind: { outdir: 'typo' } },
      }),
    });
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.items[0].code).toBe('DS-E001');
  });
```

(`makeRoot`, `MINI_CONFIG`, `Diagnostics`, and `loadConfig` are already imported in that file; add any that are missing.)

Add to `test/build.test.ts`, in the test that builds the mini fixture and inspects `ir.meta`:

```ts
    expect(ir?.meta.modeSelector).toBe(':root[data-fx-theme="{mode}"]');
```

- [ ] **Step 2: Run tests to verify they fail**

Run from `packages/ds-compiler`: `npx vitest run test/targets-hints.test.ts test/config.test.ts test/build.test.ts`
Expected: FAIL. `../src/targets/hints.js` cannot be resolved; `config.targets` is undefined; `meta.modeSelector` is undefined.

- [ ] **Step 3: Create `src/version.ts` and use it in `cli.ts`**

```ts
import { createRequire } from 'node:module';

const { version } = createRequire(import.meta.url)('../package.json') as {
  version: string;
};

/** The compiler's own package version, for --version and generated-file headers. */
export const COMPILER_VERSION: string = version;
```

In `src/cli.ts`, delete the `createRequire` import and the `const { version } = …` block, add `import { COMPILER_VERSION } from './version.js';`, and pass `.version(COMPILER_VERSION)`.

- [ ] **Step 4: Extend the config**

In `src/config.ts`, add to `rawConfigSchema` after `modeSelector`:

```ts
  targets: z
    .record(
      z.string().regex(/^[a-z][a-z0-9-]*$/, 'target ids are kebab-case'),
      z.strictObject({
        /** Where this target's generated files go, relative to the source root. */
        outDir: z.string().min(1).optional(),
      }),
    )
    .default({}),
  /** Where `bwp-ds verify` writes the coverage report, relative to the source root. */
  coverageFile: z.string().min(1).default('coverage.md'),
```

Extend `DsConfig`:

```ts
export interface DsConfig {
  name: string;
  prefix: string;
  modes: string[];
  defaultMode: string;
  rootFontSize: number;
  modeSelector: string;
  targets: Record<string, { outDir?: string }>;
  coverageFile: string;
}
```

Where `loadConfig` builds the returned object, copy `targets: parsed.targets` and `coverageFile: parsed.coverageFile` through (look at how `rootFontSize` and `modeSelector` are copied and follow that shape). Every place in tests that constructs a `DsConfig` literal by hand (`test/scaffold.test.ts`, `test/parse-component.test.ts`, others found by `npm run typecheck`) gains `targets: {}` and `coverageFile: 'coverage.md'`.

- [ ] **Step 5: Add `modeSelector` to the IR meta**

In `src/ir/types.ts`:

```ts
  meta: {
    name: string;
    prefix: string;
    modes: Mode[];
    defaultMode: Mode;
    rootFontSize: number;
    /** Selector for non-default modes, with `{mode}` as the placeholder. */
    modeSelector: string;
    sourceHash: string;
  };
```

In `src/build.ts` where `meta` is constructed, add `modeSelector: config.modeSelector,`.

Also expose the loaded config on the build result so `generate` and `verify` do not read `ds.config.json` twice:

```ts
export interface BuildResult {
  ir: DesignIR | null;
  /** The parsed config, or null when ds.config.json could not be loaded (DS-E001). */
  config: DsConfig | null;
  diagnostics: Diagnostics;
  sources: SourceFile[];
}
```

Every `return { ir: null, diagnostics: diag, sources }` in `buildIR` becomes `return { ir: null, config, diagnostics: diag, sources }` (with `config: null` on the DS-E001 path before `config` exists), and the success return adds `config`. Import the `DsConfig` type.

- [ ] **Step 6: Create `src/targets/plugin.ts`**

```ts
import { resolve } from 'node:path';
import type { DsConfig } from '../config.js';
import type { Diagnostics } from '../errors.js';
import type { ComponentIR, DesignIR } from '../ir/types.js';

/** One output file. `path` is relative to the target's outDir, forward slashes. */
export interface GeneratedFile {
  path: string;
  contents: string;
}

export interface PluginContext {
  /** Absolute path of the source root (the directory holding ds.config.json). */
  rootDir: string;
  config: DsConfig;
  compilerVersion: string;
  /** Absolute path where this target's files are written. */
  outDir: string;
}

export type CoverageStatus = 'supported' | 'partial' | 'unmapped' | 'excluded';

export interface CoverageEntry {
  component: string;
  target: string;
  status: CoverageStatus;
  /** For `excluded`: the manifest's reason. */
  reason?: string;
  /** For `partial`: properties the manifest tells the target to ignore. */
  ignored?: string[];
  /** Properties used by the component that the target has no handler for and that are not ignored. */
  unsupported?: string[];
}

export interface TargetPlugin<Catalog = unknown> {
  id: string;
  /** Pure function of its inputs; byte-identical output across machines. */
  generate(ir: DesignIR, catalog: Catalog | null, ctx: PluginContext): GeneratedFile[];
  /** Parses generated output back into an IR for round-trip comparison. Reports problems on `diag` and returns null when it cannot produce an IR. */
  reparse(
    files: GeneratedFile[],
    ir: DesignIR,
    ctx: PluginContext,
    diag: Diagnostics,
  ): DesignIR | null;
  coverage(ir: DesignIR): CoverageEntry[];
  /** True when the manifest maps this component to the target (an entry exists and is not excluded). */
  isMapped(component: ComponentIR): boolean;
  /** Properties the manifest tells this target to ignore for the component. */
  ignoredProperties(component: ComponentIR): ReadonlySet<string>;
}

/** Absolute output directory for a target: the config override or `../styles-<id>/src/generated`. */
export function outDirFor(rootDir: string, config: DsConfig, id: string): string {
  const configured = config.targets[id]?.outDir;
  return resolve(rootDir, configured ?? `../styles-${id}/src/generated`);
}

export function pluginContext(
  rootDir: string,
  config: DsConfig,
  compilerVersion: string,
  id: string,
): PluginContext {
  return { rootDir, config, compilerVersion, outDir: outDirFor(rootDir, config, id) };
}
```

- [ ] **Step 7: Create `src/targets/hints.ts`**

```ts
import { z } from 'zod';
import { PROPERTY_TABLE } from '../components/properties.js';

/** Every target id the manifest knows about, implemented or not. */
export const TARGET_IDS = ['tailwind', 'mui', 'flutter'] as const;
export type TargetId = (typeof TARGET_IDS)[number];

const propertyName = z
  .string()
  .refine(
    (p) => Object.hasOwn(PROPERTY_TABLE, p),
    'must be a property from the compiler property table',
  );

/** `targets.tailwind` hints. */
export const tailwindHintsSchema = z.strictObject({
  /** Properties the Tailwind output omits for this component (coverage reports `partial`). */
  ignore: z.array(propertyName).min(1).optional(),
});

/** Until their plugins land, mui and flutter accept any object, except a malformed `excluded`. */
const permissiveHints = z
  .record(z.string(), z.unknown())
  .refine(
    (o) => !Object.hasOwn(o, 'excluded'),
    'excluded must be a non-empty string',
  );

export const TARGET_HINT_SCHEMAS: Record<TargetId, z.ZodType> = {
  tailwind: tailwindHintsSchema,
  mui: permissiveHints,
  flutter: permissiveHints,
};

export const excludedSchema = z.strictObject({ excluded: z.string().min(1) });

function hintsOrExcluded(hints: z.ZodType): z.ZodType {
  return z.union([excludedSchema, hints]);
}

/** Unknown target ids are allowed and get the permissive shape, so a manifest can be written ahead of a plugin. */
export const targetsSchema = z
  .object({
    tailwind: hintsOrExcluded(TARGET_HINT_SCHEMAS.tailwind).optional(),
    mui: hintsOrExcluded(TARGET_HINT_SCHEMAS.mui).optional(),
    flutter: hintsOrExcluded(TARGET_HINT_SCHEMAS.flutter).optional(),
  })
  .catchall(hintsOrExcluded(permissiveHints));
```

- [ ] **Step 8: Use `targetsSchema` in the manifest**

In `src/components/manifest.ts`, delete the local `excludedSchema` and `targetHintsSchema` definitions, import `targetsSchema` from `../targets/hints.js`, and set:

```ts
  targets: targetsSchema.default({}),
```

The `Manifest` type keeps `targets: ManifestTargets`. `flattenIssues` already descends into unions, so a bad `ignore` entry produces `targets.tailwind.ignore.0: must be a property from the compiler property table` and the test's `toContain('targets.tailwind.ignore')` passes. Regenerate the JSON schema: `npm run schema` from the package; the `schemas/manifest.schema.json` drift test must pass. Note in the plan follow-ups that the emitted schema no longer enforces property names inside `ignore` (refine is not expressible), the same safe direction as before.

- [ ] **Step 9: Create `src/targets/index.ts`**

```ts
import type { TargetPlugin } from './plugin.js';

/** Implemented target plugins by id. Task 4 registers the Tailwind plugin. */
export const TARGETS: Readonly<Record<string, TargetPlugin>> = {};

export function getTarget(id: string): TargetPlugin | null {
  return Object.hasOwn(TARGETS, id) ? TARGETS[id] : null;
}

export function targetIds(): string[] {
  return Object.keys(TARGETS).sort();
}
```

- [ ] **Step 10: `KNOWN_TARGETS` comes from hints**

In `src/scaffold/component.ts`, replace `export const KNOWN_TARGETS = ['tailwind', 'mui', 'flutter'] as const;` with:

```ts
import { TARGET_IDS } from '../targets/hints.js';

export const KNOWN_TARGETS = TARGET_IDS;
```

- [ ] **Step 11: Run all tests, typecheck, lint, format**

```bash
npx vitest run
npm run typecheck
npm run lint
npm run format
```

Expected: all green. Fix `DsConfig` literals in tests that the typecheck reports.

- [ ] **Step 12: Checkpoint**

Report: `src/version.ts`, `src/targets/{plugin,hints,index}.ts`, `test/targets-hints.test.ts` created; `config.ts`, `ir/types.ts`, `build.ts`, `components/manifest.ts`, `scaffold/component.ts`, `cli.ts`, `schemas/manifest.schema.json`, and the touched tests modified.

---

## Task 2: Tailwind variable names and value rendering

**Files:**
- Create: `packages/ds-compiler/src/targets/tailwind/names.ts`
- Create: `packages/ds-compiler/src/targets/tailwind/values.ts`
- Test: `packages/ds-compiler/test/tailwind-names.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import {
  TAILWIND_NAMESPACES,
  sourceNameFromTailwind,
  tailwindVarName,
} from '../src/targets/tailwind/names.js';
import {
  renderColor,
  renderDimension,
  renderTokenValue,
} from '../src/targets/tailwind/values.js';

describe('tailwind variable names', () => {
  it('maps namespaced categories and keeps the source name for the rest', () => {
    expect(tailwindVarName('color', ['text', 'default'], 'fx')).toBe('--color-fx-text-default');
    expect(tailwindVarName('space', ['2'], 'fx')).toBe('--spacing-fx-2');
    expect(tailwindVarName('font-family', ['body'], 'fx')).toBe('--font-fx-body');
    expect(tailwindVarName('font-size', ['md'], 'fx')).toBe('--text-fx-md');
    expect(tailwindVarName('font-weight', ['semibold'], 'fx')).toBe('--font-weight-fx-semibold');
    expect(tailwindVarName('line-height', ['tight'], 'fx')).toBe('--leading-fx-tight');
    expect(tailwindVarName('letter-spacing', ['tight'], 'fx')).toBe('--tracking-fx-tight');
    expect(tailwindVarName('shadow', ['sm'], 'fx')).toBe('--shadow-fx-sm');
    expect(tailwindVarName('easing', ['standard'], 'fx')).toBe('--ease-fx-standard');
    expect(tailwindVarName('duration', ['fast'], 'fx')).toBe('--fx-duration-fast');
    expect(tailwindVarName('border-width', ['1'], 'fx')).toBe('--fx-border-width-1');
    expect(tailwindVarName('size', ['control', 'md'], 'fx')).toBe('--fx-size-control-md');
    expect(Object.keys(TAILWIND_NAMESPACES)).toHaveLength(10);
  });

  it('inverts every name, preferring the longest namespace', () => {
    expect(sourceNameFromTailwind('--color-fx-text-default', 'fx')).toBe('--fx-color-text-default');
    expect(sourceNameFromTailwind('--font-weight-fx-semibold', 'fx')).toBe('--fx-font-weight-semibold');
    expect(sourceNameFromTailwind('--font-fx-weight-x', 'fx')).toBe('--fx-font-family-weight-x');
    expect(sourceNameFromTailwind('--text-fx-md', 'fx')).toBe('--fx-font-size-md');
    expect(sourceNameFromTailwind('--fx-duration-fast', 'fx')).toBe('--fx-duration-fast');
    expect(sourceNameFromTailwind('--color-other-x', 'fx')).toBeNull();
    expect(sourceNameFromTailwind('--tw-something', 'fx')).toBeNull();
  });
});

describe('value rendering', () => {
  const refName = (id: string): string => `--ref-${id}`;

  it('renders colors compactly and dimensions with units', () => {
    expect(renderColor('#1863d3ff')).toBe('#1863d3');
    expect(renderColor('#00000033')).toBe('#00000033');
    expect(renderDimension({ value: 0, unit: 'px' })).toBe('0px');
    expect(renderDimension({ value: 0.5, unit: 'rem' })).toBe('0.5rem');
  });

  it('renders every token type', () => {
    expect(renderTokenValue({ hex: '#ffffffff' }, 'color', refName)).toBe('#ffffff');
    expect(renderTokenValue({ value: 8, unit: 'px' }, 'dimension', refName)).toBe('8px');
    expect(
      renderTokenValue({ families: ['Open Sans', 'Arial', 'sans-serif'] }, 'fontFamily', refName),
    ).toBe("'Open Sans', Arial, sans-serif");
    expect(renderTokenValue({ weight: 600 }, 'fontWeight', refName)).toBe('600');
    expect(renderTokenValue({ value: 1.5 }, 'number', refName)).toBe('1.5');
    expect(renderTokenValue({ ms: 150 }, 'duration', refName)).toBe('150ms');
    expect(renderTokenValue({ points: [0.4, 0, 0.2, 1] }, 'cubicBezier', refName)).toBe(
      'cubic-bezier(0.4, 0, 0.2, 1)',
    );
    expect(renderTokenValue({ layers: [] }, 'shadow', refName)).toBe('none');
    expect(
      renderTokenValue(
        {
          layers: [
            {
              inset: false,
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 1, unit: 'px' },
              blur: { value: 2, unit: 'px' },
              spread: { value: 0, unit: 'px' },
              color: { hex: '#00000033' },
            },
            {
              inset: true,
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 0, unit: 'px' },
              blur: { value: 0, unit: 'px' },
              spread: { value: 2, unit: 'px' },
              color: { ref: 'color.focus.ring' },
            },
          ],
        },
        'shadow',
        refName,
      ),
    ).toBe('0px 1px 2px 0px #00000033, inset 0px 0px 0px 2px var(--ref-color.focus.ring)');
  });

  it('quotes font families that are not plain identifiers', () => {
    expect(renderTokenValue({ families: ["Bob's Font", 'serif'] }, 'fontFamily', refName)).toBe(
      "'Bob\\'s Font', serif",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/tailwind-names.test.ts`
Expected: FAIL, cannot resolve `../src/targets/tailwind/names.js`.

- [ ] **Step 3: Create `src/targets/tailwind/names.ts`**

```ts
import type { TokenCategory } from '../../tokens/categories.js';

/** Token categories that map onto a Tailwind v4 theme namespace. Others keep their source name. */
export const TAILWIND_NAMESPACES: Readonly<Partial<Record<TokenCategory, string>>> = {
  color: 'color',
  space: 'spacing',
  radius: 'radius',
  'font-family': 'font',
  'font-size': 'text',
  'font-weight': 'font-weight',
  'line-height': 'leading',
  'letter-spacing': 'tracking',
  shadow: 'shadow',
  easing: 'ease',
};

/** `--<ns>-<prefix>-<path>` for namespaced categories, otherwise `--<prefix>-<category>-<path>`. */
export function tailwindVarName(
  category: TokenCategory,
  path: readonly string[],
  prefix: string,
): string {
  const ns = TAILWIND_NAMESPACES[category];
  const tail = path.join('-');
  return ns ? `--${ns}-${prefix}-${tail}` : `--${prefix}-${category}-${tail}`;
}

/** Namespace prefixes longest first, so `--font-weight-` wins over `--font-`. */
const INVERSE: ReadonlyArray<[string, TokenCategory]> = (
  Object.entries(TAILWIND_NAMESPACES) as [TokenCategory, string][]
)
  .map(([category, ns]): [string, TokenCategory] => [ns, category])
  .sort((a, b) => b[0].length - a[0].length || (a[0] < b[0] ? -1 : 1));

/**
 * Inverse of tailwindVarName. Returns the source custom-property name, or null
 * when the name is neither a namespaced token nor a source-named one.
 */
export function sourceNameFromTailwind(name: string, prefix: string): string | null {
  for (const [ns, category] of INVERSE) {
    const head = `--${ns}-${prefix}-`;
    if (name.startsWith(head) && name.length > head.length) {
      return `--${prefix}-${category}-${name.slice(head.length)}`;
    }
  }
  const sourceHead = `--${prefix}-`;
  if (name.startsWith(sourceHead) && name.length > sourceHead.length) {
    return name;
  }
  return null;
}
```

- [ ] **Step 4: Create `src/targets/tailwind/values.ts`**

```ts
import type { TokenId } from '../../ir/types.js';
import type {
  DimensionValue,
  FontFamilyValue,
  ShadowValue,
  TokenType,
  TokenValue,
} from '../../tokens/values.js';

/** `#rrggbb` when fully opaque, otherwise `#rrggbbaa`. Input is always `#rrggbbaa`. */
export function renderColor(hex: string): string {
  return hex.length === 9 && hex.endsWith('ff') ? hex.slice(0, 7) : hex;
}

export function renderDimension(d: DimensionValue): string {
  return `${d.value}${d.unit}`;
}

const PLAIN_FAMILY = /^[a-zA-Z][a-zA-Z0-9-]*$/;

function renderFamily(name: string): string {
  if (PLAIN_FAMILY.test(name)) {
    return name;
  }
  return `'${name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export function renderFontFamily(v: FontFamilyValue): string {
  return v.families.map(renderFamily).join(', ');
}

export function renderShadow(v: ShadowValue, refName: (id: TokenId) => string): string {
  if (v.layers.length === 0) {
    return 'none';
  }
  return v.layers
    .map((l) => {
      const color = 'hex' in l.color ? renderColor(l.color.hex) : `var(${refName(l.color.ref)})`;
      const parts = [
        renderDimension(l.offsetX),
        renderDimension(l.offsetY),
        renderDimension(l.blur),
        renderDimension(l.spread),
        color,
      ];
      return (l.inset ? ['inset', ...parts] : parts).join(' ');
    })
    .join(', ');
}

/**
 * CSS text for a resolved token value. `refName` maps a token id to the variable
 * name a shadow layer's color reference should use.
 */
export function renderTokenValue(
  value: TokenValue,
  type: TokenType,
  refName: (id: TokenId) => string,
): string {
  switch (type) {
    case 'color':
      return renderColor((value as { hex: string }).hex);
    case 'dimension':
      return renderDimension(value as DimensionValue);
    case 'fontFamily':
      return renderFontFamily(value as FontFamilyValue);
    case 'fontWeight':
      return String((value as { weight: number }).weight);
    case 'number':
      return String((value as { value: number }).value);
    case 'duration':
      return `${(value as { ms: number }).ms}ms`;
    case 'cubicBezier': {
      const [a, b, c, d] = (value as { points: [number, number, number, number] }).points;
      return `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
    }
    case 'shadow':
      return renderShadow(value as ShadowValue, refName);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run test/tailwind-names.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 6: Checkpoint**

Report: `src/targets/tailwind/{names,values}.ts` and `test/tailwind-names.test.ts` created.

---

## Task 3: Shared selector rendering, `DS-W003`, and `scaffold --root-element`

**Files:**
- Create: `packages/ds-compiler/src/components/render-selector.ts`
- Modify: `packages/ds-compiler/src/components/parse-component.ts`
- Modify: `packages/ds-compiler/src/errors.ts`
- Modify: `packages/ds-compiler/src/scaffold/component.ts`
- Modify: `packages/ds-compiler/src/cli.ts`
- Test: `packages/ds-compiler/test/render-selector.test.ts`, `test/parse-component.test.ts`, `test/scaffold.test.ts`, `test/cli.test.ts`

- [ ] **Step 1: Write the failing tests**

`test/render-selector.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  FORM_CONTROL_ELEMENTS,
  renderRuleSelector,
  stateSelector,
} from '../src/components/render-selector.js';

describe('stateSelector', () => {
  it('renders pseudo, aria, custom, and element-dependent disabled states', () => {
    expect(stateSelector('hover', 'div')).toBe(':hover');
    expect(stateSelector('focus-visible', 'div')).toBe(':focus-visible');
    expect(stateSelector('pressed', 'div')).toBe('[aria-pressed="true"]');
    expect(stateSelector('open', 'div')).toBe('[data-state="open"]');
    expect(stateSelector('disabled', 'button')).toBe(':disabled');
    expect(stateSelector('disabled', 'input')).toBe(':disabled');
    expect(stateSelector('disabled', 'div')).toBe('[aria-disabled="true"]');
    expect(stateSelector('disabled', 'a')).toBe('[aria-disabled="true"]');
    expect(stateSelector('constructor', 'div')).toBe('[data-state="constructor"]');
    expect(FORM_CONTROL_ELEMENTS.has('textarea')).toBe(true);
  });
});

describe('renderRuleSelector', () => {
  const target = { name: 'button', rootElement: 'button' };

  it('renders root, axes in alphabetical order, states in rule order, and slots', () => {
    expect(renderRuleSelector('fx', target, { slot: 'root', axes: {}, states: [] })).toBe(
      '.fx-button',
    );
    expect(
      renderRuleSelector('fx', target, {
        slot: 'root',
        axes: { variant: 'outline', size: 'sm' },
        states: ['hover', 'disabled'],
      }),
    ).toBe('.fx-button[data-size="sm"][data-variant="outline"]:hover:disabled');
    expect(
      renderRuleSelector('fx', target, { slot: 'icon', axes: { size: 'sm' }, states: [] }),
    ).toBe('.fx-button[data-size="sm"] .fx-button__icon');
    expect(
      renderRuleSelector('fx', { name: 'card', rootElement: 'div' }, {
        slot: 'root',
        axes: {},
        states: ['disabled'],
      }),
    ).toBe('.fx-card[aria-disabled="true"]');
  });
});
```

Add to `test/parse-component.test.ts` (use that file's existing helpers for building a manifest, tokens, and config; the shape below names the pieces you need):

```ts
  it('warns DS-W003 when :disabled or [disabled] is used on a non-form root', () => {
    const manifest = manifestFor({ states: ['disabled'], slots: { root: { element: 'div' } } });
    const warn = new Diagnostics();
    parseComponentCss('src/components/x/x.css', `.fx-x:disabled { opacity: 0.4; }\n.fx-x[disabled] { opacity: 0.4; }`, manifest, tokens, config, warn);
    expect(warn.warnings.map((d) => d.code)).toEqual(['DS-W003', 'DS-W003']);
    expect(warn.errors).toEqual([]);

    const aria = new Diagnostics();
    parseComponentCss('src/components/x/x.css', `.fx-x[aria-disabled="true"] { opacity: 0.4; }`, manifest, tokens, config, aria);
    expect(aria.items).toEqual([]);

    const button = manifestFor({ states: ['disabled'], slots: { root: { element: 'button' } } });
    const ok = new Diagnostics();
    parseComponentCss('src/components/x/x.css', `.fx-x:disabled { opacity: 0.4; }`, button, tokens, config, ok);
    expect(ok.items).toEqual([]);
  });
```

In `test/scaffold.test.ts`:

- In the `opts` object used by the component tests, add `rootElement: 'button'` so the existing cascade-order expectation `.fx-button:disabled` still holds.
- Add:

```ts
  it('renders disabled by root element and validates --root-element', () => {
    const div = renderComponentCss('tag', { axes: {}, states: ['disabled'], slots: [] }, config);
    expect(div).toContain('.fx-tag[aria-disabled="true"] {');
    const manifest = JSON.parse(
      renderComponentManifest('tag', { axes: {}, states: [], slots: [], rootElement: 'button' }, config),
    ) as { slots: { root: { element: string } } };
    expect(manifest.slots.root.element).toBe('button');
    expect(() =>
      renderComponentManifest('tag', { axes: {}, states: [], slots: [], rootElement: 'Div' }, config),
    ).toThrow(/root element/);
  });
```

In `test/cli.test.ts`, extend the plain scaffold-component test: pass `'--root-element', 'button'` and assert the written CSS contains `.fx-button:disabled`; add a case that `--root-element 'Bad Element'` exits 1.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/render-selector.test.ts test/parse-component.test.ts test/scaffold.test.ts test/cli.test.ts`
Expected: FAIL; `render-selector.js` cannot be resolved; no `DS-W003` in the catalog; `rootElement` is not an option.

- [ ] **Step 3: Create `src/components/render-selector.ts`**

```ts
import type { Rule } from '../ir/types.js';
import { ARIA_TRUE_STATES, PSEUDO_STATES } from './states.js';

/** Elements that `:disabled` and `[disabled]` can match. */
export const FORM_CONTROL_ELEMENTS: ReadonlySet<string> = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'fieldset',
  'option',
  'optgroup',
]);

/** state name -> pseudo-class name (without the colon). */
const PSEUDO_BY_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(PSEUDO_STATES).map(([pseudo, state]) => [state, pseudo]),
);
/** state name -> aria attribute name. */
const ARIA_ATTR_BY_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(ARIA_TRUE_STATES).map(([attr, state]) => [state, attr]),
);

/**
 * Canonical selector fragment for a state. `disabled` depends on the root
 * element: form controls use `:disabled`; anything else uses
 * `[aria-disabled="true"]`, which is the only form that can match.
 */
export function stateSelector(state: string, rootElement: string): string {
  if (state === 'disabled') {
    return FORM_CONTROL_ELEMENTS.has(rootElement)
      ? ':disabled'
      : '[aria-disabled="true"]';
  }
  if (Object.hasOwn(PSEUDO_BY_STATE, state)) {
    return `:${PSEUDO_BY_STATE[state]}`;
  }
  if (Object.hasOwn(ARIA_ATTR_BY_STATE, state)) {
    return `[${ARIA_ATTR_BY_STATE[state]}="true"]`;
  }
  return `[data-state="${state}"]`;
}

export interface SelectorTarget {
  name: string;
  rootElement: string;
}

/**
 * Canonical selector for a rule: root class, axis attributes in alphabetical
 * axis order (independent of manifest order, so generation from the in-memory
 * IR and from design.ir.json agree), states in the rule's canonical order,
 * then the slot class after one descendant space.
 */
export function renderRuleSelector(
  prefix: string,
  target: SelectorTarget,
  rule: Pick<Rule, 'slot' | 'axes' | 'states'>,
): string {
  const root = `.${prefix}-${target.name}`;
  const axes = Object.keys(rule.axes)
    .sort()
    .map((axis) => `[data-${axis}="${rule.axes[axis]}"]`)
    .join('');
  const states = rule.states
    .map((state) => stateSelector(state, target.rootElement))
    .join('');
  const compound = `${root}${axes}${states}`;
  return rule.slot === 'root' ? compound : `${compound} ${root}__${rule.slot}`;
}
```

- [ ] **Step 4: Add `DS-W003` and emit it from the component parser**

In `src/errors.ts`, after `DS-W002`:

```ts
  'DS-W003': {
    title: 'Disabled state on a non-form root',
    hint: '`:disabled` and `[disabled]` only match form controls (button, input, select, textarea). Set slots.root.element to a form control in the manifest, or write the state as [aria-disabled="true"].',
  },
```

In `src/components/parse-component.ts`, import `FORM_CONTROL_ELEMENTS` from `./render-selector.js`. Where a rule's selector has been parsed successfully (right after the `parseSelector(...)` call succeeds and before declarations are processed), add:

```ts
      const rootElement = manifest.slots.root?.element ?? 'div';
      if (
        !FORM_CONTROL_ELEMENTS.has(rootElement) &&
        /:disabled\b|\[\s*disabled\s*\]/.test(node.selector)
      ) {
        diag.add(
          'DS-W003',
          `"${node.selector}" uses :disabled or [disabled], but the root element is <${rootElement}>, which can never be disabled`,
          locationOf(cssPath, node),
        );
      }
```

(`locationOf` is the helper the file already uses for rule locations; keep whatever name it has.)

- [ ] **Step 5: Scaffold uses the shared renderer and gains `rootElement`**

In `src/scaffold/component.ts`:

- Delete the private `PSEUDO_BY_STATE`, `ARIA_ATTR_BY_STATE`, and `stateSelector`, and the `ARIA_TRUE_STATES`/`PSEUDO_STATES` import. Import `{ stateSelector } from '../components/render-selector.js'`.
- Extend the options:

```ts
export interface ComponentScaffoldOptions {
  /** axis name -> values; the first value becomes the default. */
  axes: Record<string, string[]>;
  states: string[];
  /** Slot names other than root. */
  slots: string[];
  /** HTML element of the root slot. Default "div". */
  rootElement?: string;
}

const ELEMENT_NAME = /^[a-z][a-z0-9-]*$/;

function rootElementOf(opts: ComponentScaffoldOptions): string {
  const element = opts.rootElement ?? 'div';
  if (!ELEMENT_NAME.test(element)) {
    throw new ScaffoldError(
      `root element "${element}" must be a lowercase HTML element name`,
    );
  }
  return element;
}
```

- In `validate`, call `rootElementOf(opts)` so invalid elements fail early.
- In `renderComponentManifest`, `root: { element: rootElementOf(opts) }`.
- In `renderComponentCss`, `const rootElement = rootElementOf(opts);` and `stateSelector(state, rootElement)` in the state loop.

In `src/cli.ts`, add to `scaffold component`:

```ts
  .option('--root-element <element>', 'HTML element of the root slot', 'div')
```

and pass `rootElement: opts.rootElement` into `options` (extend the action's `opts` type with `rootElement: string`).

- [ ] **Step 6: Run everything**

```bash
npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore
npx vitest run
npm run typecheck
npm run lint
npm run format
```

Expected: all green.

- [ ] **Step 7: Checkpoint**

Report: `src/components/render-selector.ts`, `test/render-selector.test.ts` created; `parse-component.ts`, `errors.ts`, `scaffold/component.ts`, `cli.ts`, and three test files modified.

---

## Task 4: Tailwind generation

**Files:**
- Create: `packages/ds-compiler/src/targets/tailwind/render.ts`
- Create: `packages/ds-compiler/src/targets/tailwind/hints.ts`
- Create: `packages/ds-compiler/test/tailwind-fixture.ts`
- Test: `packages/ds-compiler/test/tailwind-generate.test.ts`

- [ ] **Step 1: Write the shared test fixture**

`test/tailwind-fixture.ts` (a small source root that exercises aliases, modes, shadows with a color reference, shorthand expansion, states, axes, slots, and every coverage status):

```ts
import { join } from 'node:path';
import { buildIR } from '../src/build.js';
import type { DsConfig } from '../src/config.js';
import type { DesignIR } from '../src/ir/types.js';
import type { PluginContext } from '../src/targets/plugin.js';
import { makeRoot, withEntry } from './helpers.js';

export const TW_CONFIG = JSON.stringify({
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light', 'dark'],
  defaultMode: 'light',
  targets: { tailwind: { outDir: 'out/tailwind' } },
  coverageFile: 'out/coverage.md',
});

function manifest(extra: Record<string, unknown>): string {
  return JSON.stringify({ displayName: 'X', baseline: false, ...extra });
}

export const TW_FILES: Record<string, string> = {
  'ds.config.json': TW_CONFIG,
  'src/tokens/color.css': [
    ':root {',
    '  --fx-color-neutral-900: #111111;',
    '  --fx-color-text-default: var(--fx-color-neutral-900);',
    '}',
    ':root[data-fx-theme="dark"] {',
    '  --fx-color-text-default: #ffffff;',
    '}',
    '',
  ].join('\n'),
  'src/tokens/space.css': ':root {\n  --fx-space-2: 8px;\n}\n',
  'src/tokens/font-family.css':
    ":root {\n  --fx-font-family-body: 'Open Sans', Arial, sans-serif;\n}\n",
  'src/tokens/shadow.css':
    ':root {\n  --fx-shadow-focus: 0 0 0 2px var(--fx-color-neutral-900);\n}\n',
  'src/components/chip/chip.manifest.json': manifest({
    name: 'chip',
    displayName: 'Chip',
    axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
    states: ['hover', 'disabled'],
    slots: { root: { element: 'button' }, icon: { element: 'span' } },
    targets: { tailwind: {} },
  }),
  'src/components/chip/chip.css': [
    '.fx-chip {',
    '  display: inline-flex;',
    '  padding: var(--fx-space-2);',
    '  color: var(--fx-color-text-default);',
    '  font-family: var(--fx-font-family-body);',
    '}',
    '.fx-chip:hover {',
    '  box-shadow: var(--fx-shadow-focus);',
    '}',
    '.fx-chip:disabled {',
    '  opacity: 0.4;',
    '}',
    '.fx-chip[data-tone="loud"] {',
    '  min-width: 44px;',
    '}',
    '.fx-chip .fx-chip__icon {',
    '  width: 20px;',
    '}',
    '',
  ].join('\n'),
  // div root: disabled must render as [aria-disabled="true"]; opacity is ignored for tailwind
  'src/components/tag/tag.manifest.json': manifest({
    name: 'tag',
    states: ['disabled'],
    targets: { tailwind: { ignore: ['opacity'] } },
  }),
  'src/components/tag/tag.css':
    '.fx-tag {\n  display: inline-block;\n  opacity: 0.4;\n}\n.fx-tag[aria-disabled="true"] {\n  opacity: 0.4;\n}\n',
  'src/components/pill/pill.manifest.json': manifest({
    name: 'pill',
    targets: { tailwind: { excluded: 'starter content' } },
  }),
  'src/components/pill/pill.css': '.fx-pill {\n  display: inline-block;\n}\n',
};

/** Same as TW_FILES but every component is mapped for tailwind (no unmapped ones). */
export function twRoot(extraFiles: Record<string, string> = {}): string {
  return withEntry(makeRoot({ ...TW_FILES, ...extraFiles }));
}

export function twBuild(root: string): { ir: DesignIR; config: DsConfig } {
  const result = buildIR(root);
  if (!result.ir || !result.config) {
    throw new Error(
      `fixture did not build: ${result.diagnostics.errors.map((d) => `${d.code} ${d.message}`).join('; ')}`,
    );
  }
  return { ir: result.ir, config: result.config };
}

export function twContext(root: string, config: DsConfig): PluginContext {
  return {
    rootDir: root,
    config,
    compilerVersion: '0.0.0-test',
    outDir: join(root, 'out', 'tailwind'),
  };
}

/** Drops the one-line header and the blank line after it. */
export function body(text: string): string {
  return text.slice(text.indexOf('\n') + 2);
}
```

(`buildIR` must return `config` on `BuildResult`; Task 1 adds it. `withEntry` is in `test/helpers.ts` from Plan 1.)

- [ ] **Step 2: Write the failing test**

`test/tailwind-generate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  generateTailwind,
  renderComponents,
  renderTheme,
  tailwindHeader,
} from '../src/targets/tailwind/render.js';
import {
  ignoredForTailwind,
  isMappedForTailwind,
} from '../src/targets/tailwind/hints.js';
import { TW_CONFIG, body, twBuild, twContext, twRoot } from './tailwind-fixture.js';

const EXPECTED_THEME = `@theme static {
  --color-fx-neutral-900: #111111;
  --color-fx-text-default: var(--color-fx-neutral-900);
  --font-fx-body: 'Open Sans', Arial, sans-serif;
  --shadow-fx-focus: 0px 0px 0px 2px var(--color-fx-neutral-900);
  --spacing-fx-2: 8px;
}

:root[data-fx-theme="dark"] {
  --color-fx-text-default: #ffffff;
}
`;

const EXPECTED_COMPONENTS = `@layer components {
  .fx-chip {
    color: var(--color-fx-text-default);
    display: inline-flex;
    font-family: var(--font-fx-body);
    padding-bottom: var(--spacing-fx-2);
    padding-left: var(--spacing-fx-2);
    padding-right: var(--spacing-fx-2);
    padding-top: var(--spacing-fx-2);
  }

  .fx-chip:hover {
    box-shadow: var(--shadow-fx-focus);
  }

  .fx-chip:disabled {
    opacity: 0.4;
  }

  .fx-chip[data-tone="loud"] {
    min-width: 44px;
  }

  .fx-chip .fx-chip__icon {
    width: 20px;
  }

  .fx-tag {
    display: inline-block;
  }
}
`;

describe('tailwind generation', () => {
  const root = twRoot();
  const { ir, config } = twBuild(root);
  const ctx = twContext(root, config);

  it('renders the theme with namespaced variables, aliases, and a mode block', () => {
    const theme = renderTheme(ir, ctx);
    expect(theme.split('\n')[0]).toBe(tailwindHeader(ir, ctx));
    expect(theme.split('\n')[0]).toContain('0.0.0-test');
    expect(theme.split('\n')[0]).toContain(ir.meta.sourceHash);
    expect(body(theme)).toBe(EXPECTED_THEME);
  });

  it('renders components in cascade order, sorted declarations, and drops ignored, excluded, and empty rules', () => {
    expect(body(renderComponents(ir, ctx))).toBe(EXPECTED_COMPONENTS);
  });

  it('renders disabled by root element', () => {
    const divRoot = twRoot({
      'src/components/tag/tag.css':
        '.fx-tag {\n  display: inline-block;\n}\n.fx-tag[aria-disabled="true"] {\n  display: none;\n}\n',
    });
    const built = twBuild(divRoot);
    expect(renderComponents(built.ir, twContext(divRoot, built.config))).toContain(
      '.fx-tag[aria-disabled="true"] {',
    );
  });

  it('produces three files deterministically', () => {
    const a = generateTailwind(ir, ctx);
    const b = generateTailwind(twBuild(root).ir, ctx);
    expect(a.map((f) => f.path)).toEqual(['components.css', 'index.css', 'theme.css']);
    expect(a).toEqual(b);
    const index = a.find((f) => f.path === 'index.css')!;
    expect(body(index.contents)).toBe("@import './theme.css';\n@import './components.css';\n");
  });

  it('refuses two tokens that map to one variable name', () => {
    const clash = twRoot({
      'ds.config.json': TW_CONFIG.replace('"prefix": "fx"', '"prefix": "weight"'),
      'src/tokens/color.css': ':root {\n  --weight-color-neutral-900: #111111;\n}\n',
      'src/tokens/space.css': ':root {\n  --weight-space-2: 8px;\n}\n',
      'src/tokens/shadow.css': ':root {\n  --weight-shadow-focus: 0 0 0 2px #111111;\n}\n',
      'src/tokens/font-family.css':
        ':root {\n  --weight-font-family-weight-x: serif;\n}\n',
      'src/tokens/font-weight.css': ':root {\n  --weight-font-weight-x: 600;\n}\n',
      'src/components/chip/chip.css': '.weight-chip {\n  display: inline-flex;\n}\n',
      'src/components/tag/tag.css': '.weight-tag {\n  display: inline-block;\n}\n',
      'src/components/pill/pill.css': '.weight-pill {\n  display: inline-block;\n}\n',
    });
    const built = twBuild(clash);
    expect(() => renderTheme(built.ir, twContext(clash, built.config))).toThrow(
      /both map to the Tailwind variable --font-weight-weight-x/,
    );
  });

  it('reads mapping and ignore hints', () => {
    expect(isMappedForTailwind(ir.components.chip)).toBe(true);
    expect(isMappedForTailwind(ir.components.pill)).toBe(false);
    expect([...ignoredForTailwind(ir.components.tag)]).toEqual(['opacity']);
    expect(ignoredForTailwind(ir.components.chip).size).toBe(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run test/tailwind-generate.test.ts`
Expected: FAIL, cannot resolve `../src/targets/tailwind/render.js`.

- [ ] **Step 4: Create `src/targets/tailwind/hints.ts`**

```ts
import type { ComponentIR } from '../../ir/types.js';

export const TAILWIND_ID = 'tailwind';

interface TailwindHints {
  ignore?: string[];
}

/** The manifest's `targets.tailwind` entry when it maps the component (present and not excluded). */
function mappedHints(component: ComponentIR): TailwindHints | null {
  const hints = component.targets[TAILWIND_ID];
  if (hints === undefined || typeof hints.excluded === 'string') {
    return null;
  }
  return hints as TailwindHints;
}

export function isMappedForTailwind(component: ComponentIR): boolean {
  return mappedHints(component) !== null;
}

export function ignoredForTailwind(component: ComponentIR): ReadonlySet<string> {
  return new Set(mappedHints(component)?.ignore ?? []);
}

/** The exclusion reason, or null when the component is not excluded. */
export function tailwindExclusion(component: ComponentIR): string | null {
  const hints = component.targets[TAILWIND_ID];
  return hints !== undefined && typeof hints.excluded === 'string'
    ? hints.excluded
    : null;
}
```

- [ ] **Step 5: Create `src/targets/tailwind/render.ts`**

```ts
import { renderRuleSelector } from '../../components/render-selector.js';
import type {
  ComponentIR,
  DesignIR,
  IRValue,
  Token,
  TokenId,
} from '../../ir/types.js';
import type { DimensionValue, TokenValue } from '../../tokens/values.js';
import type { GeneratedFile, PluginContext } from '../plugin.js';
import { ignoredForTailwind, isMappedForTailwind } from './hints.js';
import { tailwindVarName } from './names.js';
import { renderColor, renderDimension, renderTokenValue } from './values.js';

function codeUnitCompare(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

/** One line; every generated file starts with it, followed by a blank line. */
export function tailwindHeader(ir: DesignIR, ctx: PluginContext): string {
  return `/* Generated by @bwp-web/ds-compiler ${ctx.compilerVersion} for target tailwind from design.ir.json (source hash ${ir.meta.sourceHash}). Do not edit; run bwp-ds generate. */`;
}

/** Tailwind variable name for a token id. Throws on an unknown id (an IR invariant violation). */
export function varNameFor(ir: DesignIR, id: TokenId): string {
  const token = ir.tokens[id];
  if (!token) {
    throw new Error(`IR references unknown token "${id}"`);
  }
  return tailwindVarName(token.category, token.path, ir.meta.prefix);
}

function valueInMode(
  token: Token,
  mode: string,
): { value: TokenValue; alias: TokenId | undefined } {
  if (token.modeInvariant) {
    return { value: token.$value, alias: token.alias };
  }
  return { value: token.$value[mode], alias: token.alias?.[mode] };
}

function renderTokenLine(ir: DesignIR, id: TokenId, mode: string): string {
  const token = ir.tokens[id];
  const { value, alias } = valueInMode(token, mode);
  const text = alias
    ? `var(${varNameFor(ir, alias)})`
    : renderTokenValue(value, token.$type, (ref) => varNameFor(ir, ref));
  return `  ${varNameFor(ir, id)}: ${text};`;
}

/** Two tokens may render to one variable name (prefix "weight": font-family "weight-x" and font-weight "x"). Refuse rather than emit ambiguous output. */
function assertUniqueNames(ir: DesignIR, ids: readonly string[]): void {
  const seen = new Map<string, string>();
  for (const id of ids) {
    const name = varNameFor(ir, id);
    const other = seen.get(name);
    if (other !== undefined) {
      throw new Error(
        `tokens "${other}" and "${id}" both map to the Tailwind variable ${name}; rename one of them`,
      );
    }
    seen.set(name, id);
  }
}

export function renderTheme(ir: DesignIR, ctx: PluginContext): string {
  const ids = Object.keys(ir.tokens).sort(codeUnitCompare);
  assertUniqueNames(ir, ids);
  const lines = [
    tailwindHeader(ir, ctx),
    '',
    '@theme static {',
    ...ids.map((id) => renderTokenLine(ir, id, ir.meta.defaultMode)),
    '}',
  ];
  const varying = ids.filter((id) => !ir.tokens[id].modeInvariant);
  for (const mode of ir.meta.modes) {
    if (mode === ir.meta.defaultMode || varying.length === 0) {
      continue;
    }
    lines.push(
      '',
      `${ir.meta.modeSelector.replaceAll('{mode}', mode)} {`,
      ...varying.map((id) => renderTokenLine(ir, id, mode)),
      '}',
    );
  }
  return `${lines.join('\n')}\n`;
}

export function renderIRValue(ir: DesignIR, value: IRValue): string {
  if (value.kind === 'token') {
    return `var(${varNameFor(ir, value.ref)})`;
  }
  switch (value.type) {
    case 'dimension':
      return renderDimension(value.value as DimensionValue);
    case 'color':
      return renderColor(value.value as string);
    case 'number':
    case 'keyword':
    case 'string':
      return String(value.value);
  }
}

function renderComponent(ir: DesignIR, component: ComponentIR): string[] {
  const ignored = ignoredForTailwind(component);
  const target = {
    name: component.name,
    rootElement: component.slots.root?.element ?? 'div',
  };
  const blocks: string[] = [];
  for (const rule of component.rules) {
    const props = Object.keys(rule.declarations)
      .filter((p) => !ignored.has(p))
      .sort(codeUnitCompare);
    if (props.length === 0) {
      continue;
    }
    blocks.push(
      [
        `  ${renderRuleSelector(ir.meta.prefix, target, rule)} {`,
        ...props.map(
          (p) => `    ${p}: ${renderIRValue(ir, rule.declarations[p])};`,
        ),
        '  }',
      ].join('\n'),
    );
  }
  return blocks;
}

export function renderComponents(ir: DesignIR, ctx: PluginContext): string {
  const blocks = Object.keys(ir.components)
    .sort(codeUnitCompare)
    .filter((name) => isMappedForTailwind(ir.components[name]))
    .flatMap((name) => renderComponent(ir, ir.components[name]));
  return `${[tailwindHeader(ir, ctx), '', '@layer components {', blocks.join('\n\n'), '}'].join('\n')}\n`;
}

export function renderIndex(ir: DesignIR, ctx: PluginContext): string {
  return `${tailwindHeader(ir, ctx)}\n\n@import './theme.css';\n@import './components.css';\n`;
}

/** All Tailwind output files, sorted by path. */
export function generateTailwind(ir: DesignIR, ctx: PluginContext): GeneratedFile[] {
  return [
    { path: 'components.css', contents: renderComponents(ir, ctx) },
    { path: 'index.css', contents: renderIndex(ir, ctx) },
    { path: 'theme.css', contents: renderTheme(ir, ctx) },
  ];
}
```

Note on `renderComponents` with no blocks: the output is `@layer components {\n\n}` (an empty line inside). Keep it; `reparse` accepts an empty layer.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run test/tailwind-generate.test.ts`
Expected: PASS, 5 tests. If the component order or a declaration differs, check `sortRules` and the fixture before touching the expected strings: the expected text is derived from the compiler's documented cascade order.

- [ ] **Step 7: Run everything and checkpoint**

```bash
npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore
npx vitest run
npm run typecheck
npm run lint
npm run format
```

Report: `src/targets/tailwind/{hints,render}.ts`, `test/tailwind-fixture.ts`, `test/tailwind-generate.test.ts` created.

---

## Task 5: Tailwind round-trip: `reparse`, `diffIR`, and the registered plugin

**Files:**
- Create: `packages/ds-compiler/src/targets/tailwind/reparse.ts`
- Create: `packages/ds-compiler/src/targets/tailwind/index.ts`
- Create: `packages/ds-compiler/src/verify/ir-diff.ts`
- Modify: `packages/ds-compiler/src/targets/index.ts` (register the plugin)
- Modify: `packages/ds-compiler/src/errors.ts` (`DS-E081`)
- Test: `packages/ds-compiler/test/tailwind-roundtrip.test.ts`, `test/targets-hints.test.ts`

- [ ] **Step 1: Write the failing tests**

`test/tailwind-roundtrip.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildIR } from '../src/build.js';
import { Diagnostics } from '../src/errors.js';
import { TARGETS } from '../src/targets/index.js';
import { tailwindPlugin } from '../src/targets/tailwind/index.js';
import { manifestFromComponent } from '../src/targets/tailwind/reparse.js';
import { diffIR } from '../src/verify/ir-diff.js';
import { FIXTURE_MINI } from './helpers.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

function scopeFor(ir: ReturnType<typeof twBuild>['ir']) {
  return {
    components: Object.keys(ir.components).filter((n) =>
      tailwindPlugin.isMapped(ir.components[n]),
    ),
    ignored: (name: string) => tailwindPlugin.ignoredProperties(ir.components[name]),
  };
}

describe('tailwind round-trip', () => {
  it('is registered', () => {
    expect(Object.keys(TARGETS)).toEqual(['tailwind']);
    expect(TARGETS.tailwind).toBe(tailwindPlugin);
  });

  it('reparses its own output to the source IR on the small fixture', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const diag = new Diagnostics();
    const reparsed = tailwindPlugin.reparse(tailwindPlugin.generate(ir, null, ctx), ir, ctx, diag);
    expect(diag.items).toEqual([]);
    expect(reparsed).not.toBeNull();
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
    // tokens survive exactly, including per-mode aliases and shadow color refs
    expect(reparsed!.tokens['color.text.default']).toMatchObject({
      modeInvariant: false,
      alias: { light: 'color.neutral.900' },
    });
    expect(reparsed!.tokens['shadow.focus'].$value).toEqual(ir.tokens['shadow.focus'].$value);
    // excluded components are not part of the output
    expect(reparsed!.components.pill).toBeUndefined();
  });

  it('reparses the mini fixture to its source IR', () => {
    const result = buildIR(FIXTURE_MINI);
    const ir = result.ir!;
    const ctx = {
      rootDir: FIXTURE_MINI,
      config: result.config!,
      compilerVersion: '0.0.0-test',
      outDir: `${FIXTURE_MINI}out`,
    };
    const diag = new Diagnostics();
    const reparsed = tailwindPlugin.reparse(tailwindPlugin.generate(ir, null, ctx), ir, ctx, diag);
    expect(diag.items).toEqual([]);
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
  });

  it('reports a changed declaration, a missing token, and unknown variables', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx);
    const tampered = files.map((f) =>
      f.path === 'components.css'
        ? { ...f, contents: f.contents.replace('min-width: 44px;', 'min-width: 40px;') }
        : f.path === 'theme.css'
          ? { ...f, contents: f.contents.replace('  --spacing-fx-2: 8px;\n', '') }
          : f,
    );
    const diag = new Diagnostics();
    const reparsed = tailwindPlugin.reparse(tampered, ir, ctx, diag);
    // removing the space token makes the chip's four padding longhands unresolvable
    expect(diag.errors.length).toBeGreaterThan(0);
    expect(new Set(diag.errors.map((d) => d.code))).toEqual(new Set(['DS-E081']));
    expect(diag.errors[0].message).toContain('DS-E043');
    expect(reparsed).toBeNull();

    const onlyCss = files.map((f) =>
      f.path === 'components.css'
        ? { ...f, contents: f.contents.replace('min-width: 44px;', 'min-width: 40px;') }
        : f,
    );
    const d2 = new Diagnostics();
    const r2 = tailwindPlugin.reparse(onlyCss, ir, ctx, d2)!;
    const diffs = diffIR(ir, r2, scopeFor(ir));
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({
      kind: 'declaration',
      id: 'chip root[data-tone="loud"] min-width',
    });
    expect(diffs[0].location).toEqual(ir.components.chip.rules[3].source);

    const unknownVar = files.map((f) =>
      f.path === 'theme.css'
        ? { ...f, contents: f.contents.replace('--spacing-fx-2', '--tw-mystery') }
        : f,
    );
    const d3 = new Diagnostics();
    expect(tailwindPlugin.reparse(unknownVar, ir, ctx, d3)).toBeNull();
    expect(d3.errors[0].message).toContain('--tw-mystery');
  });

  it('builds a manifest from a component IR', () => {
    const { ir } = twBuild(twRoot());
    const m = manifestFromComponent(ir.components.chip);
    expect(m).toMatchObject({
      name: 'chip',
      displayName: 'Chip',
      baseline: false,
      axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
      states: ['hover', 'disabled'],
      slots: { root: { element: 'button', optional: false } },
      targets: { tailwind: {} },
    });
  });
});

describe('diffIR', () => {
  it('reports missing and extra rules and ignores ignored properties', () => {
    const { ir } = twBuild(twRoot());
    const clone = structuredClone(ir);
    clone.components.chip.rules = clone.components.chip.rules.slice(1);
    const extra = structuredClone(ir.components.chip.rules[0]);
    extra.states = ['hover', 'disabled'];
    clone.components.chip.rules.push(extra);
    const diffs = diffIR(ir, clone, { components: ['chip'], ignored: () => new Set() });
    expect(diffs.map((d) => `${d.kind} ${d.id} ${d.message}`)).toEqual([
      'rule chip root missing from the generated output',
      'rule chip root:hover:disabled present only in the generated output',
    ]);

    const trimmed = structuredClone(ir);
    delete trimmed.components.tag.rules[0].declarations.opacity;
    expect(
      diffIR(ir, trimmed, { components: ['tag'], ignored: () => new Set(['opacity']) }),
    ).toEqual([]);
    expect(
      diffIR(ir, trimmed, { components: ['tag'], ignored: () => new Set() }),
    ).toEqual([
      {
        kind: 'declaration',
        id: 'tag root opacity',
        message: 'missing from the generated output',
        location: ir.components.tag.rules[0].source,
      },
    ]);
  });

  it('compares tokens structurally, ignoring source locations', () => {
    const { ir } = twBuild(twRoot());
    const clone = structuredClone(ir);
    clone.tokens['space.2'].source = { file: 'elsewhere.css', line: 9, column: 9 };
    expect(diffIR(ir, clone, { components: [], ignored: () => new Set() })).toEqual([]);
    (clone.tokens['space.2'] as { $value: unknown }).$value = { value: 9, unit: 'px' };
    const diffs = diffIR(ir, clone, { components: [], ignored: () => new Set() });
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ kind: 'token', id: 'space.2' });
  });
});
```

In `test/targets-hints.test.ts`, replace the registry test with:

```ts
describe('target registry', () => {
  it('registers the tailwind plugin', () => {
    expect(Object.keys(TARGETS)).toEqual(['tailwind']);
    expect(getTarget('tailwind')?.id).toBe('tailwind');
    expect(getTarget('mui')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/tailwind-roundtrip.test.ts test/targets-hints.test.ts`
Expected: FAIL, cannot resolve `../src/targets/tailwind/index.js`.

- [ ] **Step 3: Add `DS-E081` to the catalog**

In `src/errors.ts`, after `DS-E070`:

```ts
  'DS-E081': {
    title: 'Round-trip mismatch',
    hint: 'The generated output does not re-parse to the source IR. This is a generator or reparser bug: fix the target plugin under packages/ds-compiler/src/targets/<id>/, never the output.',
  },
```

(`DS-E080`, `DS-E082`, and `DS-E083` are added in Task 7.)

- [ ] **Step 4: Create `src/verify/ir-diff.ts`**

```ts
import type { SourceLocation } from '../errors.js';
import { stableStringify } from '../ir/serialize.js';
import type { DesignIR, Rule } from '../ir/types.js';

export interface IRDifference {
  kind: 'token' | 'component' | 'rule' | 'declaration';
  /** Token id, component name, "<component> <rule key>", or "<component> <rule key> <property>". */
  id: string;
  message: string;
  /** Source location from the source IR when the source side exists. */
  location?: SourceLocation;
}

export interface DiffScope {
  /** Components the target claims to cover; others are not compared. */
  components: readonly string[];
  /** Properties the target ignores for a component; they may be absent from the reparsed IR. */
  ignored: (component: string) => ReadonlySet<string>;
}

function codeUnitCompare(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

/** Compact one-line JSON with sorted keys, for messages. */
function show(value: unknown): string {
  return stableStringify(value).replace(/\s+/g, ' ');
}

function withoutSource<T extends { source?: unknown }>(value: T): Omit<T, 'source'> {
  const { source: _source, ...rest } = value;
  return rest;
}

/** Slot, axes (alphabetical), and states, e.g. `root[data-size="sm"]:hover`. */
export function ruleDiffKey(rule: Pick<Rule, 'slot' | 'axes' | 'states'>): string {
  const axes = Object.keys(rule.axes)
    .sort(codeUnitCompare)
    .map((a) => `[data-${a}="${rule.axes[a]}"]`)
    .join('');
  const states = rule.states.map((s) => `:${s}`).join('');
  return `${rule.slot}${axes}${states}`;
}

/**
 * Structural comparison of two IRs: every token, and the rules of the
 * components in scope. Axes, states, and slots come from the manifest on both
 * sides and are not compared. `source` locations are ignored.
 */
export function diffIR(source: DesignIR, reparsed: DesignIR, scope: DiffScope): IRDifference[] {
  const out: IRDifference[] = [];

  const tokenIds = new Set([...Object.keys(source.tokens), ...Object.keys(reparsed.tokens)]);
  for (const id of [...tokenIds].sort(codeUnitCompare)) {
    const a = source.tokens[id];
    const b = reparsed.tokens[id];
    if (!a) {
      out.push({ kind: 'token', id, message: 'present only in the generated output' });
    } else if (!b) {
      out.push({ kind: 'token', id, message: 'missing from the generated output', location: a.source });
    } else {
      const sa = show(withoutSource(a));
      const sb = show(withoutSource(b));
      if (sa !== sb) {
        out.push({
          kind: 'token',
          id,
          message: `differs: source ${sa}, generated ${sb}`,
          location: a.source,
        });
      }
    }
  }

  for (const name of [...scope.components].sort(codeUnitCompare)) {
    const a = source.components[name];
    if (!a) {
      continue;
    }
    const b = reparsed.components[name];
    if (!b) {
      out.push({ kind: 'component', id: name, message: 'missing from the generated output' });
      continue;
    }
    const ignored = scope.ignored(name);
    const ra = new Map(a.rules.map((r) => [ruleDiffKey(r), r]));
    const rb = new Map(b.rules.map((r) => [ruleDiffKey(r), r]));
    const keys = new Set([...ra.keys(), ...rb.keys()]);
    for (const key of [...keys].sort(codeUnitCompare)) {
      const x = ra.get(key);
      const y = rb.get(key);
      const id = `${name} ${key}`;
      if (!x) {
        out.push({ kind: 'rule', id, message: 'present only in the generated output' });
        continue;
      }
      const kept = Object.keys(x.declarations).filter((p) => !ignored.has(p));
      if (!y) {
        // a source rule whose every declaration is ignored is legitimately absent
        if (kept.length > 0) {
          out.push({ kind: 'rule', id, message: 'missing from the generated output', location: x.source });
        }
        continue;
      }
      const props = new Set([...kept, ...Object.keys(y.declarations)]);
      for (const p of [...props].sort(codeUnitCompare)) {
        const pid = `${id} ${p}`;
        const va = x.declarations[p];
        const vb = y.declarations[p];
        if (ignored.has(p)) {
          if (vb) {
            out.push({ kind: 'declaration', id: pid, message: 'ignored property present in the generated output', location: x.source });
          }
          continue;
        }
        if (!va) {
          out.push({ kind: 'declaration', id: pid, message: 'present only in the generated output' });
        } else if (!vb) {
          out.push({ kind: 'declaration', id: pid, message: 'missing from the generated output', location: x.source });
        } else if (show(va) !== show(vb)) {
          out.push({
            kind: 'declaration',
            id: pid,
            message: `differs: source ${show(va)}, generated ${show(vb)}`,
            location: x.source,
          });
        }
      }
    }
  }
  return out;
}
```

- [ ] **Step 5: Create `src/targets/tailwind/reparse.ts`**

```ts
import type { ChildNode, Declaration, Rule as CssRule } from 'postcss';
import type { Manifest } from '../../components/manifest.js';
import { parseComponentCss } from '../../components/parse-component.js';
import { modeSelectorFor, type DsConfig } from '../../config.js';
import { Diagnostics, formatDiagnostic } from '../../errors.js';
import type { ComponentIR, DesignIR, Token, TokenId } from '../../ir/types.js';
import type { TokenCategory } from '../../tokens/categories.js';
import { parseTokenName } from '../../tokens/categories.js';
import {
  parseCss,
  parseTokenFile,
  type RawToken,
} from '../../tokens/parse-tokens.js';
import { resolveTokens } from '../../tokens/resolve-tokens.js';
import type { GeneratedFile, PluginContext } from '../plugin.js';
import { sourceNameFromTailwind } from './names.js';

/** A manifest equivalent to a component IR, for re-parsing generated CSS. Baseline warnings are irrelevant here. */
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

const VAR_REF = /var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g;

/** Rewrites every var(--tailwind-name) to var(--source-name); reports names that map to nothing. */
function rewriteVars(
  value: string,
  prefix: string,
  onUnknown: (name: string) => void,
): string {
  return value.replace(VAR_REF, (whole: string, name: string) => {
    const src = sourceNameFromTailwind(name, prefix);
    if (!src) {
      onUnknown(name);
      return whole;
    }
    return `var(${src})`;
  });
}

interface ThemeBlocks {
  /** category -> mode -> source-form declaration lines */
  byCategory: Map<TokenCategory, Map<string, string[]>>;
}

function collectThemeDecl(
  decl: Declaration,
  mode: string,
  config: DsConfig,
  blocks: ThemeBlocks,
  diag: Diagnostics,
): void {
  const at = { file: 'theme.css', line: decl.source?.start?.line ?? 1, column: decl.source?.start?.column ?? 1 };
  const src = sourceNameFromTailwind(decl.prop, config.prefix);
  const parsed = src ? parseTokenName(src, config.prefix) : null;
  if (!src || !parsed) {
    diag.add('DS-E011', `"${decl.prop}" is not a generated token variable`, at);
    return;
  }
  const value = rewriteVars(decl.value, config.prefix, (name) =>
    diag.add('DS-E013', `"${name}" is not a generated token variable`, at),
  );
  const byMode = blocks.byCategory.get(parsed.category) ?? new Map<string, string[]>();
  blocks.byCategory.set(parsed.category, byMode);
  const lines = byMode.get(mode) ?? [];
  byMode.set(mode, lines);
  lines.push(`  ${src}: ${value};`);
}

function reparseTheme(
  css: string,
  config: DsConfig,
  diag: Diagnostics,
): Record<TokenId, Token> | null {
  const root = parseCss('theme.css', css, diag);
  if (!root) {
    return null;
  }
  const blocks: ThemeBlocks = { byCategory: new Map() };
  const modeOf = (selector: string): string | null =>
    config.modes.find(
      (m) => m !== config.defaultMode && modeSelectorFor(config, m) === selector.trim(),
    ) ?? null;

  const eachDecl = (parent: { each: (cb: (n: ChildNode) => void) => void }, mode: string): void => {
    parent.each((child) => {
      if (child.type === 'decl') {
        collectThemeDecl(child, mode, config, blocks, diag);
      } else if (child.type !== 'comment') {
        diag.add('DS-E010', `unexpected ${child.type} inside a theme block`, {
          file: 'theme.css',
          line: child.source?.start?.line ?? 1,
          column: child.source?.start?.column ?? 1,
        });
      }
    });
  };

  root.each((node) => {
    if (node.type === 'comment') {
      return;
    }
    if (node.type === 'atrule' && node.name === 'theme') {
      eachDecl(node, config.defaultMode);
      return;
    }
    if (node.type === 'rule') {
      const mode = modeOf(node.selector);
      if (mode) {
        eachDecl(node, mode);
        return;
      }
    }
    diag.add('DS-E010', `unexpected ${node.type} at the top level of theme.css`, {
      file: 'theme.css',
      line: node.source?.start?.line ?? 1,
      column: node.source?.start?.column ?? 1,
    });
  });
  if (diag.hasErrors()) {
    return null;
  }

  const raws: RawToken[] = [];
  const otherModes = config.modes.filter((m) => m !== config.defaultMode);
  for (const [category, byMode] of [...blocks.byCategory].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
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

function reparseComponents(
  css: string,
  ir: DesignIR,
  tokens: Record<TokenId, Token>,
  config: DsConfig,
  diag: Diagnostics,
): Record<string, ComponentIR> | null {
  const root = parseCss('components.css', css, diag);
  if (!root) {
    return null;
  }
  const rootClass = new RegExp(`^\\.${config.prefix}-([a-z0-9-]+)`);
  const groups = new Map<string, string[]>();
  const at = (node: ChildNode) => ({
    file: 'components.css',
    line: node.source?.start?.line ?? 1,
    column: node.source?.start?.column ?? 1,
  });

  const visit = (rule: CssRule): void => {
    const m = rootClass.exec(rule.selector.trim());
    if (!m) {
      diag.add('DS-E030', `cannot attribute "${rule.selector}" to a component`, at(rule));
      return;
    }
    rule.walkDecls((decl) => {
      decl.value = rewriteVars(decl.value, config.prefix, (name) =>
        diag.add('DS-E043', `"${name}" is not a generated token variable`, at(decl)),
      );
    });
    const list = groups.get(m[1]) ?? [];
    groups.set(m[1], list);
    list.push(rule.toString());
  };

  root.each((node) => {
    if (node.type === 'comment') {
      return;
    }
    if (node.type === 'atrule' && node.name === 'layer' && node.params === 'components') {
      node.each((child) => {
        if (child.type === 'rule') {
          visit(child);
        } else if (child.type !== 'comment') {
          diag.add('DS-E034', `unexpected ${child.type} inside @layer components`, at(child));
        }
      });
      return;
    }
    diag.add('DS-E034', `unexpected ${node.type} at the top level of components.css`, at(node));
  });
  if (diag.hasErrors()) {
    return null;
  }

  const out: Record<string, ComponentIR> = {};
  for (const [name, texts] of [...groups].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const component = ir.components[name];
    if (!component) {
      diag.add('DS-E021', `generated rules for unknown component "${name}"`, {
        file: 'components.css',
        line: 1,
        column: 1,
      });
      continue;
    }
    const parsed = parseComponentCss(
      `src/components/${name}/${name}.css`,
      `${texts.join('\n\n')}\n`,
      manifestFromComponent(component),
      tokens,
      config,
      diag,
    );
    if (parsed) {
      out[name] = parsed;
    }
  }
  return diag.hasErrors() ? null : out;
}

/**
 * Turns the generated Tailwind files back into an IR using the compiler's own
 * parsers: variable names are rewritten to source form, `@theme` becomes
 * `:root`, mode rules become mode blocks, and `@layer components` rules are
 * grouped by root class. Every problem is reported as DS-E081 on `diag`,
 * wrapping the underlying diagnostic.
 */
export function reparseTailwind(
  files: GeneratedFile[],
  ir: DesignIR,
  ctx: PluginContext,
  diag: Diagnostics,
): DesignIR | null {
  const theme = files.find((f) => f.path === 'theme.css');
  const components = files.find((f) => f.path === 'components.css');
  if (!theme || !components) {
    diag.add('DS-E081', 'tailwind output lacks theme.css or components.css', {
      file: 'theme.css',
      line: 1,
      column: 1,
    });
    return null;
  }
  const inner = new Diagnostics();
  const tokens = reparseTheme(theme.contents, ctx.config, inner);
  const parsedComponents = tokens
    ? reparseComponents(components.contents, ir, tokens, ctx.config, inner)
    : null;
  for (const d of inner.errors) {
    diag.add('DS-E081', `tailwind: ${formatDiagnostic(d).split('\n')[0]}`, {
      file: `${d.location?.file ?? 'theme.css'}`,
      line: d.location?.line ?? 1,
      column: d.location?.column ?? 1,
    });
  }
  if (!tokens || !parsedComponents) {
    return null;
  }
  return {
    irVersion: ir.irVersion,
    meta: { ...ir.meta },
    tokens,
    components: parsedComponents,
  };
}
```

Locations in these diagnostics name the generated file (`theme.css`, `components.css`) or the synthetic source-form file the parser saw (`src/tokens/<category>.css`, `src/components/<name>/<name>.css`), not a path under the source root; the wrapped message carries the underlying code and text, which is what a plugin author needs.

- [ ] **Step 6: Create `src/targets/tailwind/index.ts` and register it**

```ts
import type { DesignIR } from '../../ir/types.js';
import type { CoverageEntry, TargetPlugin } from '../plugin.js';
import {
  TAILWIND_ID,
  ignoredForTailwind,
  isMappedForTailwind,
  tailwindExclusion,
} from './hints.js';
import { generateTailwind } from './render.js';
import { reparseTailwind } from './reparse.js';

function coverage(ir: DesignIR): CoverageEntry[] {
  return Object.keys(ir.components)
    .sort()
    .map((name) => {
      const component = ir.components[name];
      const excluded = tailwindExclusion(component);
      if (excluded !== null) {
        return { component: name, target: TAILWIND_ID, status: 'excluded' as const, reason: excluded };
      }
      if (!isMappedForTailwind(component)) {
        return { component: name, target: TAILWIND_ID, status: 'unmapped' as const };
      }
      const ignored = [...ignoredForTailwind(component)].sort();
      if (ignored.length > 0) {
        return { component: name, target: TAILWIND_ID, status: 'partial' as const, ignored };
      }
      return { component: name, target: TAILWIND_ID, status: 'supported' as const };
    });
}

/** Tailwind has a handler for every property in the table, so nothing is ever `unsupported`. */
export const tailwindPlugin: TargetPlugin<null> = {
  id: TAILWIND_ID,
  generate: (ir, _catalog, ctx) => generateTailwind(ir, ctx),
  reparse: reparseTailwind,
  coverage,
  isMapped: isMappedForTailwind,
  ignoredProperties: ignoredForTailwind,
};
```

Replace `src/targets/index.ts`:

```ts
import type { TargetPlugin } from './plugin.js';
import { tailwindPlugin } from './tailwind/index.js';

/** Implemented target plugins by id, in the order they are run. */
export const TARGETS: Readonly<Record<string, TargetPlugin>> = {
  tailwind: tailwindPlugin,
};

export function getTarget(id: string): TargetPlugin | null {
  return Object.hasOwn(TARGETS, id) ? TARGETS[id] : null;
}

export function targetIds(): string[] {
  return Object.keys(TARGETS).sort();
}
```

- [ ] **Step 7: Run tests, then everything**

```bash
npx vitest run test/tailwind-roundtrip.test.ts test/targets-hints.test.ts
npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore
npx vitest run
npm run typecheck
npm run lint
npm run format
```

Expected: all green. If the round-trip on the mini fixture reports a difference, the generator and the parser disagree; read the difference message (it names the token or the rule and property) and fix the renderer in Task 2 or 4, never the test.

- [ ] **Step 8: Checkpoint**

Report: `src/targets/tailwind/{reparse,index}.ts`, `src/verify/ir-diff.ts`, `test/tailwind-roundtrip.test.ts` created; `src/targets/index.ts`, `src/errors.ts`, `test/targets-hints.test.ts` modified.

---

## Task 6: Coverage report

**Files:**
- Create: `packages/ds-compiler/src/verify/coverage.ts`
- Test: `packages/ds-compiler/test/coverage.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { tailwindPlugin } from '../src/targets/tailwind/index.js';
import { computeCoverage, renderCoverageMarkdown } from '../src/verify/coverage.js';
import { twBuild, twRoot } from './tailwind-fixture.js';

describe('coverage', () => {
  const { ir } = twBuild(
    twRoot({
      'src/components/dot/dot.manifest.json': JSON.stringify({
        name: 'dot',
        displayName: 'Dot',
        baseline: false,
      }),
      'src/components/dot/dot.css': '.fx-dot {\n  display: inline-block;\n}\n',
    }),
  );

  it('computes one entry per component and target with the right status', () => {
    const report = computeCoverage(ir, [tailwindPlugin]);
    expect(report.targets).toEqual(['tailwind']);
    expect(report.components).toEqual(['chip', 'dot', 'pill', 'tag']);
    expect(report.entries).toEqual([
      { component: 'chip', target: 'tailwind', status: 'supported' },
      { component: 'dot', target: 'tailwind', status: 'unmapped' },
      { component: 'pill', target: 'tailwind', status: 'excluded', reason: 'starter content' },
      { component: 'tag', target: 'tailwind', status: 'partial', ignored: ['opacity'] },
    ]);
    expect(report.unmapped).toEqual([{ component: 'dot', target: 'tailwind', status: 'unmapped' }]);
  });

  it('renders a generated Markdown table', () => {
    const md = renderCoverageMarkdown(computeCoverage(ir, [tailwindPlugin]), ir, '0.0.0-test');
    const lines = md.split('\n');
    expect(lines[0]).toBe(
      `<!-- Generated by @bwp-web/ds-compiler 0.0.0-test from design.ir.json; source hash ${ir.meta.sourceHash}. Do not edit; run bwp-ds verify. -->`,
    );
    expect(md).toContain('# Coverage');
    expect(md).toContain('| Component | tailwind |');
    expect(md).toContain('| `chip` | supported |');
    expect(md).toContain('| `dot` | **unmapped** |');
    expect(md).toContain('| `pill` | excluded: starter content |');
    expect(md).toContain('| `tag` | partial (ignores `opacity`) |');
    expect(md.endsWith('\n')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/coverage.test.ts`
Expected: FAIL, cannot resolve `../src/verify/coverage.js`.

- [ ] **Step 3: Create `src/verify/coverage.ts`**

```ts
import type { DesignIR } from '../ir/types.js';
import type { CoverageEntry, TargetPlugin } from '../targets/plugin.js';

export interface CoverageReport {
  targets: string[];
  components: string[];
  /** Sorted by component, then target. */
  entries: CoverageEntry[];
  unmapped: CoverageEntry[];
}

function codeUnitCompare(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

export function computeCoverage(ir: DesignIR, plugins: readonly TargetPlugin[]): CoverageReport {
  const entries = plugins
    .flatMap((p) => p.coverage(ir))
    .sort(
      (a, b) =>
        codeUnitCompare(a.component, b.component) || codeUnitCompare(a.target, b.target),
    );
  return {
    targets: plugins.map((p) => p.id).sort(codeUnitCompare),
    components: Object.keys(ir.components).sort(codeUnitCompare),
    entries,
    unmapped: entries.filter((e) => e.status === 'unmapped'),
  };
}

function cell(entry: CoverageEntry | undefined): string {
  if (!entry) {
    return '';
  }
  switch (entry.status) {
    case 'supported':
      return 'supported';
    case 'partial': {
      const ignored = (entry.ignored ?? []).map((p) => `\`${p}\``).join(', ');
      const unsupported = (entry.unsupported ?? []).map((p) => `\`${p}\``).join(', ');
      const parts = [
        ignored ? `ignores ${ignored}` : '',
        unsupported ? `unsupported ${unsupported}` : '',
      ].filter((s) => s !== '');
      return `partial (${parts.join('; ')})`;
    }
    case 'unmapped':
      return '**unmapped**';
    case 'excluded':
      return `excluded: ${entry.reason ?? ''}`;
  }
}

/** The committed coverage document. Generated; the header says so. */
export function renderCoverageMarkdown(
  report: CoverageReport,
  ir: DesignIR,
  compilerVersion: string,
): string {
  const byKey = new Map(report.entries.map((e) => [`${e.component}|${e.target}`, e]));
  const lines = [
    `<!-- Generated by @bwp-web/ds-compiler ${compilerVersion} from design.ir.json; source hash ${ir.meta.sourceHash}. Do not edit; run bwp-ds verify. -->`,
    '',
    '# Coverage',
    '',
    'Which components each target covers. `supported`: every rule is generated.',
    '`partial`: the manifest ignores some properties for this target.',
    '`unmapped`: the manifest has no entry for this target, and `bwp-ds verify` fails.',
    '`excluded`: left out on purpose, with the reason from the manifest.',
    '',
    `| Component | ${report.targets.join(' | ')} |`,
    `| --- | ${report.targets.map(() => '---').join(' | ')} |`,
    ...report.components.map(
      (c) =>
        `| \`${c}\` | ${report.targets
          .map((t) => cell(byKey.get(`${c}|${t}`)))
          .join(' | ')} |`,
    ),
  ];
  return `${lines.join('\n')}\n`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/coverage.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Checkpoint**

Report: `src/verify/coverage.ts`, `test/coverage.test.ts` created.

---

## Task 7: `generate`, `verify` (drift, round-trip, coverage), CLI, error codes, exports

**Files:**
- Create: `packages/ds-compiler/src/generate.ts`
- Create: `packages/ds-compiler/src/verify/drift.ts`
- Create: `packages/ds-compiler/src/verify/index.ts`
- Modify: `packages/ds-compiler/src/errors.ts` (`DS-E080`, `DS-E082`, `DS-E083`)
- Modify: `packages/ds-compiler/src/report.ts` (non-string extras)
- Modify: `packages/ds-compiler/src/cli.ts`
- Modify: `packages/ds-compiler/src/index.ts`
- Test: `packages/ds-compiler/test/verify.test.ts`, `test/cli.test.ts`, `test/errors.test.ts`

- [ ] **Step 1: Write the failing tests**

`test/verify.test.ts`:

```ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { build } from '../src/build.js';
import { UnknownTargetError, generate } from '../src/generate.js';
import { verify } from '../src/verify/index.js';
import { twRoot } from './tailwind-fixture.js';

const BROKEN_SPACE = { 'src/tokens/space.css': ':root {\n  --fx-space-2: nope;\n}\n' };

/** A root that has been built and generated: what a clean checkout looks like. */
function ready(extra: Record<string, string> = {}): string {
  const root = twRoot(extra);
  build(root);
  generate(root);
  return root;
}

describe('generate', () => {
  it('writes the tailwind files into the configured outDir and removes stale files', () => {
    const root = twRoot();
    build(root);
    const out = join(root, 'out', 'tailwind');
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'stale.css'), 'x');
    const result = generate(root);
    expect(result.ir).not.toBeNull();
    expect(result.written.map((p) => p.slice(out.length + 1))).toEqual([
      'components.css',
      'index.css',
      'theme.css',
    ]);
    expect(result.removed).toEqual([join(out, 'stale.css')]);
    expect(readFileSync(join(out, 'theme.css'), 'utf8')).toContain('@theme static {');
  });

  it('writes nothing when the IR has errors', () => {
    const root = twRoot(BROKEN_SPACE);
    const result = generate(root);
    expect(result.ir).toBeNull();
    expect(result.written).toEqual([]);
    expect(existsSync(join(root, 'out'))).toBe(false);
  });

  it('rejects unknown targets before building', () => {
    expect(() => generate(twRoot(), ['nope'])).toThrow(UnknownTargetError);
  });
});

describe('verify', () => {
  it('passes on a built and generated root and writes the coverage file', () => {
    const root = ready();
    const result = verify(root);
    expect(result.diagnostics.errors).toEqual([]);
    expect(result.steps).toEqual({
      lint: 'pass',
      drift: 'pass',
      roundtrip: 'pass',
      coverage: 'pass',
    });
    expect(result.coverageFile).toBe(join(root, 'out', 'coverage.md'));
    expect(readFileSync(result.coverageFile!, 'utf8')).toContain('| `chip` | supported |');
  });

  it('reports drift for a stale IR, a changed generated file, and a stray file', () => {
    const root = ready();
    const out = join(root, 'out', 'tailwind');
    writeFileSync(join(root, 'design.ir.json'), '{}\n');
    writeFileSync(
      join(out, 'theme.css'),
      `${readFileSync(join(out, 'theme.css'), 'utf8')}/* edit */\n`,
    );
    writeFileSync(join(out, 'extra.css'), '');
    const result = verify(root);
    expect(result.steps.drift).toBe('fail');
    expect(result.steps.roundtrip).toBe('pass');
    expect(
      result.diagnostics.errors.filter((d) => d.code === 'DS-E080').map((d) => d.message),
    ).toEqual([
      'design.ir.json differs from a fresh build; run bwp-ds build',
      'out/tailwind/theme.css differs from a fresh generation; run bwp-ds generate --target tailwind',
      'out/tailwind/extra.css is not produced by the tailwind generator; delete it',
    ]);
  });

  it('reports missing generated files', () => {
    const root = twRoot();
    build(root);
    const result = verify(root);
    expect(result.steps.drift).toBe('fail');
    expect(result.diagnostics.errors.map((d) => d.message)).toContain(
      'out/tailwind/theme.css is missing; run bwp-ds generate --target tailwind',
    );
  });

  it('fails coverage for an unmapped component and still writes the report', () => {
    const root = ready({
      'src/components/dot/dot.manifest.json': JSON.stringify({
        name: 'dot',
        displayName: 'Dot',
        baseline: false,
      }),
      'src/components/dot/dot.css': '.fx-dot {\n  display: inline-block;\n}\n',
    });
    const result = verify(root);
    expect(result.steps).toEqual({
      lint: 'pass',
      drift: 'pass',
      roundtrip: 'pass',
      coverage: 'fail',
    });
    const unmapped = result.diagnostics.errors.find((d) => d.code === 'DS-E082')!;
    expect(unmapped.message).toBe('dot has no targets.tailwind entry in its manifest');
    expect(unmapped.location).toEqual({
      file: 'src/components/dot/dot.manifest.json',
      line: 1,
      column: 1,
    });
    expect(readFileSync(result.coverageFile!, 'utf8')).toContain('| `dot` | **unmapped** |');
  });

  it('stops after lint when the source has errors', () => {
    const result = verify(twRoot(BROKEN_SPACE));
    expect(result.steps).toEqual({
      lint: 'fail',
      drift: 'skipped',
      roundtrip: 'skipped',
      coverage: 'skipped',
    });
    expect(result.coverageFile).toBeNull();
  });
});
```

Add to `test/cli.test.ts` (import `writeFileSync`, `join`, and `twRoot` from `./tailwind-fixture.js`):

```ts
  it('generate and verify work end to end and report steps in JSON', () => {
    const root = twRoot();
    expect(run(['build', '--root', root]).code).toBe(0);
    const generated = run(['generate', '--root', root, '--json']);
    expect(generated.code).toBe(0);
    expect((JSON.parse(generated.stdout) as { wrote: string[] }).wrote).toHaveLength(3);
    const verified = run(['verify', '--root', root, '--json']);
    expect(verified.code).toBe(0);
    const parsed = JSON.parse(verified.stdout) as {
      steps: Record<string, string>;
      coverageFile: string;
    };
    expect(parsed.steps).toEqual({
      lint: 'pass',
      drift: 'pass',
      roundtrip: 'pass',
      coverage: 'pass',
    });
    expect(parsed.coverageFile.endsWith('coverage.md')).toBe(true);

    const unknown = run(['generate', '--root', root, '--target', 'nope']);
    expect(unknown.code).toBe(1);
    expect(unknown.stderr).toContain('unknown target "nope"');

    writeFileSync(join(root, 'design.ir.json'), '{}\n');
    const stale = run(['verify', '--root', root]);
    expect(stale.code).toBe(1);
    expect(stale.stderr).toContain('DS-E080');
    expect(stale.stdout).toContain('steps: {"lint":"pass","drift":"fail"');
  });
```

In `test/errors.test.ts`, extend the catalog test that lists expected codes (or add one) so the set includes `DS-E080`, `DS-E081`, `DS-E082`, `DS-E083`, and `DS-W003`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/verify.test.ts test/cli.test.ts test/errors.test.ts`
Expected: FAIL; `../src/generate.js` and `../src/verify/index.js` cannot be resolved; `generate` is not a CLI command; codes missing.

- [ ] **Step 3: Add the error codes**

In `src/errors.ts`, keep `DS-E081` (Task 5) and add around it:

```ts
  'DS-E080': {
    title: 'Generated file out of date',
    hint: 'Run bwp-ds build (for design.ir.json) or bwp-ds generate (for target output) and commit the result. Never edit generated files by hand.',
  },
  'DS-E082': {
    title: 'Component unmapped for target',
    hint: 'Add a "targets.<id>" entry to the component manifest: {} maps it, { "excluded": "<reason>" } leaves it out on purpose.',
  },
  'DS-E083': {
    title: 'Unsupported property for target',
    hint: 'The target has no handler for this property. Add a handler to the plugin under packages/ds-compiler/src/targets/<id>/, or list the property under targets.<id>.ignore in the manifest.',
  },
```

Order the catalog `DS-E080`, `DS-E081`, `DS-E082`, `DS-E083`.

- [ ] **Step 4: Create `src/generate.ts`**

```ts
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { buildIR } from './build.js';
import type { Diagnostics } from './errors.js';
import type { DesignIR } from './ir/types.js';
import { getTarget, targetIds } from './targets/index.js';
import { pluginContext, type TargetPlugin } from './targets/plugin.js';
import { COMPILER_VERSION } from './version.js';

export interface GenerateResult {
  ir: DesignIR | null;
  diagnostics: Diagnostics;
  /** Absolute paths written, in generation order. */
  written: string[];
  /** Absolute paths of files in an outDir that no generator produced and were deleted. */
  removed: string[];
}

export class UnknownTargetError extends Error {}

function resolvePlugins(ids: readonly string[]): TargetPlugin[] {
  return ids.map((id) => {
    const plugin = getTarget(id);
    if (!plugin) {
      throw new UnknownTargetError(
        `unknown target "${id}"; registered targets: ${targetIds().join(', ') || '(none)'}`,
      );
    }
    return plugin;
  });
}

/**
 * Builds the IR and writes every requested target's files into its outDir.
 * Nothing is written when the IR has errors. Files in an outDir that the
 * generator did not produce are deleted, so the directory always equals a
 * fresh generation.
 */
export function generate(
  rootDir: string,
  ids: readonly string[] = targetIds(),
): GenerateResult {
  const plugins = resolvePlugins(ids);
  const result = buildIR(rootDir);
  if (!result.ir || !result.config) {
    return { ir: null, diagnostics: result.diagnostics, written: [], removed: [] };
  }
  const written: string[] = [];
  const removed: string[] = [];
  for (const plugin of plugins) {
    const ctx = pluginContext(rootDir, result.config, COMPILER_VERSION, plugin.id);
    const files = plugin.generate(result.ir, null, ctx);
    mkdirSync(ctx.outDir, { recursive: true });
    const produced = new Set(files.map((f) => f.path));
    for (const file of files) {
      const abs = join(ctx.outDir, file.path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, file.contents);
      written.push(abs);
    }
    for (const entry of readdirSync(ctx.outDir, { withFileTypes: true })) {
      if (entry.isFile() && !produced.has(entry.name)) {
        const abs = join(ctx.outDir, entry.name);
        unlinkSync(abs);
        removed.push(abs);
      }
    }
  }
  return { ir: result.ir, diagnostics: result.diagnostics, written, removed };
}
```

- [ ] **Step 5: Create `src/verify/drift.ts`**

```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { DsConfig } from '../config.js';
import type { Diagnostics } from '../errors.js';
import { serializeIR } from '../ir/serialize.js';
import type { DesignIR } from '../ir/types.js';
import { IR_FILE } from '../paths.js';
import { pluginContext, type TargetPlugin } from '../targets/plugin.js';

function readIfPresent(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

function listFiles(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .sort();
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return [];
    }
    throw err;
  }
}

function posixRelative(from: string, to: string): string {
  return relative(from, to).split(sep).join('/');
}

/**
 * DS-E080 for a missing or stale design.ir.json, and for every target file
 * that is missing, differs from a fresh generation, or exists in an outDir
 * without being produced by the generator.
 */
export function checkDrift(
  rootDir: string,
  ir: DesignIR,
  config: DsConfig,
  plugins: readonly TargetPlugin[],
  compilerVersion: string,
  diag: Diagnostics,
): void {
  const at = (file: string) => ({ file, line: 1, column: 1 });
  const actualIr = readIfPresent(join(rootDir, IR_FILE));
  if (actualIr === null) {
    diag.add('DS-E080', `${IR_FILE} is missing; run bwp-ds build`, at(IR_FILE));
  } else if (actualIr !== serializeIR(ir)) {
    diag.add('DS-E080', `${IR_FILE} differs from a fresh build; run bwp-ds build`, at(IR_FILE));
  }
  for (const plugin of plugins) {
    const ctx = pluginContext(rootDir, config, compilerVersion, plugin.id);
    const files = plugin.generate(ir, null, ctx);
    const rel = (p: string): string => posixRelative(rootDir, join(ctx.outDir, p));
    const produced = new Set<string>();
    for (const file of files) {
      produced.add(file.path);
      const actual = readIfPresent(join(ctx.outDir, file.path));
      if (actual === null) {
        diag.add(
          'DS-E080',
          `${rel(file.path)} is missing; run bwp-ds generate --target ${plugin.id}`,
          at(rel(file.path)),
        );
      } else if (actual !== file.contents) {
        diag.add(
          'DS-E080',
          `${rel(file.path)} differs from a fresh generation; run bwp-ds generate --target ${plugin.id}`,
          at(rel(file.path)),
        );
      }
    }
    for (const name of listFiles(ctx.outDir)) {
      if (!produced.has(name)) {
        diag.add(
          'DS-E080',
          `${rel(name)} is not produced by the ${plugin.id} generator; delete it`,
          at(rel(name)),
        );
      }
    }
  }
}
```

- [ ] **Step 6: Create `src/verify/index.ts`**

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildIR } from '../build.js';
import { checkEntryCss } from '../entry.js';
import { configFailed, type Diagnostics } from '../errors.js';
import { TARGETS, targetIds } from '../targets/index.js';
import { pluginContext } from '../targets/plugin.js';
import { COMPILER_VERSION } from '../version.js';
import { computeCoverage, renderCoverageMarkdown, type CoverageReport } from './coverage.js';
import { checkDrift } from './drift.js';
import { diffIR } from './ir-diff.js';

export type StepStatus = 'pass' | 'fail' | 'skipped';
export type VerifyStep = 'lint' | 'drift' | 'roundtrip' | 'coverage';

export interface VerifyResult {
  diagnostics: Diagnostics;
  steps: Record<VerifyStep, StepStatus>;
  coverage: CoverageReport | null;
  /** Absolute path of the written coverage report, or null when lint failed. */
  coverageFile: string | null;
}

/**
 * lint, then drift, round-trip, and coverage for every registered target.
 * Later steps run even when an earlier one fails, except that nothing runs
 * without an IR. Always writes the coverage file once an IR exists.
 */
export function verify(rootDir: string): VerifyResult {
  const steps: Record<VerifyStep, StepStatus> = {
    lint: 'skipped',
    drift: 'skipped',
    roundtrip: 'skipped',
    coverage: 'skipped',
  };
  const result = buildIR(rootDir);
  const diag = result.diagnostics;
  if (!configFailed(diag)) {
    checkEntryCss(rootDir, diag);
  }
  if (!result.ir || !result.config) {
    steps.lint = 'fail';
    return { diagnostics: diag, steps, coverage: null, coverageFile: null };
  }
  steps.lint = 'pass';
  const ir = result.ir;
  const config = result.config;
  const plugins = targetIds().map((id) => TARGETS[id]);

  const failsSince = (count: number): StepStatus =>
    diag.errors.length > count ? 'fail' : 'pass';

  const beforeDrift = diag.errors.length;
  checkDrift(rootDir, ir, config, plugins, COMPILER_VERSION, diag);
  steps.drift = failsSince(beforeDrift);

  const beforeRoundtrip = diag.errors.length;
  for (const plugin of plugins) {
    const ctx = pluginContext(rootDir, config, COMPILER_VERSION, plugin.id);
    const reparsed = plugin.reparse(plugin.generate(ir, null, ctx), ir, ctx, diag);
    if (!reparsed) {
      continue;
    }
    const scope = {
      components: Object.keys(ir.components).filter((n) => plugin.isMapped(ir.components[n])),
      ignored: (name: string) => plugin.ignoredProperties(ir.components[name]),
    };
    for (const d of diffIR(ir, reparsed, scope)) {
      diag.add('DS-E081', `${plugin.id}: ${d.kind} ${d.id}: ${d.message}`, d.location);
    }
  }
  steps.roundtrip = failsSince(beforeRoundtrip);

  const beforeCoverage = diag.errors.length;
  const coverage = computeCoverage(ir, plugins);
  for (const entry of coverage.entries) {
    const manifest = `src/components/${entry.component}/${entry.component}.manifest.json`;
    if (entry.status === 'unmapped') {
      diag.add(
        'DS-E082',
        `${entry.component} has no targets.${entry.target} entry in its manifest`,
        { file: manifest, line: 1, column: 1 },
      );
    } else if (entry.unsupported && entry.unsupported.length > 0) {
      diag.add(
        'DS-E083',
        `${entry.component}: ${entry.target} has no handler for ${entry.unsupported.join(', ')}`,
        { file: manifest, line: 1, column: 1 },
      );
    }
  }
  steps.coverage = failsSince(beforeCoverage);

  const coverageFile = resolve(rootDir, config.coverageFile);
  mkdirSync(dirname(coverageFile), { recursive: true });
  writeFileSync(coverageFile, renderCoverageMarkdown(coverage, ir, COMPILER_VERSION));

  return { diagnostics: diag, steps, coverage, coverageFile };
}
```

- [ ] **Step 7: Reporter prints non-string extras as JSON**

In `src/report.ts`, change the plain-mode extras loop to:

```ts
  for (const [key, value] of Object.entries(extra)) {
    console.log(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
  }
```

- [ ] **Step 8: CLI commands**

In `src/cli.ts`:

- Rename `scaffoldFailure` to `commandFailure` (update its two call sites and the doc comment) so `generate` can use it.
- Import `{ UnknownTargetError, generate } from './generate.js'` and `{ verify } from './verify/index.js'`.
- Add before the `scaffold` group:

```ts
program
  .command('generate')
  .description(
    "Write each target's files from the IR into its outDir (default: every registered target)",
  )
  .option('--target <id>', 'target id (repeatable)', collect, [])
  .action((opts: { target: string[] }) => {
    const { root, json } = globals();
    let result;
    try {
      result = generate(root, opts.target.length > 0 ? opts.target : undefined);
    } catch (err) {
      if (err instanceof UnknownTargetError) {
        commandFailure(err.message, json);
        return;
      }
      throw err;
    }
    printDiagnostics(result.diagnostics, json, {
      wrote: result.written,
      removed: result.removed,
    });
    process.exitCode = result.ir ? 0 : 1;
  });

program
  .command('verify')
  .description(
    'Lint, then drift, round-trip, and coverage checks for every registered target; writes the coverage report',
  )
  .action(() => {
    const { root, json } = globals();
    const result = verify(root);
    printDiagnostics(result.diagnostics, json, {
      steps: result.steps,
      coverageFile: result.coverageFile ?? '',
    });
    process.exitCode = result.diagnostics.hasErrors() ? 1 : 0;
  });
```

`collect` is already defined below the scaffold group; move it (and `splitList`) above this block.

- [ ] **Step 9: Public exports**

Add to `src/index.ts`:

```ts
export { COMPILER_VERSION } from './version.js';
export { generate, UnknownTargetError } from './generate.js';
export type { GenerateResult } from './generate.js';
export { verify } from './verify/index.js';
export type { StepStatus, VerifyResult, VerifyStep } from './verify/index.js';
export { checkDrift } from './verify/drift.js';
export { diffIR, ruleDiffKey } from './verify/ir-diff.js';
export type { DiffScope, IRDifference } from './verify/ir-diff.js';
export { computeCoverage, renderCoverageMarkdown } from './verify/coverage.js';
export type { CoverageReport } from './verify/coverage.js';
export { outDirFor, pluginContext } from './targets/plugin.js';
export type {
  CoverageEntry,
  CoverageStatus,
  GeneratedFile,
  PluginContext,
  TargetPlugin,
} from './targets/plugin.js';
export {
  TARGET_HINT_SCHEMAS,
  TARGET_IDS,
  tailwindHintsSchema,
  targetsSchema,
} from './targets/hints.js';
export type { TargetId } from './targets/hints.js';
export { TARGETS, getTarget, targetIds } from './targets/index.js';
export { tailwindPlugin } from './targets/tailwind/index.js';
export {
  TAILWIND_NAMESPACES,
  sourceNameFromTailwind,
  tailwindVarName,
} from './targets/tailwind/names.js';
export {
  generateTailwind,
  renderComponents,
  renderIRValue,
  renderIndex,
  renderTheme,
  tailwindHeader,
  varNameFor,
} from './targets/tailwind/render.js';
export { manifestFromComponent, reparseTailwind } from './targets/tailwind/reparse.js';
export {
  FORM_CONTROL_ELEMENTS,
  renderRuleSelector,
  stateSelector,
} from './components/render-selector.js';
export type { SelectorTarget } from './components/render-selector.js';
```

- [ ] **Step 10: Run everything**

```bash
npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore
npx vitest run
npm run typecheck
npm run lint
npm run format
npm run build
node dist/cli.js --help
```

Expected: all green; `--help` lists `lint`, `build`, `generate`, `verify`, `scaffold`.

- [ ] **Step 11: Checkpoint**

Report: `src/generate.ts`, `src/verify/{drift,index}.ts`, `test/verify.test.ts` created; `errors.ts`, `report.ts`, `cli.ts`, `index.ts`, `test/cli.test.ts`, `test/errors.test.ts` modified.

---

## Task 8: The `styles-tailwind` package, repo wiring, generated output, and docs

**Files:**
- Modify: `packages/styles-css/ds.config.json`
- Create: `packages/styles-tailwind/package.json`, `README.md`, `.prettierignore`, `postcss.config.js`, `src/index.css`, `probe/index.css`, `scripts/assert-probe.mjs`
- Generate: `packages/styles-tailwind/src/generated/{theme,components,index}.css`, `docs/design-system/coverage.md`, `packages/styles-css/design.ir.json` (config changed)
- Modify: root `package.json`, `.github/workflows/main.yml`, `README.md`, `AGENTS.md`
- Modify: `docs/design-system/targets/tailwind.md`, `verification.md`, `errors.md`, `ir.md`, `authoring-guide.md`

- [ ] **Step 1: Point the source root at the target package**

Replace `packages/styles-css/ds.config.json`:

```json
{
  "name": "SOLAR",
  "prefix": "bwp",
  "modes": ["light", "dark"],
  "defaultMode": "light",
  "rootFontSize": 16,
  "targets": {
    "tailwind": { "outDir": "../styles-tailwind/src/generated" }
  },
  "coverageFile": "../../docs/design-system/coverage.md"
}
```

- [ ] **Step 2: Create `packages/styles-tailwind/package.json`**

```json
{
  "name": "@bwp-web/styles-tailwind",
  "version": "2.0.0-alpha.0",
  "description": "Generated Tailwind CSS v4 theme and component layer for the design system",
  "type": "module",
  "main": "./src/index.css",
  "style": "./src/index.css",
  "exports": {
    ".": "./src/index.css",
    "./index.css": "./src/index.css",
    "./package.json": "./package.json"
  },
  "files": [
    "src"
  ],
  "sideEffects": [
    "**/*.css"
  ],
  "publishConfig": {
    "access": "public",
    "tag": "alpha"
  },
  "scripts": {
    "generate": "bwp-ds generate --root ../styles-css --target tailwind",
    "build": "postcss probe/index.css -o dist/probe.css --no-map && node scripts/assert-probe.mjs",
    "format": "prettier --check . --ignore-path ../../.gitignore --ignore-path .prettierignore",
    "clean": "rm -rf dist node_modules .turbo"
  },
  "peerDependencies": {
    "tailwindcss": "^4.3.0"
  },
  "devDependencies": {
    "@bwp-web/ds-compiler": "*",
    "@tailwindcss/postcss": "^4.3.3",
    "postcss": "^8.5.28",
    "postcss-cli": "^12.0.0",
    "prettier": "^3.8.3",
    "tailwindcss": "^4.3.3"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/evoko/workplace-public-packages.git",
    "directory": "packages/styles-tailwind"
  }
}
```

No `prepublishOnly`: the package publishes committed source, and `bwp-ds verify` in CI is the guard that the source is current.

- [ ] **Step 3: Create the package's supporting files**

`packages/styles-tailwind/.prettierignore`:

```
src/generated
probe
dist
```

`packages/styles-tailwind/postcss.config.js`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

`packages/styles-tailwind/src/index.css`:

```css
/* Entry point of @bwp-web/styles-tailwind. Everything under generated/ is
   written by `bwp-ds generate --target tailwind`; do not edit it. */
@import './generated/index.css';
```

`packages/styles-tailwind/probe/index.css` (compiled by `npm run build` to prove the generated layer works under Tailwind; not published):

```css
@import "tailwindcss";
@import "../src/index.css";
@source inline("bg-bwp-accent-default text-bwp-md p-bwp-2 rounded-bwp-md shadow-bwp-sm");
```

`packages/styles-tailwind/scripts/assert-probe.mjs`:

```js
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../dist/probe.css', import.meta.url), 'utf8');
const expected = [
  '--color-bwp-accent-default',
  'data-bwp-theme=',
  '.bwp-example',
  '.bg-bwp-accent-default',
  '.text-bwp-md',
  '.p-bwp-2',
  '.rounded-bwp-md',
  '.shadow-bwp-sm',
];
const missing = expected.filter((s) => !css.includes(s));
if (missing.length > 0) {
  console.error(`probe compile is missing: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`probe ok (${css.length} bytes)`);
```

`packages/styles-tailwind/README.md`:

````markdown
# @bwp-web/styles-tailwind

The design system as a Tailwind CSS v4 layer: every token as a theme variable
in Tailwind's namespaces, and every component rule under `@layer components`.
Generated from `@bwp-web/styles-css` by the compiler; nothing here is written
by hand except this file and `src/index.css`.

## Install

```bash
npm install tailwindcss @bwp-web/styles-tailwind
```

## Use

```css
@import 'tailwindcss';
@import '@bwp-web/styles-tailwind';
```

Then use the design system in markup either way:

```html
<button class="bwp-example" data-tone="accent">Save</button>
<div class="bg-bwp-accent-default text-bwp-md p-bwp-2 rounded-bwp-md">…</div>
```

Set the color mode on the root element: `<html data-bwp-theme="dark">`. The
default mode needs no attribute. Every utility reads the theme variable at
runtime, so the switch needs no extra classes.

## What is inside

| File | Content |
| --- | --- |
| `src/index.css` | Entry point; imports the generated files. |
| `src/generated/theme.css` | `@theme static` with every token, plus one override rule per mode. |
| `src/generated/components.css` | `@layer components` with every component rule. |
| `src/generated/index.css` | Imports the two above. |

Variable names follow Tailwind's namespaces with the design-system prefix
inserted: `--bwp-color-accent-default` in the CSS source becomes
`--color-bwp-accent-default` here, so `bg-bwp-accent-default` works. The full
table is in `docs/design-system/targets/tailwind.md`.

## Regenerate

From the repository root: `npm run ds -- generate --target tailwind`, then
`npm run verify`. CI fails when the committed output differs from a fresh
generation.
````

- [ ] **Step 4: Root wiring**

Root `package.json`, add to `scripts`:

```json
"verify": "bwp-ds verify --root packages/styles-css"
```

`.github/workflows/main.yml`: replace the generated-files check and add the verify step so the block after "Build" reads:

```yaml
      - name: Check generated files are up to date
        run: git diff --exit-code -- packages/styles-css/design.ir.json packages/styles-css/src/index.css packages/styles-tailwind/src/generated docs/design-system/coverage.md

      - name: Verify design system
        run: npm run verify
```

(`npm run verify` also writes `docs/design-system/coverage.md`; the diff check runs before it so a stale committed report fails visibly.)

Root `README.md` package table: add after the `styles-css` row:

```markdown
| [`@bwp-web/styles-tailwind`](./packages/styles-tailwind) | Generated Tailwind CSS v4 theme and component layer | [docs](./packages/styles-tailwind/README.md) |
```

and in the "Detailed Documentation" table add, after the `targets/` row:

```markdown
| [design-system/coverage.md](./docs/design-system/coverage.md) | Generated: which components each target covers |
```

- [ ] **Step 5: Install, build, generate, verify**

From the repo root (Node 22):

```bash
npm install
npm run build -w packages/ds-compiler
npm run ds -- build
npm run ds -- generate
npm run ds -- verify
npm run build -w packages/styles-tailwind
npm run build
npm run lint
npm run typecheck
npm run format
npm run test
npm run verify
ls packages/styles-tailwind/src/generated docs/design-system/coverage.md
```

Expected: `build` writes `design.ir.json` (the config change alters `sourceHash`); `generate` writes three files and reports them; `verify` prints `0 errors`, `steps: {"lint":"pass","drift":"pass","roundtrip":"pass","coverage":"pass"}` and the coverage path; the `styles-tailwind` build prints `probe ok`; every root gate is green. `npm install` must not print `EBADENGINE`. If `@source inline(...)` is rejected, the installed Tailwind is older than 4.1; check `npm ls tailwindcss`.

Inspect `packages/styles-tailwind/src/generated/theme.css`: it starts with the header, then `@theme static {`, contains `--color-bwp-accent-default: var(--color-bwp-accent-500);`, and has one `:root[data-bwp-theme="dark"] {` block. Inspect `components.css`: it contains `.bwp-example {`, `.bwp-example[data-tone="accent"]:hover {`, and `.bwp-example .bwp-example__icon {`. Inspect `docs/design-system/coverage.md`: `| \`example\` | supported |`.

- [ ] **Step 6: Documentation**

Replace `docs/design-system/targets/tailwind.md` with:

````markdown
# Target: Tailwind CSS

Status: generated. `bwp-ds generate --target tailwind` writes
`packages/styles-tailwind/src/generated/`, and `bwp-ds verify` checks drift,
round-trip, and coverage for it.

## What is emitted

Tailwind CSS 4.3.x, CSS-first. Three files, each starting with a one-line
header naming the compiler version and the IR's source hash:

- `theme.css`: one `@theme static { … }` block with every token as a CSS
  variable using the default mode's values, then one rule per other mode (the
  configured mode selector, `:root[data-bwp-theme="dark"]` by default) that
  overrides only the tokens whose value varies. Aliases stay aliases:
  `--color-bwp-text-default: var(--color-bwp-neutral-900);`.
- `components.css`: `@layer components { … }` with one rule per IR rule for
  every mapped component, in the compiler's cascade order, declarations sorted
  by property, values referencing the theme variables.
- `index.css`: imports both.

## Variable names

| Token category | Tailwind variable | Utilities it feeds |
| --- | --- | --- |
| `color` | `--color-<prefix>-<path>` | `bg-*`, `text-*`, `border-*`, … |
| `space` | `--spacing-<prefix>-<path>` | `p-*`, `m-*`, `gap-*`, `w-*`, … |
| `radius` | `--radius-<prefix>-<path>` | `rounded-*` |
| `font-family` | `--font-<prefix>-<path>` | `font-*` |
| `font-size` | `--text-<prefix>-<path>` | `text-*` |
| `font-weight` | `--font-weight-<prefix>-<path>` | `font-*` |
| `line-height` | `--leading-<prefix>-<path>` | `leading-*` |
| `letter-spacing` | `--tracking-<prefix>-<path>` | `tracking-*` |
| `shadow` | `--shadow-<prefix>-<path>` | `shadow-*` |
| `easing` | `--ease-<prefix>-<path>` | `ease-*` |
| `border-width`, `duration`, `opacity`, `z-index`, `size` | `--<prefix>-<category>-<path>` (the source name) | none; reference with `var()` |

Example: `--bwp-color-accent-default` in the source becomes
`--color-bwp-accent-default`, so `bg-bwp-accent-default` works in markup.

## Modes

Utilities compile to `var(--color-bwp-…)`, so `data-bwp-theme="dark"` on the
root element switches every mode-varying token at runtime with no extra
classes.

## Using the package

```css
@import 'tailwindcss';
@import '@bwp-web/styles-tailwind';
```

The package ships CSS source only; the consumer's Tailwind build compiles it.
Component classes (`.bwp-example`) work on plain HTML exactly as in
`@bwp-web/styles-css`.

## Manifest hints

`targets.tailwind` accepts `{}` or `{ "ignore": ["<property>", …] }`. Ignored
properties are left out of the generated CSS and of the round-trip comparison,
and coverage reports the component as `partial`. Every property in the
compiler's table has a Tailwind handler (the transform is identity), so
`ignore` is only for deliberate omissions.

## Round-trip

`reparse` rewrites the generated variable names back to source names, treats
`@theme` as `:root` and each mode rule as a mode block, groups
`@layer components` rules by root class, and runs the compiler's own token and
component parsers. The result is compared to the source IR structurally
(tokens, and the rules of every mapped component, ignoring `source`
locations). Any difference is `DS-E081` and points at a generator or reparser
bug, never at the output.

## Regenerating

`npm run ds -- generate` from the repo root. Never edit files under
`src/generated/`; `bwp-ds verify` and CI fail on any difference from a fresh
generation.
````

`docs/design-system/verification.md`:

- In the "Today" table, add rows after `bwp-ds build`:

```markdown
| `bwp-ds generate [--target <id>]` | Writes each registered target's files from the IR (nothing when lint fails) and deletes files the generator did not produce. | Node 22 |
| `bwp-ds verify` | Lint; drift (a fresh build and generation equal the committed `design.ir.json` and every generated file); round-trip (each target's output re-parses to the source IR); coverage (every component is supported, partial, or excluded for every target). Writes `docs/design-system/coverage.md`. | Node 22 |
```

- Extend the CI generated-files row to name `packages/styles-tailwind/src/generated` and `docs/design-system/coverage.md`, and add a row `| CI "Verify design system" | \`npm run verify\` passes. | CI |`.
- In "Planned steps", delete the three Plan 2 rows (drift, roundtrip, coverage) and keep `--rendered` and Flutter.
- In "From a symptom to the code", change the first bullet's path to `packages/ds-compiler/src/targets/<id>/` and drop "from Plan 2 on".

`docs/design-system/errors.md`: add before "## Warnings":

```markdown
## Generated output and verification

| Code | Cause | Fix |
| --- | --- | --- |
| DS-E080 | `design.ir.json`, or a file under a target's output directory, is missing, differs from a fresh build or generation, or is not produced by the generator | Run `bwp-ds build` or `bwp-ds generate --target <id>` and commit; delete stray files; never edit generated files. |
| DS-E081 | A target's generated output does not re-parse to the source IR (the message carries the underlying diagnostic, or the token, rule, and property that differ) | A generator or reparser bug: fix the plugin under `packages/ds-compiler/src/targets/<id>/`. |
| DS-E082 | A component's manifest has no `targets.<id>` entry for a registered target | Add `"<id>": {}` to map it, or `"<id>": { "excluded": "<reason>" }`. |
| DS-E083 | A component uses a property the target has no handler for, and the manifest does not ignore it | Add a handler to the plugin, or list the property under `targets.<id>.ignore`. |
```

and in "## Warnings":

```markdown
| DS-W003 | A rule uses `:disabled` or `[disabled]` but the component's root element is not a form control, so the rule can never match | Set `slots.root.element` to `button`, `input`, `select`, or `textarea`, or write the state as `[aria-disabled="true"]`. |
```

`docs/design-system/ir.md`: in the Shape block change the meta line to `meta: { name, prefix, modes, defaultMode, rootFontSize, modeSelector, sourceHash }` and add one sentence after it: "`modeSelector` is the configured selector for non-default modes with `{mode}` as the placeholder, so generators need only the IR."

`docs/design-system/authoring-guide.md`:

- Manifest table, `targets` row: replace with `| \`targets\` | no | Per target id: \`{}\` maps the component, \`{ "excluded": "<reason>" }\` leaves it out on purpose, and a registered target may accept hints (\`tailwind\`: \`{ "ignore": [<property>…] }\`, validated against the property table). A component with no entry for a registered target is \`unmapped\` and fails \`bwp-ds verify\` (\`DS-E082\`). |`
- "Scaffolding and the lint loop": in the scaffold example add `--root-element button`, and replace the two sentences about `slots.root.element: "div"` and `:disabled` with: "`--root-element <element>` sets `slots.root.element` (default `div`) and decides how the `disabled` state is written: `:disabled` for form controls, `[aria-disabled="true"]` otherwise. Lint warns `DS-W003` when hand-written CSS uses `:disabled` or `[disabled]` on a root that is not a form control."
- Configuration table: add rows `| \`targets\` | no | Per target id, \`{ "outDir": "<path>" }\` relative to the source root; default \`../styles-<id>/src/generated\`. |` and `| \`coverageFile\` | no | Where \`bwp-ds verify\` writes the coverage report, relative to the source root; default \`coverage.md\`. |`.

`AGENTS.md`:

- Invariant 2: name the generated set explicitly: "anything under `packages/styles-tailwind/src/generated/` (and any future `generated/` directory), `packages/styles-css/design.ir.json`, `packages/styles-css/src/index.css`, and `docs/design-system/coverage.md`". Mention `bwp-ds generate` and `bwp-ds verify` as the regenerators.
- Package map: add `| \`packages/styles-tailwind\` | \`@bwp-web/styles-tailwind\` | Generated Tailwind v4 theme and component layer. Only \`README.md\` and \`src/index.css\` are hand-written. |`.
- Commands table: add `| \`npm run ds -- generate [--target <id>]\` | Writes each target's files from the IR. Deletes files in the output directory the generator did not produce. |` and `| \`npm run verify\` | \`bwp-ds verify\`: lint, drift, round-trip, coverage; writes \`docs/design-system/coverage.md\`. Exit 1 on any error. |`. In the `--json` paragraph add: "`verify` adds `steps` (`lint`, `drift`, `roundtrip`, `coverage`, each `pass`, `fail`, or `skipped`) and `coverageFile`; `generate` adds `wrote` and `removed`."
- Authoring procedure step 7: "Run `lint`, fix, `build`, then `npm run ds -- generate` and `npm run verify`. Commit the regenerated files with your change."
- "Add a component" recipe: after the build step add "`npm run ds -- generate`, then `npm run verify`. The manifest needs a `targets.tailwind` entry (`{}` or an exclusion) or verify fails with `DS-E082`."
- Error code index: add `DS-E08x generated output and verification`.

- [ ] **Step 7: Format and final checks**

```bash
npx prettier --write AGENTS.md README.md docs/design-system packages/styles-tailwind packages/styles-css/ds.config.json
npx prettier --check AGENTS.md README.md docs/design-system
npm run format
npm run verify
npm run build
npm run test
```

Expected: all green. If Prettier reflowed `ds.config.json`, the IR is unaffected only if the bytes are unchanged; re-run `npm run ds -- build` and `npm run ds -- verify` after formatting and confirm `verify` still passes (drift compares the committed IR against a fresh build, so a formatting change to the config shows up here).

- [ ] **Step 8: Checkpoint**

Report: `packages/styles-tailwind/**` created (with generated output), `packages/styles-css/ds.config.json` and `design.ir.json` updated, `docs/design-system/coverage.md` generated, root `package.json`, `.github/workflows/main.yml`, `README.md`, `AGENTS.md`, and five docs modified, plus `package-lock.json`.

---

## Task 9: Final verification

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
git diff --exit-code -- packages/styles-css/design.ir.json packages/styles-css/src/index.css packages/styles-tailwind/src/generated docs/design-system/coverage.md && echo "generated files current"
```

Expected: every command exits 0; `verify` prints all four steps `pass`; the last line prints `generated files current`.

- [ ] **Step 2: Drift is caught and repaired by the documented commands**

```bash
printf '\n/* stray */\n' >> packages/styles-tailwind/src/generated/theme.css
npm run verify ; echo "exit $?"
npm run ds -- generate
npm run verify
```

Expected: the first `verify` exits 1 with one `DS-E080` naming `../styles-tailwind/src/generated/theme.css` (path relative to the source root); `generate` rewrites it; the second `verify` passes and `git status --short` shows no change under `packages/styles-tailwind`.

- [ ] **Step 3: An unmapped component is caught**

```bash
npm run ds -- scaffold component demo --axis tone=quiet,loud --state hover --slot icon --root-element button
```

Edit the scaffolded manifest so `targets` is `{}` (delete the three excluded entries) and fill every `TODO` in both files with any valid value (for example `display: block;` in each CSS rule and one-word strings in the manifest). Then:

```bash
npm run ds -- lint
npm run verify ; echo "exit $?"
```

Expected: lint passes (perhaps with `DS-W001`); `verify` exits 1 with `DS-E082 … demo has no targets.tailwind entry in its manifest`, and `docs/design-system/coverage.md` now shows `| \`demo\` | **unmapped** |`. Then remove the component with `rm` and `rmdir` (not `rm -rf`), run `npm run ds -- build`, `npm run ds -- generate`, `npm run verify`, and confirm `git status --short` is clean apart from this plan's intended changes.

- [ ] **Step 4: The published shape**

```bash
npm pack --dry-run -w packages/styles-tailwind
```

Expected: exactly `README.md`, `package.json`, `src/index.css`, and the three files under `src/generated/`. No `probe/`, `scripts/`, or `dist/`.

- [ ] **Step 5: Final report**

List every created, modified, and deleted path grouped by package, the test count from `npm run test`, the four `verify` steps, and confirm no git write command was run. Note for Plan 3: a new target adds `src/targets/<id>/` with a plugin object, a real hints schema in `src/targets/hints.ts` replacing the permissive one, an entry in `TARGETS`, an `outDir` in `ds.config.json`, and a package under `packages/styles-<id>/`; `verify` picks it up with no other change.

---

## Follow-ups recorded during execution

- **Manifest JSON schema and `ignore`.** The emitted `schemas/manifest.schema.json` accepts any string inside `targets.tailwind.ignore` because the property-table refine is not expressible; the compiler rejects unknown properties. Safe direction.
- **`DS-E083` is defined but never emitted** by the Tailwind plugin (identity transform). The MUI plugin (Plan 3) is its first user.
- **Token path prefix rule** (`text-on` vs `text-on-accent`) is still a documented convention. Tailwind's flat variables do not need it; enforce it when the Flutter generator (Plan 5) needs nested names.
- **`auto-tag.yml` and version lockstep** for `styles-tailwind` wait for Plan 6.
- **Number formatting edge cases.** `formatNumber` still yields exponent notation at |n| >= 1e21 and flattens values below ~1e-11 to `0`; both need a 20-plus-digit source literal. The `duration` branch interpolates `ms` directly (safe: `parseDuration` rounds to 3 decimals). Tighten with `toPrecision` if a real token ever hits it.
- **CSS numeric escapes** in font-family strings (`'\41 rial'`) are not decoded by `parseFontFamily`; they round-trip stably but keep the escaped spelling.
- **Config key message.** Zod reports a bad target-id key in `ds.config.json` as `Invalid key in record` with the key in the path; the custom message is not surfaced.

---

## Execution log

Read this section first when resuming. It records how the plan is being executed
and where it stands. Update the status table after every milestone.

### Process

- Skill: `superpowers:subagent-driven-development`. Tasks are batched; each batch
  gets one implementer subagent (sonnet), then one spec-compliance reviewer
  (sonnet), then one code-quality reviewer (opus). Reviewer findings go back to
  the same implementer via SendMessage; the same reviewer re-verifies.
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
| 1 | 1-2 plugin contract, hints, config, IR meta, Tailwind names and values | done, reviewed, awaiting user commit |
| 2 | 3-4 selector rendering, DS-W003, `--root-element`, Tailwind generation | pending |
| 3 | 5-6 round-trip, `diffIR`, plugin registration, coverage | pending |
| 4 | 7 `generate`, `verify`, CLI, error codes, exports | pending |
| 5 | 8 `styles-tailwind` package, wiring, generated output, docs | pending |
| 6 | 9 final verification | pending |

Test suite at the start of Plan 2: 18 files, 201 tests (end of Plan 1). After batch 1: 20 files, 219 tests.

### Decisions made during execution

- Batch 1 review: `parseFontFamily` now unescapes CSS string escapes and the
  Tailwind renderer picks the quote style by content, so font families with an
  apostrophe or backslash round-trip exactly. A shared `src/identifiers.ts`
  holds the kebab-case pattern used by the manifest, `targetsSchema` (which
  validates target-id keys with a `superRefine`), and the config; the emitted
  JSON schema keeps `propertyNames` for `targets`. `targetsSchema`'s known-id
  shape is derived from `TARGET_IDS`. `sourceNameFromTailwind` only returns a
  name that parses as a token. `outDir` and `coverageFile` must be relative
  POSIX paths. `formatNumber` avoids exponent notation for small magnitudes.
  Duplicate `ignore` entries are rejected. Task 4 gained an assertion that no
  two tokens map to one Tailwind variable (prefix `weight` collision).
